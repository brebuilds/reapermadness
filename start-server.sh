#!/bin/bash

# REAPER Assistant Server Startup Script
# Run this on your local machine to enable web control of REAPER

echo "🎛️  REAPER Assistant Server"
echo "=============================="
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found. Installing..."
    npm install -g pnpm
fi

# Check if node_modules exists
if [ ! -d "node_modules" ] || [ ! -d "packages/server/node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Build if needed
if [ ! -d "packages/server/dist" ]; then
    echo "🔨 Building server..."
    pnpm build:server
fi

echo ""
echo "✅ Starting server on http://localhost:3001"
echo ""
echo "📋 Next steps:"
echo "   1. Open REAPER and enable OSC (port 8000)"
echo "   2. Go to the web app and enter http://localhost:3001 as Server URL"
echo "   3. Click Test to verify connection"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
pnpm dev:server
