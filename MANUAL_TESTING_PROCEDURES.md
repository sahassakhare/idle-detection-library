# Idle Detection Library - Manual Testing Procedures

## Overview
This document provides comprehensive manual testing procedures for validating the idle detection library against edge cases and corner scenarios identified in the code analysis.

## Test Environment Setup

### Prerequisites
1. **Multiple Browser Tabs**: Open at least 3 tabs with the Angular sample application
2. **Developer Tools**: Enable console logging in all tabs
3. **Network Throttling**: Test with slow/fast network conditions
4. **Debug Logging**: Enable `[enableDebugLogs]="true"` in the component

### Sample Configuration for Testing
```typescript
// Use these settings in your test component
<idle-warning-dialog
  [idleTimeout]="10000"        <!-- 10 seconds for faster testing -->
  [warningTimeout]="5000"      <!-- 5 seconds warning -->
  [enableDebugLogs]="true"     <!-- Enable logging -->
  [enableMultiTab]="true"      <!-- Enable multi-tab -->
  [onLogoutCallback]="handleLogout"
  [onExtendCallback]="handleExtend">
</idle-warning-dialog>
```

---

## Critical Priority Tests

### Test 1: Interrupt Source During Warning State
**Risk**: Critical - Session security vulnerability if activity doesn't close dialog

**Scenario**: User activity during warning dialog should close it across all tabs

**Steps**:
1. Open 3 browser tabs with the sample application
2. In Tab 1: Wait for idle timeout (10 seconds)
3. Verify warning dialog appears in Tab 1
4. **Critical Test**: In Tab 2, move mouse or click anywhere
5. **Expected**: Warning dialog in Tab 1 should close immediately
6. Check console logs for "IDLE_END" broadcast messages

**Success Criteria**:
- Warning closes in Tab 1 when activity occurs in Tab 2
- PASS: Console shows "IDLE_END" broadcast and handling
- PASS: No timeouts occur after activity

**Failure Indicators**:
- FAIL: Warning remains open in Tab 1
- FAIL: User gets logged out despite activity
- FAIL: Console shows errors about broadcast handling

---

### Test 2: Multi-Tab State Synchronization
**Risk**: Critical - Users see inconsistent states across tabs

**Scenario**: All tabs should maintain synchronized idle/warning states

**Steps**:
1. Open 4 browser tabs
2. In Tab 1: Trigger idle timeout (wait 10 seconds)
3. Verify warning appears in ALL tabs
4. In Tab 2: Click "Extend Session"
5. **Critical Test**: All other tabs should immediately close warnings
6. Monitor countdown timers for consistency

**Success Criteria**:
- PASS: Warning appears simultaneously in all tabs
- PASS: Extend Session closes warnings in ALL tabs
- PASS: Countdown timers stay synchronized (±1 second tolerance)
- PASS: Activity in any tab resets all tabs

**Failure Indicators**:
- FAIL: Some tabs don't show warnings
- FAIL: Extend Session only affects one tab
- FAIL: Countdown timers show different values
- FAIL: Tabs become permanently desynchronized

---

### Test 3: Rapid Activity During Warning
**Risk**: High - Throttling might miss legitimate user activity

**Scenario**: Rapid user interactions during warning should still be detected

**Steps**:
1. Trigger warning dialog (wait 10 seconds idle)
2. **Rapid Test**: Quickly perform these actions within 2 seconds:
   - Click multiple times
   - Move mouse rapidly
   - Press multiple keys
   - Scroll up and down
3. Monitor if dialog closes on first or subsequent activity

**Success Criteria**:
- PASS: Dialog closes on first valid activity
- PASS: Console shows throttled events but still processes them
- PASS: No timeout occurs despite rapid activity

**Failure Indicators**:
- FAIL: Dialog doesn't close despite activity
- FAIL: Console shows throttling blocking all activity
- FAIL: User gets timed out during active interaction

---

## High Priority Tests

### Test 4: Component Lifecycle During Warning
**Risk**: High - Memory leaks and orphaned timers

**Scenario**: Component destruction while warning is active

**Steps**:
1. Trigger warning dialog
2. **Immediately** navigate to different route/page
3. Return to original page
4. Check browser developer tools:
   - Memory tab for leaks
   - Console for cleanup logs
   - Network tab for continued polling

**Success Criteria**:
- PASS: Console shows proper cleanup messages
- PASS: No "interval/timeout not cleared" warnings
- PASS: Memory usage doesn't continuously grow
- PASS: New component instance works normally

---

