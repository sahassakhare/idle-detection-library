// Debug test to understand the exact timeout behavior
const { Idle, IdleEvent } = require('./packages/core/dist/index');

console.log('🔍 Timeout Configuration Debug Test');
console.log('===================================\n');

// Your exact configuration
const USER_CONFIG = {
  idleTimeout: 60 * 1000,    // 60 seconds
  warningTimeout: 40 * 1000  // 40 seconds
};

console.log('Testing with your configuration:');
console.log('- idleTimeout:', USER_CONFIG.idleTimeout, 'ms (', USER_CONFIG.idleTimeout / 1000, 'seconds)');
console.log('- warningTimeout:', USER_CONFIG.warningTimeout, 'ms (', USER_CONFIG.warningTimeout / 1000, 'seconds)');
console.log('');

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

function createTestIdleManager() {
  const idle = new Idle(USER_CONFIG);
  
  idle.on(IdleEvent.IDLE_START, () => {
    logEvent('IDLE_START - Warning should begin');
  });
  
  idle.on(IdleEvent.WARNING_START, () => {
    logEvent('WARNING_START - User should see warning dialog');
  });
  
  idle.on(IdleEvent.TIMEOUT, () => {
    logEvent('TIMEOUT - User should be logged out');
  });
  
  idle.on(IdleEvent.IDLE_END, () => {
    logEvent('IDLE_END - Idle detection reset');
  });
  
  return idle;
}

async function runTimeoutTest() {
  console.log('🚀 Starting timeout behavior test...\n');
  
  const idle = createTestIdleManager();
  startTime = Date.now();
  logEvent('TEST_START - Idle detection beginning');
  
  idle.watch();
  
  // Wait for the full cycle to complete
  await new Promise(resolve => {
    setTimeout(() => {
      console.log('\n📊 Test Results Analysis');
      console.log('========================');
      
      console.log('\nEvent Timeline:');
      events.forEach((event, index) => {
        console.log(`${index + 1}. [${event.elapsedSeconds}s] ${event.name}`);
      });
      
      // Analysis
      const idleStart = events.find(e => e.name.includes('IDLE_START'));
      const warningStart = events.find(e => e.name.includes('WARNING_START'));
      const timeout = events.find(e => e.name.includes('TIMEOUT'));
      
      console.log('\n🔍 Timing Analysis:');
      
      if (idleStart) {
        console.log(`- IDLE_START occurred at: ${idleStart.elapsedSeconds}s`);
        console.log(`- Expected at: ${USER_CONFIG.idleTimeout / 1000}s`);
        console.log(`- ✅ ${idleStart.elapsedSeconds === Math.floor(USER_CONFIG.idleTimeout / 1000) ? 'CORRECT' : 'INCORRECT'}`);
      }
      
      if (warningStart) {
        console.log(`- WARNING_START occurred at: ${warningStart.elapsedSeconds}s`);
        console.log(`- Should occur same time as IDLE_START`);
      } else {
        console.log('- ❌ WARNING_START never occurred!');
      }
      
      if (timeout) {
        console.log(`- TIMEOUT occurred at: ${timeout.elapsedSeconds}s`);
        console.log(`- Expected at: ${(USER_CONFIG.idleTimeout + USER_CONFIG.warningTimeout) / 1000}s`);
        const expectedTimeout = (USER_CONFIG.idleTimeout + USER_CONFIG.warningTimeout) / 1000;
        console.log(`- ${timeout.elapsedSeconds === expectedTimeout ? '✅ CORRECT' : '❌ INCORRECT'} timing`);
      }
      
      console.log('\n🎯 Expected Behavior:');
      console.log(`1. IDLE_START should occur at ${USER_CONFIG.idleTimeout / 1000}s`);
      console.log(`2. WARNING_START should occur at ${USER_CONFIG.idleTimeout / 1000}s`);
      console.log(`3. TIMEOUT should occur at ${(USER_CONFIG.idleTimeout + USER_CONFIG.warningTimeout) / 1000}s`);
      
      console.log('\n🚨 Your Issue:');
      console.log('You said logout happens at 60s instead of warning at 40s');
      console.log('This suggests the warning is not appearing and timeout occurs immediately');
      
      idle.stop();
      resolve();
    }, (USER_CONFIG.idleTimeout + USER_CONFIG.warningTimeout + 5000)); // Wait for full cycle + buffer
  });
}

runTimeoutTest().catch(console.error);