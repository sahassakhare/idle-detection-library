# Style-Agnostic Idle Warning Dialog

The `IdleWarningDialogComponent` is completely style-agnostic, allowing you to apply your own CSS styles and integrate seamlessly with any design system.

## Quick Start

### Option 1: Use Pre-built Themes

```scss
// In your global styles or component styles
@import '@idle-detection/angular-oauth-integration/styles/default-theme.css';

// Optional: Dark theme
@import '@idle-detection/angular-oauth-integration/styles/dark-theme.css';

// Optional: Minimal theme
@import '@idle-detection/angular-oauth-integration/styles/minimal-theme.css';
```

### Option 2: Custom CSS Classes

```html
<idle-warning-dialog
  backdropClass="my-custom-backdrop"
  dialogClass="my-custom-dialog"
  headerClass="my-custom-header"
  titleClass="my-custom-title"
  messageClass="my-custom-message"
  primaryButtonClass="my-btn my-btn-primary"
  secondaryButtonClass="my-btn my-btn-secondary">
</idle-warning-dialog>
```

### Option 3: Framework Integration

#### Bootstrap Integration
```html
<idle-warning-dialog
  dialogClass="modal-content"
  headerClass="modal-header"
  titleClass="modal-title"
  bodyClass="modal-body"
  actionsClass="modal-footer"
  primaryButtonClass="btn btn-primary"
  secondaryButtonClass="btn btn-secondary">
</idle-warning-dialog>
```

#### Tailwind CSS Integration
```html
<idle-warning-dialog
  backdropClass="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  dialogClass="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
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

#### Material Design Integration
```html
<idle-warning-dialog
  dialogClass="mdc-dialog__surface"
  headerClass="mdc-dialog__header"
  titleClass="mdc-dialog__title"
  bodyClass="mdc-dialog__content"
  actionsClass="mdc-dialog__actions"
  primaryButtonClass="mdc-button mdc-button--raised"
  secondaryButtonClass="mdc-button mdc-button--outlined">
</idle-warning-dialog>
```

## Complete Customization Reference

### Available CSS Class Inputs

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

### HTML Structure

The component generates this HTML structure:

```html
<div class="{backdropClass}">
  <div class="{dialogClass}" [ngStyle]="customStyles">
    <div class="{headerClass}">
      <h2 class="{titleClass}">Session Timeout Warning</h2>
    </div>
    
    <div class="{bodyClass}">
      <p class="{messageClass}">Your session will expire soon...</p>
      
      <div class="{countdownClass}" *ngIf="showCountdown">
        <span class="{countdownLabelClass}">Time remaining:</span>
        <span class="{countdownTimeClass}">02:00</span>
      </div>
      
      <div class="{progressClass}" *ngIf="showProgressBar">
        <div class="{progressBarClass}" [style.width.%]="75"></div>
      </div>
    </div>
    
    <div class="{actionsClass}">
      <button class="{primaryButtonClass}">Stay Logged In</button>
      <button class="{secondaryButtonClass}">Logout Now</button>
    </div>
  </div>
</div>
```

## Custom Styling Examples

### Example 1: Corporate Design System

```scss
// corporate-idle-dialog.scss
.corporate-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 31, 63, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.corporate-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 31, 63, 0.3);
  max-width: 480px;
  width: 90%;
  font-family: 'Inter', -apple-system, sans-serif;
}

.corporate-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
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
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 16px;
  margin: 20px 0;
  text-align: center;
}

.corporate-countdown-time {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: #dc2626;
  font-family: 'SF Mono', Monaco, monospace;
  margin-top: 8px;
}

.corporate-actions {
  padding: 16px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.corporate-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 120px;
}

.corporate-btn-primary {
  background: #001f3f;
  color: white;
}

.corporate-btn-primary:hover {
  background: #003366;
  transform: translateY(-1px);
}

.corporate-btn-secondary {
  background: transparent;
  color: #6b7280;
  border: 2px solid #d1d5db;
}

.corporate-btn-secondary:hover {
  border-color: #9ca3af;
  color: #374151;
}
```

```html
<idle-warning-dialog
  backdropClass="corporate-backdrop"
  dialogClass="corporate-dialog"
  headerClass="corporate-header"
  titleClass="corporate-title"
  bodyClass="corporate-body"
  messageClass="corporate-message"
  countdownClass="corporate-countdown"
  countdownTimeClass="corporate-countdown-time"
  actionsClass="corporate-actions"
  primaryButtonClass="corporate-btn corporate-btn-primary"
  secondaryButtonClass="corporate-btn corporate-btn-secondary">
