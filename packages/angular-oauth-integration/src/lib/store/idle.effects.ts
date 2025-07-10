import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { 
  timer, 
  merge, 
  fromEvent, 
  EMPTY, 
  of 
} from 'rxjs';
import { 
  map, 
  switchMap, 
  takeUntil, 
  withLatestFrom,
  catchError,
  tap,
  filter,
  mergeMap
} from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as IdleActions from './idle.actions';
import { 
  selectConfig, 
  selectIsWarning, 
  selectMultiTabCoordination,
  selectLastActivity,
  selectIdleTimeout,
  selectWarningTimeout
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

  startIdleDetection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IdleActions.startIdleDetection),
      withLatestFrom(this.store.select(selectConfig)),
      switchMap(([, config]) => {
        const activityStreams = this.activityEvents.map(event =>
          fromEvent(document, event).pipe(
            map(() => Date.now())
          )
        );

        return merge(...activityStreams).pipe(
          map(timestamp => IdleActions.userActivity({ timestamp })),
          takeUntil(this.actions$.pipe(ofType(IdleActions.stopIdleDetection)))
        );
      })
    )
  );

  userActivity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IdleActions.userActivity),
      withLatestFrom(this.store.select(selectMultiTabCoordination)),
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
      map(() => IdleActions.resetIdle())
    )
  );

  startWarningTimer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IdleActions.userActivity, IdleActions.resetIdle),
      withLatestFrom(
        this.store.select(selectIdleTimeout),
        this.store.select(selectWarningTimeout)
      ),
      switchMap(([, idleTimeout, warningTimeout]) => {
        const warningStartTime = idleTimeout - warningTimeout;
        
        return timer(warningStartTime).pipe(
          map(() => IdleActions.startWarning({ timeRemaining: warningTimeout })),
          takeUntil(this.actions$.pipe(
            ofType(IdleActions.userActivity, IdleActions.stopIdleDetection)
          ))
        );
      })
    )
  );

  warningCountdown$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IdleActions.startWarning),
      switchMap(({ timeRemaining }) => {
        return timer(0, 1000).pipe(
          map(tick => {
            const remaining = Math.max(0, timeRemaining - (tick * 1000));
            return remaining > 0 
              ? IdleActions.updateWarningTime({ timeRemaining: remaining })
              : IdleActions.startIdle();
          }),
          takeUntil(this.actions$.pipe(
            ofType(IdleActions.userActivity, IdleActions.extendSession, IdleActions.stopIdleDetection)
          ))
        );
      })
    )
  );

  autoRefreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IdleActions.startWarning),
      withLatestFrom(this.store.select(selectConfig)),
      filter(([, config]) => config.autoRefreshToken),
      switchMap(() => {
        this.store.dispatch(IdleActions.refreshToken());
        
        return this.oidcSecurityService.forceRefreshSession().pipe(
          map(() => IdleActions.refreshTokenSuccess()),
          catchError(error => of(IdleActions.refreshTokenFailure({ error })))
        );
      })
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IdleActions.startIdle, IdleActions.logout),
      withLatestFrom(this.store.select(selectMultiTabCoordination)),
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
        return this.oidcSecurityService.logoff().pipe(
          map(() => IdleActions.resetIdle()),
          catchError(() => of(IdleActions.resetIdle()))
        );
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
}