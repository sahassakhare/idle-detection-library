# Core Idle Detection Library - Examples

This document provides practical examples for implementing idle detection in various scenarios using the core library.

## Table of Contents

- [Basic Examples](#basic-examples)
- [Framework Integrations](#framework-integrations)
- [Advanced Use Cases](#advanced-use-cases)
- [Real-World Scenarios](#real-world-scenarios)
- [Testing Examples](#testing-examples)

## Basic Examples

### Simple Session Timeout

```javascript
import { IdleManager } from '@idle-detection/core';

// Create idle manager with 10 minute timeout
const idleManager = new IdleManager({
  idleTimeout: 600000,  // 10 minutes
  warningTimeout: 60000 // 1 minute warning
});

// Handle idle events
idleManager.on('idle-start', () => {
  console.log('User became idle - showing warning');
  showSessionWarning();
});

idleManager.on('timeout', () => {
  console.log('Session timed out - logging out');
  performLogout();
});

idleManager.on('idle-end', () => {
  console.log('User returned - hiding warning');
  hideSessionWarning();
});

// Start monitoring
idleManager.watch();

function showSessionWarning() {
  // Show warning dialog
  const warning = document.createElement('div');
  warning.id = 'session-warning';
  warning.innerHTML = `
    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
      <h3>Session Expiring</h3>
      <p>Your session will expire in 1 minute due to inactivity.</p>
      <button onclick="extendSession()">Stay Logged In</button>
      <button onclick="logout()">Logout</button>
    </div>
  `;
  document.body.appendChild(warning);
}

function hideSessionWarning() {
  const warning = document.getElementById('session-warning');
  if (warning) {
    warning.remove();
  }
}

function extendSession() {
  idleManager.reset();
  hideSessionWarning();
}

function performLogout() {
  // Cleanup and redirect
  idleManager.stop();
  window.location.href = '/login';
}

// Make functions global for onclick handlers
window.extendSession = extendSession;
window.logout = performLogout;
```

### Progressive Warning System

```javascript
import { IdleManager } from '@idle-detection/core';

class ProgressiveWarningSystem {
  constructor() {
    this.idleManager = new IdleManager({
      idleTimeout: 900000,  // 15 minutes
      warningTimeout: 300000 // 5 minutes
    });
    
    this.warningLevel = 0;
    this.warningTimer = null;
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.idleManager.on('idle-start', () => {
      this.startProgressiveWarning();
    });

    this.idleManager.on('idle-end', () => {
      this.clearWarnings();
    });

    this.idleManager.on('timeout', () => {
      this.performLogout();
    });

    this.idleManager.on('activity', () => {
      this.updateLastActivityTime();
    });
  }

  startProgressiveWarning() {
    this.warningLevel = 1;
    this.showWarning(this.warningLevel);
    
    // Escalate warnings every minute
    this.warningTimer = setInterval(() => {
      this.warningLevel++;
      this.showWarning(this.warningLevel);
      
      if (this.warningLevel >= 5) {
        clearInterval(this.warningTimer);
      }
    }, 60000); // Every minute
  }

  showWarning(level) {
    const messages = {
      1: { text: 'You appear to be idle. Your session will expire in 5 minutes.', urgency: 'low' },
      2: { text: 'Session expires in 4 minutes. Click anywhere to continue.', urgency: 'medium' },
      3: { text: 'WARNING: Session expires in 3 minutes!', urgency: 'high' },
      4: { text: 'URGENT: Session expires in 2 minutes!', urgency: 'critical' },
      5: { text: 'FINAL WARNING: Session expires in 1 minute!', urgency: 'critical' }
    };

    const warning = messages[level];
    this.displayWarningMessage(warning.text, warning.urgency);
    
    // Play sound for critical warnings
    if (warning.urgency === 'critical') {
      this.playWarningSound();
    }
  }

  displayWarningMessage(text, urgency) {
    // Remove existing warnings
    const existing = document.querySelectorAll('.idle-warning');
    existing.forEach(el => el.remove());

    // Create new warning
    const warningEl = document.createElement('div');
    warningEl.className = `idle-warning idle-warning--${urgency}`;
    warningEl.innerHTML = `
      <div class="warning-content">
        <div class="warning-icon">Warning</div>
        <div class="warning-text">${text}</div>
        <div class="warning-actions">
          <button onclick="progressiveWarning.extendSession()">Continue Session</button>
          <button onclick="progressiveWarning.logout()">Logout</button>
        </div>
      </div>
    `;
    
    // Add styles
    warningEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 350px;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: slideIn 0.3s ease;
    `;
    
    // Urgency-specific styles
    const urgencyStyles = {
      low: 'background: #e3f2fd; border-left: 4px solid #2196f3; color: #1976d2;',
      medium: 'background: #fff3e0; border-left: 4px solid #ff9800; color: #f57c00;',
      high: 'background: #ffebee; border-left: 4px solid #f44336; color: #d32f2f;',
      critical: 'background: #f44336; color: white; animation: pulse 1s infinite;'
    };
    
    warningEl.style.cssText += urgencyStyles[urgency];
    
    document.body.appendChild(warningEl);
  }

  playWarningSound() {
    // Play a warning sound (browser dependent)
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmcfBz2X2e/AcSMFLYDL9N2QPAcFaqfp7qpGJgQ');
      audio.play().catch(() => {
        // Fallback to system beep
        console.log('\u0007'); // Bell character
      });
    } catch (e) {
      console.log('Warning sound unavailable');
    }
  }

  updateLastActivityTime() {
    const now = new Date().toLocaleTimeString();
    const statusEl = document.getElementById('last-activity');
    if (statusEl) {
      statusEl.textContent = `Last activity: ${now}`;
    }
  }

  clearWarnings() {
    this.warningLevel = 0;
    if (this.warningTimer) {
      clearInterval(this.warningTimer);
      this.warningTimer = null;
    }
    
    const warnings = document.querySelectorAll('.idle-warning');
    warnings.forEach(el => el.remove());
  }

  extendSession() {
    this.idleManager.reset();
    this.clearWarnings();
    console.log('Session extended');
  }

  logout() {
    this.clearWarnings();
    this.idleManager.stop();
    window.location.href = '/login';
  }

  start() {
    this.idleManager.watch();
    console.log('🟢 Progressive warning system started');
  }

  stop() {
    this.clearWarnings();
    this.idleManager.stop();
    console.log('Progressive warning system stopped');
  }
}

// Usage
const progressiveWarning = new ProgressiveWarningSystem();
progressiveWarning.start();

// Make available globally
window.progressiveWarning = progressiveWarning;

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  .warning-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .warning-actions {
    display: flex;
    gap: 8px;
  }
  
  .warning-actions button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
  }
`;
document.head.appendChild(style);
```

## Framework Integrations

### React Hook

```jsx
import { useState, useEffect, useCallback } from 'react';
import { IdleManager } from '@idle-detection/core';

// Custom hook for idle detection
function useIdleDetection(config = {}) {
  const [isIdle, setIsIdle] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [idleManager, setIdleManager] = useState(null);

  useEffect(() => {
    const manager = new IdleManager({
      idleTimeout: 600000,  // 10 minutes
      warningTimeout: 60000, // 1 minute
      ...config
    });

    manager.on('idle-start', () => {
      setIsWarning(true);
      setIsIdle(false);
      
      // Start countdown
      let remaining = config.warningTimeout || 60000;
      setTimeRemaining(remaining);
      
      const countdown = setInterval(() => {
        remaining -= 1000;
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          clearInterval(countdown);
        }
      }, 1000);
      
      // Store countdown reference
      manager._countdown = countdown;
    });

    manager.on('timeout', () => {
      setIsIdle(true);
      setIsWarning(false);
      setTimeRemaining(0);
    });

    manager.on('idle-end', () => {
      setIsIdle(false);
      setIsWarning(false);
      setTimeRemaining(0);
      
      if (manager._countdown) {
        clearInterval(manager._countdown);
        manager._countdown = null;
      }
    });

    manager.watch();
    setIdleManager(manager);

    return () => {
      if (manager._countdown) {
        clearInterval(manager._countdown);
      }
      manager.stop();
    };
  }, []);

  const extendSession = useCallback(() => {
    if (idleManager) {
      idleManager.reset();
    }
  }, [idleManager]);

  const logout = useCallback(() => {
    if (idleManager) {
      idleManager.stop();
    }
    // Perform logout logic here
  }, [idleManager]);

  return {
    isIdle,
    isWarning,
    timeRemaining,
    extendSession,
    logout
  };
}

// React component using the hook
function App() {
  const { isIdle, isWarning, timeRemaining, extendSession, logout } = useIdleDetection({
    idleTimeout: 900000,  // 15 minutes
    warningTimeout: 180000 // 3 minutes
  });

  if (isIdle) {
    return (
      <div className="idle-overlay">
        <div className="idle-message">
          <h2>Session Expired</h2>
          <p>Your session has expired due to inactivity.</p>
          <button onClick={() => window.location.reload()}>
            Login Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>My React App</h1>
        <div className="status">
          {isWarning ? 'Session Expiring' : 'Active'}
        </div>
      </header>

      <main>
        <p>Your application content here...</p>
      </main>

      {isWarning && (
        <IdleWarningModal
          timeRemaining={timeRemaining}
          onExtend={extendSession}
          onLogout={logout}
        />
      )}
    </div>
  );
}

// Warning modal component
function IdleWarningModal({ timeRemaining, onExtend, onLogout }) {
  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Session Expiring</h3>
        <p>
          Your session will expire in{' '}
          <strong>
            {minutes > 0 ? `${minutes}m ` : ''}{seconds}s
          </strong>{' '}
          due to inactivity.
        </p>
        <div className="modal-actions">
          <button onClick={onExtend} className="btn btn-primary">
            Stay Logged In
          </button>
          <button onClick={onLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
```

### Vue.js Plugin

```javascript
// vue-idle-plugin.js
import { IdleManager } from '@idle-detection/core';

const VueIdlePlugin = {
  install(app, options = {}) {
    const idleManager = new IdleManager({
      idleTimeout: 600000,
      warningTimeout: 60000,
      ...options
    });

    // Make idle manager available globally
    app.config.globalProperties.$idle = idleManager;
    app.provide('idle', idleManager);

    // Add global mixin for idle detection
    app.mixin({
      data() {
        return {
          idleState: {
            isIdle: false,
            isWarning: false,
            timeRemaining: 0
          }
        };
      },

      created() {
        if (this.$options.idleDetection) {
          this.setupIdleDetection();
        }
      },

      beforeUnmount() {
        if (this._idleListeners) {
          this._idleListeners.forEach(({ event, handler }) => {
            this.$idle.off(event, handler);
          });
        }
      },

      methods: {
        setupIdleDetection() {
          this._idleListeners = [];

          const addListener = (event, handler) => {
            this.$idle.on(event, handler);
            this._idleListeners.push({ event, handler });
          };

          addListener('idle-start', () => {
            this.idleState.isWarning = true;
            this.idleState.isIdle = false;
            this.startWarningCountdown();
          });

          addListener('timeout', () => {
            this.idleState.isIdle = true;
            this.idleState.isWarning = false;
            this.idleState.timeRemaining = 0;
          });

          addListener('idle-end', () => {
            this.idleState.isIdle = false;
            this.idleState.isWarning = false;
            this.idleState.timeRemaining = 0;
            this.clearWarningCountdown();
          });

          // Start idle detection
          this.$idle.watch();
        },

        startWarningCountdown() {
          let remaining = this.$idle.warningTimeout || 60000;
          this.idleState.timeRemaining = remaining;

          this._warningTimer = setInterval(() => {
            remaining -= 1000;
            this.idleState.timeRemaining = remaining;

            if (remaining <= 0) {
              this.clearWarningCountdown();
            }
          }, 1000);
        },

        clearWarningCountdown() {
          if (this._warningTimer) {
            clearInterval(this._warningTimer);
            this._warningTimer = null;
          }
        },

        extendIdleSession() {
          this.$idle.reset();
        },

        performIdleLogout() {
          this.$idle.stop();
          // Handle logout logic
        }
      }
    });
  }
};

export default VueIdlePlugin;
```

```vue
<!-- Vue component using the plugin -->
<template>
  <div class="app">
    <header>
      <h1>My Vue App</h1>
      <div class="status" :class="statusClass">
        {{ statusText }}
      </div>
    </header>

    <main>
      <p>Your application content here...</p>
    </main>

    <!-- Idle overlay -->
    <div v-if="idleState.isIdle" class="idle-overlay">
      <div class="idle-message">
        <h2>Session Expired</h2>
        <p>Your session has expired due to inactivity.</p>
        <button @click="$router.push('/login')">
          Login Again
        </button>
      </div>
    </div>

    <!-- Warning modal -->
    <div v-if="idleState.isWarning" class="modal-overlay">
      <div class="modal">
        <h3>Session Expiring</h3>
        <p>
          Your session will expire in 
          <strong>{{ formattedTimeRemaining }}</strong>
          due to inactivity.
        </p>
        <div class="modal-actions">
          <button @click="extendIdleSession" class="btn btn-primary">
            Stay Logged In
          </button>
          <button @click="performIdleLogout" class="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  idleDetection: true, // Enable idle detection for this component

  computed: {
    statusText() {
      if (this.idleState.isIdle) return 'Session Expired';
      if (this.idleState.isWarning) return 'Session Expiring';
      return 'Active';
    },

    statusClass() {
      if (this.idleState.isIdle) return 'status-idle';
      if (this.idleState.isWarning) return 'status-warning';
      return 'status-active';
    },

    formattedTimeRemaining() {
      const minutes = Math.floor(this.idleState.timeRemaining / 60000);
      const seconds = Math.floor((this.idleState.timeRemaining % 60000) / 1000);
      return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    }
  }
};
</script>

<style scoped>
.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-warning {
  background: #fff3cd;
  color: #856404;
}

.status-idle {
  background: #f8d7da;
  color: #721c24;
}

.idle-overlay, .modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.idle-message, .modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  max-width: 400px;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}
</style>
```

```javascript
// main.js - Vue app setup
import { createApp } from 'vue';
import VueIdlePlugin from './vue-idle-plugin.js';
import App from './App.vue';

const app = createApp(App);

// Install idle detection plugin
app.use(VueIdlePlugin, {
  idleTimeout: 900000,  // 15 minutes
  warningTimeout: 180000, // 3 minutes
  debug: false
});

app.mount('#app');
```

## Advanced Use Cases

### Multi-Tab Coordination

```javascript
import { IdleManager } from '@idle-detection/core';

class MultiTabIdleManager {
  constructor(config = {}) {
    this.tabId = this.generateTabId();
    this.tabs = new Map();
    
    this.idleManager = new IdleManager({
      idleTimeout: 900000,  // 15 minutes
      warningTimeout: 180000, // 3 minutes
      multiTab: true,
      ...config
    });
    
    this.setupMultiTabCoordination();
    this.setupIdleDetection();
  }

  generateTabId() {
    return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  setupMultiTabCoordination() {
    // Handle cross-tab messages
    this.idleManager.on('tab-idle', (data) => {
      console.log(`Tab ${data.tabId} became idle`);
      this.tabs.set(data.tabId, { status: 'idle', timestamp: data.timestamp });
      this.updateGlobalStatus();
    });

    this.idleManager.on('tab-active', (data) => {
      console.log(`Tab ${data.tabId} became active`);
      this.tabs.set(data.tabId, { status: 'active', timestamp: data.timestamp });
      this.updateGlobalStatus();
    });

    this.idleManager.on('tab-sync', (data) => {
      console.log('Syncing state with other tabs');
      this.synchronizeState(data);
    });

    // Broadcast this tab's status
    this.broadcastTabStatus('active');
  }

  setupIdleDetection() {
    this.idleManager.on('idle-start', () => {
      console.log('🟡 This tab became idle');
      this.broadcastTabStatus('idle');
      this.showWarningIfMasterTab();
    });

    this.idleManager.on('idle-end', () => {
      console.log('🟢 This tab became active');
      this.broadcastTabStatus('active');
      this.hideWarningIfExists();
    });

    this.idleManager.on('timeout', () => {
      console.log('This tab timed out');
      this.handleGlobalTimeout();
    });

    this.idleManager.on('activity', () => {
      // Broadcast activity to other tabs
      this.broadcastActivity();
    });
  }

  broadcastTabStatus(status) {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('idle-detection');
      channel.postMessage({
        type: status,
        tabId: this.tabId,
        timestamp: Date.now()
      });
    }
  }

  broadcastActivity() {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('idle-detection');
      channel.postMessage({
        type: 'activity',
        tabId: this.tabId,
        timestamp: Date.now()
      });
    }
  }

  updateGlobalStatus() {
    const allTabs = Array.from(this.tabs.values());
    const activeTabs = allTabs.filter(tab => tab.status === 'active');
    const idleTabs = allTabs.filter(tab => tab.status === 'idle');

    console.log(`Global status: ${activeTabs.length} active, ${idleTabs.length} idle tabs`);

    // Update UI to show global status
    this.updateStatusDisplay({
      totalTabs: allTabs.length,
      activeTabs: activeTabs.length,
      idleTabs: idleTabs.length
    });
  }

  showWarningIfMasterTab() {
    // Only show warning in the "master" tab (first tab or most recently active)
    if (this.isMasterTab()) {
      this.showGlobalWarning();
    }
  }

  isMasterTab() {
    // Simple master election: tab with lowest ID
    const allTabIds = Array.from(this.tabs.keys()).concat(this.tabId);
    const sortedIds = allTabIds.sort();
    return sortedIds[0] === this.tabId;
  }

  showGlobalWarning() {
    const warningEl = document.createElement('div');
    warningEl.id = 'global-idle-warning';
    warningEl.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                  background: rgba(0,0,0,0.8); z-index: 10000; 
                  display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 2rem; border-radius: 8px; 
                    text-align: center; max-width: 500px;">
          <h3>Global Session Warning</h3>
          <p>All browser tabs are idle. Your session will expire soon.</p>
          <div id="tab-status"></div>
          <div style="margin-top: 1rem;">
            <button onclick="multiTabManager.extendGlobalSession()">
              Extend Session in All Tabs
            </button>
            <button onclick="multiTabManager.logoutAllTabs()">
              Logout All Tabs
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(warningEl);
    this.updateTabStatusDisplay();
  }

  updateTabStatusDisplay() {
    const statusEl = document.getElementById('tab-status');
    if (statusEl) {
      const tabList = Array.from(this.tabs.entries())
        .map(([id, info]) => `<div>Tab ${id.slice(-6)}: ${info.status}</div>`)
        .join('');
      
      statusEl.innerHTML = `
        <div style="margin: 1rem 0; padding: 1rem; background: #f5f5f5; border-radius: 4px;">
          <strong>Tab Status:</strong><br>
          <div>This Tab: active</div>
          ${tabList}
        </div>
      `;
    }
  }

  updateStatusDisplay(status) {
    let statusEl = document.getElementById('multi-tab-status');
    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.id = 'multi-tab-status';
      statusEl.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: white;
        padding: 10px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        font-size: 12px;
        z-index: 1000;
      `;
      document.body.appendChild(statusEl);
    }

    statusEl.innerHTML = `
      <strong>Multi-Tab Status</strong><br>
      Total: ${status.totalTabs + 1}<br>
      Active: ${status.activeTabs + 1}<br>
      Idle: ${status.idleTabs}
    `;
  }

  extendGlobalSession() {
    // Extend session in this tab
    this.idleManager.reset();
    
    // Broadcast extend session to all tabs
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('idle-detection');
      channel.postMessage({
        type: 'extend-session',
        tabId: this.tabId,
        timestamp: Date.now()
      });
    }
    
    this.hideWarningIfExists();
  }

  logoutAllTabs() {
    // Broadcast logout to all tabs
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('idle-detection');
      channel.postMessage({
        type: 'global-logout',
        tabId: this.tabId,
        timestamp: Date.now()
      });
    }
    
    // Logout this tab
    this.performLogout();
  }

  hideWarningIfExists() {
    const warning = document.getElementById('global-idle-warning');
    if (warning) {
      warning.remove();
    }
  }

  handleGlobalTimeout() {
    // All tabs should logout
    this.logoutAllTabs();
  }

  synchronizeState(data) {
    // Handle state synchronization from other tabs
    if (data.type === 'extend-session') {
      this.idleManager.reset();
    } else if (data.type === 'global-logout') {
      this.performLogout();
    }
  }

  performLogout() {
    this.idleManager.stop();
    window.location.href = '/login';
  }

  start() {
    this.idleManager.watch();
    console.log(`🟢 Multi-tab idle detection started for tab ${this.tabId}`);
  }

  stop() {
    this.idleManager.stop();
    this.broadcastTabStatus('closed');
    console.log(`Multi-tab idle detection stopped for tab ${this.tabId}`);
  }
}

