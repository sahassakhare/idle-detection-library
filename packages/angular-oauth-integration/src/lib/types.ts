export interface IdleOAuthConfig {
  idleTimeout: number;
  warningTimeout: number;
  autoRefreshToken: boolean;
  multiTabCoordination: boolean;
  configUrl?: string;
  roleBased?: boolean;
  roleTimeouts?: Record<string, { idle: number; warning: number }>;
  customCssClasses?: {
    dialog?: string;
    overlay?: string;
    title?: string;
    message?: string;
    button?: string;
    buttonPrimary?: string;
    buttonSecondary?: string;
  };
}

export interface IdleState {
  isIdle: boolean;
  isWarning: boolean;
  timeRemaining: number;
  lastActivity: number;
  tokenRefreshInProgress: boolean;
  multiTabActive: boolean;
  userRole?: string;
  config: IdleOAuthConfig;
}

import { Observable } from 'rxjs';

export interface IdleWarningData {
  timeRemaining: number;
  timeRemaining$: Observable<number>;
  onExtendSession: () => void;
  onLogout: () => void;
  cssClasses?: IdleOAuthConfig['customCssClasses'];
}

export enum IdleStatus {
  ACTIVE = 'active',
  WARNING = 'warning',
  IDLE = 'idle',
  LOGGED_OUT = 'logged_out'
}

export interface TabCoordinationMessage {
  type: 'activity' | 'warning' | 'logout' | 'config_update';
  timestamp: number;
  data?: any;
}

export interface CustomAction {
  id: string;
  label: string;
  cssClass?: string;
  icon?: string;
  callback: () => void;
  closeDialog?: boolean; // Whether clicking this action should close the dialog
  order?: number; // Display order (lower numbers first)
}

export interface ActionContext {
  timeRemaining: number;
  formattedTime: string;
  progressPercentage: number;
  isWarningShown: boolean;
}