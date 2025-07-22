import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdleWarningDialogComponent } from '../../../../packages/angular-oauth-integration/src/lib/idle-warning-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, IdleWarningDialogComponent],
  template: `
    <div class="container">
      <h1>Angular Idle Detection Demo</h1>
      <p class="subtitle">Complete Idle Detection Solution with Industry Standard Security</p>
      
      <div class="feature-grid">
        <div class="feature-item">
          <div class="feature-icon">⏱️</div>
          <div class="feature-title">Auto Idle Detection</div>
          <div class="feature-description">Automatically monitors user activity</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🔒</div>
          <div class="feature-title">Secure Dialog</div>
          <div class="feature-description">No backdrop clicks (industry standard)</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">⚡</div>
          <div class="feature-title">Zero Setup</div>
          <div class="feature-description">Just add one component tag</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🎨</div>
          <div class="feature-title">Customizable</div>
          <div class="feature-description">Themes, timeouts, and messages</div>
        </div>
      </div>
      
      <div class="demo-controls">
        <button class="btn btn-primary" (click)="logEvent('User clicked demo button')">
          Test Activity Detection
        </button>
        <button class="btn btn-secondary" (click)="clearLog()">
          Clear Log
        </button>
      </div>
      
      <div class="industry-notice">
        <h3>✅ Industry Standard Implementation</h3>
        <p>
          This component follows industry standards for session timeout dialogs:
          backdrop clicks are disabled, explicit user action is required, and the dialog
          provides clear countdown and messaging.
        </p>
      </div>
      
      <div class="event-log">
        <h3>Activity Log</h3>
        <div class="log-content">
          <div *ngFor="let event of eventLog" class="event-item">
            <span class="event-time">{{ event.timestamp }}</span>
            <span class="event-message">{{ event.message }}</span>
          </div>
          <div *ngIf="eventLog.length === 0" class="no-events">
            Move your mouse, type, or click to see activity detection in action.
          </div>
        </div>
      </div>
    </div>
    
    <!-- Complete idle detection solution - no *ngIf needed! -->
    <idle-warning-dialog
      [idleTimeout]="10000"
      [warningTimeout]="5000"
      [onLogoutCallback]="handleLogout"
      [onExtendCallback]="handleExtend"
      dialogTitle="Session Timeout Warning"
      dialogMessage="Your session is about to expire due to inactivity. Would you like to continue?"
      extendButtonText="Yes, Continue"
      logoutButtonText="No, Logout"
      theme="default"
      size="medium"
      (activityDetected)="onActivityDetected($event)"
      (idleStart)="onIdleStart()"
      (idleEnd)="onIdleEnd()"
      (warningStart)="onWarningStart()"
      (warningEnd)="onWarningEnd()"
      (sessionExtended)="onSessionExtended()"
      (sessionTimeout)="onSessionTimeout()">
    </idle-warning-dialog>
  `,
  styles: [`
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    h1 {
      color: #1e293b;
      margin-bottom: 5px;
      font-size: 2.5rem;
      text-align: center;
    }
    
    .subtitle {
      color: #64748b;
      margin-bottom: 40px;
      font-size: 18px;
      text-align: center;
    }
    
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 40px 0;
    }
    
    .feature-item {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      transition: all 0.3s;
    }
    
    .feature-item:hover {
      border-color: #3b82f6;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .feature-icon {
      font-size: 2rem;
      margin-bottom: 10px;
    }
    
    .feature-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 8px;
    }
    
    .feature-description {
      font-size: 14px;
      color: #64748b;
      line-height: 1.4;
    }
    
    .demo-controls {
      display: flex;
      gap: 15px;
      margin: 30px 0;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background: #3b82f6;
      color: white;
    }
    
    .btn-primary:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }
    
    .btn-secondary {
      background: #64748b;
      color: white;
    }
    
    .btn-secondary:hover {
      background: #475569;
      transform: translateY(-1px);
    }
    
    .industry-notice {
      background: linear-gradient(135deg, #ecfdf5, #d1fae5);
      border: 2px solid #10b981;
      border-radius: 12px;
      padding: 20px;
      margin: 30px 0;
    }
    
    .industry-notice h3 {
      color: #059669;
      margin: 0 0 10px 0;
      font-size: 16px;
    }
    
    .industry-notice p {
      color: #047857;
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
    }
    
    .event-log {
      margin: 30px 0;
    }
    
    .event-log h3 {
      margin-bottom: 15px;
      color: #1e293b;
    }
    
    .log-content {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .event-item {
      display: flex;
      gap: 15px;
      padding: 8px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .event-item:last-child {
      border-bottom: none;
    }
    
    .event-time {
      color: #64748b;
      font-size: 12px;
      font-family: monospace;
      min-width: 70px;
    }
    
    .event-message {
      color: #1e293b;
      font-size: 14px;
    }
    
    .no-events {
      color: #64748b;
      font-style: italic;
      text-align: center;
      padding: 20px;
    }
    
    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(2px);
    }
    
    .modal-dialog {
      background: white;
      border-radius: 12px;
      padding: 30px;
      width: 90%;
      max-width: 450px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      animation: modalSlideIn 0.3s ease-out;
    }
    
    @keyframes modalSlideIn {
      from {
        transform: scale(0.95) translateY(-10px);
        opacity: 0;
      }
      to {
        transform: scale(1) translateY(0);
        opacity: 1;
      }
    }
    
    .modal-title {
      font-size: 20px;
      font-weight: 600;
      color: #dc2626;
      margin: 0 0 20px 0;
    }
    
    .modal-body p {
      color: #374151;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    
    .countdown-display {
      background: linear-gradient(135deg, #fee2e2, #fecaca);
      border: 2px solid #f87171;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
      margin: 15px 0;
    }
    
    .countdown-label {
      display: block;
      font-size: 13px;
      color: #991b1b;
      font-weight: 500;
      margin-bottom: 5px;
    }
    
    .countdown-time {
      font-size: 28px;
      font-weight: 700;
      color: #dc2626;
      font-family: monospace;
    }
    
    .backdrop-explanation {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 6px;
      padding: 12px;
      margin: 15px 0;
      font-size: 14px;
      color: #166534;
    }
    
    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 25px;
    }
    
    .modal-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .modal-btn-primary {
      background: #3b82f6;
      color: white;
    }
    
    .modal-btn-primary:hover {
      background: #2563eb;
    }
    
    .modal-btn-secondary {
      background: #6b7280;
      color: white;
    }
    
    .modal-btn-secondary:hover {
      background: #4b5563;
    }
  `]
})
export class AppComponent {
  eventLog: Array<{ timestamp: string; message: string }> = [];
  
