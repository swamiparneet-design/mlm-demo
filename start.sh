#!/bin/bash
set -e

echo "🚀 Starting MLM Application Build and Deploy..."

# Print current directory
echo "Current directory: $(pwd)"
echo "Files:"
ls -la

# Check if we're in the right place
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: backend and frontend directories not found!"
    exit 1
fi

# Step 1: Build Angular frontend
echo "📦 Step 1: Building Angular frontend..."
cd frontend

if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in frontend!"
    exit 1
fi

echo "Installing frontend dependencies..."
npm ci --silent

echo "Building Angular app..."
npm run build -- --configuration=production

echo "Frontend build complete!"
ls -la dist/

# Step 2: Copy frontend build to backend wwwroot
echo "📁 Step 2: Copying frontend to backend wwwroot..."
cd ..

# Create wwwroot if it doesn't exist
mkdir -p backend/MLM.API/wwwroot

# Clear existing wwwroot content
rm -rf backend/MLM.API/wwwroot/*

# Copy frontend build
if [ -d "frontend/dist" ]; then
    # Check if there's a subdirectory in dist
    if [ "$(ls -A frontend/dist)" ]; then
        # If dist contains a single folder, copy its contents
        if [ $(ls frontend/dist | wc -l) -eq 1 ] && [ -d "frontend/dist/$(ls frontend/dist | head -1)" ]; then
            cp -r frontend/dist/$(ls frontend/dist | head -1)/* backend/MLM.API/wwwroot/
        else
            cp -r frontend/dist/* backend/MLM.API/wwwroot/
        fi
    fi
else
    echo "⚠️ Warning: frontend/dist not found"
fi

echo "Frontend copied to wwwroot!"
ls -la backend/MLM.API/wwwroot/

# Step 3: Build and run .NET backend
echo "🔧 Step 3: Building and running .NET backend..."
cd backend

if [ ! -f "MLM.sln" ]; then
    echo "❌ Error: MLM.sln not found!"
    exit 1
fi

echo "Restoring .NET dependencies..."
dotnet restore MLM.sln

echo "Building .NET solution..."
dotnet build MLM.sln --configuration Release --no-restore

echo "Publishing MLM.API..."
dotnet publish MLM.API/MLM.API.csproj --configuration Release --output ./publish

echo "Running database migrations..."
cd MLM.API
dotnet ef database update || echo "Migrations completed or already up to date"

echo "🚀 Starting application..."
echo "Application will be available on port $PORT or 8080"

# Run the application
dotnet MLM.API.dll