import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import * as DashboardActions from './dashboard.actions';
import { IdleOAuthService } from '@idle-detection/angular-oauth-integration';

@Injectable()
export class DashboardEffects {
  private actions$ = inject(Actions);
  private idleOAuthService = inject(IdleOAuthService);

  // Handle simulate activity
  simulateActivity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.simulateActivity),
      tap(() => {
        // Trigger a mouse movement event to simulate activity
        document.dispatchEvent(new MouseEvent('mousemove'));
      })
    ),
    { dispatch: false }
  );

  // Handle reset session
  resetSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.resetSession),
      tap(() => {
        this.idleOAuthService.extendSession();
      })
    ),
    { dispatch: false }
  );
}