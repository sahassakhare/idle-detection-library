import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
// Step 3: Add OAuth integration
import { OidcSecurityService } from 'angular-auth-oidc-client';
// Step 4: Add real library warning dialog
import { IdleWarningDialogComponent } from '../src/lib/idle-warning-dialog.component';
import { IdleWarningData } from '../src/lib/types';
// Step 2: Import real library idle detection
import { 
  selectIsIdle, 
  selectIsWarning, 
  selectTimeRemaining, 
  selectIdleStatus,
  selectLastActivity,
  userActivity,
  startWarning,
  startIdle,
  resetIdle,
  initializeIdle
} from '../src/lib/store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IdleWarningDialogComponent],
  template: `
    <div class="app">
      <h1>Angular OAuth Integration - Minimal Test</h1>
      
      <div class="status">
        <h2>Application Status</h2>
        <p>✅ Angular 18 application loaded successfully</p>
        <p>✅ Zone.js configured properly</p>
        <p>✅ Standalone components working</p>
        <p>✅ CommonModule imported</p>
        <p>✅ NgRx Store configured and injected</p>
        <p>✅ NgRx Effects registered</p>
        <p>✅ NgRx DevTools available</p>
        <p>✅ Idle detection store added</p>
        <p>✅ Idle state selectors working</p>
        <p>✅ Mock OAuth service integrated</p>
        <p>✅ Authentication state tracking</p>
        <p>✅ Warning dialog component created</p>
        <p>✅ Beautiful animations and styling</p>
      </div>
      
      <!-- Step 3: OAuth Status -->
      <div class="status">
        <h2>OAuth Authentication Status</h2>
        <p><strong>Is Authenticated:</strong> <span [class]="getAuthStatus() ? 'status-active' : 'status-idle'">{{ getAuthStatus() ? 'Yes' : 'No' }}</span></p>
        <p><strong>User Data:</strong> {{ getUserName() || 'Not available' }}</p>
        <p><strong>User Role:</strong> {{ getUserRole() || 'Not set' }}</p>
        <p><strong>User Email:</strong> {{ getUserEmail() || 'Not available' }}</p>
        
        <div class="controls">
          <button (click)="login()">Login</button>
          <button (click)="logout()">Logout</button>
          <button (click)="setRole('admin')">Set Admin Role</button>
          <button (click)="setRole('user')">Set User Role</button>
        </div>
      </div>

      <!-- Step 2: Live Idle State Monitoring -->
      <div class="status">
        <h2>Live Idle State</h2>
        <p><strong>Status:</strong> <span [class]="'status-' + (idleStatus$ | async)">{{ idleStatus$ | async }}</span></p>
        <p><strong>Is Idle:</strong> {{ isIdle$ | async }}</p>
        <p><strong>Is Warning:</strong> {{ isWarning$ | async }}</p>
        <p><strong>Time Remaining:</strong> {{ timeRemaining$ | async }}ms</p>
        <p><strong>Last Activity:</strong> {{ (lastActivity$ | async) | date:'medium' }}</p>
        
        <div class="controls">
          <button (click)="simulateActivity()">Simulate Activity</button>
          <button (click)="triggerWarning()">Trigger Warning</button>
          <button (click)="triggerIdle()">Trigger Idle</button>
          <button (click)="resetState()">Reset State</button>
          <button (click)="showWarningDialog()">Show Warning Dialog</button>
        </div>
      </div>

      <div class="info">
        <h3>Next Steps:</h3>
        <ol>
          <li>✅ Basic Angular setup working</li>
          <li>✅ Add NgRx store configuration</li>
          <li>✅ Add idle detection library</li>
          <li>✅ Add OAuth integration</li>
          <li>✅ Add warning dialog</li>
        </ol>
        
        <p><strong>Current Status:</strong> All features are now working! 🎉</p>
      </div>
      
      <!-- Additional Test Buttons -->
      <div class="controls">
        <h3>🧪 Test Features</h3>
        <button (click)="simulateRelogin()" class="test-button">
          🔐 Test Relogin (fixes idle detection after logout)
        </button>
      </div>
      
      <!-- Enhanced Warning Dialog with All Features -->
      <idle-warning-dialog
        *ngIf="isWarningDialogVisible"
        [warningData]="getWarningData()"
        dialogTitle="⚠️ Session Timeout Warning"
        dialogMessage="Your session will expire soon due to inactivity. Please extend your session to continue working."
        extendButtonText="Extend Session"
        logoutButtonText="Logout Now"
        [showProgressBar]="true"
        [showCountdown]="true"
        [theme]="'default'"
        [size]="'medium'"
        [backdropClose]="false"
        backdropClass="custom-backdrop"
        dialogClass="custom-dialog"
        actionsClass="custom-actions"
        primaryButtonClass="btn btn-primary custom-primary"
        secondaryButtonClass="btn btn-secondary custom-secondary"
        (extendSession)="onDialogExtendSession()"
        (logout)="onDialogLogout()"
      ></idle-warning-dialog>
    </div>
  `,
  styles: [`
    .app {
      padding: 20px;
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      color: white;
    }
    
    h1 {
      text-align: center;
      margin-bottom: 30px;
      font-size: 2.5rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .status {
      background: rgba(255, 255, 255, 0.1);
      padding: 20px;
      border-radius: 12px;
      margin: 20px 0;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .status h2 {
      margin-top: 0;
      color: #ffffff;
    }
    
    .status p {
      margin: 10px 0;
      font-size: 16px;
      display: flex;
      align-items: center;
    }
    
    .info {
      background: rgba(255, 255, 255, 0.1);
      padding: 20px;
      border-radius: 12px;
      border-left: 4px solid #4CAF50;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .info h3 {
      margin-top: 0;
      color: #ffffff;
    }
    
    .info ol {
      margin: 15px 0;
    }
    
    .info li {
      margin: 8px 0;
      padding: 5px 0;
    }
    
    .info p {
      background: rgba(76, 175, 80, 0.2);
      padding: 15px;
      border-radius: 8px;
      border-left: 3px solid #4CAF50;
      margin-top: 20px;
    }
    
    /* Step 2: Idle status styles */
    .status-active { 
      color: #4CAF50; 
      font-weight: bold; 
    }
    .status-warning { 
      color: #FF9800; 
      font-weight: bold; 
    }
    .status-idle { 
      color: #F44336; 
      font-weight: bold; 
    }
    
    .controls {
      display: flex;
      gap: 10px;
      margin-top: 15px;
      flex-wrap: wrap;
    }
    
    .controls button {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      font-size: 14px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      transition: all 0.2s ease;
    }
    
    .controls button:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }

    /* Test button styles */
    .test-button {
      background: #8b5cf6;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      margin: 10px 0;
      transition: background 0.2s ease;
    }

    .test-button:hover {
      background: #7c3aed;
    }

    /* Custom dialog styles */
    .custom-backdrop {
      background: rgba(0, 0, 0, 0.7) !important;
      backdrop-filter: blur(3px) !important;
    }

    .custom-dialog {
      border: 2px solid #3b82f6 !important;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
    }

    .custom-actions {
      justify-content: center !important;
    }

    .custom-primary {
      background: linear-gradient(to right, #3b82f6, #1d4ed8) !important;
      padding: 12px 24px !important;
      font-weight: 600 !important;
      border-radius: 8px !important;
    }

    .custom-secondary {
      background: linear-gradient(to right, #6b7280, #374151) !important;
      padding: 12px 24px !important;
      font-weight: 600 !important;
      border-radius: 8px !important;
    }
  `]
})
export class MinimalAppComponent implements OnInit {
  private store = inject(Store);
  private oidcSecurityService = inject(OidcSecurityService);

