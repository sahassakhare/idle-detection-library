import { NgModule, ModuleWithProviders, Provider } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { IdleWarningDialogComponent } from './idle-warning-dialog.component';
import { IdleOAuthService } from './idle-oauth.service';
import { IDLE_OAUTH_CONFIG, AngularIdleOAuthConfig } from './types';
import { idleReducer } from './store/idle.reducer';
import { IdleEffects } from './store/idle.effects';

// Standalone providers function for Angular 18+
export function provideIdleOAuth(config?: AngularIdleOAuthConfig): Provider[] {
  return [
    IdleOAuthService,
    {
      provide: IDLE_OAUTH_CONFIG,
      useValue: config
    }
  ];
}

// Standalone providers function for NgRx store setup
export function provideIdleOAuthStore(): (Provider | any)[] {
  return [
    ...(StoreModule.forFeature('idle', idleReducer).providers || []),
    ...(EffectsModule.forFeature([IdleEffects]).providers || [])
  ];
}

@NgModule({
  imports: [
    CommonModule,
    IdleWarningDialogComponent,
    StoreModule.forFeature('idle', idleReducer),
    EffectsModule.forFeature([IdleEffects])
  ],
  exports: [
    IdleWarningDialogComponent
  ]
})
export class IdleOAuthModule {
  static forRoot(config?: AngularIdleOAuthConfig): ModuleWithProviders<IdleOAuthModule> {
    return {
      ngModule: IdleOAuthModule,
      providers: [
        ...provideIdleOAuth(config),
        ...provideIdleOAuthStore()
      ]
    };
  }
}