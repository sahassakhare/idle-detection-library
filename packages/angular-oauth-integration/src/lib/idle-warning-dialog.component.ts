import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
  computed,
  TemplateRef,
  ContentChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IdleWarningData, CustomAction } from './types';
import { Idle, MultiTabExpiry, IdleEvent } from '@idle-detection/core';

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
      (mousemove)="onMouseMove($event)"
    >
      <!-- Custom Template Support -->
      <ng-container *ngIf="customTemplate || anyTemplate || customTemplateRef; else defaultTemplate">
        <ng-container *ngTemplateOutlet="(customTemplate || anyTemplate || customTemplateRef)!; context: templateContext"></ng-container>
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
  @ContentChild(TemplateRef, { static: false }) anyTemplate?: TemplateRef<any>; // Fallback to any template
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
  
  // Idle detection configuration - makes this a complete solution
  @Input() idleTimeout?: number = 900000; // 15 minutes default
  @Input() warningTimeout?: number = 60000; // 1 minute warning default
  @Input() activityEvents?: string[] = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  @Input() enableIdleDetection?: boolean = true;
  @Input() throttleDelay?: number = 500; // Throttle activity events
  @Input() enableMultiTab?: boolean = true; // Enable multi-tab coordination
  @Input() multiTabChannelName?: string = 'idle-detection-channel'; // BroadcastChannel name
  
  // Callback functions provided by user
  @Input() onExtendCallback?: () => void;
  @Input() onLogoutCallback?: () => void;
  
  // Custom actions support
  @Input() customActions?: CustomAction[];
  @Input() hideDefaultActions?: boolean = false; // Hide the default Extend/Logout buttons
  @Input() showExtendButton?: boolean = true; // Show/hide extend button specifically
  @Input() showLogoutButton?: boolean = true; // Show/hide logout button specifically
  
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

  @Output() extendSession = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  
  // Additional outputs for idle detection events
  @Output() idleStart = new EventEmitter<void>();
  @Output() idleEnd = new EventEmitter<void>();
  @Output() warningStart = new EventEmitter<void>();
  @Output() warningEnd = new EventEmitter<void>();
  @Output() sessionTimeout = new EventEmitter<void>();
  @Output() sessionExtended = new EventEmitter<void>();
  @Output() activityDetected = new EventEmitter<Event>();

  private destroy$ = new Subject<void>();
  private countdownTimer?: any;
  
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

  ngOnInit(): void {
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
      this.setupIdleDetection();
    } else if (this.warningData) {
      // Backward compatibility - show immediately if warningData provided
      this.showWarning();
    }
  }

  private startCountdown(): void {
    this.countdownTimer = setInterval(() => {
      const currentTime = this.timeRemaining();
      if (currentTime <= 0) {
        if (this.autoClose) {
          this.onLogout();
        }
        return;
      }
      this.timeRemaining.set(currentTime - 1000);
    }, 1000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cleanup();
  }

  private setupIdleDetection(): void {
    // Setup multi-tab coordination
    if (this.enableMultiTab) {
      this.setupMultiTabCoordination();
    }
    
    // Create bound event handler
    this.boundHandleActivity = this.handleUserActivity.bind(this);
    
    // Add event listeners
    this.activityEvents?.forEach(event => {
      document.addEventListener(event, this.boundHandleActivity, { passive: true });
    });
    
    // Start idle timer only if not using multi-tab
    if (!this.enableMultiTab) {
      this.resetIdleTimer();
    }
  }
  
  private setupMultiTabCoordination(): void {
    // Initialize core Idle class with built-in multi-tab support
    this.idleCore = new Idle({
      idleTimeout: this.idleTimeout || 900000,
      warningTimeout: this.warningTimeout || 60000,
      idleName: this.multiTabChannelName || 'idle-detection-channel'
    });
    
    // Set up multi-tab expiry
    this.multiTabExpiry = new MultiTabExpiry(this.multiTabChannelName || 'idle-detection-channel');
    this.idleCore.setExpiry(this.multiTabExpiry);
    
    // Listen to core idle events for multi-tab sync (now broadcasted automatically)
    this.idleCore.on(IdleEvent.IDLE_START, () => {
      console.log('[Multi-Tab] Idle start event received');
      if (!this.isWarningShown()) {
        this.triggerIdle();
      }
    });
    
    this.idleCore.on(IdleEvent.WARNING_START, () => {
      console.log('[Multi-Tab] Warning start event received');
      if (!this.isWarningShown()) {
        this.showWarning();
      }
    });
    
    this.idleCore.on(IdleEvent.TIMEOUT, () => {
      console.log('[Multi-Tab] Timeout event received');
      this.handleTimeout();
    });
    
    this.idleCore.on(IdleEvent.IDLE_END, () => {
      console.log('[Multi-Tab] Idle end event received - closing warning dialog');
      if (this.isWarningShown()) {
        this.isWarningShown.set(false);
        this.isIdle = false;
        this.warningEnd.emit();
        this.idleEnd.emit();
        this.clearIdleTimers();
        // Don't reset local timer - let core handle the timing
      }
    });
    
    // Start watching
    this.idleCore.watch();
  }
  

  private handleUserActivity = (event: Event) => {
    // Throttle activity events
    if (this.throttleTimer) return;
    
    this.throttleTimer = setTimeout(() => {
      this.throttleTimer = null;
    }, this.throttleDelay);
    
    // Always reset on user activity, even if warning is showing
    if (this.enableIdleDetection) {
      this.lastActivity = Date.now();
      this.activityDetected.emit(event);
      
      // Reset core idle timer (handles multi-tab coordination automatically)
      if (this.enableMultiTab && this.idleCore) {
        console.log('[Multi-Tab] Resetting idle timer due to activity');
        this.idleCore.reset();
        // When using multi-tab, don't use local timers
        return;
      }
      
      // Only use local timers when multi-tab is disabled
      // Hide warning if showing
      if (this.isWarningShown()) {
        this.isWarningShown.set(false);
        this.warningEnd.emit();
      }
      
      if (this.isIdle) {
        this.isIdle = false;
        this.idleEnd.emit();
      }
      
      this.clearIdleTimers();
      this.resetIdleTimer();
    }
  };

  private resetIdleTimer(): void {
    // Don't use local timers when multi-tab is enabled
    if (this.enableMultiTab && this.idleCore) {
      return;
    }
    
    // Clear existing timers
    this.clearIdleTimers();
    
    // Start new idle timer
    this.idleTimer = setTimeout(() => {
      this.triggerIdle();
    }, this.idleTimeout);
  }

  private triggerIdle(): void {
    this.isIdle = true;
    this.idleStart.emit();
    this.showWarning();
  }

  private showWarning(): void {
    this.isWarningShown.set(true);
    this.warningStart.emit();
    
    // Initialize time remaining and start countdown
    const warningTime = this.warningTimeout || this.initialTimeRemaining || 30000;
    this.timeRemaining.set(warningTime);
    this.totalTime.set(warningTime);
    this.startCountdown();
    
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
    console.log('Extend session clicked');
    
    // Hide warning and reset idle detection
    this.isWarningShown.set(false);
    this.isIdle = false;
    this.warningEnd.emit();
    
    // Reset core idle timer (this will broadcast IDLE_END to all tabs automatically)
    if (this.enableMultiTab && this.idleCore) {
      console.log('[Multi-Tab] Session extended - resetting idle timer and broadcasting to all tabs');
      this.idleCore.reset();
      // Clear timers but don't restart - core will handle it
      this.clearIdleTimers();
    } else {
      // Only use local timers when multi-tab is disabled
      this.clearIdleTimers();
      
      // Restart idle detection if enabled
      if (this.enableIdleDetection) {
        this.resetIdleTimer();
      }
    }
    
    // Priority 1: User-provided callback
    if (this.onExtendCallback) {
      console.log('Calling user-provided onExtendCallback()');
      this.onExtendCallback();
    }
    // Priority 2: warningData callback (backward compatibility)
    else if (this.warningData?.onExtendSession) {
      console.log('Calling warningData.onExtendSession()');
      this.warningData.onExtendSession();
    }
    
    // Always emit to parent component
    this.extendSession.emit();
    this.sessionExtended.emit();
  }

  onLogout(): void {
    console.log('Logout clicked');
    
    // Hide warning and cleanup
    this.isWarningShown.set(false);
    this.cleanup();
    
    // Stop core idle timer (handles multi-tab coordination)
    if (this.enableMultiTab && this.idleCore) {
      this.idleCore.stop();
    }
    
    // Priority 1: User-provided callback
    if (this.onLogoutCallback) {
      console.log('Calling user-provided onLogoutCallback()');
      this.onLogoutCallback();
    }
    // Priority 2: warningData callback (backward compatibility)
    else if (this.warningData?.onLogout) {
      console.log('Calling warningData.onLogout()');
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
    console.log('Backdrop clicked - ignored for security (industry standard)');
  }

  onMouseDown(event: Event): void {
    // Prevent mouse events from interfering with idle detection
    event.stopPropagation();
  }

  onMouseMove(event: Event): void {
    // Prevent mouse movement from triggering idle detection reset
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
    console.log(`Custom action triggered: ${action.id}`);
    
    // Execute the callback
    try {
      action.callback();
    } catch (error) {
      console.error(`Error executing custom action ${action.id}:`, error);
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

  // Public methods for programmatic control
  pause(): void {
    this.enableIdleDetection = false;
    this.clearIdleTimers();
  }

  resume(): void {
    this.enableIdleDetection = true;
    if (!this.isWarningShown()) {
      this.resetIdleTimer();
    }
  }

  reset(): void {
    this.isWarningShown.set(false);
    this.isIdle = false;
    this.clearIdleTimers();
    if (this.enableIdleDetection) {
      this.resetIdleTimer();
    }
  }

  getLastActivity(): Date {
    return new Date(this.lastActivity);
  }

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