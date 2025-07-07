export interface IdleState {
  isIdle: boolean;
  isWarning: boolean;
  isTimedOut: boolean;
  isWatching: boolean;
  lastActivity: Date;
  remainingTime: number;
  isRefreshingToken: boolean;
  refreshTokenError: any | null;
}

export const initialIdleState: IdleState = {
  isIdle: false,
  isWarning: false,
  isTimedOut: false,
  isWatching: false,
  lastActivity: new Date(),
  remainingTime: 0,
  isRefreshingToken: false,
  refreshTokenError: null
};