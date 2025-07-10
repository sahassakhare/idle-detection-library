import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { 
  IdleOAuthService, 
  IdleWarningDialogComponent
} from '@idle-detection/angular-oauth-integration';
import { 
  selectIdleState,
  selectIsIdle,
  selectIsWarning,
  selectTimeRemaining,
  selectLastActivity,
  selectTokenRefreshInProgress,
  selectUserRole,
  selectConfig,
  selectIdleStatus
} from '@idle-detection/angular-oauth-integration/store';

@Component({
  selector: 'app-state-test',
  standalone: true,
  imports: [CommonModule, IdleWarningDialogComponent],
  template: `
    <div class="state-monitor">
      <h2>NgRx State Monitor</h2>
      
      <div class="state-grid">
        <div class="state-item">
          <label>Complete State:</label>
          <pre>{{ completeState | json }}</pre>
        </div>
        
        <div class="state-item">
          <label>Is Idle:</label>
          <span [class.active]="isIdle">{{ isIdle }}</span>
        </div>
        
        <div class="state-item">
          <label>Is Warning:</label>
          <span [class.active]="isWarning">{{ isWarning }}</span>
        </div>
        
        <div class="state-item">
          <label>Time Remaining:</label>
          <span class="time">{{ formatTime(timeRemaining) }}</span>
        </div>
        
        <div class="state-item">
          <label>Last Activity:</label>
          <span>{{ lastActivity | date:'medium' }}</span>
        </div>
        
        <div class="state-item">
          <label>Token Refresh In Progress:</label>
          <span [class.active]="tokenRefreshInProgress">{{ tokenRefreshInProgress }}</span>
        </div>
        
        <div class="state-item">
          <label>User Role:</label>
          <span>{{ userRole || 'Not Set' }}</span>
        </div>
        
        <div class="state-item">
          <label>Idle Status:</label>
          <span [class]="'status-' + idleStatus">{{ idleStatus }}</span>
        </div>
        
        <div class="state-item">
          <label>Configuration:</label>
          <pre>{{ config | json }}</pre>
        </div>
      </div>
      
      <div class="controls">
        <button (click)="simulateActivity()">Simulate Activity</button>
        <button (click)="extendSession()">Extend Session</button>
        <button (click)="setUserRole('admin')">Set Admin Role</button>
        <button (click)="setUserRole('user')">Set User Role</button>
        <button (click)="logout()">Logout</button>
      </div>
      
      <idle-warning-dialog 
        *ngIf="showWarning"
        [warningData]="warningData"
        titleText="Session Timeout Test"
        messageText="This is a test of the reactive warning dialog."
        (extendSession)="onExtendSession()"
        (logout)="onLogout()"
      ></idle-warning-dialog>
    </div>
  `,
  styles: [`
    .state-monitor {
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    
    .state-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    
    .state-item {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: #f9f9f9;
    }
    
    .state-item label {
      font-weight: bold;
      display: block;
      margin-bottom: 5px;
    }
    
    .state-item pre {
      background: #fff;
      padding: 8px;
      border-radius: 3px;
      font-size: 12px;
      overflow-x: auto;
    }
    
    .active {
      color: #28a745;
      font-weight: bold;
    }
    
    .time {
      font-size: 18px;
      font-weight: bold;
      color: #dc3545;
    }
    
    .status-active { color: #28a745; }
    .status-warning { color: #ffc107; }
    .status-idle { color: #dc3545; }
    
    .controls {
      margin-top: 20px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    
    button {
      padding: 10px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background: #007bff;
      color: white;
      font-size: 14px;
    }
    
    button:hover {
      background: #0056b3;
    }
  `]
})
export class StateTestComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  completeState: any = null;
  isIdle = false;
  isWarning = false;
  timeRemaining = 0;
  lastActivity: Date = new Date();
  tokenRefreshInProgress = false;
  userRole: string | null = null;
  idleStatus = 'active';
  config: any = null;
  
  showWarning = false;
  warningData: any = null;

  constructor(
    private store: Store,
    private idleOAuthService: IdleOAuthService
  ) {}

  ngOnInit(): void {
    // Initialize the service
    this.idleOAuthService.initialize({
      idleTimeout: 30000, // 30 seconds for testing
      warningTimeout: 10000, // 10 seconds warning
      autoRefreshToken: true,
      multiTabCoordination: true,
      roleBased: true,
      roleTimeouts: {
        'admin': { idle: 60000, warning: 15000 },
        'user': { idle: 30000, warning: 10000 }
      }
    });

    this.idleOAuthService.start();

    // Subscribe to all state properties
    combineLatest([
      this.store.select(selectIdleState),
      this.store.select(selectIsIdle),
      this.store.select(selectIsWarning),
      this.store.select(selectTimeRemaining),
      this.store.select(selectLastActivity),
      this.store.select(selectTokenRefreshInProgress),
      this.store.select(selectUserRole),
      this.store.select(selectIdleStatus),
      this.store.select(selectConfig)
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([
      completeState,
      isIdle,
      isWarning,
      timeRemaining,
      lastActivity,
      tokenRefreshInProgress,
      userRole,
      idleStatus,
      config
    ]) => {
      this.completeState = completeState;
      this.isIdle = isIdle;
      this.isWarning = isWarning;
      this.timeRemaining = timeRemaining;
      this.lastActivity = new Date(lastActivity);
      this.tokenRefreshInProgress = tokenRefreshInProgress;
      this.userRole = userRole;
      this.idleStatus = idleStatus;
      this.config = config;
      
      // Update warning dialog
      this.showWarning = isWarning;
      if (isWarning) {
        this.warningData = this.idleOAuthService.getCurrentWarningData();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.idleOAuthService.stop();
  }

  simulateActivity(): void {
    // Simulate mouse move to trigger activity
    const event = new MouseEvent('mousemove', {
      clientX: Math.random() * 100,
      clientY: Math.random() * 100
    });
    document.dispatchEvent(event);
  }

  extendSession(): void {
    this.idleOAuthService.extendSession();
  }

  setUserRole(role: string): void {
    this.idleOAuthService.setUserRole(role);
  }

  logout(): void {
    this.idleOAuthService.logout();
  }

  onExtendSession(): void {
    this.extendSession();
  }

  onLogout(): void {
    this.logout();
  }

  formatTime(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}