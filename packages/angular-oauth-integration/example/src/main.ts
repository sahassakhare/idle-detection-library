import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideAuth } from 'angular-auth-oidc-client';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { idleReducer } from '@idle-detection/angular-oauth-integration';
import { authReducer, AuthEffects, dashboardReducer, DashboardEffects, configReducer, ConfigEffects } from './app/store';
import { environment } from './environments/environment';

// Get OAuth configuration based on environment
function getAuthConfig() {
  const provider = environment.auth.provider;
  const config = environment.auth[provider];
  
  console.log(`🔐 Using OAuth provider: ${provider.toUpperCase()}`);
  console.log(`🌐 Authority: ${config.authority}`);
  
  return config;
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    // Dynamic OAuth configuration based on environment
    provideAuth({
      config: getAuthConfig()
    }),
    provideStore({ 
      idle: idleReducer,
      auth: authReducer,
      dashboard: dashboardReducer,
      config: configReducer
    }),
    provideEffects([AuthEffects, DashboardEffects, ConfigEffects])
  ]
}).catch((err: any) => {
  console.error('Bootstrap error:', err);
  alert('Bootstrap error: ' + err.message);
});