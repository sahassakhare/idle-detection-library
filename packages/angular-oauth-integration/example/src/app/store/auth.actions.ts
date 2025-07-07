import { createAction, props } from '@ngrx/store';

// User Data Actions
export const loadUserData = createAction('[Auth] Load User Data');
export const loadUserDataSuccess = createAction(
  '[Auth] Load User Data Success',
  props<{ userData: any }>()
);
export const loadUserDataFailure = createAction(
  '[Auth] Load User Data Failure',
  props<{ error: any }>()
);

// Token Data Actions
export const loadTokenData = createAction('[Auth] Load Token Data');
export const loadTokenDataSuccess = createAction(
  '[Auth] Load Token Data Success',
  props<{ tokenData: any }>()
);
export const loadTokenDataFailure = createAction(
  '[Auth] Load Token Data Failure',
  props<{ error: any }>()
);

// Configuration Actions
export const loadConfiguration = createAction('[Auth] Load Configuration');
export const loadConfigurationSuccess = createAction(
  '[Auth] Load Configuration Success',
  props<{ configuration: any }>()
);
export const loadConfigurationFailure = createAction(
  '[Auth] Load Configuration Failure',
  props<{ error: any }>()
);

// Auth Result Actions
export const checkAuthStatus = createAction('[Auth] Check Auth Status');
export const checkAuthStatusSuccess = createAction(
  '[Auth] Check Auth Status Success',
  props<{ authResult: any }>()
);
export const checkAuthStatusFailure = createAction(
  '[Auth] Check Auth Status Failure',
  props<{ error: any }>()
);

// Token Refresh Actions
export const refreshToken = createAction('[Auth] Refresh Token');
export const refreshTokenSuccess = createAction('[Auth] Refresh Token Success');
export const refreshTokenFailure = createAction(
  '[Auth] Refresh Token Failure',
  props<{ error: any }>()
);

// Loading States
export const setUserDataLoading = createAction(
  '[Auth] Set User Data Loading',
  props<{ loading: boolean }>()
);
export const setTokenRefreshing = createAction(
  '[Auth] Set Token Refreshing',
  props<{ refreshing: boolean }>()
);
export const setAuthLoading = createAction(
  '[Auth] Set Auth Loading',
  props<{ loading: boolean }>()
);

// Timeout Reason
export const setTimeoutReason = createAction(
  '[Auth] Set Timeout Reason',
  props<{ isTimeout: boolean }>()
);