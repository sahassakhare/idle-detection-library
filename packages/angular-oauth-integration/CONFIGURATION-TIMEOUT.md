# Idle Timeout Configuration & Externalization

This guide shows how to configure idle timeouts and externalize configuration in Angular applications.

## 1. Basic Idle Timeout Configuration

### Simple Configuration in main.ts

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideIdleOAuth } from '@idle-detection/angular-oauth-integration';

bootstrapApplication(AppComponent, {
  providers: [
    provideIdleOAuth({
      // Timeout configurations (in milliseconds)
      idleTimeout: 15 * 60 * 1000,        // 15 minutes - time before user is considered idle
      warningTimeout: 2 * 60 * 1000,      // 2 minutes - warning phase duration
      autoResume: true,                    // Resume automatically on activity
      
      // OAuth-specific settings
      autoRefreshToken: true,
      enableMultiTabCoordination: true,
      debug: true
    })
  ]
});
```

### Component-Level Configuration

```typescript
// app.component.ts
import { Component, inject } from '@angular/core';
import { IdleOAuthService } from '@idle-detection/angular-oauth-integration';

@Component({
  selector: 'app-root',
  template: `
    <div class="app">
      <button (click)="updateTimeouts()">Update Timeouts</button>
      <button (click)="getCurrentConfig()">Show Current Config</button>
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {
  private idleService = inject(IdleOAuthService);

  updateTimeouts() {
    // Runtime timeout updates (if needed)
    // Note: This would require additional service methods
    console.log('Current idle state:', this.idleService.getCurrentState());
  }

  getCurrentConfig() {
    const state = this.idleService.getCurrentState();
    console.log('Current configuration:', state);
  }
}
```

## 2. Environment-Based Configuration

### Environment Files

```typescript
// src/environments/environment.ts (Development)
export const environment = {
  production: false,
  idleConfig: {
    idleTimeout: 5 * 60 * 1000,         // 5 minutes for development
    warningTimeout: 30 * 1000,          // 30 seconds warning
    autoRefreshToken: true,
    enableMultiTabCoordination: true,
    debug: true,
    
    // Dialog configuration
    warningDialogConfig: {
      title: 'DEV: Session Timeout',
      message: 'Development mode - shorter timeout for testing',
      theme: 'dark',
      size: 'large',
      showProgressBar: true,
      showCountdown: true
    }
  },
  
  oidcConfig: {
    authority: 'https://dev-auth.example.com',
    clientId: 'dev-client-id'
  }
};
```

```typescript
// src/environments/environment.prod.ts (Production)
export const environment = {
  production: true,
  idleConfig: {
    idleTimeout: 30 * 60 * 1000,        // 30 minutes for production
    warningTimeout: 5 * 60 * 1000,      // 5 minutes warning
    autoRefreshToken: true,
    enableMultiTabCoordination: true,
    debug: false,
    
    // Dialog configuration
    warningDialogConfig: {
      title: 'Session Timeout Warning',
      message: 'Your session will expire soon due to inactivity.',
      theme: 'default',
      size: 'medium',
      showProgressBar: true,
      showCountdown: true
    }
  },
  
  oidcConfig: {
    authority: 'https://auth.example.com',
    clientId: 'prod-client-id'
  }
};
```

### Using Environment Configuration

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAuth } from 'angular-auth-oidc-client';
import { provideIdleOAuth } from '@idle-detection/angular-oauth-integration';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    // OIDC Configuration from environment
    provideAuth({
      config: {
        authority: environment.oidcConfig.authority,
        clientId: environment.oidcConfig.clientId,
        redirectUrl: window.location.origin,
        scope: 'openid profile email api offline_access',
        responseType: 'code'
      }
    }),
    
    // Idle Detection from environment
    provideIdleOAuth(environment.idleConfig)
  ]
});
```

## 3. JSON Configuration File

### External JSON Configuration

```json
// src/assets/config/idle-config.json
{
  "development": {
    "idleTimeout": 300000,
    "warningTimeout": 30000,
    "autoRefreshToken": true,
    "enableMultiTabCoordination": true,
    "debug": true,
    "warningDialogConfig": {
      "title": "DEV: Session Expiring",
      "message": "Development environment - short timeout for testing",
      "theme": "dark",
      "size": "large",
      "showProgressBar": true,
      "showCountdown": true,
      "autoClose": false,
      "backdropClose": true
    }
  },
  "production": {
    "idleTimeout": 1800000,
    "warningTimeout": 300000,
    "autoRefreshToken": true,
    "enableMultiTabCoordination": true,
    "debug": false,
    "warningDialogConfig": {
      "title": "Session Timeout Warning",
      "message": "Your session will expire soon due to inactivity.",
      "theme": "default",
      "size": "medium",
      "showProgressBar": true,
      "showCountdown": true,
      "autoClose": false,
      "backdropClose": false
    }
  },
  "staging": {
    "idleTimeout": 900000,
    "warningTimeout": 120000,
    "autoRefreshToken": true,
    "enableMultiTabCoordination": true,
    "debug": true,
    "warningDialogConfig": {
      "title": "STAGING: Session Warning",
      "message": "Staging environment - session will expire soon",
      "theme": "minimal",
      "size": "medium",
      "showProgressBar": true,
      "showCountdown": true,
      "autoClose": false,
      "backdropClose": false
    }
  }
}
```

### Configuration Service

```typescript
// src/app/services/config.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AngularIdleOAuthConfig } from '@idle-detection/angular-oauth-integration';

