# Idle Warning Dialog Configuration

The `IdleWarningDialogComponent` is highly customizable through input properties and configuration options.

## Input Properties

### Basic Customization

```typescript
<idle-warning-dialog
  dialogTitle="Your Session is Expiring"
  dialogMessage="Please click 'Continue' to extend your session."
  extendButtonLabel="Continue Working"
  logoutButtonLabel="End Session"
  [showProgressBar]="true"
  [showCountdown]="true"
  theme="default"
  size="medium"
  [backdropClose]="false"
  [autoClose]="false">
</idle-warning-dialog>
```

### Theme Variants

#### Default Theme
```typescript
<idle-warning-dialog theme="default"></idle-warning-dialog>
```

#### Dark Theme
```typescript
<idle-warning-dialog theme="dark"></idle-warning-dialog>
```

#### Minimal Theme
```typescript
<idle-warning-dialog theme="minimal"></idle-warning-dialog>
```

### Size Variants

#### Small Dialog
```typescript
<idle-warning-dialog size="small"></idle-warning-dialog>
```

#### Medium Dialog (Default)
```typescript
<idle-warning-dialog size="medium"></idle-warning-dialog>
```

#### Large Dialog
```typescript
<idle-warning-dialog size="large"></idle-warning-dialog>
```

### Advanced Configuration

#### Custom Styling
```typescript
export class AppComponent {
  customDialogStyles = {
    'border': '3px solid #007bff',
    'border-radius': '16px',
    'background': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'color': 'white'
  };
}
```

```html
<idle-warning-dialog
  [customStyles]="customDialogStyles"
  theme="minimal">
</idle-warning-dialog>
```

#### Hide Elements
```typescript
<!-- Hide progress bar -->
<idle-warning-dialog [showProgressBar]="false"></idle-warning-dialog>

<!-- Hide countdown timer -->
<idle-warning-dialog [showCountdown]="false"></idle-warning-dialog>

<!-- Hide both progress bar and countdown -->
<idle-warning-dialog 
  [showProgressBar]="false" 
  [showCountdown]="false">
</idle-warning-dialog>
```

#### Auto-close Behavior
```typescript
<!-- Automatically logout when timer reaches 0 -->
<idle-warning-dialog [autoClose]="true"></idle-warning-dialog>

<!-- Allow closing by clicking backdrop -->
<idle-warning-dialog [backdropClose]="true"></idle-warning-dialog>
```

## Configuration via Service

### Global Dialog Configuration

```typescript
// main.ts
import { provideIdleOAuth } from '@idle-detection/angular-oauth-integration';

bootstrapApplication(AppComponent, {
  providers: [
    provideIdleOAuth({
      idleTimeout: 15 * 60 * 1000,
      warningTimeout: 2 * 60 * 1000,
      
      // Dialog configuration
      warningDialogConfig: {
        title: 'Security Warning',
        message: 'Your session will expire due to inactivity. Please take action to continue.',
        extendButtonLabel: 'Keep Me Logged In',
        logoutButtonLabel: 'Logout Now',
        theme: 'dark',
        size: 'large',
        showProgressBar: true,
        showCountdown: true,
        autoClose: false,
        backdropClose: false,
        customStyles: {
          'font-family': 'Arial, sans-serif',
          'box-shadow': '0 20px 40px rgba(0,0,0,0.3)'
        }
      }
    })
  ]
});
```

### Component-Level Configuration

```typescript
// app.component.ts
import { Component, signal } from '@angular/core';

@Component({
  template: `
    <idle-warning-dialog
      *ngIf="showWarning()"
      [dialogTitle]="dialogConfig.title"
      [dialogMessage]="dialogConfig.message"
      [extendButtonLabel]="dialogConfig.extendButton"
      [logoutButtonLabel]="dialogConfig.logoutButton"
      [theme]="dialogConfig.theme"
      [size]="dialogConfig.size"
      [showProgressBar]="dialogConfig.showProgress"
      [showCountdown]="dialogConfig.showCountdown"
      [autoClose]="dialogConfig.autoClose"
      [backdropClose]="dialogConfig.backdropClose"
      [customStyles]="dialogConfig.customStyles">
    </idle-warning-dialog>
  `
})
export class AppComponent {
  showWarning = signal(false);
  
  dialogConfig = {
    title: 'Session Timeout Alert',
    message: 'Your session is about to expire. Please choose an action below.',
    extendButton: '🔄 Extend Session',
    logoutButton: '🚪 Logout',
    theme: 'default' as const,
    size: 'medium' as const,
    showProgress: true,
    showCountdown: true,
    autoClose: false,
    backdropClose: true,
    customStyles: {
      'border-radius': '12px',
      'box-shadow': '0 10px 30px rgba(0,0,0,0.2)'
    }
  };
}
```

## Dynamic Configuration

### Conditional Styling Based on Time Remaining

