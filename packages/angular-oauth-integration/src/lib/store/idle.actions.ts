import { createAction, props } from '@ngrx/store';
import { IdleOAuthConfig, TabCoordinationMessage } from '../types';

export const initializeIdle = createAction(
  '[Idle] Initialize',
  props<{ config: IdleOAuthConfig }>()
);

export const updateConfig = createAction(
  '[Idle] Update Config',
  props<{ config: Partial<IdleOAuthConfig> }>()
);

export const startIdleDetection = createAction('[Idle] Start Detection');

export const stopIdleDetection = createAction('[Idle] Stop Detection');

export const userActivity = createAction(
  '[Idle] User Activity',
  props<{ timestamp: number }>()
);

export const startWarning = createAction(
  '[Idle] Start Warning',
  props<{ timeRemaining: number }>()
);

export const updateWarningTime = createAction(
  '[Idle] Update Warning Time',
  props<{ timeRemaining: number }>()
);

export const extendSession = createAction('[Idle] Extend Session');

export const startIdle = createAction('[Idle] Start Idle');

export const resetIdle = createAction('[Idle] Reset Idle');

export const refreshToken = createAction('[Idle] Refresh Token');

export const refreshTokenSuccess = createAction('[Idle] Refresh Token Success');

export const refreshTokenFailure = createAction(
  '[Idle] Refresh Token Failure',
  props<{ error: any }>()
);

export const logout = createAction('[Idle] Logout');

export const setUserRole = createAction(
  '[Idle] Set User Role',
  props<{ role: string }>()
);

export const handleTabMessage = createAction(
  '[Idle] Handle Tab Message',
  props<{ message: TabCoordinationMessage }>()
);

export const setMultiTabActive = createAction(
  '[Idle] Set Multi Tab Active',
  props<{ active: boolean }>()
);

export const loadExternalConfig = createAction(
  '[Idle] Load External Config',
  props<{ configUrl: string }>()
);

export const loadExternalConfigSuccess = createAction(
  '[Idle] Load External Config Success',
  props<{ config: IdleOAuthConfig }>()
);

export const loadExternalConfigFailure = createAction(
  '[Idle] Load External Config Failure',
  props<{ error: any }>()
);