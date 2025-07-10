import { createAction, createReducer, createSelector, props, on } from '@ngrx/store';
import { createFeatureSelector } from '@ngrx/store';

// Simple Idle State Interface
export interface SimpleIdleState {
  isIdle: boolean;
  isWarning: boolean;
  timeRemaining: number;
  lastActivity: number;
}

// Initial State
export const initialState: SimpleIdleState = {
  isIdle: false,
  isWarning: false,
  timeRemaining: 0,
  lastActivity: Date.now()
};

// Actions
export const userActivity = createAction(
  '[Idle] User Activity',
  props<{ timestamp: number }>()
);

export const startWarning = createAction(
  '[Idle] Start Warning',
  props<{ timeRemaining: number }>()
);

export const startIdle = createAction('[Idle] Start Idle');

export const resetIdle = createAction('[Idle] Reset Idle');

// Reducer
export const simpleIdleReducer = createReducer(
  initialState,
  
  // Handle user activity
  on(userActivity, (state, { timestamp }) => ({
    ...state,
    lastActivity: timestamp,
    isIdle: false,
    isWarning: false,
    timeRemaining: 0
  })),

  // Handle warning start
  on(startWarning, (state, { timeRemaining }) => ({
    ...state,
    isWarning: true,
    isIdle: false,
    timeRemaining
  })),

  // Handle idle start
  on(startIdle, (state) => ({
    ...state,
    isIdle: true,
    isWarning: false,
    timeRemaining: 0
  })),

  // Handle reset
  on(resetIdle, (state) => ({
    ...state,
    isIdle: false,
    isWarning: false,
    timeRemaining: 0,
    lastActivity: Date.now()
  }))
);

// Feature Key
export const SIMPLE_IDLE_FEATURE_KEY = 'simpleIdle';

// Selectors
export const selectSimpleIdleState = createFeatureSelector<SimpleIdleState>(SIMPLE_IDLE_FEATURE_KEY);

export const selectIsIdle = createSelector(
  selectSimpleIdleState,
  (state) => state.isIdle
);

export const selectIsWarning = createSelector(
  selectSimpleIdleState,
  (state) => state.isWarning
);

export const selectTimeRemaining = createSelector(
  selectSimpleIdleState,
  (state) => state.timeRemaining
);

export const selectLastActivity = createSelector(
  selectSimpleIdleState,
  (state) => state.lastActivity
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