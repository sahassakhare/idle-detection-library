# Quick Setup Guide

## Fixed Zone.js Error ✅

The Zone.js configuration error has been resolved. Here's how to run the example:

## Steps to Run:

```bash
# 1. Navigate to the example directory
cd packages/angular-oauth-integration/example

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
```

## If you still get errors:

### 1. Clear npm cache and reinstall:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 2. Build the libraries first:
```bash
# Build core library
cd ../../core
npm run build

# Build angular integration
cd ../angular-oauth-integration
npm run build

# Go back to example
cd example
npm install
npm start
```

### 3. Alternative command:
```bash
# Try with specific port
npm run serve
# or
ng serve --port 4200 --open
```

## What was fixed:

✅ **Zone.js import** - Added proper polyfills configuration  
✅ **Angular 18 compatibility** - Updated build configuration  
✅ **TypeScript errors** - Fixed all compilation issues  
✅ **Mock OAuth service** - Added for testing without real OAuth  
✅ **NgRx DevTools** - Included for state debugging  

## Expected Features:

- 🕐 **30-second idle timeout** (shortened for demo)
- ⚠️ **10-second warning countdown**
- 🎭 **Role-based timeouts** (admin/user/guest)
- 🔄 **Multi-tab coordination**
- 🎨 **Custom styling examples**
- 📊 **Live state monitoring**

The app should now start successfully at `http://localhost:4200`!