import { 
  Idle, 
  IdleEvent,
  DocumentInterruptSource,
  WindowInterruptSource,
  ElementInterruptSource,
  LocalStorageExpiry,
  CustomInterruptSource
} from '@idle-detection/core';
import { HttpKeepalive } from '@idle-detection/keepalive';

// Advanced idle detection with custom configuration
class AdvancedIdleManager {
  private idle: Idle;
  private keepalive: HttpKeepalive;
  private warningTimer: NodeJS.Timeout | null = null;
  
  constructor() {
    this.idle = new Idle({
      idleTimeout: 30 * 60 * 1000,    // 30 minutes
      warningTimeout: 5 * 60 * 1000,  // 5 minutes warning
      idleName: 'advancedApp',
      autoResume: true
    });
    
    this.setupInterruptSources();
    this.setupExpiry();
    this.setupKeepalive();
    this.setupEventListeners();
  }
  
  private setupInterruptSources() {
    // Custom interrupt source for video/audio activity
    const mediaActivitySource = new CustomInterruptSource(() => {
      const mediaElements = document.querySelectorAll('video, audio');
      return Array.from(mediaElements).some(media => 
        (media as HTMLMediaElement).currentTime > 0 && 
        !(media as HTMLMediaElement).paused
      );
    }, 10000); // Check every 10 seconds
    
    // Form interaction source
    const formElement = document.getElementById('main-form');
    const formInterruptSource = formElement 
      ? new ElementInterruptSource(formElement, 'input change focus blur')
      : null;
    
    // Set up interrupt sources
    const sources = [
      new DocumentInterruptSource('keydown mousedown touchstart scroll'),
      new WindowInterruptSource('focus blur resize'),
      mediaActivitySource
    ];
    
    if (formInterruptSource) {
      sources.push(formInterruptSource);
    }
    
    this.idle.setInterrupts(sources);
  }
  
  private setupExpiry() {
    // Use localStorage for multi-tab coordination
    this.idle.setExpiry(new LocalStorageExpiry('advancedApp'));
  }
  
  private setupKeepalive() {
    this.keepalive = new HttpKeepalive({
      url: '/api/session/keepalive',
      interval: 15 * 60 * 1000, // 15 minutes
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: { 
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      },
      timeout: 30000, // 30 seconds
      retryAttempts: 3,
      retryDelay: 2000,
      onPing: () => {
        this.logActivity('keepalive_ping');
      },
      onSuccess: (response) => {
        this.logActivity('keepalive_success', { status: response.status });
      },
      onFailure: (error) => {
        this.logActivity('keepalive_failure', { error: error.message });
        this.handleKeepaliveFailure(error);
      }
    });
    
    this.idle.setKeepalive(this.keepalive);
  }
  
  private setupEventListeners() {
    this.idle.on(IdleEvent.IDLE_START, (event, state) => {
      this.logActivity('idle_start', { 
        idleTime: state.idleTime,
        lastActivity: state.lastActivity 
      });
      
      this.showIdleNotification();
    });
    
    this.idle.on(IdleEvent.WARNING_START, (event, state) => {
      this.logActivity('warning_start', { 
        totalIdleTime: state.idleTime 
      });
      
      this.showWarningDialog();
      this.startWarningCountdown();
    });
    
    this.idle.on(IdleEvent.INTERRUPT, (event, state) => {
      this.logActivity('user_interrupt', { 
        wasIdle: state.isIdle,
        wasWarning: state.isWarning 
      });
      
      this.hideAllNotifications();
      this.stopWarningCountdown();
    });
    
    this.idle.on(IdleEvent.TIMEOUT, (event, state) => {
      this.logActivity('timeout', { 
        totalIdleTime: state.idleTime 
      });
      
      this.handleTimeout();
    });
    
    this.idle.on(IdleEvent.IDLE_END, (event, state) => {
      this.logActivity('idle_end');
    });
  }
  
