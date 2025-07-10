# Idle Detection Library

A comprehensive Angular library for detecting user inactivity and managing OAuth session timeouts with style-agnostic components.

## Features

- **Angular 18+ Support** - Modern standalone components with signals
- **OAuth Integration** - Seamless integration with `angular-auth-oidc-client` 
- **Style Agnostic** - Completely customizable CSS classes for any design system
- **Multi-tab Coordination** - Synchronized idle detection across browser tabs
- **Configurable Timeouts** - External JSON configuration support
- **Role-based Settings** - Different timeout values based on user roles
- **Accessibility Ready** - WCAG compliant with proper ARIA labels
- **TypeScript First** - Full type safety throughout

## Packages

This is a monorepo containing:

- **`@idle-detection/angular-oauth-integration`** - Main Angular library with OAuth integration
- **Example Applications** - Demonstration projects showing different integrations

## Quick Start

### Installation

```bash
npm install @idle-detection/angular-oauth-integration angular-auth-oidc-client
```

### Basic Usage

```typescript
// app.config.ts
import { provideIdleOAuthConfig } from '@idle-detection/angular-oauth-integration';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    provideIdleOAuthConfig({
      idleTimeout: 15 * 60 * 1000,    // 15 minutes
      warningTimeout: 2 * 60 * 1000,  // 2 minutes warning
      autoRefreshToken: true,
      multiTabCoordination: true
    })
  ]
};
```

```typescript
// app.component.ts
import { IdleOAuthService, IdleWarningDialogComponent } from '@idle-detection/angular-oauth-integration';

@Component({
  template: `
    <idle-warning-dialog 
      *ngIf="showWarning()"
      dialogTitle="Session Expiring"
      primaryButtonClass="btn btn-primary"
      secondaryButtonClass="btn btn-outline-secondary">
    </idle-warning-dialog>
  `,
  imports: [IdleWarningDialogComponent]
})
export class AppComponent {
  private idleService = inject(IdleOAuthService);
  showWarning = this.idleService.showWarning;
  
  ngOnInit() {
    this.idleService.startMonitoring();
  }
}
```

## Styling Options

### Option 1: Pre-built Themes

```scss
// Import default theme
@import '@idle-detection/angular-oauth-integration/styles/default-theme.css';

// Or minimal theme
@import '@idle-detection/angular-oauth-integration/styles/minimal-theme.css';

// Or dark theme
@import '@idle-detection/angular-oauth-integration/styles/dark-theme.css';
```

### Option 2: Framework Integration

#### Bootstrap
```html
<idle-warning-dialog
  dialogClass="modal-content"
  headerClass="modal-header"
  primaryButtonClass="btn btn-primary"
  secondaryButtonClass="btn btn-secondary">
</idle-warning-dialog>
```

#### Tailwind CSS
```html
<idle-warning-dialog
  backdropClass="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  dialogClass="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
  primaryButtonClass="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
</idle-warning-dialog>
```

### Option 3: Custom CSS
```scss
.my-idle-dialog {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.my-idle-btn {
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
}
```

## Configuration

### External JSON Configuration

```json
// assets/config/idle-config.json
{
  "development": {
    "idleTimeout": 120000,
    "warningTimeout": 30000,
    "autoRefreshToken": true
  },
  "production": {
    "idleTimeout": 1800000,
    "warningTimeout": 300000,
    "autoRefreshToken": true,
    "multiTabCoordination": true
  }
}
```

### Environment-based Configuration

```typescript
// environment.ts
export const environment = {
  idleConfig: {
    idleTimeout: 15 * 60 * 1000,
    warningTimeout: 2 * 60 * 1000,
    userRoles: {
      'admin': { idleTimeout: 60 * 60 * 1000 },
      'user': { idleTimeout: 30 * 60 * 1000 }
    }
  }
};
```

### Runtime Configuration Updates

```typescript
this.idleService.updateConfig({
  idleTimeout: 20 * 60 * 1000,
  warningTimeout: 5 * 60 * 1000
});
```

## Development

### Prerequisites

- Node.js 18+
- Angular CLI 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/idle-detection-library.git
cd idle-detection-library

# Install dependencies
npm install

# Build the library
npm run build

# Run example
cd packages/angular-oauth-integration/example
npm install
npm start
```

### Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run e2e

# Run linting
npm run lint
```

### Building

```bash
# Build all packages
npm run build

# Build specific package
npm run build:angular-oauth-integration
```

## Documentation

- [Configuration Guide](./packages/angular-oauth-integration/CONFIGURATION-TIMEOUT.md)
- [Styling Guide](./packages/angular-oauth-integration/STYLING.md)
- [API Reference](./docs/api.md)
- [Migration Guide](./docs/migration.md)

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Run the test suite: `npm test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

- [angular-auth-oidc-client](https://github.com/damienbod/angular-auth-oidc-client) for OAuth integration
- Angular team for the amazing framework
- Contributors and maintainers

## Support

- Email: support@idle-detection-library.com
- Issues: [GitHub Issues](https://github.com/your-username/idle-detection-library/issues)
- Discussions: [GitHub Discussions](https://github.com/your-username/idle-detection-library/discussions)

## Roadmap

- [ ] Vue.js integration package
- [ ] React integration package
- [ ] Web Components version
- [ ] SSR support improvements
- [ ] Advanced analytics integration
- [ ] Offline detection support

---

Made by the Idle Detection Library team