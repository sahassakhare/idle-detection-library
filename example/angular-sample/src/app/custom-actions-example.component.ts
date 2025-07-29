import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdleWarningDialogComponent } from '../../../../packages/angular-oauth-integration/src/lib/idle-warning-dialog.component';
import { CustomAction } from '../../../../packages/angular-oauth-integration/src/lib/types';

@Component({
  selector: 'app-custom-actions-example',
  standalone: true,
  imports: [CommonModule, FormsModule, IdleWarningDialogComponent],
  template: `
    <div class="example-container">
      <h2>Custom Actions Example</h2>
      <p>This example demonstrates custom call-to-action buttons in the idle warning dialog.</p>
      
      <div class="controls">
        <h3>Configuration Options:</h3>
        <label>
          <input type="checkbox" [(ngModel)]="hideDefaultActions">
          Hide Default Actions (Extend/Logout)
        </label>
        <br>
        <label>
          <input type="checkbox" [(ngModel)]="showExtendButton">
          Show Extend Button
        </label>
        <br>
        <label>
          <input type="checkbox" [(ngModel)]="showLogoutButton">
          Show Logout Button
        </label>
        <br>
        <button class="btn btn-info" (click)="triggerIdle()">
          Trigger Idle Warning (for testing)
        </button>
      </div>
      
      <!-- Idle Warning Dialog with Custom Actions -->
      <idle-warning-dialog
        [idleTimeout]="60000"
        [warningTimeout]="30000"
        [customActions]="customActions"
        [hideDefaultActions]="hideDefaultActions"
        [showExtendButton]="showExtendButton"
        [showLogoutButton]="showLogoutButton"
        [enableMultiTab]="false"
        [onExtendCallback]="handleExtend"
        [onLogoutCallback]="handleLogout"
        (activityDetected)="onActivity($event)"
        (idleStart)="onIdle()"
        (warningStart)="onWarning()"
        (sessionExtended)="onExtended()">
      </idle-warning-dialog>
      
      <div class="actions-info">
        <h3>Available Custom Actions:</h3>
        <div class="action-cards">
          <div class="action-card" *ngFor="let action of customActions">
            <div class="action-header">
              <span class="action-icon" [innerHTML]="action.icon"></span>
              <strong>{{ action.label }}</strong>
            </div>
            <div class="action-details">
              <p><strong>ID:</strong> {{ action.id }}</p>
              <p><strong>Order:</strong> {{ action.order || 0 }}</p>
              <p><strong>Close Dialog:</strong> {{ action.closeDialog !== false ? 'Yes' : 'No' }}</p>
              <p><strong>CSS Class:</strong> {{ action.cssClass || 'btn btn-custom' }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="event-log">
        <h3>Event Log</h3>
        <div class="log-content">
          <div *ngFor="let event of events" class="event-item">
            {{ event }}
          </div>
          <div *ngIf="events.length === 0" class="no-events">
            No events yet. Wait for idle timeout or click "Trigger Idle Warning".
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .example-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .controls {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    
    .controls h3 {
      margin: 0 0 15px 0;
      color: #2d3748;
    }
    
    .controls label {
      display: block;
      margin: 10px 0;
      color: #4a5568;
    }
    
    .controls input[type="checkbox"] {
      margin-right: 8px;
    }
    
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      margin: 10px 0;
    }
    
    .btn-info {
      background: #3182ce;
      color: white;
    }
    
    .btn-info:hover {
      background: #2c5282;
    }
    
    .btn-success {
      background: #48bb78;
      color: white;
    }
    
    .btn-success:hover {
      background: #38a169;
    }
    
    .btn-warning {
      background: #ed8936;
      color: white;
    }
    
    .btn-warning:hover {
      background: #dd6b20;
    }
    
    .btn-danger {
      background: #f56565;
      color: white;
    }
    
    .btn-danger:hover {
      background: #e53e3e;
    }
    
    .actions-info {
      margin: 30px 0;
    }
    
    .actions-info h3 {
      color: #2d3748;
      margin-bottom: 15px;
    }
    
    .action-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 15px;
    }
    
    .action-card {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 15px;
      transition: all 0.2s;
    }
    
    .action-card:hover {
      border-color: #3182ce;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .action-header {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      color: #2d3748;
    }
    
    .action-header .action-icon {
      margin-right: 8px;
    }
    
    .action-header .action-icon svg {
      width: 20px;
      height: 20px;
    }
    
    .action-details p {
      margin: 5px 0;
      font-size: 14px;
      color: #4a5568;
    }
    
    .event-log {
      margin-top: 30px;
      background: #f7fafc;
      border-radius: 8px;
      padding: 20px;
    }
    
    .event-log h3 {
      margin: 0 0 15px 0;
      color: #2d3748;
    }
    
    .log-content {
      max-height: 300px;
      overflow-y: auto;
    }
    
    .event-item {
      padding: 8px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
      color: #4a5568;
    }
    
    .event-item:last-child {
      border-bottom: none;
    }
    
    .no-events {
      text-align: center;
      color: #a0aec0;
      font-style: italic;
      padding: 20px;
    }
  `]
})
export class CustomActionsExampleComponent {
  events: string[] = [];
  hideDefaultActions = false;
  showExtendButton = true;
  showLogoutButton = true;
  
