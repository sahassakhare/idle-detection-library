import { createReducer, on } from '@ngrx/store';
import { ConfigState, initialConfigState } from './config.state';
import * as ConfigActions from './config.actions';

export const configReducer = createReducer(
  initialConfigState,
  
  on(ConfigActions.loadConfig, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ConfigActions.loadConfigSuccess, (state, { config }) => ({
    ...state,
    config,
    loading: false,
    error: null
  })),
  
  on(ConfigActions.loadConfigFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  on(ConfigActions.updateConfig, (state, { config }) => ({
    ...state,
    config: state.config ? { ...state.config, ...config } : null
  })),
  
  on(ConfigActions.applyTimeoutPreset, (state, { preset }) => ({
    ...state,
    config: state.config ? {
      ...state.config,
      idleTimeout: preset.idleTimeout,
      warningTimeout: preset.warningTimeout
    } : null
  })),
  
  on(ConfigActions.resetToDefaults, (state) => ({
    ...state,
    config: getEnvironmentDefaults(state.environment),
    error: null
  }))
);

function getEnvironmentDefaults(environment: 'development' | 'production' | 'staging') {
  switch (environment) {
    case 'development':
      return {
        idleTimeout: 2 * 60 * 1000,     // 2 minutes for quick testing
        warningTimeout: 30 * 1000,      // 30 seconds warning
        autoRefreshToken: true,
        multiTabCoordination: true,
        debug: true
      };
      
    case 'staging':
      return {
        idleTimeout: 10 * 60 * 1000,    // 10 minutes
        warningTimeout: 2 * 60 * 1000,  // 2 minutes warning
        autoRefreshToken: true,
        multiTabCoordination: true,
        debug: true
      };
      
    case 'production':
    default:
      return {
        idleTimeout: 30 * 60 * 1000,    // 30 minutes
        warningTimeout: 5 * 60 * 1000,  // 5 minutes warning
        autoRefreshToken: true,
        multiTabCoordination: true,
        debug: false
      };
  }
}