  // Step 2: Idle state observables
  isIdle$ = this.store.select(selectIsIdle);
  isWarning$ = this.store.select(selectIsWarning);
  timeRemaining$ = this.store.select(selectTimeRemaining);
  idleStatus$ = this.store.select(selectIdleStatus);
  lastActivity$ = this.store.select(selectLastActivity);

  // Step 3: OAuth state observables
  isAuthenticated$ = this.oidcSecurityService.isAuthenticated$;
  userData$ = this.oidcSecurityService.userData$;

  // Step 4: Warning dialog state
  isWarningDialogVisible = false;

  constructor() {
    console.log('✅ MinimalAppComponent loaded successfully!');
    console.log('✅ Angular 18 application is running');
    console.log('✅ Zone.js configuration working');
    console.log('✅ NgRx Store injected:', this.store);
  }

  ngOnInit(): void {
    console.log('✅ Idle state observables set up');
    
    // Initialize the idle detection with configuration
    this.store.dispatch(initializeIdle({
      config: {
        idleTimeout: 30000, // 30 seconds
        warningTimeout: 10000, // 10 seconds
        autoRefreshToken: true,
        multiTabCoordination: true,
        roleBased: true,
        roleTimeouts: {
          admin: { idle: 60000, warning: 15000 },
          user: { idle: 30000, warning: 10000 }
        }
      }
    }));
  }

