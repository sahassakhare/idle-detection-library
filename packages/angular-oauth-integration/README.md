# Angular OAuth Integration for Idle Detection

A comprehensive Angular 18+ library for detecting user inactivity and managing OAuth session timeouts with **NgRx store**, style-agnostic components, and modern Angular features.

## Features

- **NgRx Store Integration** - Centralized state management with predictable state updates
- **Angular 18+ Support** - Modern standalone components with signals and inject() function
- **OAuth Integration** - Seamless integration with `angular-auth-oidc-client`
- **Style Agnostic** - Completely customizable CSS classes for any design system
- **Multi-tab Coordination** - Synchronized idle detection across browser tabs
- **Configurable Timeouts** - External JSON configuration support with environment-based settings
- **Role-based Settings** - Different timeout values based on user roles and permissions
- **Accessibility Ready** - WCAG compliant with proper ARIA labels and keyboard navigation
- **TypeScript First** - Full type safety with comprehensive interfaces
- **SSR Compatible** - Works with Angular Universal and server-side rendering
- **Automatic Token Refresh** - Refreshes OAuth tokens when user becomes active
- **Responsive Design** - Mobile-friendly warning dialogs with touch support

## Installation

```bash
npm install @idle-detection/angular-oauth-integration angular-auth-oidc-client @ngrx/store @ngrx/effects
```

## Quick Start

