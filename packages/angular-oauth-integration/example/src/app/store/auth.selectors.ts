import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

// User Data Selectors
export const selectUserData = createSelector(
  selectAuthState,
  (state) => state.userData
);

export const selectIsUserDataLoading = createSelector(
  selectAuthState,
  (state) => state.isUserDataLoading
);

// Token Data Selectors
export const selectTokenData = createSelector(
  selectAuthState,
  (state) => state.tokenData
);

export const selectIsTokenRefreshing = createSelector(
  selectAuthState,
  (state) => state.isTokenRefreshing
);

// Configuration Selectors
export const selectConfiguration = createSelector(
  selectAuthState,
  (state) => state.configuration
);

// Auth Result Selectors
export const selectAuthResult = createSelector(
  selectAuthState,
  (state) => state.authResult
);

export const selectIsAuthLoading = createSelector(
  selectAuthState,
  (state) => state.isAuthLoading
);

// Timeout Reason Selector
export const selectTimeoutReason = createSelector(
  selectAuthState,
  (state) => state.isTimeoutReason
);

// Error Selector
export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);

// Computed Selectors
export const selectIsAuthenticated = createSelector(
  selectAuthResult,
  (authResult) => authResult?.isAuthenticated || false
);

export const selectConfigurationLoaded = createSelector(
  selectAuthResult,
  (authResult) => authResult?.configurationLoaded || false
);