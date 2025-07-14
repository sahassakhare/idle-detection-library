# Angular Integration Examples

This document provides comprehensive examples for implementing idle detection in Angular applications using the Angular OAuth Integration library.

## Table of Contents

- [Basic Integration](#basic-integration)
- [Advanced Configuration](#advanced-configuration)
- [Custom Components](#custom-components)
- [Real-World Applications](#real-world-applications)
- [Testing Examples](#testing-examples)
- [Migration Examples](#migration-examples)

## Basic Integration

### Minimal Setup

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { AppComponent } from './app.component';
import { idleReducer, IdleEffects } from '@idle-detection/angular-oauth-integration';

bootstrapApplication(AppComponent, {
  providers: [
    provideStore({
      idle: idleReducer
    }),
    provideEffects([IdleEffects])
  ]
});
```

```typescript
// app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { 
  IdleOAuthService, 
  IdleWarningDialogComponent 
} from '@idle-detection/angular-oauth-integration';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IdleWarningDialogComponent],
  template: `
    <div class="app">
      <h1>My Angular App</h1>
      
      <!-- Warning Dialog -->
      <idle-warning-dialog 
        *ngIf="showWarning"
        [warningData]="warningData"
        (extendSession)="onExtendSession()"
        (logout)="onLogout()">
      </idle-warning-dialog>
    </div>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  showWarning = false;
  warningData: any;

  constructor(private idleService: IdleOAuthService) {}

  ngOnInit(): void {
    // Initialize idle detection
    this.idleService.initialize({
      idleTimeout: 900000,    // 15 minutes
      warningTimeout: 180000  // 3 minutes
    });

    this.idleService.start();

    // Subscribe to warning state
    this.idleService.isWarning$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isWarning => {
      this.showWarning = isWarning;
      if (isWarning) {
        this.warningData = this.idleService.getCurrentWarningData();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.idleService.stop();
  }

  onExtendSession(): void {
    this.idleService.extendSession();
    this.showWarning = false;
  }

  onLogout(): void {
    this.idleService.logout();
    this.showWarning = false;
  }
}
```

### Status Indicator Component

```typescript
// idle-status.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IdleOAuthService, 
  IdleStatus 
} from '@idle-detection/angular-oauth-integration';

@Component({
  selector: 'app-idle-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="idle-status" [class]="statusClass">
      <div class="status-indicator" [class]="indicatorClass"></div>
      <div class="status-text">
        <span class="status-label">{{ statusText }}</span>
        <span class="time-info" *ngIf="timeRemaining$ | async as timeRemaining">
          {{ formatTime(timeRemaining) }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    .idle-status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .status-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .status-label {
      font-weight: 500;
    }

    .time-info {
      font-size: 12px;
      opacity: 0.7;
    }

    /* Status variants */
    .status-active {
      background: #d4edda;
      color: #155724;
    }

    .status-active .status-indicator {
      background: #28a745;
    }

    .status-warning {
      background: #fff3cd;
      color: #856404;
      animation: pulse 2s infinite;
    }

    .status-warning .status-indicator {
      background: #ffc107;
    }

    .status-idle {
      background: #f8d7da;
      color: #721c24;
    }

    .status-idle .status-indicator {
      background: #dc3545;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `]
})
export class IdleStatusComponent {
  idleStatus$ = this.idleService.idleStatus$;
  timeRemaining$ = this.idleService.timeRemaining$;

  constructor(private idleService: IdleOAuthService) {}

  get statusClass(): string {
    let status: IdleStatus;
    this.idleStatus$.subscribe(s => status = s);
    return `status-${status}`;
  }

  get statusText(): string {
    let status: IdleStatus;
    this.idleStatus$.subscribe(s => status = s);
    
    switch (status) {
      case IdleStatus.ACTIVE:
        return 'Active';
      case IdleStatus.WARNING:
        return 'Session Expiring';
      case IdleStatus.IDLE:
        return 'Session Expired';
      default:
        return 'Unknown';
    }
  }

  get indicatorClass(): string {
    return this.statusClass.replace('status-', 'indicator-');
  }

  formatTime(ms: number): string {
    if (!ms) return '';
    
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }
}
```

## Advanced Configuration

### Enterprise Configuration

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { 
  idleReducer, 
  IdleEffects, 
  IdleOAuthConfig 
} from '@idle-detection/angular-oauth-integration';
import { environment } from './environments/environment';

// Enterprise idle configuration
export const ENTERPRISE_IDLE_CONFIG: IdleOAuthConfig = {
  // Timeouts
  idleTimeout: 1800000,      // 30 minutes
  warningTimeout: 300000,    // 5 minutes warning
  
  // OAuth settings
  autoRefreshToken: true,
  refreshThreshold: 600000,  // Refresh 10 minutes before expiry
  
  // Multi-tab coordination
  multiTabCoordination: true,
  
  // Custom styling
  customCssClasses: {
    dialog: 'enterprise-warning-dialog',
    title: 'enterprise-warning-title',
    message: 'enterprise-warning-message',
    buttons: 'enterprise-warning-buttons'
  },
  
  // Debug (only in development)
  debug: !environment.production
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideStore({
      idle: idleReducer
    }),
    provideEffects([IdleEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: environment.production
    })
  ]
};
```

```typescript
// enterprise-app.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, map, distinctUntilChanged } from 'rxjs/operators';
import { 
  IdleOAuthService, 
  IdleWarningDialogComponent,
  IdleStatus 
} from '@idle-detection/angular-oauth-integration';
import { ENTERPRISE_IDLE_CONFIG } from './app.config';
import { NotificationService } from './services/notification.service';
import { AuditService } from './services/audit.service';

@Component({
  selector: 'app-enterprise',
  standalone: true,
  imports: [CommonModule, IdleWarningDialogComponent],
  template: `
    <div class="enterprise-app" [class.app--idle]="isIdle$ | async">
      <!-- Header with idle status -->
      <header class="app-header">
        <div class="header-left">
          <h1>Enterprise Application</h1>
        </div>
        <div class="header-right">
          <app-idle-status></app-idle-status>
          <div class="user-info">
            {{ currentUser?.name }}
          </div>
        </div>
      </header>

      <!-- Main content -->
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>

      <!-- Global idle warning -->
      <idle-warning-dialog 
        *ngIf="showWarning"
        [warningData]="warningData"
        theme="dark"
        size="large"
        titleText="🔒 Security Notice"
        messageText="Your session will expire due to inactivity for security compliance."
        extendText="Continue Working"
        logoutText="Secure Logout"
        [showProgressBar]="true"
        [showCountdown]="true"
        [customStyles]="{
          'border': '2px solid #007bff',
          'box-shadow': '0 8px 32px rgba(0,0,0,0.3)'
        }"
        (extendSession)="onExtendSession()"
        (logout)="onSecureLogout()">
      </idle-warning-dialog>

      <!-- Idle overlay for security -->
      <div *ngIf="isIdle$ | async" class="security-overlay">
        <div class="security-message">
          <div class="security-icon">🔒</div>
          <h2>Session Secured</h2>
          <p>Your session has been secured due to inactivity.</p>
          <p>Please authenticate again to continue.</p>
          <button (click)="redirectToLogin()" class="btn btn-primary">
            Authenticate
          </button>
        </div>
      </div>

      <!-- Toast notifications -->
      <div class="toast-container">
        <div *ngFor="let toast of notifications" 
             class="toast" 
             [class]="'toast--' + toast.type">
          {{ toast.message }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .enterprise-app {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .app--idle {
      filter: blur(3px);
      pointer-events: none;
    }

    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-info {
      font-size: 14px;
      opacity: 0.9;
    }

    .app-main {
      flex: 1;
      padding: 2rem;
      background: #f8f9fa;
    }

    .security-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.9) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }

    .security-message {
      background: white;
      padding: 3rem;
      border-radius: 16px;
      text-align: center;
      max-width: 400px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }

    .security-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background: #0056b3;
      transform: translateY(-2px);
    }

    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
    }

    .toast {
      background: white;
      padding: 1rem;
      margin-bottom: 0.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border-left: 4px solid;
      animation: slideIn 0.3s ease;
    }

    .toast--info { border-left-color: #007bff; }
    .toast--warning { border-left-color: #ffc107; }
    .toast--error { border-left-color: #dc3545; }
    .toast--success { border-left-color: #28a745; }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class EnterpriseAppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private auditService = inject(AuditService);

  // State
  showWarning = false;
  warningData: any;
  notifications: any[] = [];
  currentUser = { name: 'John Doe' }; // Mock user

  // Observables
  isIdle$ = this.idleService.isIdle$;
  
  constructor(private idleService: IdleOAuthService) {}

  ngOnInit(): void {
    this.initializeIdleDetection();
    this.setupIdleStateSubscriptions();
    this.setupNotifications();
    this.auditService.logEvent('session_started', { timestamp: Date.now() });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.idleService.stop();
    this.auditService.logEvent('session_ended', { timestamp: Date.now() });
  }

  private initializeIdleDetection(): void {
    try {
      this.idleService.initialize(ENTERPRISE_IDLE_CONFIG);
      this.idleService.start();
      
      this.showNotification('Idle detection initialized', 'info');
    } catch (error) {
      console.error('Failed to initialize idle detection:', error);
      this.showNotification('Failed to initialize session monitoring', 'error');
    }
  }

  private setupIdleStateSubscriptions(): void {
    // Warning state subscription
    this.idleService.isWarning$.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged()
    ).subscribe(isWarning => {
      this.showWarning = isWarning;
      
      if (isWarning) {
        this.warningData = this.idleService.getCurrentWarningData();
        this.auditService.logEvent('idle_warning_shown', { 
          timestamp: Date.now(),
          timeRemaining: this.warningData?.timeRemaining 
        });
        this.showNotification('Session will expire soon', 'warning');
      } else {
        this.auditService.logEvent('idle_warning_dismissed', { timestamp: Date.now() });
      }
    });

    // Idle state subscription
    this.isIdle$.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged()
    ).subscribe(isIdle => {
      if (isIdle) {
        this.auditService.logEvent('session_expired', { 
          timestamp: Date.now(),
          reason: 'idle_timeout'
        });
        this.showNotification('Session expired due to inactivity', 'error');
      }
    });

    // Combined state monitoring for analytics
    combineLatest([
      this.idleService.idleStatus$,
      this.idleService.timeRemaining$,
      this.idleService.lastActivity$
    ]).pipe(
      takeUntil(this.destroy$),
      map(([status, timeRemaining, lastActivity]) => ({
        status, timeRemaining, lastActivity, timestamp: Date.now()
      }))
    ).subscribe(state => {
      // Send analytics data
      this.sendAnalytics(state);
    });
  }

  private setupNotifications(): void {
    this.notificationService.notifications$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(notification => {
      this.notifications.push(notification);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        this.removeNotification(notification);
      }, 5000);
    });
  }

  onExtendSession(): void {
    this.auditService.logEvent('session_extended', { 
      timestamp: Date.now(),
      method: 'user_action'
    });
    
    this.idleService.extendSession();
    this.showWarning = false;
    this.showNotification('Session extended successfully', 'success');
  }

  onSecureLogout(): void {
    this.auditService.logEvent('user_logout', { 
      timestamp: Date.now(),
      method: 'secure_logout_from_warning'
    });
    
    this.performSecureLogout();
  }

  redirectToLogin(): void {
    this.performSecureLogout();
  }

  private performSecureLogout(): void {
    // Clear sensitive data
    this.clearSensitiveData();
    
    // Stop idle detection
    this.idleService.logout();
    
    // Redirect to login with security flag
    this.router.navigate(['/login'], { 
      queryParams: { reason: 'security_timeout' }
    });
  }

  private clearSensitiveData(): void {
    // Clear localStorage
    localStorage.removeItem('sensitive_data');
    localStorage.removeItem('user_preferences');
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear any cached data
    // ... application-specific cleanup
  }

  private showNotification(message: string, type: 'info' | 'warning' | 'error' | 'success'): void {
    this.notificationService.show(message, type);
  }

  private removeNotification(notification: any): void {
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
  }

  private sendAnalytics(state: any): void {
    // Send to analytics service
    console.log('Analytics:', state);
  }
}
```

### Multi-Environment Configuration

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  idleConfig: {
    idleTimeout: 300000,     // 5 minutes for development
    warningTimeout: 60000,   // 1 minute warning
    debug: true
  }
};
```

