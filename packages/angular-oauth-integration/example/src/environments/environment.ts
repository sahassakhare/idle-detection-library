export const environment = {
  production: false,
  auth: {
    // Change this to switch between providers: 'auth0', 'google', 'microsoft', 'demo'
    provider: 'demo' as 'auth0' | 'google' | 'microsoft' | 'demo',
    
    // Auth0 Configuration (Free Tier)
    auth0: {
      authority: 'https://dev-example.us.auth0.com',  // Replace with your Auth0 domain
      clientId: 'your-auth0-client-id',               // Replace with your Auth0 client ID
      redirectUrl: window.location.origin + '/callback',
      postLogoutRedirectUri: window.location.origin,
      scope: 'openid profile email offline_access',
      responseType: 'code',
      silentRenew: true,
      useRefreshToken: true,
      renewTimeBeforeTokenExpiresInSeconds: 60,
      autoUserInfo: true
    },

    // Google OAuth Configuration (Free)
    google: {
      authority: 'https://accounts.google.com',
      clientId: 'your-google-client-id.apps.googleusercontent.com',  // Replace with your Google client ID
      redirectUrl: window.location.origin + '/callback',
      postLogoutRedirectUri: window.location.origin,
      scope: 'openid profile email',
      responseType: 'code',
      silentRenew: true,
      useRefreshToken: true,
      renewTimeBeforeTokenExpiresInSeconds: 60,
      autoUserInfo: true,
      strictDiscoveryDocumentValidation: false
    },

    // Microsoft Azure AD Configuration (Free)
    microsoft: {
      authority: 'https://login.microsoftonline.com/common/v2.0',  // For multi-tenant, or use your tenant ID
      clientId: 'your-azure-client-id',                           // Replace with your Azure App Registration client ID
      redirectUrl: window.location.origin + '/callback',
      postLogoutRedirectUri: window.location.origin,
      scope: 'openid profile email User.Read',
      responseType: 'code',
      silentRenew: true,
      useRefreshToken: true,
      renewTimeBeforeTokenExpiresInSeconds: 60,
      autoUserInfo: true,
      strictDiscoveryDocumentValidation: false
    },

    // Demo/Test Configuration (Duende IdentityServer)
    demo: {
      authority: 'https://demo.duendesoftware.com',
      clientId: 'interactive.confidential',
      redirectUrl: window.location.origin + '/callback',
      postLogoutRedirectUri: window.location.origin,
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