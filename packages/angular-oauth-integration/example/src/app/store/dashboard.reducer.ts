import { createReducer, on } from '@ngrx/store';
import { DashboardState, initialDashboardState } from './dashboard.state';
import * as DashboardActions from './dashboard.actions';

export const dashboardReducer = createReducer(
  initialDashboardState,
  
  // Activity Logs
  on(DashboardActions.addActivityLog, (state, { log }) => ({
    ...state,
    activityLogs: [log, ...state.activityLogs].slice(0, state.maxActivityLogs)
  })),
  
  on(DashboardActions.clearActivityLogs, (state) => ({
    ...state,
    activityLogs: []
  })),
  
  on(DashboardActions.setMaxActivityLogs, (state, { maxLogs }) => ({
    ...state,
    maxActivityLogs: maxLogs,
    activityLogs: state.activityLogs.slice(0, maxLogs)
  })),
  
  // Dashboard State
  on(DashboardActions.updateCurrentTime, (state, { currentTime }) => ({
    ...state,
    currentTime
  })),
  
  on(DashboardActions.setLastActivity, (state, { lastActivity }) => ({
    ...state,
    lastActivity
  })),
  
  on(DashboardActions.setRemainingTime, (state, { remainingTime }) => ({
    ...state,
    remainingTime
  })),
  
  // Test Actions (add corresponding logs)
  on(DashboardActions.testActivity, (state, { activityType, details }) => {
    const log = {
      timestamp: new Date(),
      message: details ? `${activityType}: ${details}` : activityType,
      type: 'info' as const
    };
    return {
      ...state,
      activityLogs: [log, ...state.activityLogs].slice(0, state.maxActivityLogs)
    };
  }),
  
  on(DashboardActions.simulateActivity, (state) => {
    const log = {
      timestamp: new Date(),
      message: '🎭 Activity simulated',
      type: 'info' as const
    };
    return {
      ...state,
      activityLogs: [log, ...state.activityLogs].slice(0, state.maxActivityLogs)
    };
  }),
  
  on(DashboardActions.resetSession, (state) => {
    const log = {
      timestamp: new Date(),
      message: '🔄 Session manually reset',
      type: 'info' as const
    };
    return {
      ...state,
      activityLogs: [log, ...state.activityLogs].slice(0, state.maxActivityLogs)
    };
  })
);