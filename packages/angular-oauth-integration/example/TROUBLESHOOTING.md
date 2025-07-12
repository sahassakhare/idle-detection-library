# 🔧 Troubleshooting Guide - Idle Detection App

## Current Status
✅ **App builds successfully**  
✅ **All dependencies installed**  
✅ **Minimal working version created**

## Quick Start Options

### Option 1: Use Startup Script
```bash
cd packages/angular-oauth-integration/example
./start-app.sh
```

### Option 2: Manual Steps
```bash
cd packages/angular-oauth-integration/example
npm install
npm start
```

### Option 3: Debug Mode
```bash
cd packages/angular-oauth-integration/example
npm start -- --verbose
```

## What Should Happen

1. **Terminal Output:**
   ```
   ✔ Building...
   Application bundle generation complete
   ➜ Local: http://localhost:4200/
   ```

2. **Browser (http://localhost:4200):**
   - Material Design toolbar
   - "Idle Detection Test" card
   - Status information
   - Control buttons

3. **Browser Console (F12):**
   ```
   🔄 Bootstrapping Minimal Working App...
   ✅ App successfully bootstrapped!
   🚀 Minimal Working App Started
   ```

## Common Issues & Solutions

### 1. "ng serve" Command Not Found
```bash
# Install Angular CLI globally
npm install -g @angular/cli@latest

# Or use npx
npx ng serve
```

### 2. Port 4200 Already in Use
```bash
# Use different port
ng serve --port 4201

# Or kill existing process
lsof -ti:4200 | xargs kill -9
```

### 3. Node Modules Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### 4. Build Errors
```bash
# Check Node version (should be 18+)
node --version

# Check npm version
npm --version

# Clear Angular cache
npx ng cache clean
```

### 5. Browser Shows Blank Page
1. **Check browser console (F12)** for error messages
2. **Hard refresh:** Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
3. **Try incognito/private mode**
4. **Disable browser extensions**

### 6. TypeScript Errors
```bash
# Check TypeScript version
npx tsc --version

# Should be ~5.4.0 - update if needed
npm install typescript@~5.4.0
```

## Debugging Steps

### Step 1: Verify Build
```bash
npm run build
# Should complete without errors
```

### Step 2: Check Server Start
```bash
npm start
# Look for "Local: http://localhost:4200/"
```

### Step 3: Browser Console Check
1. Open http://localhost:4200
2. Press F12 to open console
3. Look for bootstrap messages
4. Check for any red error messages

### Step 4: Network Check
```bash
# Test if server responds
curl http://localhost:4200
# Should return HTML content
```

## App Versions Available

### Current: Minimal Working App
- ✅ Basic functionality
- ✅ Easy to debug
- ✅ All core features
- Location: `minimal-working-app.component.ts`

### Alternative: Comprehensive App
```typescript
// To switch back to full app, edit src/main.ts:
import { ComprehensiveAppComponent } from './app/comprehensive-app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(ComprehensiveAppComponent, appConfig)
```

### Alternative: Simple Test App
```typescript
// For basic testing, edit src/main.ts:
import { SimpleTestComponent } from './app/simple-test.component';

bootstrapApplication(SimpleTestComponent, minimalAppConfig)
```

## Expected Browser Console Output

### Successful Startup:
```
🔄 Bootstrapping Minimal Working App...
✅ App successfully bootstrapped!
🚀 Minimal Working App Started
📊 Idle State: {status: "inactive", isDetecting: false, ...}
```

### After Clicking "Start Detection":
```
▶️ Starting idle detection
📊 Idle State: {status: "active", isDetecting: true, ...}
```

### After Mouse Movement:
```
📊 Idle State: {lastActivity: "2024-01-15T10:30:00.000Z", ...}
```

## Performance Notes

- Bundle size warnings are normal for development
- First load may take a few seconds
- Subsequent builds are faster due to caching

## Browser Compatibility

### Supported:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Required APIs:
- BroadcastChannel (for multi-tab)
- localStorage (for config)
- addEventListener (for activity detection)

## Network Requirements

- No external dependencies required
- Runs completely locally
- Optional: keep-alive endpoint (can be disabled)

## Still Having Issues?

### Check These:

1. **Node.js Version:**
   ```bash
   node --version
   # Should be 18.x or higher
   ```

2. **Angular CLI Version:**
   ```bash
   ng version
   # Should be 18.x
   ```

3. **Available Memory:**
   ```bash
   # Increase Node memory if needed
   export NODE_OPTIONS="--max_old_space_size=8192"
   ```

4. **Firewall/Antivirus:**
   - Check if port 4200 is blocked
   - Temporarily disable antivirus

5. **File Permissions:**
   ```bash
   # Fix permissions if needed
   chmod -R 755 .
   ```

### Get Detailed Error Info:

```bash
# Run with debug output
DEBUG=* npm start

# Or check detailed logs
npm start 2>&1 | tee debug.log
```

## Success Indicators

- ✅ Terminal shows "Local: http://localhost:4200/"
- ✅ Browser loads without errors
- ✅ Console shows bootstrap messages
- ✅ Buttons respond to clicks
- ✅ Status updates when clicking controls

If you see all of these, the app is working correctly!

## Contact Support

If issues persist after trying these steps:
1. Check browser console for specific error messages
2. Look at terminal output for build errors
3. Try the simple test component first
4. Verify all dependencies are correctly installed

The app structure is solid and builds successfully - any issues are likely environmental and can be resolved with the steps above.