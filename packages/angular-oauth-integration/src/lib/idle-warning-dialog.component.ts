import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  signal,
  computed,
  TemplateRef,
  ContentChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IdleWarningData, CustomAction } from './types';
import { Idle, MultiTabExpiry, IdleEvent, DocumentInterruptSource } from '@idle-detection/core';

/**
 * Angular Idle Detection and Session Management Component
 * 
 * A complete, zero-setup Angular component for session timeout management with industry-standard
 * security practices. Provides automatic idle detection, warning dialogs, and session management
 * with minimal configuration.
 * 
 * ## Key Features
 * - **Zero Setup**: Add one component tag and you're done
 * - **Industry Standard Security**: No backdrop clicks, explicit user action required
 * - **Multi-Tab Coordination**: Real-time synchronization across browser tabs
 * - **Highly Customizable**: Custom templates, actions, themes, and styling
 * - **Accessible**: WCAG compliant with keyboard navigation and screen reader support
 * - **Modern Angular**: Built with Angular 18+ standalone components and signals
 * 
 * ## Basic Usage
 * ```typescript
 * // In your component
 * @Component({
 *   template: `
 *     <idle-warning-dialog
 *       [idleTimeout]="900000"
 *       [warningTimeout]="60000"
 *       [onLogoutCallback]="handleLogout">
 *     </idle-warning-dialog>
 *   `
 * })
 * export class AppComponent {
 *   handleLogout = () => {
 *     window.location.href = '/login';
 *   };
 * }
 * ```
 * 
 * ## Advanced Usage with Custom Actions
 * ```typescript
 * @Component({
 *   template: `
 *     <idle-warning-dialog
 *       [customActions]="customActions"
 *       [enableMultiTab]="true"
 *       [idleTimeout]="1200000"
 *       [warningTimeout]="120000"
 *       (sessionExtended)="onSessionExtended()">
 *     </idle-warning-dialog>
 *   `
 * })
 * export class AppComponent {
 *   customActions: CustomAction[] = [
 *     {
 *       id: 'save-continue',
 *       label: 'Save & Continue',
 *       callback: () => this.saveWork(),
 *       order: 1
 *     }
 *   ];
 * }
 * ```
 * 
 * @see {@link https://github.com/your-org/idle-detection-library} Documentation
 * @since 1.0.0
 */
