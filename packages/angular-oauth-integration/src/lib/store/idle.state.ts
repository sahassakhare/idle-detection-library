import { IdleState, IdleOAuthConfig } from '../types';

export const IDLE_FEATURE_KEY = 'idle';

export const initialIdleState: IdleState = {
  isIdle: false,
  isWarning: false,
  timeRemaining: 0,
  lastActivity: Date.now(),
  tokenRefreshInProgress: false,
  multiTabActive: false,
  userRole: undefined,
  config: {
    idleTimeout: 15 * 60 * 1000, // 15 minutes
    warningTimeout: 2 * 60 * 1000, // 2 minutes
    autoRefreshToken: true,
    multiTabCoordination: true,
    roleBased: false
  }
};

export interface AppState {
  [IDLE_FEATURE_KEY]: IdleState;
}