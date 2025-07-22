# Angular Idle Detection Sample

This sample demonstrates the complete idle detection solution using the `@idle-detection/angular-oauth-integration` library.

## Features

- **Zero Setup**: Just add one component tag - no manual idle detection code required
- **Complete Solution**: Automatic idle detection, warning dialog, and session management
- **Industry Standard Security**: Backdrop clicks disabled to prevent accidental logouts
- **Customizable**: Configurable timeouts, themes, messages, and styling
- **Event Monitoring**: Real-time activity logging for debugging and monitoring

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Build the library packages (from root directory):
```bash
npm run build
```

3. Start the development server:
```bash
npm start
```

4. Open http://localhost:4200 in your browser

## Implementation

This sample shows the simplest possible implementation - just add the component:

```typescript
import { IdleWarningDialogComponent } from '@idle-detection/angular-oauth-integration';

@Component({
  imports: [IdleWarningDialogComponent],
  template: `
    <!-- Your app content -->
    
    <!-- Complete idle detection solution -->
    <idle-warning-dialog
      [idleTimeout]="30000"
      [warningTimeout]="15000"
      [onLogoutCallback]="handleLogout">
    </idle-warning-dialog>
  `
})
```

**That's it!** The component automatically handles:
- Activity detection across your entire app
- Idle state management
- Warning dialog display and countdown
- Session extension and timeout

## Testing the Idle Detection

1. **Activity Detection**: Move your mouse, type, or click - see activity logged in real-time
2. **Idle Trigger**: Wait 30 seconds without activity to trigger the warning dialog
3. **Warning Dialog**: Dialog appears with 15-second countdown
4. **Extend Session**: Click "Yes, Continue" to extend session and reset idle timer
5. **Auto Logout**: Let countdown reach zero to trigger automatic logout

## Configuration Options

The component supports extensive configuration:

```typescript
<idle-warning-dialog
  [idleTimeout]="900000"           // 15 minutes until idle
  [warningTimeout]="60000"         // 1 minute warning
  [activityEvents]="['click', 'mousemove']"  // Events to monitor
  [enableIdleDetection]="true"     // Enable/disable detection
  [onExtendCallback]="handleExtend"
  [onLogoutCallback]="handleLogout"
  dialogTitle="Session Timeout"
  dialogMessage="Your session will expire soon"
  extendButtonText="Keep me signed in"
  logoutButtonText="Sign out"
  theme="default"                  // default, dark, minimal
  size="medium">                   // small, medium, large
</idle-warning-dialog>
```

## Industry Standard Security

This implementation follows industry standards for session timeout dialogs:

- **No backdrop dismissal**: Clicking outside the dialog does NOT close it
- **Explicit user action required**: Users must click action buttons
- **Clear messaging**: Countdown timer and clear instructions
- **Secure by default**: No accidental logouts from mis-clicks

This matches the behavior of:
- Banking applications
- Google Workspace
- Microsoft 365
- AWS Console
- Enterprise security systems

## Events and Callbacks

The component emits events for integration with your app:

```typescript
<idle-warning-dialog
  (activityDetected)="onActivity($event)"
  (idleStart)="onIdleStart()"
  (warningStart)="onWarningStart()"
  (sessionExtended)="onSessionExtended()"
  (sessionTimeout)="onSessionTimeout()">
</idle-warning-dialog>
```