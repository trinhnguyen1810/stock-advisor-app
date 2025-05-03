#!/bin/bash

# Exit on any error
set -e

# Install git-filter-repo if needed
if ! command -v git-filter-repo &> /dev/null; then
  echo "git-filter-repo not found. Installing..."
  brew install git-filter-repo
fi

# Clean large/unwanted folders from history
echo "Cleaning node_modules and venv from git history..."
git filter-repo --force \
  --path frontend/node_modules --path backend/venv --invert-paths

# Update .gitignore
echo "Updating .gitignore..."
echo -e "\n# Ignore heavy folders\nnode_modules/\nbackend/venv/" >> .gitignore
git add .gitignore
git commit -m "Add node_modules and venv to .gitignore"

# Reset origin (if not already added)
echo "Resetting GitHub remote..."
git remote remove origin || true
git remote add origin https://github.com/trinhnguyen1810/stock-advisor-app.git

# Force push
echo "Force pushing to GitHub..."
git push -u origin main --force

echo "✅ Push complete! Large files removed."
