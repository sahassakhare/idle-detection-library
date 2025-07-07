import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, interval, Observable, map, of } from 'rxjs';
import * as DashboardActions from '../store/dashboard.actions';
import * as DashboardSelectors from '../store/dashboard.selectors';
import { ActivityLog } from '../store/dashboard.state';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <div class="dashboard-header mb-3">
        <h2>Dashboard</h2>
        <p>Monitor your session activity and test idle detection</p>
      </div>

      <!-- Session Controls -->
      <div class="card mb-3">
        <h3>Session Management</h3>
        <div class="controls d-flex gap-2">
          <button class="btn" (click)="resetSession()">
            Reset Session Timer
          </button>
          <button class="btn btn-secondary" (click)="simulateActivity()">
            Simulate Activity
          </button>
        </div>
      </div>

      <!-- Status Cards -->
      <div class="stats-grid">
        <div class="stat-card card">
          <h4>Session Status</h4>
          <div class="stat-value" [class]="statusClass$ | async">
            {{ statusText$ | async }}
          </div>
        </div>
        
        <div class="stat-card card">
          <h4>Last Activity</h4>
          <div class="stat-value">
            {{ lastActivity$ | async | date:'medium' }}
          </div>
        </div>
        
        <div class="stat-card card">
          <h4>Time Since Activity</h4>
          <div class="stat-value">
            {{ timeSinceActivity$ | async }}
          </div>
        </div>
        
        <div class="stat-card card" *ngIf="(remainingTime$ | async) && (remainingTime$ | async)! > 0">
          <h4>Time Until Timeout</h4>
          <div class="stat-value countdown">
            {{ formatTime((remainingTime$ | async)!) }}
          </div>
        </div>
      </div>

      <!-- Activity Testing -->
      <div class="card mb-3">
        <h3>Test Activity Detection</h3>
        <p>Interact with these elements to reset the idle timer:</p>
        
        <div class="test-controls">
          <button class="btn btn-secondary" (click)="testClick()">
            Click Test
          </button>
          
          <input 
            type="text" 
            placeholder="Type here to test keyboard activity"
            (input)="testKeyboard($event)"
            class="test-input">
          
          <div 
            class="test-scroll-area"
            (scroll)="testScroll($event)">
            <div class="scroll-content">
              <p>📜 Scroll in this area to test scroll detection</p>
              <p>This demonstrates how the idle detection library monitors user activity</p>
              <p>The library watches for:</p>
              <ul>
                <li>Mouse movements and clicks</li>
                <li>Keyboard input</li>
                <li>Scroll events</li>
                <li>Touch events (on mobile)</li>
                <li>Focus/blur events</li>
              </ul>
              <p>Keep scrolling to see more content...</p>
              <p>🎯 Any interaction resets the idle timer</p>
              <p>⏰ After 30 seconds of inactivity, you'll enter idle state</p>
              <p>⚠️ After 10 more seconds, you'll see the warning dialog</p>
              <p>🔒 If you don't interact, the session will timeout</p>
              <p>End of scrollable content 🎉</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Configuration Info -->
      <div class="card mb-3">
        <h3>Current Configuration</h3>
        <div class="config-grid">
          <div class="config-item">
            <strong>Idle Timeout:</strong> 30 seconds
          </div>
          <div class="config-item">
            <strong>Warning Timeout:</strong> 10 seconds
          </div>
          <div class="config-item">
            <strong>Auto Token Refresh:</strong> Enabled
          </div>
          <div class="config-item">
            <strong>Multi-tab Coordination:</strong> Enabled
          </div>
          <div class="config-item">
            <strong>Debug Logging:</strong> Enabled (check console)
          </div>
        </div>
      </div>

      <!-- Activity Log -->
      <div class="card">
        <h3>Activity Log</h3>
        <div class="log-container">
          <div 
            *ngFor="let log of (activityLogs$ | async); trackBy: trackByLog"
            class="log-entry"
            [class]="'log-' + log.type">
            <span class="log-time">{{ log.timestamp | date:'HH:mm:ss.SSS' }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
          
          <div *ngIf="(activityLogs$ | async)?.length === 0" class="no-logs">
            No activity logged yet. Start interacting to see logs appear.
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header h2 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .dashboard-header p {
      color: #7f8c8d;
      margin: 0;
    }

    .controls {
      flex-wrap: wrap;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card h4 {
      margin: 0 0 1rem 0;
      color: #7f8c8d;
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
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
      font-size: 2rem;
    }

    .test-controls {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }

    .test-input {
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .test-input:focus {
      outline: none;
      border-color: #007bff;
    }

    .test-scroll-area {
      height: 200px;
      overflow-y: auto;
      border: 2px solid #e9ecef;
      border-radius: 6px;
      padding: 1rem;
      background: #f8f9fa;
    }

    .scroll-content {
      height: 500px;
      line-height: 1.6;
    }

    .scroll-content ul {
      margin: 1rem 0;
      padding-left: 2rem;
    }

    .config-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .config-item {
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 4px;
      border-left: 4px solid #007bff;
    }

    .log-container {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      background: #f8f9fa;
    }

    .log-entry {
      display: flex;
      gap: 1rem;
      padding: 0.75rem;
      border-bottom: 1px solid #e9ecef;
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
      font-size: 0.875rem;
    }

    .log-entry:last-child {
      border-bottom: none;
    }

    .log-time {
      color: #6c757d;
      min-width: 100px;
      font-weight: 500;
    }

    .log-message {
      color: #495057;
      flex: 1;
    }

    .log-info {
      background: rgba(23, 162, 184, 0.1);
    }

    .log-warning {
      background: rgba(255, 193, 7, 0.1);
    }

    .log-error {
      background: rgba(220, 53, 69, 0.1);
    }

    .no-logs {
      padding: 2rem;
      text-align: center;
      color: #6c757d;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .controls {
        flex-direction: column;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .config-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private destroy$ = new Subject<void>();

  // NgRx Store selectors
  lastActivity$ = this.store.select(DashboardSelectors.selectLastActivity);
  remainingTime$ = this.store.select(DashboardSelectors.selectRemainingTime);
  activityLogs$ = this.store.select(DashboardSelectors.selectActivityLogs);
  currentTime$ = this.store.select(DashboardSelectors.selectCurrentTime);
  timeSinceActivity$ = this.store.select(DashboardSelectors.selectTimeSinceActivity);
  
  // Mock idle state for demo
  isIdle$ = of(false);
  isWarning$ = of(false);
  isTimedOut$ = of(false);

  ngOnInit(): void {
    // Start time updates
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.store.dispatch(DashboardActions.updateCurrentTime({ currentTime: new Date() }));
      });

    // Initialize with demo data
    this.store.dispatch(DashboardActions.setLastActivity({ lastActivity: new Date() }));
    this.store.dispatch(DashboardActions.setRemainingTime({ remainingTime: 30 }));

    this.addLog('Dashboard initialized - Demo Mode', 'info');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Demo mode - simplified logging

  private addLog(message: string, type: 'info' | 'warning' | 'error'): void {
    const newLog: ActivityLog = {
      timestamp: new Date(),
      message,
      type
    };
    this.store.dispatch(DashboardActions.addActivityLog({ log: newLog }));
  }

  // Computed observables for status display - Demo mode
  statusClass$ = of('active');
  statusText$ = of('Active (Demo Mode)');

  // Time since activity is now handled by the dashboard store selector

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  resetSession(): void {
    this.store.dispatch(DashboardActions.resetSession());
    console.log('Session reset - Demo mode');
  }

  simulateActivity(): void {
    this.store.dispatch(DashboardActions.simulateActivity());
  }

  testClick(): void {
    this.store.dispatch(DashboardActions.testActivity({ activityType: '🖱️ Button clicked' }));
  }

  testKeyboard(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.store.dispatch(DashboardActions.testActivity({ 
      activityType: '⌨️ Keyboard input', 
      details: target.value 
    }));
  }

  testScroll(event: Event): void {
    this.store.dispatch(DashboardActions.testActivity({ activityType: '📜 Scroll activity detected' }));
  }

  trackByLog(index: number, log: ActivityLog): string {
    return log.timestamp.getTime().toString();
  }
}