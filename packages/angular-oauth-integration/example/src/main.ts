import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { MinimalAppComponent } from '../minimal-app.component';
// Step 2: Replace simple idle with real library store
import { idleReducer, IDLE_FEATURE_KEY, IdleEffects } from '../../src/lib/store';
// Step 3: Add OAuth integration
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { MockOidcSecurityService } from './mock-oauth.service';

bootstrapApplication(MinimalAppComponent, {
  providers: [
    // Step 1: Add NgRx Store
    provideStore({
      // Step 2: Add real library idle reducer
      [IDLE_FEATURE_KEY]: idleReducer
    }),
    provideEffects([IdleEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false,
      connectInZone: true
    }),
    provideHttpClient(),
    // Step 3: Add OAuth integration
    {
      provide: OidcSecurityService,
      useClass: MockOidcSecurityService
    }
  ]
}).catch(err => console.error(err));