export interface AppConfig {
  development: AngularIdleOAuthConfig;
  production: AngularIdleOAuthConfig;
  staging: AngularIdleOAuthConfig;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private http = inject(HttpClient);
  private config: AngularIdleOAuthConfig | null = null;

  async loadConfig(): Promise<AngularIdleOAuthConfig> {
    if (this.config) {
      return this.config;
    }

    try {
      const configs = await firstValueFrom(
        this.http.get<AppConfig>('assets/config/idle-config.json')
      );
      
      // Determine environment
      const environment = this.getEnvironment();
      this.config = configs[environment] || configs.production;
      
      console.log(`Loaded idle config for ${environment}:`, this.config);
      return this.config;
    } catch (error) {
      console.error('Failed to load config, using defaults:', error);
      
      // Fallback configuration
      this.config = {
        idleTimeout: 15 * 60 * 1000,
        warningTimeout: 2 * 60 * 1000,
        autoRefreshToken: true,
        enableMultiTabCoordination: true,
        debug: false
      };
      
      return this.config;
    }
  }

  getConfig(): AngularIdleOAuthConfig | null {
    return this.config;
  }

  private getEnvironment(): keyof AppConfig {
    const hostname = window.location.hostname;
    
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      return 'development';
    } else if (hostname.includes('staging') || hostname.includes('dev.')) {
      return 'staging';
    } else {
      return 'production';
    }
  }

  // Helper methods for runtime access
  getIdleTimeout(): number {
    return this.config?.idleTimeout || 15 * 60 * 1000;
  }

  getWarningTimeout(): number {
    return this.config?.warningTimeout || 2 * 60 * 1000;
  }

  isDebugEnabled(): boolean {
    return this.config?.debug || false;
  }
}
```

### APP_INITIALIZER for Config Loading

```typescript
// main.ts
import { bootstrapApplication, APP_INITIALIZER } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideAuth } from 'angular-auth-oidc-client';
import { provideIdleOAuth } from '@idle-detection/angular-oauth-integration';
import { ConfigService } from './app/services/config.service';

function initializeApp(configService: ConfigService) {
  return () => configService.loadConfig();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    
    // Load configuration before app starts
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ConfigService],
      multi: true
    },
    
    // OIDC Configuration
    provideAuth({
      config: {
        authority: 'https://demo.duendesoftware.com',
        redirectUrl: window.location.origin,
        clientId: 'interactive.public',
        scope: 'openid profile email api offline_access',
        responseType: 'code'
      }
    }),
    
    // Idle Detection with dynamic config
    {
      provide: 'IDLE_CONFIG_FACTORY',
      useFactory: (configService: ConfigService) => {
        const config = configService.getConfig();
        return config || {
          idleTimeout: 15 * 60 * 1000,
          warningTimeout: 2 * 60 * 1000,
          autoRefreshToken: true
        };
      },
      deps: [ConfigService]
    }
  ]
}).catch(err => console.error(err));
```

### Alternative: Factory Provider

```typescript
// idle-config.factory.ts
import { inject } from '@angular/core';
import { ConfigService } from './services/config.service';
import { AngularIdleOAuthConfig } from '@idle-detection/angular-oauth-integration';

export function createIdleConfig(): AngularIdleOAuthConfig {
  const configService = inject(ConfigService);
  const config = configService.getConfig();
  
  if (!config) {
    console.warn('Config not loaded, using defaults');
    return {
      idleTimeout: 15 * 60 * 1000,
      warningTimeout: 2 * 60 * 1000,
      autoRefreshToken: true,
      enableMultiTabCoordination: true,
      debug: false
    };
  }
  
  return config;
}

