import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdleWarningDialogComponent } from '../../../../packages/angular-oauth-integration/src/lib/idle-warning-dialog.component';

@Component({
  selector: 'app-custom-template-example',
  standalone: true,
  imports: [CommonModule, IdleWarningDialogComponent],
  template: `
    <div class="example-container">
      <h2>Custom Template Example</h2>
      <p>This example demonstrates different approaches to handle idle warning with custom templates.</p>
      
      <div class="info-box">
        <h4>📌 Three Different Approaches:</h4>
        <ol>
          <li><strong>Built-in onExtend:</strong> Uses the provided callback (no resume needed)</li>
          <li><strong>Custom with resume():</strong> Custom logic then calls resume()</li>
          <li><strong>Hybrid approach:</strong> Mix of built-in and custom actions</li>
        </ol>
        <p class="note">⏱️ Idle timeout: 30 seconds | Warning: 15 seconds</p>
      </div>
      
      <!-- Idle Warning Dialog with Custom Template -->
      <idle-warning-dialog
        #idleDialog
        [idleTimeout]="60000"
        [warningTimeout]="15000"
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
                Your session has been inactive. Choose an action below:
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
              
              <div class="approach-label">Approach 1: Built-in onExtend</div>
              <div class="custom-actions">
                <button class="custom-btn custom-btn-primary" (click)="onExtend()">
                  <svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                  </svg>
                  Standard Extend (onExtend)
                </button>
                <button class="custom-btn custom-btn-secondary" (click)="onLogout()">
                  <svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                  </svg>
                  Log Out (onLogout)
                </button>
              </div>
              
              <div class="approach-label">Approach 2: Custom with resume()</div>
              <div class="custom-actions">
                <button class="custom-btn custom-btn-success" (click)="customSaveAndExtend()">
                  💾 Save & Extend (custom + resume)
                </button>
                <button class="custom-btn custom-btn-warning" (click)="customPauseForTask()">
                  ⏸️ Pause for Task
                </button>
              </div>
              
              <div class="approach-label">Approach 3: Hybrid</div>
              <div class="custom-actions">
                <button class="custom-btn custom-btn-info" (click)="customRefreshAndContinue()">
                  🔄 Refresh & Continue (custom + resume)
                </button>
                <button class="custom-btn custom-btn-danger" (click)="emergencyClose()">
                  ❌ Emergency Close (just resume)
                </button>
              </div>
            </div>
          </div>
        </ng-template>
      </idle-warning-dialog>
      
      <div class="control-panel">
        <h3>Manual Controls (Outside Dialog)</h3>
        <button class="control-btn" (click)="manualPause()">⏸️ Pause Detection</button>
        <button class="control-btn" (click)="manualResume()">▶️ Resume Detection</button>
        <button class="control-btn" (click)="manualReset()">🔄 Reset Timer</button>
      </div>
      
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
    
    .info-box {
      background: #e3f2fd;
      border: 1px solid #2196f3;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
    }
    
    .info-box h4 {
      margin-top: 0;
      color: #1565c0;
    }
    
    .info-box ol {
      margin: 10px 0 10px 20px;
    }
    
    .info-box .note {
      margin: 10px 0 0 0;
      font-style: italic;
      color: #666;
    }
    
    /* Custom Modal Styles */
    .custom-modal {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-radius: 20px;
      padding: 0;
      width: 90%;
      max-width: 600px;
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
      padding: 25px;
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
      margin: 10px 0 0 0;
      font-size: 22px;
      font-weight: 600;
    }
    
    .custom-body {
      padding: 25px;
    }
    
    .custom-message {
      text-align: center;
      color: #4a5568;
      font-size: 15px;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    
    .time-display {
      display: flex;
      justify-content: center;
      margin: 20px 0;
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
      font-size: 26px;
      font-weight: 700;
      color: #2d3748;
      font-family: monospace;
    }
    
    .approach-label {
      text-align: center;
      font-size: 12px;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 20px 0 10px 0;
      padding-top: 15px;
      border-top: 1px solid #e2e8f0;
    }
    
    .approach-label:first-of-type {
      border-top: none;
      padding-top: 0;
      margin-top: 10px;
    }
    
    .custom-actions {
      display: flex;
      gap: 10px;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .custom-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 18px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
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
    }
    
    .custom-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }
    
    .custom-btn-secondary {
      background: #e2e8f0;
      color: #4a5568;
    }
    
    .custom-btn-secondary:hover {
      background: #cbd5e0;
      transform: translateY(-2px);
    }
    
    .custom-btn-success {
      background: #48bb78;
      color: white;
    }
    
    .custom-btn-success:hover {
      background: #38a169;
      transform: translateY(-2px);
    }
    
    .custom-btn-warning {
      background: #ed8936;
      color: white;
    }
    
    .custom-btn-warning:hover {
      background: #dd6b20;
      transform: translateY(-2px);
    }
    
    .custom-btn-info {
      background: #4299e1;
      color: white;
    }
    
    .custom-btn-info:hover {
      background: #3182ce;
      transform: translateY(-2px);
    }
    
    .custom-btn-danger {
      background: #f56565;
      color: white;
    }
    
    .custom-btn-danger:hover {
      background: #e53e3e;
      transform: translateY(-2px);
    }
    
    .btn-icon {
      width: 18px;
      height: 18px;
    }
    
    /* Control Panel */
    .control-panel {
      margin-top: 30px;
      padding: 20px;
      background: #f7fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .control-panel h3 {
      margin: 0 0 15px 0;
      color: #2d3748;
    }
    
    .control-btn {
      padding: 8px 16px;
      margin: 5px;
      border: 1px solid #cbd5e0;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .control-btn:hover {
      background: #edf2f7;
      transform: translateY(-1px);
    }
    
    /* Event Log */
    .event-log {
      margin-top: 30px;
      padding: 20px;
      background: #1a202c;
      color: #a0aec0;
      border-radius: 8px;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .event-log h3 {
      margin: 0 0 15px 0;
      color: #f7fafc;
    }
    
    .event-item {
      padding: 6px 0;
      font-size: 13px;
      font-family: monospace;
      border-bottom: 1px solid #2d3748;
    }
    
    .event-item:last-child {
      border-bottom: none;
    }
  `]
})
export class CustomTemplateExampleComponent {
  @ViewChild('idleDialog') idleDialog!: IdleWarningDialogComponent;
  
