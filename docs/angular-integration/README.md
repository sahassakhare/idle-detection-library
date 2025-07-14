# Angular Idle Detection with OAuth Integration

A comprehensive Angular library for idle detection with built-in OAuth token management, session extension, and multi-tab coordination.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Components](#components)
- [Services](#services)
- [NgRx Integration](#ngrx-integration)
- [Examples](#examples)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

## Overview

The Angular Idle Detection library extends the core idle detection functionality with Angular-specific features including OAuth token management, reactive state management with NgRx, customizable warning dialogs, and seamless integration with Angular's dependency injection system.

### Key Benefits

- **Angular Native**: Built specifically for Angular 15+ with standalone components
- **OAuth Integration**: Automatic token refresh and session management
- **NgRx State Management**: Reactive state management with full NgRx support
- **Customizable UI**: Flexible warning dialog component with theming
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Multi-Tab Coordination**: Share idle state across browser tabs
- **Production Ready**: Battle-tested with comprehensive error handling

## Features

- ✅ **OAuth Token Management**: Automatic token refresh before expiration
- ✅ **Session Extension**: User-friendly session extension dialogs
- ✅ **NgRx Integration**: Full reactive state management
- ✅ **Customizable Warning Dialog**: Themeable UI components
- ✅ **Multi-Tab Coordination**: Synchronized state across tabs
- ✅ **Route Guards**: Protect routes based on idle state
- ✅ **HTTP Interceptors**: Activity detection from HTTP requests
- ✅ **Standalone Components**: Angular 15+ standalone architecture
- ✅ **Accessibility**: WCAG compliant warning dialogs
- ✅ **Responsive Design**: Mobile-friendly components

## Installation

### NPM

```bash
npm install @idle-detection/angular-oauth-integration
```

### Yarn

```bash
yarn add @idle-detection/angular-oauth-integration
```

### Peer Dependencies

```bash
npm install @ngrx/store @ngrx/effects angular-auth-oidc-client
```

## Quick Start

### 1. Bootstrap Your Application

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { AppComponent } from './app.component';
import { idleReducer } from '@idle-detection/angular-oauth-integration';
import { IdleEffects } from '@idle-detection/angular-oauth-integration';

bootstrapApplication(AppComponent, {
  providers: [
    provideStore({
      idle: idleReducer
    }),
    provideEffects([IdleEffects])
  ]
});
```

### 2. Configure Your App Component

```typescript
// app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { 
  IdleOAuthService, 
  IdleWarningDialogComponent,
  IdleWarningData 
} from '@idle-detection/angular-oauth-integration';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IdleWarningDialogComponent],
  template: `
    <div class="app">
      <h1>My Application</h1>
      
      <!-- Your app content -->
      <router-outlet></router-outlet>
      
      <!-- Warning dialog -->
      <idle-warning-dialog 
        *ngIf="showWarning"
        [warningData]="warningData"
        titleText="Session Expiring Soon"
        messageText="Your session will expire due to inactivity."
        extendText="Continue Working"
        logoutText="End Session"
        (extendSession)="onExtendSession()"
        (logout)="onLogout()">
      </idle-warning-dialog>
    </div>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  showWarning = false;
  warningData!: IdleWarningData;
  
  constructor(private idleOAuthService: IdleOAuthService) {}

  ngOnInit(): void {
    // Initialize the service
    this.idleOAuthService.initialize({
      idleTimeout: 1800000,      // 30 minutes
      warningTimeout: 300000,    // 5 minutes warning
      autoRefreshToken: true,
      multiTabCoordination: true
    });

    // Start idle detection
    this.idleOAuthService.start();

    // Subscribe to warning state
    this.idleOAuthService.isWarning$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isWarning => {
      this.showWarning = isWarning;
      
      if (isWarning) {
        this.warningData = this.idleOAuthService.getCurrentWarningData()!;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.idleOAuthService.stop();
  }

  onExtendSession(): void {
    this.idleOAuthService.extendSession();
    this.showWarning = false;
  }

  onLogout(): void {
    this.idleOAuthService.logout();
    this.showWarning = false;
  }
}
```

## Configuration

### IdleOAuthConfig Interface

```typescript
interface IdleOAuthConfig {
  // Timeout settings
  idleTimeout: number;              // Time until user is considered idle (ms)
  warningTimeout: number;           // Warning period before logout (ms)
  
  // OAuth settings
  autoRefreshToken?: boolean;       // Auto refresh tokens (default: true)
  refreshThreshold?: number;        // Refresh threshold in ms (default: 300000)
  
  // Coordination settings
  multiTabCoordination?: boolean;   // Enable multi-tab sync (default: false)
  
  // UI customization
  customCssClasses?: {
    dialog?: string;
    title?: string;
    message?: string;
    buttons?: string;
  };
  
  // Debug settings
  debug?: boolean;                  // Enable debug logging (default: false)
}
```

### Basic Configuration

```typescript
this.idleOAuthService.initialize({
  idleTimeout: 900000,       // 15 minutes
  warningTimeout: 180000,    // 3 minutes warning
  autoRefreshToken: true,
  multiTabCoordination: true
});
```

### Advanced Configuration

```typescript
this.idleOAuthService.initialize({
  idleTimeout: 1800000,      // 30 minutes
  warningTimeout: 300000,    // 5 minutes warning
  autoRefreshToken: true,
  refreshThreshold: 600000,  // Refresh tokens 10 minutes before expiry
  multiTabCoordination: true,
  customCssClasses: {
    dialog: 'custom-warning-dialog',
    title: 'custom-title-style',
    message: 'custom-message-style',
    buttons: 'custom-button-style'
  },
  debug: false
});
```

## Components

### IdleWarningDialogComponent

A customizable dialog component for displaying session warnings.

#### Basic Usage

```typescript
<idle-warning-dialog 
  *ngIf="showWarning"
  [warningData]="warningData"
  (extendSession)="onExtendSession()"
  (logout)="onLogout()">
</idle-warning-dialog>
```

#### Full Customization

```typescript
<idle-warning-dialog 
  *ngIf="showWarning"
  [warningData]="warningData"
  titleText="Custom Warning Title"
  messageText="Your session will expire in {{timeRemaining}} seconds."
  extendText="Stay Logged In"
  logoutText="Logout Now"
  theme="dark"
  size="large"
  [showProgressBar]="true"
  [showCountdown]="true"
  [backdropClose]="false"
  [customStyles]="{
    'background-color': '#1a1a1a',
    'color': '#ffffff'
  }"
  (extendSession)="onExtendSession()"
  (logout)="onLogout()">
</idle-warning-dialog>
```

#### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `warningData` | `IdleWarningData` | Required | Warning data from service |
| `titleText` | `string` | 'Session Warning' | Dialog title |
| `messageText` | `string` | 'Your session...' | Warning message |
| `extendText` | `string` | 'Extend Session' | Extend button text |
| `logoutText` | `string` | 'Logout' | Logout button text |
| `theme` | `'default' \| 'dark' \| 'minimal'` | 'default' | Visual theme |
| `size` | `'small' \| 'medium' \| 'large'` | 'medium' | Dialog size |
| `showProgressBar` | `boolean` | `true` | Show countdown progress |
| `showCountdown` | `boolean` | `true` | Show time remaining |
| `backdropClose` | `boolean` | `false` | Close on backdrop click |
| `customStyles` | `object` | `{}` | Custom CSS styles |

#### Events

| Event | Description | Payload |
|-------|-------------|---------|
| `extendSession` | User clicked extend session | `void` |
| `logout` | User clicked logout | `void` |

### Custom Dialog Example

```typescript
<idle-warning-dialog 
  *ngIf="showWarning"
  [warningData]="warningData"
  theme="dark"
  size="large"
  titleText="🔒 Security Notice"
  messageText="For your security, we'll log you out in {{timeRemaining}} seconds due to inactivity."
  extendText="🔄 Keep Me Logged In"
  logoutText="🚪 Logout Now"
  [showProgressBar]="true"
  [showCountdown]="true"
  [customStyles]="{
    'border-radius': '12px',
    'box-shadow': '0 20px 40px rgba(0,0,0,0.3)'
  }"
  (extendSession)="extendSession()"
  (logout)="logout()">
</idle-warning-dialog>
```

## Services

### IdleOAuthService

The main service for idle detection and OAuth management.

#### Key Methods

```typescript
// Configuration
initialize(config: IdleOAuthConfig): void
updateConfig(config: Partial<IdleOAuthConfig>): void

// Control
start(): void
stop(): void
reset(): void

// Session management
extendSession(): void
logout(): void

// State access
getCurrentWarningData(): IdleWarningData | null
getWarningData(): Observable<IdleWarningData>
```

#### Observable Properties

```typescript
// State observables
idleStatus$: Observable<IdleStatus>
isIdle$: Observable<boolean>
isWarning$: Observable<boolean>
timeRemaining$: Observable<number>
config$: Observable<IdleOAuthConfig>
```

#### Usage Examples

```typescript
constructor(private idleService: IdleOAuthService) {}

ngOnInit(): void {
  // Monitor idle status
  this.idleService.idleStatus$.subscribe(status => {
    console.log('Idle status:', status);
  });

  // Monitor time remaining
  this.idleService.timeRemaining$.subscribe(time => {
    console.log('Time remaining:', time / 1000, 'seconds');
  });

  // Check if user is idle
  this.idleService.isIdle$.subscribe(isIdle => {
    if (isIdle) {
      this.showIdleOverlay = true;
    }
  });
}

// Extend session programmatically
extendUserSession(): void {
  this.idleService.extendSession();
}

// Update configuration
updateIdleSettings(): void {
  this.idleService.updateConfig({
    idleTimeout: 1200000, // 20 minutes
    warningTimeout: 240000 // 4 minutes
  });
}
```

## NgRx Integration

### State Structure

```typescript
interface IdleState {
  status: IdleStatus;
  isDetecting: boolean;
  timeRemaining: number;
  config: IdleOAuthConfig | null;
  lastActivity: number;
  isExtendingSession: boolean;
  multiTabActive: boolean;
  error: string | null;
}
```

### Selectors

```typescript
import { 
  selectIdleStatus,
  selectIsIdle,
  selectIsWarning,
  selectTimeRemaining,
  selectIsDetecting,
  selectLastActivity
} from '@idle-detection/angular-oauth-integration';

@Component({...})
export class MyComponent {
  idleStatus$ = this.store.select(selectIdleStatus);
  isIdle$ = this.store.select(selectIsIdle);
  timeRemaining$ = this.store.select(selectTimeRemaining);

  constructor(private store: Store) {}
}
```

### Actions

```typescript
import { IdleActions } from '@idle-detection/angular-oauth-integration';

// Dispatch actions
this.store.dispatch(IdleActions.startIdleDetection());
this.store.dispatch(IdleActions.extendSession());
this.store.dispatch(IdleActions.userActivity({ timestamp: Date.now() }));
```

### Effects

The library includes built-in effects for handling:
- Token refresh workflows
- Multi-tab coordination
- Activity detection
- Session management

## Examples

### Complete Angular Application

```typescript
// app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { 
  IdleOAuthService, 
  IdleWarningDialogComponent,
  IdleWarningData,
  IdleStatus
} from '@idle-detection/angular-oauth-integration';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IdleWarningDialogComponent],
  template: `
    <div class="app" [class.app--idle]="isIdle">
      <!-- App header -->
      <header class="app-header">
        <h1>My Application</h1>
        <div class="status-indicator" [class]="statusClass">
          {{ statusText }}
        </div>
      </header>

      <!-- Main content -->
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>

      <!-- Idle overlay -->
      <div *ngIf="isIdle" class="idle-overlay">
        <div class="idle-message">
          <h2>Session Expired</h2>
          <p>Your session has expired due to inactivity.</p>
          <button (click)="relogin()" class="btn btn-primary">
            Login Again
          </button>
        </div>
      </div>

      <!-- Warning dialog -->
      <idle-warning-dialog 
        *ngIf="showWarning"
        [warningData]="warningData"
        theme="default"
        size="medium"
        titleText="⚠️ Session Expiring"
        messageText="Your session will expire due to inactivity."
        extendText="🔄 Continue Working"
        logoutText="🚪 Logout"
        [showProgressBar]="true"
        [showCountdown]="true"
        (extendSession)="onExtendSession()"
        (logout)="onLogout()">
      </idle-warning-dialog>
    </div>
  `,
  styles: [`
    .app {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app--idle {
      filter: blur(2px);
      pointer-events: none;
    }

    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }

    .status-indicator {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .status-active {
      background: #d4edda;
      color: #155724;
    }

    .status-warning {
      background: #fff3cd;
      color: #856404;
    }

    .status-idle {
      background: #f8d7da;
      color: #721c24;
    }

    .app-main {
      flex: 1;
      padding: 2rem;
    }

    .idle-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .idle-message {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      max-width: 400px;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // State
  isIdle = false;
  showWarning = false;
  warningData!: IdleWarningData;
  statusText = 'Active';
  statusClass = 'status-active';

  constructor(
    private idleOAuthService: IdleOAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeIdleDetection();
    this.subscribeToIdleState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.idleOAuthService.stop();
  }

  private initializeIdleDetection(): void {
    this.idleOAuthService.initialize({
      idleTimeout: 1800000,      // 30 minutes
      warningTimeout: 300000,    // 5 minutes warning
      autoRefreshToken: true,
      multiTabCoordination: true,
      debug: false
    });

    this.idleOAuthService.start();
  }

  private subscribeToIdleState(): void {
    // Combined state subscription
    combineLatest([
      this.idleOAuthService.idleStatus$,
      this.idleOAuthService.isIdle$,
      this.idleOAuthService.isWarning$
    ]).pipe(
      takeUntil(this.destroy$),
      map(([status, isIdle, isWarning]) => ({
        status,
        isIdle,
        isWarning
      }))
    ).subscribe(({ status, isIdle, isWarning }) => {
      this.isIdle = isIdle;
      this.showWarning = isWarning && !isIdle;
      
      // Update status display
      this.updateStatusDisplay(status);
      
      // Update warning data
      if (isWarning) {
        this.warningData = this.idleOAuthService.getCurrentWarningData()!;
      }
    });
  }

  private updateStatusDisplay(status: IdleStatus): void {
    switch (status) {
      case IdleStatus.ACTIVE:
        this.statusText = 'Active';
        this.statusClass = 'status-active';
        break;
      case IdleStatus.WARNING:
        this.statusText = 'Session Expiring';
        this.statusClass = 'status-warning';
        break;
      case IdleStatus.IDLE:
        this.statusText = 'Session Expired';
        this.statusClass = 'status-idle';
        break;
      default:
        this.statusText = 'Unknown';
        this.statusClass = '';
    }
  }

  onExtendSession(): void {
    console.log('Extending session...');
    this.idleOAuthService.extendSession();
    this.showWarning = false;
  }

  onLogout(): void {
    console.log('Logging out...');
    this.idleOAuthService.logout();
    this.showWarning = false;
    this.router.navigate(['/login']);
  }

  relogin(): void {
    this.router.navigate(['/login']);
  }
}
```

### Route Guards

```typescript
// idle.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IdleOAuthService } from '@idle-detection/angular-oauth-integration';

@Injectable({
  providedIn: 'root'
})
export class IdleGuard implements CanActivate {
  constructor(
    private idleService: IdleOAuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.idleService.isIdle$.pipe(
      map(isIdle => {
        if (isIdle) {
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      })
    );
  }
}

// app-routing.module.ts
const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [IdleGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [IdleGuard]
  }
];
```

### HTTP Interceptor

```typescript
// idle-activity.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { IdleOAuthService } from '@idle-detection/angular-oauth-integration';

@Injectable()
export class IdleActivityInterceptor implements HttpInterceptor {
  constructor(private idleService: IdleOAuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Reset idle timer on HTTP requests
    this.idleService.reset();
    
    return next.handle(req);
  }
}

// app.config.ts
import { HTTP_INTERCEPTORS } from '@angular/common/http';

export const appConfig = {
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: IdleActivityInterceptor,
      multi: true
    }
  ]
};
```

### Custom Warning Component

```typescript
// custom-warning.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdleWarningData } from '@idle-detection/angular-oauth-integration';

@Component({
  selector: 'app-custom-warning',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="custom-warning-overlay">
      <div class="custom-warning-dialog">
        <div class="warning-icon">⚠️</div>
        <h2>Security Notice</h2>
        <p>
          Your session will expire in 
          <strong>{{ timeRemaining$ | async | timeFormat }}</strong>
          due to inactivity.
        </p>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            [style.width.%]="progressPercentage">
          </div>
        </div>
        <div class="button-group">
          <button 
            class="btn btn-primary" 
            (click)="extend.emit()">
            Stay Logged In
          </button>
          <button 
            class="btn btn-secondary" 
            (click)="logout.emit()">
            Logout
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-warning-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }

    .custom-warning-dialog {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      text-align: center;
      max-width: 400px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }

    .warning-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: rgba(255,255,255,0.3);
      border-radius: 4px;
      margin: 1rem 0;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #28a745;
      transition: width 1s ease;
    }

    .button-group {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .btn {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: #28a745;
      color: white;
    }

    .btn-secondary {
      background: rgba(255,255,255,0.2);
      color: white;
    }

    .btn:hover {
      transform: translateY(-1px);
    }
  `]
})
export class CustomWarningComponent {
  @Input() warningData!: IdleWarningData;
  @Output() extend = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  get timeRemaining$() {
    return this.warningData?.timeRemaining$ || of(0);
  }

  get progressPercentage() {
    // Calculate progress based on remaining time
    const totalTime = 300000; // 5 minutes
    const remaining = this.warningData?.timeRemaining || 0;
    return (remaining / totalTime) * 100;
  }
}
```

## Best Practices

### 1. Configuration Guidelines

```typescript
// Production configuration
const productionConfig: IdleOAuthConfig = {
  idleTimeout: 1800000,      // 30 minutes
  warningTimeout: 300000,    // 5 minutes (16% of idle timeout)
  autoRefreshToken: true,
  refreshThreshold: 600000,  // 10 minutes before token expiry
  multiTabCoordination: true,
  debug: false
};

// Development configuration
const developmentConfig: IdleOAuthConfig = {
  idleTimeout: 300000,       // 5 minutes for testing
  warningTimeout: 60000,     // 1 minute warning
  autoRefreshToken: true,
  multiTabCoordination: false, // Easier debugging
  debug: true
};
```

### 2. Error Handling

```typescript
@Component({...})
export class AppComponent implements OnInit {
  constructor(private idleService: IdleOAuthService) {}

  ngOnInit(): void {
    try {
      this.idleService.initialize(config);
      this.idleService.start();
    } catch (error) {
      console.error('Failed to initialize idle detection:', error);
      // Implement fallback behavior
      this.handleIdleInitializationError(error);
    }

    // Subscribe to service errors
    this.idleService.error$.subscribe(error => {
      if (error) {
        this.handleIdleError(error);
      }
    });
  }

  private handleIdleError(error: any): void {
    // Log error
    console.error('Idle service error:', error);
    
    // Show user notification
    this.showErrorNotification('Session monitoring encountered an issue');
    
    // Attempt recovery
    setTimeout(() => {
      try {
        this.idleService.start();
      } catch (retryError) {
        // Fallback to manual logout
        this.router.navigate(['/login']);
      }
    }, 5000);
  }
}
```

### 3. Performance Optimization

```typescript
// Use OnPush change detection for warning dialog
@Component({
  selector: 'app-warning-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`
})
export class WarningDialogComponent {
  @Input() warningData!: IdleWarningData;
  
