import { createReducer, on } from '@ngrx/store';
import { IdleState } from '../types';
import { initialIdleState } from './idle.state';
import * as IdleActions from './idle.actions';

export const idleReducer = createReducer(
  initialIdleState,
  
  on(IdleActions.initializeIdle, (state, { config }) => ({
    ...state,
    config: { ...state.config, ...config }
  })),

  on(IdleActions.updateConfig, (state, { config }) => ({
    ...state,
    config: { ...state.config, ...config }
  })),

  on(IdleActions.userActivity, (state, { timestamp }) => ({
    ...state,
    lastActivity: timestamp,
    isIdle: false,
    isWarning: false,
    timeRemaining: 0
  })),

  on(IdleActions.startWarning, (state, { timeRemaining }) => ({
    ...state,
    isWarning: true,
    isIdle: false,
    timeRemaining
  })),

  on(IdleActions.updateWarningTime, (state, { timeRemaining }) => ({
    ...state,
    timeRemaining
  })),

  on(IdleActions.extendSession, (state) => ({
    ...state,
    isWarning: false,
    isIdle: false,
    timeRemaining: 0,
    lastActivity: Date.now()
  })),

  on(IdleActions.startIdle, (state) => ({
    ...state,
    isIdle: true,
    isWarning: false,
    timeRemaining: 0
  })),

  on(IdleActions.resetIdle, (state) => ({
    ...state,
    isIdle: false,
    isWarning: false,
    timeRemaining: 0,
    lastActivity: Date.now()
  })),

  on(IdleActions.refreshToken, (state) => ({
    ...state,
    tokenRefreshInProgress: true
  })),

  on(IdleActions.refreshTokenSuccess, (state) => ({
    ...state,
    tokenRefreshInProgress: false,
    lastActivity: Date.now()
  })),

  on(IdleActions.refreshTokenFailure, (state) => ({
    ...state,
    tokenRefreshInProgress: false
  })),

  on(IdleActions.setUserRole, (state, { role }) => {
    const roleTimeouts = state.config.roleTimeouts?.[role];
    const updatedConfig = roleTimeouts 
      ? { 
          ...state.config, 
          idleTimeout: roleTimeouts.idle,
          warningTimeout: roleTimeouts.warning
        }
      : state.config;

    return {
      ...state,
      userRole: role,
      config: updatedConfig
    };
  }),

  on(IdleActions.setMultiTabActive, (state, { active }) => ({
    ...state,
    multiTabActive: active
  })),

  on(IdleActions.loadExternalConfigSuccess, (state, { config }) => ({
    ...state,
    config: { ...state.config, ...config }
  })),

  on(IdleActions.handleTabMessage, (state, { message }) => {
    switch (message.type) {
      case 'activity':
        return {
          ...state,
          lastActivity: message.timestamp,
          isIdle: false,
          isWarning: false
        };
      case 'warning':
        return {
          ...state,
          isWarning: true,
          timeRemaining: message.data?.timeRemaining || 0
        };
      case 'logout':
        return {
          ...state,
          isIdle: true,
          isWarning: false
        };
      default:
        return state;
    }
  })
);