```typescript
// environments/environment.prod.ts
export const environment = {
  production: true,
  idleConfig: {
    idleTimeout: 1800000,    // 30 minutes for production
    warningTimeout: 300000,  // 5 minutes warning
    debug: false
  }
};
```

```typescript
// config.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { IdleOAuthConfig } from '@idle-detection/angular-oauth-integration';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  getIdleConfig(): IdleOAuthConfig {
    const baseConfig = environment.idleConfig;
    
    // Add role-based configurations
    const userRole = this.getCurrentUserRole();
    
    switch (userRole) {
      case 'admin':
        return {
          ...baseConfig,
          idleTimeout: baseConfig.idleTimeout * 2, // Admins get longer sessions
          autoRefreshToken: true,
          multiTabCoordination: true
        };
        
      case 'user':
        return {
          ...baseConfig,
          autoRefreshToken: true
        };
        
      case 'guest':
        return {
          ...baseConfig,
          idleTimeout: baseConfig.idleTimeout * 0.5, // Guests get shorter sessions
          autoRefreshToken: false
        };
        
      default:
        return baseConfig;
    }
  }
  
  private getCurrentUserRole(): string {
    // Implement role detection logic
    return 'user';
  }
}
```

## Custom Components

### Advanced Warning Dialog

```typescript
// advanced-warning-dialog.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, interval } from 'rxjs';
import { takeUntil, map, startWith } from 'rxjs/operators';
import { IdleWarningData } from '@idle-detection/angular-oauth-integration';

interface ExtendOption {
  label: string;
  value: number;
  icon: string;
}

@Component({
  selector: 'app-advanced-warning-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="advanced-warning-overlay" (click)="onBackdropClick($event)">
      <div class="advanced-warning-dialog" (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="dialog-header">
          <div class="warning-icon">{{ warningIcon }}</div>
          <h2 class="dialog-title">{{ title }}</h2>
          <div class="urgency-indicator" [class]="urgencyClass"></div>
        </div>

        <!-- Progress Ring -->
        <div class="progress-container">
          <svg class="progress-ring" width="120" height="120">
            <circle
              class="progress-ring-background"
              cx="60" cy="60" r="54"
              fill="transparent"
              stroke="#e2e8f0"
              stroke-width="4">
            </circle>
            <circle
              class="progress-ring-progress"
              cx="60" cy="60" r="54"
              fill="transparent"
              stroke="currentColor"
              stroke-width="4"
              [style.stroke-dasharray]="circumference"
              [style.stroke-dashoffset]="strokeDashoffset">
            </circle>
          </svg>
          <div class="progress-content">
            <div class="time-remaining">{{ formattedTimeRemaining }}</div>
            <div class="time-label">remaining</div>
          </div>
        </div>

        <!-- Message -->
        <div class="dialog-message">
          <p>{{ message }}</p>
          <div class="session-info">
            <div class="info-item">
              <span class="info-label">Session started:</span>
              <span class="info-value">{{ sessionStartTime | date:'short' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Last activity:</span>
              <span class="info-value">{{ lastActivityTime | date:'short' }}</span>
            </div>
          </div>
        </div>

        <!-- Extend Options -->
        <div class="extend-options" *ngIf="showExtendOptions">
          <h4>Extend session by:</h4>
          <div class="option-grid">
            <button 
              *ngFor="let option of extendOptions"
              class="option-button"
              [class.selected]="selectedExtendTime === option.value"
              (click)="selectExtendTime(option.value)">
              <div class="option-icon">{{ option.icon }}</div>
              <div class="option-label">{{ option.label }}</div>
            </button>
          </div>
        </div>

        <!-- Custom extend time -->
        <div class="custom-time" *ngIf="showCustomTimeInput">
          <label for="customTime">Custom time (minutes):</label>
          <input 
            id="customTime"
            type="number" 
            [(ngModel)]="customExtendTime" 
            min="1" 
            max="120"
            class="time-input">
        </div>

        <!-- Actions -->
        <div class="dialog-actions">
          <button 
            class="btn btn-primary"
            [disabled]="!canExtend"
            (click)="onExtendSession()">
            <span class="btn-icon">🔄</span>
            {{ extendButtonText }}
          </button>
          
          <button 
            class="btn btn-secondary"
            (click)="onSaveAndLogout()">
            <span class="btn-icon">💾</span>
            Save & Logout
          </button>
          
          <button 
            class="btn btn-danger"
            (click)="onLogout()">
            <span class="btn-icon">🚪</span>
            Logout Now
          </button>
        </div>

        <!-- Footer -->
        <div class="dialog-footer">
          <div class="security-notice">
            <small>🔒 This session timeout is for your security</small>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .advanced-warning-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease;
    }

    .advanced-warning-dialog {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      max-width: 500px;
      width: 90vw;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .warning-icon {
      font-size: 2rem;
    }

    .dialog-title {
      flex: 1;
      margin: 0;
      color: #1a202c;
    }

    .urgency-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    .urgency-low { background: #48bb78; }
    .urgency-medium { background: #ed8936; }
    .urgency-high { background: #f56565; }
    .urgency-critical { background: #e53e3e; animation: pulse 0.5s infinite; }

    .progress-container {
      position: relative;
      display: flex;
      justify-content: center;
      margin: 2rem 0;
    }

    .progress-ring {
      transform: rotate(-90deg);
      color: #3182ce;
    }

    .progress-ring-progress {
      transition: stroke-dashoffset 0.3s ease;
    }

    .progress-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    .time-remaining {
      font-size: 1.5rem;
      font-weight: bold;
      color: #2d3748;
    }

    .time-label {
      font-size: 0.875rem;
      color: #718096;
    }

    .dialog-message {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .session-info {
      background: #f7fafc;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .info-label {
      font-weight: 500;
      color: #4a5568;
    }

    .info-value {
      color: #2d3748;
    }

    .extend-options {
      margin-bottom: 1.5rem;
    }

    .extend-options h4 {
      margin: 0 0 1rem 0;
      color: #2d3748;
    }

    .option-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 0.5rem;
    }

    .option-button {
      padding: 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
    }

    .option-button:hover {
      border-color: #3182ce;
      background: #ebf8ff;
    }

    .option-button.selected {
      border-color: #3182ce;
      background: #3182ce;
      color: white;
    }

    .option-icon {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .option-label {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .custom-time {
      margin-bottom: 1.5rem;
    }

    .custom-time label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #4a5568;
    }

    .time-input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      font-size: 1rem;
    }

    .dialog-actions {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .btn {
      flex: 1;
      min-width: 120px;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #3182ce;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2c5aa0;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #718096;
      color: white;
    }

    .btn-secondary:hover {
      background: #4a5568;
      transform: translateY(-1px);
    }

    .btn-danger {
      background: #e53e3e;
      color: white;
    }

    .btn-danger:hover {
      background: #c53030;
      transform: translateY(-1px);
    }

    .dialog-footer {
      text-align: center;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }

    .security-notice {
      color: #718096;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @media (max-width: 640px) {
      .advanced-warning-dialog {
        padding: 1.5rem;
        margin: 1rem;
      }

      .dialog-actions {
        flex-direction: column;
      }

      .option-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class AdvancedWarningDialogComponent implements OnInit, OnDestroy {
  @Input() warningData!: IdleWarningData;
  @Input() title = '⚠️ Session Expiring';
  @Input() message = 'Your session will expire soon due to inactivity.';
  @Input() showExtendOptions = true;
  @Input() allowCustomTime = true;

  @Output() extendSession = new EventEmitter<number>();
  @Output() logout = new EventEmitter<void>();
  @Output() saveAndLogout = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  // Progress ring
  circumference = 2 * Math.PI * 54; // radius = 54
  strokeDashoffset = this.circumference;

  // Extend options
  extendOptions: ExtendOption[] = [
    { label: '15 min', value: 15, icon: '⏱️' },
    { label: '30 min', value: 30, icon: '⏰' },
    { label: '1 hour', value: 60, icon: '🕐' },
    { label: 'Custom', value: -1, icon: '⚙️' }
  ];

  selectedExtendTime = 15;
  customExtendTime = 30;
  showCustomTimeInput = false;

  // Session info
  sessionStartTime = new Date(Date.now() - 1800000); // Mock 30 min ago
  lastActivityTime = new Date(Date.now() - 300000);   // Mock 5 min ago

  ngOnInit(): void {
    // Update progress ring
    this.warningData.timeRemaining$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(timeRemaining => {
      this.updateProgressRing(timeRemaining);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get formattedTimeRemaining(): string {
    let timeRemaining = 0;
    this.warningData.timeRemaining$.pipe(take(1)).subscribe(time => {
      timeRemaining = time;
    });

    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return `0:${seconds.toString().padStart(2, '0')}`;
  }

  get warningIcon(): string {
    let timeRemaining = 0;
    this.warningData.timeRemaining$.pipe(take(1)).subscribe(time => {
      timeRemaining = time;
    });

    if (timeRemaining <= 30000) return '🚨'; // 30 seconds
    if (timeRemaining <= 60000) return '⚠️';  // 1 minute
    return '⏰'; // More than 1 minute
  }

  get urgencyClass(): string {
    let timeRemaining = 0;
    this.warningData.timeRemaining$.pipe(take(1)).subscribe(time => {
      timeRemaining = time;
    });

    if (timeRemaining <= 30000) return 'urgency-critical';
    if (timeRemaining <= 60000) return 'urgency-high';
    if (timeRemaining <= 120000) return 'urgency-medium';
    return 'urgency-low';
  }

  get extendButtonText(): string {
    if (this.showCustomTimeInput) {
      return `Extend ${this.customExtendTime}m`;
    }
    return `Extend ${this.selectedExtendTime}m`;
  }

  get canExtend(): boolean {
    if (this.showCustomTimeInput) {
      return this.customExtendTime >= 1 && this.customExtendTime <= 120;
    }
    return this.selectedExtendTime > 0;
  }

  selectExtendTime(value: number): void {
    this.selectedExtendTime = value;
    this.showCustomTimeInput = value === -1;
  }

  onExtendSession(): void {
    const extendTime = this.showCustomTimeInput 
      ? this.customExtendTime 
      : this.selectedExtendTime;
    
    this.extendSession.emit(extendTime);
  }

  onSaveAndLogout(): void {
    this.saveAndLogout.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    // Prevent closing on backdrop click for security
    event.stopPropagation();
  }

  private updateProgressRing(timeRemaining: number): void {
    const totalTime = 300000; // 5 minutes total warning time
    const progress = timeRemaining / totalTime;
    this.strokeDashoffset = this.circumference * (1 - progress);
  }
}
```

