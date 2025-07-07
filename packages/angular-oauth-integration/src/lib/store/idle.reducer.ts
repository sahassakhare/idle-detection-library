import { createReducer, on } from '@ngrx/store';
import { IdleState, initialIdleState } from './idle.state';
import * as IdleActions from './idle.actions';

export const idleReducer = createReducer(
  initialIdleState,
  
  on(IdleActions.startWatching, (state) => ({
    ...state,
    isWatching: true,
    isTimedOut: false
  })),
  
  on(IdleActions.stopWatching, (state) => ({
    ...state,
    isWatching: false,
    isIdle: false,
    isWarning: false,
    remainingTime: 0
  })),
  
  on(IdleActions.resetIdle, (state) => ({
    ...state,
    isIdle: false,
    isWarning: false,
    isTimedOut: false,
    lastActivity: new Date(),
    remainingTime: 0
  })),
  
  on(IdleActions.idleStarted, (state) => ({
    ...state,
    isIdle: true,
    lastActivity: new Date()
  })),
  
  on(IdleActions.warningStarted, (state, { remainingTime }) => ({
    ...state,
    isWarning: true,
    remainingTime
  })),
  
  on(IdleActions.warningTick, (state, { remainingTime }) => ({
    ...state,
    remainingTime
  })),
  
  on(IdleActions.userActivity, (state) => ({
    ...state,
    isIdle: false,
    isWarning: false,
    isTimedOut: false,
    lastActivity: new Date(),
    remainingTime: 0
  })),
  
  on(IdleActions.timeout, (state) => ({
    ...state,
    isTimedOut: true,
    isWarning: false,
    remainingTime: 0
  })),
  
  on(IdleActions.refreshTokenRequest, (state) => ({
    ...state,
    isRefreshingToken: true,
    refreshTokenError: null
  })),
  
  on(IdleActions.refreshTokenSuccess, (state) => ({
    ...state,
    isRefreshingToken: false,
    refreshTokenError: null
  })),
  
  on(IdleActions.refreshTokenFailure, (state, { error }) => ({
    ...state,
    isRefreshingToken: false,
    refreshTokenError: error
  })),
  
  on(IdleActions.logoutSuccess, () => ({
    ...initialIdleState
  }))
);