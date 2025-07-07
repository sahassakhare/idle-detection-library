import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IdleState } from './idle.state';

export const selectIdleState = createFeatureSelector<IdleState>('idle');

export const selectIsIdle = createSelector(
  selectIdleState,
  (state: IdleState) => state.isIdle
);

export const selectIsWarning = createSelector(
  selectIdleState,
  (state: IdleState) => state.isWarning
);

export const selectIsTimedOut = createSelector(
  selectIdleState,
  (state: IdleState) => state.isTimedOut
);

export const selectIsWatching = createSelector(
  selectIdleState,
  (state: IdleState) => state.isWatching
);

export const selectLastActivity = createSelector(
  selectIdleState,
  (state: IdleState) => state.lastActivity
);

export const selectRemainingTime = createSelector(
  selectIdleState,
  (state: IdleState) => state.remainingTime
);

export const selectIsRefreshingToken = createSelector(
  selectIdleState,
  (state: IdleState) => state.isRefreshingToken
);

export const selectRefreshTokenError = createSelector(
  selectIdleState,
  (state: IdleState) => state.refreshTokenError
);

export const selectShowWarning = createSelector(
  selectIsWarning,
  selectIsWatching,
  (isWarning: boolean, isWatching: boolean) => isWarning && isWatching
);

export const selectCurrentState = createSelector(
  selectIdleState,
  (state: IdleState) => ({
    isIdle: state.isIdle,
    isWarning: state.isWarning,
    isTimedOut: state.isTimedOut,
    lastActivity: state.lastActivity,
    remainingTime: state.remainingTime
  })
);

export const selectSessionStatus = createSelector(
  selectIsTimedOut,
  selectIsWarning,
  selectIsIdle,
  (isTimedOut: boolean, isWarning: boolean, isIdle: boolean) => {
    if (isTimedOut) return 'timeout';
    if (isWarning) return 'warning';
    if (isIdle) return 'idle';
    return 'active';
  }
);