# Vercel Deployment Guide for Dr. Sultonbek's Website

## Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- PostgreSQL database (we'll use Neon or Supabase - both have free tiers)

## Step 1: Prepare Your Database

### Option A: Neon (Recommended - Serverless PostgreSQL)
1. Go to https://neon.tech
2. Sign up/Login
3. Create a new project
4. Copy the connection string (it looks like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`)

### Option B: Supabase
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection string" under "Connection pooling" (use Transaction mode)

## Step 2: Update package.json Build Script

Your build script needs to run Prisma migrations. Update `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && prisma migrate deploy && next build",
    "start": "next start",
    "lint": "eslint",
    "postinstall": "prisma generate"
  }
}
```

## Step 3: Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for Vercel deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `.next` (default)

## Step 5: Add Environment Variables in Vercel

In Vercel project settings → Environment Variables, add:

### Required Variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=generate-a-random-secret-here

# Cloudinary (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Firebase (for Google Auth)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Telegram (optional - for notifications)
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

### How to Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## Step 6: Initial Database Setup

After deployment, you need to run migrations:

### Method 1: Using Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Run migration
vercel env pull .env.production
npx prisma migrate deploy
```

### Method 2: Using Prisma Studio
```bash
# Connect to production database locally
DATABASE_URL="your-production-db-url" npx prisma studio
```

## Step 7: Seed Initial Data (Optional)

Create an admin user:

```bash
# Using Vercel CLI
DATABASE_URL="your-production-db-url" npx prisma db seed
```

Or manually create admin via Prisma Studio.

## Step 8: Configure Custom Domain (Optional)

1. In Vercel project settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. Update `NEXTAUTH_URL` environment variable to your custom domain

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify DATABASE_URL is correct

### Database Connection Issues
- Ensure `?sslmode=require` is in your DATABASE_URL
- Check if your database allows connections from Vercel IPs
- For Neon: Enable "Pooler" connection string
- For Supabase: Use "Transaction" mode connection string

### Prisma Issues
- Make sure `postinstall` script runs `prisma generate`
- Check that migrations are applied: `npx prisma migrate status`

### Images Not Uploading
- Verify Cloudinary credentials
- Check Cloudinary dashboard for upload limits

## Post-Deployment Checklist

- [ ] Database connected and migrations applied
- [ ] Admin login works
- [ ] Google authentication works
- [ ] Image uploads work (Cloudinary)
- [ ] Booking system functional
- [ ] Email notifications work
- [ ] Contact form saves messages
- [ ] Custom domain configured (if applicable)

## Monitoring

- Check Vercel Analytics for performance
- Monitor database usage in Neon/Supabase dashboard
- Set up error tracking (optional: Sentry)

## Updating Your Site

Every time you push to GitHub main branch, Vercel will automatically:
1. Build your project
2. Run migrations
3. Deploy the new version

## Important Notes

1. **Free Tier Limits**:
   - Vercel: 100GB bandwidth/month
   - Neon: 0.5GB storage, 191 hours compute/month
   - Cloudinary: 25GB storage, 25GB bandwidth/month

2. **Security**:
   - Never commit `.env` files to GitHub
   - Use strong secrets for NEXTAUTH_SECRET
   - Regularly update dependencies

3. **Performance**:
   - Enable Vercel Edge Network
   - Use Image Optimization (already configured)
   - Monitor database query performance

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Prisma Docs: https://www.prisma.io/docs
