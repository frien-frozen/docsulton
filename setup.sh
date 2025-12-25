#!/bin/bash

echo "🚀 Setting up Dr. Sultonbek's Portfolio Website..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local file..."
  cat > .env.local << EOF
# Database (Update with your PostgreSQL connection string)
DATABASE_URL="postgresql://user:password@localhost:5432/sultonaka"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Cloudinary (Get these from cloudinary.com)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
EOF
  echo "✅ Created .env.local"
  echo "⚠️  Please update DATABASE_URL and Cloudinary credentials in .env.local"
  echo ""
else
  echo "✅ .env.local already exists"
  echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.local with your database and Cloudinary credentials"
echo "2. Run: npx prisma db push (to create database tables)"
echo "3. Run: npx prisma db seed (to create admin user)"
echo "4. Run: npm run dev (to start development server)"
echo ""
echo "🔐 Default admin credentials:"
echo "   Username: admin"
echo "   Password: password1234"
echo ""
echo "📚 See README.md for full documentation"
