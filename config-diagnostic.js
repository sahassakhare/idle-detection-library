// CONFIGURATION DIAGNOSTIC - Check if timeout values are correct
const { Idle, IdleEvent } = require('./packages/core/dist/index');

console.log('⚙️ CONFIGURATION DIAGNOSTIC');
console.log('===========================\n');

console.log('Testing different configuration scenarios to identify the issue...\n');

// Test 1: User's reported configuration
const USER_CONFIG = {
  idleTimeout: 40 * 1000,    // Warning at 40 seconds
  warningTimeout: 20 * 1000  // Logout at 60 seconds
};

console.log('🔍 Test 1: User Configuration');
console.log('- idleTimeout:', USER_CONFIG.idleTimeout, 'ms =', USER_CONFIG.idleTimeout / 1000, 'seconds');
console.log('- warningTimeout:', USER_CONFIG.warningTimeout, 'ms =', USER_CONFIG.warningTimeout / 1000, 'seconds');
console.log('- Expected warning at:', USER_CONFIG.idleTimeout / 1000, 'seconds');
console.log('- Expected logout at:', (USER_CONFIG.idleTimeout + USER_CONFIG.warningTimeout) / 1000, 'seconds');

// Test different scenarios that could cause 40s logout

// Scenario 1: What if warningTimeout is being treated as total time?
const SCENARIO_1 = {
  idleTimeout: 20 * 1000,    // Warning at 20s
  warningTimeout: 20 * 1000  // Logout at 40s total (20+20)
};

console.log('\n🔍 Scenario 1: If warningTimeout means total time to logout');
console.log('- idleTimeout:', SCENARIO_1.idleTimeout / 1000, 's');
console.log('- warningTimeout:', SCENARIO_1.warningTimeout / 1000, 's');
console.log('- Would cause logout at:', (SCENARIO_1.idleTimeout + SCENARIO_1.warningTimeout) / 1000, 's');

// Scenario 2: What if idleTimeout is total time and warningTimeout is ignored?
const SCENARIO_2 = {
  idleTimeout: 40 * 1000,    // Total time to logout
  warningTimeout: 20 * 1000  // Ignored
};

console.log('\n🔍 Scenario 2: If idleTimeout is total time to logout');
console.log('- idleTimeout:', SCENARIO_2.idleTimeout / 1000, 's (total time)');
console.log('- warningTimeout:', SCENARIO_2.warningTimeout / 1000, 's (ignored)');
console.log('- Would cause logout at:', SCENARIO_2.idleTimeout / 1000, 's');

// Scenario 3: What if there's a default override somewhere?
console.log('\n🔍 Scenario 3: Check if there are default values being used');

function testConfiguration(name, config) {
  console.log(`\n📋 Testing ${name}:`);
  const idle = new Idle(config);
  
  let events = [];
  let startTime = Date.now();
  
  function logEvent(eventName) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    events.push({ name: eventName, time: elapsed });
    console.log(`  [${elapsed}s] ${eventName}`);
  }
  
  idle.on(IdleEvent.IDLE_START, () => logEvent('IDLE_START (warning should appear)'));
  idle.on(IdleEvent.WARNING_START, () => logEvent('WARNING_START'));
  idle.on(IdleEvent.TIMEOUT, () => logEvent('TIMEOUT (logout should happen)'));
  idle.on(IdleEvent.IDLE_END, () => logEvent('IDLE_END'));
  
  console.log(`  🚀 Starting idle detection...`);
  idle.watch();
  
  return new Promise((resolve) => {
    // Test for maximum expected time + buffer
    const maxTime = Math.max(config.idleTimeout + config.warningTimeout, 70000);
    
    setTimeout(() => {
      console.log(`  📊 Events after ${Math.floor(maxTime / 1000)}s:`);
      events.forEach((event, index) => {
        console.log(`    ${index + 1}. [${event.time}s] ${event.name}`);
      });
      
      const timeoutEvents = events.filter(e => e.name.includes('TIMEOUT'));
      if (timeoutEvents.length > 0) {
        console.log(`  ❌ Logout occurred at: ${timeoutEvents[0].time}s`);
        if (timeoutEvents[0].time === 40) {
          console.log(`  🚨 MATCHES USER'S REPORTED ISSUE!`);
        }
      } else {
        console.log(`  ✅ No timeout events - configuration working as expected`);
      }
      
      idle.stop();
      resolve();
    }, maxTime + 1000);
  });
}

async function runConfigDiagnostic() {
  console.log('\n🚀 Running configuration diagnostic tests...\n');
  
  // Test user's configuration
  await testConfiguration('User Configuration', USER_CONFIG);
  
  // Test scenario 1
  await testConfiguration('Scenario 1 (warningTimeout = total time)', SCENARIO_1);
  
  // Test minimal config to see defaults
  await testConfiguration('Minimal Config (check defaults)', {});
  
  // Test extreme case
  await testConfiguration('Quick Test (5s warning, 5s timeout)', {
    idleTimeout: 5000,
    warningTimeout: 5000
  });
  
  console.log('\n🎯 DIAGNOSTIC COMPLETE');
  console.log('======================');
  console.log('If any configuration shows logout at 40s, we found the issue!');
  console.log('If none show logout at 40s, the issue is in the Angular integration layer.');
}

runConfigDiagnostic().catch(console.error);