import { createReducer, on } from '@ngrx/store';
import { AuthState, initialAuthState } from './auth.state';
import * as AuthActions from './auth.actions';

export const authReducer = createReducer(
  initialAuthState,
  
  // User Data
  on(AuthActions.loadUserData, (state) => ({
    ...state,
    isUserDataLoading: true,
    error: null
  })),
  on(AuthActions.loadUserDataSuccess, (state, { userData }) => ({
    ...state,
    userData,
    isUserDataLoading: false,
    error: null
  })),
  on(AuthActions.loadUserDataFailure, (state, { error }) => ({
    ...state,
    isUserDataLoading: false,
    error
  })),
  
  // Token Data
  on(AuthActions.loadTokenData, (state) => ({
    ...state,
    error: null
  })),
  on(AuthActions.loadTokenDataSuccess, (state, { tokenData }) => ({
    ...state,
    tokenData,
    error: null
  })),
  on(AuthActions.loadTokenDataFailure, (state, { error }) => ({
    ...state,
    error
  })),
  
  // Configuration
  on(AuthActions.loadConfiguration, (state) => ({
    ...state,
    error: null
  })),
  on(AuthActions.loadConfigurationSuccess, (state, { configuration }) => ({
    ...state,
    configuration,
    error: null
  })),
  on(AuthActions.loadConfigurationFailure, (state, { error }) => ({
    ...state,
    error
  })),
  
  // Auth Status
  on(AuthActions.checkAuthStatus, (state) => ({
    ...state,
    isAuthLoading: true,
    error: null
  })),
  on(AuthActions.checkAuthStatusSuccess, (state, { authResult }) => ({
    ...state,
    authResult,
    isAuthLoading: false,
    error: null
  })),
  on(AuthActions.checkAuthStatusFailure, (state, { error }) => ({
    ...state,
    isAuthLoading: false,
    error
  })),
  
  // Token Refresh
  on(AuthActions.refreshToken, (state) => ({
    ...state,
    isTokenRefreshing: true,
    error: null
  })),
  on(AuthActions.refreshTokenSuccess, (state) => ({
    ...state,
    isTokenRefreshing: false,
    error: null
  })),
  on(AuthActions.refreshTokenFailure, (state, { error }) => ({
    ...state,
    isTokenRefreshing: false,
    error
  })),
  
  // Loading States
  on(AuthActions.setUserDataLoading, (state, { loading }) => ({
    ...state,
    isUserDataLoading: loading
  })),
  on(AuthActions.setTokenRefreshing, (state, { refreshing }) => ({
    ...state,
    isTokenRefreshing: refreshing
  })),
  on(AuthActions.setAuthLoading, (state, { loading }) => ({
    ...state,
    isAuthLoading: loading
  })),
  
  // Timeout Reason
  on(AuthActions.setTimeoutReason, (state, { isTimeout }) => ({
    ...state,
    isTimeoutReason: isTimeout
  }))
);