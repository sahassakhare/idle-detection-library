// Test script to verify extend session functionality
// This simulates the extend session flow to check for the logout bug

const { Idle, IdleEvent } = require('./packages/core/dist/index');

console.log('🧪 Testing Extend Session Functionality');
console.log('=====================================\n');

// Create test configuration (shorter timeouts for testing)
const CONFIG = {
  idleTimeout: 5000,      // 5 seconds instead of 20 minutes
  warningTimeout: 2000    // 2 seconds instead of 5 minutes
};

let extendCount = 0;
let testResults = [];

function createIdleManager() {
  const idle = new Idle(CONFIG);
  
  // Set up event listeners to track behavior
  idle.on(IdleEvent.IDLE_START, (event, state) => {
    console.log(`⏰ IDLE_START triggered - ${new Date().toISOString()}`);
    console.log(`   State: isIdle=${state.isIdle}, isWarning=${state.isWarning}`);
    
    // Simulate warning countdown starting
    setTimeout(() => {
      console.log(`⚠️  Warning period would start now`);
    }, 100);
  });
  
  idle.on(IdleEvent.TIMEOUT, (event, state) => {
    console.log(`🚨 TIMEOUT triggered - ${new Date().toISOString()}`);
    console.log(`   State: isTimedOut=${state.isTimedOut}`);
    testResults.push(`TIMEOUT after ${extendCount} extends`);
  });
  
  idle.on(IdleEvent.IDLE_END, (event, state) => {
    console.log(`✅ IDLE_END triggered - ${new Date().toISOString()}`);
    console.log(`   State: isIdle=${state.isIdle}, isWarning=${state.isWarning}`);
  });
  
  idle.on(IdleEvent.INTERRUPT, (event, state) => {
    console.log(`🔄 INTERRUPT triggered - ${new Date().toISOString()}`);
    console.log(`   State: lastActivity=${state.lastActivity}`);
  });
  
  return idle;
}

function simulateExtendSession(idle) {
  extendCount++;
  console.log(`\n🔄 Simulating Extend Session #${extendCount}`);
  console.log('   - Stopping any active countdown timers');
  console.log('   - Resetting idle manager');
  console.log('   - Restarting idle detection');
  
  // This simulates what extendSession() does:
  // 1. Stop countdown timer (simulated)
  // 2. Reset the idle manager
  // 3. Restart idle detection
  idle.reset();
  idle.watch(); // This was missing!
  
  console.log('   ✅ Session extended successfully');
  testResults.push(`Extend #${extendCount} completed`);
}

async function runTest() {
  console.log('Creating idle manager...');
  const idle = createIdleManager();
  
  console.log('\n📍 Test Phase 1: First Idle Cycle');
  console.log('Starting idle detection...');
  idle.watch();
  
  // Wait for first idle trigger
  await new Promise(resolve => {
    setTimeout(() => {
      console.log('\n📍 Test Phase 2: First Extend Session');
      simulateExtendSession(idle);
      
      // Start watching again after extend
      idle.watch();
      resolve();
    }, CONFIG.idleTimeout + 500);
  });
  
  // Wait for second idle trigger
  await new Promise(resolve => {
    setTimeout(() => {
      console.log('\n📍 Test Phase 3: Second Extend Session (Critical Test)');
      console.log('This is where the bug occurred - logout instead of extend');
      simulateExtendSession(idle);
      
      // Start watching again after second extend
      idle.watch();
      resolve();
    }, CONFIG.idleTimeout + 500);
  });
  
  // Wait to see if a third cycle works
  await new Promise(resolve => {
    setTimeout(() => {
      console.log('\n📍 Test Phase 4: Third Cycle Verification');
      if (idle.isTimedOut()) {
        console.log('❌ FAILED: Manager is in timed out state');
        testResults.push('FAILED: Unexpected timeout');
      } else {
        console.log('✅ SUCCESS: Manager is still active');
        testResults.push('SUCCESS: Third cycle active');
      }
      
      idle.stop();
      resolve();
    }, CONFIG.idleTimeout + 500);
  });
  
  // Print results
  console.log('\n🔍 Test Results Summary');
  console.log('======================');
  testResults.forEach((result, index) => {
    console.log(`${index + 1}. ${result}`);
  });
  
  const hasUnexpectedTimeout = testResults.some(r => r.includes('TIMEOUT after') && !r.includes('TIMEOUT after 0'));
  
  if (hasUnexpectedTimeout) {
    console.log('\n❌ TEST FAILED: Unexpected timeout occurred after extend session');
    console.log('   This indicates the logout bug is still present');
  } else {
    console.log('\n✅ TEST PASSED: No unexpected timeouts after extend sessions');
    console.log('   The extend session functionality appears to be working correctly');
  }
}

// Run the test
runTest().catch(console.error);