```typescript
export class AppComponent {
  showWarning = signal(false);
  remainingTime = signal(0);
  
  // Computed dialog configuration based on remaining time
  dialogTheme = computed(() => {
    const time = this.remainingTime();
    if (time <= 10) return 'dark';  // Critical time
    if (time <= 30) return 'default';  // Warning time
    return 'minimal';  // Normal warning
  });
  
  dialogSize = computed(() => {
    const time = this.remainingTime();
    return time <= 10 ? 'large' : 'medium';
  });
  
  urgentStyles = computed(() => {
    const time = this.remainingTime();
    if (time <= 10) {
      return {
        'border': '3px solid #e53e3e',
        'animation': 'pulse 1s infinite'
      };
    }
    return {};
  });
}
```

```html
<idle-warning-dialog
  *ngIf="showWarning()"
  dialogTitle="⚠️ Session Expiring Soon"
  [dialogMessage]="getUrgentMessage()"
  [theme]="dialogTheme()"
  [size]="dialogSize()"
  [customStyles]="urgentStyles()"
  [autoClose]="remainingTime() <= 5">
</idle-warning-dialog>
```

## Custom Dialog Component

### Creating a Completely Custom Dialog

```typescript
// custom-idle-dialog.component.ts
import { Component, inject } from '@angular/core';
import { IdleOAuthService } from '@idle-detection/angular-oauth-integration';

@Component({
  selector: 'custom-idle-dialog',
  standalone: true,
  template: `
    <div class="custom-overlay">
      <div class="custom-dialog">
        <div class="custom-icon">⏰</div>
        <h2>Time's Running Out!</h2>
        <p>You've got {{ remainingTime() }} seconds left.</p>
        
        <div class="custom-actions">
          <button class="pulse-button" (click)="extend()">
            ⚡ Quick Extend
          </button>
          <button class="ghost-button" (click)="logout()">
            👋 Goodbye
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, rgba(255,0,150,0.8), rgba(0,204,255,0.8));
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
    }
    
    .custom-dialog {
      background: white;
      border-radius: 20px;
      padding: 2rem;
      text-align: center;
      min-width: 400px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      transform: scale(1);
      animation: bounceIn 0.5s ease-out;
    }
    
    .custom-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      animation: swing 2s ease-in-out infinite;
    }
    
    .pulse-button {
      background: linear-gradient(45deg, #ff6b6b, #ffa500);
      border: none;
      color: white;
      padding: 15px 30px;
      border-radius: 50px;
      font-size: 1.1rem;
      margin: 10px;
      cursor: pointer;
      animation: pulse 2s infinite;
    }
    
    .ghost-button {
      background: transparent;
      border: 2px solid #666;
      color: #666;
      padding: 15px 30px;
      border-radius: 50px;
      font-size: 1.1rem;
      margin: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    @keyframes bounceIn {
      0% { transform: scale(0.3); opacity: 0; }
      50% { transform: scale(1.05); }
      70% { transform: scale(0.9); }
      100% { transform: scale(1); opacity: 1; }
    }
    
    @keyframes swing {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(10deg); }
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
  `]
})
export class CustomIdleDialogComponent {
  private idleService = inject(IdleOAuthService);
  remainingTime = signal(0);
  
  ngOnInit() {
    this.idleService.warning$.subscribe(time => {
      this.remainingTime.set(time);
    });
  }
  
  extend() {
    this.idleService.extendSession();
  }
  
  logout() {
    this.idleService.logoutNow();
  }
}
```

### Using the Custom Dialog

```typescript
// app.component.ts
@Component({
  template: `
    <div class="app">
      <router-outlet></router-outlet>
      
      <!-- Use custom dialog instead of default -->
      <custom-idle-dialog *ngIf="showWarning()"></custom-idle-dialog>
    </div>
  `
})
export class AppComponent {
  // ... component logic
}
```

## Configuration Reference

### Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `dialogTitle` | `string` | `'Session Timeout Warning'` | Title displayed in dialog header |
| `dialogMessage` | `string` | `'Your session will expire soon due to inactivity.'` | Main message text |
| `extendButtonLabel` | `string` | `'Stay Logged In'` | Text for extend session button |
| `logoutButtonLabel` | `string` | `'Logout Now'` | Text for logout button |
| `showProgressBar` | `boolean` | `true` | Whether to show progress bar |
| `showCountdown` | `boolean` | `true` | Whether to show countdown timer |
| `autoClose` | `boolean` | `false` | Auto-logout when timer reaches 0 |
| `theme` | `'default' \| 'dark' \| 'minimal'` | `'default'` | Visual theme variant |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Dialog size variant |
| `backdropClose` | `boolean` | `false` | Allow closing by clicking backdrop |
| `customStyles` | `object` | `{}` | Custom CSS styles object |

### Global Configuration

```typescript
interface IdleWarningDialogConfig {
  title?: string;
  message?: string;
  extendButtonLabel?: string;
  logoutButtonLabel?: string;
  showProgressBar?: boolean;
  showCountdown?: boolean;
  autoClose?: boolean;
  theme?: 'default' | 'dark' | 'minimal';
  size?: 'small' | 'medium' | 'large';
  backdropClose?: boolean;
  customStyles?: { [key: string]: string };
}
```

This configuration system provides maximum flexibility while maintaining ease of use for common scenarios.