#!/bin/bash

echo "🚀 Installing Chat Module Dependencies for ExpertMind Backend..."

# Navigate to backend directory
cd /Users/hernantapia/mine/expertmind-monorepo/apps/backend

# Install uuid dependency
echo "📦 Installing uuid..."
npm install uuid

# Install uuid types
echo "📦 Installing @types/uuid..."
npm install --save-dev @types/uuid

echo "✅ Dependencies installed successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Make sure your .env file has the required variables (check .env.example)"
echo "2. Start the backend: npm run start:dev"
echo "3. Check the API documentation at: http://localhost:3001/api"
echo ""
echo "📚 New Chat API endpoints available at:"
echo "   - POST   /chat/conversations"
echo "   - GET    /chat/conversations"
echo "   - POST   /chat/conversations/:id/messages"
echo "   - GET    /chat/providers"
echo ""
echo "🎉 Chat Module implementation complete!"