  constructor() {
    this.logEvent('Angular app initialized with complete idle detection solution');
    this.logEvent('Idle timeout: 10 seconds, Warning timeout: 5 seconds');
  }
  
  // Idle detection event handlers
  onActivityDetected(event: Event) {
    this.logEvent(`Activity detected: ${event.type}`);
  }
  
  onIdleStart() {
    this.logEvent('User became idle');
  }
  
  onIdleEnd() {
    this.logEvent('User became active again');
  }
  
  onWarningStart() {
    this.logEvent('Warning dialog shown');
  }
  
  onWarningEnd() {
    this.logEvent('Warning dialog closed');
  }
  
  onSessionExtended() {
    this.logEvent('Session extended by user');
  }
  
  onSessionTimeout() {
    this.logEvent('Session timed out automatically');
  }
  
  // Callback functions for the idle warning dialog
  handleExtend = () => {
    this.logEvent('Session extended via "Yes, Continue" button');
  };
  
  handleLogout = () => {
    this.logEvent('User logged out via "No, Logout" button');
    alert('Session ended by user choice. Refresh the page to start a new session.');
  };
  
  clearLog() {
    this.eventLog = [];
    this.logEvent('Event log cleared');
  }
  
  logEvent(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.eventLog.unshift({ timestamp, message });
    if (this.eventLog.length > 20) {
      this.eventLog.pop();
    }
  }
}