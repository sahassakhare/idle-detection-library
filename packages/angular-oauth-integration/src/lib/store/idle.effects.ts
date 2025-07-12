import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { 
  merge, 
  fromEvent, 
  EMPTY, 
  of,
  Observable 
} from 'rxjs';
import { 
  map, 
  switchMap, 
  takeUntil, 
  withLatestFrom,
  catchError,
  tap,
  filter,
  mergeMap,
  delay
} from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as IdleActions from './idle.actions';
import { 
  selectConfig, 
  selectIsWarning, 
  selectMultiTabCoordination,
  selectLastActivity
} from './idle.selectors';
import { TabCoordinationMessage } from '../types';

@Injectable()
export class IdleEffects {
  private readonly activityEvents = [
    'mousedown', 'mousemove', 'keypress', 'scroll', 
    'touchstart', 'click', 'contextmenu', 'dblclick', 
    'mousewheel', 'mouseup', 'touchend', 'touchcancel', 
    'touchmove'
  ];

  private broadcastChannel?: BroadcastChannel;

  constructor(
    private actions$: Actions,
    private store: Store,
    private oidcSecurityService: OidcSecurityService,
    private http: HttpClient
  ) {
    this.initializeBroadcastChannel();
  }

  private initializeBroadcastChannel() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel('idle-detection');
      this.broadcastChannel.onmessage = (event) => {
        this.store.dispatch(IdleActions.handleTabMessage({ message: event.data }));
      };
    }
  }

  initializeIdle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IdleActions.initializeIdle),
      map(() => IdleActions.startIdleDetection())
    )
  );

  startIdleDetection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IdleActions.startIdleDetection),
      switchMap(() => {
        // Check if we're in a browser environment
        if (typeof document === 'undefined' || typeof window === 'undefined') {
          console.warn('Idle detection not available in server-side rendering');
          return EMPTY;
        }

        try {
          const activityStreams = this.activityEvents
            .map(event => {
              try {
                const eventStream = fromEvent(document, event);
                if (!eventStream || typeof eventStream.pipe !== 'function') {
                  console.warn(`Invalid event stream for ${event}`);
                  return null;
                }
                return eventStream.pipe(
                  map(() => Date.now()),
                  catchError(error => {
                    console.error(`Error listening to ${event} event:`, error);
                    return EMPTY;
                  })
                );
              } catch (error) {
                console.error(`Failed to create event listener for ${event}:`, error);
                return null;
              }
            })
            .filter((stream): stream is Observable<number> => stream !== null); // Type-safe filter

          if (activityStreams.length === 0) {
            console.warn('No valid activity streams available');
            return EMPTY;
          }

          return merge(...activityStreams).pipe(
            map(timestamp => IdleActions.userActivity({ timestamp })),
            takeUntil(this.actions$.pipe(ofType(IdleActions.stopIdleDetection))),
            catchError(error => {
              console.error('Error in idle detection:', error);
              return EMPTY;
            })
          );
        } catch (error) {
          console.error('Failed to setup idle detection:', error);
          return EMPTY;
        }
      })
    )
  );

  userActivity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IdleActions.userActivity),
      withLatestFrom(
        this.store.select(selectMultiTabCoordination),
        this.store.select(selectIsWarning)
      ),
      tap(([{ timestamp }, multiTabCoordination]) => {
        if (multiTabCoordination && this.broadcastChannel) {
          const message: TabCoordinationMessage = {
            type: 'activity',
            timestamp,
            data: { timestamp }
          };
          this.broadcastChannel.postMessage(message);
        }
      }),
      // CRITICAL FIX: Don't auto-reset during warning period to prevent conflicts
      filter(([, , isWarning]) => !isWarning),
      map(() => IdleActions.resetIdle())
    )
  );

  // Removed startWarningTimer$ and warningCountdown$ effects
  // These were conflicting with the core Idle class timers
  // All timing is now handled by the idleManager in the service

  autoRefreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IdleActions.startWarning),
      withLatestFrom(this.store.select(selectConfig)),
      filter(([, config]) => config.autoRefreshToken),
      switchMap(() => {
        this.store.dispatch(IdleActions.refreshToken());
        
        // Check if the service and method exist
        if (this.oidcSecurityService && 
            typeof this.oidcSecurityService.forceRefreshSession === 'function') {
          const refreshResult = this.oidcSecurityService.forceRefreshSession();
          
          // Ensure the result is an Observable
          if (refreshResult && typeof refreshResult.pipe === 'function') {
            return refreshResult.pipe(
              map(() => IdleActions.refreshTokenSuccess()),
              catchError(error => of(IdleActions.refreshTokenFailure({ error })))
            );
          }
        }
        
        // Fallback if service/method doesn't exist or doesn't return Observable
        return of(IdleActions.refreshTokenFailure({ 
          error: 'OAuth service not available or method not implemented' 
        }));
      })
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IdleActions.startIdle, IdleActions.logout),
      withLatestFrom(
        this.store.select(selectMultiTabCoordination),
        this.store.select(selectIsWarning)
      ),
      // CRITICAL FIX: Add delay to prevent immediate logout during extend session
      // This gives the extend session process time to complete
      tap(([action, , isWarning]) => {
        console.log(`🚨 Logout effect triggered by ${action.type}, isWarning: ${isWarning}`);
      }),
      // Add small delay to allow extend session to complete
      switchMap(([action, multiTabCoordination, isWarning]) => {
        const stream = of([action, multiTabCoordination]);
        if (isWarning) {
          return stream.pipe(delay(100));
        }
        return stream;
      }),
      tap(([, multiTabCoordination]) => {
        if (multiTabCoordination && this.broadcastChannel) {
          const message: TabCoordinationMessage = {
            type: 'logout',
            timestamp: Date.now()
          };
          this.broadcastChannel.postMessage(message);
        }
      }),
      switchMap(() => {
        console.log('🚪 Executing logout');
        // Check if the service and method exist
        if (this.oidcSecurityService && 
            typeof this.oidcSecurityService.logoff === 'function') {
          const logoffResult = this.oidcSecurityService.logoff();
          
          // Ensure the result is an Observable
          if (logoffResult && typeof logoffResult.pipe === 'function') {
            return logoffResult.pipe(
              map(() => IdleActions.resetIdle()),
              catchError(() => of(IdleActions.resetIdle()))
            );
          }
        }
        
        // Fallback if service/method doesn't exist or doesn't return Observable
        return of(IdleActions.resetIdle());
      })
    )
  );

  loadExternalConfig$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IdleActions.loadExternalConfig),
      switchMap(({ configUrl }) => {
        return this.http.get(configUrl).pipe(
          map(config => IdleActions.loadExternalConfigSuccess({ config: config as any })),
          catchError(error => of(IdleActions.loadExternalConfigFailure({ error })))
        );
      })
    )
  );

  handleTabMessages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IdleActions.handleTabMessage),
      switchMap(({ message }) => {
        switch (message.type) {
          case 'activity':
            return of(IdleActions.userActivity({ timestamp: message.timestamp }));
          case 'warning':
            return of(IdleActions.startWarning({ timeRemaining: message.data?.timeRemaining || 0 }));
          case 'logout':
            return of(IdleActions.startIdle());
          default:
            return EMPTY;
        }
      })
    )
  );

  userAuthenticated$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IdleActions.userAuthenticated, IdleActions.restartIdleDetection),
      map(() => {
        console.log('🔄 Restarting idle detection after authentication');
        return IdleActions.resetIdle();
      })
    )
  );

  resetAndRestart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IdleActions.resetIdle),
      withLatestFrom(this.store.select(selectIsWarning)),
      // CRITICAL FIX: Only restart detection if NOT in warning state
      // During extend session, the service handles restarting
      filter(([, isWarning]) => !isWarning),
      map(() => {
        console.log('🚀 Starting idle detection (from effects)');
        return IdleActions.startIdleDetection();
      })
    )
  );

  userLoggedOut$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IdleActions.userLoggedOut),
      map(() => {
        console.log('🛑 Stopping idle detection - user logged out');
        return IdleActions.stopIdleDetection();
      })
    )
  );

  extendSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IdleActions.extendSession),
      tap(() => {
        console.log('⏰ NgRx: Extend session action received');
        console.log('   - Service will handle timer management');
        console.log('   - Effects will be temporarily suppressed');
      })
    ), { dispatch: false }
  );
}