  events: string[] = [];
  
  constructor() {
    this.log('🚀 Custom template example initialized');
  }
  
  // ============ Callbacks for IdleWarningDialog ============
  
  handleExtend = () => {
    // This is called AFTER the dialog handles everything
    // No need to call resume() here - dialog already did it
    this.log('✅ handleExtend callback: Session extended (dialog already handled everything)');
  };
  
  handleLogout = () => {
    this.log('🚪 handleLogout callback: User logged out');
    alert('Logout action triggered - would redirect to login');
  };
  
  // ============ Approach 2: Custom Actions with resume() ============
  
  customSaveAndExtend() {
    this.log('💾 Custom: Saving work...');
    
    // Simulate saving work
    setTimeout(() => {
      this.log('💾 Custom: Work saved successfully');
      
      // Now manually close dialog and restart timer
      this.log('🔄 Custom: Calling resume() to close dialog and restart timer');
      this.idleDialog.resume();
    }, 1000);
  }
  
  customPauseForTask() {
    this.log('⏸️ Custom: Pausing idle detection for task');
    
    // First pause idle detection
    this.idleDialog.pause();
    
    // Simulate a task
    setTimeout(() => {
      this.log('✅ Custom: Task completed, resuming idle detection');
      this.idleDialog.resume(); // Resume after task
    }, 3000);
  }
  
  // ============ Approach 3: Hybrid Actions ============
  
  customRefreshAndContinue() {
    this.log('🔄 Custom: Refreshing authentication...');
    
    // Simulate auth refresh
    setTimeout(() => {
      this.log('🔐 Custom: Auth refreshed');
      this.log('🔄 Custom: Calling resume() to close dialog and restart with fresh timer');
      this.idleDialog.resume();
    }, 500);
  }
  
  emergencyClose() {
    this.log('❌ Custom: Emergency close - just calling resume()');
    // Just close the dialog and restart timer
    this.idleDialog.resume();
  }
  
  // ============ Manual Controls (Outside Dialog) ============
  
  manualPause() {
    this.log('⏸️ Manual: Pausing idle detection from outside');
    this.idleDialog.pause();
  }
  
  manualResume() {
    this.log('▶️ Manual: Resuming idle detection from outside');
    this.idleDialog.resume();
  }
  
  manualReset() {
    this.log('🔄 Manual: Resetting idle timer from outside');
    this.idleDialog.reset();
  }
  
  // ============ Event Handlers ============
  
  onActivity(event: Event) {
    // Only log click events to avoid spam
    if (event.type === 'click') {
      this.log(`👆 Activity: ${event.type}`);
    }
  }
  
  onIdle() {
    this.log('😴 User became idle');
  }
  
  onWarning() {
    this.log('⚠️ Warning dialog shown');
  }
  
  onExtended() {
    this.log('✅ Session extended event emitted');
  }
  
  private log(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.events.unshift(`[${timestamp}] ${message}`);
    if (this.events.length > 20) {
      this.events.pop();
    }
    console.log(`[CustomTemplate] ${message}`);
  }
}