### 1. Basic Configuration (Angular 18+ Standalone with NgRx)

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAuth } from 'angular-auth-oidc-client';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideIdleOAuthWithStore } from '@idle-detection/angular-oauth-integration';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    // Configure OIDC first
    provideAuth({
      config: {
        authority: 'https://demo.duendesoftware.com',
        redirectUrl: window.location.origin,
        clientId: 'interactive.public',
        scope: 'openid profile email api offline_access',
        responseType: 'code',
        silentRenew: true,
        useRefreshToken: true
      }
    }),
    
    // Configure NgRx Store (if not already configured)
    provideStore(),
    provideEffects(),
    
    // Configure idle detection with NgRx store
    provideIdleOAuthWithStore({
      idleTimeout: 15 * 60 * 1000,        // 15 minutes
      warningTimeout: 2 * 60 * 1000,      // 2 minutes warning
      autoRefreshToken: true,
      multiTabCoordination: true,
      debug: false
    })
  ]
}).catch(err => console.error(err));
```

### 2. Component Usage with NgRx Selectors

```typescript
// app.component.ts
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { 
  IdleOAuthService, 
  IdleWarningDialogComponent,
  selectShowWarning,
  selectCurrentState,
  selectRemainingTime,
  selectSessionStatus
} from '@idle-detection/angular-oauth-integration';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IdleWarningDialogComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>My Secure Application</h1>
        
        <!-- Session Status Indicator -->
        <div class="session-status" [class]="sessionStatusClass()">
          <span class="status-icon">{{ sessionStatusIcon() }}</span>
          <span class="status-text">{{ sessionStatusText() }}</span>
        </div>
        
        <!-- User Info -->
        <div class="user-info" *ngIf="isAuthenticated$ | async">
          <span>Welcome, {{ userName() }}!</span>
          <button class="btn-logout" (click)="logout()">Logout</button>
        </div>
      </header>
      
      <main class="app-main">
        <!-- Your application content -->
        <router-outlet></router-outlet>
        
        <!-- Enhanced Idle Warning Dialog -->
        <idle-warning-dialog 
          *ngIf="showWarning$ | async"
          [dialogTitle]="'Session Expiring Soon'"
          [dialogMessage]="warningMessage()"
          [extendButtonLabel]="'Continue Working'"
          [logoutButtonLabel]="'Logout Now'"
          [showCountdown]="true"
          [showProgressBar]="true"
          [theme]="'default'"
          [size]="'medium'"
          [backdropClose]="false"
          primaryButtonClass="btn btn-primary"
          secondaryButtonClass="btn btn-outline-danger">
        </idle-warning-dialog>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .app-header {
      background: #f8f9fa;
      padding: 1rem 2rem;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .session-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .session-status.active { background: #d4edda; color: #155724; }
    .session-status.idle { background: #fff3cd; color: #856404; }
    .session-status.warning { background: #f8d7da; color: #721c24; }
    .session-status.timeout { background: #f5c6cb; color: #721c24; }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .btn-logout {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .app-main {
      flex: 1;
      padding: 2rem;
    }
  `]
})
export class AppComponent {
  // Inject services using Angular 18+ inject() function
  private idleService = inject(IdleOAuthService);
  private oidcService = inject(OidcSecurityService);
  private store = inject(Store);
  
  // NgRx Store selectors as observables
  showWarning$ = this.store.select(selectShowWarning);
  currentState$ = this.store.select(selectCurrentState);
  remainingTime$ = this.store.select(selectRemainingTime);
  sessionStatus$ = this.store.select(selectSessionStatus);
  
  // OIDC observables
  isAuthenticated$ = this.oidcService.isAuthenticated$;
  userData$ = this.oidcService.userData$;
  
  // Computed signals for derived state
  sessionStatusClass = computed(() => {
    // This would need to be converted to use async pipe or signals
    return 'active'; // placeholder
  });
  
  sessionStatusIcon = computed(() => {
    return 'Active'; // placeholder - replace with actual icon or indicator
  });
  
  sessionStatusText = computed(() => {
    return 'Active'; // placeholder
  });
  
  warningMessage = computed(() => {
    return `Your session will expire soon due to inactivity. Click "Continue Working" to extend your session.`;
  });
  
  userName = signal('User');

  ngOnInit() {
    // Subscribe to authentication state
    this.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        // Start idle monitoring when authenticated
        this.idleService.startWatching();
        
        // Get user data
        this.userData$.subscribe(userData => {
          this.userName.set(userData?.name || userData?.preferred_username || 'User');
        });
      } else {
        // Stop monitoring when not authenticated
        this.idleService.stopWatching();
      }
    });
  }
  
  logout() {
    this.oidcService.logoff();
  }
}
```

## NgRx Store Architecture

### Store Structure

The library uses NgRx for centralized state management with the following structure:

```typescript
// Store State
interface IdleState {
  isIdle: boolean;
  isWarning: boolean;
  isTimedOut: boolean;
  isWatching: boolean;
  lastActivity: Date;
  remainingTime: number;
  isRefreshingToken: boolean;
  refreshTokenError: any | null;
}

// Available Actions
- startWatching()
- stopWatching()
- resetIdle()
- idleStarted()
- warningStarted({ remainingTime })
- userActivity()
- timeout()
- refreshTokenRequest()
- refreshTokenSuccess()
- refreshTokenFailure({ error })
- logoutRequest()

// Available Selectors
- selectIsIdle
- selectIsWarning
- selectIsTimedOut
- selectIsWatching
- selectRemainingTime
- selectShowWarning
- selectCurrentState
- selectSessionStatus
```

### Using Store Selectors in Components

```typescript
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { 
  selectIsIdle, 
  selectShowWarning, 
  selectRemainingTime,
  IdleActions 
} from '@idle-detection/angular-oauth-integration';

@Component({
  template: `
    <div class="idle-status">
      <p *ngIf="isIdle$ | async">User is idle</p>
      <p *ngIf="showWarning$ | async">
        Warning: {{ remainingTime$ | async }} seconds remaining
      </p>
      <button (click)="resetIdle()">Reset Timer</button>
    </div>
  `
})
export class IdleStatusComponent {
  private store = inject(Store);
  
  isIdle$ = this.store.select(selectIsIdle);
  showWarning$ = this.store.select(selectShowWarning);
  remainingTime$ = this.store.select(selectRemainingTime);
  
  resetIdle() {
    this.store.dispatch(IdleActions.resetIdle());
  }
}
```

## Configuration

### Core Configuration Interface

```typescript
interface AngularIdleOAuthConfig {
  // === Core Idle Detection Settings ===
  idleTimeout?: number;                    // Time before user is considered idle (default: 15 minutes)
  warningTimeout?: number;                 // Time before timeout after idle (default: 2 minutes)
  autoResume?: boolean;                    // Automatically resume on activity (default: true)
  idleName?: string;                       // Unique name for multi-instance support

  // === OAuth-specific Settings ===
  autoRefreshToken?: boolean;              // Auto-refresh token when user becomes active (default: true)
  logoutOnTimeout?: boolean;               // Automatically logout on timeout (default: true)
  redirectOnTimeout?: string;              // URL to redirect to after timeout
  
  // === Multi-tab Coordination ===
  multiTabCoordination?: boolean;          // Enable multi-tab coordination (default: true)
  multiTabStorageKey?: string;             // Storage key for multi-tab coordination
  
  // === Warning Dialog Settings ===
  showWarningDialog?: boolean;             // Show warning dialog before timeout (default: true)
  warningDialogConfig?: {
    title?: string;                        // Dialog title
    message?: string;                      // Dialog message
    theme?: 'default' | 'dark' | 'minimal'; // Pre-built theme
    size?: 'small' | 'medium' | 'large';  // Dialog size
    showCountdown?: boolean;               // Show countdown timer
    showProgressBar?: boolean;             // Show progress bar
    autoClose?: boolean;                   // Auto-close on timeout
    backdropClose?: boolean;               // Close on backdrop click
  };
  
  // === Debug & Development ===
  debug?: boolean;                         // Enable debug logging (default: false)
}
```

### Environment-Based Configuration

```typescript
// src/environments/environment.ts (Development)
export const environment = {
  production: false,
  idleConfig: {
    idleTimeout: 5 * 60 * 1000,           // 5 minutes for development
    warningTimeout: 30 * 1000,            // 30 seconds warning
    autoRefreshToken: true,
    multiTabCoordination: true,
    debug: true,
    
    warningDialogConfig: {
      title: 'DEV: Session Timeout',
      message: 'Development mode - shorter timeout for testing',
      theme: 'dark',
      size: 'large',
      showProgressBar: true,
      showCountdown: true,
      backdropClose: true                 // Allow closing in dev
    }
  }
};

// src/environments/environment.prod.ts (Production)
export const environment = {
  production: true,
  idleConfig: {
    idleTimeout: 30 * 60 * 1000,          // 30 minutes for production
    warningTimeout: 5 * 60 * 1000,        // 5 minutes warning
    autoRefreshToken: true,
    multiTabCoordination: true,
    debug: false,
    
    warningDialogConfig: {
      title: 'Session Timeout Warning',
      message: 'Your session will expire soon due to inactivity.',
      theme: 'default',
      size: 'medium',
      showProgressBar: true,
      showCountdown: true,
      backdropClose: false                // Prevent accidental closing
    }
  }
};

// main.ts - Using environment configuration
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    provideIdleOAuthWithStore(environment.idleConfig)
  ]
});
```

### External JSON Configuration

```json
// src/assets/config/idle-config.json
{
  "development": {
    "idleTimeout": 300000,
    "warningTimeout": 30000,
    "autoRefreshToken": true,
    "multiTabCoordination": true,
    "debug": true,
    "warningDialogConfig": {
      "title": "DEV: Session Expiring",
      "message": "Development environment - short timeout for testing",
      "theme": "dark",
      "size": "large",
      "showProgressBar": true,
      "showCountdown": true,
      "autoClose": false,
      "backdropClose": true
    }
  },
  "production": {
    "idleTimeout": 1800000,
    "warningTimeout": 300000,
    "autoRefreshToken": true,
    "multiTabCoordination": true,
    "debug": false,
    "warningDialogConfig": {
      "title": "Session Timeout Warning",
      "message": "Your session will expire soon due to inactivity.",
      "theme": "default",
      "size": "medium",
      "showProgressBar": true,
      "showCountdown": true,
      "autoClose": false,
      "backdropClose": false
    }
  }
}
```

#### Configuration Service with JSON Loading

```typescript
// src/app/services/config.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AngularIdleOAuthConfig } from '@idle-detection/angular-oauth-integration';

export interface AppConfig {
  development: AngularIdleOAuthConfig;
  production: AngularIdleOAuthConfig;
  staging: AngularIdleOAuthConfig;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private http = inject(HttpClient);
  private config: AngularIdleOAuthConfig | null = null;

  async loadConfig(): Promise<AngularIdleOAuthConfig> {
    if (this.config) {
      return this.config;
    }

    try {
      const configs = await firstValueFrom(
        this.http.get<AppConfig>('assets/config/idle-config.json')
      );
      
      const environment = this.getEnvironment();
      this.config = configs[environment] || configs.production;
      
      console.log(`Loaded idle config for ${environment}:`, this.config);
      return this.config;
    } catch (error) {
      console.error('Failed to load config, using defaults:', error);
      
      // Fallback configuration
      this.config = {
        idleTimeout: 15 * 60 * 1000,
        warningTimeout: 2 * 60 * 1000,
        autoRefreshToken: true,
        multiTabCoordination: true,
        debug: false
      };
      
      return this.config;
    }
  }

  private getEnvironment(): keyof AppConfig {
    const hostname = window.location.hostname;
    
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      return 'development';
    } else if (hostname.includes('staging') || hostname.includes('dev.')) {
      return 'staging';
    } else {
      return 'production';
    }
  }
}

// main.ts - Using APP_INITIALIZER for config loading
import { APP_INITIALIZER } from '@angular/core';
import { ConfigService } from './app/services/config.service';

function initializeApp(configService: ConfigService) {
  return () => configService.loadConfig();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ConfigService],
      multi: true
    },
    
    // Dynamic config provider
    {
      provide: 'IDLE_CONFIG_FACTORY',
      useFactory: (configService: ConfigService) => {
        return configService.getConfig() || {
          idleTimeout: 15 * 60 * 1000,
          warningTimeout: 2 * 60 * 1000,
          autoRefreshToken: true
        };
      },
      deps: [ConfigService]
    }
  ]
});
```

### Role-Based Configuration

```typescript
// src/app/services/role-based-config.service.ts
import { Injectable, inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AngularIdleOAuthConfig } from '@idle-detection/angular-oauth-integration';
import { map, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleBasedConfigService {
  private oidcService = inject(OidcSecurityService);

  private roleConfigs: Record<string, AngularIdleOAuthConfig> = {
    admin: {
      idleTimeout: 60 * 60 * 1000,         // 1 hour for admins
      warningTimeout: 10 * 60 * 1000,      // 10 minutes warning
      autoRefreshToken: true,
      multiTabCoordination: true,
      debug: true,
      warningDialogConfig: {
        title: 'Admin Session Warning',
        message: 'Your administrative session will expire soon.',
        theme: 'default',
        size: 'large',
        showCountdown: true,
        showProgressBar: true
      }
    },
    moderator: {
      idleTimeout: 45 * 60 * 1000,         // 45 minutes for moderators
      warningTimeout: 5 * 60 * 1000,       // 5 minutes warning
      autoRefreshToken: true,
      multiTabCoordination: true,
      debug: false,
      warningDialogConfig: {
        title: 'Moderator Session Warning',
        message: 'Your moderator session will expire soon.',
        theme: 'default',
        size: 'medium'
      }
    },
    user: {
      idleTimeout: 30 * 60 * 1000,         // 30 minutes for regular users
      warningTimeout: 5 * 60 * 1000,       // 5 minutes warning
      autoRefreshToken: true,
      multiTabCoordination: true,
      debug: false
    },
    guest: {
      idleTimeout: 10 * 60 * 1000,         // 10 minutes for guests
      warningTimeout: 2 * 60 * 1000,       // 2 minutes warning
      autoRefreshToken: false,
      multiTabCoordination: false,
      debug: false,
      warningDialogConfig: {
        title: 'Guest Session Expiring',
        message: 'Guest sessions have shorter timeouts. Please save your work.',
        theme: 'minimal',
        size: 'small'
      }
    }
  };

  async getConfigForCurrentUser(): Promise<AngularIdleOAuthConfig> {
    try {
      const userData = await firstValueFrom(this.oidcService.userData$);
      const userRoles = userData?.role || userData?.roles || [];
      const role = this.determineHighestRole(Array.isArray(userRoles) ? userRoles : [userRoles]);
      
      const config = this.roleConfigs[role] || this.roleConfigs.user;
      console.log(`Applied idle config for role: ${role}`, config);
      
      return config;
    } catch (error) {
      console.warn('Failed to get user roles, using default config:', error);
      return this.roleConfigs.user;
    }
  }

  private determineHighestRole(roles: string[]): string {
    const roleHierarchy = ['admin', 'moderator', 'user', 'guest'];
    
    for (const role of roleHierarchy) {
      if (roles.some(userRole => 
        userRole.toLowerCase().includes(role) || 
        userRole.toLowerCase() === role
      )) {
        return role;
      }
    }
    
    return 'guest';
  }
}
```

## Style-Agnostic Styling System

The `IdleWarningDialogComponent` is completely style-agnostic, allowing you to apply your own CSS styles and integrate seamlessly with any design system.

### Option 1: Pre-built Themes

```scss
// Import in your global styles.css or component styles
@import '@idle-detection/angular-oauth-integration/styles/default-theme.css';

// Or choose a different theme
@import '@idle-detection/angular-oauth-integration/styles/dark-theme.css';
@import '@idle-detection/angular-oauth-integration/styles/minimal-theme.css';
```

### Option 2: Framework Integration

#### Bootstrap 5 Integration
```html
<idle-warning-dialog
  backdropClass="modal-backdrop"
  dialogClass="modal-dialog modal-dialog-centered"
  headerClass="modal-header"
  titleClass="modal-title h5"
  bodyClass="modal-body"
  messageClass="text-muted mb-3"
  countdownClass="alert alert-warning"
  countdownTimeClass="fs-3 fw-bold text-danger"
  progressClass="progress mb-3"
  progressBarClass="progress-bar bg-danger"
  actionsClass="modal-footer"
  primaryButtonClass="btn btn-primary"
  secondaryButtonClass="btn btn-outline-secondary">
</idle-warning-dialog>
```

#### Tailwind CSS Integration
```html
<idle-warning-dialog
  backdropClass="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  dialogClass="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all"
  headerClass="px-6 py-4 border-b border-gray-200"
  titleClass="text-lg font-semibold text-gray-900"
  bodyClass="px-6 py-4"
  messageClass="text-gray-700 mb-4"
  countdownClass="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4"
  countdownLabelClass="text-sm text-gray-600 block mb-1"
  countdownTimeClass="text-2xl font-mono font-bold text-red-600"
  progressClass="w-full bg-gray-200 rounded-full h-2 mb-4"
  progressBarClass="bg-red-600 h-2 rounded-full transition-all duration-1000"
  actionsClass="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3"
  primaryButtonClass="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
  secondaryButtonClass="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors">
</idle-warning-dialog>
```

#### Angular Material Integration
```typescript
@Component({
  template: `
    <idle-warning-dialog
      dialogClass="mat-mdc-dialog-surface mdc-dialog__surface"
      headerClass="mat-mdc-dialog-title"
      titleClass="mdc-dialog__title"
      bodyClass="mat-mdc-dialog-content mdc-dialog__content"
      actionsClass="mat-mdc-dialog-actions mdc-dialog__actions"
      primaryButtonClass="mat-mdc-raised-button mat-primary"
      secondaryButtonClass="mat-mdc-outlined-button">
    </idle-warning-dialog>
  `
})
export class MyComponent { }
```

### Option 3: Complete Customization

#### Available CSS Class Inputs

| Input Property | Default Value | Description |
|---------------|---------------|-------------|
| `backdropClass` | `'idle-warning-backdrop'` | Backdrop/overlay element |
| `dialogClass` | `'idle-warning-dialog'` | Main dialog container |
| `headerClass` | `'idle-warning-header'` | Header section |
| `bodyClass` | `'idle-warning-body'` | Body/content section |
| `titleClass` | `'idle-warning-title'` | Title heading |
| `messageClass` | `'idle-warning-message'` | Message paragraph |
| `countdownClass` | `'idle-warning-countdown'` | Countdown container |
| `countdownLabelClass` | `'countdown-label'` | "Time remaining" label |
| `countdownTimeClass` | `'countdown-time'` | Countdown timer display |
| `progressClass` | `'idle-warning-progress'` | Progress bar container |
| `progressBarClass` | `'progress-bar'` | Progress bar fill |
| `actionsClass` | `'idle-warning-actions'` | Buttons container |
| `primaryButtonClass` | `'btn btn-primary'` | Extend session button |
| `secondaryButtonClass` | `'btn btn-secondary'` | Logout button |

#### Custom Theme Example

```scss
// corporate-theme.scss
.corporate-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 31, 63, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.corporate-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 31, 63, 0.3);
  max-width: 480px;
  width: 90%;
  font-family: 'Inter', -apple-system, sans-serif;
  overflow: hidden;
  animation: slideInScale 0.3s ease-out;
}

.corporate-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.corporate-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #001f3f;
  text-align: center;
}

.corporate-body {
  padding: 24px;
}

.corporate-message {
  margin: 0 0 20px;
  color: #374151;
  line-height: 1.6;
  text-align: center;
}

.corporate-countdown {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 16px;
  margin: 20px 0;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.corporate-countdown::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #f59e0b, transparent);
  animation: shimmer 2s infinite;
}

.corporate-countdown-time {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: #dc2626;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  margin-top: 8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.corporate-progress {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin: 16px 0;
}

.corporate-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #dc2626, #ef4444);
  transition: width 1s ease-out;
  border-radius: 3px;
}

.corporate-actions {
  padding: 16px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: center;
  background: #f8fafc;
}

.corporate-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 120px;
  font-size: 0.875rem;
  position: relative;
  overflow: hidden;
}

.corporate-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.corporate-btn:hover::before {
  width: 300px;
  height: 300px;
}

.corporate-btn-primary {
  background: linear-gradient(135deg, #001f3f 0%, #003366 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 31, 63, 0.3);
}

.corporate-btn-primary:hover {
  background: linear-gradient(135deg, #003366 0%, #004080 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 31, 63, 0.4);
}

.corporate-btn-secondary {
  background: white;
  color: #6b7280;
  border: 2px solid #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.corporate-btn-secondary:hover {
  border-color: #9ca3af;
  color: #374151;
  background: #f9fafb;
  transform: translateY(-1px);
}

@keyframes slideInScale {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

// Dark mode support
@media (prefers-color-scheme: dark) {
  .corporate-dialog {
    background: #1f2937;
    color: #f9fafb;
  }
  
  .corporate-header {
    background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
    border-bottom-color: #4b5563;
  }
  
  .corporate-title {
    color: #f9fafb;
  }
  
  .corporate-message {
    color: #d1d5db;
  }
  
  .corporate-actions {
    background: #374151;
  }
}

// Accessibility enhancements
@media (prefers-reduced-motion: reduce) {
  .corporate-dialog,
  .corporate-btn,
  .corporate-progress-bar {
    animation: none;
    transition: none;
  }
}

@media (prefers-contrast: high) {
  .corporate-dialog {
    border: 2px solid #000;
  }
  
  .corporate-btn {
    border: 2px solid currentColor;
  }
}
```

## API Reference

### IdleOAuthService (Updated for NgRx)

#### Properties
- `state$: Observable<IdleStateView>` - Observable with current idle state
- `isIdle$: Observable<boolean>` - Observable indicating if user is idle
- `isWarning$: Observable<boolean>` - Observable indicating if in warning phase
- `isTimedOut$: Observable<boolean>` - Observable indicating if session timed out
- `showWarning$: Observable<boolean>` - Observable indicating if warning dialog should be shown
- `remainingTime$: Observable<number>` - Observable with remaining time in seconds
- `sessionStatus$: Observable<string>` - Observable with session status ('active' | 'idle' | 'warning' | 'timeout')

#### Methods
- `startWatching(): void` - Start monitoring for idle activity
- `stopWatching(): void` - Stop monitoring for idle activity
- `resetIdle(): void` - Reset the idle timer (mark user as active)
- `extendSession(): void` - Extend the session (same as resetIdle)
- `logoutNow(): void` - Manually logout user immediately
- `getCurrentState(): Observable<IdleStateView>` - Get current idle state as observable
- `isUserIdle(): Observable<boolean>` - Check if user is currently idle
- `isUserInWarning(): Observable<boolean>` - Check if user is in warning state
- `isUserTimedOut(): Observable<boolean>` - Check if user has timed out

### IdleStateView Interface

```typescript
interface IdleStateView {
  isIdle: boolean;              // User is currently idle
  isWarning: boolean;           // In warning phase before timeout
  isTimedOut: boolean;          // Session has timed out
  lastActivity: Date;           // Timestamp of last user activity
  remainingTime?: number;       // Seconds remaining in warning phase
}
```

### NgRx Store Selectors

```typescript
// Available selectors for use in components
import { 
  selectIsIdle,
  selectIsWarning,
  selectIsTimedOut,
  selectIsWatching,
  selectLastActivity,
  selectRemainingTime,
  selectIsRefreshingToken,
  selectRefreshTokenError,
  selectShowWarning,
  selectCurrentState,
  selectSessionStatus
} from '@idle-detection/angular-oauth-integration';
```

### NgRx Actions

```typescript
// Available actions for dispatching
import { 
  startWatching,
  stopWatching,
  resetIdle,
  idleStarted,
  warningStarted,
  warningTick,
  userActivity,
  timeout,
  refreshTokenRequest,
  refreshTokenSuccess,
  refreshTokenFailure,
  logoutRequest,
  logoutSuccess,
  updateConfig
} from '@idle-detection/angular-oauth-integration';
```

## Testing

### Unit Testing with Jest

```typescript
// idle-oauth.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { IdleOAuthService } from './idle-oauth.service';
import { initialIdleState } from './store/idle.state';
import { of } from 'rxjs';

describe('IdleOAuthService', () => {
  let service: IdleOAuthService;
  let store: MockStore;
  let mockOidcService: jasmine.SpyObj<OidcSecurityService>;

  beforeEach(() => {
    const oidcSpy = jasmine.createSpyObj('OidcSecurityService', [
      'checkAuth',
      'forceRefreshSession',
      'logoff'
    ], {
      isAuthenticated$: of(true),
      userData$: of({ name: 'Test User', role: 'user' })
    });

    TestBed.configureTestingModule({
      providers: [
        IdleOAuthService,
        { provide: OidcSecurityService, useValue: oidcSpy },
        provideMockStore({ initialState: { idle: initialIdleState } })
      ]
    });

    service = TestBed.inject(IdleOAuthService);
    store = TestBed.inject(MockStore);
    mockOidcService = TestBed.inject(OidcSecurityService) as jasmine.SpyObj<OidcSecurityService>;
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should dispatch startWatching action when startWatching is called', () => {
    spyOn(store, 'dispatch');
    service.startWatching();
    expect(store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
      type: '[Idle] Start Watching'
    }));
  });

  it('should return observables from store selectors', () => {
    expect(service.isIdle$).toBeDefined();
    expect(service.isWarning$).toBeDefined();
    expect(service.remainingTime$).toBeDefined();
  });
});
```

### Component Testing

```typescript
// idle-warning-dialog.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { IdleWarningDialogComponent } from './idle-warning-dialog.component';
import { IdleOAuthService } from './idle-oauth.service';
import { initialIdleState } from './store/idle.state';

describe('IdleWarningDialogComponent', () => {
  let component: IdleWarningDialogComponent;
  let fixture: ComponentFixture<IdleWarningDialogComponent>;
  let store: MockStore;
  let mockIdleService: jasmine.SpyObj<IdleOAuthService>;

  beforeEach(async () => {
    const idleSpy = jasmine.createSpyObj('IdleOAuthService', [
      'extendSession',
      'logoutNow'
    ]);

    await TestBed.configureTestingModule({
      imports: [IdleWarningDialogComponent],
      providers: [
        { provide: IdleOAuthService, useValue: idleSpy },
        provideMockStore({ 
          initialState: { 
            idle: { 
              ...initialIdleState, 
              remainingTime: 120,
              isWarning: true 
            } 
          } 
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IdleWarningDialogComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    mockIdleService = TestBed.inject(IdleOAuthService) as jasmine.SpyObj<IdleOAuthService>;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should display remaining time from store', () => {
    component.ngOnInit();
    fixture.detectChanges();
    
    const timeElement = fixture.nativeElement.querySelector('.countdown-time');
    expect(timeElement?.textContent).toContain('02:00');
  });

  it('should call extendSession when primary button clicked', () => {
    component.ngOnInit();
    fixture.detectChanges();
    
    const extendButton = fixture.nativeElement.querySelector('.btn-primary');
    extendButton?.click();
    
    expect(mockIdleService.extendSession).toHaveBeenCalled();
  });

  it('should call logoutNow when secondary button clicked', () => {
    component.ngOnInit();
    fixture.detectChanges();
    
    const logoutButton = fixture.nativeElement.querySelector('.btn-secondary');
    logoutButton?.click();
    
    expect(mockIdleService.logoutNow).toHaveBeenCalled();
  });
});
```

### E2E Testing with Cypress

```typescript
// cypress/e2e/idle-detection.cy.ts
describe('Idle Detection Integration with NgRx', () => {
  beforeEach(() => {
    // Mock OIDC authentication
    cy.intercept('GET', '**/auth/**', { fixture: 'auth-success.json' });
    cy.visit('/');
    cy.login(); // Custom command for authentication
  });

  it('should show warning dialog after idle timeout', () => {
    // Wait for idle timeout (adjust based on test config)
    cy.wait(5000);
    
    // Warning dialog should appear
    cy.get('[data-testid="idle-warning-dialog"]').should('be.visible');
    cy.get('[data-testid="countdown-timer"]').should('contain', '02:00');
    cy.get('[data-testid="progress-bar"]').should('exist');
  });

  it('should extend session when continue button clicked', () => {
    // Trigger warning dialog
    cy.wait(5000);
    
    // Click extend session button
    cy.get('[data-testid="extend-session-btn"]').click();
    
    // Dialog should disappear
    cy.get('[data-testid="idle-warning-dialog"]').should('not.exist');
    
    // User should remain authenticated
    cy.get('[data-testid="user-menu"]').should('be.visible');
  });

  it('should logout when logout button clicked', () => {
    // Trigger warning dialog
    cy.wait(5000);
    
    // Click logout button
    cy.get('[data-testid="logout-now-btn"]').click();
    
    // Should redirect to login
    cy.url().should('include', '/login');
  });

  it('should reset timer on user activity', () => {
    // Start timer
    cy.wait(3000);
    
    // Perform user activity
    cy.get('body').click();
    cy.get('body').type('test');
    
    // Wait longer without warning appearing
    cy.wait(3000);
    cy.get('[data-testid="idle-warning-dialog"]').should('not.exist');
  });

  it('should work with NgRx DevTools', () => {
    // Check if NgRx DevTools extension is available
    cy.window().should('have.property', '__REDUX_DEVTOOLS_EXTENSION__');
    
    // Perform some actions and verify store state changes
    cy.get('body').click(); // Trigger user activity
    
    // In a real test, you might check the store state through custom commands
    cy.window().its('store').should('exist');
  });
});
```

## Contributing

We welcome contributions! Here's how to get started:

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/idle-detection-library.git
   cd idle-detection-library
   ```

2. **Install Dependencies**
   ```bash
   npm install
   npm run bootstrap
   ```

3. **Build the Library**
   ```bash
   npm run build:angular-oauth-integration
   ```

4. **Run Tests**
   ```bash
   npm test
   npm run e2e
   ```

5. **Start Example App**
   ```bash
   npm run start:example
   ```

### Coding Standards

- **TypeScript**: Use strict mode with proper type annotations
- **Angular**: Follow Angular Style Guide, use standalone components and signals
- **NgRx**: Follow NgRx best practices, use effects for side effects
- **CSS**: Use BEM methodology, support dark mode and accessibility
- **Testing**: Maintain 80%+ code coverage
- **Documentation**: Update docs for new features

### Commit Convention

Use conventional commits:
```bash
feat(ngrx): add role-based timeout configuration
fix(dialog): resolve styling conflict with Bootstrap
docs(readme): update installation instructions
test(store): add unit tests for idle effects
```

## License

MIT License - see [LICENSE](../../LICENSE) file for details.

## Acknowledgments

- [angular-auth-oidc-client](https://github.com/damienbod/angular-auth-oidc-client) for OAuth integration
- [NgRx](https://ngrx.io/) for state management
- Angular team for the amazing framework and modern features
- Community contributors and maintainers

## Support & Community

- **Issues**: [GitHub Issues](https://github.com/your-username/idle-detection-library/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/idle-detection-library/discussions)
- **Email**: support@idle-detection-library.com
- **Documentation**: [Full Documentation](https://idle-detection-library.dev)

## Migration from RxJS to NgRx

If you're upgrading from a previous version that used RxJS subjects, here's a migration guide:

### Before (RxJS)
```typescript
// Old way with RxJS subjects
export class AppComponent {
  private idleService = inject(IdleOAuthService);
  
  ngOnInit() {
    // Subscribe to service observables
    this.idleService.state$.subscribe(state => {
      // Handle state changes
    });
    
    this.idleService.warning$.subscribe(remainingTime => {
      // Handle warning countdown
    });
  }
}
```

### After (NgRx)
```typescript
// New way with NgRx store
export class AppComponent {
  private store = inject(Store);
  private idleService = inject(IdleOAuthService);
  
  // Use store selectors
  showWarning$ = this.store.select(selectShowWarning);
  remainingTime$ = this.store.select(selectRemainingTime);
  currentState$ = this.store.select(selectCurrentState);
  
  ngOnInit() {
    // Optional: Subscribe to specific selectors if needed
    this.showWarning$.subscribe(showWarning => {
      // Handle warning state
    });
  }
}
```

### Key Benefits of NgRx Migration
- **Centralized State**: All idle detection state in one place
- **Predictable Updates**: Actions and reducers make state changes clear
- **Better Testing**: Pure functions are easier to test
- **DevTools Support**: NgRx DevTools for debugging
- **Performance**: Memoized selectors prevent unnecessary re-computations

---

**Made with care for the Angular community**