### Session Dashboard Component

```typescript
// session-dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, combineLatest, interval } from 'rxjs';
import { takeUntil, map, startWith } from 'rxjs/operators';
import { 
  IdleOAuthService, 
  IdleStatus 
} from '@idle-detection/angular-oauth-integration';

interface SessionMetrics {
  sessionDuration: number;
  activeTime: number;
  idleTime: number;
  extendCount: number;
  lastActivity: Date;
  warningCount: number;
}

@Component({
  selector: 'app-session-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="session-dashboard">
      <h3>Session Dashboard</h3>
      
      <!-- Current Status -->
      <div class="status-card">
        <h4>Current Status</h4>
        <div class="status-grid">
          <div class="status-item">
            <div class="status-label">Status</div>
            <div class="status-value" [class]="'status-' + (idleStatus$ | async)">
              {{ getStatusText(idleStatus$ | async) }}
            </div>
          </div>
          
          <div class="status-item">
            <div class="status-label">Time Remaining</div>
            <div class="status-value">
              {{ formatTime(timeRemaining$ | async) }}
            </div>
          </div>
          
          <div class="status-item">
            <div class="status-label">Last Activity</div>
            <div class="status-value">
              {{ formatTimeAgo(lastActivity$ | async) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Session Metrics -->
      <div class="metrics-card">
        <h4>Session Metrics</h4>
        <div class="metrics-grid">
          <div class="metric-item">
            <div class="metric-icon">⏱️</div>
            <div class="metric-content">
              <div class="metric-value">{{ formatDuration(sessionMetrics.sessionDuration) }}</div>
              <div class="metric-label">Session Duration</div>
            </div>
          </div>
          
          <div class="metric-item">
            <div class="metric-icon">🟢</div>
            <div class="metric-content">
              <div class="metric-value">{{ formatDuration(sessionMetrics.activeTime) }}</div>
              <div class="metric-label">Active Time</div>
            </div>
          </div>
          
          <div class="metric-item">
            <div class="metric-icon">⭕</div>
            <div class="metric-content">
              <div class="metric-value">{{ formatDuration(sessionMetrics.idleTime) }}</div>
              <div class="metric-label">Idle Time</div>
            </div>
          </div>
          
          <div class="metric-item">
            <div class="metric-icon">🔄</div>
            <div class="metric-content">
              <div class="metric-value">{{ sessionMetrics.extendCount }}</div>
              <div class="metric-label">Extensions</div>
            </div>
          </div>
          
          <div class="metric-item">
            <div class="metric-icon">⚠️</div>
            <div class="metric-content">
              <div class="metric-value">{{ sessionMetrics.warningCount }}</div>
              <div class="metric-label">Warnings</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Timeline -->
      <div class="timeline-card">
        <h4>Recent Activity</h4>
        <div class="timeline">
          <div *ngFor="let event of activityTimeline" 
               class="timeline-item" 
               [class]="'timeline-' + event.type">
            <div class="timeline-icon">{{ event.icon }}</div>
            <div class="timeline-content">
              <div class="timeline-title">{{ event.title }}</div>
              <div class="timeline-time">{{ event.timestamp | date:'medium' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="controls-card">
        <h4>Session Controls</h4>
        <div class="control-buttons">
          <button 
            class="btn btn-primary"
            (click)="extendSession()"
            [disabled]="!(idleStatus$ | async) || (idleStatus$ | async) === 'idle'">
            🔄 Extend Session
          </button>
          
          <button 
            class="btn btn-secondary"
            (click)="resetActivity()">
            ⚡ Record Activity
          </button>
          
          <button 
            class="btn btn-warning"
            (click)="showWarning()">
            ⚠️ Test Warning
          </button>
          
          <button 
            class="btn btn-danger"
            (click)="endSession()">
            🚪 End Session
          </button>
        </div>
      </div>

      <!-- Configuration -->
      <div class="config-card">
        <h4>Current Configuration</h4>
        <div class="config-grid">
          <div class="config-item">
            <span class="config-label">Idle Timeout:</span>
            <span class="config-value">{{ formatDuration((config$ | async)?.idleTimeout) }}</span>
          </div>
          <div class="config-item">
            <span class="config-label">Warning Timeout:</span>
            <span class="config-value">{{ formatDuration((config$ | async)?.warningTimeout) }}</span>
          </div>
          <div class="config-item">
            <span class="config-label">Auto Refresh:</span>
            <span class="config-value">{{ (config$ | async)?.autoRefreshToken ? 'Enabled' : 'Disabled' }}</span>
          </div>
          <div class="config-item">
            <span class="config-label">Multi-Tab:</span>
            <span class="config-value">{{ (config$ | async)?.multiTabCoordination ? 'Enabled' : 'Disabled' }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .session-dashboard {
      padding: 1rem;
      max-width: 800px;
      margin: 0 auto;
      display: grid;
      gap: 1.5rem;
    }

    .session-dashboard h3 {
      margin: 0 0 1rem 0;
      color: #2d3748;
    }

    .status-card,
    .metrics-card,
    .timeline-card,
    .controls-card,
    .config-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }

    .status-card h4,
    .metrics-card h4,
    .timeline-card h4,
    .controls-card h4,
    .config-card h4 {
      margin: 0 0 1rem 0;
      color: #4a5568;
      font-size: 1.1rem;
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .status-item {
      text-align: center;
    }

    .status-label {
      font-size: 0.875rem;
      color: #718096;
      margin-bottom: 0.5rem;
    }

    .status-value {
      font-size: 1.125rem;
      font-weight: 600;
      padding: 0.5rem;
      border-radius: 6px;
    }

    .status-active {
      background: #c6f6d5;
      color: #22543d;
    }

    .status-warning {
      background: #fef5e7;
      color: #975a16;
    }

    .status-idle {
      background: #fed7d7;
      color: #742a2a;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .metric-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 8px;
    }

    .metric-icon {
      font-size: 1.5rem;
    }

    .metric-value {
      font-size: 1.25rem;
      font-weight: 600;
      color: #2d3748;
    }

    .metric-label {
      font-size: 0.875rem;
      color: #718096;
    }

    .timeline {
      max-height: 300px;
      overflow-y: auto;
    }

    .timeline-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      border-radius: 6px;
      margin-bottom: 0.5rem;
    }

    .timeline-activity {
      background: #e6fffa;
      border-left: 3px solid #38b2ac;
    }

    .timeline-warning {
      background: #fffaf0;
      border-left: 3px solid #ed8936;
    }

    .timeline-extend {
      background: #ebf8ff;
      border-left: 3px solid #3182ce;
    }

    .timeline-icon {
      font-size: 1.25rem;
    }

    .timeline-title {
      font-weight: 500;
      color: #2d3748;
    }

    .timeline-time {
      font-size: 0.875rem;
      color: #718096;
    }

    .control-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 0.75rem;
    }

    .btn {
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #3182ce;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2c5aa0;
    }

    .btn-secondary {
      background: #718096;
      color: white;
    }

    .btn-secondary:hover {
      background: #4a5568;
    }

    .btn-warning {
      background: #ed8936;
      color: white;
    }

    .btn-warning:hover {
      background: #dd6b20;
    }

    .btn-danger {
      background: #e53e3e;
      color: white;
    }

    .btn-danger:hover {
      background: #c53030;
    }

    .config-grid {
      display: grid;
      gap: 0.75rem;
    }

    .config-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e2e8f0;
    }

    .config-item:last-child {
      border-bottom: none;
    }

    .config-label {
      font-weight: 500;
      color: #4a5568;
    }

    .config-value {
      color: #2d3748;
    }

    @media (max-width: 768px) {
      .session-dashboard {
        padding: 0.5rem;
      }

      .control-buttons {
        grid-template-columns: 1fr;
      }

      .status-grid,
      .metrics-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SessionDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private sessionStartTime = Date.now();

  // Observables
  idleStatus$ = this.idleService.idleStatus$;
  timeRemaining$ = this.idleService.timeRemaining$;
  lastActivity$ = this.idleService.lastActivity$;
  config$ = this.idleService.config$;

  // Session metrics
  sessionMetrics: SessionMetrics = {
    sessionDuration: 0,
    activeTime: 0,
    idleTime: 0,
    extendCount: 0,
    lastActivity: new Date(),
    warningCount: 0
  };

  // Activity timeline
  activityTimeline: Array<{
    type: string;
    icon: string;
    title: string;
    timestamp: Date;
  }> = [];

  constructor(private idleService: IdleOAuthService) {}

  ngOnInit(): void {
    this.initializeMetrics();
    this.setupSubscriptions();
    this.startMetricsTimer();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeMetrics(): void {
    this.addTimelineEvent('activity', '🟢', 'Session started', new Date());
  }

  private setupSubscriptions(): void {
    // Track warning events
    this.idleService.isWarning$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isWarning => {
      if (isWarning) {
        this.sessionMetrics.warningCount++;
        this.addTimelineEvent('warning', '⚠️', 'Warning shown', new Date());
      }
    });

    // Track idle state changes
    this.idleStatus$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(status => {
      if (status === IdleStatus.IDLE) {
        this.addTimelineEvent('idle', '⭕', 'Session expired', new Date());
      }
    });
  }

  private startMetricsTimer(): void {
    interval(1000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.updateSessionMetrics();
    });
  }

  private updateSessionMetrics(): void {
    const now = Date.now();
    this.sessionMetrics.sessionDuration = now - this.sessionStartTime;
    
    // Update active/idle time based on current status
    let currentStatus: IdleStatus;
    this.idleStatus$.pipe(take(1)).subscribe(status => {
      currentStatus = status;
    });

    if (currentStatus === IdleStatus.ACTIVE) {
      this.sessionMetrics.activeTime += 1000;
    } else {
      this.sessionMetrics.idleTime += 1000;
    }
  }

  private addTimelineEvent(type: string, icon: string, title: string, timestamp: Date): void {
    this.activityTimeline.unshift({
      type,
      icon,
      title,
      timestamp
    });

    // Keep only last 10 events
    if (this.activityTimeline.length > 10) {
      this.activityTimeline = this.activityTimeline.slice(0, 10);
    }
  }

  getStatusText(status: IdleStatus | null): string {
    switch (status) {
      case IdleStatus.ACTIVE:
        return 'Active';
      case IdleStatus.WARNING:
        return 'Warning';
      case IdleStatus.IDLE:
        return 'Idle';
      default:
        return 'Unknown';
    }
  }

  formatTime(ms: number | null): string {
    if (!ms) return '—';
    
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  formatDuration(ms: number | null): string {
    if (!ms) return '—';
    
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }

  formatTimeAgo(timestamp: number | null): string {
    if (!timestamp) return '—';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) {
      return `${Math.floor(diff / 1000)}s ago`;
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    }
    return `${Math.floor(diff / 3600000)}h ago`;
  }

  extendSession(): void {
    this.idleService.extendSession();
    this.sessionMetrics.extendCount++;
    this.addTimelineEvent('extend', '🔄', 'Session extended', new Date());
  }

  resetActivity(): void {
    this.idleService.reset();
    this.addTimelineEvent('activity', '⚡', 'Activity recorded', new Date());
  }

  showWarning(): void {
    // Temporarily trigger warning for testing
    this.addTimelineEvent('warning', '⚠️', 'Test warning triggered', new Date());
  }

  endSession(): void {
    this.idleService.logout();
    this.addTimelineEvent('logout', '🚪', 'Session ended', new Date());
  }
}
```