  constructor(private cdr: ChangeDetectorRef) {}
  
  ngOnInit(): void {
    // Manually trigger change detection for time updates
    this.warningData.timeRemaining$.subscribe(() => {
      this.cdr.markForCheck();
    });
  }
}

// Optimize with trackBy for lists
@Component({
  template: `
    <div *ngFor="let item of items; trackBy: trackByFn">
      {{ item.name }}
    </div>
  `
})
export class OptimizedComponent {
  trackByFn(index: number, item: any): any {
    return item.id;
  }
}
```

### 4. Testing

```typescript
// idle-oauth.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { IdleOAuthService } from './idle-oauth.service';

describe('IdleOAuthService', () => {
  let service: IdleOAuthService;
  let store: MockStore;
  
  const initialState = {
    idle: {
      status: 'active',
      isDetecting: false,
      timeRemaining: 0
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        IdleOAuthService,
        provideMockStore({ initialState })
      ]
    });
    
    service = TestBed.inject(IdleOAuthService);
    store = TestBed.inject(MockStore);
  });

  it('should initialize with correct config', () => {
    const config = {
      idleTimeout: 300000,
      warningTimeout: 60000
    };
    
    service.initialize(config);
    
    service.config$.subscribe(currentConfig => {
      expect(currentConfig.idleTimeout).toBe(300000);
      expect(currentConfig.warningTimeout).toBe(60000);
    });
  });

  it('should emit warning state when idle starts', (done) => {
    service.initialize({ idleTimeout: 300000, warningTimeout: 60000 });
    
    service.isWarning$.subscribe(isWarning => {
      if (isWarning) {
        expect(isWarning).toBe(true);
        done();
      }
    });
    
    // Simulate idle start
    service.start();
    // Trigger idle through testing utilities
  });
});
```

## API Reference

### IdleOAuthService

#### Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `initialize()` | `config: IdleOAuthConfig` | `void` | Initialize service with configuration |
| `start()` | None | `void` | Start idle detection |
| `stop()` | None | `void` | Stop idle detection |
| `reset()` | None | `void` | Reset idle timer |
| `extendSession()` | None | `void` | Extend user session |
| `logout()` | None | `void` | Logout user |
| `updateConfig()` | `config: Partial<IdleOAuthConfig>` | `void` | Update configuration |
| `getCurrentWarningData()` | None | `IdleWarningData \| null` | Get current warning data |
| `getWarningData()` | None | `Observable<IdleWarningData>` | Get warning data observable |

#### Observables

| Property | Type | Description |
|----------|------|-------------|
| `idleStatus$` | `Observable<IdleStatus>` | Current idle status |
| `isIdle$` | `Observable<boolean>` | Whether user is idle |
| `isWarning$` | `Observable<boolean>` | Whether warning is active |
| `timeRemaining$` | `Observable<number>` | Time remaining in ms |
| `config$` | `Observable<IdleOAuthConfig>` | Current configuration |
| `error$` | `Observable<any>` | Service errors |

### Types

#### IdleStatus

```typescript
enum IdleStatus {
  ACTIVE = 'active',
  WARNING = 'warning', 
  IDLE = 'idle'
}
```

#### IdleWarningData

```typescript
interface IdleWarningData {
  timeRemaining: number;
  timeRemaining$: Observable<number>;
  onExtendSession: () => void;
  onLogout: () => void;
  cssClasses?: {
    dialog?: string;
    title?: string;
    message?: string;
    buttons?: string;
  };
}
```

## Troubleshooting

### Common Issues

#### 1. NgRx Store Not Configured

**Problem**: `NullInjectorError: No provider for Store`

**Solution**:
```typescript
// main.ts
import { provideStore } from '@ngrx/store';
import { idleReducer } from '@idle-detection/angular-oauth-integration';