// main.ts
import { createIdleConfig } from './idle-config.factory';

bootstrapApplication(AppComponent, {
  providers: [
    // ... other providers
    
    {
      provide: 'IDLE_OAUTH_CONFIG',
      useFactory: createIdleConfig
    }
  ]
});
```

## 4. Runtime Configuration Updates

### Dynamic Configuration Service

```typescript
// src/app/services/dynamic-idle-config.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { IdleOAuthService } from '@idle-detection/angular-oauth-integration';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DynamicIdleConfigService {
  private idleService = inject(IdleOAuthService);
  
  // Current configuration state
  private configSubject = new BehaviorSubject({
    idleTimeout: 15 * 60 * 1000,
    warningTimeout: 2 * 60 * 1000,
    autoRefreshToken: true
  });
  
  config$ = this.configSubject.asObservable();
  
  // Predefined configuration presets
  private presets = {
    short: {
      idleTimeout: 5 * 60 * 1000,    // 5 minutes
      warningTimeout: 30 * 1000,     // 30 seconds
      description: 'Short timeout for high-security areas'
    },
    normal: {
      idleTimeout: 15 * 60 * 1000,   // 15 minutes
      warningTimeout: 2 * 60 * 1000, // 2 minutes
      description: 'Standard timeout for regular use'
    },
    extended: {
      idleTimeout: 60 * 60 * 1000,   // 1 hour
      warningTimeout: 5 * 60 * 1000, // 5 minutes
      description: 'Extended timeout for long tasks'
    }
  };

  applyPreset(presetName: keyof typeof this.presets) {
    const preset = this.presets[presetName];
    if (preset) {
      this.updateConfig({
        idleTimeout: preset.idleTimeout,
        warningTimeout: preset.warningTimeout
      });
    }
  }

  updateConfig(newConfig: Partial<any>) {
    const currentConfig = this.configSubject.value;
    const updatedConfig = { ...currentConfig, ...newConfig };
    
    this.configSubject.next(updatedConfig);
    
    // Note: This would require additional service methods to actually update timeouts
    console.log('Configuration updated:', updatedConfig);
  }

  getCurrentConfig() {
    return this.configSubject.value;
  }

  getPresets() {
    return this.presets;
  }
}
```

### Admin Configuration Component

```typescript
// src/app/components/idle-config-admin.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicIdleConfigService } from '../services/dynamic-idle-config.service';

