import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { of, timer, EMPTY } from 'rxjs';
import { 
  map, 
  switchMap, 
  catchError, 
  takeUntil, 
  tap,
  withLatestFrom 
} from 'rxjs/operators';
import * as IdleActions from './idle.actions';
import { selectRemainingTime } from './idle.selectors';

@Injectable()
export class IdleEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private oidcSecurityService = inject(OidcSecurityService);
  
  warningCountdown$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IdleActions.warningStarted),
      switchMap(({ remainingTime }) =>
        timer(0, 1000).pipe(
          map((tick) => remainingTime - tick),
          map((timeLeft) => {
            if (timeLeft <= 0) {
              return IdleActions.timeout();
            }
            return IdleActions.warningTick({ remainingTime: timeLeft });
          }),
          takeUntil(this.actions$.pipe(
            ofType(
              IdleActions.userActivity,
              IdleActions.resetIdle,
              IdleActions.stopWatching,
              IdleActions.timeout
            )
          ))
        )
      )
    )
  );

  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IdleActions.refreshTokenRequest),
      switchMap(() =>
        this.oidcSecurityService.forceRefreshSession().pipe(
          map((result) => {
            if (result?.isAuthenticated) {
              return IdleActions.refreshTokenSuccess();
            } else {
              return IdleActions.refreshTokenFailure({ 
                error: 'Token refresh failed - user not authenticated' 
              });
            }
          }),
          catchError((error) =>
            of(IdleActions.refreshTokenFailure({ error }))
          )
        )
      )
    )
  );

  autoRefreshOnActivity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IdleActions.userActivity),
      withLatestFrom(this.store.select(selectRemainingTime)),
      switchMap(([action, remainingTime]) => {
        // Only refresh token if user was in warning state (had remaining time > 0)
        if (remainingTime > 0) {
          return of(IdleActions.refreshTokenRequest());
        }
        return EMPTY;
      })
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IdleActions.logoutRequest),
      tap(() => {
        this.oidcSecurityService.logoff();
      }),
      map(() => IdleActions.logoutSuccess())
    )
  );

  timeout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IdleActions.timeout),
      map(() => IdleActions.logoutRequest())
    )
  );

}