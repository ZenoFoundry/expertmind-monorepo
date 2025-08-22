#!/bin/bash

echo "🔧 Fixing JWT Authentication Strategy..."

# Navigate to backend directory
cd /Users/hernantapia/mine/expertmind-monorepo/apps/backend

# Install missing Passport dependencies
echo "📦 Installing passport-jwt..."
npm install passport-jwt

echo "📦 Installing @types/passport-jwt..."
npm install --save-dev @types/passport-jwt

echo "🔄 Restarting backend..."
echo "Please restart your backend server with: npm run start:dev"

echo "✅ JWT Strategy setup complete!"
echo ""
echo "🧪 To test:"
echo "1. Restart the backend: npm run start:dev"
echo "2. Login in the frontend to get a token"
echo "3. Try creating a conversation in online mode"
echo ""
echo "🔍 Expected behavior:"
echo "- Online mode should now work correctly"
echo "- JWT authentication should pass"
echo "- Conversations should be created in backend"
