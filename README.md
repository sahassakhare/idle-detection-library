# Angular Idle Detection Library

A complete, zero-setup Angular library for session timeout management with industry-standard security practices. This library provides automatic idle detection, warning dialogs, and session management with minimal configuration.

## Features

- **Zero Setup**: Add one component tag and you're done - no complex configuration
- **Industry Standard Security**: No backdrop clicks, explicit user action required
- **Automatic**: Detects activity across your entire application automatically
- **Highly Customizable**: Configurable timeouts, themes, messages, and styling
- **Custom Templates**: Complete UI control with Angular template system
- **Custom Actions**: Configurable call-to-action buttons for any workflow
- **Modern Angular**: Built with Angular 18+ standalone components
- **No Dependencies**: No NgRx, RxJS knowledge, or complex setup required
- **Accessible**: WCAG compliant with keyboard navigation and screen reader support
- **Advanced Multi-Tab Sync**: Real-time coordination across all browser tabs using BroadcastChannel API

## Quick Start

### Installation

```bash
npm install @idle-detection/angular-oauth-integration
```

### Basic Usage

```typescript
import { Component } from '@angular/core';
import { IdleWarningDialogComponent } from '@idle-detection/angular-oauth-integration';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IdleWarningDialogComponent],
  template: `
    <div class="app">
      <!-- Your application content -->
      <h1>My Application</h1>
      <p>User activity is automatically monitored</p>
    </div>
    
    <!-- Complete idle detection solution - that's it! -->
    <idle-warning-dialog
      [idleTimeout]="900000"
      [warningTimeout]="60000"
      [onLogoutCallback]="handleLogout">
    </idle-warning-dialog>
  `
})
export class AppComponent {
  handleLogout = () => {
    console.log('Session timed out');
    window.location.href = '/login';
  };
}
```

**That's it!** The component automatically handles:
- Activity detection across your entire application
- Idle state management with configurable timeouts  
- Warning dialog display with countdown timer
- Session extension and automatic timeout
- Industry-standard security (no accidental dismissals)

## Configuration

### Basic Configuration

```typescript
<idle-warning-dialog
  [idleTimeout]="900000"           // 15 minutes until idle (default)
  [warningTimeout]="60000"         // 1 minute warning (default)
  [onLogoutCallback]="handleLogout"
  [onExtendCallback]="handleExtend">
</idle-warning-dialog>
```

### Advanced Configuration

```typescript
<idle-warning-dialog
  [idleTimeout]="1200000"                    // 20 minutes until idle
  [warningTimeout]="120000"                  // 2 minutes warning
  [activityEvents]="['click', 'mousemove', 'keypress']"  // Events to monitor
  [enableIdleDetection]="true"               // Enable/disable detection
  [throttleDelay]="1000"                     // Activity event throttling
  
  [onExtendCallback]="handleExtend"
  [onLogoutCallback]="handleLogout"
  
  dialogTitle="Security Alert"
  dialogMessage="For your security, you'll be logged out soon."
  extendButtonText="Keep me signed in"
  logoutButtonText="Sign out now"
  
  theme="dark"                               // default, dark, minimal
  size="large"                               // small, medium, large
  
  [showProgressBar]="true"
  [showCountdown]="true"
  [customStyles]="{
    'border-radius': '16px',
    'font-family': 'Arial, sans-serif'
  }">
</idle-warning-dialog>
```

