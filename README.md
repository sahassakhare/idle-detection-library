# Idle Detection Library

[![npm version](https://badge.fury.io/js/%40idle-detection%2Fangular-oauth-integration.svg)](https://badge.fury.io/js/%40idle-detection%2Fangular-oauth-integration)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Angular](https://img.shields.io/badge/Angular-18%2B-red.svg)](https://angular.io/)

A comprehensive, production-ready Angular library for detecting user inactivity and managing OAuth session timeouts with NgRx state management. Built with Angular 18+ and featuring full TypeScript support, reactive patterns, and extensive customization options.

## Features

### Core Functionality
- **User Activity Detection** - Monitors mouse, keyboard, touch, and scroll events
- **Configurable Timeouts** - Separate idle and warning timeouts
- **Warning System** - Customizable warning dialogs with countdown timers
- **OAuth Integration** - Seamless integration with `angular-auth-oidc-client`
- **Automatic Token Refresh** - Optional token refresh during warning period
- **Multi-Tab Coordination** - Synchronize idle state across browser tabs

### State Management
- **NgRx Integration** - Full reactive state management with NgRx Store
- **Type-Safe Actions** - Strongly typed actions and state
- **Reactive Patterns** - Observable-based APIs for real-time updates
- **Developer Tools** - NgRx DevTools support for debugging

### Advanced Features
- **Role-Based Timeouts** - Different timeout settings per user role
- **Custom Styling** - CSS class customization for all UI components
- **Responsive Design** - Mobile and desktop optimized
- **External Configuration** - Load configuration from external URLs
- **SSR Support** - Server-side rendering compatible
- **Performance Optimized** - Minimal bundle size and efficient event handling

## Installation

### 1. Install the Package

```bash
npm install @idle-detection/angular-oauth-integration @idle-detection/core
```

### 2. Install Peer Dependencies

```bash
npm install @angular/core @angular/common @ngrx/store @ngrx/effects angular-auth-oidc-client
```

## Packages

This is a monorepo containing:

- **`@idle-detection/core`** - Core idle detection logic (framework-agnostic)
- **`@idle-detection/angular-oauth-integration`** - Main Angular library with OAuth integration
- **`@idle-detection/keepalive`** - Optional keepalive functionality
- **Example Applications** - Demonstration projects showing different integrations

## Configuration

### Basic Setup

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideIdleOAuth } from '@idle-detection/angular-oauth-integration';

import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideStore(),
    provideEffects(),
    provideIdleOAuth({
      idleTimeout: 20 * 60 * 1000,    // 20 minutes
      warningTimeout: 5 * 60 * 1000,  // 5 minutes warning
      autoRefreshToken: true,
      multiTabCoordination: true
    })
  ]
});
```

### Configuration Options

```typescript
interface IdleOAuthConfig {
  // Timing Configuration
  idleTimeout: number;              // Total idle time before logout (ms)
  warningTimeout: number;           // Warning period duration (ms)
  
  // OAuth Integration
  autoRefreshToken: boolean;        // Auto-refresh tokens during warning
  
  // Multi-Tab Features
  multiTabCoordination: boolean;    // Sync state across tabs
  
  // External Configuration
  configUrl?: string;               // Load config from URL
  
  // Role-Based Configuration
  roleBased?: boolean;              // Enable role-based timeouts
  roleTimeouts?: Record<string, {   // Per-role timeout settings
    idle: number;
    warning: number;
  }>;
  
  // Custom Styling
  customCssClasses?: {
    dialog?: string;                // Dialog container class
    overlay?: string;               // Background overlay class
    title?: string;                 // Title text class
    message?: string;               // Message text class
    button?: string;                // Base button class
    buttonPrimary?: string;         // Primary button class
    buttonSecondary?: string;       // Secondary button class
  };
}
```

## Usage Examples

### Basic Component Integration

```typescript
import { Component, inject } from '@angular/core';
import { IdleOAuthService } from '@idle-detection/angular-oauth-integration';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>
      
      <!-- Idle Status Display -->
      <div class="status-bar">
        <span>Status: {{ idleStatus$ | async }}</span>
        <span *ngIf="timeRemaining$ | async as time">
          Time remaining: {{ time / 1000 | number:'1.0-0' }}s
        </span>
      </div>
      
      <!-- Manual Controls -->
      <div class="controls">
        <button (click)="extendSession()">Extend Session</button>
        <button (click)="logout()">Logout</button>
      </div>
      
      <!-- Warning Dialog -->
      <idle-warning-dialog 
        *ngIf="isWarning$ | async"
        [warningData]="warningData$ | async">
      </idle-warning-dialog>
    </div>
  `
})
export class DashboardComponent {
  private idleService = inject(IdleOAuthService);
  
  // Reactive State
  idleStatus$ = this.idleService.idleStatus$;
  isWarning$ = this.idleService.isWarning$;
  timeRemaining$ = this.idleService.timeRemaining$;
  warningData$ = this.idleService.getWarningData();
  
  extendSession() {
    this.idleService.extendSession();
  }
  
  logout() {
    this.idleService.logout();
  }
}
```

