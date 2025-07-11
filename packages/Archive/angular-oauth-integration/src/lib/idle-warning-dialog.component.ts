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
      class="idle-warning-overlay"
      [class]="cssClasses()?.overlay || 'idle-warning-overlay'"
      role="dialog"
      aria-modal="true"
      aria-labelledby="idle-warning-title"
      aria-describedby="idle-warning-message"
    >
      <div 
        class="idle-warning-dialog"
        [class]="cssClasses()?.dialog || 'idle-warning-dialog'"
      >
        <h2 
          id="idle-warning-title"
          class="idle-warning-title"
          [class]="cssClasses()?.title || 'idle-warning-title'"
        >
          {{ title() }}
        </h2>
        
        <div 
          id="idle-warning-message"
          class="idle-warning-message"
          [class]="cssClasses()?.message || 'idle-warning-message'"
        >
          <p>{{ message() }}</p>
          <div class="idle-warning-timer" aria-live="polite">
            {{ formatTime(timeRemaining()) }}
          </div>
        </div>
        
        <div class="idle-warning-actions">
          <button 
            type="button"
            class="idle-warning-button idle-warning-button-primary"
            [class]="getButtonClass('primary')"
            (click)="onExtendSession()"
            [attr.aria-label]="extendButtonLabel()"
          >
            {{ extendButtonText() }}
          </button>
          
          <button 
            type="button"
            class="idle-warning-button idle-warning-button-secondary"
            [class]="getButtonClass('secondary')"
            (click)="onLogout()"
            [attr.aria-label]="logoutButtonLabel()"
          >
            {{ logoutButtonText() }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
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
    }

    .idle-warning-dialog {
      background: white;
      border-radius: 8px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .idle-warning-title {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }

    .idle-warning-message {
      margin: 0 0 24px 0;
      color: #4b5563;
      line-height: 1.5;
    }

    .idle-warning-timer {
      font-size: 24px;
      font-weight: 600;
      color: #dc2626;
      text-align: center;
      margin: 16px 0;
    }

    .idle-warning-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .idle-warning-button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .idle-warning-button-primary {
      background: #3b82f6;
      color: white;
    }

    .idle-warning-button-primary:hover {
      background: #2563eb;
    }

    .idle-warning-button-secondary {
      background: #6b7280;
      color: white;
    }

    .idle-warning-button-secondary:hover {
      background: #4b5563;
    }

    .idle-warning-button:focus {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }
  `]
})
export class IdleWarningDialogComponent implements OnInit, OnDestroy {
  @Input() warningData!: IdleWarningData;
  @Input() set titleText(value: string) { this.title.set(value); }
  @Input() set messageText(value: string) { this.message.set(value); }
  @Input() set extendText(value: string) { this.extendButtonText.set(value); }
  @Input() set logoutText(value: string) { this.logoutButtonText.set(value); }
  @Input() set extendLabel(value: string) { this.extendButtonLabel.set(value); }
  @Input() set logoutLabel(value: string) { this.logoutButtonLabel.set(value); }

  @Output() extendSession = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  private destroy$ = new Subject<void>();
  private store = inject(Store);
  
  timeRemaining = signal(0);
  cssClasses = signal<any>(null);
  
  title = signal('Session Timeout Warning');
  message = signal('Your session is about to expire due to inactivity.');
  extendButtonText = signal('Extend Session');
  logoutButtonText = signal('Logout');
  extendButtonLabel = signal('Extend your session to continue');
  logoutButtonLabel = signal('Logout and end your session');

  ngOnInit(): void {
    if (this.warningData) {
      this.cssClasses.set(this.warningData.cssClasses);
    }
    
    // Subscribe to timeRemaining updates from the store
    this.store.select(selectTimeRemaining).pipe(
      takeUntil(this.destroy$)
    ).subscribe(remaining => {
      this.timeRemaining.set(remaining);
      if (remaining <= 0) {
        this.onLogout();
      }
    });
    
    // Also subscribe to warning state to auto-close dialog
    this.store.select(selectIsWarning).pipe(
      takeUntil(this.destroy$)
    ).subscribe(isWarning => {
      if (!isWarning) {
        // Warning ended, component should be hidden by parent
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onExtendSession(): void {
    this.extendSession.emit();
    if (this.warningData?.onExtendSession) {
      this.warningData.onExtendSession();
    }
  }

  onLogout(): void {
    this.logout.emit();
    if (this.warningData?.onLogout) {
      this.warningData.onLogout();
    }
  }

  formatTime(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
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