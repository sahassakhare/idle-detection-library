import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, of } from 'rxjs';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import * as AuthActions from '../store/auth.actions';
import * as AuthSelectors from '../store/auth.selectors';
import { environment } from '../../environments/environment';
import { ProviderSwitcherComponent } from '../provider-switcher/provider-switcher.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ProviderSwitcherComponent],
  template: `
    <div class="login-container">
      <!-- Provider Switcher -->
      <app-provider-switcher></app-provider-switcher>
      
      <div class="login-card card">
        <div class="text-center mb-3">
          <h2>Login Required</h2>
          <p class="text-muted">Please authenticate to continue</p>
        </div>

        <div *ngIf="timeoutReason$ | async" class="alert alert-warning">
          <strong>Session Expired!</strong>
          Your session has expired due to inactivity. Please log in again.
        </div>

        <div class="login-content">
          <div class="text-center mb-3">
            <h3>{{ currentProvider }} Login</h3>
            <p *ngIf="currentProvider === 'DEMO'">This demo uses Duende IdentityServer for authentication.</p>
            <p *ngIf="currentProvider === 'AUTH0'">Authenticate using Auth0 identity provider.</p>
            <p *ngIf="currentProvider === 'GOOGLE'">Sign in with your Google account.</p>
            <p *ngIf="currentProvider === 'MICROSOFT'">Sign in with your Microsoft account.</p>
          </div>

          <div *ngIf="currentProvider === 'DEMO'" class="demo-info alert alert-info">
            <h4>Demo Credentials:</h4>
            <ul>
              <li><strong>Username:</strong> alice</li>
              <li><strong>Password:</strong> alice</li>
            </ul>
            <p><small>Or use: bob / bob</small></p>
          </div>

          <div *ngIf="currentProvider !== 'DEMO'" class="provider-info alert alert-info">
            <h4>Real OAuth Provider</h4>
            <p>You will be redirected to {{ currentProvider }} for authentication.</p>
            <p><small>Make sure you have configured the provider correctly in the environment file.</small></p>
          </div>

          <div class="text-center">
            <button 
              class="btn btn-success btn-lg" 
              (click)="login()"
              [disabled]="isLoading$ | async">
              <span *ngIf="isLoading$ | async">Logging in...</span>
              <span *ngIf="!(isLoading$ | async)">Login with OIDC</span>
            </button>
          </div>

          <div class="features mt-3">
            <h4>What this demo shows:</h4>
            <ul>
              <li>✅ OIDC Authentication with angular-auth-oidc-client</li>
              <li>✅ Automatic idle detection (30 seconds)</li>
              <li>✅ Warning dialog before timeout (10 seconds)</li>
              <li>✅ Automatic token refresh on user activity</li>
              <li>✅ Multi-tab session coordination</li>
              <li>✅ Angular 18+ with signals and standalone components</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
      padding: 2rem 0;
    }

    .login-card {
      width: 100%;
      max-width: 500px;
      padding: 2rem;
    }

    .text-muted {
      color: #6c757d;
    }

    .demo-info {
      background-color: #e3f2fd;
      border: 1px solid #bbdefb;
      color: #0d47a1;
    }

    .demo-info h4 {
      margin-bottom: 0.5rem;
      color: #1565c0;
    }

    .demo-info ul {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
    }

    .btn-lg {
      padding: 12px 30px;
      font-size: 1.1rem;
    }

    .features {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      border: 1px solid #e9ecef;
    }

    .features h4 {
      margin-bottom: 0.5rem;
      color: #495057;
    }

    .features ul {
      margin: 0;
      padding-left: 1.5rem;
    }

    .features li {
      margin-bottom: 0.25rem;
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private store = inject(Store);
  private oidcSecurityService = inject(OidcSecurityService);
  private destroy$ = new Subject<void>();

  // NgRx Selectors
  isLoading$ = this.store.select(AuthSelectors.selectIsAuthLoading);
  timeoutReason$ = this.store.select(AuthSelectors.selectTimeoutReason);
  
  // Current provider info
  currentProvider = environment.auth.provider.toUpperCase();

  ngOnInit(): void {
    // Check if user came here due to timeout
    const reason = this.route.snapshot.queryParams['reason'];
    this.store.dispatch(AuthActions.setTimeoutReason({ isTimeout: reason === 'timeout' }));
    
    console.log(`🔐 Login component initialized with provider: ${this.currentProvider}`);
    
    // Check if user is already authenticated
    this.oidcSecurityService.checkAuth().subscribe((result) => {
      if (result.isAuthenticated) {
        console.log('✅ User already authenticated, redirecting to dashboard');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  login(): void {
    this.store.dispatch(AuthActions.setAuthLoading({ loading: true }));
    
    if (environment.auth.provider === 'demo') {
      console.log('🎭 Demo mode - simulating login');
      // Simulate login for demo mode
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1000);
    } else {
      console.log(`🚀 Starting OAuth login with ${this.currentProvider}`);
      // Use real OIDC authentication
      this.oidcSecurityService.authorize();
    }
  }
}