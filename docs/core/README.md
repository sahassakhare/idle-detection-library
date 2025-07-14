# Core Idle Detection Library

A framework-agnostic JavaScript library for detecting user inactivity and managing idle states in web applications.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Events](#events)
- [Examples](#examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The Core Idle Detection Library provides a robust foundation for monitoring user activity across any JavaScript application. It tracks mouse movements, keyboard inputs, touch events, and other user interactions to determine when a user becomes idle.

### Key Benefits

- **Framework Agnostic**: Works with vanilla JavaScript, React, Vue, Angular, or any web framework
- **Lightweight**: Minimal footprint with no external dependencies
- **Configurable**: Extensive customization options for timeouts, events, and behaviors
- **Event-Driven**: Clean event-based architecture for easy integration
- **Multi-Tab Support**: Coordinate idle detection across browser tabs
- **TypeScript Support**: Full TypeScript definitions included

## Features

- ✅ **Activity Detection**: Mouse, keyboard, touch, scroll, and focus events
- ✅ **Configurable Timeouts**: Separate idle and warning timeouts
- ✅ **Event System**: Comprehensive event lifecycle management
- ✅ **Multi-Tab Coordination**: Share idle state across browser tabs
- ✅ **Interrupt Handling**: Graceful interruption and resumption
- ✅ **Debug Logging**: Built-in logging for troubleshooting
- ✅ **Performance Optimized**: Efficient event handling with minimal overhead

## Installation

### NPM

```bash
npm install @idle-detection/core
```

### Yarn

```bash
yarn add @idle-detection/core
```

### CDN

```html
<script src="https://unpkg.com/@idle-detection/core@latest/dist/index.js"></script>
```

## Quick Start

### Basic Usage

```javascript
import { IdleManager } from '@idle-detection/core';

// Create idle manager instance
const idleManager = new IdleManager();

// Configure timeouts
idleManager.setIdleTimeout(300000);    // 5 minutes
idleManager.setWarningTimeout(60000);  // 1 minute warning

// Set up event listeners
idleManager.on('idle-start', () => {
  console.log('User became idle');
  // Show warning dialog
});

idleManager.on('timeout', () => {
  console.log('User timed out');
  // Perform logout or other action
});

idleManager.on('idle-end', () => {
  console.log('User returned');
  // Hide warning dialog
});

// Start monitoring
idleManager.watch();
```

### With Warning System

```javascript
import { IdleManager, IdleEvent } from '@idle-detection/core';

const idleManager = new IdleManager({
  idleTimeout: 600000,     // 10 minutes until idle
  warningTimeout: 120000,  // 2 minute warning
  checkInterval: 1000,     // Check every second
  events: ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']
});

let warningTimer;

idleManager.on(IdleEvent.IDLE_START, () => {
  // Show warning dialog
  showWarningDialog();
  
  // Start countdown
  let timeLeft = 120; // 2 minutes
  warningTimer = setInterval(() => {
    updateWarningDialog(timeLeft--);
    if (timeLeft <= 0) {
      clearInterval(warningTimer);
    }
  }, 1000);
});

idleManager.on(IdleEvent.TIMEOUT, () => {
  // User didn't respond to warning
  logout();
});

idleManager.on(IdleEvent.IDLE_END, () => {
  // User came back
  hideWarningDialog();
  if (warningTimer) {
    clearInterval(warningTimer);
  }
});

// Start monitoring
idleManager.watch();
```

## API Reference

### IdleManager Class

#### Constructor

```javascript
new IdleManager(options?: IdleOptions)
```

#### Methods

##### Core Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `watch()` | Start idle detection | None | `void` |
| `stop()` | Stop idle detection | None | `void` |
| `reset()` | Reset idle timer | None | `void` |
| `isRunning()` | Check if monitoring is active | None | `boolean` |
| `getLastActivity()` | Get last activity timestamp | None | `number` |

##### Configuration Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `setIdleTimeout(ms)` | Set idle timeout | `ms: number` | `void` |
| `setWarningTimeout(ms)` | Set warning timeout | `ms: number` | `void` |
| `setCheckInterval(ms)` | Set check interval | `ms: number` | `void` |
| `setEvents(events)` | Set monitored events | `events: string[]` | `void` |

##### Event Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `on(event, handler)` | Add event listener | `event: string, handler: Function` | `void` |
| `off(event, handler?)` | Remove event listener | `event: string, handler?: Function` | `void` |
| `emit(event, data?)` | Emit custom event | `event: string, data?: any` | `void` |

##### Multi-Tab Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `enableMultiTab()` | Enable multi-tab coordination | None | `void` |
| `disableMultiTab()` | Disable multi-tab coordination | None | `void` |
| `isMultiTabEnabled()` | Check multi-tab status | None | `boolean` |

### IdleOptions Interface

```typescript
interface IdleOptions {
  idleTimeout?: number;        // Time until user is considered idle (default: 600000ms)
  warningTimeout?: number;     // Warning period before timeout (default: 60000ms) 
  checkInterval?: number;      // How often to check activity (default: 1000ms)
  events?: string[];          // Events to monitor (default: mouse, keyboard, touch)
  element?: HTMLElement;      // Element to monitor (default: document)
  multiTab?: boolean;         // Enable multi-tab coordination (default: false)
  debug?: boolean;           // Enable debug logging (default: false)
}
```

## Configuration

### Timeout Settings

```javascript
const idleManager = new IdleManager({
  idleTimeout: 900000,    // 15 minutes
  warningTimeout: 300000, // 5 minute warning
  checkInterval: 5000     // Check every 5 seconds
});
```

### Custom Events

```javascript
const idleManager = new IdleManager({
  events: [
    'mousedown',
    'mousemove', 
    'keydown',
    'scroll',
    'touchstart',
    'click',
    'focus'
  ]
});
```

### Element-Specific Monitoring

```javascript
const targetElement = document.getElementById('app');

const idleManager = new IdleManager({
  element: targetElement,
  events: ['click', 'keydown']
});
```

### Multi-Tab Coordination

```javascript
const idleManager = new IdleManager({
  multiTab: true  // Coordinate across browser tabs
});

// Or enable later
idleManager.enableMultiTab();
```

## Events

### Core Events

| Event | Description | Data |
|-------|-------------|------|
| `idle-start` | User became idle | `{ timestamp: number }` |
| `idle-end` | User returned from idle | `{ timestamp: number }` |
| `timeout` | Warning period expired | `{ timestamp: number }` |
| `interrupt` | Activity detected during warning | `{ timestamp: number }` |
| `activity` | Any user activity detected | `{ timestamp: number, event: string }` |

### Multi-Tab Events

| Event | Description | Data |
|-------|-------------|------|
| `tab-idle` | Another tab became idle | `{ tabId: string, timestamp: number }` |
| `tab-active` | Another tab became active | `{ tabId: string, timestamp: number }` |
| `tab-sync` | Sync state with other tabs | `{ state: object }` |

### Lifecycle Events

| Event | Description | Data |
|-------|-------------|------|
| `start` | Monitoring started | `{ timestamp: number }` |
| `stop` | Monitoring stopped | `{ timestamp: number }` |
| `reset` | Timer reset | `{ timestamp: number }` |
| `error` | Error occurred | `{ error: Error }` |

## Examples

### React Integration

```jsx
import React, { useEffect, useState } from 'react';
import { IdleManager } from '@idle-detection/core';

function App() {
  const [isIdle, setIsIdle] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const idleManager = new IdleManager({
      idleTimeout: 600000,    // 10 minutes
      warningTimeout: 120000  // 2 minutes
    });

    idleManager.on('idle-start', () => {
      setShowWarning(true);
    });

    idleManager.on('timeout', () => {
      setIsIdle(true);
      // Perform logout
    });

    idleManager.on('idle-end', () => {
      setShowWarning(false);
      setIsIdle(false);
    });

    idleManager.watch();

    return () => {
      idleManager.stop();
    };
  }, []);

  if (isIdle) {
    return <div>Session expired. Please log in again.</div>;
  }

  return (
    <div>
      <h1>My App</h1>
      {showWarning && (
        <div className="warning-dialog">
          Your session will expire soon due to inactivity.
          <button onClick={() => window.location.reload()}>
            Stay Logged In
          </button>
        </div>
      )}
    </div>
  );
}
```

### Vue.js Integration

```vue
<template>
  <div>
    <h1>My App</h1>
    <div v-if="showWarning" class="warning-dialog">
      Your session will expire in {{ timeLeft }} seconds.
      <button @click="extendSession">Continue</button>
    </div>
  </div>
</template>

<script>
import { IdleManager } from '@idle-detection/core';

export default {
  data() {
    return {
      showWarning: false,
      timeLeft: 0,
      idleManager: null,
      warningTimer: null
    };
  },
  
  mounted() {
    this.idleManager = new IdleManager({
      idleTimeout: 600000,
      warningTimeout: 120000
    });

    this.idleManager.on('idle-start', () => {
      this.showWarning = true;
      this.timeLeft = 120;
      this.startCountdown();
    });

    this.idleManager.on('timeout', () => {
      this.$router.push('/login');
    });

    this.idleManager.on('idle-end', () => {
      this.showWarning = false;
      if (this.warningTimer) {
        clearInterval(this.warningTimer);
      }
    });

    this.idleManager.watch();
  },

  beforeDestroy() {
    if (this.idleManager) {
      this.idleManager.stop();
    }
    if (this.warningTimer) {
      clearInterval(this.warningTimer);
    }
  },

  methods: {
    startCountdown() {
      this.warningTimer = setInterval(() => {
        this.timeLeft--;
        if (this.timeLeft <= 0) {
          clearInterval(this.warningTimer);
        }
      }, 1000);
    },

    extendSession() {
      this.idleManager.reset();
    }
  }
};
</script>
```

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>Idle Detection Example</title>
</head>
<body>
  <div id="app">
    <h1>My Application</h1>
    <div id="status">Active</div>
  </div>

  <div id="warning-dialog" style="display: none;">
    <h2>Session Warning</h2>
    <p>Your session will expire in <span id="countdown">120</span> seconds.</p>
    <button onclick="extendSession()">Stay Logged In</button>
    <button onclick="logout()">Logout</button>
  </div>

  <script src="https://unpkg.com/@idle-detection/core@latest/dist/index.js"></script>
  <script>
    const { IdleManager } = IdleDetectionCore;
    
    const idleManager = new IdleManager({
      idleTimeout: 300000,   // 5 minutes
      warningTimeout: 120000 // 2 minutes
    });

    const statusEl = document.getElementById('status');
    const warningEl = document.getElementById('warning-dialog');
    const countdownEl = document.getElementById('countdown');
    
    let warningTimer;

    idleManager.on('idle-start', () => {
      statusEl.textContent = 'Warning - Session Expiring';
      warningEl.style.display = 'block';
      
      let timeLeft = 120;
      countdownEl.textContent = timeLeft;
      
      warningTimer = setInterval(() => {
        timeLeft--;
        countdownEl.textContent = timeLeft;
        if (timeLeft <= 0) {
          clearInterval(warningTimer);
        }
      }, 1000);
    });

    idleManager.on('timeout', () => {
      logout();
    });

    idleManager.on('idle-end', () => {
      statusEl.textContent = 'Active';
      warningEl.style.display = 'none';
      if (warningTimer) {
        clearInterval(warningTimer);
      }
    });

    idleManager.on('activity', (data) => {
      console.log('Activity detected:', data.event);
    });

    function extendSession() {
      idleManager.reset();
    }

    function logout() {
      alert('Session expired!');
      window.location.href = '/login';
    }

    // Start monitoring
    idleManager.watch();
  </script>
</body>
</html>
```

## Best Practices

### 1. Timeout Configuration

```javascript
// Recommended timeout hierarchy
const idleManager = new IdleManager({
  idleTimeout: 1800000,   // 30 minutes (main session)
  warningTimeout: 300000  // 5 minutes (warning period)
});

// Warning should be 10-25% of idle timeout
// This gives users adequate time to respond
```

### 2. Event Selection

```javascript
// Minimal events for better performance
const lightweightEvents = ['mousedown', 'keydown', 'touchstart'];

// Comprehensive events for thorough detection
const comprehensiveEvents = [
  'mousedown', 'mousemove', 'mouseup',
  'keydown', 'keyup', 'keypress',
  'touchstart', 'touchmove', 'touchend',
  'scroll', 'wheel', 'focus', 'blur'
];

const idleManager = new IdleManager({
  events: lightweightEvents // Choose based on your needs
});
```

### 3. Multi-Tab Coordination

```javascript
// Enable for web applications with multiple tabs
const idleManager = new IdleManager({
  multiTab: true,
  idleTimeout: 900000  // 15 minutes shared across tabs
});

// Listen for cross-tab events
idleManager.on('tab-idle', (data) => {
  console.log(`Tab ${data.tabId} became idle`);
});
```

### 4. Error Handling

```javascript
const idleManager = new IdleManager();

idleManager.on('error', (error) => {
  console.error('Idle detection error:', error);
  // Implement fallback behavior
  setTimeout(() => {
    idleManager.watch(); // Restart monitoring
  }, 5000);
});

// Graceful cleanup
window.addEventListener('beforeunload', () => {
  idleManager.stop();
});
```

### 5. Performance Optimization

```javascript
// Optimize check interval based on requirements
const idleManager = new IdleManager({
  checkInterval: 5000,  // Check every 5 seconds instead of 1
  events: ['mousedown', 'keydown'], // Minimal events
  debug: false // Disable debug in production
});

// Use throttling for high-frequency events
import { throttle } from 'lodash';

const throttledReset = throttle(() => {
  idleManager.reset();
}, 1000);

document.addEventListener('mousemove', throttledReset);
```

## Troubleshooting

### Common Issues

#### 1. Events Not Detected

**Problem**: User activity not being detected

**Solutions**:
```javascript
// Check if events are properly configured
const idleManager = new IdleManager({
  events: ['mousedown', 'keydown', 'touchstart'],
  debug: true // Enable debug logging
});

// Verify element scope
const idleManager = new IdleManager({
  element: document.body, // Make sure element exists
  events: ['click']
});
```

#### 2. Multiple Timers Running

**Problem**: Multiple idle managers causing conflicts

**Solutions**:
```javascript
// Ensure single instance
let globalIdleManager;

function getIdleManager() {
  if (!globalIdleManager) {
    globalIdleManager = new IdleManager();
  }
  return globalIdleManager;
}

// Proper cleanup
function cleanup() {
  if (globalIdleManager) {
    globalIdleManager.stop();
    globalIdleManager = null;
  }
}
```

#### 3. Multi-Tab Not Working

**Problem**: Multi-tab coordination failing

**Solutions**:
```javascript
// Check browser support
if ('BroadcastChannel' in window) {
  const idleManager = new IdleManager({ multiTab: true });
} else {
  console.warn('Multi-tab not supported in this browser');
  const idleManager = new IdleManager({ multiTab: false });
}

// Debug multi-tab messages
const idleManager = new IdleManager({ 
  multiTab: true,
  debug: true 
});

idleManager.on('tab-sync', (data) => {
  console.log('Tab sync:', data);
});
```

#### 4. Memory Leaks

**Problem**: Memory leaks from event listeners

**Solutions**:
```javascript
// Proper cleanup in SPA frameworks
useEffect(() => {
  const idleManager = new IdleManager();
  idleManager.watch();

  return () => {
    idleManager.stop(); // Always cleanup
  };
}, []);

// Remove specific listeners
idleManager.off('idle-start', specificHandler);

// Remove all listeners for an event
idleManager.off('idle-start');
```

### Debug Mode

Enable debug mode for troubleshooting:

```javascript
const idleManager = new IdleManager({
  debug: true
});

// Console output will show:
// - Event detections
// - Timer state changes
// - Multi-tab messages
// - Error details
```

### Browser Compatibility

- **Modern Browsers**: Full support (Chrome 60+, Firefox 55+, Safari 12+)
- **Internet Explorer**: Partial support (IE 11+ with polyfills)
- **Mobile Browsers**: Full support with touch events

### Required Polyfills for IE11

```html
<!-- For Promise support -->
<script src="https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.auto.min.js"></script>

<!-- For Object.assign support -->
<script src="https://cdn.jsdelivr.net/npm/object-assign-polyfill@latest/dist/object-assign-polyfill.min.js"></script>
```

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues: [https://github.com/your-repo/idle-detection-core/issues](https://github.com/your-repo/idle-detection-core/issues)
- Documentation: [https://idle-detection.dev/core](https://idle-detection.dev/core)
- Examples: [https://github.com/your-repo/idle-detection-examples](https://github.com/your-repo/idle-detection-examples)