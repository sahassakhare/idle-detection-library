import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IdleState } from '../types';
import { IDLE_FEATURE_KEY } from './idle.state';

export const selectIdleState = createFeatureSelector<IdleState>(IDLE_FEATURE_KEY);

export const selectIsIdle = createSelector(
  selectIdleState,
  (state) => state.isIdle
);

export const selectIsWarning = createSelector(
  selectIdleState,
  (state) => state.isWarning
);

export const selectTimeRemaining = createSelector(
  selectIdleState,
  (state) => state.timeRemaining
);

export const selectLastActivity = createSelector(
  selectIdleState,
  (state) => state.lastActivity
);

export const selectTokenRefreshInProgress = createSelector(
  selectIdleState,
  (state) => state.tokenRefreshInProgress
);

export const selectMultiTabActive = createSelector(
  selectIdleState,
  (state) => state.multiTabActive
);

export const selectUserRole = createSelector(
  selectIdleState,
  (state) => state.userRole
);

export const selectConfig = createSelector(
  selectIdleState,
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