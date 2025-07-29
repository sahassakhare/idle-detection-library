import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdleWarningDialogComponent } from '../../../../packages/angular-oauth-integration/src/lib/idle-warning-dialog.component';

@Component({
  selector: 'app-custom-template-example',
  standalone: true,
  imports: [CommonModule, IdleWarningDialogComponent],
  template: `
    <div class="example-container">
      <h2>Custom Template Example</h2>
      <p>This example shows how to use a completely custom UI template with the idle warning dialog.</p>
      
      <!-- Idle Warning Dialog with Custom Template -->
      <idle-warning-dialog
        [idleTimeout]="30000"
        [warningTimeout]="10000"
        [enableMultiTab]="true"
        multiTabChannelName="custom-template-demo"
        [onExtendCallback]="handleExtend"
        [onLogoutCallback]="handleLogout"
        (activityDetected)="onActivity($event)"
        (idleStart)="onIdle()"
        (warningStart)="onWarning()"
        (sessionExtended)="onExtended()">
        
        <!-- Custom Template using ng-template -->
        <ng-template #customTemplate let-data let-onExtend="onExtend" let-onLogout="onLogout">
          <div class="custom-modal">
            <div class="custom-header">
              <svg class="warning-icon" viewBox="0 0 24 24" width="48" height="48">
                <path fill="#ff6b6b" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <h1 class="custom-title">Session Expiring Soon!</h1>
            </div>
            
            <div class="custom-body">
              <p class="custom-message">
                Your session has been inactive for a while. To protect your data, 
                you'll be automatically logged out if you don't take action.
              </p>
              
              <div class="time-display">
                <div class="time-circle">
                  <svg class="progress-ring" width="120" height="120">
                    <circle
                      class="progress-ring-circle"
                      stroke="#e0e0e0"
                      stroke-width="8"
                      fill="transparent"
                      r="52"
                      cx="60"
                      cy="60"
                    />
                    <circle
                      class="progress-ring-circle progress"
                      stroke="#ff6b6b"
                      stroke-width="8"
                      fill="transparent"
                      r="52"
                      cx="60"
                      cy="60"
                      [style.strokeDasharray]="'326.73 326.73'"
                      [style.strokeDashoffset]="326.73 - (326.73 * data.progressPercentage / 100)"
                    />
                  </svg>
                  <div class="time-text">{{ data.formattedTime }}</div>
                </div>
              </div>
              
              <div class="custom-actions">
                <button class="custom-btn custom-btn-primary" (click)="onExtend()">
                  <svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                  </svg>
                  Stay Logged In
                </button>
                <button class="custom-btn custom-btn-secondary" (click)="onLogout()">
                  <svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                  </svg>
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </ng-template>
      </idle-warning-dialog>
      
      <div class="event-log">
        <h3>Event Log</h3>
        <div *ngFor="let event of events" class="event-item">
          {{ event }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .example-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    /* Custom Modal Styles */
    .custom-modal {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-radius: 20px;
      padding: 0;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      animation: customSlideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    
    @keyframes customSlideIn {
      from {
        transform: scale(0.9) translateY(20px);
        opacity: 0;
      }
      to {
        transform: scale(1) translateY(0);
        opacity: 1;
      }
    }
    
    .custom-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px;
      text-align: center;
      color: white;
    }
    
    .warning-icon {
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    .custom-title {
      margin: 15px 0 0 0;
      font-size: 24px;
      font-weight: 600;
    }
    
    .custom-body {
      padding: 30px;
    }
    
    .custom-message {
      text-align: center;
      color: #4a5568;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    
    .time-display {
      display: flex;
      justify-content: center;
      margin: 30px 0;
    }
    
    .time-circle {
      position: relative;
      width: 120px;
      height: 120px;
    }
    
    .progress-ring {
      transform: rotate(-90deg);
    }
    
    .progress-ring-circle.progress {
      transition: stroke-dashoffset 0.35s;
      stroke-linecap: round;
    }
    
    .time-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 28px;
      font-weight: 700;
      color: #2d3748;
      font-family: monospace;
    }
    
    .custom-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 30px;
    }
    
    .custom-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .custom-btn:before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.2);
      transition: left 0.3s ease;
    }
    
    .custom-btn:hover:before {
      left: 100%;
    }
    
    .custom-btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      transform: translateY(0);
    }
    
    .custom-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }
    
    .custom-btn-secondary {
      background: #e2e8f0;
      color: #4a5568;
    }
    
    .custom-btn-secondary:hover {
      background: #cbd5e0;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }
    
    .btn-icon {
      width: 20px;
      height: 20px;
    }
    
    /* Event Log */
    .event-log {
      margin-top: 40px;
      padding: 20px;
      background: #f7fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .event-log h3 {
      margin: 0 0 15px 0;
      color: #2d3748;
    }
    
    .event-item {
      padding: 8px 0;
      color: #4a5568;
      font-size: 14px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .event-item:last-child {
      border-bottom: none;
    }
  `]
})
export class CustomTemplateExampleComponent {
  events: string[] = [];
  
  constructor() {
    this.log('Custom template example initialized');
  }
  
  handleExtend = () => {
    this.log('User chose to extend session');
  };
  
  handleLogout = () => {
    this.log('User chose to logout');
    alert('Logout action triggered');
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
    if (this.events.length > 10) {
      this.events.pop();
    }
  }
}