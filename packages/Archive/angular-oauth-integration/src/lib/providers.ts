import { 
  EnvironmentProviders, 
  makeEnvironmentProviders, 
  importProvidersFrom,
  InjectionToken 
} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { IdleOAuthConfig } from './types';
import { idleReducer } from './store/idle.reducer';
import { IdleEffects } from './store/idle.effects';
import { IDLE_FEATURE_KEY } from './store/idle.state';

export const IDLE_OAUTH_CONFIG = new InjectionToken<IdleOAuthConfig>('IDLE_OAUTH_CONFIG');

export function provideIdleOAuthConfig(config: IdleOAuthConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(StoreModule.forFeature(IDLE_FEATURE_KEY, idleReducer)),
    importProvidersFrom(EffectsModule.forFeature([IdleEffects])),
    {
      provide: IDLE_OAUTH_CONFIG,
      useValue: config
    }
  ]);
}

export function provideIdleOAuthStore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    importProvidersFrom(StoreModule.forFeature(IDLE_FEATURE_KEY, idleReducer)),
    importProvidersFrom(EffectsModule.forFeature([IdleEffects]))
  ]);
}