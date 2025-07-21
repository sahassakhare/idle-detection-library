import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { fromEvent, merge, Subject } from 'rxjs';
import { takeUntil, throttleTime } from 'rxjs/operators';
// Import the simplified idle warning dialog component
// import { IdleWarningDialogComponent } from '../../../../packages/angular-oauth-integration/src/lib/idle-warning-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>🔒 Angular Idle Detection Demo</h1>
      <p class="subtitle">Demonstrating Industry Standard onBackdropClick Behavior</p>
      
      <div class="status-card" [ngClass]="getStatusClass()">
        <div class="status-text">{{ getStatusText() }}</div>
        <div class="status-detail">{{ getStatusDetail() }}</div>
      </div>
      
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Session Status</div>
          <div class="info-value">{{ isWatching ? 'Monitoring' : 'Stopped' }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Time Until Idle</div>
          <div class="info-value">{{ idleCountdown }}s</div>
        </div>
        <div class="info-item">
          <div class="info-label">Warning State</div>
          <div class="info-value">{{ isWarning ? 'Active' : 'Inactive' }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Backdrop Behavior</div>
          <div class="info-value" style="color: #10b981;">Disabled (Safe)</div>
        </div>
      </div>
      
      <div class="controls">
        <button class="btn btn-primary" (click)="toggleWatching()">
          {{ isWatching ? 'Stop Watching' : 'Start Watching' }}
        </button>
        <button class="btn btn-secondary" (click)="simulateActivity()">
          Simulate Activity
        </button>
        <button class="btn btn-secondary" (click)="showWarningDialog()">
          Show Warning Dialog
        </button>
        <button class="btn btn-secondary" (click)="clearLog()">
          Clear Log
        </button>
      </div>
      
      <div class="industry-notice">
        <h3>✅ Industry Standard Implementation</h3>
        <p>
          Backdrop clicks are now completely disabled for session timeout dialogs. 
          This matches the behavior of banking apps, Google Workspace, Microsoft 365, and AWS Console.
          Users must explicitly click action buttons to dismiss the dialog.
        </p>
      </div>
      
      <div class="event-log">
        <h3>Event Log</h3>
        <div class="log-content">
          <div *ngFor="let event of eventLog" class="event-item">
            <span class="event-time">{{ event.timestamp }}</span>
            <span class="event-message">{{ event.message }}</span>
          </div>
          <div *ngIf="eventLog.length === 0" class="no-events">
            No events yet. Start watching to see idle detection in action.
          </div>
        </div>
      </div>
    </div>
    
    <!-- Session Timeout Warning Dialog -->
    <div *ngIf="isWarning" class="modal-overlay" (click)="onBackdropClick($event)">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">⚠️ Session Timeout Warning</h2>
        </div>
        
        <div class="modal-body">
          <p>Your session is about to expire due to inactivity. Would you like to continue?</p>
          
          <div class="countdown-display">
            <span class="countdown-label">Time Remaining</span>
            <span class="countdown-time">{{ formatTime(warningCountdown * 1000) }}</span>
          </div>
          
          <div class="backdrop-explanation">
            <strong>🔒 Industry Standard:</strong> Clicking outside this dialog will NOT close it.
            You must choose an action below.
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="modal-btn modal-btn-primary" (click)="extendSession()" (mousedown)="$event.stopPropagation()">
            ✅ Yes, Continue
          </button>
          <button class="modal-btn modal-btn-secondary" (click)="logout()" (mousedown)="$event.stopPropagation()">
            🚪 No, Logout
          </button>
        </div>
      </div>
    </div>
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
    }
    
    .subtitle {
      color: #64748b;
      margin-bottom: 30px;
      font-size: 16px;
    }
    
    .status-card {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      transition: all 0.3s;
    }
    
    .status-active { border-color: #10b981; background: #ecfdf5; }
    .status-idle { border-color: #f59e0b; background: #fffbeb; }
    .status-warning { border-color: #ef4444; background: #fef2f2; }
    
    .status-text {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }
    
    .status-detail {
      font-size: 14px;
      color: #64748b;
      margin-top: 5px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 30px 0;
    }
    
    .info-item {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 15px;
    }
    
    .info-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    
    .info-value {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }
    
    .controls {
      display: flex;
      gap: 15px;
      margin: 30px 0;
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
      line-height: 1.5;
    }
    
    .event-log {
      margin: 30px 0;
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
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private idleTimer?: any;
  private warningTimer?: any;
  private countdownInterval?: any;
  
  isWatching = false;
  isIdle = false;
  isWarning = false;
  idleCountdown = 10;
  warningCountdown = 30;
  eventLog: Array<{ timestamp: string; message: string }> = [];
  
  private readonly IDLE_TIME = 10000; // 10 seconds
  private readonly WARNING_TIME = 30000; // 30 seconds
  private readonly activityEvents = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'];
  
  ngOnInit() {
    this.logEvent('🚀 Angular app initialized - Industry standard onBackdropClick implemented');
    this.setupActivityListeners();
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearAllTimers();
  }
  
  private setupActivityListeners() {
    const activityStreams = this.activityEvents.map(event => 
      fromEvent(document, event).pipe(throttleTime(1000))
    );
    
    merge(...activityStreams).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.isWatching && !this.isWarning) {
        this.resetIdleTimer();
      }
    });
  }
  
  toggleWatching() {
    if (this.isWatching) {
      this.stopWatching();
    } else {
      this.startWatching();
    }
  }
  
  startWatching() {
    this.isWatching = true;
    this.isIdle = false;
    this.isWarning = false;
    this.logEvent('🟢 Started watching for idle activity');
    this.resetIdleTimer();
  }
  
  stopWatching() {
    this.isWatching = false;
    this.isIdle = false;
    this.isWarning = false;
    this.clearAllTimers();
    this.logEvent('🛑 Stopped watching for idle activity');
  }
  
  private resetIdleTimer() {
    this.clearAllTimers();
    this.idleCountdown = 10;
    
    // Update countdown every second
    this.countdownInterval = setInterval(() => {
      this.idleCountdown--;
      if (this.idleCountdown <= 0) {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
    
    // Start idle timer
    this.idleTimer = setTimeout(() => {
      this.triggerIdle();
    }, this.IDLE_TIME);
  }
  
  private triggerIdle() {
    this.isIdle = true;
    this.isWarning = true;
    this.logEvent('⚠️ User is idle - Showing warning dialog');
    this.startWarningCountdown();
  }
  
  private startWarningCountdown() {
    this.warningCountdown = 30;
    
    this.countdownInterval = setInterval(() => {
      this.warningCountdown--;
      if (this.warningCountdown <= 0) {
        this.autoLogout();
      }
    }, 1000);
    
    this.warningTimer = setTimeout(() => {
      this.autoLogout();
    }, this.WARNING_TIME);
  }
  
  showWarningDialog() {
    this.isWarning = true;
    this.logEvent('👆 Warning dialog shown manually');
    this.startWarningCountdown();
  }
  
  onBackdropClick(event: Event) {
    // INDUSTRY STANDARD: Always prevent backdrop clicks from closing session dialogs
    event.preventDefault();
    event.stopPropagation();
    this.logEvent('🔒 Backdrop clicked - IGNORED (Industry Standard: Session dialogs require explicit button clicks)');
  }
  
  extendSession() {
    this.logEvent('✅ Session extended via "Yes, Continue" button');
    this.isWarning = false;
    this.isIdle = false;
    this.clearAllTimers();
    
    if (this.isWatching) {
      this.resetIdleTimer();
    }
  }
  
  logout() {
    this.logEvent('🚪 Logout via "No, Logout" button');
    this.isWarning = false;
    this.stopWatching();
    alert('Session ended by user choice. Refresh the page to start a new session.');
  }
  
  private autoLogout() {
    this.logEvent('⏰ Automatic logout - Warning timer expired');
    this.isWarning = false;
    this.stopWatching();
    alert('Session timed out due to inactivity. Refresh the page to start a new session.');
  }
  
  simulateActivity() {
    this.logEvent('👆 Activity simulated via button click');
    if (this.isWatching && !this.isWarning) {
      this.resetIdleTimer();
    }
  }
  
  private clearAllTimers() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }
  
  getStatusClass(): string {
    if (this.isWarning) return 'status-warning';
    if (this.isIdle) return 'status-idle';
    return 'status-active';
  }
  
  getStatusText(): string {
    if (this.isWarning) return 'Session Timeout Warning';
    if (this.isIdle) return 'User is Idle';
    if (this.isWatching) return 'Monitoring Activity';
    return 'Ready to Start';
  }
  
  getStatusDetail(): string {
    if (this.isWarning) return 'Click "Yes, Continue" or "No, Logout" to dismiss';
    if (this.isIdle) return 'User has been inactive';
    if (this.isWatching) return 'Watching for user inactivity';
    return 'Click "Start Watching" to begin idle detection';
  }
  
  formatTime(milliseconds: number): string {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  clearLog() {
    this.eventLog = [];
    this.logEvent('🧹 Event log cleared');
  }
  
  private logEvent(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.eventLog.unshift({ timestamp, message });
    if (this.eventLog.length > 15) {
      this.eventLog.pop();
    }
  }
}