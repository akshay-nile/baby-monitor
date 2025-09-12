#!/bin/bash
# deploy.sh - Automates deployment of a React project to your PythonAnywhere server
# Usage: ./deploy.sh <project-name>

# Steps:
# 1) Run React build (npm run build)
# 2) Zip contents of dist/ into dist.zip
# 3) Upload dist.zip to server via POST request
# 4) Verify response (operation = success && available[] contains project-name)
# 5) Clean up local build folder if deployment successful

# Exit immediately if any command fails
set -e

# === CONFIGURATION ===
DIST_DIR="./dist"
ZIP_FILE="dist.zip"
DEPLOY_URL="https://akshaynile.pythonanywhere.com/deploy"

# === VALIDATION ===
if [ -z "$1" ]; then
  echo "❌ Project name not provided!"
  echo "Usage:👉 ./deploy.sh <project-name>"
  exit 1
fi

PROJECT_NAME="$1"

echo "🚀 Starting project deployment: /$PROJECT_NAME"

# === STEP 0: Remove old dist folder if any ===
echo "🗑️  Removing old dist folder..."
rm -rf "$DIST_DIR" 

# === STEP 1: Build React project ===
echo "⚙️  Running npm build..."
npm run build -- --base ./

# === STEP 2: Zip the dist folder ===
echo "💾 Zipping dist folder..."
# Check if bestzip is installed
if ! command -v bestzip &> /dev/null; then
  echo "bestzip not found! installing..."
  npm install -g bestzip
fi
bestzip "$DIST_DIR/$ZIP_FILE" "$DIST_DIR/*"

# === STEP 3: Upload to server ===
echo "📤 Uploading dist.zip file..."
RESPONSE=$(curl -s -X POST -F "dist=@$DIST_DIR/$ZIP_FILE" "$DEPLOY_URL/$PROJECT_NAME")

# === STEP 4: Verify response ===
echo "👁️‍🗨️ Verifying Server Response: $RESPONSE"
OPERATION=$(powershell.exe -Command "('$RESPONSE' | ConvertFrom-Json).operation")
AVAILABLE=$(powershell.exe -Command "('$RESPONSE' | ConvertFrom-Json).available -join ' '")

if [ "$OPERATION" == "success" ] && echo "$AVAILABLE" | grep -q "$PROJECT_NAME"; then
  echo "✅ Deployment Successful!"
  echo "🌐 https://akshaynile.pythonanywhere.com/projects/$PROJECT_NAME"

  # === STEP 5: Clean up dist folder ===
  echo "🧹 Removing the dist folder..."
  rm -rf "$DIST_DIR"
  echo "✨ Clean-Up Done!"
else
  echo "❌ Deployment Failed!"
  exit 1
fi