// Usage
const multiTabManager = new MultiTabIdleManager({
  idleTimeout: 1200000, // 20 minutes
  warningTimeout: 300000 // 5 minutes
});

multiTabManager.start();

// Make available globally
window.multiTabManager = multiTabManager;

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  multiTabManager.stop();
});
```

### Activity Analytics

```javascript
import { IdleManager } from '@idle-detection/core';

class ActivityAnalytics {
  constructor() {
    this.sessions = [];
    this.currentSession = null;
    
    this.idleManager = new IdleManager({
      idleTimeout: 600000,  // 10 minutes
      warningTimeout: 60000, // 1 minute
      events: [
        'mousedown', 'mousemove', 'mouseup',
        'keydown', 'keyup',
        'scroll', 'wheel',
        'touchstart', 'touchmove', 'touchend',
        'focus', 'blur'
      ]
    });
    
    this.setupAnalytics();
  }

  setupAnalytics() {
    // Track session start
    this.idleManager.on('start', () => {
      this.startSession();
    });

    // Track all activity
    this.idleManager.on('activity', (data) => {
      this.recordActivity(data);
    });

    // Track idle periods
    this.idleManager.on('idle-start', (data) => {
      this.recordIdlePeriod('start', data);
    });

    this.idleManager.on('idle-end', (data) => {
      this.recordIdlePeriod('end', data);
    });

    // Track session end
    this.idleManager.on('timeout', () => {
      this.endSession('timeout');
    });

    this.idleManager.on('stop', () => {
      this.endSession('manual');
    });
  }

