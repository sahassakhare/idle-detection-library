import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, timer } from 'rxjs';
import { takeUntil, map, startWith } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { IdleWarningData } from './types';
import { selectTimeRemaining, selectIsWarning } from './store/idle.selectors';

@Component({
  selector: 'idle-warning-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
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
          <button 
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
            type="button"
            [class]="secondaryButtonClass"
            (click)="onLogout()"
            (mousedown)="$event.stopPropagation()"
            [attr.aria-label]="displayLogoutLabel()"
            #logoutButton
          >
            {{ displayLogoutLabel() }}
          </button>
        </div>
      </div>
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
  @Input() backdropClose?: boolean = false;
  @Input() customStyles?: { [key: string]: string };
  
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

  private destroy$ = new Subject<void>();
  private store = inject(Store);
  
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

  ngOnInit(): void {
    if (this.warningData) {
      this.cssClasses.set(this.warningData.cssClasses);
      // Set total time for progress calculation
      this.totalTime.set(this.warningData.timeRemaining || 30000);
    }
    
    // Subscribe to timeRemaining updates from the store
    this.store.select(selectTimeRemaining).pipe(
      takeUntil(this.destroy$)
    ).subscribe(remaining => {
      this.timeRemaining.set(remaining);
      if (remaining <= 0 && this.autoClose) {
        this.onLogout();
      }
    });
    
    // Subscribe to warning state to auto-close dialog
    this.store.select(selectIsWarning).pipe(
      takeUntil(this.destroy$)
    ).subscribe(isWarning => {
      if (!isWarning) {
        // Warning ended, component should be hidden by parent
      }
    });

    // Focus first button for accessibility
    setTimeout(() => {
      const firstButton = document.querySelector('.btn-primary') as HTMLButtonElement;
      if (firstButton) {
        firstButton.focus();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onExtendSession(): void {
    console.log('🎯 Extend session clicked');
    
    // Call service method first (most important)
    if (this.warningData?.onExtendSession) {
      console.log('🔄 Calling warningData.onExtendSession()');
      this.warningData.onExtendSession();
    } else {
      console.log('⚠️ WARNING: warningData.onExtendSession is not available');
    }
    
    // Then emit to parent component
    this.extendSession.emit();
  }

  onLogout(): void {
    console.log('🚪 Logout clicked');
    this.logout.emit();
    if (this.warningData?.onLogout) {
      this.warningData.onLogout();
    }
  }

  onBackdropClick(event: Event): void {
    if (this.backdropClose) {
      event.preventDefault();
      event.stopPropagation();
      this.onLogout();
    }
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