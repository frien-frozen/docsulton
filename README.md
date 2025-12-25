# Dr. Sultonbek Norkuziev - Portfolio Website

Professional portfolio website for Dr. Sultonbek Norkuziev - Urologist, Andrologist, and Endourologist.

## Features

### Public Pages
- ✅ Homepage with hero section and social links
- ✅ About page
- ✅ Projects showcase
- ✅ Blog with markdown support
- ✅ Certificates gallery
- ✅ Contact form

### Admin Panel (`/admin`)
- ✅ Secure login (username: `admin`, password: `password1234`)
- ✅ Dashboard with statistics
- ✅ Projects management (CRUD, drag & drop, visibility toggle)
- ✅ Blog posts management (markdown editor, publish/draft)
- ✅ Certificates management (upload, reorder)
- ✅ Messages inbox
- ✅ Password change functionality

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom glassmorphism effects
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **File Upload**: Cloudinary
- **Animations**: Framer Motion, custom CSS animations

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sultonaka"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data (creates admin user)
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 5. Access Admin Panel

- URL: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Username: `admin`
- Password: `password1234`

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin your-repo-url
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables:
   - `DATABASE_URL` - Get from Vercel Postgres
   - `NEXTAUTH_URL` - Your production URL
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

### 3. Set Up Vercel Postgres

1. In your Vercel project, go to Storage
2. Create a new Postgres database
3. Copy the `DATABASE_URL` to your environment variables
4. Run migrations:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

### 4. Set Up Cloudinary

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret
3. Add them to Vercel environment variables

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── projects/     # Projects CRUD
│   │   ├── posts/        # Blog posts CRUD
│   │   ├── certificates/ # Certificates CRUD
│   │   ├── messages/     # Contact messages
│   │   └── upload/       # File upload
│   ├── admin/            # Admin panel pages
│   ├── about/            # About page
│   ├── blog/             # Blog pages
│   ├── certificates/     # Certificates page
│   ├── contact/          # Contact page
│   ├── projects/         # Projects page
│   └── page.tsx          # Homepage
├── components/
│   ├── ui/               # Reusable UI components
│   └── admin/            # Admin-specific components
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   ├── cloudinary.ts     # Cloudinary utilities
│   └── utils.ts          # Helper functions
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding
└── types/                # TypeScript type definitions
```

## Database Schema

- **User**: Admin authentication
- **Project**: Portfolio projects with images, tech stack, visibility
- **Post**: Blog posts with markdown, tags, publish status
- **Certificate**: Certificates with images, dates, ordering
- **Message**: Contact form submissions

## Features in Detail

### Visibility Control
All content types (projects, posts, certificates) have an `isVisible` field:
- ✅ Visible: Shows on public site
- ❌ Hidden: Only visible in admin panel

### Drag & Drop Reordering
Projects and certificates can be reordered by dragging in the admin panel.

### Markdown Support
Blog posts support full markdown with:
- Code syntax highlighting
- Images
- Lists, tables, blockquotes
- And more

### SEO Optimized
- Meta tags for all pages
- Open Graph tags
- Automatic sitemap generation
- Semantic HTML

## Admin Panel Features

### Projects Management
- Create/edit/delete projects
- Upload multiple images
- Add live demo and GitHub links
- Specify tech stack
- Toggle visibility
- Drag to reorder

### Blog Management
- Write in markdown
- Live preview
- Publish/draft toggle
- Add tags and categories
- Schedule posts
- Toggle visibility

### Certificates Management
- Upload certificate images
- Add title, issuer, date
- Drag to reorder
- Toggle visibility

### Messages
- View contact form submissions
- Mark as read/unread
- Delete messages

### Settings
- Change admin password
- Site configuration

## Support

For issues or questions, contact Dr. Sultonbek Norkuziev:
- Telegram: [@sultonbekdr](https://t.me/sultonbekdr)
- YouTube: [@doc.sultonbek](https://www.youtube.com/@doc.sultonbek)
- Instagram: [@doc.sultonbek](https://www.instagram.com/doc.sultonbek/)

## License

© 2024 Dr. Sultonbek Norkuziev. All rights reserved.