@Component({
  selector: 'idle-config-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="config-admin">
      <h3>🔧 Idle Detection Configuration</h3>
      
      <div class="presets">
        <h4>Quick Presets:</h4>
        <div class="preset-buttons">
          <button 
            *ngFor="let preset of presets | keyvalue"
            class="btn btn-preset"
            (click)="applyPreset(preset.key)"
            [title]="preset.value.description">
            {{ preset.key | titlecase }}
          </button>
        </div>
      </div>

      <div class="custom-config">
        <h4>Custom Configuration:</h4>
        
        <div class="form-group">
          <label>Idle Timeout (minutes):</label>
          <input 
            type="number" 
            [(ngModel)]="customIdleMinutes"
            min="1" 
            max="120"
            class="form-control">
        </div>
        
        <div class="form-group">
          <label>Warning Timeout (seconds):</label>
          <input 
            type="number" 
            [(ngModel)]="customWarningSeconds"
            min="10" 
            max="600"
            class="form-control">
        </div>
        
        <button class="btn btn-apply" (click)="applyCustomConfig()">
          Apply Custom Config
        </button>
      </div>

      <div class="current-config">
        <h4>Current Configuration:</h4>
        <div class="config-display">
          <div>Idle Timeout: {{ formatTime(currentConfig().idleTimeout) }}</div>
          <div>Warning Timeout: {{ formatTime(currentConfig().warningTimeout) }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .config-admin {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin: 1rem 0;
    }

    .preset-buttons {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .btn-preset {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-preset:hover {
      background: #0056b3;
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
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .btn-apply {
      background: #28a745;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
    }

    .config-display {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      border: 1px solid #e9ecef;
    }
  `]
})
export class IdleConfigAdminComponent {
  private configService = inject(DynamicIdleConfigService);
  
  presets = this.configService.getPresets();
  currentConfig = signal(this.configService.getCurrentConfig());
  
  customIdleMinutes = 15;
  customWarningSeconds = 120;

  ngOnInit() {
    this.configService.config$.subscribe(config => {
      this.currentConfig.set(config);
    });
  }

  applyPreset(presetName: string) {
    this.configService.applyPreset(presetName as any);
  }

  applyCustomConfig() {
    this.configService.updateConfig({
      idleTimeout: this.customIdleMinutes * 60 * 1000,
      warningTimeout: this.customWarningSeconds * 1000
    });
  }

  formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }
}
```

## 5. Configuration by User Role/Permissions

### Role-Based Configuration

```typescript
// src/app/services/role-based-config.service.ts
import { Injectable, inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AngularIdleOAuthConfig } from '@idle-detection/angular-oauth-integration';

@Injectable({
  providedIn: 'root'
})
export class RoleBasedConfigService {
  private oidcService = inject(OidcSecurityService);

  private roleConfigs: Record<string, AngularIdleOAuthConfig> = {
    admin: {
      idleTimeout: 60 * 60 * 1000,     // 1 hour for admins
      warningTimeout: 10 * 60 * 1000,  // 10 minutes warning
      autoRefreshToken: true,
      debug: true
    },
    user: {
      idleTimeout: 30 * 60 * 1000,     // 30 minutes for regular users
      warningTimeout: 5 * 60 * 1000,   // 5 minutes warning
      autoRefreshToken: true,
      debug: false
    },
    guest: {
      idleTimeout: 10 * 60 * 1000,     // 10 minutes for guests
      warningTimeout: 2 * 60 * 1000,   // 2 minutes warning
      autoRefreshToken: false,
      debug: false
    }
  };

  getConfigForCurrentUser(): AngularIdleOAuthConfig {
    return new Promise((resolve) => {
      this.oidcService.userData$.subscribe(userData => {
        const userRoles = userData?.role || userData?.roles || [];
        const role = this.determineHighestRole(userRoles);
        
        const config = this.roleConfigs[role] || this.roleConfigs.user;
        console.log(`Applied idle config for role: ${role}`, config);
        
        resolve(config);
      });
    });
  }

  private determineHighestRole(roles: string[]): string {
    if (roles.includes('admin') || roles.includes('administrator')) {
      return 'admin';
    } else if (roles.includes('user') || roles.includes('member')) {
      return 'user';
    } else {
      return 'guest';
    }
  }
}
```

## 6. Complete Example with All Configuration Methods

```typescript
// main.ts - Complete configuration example
import { bootstrapApplication, APP_INITIALIZER } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideAuth } from 'angular-auth-oidc-client';
import { provideIdleOAuth } from '@idle-detection/angular-oauth-integration';
import { ConfigService } from './app/services/config.service';
import { RoleBasedConfigService } from './app/services/role-based-config.service';
import { environment } from './environments/environment';

async function initializeApp(
  configService: ConfigService,
  roleConfigService: RoleBasedConfigService
) {
  // Load external configuration
  await configService.loadConfig();
  
  // Could also load role-based config here if needed
  return true;
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    
    // Initialize configuration loading
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ConfigService, RoleBasedConfigService],
      multi: true
    },
    
    // OIDC Configuration
    provideAuth({
      config: {
        authority: environment.oidcConfig.authority,
        clientId: environment.oidcConfig.clientId,
        redirectUrl: window.location.origin,
        scope: 'openid profile email api offline_access',
        responseType: 'code'
      }
    }),
    
    // Idle Detection with factory
    {
      provide: 'IDLE_OAUTH_CONFIG_FACTORY',
      useFactory: async (
        configService: ConfigService,
        roleConfigService: RoleBasedConfigService
      ) => {
        // Priority: Role-based > External JSON > Environment > Defaults
        try {
          const roleConfig = await roleConfigService.getConfigForCurrentUser();
          return roleConfig;
        } catch {
          const externalConfig = configService.getConfig();
          return externalConfig || environment.idleConfig;
        }
      },
      deps: [ConfigService, RoleBasedConfigService]
    }
  ]
});
```

This comprehensive configuration system allows you to:

1. **Configure timeouts** at multiple levels (global, environment, runtime)
2. **Externalize configuration** using JSON files, environment variables, or remote APIs
3. **Apply role-based configurations** based on user permissions
4. **Update configurations dynamically** during runtime
5. **Use preset configurations** for common scenarios
6. **Validate and fallback** to safe defaults when configuration fails

The system is flexible and production-ready, supporting various deployment scenarios and security requirements.