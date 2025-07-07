import { createAction, props } from '@ngrx/store';
import { AngularIdleOAuthConfig } from '@idle-detection/angular-oauth-integration';

export const loadConfig = createAction('[Config] Load Config');

export const loadConfigSuccess = createAction(
  '[Config] Load Config Success',
  props<{ config: AngularIdleOAuthConfig }>()
);

export const loadConfigFailure = createAction(
  '[Config] Load Config Failure',
  props<{ error: any }>()
);

export const updateConfig = createAction(
  '[Config] Update Config',
  props<{ config: Partial<AngularIdleOAuthConfig> }>()
);

export const applyTimeoutPreset = createAction(
  '[Config] Apply Timeout Preset',
  props<{ presetName: string; preset: { idleTimeout: number; warningTimeout: number } }>()
);

export const resetToDefaults = createAction('[Config] Reset To Defaults');

export const saveConfigToLocalStorage = createAction('[Config] Save Config To LocalStorage');

export const loadConfigFromLocalStorage = createAction('[Config] Load Config From LocalStorage');