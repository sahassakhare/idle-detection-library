import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { 
  IdleOAuthService, 
  selectRemainingTime,
  selectShowWarning,
  IdleState
} from '@idle-detection/angular-oauth-integration';

@Component({
  selector: 'app-warning-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="warning-backdrop" *ngIf="showWarning$ | async">
      <div class="warning-dialog">
        <div class="warning-header">
          <h2>Session Timeout Warning</h2>
        </div>
        
        <div class="warning-body">
          <p>Your session will expire soon due to inactivity.</p>
          
          <div class="countdown">
            <span>Time remaining:</span>
            <span class="countdown-time">{{ formatTime(remainingTime$ | async) }}</span>
          </div>
        </div>
        
        <div class="warning-actions">
          <button 
            type="button" 
            class="btn btn-primary" 
            (click)="extendSession()">
            Stay Logged In
          </button>
          <button 
            type="button" 
            class="btn btn-secondary" 
            (click)="logoutNow()">
            Logout Now
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .warning-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .warning-dialog {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      min-width: 400px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .warning-header h2 {
      margin: 0 0 1rem 0;
      color: #e74c3c;
    }

    .warning-body {
      margin-bottom: 2rem;
    }

    .countdown {
      margin-top: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;
      text-align: center;
    }

    .countdown-time {
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
      font-size: 1.5rem;
      font-weight: bold;
      color: #e74c3c;
      margin-left: 0.5rem;
    }

    .warning-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
    }
  `]
})
export class WarningDialogComponent implements OnInit {
  private idleOAuthService = inject(IdleOAuthService);
  private store = inject(Store);

  remainingTime$!: Observable<number>;
  showWarning$!: Observable<boolean>;

  ngOnInit(): void {
    this.remainingTime$ = this.store.select(selectRemainingTime);
    this.showWarning$ = this.store.select(selectShowWarning);
  }

  formatTime(seconds: number | null): string {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  extendSession(): void {
    this.idleOAuthService.extendSession();
  }

  logoutNow(): void {
    this.idleOAuthService.logoutNow();
  }
}