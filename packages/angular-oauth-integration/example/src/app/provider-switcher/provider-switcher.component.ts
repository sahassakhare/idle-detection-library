import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-provider-switcher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="provider-switcher card">
      <h4>OAuth Provider Switcher</h4>
      <p class="text-muted">Current provider: <strong>{{ currentProvider }}</strong></p>
      
      <div class="form-group">
        <label for="provider-select">Switch Provider:</label>
        <select 
          id="provider-select" 
          [(ngModel)]="selectedProvider" 
          (change)="onProviderChange()"
          class="form-control">
          <option value="demo">Demo (Duende IdentityServer)</option>
          <option value="auth0">Auth0</option>
          <option value="google">Google</option>
          <option value="microsoft">Microsoft Azure AD</option>
        </select>
      </div>
      
      <div class="provider-info mt-3">
        <div *ngIf="selectedProvider === 'demo'" class="alert alert-info">
          <h6>Demo Provider</h6>
          <p><strong>Username:</strong> alice / alice or bob / bob</p>
          <p><strong>Authority:</strong> demo.duendesoftware.com</p>
        </div>
        
        <div *ngIf="selectedProvider === 'auth0'" class="alert alert-warning">
          <h6>Auth0 Setup Required</h6>
          <p>Update <code>environment.ts</code> with your Auth0 domain and client ID.</p>
          <p><strong>Free Tier:</strong> 7,000 MAUs</p>
        </div>
        
        <div *ngIf="selectedProvider === 'google'" class="alert alert-warning">
          <h6>Google OAuth Setup Required</h6>
          <p>Update <code>environment.ts</code> with your Google client ID.</p>
          <p><strong>Free Tier:</strong> 100 requests/second</p>
        </div>
        
        <div *ngIf="selectedProvider === 'microsoft'" class="alert alert-warning">
          <h6>Microsoft Azure AD Setup Required</h6>
          <p>Update <code>environment.ts</code> with your Azure client ID.</p>
          <p><strong>Free Tier:</strong> Basic features included</p>
        </div>
      </div>
      
      <div class="setup-links mt-3">
        <h6>Setup Guides:</h6>
        <ul>
          <li><a href="/OAUTH_PROVIDERS_SETUP.md" target="_blank">Complete Setup Guide</a></li>
          <li><a href="https://auth0.com" target="_blank" *ngIf="selectedProvider === 'auth0'">Auth0 Console</a></li>
          <li><a href="https://console.cloud.google.com" target="_blank" *ngIf="selectedProvider === 'google'">Google Cloud Console</a></li>
          <li><a href="https://portal.azure.com" target="_blank" *ngIf="selectedProvider === 'microsoft'">Azure Portal</a></li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .provider-switcher {
      margin-bottom: 2rem;
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 1rem;
    }

    .text-muted {
      color: #6c757d;
      margin-bottom: 1rem;
    }

    .alert {
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }

    .alert-info {
      background-color: #d1ecf1;
      border: 1px solid #bee5eb;
      color: #0c5460;
    }

    .alert-warning {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      color: #856404;
    }

    .alert h6 {
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .alert p {
      margin-bottom: 0.5rem;
    }

    .alert p:last-child {
      margin-bottom: 0;
    }

    code {
      background-color: #f8f9fa;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-family: monospace;
      font-size: 0.875rem;
    }

    .setup-links h6 {
      margin-bottom: 0.5rem;
      color: #495057;
    }

    .setup-links ul {
      margin: 0;
      padding-left: 1.5rem;
    }

    .setup-links li {
      margin-bottom: 0.25rem;
    }

    .setup-links a {
      color: #007bff;
      text-decoration: none;
    }

    .setup-links a:hover {
      text-decoration: underline;
    }
  `]
})
export class ProviderSwitcherComponent {
  currentProvider = environment.auth.provider.toUpperCase();
  selectedProvider = environment.auth.provider;

  onProviderChange(): void {
    if (this.selectedProvider !== environment.auth.provider) {
      alert(`To switch to ${this.selectedProvider.toUpperCase()}, please:
      
1. Update environment.ts:
   provider: '${this.selectedProvider}'
   
2. Configure the ${this.selectedProvider} settings in environment.ts
3. Reload the application

See OAUTH_PROVIDERS_SETUP.md for detailed instructions.`);
    }
  }
}