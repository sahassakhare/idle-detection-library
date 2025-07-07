import { AngularIdleOAuthConfig } from '@idle-detection/angular-oauth-integration';

export interface ConfigState {
  config: AngularIdleOAuthConfig | null;
  loading: boolean;
  error: any | null;
  environment: 'development' | 'production' | 'staging';
}

export const initialConfigState: ConfigState = {
  config: null,
  loading: false,
  error: null,
  environment: 'development'
};