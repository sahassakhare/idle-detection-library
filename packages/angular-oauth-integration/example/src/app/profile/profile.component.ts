import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil, map, of } from 'rxjs';
import * as AuthActions from '../store/auth.actions';
import * as AuthSelectors from '../store/auth.selectors';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile">
      <div class="profile-header mb-3">
        <h2>User Profile</h2>
        <p>Your authentication and session information</p>
      </div>

      <!-- User Information -->
      <div class="card mb-3">
        <h3>User Information</h3>
        <div class="user-info" *ngIf="userData$ | async as userData; else loadingUser">
          <div class="info-grid">
            <div class="info-item">
              <label>Name:</label>
              <span>{{ userData?.name || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <label>Username:</label>
              <span>{{ userData?.preferred_username || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <label>Email:</label>
              <span>{{ userData?.email || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <label>Subject ID:</label>
              <span class="mono">{{ userData?.sub || 'N/A' }}</span>
            </div>
          </div>
        </div>
        
        <ng-template #loadingUser>
          <div class="text-center">
            <div class="spinner"></div>
            <p>Loading user information...</p>
          </div>
        </ng-template>
      </div>

      <!-- Token Information -->
      <div class="card mb-3">
        <h3>Token Information</h3>
        <div class="token-info" *ngIf="tokenData$ | async as tokenData; else loadingToken">
          <div class="info-grid">
            <div class="info-item">
              <label>Access Token:</label>
              <span class="token-preview">{{ getTokenPreview(tokenData?.accessToken) }}</span>
            </div>
            <div class="info-item">
              <label>Token Type:</label>
              <span>{{ tokenData?.tokenType || 'Bearer' }}</span>
            </div>
            <div class="info-item">
              <label>Expires In:</label>
              <span>{{ getTokenExpiry() }}</span>
            </div>
            <div class="info-item">
              <label>Scope:</label>
              <span>{{ tokenData?.scope || 'N/A' }}</span>
            </div>
          </div>
          
          <div class="token-actions mt-3">
            <button class="btn" (click)="refreshToken()" [disabled]="isRefreshing$ | async">
              <span *ngIf="isRefreshing$ | async">Refreshing...</span>
              <span *ngIf="!(isRefreshing$ | async)">Refresh Token</span>
            </button>
          </div>
        </div>
        
        <ng-template #loadingToken>
          <div class="text-center">
            <div class="spinner"></div>
            <p>Loading token information...</p>
          </div>
        </ng-template>
      </div>

      <!-- Session Management -->
      <div class="card mb-3">
        <h3>Session Management</h3>
        <div class="session-controls">
          <div class="control-group">
            <h4>Idle Detection</h4>
            <p>Current session status and controls</p>
            <div class="d-flex gap-2 mb-3">
              <button class="btn" (click)="extendSession()">
                Extend Session
              </button>
              <button class="btn btn-secondary" (click)="checkIdleStatus()">
                Check Status
              </button>
            </div>
            <div class="status-display">
              <div class="status-item">
                <label>Current Status:</label>
                <span class="status-badge" [class]="statusClass$ | async">
                  {{ statusText$ | async }}
                </span>
              </div>
              <div class="status-item">
                <label>Last Activity:</label>
                <span>{{ lastActivity$ | async | date:'medium' }}</span>
              </div>
            </div>
          </div>
          
          <div class="control-group">
            <h4>Authentication</h4>
            <p>Manage your authentication session</p>
            <div class="d-flex gap-2">
              <button class="btn btn-danger" (click)="logout()">
                Logout
              </button>
              <button class="btn btn-secondary" (click)="checkAuth()">
                Check Auth Status
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Debug Information -->
      <div class="card">
        <h3>Debug Information</h3>
        <div class="debug-info">
          <div class="info-section">
            <h4>Configuration</h4>
            <div class="debug-item">
              <label>Authority:</label>
              <span class="mono">{{ (configuration$ | async)?.authority || 'N/A' }}</span>
            </div>
            <div class="debug-item">
              <label>Client ID:</label>
              <span class="mono">{{ (configuration$ | async)?.clientId || 'N/A' }}</span>
            </div>
            <div class="debug-item">
              <label>Scope:</label>
              <span class="mono">{{ (configuration$ | async)?.scope || 'N/A' }}</span>
            </div>
          </div>
          
          <div class="info-section">
            <h4>Authentication State</h4>
            <div class="debug-item">
              <label>Is Authenticated:</label>
              <span class="badge" [class]="(authResult$ | async)?.isAuthenticated ? 'badge-success' : 'badge-danger'">
                {{ (authResult$ | async)?.isAuthenticated ? 'Yes' : 'No' }}
              </span>
            </div>
            <div class="debug-item">
              <label>Configuration Loaded:</label>
              <span class="badge" [class]="(authResult$ | async)?.configurationLoaded ? 'badge-success' : 'badge-danger'">
                {{ (authResult$ | async)?.configurationLoaded ? 'Yes' : 'No' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile {
      max-width: 1000px;
      margin: 0 auto;
    }

    .profile-header h2 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .profile-header p {
      color: #7f8c8d;
      margin: 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-item label {
      font-weight: 600;
      color: #495057;
      font-size: 0.875rem;
    }

    .info-item span {
      color: #212529;
      word-break: break-all;
    }

    .mono {
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
      font-size: 0.875rem;
      background: #f8f9fa;
      padding: 0.25rem 0.5rem;
      border-radius: 3px;
      border: 1px solid #e9ecef;
    }

    .token-preview {
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
      font-size: 0.75rem;
      background: #f8f9fa;
      padding: 0.5rem;
      border-radius: 4px;
      border: 1px solid #e9ecef;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .session-controls {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .control-group h4 {
      color: #495057;
      margin-bottom: 0.5rem;
    }

    .control-group p {
      color: #6c757d;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }

    .status-display {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 6px;
      border: 1px solid #e9ecef;
    }

    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .status-item:last-child {
      margin-bottom: 0;
    }

    .status-item label {
      font-weight: 500;
      color: #495057;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .status-badge.active {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.idle {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.warning {
      background: #f8d7da;
      color: #721c24;
    }

    .status-badge.timeout {
      background: #e2e3e5;
      color: #6c757d;
    }

    .debug-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .info-section h4 {
      color: #495057;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e9ecef;
    }

    .debug-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .debug-item label {
      font-weight: 500;
      color: #495057;
    }

    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .badge-success {
      background: #d4edda;
      color: #155724;
    }

    .badge-danger {
      background: #f8d7da;
      color: #721c24;
    }

    @media (max-width: 768px) {
      .info-grid {
        grid-template-columns: 1fr;
      }

      .session-controls {
        grid-template-columns: 1fr;
      }

      .debug-info {
        grid-template-columns: 1fr;
      }

      .status-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }

      .debug-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }
    }
  `]
})
export class ProfileComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private destroy$ = new Subject<void>();

  // NgRx Selectors
  userData$ = this.store.select(AuthSelectors.selectUserData);
  tokenData$ = this.store.select(AuthSelectors.selectTokenData);
  configuration$ = this.store.select(AuthSelectors.selectConfiguration);
  authResult$ = this.store.select(AuthSelectors.selectAuthResult);
  isRefreshing$ = this.store.select(AuthSelectors.selectIsTokenRefreshing);
  
  // Mock data for demo
  isIdle$ = of(false);
  isWarning$ = of(false);
  isTimedOut$ = of(false);
  lastActivity$ = of(new Date());

  // Computed observables
  statusClass$ = of('active');
  statusText$ = of('Active (Demo Mode)');

  ngOnInit(): void {
    // Initialize with demo data
    this.store.dispatch(AuthActions.setUserDataLoading({ loading: false }));
    console.log('Profile component initialized in demo mode');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkAuthStatus(): void {
    console.log('Auth status check - Demo mode');
  }

  getTokenPreview(token?: string): string {
    if (!token) return 'Demo token preview - not available in demo mode';
    return `${token.substring(0, 20)}...${token.substring(token.length - 20)}`;
  }

  getTokenExpiry(): string {
    return 'Demo mode - token expiry not available';
  }

  async refreshToken(): Promise<void> {
    console.log('Token refresh - Demo mode');
  }

  extendSession(): void {
    console.log('Extend session - Demo mode');
  }

  checkIdleStatus(): void {
    console.log('Check idle status - Demo mode');
  }

  checkAuth(): void {
    this.checkAuthStatus();
  }

  logout(): void {
    console.log('Logout - Demo mode');
  }
}