import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private oidcSecurityService = inject(OidcSecurityService);

  loadUserData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUserData),
      switchMap(() =>
        this.oidcSecurityService.userData$.pipe(
          map(userData => AuthActions.loadUserDataSuccess({ userData })),
          catchError(error => of(AuthActions.loadUserDataFailure({ error })))
        )
      )
    )
  );

  loadTokenData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadTokenData),
      switchMap(() =>
        this.oidcSecurityService.getAccessToken().pipe(
          map(token => {
            if (token) {
              const tokenData = {
                accessToken: token,
                tokenType: 'Bearer',
                scope: 'openid profile email api offline_access'
              };
              return AuthActions.loadTokenDataSuccess({ tokenData });
            }
            return AuthActions.loadTokenDataSuccess({ tokenData: null });
          }),
          catchError(error => of(AuthActions.loadTokenDataFailure({ error })))
        )
      )
    )
  );

  loadConfiguration$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadConfiguration),
      switchMap(() =>
        this.oidcSecurityService.getConfiguration().pipe(
          map(configuration => AuthActions.loadConfigurationSuccess({ configuration })),
          catchError(error => of(AuthActions.loadConfigurationFailure({ error })))
        )
      )
    )
  );

  checkAuthStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.checkAuthStatus),
      switchMap(() =>
        this.oidcSecurityService.checkAuth().pipe(
          map(authResult => AuthActions.checkAuthStatusSuccess({ authResult })),
          catchError(error => of(AuthActions.checkAuthStatusFailure({ error })))
        )
      )
    )
  );

  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      switchMap(() =>
        this.oidcSecurityService.forceRefreshSession().pipe(
          switchMap(result => {
            if (result?.isAuthenticated) {
              // Reload token data after successful refresh
              return of(
                AuthActions.refreshTokenSuccess(),
                AuthActions.loadTokenData()
              );
            }
            return of(AuthActions.refreshTokenSuccess());
          }),
          catchError(error => of(AuthActions.refreshTokenFailure({ error })))
        )
      )
    ),
    { dispatch: true }
  );

  // Auto-load data on successful auth
  autoLoadDataOnAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.checkAuthStatusSuccess),
      switchMap(({ authResult }) => {
        if (authResult.isAuthenticated) {
          return of(
            AuthActions.loadUserData(),
            AuthActions.loadTokenData(),
            AuthActions.loadConfiguration()
          );
        }
        return of();
      })
    ),
    { dispatch: true }
  );
}