  customActions: CustomAction[] = [
    {
      id: 'save-and-continue',
      label: 'Save & Continue',
      cssClass: 'btn btn-success',
      icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3M19,19H5V5H16.17L19,7.83V19M12,12C10.34,12 9,13.34 9,15C9,16.66 10.34,18 12,18C13.66,18 15,16.66 15,15C15,13.34 13.66,12 12,12M6,6H15V10H6V6Z"/></svg>',
      order: 1,
      callback: () => this.saveAndContinue(),
      closeDialog: true
    },
    {
      id: 'remind-later',
      label: 'Remind in 5 min',
      cssClass: 'btn btn-warning',
      icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.7L16.2,16.2Z"/></svg>',
      order: 2,
      callback: () => this.remindLater(),
      closeDialog: true
    },
    {
      id: 'help',
      label: 'Help',
      cssClass: 'btn btn-info',
      icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z"/></svg>',
      order: 3,
      callback: () => this.showHelp(),
      closeDialog: false // Keep dialog open
    },
    {
      id: 'emergency-exit',
      label: 'Emergency Exit',
      cssClass: 'btn btn-danger',
      icon: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"/></svg>',
      order: 99,
      callback: () => this.emergencyExit(),
      closeDialog: true
    }
  ];
  
  constructor() {
    this.log('Custom actions example initialized');
  }
  
  saveAndContinue() {
    this.log('Save & Continue action triggered - saving user work...');
    // Simulate saving work
    setTimeout(() => this.log('Work saved successfully'), 500);
  }
  
  remindLater() {
    this.log('Remind Later action triggered - will remind in 5 minutes');
  }
  
  showHelp() {
    this.log('Help action triggered - showing help dialog (keeping idle dialog open)');
    alert('Help: This dialog warns you about session timeout. Choose an action to continue.');
  }
  
  emergencyExit() {
    this.log('Emergency Exit triggered - immediate logout without saving');
    alert('Emergency exit performed - all unsaved work will be lost');
  }
  
  triggerIdle() {
    this.log('Manually triggering idle warning for testing');
    // This would typically be done by manipulating the component directly
    // For demo purposes, we'll just log it
  }
  
  handleExtend = () => {
    this.log('Default extend action triggered');
  };
  
  handleLogout = () => {
    this.log('Default logout action triggered');
  };
  
  onActivity(event: Event) {
    this.log(`Activity detected: ${event.type}`);
  }
  
  onIdle() {
    this.log('User became idle');
  }
  
  onWarning() {
    this.log('Warning dialog shown');
  }
  
  onExtended() {
    this.log('Session was extended');
  }
  
  private log(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.events.unshift(`[${timestamp}] ${message}`);
    if (this.events.length > 15) {
      this.events.pop();
    }
  }
}