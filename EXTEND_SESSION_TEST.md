# Extend Session Test Verification

## Test Configuration
- Idle Timeout: 20 minutes (1200000ms)
- Warning Timeout: 5 minutes (300000ms)
- Expected Behavior: Session should extend properly on each button click

## Test Scenarios

### Scenario 1: Single Extend Session
**Steps:**
1. Initialize idle detection
2. Wait for 20 minutes (idle triggers)
3. Warning dialog appears with 5-minute countdown
4. Click "Extend Session" button
5. Verify session extends and countdown resets

**Expected Result:**
- ✅ Warning dialog disappears
- ✅ New 20-minute idle timer starts
- ✅ User remains logged in
- ✅ No logout occurs

### Scenario 2: Multiple Consecutive Extends (The Critical Test)
**Steps:**
1. Initialize idle detection
2. Wait for 20 minutes (first idle trigger)
3. Warning dialog appears with 5-minute countdown
4. Click "Extend Session" (First extend)
5. Wait another 20 minutes (second idle trigger)
6. Warning dialog appears again
7. Click "Extend Session" (Second extend) - **THIS IS WHERE THE BUG OCCURRED**
8. Verify session extends properly

**Expected Result:**
- ✅ First extend works correctly
- ✅ Second extend also works correctly
- ✅ No unexpected logout after second extend
- ✅ User remains authenticated

### Scenario 3: Extend During Different Countdown Times
**Steps:**
1. Initialize idle detection
2. Wait for idle trigger
3. Let warning countdown run for 2 minutes (3 minutes remaining)
4. Click "Extend Session"
5. Verify proper extension regardless of remaining time

**Expected Result:**
- ✅ Extension works at any countdown time
- ✅ Fresh full timeout period starts

## Technical Verification Points

### Timer Management
- Core idle manager should be the single source of timer control
- NgRx should only manage state, not create competing timers
- countdownTimer$ subject should properly stop active countdowns

### State Synchronization
- extendSession() should dispatch NgRx action
- idleManager.reset() should reset core timers
- State should update consistently across both systems

### Event Flow
```
User clicks "Extend Session"
    ↓
countdownTimer$.next() - stops active countdown
    ↓
IdleActions.extendSession() - updates NgRx state
    ↓
idleManager.reset() - resets core idle timers
    ↓
New idle detection cycle begins
```

## Debug Logging
Enable these console logs to monitor:
- "🔄 Extending session..."
- "✅ Session extended successfully"
- Core idle manager events (IDLE_START, IDLE_END, INTERRUPT)

## Automated Test Implementation
Create a test that simulates multiple extend sessions programmatically to verify the fix.