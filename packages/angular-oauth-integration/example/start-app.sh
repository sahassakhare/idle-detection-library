#!/bin/bash

echo "🚀 Starting Idle Detection App..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the correct directory."
    echo "   Expected: packages/angular-oauth-integration/example"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "🌐 Starting development server..."
    echo "   The app will open at: http://localhost:4200"
    echo ""
    echo "📋 What to expect:"
    echo "   - Material Design interface"
    echo "   - Idle detection controls"
    echo "   - Status information"
    echo "   - Test buttons for functionality"
    echo ""
    echo "🔧 Debug info:"
    echo "   - Open browser console (F12) for detailed logs"
    echo "   - Look for '🚀 Minimal Working App Started' message"
    echo "   - Check for any error messages in red"
    echo ""
    echo "⏹️  To stop the server: Press Ctrl+C"
    echo ""
    
    # Start the development server
    npm start
else
    echo ""
    echo "❌ Build failed! Check the error messages above."
    exit 1
fi