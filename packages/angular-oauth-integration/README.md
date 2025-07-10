# @idle-detection/angular-oauth-integration

A comprehensive Angular library for detecting user inactivity and managing OAuth session timeouts with NgRx Store integration.

## Features

- **Angular 18+ Support** - Modern standalone components with signals
- **OAuth Integration** - Seamless integration with `angular-auth-oidc-client`
- **NgRx Store Integration** - Complete state management with actions, effects, and selectors
- **Style Agnostic** - Completely customizable CSS classes for any design system
- **Multi-tab Coordination** - Synchronized idle detection across browser tabs
- **Configurable Timeouts** - External JSON configuration support
- **Role-based Settings** - Different timeout values based on user roles
- **Accessibility Ready** - WCAG compliant with proper ARIA labels
- **TypeScript First** - Full type safety throughout

## Installation

```bash
npm install @idle-detection/angular-oauth-integration @idle-detection/core
npm install @ngrx/store @ngrx/effects angular-auth-oidc-client
```

## Quick Start

### Standalone Application

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideIdleOAuthConfig } from '@idle-detection/angular-oauth-integration';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(),
    provideEffects(),
    provideIdleOAuthConfig({
      idleTimeout: 15 * 60 * 1000,    // 15 minutes
      warningTimeout: 2 * 60 * 1000,  // 2 minutes warning
      autoRefreshToken: true,
      multiTabCoordination: true
    })
  ]
};
```

### Module-based Application

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { IdleOAuthModule } from '@idle-detection/angular-oauth-integration';

@NgModule({
  imports: [
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    IdleOAuthModule.forRoot({
      idleTimeout: 15 * 60 * 1000,
      warningTimeout: 2 * 60 * 1000,
      autoRefreshToken: true,
      multiTabCoordination: true
    })
  ]
})
export class AppModule {}
```

## Usage

### Basic Component Implementation

```typescript
// app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
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
  imports: [IdleWarningDialogComponent],
  template: \`
    <div class="app">
      <h1>My Application</h1>
      
      <idle-warning-dialog 
        *ngIf="showWarning"
        [warningData]="warningData"
        titleText="Session Expiring Soon"
        messageText="Your session will expire due to inactivity."
        (extendSession)="onExtendSession()"
        (logout)="onLogout()"
      ></idle-warning-dialog>
    </div>
  \`
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  showWarning = false;
  warningData!: IdleWarningData;

  constructor(private idleOAuthService: IdleOAuthService) {}

  ngOnInit(): void {
    this.idleOAuthService.start();

    this.idleOAuthService.isWarning$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isWarning => {
      this.showWarning = isWarning;
      
      if (isWarning) {
        this.idleOAuthService.getWarningData().pipe(
          takeUntil(this.destroy$)
        ).subscribe(data => {
          this.warningData = data;
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.idleOAuthService.stop();
  }

  onExtendSession(): void {
    this.showWarning = false;
    this.idleOAuthService.extendSession();
  }

  onLogout(): void {
    this.showWarning = false;
    this.idleOAuthService.logout();
  }
}
```

## Configuration Options

```typescript
interface IdleOAuthConfig {
  idleTimeout: number;              // Time in ms before user is considered idle
  warningTimeout: number;           // Time in ms to show warning before logout
  autoRefreshToken: boolean;        // Automatically refresh OAuth token
  multiTabCoordination: boolean;    // Sync idle state across tabs
  configUrl?: string;               // URL to load external configuration
  roleBased?: boolean;              // Enable role-based timeouts
  roleTimeouts?: Record<string, {   // Role-specific timeout configurations
    idle: number;
    warning: number;
  }>;
  customCssClasses?: {              // Custom CSS classes for styling
    dialog?: string;
    overlay?: string;
    title?: string;
    message?: string;
    button?: string;
    buttonPrimary?: string;
    buttonSecondary?: string;
  };
}
```

## Advanced Features

### Custom Styling

```typescript
provideIdleOAuthConfig({
  // ... other config
  customCssClasses: {
    dialog: 'my-custom-dialog',
    overlay: 'my-custom-overlay',
    title: 'my-custom-title',
    buttonPrimary: 'btn btn-primary',
    buttonSecondary: 'btn btn-secondary'
  }
})
```

### Role-based Timeouts

```typescript
provideIdleOAuthConfig({
  // ... other config
  roleBased: true,
  roleTimeouts: {
    'admin': { idle: 30 * 60 * 1000, warning: 5 * 60 * 1000 },
    'user': { idle: 15 * 60 * 1000, warning: 2 * 60 * 1000 },
    'guest': { idle: 5 * 60 * 1000, warning: 1 * 60 * 1000 }
  }
})
```

### External Configuration

```typescript
provideIdleOAuthConfig({
  // ... other config
  configUrl: '/api/idle-config'
})
```

## API Reference

### IdleOAuthService

#### Properties
- `idleState$: Observable<IdleState>` - Complete idle state
- `isIdle$: Observable<boolean>` - Whether user is idle
- `isWarning$: Observable<boolean>` - Whether warning is active
- `timeRemaining$: Observable<number>` - Time remaining in warning
- `idleStatus$: Observable<string>` - Current idle status

#### Methods
- `initialize(config: IdleOAuthConfig): void` - Initialize with configuration
- `start(): void` - Start idle detection
- `stop(): void` - Stop idle detection
- `extendSession(): void` - Extend the current session
- `logout(): void` - Logout the user
- `setUserRole(role: string): void` - Set user role for role-based timeouts

### IdleWarningDialogComponent

#### Inputs
- `warningData: IdleWarningData` - Warning data from service
- `titleText: string` - Dialog title
- `messageText: string` - Dialog message
- `extendText: string` - Extend button text
- `logoutText: string` - Logout button text

#### Outputs
- `extendSession: EventEmitter<void>` - Extend session event
- `logout: EventEmitter<void>` - Logout event

## NgRx Integration

The library provides complete NgRx integration:

### Actions
- `initializeIdle` - Initialize idle detection
- `startIdleDetection` - Start detection
- `userActivity` - User activity detected
- `startWarning` - Warning started
- `extendSession` - Session extended
- `logout` - User logout

### Selectors
- `selectIdleState` - Complete idle state
- `selectIsIdle` - Idle status
- `selectIsWarning` - Warning status
- `selectTimeRemaining` - Time remaining
- `selectConfig` - Current configuration

## License

MIT