# Idle Detection Library Documentation

Welcome to the comprehensive documentation for the Idle Detection Library ecosystem.

## Documentation Structure

This documentation is organized into two main sections:

### 📁 [Core Library Documentation](./core/)
Framework-agnostic JavaScript library for idle detection.

- **[Core README](./core/README.md)** - Complete guide with examples and best practices
- **[Core API Reference](./core/API.md)** - Detailed API documentation

### 📁 [Angular Integration Documentation](./angular-integration/)
Angular-specific integration with OAuth support and NgRx state management.

- **[Angular README](./angular-integration/README.md)** - Complete Angular integration guide
- **[Angular API Reference](./angular-integration/API.md)** - Detailed Angular API documentation

## Quick Navigation

### Getting Started
- [Core Library Quick Start](./core/README.md#quick-start)
- [Angular Integration Quick Start](./angular-integration/README.md#quick-start)

### Key Features
- **Framework Agnostic**: Works with any JavaScript framework
- **Angular Native**: Full Angular integration with standalone components
- **OAuth Integration**: Automatic token refresh and session management
- **NgRx Support**: Reactive state management
- **Multi-Tab Coordination**: Synchronized state across browser tabs
- **Customizable UI**: Themeable warning dialogs
- **TypeScript**: Full type safety and IntelliSense support

### Examples by Framework

#### Vanilla JavaScript
```javascript
import { IdleManager } from '@idle-detection/core';

const idleManager = new IdleManager({
  idleTimeout: 600000,
  warningTimeout: 60000
});

idleManager.on('idle-start', () => {
  console.log('User became idle');
});

idleManager.watch();
```

#### Angular
```typescript
import { IdleOAuthService } from '@idle-detection/angular-oauth-integration';

@Component({...})
export class AppComponent {
  constructor(private idleService: IdleOAuthService) {}
  
  ngOnInit(): void {
    this.idleService.initialize({
      idleTimeout: 1800000,
      warningTimeout: 300000
    });
    this.idleService.start();
  }
}
```

#### React
```jsx
import { useEffect } from 'react';
import { IdleManager } from '@idle-detection/core';

function App() {
  useEffect(() => {
    const idleManager = new IdleManager({
      idleTimeout: 600000,
      warningTimeout: 60000
    });
    
    idleManager.watch();
    return () => idleManager.stop();
  }, []);
  
  return <div>My App</div>;
}
```

#### Vue.js
```vue
<template>
  <div>My App</div>
</template>

<script>
import { IdleManager } from '@idle-detection/core';

export default {
  mounted() {
    this.idleManager = new IdleManager({
      idleTimeout: 600000,
      warningTimeout: 60000
    });
    this.idleManager.watch();
  },
  
  beforeDestroy() {
    if (this.idleManager) {
      this.idleManager.stop();
    }
  }
};
</script>
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Angular Integration    │  React Hook    │  Vue Plugin     │
│  - IdleOAuthService     │  - useIdle     │  - IdlePlugin   │
│  - Warning Dialog       │  - Components  │  - Composables  │
│  - NgRx Integration     │                │                 │
├─────────────────────────────────────────────────────────────┤
│                     Core Library                            │
│  - IdleManager (Framework Agnostic)                        │
│  - Event System                                            │
│  - Multi-Tab Coordination                                  │
│  - Activity Detection                                      │
└─────────────────────────────────────────────────────────────┘
```

## Installation

### Core Library Only
```bash
npm install @idle-detection/core
```

### Angular Integration
```bash
npm install @idle-detection/angular-oauth-integration
npm install @ngrx/store @ngrx/effects angular-auth-oidc-client
```

## Key Concepts

### Idle Detection Flow
1. **Active State** - User is actively interacting
2. **Warning State** - User hasn't interacted for idle timeout
3. **Idle State** - Warning timeout has expired

### Multi-Tab Coordination
- Shares idle state across browser tabs
- Uses BroadcastChannel API for communication
- Coordinates session timeouts and extensions

### Event-Driven Architecture
- Clean separation of concerns
- Extensible event system
- Framework-agnostic core

## Common Use Cases

### Session Management
- Automatic logout after inactivity
- Session extension warnings
- Token refresh before expiry

### Security
- Prevent unauthorized access to idle sessions
- Lock screens after inactivity
- Clear sensitive data when idle

### User Experience
- Save drafts before idle logout
- Warn users before session expiry
- Preserve state across sessions

## Browser Support

### Core Library
- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+
- **Internet Explorer**: IE 11+ with polyfills
- **Mobile**: Full support with touch events

### Angular Integration
- **Angular**: 15+ (standalone components)
- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+
- **Mobile**: Full support

## Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Core Library**: Framework-agnostic improvements
2. **Angular Integration**: Angular-specific features
3. **Documentation**: Examples and guides
4. **Testing**: Unit tests and integration tests

## Support

### Community Support
- **GitHub Issues**: [Report bugs and feature requests](https://github.com/your-repo/idle-detection/issues)
- **Discussions**: [Community discussions and Q&A](https://github.com/your-repo/idle-detection/discussions)
- **Stack Overflow**: Tag `idle-detection`

### Commercial Support
- **Enterprise Support**: Available for enterprise customers
- **Custom Development**: Framework integrations and custom features
- **Training**: Team training and workshops

## License

MIT License - see [LICENSE](../LICENSE) file for details.

## Changelog

See [CHANGELOG.md](../CHANGELOG.md) for version history and breaking changes.

---

**Next Steps:**
- Choose your framework: [Core](./core/) or [Angular](./angular-integration/)
- Check out the [examples repository](https://github.com/your-repo/idle-detection-examples)
- Join our [community discussions](https://github.com/your-repo/idle-detection/discussions)