##  Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `idleTimeout` | `number` | `900000` (15 min) | Time in ms before user is considered idle |
| `warningTimeout` | `number` | `60000` (1 min) | Warning dialog duration in ms |
| `activityEvents` | `string[]` | `['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']` | DOM events that indicate user activity |
| `enableIdleDetection` | `boolean` | `true` | Enable/disable automatic idle detection |
| `throttleDelay` | `number` | `500` | Throttle activity events (ms) |
| `enableMultiTab` | `boolean` | `true` | Enable multi-tab coordination |
| `multiTabChannelName` | `string` | `'idle-detection-channel'` | localStorage key for multi-tab sync |
| `onExtendCallback` | `() => void` | - | Called when user extends session |
| `onLogoutCallback` | `() => void` | - | Called when session times out |
| `dialogTitle` | `string` | `'Session Timeout Warning'` | Dialog title text |
| `dialogMessage` | `string` | `'Your session is about to expire...'` | Warning message |
| `extendButtonText` | `string` | `'Extend Session'` | Text for extend button |
| `logoutButtonText` | `string` | `'Logout'` | Text for logout button |
| `showProgressBar` | `boolean` | `true` | Show countdown progress bar |
| `showCountdown` | `boolean` | `true` | Show time remaining |
| `theme` | `'default' \| 'dark' \| 'minimal'` | `'default'` | Visual theme |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Dialog size |
| `customStyles` | `object` | `{}` | Custom CSS styles |
| `customActions` | `CustomAction[]` | `[]` | Custom action buttons |
| `hideDefaultActions` | `boolean` | `false` | Hide default Extend/Logout buttons |
| `showExtendButton` | `boolean` | `true` | Show/hide extend button |
| `showLogoutButton` | `boolean` | `true` | Show/hide logout button |
| `customTemplateRef` | `TemplateRef<any>` | - | Custom template reference |

### CSS Class Customization Inputs

Complete control over dialog styling with CSS class inputs:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `backdropClass` | `string` | `'idle-warning-backdrop'` | Overlay background styling |
| `dialogClass` | `string` | `'idle-warning-dialog'` | Main dialog container |
| `headerClass` | `string` | `'idle-warning-header'` | Dialog header section |
| `bodyClass` | `string` | `'idle-warning-body'` | Body content area |
| `titleClass` | `string` | `'idle-warning-title'` | Title text styling |
| `messageClass` | `string` | `'idle-warning-message'` | Warning message text |
| `countdownClass` | `string` | `'idle-warning-countdown'` | Countdown timer wrapper |
| `countdownLabelClass` | `string` | `'countdown-label'` | Countdown label text |
| `countdownTimeClass` | `string` | `'countdown-time'` | Countdown time display |
| `progressClass` | `string` | `'idle-warning-progress'` | Progress bar container |
| `progressBarClass` | `string` | `'progress-bar'` | Progress bar styling |
| `actionsClass` | `string` | `'idle-warning-actions'` | Button container |
| `primaryButtonClass` | `string` | `'btn btn-primary'` | Primary button styling |
| `secondaryButtonClass` | `string` | `'btn btn-secondary'` | Secondary button styling |

##  Output Events

```typescript
<idle-warning-dialog
  (activityDetected)="onActivity($event)"
  (idleStart)="onIdleStart()"
  (idleEnd)="onIdleEnd()"
  (warningStart)="onWarningStart()"
  (warningEnd)="onWarningEnd()"
  (sessionExtended)="onSessionExtended()"
  (sessionTimeout)="onSessionTimeout()">
</idle-warning-dialog>
```

| Event | Description | Payload |
|-------|-------------|---------|
| `activityDetected` | User activity detected | `Event` |
| `idleStart` | User became idle | `void` |
| `idleEnd` | User became active again | `void` |
| `warningStart` | Warning dialog shown | `void` |
| `warningEnd` | Warning dialog closed | `void` |
| `sessionExtended` | User clicked extend | `void` |
| `sessionTimeout` | Session timed out | `void` |

##  Public API Methods

The component provides several public methods for programmatic control:

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `pause()` | Temporarily disables idle detection and clears all timers | None | `void` |
| `resume()` | Re-enables idle detection, closes any open dialog, and restarts timers. Works with multi-tab coordination. | None | `void` |
| `reset()` | Completely resets the idle state, closes dialog, and restarts idle timer from scratch. Supports multi-tab coordination. | None | `void` |
| `getLastActivity()` | Returns the timestamp of the last detected user activity | None | `Date` |
| `getTimeUntilIdle()` | Returns milliseconds remaining until user is considered idle | None | `number` |

### Method Usage Examples

```typescript
// Pause idle detection during critical operations
performCriticalOperation() {
  this.idleDialog.pause();
  
  this.criticalService.execute().finally(() => {
    this.idleDialog.resume(); // Re-enable when done
  });
}

// Reset timer after programmatic session extension
extendSessionProgrammatically() {
  this.authService.refreshToken().then(() => {
    this.idleDialog.reset(); // Start fresh timer
  });
}

// Check user activity status
checkUserStatus() {
  const lastActivity = this.idleDialog.getLastActivity();
  const timeUntilIdle = this.idleDialog.getTimeUntilIdle();
  
  console.log(\`Last activity: \${lastActivity}\`);
  console.log(\`Time until idle: \${timeUntilIdle}ms\`);
}
```

