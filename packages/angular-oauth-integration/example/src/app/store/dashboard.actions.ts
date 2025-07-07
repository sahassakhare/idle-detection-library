import { createAction, props } from '@ngrx/store';

export interface ActivityLog {
  timestamp: Date;
  message: string;
  type: 'info' | 'warning' | 'error';
}

// Activity Log Actions
export const addActivityLog = createAction(
  '[Dashboard] Add Activity Log',
  props<{ log: ActivityLog }>()
);

export const clearActivityLogs = createAction('[Dashboard] Clear Activity Logs');

export const setMaxActivityLogs = createAction(
  '[Dashboard] Set Max Activity Logs',
  props<{ maxLogs: number }>()
);

// Dashboard State Actions
export const updateCurrentTime = createAction(
  '[Dashboard] Update Current Time',
  props<{ currentTime: Date }>()
);

export const setLastActivity = createAction(
  '[Dashboard] Set Last Activity',
  props<{ lastActivity: Date }>()
);

export const setRemainingTime = createAction(
  '[Dashboard] Set Remaining Time',
  props<{ remainingTime: number }>()
);

// Test Actions
export const testActivity = createAction(
  '[Dashboard] Test Activity',
  props<{ activityType: string; details?: string }>()
);

export const simulateActivity = createAction('[Dashboard] Simulate Activity');

export const resetSession = createAction('[Dashboard] Reset Session');