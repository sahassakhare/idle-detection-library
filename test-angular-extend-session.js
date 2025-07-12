// Test Angular service layer extend session functionality
// This simulates the actual Angular service behavior

const { Idle, IdleEvent } = require('./packages/core/dist/index');

console.log('🔧 Testing Angular Service Layer Extend Session');
console.log('===============================================\n');

// User's configuration
const CONFIG = {
  idleTimeout: 40 * 1000,    // Warning at 40 seconds
  warningTimeout: 20 * 1000  // Logout at 60 seconds (40+20)
};

console.log('Configuration:');
console.log('- Warning appears at:', CONFIG.idleTimeout / 1000, 'seconds');
console.log('- Logout occurs at:', (CONFIG.idleTimeout + CONFIG.warningTimeout) / 1000, 'seconds');
console.log('');

// Simulate Angular service behavior
class MockAngularIdleService {
  constructor() {
    this.idleManager = new Idle(CONFIG);
    this.countdownTimer$ = { next: () => this.stopCountdown() };
    this.destroy$ = { next: () => {}, complete: () => {} };
    this.extendSessionCount = 0;
    this.countdownActive = false;
    this.countdownInterval = null;
    
    this.setupIdleDetection();
  }
  
  setupIdleDetection() {
    this.idleManager.on(IdleEvent.IDLE_START, () => {
      console.log('🔔 IDLE_START - Starting warning countdown');
      this.startWarningCountdown(CONFIG.warningTimeout);
    });
    
    this.idleManager.on(IdleEvent.WARNING_START, () => {
      console.log('⚠️ WARNING_START - Warning dialog should appear');
    });
    
    this.idleManager.on(IdleEvent.TIMEOUT, () => {
      console.log('🚨 TIMEOUT - User logged out');
      this.stopCountdown();
    });
    
    this.idleManager.on(IdleEvent.IDLE_END, () => {
      console.log('✅ IDLE_END - Session reset');
      this.stopCountdown();
    });
  }
  
  startWarningCountdown(warningTimeout) {
    console.log(`🔔 Starting Angular warning countdown: ${warningTimeout}ms`);
    
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
      console.log(`⏱️ Angular countdown: ${Math.floor(remaining / 1000)}s remaining`);
      
      if (remaining <= 0) {
        console.log('⏰ Angular countdown complete');
        this.stopCountdown();
      }
    }, 1000);
  }
  
  stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this.countdownActive = false;
    console.log('🔕 Angular countdown stopped');
  }
  
  // Simulate the exact Angular service extend session method
  extendSession() {
    this.extendSessionCount++;
    const timestamp = new Date().toISOString();
    console.log(`🔄 [${timestamp}] Extending session (Attempt #${this.extendSessionCount})...`);
    
    // 1. Stop all active timers and processes completely
    console.log('   1. Stopping countdown timers...');
    this.countdownTimer$.next(); // This calls stopCountdown()
    
    console.log('   2. Stopping idle manager completely...');
    this.idleManager.stop(); // Complete stop - clears all timers and interrupts
    
    // 3. Reconfigure idle manager with fresh settings (SYNCHRONOUSLY)
    console.log('   3. Reconfiguring idle manager...');
    this.reconfigureIdleManagerSync();
    
    // 4. Start fresh idle detection cycle
    console.log('   4. Starting fresh idle detection...');
    this.idleManager.watch();
    
    console.log(`✅ [${timestamp}] Session extended successfully (Attempt #${this.extendSessionCount})`);
  }
  
  reconfigureIdleManagerSync() {
    console.log('🔧 Reconfiguring idle manager SYNCHRONOUSLY with timeouts:', {
      idle: CONFIG.idleTimeout,
      warning: CONFIG.warningTimeout
    });
    
    // Ensure timeouts are properly set
    this.idleManager.setIdleTimeout(CONFIG.idleTimeout);
    this.idleManager.setWarningTimeout(CONFIG.warningTimeout);
  }
  
  start() {
    console.log('🚀 Starting Angular idle service');
    this.idleManager.watch();
  }
  
  stop() {
    console.log('🛑 Stopping Angular idle service');
    this.stopCountdown();
    this.idleManager.stop();
  }
}

let startTime = null;
let events = [];

function logEvent(eventName, timestamp = Date.now()) {
  const elapsed = startTime ? timestamp - startTime : 0;
  const event = {
    name: eventName,
    timestamp,
    elapsed,
    elapsedSeconds: Math.floor(elapsed / 1000)
  };
  events.push(event);
  console.log(`[${event.elapsedSeconds}s] ${eventName}`);
  return event;
}

async function testAngularExtendSession() {
  console.log('🚀 Starting Angular service extend session test...\n');
  
  const service = new MockAngularIdleService();
  startTime = Date.now();
  logEvent('TEST START');
  
  service.start();
  
  // Wait for warning (40s)
  setTimeout(() => {
    logEvent('📍 40s MARK - Warning should appear');
  }, 40000);
  
  // Extend session during warning (45s)
  setTimeout(() => {
    logEvent('📍 45s MARK - User clicks extend session');
    service.extendSession();
  }, 45000);
  
  // Check at original logout time (60s) - should NOT logout
  setTimeout(() => {
    logEvent('📍 60s MARK - Should NOT logout (extend session worked)');
    const state = service.idleManager.getState();
    if (state.isTimedOut) {
      logEvent('❌ CRITICAL FAILURE: User logged out despite extend session');
    } else {
      logEvent('✅ SUCCESS: User still active after extend session');
    }
  }, 60000);
  
  // New warning should appear at 85s (45s + 40s)
  setTimeout(() => {
    logEvent('📍 85s MARK - New warning should appear');
  }, 85000);
  
  // Final analysis
  setTimeout(() => {
    console.log('\n📊 Angular Service Test Results');
    console.log('================================');
    
    console.log('\nEvent Timeline:');
    events.forEach((event, index) => {
      console.log(`${index + 1}. [${event.elapsedSeconds}s] ${event.name}`);
    });
    
    const failures = events.filter(e => e.name.includes('FAILURE'));
    const successes = events.filter(e => e.name.includes('SUCCESS'));
    
    console.log('\n🎯 Test Results:');
    console.log(`- Failures: ${failures.length}`);
    console.log(`- Successes: ${successes.length}`);
    
    if (failures.length === 0 && successes.length > 0) {
      console.log('\n🎉 ANGULAR SERVICE EXTEND SESSION TEST PASSED!');
      console.log('✅ Extend session works correctly with Angular service layer');
    } else {
      console.log('\n❌ ANGULAR SERVICE EXTEND SESSION TEST FAILED!');
      console.log('🔧 Angular service layer has issues with extend session');
    }
    
    service.stop();
  }, 90000);
}

console.log('⏱️ Test will run for 90 seconds...\n');
testAngularExtendSession().catch(console.error);