bootstrapApplication(AppComponent, {
  providers: [
    provideStore({
      idle: idleReducer  // Make sure this is included
    })
  ]
});
```

#### 2. Warning Dialog Not Showing

**Problem**: Dialog component not displaying

**Solution**:
```typescript
// Check subscription and data binding
ngOnInit(): void {
  this.idleService.isWarning$.subscribe(isWarning => {
    console.log('Warning state:', isWarning); // Debug log
    this.showWarning = isWarning;
    
    if (isWarning) {
      this.warningData = this.idleService.getCurrentWarningData();
      console.log('Warning data:', this.warningData); // Debug log
    }
  });
}
```

#### 3. Multi-Tab Not Working

**Problem**: Multi-tab coordination failing

**Solution**:
```typescript
// Check browser support
ngOnInit(): void {
  if ('BroadcastChannel' in window) {
    this.idleService.initialize({
      multiTabCoordination: true
    });
  } else {
    console.warn('Multi-tab coordination not supported');
    this.idleService.initialize({
      multiTabCoordination: false
    });
  }
}
```

#### 4. Memory Leaks

**Problem**: Memory leaks from subscriptions

**Solution**:
```typescript
export class AppComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  
  ngOnInit(): void {
    this.idleService.isWarning$.pipe(
      takeUntil(this.destroy$) // Always use takeUntil
    ).subscribe(/*...*/);
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.idleService.stop(); // Always cleanup
  }
}
```

### Debug Mode

Enable debug mode for troubleshooting:

```typescript
this.idleService.initialize({
  debug: true,  // Enable debug logging
  idleTimeout: 300000,
  warningTimeout: 60000
});

// Check browser console for detailed logs
```

### Browser Compatibility

- **Angular**: 15+ (standalone components)
- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+
- **Internet Explorer**: Not supported
- **Mobile**: Full support with touch events

## Migration Guide

### From Version 1.x to 2.x

```typescript
// Old API (v1.x)
this.idleService.configure({
  timeout: 300000
});

// New API (v2.x)
this.idleService.initialize({
  idleTimeout: 300000,
  warningTimeout: 60000
});

// Update component imports
// Old
import { IdleModule } from '@idle-detection/angular';

// New
import { IdleWarningDialogComponent } from '@idle-detection/angular-oauth-integration';
```

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues: [https://github.com/your-repo/idle-detection-angular/issues](https://github.com/your-repo/idle-detection-angular/issues)
- Documentation: [https://idle-detection.dev/angular](https://idle-detection.dev/angular)
- Examples: [https://github.com/your-repo/idle-detection-examples/angular](https://github.com/your-repo/idle-detection-examples/angular)
- Stack Overflow: Tag `angular-idle-detection`