import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-container">
      <div class="callback-card card">
        <div class="text-center">
          <div class="spinner-container">
            <div class="spinner"></div>
          </div>
          <h3>Processing Authentication...</h3>
          <p class="text-muted">Please wait while we complete your login.</p>
          
          <div *ngIf="error" class="alert alert-danger mt-3">
            <h5>Authentication Error</h5>
            <p>{{ error }}</p>
            <button class="btn btn-primary" (click)="retryLogin()">
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 2rem;
    }

    .callback-card {
      width: 100%;
      max-width: 400px;
      padding: 2rem;
      text-align: center;
    }

    .spinner-container {
      margin-bottom: 1.5rem;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .text-muted {
      color: #6c757d;
    }

    h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .alert {
      padding: 1rem;
      border-radius: 6px;
      margin-top: 1rem;
    }

    .alert-danger {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      background-color: #007bff;
      color: white;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .btn:hover {
      background-color: #0056b3;
    }
  `]
})
export class CallbackComponent implements OnInit {
  private oidcSecurityService = inject(OidcSecurityService);
  private router = inject(Router);

  error: string | null = null;

  ngOnInit(): void {
    this.handleCallback();
  }

  private handleCallback(): void {
    console.log('🔄 Processing OAuth callback...');

    this.oidcSecurityService.checkAuth().subscribe({
      next: (result) => {
        console.log('✅ Auth check result:', result);

        if (result.isAuthenticated) {
          console.log('🎉 Authentication successful!');
          console.log('👤 User data:', result.userData);
          
          // Redirect to dashboard on successful authentication
          this.router.navigate(['/dashboard']);
        } else {
          console.log('❌ Authentication failed:', result);
          this.error = result.errorMessage || 'Authentication failed. Please try again.';
        }
      },
      error: (error) => {
        console.error('💥 Auth callback error:', error);
        this.error = 'An error occurred during authentication. Please try again.';
      }
    });
  }

  retryLogin(): void {
    console.log('🔄 Retrying login...');
    this.error = null;
    this.router.navigate(['/login']);
  }
}