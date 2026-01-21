#!/bin/bash

# Vercel Deployment Quick Start Script
# This script helps you deploy your project to Vercel

echo "🚀 Dr. Sultonbek's Website - Vercel Deployment Helper"
echo "=================================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git repository already initialized"
fi

# Check if .gitignore exists
if [ ! -f ".gitignore" ]; then
    echo "⚠️  No .gitignore found. Creating one..."
    cat > .gitignore << 'EOF'
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env
.env*.local
.env.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOF
    echo "✅ .gitignore created"
fi

echo ""
echo "📋 Pre-deployment Checklist:"
echo ""
echo "1. Database Setup:"
echo "   - Create a PostgreSQL database on Neon (https://neon.tech) or Supabase (https://supabase.com)"
echo "   - Copy the connection string"
echo ""
echo "2. Cloudinary Setup (for image uploads):"
echo "   - Sign up at https://cloudinary.com"
echo "   - Get your Cloud Name, API Key, and API Secret"
echo ""
echo "3. Firebase Setup (for Google Auth):"
echo "   - Create a project at https://console.firebase.google.com"
echo "   - Enable Google Authentication"
echo "   - Get your Firebase config"
echo ""
echo "4. Generate NextAuth Secret:"
echo "   Run: openssl rand -base64 32"
echo ""

read -p "Have you completed the above steps? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please complete the setup steps first, then run this script again."
    exit 1
fi

echo ""
echo "📝 Adding files to git..."
git add .

echo ""
read -p "Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Prepare for Vercel deployment"
fi

git commit -m "$commit_msg"
echo "✅ Files committed"

echo ""
echo "🔗 Next steps:"
echo ""
echo "1. Create a GitHub repository:"
echo "   - Go to https://github.com/new"
echo "   - Create a new repository (don't initialize with README)"
echo ""
echo "2. Push your code:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Deploy to Vercel:"
echo "   - Go to https://vercel.com/new"
echo "   - Import your GitHub repository"
echo "   - Add environment variables (see DEPLOYMENT.md for the full list)"
echo "   - Deploy!"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "✨ Good luck with your deployment!"
