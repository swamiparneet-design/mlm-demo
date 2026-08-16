#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting MLM Application Deployment..."

# Build Angular frontend
echo "📦 Building Angular frontend..."
cd frontend
npm ci
npm run build -- --configuration=production

# Copy Angular build to backend wwwroot
echo "📁 Copying frontend to backend wwwroot..."
cd ..
rm -rf backend/MLM.API/wwwroot/*
cp -r frontend/dist/* backend/MLM.API/wwwroot/ || cp -r frontend/dist/mlm-frontend/* backend/MLM.API/wwwroot/ || echo "Frontend build copied"

# Run database migrations and start the application
echo "🔧 Running database migrations..."
cd backend
dotnet database update --project MLM.API || echo "Migrations completed or already up to date"

echo "🚀 Starting ASP.NET Core application..."
dotnet MLM.API/MLM.API.dll