@Component({
  selector: 'idle-warning-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      *ngIf="isWarningShown()"
      [class]="backdropClass"
      [ngClass]="[themeClass(), 'idle-warning-overlay']"
      role="dialog"
      aria-modal="true"
      aria-labelledby="idle-warning-title"
      aria-describedby="idle-warning-message"
      (click)="onBackdropClick($event)"
      (mousedown)="onMouseDown($event)"
    >
      <!-- Custom Template Support -->
      <ng-container *ngIf="customTemplate || customTemplateRef; else defaultTemplate">
        <ng-container *ngTemplateOutlet="(customTemplate || customTemplateRef)!; context: templateContext"></ng-container>
      </ng-container>
      
      <!-- Default Template -->
      <ng-template #defaultTemplate>
      <div 
        [class]="dialogClass"
        [ngClass]="[dialogSizeClass(), themeClass()]"
        [ngStyle]="dialogStyles()"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div [class]="headerClass" *ngIf="displayTitle()">
          <h2 
            id="idle-warning-title"
            [class]="titleClass"
          >
            {{ displayTitle() }}
          </h2>
        </div>
        
        <!-- Body -->
        <div [class]="bodyClass">
          <div 
            id="idle-warning-message"
            [class]="messageClass"
          >
            <p>{{ displayMessage() }}</p>
          </div>
          
          <!-- Countdown Timer -->
          <div 
            [class]="countdownClass" 
            *ngIf="showCountdown"
            aria-live="polite"
          >
            <span [class]="countdownLabelClass">Time remaining:</span>
            <span [class]="countdownTimeClass">{{ formatTime(timeRemaining()) }}</span>
          </div>
          
          <!-- Progress Bar -->
          <div 
            [class]="progressClass" 
            *ngIf="showProgressBar"
            role="progressbar"
            [attr.aria-valuenow]="progressPercentage()"
            aria-valuemin="0"
            aria-valuemax="100"
            [attr.aria-label]="'Session timeout progress: ' + progressPercentage() + '% remaining'"
          >
            <div 
              [class]="progressBarClass"
              [style.width.%]="progressPercentage()"
            ></div>
          </div>
        </div>
        
        <!-- Actions -->
        <div [class]="actionsClass">
          <!-- Custom Actions -->
          <ng-container *ngFor="let action of getSortedCustomActions()">
            <button 
              type="button"
              [class]="action.cssClass || 'btn btn-custom'"
              (click)="onCustomAction(action)"
              (mousedown)="$event.stopPropagation()"
              [attr.aria-label]="action.label"
            >
              <ng-container *ngIf="action.icon">
                <span [innerHTML]="action.icon" class="action-icon"></span>
              </ng-container>
              {{ action.label }}
            </button>
          </ng-container>
          
          <!-- Default Actions (if not hidden) -->
          <ng-container *ngIf="!hideDefaultActions">
            <button 
              *ngIf="showExtendButton"
              type="button"
              [class]="primaryButtonClass"
              (click)="onExtendSession()"
              (mousedown)="$event.stopPropagation()"
              [attr.aria-label]="displayExtendLabel()"
              #extendButton
            >
              {{ displayExtendLabel() }}
            </button>
            
            <button 
              *ngIf="showLogoutButton"
              type="button"
              [class]="secondaryButtonClass"
              (click)="onLogout()"
              (mousedown)="$event.stopPropagation()"
              [attr.aria-label]="displayLogoutLabel()"
              #logoutButton
            >
              {{ displayLogoutLabel() }}
            </button>
          </ng-container>
        </div>
      </div>
      </ng-template>
    </div>
  `,
  styles: [`
    /* Base overlay styles */
    .idle-warning-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(2px);
    }

    /* Base dialog styles */
    .idle-warning-dialog {
      background: white;
      border-radius: 8px;
      padding: 24px;
      width: 90%;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    /* Size variants */
    .idle-warning-dialog--small { max-width: 320px; padding: 16px; }
    .idle-warning-dialog--medium { max-width: 400px; padding: 24px; }
    .idle-warning-dialog--large { max-width: 600px; padding: 32px; }

    /* Theme variants */
    .idle-warning-dialog--default { background: white; color: #1f2937; }
    .idle-warning-dialog--dark { 
      background: #1f2937; 
      color: white; 
      border: 1px solid #374151;
    }
    .idle-warning-dialog--minimal { 
      background: #f9fafb; 
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    /* Header styles */
    .idle-warning-header {
      margin-bottom: 16px;
    }

    .idle-warning-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: inherit;
    }

    /* Body styles */
    .idle-warning-body {
      margin-bottom: 24px;
    }

    .idle-warning-message {
      margin: 0 0 16px 0;
      color: inherit;
      line-height: 1.5;
      opacity: 0.8;
    }

    /* Countdown styles */
    .idle-warning-countdown {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin: 16px 0;
      padding: 12px;
      background: rgba(220, 38, 38, 0.1);
      border-radius: 6px;
      border: 1px solid rgba(220, 38, 38, 0.2);
    }

    .countdown-label {
      font-size: 14px;
      font-weight: 500;
      color: #dc2626;
    }

    .countdown-time {
      font-size: 20px;
      font-weight: 700;
      color: #dc2626;
      font-family: monospace;
    }

    /* Progress bar styles */
    .idle-warning-progress {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin: 16px 0;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(to right, #dc2626, #f59e0b, #10b981);
      transition: width 0.3s ease;
      border-radius: 4px;
    }

    /* Actions styles */
    .idle-warning-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    /* Button styles */
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
      position: relative;
      z-index: 10;
    }

    .btn:focus {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn-secondary:hover {
      background: #4b5563;
      transform: translateY(-1px);
    }
    
    .btn-custom {
      background: #8b5cf6;
      color: white;
    }
    
    .btn-custom:hover {
      background: #7c3aed;
      transform: translateY(-1px);
    }
    
    .action-icon {
      display: inline-block;
      margin-right: 6px;
      vertical-align: middle;
    }
    
    .action-icon svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }

    /* Dark theme overrides */
    .idle-warning-dialog--dark .countdown-label,
    .idle-warning-dialog--dark .countdown-time {
      color: #fca5a5;
    }

    .idle-warning-dialog--dark .idle-warning-countdown {
      background: rgba(248, 113, 113, 0.1);
      border-color: rgba(248, 113, 113, 0.2);
    }

    .idle-warning-dialog--dark .idle-warning-progress {
      background: #374151;
    }

    /* Responsive design */
    @media (max-width: 480px) {
      .idle-warning-dialog {
        margin: 16px;
        width: calc(100% - 32px);
      }
      
      .idle-warning-actions {
        flex-direction: column;
      }
      
      .btn {
        width: 100%;
      }
    }

    /* Accessibility enhancements */
    @media (prefers-reduced-motion: reduce) {
      .idle-warning-dialog {
        animation: none;
      }
      
      .btn {
        transition: none;
      }
      
      .btn:hover {
        transform: none;
      }
    }
  `]
})
export class IdleWarningDialogComponent implements OnInit, OnDestroy {
  @Input() warningData!: IdleWarningData;
  
  // Custom template support
  @ContentChild('customTemplate', { static: false }) customTemplate?: TemplateRef<any>;
  @Input() customTemplateRef?: TemplateRef<any>; // Alternative way to pass template
  
  // Input properties for customization
  @Input() dialogTitle?: string;
  @Input() dialogMessage?: string;
  @Input() extendButtonText?: string;
  @Input() logoutButtonText?: string;
  @Input() showProgressBar?: boolean = true;
  @Input() showCountdown?: boolean = true;
  @Input() autoClose?: boolean = false;
  @Input() theme?: 'default' | 'dark' | 'minimal' = 'default';
  @Input() size?: 'small' | 'medium' | 'large' = 'medium';
  // backdropClose removed - clicking outside should never close session timeout dialogs (industry standard)
  @Input() customStyles?: { [key: string]: string };
  
  // Simple inputs to replace store dependencies
  @Input() initialTimeRemaining?: number = 30000; // 30 seconds default
  
  /**
   * Time in milliseconds before the user is considered idle.
   * Default is 900000 (15 minutes). Common values:
   * - Banking/Financial: 15-30 minutes (900000-1800000)
   * - General Business: 30-60 minutes (1800000-3600000) 
   * - Public Computers: 5-15 minutes (300000-900000)
   * 
   * @default 900000
   * @example
   * ```html
   * <idle-warning-dialog [idleTimeout]="1200000"> <!-- 20 minutes -->
   * ```
   */
  @Input() idleTimeout?: number = 900000; // 15 minutes default
  
  /**
   * Duration in milliseconds for the warning dialog before automatic logout.
   * Default is 60000 (1 minute). This gives users time to extend their session.
   * 
   * @default 60000
   * @example
   * ```html
   * <idle-warning-dialog [warningTimeout]="120000"> <!-- 2 minutes warning -->
   * ```
   */
  @Input() warningTimeout?: number = 60000; // 1 minute warning default
  
  /**
   * Array of DOM event names that indicate user activity.
   * Default includes mouse, keyboard, touch, and scroll events.
   * Customize this to suit your application's interaction patterns.
   * 
   * @default ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
   * @example
   * ```html
   * <idle-warning-dialog [activityEvents]="['click', 'keypress']">
   * ```
   */
  @Input() activityEvents?: string[] = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  
  /**
   * Whether idle detection is enabled. Set to false to temporarily disable
   * idle detection without removing the component.
   * 
   * @default true
   * @example
   * ```html
   * <idle-warning-dialog [enableIdleDetection]="isIdleEnabled">
   * ```
   */
  @Input() enableIdleDetection?: boolean = true;
  
  /**
   * Delay in milliseconds for throttling activity events to improve performance.
   * Higher values reduce CPU usage but may delay idle detection reset.
   * 
   * @default 500
   * @example
   * ```html
   * <idle-warning-dialog [throttleDelay]="1000"> <!-- 1 second throttle -->
   * ```
   */
  @Input() throttleDelay?: number = 500; // Throttle activity events
  
  /**
   * Enable multi-tab coordination using BroadcastChannel API.
   * When enabled, activity in any tab resets idle timers in all tabs.
   * Disable for single-tab applications or when tabs should be independent.
   * 
   * @default true
   * @example
   * ```html
   * <idle-warning-dialog [enableMultiTab]="false"> <!-- Disable multi-tab -->
   * ```
   */
  @Input() enableMultiTab?: boolean = true; // Enable multi-tab coordination
  
  /**
   * Name of the BroadcastChannel for multi-tab communication.
   * Use unique names for different applications to prevent interference.
   * Only used when enableMultiTab is true.
   * 
   * @default 'idle-detection-channel'
   * @example
   * ```html
   * <idle-warning-dialog multiTabChannelName="my-app-idle">
   * ```
   */
  @Input() multiTabChannelName?: string = 'idle-detection-channel'; // BroadcastChannel name
  
  /**
   * Callback function executed when the user clicks the "Extend Session" button.
   * This is where you should implement your session extension logic (e.g., refresh tokens).
   * 
   * @example
   * ```typescript
   * handleExtend = () => {
   *   this.authService.refreshToken();
   *   console.log('Session extended');
   * };
   * ```
   * ```html
   * <idle-warning-dialog [onExtendCallback]="handleExtend">
   * ```
   */
  @Input() onExtendCallback?: () => void;
  
  /**
   * Callback function executed when the session times out or user clicks "Logout".
   * This is where you should implement your logout logic (e.g., clear tokens, redirect).
   * 
   * @example
   * ```typescript
   * handleLogout = () => {
   *   this.authService.logout();
   *   this.router.navigate(['/login']);
   * };
   * ```
   * ```html
   * <idle-warning-dialog [onLogoutCallback]="handleLogout">
   * ```
   */
  @Input() onLogoutCallback?: () => void;
  
  /**
   * Array of custom action buttons to display in the warning dialog.
   * These buttons appear alongside or instead of the default Extend/Logout buttons.
   * Each action can have custom styling, icons, and behavior.
   * 
   * @example
   * ```typescript
   * customActions: CustomAction[] = [
   *   {
   *     id: 'save-continue',
   *     label: 'Save & Continue',
   *     cssClass: 'btn btn-success',
   *     callback: () => this.saveWork(),
   *     order: 1
   *   }
   * ];
   * ```
   * ```html
   * <idle-warning-dialog [customActions]="customActions">
   * ```
   */
  @Input() customActions?: CustomAction[];
  
  /**
   * Whether to hide both default action buttons (Extend Session and Logout).
   * Set to true if you want to use only custom actions.
   * 
   * @default false
   * @example
   * ```html
   * <idle-warning-dialog [hideDefaultActions]="true" [customActions]="myActions">
   * ```
   */
  @Input() hideDefaultActions?: boolean = false; // Hide the default Extend/Logout buttons
  
  /**
   * Whether to show the "Extend Session" button.
   * Set to false to hide only the extend button while keeping the logout button.
   * 
   * @default true
   * @example
   * ```html
   * <idle-warning-dialog [showExtendButton]="false">
   * ```
   */  
  @Input() showExtendButton?: boolean = true; // Show/hide extend button specifically
  
  /**
   * Whether to show the "Logout" button.
   * Set to false to hide only the logout button while keeping the extend button.
   * 
   * @default true
   * @example
   * ```html
   * <idle-warning-dialog [showLogoutButton]="false">
   * ```
   */
  @Input() showLogoutButton?: boolean = true; // Show/hide logout button specifically
  
  /**
   * Whether to enable debug logging to console.
   * Set to false in production to disable all console.log statements.
   * 
   * @default false
   * @example
   * ```html
   * <idle-warning-dialog [enableDebugLogs]="true">
   * ```
   */
  @Input() enableDebugLogs: boolean = false;
  
  
  // CSS class customization
  @Input() backdropClass: string = 'idle-warning-backdrop';
  @Input() dialogClass: string = 'idle-warning-dialog';
  @Input() headerClass: string = 'idle-warning-header';
  @Input() bodyClass: string = 'idle-warning-body';
  @Input() titleClass: string = 'idle-warning-title';
  @Input() messageClass: string = 'idle-warning-message';
  @Input() countdownClass: string = 'idle-warning-countdown';
  @Input() countdownLabelClass: string = 'countdown-label';
  @Input() countdownTimeClass: string = 'countdown-time';
  @Input() progressClass: string = 'idle-warning-progress';
  @Input() progressBarClass: string = 'progress-bar';
  @Input() actionsClass: string = 'idle-warning-actions';
  @Input() primaryButtonClass: string = 'btn btn-primary';
  @Input() secondaryButtonClass: string = 'btn btn-secondary';

  // Legacy inputs for backward compatibility
  @Input() set titleText(value: string) { this.titleSignal.set(value); }
  @Input() set messageText(value: string) { this.messageSignal.set(value); }
  @Input() set extendText(value: string) { this.extendTextSignal.set(value); }
  @Input() set logoutText(value: string) { this.logoutTextSignal.set(value); }
  @Input() set extendLabel(value: string) { this.extendLabelSignal.set(value); }
  @Input() set logoutLabel(value: string) { this.logoutLabelSignal.set(value); }

  /**
   * Emitted when the user clicks the "Extend Session" button.
   * Use this to perform additional actions when session is extended.
   * 
   * @example
   * ```html
   * <idle-warning-dialog (extendSession)="onSessionExtended()">
   * ```
   * ```typescript
   * onSessionExtended() {
   *   console.log('User extended their session');
   *   this.trackUserActivity('session_extended');
   * }
   * ```
   */
  @Output() extendSession = new EventEmitter<void>();
  
  /**
   * Emitted when the user clicks the "Logout" button or session times out.
   * Use this to perform cleanup or analytics before logout.
   * 
   * @example
   * ```html
   * <idle-warning-dialog (logout)="onUserLogout()">
   * ```
   * ```typescript
   * onUserLogout() {
   *   console.log('User is logging out');
   *   this.saveUserPreferences();
   * }
   * ```
   */
  @Output() logout = new EventEmitter<void>();
  
  /**
   * Emitted when the user becomes idle (after idleTimeout period).
   * The warning dialog has not been shown yet at this point.
   * 
   * @example
   * ```html
   * <idle-warning-dialog (idleStart)="onUserIdle()">
   * ```
   * ```typescript
   * onUserIdle() {
   *   console.log('User became idle');
   *   this.pauseAutoSave();
   * }
   * ```
   */
  @Output() idleStart = new EventEmitter<void>();
  
  /**
   * Emitted when the user becomes active again after being idle.
   * This happens when activity is detected after idle state.
   * 
   * @example
   * ```html
   * <idle-warning-dialog (idleEnd)="onUserActive()">
   * ```
   * ```typescript
   * onUserActive() {
   *   console.log('User became active again');
   *   this.resumeAutoSave();
   * }
   * ```
   */
  @Output() idleEnd = new EventEmitter<void>();
  
  /**
   * Emitted when the warning dialog is displayed to the user.
   * Use this to pause non-critical operations or log analytics.
   * 
   * @example
   * ```html
   * <idle-warning-dialog (warningStart)="onWarningShown()">
   * ```
   * ```typescript
   * onWarningShown() {
   *   console.log('Timeout warning shown to user');
   *   this.pauseBackgroundTasks();
   * }
   * ```
   */
  @Output() warningStart = new EventEmitter<void>();
  
  /**
   * Emitted when the warning dialog is closed (by user action or programmatically).
   * Use this to resume operations that were paused during warning.
   * 
   * @example
   * ```html
   * <idle-warning-dialog (warningEnd)="onWarningClosed()">
   * ```
   * ```typescript
   * onWarningClosed() {
   *   console.log('Warning dialog closed');
   *   this.resumeBackgroundTasks();
   * }
   * ```
   */
  @Output() warningEnd = new EventEmitter<void>();
  
  /**
   * Emitted when the session times out automatically (warning period expires).
   * This happens when the user doesn't respond to the warning dialog.
   * 
   * @example
   * ```html
   * <idle-warning-dialog (sessionTimeout)="onSessionTimeout()">
   * ```
   * ```typescript
   * onSessionTimeout() {
   *   console.log('Session timed out automatically');
   *   this.trackUserActivity('session_timeout');
   * }
   * ```
   */
  @Output() sessionTimeout = new EventEmitter<void>();
  
  /**
   * Emitted when the session is successfully extended by user action.
   * Use this for analytics or to perform additional extension logic.
   * 
   * @example
   * ```html
   * <idle-warning-dialog (sessionExtended)="onSessionExtended()">
   * ```
   * ```typescript
   * onSessionExtended() {
   *   console.log('Session extended successfully');
   *   this.updateLastActiveTime();
   * }
   * ```
   */
  @Output() sessionExtended = new EventEmitter<void>();
  
  /**
   * Emitted whenever user activity is detected (mouse, keyboard, touch, etc.).
   * The Event object contains details about the detected activity.
   * Use this for fine-grained activity monitoring or analytics.
   * 
   * @example
   * ```html
   * <idle-warning-dialog (activityDetected)="onActivity($event)">
   * ```
   * ```typescript
   * onActivity(event: Event) {
   *   console.log(`Activity detected: ${event.type}`);
   *   this.logUserInteraction(event.type);
   * }
   * ```
   */
  @Output() activityDetected = new EventEmitter<Event>();

  private destroy$ = new Subject<void>();
  private countdownTimer?: any;
  private syncTimer?: any;
  
  // Idle detection state
  private idleTimer?: any;
  private warningTimer?: any;
  private lastActivity: number = Date.now();
  private throttleTimer?: any;
  private boundHandleActivity?: any;
  private isIdle = false;
  isWarningShown = signal(false); // Public for template access
  
  // Multi-tab coordination using core Idle class
  private idleCore?: Idle;
  private multiTabExpiry?: MultiTabExpiry;
  
  timeRemaining = signal(0);
  cssClasses = signal<any>(null);
  totalTime = signal(30000); // Total warning time for progress calculation
  
  titleSignal = signal('Session Timeout Warning');
  messageSignal = signal('Your session is about to expire due to inactivity.');
  extendTextSignal = signal('Extend Session');
  logoutTextSignal = signal('Logout');
  extendLabelSignal = signal('Extend your session to continue');
  logoutLabelSignal = signal('Logout and end your session');

  // Computed properties for enhanced features
  displayTitle = computed(() => this.dialogTitle || this.titleSignal());
  displayMessage = computed(() => this.dialogMessage || this.messageSignal());
  displayExtendLabel = computed(() => this.extendButtonText || this.extendTextSignal());
  displayLogoutLabel = computed(() => this.logoutButtonText || this.logoutTextSignal());
  
  progressPercentage = computed(() => {
    const remaining = this.timeRemaining();
    const total = this.totalTime();
    if (total <= 0) return 0;
    return Math.max(0, Math.min(100, (remaining / total) * 100));
  });

  dialogSizeClass = computed(() => `idle-warning-dialog--${this.size}`);
  themeClass = computed(() => `idle-warning-dialog--${this.theme}`);
  
  dialogStyles = computed(() => {
    const styles: { [key: string]: string } = {};
    if (this.customStyles) {
      Object.assign(styles, this.customStyles);
    }
    return styles;
  });
  
  // Template context for custom templates
  get templateContext() {
    return {
      $implicit: {
        timeRemaining: this.timeRemaining(),
        progressPercentage: this.progressPercentage(),
        isWarningShown: this.isWarningShown(),
        dialogTitle: this.displayTitle(),
        dialogMessage: this.displayMessage(),
        extendButtonText: this.displayExtendLabel(),
        logoutButtonText: this.displayLogoutLabel(),
        formattedTime: this.formatTime(this.timeRemaining()),
        customActions: this.getSortedCustomActions()
      },
      onExtend: () => this.onExtendSession(),
      onLogout: () => this.onLogout(),
      onCustomAction: (action: CustomAction) => this.onCustomAction(action),
      formatTime: (ms: number) => this.formatTime(ms),
      timeRemaining: this.timeRemaining,
      progressPercentage: this.progressPercentage,
      theme: this.theme,
      size: this.size,
      hideDefaultActions: this.hideDefaultActions,
      showExtendButton: this.showExtendButton,
      showLogoutButton: this.showLogoutButton
    };
  }

  constructor(private cdr: ChangeDetectorRef) {}

  /**
   * Private method for conditional debug logging
   */
  private debugLog(message: string, ...args: any[]): void {
    if (this.enableDebugLogs) {
      console.log(message, ...args);
    }
  }

  ngOnInit(): void {
    this.debugLog('[IdleWarningDialog] ngOnInit called', {
      enableIdleDetection: this.enableIdleDetection,
      idleTimeout: this.idleTimeout,
      warningTimeout: this.warningTimeout,
      enableMultiTab: this.enableMultiTab
    });
    
    if (this.warningData) {
      this.cssClasses.set(this.warningData.cssClasses);
      // Set total time for progress calculation
      this.totalTime.set(this.warningData.timeRemaining || this.initialTimeRemaining || 30000);
    } else {
      // Set default values when no warningData is provided
      this.totalTime.set(this.warningTimeout || this.initialTimeRemaining || 30000);
    }
    
    // Setup idle detection if enabled
    if (this.enableIdleDetection) {
      this.debugLog('[IdleWarningDialog] Setting up idle detection');
      this.setupIdleDetection();
    } else if (this.warningData) {
      // Backward compatibility - show immediately if warningData provided
      this.showWarning();
    }
  }

  private startCountdown(): void {
    this.debugLog('[Countdown] Starting countdown timer');
    
    this.countdownTimer = setInterval(() => {
      // In multi-tab mode, ALWAYS use shared expiry as source of truth
      if (this.enableMultiTab && this.multiTabExpiry) {
        const sharedExpiry = this.multiTabExpiry.get();
        if (sharedExpiry) {
          const sharedRemaining = Math.max(0, sharedExpiry.getTime() - Date.now());
          const currentDisplayed = this.timeRemaining();
          
          // Only log significant differences to avoid spam
          if (Math.abs(sharedRemaining - currentDisplayed) > 2000) {
            this.debugLog('[Countdown] Syncing with shared expiry', { 
              sharedExpiry: sharedExpiry.toISOString(),
              sharedRemaining: sharedRemaining,
              currentDisplayed: currentDisplayed,
              drift: Math.abs(sharedRemaining - currentDisplayed)
            });
          }
          
          if (sharedRemaining > 0) {
            // Always update to shared expiry time for consistency across tabs
            this.timeRemaining.set(sharedRemaining);
          } else {
            // Shared expiry indicates timeout
            this.debugLog('[Countdown] Timeout reached via shared expiry');
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
            if (this.autoClose) {
              this.onLogout();
            }
            return;
          }
        } else {
          // No shared expiry - shouldn't happen in multi-tab mode after WARNING_START
          this.debugLog('[Countdown] ERROR: No shared expiry in multi-tab mode');
          
          // Emergency fallback: set expiry based on current timeRemaining
          const currentTime = this.timeRemaining();
          if (currentTime > 0) {
            const emergencyExpiry = new Date(Date.now() + currentTime);
            this.multiTabExpiry.set(emergencyExpiry);
            this.debugLog('[Countdown] Set emergency shared expiry', { expiry: emergencyExpiry.toISOString() });
          } else {
            // No time remaining - timeout
            if (this.autoClose) {
              this.onLogout();
            }
            return;
          }
        }
      } else {
        // Single-tab mode - use local countdown
        const currentTime = this.timeRemaining();
        if (currentTime <= 0) {
          clearInterval(this.countdownTimer);
          this.countdownTimer = null;
          if (this.autoClose) {
            this.onLogout();
          }
          return;
        }
        this.timeRemaining.set(currentTime - 1000);
      }
      
      // Force immediate change detection for OnPush strategy
      this.cdr.detectChanges();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cleanup();
  }

  private setupIdleDetection(): void {
    this.debugLog('[IdleWarningDialog] Setting up idle detection');
    
    // Create bound event handler for activity detection
    this.boundHandleActivity = this.handleActivity.bind(this);
    
    // Always add event listeners for activityDetected events
    this.activityEvents?.forEach(event => {
      document.addEventListener(event, this.boundHandleActivity, { passive: true });
    });

    // Setup multi-tab coordination
    if (this.enableMultiTab) {
      this.debugLog('[IdleWarningDialog] Setting up multi-tab coordination');
      this.setupMultiTabCoordination();
      
      // Multi-tab mode: use core idle detection (interrupts are handled by the core)
      this.debugLog('[IdleWarningDialog] Starting idle detection with multi-tab core');
      this.idleCore?.watch();
    } else {
      // Single-tab mode: use local timer
      this.debugLog('[IdleWarningDialog] Starting idle detection with local timer');
      this.resetIdleTimer();
    }
  }
  
  private setupMultiTabCoordination(): void {
    // Initialize core Idle class with built-in multi-tab support
    const idleTimeoutMs = this.idleTimeout || 900000;
    const warningTimeoutMs = this.warningTimeout || 60000;
    
    this.debugLog('[Multi-Tab] Creating Idle core with config:', {
      idleTimeout: idleTimeoutMs,
      warningTimeout: warningTimeoutMs,
      channelName: this.multiTabChannelName || 'idle-detection-channel'
    });
    
    this.idleCore = new Idle({
      idleTimeout: idleTimeoutMs,
      warningTimeout: warningTimeoutMs,
      idleName: this.multiTabChannelName || 'idle-detection-channel',
      enableDebugLogs: this.enableDebugLogs
    });
    
    // Set up interrupts (required for idle detection to work)
    const eventsString = this.activityEvents?.join(' ') || 'mousedown mousemove keypress scroll touchstart click';
    const documentInterruptSource = new DocumentInterruptSource(eventsString);
    this.idleCore.setInterrupts([documentInterruptSource]);
    
    // Set up multi-tab expiry
    this.multiTabExpiry = new MultiTabExpiry(this.multiTabChannelName || 'idle-detection-channel');
    this.idleCore.setExpiry(this.multiTabExpiry);
    
    // Listen to core idle events for multi-tab sync (now broadcasted automatically)
    this.idleCore.on(IdleEvent.IDLE_START, () => {
      this.debugLog('[Multi-Tab] Idle start event received');
      if (!this.isWarningShown()) {
        this.triggerIdle();
      }
    });
    
    this.idleCore.on(IdleEvent.WARNING_START, () => {
      this.debugLog('[Multi-Tab] Warning start event received');
      if (!this.isWarningShown()) {
        // For tabs receiving WARNING_START via broadcast, ensure they sync with shared expiry
        this.showWarningFromBroadcast();
      } else {
        // Already showing warning - sync countdown with shared expiry
        this.syncCountdownWithExpiry();
      }
    });
    
    this.idleCore.on(IdleEvent.TIMEOUT, () => {
      this.debugLog('[Multi-Tab] Timeout event received');
      this.handleTimeout();
    });
    
    this.idleCore.on(IdleEvent.IDLE_END, () => {
      this.debugLog('[Multi-Tab] Idle end event received', {
        isWarningShown: this.isWarningShown(),
        isIdle: this.isIdle
      });
      
      // Always close warning dialog when IDLE_END is received
      if (this.isWarningShown()) {
        this.debugLog('[Multi-Tab] Closing warning dialog - user activity detected');
        this.isWarningShown.set(false);
        this.warningEnd.emit();
        this.clearIdleTimers();
      }
      
      // Reset idle state
      if (this.isIdle) {
        this.isIdle = false;
        this.idleEnd.emit();
      }
    });
    
    // Start watching
    this.idleCore.watch();
  }
  


  private resetIdleTimer(): void {
    // Don't use local timers when multi-tab is enabled
    if (this.enableMultiTab && this.idleCore) {
      this.debugLog('[resetIdleTimer] Skipping - multi-tab mode is active');
      return;
    }
    
    // Clear existing timers
    this.clearIdleTimers();
    
    // Start new idle timer
    this.debugLog(`[resetIdleTimer] Starting idle timer for ${this.idleTimeout}ms`);
    this.idleTimer = setTimeout(() => {
      this.debugLog('[resetIdleTimer] Idle timeout reached - triggering idle');
      this.triggerIdle();
    }, this.idleTimeout);
  }

  private triggerIdle(): void {
    this.debugLog('[triggerIdle] User is now idle');
    this.isIdle = true;
    this.idleStart.emit();
    this.showWarning();
  }

  private showWarning(): void {
    this.debugLog('[showWarning] Showing warning dialog');
    this.isWarningShown.set(true);
    this.warningStart.emit();
    
    // Clear interrupts during warning to prevent mouse movement from triggering IDLE_END
    if (this.enableMultiTab && this.idleCore) {
      this.debugLog('[Multi-Tab] Clearing interrupts during warning dialog');
      this.idleCore.clearInterrupts();
    }
    
    // Initialize time remaining - use shared expiry if available for multi-tab sync
    let warningTime = this.warningTimeout || this.initialTimeRemaining || 30000;
    
    if (this.enableMultiTab && this.multiTabExpiry) {
      const sharedExpiry = this.multiTabExpiry.get();
      if (sharedExpiry) {
        const remainingTime = sharedExpiry.getTime() - Date.now();
        if (remainingTime > 0) {
          warningTime = remainingTime;
          this.debugLog('[Multi-Tab] Using shared expiry time:', { 
            sharedExpiry: sharedExpiry.toISOString(), 
            remainingTime: remainingTime 
          });
        }
      }
    }
    
    this.timeRemaining.set(warningTime);
    this.totalTime.set(this.warningTimeout || this.initialTimeRemaining || 30000);
    this.startCountdown();
    this.startPeriodicSync(); // Ensure tabs stay synchronized
    
    // Start warning timeout timer
    this.warningTimer = setTimeout(() => {
      this.handleTimeout();
    }, warningTime);

    // Focus first button for accessibility
    setTimeout(() => {
      const firstButton = document.querySelector('.btn-primary') as HTMLButtonElement;
      if (firstButton) {
        firstButton.focus();
      }
    }, 100);
  }

  /**
   * Show warning dialog when received via broadcast (other tab triggered it)
   * This ensures proper expiry synchronization for consistent countdown
   */
  private showWarningFromBroadcast(): void {
    this.debugLog('[Multi-Tab] Showing warning from broadcast - syncing with shared expiry');
    this.isWarningShown.set(true);
    this.warningStart.emit();
    
    // DON'T clear interrupts for tabs receiving via broadcast - they should still detect activity
    // Only the originating tab clears interrupts
    
    // Get shared expiry time for consistent countdown across all tabs
    let warningTime = this.warningTimeout || 30000;
    
    if (this.multiTabExpiry) {
      const sharedExpiry = this.multiTabExpiry.get();
      if (sharedExpiry) {
        const remainingTime = sharedExpiry.getTime() - Date.now();
        if (remainingTime > 0) {
          warningTime = remainingTime;
          this.debugLog('[Multi-Tab] Using shared expiry for broadcast warning:', { 
            sharedExpiry: sharedExpiry.toISOString(), 
            remainingTime: remainingTime 
          });
        } else {
          // Expiry already passed - shouldn't show warning
          this.debugLog('[Multi-Tab] Shared expiry already passed - not showing warning');
          this.isWarningShown.set(false);
          return;
        }
      } else {
        this.debugLog('[Multi-Tab] No shared expiry found for broadcast warning - using default timeout');
      }
    }
    
    this.timeRemaining.set(warningTime);
    this.totalTime.set(this.warningTimeout || 30000);
    this.startCountdown();
    this.startPeriodicSync(); // Ensure tabs stay synchronized

    // Focus first button for accessibility
    setTimeout(() => {
      const firstButton = document.querySelector('.btn-primary') as HTMLButtonElement;
      if (firstButton) {
        firstButton.focus();
      }
    }, 100);
  }

  /**
   * Sync countdown display with shared expiry for multi-tab coordination
   */
  private syncCountdownWithExpiry(): void {
    if (this.enableMultiTab && this.multiTabExpiry) {
      const sharedExpiry = this.multiTabExpiry.get();
      if (sharedExpiry) {
        const remainingTime = Math.max(0, sharedExpiry.getTime() - Date.now());
        const currentTime = this.timeRemaining();
        const drift = Math.abs(remainingTime - currentTime);
        
        // Sync if drift is more than 1 second
        if (drift > 1000) {
          this.debugLog('[Sync] Correcting countdown drift:', { 
            currentRemaining: currentTime,
            sharedRemaining: remainingTime,
            drift: drift,
            sharedExpiry: sharedExpiry.toISOString()
          });
          this.timeRemaining.set(remainingTime);
          // Force change detection for synced display
          this.cdr.detectChanges();
        }
      } else {
        this.debugLog('[Sync] No shared expiry available for sync');
      }
    }
  }

  /**
   * Start periodic sync to prevent countdown drift across tabs
   */
  private startPeriodicSync(): void {
    if (this.enableMultiTab && !this.syncTimer) {
      this.debugLog('[Sync] Starting periodic countdown sync');
      this.syncTimer = setInterval(() => {
        if (this.isWarningShown() && this.multiTabExpiry) {
          this.syncCountdownWithExpiry();
        }
      }, 2000); // Sync every 2 seconds to prevent drift
    }
  }

  /**
   * Stop periodic sync
   */
  private stopPeriodicSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      this.debugLog('[Sync] Stopped periodic countdown sync');
    }
  }

  private handleTimeout(): void {
    this.isWarningShown.set(false);
    this.sessionTimeout.emit();
    this.cleanup();
    
    // Call logout callback
    if (this.onLogoutCallback) {
      this.onLogoutCallback();
    }
  }

  private clearIdleTimers(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    if (this.throttleTimer) {
      clearTimeout(this.throttleTimer);
      this.throttleTimer = null;
    }
    this.stopPeriodicSync(); // Stop countdown synchronization
  }

  private handleActivity(event: Event): void {
    if (!this.enableIdleDetection) {
      return;
    }
    
    // Always emit activity detected for parent component
    this.activityDetected.emit(event);
    
    // Update last activity time
    this.lastActivity = Date.now();
    
    if (this.enableMultiTab && this.idleCore) {
      // Multi-tab mode: force reset even during warning state
      // This ensures user activity during warning closes the dialog
      this.debugLog('[Activity] Forcing core reset due to user activity during warning');
      this.idleCore.reset();
    } else {
      // Single-tab mode: reset local timer
      this.resetIdleTimer();
      
      // Close warning if showing
      if (this.isWarningShown()) {
        this.isWarningShown.set(false);
        this.warningEnd.emit();
      }
      
      if (this.isIdle) {
        this.isIdle = false;
        this.idleEnd.emit();
      }
    }
  }

  private cleanup(): void {
    this.clearIdleTimers();
    
    // Remove event listeners
    if (this.boundHandleActivity && this.activityEvents) {
      this.activityEvents.forEach(event => {
        document.removeEventListener(event, this.boundHandleActivity);
      });
    }
    
    // Cleanup core idle instance
    if (this.idleCore) {
      this.idleCore.stop();
      this.idleCore = undefined;
    }
    
    
    this.multiTabExpiry = undefined;
  }

  onExtendSession(): void {
    this.debugLog('Extend session clicked');
    
    // Update last activity time
    this.lastActivity = Date.now();
    
    // Restore interrupts before resetting (so idle detection can continue)
    if (this.enableMultiTab && this.idleCore) {
      this.debugLog('[Multi-Tab] Restoring interrupts and resetting idle timer');
      const eventsString = this.activityEvents?.join(' ') || 'mousedown mousemove keypress scroll touchstart click';
      const documentInterruptSource = new DocumentInterruptSource(eventsString);
      this.idleCore.setInterrupts([documentInterruptSource]);
      
      // Reset core idle timer (this will broadcast IDLE_END to all tabs automatically)
      this.idleCore.reset();
      // The IDLE_END event handler will close the dialog
    } else {
      // Single-tab mode - close dialog manually
      this.isWarningShown.set(false);
      this.isIdle = false;
      this.warningEnd.emit();
      this.clearIdleTimers();
      
      // Restart idle detection if enabled
      if (this.enableIdleDetection) {
        this.resetIdleTimer();
      }
    }
    
    // Priority 1: User-provided callback
    if (this.onExtendCallback) {
      this.debugLog('Calling user-provided onExtendCallback()');
      this.onExtendCallback();
    }
    // Priority 2: warningData callback (backward compatibility)
    else if (this.warningData?.onExtendSession) {
      this.debugLog('Calling warningData.onExtendSession()');
      this.warningData.onExtendSession();
    }
    
    // Always emit to parent component
    this.extendSession.emit();
    this.sessionExtended.emit();
  }


  onLogout(): void {
    this.debugLog('Logout clicked');
    
    // Hide warning and cleanup
    this.isWarningShown.set(false);
    this.cleanup();
    
    // Stop core idle timer (handles multi-tab coordination)
    if (this.enableMultiTab && this.idleCore) {
      this.idleCore.stop();
    }
    
    // Priority 1: User-provided callback
    if (this.onLogoutCallback) {
      this.debugLog('Calling user-provided onLogoutCallback()');
      this.onLogoutCallback();
    }
    // Priority 2: warningData callback (backward compatibility)
    else if (this.warningData?.onLogout) {
      this.debugLog('Calling warningData.onLogout()');
      this.warningData.onLogout();
    }
    
    // Always emit to parent component
    this.logout.emit();
  }

  onBackdropClick(event: Event): void {
    // Always prevent backdrop clicks from closing the dialog
    // This follows industry standards for critical session management dialogs
    event.preventDefault();
    event.stopPropagation();
    this.debugLog('Backdrop clicked - ignored for security (industry standard)');
  }

  onMouseDown(event: Event): void {
    // Prevent mouse events from interfering with idle detection
    event.stopPropagation();
  }


  formatTime(milliseconds: number): string {
    const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  // Custom actions support
  getSortedCustomActions(): CustomAction[] {
    if (!this.customActions) return [];
    return [...this.customActions].sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  
  onCustomAction(action: CustomAction): void {
    this.debugLog(`Custom action triggered: ${action.id}`);
    
    // Execute the callback
    try {
      action.callback();
    } catch (error) {
      if (this.enableDebugLogs) {
        console.error(`Error executing custom action ${action.id}:`, error);
      }
    }
    
    // Close dialog if specified
    if (action.closeDialog !== false) { // Default to true
      this.isWarningShown.set(false);
      this.warningEnd.emit();
      this.cleanup();
      
      // Reset idle detection if enabled and not multi-tab
      if (this.enableIdleDetection && !this.enableMultiTab) {
        this.resetIdleTimer();
      }
    }
  }

  /**
   * Temporarily disables idle detection and clears all active timers.
   * Use this during critical operations where user interruption should be prevented.
   * 
   * @example
   * ```typescript
   * // Disable idle detection during file upload
   * performFileUpload() {
   *   this.idleDialog.pause();
   *   this.uploadService.upload(file).finally(() => {
   *     this.idleDialog.resume(); // Re-enable when done
   *   });
   * }
   * ```
   * 
   * @public
   * @memberof IdleWarningDialogComponent
   */
  pause(): void {
    this.debugLog('Pause called - disabling idle detection');
    this.enableIdleDetection = false;
    this.clearIdleTimers();
    
    // Stop core idle detection in multi-tab mode
    if (this.enableMultiTab && this.idleCore) {
      this.debugLog('[Multi-Tab] Pausing core idle detection');
      this.idleCore.stop();
    }
  }

  /**
   * Re-enables idle detection and restarts the idle timer from the current moment.
   * If a warning dialog is currently shown, it will be closed immediately.
   * Works seamlessly with multi-tab coordination when enabled.
   * 
   * @example
   * ```typescript
   * // Resume idle detection after completing a task
   * completeTask() {
   *   this.taskService.complete().then(() => {
   *     this.idleDialog.resume(); // Restart idle detection
   *   });
   * }
   * ```
   * 
   * @public
   * @memberof IdleWarningDialogComponent
   */
  resume(): void {
    this.debugLog('Resume called - enabling idle detection');
    this.enableIdleDetection = true;
    
    // Reset idle state
    this.isIdle = false;
    this.lastActivity = Date.now();
    
    // Clear any existing timers
    this.clearIdleTimers();
    
    // Reset core idle timer if multi-tab is enabled
    if (this.enableMultiTab && this.idleCore) {
      this.debugLog('[Multi-Tab] Resuming idle detection via core');
      
      // Re-setup interrupts since stop() cleared them
      const eventsString = this.activityEvents?.join(' ') || 'mousedown mousemove keypress scroll touchstart click';
      const documentInterruptSource = new DocumentInterruptSource(eventsString);
      this.idleCore.setInterrupts([documentInterruptSource]);
      
      // Restart core idle detection
      this.idleCore.watch();
      // The IDLE_END event handler will close the dialog if needed
    } else {
      // Single-tab mode - close dialog manually
      if (this.isWarningShown()) {
        this.isWarningShown.set(false);
        this.warningEnd.emit();
      }
      
      // Start new idle timer for single-tab mode
      this.debugLog('[Single-Tab] Resuming idle detection with local timer');
      this.resetIdleTimer();
    }
  }

  /**
   * Completely resets the idle detection state and restarts the timer from scratch.
   * Closes any open warning dialog and clears all internal state.
   * Unlike resume(), this method resets everything to initial state.
   * Supports multi-tab coordination when enabled.
   * 
   * @example
   * ```typescript
   * // Reset after programmatic session extension
   * extendSession() {
   *   this.authService.refreshToken().then(() => {
   *     this.idleDialog.reset(); // Fresh start
   *   });
   * }
   * ```
   * 
   * @public
   * @memberof IdleWarningDialogComponent
   */
  reset(): void {
    
    this.isIdle = false;
    this.clearIdleTimers();
    
    if (this.enableIdleDetection) {
      // Reset core idle timer if multi-tab is enabled
      if (this.enableMultiTab && this.idleCore) {
        this.idleCore.reset();
        // The IDLE_END event handler will close the dialog
      } else {
        // Single-tab mode - close dialog manually
        this.isWarningShown.set(false);
        
        // Start new idle timer for single-tab mode
        this.resetIdleTimer();
      }
    } else {
      // If idle detection is disabled, just close dialog
      this.isWarningShown.set(false);
    }
  }

  /**
   * Returns the timestamp of the last detected user activity.
   * Useful for debugging idle detection behavior or implementing custom logic.
   * 
   * @example
   * ```typescript
   * // Check how long user has been inactive
   * checkInactivity() {
   *   const lastActivity = this.idleDialog.getLastActivity();
   *   const inactive = Date.now() - lastActivity.getTime();
   *   console.log(`User inactive for ${inactive}ms`);
   * }
   * ```
   * 
   * @returns {Date} The Date object representing when the last user activity was detected
   * @public
   * @memberof IdleWarningDialogComponent
   */
  getLastActivity(): Date {
    return new Date(this.lastActivity);
  }

  /**
   * Returns the number of milliseconds remaining until the user is considered idle.
   * Returns 0 if the user is already idle or if idle detection is disabled.
   * 
   * @example
   * ```typescript
   * // Display time until idle in UI
   * updateIdleStatus() {
   *   const timeLeft = this.idleDialog.getTimeUntilIdle();
   *   this.idleStatusMessage = `Idle in ${Math.round(timeLeft / 1000)} seconds`;
   * }
   * ```
   * 
   * @returns {number} Milliseconds until idle state, or 0 if already idle/disabled
   * @public
   * @memberof IdleWarningDialogComponent
   */
  getTimeUntilIdle(): number {
    if (!this.idleTimer || this.isIdle) return 0;
    const elapsed = Date.now() - this.lastActivity;
    return Math.max(0, (this.idleTimeout || 0) - elapsed);
  }

  getButtonClass(type: 'primary' | 'secondary'): string {
    const cssClasses = this.cssClasses();
    if (!cssClasses) return '';
    
    const baseClass = cssClasses.button || '';
    const specificClass = type === 'primary' ? 
      cssClasses.buttonPrimary || '' : 
      cssClasses.buttonSecondary || '';
    
    return `${baseClass} ${specificClass}`.trim();
  }
}