##  Usage Examples

### With Router Navigation

```typescript
import { Router } from '@angular/router';

export class AppComponent {
  constructor(private router: Router) {}
  
  handleLogout = () => {
    // Clear user session
    localStorage.removeItem('authToken');
    // Navigate to login
    this.router.navigate(['/login']);
  };
  
  handleExtend = () => {
    // Refresh authentication token
    this.authService.refreshToken();
  };
}
```

### With Custom Styling

```typescript
<idle-warning-dialog
  [idleTimeout]="600000"
  [warningTimeout]="60000"
  [onLogoutCallback]="handleLogout"
  dialogTitle="Session Expiring"
  dialogMessage="Your session will expire soon. Save your work!"
  extendButtonText="Continue Working"
  logoutButtonText="Sign Out"
  theme="dark"
  size="large"
  [customStyles]="{
    'border-radius': '12px',
    'box-shadow': '0 10px 40px rgba(0,0,0,0.3)'
  }">
</idle-warning-dialog>
```

### Manual Control

```typescript
import { ViewChild } from '@angular/core';

export class AppComponent {
  @ViewChild(IdleWarningDialogComponent) idleDialog!: IdleWarningDialogComponent;
  
  pauseIdleDetection() {
    this.idleDialog.pause();  // Disables idle detection temporarily
  }
  
  resumeIdleDetection() {
    this.idleDialog.resume(); // Resumes idle detection and closes any open dialog
  }
  
  resetTimer() {
    this.idleDialog.reset();  // Completely resets idle timer and closes dialog
  }
  
  getLastActivity() {
    return this.idleDialog.getLastActivity(); // Returns Date of last user activity
  }
  
  getTimeUntilIdle() {
    return this.idleDialog.getTimeUntilIdle(); // Returns milliseconds until idle state
  }
}
```

##  Themes

### Default Theme
Clean, professional appearance suitable for most applications.

### Dark Theme
```typescript
<idle-warning-dialog theme="dark">
</idle-warning-dialog>
```

### Minimal Theme
```typescript
<idle-warning-dialog theme="minimal">
</idle-warning-dialog>
```

##  CSS Class Customization

Take complete control over the dialog appearance using CSS class inputs. You can apply your own design system, themes, or custom styling:

### Basic CSS Customization

```typescript
<idle-warning-dialog
  [idleTimeout]="900000"
  [warningTimeout]="60000"
  [onLogoutCallback]="handleLogout"
  
  backdropClass="my-custom-backdrop"
  dialogClass="my-custom-dialog"
  titleClass="my-custom-title text-xl font-bold"
  messageClass="my-custom-message text-gray-600"
  primaryButtonClass="btn btn-primary"
  secondaryButtonClass="btn btn-secondary">
</idle-warning-dialog>
```

### Complete Styling Example

```typescript
<idle-warning-dialog
  [idleTimeout]="600000"
  [warningTimeout]="60000"
  [onLogoutCallback]="handleLogout"
  dialogTitle="Session Alert"
  dialogMessage="Your session will expire soon. Choose an action to continue."
  
  <!-- Backdrop and Container -->
  backdropClass="premium-backdrop"
  dialogClass="premium-dialog"
  
  <!-- Header and Content -->
  headerClass="premium-header"
  titleClass="premium-title"
  bodyClass="premium-body"
  messageClass="premium-message"
  
  <!-- Countdown and Progress -->
  countdownClass="premium-countdown"
  countdownTimeClass="premium-time"
  progressClass="premium-progress"
  progressBarClass="premium-progress-bar"
  
  <!-- Actions -->
  actionsClass="premium-actions"
  primaryButtonClass="premium-btn premium-btn-primary"
  secondaryButtonClass="premium-btn premium-btn-secondary">
</idle-warning-dialog>
```

### CSS Implementation

