export const environment = {
  production: true,
  auth: {
    // Production provider configuration
    provider: 'auth0' as 'auth0' | 'google' | 'microsoft' | 'demo',
    
    // Auth0 Production Configuration
    auth0: {
      authority: 'https://your-production-domain.auth0.com',  // Replace with your production Auth0 domain
      clientId: 'your-production-auth0-client-id',           // Replace with your production Auth0 client ID
      redirectUrl: 'https://yourapp.com/callback',
      postLogoutRedirectUri: 'https://yourapp.com',
      scope: 'openid profile email offline_access',
      responseType: 'code',
      silentRenew: true,
      useRefreshToken: true,
      renewTimeBeforeTokenExpiresInSeconds: 60,
      autoUserInfo: true
    },

    // Google Production Configuration
    google: {
      authority: 'https://accounts.google.com',
      clientId: 'your-production-google-client-id.apps.googleusercontent.com',
      redirectUrl: 'https://yourapp.com/callback',
      postLogoutRedirectUri: 'https://yourapp.com',
      scope: 'openid profile email',
      responseType: 'code',
      silentRenew: true,
      useRefreshToken: true,
      renewTimeBeforeTokenExpiresInSeconds: 60,
      autoUserInfo: true,
      strictDiscoveryDocumentValidation: false
    },

    // Microsoft Production Configuration
    microsoft: {
      authority: 'https://login.microsoftonline.com/your-tenant-id/v2.0',  // Replace with your tenant ID
      clientId: 'your-production-azure-client-id',
      redirectUrl: 'https://yourapp.com/callback',
      postLogoutRedirectUri: 'https://yourapp.com',
      scope: 'openid profile email User.Read',
      responseType: 'code',
      silentRenew: true,
      useRefreshToken: true,
      renewTimeBeforeTokenExpiresInSeconds: 60,
      autoUserInfo: true,
      strictDiscoveryDocumentValidation: false
    },

    // Demo configuration should not be used in production
    demo: {
      authority: 'https://demo.duendesoftware.com',
      clientId: 'interactive.confidential',
      redirectUrl: 'https://yourapp.com/callback',
      postLogoutRedirectUri: 'https://yourapp.com',
      scope: 'openid profile email api offline_access',
      responseType: 'code',
      silentRenew: false,
      useRefreshToken: false,
      autoUserInfo: false,
      ignoreNonceAfterRefresh: true,
      customParamsAuthRequest: {},
      customParamsRefreshTokenRequest: {},
      customParamsEndSessionRequest: {},
      renewTimeBeforeTokenExpiresInSeconds: 30
    }
  }
};