</idle-warning-dialog>
```

### Example 2: Gaming Theme

```scss
// gaming-idle-dialog.scss
.gaming-backdrop {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at center, rgba(138, 43, 226, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: pulse-backdrop 2s ease-in-out infinite;
}

.gaming-dialog {
  background: linear-gradient(145deg, #1a1a2e, #16213e);
  border: 2px solid #00ffff;
  border-radius: 16px;
  box-shadow: 
    0 0 20px rgba(0, 255, 255, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  max-width: 500px;
  width: 90%;
  font-family: 'Orbitron', monospace;
  animation: glow-border 3s ease-in-out infinite;
}

.gaming-title {
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.gaming-message {
  color: #ffffff;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

.gaming-countdown {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid #ff0066;
  border-radius: 8px;
  box-shadow: inset 0 0 10px rgba(255, 0, 102, 0.3);
}

.gaming-countdown-time {
  color: #ff0066;
  text-shadow: 0 0 15px rgba(255, 0, 102, 0.8);
  font-size: 3rem;
  animation: pulse-time 1s ease-in-out infinite;
}

.gaming-btn {
  background: linear-gradient(145deg, #00ffff, #0099cc);
  color: #000;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
}

.gaming-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 255, 255, 0.5);
}

.gaming-btn-danger {
  background: linear-gradient(145deg, #ff0066, #cc0033);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 0, 102, 0.3);
}

@keyframes pulse-backdrop {
  0%, 100% { background: radial-gradient(circle at center, rgba(138, 43, 226, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%); }
  50% { background: radial-gradient(circle at center, rgba(138, 43, 226, 0.6) 0%, rgba(0, 0, 0, 0.95) 100%); }
}

@keyframes glow-border {
  0%, 100% { border-color: #00ffff; box-shadow: 0 0 20px rgba(0, 255, 255, 0.5); }
  50% { border-color: #ff0066; box-shadow: 0 0 30px rgba(255, 0, 102, 0.7); }
}

@keyframes pulse-time {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

### Example 3: Minimalist Design

```scss
// minimalist-idle-dialog.scss
.minimalist-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.minimalist-dialog {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.minimalist-header {
  padding: 20px 20px 0;
}

.minimalist-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 500;
  color: #333;
  text-align: left;
}

.minimalist-body {
  padding: 20px;
}

.minimalist-message {
  margin: 0 0 20px;
  color: #666;
  line-height: 1.5;
  font-size: 0.9rem;
}

.minimalist-countdown {
  background: #f8f8f8;
  border-left: 3px solid #333;
  padding: 12px 16px;
  margin: 16px 0;
}

.minimalist-countdown-label {
  font-size: 0.8rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.minimalist-countdown-time {
  font-size: 1.5rem;
  font-weight: 300;
  color: #333;
  font-family: Georgia, serif;
}

.minimalist-progress {
  height: 2px;
  background: #f0f0f0;
  margin: 16px 0;
}

.minimalist-progress-bar {
  height: 100%;
  background: #333;
  transition: width 1s ease-out;
}

.minimalist-actions {
  padding: 0 20px 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.minimalist-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  color: #333;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.minimalist-btn:hover {
  border-color: #333;
}

.minimalist-btn-primary {
  background: #333;
  color: white;
  border-color: #333;
}

.minimalist-btn-primary:hover {
  background: #555;
}
```

## Integration with Popular UI Libraries

### Angular Material
```typescript
// app.component.ts
@Component({
  template: `
    <idle-warning-dialog
      dialogClass="mat-dialog-container"
      headerClass="mat-dialog-header"
      titleClass="mat-dialog-title"
      bodyClass="mat-dialog-content"
      actionsClass="mat-dialog-actions"
      primaryButtonClass="mat-raised-button mat-primary"
      secondaryButtonClass="mat-button">
    </idle-warning-dialog>
  `
})
```

### PrimeNG
```html
<idle-warning-dialog
  dialogClass="p-dialog p-component"
  headerClass="p-dialog-header"
  titleClass="p-dialog-title"
  bodyClass="p-dialog-content"
  actionsClass="p-dialog-footer"
  primaryButtonClass="p-button p-button-primary"
  secondaryButtonClass="p-button p-button-secondary">
</idle-warning-dialog>
```

### Ant Design (ng-zorro)
```html
<idle-warning-dialog
  dialogClass="ant-modal-content"
  headerClass="ant-modal-header"
  titleClass="ant-modal-title"
  bodyClass="ant-modal-body"
  actionsClass="ant-modal-footer"
  primaryButtonClass="ant-btn ant-btn-primary"
  secondaryButtonClass="ant-btn ant-btn-default">
</idle-warning-dialog>
```

## Best Practices

### 1. Consistent Design System
```scss
// Define CSS custom properties for consistency
:root {
  --idle-dialog-primary-color: #007bff;
  --idle-dialog-danger-color: #dc3545;
  --idle-dialog-border-radius: 8px;
  --idle-dialog-box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  --idle-dialog-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.my-idle-dialog {
  border-radius: var(--idle-dialog-border-radius);
  box-shadow: var(--idle-dialog-box-shadow);
  font-family: var(--idle-dialog-font-family);
}
```

### 2. Accessibility Considerations
```scss
.idle-dialog {
  /* Ensure sufficient color contrast */
  color: #212529;
  background: white;
  
  /* Focus indicators */
  button:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border: 2px solid;
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transition: none;
  }
}
```

### 3. Dark Mode Support
```scss
@media (prefers-color-scheme: dark) {
  .idle-dialog {
    background: #2d3748;
    color: #e2e8f0;
    border-color: #4a5568;
  }
  
  .idle-dialog .btn-primary {
    background: #4299e1;
  }
}
```

The style-agnostic approach ensures maximum flexibility while maintaining the component's functionality and accessibility features.