### Advanced Configuration with Roles

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideIdleOAuth } from '@idle-detection/angular-oauth-integration';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    provideIdleOAuth({
      idleTimeout: 30 * 60 * 1000,    // Default: 30 minutes
      warningTimeout: 5 * 60 * 1000,  // Default: 5 minutes
      autoRefreshToken: true,
      multiTabCoordination: true,
      roleBased: true,
      roleTimeouts: {
        'admin': {
          idle: 60 * 60 * 1000,        // 60 minutes
          warning: 10 * 60 * 1000      // 10 minutes warning
        },
        'user': {
          idle: 30 * 60 * 1000,        // 30 minutes
          warning: 5 * 60 * 1000       // 5 minutes warning
        },
        'guest': {
          idle: 15 * 60 * 1000,        // 15 minutes
          warning: 2 * 60 * 1000       // 2 minutes warning
        }
      },
      customCssClasses: {
        dialog: 'custom-idle-dialog',
        overlay: 'custom-overlay blur-effect',
        title: 'dialog-title text-xl font-bold',
        message: 'dialog-message text-gray-600',
        buttonPrimary: 'btn btn-primary px-4 py-2',
        buttonSecondary: 'btn btn-secondary px-4 py-2'
      }
    })
  ]
};
```

## Styling and Customization

### CSS Classes

The library provides CSS class hooks for complete customization:

```css
/* Custom dialog styling */
.custom-idle-dialog {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.custom-overlay {
  backdrop-filter: blur(5px);
  background: rgba(0, 0, 0, 0.6);
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.dialog-message {
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.5;
}

/* Responsive design */
@media (max-width: 768px) {
  .custom-idle-dialog {
    margin: 20px;
    padding: 16px;
  }
}
```

### Framework Integration

```typescript
// Bootstrap Integration
provideIdleOAuth({
  customCssClasses: {
    dialog: 'modal-content',
    title: 'modal-title',
    buttonPrimary: 'btn btn-primary',
    buttonSecondary: 'btn btn-secondary'
  }
});

// Tailwind CSS Integration
provideIdleOAuth({
  customCssClasses: {
    dialog: 'bg-white rounded-lg shadow-xl p-6',
    overlay: 'bg-black bg-opacity-50 backdrop-blur-sm',
    title: 'text-xl font-semibold text-gray-900 mb-4',
    message: 'text-gray-600 mb-6',
    buttonPrimary: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
    buttonSecondary: 'bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400'
  }
});
```

## Use Cases

### 1. Enterprise Applications
- **Financial Systems** - Secure timeout for sensitive data access
- **Healthcare Apps** - HIPAA compliance with automatic logout
- **Administrative Dashboards** - Prevent unauthorized access to admin panels
- **Data Entry Systems** - Auto-save work before session timeout

### 2. Multi-Tenant Applications
- **Role-Based Access** - Different timeouts per user type (admin, user, guest)
- **Organization Settings** - Configurable timeouts per tenant organization
- **Compliance Requirements** - Meet industry standards (SOX, GDPR, etc.)

### 3. Progressive Web Apps
- **Offline Handling** - Manage state during network connectivity issues
- **Mobile Optimization** - Touch-friendly warning dialogs
- **Performance** - Efficient event handling optimized for mobile devices

### 4. Development & Testing
- **Debug Tools** - NgRx DevTools integration for state debugging
- **Testing Support** - Mockable services and actions for unit testing
- **Real-time Monitoring** - Live state observation during development

## API Reference

### IdleOAuthService

```typescript
class IdleOAuthService {
  // Observables
  idleState$: Observable<IdleState>;
  isIdle$: Observable<boolean>;
  isWarning$: Observable<boolean>;
  timeRemaining$: Observable<number>;
  config$: Observable<IdleOAuthConfig>;
  idleStatus$: Observable<IdleStatus>;
  
  // Methods
  initialize(config: IdleOAuthConfig): void;
  start(): void;
  stop(): void;
  extendSession(): void;
  logout(): void;
  updateConfig(config: Partial<IdleOAuthConfig>): void;
  setUserRole(role: string): void;
  getWarningData(): Observable<IdleWarningData>;
  getCurrentWarningData(): IdleWarningData | null;
}
```

### Available Selectors

```typescript
import {
  selectIdleState,        // Full idle state
  selectIsIdle,          // Boolean: user is idle
  selectIsWarning,       // Boolean: warning is active
  selectTimeRemaining,   // Number: milliseconds remaining
  selectLastActivity,    // Number: timestamp of last activity
  selectConfig,          // IdleOAuthConfig: current configuration
  selectIdleStatus,      // IdleStatus: current status enum
  selectIdleTimeout,     // Number: idle timeout value
  selectWarningTimeout,  // Number: warning timeout value
  selectMultiTabCoordination // Boolean: multi-tab coordination enabled
} from '@idle-detection/angular-oauth-integration';
```

### Actions

```typescript
// Available actions for direct dispatch
IdleActions.initializeIdle({ config });
IdleActions.startIdleDetection();
IdleActions.stopIdleDetection();
IdleActions.userActivity({ timestamp });
IdleActions.extendSession();
IdleActions.resetIdle();
IdleActions.logout();
IdleActions.setUserRole({ role });
```

## Testing

### Unit Testing

```typescript
import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { IdleOAuthService } from '@idle-detection/angular-oauth-integration';

describe('IdleOAuthService', () => {
  let service: IdleOAuthService;
  let mockStore: MockStore;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          initialState: {
            idle: {
              isIdle: false,
              isWarning: false,
              timeRemaining: 0
            }
          }
        })
      ]
    });
    
    service = TestBed.inject(IdleOAuthService);
    mockStore = TestBed.inject(MockStore);
  });
  
  it('should extend session', () => {
    spyOn(mockStore, 'dispatch');
    service.extendSession();
    expect(mockStore.dispatch).toHaveBeenCalled();
  });
});
```

### E2E Testing

```typescript
// Cypress example
describe('Idle Detection', () => {
  it('should show warning after idle timeout', () => {
    cy.visit('/dashboard');
    cy.wait(30000); // Wait for idle timeout
    cy.get('[data-cy=warning-dialog]').should('be.visible');
    cy.get('[data-cy=extend-session]').click();
    cy.get('[data-cy=warning-dialog]').should('not.exist');
  });
});
```

## Development

### Prerequisites

- Node.js 18+
- Angular CLI 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/sahassakhare/idle-detection-library.git
cd idle-detection-library

# Install dependencies
npm install

# Build the library
npm run build

# Run example
cd packages/angular-oauth-integration/example
npm install
npm start
```

