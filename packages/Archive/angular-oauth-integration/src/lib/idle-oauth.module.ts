import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { IdleOAuthConfig } from './types';
import { idleReducer } from './store/idle.reducer';
import { IdleEffects } from './store/idle.effects';
import { IDLE_FEATURE_KEY } from './store/idle.state';
import { IdleOAuthService } from './idle-oauth.service';
import { IdleWarningDialogComponent } from './idle-warning-dialog.component';
import { IDLE_OAUTH_CONFIG } from './providers';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    StoreModule.forFeature(IDLE_FEATURE_KEY, idleReducer),
    EffectsModule.forFeature([IdleEffects]),
    IdleWarningDialogComponent
  ],
  exports: [
    IdleWarningDialogComponent
  ],
  providers: [
    IdleOAuthService
  ]
})
export class IdleOAuthModule {
  static forRoot(config: IdleOAuthConfig): ModuleWithProviders<IdleOAuthModule> {
    return {
      ngModule: IdleOAuthModule,
      providers: [
        {
          provide: IDLE_OAUTH_CONFIG,
          useValue: config
        },
        IdleOAuthService
      ]
    };
  }
}