# Using Idle Warning Dialog in Angular Applications

This guide provides step-by-step instructions for integrating the idle warning dialog component into your Angular application.

## Table of Contents
- [Installation](#installation)
- [Quick Start - Simple Approach](#quick-start---simple-approach)
- [Manual Implementation](#manual-implementation)
- [Configuration Options](#configuration-options)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)

## Installation

Install the idle detection library:

```bash
npm install @idle-detection/angular-oauth-integration
```

**Note**: NgRx is NOT required for using the idle warning dialog component.

## Quick Start - Complete Solution

The idle warning dialog component is now a **complete solution** - just add one tag and it automatically handles all idle detection:

### Step 1: Import the Component

```typescript
import { IdleWarningDialogComponent } from '@idle-detection/angular-oauth-integration';
```

### Step 2: Add the Tag - That's It!

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IdleWarningDialogComponent } from '@idle-detection/angular-oauth-integration';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IdleWarningDialogComponent],
  template: `
    <!-- Your app content -->
    <div class="app-container">
      <h1>My Application</h1>
      <p>User activity is automatically monitored</p>
      <router-outlet></router-outlet>
    </div>
    
    <!-- Complete idle detection solution -->
    <idle-warning-dialog
      [idleTimeout]="900000"
      [warningTimeout]="60000"
      [onLogoutCallback]="handleLogout">
    </idle-warning-dialog>
  `
})
export class AppComponent {
  constructor(private router: Router) {}
  
  handleLogout = () => {
    console.log('Session timed out');
    this.router.navigate(['/login']);
  };
}
```

**That's it!** The component automatically:
- ✅ Detects user activity across your entire app
- ✅ Shows warning dialog when idle
- ✅ Manages countdown timer
- ✅ Handles session extension/timeout
- ✅ Follows industry standards (no backdrop clicks)

### Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `idleTimeout` | `number` | `900000` (15 min) | Time until user is considered idle |
| `warningTimeout` | `number` | `60000` (1 min) | Warning duration before logout |
| `activityEvents` | `string[]` | `['mousedown', 'mousemove', ...]` | Events to monitor for activity |
| `enableIdleDetection` | `boolean` | `true` | Enable/disable idle detection |
| `onExtendCallback` | `() => void` | - | Called when user extends session |
| `onLogoutCallback` | `() => void` | - | Called when session times out |
| `dialogTitle` | `string` | `'Session Timeout Warning'` | Dialog title |
| `dialogMessage` | `string` | `'Your session is about to expire...'` | Warning message |
| `theme` | `'default' \| 'dark' \| 'minimal'` | `'default'` | Dialog theme |
| `throttleDelay` | `number` | `500` | Activity event throttling (ms) |

### Events

| Event | Description |
|-------|-------------|
| `idleStart` | User became idle |
| `idleEnd` | User became active again |
| `warningStart` | Warning dialog shown |
| `warningEnd` | Warning dialog closed |
| `sessionExtended` | User clicked extend session |
| `sessionTimeout` | Session timed out |
| `activityDetected` | User activity detected |

## Manual Implementation

If you need more control, you can implement idle detection manually:

### Step 1: Import the Dialog Component

```typescript
import { IdleWarningDialogComponent } from '@idle-detection/angular-oauth-integration';
```

### Step 2: Simple Usage

For basic usage, just import and use the dialog component with minimal setup:

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdleWarningDialogComponent } from '@idle-detection/angular-oauth-integration';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IdleWarningDialogComponent],
  template: `
    <div class="app">
      <h1>My Application</h1>
      <button (click)="showDialog()">Show Warning Dialog</button>
      
      <!-- Simple idle warning dialog -->
      <idle-warning-dialog 
        *ngIf="showWarning"
        [initialTimeRemaining]="30000"
        [onExtendCallback]="handleExtend"
        [onLogoutCallback]="handleLogout">
      </idle-warning-dialog>
    </div>
  `
})
export class AppComponent {
  showWarning = false;
  
  showDialog() {
    this.showWarning = true;
  }
  
  handleExtend = () => {
    console.log('Session extended');
    this.showWarning = false;
  };
  
  handleLogout = () => {
    console.log('User logged out');
    this.showWarning = false;
  };
}
```

## Complete Manual Implementation Example

