import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdleWarningDialogComponent } from './idle-warning-dialog.component';

@Component({
  selector: 'idle-detection-wrapper',
  standalone: true,
  imports: [CommonModule, IdleWarningDialogComponent],
  template: `
    <!-- User's application content -->
    <ng-content></ng-content>
    
    <!-- Idle Warning Dialog -->
    <idle-warning-dialog 
      *ngIf="showWarning"
      [initialTimeRemaining]="warningTimeout"
      [onExtendCallback]="handleExtend"
      [onLogoutCallback]="handleLogout"
      [dialogTitle]="dialogTitle"
      [dialogMessage]="dialogMessage"
      [extendButtonText]="extendButtonText"
      [logoutButtonText]="logoutButtonText"
      [showProgressBar]="showProgressBar"
      [showCountdown]="showCountdown"
      [theme]="theme"
      [size]="size"
      [customStyles]="customStyles">
    </idle-warning-dialog>
  `
})
export class IdleDetectionWrapperComponent implements OnInit, OnDestroy {
  // Configuration inputs
  @Input() idleTimeout: number = 900000; // 15 minutes default
  @Input() warningTimeout: number = 60000; // 1 minute warning default
  @Input() activityEvents: string[] = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  @Input() enableIdleDetection: boolean = true;
  @Input() detectOnWindowBlur: boolean = false;
  @Input() throttleDelay: number = 500; // Throttle activity events
  
  // Dialog customization inputs
  @Input() dialogTitle: string = 'Session Timeout Warning';
  @Input() dialogMessage: string = 'Your session is about to expire due to inactivity.';
  @Input() extendButtonText: string = 'Extend Session';
  @Input() logoutButtonText: string = 'Logout';
  @Input() showProgressBar: boolean = true;
  @Input() showCountdown: boolean = true;
  @Input() theme: 'default' | 'dark' | 'minimal' = 'default';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() customStyles?: { [key: string]: string };
  
  // Outputs
  @Output() idleStart = new EventEmitter<void>();
  @Output() idleEnd = new EventEmitter<void>();
  @Output() warningStart = new EventEmitter<void>();
  @Output() warningEnd = new EventEmitter<void>();
  @Output() sessionExtended = new EventEmitter<void>();
  @Output() sessionTimeout = new EventEmitter<void>();
  @Output() activityDetected = new EventEmitter<Event>();
  
  // State
  showWarning = false;
  isIdle = false;
  
  private idleTimer?: any;
  private warningTimer?: any;
  private lastActivity: number = Date.now();
  private throttleTimer?: any;
  private boundHandleActivity: any;
  
  ngOnInit() {
    if (this.enableIdleDetection) {
      this.setupIdleDetection();
    }
  }
  
  ngOnDestroy() {
    this.cleanup();
  }
  
  private setupIdleDetection() {
    // Create bound event handler
    this.boundHandleActivity = this.handleUserActivity.bind(this);
    
    // Add event listeners
    this.activityEvents.forEach(event => {
      document.addEventListener(event, this.boundHandleActivity, { passive: true });
    });
    
    // Optional: Detect window blur/focus
    if (this.detectOnWindowBlur) {
      window.addEventListener('blur', this.handleWindowBlur.bind(this));
      window.addEventListener('focus', this.boundHandleActivity);
    }
    
    // Start idle timer
    this.resetIdleTimer();
  }
  
  private handleUserActivity = (event: Event) => {
    // Throttle activity events
    if (this.throttleTimer) return;
    
    this.throttleTimer = setTimeout(() => {
      this.throttleTimer = null;
    }, this.throttleDelay);
    
    // Don't reset if warning is already showing
    if (!this.showWarning && this.enableIdleDetection) {
      this.lastActivity = Date.now();
      this.activityDetected.emit(event);
      
      if (this.isIdle) {
        this.isIdle = false;
        this.idleEnd.emit();
      }
      
      this.resetIdleTimer();
    }
  };
  
  private handleWindowBlur = () => {
    // Optionally pause idle detection when window loses focus
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }
  };
  
  private resetIdleTimer() {
    // Clear existing timers
    this.clearTimers();
    
    // Start new idle timer
    this.idleTimer = setTimeout(() => {
      this.triggerIdle();
    }, this.idleTimeout);
  }
  
  private triggerIdle() {
    this.isIdle = true;
    this.showWarning = true;
    this.idleStart.emit();
    this.warningStart.emit();
    
    // Start warning countdown timer
    this.warningTimer = setTimeout(() => {
      this.handleTimeout();
    }, this.warningTimeout);
  }
  
  private handleTimeout() {
    this.showWarning = false;
    this.sessionTimeout.emit();
    this.cleanup();
  }
  
  // Callbacks for dialog
  handleExtend = () => {
    this.showWarning = false;
    this.isIdle = false;
    this.warningEnd.emit();
    this.sessionExtended.emit();
    this.resetIdleTimer();
  };
  
  handleLogout = () => {
    this.showWarning = false;
    this.sessionTimeout.emit();
    this.cleanup();
  };
  
  // Public methods
  pause() {
    this.enableIdleDetection = false;
    this.clearTimers();
  }
  
  resume() {
    this.enableIdleDetection = true;
    this.resetIdleTimer();
  }
  
  reset() {
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
    return Math.max(0, this.idleTimeout - elapsed);
  }
  
  // Cleanup
  private clearTimers() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    if (this.throttleTimer) {
      clearTimeout(this.throttleTimer);
      this.throttleTimer = null;
    }
  }
  
  private cleanup() {
    this.clearTimers();
    
    // Remove event listeners
    if (this.boundHandleActivity) {
      this.activityEvents.forEach(event => {
        document.removeEventListener(event, this.boundHandleActivity);
      });
      
      if (this.detectOnWindowBlur) {
        window.removeEventListener('blur', this.handleWindowBlur);
        window.removeEventListener('focus', this.boundHandleActivity);
      }
    }
  }
}