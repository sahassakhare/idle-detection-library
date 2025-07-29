# Custom Templates & Actions for Idle Warning Dialog

The idle warning dialog component now supports both custom templates and custom call-to-action buttons, giving you complete control over the UI and user interactions while maintaining all the core functionality like idle detection, multi-tab coordination, and session management.

## Two Ways to Use Custom Templates

### 1. Content Projection with ng-template

```typescript
@Component({
  template: `
    <idle-warning-dialog
      [idleTimeout]="120000"
      [warningTimeout]="30000"
      [enableMultiTab]="true">
      
      <!-- Your custom template -->
      <ng-template #customTemplate let-data let-onExtend="onExtend" let-onLogout="onLogout">
        <div class="my-custom-dialog">
          <h1>Session Expiring!</h1>
          <p>Time remaining: {{ data.formattedTime }}</p>
          <div class="progress-bar">
            <div class="progress" [style.width.%]="data.progressPercentage"></div>
          </div>
          <button (click)="onExtend()">Continue</button>
          <button (click)="onLogout()">Logout</button>
        </div>
      </ng-template>
      
    </idle-warning-dialog>
  `
})
```

### 2. Template Reference Input

```typescript
@Component({
  template: `
    <!-- Define template separately -->
    <ng-template #myTemplate let-data let-onExtend="onExtend" let-onLogout="onLogout">
      <div class="custom-modal">
        <h2>{{ data.dialogTitle }}</h2>
        <p>{{ data.dialogMessage }}</p>
        <div class="countdown">{{ data.formattedTime }}</div>
        <button (click)="onExtend()">Stay</button>
        <button (click)="onLogout()">Leave</button>
      </div>
    </ng-template>
    
    <!-- Pass template as input -->
    <idle-warning-dialog
      [customTemplateRef]="myTemplate"
      [idleTimeout]="300000"
      [warningTimeout]="60000">
    </idle-warning-dialog>
  `
})
export class MyComponent {
  @ViewChild('myTemplate', { static: true }) myTemplate!: TemplateRef<any>;
}
```

## Template Context Variables

Your custom template receives these context variables:

### Main Data Object (`let-data`)
- `data.timeRemaining` - Milliseconds remaining
- `data.formattedTime` - Formatted time string (MM:SS)
- `data.progressPercentage` - Progress percentage (0-100)
- `data.isWarningShown` - Boolean indicating if warning is shown
- `data.dialogTitle` - Current dialog title
- `data.dialogMessage` - Current dialog message
- `data.extendButtonText` - Text for extend button
- `data.logoutButtonText` - Text for logout button

### Callback Functions
- `onExtend` - Function to call when extending session
- `onLogout` - Function to call when logging out
- `formatTime` - Helper function to format milliseconds to MM:SS

### Additional Properties
- `timeRemaining` - Signal containing time remaining
- `progressPercentage` - Signal containing progress percentage
- `theme` - Current theme ('default', 'dark', 'minimal')
- `size` - Current size ('small', 'medium', 'large')

## Complete Example: Animated Custom Dialog

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdleWarningDialogComponent } from '@idle-detection/angular';

@Component({
  selector: 'app-custom-idle',
  standalone: true,
  imports: [CommonModule, IdleWarningDialogComponent],
  template: `
    <idle-warning-dialog
      [idleTimeout]="60000"
      [warningTimeout]="20000"
      [enableMultiTab]="true"
      [onExtendCallback]="handleExtend"
      [onLogoutCallback]="handleLogout">
      
      <ng-template #customTemplate let-data let-onExtend="onExtend" let-onLogout="onLogout">
        <div class="animated-modal">
          <div class="modal-header">
            <div class="pulse-icon">⏰</div>
            <h2>Session Timeout Warning</h2>
          </div>
          
          <div class="modal-body">
            <p>Your session will expire due to inactivity.</p>
            
            <!-- Circular Progress -->
            <div class="circular-progress">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" stroke-width="10"/>
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="#ff6b6b" 
                  stroke-width="10"
                  stroke-linecap="round"
                  [style.strokeDasharray]="283"
                  [style.strokeDashoffset]="283 - (283 * data.progressPercentage / 100)"
                  transform="rotate(-90 50 50)"/>
              </svg>
              <div class="time-display">{{ data.formattedTime }}</div>
            </div>
            
            <div class="actions">
              <button class="btn-extend" (click)="onExtend()">
                Continue Working
              </button>
              <button class="btn-logout" (click)="onLogout()">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </ng-template>
      
    </idle-warning-dialog>
  `,
  styles: [`
    .animated-modal {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      width: 400px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    .modal-header {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 24px;
      text-align: center;
    }
    
    .pulse-icon {
      font-size: 48px;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    .modal-body {
      padding: 32px;
      text-align: center;
    }
    
    .circular-progress {
      position: relative;
      width: 120px;
      height: 120px;
      margin: 24px auto;
    }
    
    .circular-progress svg {
      width: 100%;
      height: 100%;
    }
    
    .time-display {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
    
    .actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }
    
    .actions button {
      flex: 1;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-extend {
      background: #667eea;
      color: white;
    }
    
    .btn-extend:hover {
      background: #5a67d8;
      transform: translateY(-2px);
    }
    
    .btn-logout {
      background: #e0e0e0;
      color: #333;
    }
    
    .btn-logout:hover {
      background: #d0d0d0;
    }
  `]
})
export class CustomIdleComponent {
  handleExtend = () => {
    console.log('Session extended');
    // Your custom extend logic
  };
  