```css
/* Premium styling example */
.premium-backdrop {
  background: radial-gradient(circle at center, rgba(124, 58, 237, 0.95), rgba(79, 70, 229, 0.95)) !important;
  backdrop-filter: blur(12px);
}

.premium-dialog {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
  max-width: 480px;
  animation: premiumEntry 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes premiumEntry {
  from { transform: scale(0.7) rotateY(20deg); opacity: 0; }
  to { transform: scale(1) rotateY(0); opacity: 1; }
}

.premium-header {
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  padding: 25px;
  text-align: center;
}

.premium-title {
  color: white;
  font-size: 26px;
  font-weight: 700;
  margin: 0;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
}

.premium-body {
  padding: 30px;
  background: linear-gradient(to bottom, #fafaf9, #f5f5f4);
}

.premium-message {
  color: #374151;
  font-size: 16px;
  line-height: 1.7;
  text-align: center;
  margin-bottom: 25px;
}

.premium-countdown {
  background: linear-gradient(135deg, #fef3c7, #fed7aa);
  border: 3px solid #f59e0b;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  margin: 20px 0;
}

.premium-time {
  font-size: 36px;
  font-weight: 900;
  background: linear-gradient(135deg, #dc2626, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-variant-numeric: tabular-nums;
}

.premium-progress {
  height: 12px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  margin: 25px 0;
}

.premium-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  transition: width 1s linear;
}

.premium-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  padding: 25px;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.premium-btn {
  padding: 14px 32px;
  border-radius: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.premium-btn-primary {
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  color: white;
  box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);
}

.premium-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(124, 58, 237, 0.5);
}

.premium-btn-secondary {
  background: white;
  color: #7c3aed;
  border: 2px solid #7c3aed;
}

.premium-btn-secondary:hover {
  background: #7c3aed;
  color: white;
}
```

### Design System Integration

```typescript
// Tailwind CSS example
<idle-warning-dialog
  backdropClass="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
  dialogClass="bg-white rounded-2xl shadow-2xl max-w-md mx-auto"
  headerClass="bg-gradient-to-r from-red-500 to-red-600 p-6 text-center"
  titleClass="text-white text-xl font-bold"
  bodyClass="p-6"
  messageClass="text-gray-700 text-center mb-6"
  countdownClass="bg-red-50 border border-red-200 rounded-lg p-4 text-center"
  countdownTimeClass="text-3xl font-mono font-bold text-red-600"
  actionsClass="flex gap-3 justify-center"
  primaryButtonClass="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
  secondaryButtonClass="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">
</idle-warning-dialog>

// Bootstrap example
<idle-warning-dialog
  backdropClass="modal-backdrop fade show"
  dialogClass="modal-dialog modal-dialog-centered"
  headerClass="modal-header bg-warning"
  titleClass="modal-title h4"
  bodyClass="modal-body"
  messageClass="text-center mb-3"
  countdownClass="alert alert-danger text-center"
  countdownTimeClass="display-4 font-monospace"
  actionsClass="modal-footer justify-content-center"
  primaryButtonClass="btn btn-primary btn-lg"
  secondaryButtonClass="btn btn-outline-secondary btn-lg">
</idle-warning-dialog>
```

### Available CSS Classes Reference

| Class Input | Applied To | Purpose |
|-------------|------------|---------|
| `backdropClass` | Overlay background | Modal backdrop behind dialog |
| `dialogClass` | Main dialog wrapper | Dialog container positioning and styling |
| `headerClass` | Header section | Title area styling |
| `bodyClass` | Content area | Main content wrapper |
| `titleClass` | Title text | Dialog title typography |
| `messageClass` | Message text | Warning message styling |
| `countdownClass` | Countdown wrapper | Timer display container |
| `countdownLabelClass` | Countdown label | Timer label text |
| `countdownTimeClass` | Time display | Actual countdown numbers |
| `progressClass` | Progress container | Progress bar wrapper |
| `progressBarClass` | Progress fill | Animated progress indicator |
| `actionsClass` | Button container | Action buttons wrapper |
| `primaryButtonClass` | Primary button | Main action button (Extend) |
| `secondaryButtonClass` | Secondary button | Secondary action button (Logout) |

##  Custom Templates

Take complete control over the UI while maintaining all core functionality:

### Content Projection
```typescript
<idle-warning-dialog [idleTimeout]="300000" [warningTimeout]="60000">
  <ng-template #customTemplate let-data let-onExtend="onExtend" let-onLogout="onLogout">
    <div class="my-custom-dialog">
      <h2>Session Expiring!</h2>
      <p>Time remaining: {{ data.formattedTime }}</p>
      <div class="progress-circle">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" stroke-width="10"/>
          <circle 
            cx="50" cy="50" r="45" 
            fill="none" 
            stroke="#ff6b6b" 
            stroke-width="10"
            [style.strokeDasharray]="283"
            [style.strokeDashoffset]="283 - (283 * data.progressPercentage / 100)"
            transform="rotate(-90 50 50)"/>
        </svg>
      </div>
      <button class="custom-btn primary" (click)="onExtend()">Keep Working</button>
      <button class="custom-btn secondary" (click)="onLogout()">Sign Out</button>
    </div>
  </ng-template>
</idle-warning-dialog>
```

### Template Reference
```typescript
@Component({
  template: `
    <ng-template #myTemplate let-data let-onExtend="onExtend" let-onLogout="onLogout">
      <div class="minimal-warning">
        <h3>Time's Up! {{ data.formattedTime }}</h3>
        <button (click)="onExtend()">Continue</button>
        <button (click)="onLogout()">Exit</button>
      </div>
    </ng-template>
    
    <idle-warning-dialog [customTemplateRef]="myTemplate">
    </idle-warning-dialog>
  `
})
export class MyComponent {
  @ViewChild('myTemplate') myTemplate!: TemplateRef<any>;
}
```

### Available Template Context
Your custom template receives rich context data:
- `data.timeRemaining` - Milliseconds remaining
- `data.formattedTime` - Formatted time string (MM:SS)
- `data.progressPercentage` - Progress percentage (0-100)
- `data.dialogTitle` - Dialog title
- `data.dialogMessage` - Dialog message
- `onExtend()` - Function to extend session
- `onLogout()` - Function to logout
- `onCustomAction(action)` - Function to trigger custom actions

##  Custom Actions

Add custom call-to-action buttons for any workflow:

### Basic Custom Actions
```typescript
import { CustomAction } from '@idle-detection/angular-oauth-integration';

@Component({
  template: `
    <idle-warning-dialog
      [customActions]="customActions"
      [hideDefaultActions]="false">
    </idle-warning-dialog>
  `
})
export class MyComponent {
  customActions: CustomAction[] = [
    {
      id: 'save-continue',
      label: 'Save & Continue',
      cssClass: 'btn btn-success',
      icon: '<svg>...</svg>',
      order: 1,
      callback: () => this.saveWork(),
      closeDialog: true
    },
    {
      id: 'help',
      label: 'Help',
      cssClass: 'btn btn-info',
      order: 2,
      callback: () => this.showHelp(),
      closeDialog: false // Keep dialog open
    }
  ];
  
  saveWork() {
    console.log('Saving work...');
  }
  
  showHelp() {
    alert('Help information');
  }
}
```

### Advanced Custom Actions
```typescript
customActions: CustomAction[] = [
  // Primary action with icon
  {
    id: 'auto-save-continue',
    label: 'Auto-Save & Continue Working',
    cssClass: 'btn btn-primary btn-lg',
    icon: `<svg viewBox="0 0 24 24">
      <path fill="currentColor" d="M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z"/>
    </svg>`,
    order: 1,
    callback: () => {
      this.enableAutoSave();
      this.extendSession();
    }
  },
  
  // Secondary action  
  {
    id: 'remind-later',
    label: 'Remind in 10 minutes',
    cssClass: 'btn btn-warning',
    order: 2,
    callback: () => this.snoozeWarning(10)
  },
  
  // Utility action that keeps dialog open
  {
    id: 'create-backup',
    label: 'Create Backup',
    cssClass: 'btn btn-outline-secondary btn-sm',
    order: 3,
    callback: () => this.createBackup(),
    closeDialog: false
  }
];
```

### CustomAction Interface
```typescript
interface CustomAction {
  id: string;                // Unique identifier
  label: string;             // Button text
  cssClass?: string;         // CSS classes for styling
  icon?: string;             // HTML/SVG icon
  callback: () => void;      // Function to execute
  closeDialog?: boolean;     // Whether to close dialog (default: true)
  order?: number;            // Display order (lower numbers first)
}
```