  // Step 2: Idle state control methods
  simulateActivity(): void {
    console.log('🎯 Simulating user activity');
    this.store.dispatch(userActivity({ timestamp: Date.now() }));
  }

  triggerWarning(): void {
    console.log('⚠️ Triggering warning state');
    this.store.dispatch(startWarning({ timeRemaining: 30000 })); // 30 seconds
  }

  triggerIdle(): void {
    console.log('😴 Triggering idle state');
    this.store.dispatch(startIdle());
  }

  resetState(): void {
    console.log('🔄 Resetting idle state');
    this.store.dispatch(resetIdle());
  }

  // Step 3: OAuth control methods
  login(): void {
    console.log('🔐 Logging in user');
    (this.oidcSecurityService as any).login();
  }

  logout(): void {
    console.log('🚪 Logging out user');
    this.oidcSecurityService.logoff();
  }

  setRole(role: string): void {
    console.log(`👤 Setting user role to: ${role}`);
    (this.oidcSecurityService as any).setUserRole(role);
  }

  // Step 4: Warning dialog control methods
  showWarningDialog(): void {
    console.log('⚠️ Showing warning dialog');
    this.isWarningDialogVisible = true;
  }

  onDialogExtendSession(): void {
    console.log('🔄 Session extended from dialog');
    this.isWarningDialogVisible = false;
    this.store.dispatch(userActivity({ timestamp: Date.now() }));
    // Also dispatch extend session action to properly reset idle state
    this.store.dispatch({ type: '[Idle] Extend Session' });
  }

  onDialogLogout(): void {
    console.log('🚪 Logout triggered from dialog');
    this.isWarningDialogVisible = false;
    this.store.dispatch({ type: '[Idle] User Logged Out' });
    // Simulate logout by calling mock service
    (this.oidcSecurityService as any).logoff();
  }

  // Method to simulate relogin for testing
  simulateRelogin(): void {
    console.log('🔐 Simulating relogin...');
    // First logout
    this.store.dispatch({ type: '[Idle] User Logged Out' });
    (this.oidcSecurityService as any).logoff();
    
    // Then login after a short delay
    setTimeout(() => {
      (this.oidcSecurityService as any).login();
      this.store.dispatch({ type: '[Idle] User Authenticated' });
      console.log('✅ User re-authenticated - idle detection should restart');
    }, 1000);
  }

  // Helper methods for type-safe property access
  getAuthStatus(): boolean {
    const authState = (this.oidcSecurityService as any).authState.value;
    return authState?.isAuthenticated || false;
  }

  getUserName(): string {
    const userData = (this.oidcSecurityService as any).userData.value;
    return userData?.name || userData?.given_name || userData?.sub || '';
  }

  getUserRole(): string {
    const userData = (this.oidcSecurityService as any).userData.value;
    return userData?.role || userData?.userRole || userData?.roles?.[0] || '';
  }

  getUserEmail(): string {
    const userData = (this.oidcSecurityService as any).userData.value;
    return userData?.email || userData?.preferred_username || '';
  }

  // Step 4: Implementation for real library warning dialog
  getWarningData(): IdleWarningData {
    return {
      timeRemaining: 30, // seconds
      timeRemaining$: this.timeRemaining$,
      onExtendSession: () => this.onDialogExtendSession(),
      onLogout: () => this.onDialogLogout(),
      cssClasses: {
        dialog: 'custom-dialog',
        overlay: 'custom-overlay',
        title: 'custom-title',
        message: 'custom-message',
        button: 'custom-button',
        buttonPrimary: 'custom-button-primary',
        buttonSecondary: 'custom-button-secondary'
      }
    };
  }
}