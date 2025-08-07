import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdleWarningDialogComponent } from '../../../../packages/angular-oauth-integration/src/lib/idle-warning-dialog.component';

@Component({
  selector: 'app-manual-control-example',
  standalone: true,
  imports: [CommonModule, IdleWarningDialogComponent],
  template: `
    <div class="example-container">
      <h2>Manual Control Example</h2>
      <p>This example demonstrates programmatic control over idle detection using pause(), resume(), and reset() methods.</p>
      
      <div class="info-box">
        <h4>📌 How the methods work:</h4>
        <ul>
          <li><strong>pause()</strong> - Temporarily stops idle detection (useful during file uploads, critical operations)</li>
          <li><strong>resume()</strong> - Restarts idle detection, closes any open dialog, and resets the timer</li>
          <li><strong>reset()</strong> - Completely resets the timer to start fresh (like after manual session extension)</li>
        </ul>
        <p class="note">⏱️ Idle timeout is set to 30 seconds for easy testing</p>
      </div>
      
      <div class="control-panel">
        <h3>Manual Controls</h3>
        <div class="button-group">
          <button 
            class="control-btn pause-btn" 
            (click)="pauseIdleDetection()"
            [disabled]="isPaused">
            ⏸️ Pause Idle Detection
          </button>
          
          <button 
            class="control-btn resume-btn" 
            (click)="resumeIdleDetection()"
            [disabled]="!isPaused">
            ▶️ Resume Idle Detection
          </button>
          
          <button 
            class="control-btn reset-btn" 
            (click)="resetIdleTimer()">
            🔄 Reset Timer
          </button>
        </div>
        
        <div class="status-panel">
          <h4>Status</h4>
          <p>Idle Detection: <strong [class.active]="!isPaused">{{ !isPaused ? 'ACTIVE' : 'PAUSED' }}</strong></p>
          <p>Last Activity: {{ getFormattedLastActivity() }}</p>
          <p>Time Until Idle: {{ getFormattedTimeUntilIdle() }}</p>
        </div>
        
        <div class="use-cases">
          <h4>Use Case Simulation</h4>
          <button class="use-case-btn" (click)="simulateFileUpload()">
            📤 Simulate File Upload (Auto-pause/resume)
          </button>
          <button class="use-case-btn" (click)="simulateCriticalOperation()">
            ⚠️ Simulate Critical Operation (5s pause)
          </button>
          <button class="use-case-btn" (click)="testResumeWithDialog()">
            🔔 Test Resume When Dialog Shows
          </button>
        </div>
      </div>
      
      <div class="log-panel">
        <h4>Activity Log</h4>
        <div class="log-container">
          <div *ngFor="let log of activityLog" class="log-entry">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
      
      <!-- Idle Warning Dialog with short timeouts for testing -->
      <idle-warning-dialog
        #idleDialog
        [idleTimeout]="30000"
        [warningTimeout]="15000"
        [enableIdleDetection]="true"
        [onExtendCallback]="handleExtend"
        [onLogoutCallback]="handleLogout"
        (idleStart)="onIdleStart()"
        (idleEnd)="onIdleEnd()"
        (warningStart)="onWarningStart()"
        (warningEnd)="onWarningEnd()"
        (sessionExtended)="onSessionExtended()"
        (activityDetected)="onActivityDetected($event)">
      </idle-warning-dialog>
    </div>
  `,
  styles: [`
    .example-container {
      padding: 20px;
      max-width: 800px;
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
    
    .info-box ul {
      margin: 10px 0;
    }
    
    .info-box li {
      margin: 5px 0;
    }
    
    .info-box .note {
      margin: 10px 0 0 0;
      font-style: italic;
      color: #666;
    }
    
    .control-panel {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    
    .button-group {
      display: flex;
      gap: 10px;
      margin: 15px 0;
    }
    
    .control-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .control-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    
    .control-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .pause-btn:not(:disabled) {
      background: #ff9800;
      color: white;
    }
    
    .resume-btn:not(:disabled) {
      background: #4caf50;
      color: white;
    }
    
    .reset-btn {
      background: #2196f3;
      color: white;
    }
    
    .status-panel {
      background: white;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }
    
    .status-panel h4 {
      margin-top: 0;
      color: #666;
    }
    
    .status-panel p {
      margin: 8px 0;
      font-size: 14px;
    }
    
    .status-panel strong {
      padding: 2px 8px;
      border-radius: 4px;
      background: #ffcccc;
      color: #cc0000;
    }
    
    .status-panel strong.active {
      background: #ccffcc;
      color: #008800;
    }
    
    .use-cases {
      margin-top: 20px;
    }
    
    .use-case-btn {
      display: block;
      width: 100%;
      padding: 12px;
      margin: 10px 0;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      font-size: 14px;
      text-align: left;
      transition: all 0.3s;
    }
    
    .use-case-btn:hover {
      border-color: #2196f3;
      background: #f0f8ff;
    }
    
    .log-panel {
      background: #1e1e1e;
      color: #fff;
      padding: 15px;
      border-radius: 8px;
      margin-top: 20px;
    }
    
    .log-panel h4 {
      margin-top: 0;
      color: #fff;
    }
    
    .log-container {
      max-height: 200px;
      overflow-y: auto;
      font-family: 'Courier New', monospace;
      font-size: 12px;
    }
    
    .log-entry {
      padding: 4px 0;
      border-bottom: 1px solid #333;
    }
    
    .log-time {
      color: #888;
      margin-right: 10px;
    }
    
    .log-message {
      color: #4caf50;
    }
  `]
})
export class ManualControlExampleComponent {
  @ViewChild('idleDialog') idleDialog!: IdleWarningDialogComponent;
  
