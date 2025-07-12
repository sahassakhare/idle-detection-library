// COMPREHENSIVE DEBUG: Full Angular Service Simulation
const { Idle, IdleEvent } = require('./packages/core/dist/index');

console.log('🔍 FULL ANGULAR SERVICE DEBUG');
console.log('==============================\n');

const CONFIG = {
  idleTimeout: 40 * 1000,    // Warning at 40 seconds
  warningTimeout: 20 * 1000  // Logout at 60 seconds (40+20)
};

console.log('Testing with Angular Service Simulation:');
console.log('- idleTimeout:', CONFIG.idleTimeout / 1000, 's (warning trigger)');
console.log('- warningTimeout:', CONFIG.warningTimeout / 1000, 's (warning duration)');
console.log('- Expected warning at:', CONFIG.idleTimeout / 1000, 's');
console.log('- Expected logout at:', (CONFIG.idleTimeout + CONFIG.warningTimeout) / 1000, 's');
console.log('- User reports logout at: 40s (same as warning time!)');
console.log('');

// Simulate Angular service behavior
class FullAngularServiceDebug {
  constructor() {
    this.idleManager = new Idle(CONFIG);
    this.countdownTimer$ = { next: () => this.stopCountdown() };
    this.destroy$ = { next: () => {}, complete: () => {} };
    this.extendSessionCount = 0;
    this.countdownActive = false;
    this.countdownInterval = null;
    this.startTime = Date.now();
    
    this.setupIdleDetection();
  }
  
  log(message) {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    console.log(`[${elapsed}s] ${message}`);
  }
  
  setupIdleDetection() {
    this.log('📋 Setting up idle detection listeners...');
    
    this.idleManager.on(IdleEvent.IDLE_START, () => {
      this.log('🔔 ANGULAR: IDLE_START received - starting warning countdown');
      this.startWarningCountdown(CONFIG.warningTimeout);
    });
    
    this.idleManager.on(IdleEvent.WARNING_START, () => {
      this.log('⚠️ ANGULAR: WARNING_START received');
    });
    
    this.idleManager.on(IdleEvent.TIMEOUT, () => {
      this.log('🚨 ANGULAR: TIMEOUT received - dispatching startIdle action');
      this.log('   📤 This will trigger NgRx logout$ effect');
      this.simulateLogout();
    });
    
    this.idleManager.on(IdleEvent.IDLE_END, () => {
      this.log('✅ ANGULAR: IDLE_END received - stopping countdown');
      this.stopCountdown();
    });
    
    this.idleManager.on(IdleEvent.INTERRUPT, () => {
      this.log('🔄 ANGULAR: INTERRUPT received');
      this.stopCountdown();
    });
  }
  
  startWarningCountdown(warningTimeout) {
    this.log(`🔔 ANGULAR: Starting warning countdown: ${warningTimeout}ms`);
    
    // Stop any existing countdown
    this.stopCountdown();
    
    this.countdownActive = true;
    let remaining = warningTimeout;
    
    this.countdownInterval = setInterval(() => {
      if (!this.countdownActive) {
        clearInterval(this.countdownInterval);
        return;
      }
      
      remaining -= 1000;
      this.log(`⏱️ ANGULAR: Countdown ${Math.floor(remaining / 1000)}s remaining`);
      
      if (remaining <= 0) {
        this.log('⏰ ANGULAR: Countdown complete - but core should handle timeout');
        this.stopCountdown();
      }
    }, 1000);
  }
  
  stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    if (this.countdownActive) {
      this.countdownActive = false;
      this.log('🔕 ANGULAR: Countdown stopped');
    }
  }
  
  simulateLogout() {
    this.log('🚪 ANGULAR: Simulating logout (NgRx effect triggered)');
    this.log('   ❌ USER WOULD BE LOGGED OUT HERE');
  }
  
  extendSession() {
    this.extendSessionCount++;
    this.log(`🔄 ANGULAR: Extending session (Attempt #${this.extendSessionCount})`);
    
    this.log('   1. Stopping countdown timers...');
    this.stopCountdown();
    
    this.log('   2. Stopping idle manager...');
    this.idleManager.stop();
    
    this.log('   3. Reconfiguring...');
    this.idleManager.setIdleTimeout(CONFIG.idleTimeout);
    this.idleManager.setWarningTimeout(CONFIG.warningTimeout);
    
    this.log('   4. Restarting idle detection...');
    this.idleManager.watch();
    
    this.log(`✅ ANGULAR: Session extended successfully`);
  }
  
  start() {
    this.log('🚀 ANGULAR: Starting idle detection');
    this.idleManager.watch();
  }
  
  stop() {
    this.log('🛑 ANGULAR: Stopping idle detection');
    this.stopCountdown();
    this.idleManager.stop();
  }
}

async function runFullAngularDebug() {
  console.log('🚀 Starting full Angular service debug...\n');
  
  const service = new FullAngularServiceDebug();
  service.start();
  
  // Wait for warning (should be at 40s)
  setTimeout(() => {
    service.log('📍 40s MARK - Warning should appear now');
  }, 40000);
  
  // Try to extend session at 45s (5s after warning)
  setTimeout(() => {
    service.log('📍 45s MARK - User clicks extend session');
    service.extendSession();
  }, 45000);
  
  // Check at 60s (expected logout time if no extend)
  setTimeout(() => {
    service.log('📍 60s MARK - Original expected logout time');
    const state = service.idleManager.getState();
    service.log(`   📊 Current state: ${JSON.stringify(state)}`);
    
    if (state.isTimedOut) {
      service.log('❌ User was logged out despite extend session');
    } else {
      service.log('✅ User still active - extend session worked');
    }
  }, 60000);
  
  // Check for new warning after extend (should be at 85s = 45s + 40s)
  setTimeout(() => {
    service.log('📍 85s MARK - New warning should appear');
  }, 85000);
  
  // Final cleanup
  setTimeout(() => {
    service.log('🏁 Test complete');
    service.stop();
  }, 90000);
}

console.log('⏱️ Test will run for 90 seconds to observe full cycle...\n');
runFullAngularDebug().catch(console.error);