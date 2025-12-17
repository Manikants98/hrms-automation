#!/bin/bash

echo "🚀 HRMS Automation Deployment Script"
echo "======================================"
echo ""

read -p "Enter your GitHub repository URL: " GITHUB_REPO
read -p "Enter your backend URL (e.g., https://hrms-be.onrender.com): " BACKEND_URL
read -p "Enter your frontend URL (e.g., https://hrms-fe.vercel.app): " FRONTEND_URL

echo ""
echo "📝 Deployment Checklist:"
echo "1. Push code to GitHub: $GITHUB_REPO"
echo "2. Backend URL: $BACKEND_URL"
echo "3. Frontend URL: $FRONTEND_URL"
echo ""
echo "📋 Next Steps:"
echo ""
echo "FRONTEND (Vercel):"
echo "1. Go to https://vercel.com"
echo "2. Import repository: $GITHUB_REPO"
echo "3. Root Directory: hrms-automation-fe"
echo "4. Environment Variable: VITE_API_BASE_URL = $BACKEND_URL/api"
echo ""
echo "BACKEND (Render):"
echo "1. Go to https://render.com"
echo "2. New Web Service → Connect $GITHUB_REPO"
echo "3. Root Directory: hrms-automation-be"
echo "4. Build Command: npm install && npm run build && npm run prisma:generate"
echo "5. Start Command: npm start"
echo "6. Set Environment Variables:"
echo "   - NODE_ENV=production"
echo "   - DATABASE_URL=your_database_url"
echo "   - JWT_SECRET=your_jwt_secret"
echo "   - JWT_EXPIRES_IN=7d"
echo ""
echo "✅ After backend deploys, update VITE_API_BASE_URL in Vercel"
echo ""
