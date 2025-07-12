// Debug current extend session functionality - find what's broken
const { Idle, IdleEvent } = require('./packages/core/dist/index');

console.log('🔍 Debugging Current Extend Session Functionality');
console.log('=================================================\n');

// Test with user's exact configuration
const USER_CONFIG = {
  idleTimeout: 40 * 1000,    // Warning at 40 seconds
  warningTimeout: 20 * 1000  // Logout at 60 seconds (40+20)
};

console.log('User Configuration:');
console.log('- Warning should appear at:', USER_CONFIG.idleTimeout / 1000, 'seconds');
console.log('- Logout should occur at:', (USER_CONFIG.idleTimeout + USER_CONFIG.warningTimeout) / 1000, 'seconds');
console.log('');

let startTime = null;
let events = [];
let extendAttempted = false;

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

function createDebugIdleManager() {
  const idle = new Idle(USER_CONFIG);
  
  idle.on(IdleEvent.IDLE_START, () => {
    logEvent('🔔 IDLE_START - This should trigger warning');
  });
  
  idle.on(IdleEvent.WARNING_START, () => {
    logEvent('⚠️ WARNING_START - Warning should be visible');
  });
  
  idle.on(IdleEvent.TIMEOUT, () => {
    logEvent('🚨 TIMEOUT - User logged out');
    if (extendAttempted) {
      logEvent('❌ CRITICAL: Logout occurred AFTER extend attempt');
    }
  });
  
  idle.on(IdleEvent.IDLE_END, () => {
    logEvent('✅ IDLE_END - Extend session should have worked');
  });
  
  idle.on(IdleEvent.INTERRUPT, () => {
    logEvent('🔄 INTERRUPT - Activity detected');
  });
  
  return idle;
}

function simulateExtendSession(idle) {
  extendAttempted = true;
  logEvent('🔄 EXTEND SESSION ATTEMPT - User clicks extend');
  
  console.log('   📝 Current state before extend:', JSON.stringify(idle.getState()));
  
  // What the Angular service does:
  console.log('   1. Stopping idle manager...');
  idle.stop();
  
  console.log('   2. Reconfiguring timeouts...');
  idle.setIdleTimeout(USER_CONFIG.idleTimeout);
  idle.setWarningTimeout(USER_CONFIG.warningTimeout);
  
  console.log('   3. Restarting idle detection...');
  idle.watch();
  
  console.log('   📝 Current state after extend:', JSON.stringify(idle.getState()));
  
  logEvent('✅ EXTEND SESSION COMPLETED');
}

async function runDebugTest() {
  console.log('🚀 Starting debug test...\n');
  
  const idle = createDebugIdleManager();
  startTime = Date.now();
  logEvent('DEBUG TEST START');
  
  idle.watch();
  
  // Wait for warning to appear
  setTimeout(() => {
    logEvent('📍 40s MARK - Warning should appear now');
  }, 40000);
  
  // Attempt extend session during warning (at 45s)
  setTimeout(() => {
    logEvent('📍 45s MARK - Attempting extend session during warning');
    simulateExtendSession(idle);
  }, 45000);
  
  // Check what happens at original logout time (60s)
  setTimeout(() => {
    logEvent('📍 60s MARK - Original logout time - should NOT logout');
    const state = idle.getState();
    console.log('   Current state at 60s:', JSON.stringify(state));
    
    if (state.isTimedOut) {
      logEvent('❌ FAILURE: User logged out at 60s despite extend');
    } else {
      logEvent('✅ SUCCESS: User still active at 60s after extend');
    }
  }, 60000);
  
  // Check for new warning after extend (should be at 85s = 45s extend + 40s)
  setTimeout(() => {
    logEvent('📍 85s MARK - New warning should appear after extend');
  }, 85000);
  
  // Final analysis
  setTimeout(() => {
    console.log('\n📊 Debug Test Analysis');
    console.log('======================');
    
    console.log('\nEvent Timeline:');
    events.forEach((event, index) => {
      console.log(`${index + 1}. [${event.elapsedSeconds}s] ${event.name}`);
    });
    
    const warnings = events.filter(e => e.name.includes('WARNING_START'));
    const timeouts = events.filter(e => e.name.includes('TIMEOUT'));
    const idleEnds = events.filter(e => e.name.includes('IDLE_END'));
    const extendAttempts = events.filter(e => e.name.includes('EXTEND SESSION'));
    
    console.log('\n🔍 Analysis:');
    console.log(`- Warning events: ${warnings.length}`);
    console.log(`- Timeout events: ${timeouts.length}`);
    console.log(`- Idle end events: ${idleEnds.length}`);
    console.log(`- Extend attempts: ${extendAttempts.length}`);
    
    console.log('\n🎯 Expected Behavior:');
    console.log('1. Warning at 40s ✓');
    console.log('2. Extend at 45s ✓');
    console.log('3. NO timeout at 60s ← Critical test');
    console.log('4. New warning at 85s ✓');
    
    if (timeouts.length > 0) {
      const timeoutEvent = timeouts[0];
      console.log(`\n❌ EXTEND SESSION FAILURE DETECTED!`);
      console.log(`   Timeout occurred at: ${timeoutEvent.elapsedSeconds}s`);
      console.log(`   This indicates extend session is not working`);
      
      if (timeoutEvent.elapsedSeconds === 60) {
        console.log('   🚨 CRITICAL: Original timeout timer was not cleared');
      }
    } else {
      console.log('\n✅ EXTEND SESSION WORKING CORRECTLY');
      console.log('   No unexpected timeouts detected');
    }
    
    idle.stop();
  }, 90000);
}

console.log('⏱️ Test will run for 90 seconds to verify extend session behavior...\n');
runDebugTest().catch(console.error);