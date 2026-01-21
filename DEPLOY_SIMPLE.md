# 🚀 Simple Vercel Deployment Guide

## What You Need

Your project uses:
- ✅ **PostgreSQL** (via Prisma) - for database
- ✅ **Firebase** - for Google Authentication only
- ✅ **Cloudinary** - for image uploads (payment screenshots, blog images)

## Step 1: Deploy to Vercel

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New Project"
4. Import `frien-frozen/docsulton`
5. Click "Deploy" (don't add env vars yet)

## Step 2: Get Your Vercel URL

After first deployment, you'll get a URL like:
`https://docsulton.vercel.app`

Copy this URL - you'll need it!

## Step 3: Add Environment Variables

Go to your Vercel project → Settings → Environment Variables

Add these **one by one**:

### Database (Required)
```
DATABASE_URL
postgres://0347d45e718f8eb4d3ef3adf608ee7cccdc891e8d6494dfbd18af22b755fe4e1:sk_3JBaZ_XQYZMHznoEPvjcZ@db.prisma.io:5432/db?sslmode=require
```

### NextAuth (Required)
```
NEXTAUTH_URL
https://docsulton.vercel.app
(use your actual Vercel URL)

NEXTAUTH_SECRET
(generate with: openssl rand -base64 32)
```

### Firebase - Google Auth (Required)
Get these from your Firebase Console → Project Settings:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

### Cloudinary - Image Uploads (Required)
Get these from https://cloudinary.com/console:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

## Step 4: Redeploy

After adding all environment variables:
1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"

## Step 5: Add Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your domain (e.g., `drsultonbek.uz`)
3. Update DNS records as shown
4. Update `NEXTAUTH_URL` to your custom domain

## Generate NEXTAUTH_SECRET

Run this command:
```bash
openssl rand -base64 32
```

Copy the output and use it as `NEXTAUTH_SECRET`

## Why Each Service?

- **PostgreSQL**: Stores all data (bookings, users, posts, messages)
- **Firebase**: Handles Google login authentication
- **Cloudinary**: Stores uploaded images (converts to WebP automatically)

## Troubleshooting

**Build fails?**
- Check all environment variables are added
- Verify DATABASE_URL has `?sslmode=require` at the end

**Can't login?**
- Make sure NEXTAUTH_URL matches your actual domain
- Check Firebase config is correct

**Images won't upload?**
- Verify Cloudinary credentials
- Check Cloudinary free tier limits

## After Deployment

Your site will be live at your Vercel URL!

Access admin panel at: `https://your-url.vercel.app/admin/login`

Every time you push to GitHub, Vercel will automatically redeploy.
