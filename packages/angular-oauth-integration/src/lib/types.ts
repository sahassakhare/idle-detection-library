import { InjectionToken } from '@angular/core';
import { IdleConfig } from '@idle-detection/core';

export interface AngularIdleOAuthConfig extends IdleConfig {
  /** Enable automatic token refresh when user becomes active */
  autoRefreshToken?: boolean;
  /** Show warning dialog before timeout */
  showWarningDialog?: boolean;
  /** Custom warning dialog component */
  warningDialogComponent?: any;
  /** Configuration for the warning dialog */
  warningDialogConfig?: IdleWarningDialogConfig;
  /** Redirect URL after timeout */
  timeoutRedirectUrl?: string;
  /** Enable multi-tab coordination */
  multiTabCoordination?: boolean;
  /** Storage key for multi-tab coordination */
  multiTabStorageKey?: string;
  /** Enable debug logging */
  debug?: boolean;
}

export interface IdleWarningDialogData {
  /** Remaining time in seconds before timeout */
  remainingTime: number;
  /** Total warning timeout in seconds */
  totalWarningTime: number;
  /** Callback to extend session */
  extendSession: () => void;
  /** Callback to logout immediately */
  logoutNow: () => void;
}

export interface IdleWarningDialogConfig {
  /** Custom title for the dialog */
  title?: string;
  /** Custom message for the dialog */
  message?: string;
  /** Custom text for the extend session button */
  extendButtonLabel?: string;
  /** Custom text for the logout button */
  logoutButtonLabel?: string;
  /** Whether to show the progress bar */
  showProgressBar?: boolean;
  /** Whether to show the countdown timer */
  showCountdown?: boolean;
  /** Whether to auto-close when timer reaches 0 */
  autoClose?: boolean;
  /** Theme variant for the dialog */
  theme?: 'default' | 'dark' | 'minimal';
  /** Size variant for the dialog */
  size?: 'small' | 'medium' | 'large';
  /** Whether clicking backdrop closes the dialog */
  backdropClose?: boolean;
  /** Custom CSS styles to apply */
  customStyles?: { [key: string]: string };
}

export const IDLE_OAUTH_CONFIG = new InjectionToken<AngularIdleOAuthConfig>('IDLE_OAUTH_CONFIG');

export const DEFAULT_IDLE_OAUTH_CONFIG: AngularIdleOAuthConfig = {
  idleTimeout: 15 * 60 * 1000, // 15 minutes
  warningTimeout: 2 * 60 * 1000, // 2 minutes
  autoResume: true,
  autoRefreshToken: true,
  showWarningDialog: true,
  multiTabCoordination: true,
  multiTabStorageKey: 'idle-oauth-state',
  debug: false
};