  startSession() {
    this.currentSession = {
      id: Date.now().toString(),
      startTime: Date.now(),
      endTime: null,
      endReason: null,
      activities: [],
      idlePeriods: [],
      totalActiveTime: 0,
      totalIdleTime: 0,
      activityCounts: {},
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    console.log('Analytics session started:', this.currentSession.id);
  }

  recordActivity(data) {
    if (!this.currentSession) return;

    const activity = {
      timestamp: data.timestamp,
      event: data.event,
      target: data.target?.tagName || 'unknown',
      coordinates: data.coordinates || null
    };

    this.currentSession.activities.push(activity);

    // Count activity types
    const eventType = data.event;
    this.currentSession.activityCounts[eventType] = 
      (this.currentSession.activityCounts[eventType] || 0) + 1;

    // Update display
    this.updateActivityDisplay();
  }

  recordIdlePeriod(phase, data) {
    if (!this.currentSession) return;

    if (phase === 'start') {
      this.currentSession.currentIdleStart = data.timestamp;
    } else if (phase === 'end' && this.currentSession.currentIdleStart) {
      const idleDuration = data.timestamp - this.currentSession.currentIdleStart;
      
      this.currentSession.idlePeriods.push({
        startTime: this.currentSession.currentIdleStart,
        endTime: data.timestamp,
        duration: idleDuration
      });

      this.currentSession.totalIdleTime += idleDuration;
      delete this.currentSession.currentIdleStart;
    }
  }

  endSession(reason) {
    if (!this.currentSession) return;

    this.currentSession.endTime = Date.now();
    this.currentSession.endReason = reason;
    
    // Calculate total active time
    const totalSessionTime = this.currentSession.endTime - this.currentSession.startTime;
    this.currentSession.totalActiveTime = totalSessionTime - this.currentSession.totalIdleTime;

    // Save session
    this.sessions.push({ ...this.currentSession });
    
    // Generate session report
    this.generateSessionReport(this.currentSession);
    
    // Clear current session
    this.currentSession = null;

    console.log('Analytics session ended:', reason);
  }

  generateSessionReport(session) {
    const report = {
      sessionId: session.id,
      duration: this.formatDuration(session.endTime - session.startTime),
      activeTime: this.formatDuration(session.totalActiveTime),
      idleTime: this.formatDuration(session.totalIdleTime),
      activityCount: session.activities.length,
      idlePeriods: session.idlePeriods.length,
      mostCommonActivity: this.getMostCommonActivity(session.activityCounts),
      averageIdlePeriod: session.idlePeriods.length > 0 
        ? this.formatDuration(session.totalIdleTime / session.idlePeriods.length)
        : '0s',
      endReason: session.endReason
    };

    console.log('Session Report:', report);
    this.displaySessionReport(report);
    
    return report;
  }

  getMostCommonActivity(activityCounts) {
    let maxCount = 0;
    let mostCommon = 'none';
    
    for (const [activity, count] of Object.entries(activityCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = activity;
      }
    }
    
    return { activity: mostCommon, count: maxCount };
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  updateActivityDisplay() {
    if (!this.currentSession) return;

    let displayEl = document.getElementById('activity-analytics');
    if (!displayEl) {
      displayEl = document.createElement('div');
      displayEl.id = 'activity-analytics';
      displayEl.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        font-family: monospace;
        font-size: 12px;
        max-width: 300px;
        z-index: 1000;
      `;
      document.body.appendChild(displayEl);
    }

    const sessionTime = Date.now() - this.currentSession.startTime;
    const recentActivities = this.currentSession.activities.slice(-5);

    displayEl.innerHTML = `
      <strong>Activity Analytics</strong><br>
      <div style="margin: 8px 0;">
        Session: ${this.formatDuration(sessionTime)}<br>
        Activities: ${this.currentSession.activities.length}<br>
        Idle Periods: ${this.currentSession.idlePeriods.length}
      </div>
      
      <div style="margin: 8px 0;">
        <strong>Activity Counts:</strong><br>
        ${Object.entries(this.currentSession.activityCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([event, count]) => `${event}: ${count}`)
          .join('<br>')}
      </div>
      
      <div style="margin: 8px 0;">
        <strong>Recent:</strong><br>
        ${recentActivities
          .map(a => `${a.event} (${a.target})`)
          .join('<br>')}
      </div>
    `;
  }

  displaySessionReport(report) {
    const reportEl = document.createElement('div');
    reportEl.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      max-width: 500px;
      z-index: 10001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    reportEl.innerHTML = `
      <h3 style="margin-top: 0;">Session Analytics Report</h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0;">
        <div>
          <strong>Total Duration:</strong><br>
          ${report.duration}
        </div>
        <div>
          <strong>Active Time:</strong><br>
          ${report.activeTime}
        </div>
        <div>
          <strong>Idle Time:</strong><br>
          ${report.idleTime}
        </div>
        <div>
          <strong>Activities:</strong><br>
          ${report.activityCount}
        </div>
        <div>
          <strong>Idle Periods:</strong><br>
          ${report.idlePeriods}
        </div>
        <div>
          <strong>Avg Idle:</strong><br>
          ${report.averageIdlePeriod}
        </div>
      </div>
      
      <div style="margin: 1rem 0;">
        <strong>Most Common Activity:</strong><br>
        ${report.mostCommonActivity.activity} (${report.mostCommonActivity.count} times)
      </div>
      
      <div style="margin: 1rem 0;">
        <strong>Session End:</strong> ${report.endReason}
      </div>
      
      <div style="text-align: center; margin-top: 1.5rem;">
        <button onclick="this.parentElement.parentElement.remove()" 
                style="padding: 8px 16px; background: #007bff; color: white; 
                       border: none; border-radius: 4px; cursor: pointer;">
          Close Report
        </button>
        <button onclick="activityAnalytics.exportData()" 
                style="padding: 8px 16px; background: #28a745; color: white; 
                       border: none; border-radius: 4px; cursor: pointer; margin-left: 8px;">
          Export Data
        </button>
      </div>
    `;

    document.body.appendChild(reportEl);
  }

  exportData() {
    const data = {
      exportDate: new Date().toISOString(),
      sessions: this.sessions,
      summary: this.generateSummaryStats()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-analytics-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    console.log('Analytics data exported');
  }

  generateSummaryStats() {
    if (this.sessions.length === 0) return null;

    const totalSessions = this.sessions.length;
    const totalTime = this.sessions.reduce((sum, s) => sum + (s.endTime - s.startTime), 0);
    const totalActiveTime = this.sessions.reduce((sum, s) => sum + s.totalActiveTime, 0);
    const totalActivities = this.sessions.reduce((sum, s) => sum + s.activities.length, 0);

    return {
      totalSessions,
      totalTime: this.formatDuration(totalTime),
      totalActiveTime: this.formatDuration(totalActiveTime),
      averageSessionTime: this.formatDuration(totalTime / totalSessions),
      totalActivities,
      averageActivitiesPerSession: Math.round(totalActivities / totalSessions)
    };
  }

  start() {
    this.idleManager.watch();
    console.log('Activity analytics started');
  }

  stop() {
    if (this.currentSession) {
      this.endSession('manual');
    }
    this.idleManager.stop();
    console.log('Activity analytics stopped');
  }
}

// Usage
const activityAnalytics = new ActivityAnalytics();
activityAnalytics.start();

// Make available globally
window.activityAnalytics = activityAnalytics;

// Auto-stop on page unload
window.addEventListener('beforeunload', () => {
  activityAnalytics.stop();
});
```

## Real-World Scenarios

### E-commerce Checkout Protection

```javascript
import { IdleManager } from '@idle-detection/core';

class CheckoutProtection {
  constructor(cartData, checkoutConfig = {}) {
    this.cartData = cartData;
    this.isInCheckout = false;
    this.checkoutStartTime = null;
    this.savedDrafts = new Map();
    
    this.idleManager = new IdleManager({
      idleTimeout: checkoutConfig.idleTimeout || 900000,  // 15 minutes
      warningTimeout: checkoutConfig.warningTimeout || 180000, // 3 minutes
      events: ['mousedown', 'keydown', 'change', 'input', 'scroll']
    });
    
    this.setupCheckoutProtection();
  }

  setupCheckoutProtection() {
    // Save checkout progress on activity
    this.idleManager.on('activity', () => {
      if (this.isInCheckout) {
        this.autoSaveCheckoutProgress();
      }
    });

    // Warn before losing checkout progress
    this.idleManager.on('idle-start', () => {
      if (this.isInCheckout) {
        this.showCheckoutWarning();
      } else {
        this.showRegularWarning();
      }
    });

    // Handle timeout differently for checkout
    this.idleManager.on('timeout', () => {
      if (this.isInCheckout) {
        this.handleCheckoutTimeout();
      } else {
        this.handleRegularTimeout();
      }
    });

    this.idleManager.on('idle-end', () => {
      this.hideWarning();
    });
  }

  startCheckout() {
    this.isInCheckout = true;
    this.checkoutStartTime = Date.now();
    
    // Extend idle timeout for checkout
    this.idleManager.setIdleTimeout(1800000); // 30 minutes for checkout
    
    console.log('Checkout protection activated');
    this.showCheckoutStatus();
  }

  endCheckout(reason = 'completed') {
    this.isInCheckout = false;
    this.checkoutStartTime = null;
    
    // Reset to normal timeout
    this.idleManager.setIdleTimeout(900000); // 15 minutes normal
    
    if (reason === 'completed') {
      this.clearSavedProgress();
    }
    
    console.log(`Checkout ended: ${reason}`);
    this.hideCheckoutStatus();
  }

  autoSaveCheckoutProgress() {
    const formData = this.collectCheckoutFormData();
    const progressData = {
      timestamp: Date.now(),
      formData,
      cartData: this.cartData,
      currentStep: this.getCurrentCheckoutStep(),
      timeSpent: Date.now() - this.checkoutStartTime
    };

    // Save to localStorage
    localStorage.setItem('checkout_progress', JSON.stringify(progressData));
    
    // Update UI
    this.showAutoSaveIndicator();
    
    console.log('Checkout progress auto-saved');
  }

  collectCheckoutFormData() {
    const forms = document.querySelectorAll('form[data-checkout-form]');
    const formData = {};

    forms.forEach(form => {
      const formName = form.dataset.checkoutForm;
      formData[formName] = {};

      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        if (input.type !== 'password' && input.type !== 'hidden') {
          formData[formName][input.name] = input.value;
        }
      });
    });

    return formData;
  }

  getCurrentCheckoutStep() {
    const stepEl = document.querySelector('[data-checkout-step]');
    return stepEl ? stepEl.dataset.checkoutStep : 'unknown';
  }

  showCheckoutWarning() {
    this.hideWarning(); // Remove any existing warning

    const warningEl = document.createElement('div');
    warningEl.id = 'checkout-warning';
    warningEl.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                  background: rgba(0,0,0,0.9); z-index: 10000; 
                  display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 2rem; border-radius: 12px; 
                    text-align: center; max-width: 500px; box-shadow: 0 8px 24px rgba(0,0,0,0.3);">
          
          <div style="font-size: 48px; margin-bottom: 1rem;">Cart</div>
          <h3 style="color: #e74c3c; margin: 0 0 1rem 0;">Checkout Session Expiring</h3>
          
          <p style="margin: 1rem 0; color: #666;">
            Your checkout session will expire soon due to inactivity. 
            Your progress has been automatically saved.
          </p>
          
          <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
            <strong>Your cart is protected:</strong><br>
            <small>• Cart items: ${this.cartData.items?.length || 0}</small><br>
            <small>• Form progress: Saved</small><br>
            <small>• Session: ${this.formatCheckoutTime()}</small>
          </div>
          
          <div id="checkout-countdown" style="font-size: 24px; font-weight: bold; 
                                              color: #e74c3c; margin: 1rem 0;">
            3:00
          </div>
          
          <div style="display: flex; gap: 1rem; justify-content: center;">
            <button onclick="checkoutProtection.continueCheckout()" 
                    style="padding: 12px 24px; background: #28a745; color: white; 
                           border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
              Continue Checkout
            </button>
            <button onclick="checkoutProtection.saveAndExit()" 
                    style="padding: 12px 24px; background: #007bff; color: white; 
                           border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
              Save & Exit
            </button>
            <button onclick="checkoutProtection.abandonCheckout()" 
                    style="padding: 12px 24px; background: #6c757d; color: white; 
                           border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
              Abandon
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(warningEl);
    this.startCheckoutCountdown();
  }

  showRegularWarning() {
    const warningEl = document.createElement('div');
    warningEl.id = 'regular-warning';
    warningEl.innerHTML = `
      <div style="position: fixed; top: 20px; right: 20px; 
                  background: #fff3cd; color: #856404; padding: 1rem; 
                  border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); 
                  z-index: 10000; max-width: 300px;">
        <h4 style="margin: 0 0 0.5rem 0;">Session Expiring</h4>
        <p style="margin: 0 0 1rem 0; font-size: 14px;">
          Your session will expire in 1 minute due to inactivity.
        </p>
        <div style="display: flex; gap: 8px;">
          <button onclick="checkoutProtection.extendSession()" 
                  style="padding: 6px 12px; background: #ffc107; color: #000; 
                         border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
            Extend
          </button>
          <button onclick="checkoutProtection.logout()" 
                  style="padding: 6px 12px; background: #dc3545; color: white; 
                         border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
            Logout
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(warningEl);
  }

  startCheckoutCountdown() {
    let timeLeft = 180; // 3 minutes
    const countdownEl = document.getElementById('checkout-countdown');
    
    this.countdownTimer = setInterval(() => {
      timeLeft--;
      
      if (countdownEl) {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Change color as time runs out
        if (timeLeft <= 60) {
          countdownEl.style.color = '#dc3545';
          countdownEl.style.animation = 'pulse 1s infinite';
        } else if (timeLeft <= 120) {
          countdownEl.style.color = '#fd7e14';
        }
      }
      
      if (timeLeft <= 0) {
        clearInterval(this.countdownTimer);
      }
    }, 1000);
  }

  continueCheckout() {
    this.idleManager.reset();
    this.hideWarning();
    console.log('Checkout continued');
  }

  saveAndExit() {
    this.autoSaveCheckoutProgress();
    this.endCheckout('saved');
    this.hideWarning();
    
    // Show save confirmation
    this.showSaveConfirmation();
    
    // Redirect to cart
    setTimeout(() => {
      window.location.href = '/cart';
    }, 2000);
  }

  abandonCheckout() {
    this.endCheckout('abandoned');
    this.clearSavedProgress();
    this.hideWarning();
    
    // Redirect to home
    window.location.href = '/';
  }

  handleCheckoutTimeout() {
    // Auto-save before timeout
    this.autoSaveCheckoutProgress();
    this.endCheckout('timeout');
    
    // Show timeout message and redirect
    this.showTimeoutMessage();
    setTimeout(() => {
      window.location.href = '/cart?restored=true';
    }, 3000);
  }

  handleRegularTimeout() {
    window.location.href = '/login';
  }

  showTimeoutMessage() {
    const messageEl = document.createElement('div');
    messageEl.innerHTML = `
      <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                  background: white; padding: 2rem; border-radius: 12px; text-align: center; 
                  box-shadow: 0 8px 24px rgba(0,0,0,0.3); z-index: 10001;">
        <div style="font-size: 48px; margin-bottom: 1rem;">Save</div>
        <h3 style="margin: 0 0 1rem 0;">Checkout Progress Saved</h3>
        <p>Your checkout session expired, but don't worry!<br>
           Your progress has been saved and you'll be redirected to your cart.</p>
        <div style="margin-top: 1rem; color: #666; font-size: 14px;">
          Redirecting in 3 seconds...
        </div>
      </div>
    `;
    document.body.appendChild(messageEl);
  }

  showSaveConfirmation() {
    const confirmEl = document.createElement('div');
    confirmEl.innerHTML = `
      <div style="position: fixed; top: 20px; right: 20px; 
                  background: #d4edda; color: #155724; padding: 1rem; 
                  border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); 
                  z-index: 10000;">
        Checkout progress saved successfully!
      </div>
    `;
    document.body.appendChild(confirmEl);
    
    setTimeout(() => {
      confirmEl.remove();
    }, 3000);
  }

  showAutoSaveIndicator() {
    let indicator = document.getElementById('auto-save-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'auto-save-indicator';
      indicator.style.cssText = `
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: #28a745;
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;
      document.body.appendChild(indicator);
    }
    
    indicator.textContent = 'Progress saved';
    indicator.style.opacity = '1';
    
    setTimeout(() => {
      indicator.style.opacity = '0';
    }, 2000);
  }

  showCheckoutStatus() {
    const statusEl = document.createElement('div');
    statusEl.id = 'checkout-status';
    statusEl.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: #007bff;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 1000;
    `;
    statusEl.innerHTML = `
      Checkout Protection Active<br>
      <small>Extended timeout: 30 minutes</small>
    `;
    
    document.body.appendChild(statusEl);
  }

  hideCheckoutStatus() {
    const statusEl = document.getElementById('checkout-status');
    if (statusEl) {
      statusEl.remove();
    }
  }

  hideWarning() {
    const warnings = document.querySelectorAll('#checkout-warning, #regular-warning');
    warnings.forEach(warning => warning.remove());
    
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  formatCheckoutTime() {
    if (!this.checkoutStartTime) return '0m';
    
    const elapsed = Date.now() - this.checkoutStartTime;
    const minutes = Math.floor(elapsed / 60000);
    return `${minutes}m`;
  }

  clearSavedProgress() {
    localStorage.removeItem('checkout_progress');
    console.log('Checkout progress cleared');
  }

  restoreProgress() {
    const saved = localStorage.getItem('checkout_progress');
    if (saved) {
      try {
        const progressData = JSON.parse(saved);
        this.restoreFormData(progressData.formData);
        console.log('Checkout progress restored');
        return true;
      } catch (e) {
        console.error('Failed to restore checkout progress:', e);
      }
    }
    return false;
  }

  restoreFormData(formData) {
    Object.entries(formData).forEach(([formName, fields]) => {
      const form = document.querySelector(`form[data-checkout-form="${formName}"]`);
      if (form) {
        Object.entries(fields).forEach(([fieldName, value]) => {
          const field = form.querySelector(`[name="${fieldName}"]`);
          if (field && value) {
            field.value = value;
          }
        });
      }
    });
  }

  extendSession() {
    this.idleManager.reset();
    this.hideWarning();
  }

  logout() {
    this.idleManager.stop();
    window.location.href = '/login';
  }

  start() {
    this.idleManager.watch();
    console.log('Checkout protection started');
  }

  stop() {
    this.idleManager.stop();
    console.log('Checkout protection stopped');
  }
}

// Usage Example
const checkoutProtection = new CheckoutProtection(
  { items: [{ id: 1, name: 'Product A' }] },
  { idleTimeout: 1800000, warningTimeout: 180000 }
);

checkoutProtection.start();

// Start checkout protection when user enters checkout
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('/checkout')) {
    checkoutProtection.startCheckout();
    
    // Attempt to restore progress
    if (checkoutProtection.restoreProgress()) {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
        background: #d4edda; color: #155724; padding: 12px 20px;
        border-radius: 8px; z-index: 1000;
      `;
      notification.textContent = 'Your checkout progress has been restored!';
      document.body.appendChild(notification);
      
      setTimeout(() => notification.remove(), 5000);
    }
  }
});

// Make available globally
window.checkoutProtection = checkoutProtection;
```

## Testing Examples

### Unit Testing with Jest

```javascript
// idle-manager.test.js
import { IdleManager } from '@idle-detection/core';

describe('IdleManager', () => {
  let idleManager;
  let mockEvents;

  beforeEach(() => {
    mockEvents = {};
    
    // Mock document event listeners
    global.document = {
      addEventListener: jest.fn((event, handler) => {
        mockEvents[event] = mockEvents[event] || [];
        mockEvents[event].push(handler);
      }),
      removeEventListener: jest.fn()
    };

    idleManager = new IdleManager({
      idleTimeout: 5000,
      warningTimeout: 2000,
      checkInterval: 100
    });
  });

  afterEach(() => {
    if (idleManager) {
      idleManager.stop();
    }
    jest.clearAllTimers();
  });

  test('should initialize with correct configuration', () => {
    expect(idleManager.idleTimeout).toBe(5000);
    expect(idleManager.warningTimeout).toBe(2000);
  });

  test('should start monitoring when watch() is called', () => {
    const startHandler = jest.fn();
    idleManager.on('start', startHandler);

    idleManager.watch();

    expect(startHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        timestamp: expect.any(Number)
      })
    );
  });

  test('should detect user activity', (done) => {
    const activityHandler = jest.fn();
    idleManager.on('activity', activityHandler);

    idleManager.watch();

    // Simulate mouse activity
    const mouseEvent = new Event('mousedown');
    mockEvents.mousedown[0](mouseEvent);

    setTimeout(() => {
      expect(activityHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'mousedown',
          timestamp: expect.any(Number)
        })
      );
      done();
    }, 50);
  });

  test('should trigger idle state after timeout', (done) => {
    const idleStartHandler = jest.fn();
    idleManager.on('idle-start', idleStartHandler);

    idleManager.watch();

    // Fast-forward time
    jest.advanceTimersByTime(5000);

    setTimeout(() => {
      expect(idleStartHandler).toHaveBeenCalled();
      done();
    }, 200);
  });

  test('should reset timer on activity during warning', (done) => {
    const idleStartHandler = jest.fn();
    const idleEndHandler = jest.fn();

    idleManager.on('idle-start', idleStartHandler);
    idleManager.on('idle-end', idleEndHandler);

    idleManager.watch();

    // Trigger idle state
    jest.advanceTimersByTime(5000);

    setTimeout(() => {
      expect(idleStartHandler).toHaveBeenCalled();

      // Simulate activity during warning
      const mouseEvent = new Event('mousedown');
      mockEvents.mousedown[0](mouseEvent);

      setTimeout(() => {
        expect(idleEndHandler).toHaveBeenCalled();
        done();
      }, 50);
    }, 200);
  });

  test('should trigger timeout after warning period', (done) => {
    const timeoutHandler = jest.fn();
    idleManager.on('timeout', timeoutHandler);

    idleManager.watch();

    // Fast-forward through idle and warning periods
    jest.advanceTimersByTime(7000); // 5000 + 2000

    setTimeout(() => {
      expect(timeoutHandler).toHaveBeenCalled();
      done();
    }, 200);
  });

  test('should stop monitoring when stop() is called', () => {
    const stopHandler = jest.fn();
    idleManager.on('stop', stopHandler);

    idleManager.watch();
    idleManager.stop();

    expect(stopHandler).toHaveBeenCalled();
    expect(global.document.removeEventListener).toHaveBeenCalled();
  });

  test('should handle configuration updates', () => {
    idleManager.setIdleTimeout(10000);
    idleManager.setWarningTimeout(3000);

    expect(idleManager.idleTimeout).toBe(10000);
    expect(idleManager.warningTimeout).toBe(3000);
  });
});

// Integration test example
describe('IdleManager Integration', () => {
  test('should handle complete idle flow', async () => {
    const events = [];
    const idleManager = new IdleManager({
      idleTimeout: 1000,
      warningTimeout: 500,
      checkInterval: 50
    });

    // Record all events
    ['start', 'activity', 'idle-start', 'timeout', 'idle-end', 'stop'].forEach(event => {
      idleManager.on(event, (data) => {
        events.push({ event, timestamp: Date.now(), data });
      });
    });

    // Start monitoring
    idleManager.watch();

    // Wait for idle state
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Simulate activity to interrupt
    idleManager.reset();

    // Wait a bit then stop
    await new Promise(resolve => setTimeout(resolve, 200));
    idleManager.stop();

    // Verify event sequence
    expect(events.map(e => e.event)).toEqual([
      'start',
      'idle-start',
      'activity',
      'idle-end',
      'stop'
    ]);
  });
});
```

### E2E Testing with Cypress

```javascript
// cypress/integration/idle-detection.spec.js
describe('Idle Detection', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.window().then((win) => {
      // Setup idle manager for testing
      win.testIdleManager = new win.IdleManager({
        idleTimeout: 3000,  // 3 seconds for fast testing
        warningTimeout: 2000 // 2 seconds warning
      });
      
      win.testIdleManager.watch();
    });
  });

  it('should show warning after idle timeout', () => {
    // Wait for idle state
    cy.wait(3000);
    
    // Check that warning is displayed
    cy.get('[data-testid="idle-warning"]').should('be.visible');
    cy.get('[data-testid="idle-warning"]').should('contain', 'Session Expiring');
  });

  it('should reset on user activity', () => {
    // Wait for warning to appear
    cy.wait(3000);
    cy.get('[data-testid="idle-warning"]').should('be.visible');
    
    // Simulate user activity
    cy.get('body').click();
    
    // Warning should disappear
    cy.get('[data-testid="idle-warning"]').should('not.exist');
  });

  it('should extend session when button clicked', () => {
    // Wait for warning
    cy.wait(3000);
    cy.get('[data-testid="idle-warning"]').should('be.visible');
    
    // Click extend session
    cy.get('[data-testid="extend-session-btn"]').click();
    
    // Warning should disappear
    cy.get('[data-testid="idle-warning"]').should('not.exist');
    
    // Should not timeout for extended period
    cy.wait(2000);
    cy.get('[data-testid="idle-warning"]').should('not.exist');
  });

  it('should logout after timeout', () => {
    // Wait for warning and then timeout
    cy.wait(5000);
    
    // Should redirect to login
    cy.url().should('include', '/login');
  });

  it('should handle multi-tab coordination', () => {
    // Open second tab
    cy.window().then((win) => {
      const newTab = win.open('/', '_blank');
      
      // Simulate activity in new tab
      cy.wrap(newTab).then((tab) => {
        tab.document.dispatchEvent(new tab.MouseEvent('click'));
      });
    });
    
    // Both tabs should remain active
    cy.wait(2000);
    cy.get('[data-testid="idle-warning"]').should('not.exist');
  });
});

// Performance testing
describe('Idle Detection Performance', () => {
  it('should handle high frequency events efficiently', () => {
    cy.visit('/');
    
    cy.window().then((win) => {
      const idleManager = new win.IdleManager({
        idleTimeout: 10000,
        warningTimeout: 2000,
        events: ['mousemove'] // High frequency event
      });
      
      idleManager.watch();
      
      // Measure performance
      const startTime = performance.now();
      
      // Simulate many mouse moves
      for (let i = 0; i < 1000; i++) {
        win.document.dispatchEvent(new win.MouseEvent('mousemove', {
          clientX: i % 100,
          clientY: i % 100
        }));
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should handle 1000 events quickly
      expect(duration).to.be.lessThan(100); // Less than 100ms
    });
  });
});
```

These examples demonstrate various real-world scenarios and testing approaches for the core idle detection library. Each example includes complete, working code that can be adapted to specific requirements.
