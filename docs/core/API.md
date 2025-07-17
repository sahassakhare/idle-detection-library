# Core Idle Detection Library - API Reference

## Table of Contents

- [IdleManager Class](#idlemanager-class)
- [Events Reference](#events-reference)
- [Types and Interfaces](#types-and-interfaces)
- [Constants](#constants)
- [Utilities](#utilities)

## IdleManager Class

### Constructor

```typescript
constructor(options?: IdleOptions)
```

Creates a new IdleManager instance with optional configuration.

**Parameters:**
- `options` (optional): Configuration object of type `IdleOptions`

**Example:**
```typescript
const idleManager = new IdleManager({
  idleTimeout: 600000,
  warningTimeout: 60000,
  events: ['mousedown', 'keydown']
});
```

### Properties

#### Public Properties

| Property | Type | Description | Read-only |
|----------|------|-------------|-----------|
| `isRunning` | `boolean` | Whether idle detection is currently active | Yes |
| `lastActivity` | `number` | Timestamp of last detected activity | Yes |
| `idleTimeout` | `number` | Current idle timeout in milliseconds | Yes |
| `warningTimeout` | `number` | Current warning timeout in milliseconds | Yes |

### Methods

#### Core Control Methods

##### `watch()`

Starts idle detection monitoring.

```typescript
watch(): void
```

**Example:**
```typescript
idleManager.watch();
console.log('Idle detection started');
```

**Events Emitted:**
- `start` - When monitoring begins

---

##### `stop()`

Stops idle detection monitoring.

```typescript
stop(): void
```

**Example:**
```typescript
idleManager.stop();
console.log('Idle detection stopped');
```

**Events Emitted:**
- `stop` - When monitoring ends

---

##### `reset()`

Resets the idle timer to zero.

```typescript
reset(): void
```

**Example:**
```typescript
// Reset timer on custom user action
document.getElementById('myButton').addEventListener('click', () => {
  idleManager.reset();
});
```

**Events Emitted:**
- `reset` - When timer is reset
- `activity` - User activity detected

#### Configuration Methods

##### `setIdleTimeout(timeout)`

Sets the idle timeout period.

```typescript
setIdleTimeout(timeout: number): void
```

**Parameters:**
- `timeout`: Time in milliseconds until user is considered idle

**Example:**
```typescript
idleManager.setIdleTimeout(900000); // 15 minutes
```

---

##### `setWarningTimeout(timeout)`

Sets the warning timeout period.

```typescript
setWarningTimeout(timeout: number): void
```

**Parameters:**
- `timeout`: Warning period in milliseconds before final timeout

**Example:**
```typescript
idleManager.setWarningTimeout(120000); // 2 minutes
```

---

##### `setCheckInterval(interval)`

Sets how often to check for idle state.

```typescript
setCheckInterval(interval: number): void
```

**Parameters:**
- `interval`: Check interval in milliseconds

**Example:**
```typescript
idleManager.setCheckInterval(5000); // Check every 5 seconds
```

---

##### `setEvents(events)`

Sets which DOM events to monitor for activity.

```typescript
setEvents(events: string[]): void
```

**Parameters:**
- `events`: Array of DOM event names to monitor

**Example:**
```typescript
idleManager.setEvents(['click', 'keydown', 'scroll']);
```

#### Event Management Methods

##### `on(event, handler)`

Adds an event listener.

```typescript
on(event: string, handler: Function): void
```

**Parameters:**
- `event`: Event name to listen for
- `handler`: Function to call when event occurs

**Example:**
```typescript
idleManager.on('idle-start', () => {
  console.log('User became idle');
});

idleManager.on('activity', (data) => {
  console.log('Activity:', data.event, 'at', data.timestamp);
});
```

---

##### `off(event, handler?)`

Removes an event listener.

```typescript
off(event: string, handler?: Function): void
```

**Parameters:**
- `event`: Event name to stop listening for
- `handler` (optional): Specific handler to remove, or all if omitted

**Example:**
```typescript
// Remove specific handler
idleManager.off('idle-start', myHandler);

// Remove all handlers for event
idleManager.off('idle-start');
```

---

##### `emit(event, data?)`

Emits a custom event.

```typescript
emit(event: string, data?: any): void
```

**Parameters:**
- `event`: Event name to emit
- `data` (optional): Data to pass with the event

**Example:**
```typescript
idleManager.emit('custom-event', { message: 'Hello' });
```

#### Multi-Tab Methods

##### `enableMultiTab()`

Enables multi-tab coordination.

```typescript
enableMultiTab(): void
```

**Example:**
```typescript
if ('BroadcastChannel' in window) {
  idleManager.enableMultiTab();
}
```

---

##### `disableMultiTab()`

Disables multi-tab coordination.

```typescript
disableMultiTab(): void
```

**Example:**
```typescript
idleManager.disableMultiTab();
```

---

##### `isMultiTabEnabled()`

Checks if multi-tab coordination is enabled.

```typescript
isMultiTabEnabled(): boolean
```

**Example:**
```typescript
if (idleManager.isMultiTabEnabled()) {
  console.log('Multi-tab coordination is active');
}
```

#### State Query Methods

##### `getLastActivity()`

Gets the timestamp of the last detected activity.

```typescript
getLastActivity(): number
```

**Returns:** Timestamp in milliseconds

**Example:**
```typescript
const lastActivity = idleManager.getLastActivity();
const timeSinceActivity = Date.now() - lastActivity;
console.log(`Idle for ${timeSinceActivity}ms`);
```

---

##### `getTimeUntilIdle()`

Gets time remaining until user is considered idle.

```typescript
getTimeUntilIdle(): number
```

**Returns:** Time in milliseconds until idle state

**Example:**
```typescript
const timeLeft = idleManager.getTimeUntilIdle();
console.log(`${Math.round(timeLeft / 1000)} seconds until idle`);
```

---

##### `isIdle()`

Checks if user is currently idle.

```typescript
isIdle(): boolean
```

**Returns:** `true` if user is idle, `false` otherwise

**Example:**
```typescript
if (idleManager.isIdle()) {
  showIdleMessage();
}
```

## Events Reference

### Core Events

#### `start`

Emitted when idle detection monitoring begins.

**Data:** `{ timestamp: number }`

```typescript
idleManager.on('start', (data) => {
  console.log('Monitoring started at', new Date(data.timestamp));
});
```

#### `stop`

Emitted when idle detection monitoring ends.

**Data:** `{ timestamp: number }`

```typescript
idleManager.on('stop', (data) => {
  console.log('Monitoring stopped at', new Date(data.timestamp));
});
```

#### `reset`

Emitted when the idle timer is reset.

**Data:** `{ timestamp: number }`

```typescript
idleManager.on('reset', (data) => {
  console.log('Timer reset at', new Date(data.timestamp));
});
```

#### `activity`

Emitted when any user activity is detected.

**Data:** `{ timestamp: number, event: string, target?: Element }`

```typescript
idleManager.on('activity', (data) => {
  console.log(`${data.event} detected at ${new Date(data.timestamp)}`);
});
```

#### `idle-start`

Emitted when user becomes idle (warning period begins).

**Data:** `{ timestamp: number, idleTime: number }`

```typescript
idleManager.on('idle-start', (data) => {
  console.log(`User idle for ${data.idleTime}ms`);
  showWarningDialog();
});
```

#### `idle-end`

Emitted when user returns from idle state.

**Data:** `{ timestamp: number, idleDuration: number }`

```typescript
idleManager.on('idle-end', (data) => {
  console.log(`User returned after ${data.idleDuration}ms`);
  hideWarningDialog();
});
```

#### `timeout`

Emitted when warning period expires.

**Data:** `{ timestamp: number, totalIdleTime: number }`

```typescript
idleManager.on('timeout', (data) => {
  console.log('Session timed out');
  performLogout();
});
```

#### `interrupt`

Emitted when activity is detected during warning period.

**Data:** `{ timestamp: number, event: string }`

```typescript
idleManager.on('interrupt', (data) => {
  console.log('Warning interrupted by', data.event);
  hideWarningDialog();
});
```

### Multi-Tab Events

#### `tab-idle`

Emitted when another tab becomes idle.

**Data:** `{ tabId: string, timestamp: number }`

```typescript
idleManager.on('tab-idle', (data) => {
  console.log(`Tab ${data.tabId} became idle`);
});
```

#### `tab-active`

Emitted when another tab becomes active.

**Data:** `{ tabId: string, timestamp: number }`

```typescript
idleManager.on('tab-active', (data) => {
  console.log(`Tab ${data.tabId} became active`);
});
```

#### `tab-sync`

Emitted when syncing state with other tabs.

**Data:** `{ tabId: string, state: object }`

```typescript
idleManager.on('tab-sync', (data) => {
  console.log('Syncing with tab', data.tabId, data.state);
});
```

### Error Events

#### `error`

Emitted when an error occurs.

**Data:** `{ error: Error, context?: string }`

```typescript
idleManager.on('error', (data) => {
  console.error('Idle detection error:', data.error.message);
  if (data.context) {
    console.error('Context:', data.context);
  }
});
```

## Types and Interfaces

### IdleOptions

Configuration options for IdleManager.

```typescript
interface IdleOptions {
  idleTimeout?: number;        // Time until idle (default: 600000ms)
  warningTimeout?: number;     // Warning period (default: 60000ms)
  checkInterval?: number;      // Check frequency (default: 1000ms)
  events?: string[];          // Events to monitor
  element?: HTMLElement;      // Target element (default: document)
  multiTab?: boolean;         // Multi-tab coordination (default: false)
  debug?: boolean;           // Debug logging (default: false)
}
```

### IdleState

Current state of the idle manager.

```typescript
interface IdleState {
  isRunning: boolean;
  isIdle: boolean;
  isWarning: boolean;
  lastActivity: number;
  timeUntilIdle: number;
  timeUntilTimeout: number;
}
```

### ActivityEvent

Data structure for activity events.

```typescript
interface ActivityEvent {
  timestamp: number;
  event: string;
  target?: Element;
  coordinates?: {
    x: number;
    y: number;
  };
}
```

### TabMessage

Message structure for multi-tab communication.

```typescript
interface TabMessage {
  type: 'idle' | 'active' | 'sync' | 'ping';
  tabId: string;
  timestamp: number;
  data?: any;
}
```

## Constants

### IdleEvent

Enumeration of all event types.

```typescript
enum IdleEvent {
  START = 'start',
  STOP = 'stop', 
  RESET = 'reset',
  ACTIVITY = 'activity',
  IDLE_START = 'idle-start',
  IDLE_END = 'idle-end',
  TIMEOUT = 'timeout',
  INTERRUPT = 'interrupt',
  TAB_IDLE = 'tab-idle',
  TAB_ACTIVE = 'tab-active',
  TAB_SYNC = 'tab-sync',
  ERROR = 'error'
}
```

**Usage:**
```typescript
import { IdleEvent } from '@idle-detection/core';

idleManager.on(IdleEvent.IDLE_START, handler);
```

### DefaultEvents

Default DOM events monitored for activity.

```typescript
const DefaultEvents = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'click',
  'focus'
];
```

### DefaultTimeouts

Default timeout values.

```typescript
const DefaultTimeouts = {
  IDLE_TIMEOUT: 600000,      // 10 minutes
  WARNING_TIMEOUT: 60000,    // 1 minute
  CHECK_INTERVAL: 1000       // 1 second
};
```

## Utilities

### timeFormat

Utility function to format time durations.

```typescript
function timeFormat(milliseconds: number): string
```

**Parameters:**
- `milliseconds`: Time duration in milliseconds

**Returns:** Formatted string (e.g., "5m 30s")

**Example:**
```typescript
import { timeFormat } from '@idle-detection/core';

console.log(timeFormat(330000)); // "5m 30s"
console.log(timeFormat(45000));  // "45s"
```

### debounce

Utility function for debouncing function calls.

```typescript
function debounce(func: Function, wait: number): Function
```

**Parameters:**
- `func`: Function to debounce
- `wait`: Delay in milliseconds

**Returns:** Debounced function

**Example:**
```typescript
import { debounce } from '@idle-detection/core';

const debouncedReset = debounce(() => {
  idleManager.reset();
}, 1000);

document.addEventListener('scroll', debouncedReset);
```

### throttle

Utility function for throttling function calls.

```typescript
function throttle(func: Function, limit: number): Function
```

**Parameters:**
- `func`: Function to throttle
- `limit`: Time limit in milliseconds

**Returns:** Throttled function

**Example:**
```typescript
import { throttle } from '@idle-detection/core';

const throttledActivity = throttle((event) => {
  console.log('Activity:', event.type);
}, 1000);

document.addEventListener('mousemove', throttledActivity);
```

### isValidTimeout

Utility function to validate timeout values.

```typescript
function isValidTimeout(timeout: number): boolean
```

**Parameters:**
- `timeout`: Timeout value in milliseconds

**Returns:** `true` if valid, `false` otherwise

**Example:**
```typescript
import { isValidTimeout } from '@idle-detection/core';

if (isValidTimeout(userTimeout)) {
  idleManager.setIdleTimeout(userTimeout);
} else {
  console.error('Invalid timeout value');
}
```

---

## Advanced Usage Examples

### Custom Event Handler

```typescript
class CustomIdleHandler {
  constructor(private idleManager: IdleManager) {
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.idleManager.on('activity', this.handleActivity.bind(this));
    this.idleManager.on('idle-start', this.handleIdleStart.bind(this));
    this.idleManager.on('timeout', this.handleTimeout.bind(this));
  }

  private handleActivity(data: ActivityEvent): void {
    // Custom activity logging
    this.logActivity(data);
  }

  private handleIdleStart(data: any): void {
    // Custom warning display
    this.showCustomWarning(data);
  }

  private handleTimeout(data: any): void {
    // Custom timeout handling
    this.performCustomLogout(data);
  }
}
```

### State Management Integration

```typescript
class IdleStateManager {
  private state: IdleState = {
    isRunning: false,
    isIdle: false,
    isWarning: false,
    lastActivity: 0,
    timeUntilIdle: 0,
    timeUntilTimeout: 0
  };

  constructor(private idleManager: IdleManager) {
    this.initializeStateTracking();
  }

  private initializeStateTracking(): void {
    // Track all state changes
    this.idleManager.on('start', () => {
      this.updateState({ isRunning: true });
    });

    this.idleManager.on('stop', () => {
      this.updateState({ isRunning: false });
    });

    this.idleManager.on('idle-start', () => {
      this.updateState({ isIdle: true, isWarning: true });
    });

    this.idleManager.on('idle-end', () => {
      this.updateState({ isIdle: false, isWarning: false });
    });

    this.idleManager.on('activity', (data) => {
      this.updateState({ lastActivity: data.timestamp });
    });
  }

  private updateState(changes: Partial<IdleState>): void {
    this.state = { ...this.state, ...changes };
    this.notifyStateChange();
  }

  public getState(): IdleState {
    return { ...this.state };
  }

  private notifyStateChange(): void {
    // Emit custom state change event
    this.idleManager.emit('state-change', this.state);
  }
}
```