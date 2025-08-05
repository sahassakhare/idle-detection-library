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

/**
 * Defines a custom action button that can be added to the idle warning dialog.
 * Custom actions provide additional functionality beyond the default Extend/Logout buttons.
 * 
 * @example
 * ```typescript
 * const saveAction: CustomAction = {
 *   id: 'save-continue',
 *   label: 'Save & Continue',
 *   cssClass: 'btn btn-success',
 *   icon: '<svg>...</svg>',
 *   callback: () => this.saveWork(),
 *   closeDialog: true,
 *   order: 1
 * };
 * ```
 */
export interface CustomAction {
  /** Unique identifier for the action. Used for tracking and debugging. */
  id: string;
  
  /** Text displayed on the action button. Should be clear and action-oriented. */
  label: string;
  
  /** 
   * Optional CSS classes to apply to the button for custom styling.
   * Can include multiple classes separated by spaces.
   * @example 'btn btn-primary btn-lg'
   */
  cssClass?: string;
  
  /** 
   * Optional HTML or SVG icon to display alongside the label.
   * Should be valid HTML that will be inserted using innerHTML.
   * @example '<svg viewBox="0 0 24 24"><path d="..."/></svg>'
   */
  icon?: string;
  
  /** 
   * Function to execute when the action button is clicked.
   * Should handle any necessary logic like saving data, API calls, etc.
   */
  callback: () => void;
  
  /** 
   * Whether clicking this action should close the warning dialog.
   * @default true
   * Set to false for utility actions that should keep the dialog open.
   */
  closeDialog?: boolean;
  
  /** 
   * Display order for the button (lower numbers appear first).
   * Use this to control the visual order of custom actions.
   * @default 0
   */
  order?: number;
}

/**
 * Context information available to custom templates and actions.
 * Provides real-time data about the current idle warning state.
 * 
 * @example
 * ```typescript
 * // In a custom template
 * <ng-template let-context>
 *   <div>Time: {{ context.formattedTime }}</div>
 *   <div>Progress: {{ context.progressPercentage }}%</div>
 * </ng-template>
 * ```
 */
export interface ActionContext {
  /** Number of milliseconds remaining before session timeout */
  timeRemaining: number;
  
  /** Human-readable time remaining formatted as MM:SS */
  formattedTime: string;
  
  /** Progress percentage from 0-100 indicating how much time has elapsed */
  progressPercentage: number;
  
  /** Whether the warning dialog is currently visible to the user */
  isWarningShown: boolean;
}