## Real-World Applications

### E-commerce Checkout Protection

```typescript
// checkout-protection.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IdleOAuthService } from '@idle-detection/angular-oauth-integration';

interface CheckoutSession {
  id: string;
  startTime: Date;
  currentStep: string;
  formData: Record<string, any>;
  cartData: any;
  isProtected: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutProtectionService {
  private destroy$ = new Subject<void>();
  private currentSession$ = new BehaviorSubject<CheckoutSession | null>(null);
  private autoSaveInterval: any;

  readonly currentSession = this.currentSession$.asObservable();

  constructor(
    private idleService: IdleOAuthService,
    private router: Router
  ) {
    this.setupIdleProtection();
  }

  startCheckoutProtection(cartData: any): void {
    const session: CheckoutSession = {
      id: this.generateSessionId(),
      startTime: new Date(),
      currentStep: 'shipping',
      formData: {},
      cartData,
      isProtected: true
    };

    this.currentSession$.next(session);
    
    // Extend idle timeout for checkout
    this.idleService.updateConfig({
      idleTimeout: 1800000, // 30 minutes for checkout
      warningTimeout: 300000 // 5 minutes warning
    });

    // Start auto-save
    this.startAutoSave();
    
    console.log('🛒 Checkout protection activated');
  }

  endCheckoutProtection(reason: 'completed' | 'abandoned' | 'timeout'): void {
    const session = this.currentSession$.value;
    if (!session) return;

    if (reason === 'completed') {
      this.clearSavedData();
    } else {
      this.saveSessionData(session);
    }

    this.currentSession$.next(null);
    this.stopAutoSave();

    // Reset to normal timeout
    this.idleService.updateConfig({
      idleTimeout: 900000,  // 15 minutes normal
      warningTimeout: 180000 // 3 minutes warning
    });

    console.log(`🛒 Checkout protection ended: ${reason}`);
  }

  updateCheckoutStep(step: string): void {
    const session = this.currentSession$.value;
    if (session) {
      session.currentStep = step;
      this.currentSession$.next(session);
      this.saveSessionData(session);
    }
  }

  updateFormData(stepName: string, data: any): void {
    const session = this.currentSession$.value;
    if (session) {
      session.formData[stepName] = data;
      this.currentSession$.next(session);
    }
  }

  restoreSession(): CheckoutSession | null {
    const saved = localStorage.getItem('checkout_session');
    if (saved) {
      try {
        const session = JSON.parse(saved);
        this.currentSession$.next(session);
        return session;
      } catch (error) {
        console.error('Failed to restore checkout session:', error);
      }
    }
    return null;
  }

  private setupIdleProtection(): void {
    this.idleService.isWarning$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isWarning => {
      if (isWarning && this.currentSession$.value?.isProtected) {
        this.handleCheckoutWarning();
      }
    });

    this.idleService.isIdle$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isIdle => {
      if (isIdle && this.currentSession$.value?.isProtected) {
        this.handleCheckoutTimeout();
      }
    });
  }

  private handleCheckoutWarning(): void {
    // Auto-save current state
    const session = this.currentSession$.value;
    if (session) {
      this.saveSessionData(session);
    }
  }

  private handleCheckoutTimeout(): void {
    this.endCheckoutProtection('timeout');
    
    // Redirect to cart with restoration option
    this.router.navigate(['/cart'], {
      queryParams: { restored: 'true' }
    });
  }

  private startAutoSave(): void {
    this.autoSaveInterval = setInterval(() => {
      const session = this.currentSession$.value;
      if (session) {
        this.collectCurrentFormData(session);
        this.saveSessionData(session);
      }
    }, 30000); // Auto-save every 30 seconds
  }

  private stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  private collectCurrentFormData(session: CheckoutSession): void {
    // Collect form data from current checkout step
    const forms = document.querySelectorAll('form[data-checkout-step]');
    forms.forEach(form => {
      const step = form.getAttribute('data-checkout-step');
      if (step) {
        const formData = new FormData(form as HTMLFormElement);
        const data: Record<string, any> = {};
        
        formData.forEach((value, key) => {
          data[key] = value;
        });
        
        session.formData[step] = data;
      }
    });
  }

  private saveSessionData(session: CheckoutSession): void {
    localStorage.setItem('checkout_session', JSON.stringify(session));
  }

  private clearSavedData(): void {
    localStorage.removeItem('checkout_session');
  }

  private generateSessionId(): string {
    return `checkout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopAutoSave();
  }
}
```

```typescript
// checkout.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { CheckoutProtectionService } from './checkout-protection.service';
import { 
  IdleOAuthService, 
  IdleWarningDialogComponent 
} from '@idle-detection/angular-oauth-integration';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IdleWarningDialogComponent],
  template: `
    <div class="checkout-container">
      <div class="checkout-header">
        <h1>Secure Checkout</h1>
        <div class="protection-status" *ngIf="isProtected">
          🛡️ Enhanced Session Protection Active
        </div>
      </div>

      <!-- Checkout Steps -->
      <div class="checkout-steps">
        <div *ngFor="let step of steps; let i = index" 
             class="step" 
             [class.active]="currentStepIndex === i"
             [class.completed]="i < currentStepIndex">
          <div class="step-number">{{ i + 1 }}</div>
          <div class="step-title">{{ step.title }}</div>
        </div>
      </div>

      <!-- Current Step Form -->
      <div class="checkout-form">
        <form [formGroup]="currentForm" 
              [attr.data-checkout-step]="currentStep.key"
              (ngSubmit)="onNext()">
          
          <!-- Shipping Form -->
          <div *ngIf="currentStep.key === 'shipping'" class="form-section">
            <h2>Shipping Information</h2>
            <div class="form-grid">
              <div class="form-group">
                <label for="firstName">First Name</label>
                <input id="firstName" 
                       formControlName="firstName" 
                       type="text" 
                       class="form-control">
              </div>
              <div class="form-group">
                <label for="lastName">Last Name</label>
                <input id="lastName" 
                       formControlName="lastName" 
                       type="text" 
                       class="form-control">
              </div>
              <div class="form-group full-width">
                <label for="address">Address</label>
                <input id="address" 
                       formControlName="address" 
                       type="text" 
                       class="form-control">
              </div>
              <div class="form-group">
                <label for="city">City</label>
                <input id="city" 
                       formControlName="city" 
                       type="text" 
                       class="form-control">
              </div>
              <div class="form-group">
                <label for="zipCode">ZIP Code</label>
                <input id="zipCode" 
                       formControlName="zipCode" 
                       type="text" 
                       class="form-control">
              </div>
            </div>
          </div>

          <!-- Payment Form -->
          <div *ngIf="currentStep.key === 'payment'" class="form-section">
            <h2>Payment Information</h2>
            <div class="form-grid">
              <div class="form-group full-width">
                <label for="cardNumber">Card Number</label>
                <input id="cardNumber" 
                       formControlName="cardNumber" 
                       type="text" 
                       class="form-control"
                       placeholder="1234 5678 9012 3456">
              </div>
              <div class="form-group">
                <label for="expiryDate">Expiry Date</label>
                <input id="expiryDate" 
                       formControlName="expiryDate" 
                       type="text" 
                       class="form-control"
                       placeholder="MM/YY">
              </div>
              <div class="form-group">
                <label for="cvv">CVV</label>
                <input id="cvv" 
                       formControlName="cvv" 
                       type="text" 
                       class="form-control"
                       placeholder="123">
              </div>
            </div>
          </div>

          <!-- Review Form -->
          <div *ngIf="currentStep.key === 'review'" class="form-section">
            <h2>Review Your Order</h2>
            <div class="order-summary">
              <div class="summary-section">
                <h3>Shipping Address</h3>
                <p>{{ getFormData('shipping')?.firstName }} {{ getFormData('shipping')?.lastName }}</p>
                <p>{{ getFormData('shipping')?.address }}</p>
                <p>{{ getFormData('shipping')?.city }}, {{ getFormData('shipping')?.zipCode }}</p>
              </div>
              
              <div class="summary-section">
                <h3>Payment Method</h3>
                <p>**** **** **** {{ getFormData('payment')?.cardNumber?.slice(-4) }}</p>
              </div>
              
              <div class="summary-section">
                <h3>Order Total</h3>
                <div class="total-amount">${{ orderTotal }}</div>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" 
                    class="btn btn-secondary" 
                    *ngIf="currentStepIndex > 0"
                    (click)="onPrevious()">
              ← Previous
            </button>
            
            <button type="submit" 
                    class="btn btn-primary"
                    [disabled]="currentForm.invalid">
              {{ isLastStep ? 'Place Order' : 'Next →' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Enhanced Warning Dialog -->
      <idle-warning-dialog 
        *ngIf="showWarning"
        [warningData]="warningData"
        theme="dark"
        size="large"
        titleText="🛒 Checkout Session Expiring"
        messageText="Your checkout session will expire soon. Your progress has been automatically saved."
        extendText="Continue Checkout"
        logoutText="Save & Exit"
        [showProgressBar]="true"
        [showCountdown]="true"
        [customStyles]="{
          'border': '3px solid #28a745',
          'background': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          'color': 'white'
        }"
        (extendSession)="onExtendCheckout()"
        (logout)="onSaveAndExit()">
      </idle-warning-dialog>

      <!-- Auto-save Indicator -->
      <div class="auto-save-indicator" [class.visible]="showAutoSaveIndicator">
        💾 Progress automatically saved
      </div>
    </div>
  `,
  styles: [`
    .checkout-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .checkout-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .protection-status {
      background: #d4edda;
      color: #155724;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      display: inline-block;
      margin-top: 0.5rem;
    }

    .checkout-steps {
      display: flex;
      justify-content: center;
      margin-bottom: 3rem;
      position: relative;
    }

    .checkout-steps::before {
      content: '';
      position: absolute;
      top: 20px;
      left: 25%;
      right: 25%;
      height: 2px;
      background: #e2e8f0;
      z-index: 0;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      position: relative;
      z-index: 1;
    }

    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #718096;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      margin-bottom: 0.5rem;
      transition: all 0.3s ease;
    }

    .step.active .step-number {
      background: #3182ce;
      color: white;
    }

    .step.completed .step-number {
      background: #28a745;
      color: white;
    }

    .step-title {
      font-size: 0.875rem;
      color: #4a5568;
      font-weight: 500;
    }

    .checkout-form {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    .form-section h2 {
      margin: 0 0 1.5rem 0;
      color: #2d3748;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #4a5568;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #3182ce;
      box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
    }

    .order-summary {
      display: grid;
      gap: 1.5rem;
    }

    .summary-section h3 {
      margin: 0 0 0.5rem 0;
      color: #2d3748;
    }

    .summary-section p {
      margin: 0.25rem 0;
      color: #4a5568;
    }

    .total-amount {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2d3748;
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
      gap: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #3182ce;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2c5aa0;
    }

    .btn-secondary {
      background: #718096;
      color: white;
    }

    .btn-secondary:hover {
      background: #4a5568;
    }

    .auto-save-indicator {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
      z-index: 1000;
    }

    .auto-save-indicator.visible {
      opacity: 1;
      transform: translateX(0);
    }

    @media (max-width: 768px) {
      .checkout-container {
        padding: 1rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .checkout-steps {
        margin-bottom: 2rem;
      }

      .step-title {
        display: none;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private autoSaveTimer: any;

  // State
  currentStepIndex = 0;
  showWarning = false;
  warningData: any;
  showAutoSaveIndicator = false;
  orderTotal = 149.99;

  // Forms
  shippingForm: FormGroup;
  paymentForm: FormGroup;
  reviewForm: FormGroup;

  steps = [
    { key: 'shipping', title: 'Shipping', form: 'shippingForm' },
    { key: 'payment', title: 'Payment', form: 'paymentForm' },
    { key: 'review', title: 'Review', form: 'reviewForm' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private checkoutProtection: CheckoutProtectionService,
    private idleService: IdleOAuthService
  ) {
    this.createForms();
  }

  ngOnInit(): void {
    this.startCheckoutProtection();
    this.setupIdleWarning();
    this.setupAutoSave();
    this.restoreProgress();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.checkoutProtection.endCheckoutProtection('abandoned');
    this.clearAutoSaveTimer();
  }

  get currentStep() {
    return this.steps[this.currentStepIndex];
  }

  get currentForm(): FormGroup {
    switch (this.currentStep.key) {
      case 'shipping': return this.shippingForm;
      case 'payment': return this.paymentForm;
      case 'review': return this.reviewForm;
      default: return this.shippingForm;
    }
  }

  get isLastStep(): boolean {
    return this.currentStepIndex === this.steps.length - 1;
  }

  get isProtected(): boolean {
    return !!this.checkoutProtection.currentSession;
  }

  private createForms(): void {
    this.shippingForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      zipCode: ['', Validators.required]
    });

    this.paymentForm = this.fb.group({
      cardNumber: ['', Validators.required],
      expiryDate: ['', Validators.required],
      cvv: ['', Validators.required]
    });

    this.reviewForm = this.fb.group({});
  }

  private startCheckoutProtection(): void {
    const cartData = { items: [{ id: 1, name: 'Product A', price: 149.99 }] };
    this.checkoutProtection.startCheckoutProtection(cartData);
  }

  private setupIdleWarning(): void {
    this.idleService.isWarning$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isWarning => {
      this.showWarning = isWarning;
      if (isWarning) {
        this.warningData = this.idleService.getCurrentWarningData();
      }
    });
  }

  private setupAutoSave(): void {
    // Auto-save on form changes
    [this.shippingForm, this.paymentForm].forEach(form => {
      form.valueChanges.pipe(
        takeUntil(this.destroy$),
        debounceTime(2000) // Wait 2 seconds after last change
      ).subscribe(() => {
        this.autoSave();
      });
    });
  }

  private autoSave(): void {
    this.checkoutProtection.updateFormData(this.currentStep.key, this.currentForm.value);
    this.showAutoSaveIndicatorBriefly();
  }

  private showAutoSaveIndicatorBriefly(): void {
    this.showAutoSaveIndicator = true;
    this.clearAutoSaveTimer();
    
    this.autoSaveTimer = setTimeout(() => {
      this.showAutoSaveIndicator = false;
    }, 3000);
  }

  private clearAutoSaveTimer(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  private restoreProgress(): void {
    const session = this.checkoutProtection.restoreSession();
    if (session?.formData) {
      // Restore form data
      Object.keys(session.formData).forEach(stepKey => {
        const form = this.getFormByKey(stepKey);
        if (form) {
          form.patchValue(session.formData[stepKey]);
        }
      });

      // Navigate to saved step
      const stepIndex = this.steps.findIndex(step => step.key === session.currentStep);
      if (stepIndex >= 0) {
        this.currentStepIndex = stepIndex;
      }
    }
  }

  private getFormByKey(key: string): FormGroup | null {
    switch (key) {
      case 'shipping': return this.shippingForm;
      case 'payment': return this.paymentForm;
      case 'review': return this.reviewForm;
      default: return null;
    }
  }

  getFormData(stepKey: string): any {
    const form = this.getFormByKey(stepKey);
    return form?.value || {};
  }

  onNext(): void {
    if (this.currentForm.valid) {
      this.autoSave();
      
      if (this.isLastStep) {
        this.completeOrder();
      } else {
        this.currentStepIndex++;
        this.checkoutProtection.updateCheckoutStep(this.currentStep.key);
      }
    }
  }

  onPrevious(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.checkoutProtection.updateCheckoutStep(this.currentStep.key);
    }
  }

  onExtendCheckout(): void {
    this.idleService.extendSession();
    this.showWarning = false;
  }

  onSaveAndExit(): void {
    this.autoSave();
    this.checkoutProtection.endCheckoutProtection('abandoned');
    this.router.navigate(['/cart'], { queryParams: { saved: 'true' } });
  }

  private completeOrder(): void {
    // Process order
    console.log('Order completed');
    
    // End protection
    this.checkoutProtection.endCheckoutProtection('completed');
    
    // Navigate to success page
    this.router.navigate(['/order-success']);
  }
}
```

This comprehensive set of examples demonstrates real-world usage patterns for the Angular Idle Detection library, from basic integration to complex enterprise scenarios with advanced security features.