### Test 5: Broadcast Channel Failure Recovery
**Risk**: High - Multi-tab coordination breaks down

**Scenario**: What happens when BroadcastChannel fails or becomes unavailable

**Steps**:
1. Open developer tools in Tab 1
2. In console, execute: `window.BroadcastChannel = undefined`
3. Trigger warning in Tab 1
4. Try activity in Tab 2
5. Check if Tab 1 still functions independently

**Success Criteria**:
- PASS: Tab 1 continues working despite broadcast failure
- PASS: Console shows graceful degradation messages
- PASS: Local tab functionality remains intact

---

## Medium Priority Tests

### Test 6: Simultaneous Operations
**Scenario**: Multiple rapid reset/extend operations

**Steps**:
1. Trigger warning dialog
2. **Rapidly** (within 1 second) perform:
   - Click "Extend Session" 
   - Generate mouse activity
   - Press keyboard keys
   - Click "Extend Session" again
3. Monitor final state

**Success Criteria**:
- PASS: Dialog closes cleanly
- PASS: Only one "extend" callback executes
- PASS: No console errors about conflicting operations

---

### Test 7: LocalStorage Corruption
**Scenario**: Corrupted expiry data in localStorage

**Steps**:
1. Open developer tools
2. Go to Application > Local Storage
3. Find key containing "expiry"
4. Change value to invalid JSON: `{invalid-json`
5. Trigger warning in different tab
6. Check behavior

**Success Criteria**:
- PASS: Library handles corrupted data gracefully
- PASS: Dialog still appears and functions
- PASS: Console logs the error but continues working

---

### Test 8: Timer Accuracy Under Load
**Scenario**: Timer accuracy when browser is under load

**Steps**:
1. Trigger warning dialog (5-second timeout)
2. **Immediately** open heavy website in another tab (e.g., complex graphics site)
3. Return to idle detection tab
4. Monitor if countdown timer is accurate
5. Check if timeout occurs at correct time

**Success Criteria**:
- PASS: Countdown stays reasonably accurate (±2 seconds)
- PASS: Timeout occurs within expected timeframe
- PASS: Heavy load doesn't break functionality

---

## Low Priority Tests

### Test 9: Memory Usage Over Time
**Scenario**: Long-running session with multiple idle cycles

**Steps**:
1. Let application run for extended period (30+ minutes)
2. Trigger idle warnings multiple times
3. Extend sessions multiple times
4. Monitor memory usage in developer tools

**Success Criteria**:
- PASS: Memory usage stays relatively stable
- PASS: No continuous memory growth
- PASS: Event listeners are properly cleaned up

---

### Test 10: Network Interruption
**Scenario**: Network goes offline during multi-tab coordination

**Steps**:
1. Open multiple tabs
2. In developer tools, set Network to "Offline"
3. Trigger idle warning
4. Try extending session
5. Restore network connection

**Success Criteria**:
- PASS: Local tab functionality continues during offline
- PASS: Multi-tab sync resumes when network returns
- PASS: No data corruption occurs

---

## Automated Test Execution

You can use the provided `test-edge-cases.html` file for automated testing:

```bash
# Serve the test file
cd /path/to/idle-detection-library
npx http-server -p 8080

# Open in browser
open http://localhost:8080/test-edge-cases.html
```

## Test Results Documentation

### Recording Test Results
For each test, document:
1. **Pass/Fail Status**
2. **Console Log Excerpts** (especially for failures)
3. **Browser/Version** where tested
4. **Timing Information** (how long actions took)
5. **Screenshots** of any UI issues

### Example Test Result Entry
```
Test: Interrupt Source During Warning State
Status: ✅ PASS
Browser: Chrome 119.0.6045.105
Console Logs:
  [Multi-Tab] Idle end event received {isWarningShown: true, isIdle: true}
  [Multi-Tab] Closing warning dialog - user activity detected
  [Activity] Forcing core reset due to user activity during warning
Notes: Dialog closed in 84ms after activity detection
```

## Critical Failure Escalation

If any of these critical tests fail:
1. **Stop using the library immediately**
2. **Document the exact reproduction steps**
3. **Capture full console logs and network activity**
4. **Test in multiple browsers to confirm**

## Performance Benchmarks

Expected performance characteristics:
- **Activity Detection Response**: < 100ms
- **Multi-tab Synchronization**: < 200ms
- **Warning Dialog Display**: < 50ms
- **Memory Usage Growth**: < 1MB per hour of operation

---

**Last Updated**: Current Date
**Test Environment**: Chrome, Firefox, Safari
**Library Version**: 1.0.0