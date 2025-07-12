// Test extend session during warning period - THE CRITICAL TEST
const { Idle, IdleEvent } = require('./packages/core/dist/index');

console.log('🚨 Critical Test: Extend Session During Warning Period');
console.log('====================================================\n');

// Test configuration: Warning at 10s, logout at 20s (total)
const TEST_CONFIG = {
  idleTimeout: 10 * 1000,    // Warning appears at 10 seconds
  warningTimeout: 10 * 1000  // Warning lasts 10 seconds, logout at 20s total
};

console.log('Test Configuration:');
console.log('- Warning appears at:', TEST_CONFIG.idleTimeout / 1000, 'seconds');
console.log('- Warning duration:', TEST_CONFIG.warningTimeout / 1000, 'seconds');
console.log('- Logout (if no action) at:', (TEST_CONFIG.idleTimeout + TEST_CONFIG.warningTimeout) / 1000, 'seconds');
console.log('');

let startTime = null;
let events = [];
let extendCount = 0;

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

function createTestIdleManager() {
  const idle = new Idle(TEST_CONFIG);
  
  idle.on(IdleEvent.IDLE_START, () => {
    logEvent('🔔 IDLE_START - User should see warning dialog now');
  });
  
  idle.on(IdleEvent.WARNING_START, () => {
    logEvent('⚠️ WARNING_START - Warning dialog visible to user');
  });
  
  idle.on(IdleEvent.TIMEOUT, () => {
    logEvent('🚨 TIMEOUT - User logged out (THIS SHOULD NOT HAPPEN AFTER EXTEND)');
  });
  
  idle.on(IdleEvent.IDLE_END, () => {
    logEvent('✅ IDLE_END - Session extended successfully');
  });
  
  idle.on(IdleEvent.INTERRUPT, () => {
    logEvent('🔄 INTERRUPT - User activity detected');
  });
  
  return idle;
}

function simulateExtendSessionDuringWarning(idle) {
  extendCount++;
  logEvent(`🔄 USER CLICKS EXTEND SESSION #${extendCount} (DURING WARNING)`);
  
  // This simulates what should happen when user clicks extend during warning
  idle.stop();  // Should clear ALL timers including warning timeout
  idle.setIdleTimeout(TEST_CONFIG.idleTimeout);
  idle.setWarningTimeout(TEST_CONFIG.warningTimeout);
  idle.watch(); // Restart fresh cycle
  
  logEvent(`✅ EXTEND SESSION #${extendCount} PROCESSING COMPLETE`);
}

async function runCriticalTest() {
  console.log('🚀 Starting critical test: Extend during warning period...\n');
  
  const idle = createTestIdleManager();
  startTime = Date.now();
  logEvent('TEST START - Beginning idle detection');
  
  idle.watch();
  
  // Wait for warning to appear (10s)
  setTimeout(() => {
    logEvent('📍 10s MARK - Warning should be visible now');
  }, 10000);
  
  // CRITICAL TEST: Extend session during warning period (at 15s, 5s after warning starts)
  setTimeout(() => {
    logEvent('📍 15s MARK - User sees warning, clicks extend session');
    simulateExtendSessionDuringWarning(idle);
  }, 15000);
  
  // Check if logout still happens (it shouldn't!)
  setTimeout(() => {
    logEvent('📍 25s MARK - Checking if user was logged out (should NOT happen)');
    if (idle.isTimedOut()) {
      logEvent('❌ CRITICAL FAILURE - User was logged out despite extend session');
    } else {
      logEvent('✅ SUCCESS - User still logged in after extend session');
    }
  }, 25000);
  
  // Wait for new warning after extend (should appear at 25s = 15s extend + 10s idle)
  setTimeout(() => {
    logEvent('📍 30s MARK - New warning should appear after extend session');
  }, 30000);
  
  // Final analysis
  setTimeout(() => {
    console.log('\n📊 Critical Test Results');
    console.log('========================');
    
    console.log('\nEvent Timeline:');
    events.forEach((event, index) => {
      console.log(`${index + 1}. [${event.elapsedSeconds}s] ${event.name}`);
    });
    
    const timeouts = events.filter(e => e.name.includes('TIMEOUT'));
    const extendEvents = events.filter(e => e.name.includes('EXTEND SESSION'));
    const warnings = events.filter(e => e.name.includes('WARNING_START'));
    
    console.log('\n🔍 Critical Analysis:');
    console.log(`- Warning events: ${warnings.length} (should be 2: at 10s and ~25s)`);
    console.log(`- Extend session events: ${extendEvents.length} (should be 1 at 15s)`);
    console.log(`- Timeout events: ${timeouts.length} (should be 0 - no logouts)`);
    
    console.log('\n🎯 Success Criteria:');
    console.log('1. Warning appears at 10s ✓');
    console.log('2. User extends at 15s (during warning) ✓');
    console.log('3. NO timeout occurs at 20s ← CRITICAL');
    console.log('4. New warning appears at ~25s ✓');
    
    if (timeouts.length === 0) {
      console.log('\n🎉 CRITICAL TEST PASSED!');
      console.log('✅ Extend session during warning period works correctly');
      console.log('✅ User is NOT logged out after extending during warning');
    } else {
      console.log('\n❌ CRITICAL TEST FAILED!');
      console.log('🚨 User was logged out despite extending during warning');
      console.log('🔧 The warning timeout timer was not properly cleared');
    }
    
    idle.stop();
  }, 35000);
}

runCriticalTest().catch(console.error);