  isPaused = false;
  activityLog: Array<{time: string, message: string}> = [];
  private updateTimer: any;
  
  ngAfterViewInit() {
    // Update status every second
    this.updateTimer = setInterval(() => {
      this.updateStatus();
    }, 1000);
    
    this.addLog('Component initialized - Idle detection active');
  }
  
  ngOnDestroy() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
  }
  
  pauseIdleDetection() {
    this.idleDialog.pause();
    this.isPaused = true;
    this.addLog('Idle detection PAUSED');
  }
  
  resumeIdleDetection() {
    this.idleDialog.resume();
    this.isPaused = false;
    this.addLog('Idle detection RESUMED - Timer restarted');
  }
  
  resetIdleTimer() {
    this.idleDialog.reset();
    this.addLog('Idle timer RESET');
  }
  
  simulateFileUpload() {
    this.addLog('Starting file upload simulation...');
    this.pauseIdleDetection();
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      this.addLog(`Upload progress: ${progress}%`);
      
      if (progress >= 100) {
        clearInterval(interval);
        this.addLog('Upload complete!');
        this.resumeIdleDetection();
      }
    }, 1000);
  }
  
  simulateCriticalOperation() {
    this.addLog('Starting critical operation...');
    this.pauseIdleDetection();
    
    setTimeout(() => {
      this.addLog('Critical operation completed');
      this.resumeIdleDetection();
    }, 5000);
  }
  
  testResumeWithDialog() {
    this.addLog('Testing resume when dialog is visible...');
    this.addLog('Wait for dialog to appear, then we will call resume()');
    
    // Wait a moment then trigger the warning dialog by setting a very short idle timeout
    setTimeout(() => {
      this.addLog('Dialog should appear soon...');
      
      // After dialog appears, call resume
      setTimeout(() => {
        this.addLog('Calling resume() while dialog is visible...');
        this.resumeIdleDetection();
        this.addLog('Resume called - dialog should close and timer should restart');
      }, 3000);
    }, 1000);
  }
  
  getFormattedLastActivity(): string {
    if (!this.idleDialog) return 'N/A';
    const lastActivity = this.idleDialog.getLastActivity();
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastActivity.getTime()) / 1000);
    return `${diff} seconds ago`;
  }
  
  getFormattedTimeUntilIdle(): string {
    if (!this.idleDialog) return 'N/A';
    const timeUntilIdle = this.idleDialog.getTimeUntilIdle();
    if (timeUntilIdle === 0) return 'Already idle or disabled';
    const seconds = Math.floor(timeUntilIdle / 1000);
    return `${seconds} seconds`;
  }
  
  updateStatus() {
    // Force change detection by reading the values
    this.getFormattedLastActivity();
    this.getFormattedTimeUntilIdle();
  }
  
  handleExtend = () => {
    this.addLog('Session extended by user');
  };
  
  handleLogout = () => {
    this.addLog('User logged out due to timeout');
    alert('Session timed out - would redirect to login');
  };
  
  onIdleStart() {
    this.addLog('User became IDLE');
  }
  
  onIdleEnd() {
    this.addLog('User became ACTIVE');
  }
  
  onWarningStart() {
    this.addLog('Warning dialog SHOWN');
  }
  
  onWarningEnd() {
    this.addLog('Warning dialog CLOSED');
  }
  
  onSessionExtended() {
    this.addLog('Session successfully extended');
  }
  
  onActivityDetected(event: Event) {
    // Log only significant events to avoid spam
    if (event.type === 'click' || event.type === 'keypress') {
      this.addLog(`Activity detected: ${event.type}`);
    }
  }
  
  private addLog(message: string) {
    const now = new Date();
    const time = now.toLocaleTimeString();
    this.activityLog.unshift({ time, message });
    
    // Keep only last 20 entries
    if (this.activityLog.length > 20) {
      this.activityLog.pop();
    }
  }
}