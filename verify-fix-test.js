// Test with the CORRECT configuration to verify the fix
const { Idle, IdleEvent } = require('./packages/core/dist/index');

console.log('✅ Testing CORRECT Configuration');
console.log('=================================\n');

// CORRECT configuration for warning at 40s, logout at 60s
const CORRECT_CONFIG = {
  idleTimeout: 40 * 1000,    // Warning appears at 40 seconds
  warningTimeout: 20 * 1000  // Logout happens 20 seconds later (total: 60s)
};

console.log('CORRECT Configuration:');
console.log('- idleTimeout:', CORRECT_CONFIG.idleTimeout, 'ms (', CORRECT_CONFIG.idleTimeout / 1000, 'seconds) - Warning appears');
console.log('- warningTimeout:', CORRECT_CONFIG.warningTimeout, 'ms (', CORRECT_CONFIG.warningTimeout / 1000, 'seconds) - Warning duration');
console.log('- Total time to logout:', (CORRECT_CONFIG.idleTimeout + CORRECT_CONFIG.warningTimeout) / 1000, 'seconds');
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

function createCorrectIdleManager() {
  const idle = new Idle(CORRECT_CONFIG);
  
  idle.on(IdleEvent.IDLE_START, () => {
    logEvent('🔔 WARNING SHOULD APPEAR NOW');
  });
  
  idle.on(IdleEvent.WARNING_START, () => {
    logEvent('⚠️ WARNING DIALOG VISIBLE');
  });
  
  idle.on(IdleEvent.TIMEOUT, () => {
    logEvent('🚨 LOGOUT SHOULD HAPPEN NOW');
  });
  
  idle.on(IdleEvent.IDLE_END, () => {
    logEvent('✅ IDLE RESET (extend session worked)');
  });
  
  return idle;
}

function simulateExtendSession(idle) {
  extendCount++;
  logEvent(`🔄 EXTEND SESSION #${extendCount} CLICKED`);
  
  // Simulate the extend session process
  idle.stop();
  idle.setIdleTimeout(CORRECT_CONFIG.idleTimeout);
  idle.setWarningTimeout(CORRECT_CONFIG.warningTimeout);
  idle.watch();
  
  logEvent(`✅ EXTEND SESSION #${extendCount} COMPLETED`);
}

async function runCorrectConfigTest() {
  console.log('🚀 Starting CORRECT configuration test...\n');
  
  const idle = createCorrectIdleManager();
  startTime = Date.now();
  logEvent('TEST START');
  
  idle.watch();
  
  // Test first warning appearance at 40s
  setTimeout(() => {
    logEvent('📍 40s MARK - Warning should appear now');
  }, 40000);
  
  // Test extend session at 45s (5s after warning appears)
  setTimeout(() => {
    simulateExtendSession(idle);
  }, 45000);
  
  // Test second warning at 40s after extend (85s total)
  setTimeout(() => {
    logEvent('📍 40s AFTER EXTEND - Warning should appear again');
  }, 85000);
  
  // Let it timeout this time to verify logout at 60s after warning
  setTimeout(() => {
    logEvent('📍 60s AFTER SECOND WARNING - Should logout now');
  }, 105000);
  
  // Final analysis
  setTimeout(() => {
    console.log('\n📊 CORRECT Configuration Test Results');
    console.log('=====================================');
    
    console.log('\nEvent Timeline:');
    events.forEach((event, index) => {
      console.log(`${index + 1}. [${event.elapsedSeconds}s] ${event.name}`);
    });
    
    console.log('\n🎯 Expected vs Actual:');
    console.log('Expected: Warning at 40s, 85s');
    console.log('Expected: Extend at 45s');
    console.log('Expected: Logout at 105s (85s warning + 20s timeout)');
    
    const warnings = events.filter(e => e.name.includes('WARNING'));
    const extends = events.filter(e => e.name.includes('EXTEND'));
    const logouts = events.filter(e => e.name.includes('LOGOUT'));
    
    console.log('\n✅ Verification:');
    console.log(`- Warning events: ${warnings.length}`);
    console.log(`- Extend events: ${extends.length}`);
    console.log(`- Logout events: ${logouts.length}`);
    
    console.log('\n🎉 This configuration gives you:');
    console.log('- Warning appears at 40 seconds');
    console.log('- User has 20 seconds to click extend');
    console.log('- If no action, logout at 60 seconds total');
    console.log('- Extend session resets the cycle');
    
    idle.stop();
  }, 110000);
}

runCorrectConfigTest().catch(console.error);