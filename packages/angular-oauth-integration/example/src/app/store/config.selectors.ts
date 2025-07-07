import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ConfigState } from './config.state';

export const selectConfigState = createFeatureSelector<ConfigState>('config');

export const selectConfig = createSelector(
  selectConfigState,
  (state) => state.config
);

export const selectConfigLoading = createSelector(
  selectConfigState,
  (state) => state.loading
);

export const selectConfigError = createSelector(
  selectConfigState,
  (state) => state.error
);

export const selectEnvironment = createSelector(
  selectConfigState,
  (state) => state.environment
);

export const selectIdleTimeoutMinutes = createSelector(
  selectConfig,
  (config) => Math.floor((config?.idleTimeout || 0) / (60 * 1000))
);

export const selectWarningTimeoutSeconds = createSelector(
  selectConfig,
  (config) => Math.floor((config?.warningTimeout || 0) / 1000)
);

export const selectIsDebugEnabled = createSelector(
  selectConfig,
  (config) => config?.debug || false
);