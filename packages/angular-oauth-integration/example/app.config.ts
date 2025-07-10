import { ApplicationConfig } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideIdleOAuthConfig } from '@idle-detection/angular-oauth-integration';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(),
    provideEffects(),
    provideIdleOAuthConfig({
      idleTimeout: 15 * 60 * 1000,    // 15 minutes
      warningTimeout: 2 * 60 * 1000,  // 2 minutes warning
      autoRefreshToken: true,
      multiTabCoordination: true,
      customCssClasses: {
        dialog: 'custom-dialog',
        overlay: 'custom-overlay',
        title: 'custom-title',
        message: 'custom-message',
        buttonPrimary: 'btn btn-primary',
        buttonSecondary: 'btn btn-secondary'
      }
    })
  ]
};