### Control Default Actions
```typescript
<idle-warning-dialog
  [customActions]="myActions"
  [hideDefaultActions]="true"     // Hide both Extend and Logout
  [showExtendButton]="false"      // Hide only Extend button  
  [showLogoutButton]="false">     // Hide only Logout button
</idle-warning-dialog>
```

##  Industry Standard Security

This library follows security best practices used by major platforms:

- **No Backdrop Dismissal**: Clicking outside the dialog does NOT close it
- **Explicit User Action Required**: Users must click action buttons
- **Clear Messaging**: Countdown timer and clear instructions
- **Secure by Default**: No accidental logouts from mis-clicks

This matches the behavior of:
- Banking applications (Chase, Bank of America, Wells Fargo)
- Google Workspace
- Microsoft 365
- AWS Console
- Enterprise security systems

##  Advanced Multi-Tab Coordination

The idle detection component provides real-time synchronization across all browser tabs using the modern BroadcastChannel API:

### Enhanced Multi-Tab Features

- **Real-time synchronization**: Instant communication between tabs using BroadcastChannel API
- **Activity in any tab** resets the idle timer in all tabs immediately
- **Warning dialogs appear simultaneously** across all tabs
- **Session extension in one tab** dismisses warnings in all tabs instantly
- **Logout in one tab** triggers logout in all tabs
- **Loop prevention**: Advanced logic prevents infinite broadcast loops
- **Graceful fallback**: Falls back to localStorage if BroadcastChannel unavailable

### Configuration

```typescript
<idle-warning-dialog
  [enableMultiTab]="true"              // Enable/disable multi-tab sync (default: true)
  [multiTabChannelName]="'my-app-idle'" // Custom channel name for isolation
  [idleTimeout]="900000"
  [warningTimeout]="60000"
  [onLogoutCallback]="handleLogout">
</idle-warning-dialog>
```

### Implementation Details

- **Primary**: BroadcastChannel API for real-time cross-tab communication
- **Fallback**: localStorage-based synchronization for legacy browsers
- **Core Integration**: Built into the core idle detection library
- **Performance**: Lightweight with minimal overhead
- **Reliability**: Each tab maintains independent timers with synchronized state

### Advanced Use Cases

- **Enterprise Applications**: Seamless multi-tab experience for business users
- **Banking/Finance**: Coordinated security timeouts across all application instances
- **Shared Workstations**: Consistent session management across multiple browser tabs
- **Development/Testing**: Isolated channels prevent interference between different applications

##  Browser Compatibility

### BroadcastChannel API Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Mobile 90+)

### Fallback Support
- All modern browsers with localStorage support
- Graceful degradation for older browsers

##  Accessibility Features

- WCAG 2.1 AA compliant
- Keyboard navigation support (Tab, Enter, Escape)
- Screen reader compatible with ARIA labels
- High contrast mode support
- Focus management
- Reduced motion support

##  Performance

- Minimal bundle size impact (~15KB gzipped with all features)
- Efficient event throttling
- Memory leak prevention
- Optimized for large applications
- Tree-shakable exports
- Custom templates compiled at build-time (no runtime overhead)
- Custom actions use efficient event delegation
- BroadcastChannel API is lightweight and efficient

##  Migration Guide

### From Manual Implementation

If you currently have manual idle detection:

1. **Remove** your existing idle detection code
2. **Remove** timer management logic  
3. **Replace** with `<idle-warning-dialog>` component
4. **Configure** timeouts and callbacks

**Before:**
```typescript
// 100+ lines of manual idle detection code
private setupIdleDetection() { /* complex setup */ }
private resetIdleTimer() { /* timer management */ }
private showWarning() { /* dialog management */ }
// ... etc
```

**After:**
```typescript
<idle-warning-dialog
  [idleTimeout]="900000"
  [warningTimeout]="60000"
  [onLogoutCallback]="handleLogout">
</idle-warning-dialog>
```

##  Example Application

Check out the complete working example in the `example/angular-sample/` directory:

```bash
git clone <repository-url>
cd idle-detection-library
npm install
npm run build
cd example/angular-sample
npm install
npm start
```

