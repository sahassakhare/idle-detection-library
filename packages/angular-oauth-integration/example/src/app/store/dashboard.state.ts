export interface ActivityLog {
  timestamp: Date;
  message: string;
  type: 'info' | 'warning' | 'error';
}

export interface DashboardState {
  activityLogs: ActivityLog[];
  maxActivityLogs: number;
  currentTime: Date;
  lastActivity: Date;
  remainingTime: number;
}

export const initialDashboardState: DashboardState = {
  activityLogs: [],
  maxActivityLogs: 100,
  currentTime: new Date(),
  lastActivity: new Date(),
  remainingTime: 0
};