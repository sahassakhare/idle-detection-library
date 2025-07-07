import { Component, OnInit, OnDestroy } from '@angular/core';
import { IdleOAuthService } from '@idle-detection/angular-oauth-integration';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h2>Dashboard</h2>
        <div class="session-controls">
          <button class="btn btn-primary" (click)="resetSession()">
            Reset Session Timer
          </button>
          <button class="btn btn-danger" (click)="simulateIdle()">
            Simulate Idle (Demo)
          </button>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Session Status</h3>
            <p class="stat-value" [class]="getStatusClass()">
              {{ getStatusText() }}
            </p>
          </div>
          
          <div class="stat-card">
            <h3>Last Activity</h3>
            <p class="stat-value">
              {{ lastActivity | date:'medium' }}
            </p>
          </div>
          
          <div class="stat-card">
            <h3>Time Since Activity</h3>
            <p class="stat-value">
              {{ getTimeSinceActivity() }}
            </p>
          </div>
          
          <div class="stat-card" *ngIf="remainingTime > 0">
            <h3>Time Until Timeout</h3>
            <p class="stat-value countdown">
              {{ formatTime(remainingTime) }}
            </p>
          </div>
        </div>

        <div class="activity-section">
          <h3>Test User Activity</h3>
          <p>Interact with these elements to reset the idle timer:</p>
          
          <div class="test-controls">
            <button class="btn btn-secondary" (click)="testClick()">
              Click Me
            </button>
            <input 
              type="text" 
              placeholder="Type here to test keyboard activity"
              (keyup)="testKeyboard($event)"
              class="test-input">
            <div 
              class="test-scroll-area"
              (scroll)="testScroll($event)">
              <div class="scroll-content">
                <p>Scroll in this area to test scroll detection</p>
                <p>This content is scrollable</p>
                <p>Keep scrolling...</p>
                <p>More content here</p>
                <p>Even more content</p>
                <p>Last line of scrollable content</p>
              </div>
            </div>
          </div>
        </div>

        <div class="logs-section">
          <h3>Activity Log</h3>
          <div class="log-container">
            <div 
              *ngFor="let log of activityLogs; trackBy: trackByLog"
              class="log-entry"
              [class]="log.type">
              <span class="log-time">{{ log.timestamp | date:'HH:mm:ss' }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .dashboard-header h2 {
      margin: 0;
      color: #2c3e50;
    }

    .session-controls {
      display: flex;
      gap: 1rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .btn-primary {
      background: #3498db;
      color: white;
    }

    .btn-primary:hover {
      background: #2980b9;
    }

    .btn-secondary {
      background: #95a5a6;
      color: white;
    }

    .btn-secondary:hover {
      background: #7f8c8d;
    }

    .btn-danger {
      background: #e74c3c;
      color: white;
    }

    .btn-danger:hover {
      background: #c0392b;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border: 1px solid #e0e0e0;
    }

    .stat-card h3 {
      margin: 0 0 1rem 0;
      color: #7f8c8d;
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .stat-value {
      margin: 0;
      font-size: 1.5rem;
      font-weight: bold;
      color: #2c3e50;
    }

    .stat-value.active {
      color: #27ae60;
    }

    .stat-value.idle {
      color: #f39c12;
    }

    .stat-value.warning {
      color: #e74c3c;
    }

    .stat-value.timeout {
      color: #95a5a6;
    }

    .stat-value.countdown {
      color: #e74c3c;
      font-family: 'Courier New', monospace;
    }

    .activity-section, .logs-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border: 1px solid #e0e0e0;
      margin-bottom: 2rem;
    }

    .activity-section h3, .logs-section h3 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
    }

    .test-controls {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .test-input {
      padding: 0.5rem;
      border: 1px solid #bdc3c7;
      border-radius: 4px;
      font-size: 1rem;
    }

    .test-scroll-area {
      height: 150px;
      overflow-y: auto;
      border: 1px solid #bdc3c7;
      border-radius: 4px;
      padding: 1rem;
    }

    .scroll-content {
      height: 300px;
    }

    .log-container {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 1rem;
    }

    .log-entry {
      display: flex;
      gap: 1rem;
      padding: 0.5rem;
      border-bottom: 1px solid #f8f9fa;
    }

    .log-entry:last-child {
      border-bottom: none;
    }

    .log-time {
      font-family: 'Courier New', monospace;
      font-size: 0.75rem;
      color: #7f8c8d;
      min-width: 80px;
    }

    .log-message {
      font-size: 0.875rem;
      color: #2c3e50;
    }

    .log-entry.info {
      background: #f8f9fa;
    }

    .log-entry.warning {
      background: #fff3cd;
    }

    .log-entry.error {
      background: #f8d7da;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .dashboard-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .session-controls {
        flex-direction: column;
        width: 100%;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  lastActivity: Date = new Date();
  remainingTime: number = 0;
  activityLogs: Array<{ timestamp: Date, message: string, type: string }> = [];

  private destroy$ = new Subject<void>();

  constructor(private idleOAuthService: IdleOAuthService) {}

  ngOnInit(): void {
    // Subscribe to idle state changes
    this.idleOAuthService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.lastActivity = state.lastActivity;
        this.remainingTime = state.remainingTime || 0;
        this.addLog(this.getLogMessage(state), this.getLogType(state));
      });

    // Subscribe to warning countdown
    this.idleOAuthService.warning$
      .pipe(takeUntil(this.destroy$))
      .subscribe(remainingTime => {
        this.remainingTime = remainingTime;
      });

    this.addLog('Dashboard loaded', 'info');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getLogMessage(state: any): string {
    if (state.isTimedOut) return 'Session timed out';
    if (state.isWarning) return 'Warning: Session will expire soon';
    if (state.isIdle) return 'User went idle';
    return 'User activity detected';
  }

  private getLogType(state: any): string {
    if (state.isTimedOut) return 'error';
    if (state.isWarning) return 'warning';
    return 'info';
  }

  private addLog(message: string, type: string): void {
    this.activityLogs.unshift({
      timestamp: new Date(),
      message,
      type
    });

    // Keep only last 50 logs
    if (this.activityLogs.length > 50) {
      this.activityLogs = this.activityLogs.slice(0, 50);
    }
  }

  getStatusClass(): string {
    const state = this.idleOAuthService.getCurrentState();
    if (state.isTimedOut) return 'timeout';
    if (state.isWarning) return 'warning';
    if (state.isIdle) return 'idle';
    return 'active';
  }

  getStatusText(): string {
    const state = this.idleOAuthService.getCurrentState();
    if (state.isTimedOut) return 'Timed Out';
    if (state.isWarning) return 'Warning';
    if (state.isIdle) return 'Idle';
    return 'Active';
  }

  getTimeSinceActivity(): string {
    const now = new Date();
    const diff = now.getTime() - this.lastActivity.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  resetSession(): void {
    this.idleOAuthService.extendSession();
    this.addLog('Session manually reset', 'info');
  }

  simulateIdle(): void {
    // This is for demo purposes - in real app you wouldn't need this
    this.addLog('Idle simulation triggered (demo only)', 'warning');
  }

  testClick(): void {
    this.addLog('Button clicked - activity detected', 'info');
  }

  testKeyboard(event: KeyboardEvent): void {
    this.addLog(`Keyboard activity: ${event.key}`, 'info');
  }

  testScroll(event: Event): void {
    this.addLog('Scroll activity detected', 'info');
  }

  trackByLog(index: number, log: any): string {
    return log.timestamp.getTime().toString();
  }
}