Here's a fully functional Angular component with idle detection and warning dialog:

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdleWarningDialogComponent } from '@idle-detection/angular-oauth-integration';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IdleWarningDialogComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>My Application</h1>
        <div class="status-indicator" [class.active]="!isIdle">
          Status: {{ isIdle ? 'Idle' : 'Active' }}
        </div>
      </header>
      
      <main class="app-content">
        <p>Move your mouse or type to reset the idle timer.</p>
        <p>The session will timeout after {{ IDLE_TIME / 1000 }} seconds of inactivity.</p>
        
        <div class="demo-controls">
          <button (click)="simulateIdle()" class="demo-button">
            Simulate Idle Warning
          </button>
          <button (click)="resetIdleTimer()" class="demo-button">
            Reset Timer
          </button>
        </div>
        
        <div class="activity-log">
          <h3>Activity Log</h3>
          <ul>
            <li *ngFor="let event of activityLog">{{ event }}</li>
          </ul>
        </div>
      </main>
      
      <!-- Idle Warning Dialog -->
      <idle-warning-dialog 
        *ngIf="showWarning"
        [initialTimeRemaining]="30000"
        [onExtendCallback]="handleExtend"
        [onLogoutCallback]="handleLogout"
        dialogTitle="Session Timeout"
        dialogMessage="Your session will expire due to inactivity."
        extendButtonText="Stay Logged In"
        logoutButtonText="Logout"
        [showProgressBar]="true"
        [showCountdown]="true"
        theme="default"
        size="medium">
      </idle-warning-dialog>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .app-header {
      background: #f8f9fa;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #dee2e6;
    }
    
    .status-indicator {
      padding: 8px 16px;
      border-radius: 20px;
      background: #dc3545;
      color: white;
      font-size: 14px;
      transition: background 0.3s ease;
    }
    
    .status-indicator.active {
      background: #28a745;
    }
    
    .app-content {
      padding: 40px 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .demo-controls {
      margin: 30px 0;
      display: flex;
      gap: 10px;
    }
    
    .demo-button {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      background: #007bff;
      color: white;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    
    .demo-button:hover {
      background: #0056b3;
    }
    
    .activity-log {
      margin-top: 40px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .activity-log h3 {
      margin: 0 0 15px 0;
    }
    
    .activity-log ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .activity-log li {
      padding: 5px 0;
      color: #6c757d;
      font-size: 14px;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  showWarning = false;
  isIdle = false;
  activityLog: string[] = [];
  
  private idleTimer?: any;
  private warningTimer?: any;
  
  // Configuration
  readonly IDLE_TIME = 60000; // 1 minute for demo
  private readonly WARNING_TIME = 30000; // 30 seconds warning
  
  ngOnInit() {
    this.setupIdleDetection();
    this.logActivity('Application initialized');
  }
  
  ngOnDestroy() {
    this.clearTimers();
    this.removeEventListeners();
  }
  
  private setupIdleDetection() {
    // Listen for user activity
    this.activityEvents.forEach(event => {
      document.addEventListener(event, this.handleUserActivity);
    });
    
    // Start idle timer
    this.resetIdleTimer();
  }
  
  private activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  
  private handleUserActivity = () => {
    if (!this.showWarning) {
      this.resetIdleTimer();
    }
  };
  
  resetIdleTimer() {
    this.clearTimers();
    this.isIdle = false;
    this.showWarning = false;
    
    // Start idle timer
    this.idleTimer = setTimeout(() => {
      this.showIdleWarning();
    }, this.IDLE_TIME);
    
    this.logActivity('Timer reset - User is active');
  }
  
  private showIdleWarning() {
    this.showWarning = true;
    this.logActivity('Warning dialog shown');
    
    // Auto-logout after warning period
    this.warningTimer = setTimeout(() => {
      this.handleLogout();
    }, this.WARNING_TIME);
  }
  
  // Button callbacks
  handleExtend = () => {
    this.logActivity('Session extended by user');
    this.showWarning = false;
    this.resetIdleTimer();
  };
  
  handleLogout = () => {
    this.logActivity('User logged out');
    this.showWarning = false;
    this.isIdle = true;
    this.clearTimers();
    // Add your logout logic here
    // this.router.navigate(['/login']);
  };
  
  simulateIdle() {
    this.clearTimers();
    this.showIdleWarning();
  }
  
  private clearTimers() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }
  
  private removeEventListeners() {
    this.activityEvents.forEach(event => {
      document.removeEventListener(event, this.handleUserActivity);
    });
  }
  
  private logActivity(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.activityLog.unshift(`${timestamp} - ${message}`);
    if (this.activityLog.length > 10) {
      this.activityLog.pop();
    }
  }
}
```

## Configuration Options

### Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `initialTimeRemaining` | `number` | `30000` | Countdown time in milliseconds |
| `onExtendCallback` | `() => void` | - | Function called when extending session |
| `onLogoutCallback` | `() => void` | - | Function called when logging out |
| `dialogTitle` | `string` | `'Session Timeout Warning'` | Dialog title text |
| `dialogMessage` | `string` | `'Your session is about to expire...'` | Warning message |
| `extendButtonText` | `string` | `'Extend Session'` | Text for extend button |
| `logoutButtonText` | `string` | `'Logout'` | Text for logout button |
| `showProgressBar` | `boolean` | `true` | Show countdown progress bar |
| `showCountdown` | `boolean` | `true` | Show time remaining |
| `theme` | `'default' \| 'dark' \| 'minimal'` | `'default'` | Visual theme |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Dialog size |
| `customStyles` | `object` | `{}` | Custom CSS styles |

### Output Events

| Event | Description | Payload |
|-------|-------------|---------|
| `extendSession` | Emitted when user clicks extend | `void` |
| `logout` | Emitted when user clicks logout | `void` |

## Advanced Usage

### Custom Styling with Complete Solution

```typescript
<idle-warning-dialog
  [idleTimeout]="1200000"
  [warningTimeout]="120000"
  [onLogoutCallback]="handleLogout"
  dialogTitle="Security Alert"
  dialogMessage="For your security, you'll be logged out soon."
  extendButtonText="Keep me signed in"
  logoutButtonText="Sign out now"
  theme="dark"
  size="large"
  [customStyles]="{
    'border-radius': '16px',
    'font-family': 'Arial, sans-serif',
    'box-shadow': '0 10px 40px rgba(0,0,0,0.5)'
  }">
</idle-warning-dialog>
```

### With Router Navigation

```typescript
import { Router } from '@angular/router';

export class AppComponent {
  constructor(private router: Router) {}
  
  handleLogout = () => {
    this.showWarning = false;
    this.isIdle = true;
    this.clearTimers();
    
    // Navigate to login page
    this.router.navigate(['/login']);
  };
}
```

### With HTTP Interceptor

```typescript
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class ActivityInterceptor implements HttpInterceptor {
  constructor(private appComponent: AppComponent) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Reset idle timer on HTTP activity
    this.appComponent.resetIdleTimer();
    return next.handle(req);
  }
}
```

### With Local Storage Persistence

```typescript
export class AppComponent implements OnInit {
  ngOnInit() {
    // Check for saved session state
    const savedState = localStorage.getItem('sessionState');
    if (savedState) {
      const state = JSON.parse(savedState);
      if (state.isIdle) {
        this.isIdle = true;
        // Redirect to login
      }
    }
    
    this.setupIdleDetection();
  }
  
