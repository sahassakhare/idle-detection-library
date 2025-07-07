import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DashboardState } from './dashboard.state';

export const selectDashboardState = createFeatureSelector<DashboardState>('dashboard');

// Activity Logs Selectors
export const selectActivityLogs = createSelector(
  selectDashboardState,
  (state) => state.activityLogs
);

export const selectMaxActivityLogs = createSelector(
  selectDashboardState,
  (state) => state.maxActivityLogs
);

// Time Selectors
export const selectCurrentTime = createSelector(
  selectDashboardState,
  (state) => state.currentTime
);

export const selectLastActivity = createSelector(
  selectDashboardState,
  (state) => state.lastActivity
);

export const selectRemainingTime = createSelector(
  selectDashboardState,
  (state) => state.remainingTime
);

// Computed Selectors
export const selectTimeSinceActivity = createSelector(
  selectCurrentTime,
  selectLastActivity,
  (currentTime, lastActivity) => {
    const diff = currentTime.getTime() - lastActivity.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
);

export const selectHasActivityLogs = createSelector(
  selectActivityLogs,
  (logs) => logs.length > 0
);