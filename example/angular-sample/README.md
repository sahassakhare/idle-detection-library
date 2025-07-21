# Angular Idle Detection Sample

This sample demonstrates how to use the `@idle-detection/angular-oauth-integration` library in an Angular application.

## Features

- Real-time idle detection with configurable timeouts
- Warning dialog with countdown timer
- Session extension capabilities
- Event logging for debugging
- Test scenarios for various use cases

## Setup

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

## Testing the Idle Detection

1. **Normal Flow**: Wait for 60 seconds without any activity to trigger idle state
2. **Warning Dialog**: After going idle, a warning dialog appears for 30 seconds
3. **Extend Session**: Click "Yes, Continue" to extend the session
4. **Auto Logout**: Let the warning timer expire to trigger automatic logout

## Configuration

The idle detection is configured in `app.config.ts`:

- `idle`: 60000ms (1 minute) - Time before user is considered idle
- `timeout`: 30000ms (30 seconds) - Warning dialog duration
- `keepAliveInterval`: 15000ms (15 seconds) - Interval for keep-alive pings
- `events`: Mouse, keyboard, touch, and scroll events trigger activity

## Important Notes

### Industry Standard onBackdropClick Behavior

The `onBackdropClick` handler in the idle warning dialog component (line 477 in `idle-warning-dialog.component.ts`) now follows industry standards:

- **Backdrop clicks are completely disabled** - clicking outside the dialog will NOT close it
- This matches the behavior of banking applications, Google Workspace, Microsoft 365, and AWS Console
- Users must explicitly click "Yes, Continue" or "No, Logout" to dismiss the dialog
- The `backdropClose` property has been removed as it's not appropriate for session timeout dialogs
- This prevents accidental logouts from mis-clicks outside the modal

## Customization

The warning dialog supports extensive customization:

- **Theme**: 'default', 'dark', or 'minimal'
- **Size**: 'small', 'medium', or 'large'
- **Content**: Custom title, message, and button text
- **Features**: Toggle countdown timer and progress bar
- **Styling**: Custom CSS classes and inline styles