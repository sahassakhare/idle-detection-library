# OAuth Providers Setup Guide

This guide explains how to set up real-world OAuth providers for testing the Angular OAuth Integration example.

## Quick Start (Demo Mode)

The application is pre-configured to work with Duende IdentityServer demo:
```typescript
// In environment.ts, set:
provider: 'demo'
```

**Demo Credentials:**
- Username: `alice` / Password: `alice`
- Username: `bob` / Password: `bob`

## Real-World Providers Setup

### 1. Auth0 (Recommended - Free Tier Available)

#### Setup Steps:
1. **Create Auth0 Account:**
   - Go to [auth0.com](https://auth0.com)
   - Sign up for free tier (7,000 MAUs included)

2. **Create Application:**
   - Dashboard → Applications → Create Application
   - Choose "Single Page Web Applications"
   - Select "Angular"

3. **Configure Application:**
   ```
   Allowed Callback URLs: http://localhost:4200/callback
   Allowed Logout URLs: http://localhost:4200
   Allowed Web Origins: http://localhost:4200
   Allowed Origins (CORS): http://localhost:4200
   ```

4. **Update Environment:**
   ```typescript
   // In environment.ts:
   auth: {
     provider: 'auth0',
     auth0: {
       authority: 'https://YOUR_DOMAIN.us.auth0.com',  // From Auth0 Dashboard
       clientId: 'YOUR_CLIENT_ID',                     // From Auth0 Dashboard
       // ... rest stays the same
     }
   }
   ```

#### Testing:
- Users can sign up directly or use social login
- Full user management through Auth0 dashboard
- Support for MFA, social connections, etc.

---

### 2. Google OAuth (Free)

#### Setup Steps:
1. **Create Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project or select existing

2. **Enable APIs:**
   - APIs & Services → Enable APIs and Services
   - Enable "Google+ API" and "Google Identity"

3. **Create OAuth Client:**
   - APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:4200`
   - Authorized redirect URIs: `http://localhost:4200/callback`

4. **Update Environment:**
   ```typescript
   // In environment.ts:
   auth: {
     provider: 'google',
     google: {
       clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
       // ... rest stays the same
     }
   }
   ```

#### Testing:
- Users can login with any Google account
- Access to basic profile information
- Free for up to 100 requests/second

---

### 3. Microsoft Azure AD (Free)

#### Setup Steps:
1. **Create Azure Account:**
   - Go to [Azure Portal](https://portal.azure.com)
   - Sign up for free tier

2. **Register Application:**
   - Azure Active Directory → App registrations → New registration
   - Name: "Angular OAuth Example"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: Web → `http://localhost:4200/callback`

3. **Configure Authentication:**
   - Authentication → Add platform → Single-page application
   - Redirect URIs: `http://localhost:4200/callback`
   - Logout URL: `http://localhost:4200`

4. **Update Environment:**
   ```typescript
   // In environment.ts:
   auth: {
     provider: 'microsoft',
     microsoft: {
       authority: 'https://login.microsoftonline.com/common/v2.0', // For multi-tenant
       clientId: 'YOUR_AZURE_CLIENT_ID',                          // From App Registration
       // ... rest stays the same
     }
   }
   ```

#### Testing:
- Users can login with Microsoft personal or work accounts
- Access to Microsoft Graph API
- Free tier includes 5GB storage, basic features

---

## Switching Between Providers

Simply change the provider in `environment.ts`:

```typescript
export const environment = {
  production: false,
  auth: {
    provider: 'auth0' // Change to: 'auth0', 'google', 'microsoft', or 'demo'
  }
}
```

## Adding Callback Route

Make sure your Angular routes include a callback handler:

```typescript
// In app.routes.ts - already configured
const routes: Routes = [
  { path: 'callback', component: CallbackComponent }, // Handles OAuth callback
  // ... other routes
];
```

## Testing Checklist

For each provider, verify:
- [ ] Login redirects to provider
- [ ] User can authenticate
- [ ] Callback returns to application
- [ ] User profile data is displayed
- [ ] Token refresh works (if enabled)
- [ ] Logout clears session

## Common Issues

### CORS Errors
- Ensure your domain is whitelisted in provider settings
- Check redirect URIs match exactly

### Token Issues
- Verify scopes are correctly configured
- Check token expiration settings

### Callback Errors
- Ensure callback URL is registered with provider
- Check that callback route exists in Angular

## Security Notes

- Never commit real client secrets to git
- Use environment variables in production
- Enable HTTPS in production
- Configure appropriate CORS policies
- Use secure token storage

## Cost Considerations

All providers offer generous free tiers:
- **Auth0**: 7,000 MAUs free
- **Google**: 100 requests/second free
- **Microsoft**: Free tier with basic features
- **Demo**: Completely free (testing only)

Choose based on your specific needs and integration requirements.