  handleLogout = () => {
    console.log('User logged out');
    // Your custom logout logic
  };
}
```

## Tips for Custom Templates

1. **Maintain Accessibility**: Include proper ARIA labels and keyboard navigation
2. **Handle Click Events**: Use `(click)="$event.stopPropagation()"` on your dialog container to prevent backdrop clicks
3. **Responsive Design**: Ensure your custom template works on mobile devices
4. **Animation**: Add smooth transitions for better UX
5. **Progress Indicators**: Use `data.progressPercentage` for visual countdown displays

# Custom Call-to-Action Buttons

In addition to custom templates, you can add custom action buttons to the default dialog or use them within custom templates.

## Basic Custom Actions Usage

```typescript
import { CustomAction } from '@idle-detection/angular';

@Component({
  template: `
    <idle-warning-dialog
      [customActions]="customActions"
      [hideDefaultActions]="false"
      [idleTimeout]="300000"
      [warningTimeout]="60000">
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

## Custom Action Interface

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

## Action Configuration Options

### Control Default Actions
```typescript
<idle-warning-dialog
  [hideDefaultActions]="true"     // Hide both Extend and Logout
  [showExtendButton]="false"      // Hide only Extend button
  [showLogoutButton]="false"      // Hide only Logout button
  [customActions]="myActions">
</idle-warning-dialog>
```

### Advanced Custom Actions Example

```typescript
customActions: CustomAction[] = [
  // Primary action - save work and continue
  {
    id: 'save-continue',
    label: 'Save & Continue Working',
    cssClass: 'btn btn-primary btn-lg',
    icon: `<svg viewBox="0 0 24 24">
      <path fill="currentColor" d="M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z"/>
    </svg>`,
    order: 1,
    callback: () => {
      this.saveUserWork();
      this.extendSession();
    },
    closeDialog: true
  },
  
  // Secondary action - remind later
  {
    id: 'remind-later',
    label: 'Remind in 10 minutes',
    cssClass: 'btn btn-warning',
    icon: `<svg viewBox="0 0 24 24">
      <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
    </svg>`,
    order: 2,
    callback: () => this.snoozeWarning(10),
    closeDialog: true
  },
  
  // Utility action - doesn't close dialog
  {
    id: 'backup',
    label: 'Create Backup',
    cssClass: 'btn btn-outline-secondary btn-sm',
    order: 3,
    callback: () => this.createBackup(),
    closeDialog: false // Keep dialog open
  },
  
  // Emergency action
  {
    id: 'emergency-save',
    label: 'Emergency Save & Exit',
    cssClass: 'btn btn-danger',
    icon: `<svg viewBox="0 0 24 24">
      <path fill="currentColor" d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>
    </svg>`,
    order: 99,
    callback: () => this.emergencyExit(),
    closeDialog: true
  }
];
```

## Using Custom Actions in Custom Templates

Custom actions are available in the template context:

```typescript
<ng-template #myTemplate let-data let-onCustomAction="onCustomAction">
  <div class="my-dialog">
    <h2>Session Warning</h2>
    <p>Time: {{ data.formattedTime }}</p>
    
    <!-- Custom actions in template -->
    <div class="actions">
      <button 
        *ngFor="let action of data.customActions" 
        [class]="action.cssClass"
        (click)="onCustomAction(action)">
        <span [innerHTML]="action.icon"></span>
        {{ action.label }}
      </button>
    </div>
  </div>
</ng-template>
```

## Real-World Examples

### 1. Document Editor with Auto-Save
```typescript
customActions: CustomAction[] = [
  {
    id: 'auto-save-continue',
    label: 'Auto-Save & Continue',
    cssClass: 'btn btn-success',
    callback: () => this.enableAutoSave(),
    order: 1
  },
  {
    id: 'save-as-draft',
    label: 'Save as Draft',
    cssClass: 'btn btn-secondary', 
    callback: () => this.saveDraft(),
    order: 2
  }
];
```

### 2. E-commerce Checkout Process
```typescript
customActions: CustomAction[] = [
  {
    id: 'save-cart',
    label: 'Save Cart & Continue Shopping',
    cssClass: 'btn btn-primary',
    callback: () => this.saveCartAndContinue(),
    order: 1
  },
  {
    id: 'quick-checkout',
    label: 'Quick Checkout',
    cssClass: 'btn btn-warning',
    callback: () => this.proceedToCheckout(),
    order: 2
  }
];
```

### 3. Form with Unsaved Changes
```typescript
customActions: CustomAction[] = [
  {
    id: 'save-form',
    label: 'Save Form Data',
    cssClass: 'btn btn-success',
    callback: () => this.saveFormData(),
    closeDialog: false, // Keep dialog open to allow multiple actions
    order: 1
  },
  {
    id: 'discard-continue',
    label: 'Discard Changes & Continue',
    cssClass: 'btn btn-outline-danger',
    callback: () => this.discardChanges(),
    order: 2
  }
];
```

## Combining with Other Features

Custom actions and templates work seamlessly with all other features:
- Multi-tab coordination
- Activity detection  
- Callbacks and events
- All configuration options

```typescript
<idle-warning-dialog
  [customTemplateRef]="myTemplate"
  [customActions]="myActions"
  [hideDefaultActions]="false"
  [idleTimeout]="900000"
  [warningTimeout]="60000"
  [enableMultiTab]="true"
  multiTabChannelName="my-app-idle"
  [activityEvents]="['click', 'keypress', 'scroll']"
  (idleStart)="onIdleStart()"
  (warningStart)="onWarningStart()"
  (sessionExtended)="onSessionExtended()">
</idle-warning-dialog>
```