### Building

```bash
# Build all packages
npm run build

# Build specific package
npm run build:angular-oauth-integration

# Run tests
npm test

# Run linting
npm run lint
```

## Package Structure

```
@idle-detection/
├── core/                     # Core idle detection logic
│   ├── idle.ts              # Main Idle class
│   ├── types.ts             # TypeScript interfaces
│   └── interrupt-sources.ts # Activity detection
│
├── angular-oauth-integration/ # Angular + OAuth integration
│   ├── idle-oauth.service.ts # Main service
│   ├── idle-oauth.module.ts  # Angular module
│   ├── store/               # NgRx state management
│   │   ├── idle.actions.ts
│   │   ├── idle.effects.ts
│   │   ├── idle.reducer.ts
│   │   └── idle.selectors.ts
│   └── components/          # UI components
│       └── idle-warning-dialog.component.ts
│
└── keepalive/               # Optional keepalive functionality
    └── keepalive.ts         # HTTP keepalive service
```

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:

- Code of conduct
- Development setup
- Testing requirements
- Pull request process
- Issue reporting

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Run the test suite: `npm test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [GitHub Wiki](https://github.com/sahassakhare/idle-detection-library/wiki)
- **Issues**: [GitHub Issues](https://github.com/sahassakhare/idle-detection-library/issues)
- **Discussions**: [GitHub Discussions](https://github.com/sahassakhare/idle-detection-library/discussions)

## Acknowledgments

- Angular team for the amazing framework
- NgRx team for state management patterns
- angular-auth-oidc-client for OAuth integration
- Community contributors and testers

---

**Made with care for the Angular community**