import { 
  Idle, 
  IdleEvent, 
  DEFAULT_INTERRUPTSOURCES,
  LocalStorageExpiry 
} from '@idle-detection/core';

// Basic idle detection setup
const idle = new Idle({
  idleTimeout: 15 * 60 * 1000,    // 15 minutes
  warningTimeout: 2 * 60 * 1000,  // 2 minutes warning
  autoResume: true
});

// Set up default interrupt sources
idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

// Set up multi-tab coordination
idle.setExpiry(new LocalStorageExpiry());

// Event handlers
idle.on(IdleEvent.IDLE_START, (event, state) => {
  console.log('User went idle at:', state.lastActivity);
  
  // Show idle notification
  showNotification('You appear to be idle', 'warning');
});

idle.on(IdleEvent.WARNING_START, (event, state) => {
  console.log('Warning: User will timeout soon');
  
  // Show warning dialog with countdown
  showWarningDialog();
  startCountdown();
});

idle.on(IdleEvent.INTERRUPT, (event, state) => {
  console.log('User is active again');
  
  // Hide any notifications
  hideNotification();
  hideWarningDialog();
});

idle.on(IdleEvent.TIMEOUT, (event, state) => {
  console.log('User timed out');
  
  // Redirect to login or show timeout message
  window.location.href = '/login?reason=timeout';
});

// Start monitoring
idle.watch();

// Example UI functions (implement based on your UI framework)
function showNotification(message: string, type: 'info' | 'warning' | 'error') {
  // Implementation depends on your notification system
  console.log(`[${type.toUpperCase()}] ${message}`);
}

function hideNotification() {
  // Hide the notification
}

function showWarningDialog() {
  // Show modal/dialog warning about impending timeout
  const dialog = document.createElement('div');
  dialog.id = 'idle-warning-dialog';
  dialog.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal-content">
        <h2>Session Timeout Warning</h2>
        <p>Your session will expire in <span id="countdown">120</span> seconds due to inactivity.</p>
        <button onclick="extendSession()">Stay Logged In</button>
        <button onclick="logoutNow()">Logout Now</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);
}

function hideWarningDialog() {
  const dialog = document.getElementById('idle-warning-dialog');
  if (dialog) {
    dialog.remove();
  }
}

let countdownInterval: NodeJS.Timeout;

function startCountdown() {
  let timeLeft = 120; // 2 minutes in seconds
  
  countdownInterval = setInterval(() => {
    timeLeft--;
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
      countdownElement.textContent = timeLeft.toString();
    }
    
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
    }
  }, 1000);
}

// Global functions for dialog buttons
(window as any).extendSession = () => {
  idle.reset();
  hideWarningDialog();
  clearInterval(countdownInterval);
};

(window as any).logoutNow = () => {
  idle.stop();
  window.location.href = '/login?reason=manual';
};

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  idle.stop();
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});