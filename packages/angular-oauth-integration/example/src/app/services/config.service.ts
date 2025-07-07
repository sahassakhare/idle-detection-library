import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AngularIdleOAuthConfig } from '@idle-detection/angular-oauth-integration';
import * as ConfigActions from '../store/config.actions';
import * as ConfigSelectors from '../store/config.selectors';
import { ConfigState } from '../store/config.state';

export interface AppIdleConfig {
  development: AngularIdleOAuthConfig;
  production: AngularIdleOAuthConfig;
  staging: AngularIdleOAuthConfig;
}

export interface RuntimeIdleConfig {
  presets: {
    [key: string]: {
      idleTimeout: number;
      warningTimeout: number;
      description: string;
    };
  };
  current: AngularIdleOAuthConfig;
}

@Injectable({
  providedIn: 'root'
})
export class IdleConfigService {
  private store = inject(Store<{ config: ConfigState }>);
  
  // NgRx Store selectors as observables
  public config$ = this.store.select(ConfigSelectors.selectConfig);
  public loading$ = this.store.select(ConfigSelectors.selectConfigLoading);
  public error$ = this.store.select(ConfigSelectors.selectConfigError);

  // Predefined timeout presets
  private timeoutPresets = {
    'quick': {
      idleTimeout: 2 * 60 * 1000,     // 2 minutes
      warningTimeout: 30 * 1000,      // 30 seconds
      description: 'Quick timeout for high-security areas'
    },
    'standard': {
      idleTimeout: 15 * 60 * 1000,    // 15 minutes
      warningTimeout: 2 * 60 * 1000,  // 2 minutes
      description: 'Standard timeout for regular use'
    },
    'extended': {
      idleTimeout: 45 * 60 * 1000,    // 45 minutes
      warningTimeout: 5 * 60 * 1000,  // 5 minutes
      description: 'Extended timeout for long tasks'
    },
    'development': {
      idleTimeout: 30 * 1000,         // 30 seconds
      warningTimeout: 10 * 1000,      // 10 seconds
      description: 'Very short timeout for development/testing'
    }
  };

  loadConfig(): void {
    this.store.dispatch(ConfigActions.loadConfig());
  }

  getConfig(): Observable<AngularIdleOAuthConfig | null> {
    return this.config$;
  }

  updateConfig(newConfig: Partial<AngularIdleOAuthConfig>): void {
    this.store.dispatch(ConfigActions.updateConfig({ config: newConfig }));
    console.log('🔄 Configuration updated:', newConfig);
  }

  applyTimeoutPreset(presetName: keyof typeof this.timeoutPresets): void {
    const preset = this.timeoutPresets[presetName];
    if (preset) {
      this.store.dispatch(ConfigActions.applyTimeoutPreset({ 
        presetName, 
        preset: {
          idleTimeout: preset.idleTimeout,
          warningTimeout: preset.warningTimeout
        }
      }));
      console.log(`🎯 Applied preset "${presetName}":`, preset);
    }
  }

  getTimeoutPresets() {
    return this.timeoutPresets;
  }

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

  private getEnvironmentDefaults(): AngularIdleOAuthConfig {
    const environment = this.getEnvironment();
    
    switch (environment) {
      case 'development':
        return {
          idleTimeout: 2 * 60 * 1000,     // 2 minutes for quick testing
          warningTimeout: 30 * 1000,      // 30 seconds warning
          autoRefreshToken: true,
          enableMultiTabCoordination: true,
          debug: true,
          warningDialogConfig: {
            title: 'DEV: Session Timeout',
            message: 'Development mode - short timeout for testing',
            theme: 'dark',
            size: 'large',
            showProgressBar: true,
            showCountdown: true
          }
        };
        
      case 'staging':
        return {
          idleTimeout: 10 * 60 * 1000,    // 10 minutes
          warningTimeout: 2 * 60 * 1000,  // 2 minutes warning
          autoRefreshToken: true,
          enableMultiTabCoordination: true,
          debug: true,
          warningDialogConfig: {
            title: 'STAGING: Session Warning',
            message: 'Staging environment - session will expire soon',
            theme: 'minimal',
            size: 'medium'
          }
        };
        
      case 'production':
      default:
        return {
          idleTimeout: 30 * 60 * 1000,    // 30 minutes
          warningTimeout: 5 * 60 * 1000,  // 5 minutes warning
          autoRefreshToken: true,
          enableMultiTabCoordination: true,
          debug: false,
          warningDialogConfig: {
            title: 'Session Timeout Warning',
            message: 'Your session will expire soon due to inactivity.',
            theme: 'default',
            size: 'medium'
          }
        };
    }
  }

  // Helper methods for common use cases (now as observables)
  getIdleTimeoutMinutes(): Observable<number> {
    return this.store.select(ConfigSelectors.selectIdleTimeoutMinutes);
  }

  getWarningTimeoutSeconds(): Observable<number> {
    return this.store.select(ConfigSelectors.selectWarningTimeoutSeconds);
  }

  isDebugEnabled(): Observable<boolean> {
    return this.store.select(ConfigSelectors.selectIsDebugEnabled);
  }

  // Save current config to localStorage for persistence
  saveConfigToLocalStorage(): void {
    this.store.dispatch(ConfigActions.saveConfigToLocalStorage());
  }

  // Load config from localStorage
  loadConfigFromLocalStorage(): void {
    this.store.dispatch(ConfigActions.loadConfigFromLocalStorage());
  }

  // Reset to defaults
  resetToDefaults(): void {
    this.store.dispatch(ConfigActions.resetToDefaults());
    localStorage.removeItem('idle-config');
    console.log('🔄 Reset to default configuration');
  }
}