Visit `http://localhost:4200` to see the component in action with:
- Real-time activity detection
- Configurable timeouts (2 minutes idle, 20 seconds warning for demo)
- Industry-standard dialog behavior
- Multi-tab coordination
- Event logging and debugging

### Available Examples

The sample application includes multiple examples:

1. **Basic Usage** (`src/app/app.component.ts`)
   - Default configuration with multi-tab coordination
   - Standard extend/logout workflow

2. **Custom Templates** (`src/app/custom-template-example.component.ts`)
   - Animated modal with circular progress indicator
   - Custom styling and layout

3. **Template References** (`src/app/template-ref-example.component.ts`)
   - Minimal dark theme template
   - Demonstrates template reference approach

4. **Custom Actions** (`src/app/custom-actions-example.component.ts`)
   - Multiple custom action buttons
   - Save & Continue, Remind Later, Help, Emergency Exit
   - Interactive configuration controls

##  Troubleshooting

### Dialog Not Showing

1. **Check imports**: Ensure `IdleWarningDialogComponent` is in your `imports` array
2. **Check console**: Look for error messages in browser console
3. **Verify timeouts**: Make sure `idleTimeout` and `warningTimeout` are reasonable values

### Activity Not Detected

1. **Check `enableIdleDetection`**: Should be `true` (default)
2. **Verify events**: Ensure activity events aren't being prevented by other components
3. **Check initialization**: Component should initialize automatically

### Callbacks Not Working

```typescript
// Correct - arrow functions maintain 'this' context
handleLogout = () => {
  this.router.navigate(['/login']);
};

// Incorrect - regular functions lose 'this' context
handleLogout() {
  this.router.navigate(['/login']); // 'this' is undefined
}
```

##  Best Practices

1. **Set Appropriate Timeouts**: Consider your application's usage patterns
   - Banking/Financial: 15-30 minutes
   - General Business: 30-60 minutes  
   - Public Computers: 5-15 minutes

2. **Provide Clear Messages**: Users should understand why they're being warned

3. **Test Multi-Tab Functionality**: Always test with multiple browser tabs open

4. **Test Thoroughly**: Test with different user interactions and scenarios

5. **Handle Errors Gracefully**: Implement proper error handling for logout failures

6. **Consider Mobile Users**: Touch events are automatically included

7. **Server-Side Validation**: Always validate session timeout server-side too

8. **Channel Isolation**: Use unique channel names for different applications

9. **Custom Template Guidelines**:
   - Maintain accessibility with proper ARIA labels
   - Test with keyboard navigation
   - Ensure responsive design for mobile devices
   - Use `(click)="$event.stopPropagation()"` on dialog containers

10. **Custom Actions Best Practices**:
    - Use descriptive action IDs and labels
    - Set appropriate `order` values for logical button sequence
    - Consider whether actions should close the dialog (`closeDialog` property)
    - Provide clear icons and consistent styling
    - Handle action failures gracefully in callbacks

11. **CSS Customization Guidelines**:
    - Use CSS class inputs for consistent design system integration
    - Test responsive design across different screen sizes
    - Ensure sufficient color contrast for accessibility
    - Consider dark mode compatibility when using custom colors
    - Use `::ng-deep` selectors when overriding component styles from parent components
    - Namespace your custom classes to avoid conflicts (e.g., `my-app-dialog`)

##  Contributing

We welcome contributions! To get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`  
3. **Make** your changes and add tests
4. **Run** tests: `npm test`
5. **Commit** changes: `git commit -m 'Add amazing feature'`
6. **Push** to branch: `git push origin feature/amazing-feature`
7. **Open** a Pull Request

##  License

MIT License - see [LICENSE](LICENSE) file for details.

##  Documentation

- **[Complete Documentation](README.md)** - This file
- **[Custom Templates & Actions Guide](CUSTOM_TEMPLATES.md)** - Detailed guide for UI customization
- **[Example Applications](example/)** - Working examples and demos

##  Support

-  [Documentation & Examples](example/)
-  [Report Issues](https://github.com/your-org/idle-detection-library/issues)
-  [Ask Questions](https://github.com/your-org/idle-detection-library/discussions)

##  Acknowledgments

- Angular team for the amazing framework
- Community contributors and testers
- Inspiration from industry-standard security practices

---

**Made with care for the Angular community**