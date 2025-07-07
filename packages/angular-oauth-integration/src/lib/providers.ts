import { Provider, EnvironmentProviders } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { AngularIdleOAuthConfig, IDLE_OAUTH_CONFIG } from './types';
import { IdleOAuthService } from './idle-oauth.service';
import { idleReducer } from './store/idle.reducer';
import { IdleEffects } from './store/idle.effects';

/**
 * Provides the complete IdleOAuth functionality with NgRx store for Angular 18+ standalone applications
 */
export function provideIdleOAuthWithStore(config?: AngularIdleOAuthConfig): (Provider | EnvironmentProviders)[] {
  return [
    // Configuration first
    {
      provide: IDLE_OAUTH_CONFIG,
      useValue: config
    },
    
    // Core service with explicit provider
    {
      provide: IdleOAuthService,
      useClass: IdleOAuthService
    },
    
    // NgRx Store feature
    provideStore({ idle: idleReducer }),
    
    // NgRx Effects
    provideEffects([IdleEffects])
  ];
}

/**
 * Provides just the IdleOAuth service and configuration (without NgRx store setup)
 * Use this if you want to set up the store manually or already have it configured
 */
export function provideIdleOAuthConfig(config?: AngularIdleOAuthConfig): Provider[] {
  return [
    {
      provide: IdleOAuthService,
      useClass: IdleOAuthService
    },
    {
      provide: IDLE_OAUTH_CONFIG,
      useValue: config
    }
  ];
}

/**
 * Provides just the NgRx effects for idle detection
 * Use this when you've already set up the store with the idle reducer
 */
export function provideIdleOAuthEffects(): (Provider | EnvironmentProviders)[] {
  return [
    provideEffects([IdleEffects])
  ];
}