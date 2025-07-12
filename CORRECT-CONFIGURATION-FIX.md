# Correct Configuration Fix

## Root Cause: Parameter Misunderstanding

The extend session issue is caused by **incorrect timeout configuration**, not a code bug.

### Current Configuration (INCORRECT)
```typescript
idleTimeout: 60 * 1000,    // 60 seconds
warningTimeout: 40 * 1000  // 40 seconds
```

**What this actually does:**
- ⏰ Warning appears at **60 seconds**
- 🚨 Logout happens at **100 seconds** (60 + 40)

### Expected Behavior vs Reality

**What you expect:**
- Warning at 40 seconds
- Logout at 60 seconds

**What actually happens:**
- Warning at 60 seconds
- Logout at 100 seconds

## The Correct Configuration

To achieve **warning at 40s, logout at 60s**:

```typescript
idleTimeout: 40 * 1000,    // Warning appears at 40 seconds
warningTimeout: 20 * 1000  // Logout happens 20 seconds later (total: 60s)
```

## Parameter Definitions

### `idleTimeout`
- **Definition**: Time of inactivity before warning dialog appears
- **NOT**: Time until logout
- **Example**: `40*1000` = Warning appears after 40 seconds of inactivity

### `warningTimeout`  
- **Definition**: Duration of warning period before automatic logout
- **NOT**: Time until warning appears
- **Example**: `20*1000` = 20 seconds from warning to logout

## Timeline Examples

### Example 1: Warning at 30s, Logout at 60s
```typescript
idleTimeout: 30 * 1000,    // Warning at 30s
warningTimeout: 30 * 1000  // Logout 30s later (total: 60s)
```

### Example 2: Warning at 45s, Logout at 90s  
```typescript
idleTimeout: 45 * 1000,    // Warning at 45s
warningTimeout: 45 * 1000  // Logout 45s later (total: 90s)
```

### Example 3: Your Desired Timing
```typescript
idleTimeout: 40 * 1000,    // Warning at 40s
warningTimeout: 20 * 1000  // Logout 20s later (total: 60s)
```

## Implementation Fix

Update your configuration wherever it's defined:

```typescript
// main.ts or your configuration file
provideIdleOAuth({
  idleTimeout: 40 * 1000,    // WARNING appears at 40 seconds
  warningTimeout: 20 * 1000, // LOGOUT happens at 60 seconds (40 + 20)
  autoRefreshToken: true,
  // ... other config
})
```

## Verification Steps

After updating the configuration:

1. **Start the application**
2. **Wait 40 seconds** - Warning dialog should appear
3. **Click "Extend Session"** - Should reset and start over
4. **Wait 40 seconds again** - Warning should appear again
5. **Let it timeout** - Should logout at 60 seconds total

## Why Extend Session "Failed"

With your original config (`idleTimeout: 60*1000, warningTimeout: 40*1000`):
- Warning appears at 60 seconds
- You thought this was logout time
- When you clicked extend, it properly reset
- But warning appeared again at 60 seconds (which you expected to be logout)
- This made it seem like extend session wasn't working

**The extend session was actually working correctly** - the configuration was just misunderstood.

## Production Configuration Examples

### Conservative (Long timeouts)
```typescript
idleTimeout: 25 * 60 * 1000,   // Warning at 25 minutes  
warningTimeout: 5 * 60 * 1000   // Logout at 30 minutes
```

### Standard (Medium timeouts)
```typescript
idleTimeout: 15 * 60 * 1000,   // Warning at 15 minutes
warningTimeout: 5 * 60 * 1000   // Logout at 20 minutes  
```

### Aggressive (Short timeouts)
```typescript
idleTimeout: 5 * 60 * 1000,    // Warning at 5 minutes
warningTimeout: 2 * 60 * 1000   // Logout at 7 minutes
```

## Summary

The extend session functionality is **working correctly**. The issue was a configuration misunderstanding about what the timeout parameters represent. Update your configuration to:

```typescript
idleTimeout: 40 * 1000,    // Warning at 40s
warningTimeout: 20 * 1000  // Logout at 60s (40+20)
```

This will give you exactly the behavior you expect.