  handleLogout = () => {
    // Save state before logout
    localStorage.setItem('sessionState', JSON.stringify({ isIdle: true }));
    this.showWarning = false;
    this.isIdle = true;
    this.clearTimers();
  };
  
  handleExtend = () => {
    // Clear saved state
    localStorage.removeItem('sessionState');
    this.showWarning = false;
    this.resetIdleTimer();
  };
}
```

## Troubleshooting

### Dialog Not Showing

1. **Check `showWarning` property**: Ensure it's set to `true`
2. **Verify imports**: Make sure `IdleWarningDialogComponent` is imported
3. **Check console**: Look for any error messages

### Callbacks Not Working

1. **Use arrow functions**: Ensure callbacks are arrow functions to maintain `this` context
2. **Check function names**: Verify callback property names match

```typescript
// Correct
handleExtend = () => {
  this.showWarning = false;
};

// Incorrect (loses 'this' context)
handleExtend() {
  this.showWarning = false;
}
```

### Backdrop Clicks

By industry standard, clicking outside the dialog does NOT close it. Users must explicitly click one of the action buttons. This prevents accidental logouts.

### Memory Leaks

Always clean up timers and event listeners in `ngOnDestroy`:

```typescript
ngOnDestroy() {
  this.clearTimers();
  this.removeEventListeners();
}
```

## Best Practices

1. **Use meaningful timeouts**: Set appropriate idle and warning times for your use case
2. **Provide clear messages**: Ensure users understand why they're being warned
3. **Test thoroughly**: Test with different user interactions and edge cases
4. **Handle errors gracefully**: Implement error handling for logout failures
5. **Consider accessibility**: The dialog is keyboard navigable and screen reader friendly

## Security Considerations

1. **No backdrop dismissal**: Dialog cannot be closed by clicking outside
2. **Clear sensitive data**: Clear form data and sensitive information on logout
3. **Server-side validation**: Always validate session timeout on the server
4. **Secure logout**: Ensure proper session cleanup on both client and server

## Summary

The idle warning dialog component provides a simple, standalone solution for session timeout warnings in Angular applications. It requires no NgRx dependencies and can be integrated with minimal setup while following industry-standard security practices.