  private showIdleNotification() {
    // Create a subtle notification
    const notification = document.createElement('div');
    notification.id = 'idle-notification';
    notification.className = 'idle-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">⏰</span>
        <span class="notification-text">You appear to be idle</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      const element = document.getElementById('idle-notification');
      if (element) element.remove();
    }, 5000);
  }
  
  private showWarningDialog() {
    const dialog = document.createElement('div');
    dialog.id = 'idle-warning-modal';
    dialog.className = 'idle-warning-modal';
    dialog.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Session Timeout Warning</h2>
            <span class="modal-close" onclick="this.closest('.idle-warning-modal').remove()">×</span>
          </div>
          <div class="modal-body">
            <p>Your session will expire in <strong id="warning-countdown">300</strong> seconds due to inactivity.</p>
            <p>Any unsaved changes will be lost.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" onclick="advancedIdleManager.extendSession()">
              Stay Logged In
            </button>
            <button class="btn btn-secondary" onclick="advancedIdleManager.saveAndLogout()">
              Save & Logout
            </button>
            <button class="btn btn-danger" onclick="advancedIdleManager.logoutNow()">
              Logout Now
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Focus on the primary button
    const primaryButton = dialog.querySelector('.btn-primary') as HTMLButtonElement;
    if (primaryButton) {
      primaryButton.focus();
    }
  }
  
  private startWarningCountdown() {
    let timeLeft = 300; // 5 minutes in seconds
    
    this.warningTimer = setInterval(() => {
      timeLeft--;
      const countdownElement = document.getElementById('warning-countdown');
      if (countdownElement) {
        countdownElement.textContent = timeLeft.toString();
        
        // Change color as time runs out
        if (timeLeft <= 60) {
          countdownElement.style.color = '#e74c3c';
        } else if (timeLeft <= 120) {
          countdownElement.style.color = '#f39c12';
        }
      }
      
      if (timeLeft <= 0) {
        this.stopWarningCountdown();
      }
    }, 1000);
  }
  
  private stopWarningCountdown() {
    if (this.warningTimer) {
      clearInterval(this.warningTimer);
      this.warningTimer = null;
    }
  }
  
  private hideAllNotifications() {
    const notifications = [
      'idle-notification',
      'idle-warning-modal'
    ];
    
    notifications.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.remove();
    });
  }
  
  private handleTimeout() {
    this.hideAllNotifications();
    this.saveFormData();
    
    // Show timeout message
    const timeoutModal = document.createElement('div');
    timeoutModal.className = 'timeout-modal';
    timeoutModal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <h2>Session Expired</h2>
          <p>Your session has expired due to inactivity.</p>
          <p>Any unsaved changes have been automatically saved as a draft.</p>
          <button class="btn btn-primary" onclick="window.location.href='/login'">
            Login Again
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(timeoutModal);
    
    // Redirect after 10 seconds
    setTimeout(() => {
      window.location.href = '/login?reason=timeout';
    }, 10000);
  }
  
  private handleKeepaliveFailure(error: Error) {
    console.error('Keepalive failed:', error);
    
    // Show connection error notification
    const notification = document.createElement('div');
    notification.className = 'connection-error-notification';
    notification.innerHTML = `
      <div class="notification-content error">
        <span class="notification-icon">⚠️</span>
        <span class="notification-text">Connection to server lost</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(notification);
  }
  
  private saveFormData() {
    // Save form data to localStorage as draft
    const forms = document.querySelectorAll('form');
    forms.forEach((form, index) => {
      const formData = new FormData(form);
      const data: { [key: string]: any } = {};
      
      formData.forEach((value, key) => {
        data[key] = value;
      });
      
      localStorage.setItem(`form_draft_${index}`, JSON.stringify({
        data,
        timestamp: Date.now(),
        url: window.location.href
      }));
    });
  }
  
  private logActivity(type: string, data: any = {}) {
    const logEntry = {
      type,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...data
    };
    
    console.log('[IdleActivity]', logEntry);
    
    // Send to analytics or logging service
    // fetch('/api/activity-log', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(logEntry)
    // });
  }
  
  // Public methods for UI interaction
  public extendSession() {
    this.idle.reset();
    this.hideAllNotifications();
    this.logActivity('session_extended');
  }
  
  public saveAndLogout() {
    this.saveFormData();
    this.idle.stop();
    this.logActivity('manual_logout_with_save');
    window.location.href = '/login?reason=manual';
  }
  
  public logoutNow() {
    this.idle.stop();
    this.logActivity('manual_logout');
    window.location.href = '/login?reason=manual';
  }
  
  public start() {
    this.idle.watch();
    this.logActivity('idle_detection_started');
  }
  
  public stop() {
    this.idle.stop();
    this.hideAllNotifications();
    this.stopWarningCountdown();
    this.logActivity('idle_detection_stopped');
  }
  
  public getState() {
    return this.idle.getState();
  }
}

// Create global instance
const advancedIdleManager = new AdvancedIdleManager();

// Make it available globally for UI buttons
(window as any).advancedIdleManager = advancedIdleManager;

// Start monitoring when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    advancedIdleManager.start();
  });
} else {
  advancedIdleManager.start();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  advancedIdleManager.stop();
});