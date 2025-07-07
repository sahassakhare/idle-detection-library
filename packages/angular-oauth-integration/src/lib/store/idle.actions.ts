import { createAction, props } from '@ngrx/store';

export const startWatching = createAction('[Idle] Start Watching');

export const stopWatching = createAction('[Idle] Stop Watching');

export const resetIdle = createAction('[Idle] Reset Idle');

export const idleStarted = createAction('[Idle] Idle Started');

export const warningStarted = createAction(
  '[Idle] Warning Started',
  props<{ remainingTime: number }>()
);

export const warningTick = createAction(
  '[Idle] Warning Tick',
  props<{ remainingTime: number }>()
);

export const userActivity = createAction('[Idle] User Activity');

export const timeout = createAction('[Idle] Timeout');

export const refreshTokenRequest = createAction('[Idle] Refresh Token Request');

export const refreshTokenSuccess = createAction('[Idle] Refresh Token Success');

export const refreshTokenFailure = createAction(
  '[Idle] Refresh Token Failure',
  props<{ error: any }>()
);

export const logoutRequest = createAction('[Idle] Logout Request');

export const logoutSuccess = createAction('[Idle] Logout Success');

export const updateConfig = createAction(
  '[Idle] Update Config',
  props<{ config: any }>()
);