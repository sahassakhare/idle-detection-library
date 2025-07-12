# Production-Grade Extend Session Fix

## Critical Issues Identified

### 1. Timer Accumulation Problem
- Multiple `watch()` calls create overlapping timers
- Previous timers not properly cleared before restart
- Results in unpredictable timeout behavior

### 2. Configuration Drift
- Core idle manager config not updated during runtime
- Timeout values become inconsistent across extends
- User role changes not properly propagated

### 3. State Corruption
- Multiple extends corrupt internal idle manager state
- Event listeners may accumulate
- Memory leaks from uncleaned resources

## Production-Grade Solution

### Complete Timer Management Overhaul
```typescript
extendSession(): void {
  console.log('🔄 Extending session...');
  
  // 1. Stop all active timers and processes
  this.countdownTimer$.next();
  this.idleManager.stop(); // Complete stop, not just reset
  
  // 2. Update state management
  this.store.dispatch(IdleActions.extendSession());
  
  // 3. Reconfigure with fresh timeouts
  this.reconfigureIdleManager();
  
  // 4. Clean restart
  this.idleManager.watch();
  
  console.log('✅ Session extended successfully');
}

private reconfigureIdleManager(): void {
  // Get current configuration
  this.config$.pipe(take(1)).subscribe(config => {
    // Ensure timeouts are properly set
    this.idleManager.setIdleTimeout(config.idleTimeout);
    this.idleManager.setWarningTimeout(config.warningTimeout);
    
    // Reconfigure interrupt sources
    this.idleManager.setInterrupts(DEFAULT_INTERRUPTSOURCES);
  });
}
```

### Enhanced Error Handling and Logging
```typescript
private debugExtendSession(attempt: number): void {
  console.log(`[Extend Session #${attempt}]`);
  console.log('- Current idle state:', this.idleManager.getState());
  console.log('- Current config:', this.idleManager.getConfig());
  console.log('- Active timers before stop:', this.getActiveTimers());
}
```

### Complete Implementation Required
The current implementation has fundamental flaws that require a comprehensive rewrite of the timer management system.