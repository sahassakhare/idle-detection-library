import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import * as ConfigActions from './config.actions';
import { AngularIdleOAuthConfig } from '@idle-detection/angular-oauth-integration';

export interface AppIdleConfig {
  development: AngularIdleOAuthConfig;
  production: AngularIdleOAuthConfig;
  staging: AngularIdleOAuthConfig;
}

@Injectable()
export class ConfigEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);

  loadConfig$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfigActions.loadConfig),
      switchMap(() => {
        const environment = this.getEnvironment();
        
        return this.http.get<AppIdleConfig>('assets/config/idle-config.json').pipe(
          map(configs => {
            const config = configs[environment] || configs.production;
            console.log(`✅ Loaded idle config for ${environment}:`, config);
            return ConfigActions.loadConfigSuccess({ config });
          }),
          catchError(error => {
            console.warn('⚠️ Failed to load external config, using environment defaults:', error);
            const config = this.getEnvironmentDefaults(environment);
            return of(ConfigActions.loadConfigSuccess({ config }));
          })
        );
      })
    )
  );

  saveConfigToLocalStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfigActions.saveConfigToLocalStorage),
      map(() => {
        // This effect would need access to the current config from the store
        // For now, we'll handle this in the service method
        return { type: 'NO_ACTION' };
      })
    ),
    { dispatch: false }
  );

  private getEnvironment(): keyof AppIdleConfig {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Development detection
    if (hostname === 'localhost' || hostname === '127.0.0.1' || port === '4200') {
      return 'development';
    }
    
    // Staging detection
    if (hostname.includes('staging') || hostname.includes('dev.') || hostname.includes('test.')) {
      return 'staging';
    }
    
    // Production (default)
    return 'production';
  }

  private getEnvironmentDefaults(environment: keyof AppIdleConfig): AngularIdleOAuthConfig {
    switch (environment) {
      case 'development':
        return {
          idleTimeout: 2 * 60 * 1000,     // 2 minutes for quick testing
          warningTimeout: 30 * 1000,      // 30 seconds warning
          autoRefreshToken: true,
          multiTabCoordination: true,
          debug: true
        };
        
      case 'staging':
        return {
          idleTimeout: 10 * 60 * 1000,    // 10 minutes
          warningTimeout: 2 * 60 * 1000,  // 2 minutes warning
          autoRefreshToken: true,
          multiTabCoordination: true,
          debug: true
        };
        
      case 'production':
      default:
        return {
          idleTimeout: 30 * 60 * 1000,    // 30 minutes
          warningTimeout: 5 * 60 * 1000,  // 5 minutes warning
          autoRefreshToken: true,
          multiTabCoordination: true,
          debug: false
        };
    }
  }
}