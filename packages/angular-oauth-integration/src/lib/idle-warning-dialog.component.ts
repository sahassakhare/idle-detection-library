import { Component, OnInit, OnDestroy, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil, BehaviorSubject, map } from 'rxjs';
import { IdleOAuthService } from './idle-oauth.service';
import { IdleState } from './store/idle.state';
import * as IdleSelectors from './store/idle.selectors';

@Component({
  selector: 'idle-warning-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showWarning$ | async" 
         [class]="getBackdropClasses()" 
         (click)="onBackdropClick($event)">
      <div [class]="getDialogClasses()" 
           [ngStyle]="customStyles"
           (click)="$event.stopPropagation()">
        <div [class]="headerClass">
          <h2 [class]="titleClass">{{ title$ | async }}</h2>
        </div>
        
        <div [class]="bodyClass">
          <p [class]="messageClass">{{ message$ | async }}</p>
          
          <div *ngIf="showCountdown" [class]="countdownClass">
            <span [class]="countdownLabelClass">Time remaining:</span>
            <span [class]="countdownTimeClass">{{ formatTime(remainingTime$ | async) }}</span>
          </div>
          
          <div *ngIf="showProgressBar" [class]="progressClass">
            <div 
              [class]="progressBarClass" 
              [style.width.%]="progressPercentage$ | async">
            </div>
          </div>
        </div>
        
        <div [class]="actionsClass">
          <button 
            type="button" 
            [class]="primaryButtonClass" 
            (click)="extendSession()"
            [attr.aria-label]="'Extend session'">
            {{ extendButtonText$ | async }}
          </button>
          <button 
            type="button" 
            [class]="secondaryButtonClass" 
            (click)="logoutNow()"
            [attr.aria-label]="'Logout now'">
            {{ logoutButtonText$ | async }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class IdleWarningDialogComponent implements OnInit, OnDestroy {
  // Input properties for customization
  @Input() dialogTitle?: string;
  @Input() dialogMessage?: string;
  @Input() extendButtonLabel?: string;
  @Input() logoutButtonLabel?: string;
  @Input() showProgressBar?: boolean = true;
  @Input() showCountdown?: boolean = true;
  @Input() autoClose?: boolean = false;
  @Input() theme?: 'default' | 'dark' | 'minimal' = 'default';
  @Input() size?: 'small' | 'medium' | 'large' = 'medium';
  @Input() backdropClose?: boolean = false;
  @Input() customStyles?: { [key: string]: string };
  
  // CSS class customization
  @Input() backdropClass?: string = 'idle-warning-backdrop';
  @Input() dialogClass?: string = 'idle-warning-dialog';
  @Input() headerClass?: string = 'idle-warning-header';
  @Input() bodyClass?: string = 'idle-warning-body';
  @Input() titleClass?: string = 'idle-warning-title';
  @Input() messageClass?: string = 'idle-warning-message';
  @Input() countdownClass?: string = 'idle-warning-countdown';
  @Input() countdownLabelClass?: string = 'countdown-label';
  @Input() countdownTimeClass?: string = 'countdown-time';
  @Input() progressClass?: string = 'idle-warning-progress';
  @Input() progressBarClass?: string = 'progress-bar';
  @Input() actionsClass?: string = 'idle-warning-actions';
  @Input() primaryButtonClass?: string = 'btn btn-primary';
  @Input() secondaryButtonClass?: string = 'btn btn-secondary';

  // NgRx Store observables (initialized in ngOnInit)
  remainingTime$!: Observable<number>;
  showWarning$!: Observable<boolean>;
  
  // Component state using BehaviorSubjects
  private totalWarningTimeSubject = new BehaviorSubject<number>(0);
  private titleSubject = new BehaviorSubject<string>('Session Timeout Warning');
  private messageSubject = new BehaviorSubject<string>('Your session will expire soon due to inactivity.');
  private extendButtonTextSubject = new BehaviorSubject<string>('Stay Logged In');
  private logoutButtonTextSubject = new BehaviorSubject<string>('Logout Now');

  // Observable state
  totalWarningTime$ = this.totalWarningTimeSubject.asObservable();
  title$ = this.titleSubject.asObservable();
  message$ = this.messageSubject.asObservable();
  extendButtonText$ = this.extendButtonTextSubject.asObservable();
  logoutButtonText$ = this.logoutButtonTextSubject.asObservable();

  // Computed observables (initialized in ngOnInit)
  progressPercentage$!: Observable<number>;

  private destroy$ = new Subject<void>();
  private idleOAuthService = inject(IdleOAuthService);
  private store = inject(Store<{ idle: IdleState }>);

  ngOnInit(): void {
    // Initialize store selectors
    this.remainingTime$ = this.store.select(IdleSelectors.selectRemainingTime);
    this.showWarning$ = this.store.select(IdleSelectors.selectShowWarning);
    
    // Initialize computed observables
    this.progressPercentage$ = this.remainingTime$.pipe(
      map(remaining => {
        const total = this.totalWarningTimeSubject.value;
        return total > 0 ? (remaining / total) * 100 : 0;
      })
    );
    
    // Apply custom configuration
    this.applyCustomConfiguration();
    
    // Set total warning time from service config
    this.totalWarningTimeSubject.next(Math.floor(this.getTotalWarningTime() / 1000));
    
    // Auto-close logic using subscription
    this.remainingTime$
      .pipe(takeUntil(this.destroy$))
      .subscribe(remainingTime => {
        if (this.autoClose && remainingTime <= 0) {
          this.logoutNow();
        }
      });
  }

  private applyCustomConfiguration(): void {
    // Update BehaviorSubjects with input values if provided
    if (this.dialogTitle !== undefined) {
      this.titleSubject.next(this.dialogTitle);
    }
    
    if (this.dialogMessage !== undefined) {
      this.messageSubject.next(this.dialogMessage);
    }
    
    if (this.extendButtonLabel !== undefined) {
      this.extendButtonTextSubject.next(this.extendButtonLabel);
    }
    
    if (this.logoutButtonLabel !== undefined) {
      this.logoutButtonTextSubject.next(this.logoutButtonLabel);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getTotalWarningTime(): number {
    // This should come from the service configuration
    // For now, we'll use a default or try to get it from the service
    return 2 * 60 * 1000; // 2 minutes default
  }

  formatTime(seconds: number | null): string {
    if (seconds === null || seconds === undefined || isNaN(seconds)) {
      return '00:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  extendSession(): void {
    this.idleOAuthService.extendSession();
  }

  logoutNow(): void {
    this.idleOAuthService.logoutNow();
  }

  onBackdropClick(_event: Event): void {
    if (this.backdropClose) {
      this.extendSession();
    }
  }

  getDialogClasses(): string {
    let classes = this.dialogClass || 'idle-warning-dialog';
    if (this.size) classes += ` size-${this.size}`;
    if (this.theme) classes += ` theme-${this.theme}`;
    return classes;
  }

  getBackdropClasses(): string {
    let classes = this.backdropClass || 'idle-warning-backdrop';
    if (this.theme) classes += ` theme-${this.theme}`;
    return classes;
  }
}