import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IdleState } from '../types';
import { IDLE_FEATURE_KEY, initialIdleState } from './idle.state';

// Safe feature selector with fallback to initial state
export const selectIdleState = createFeatureSelector<IdleState>(IDLE_FEATURE_KEY);

// Robust selector that ensures we always have a valid state
export const selectSafeIdleState = createSelector(
  selectIdleState,
  (state) => state ?? initialIdleState
);

export const selectIsIdle = createSelector(
  selectSafeIdleState,
  (state) => state.isIdle
);

export const selectIsWarning = createSelector(
  selectSafeIdleState,
  (state) => state.isWarning
);

export const selectTimeRemaining = createSelector(
  selectSafeIdleState,
  (state) => state.timeRemaining
);

export const selectLastActivity = createSelector(
  selectSafeIdleState,
  (state) => state.lastActivity
);

export const selectTokenRefreshInProgress = createSelector(
  selectSafeIdleState,
  (state) => state.tokenRefreshInProgress
);

export const selectMultiTabActive = createSelector(
  selectSafeIdleState,
  (state) => state.multiTabActive
);

export const selectUserRole = createSelector(
  selectSafeIdleState,
  (state) => state.userRole
);

export const selectConfig = createSelector(
  selectSafeIdleState,
  (state) => state.config
);

export const selectIdleTimeout = createSelector(
  selectConfig,
  (config) => config.idleTimeout
);

export const selectWarningTimeout = createSelector(
  selectConfig,
  (config) => config.warningTimeout
);

export const selectAutoRefreshToken = createSelector(
  selectConfig,
  (config) => config.autoRefreshToken
);

export const selectMultiTabCoordination = createSelector(
  selectConfig,
  (config) => config.multiTabCoordination
);

export const selectCustomCssClasses = createSelector(
  selectConfig,
  (config) => config.customCssClasses
);

export const selectIsActive = createSelector(
  selectIsIdle,
  selectIsWarning,
  (isIdle, isWarning) => !isIdle && !isWarning
);

export const selectIdleStatus = createSelector(
  selectIsIdle,
  selectIsWarning,
  (isIdle, isWarning) => {
    if (isIdle) return 'idle';
    if (isWarning) return 'warning';
    return 'active';
  }
);