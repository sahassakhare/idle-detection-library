# Angular Idle Detection Library

A complete, zero-setup Angular library for session timeout management with industry-standard security practices. This library provides automatic idle detection, warning dialogs, and session management with minimal configuration.

## ✨ Features

- **🔧 Zero Setup**: Add one component tag and you're done - no complex configuration
- **🛡️ Industry Standard Security**: No backdrop clicks, explicit user action required
- **⚡ Automatic**: Detects activity across your entire application automatically
- **🎨 Highly Customizable**: Configurable timeouts, themes, messages, and styling
- **📱 Modern Angular**: Built with Angular 18+ standalone components
- **🚀 No Dependencies**: No NgRx, RxJS knowledge, or complex setup required
- **♿ Accessible**: WCAG compliant with keyboard navigation and screen reader support

## 🚀 Quick Start

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
- ✅ Activity detection across your entire application
- ✅ Idle state management with configurable timeouts  
- ✅ Warning dialog display with countdown timer
- ✅ Session extension and automatic timeout
- ✅ Industry-standard security (no accidental dismissals)

## 🎛️ Configuration

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

## 📚 Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `idleTimeout` | `number` | `900000` (15 min) | Time in ms before user is considered idle |
| `warningTimeout` | `number` | `60000` (1 min) | Warning dialog duration in ms |
| `activityEvents` | `string[]` | `['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']` | DOM events that indicate user activity |
| `enableIdleDetection` | `boolean` | `true` | Enable/disable automatic idle detection |
| `throttleDelay` | `number` | `500` | Throttle activity events (ms) |
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

## 📡 Output Events

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

## 💡 Usage Examples

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
    this.idleDialog.pause();
  }
  
  resumeIdleDetection() {
    this.idleDialog.resume();
  }
  
  resetTimer() {
    this.idleDialog.reset();
  }
}
```

## 🎨 Themes

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

## 🛡️ Industry Standard Security

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

## 🖥️ Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## ♿ Accessibility Features

- ✅ WCAG 2.1 AA compliant
- ✅ Keyboard navigation support (Tab, Enter, Escape)
- ✅ Screen reader compatible with ARIA labels
- ✅ High contrast mode support
- ✅ Focus management
- ✅ Reduced motion support

## 🚀 Performance

- ✅ Minimal bundle size impact (~12KB gzipped)
- ✅ Efficient event throttling
- ✅ Memory leak prevention
- ✅ Optimized for large applications
- ✅ Tree-shakable exports

## 📋 Migration Guide

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

## 📁 Example Application

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
- Configurable timeouts (10 seconds idle, 5 seconds warning for demo)
- Industry-standard dialog behavior
- Event logging and debugging

## 🔧 Troubleshooting

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
// ✅ Correct - arrow functions maintain 'this' context
handleLogout = () => {
  this.router.navigate(['/login']);
};

// ❌ Incorrect - regular functions lose 'this' context
handleLogout() {
  this.router.navigate(['/login']); // 'this' is undefined
}
```

## 💬 Best Practices

1. **Set Appropriate Timeouts**: Consider your application's usage patterns
   - Banking/Financial: 15-30 minutes
   - General Business: 30-60 minutes  
   - Public Computers: 5-15 minutes

2. **Provide Clear Messages**: Users should understand why they're being warned

3. **Test Thoroughly**: Test with different user interactions and scenarios

4. **Handle Errors Gracefully**: Implement proper error handling for logout failures

5. **Consider Mobile Users**: Touch events are automatically included

6. **Server-Side Validation**: Always validate session timeout server-side too

## 🤝 Contributing

We welcome contributions! To get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`  
3. **Make** your changes and add tests
4. **Run** tests: `npm test`
5. **Commit** changes: `git commit -m 'Add amazing feature'`
6. **Push** to branch: `git push origin feature/amazing-feature`
7. **Open** a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation & Examples](example/)
- 🐛 [Report Issues](https://github.com/your-org/idle-detection-library/issues)
- 💬 [Ask Questions](https://github.com/your-org/idle-detection-library/discussions)

## 🙏 Acknowledgments

- Angular team for the amazing framework
- Community contributors and testers
- Inspiration from industry-standard security practices

---

**Made with ❤️ for the Angular community**