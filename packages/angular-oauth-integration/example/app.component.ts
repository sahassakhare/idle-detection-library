import { Component, OnInit, OnDestroy } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { IdleOAuthService } from '@idle-detection/angular-oauth-integration';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>Idle Detection with OAuth Example</h1>
        <div class="user-info" *ngIf="isAuthenticated">
          <span class="user-name">{{ userName }}</span>
          <div class="status-indicator" [class]="getStatusClass()">
            {{ getStatusText() }}
          </div>
          <button class="logout-btn" (click)="logout()">Logout</button>
        </div>
      </header>

      <main class="app-main">
        <!-- Show warning dialog when user is in warning state -->
        <idle-warning-dialog 
          *ngIf="showWarningDialog">
        </idle-warning-dialog>

        <!-- Router outlet for main content -->
        <router-outlet></router-outlet>
      </main>

      <footer class="app-footer">
        <div class="session-info" *ngIf="isAuthenticated">
          <p>Last Activity: {{ lastActivity | date:'medium' }}</p>
          <p>Session Status: {{ sessionStatus }}</p>
          <button class="extend-btn" (click)="extendSession()">
            Extend Session
          </button>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-header {
      background: #2c3e50;
      color: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .app-header h1 {
      margin: 0;
      font-size: 1.5rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-name {
      font-weight: 500;
    }

    .status-indicator {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .status-indicator.active {
      background: #27ae60;
      color: white;
    }

    .status-indicator.idle {
      background: #f39c12;
      color: white;
    }

    .status-indicator.warning {
      background: #e74c3c;
      color: white;
      animation: pulse 1s infinite;
    }

    .status-indicator.timeout {
      background: #95a5a6;
      color: white;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .logout-btn {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }

    .logout-btn:hover {
      background: #c0392b;
    }

    .app-main {
      flex: 1;
      position: relative;
    }

    .app-footer {
      background: #ecf0f1;
      padding: 1rem 2rem;
      border-top: 1px solid #bdc3c7;
    }

    .session-info {
      display: flex;
      align-items: center;
      gap: 2rem;
      font-size: 0.875rem;
      color: #7f8c8d;
    }

    .session-info p {
      margin: 0;
    }

    .extend-btn {
      background: #3498db;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .extend-btn:hover {
      background: #2980b9;
    }

    @media (max-width: 768px) {
      .app-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .session-info {
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-start;
      }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  userName = '';
  showWarningDialog = false;
  lastActivity: Date = new Date();
  sessionStatus = 'Active';

  private destroy$ = new Subject<void>();

  constructor(
    private oauthService: OAuthService,
    private idleOAuthService: IdleOAuthService
  ) {}

  ngOnInit(): void {
    // Configure OAuth
    this.configureOAuth();
    
    // Check authentication status
    this.isAuthenticated = this.oauthService.hasValidAccessToken();
    if (this.isAuthenticated) {
      this.userName = this.oauthService.getIdentityClaims()?.['name'] || 'User';
      this.idleOAuthService.startWatching();
    }

    // Subscribe to idle state changes
    this.idleOAuthService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.showWarningDialog = state.isWarning;
        this.lastActivity = state.lastActivity;
        this.sessionStatus = this.getSessionStatus(state);
      });

    // Subscribe to timeout events
    this.idleOAuthService.timeout$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('Session timed out');
        this.isAuthenticated = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private configureOAuth(): void {
    // Configure your OAuth provider here
    // This is just an example configuration
    this.oauthService.configure({
      issuer: 'https://your-oauth-provider.com',
      redirectUri: window.location.origin,
      clientId: 'your-client-id',
      scope: 'openid profile email',
      responseType: 'code',
      oidc: true
    });

    // Optional: Auto-load user profile
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
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
    if (state.isTimedOut) return 'Expired';
    if (state.isWarning) return 'Warning';
    if (state.isIdle) return 'Idle';
    return 'Active';
  }

  private getSessionStatus(state: any): string {
    if (state.isTimedOut) return 'Session Expired';
    if (state.isWarning) return 'Warning - Session Expiring';
    if (state.isIdle) return 'User Idle';
    return 'Active';
  }

  extendSession(): void {
    this.idleOAuthService.extendSession();
  }

  logout(): void {
    this.idleOAuthService.logoutNow();
  }
}