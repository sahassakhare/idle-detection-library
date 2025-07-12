// EMERGENCY DEBUG: Session logging out at 40s despite extend session
const { Idle, IdleEvent } = require('./packages/core/dist/index');

console.log('🚨 EMERGENCY DEBUG: 40s Logout Issue');
console.log('====================================\n');

// User's exact configuration  
const CONFIG = {
  idleTimeout: 40 * 1000,    // Warning at 40 seconds
  warningTimeout: 20 * 1000  // Should logout at 60 seconds (40+20)
};

console.log('Configuration Analysis:');
console.log('- idleTimeout (warning trigger):', CONFIG.idleTimeout / 1000, 'seconds');
console.log('- warningTimeout (warning duration):', CONFIG.warningTimeout / 1000, 'seconds');
console.log('- Expected logout time:', (CONFIG.idleTimeout + CONFIG.warningTimeout) / 1000, 'seconds');
console.log('- ACTUAL logout time reported by user: 40 seconds');
console.log('- This suggests the warning timeout is being ignored!\n');

let startTime = null;
let events = [];
let extendCalled = false;

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

function createEmergencyIdleManager() {
  console.log('Creating idle manager with configuration...');
  const idle = new Idle(CONFIG);
  
  // Log the actual configuration that was set
  console.log('✅ Idle manager created');
  console.log('📋 Internal config:', JSON.stringify(idle.getConfig ? idle.getConfig() : 'No getConfig method'));
  
  idle.on(IdleEvent.IDLE_START, (event, state) => {
    logEvent('🔔 IDLE_START - Warning should appear');
    console.log('   📊 State:', JSON.stringify(state));
    console.log('   ⚠️ USER SHOULD SEE WARNING DIALOG NOW');
  });
  
  idle.on(IdleEvent.WARNING_START, (event, state) => {
    logEvent('⚠️ WARNING_START - Warning dialog visible');
    console.log('   📊 State:', JSON.stringify(state));
  });
  
  idle.on(IdleEvent.TIMEOUT, (event, state) => {
    logEvent('🚨 TIMEOUT - LOGOUT HAPPENING NOW');
    console.log('   📊 State:', JSON.stringify(state));
    console.log('   ❌ THIS SHOULD NOT HAPPEN AT 40s IF EXTEND WAS CALLED');
    
    if (extendCalled) {
      logEvent('❌ CRITICAL BUG: Logout occurred AFTER extend session was called');
      console.log('   🔍 This means extend session is NOT working');
    } else {
      logEvent('⚠️ Logout occurred because no extend session was called');
    }
  });
  
  idle.on(IdleEvent.IDLE_END, (event, state) => {
    logEvent('✅ IDLE_END - Timer reset');
    console.log('   📊 State:', JSON.stringify(state));
  });
  
  return idle;
}

function emergencyExtendSession(idle) {
  extendCalled = true;
  logEvent('🔄 EMERGENCY EXTEND SESSION CALLED');
  
  console.log('📊 State BEFORE extend:', JSON.stringify(idle.getState()));
  
  // What should happen:
  console.log('   1. Stopping idle manager...');
  idle.stop();
  
  console.log('   2. Checking state after stop...');
  console.log('   📊 State AFTER stop:', JSON.stringify(idle.getState()));
  
  console.log('   3. Reconfiguring...');
  idle.setIdleTimeout(CONFIG.idleTimeout);
  idle.setWarningTimeout(CONFIG.warningTimeout);
  
  console.log('   4. Restarting...');
  idle.watch();
  
  console.log('   📊 State AFTER restart:', JSON.stringify(idle.getState()));
  
  logEvent('✅ EMERGENCY EXTEND SESSION COMPLETED');
}

async function runEmergencyDebug() {
  console.log('🚀 Starting emergency 40s logout debug...\n');
  
  const idle = createEmergencyIdleManager();
  startTime = Date.now();
  logEvent('🏁 EMERGENCY TEST START');
  
  idle.watch();
  
  // Critical test: extend session at 35s (5s after warning should appear)
  setTimeout(() => {
    logEvent('📍 35s MARK - User clicks extend session (5s after warning)');
    emergencyExtendSession(idle);
  }, 35000);
  
  // Check what happens at 40s (reported logout time)
  setTimeout(() => {
    logEvent('📍 40s MARK - User reports logout happens here');
    const state = idle.getState();
    console.log('   📊 Current state:', JSON.stringify(state));
    
    if (state.isTimedOut) {
      logEvent('❌ CONFIRMED BUG: User is logged out at 40s despite extend');
      console.log('   🔍 EXTEND SESSION IS NOT WORKING');
    } else {
      logEvent('✅ User is still active at 40s');
    }
  }, 40000);
  
  // Check at expected logout time (60s)
  setTimeout(() => {
    logEvent('📍 60s MARK - When logout SHOULD occur (if no extend)');
    const state = idle.getState();
    if (state.isTimedOut) {
      logEvent('ℹ️ User logged out at expected time');
    } else {
      logEvent('✅ User still active due to extend session');
    }
  }, 60000);
  
  // Final analysis
  setTimeout(() => {
    console.log('\n🔍 EMERGENCY ANALYSIS');
    console.log('=====================');
    
    console.log('\nEvent Timeline:');
    events.forEach((event, index) => {
      console.log(`${index + 1}. [${event.elapsedSeconds}s] ${event.name}`);
    });
    
    const timeouts = events.filter(e => e.name.includes('TIMEOUT'));
    const extendEvents = events.filter(e => e.name.includes('EXTEND SESSION'));
    
    console.log('\n🚨 CRITICAL FINDINGS:');
    console.log(`- Timeout events: ${timeouts.length}`);
    console.log(`- Extend attempts: ${extendEvents.length}`);
    
    if (timeouts.length > 0) {
      const firstTimeout = timeouts[0];
      console.log(`\n❌ LOGOUT OCCURRED AT: ${firstTimeout.elapsedSeconds}s`);
      
      if (firstTimeout.elapsedSeconds === 40) {
        console.log('🔍 CONFIRMED: Logout at 40s instead of 60s');
        console.log('🔍 This means warningTimeout is being ignored');
        console.log('🔍 OR extend session is not working');
      }
      
      if (extendEvents.length > 0 && timeouts.length > 0) {
        const extendTime = extendEvents[0].elapsedSeconds;
        const timeoutTime = firstTimeout.elapsedSeconds;
        if (timeoutTime > extendTime) {
          console.log('❌ CRITICAL: Logout occurred AFTER extend session');
          console.log('🔧 EXTEND SESSION IS BROKEN');
        }
      }
    } else {
      console.log('✅ No unexpected timeouts - extend session working');
    }
    
    console.log('\n🎯 NEXT STEPS:');
    if (timeouts.length > 0 && timeouts[0].elapsedSeconds === 40) {
      console.log('1. Check if warningTimeout is actually being applied');
      console.log('2. Verify if core idle manager is respecting warningTimeout');
      console.log('3. Check if there are multiple timer systems running');
      console.log('4. Verify extend session actually calls the right methods');
    }
    
    idle.stop();
  }, 70000);
}

console.log('⏱️ Emergency test will run for 70 seconds...\n');
runEmergencyDebug().catch(console.error);