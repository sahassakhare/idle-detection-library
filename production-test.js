// Production-grade test for extend session functionality
// This test simulates the exact scenario described: third extend fails

const { Idle, IdleEvent } = require('./packages/core/dist/index');

console.log('🏭 Production-Grade Extend Session Test');
console.log('=====================================\n');

// Test with actual configuration values
const PRODUCTION_CONFIG = {
  idleTimeout: 20000,     // 20 seconds (simulating 20 minutes)
  warningTimeout: 10000   // 10 seconds (simulating 10 minutes warning)
};

let extendCount = 0;
let testResults = [];
let timerEvents = [];

function createProductionIdleManager() {
  console.log('Creating idle manager with config:', PRODUCTION_CONFIG);
  const idle = new Idle(PRODUCTION_CONFIG);
  
  // Track all timer events for debugging
  idle.on(IdleEvent.IDLE_START, (event, state) => {
    const timestamp = new Date().toISOString();
    console.log(`⏰ [${timestamp}] IDLE_START - Extend count: ${extendCount}`);
    console.log(`   State: ${JSON.stringify(state)}`);
    timerEvents.push({ event: 'IDLE_START', timestamp, extendCount, state });
  });
  
  idle.on(IdleEvent.WARNING_START, (event, state) => {
    const timestamp = new Date().toISOString();
    console.log(`⚠️  [${timestamp}] WARNING_START - Extend count: ${extendCount}`);
    console.log(`   State: ${JSON.stringify(state)}`);
    timerEvents.push({ event: 'WARNING_START', timestamp, extendCount, state });
  });
  
  idle.on(IdleEvent.TIMEOUT, (event, state) => {
    const timestamp = new Date().toISOString();
    console.log(`🚨 [${timestamp}] TIMEOUT - Extend count: ${extendCount}`);
    console.log(`   State: ${JSON.stringify(state)}`);
    timerEvents.push({ event: 'TIMEOUT', timestamp, extendCount, state });
    testResults.push(`TIMEOUT after ${extendCount} extends at ${timestamp}`);
  });
  
  idle.on(IdleEvent.IDLE_END, (event, state) => {
    const timestamp = new Date().toISOString();
    console.log(`✅ [${timestamp}] IDLE_END - Extend count: ${extendCount}`);
    console.log(`   State: ${JSON.stringify(state)}`);
    timerEvents.push({ event: 'IDLE_END', timestamp, extendCount, state });
  });
  
  idle.on(IdleEvent.INTERRUPT, (event, state) => {
    const timestamp = new Date().toISOString();
    console.log(`🔄 [${timestamp}] INTERRUPT - Extend count: ${extendCount}`);
    timerEvents.push({ event: 'INTERRUPT', timestamp, extendCount, state });
  });
  
  return idle;
}

function simulateProductionExtendSession(idle) {
  extendCount++;
  const timestamp = new Date().toISOString();
  console.log(`\n🔄 [${timestamp}] Production Extend Session #${extendCount}`);
  
  // Get current state before extend
  const stateBefore = idle.getState();
  console.log('   State before extend:', JSON.stringify(stateBefore));
  
  // Simulate production-grade extend session
  console.log('   1. Stopping idle manager completely...');
  idle.stop(); // Complete stop
  
  console.log('   2. Reconfiguring with fresh timeouts...');
  idle.setIdleTimeout(PRODUCTION_CONFIG.idleTimeout);
  idle.setWarningTimeout(PRODUCTION_CONFIG.warningTimeout);
  
  console.log('   3. Starting fresh idle detection...');
  idle.watch(); // Fresh start
  
  // Get state after extend
  const stateAfter = idle.getState();
  console.log('   State after extend:', JSON.stringify(stateAfter));
  
  console.log('   ✅ Production extend session completed');
  testResults.push(`Production Extend #${extendCount} completed at ${timestamp}`);
}

async function runProductionTest() {
  console.log('Initializing production test environment...\n');
  const idle = createProductionIdleManager();
  
  console.log('📍 Production Test Phase 1: Initial Idle Cycle');
  idle.watch();
  
  // Wait for first idle trigger
  await new Promise(resolve => {
    setTimeout(() => {
      console.log('\n📍 Production Test Phase 2: First Extend Session');
      simulateProductionExtendSession(idle);
      resolve();
    }, PRODUCTION_CONFIG.idleTimeout + 2000);
  });
  
  // Wait for second idle trigger
  await new Promise(resolve => {
    setTimeout(() => {
      console.log('\n📍 Production Test Phase 3: Second Extend Session');
      simulateProductionExtendSession(idle);
      resolve();
    }, PRODUCTION_CONFIG.idleTimeout + 2000);
  });
  
  // Wait for third idle trigger - THIS IS WHERE THE ISSUE OCCURS
  await new Promise(resolve => {
    setTimeout(() => {
      console.log('\n📍 Production Test Phase 4: Third Extend Session (CRITICAL)');
      console.log('🚨 This is where the production issue occurs');
      simulateProductionExtendSession(idle);
      resolve();
    }, PRODUCTION_CONFIG.idleTimeout + 2000);
  });
  
  // Final verification
  await new Promise(resolve => {
    setTimeout(() => {
      console.log('\n📍 Production Test Phase 5: Final Verification');
      const finalState = idle.getState();
      console.log('Final state:', JSON.stringify(finalState));
      
      if (idle.isTimedOut()) {
        console.log('❌ PRODUCTION FAILURE: Manager is in timed out state');
        testResults.push('PRODUCTION FAILURE: Unexpected timeout');
      } else {
        console.log('✅ PRODUCTION SUCCESS: Manager is still active');
        testResults.push('PRODUCTION SUCCESS: All extends working');
      }
      
      idle.stop();
      resolve();
    }, PRODUCTION_CONFIG.idleTimeout + 2000);
  });
  
  // Analysis and results
  console.log('\n🔍 Production Test Analysis');
  console.log('===========================');
  
  console.log('\n📊 Timer Events Timeline:');
  timerEvents.forEach((event, index) => {
    console.log(`${index + 1}. [${event.timestamp}] ${event.event} (Extend: ${event.extendCount})`);
  });
  
  console.log('\n📋 Test Results:');
  testResults.forEach((result, index) => {
    console.log(`${index + 1}. ${result}`);
  });
  
  // Identify issues
  const unexpectedTimeouts = timerEvents.filter(e => e.event === 'TIMEOUT' && e.extendCount > 0);
  const extendFailures = testResults.filter(r => r.includes('FAILURE'));
  
  if (unexpectedTimeouts.length > 0 || extendFailures.length > 0) {
    console.log('\n❌ PRODUCTION TEST FAILED');
    console.log('Issues identified:');
    if (unexpectedTimeouts.length > 0) {
      console.log(`- ${unexpectedTimeouts.length} unexpected timeout(s) after extends`);
    }
    if (extendFailures.length > 0) {
      console.log(`- ${extendFailures.length} extend failure(s)`);
    }
    
    console.log('\n🔧 Required Actions:');
    console.log('1. Investigate timer accumulation');
    console.log('2. Verify configuration persistence');
    console.log('3. Check state corruption after multiple extends');
    console.log('4. Implement more robust timer management');
  } else {
    console.log('\n✅ PRODUCTION TEST PASSED');
    console.log('All extend sessions worked correctly');
  }
}

// Run the production test
runProductionTest().catch(console.error);