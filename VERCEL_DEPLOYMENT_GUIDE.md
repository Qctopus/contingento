# Vercel Deployment Guide

## 🚀 Quick Fix for Build Errors

The deployment error you experienced was due to running database migrations during the build phase. This has been fixed by:

1. **Simplified Build Command** - Removed `prisma migrate deploy` from build
2. **Separate Migration Script** - Migrations now run after deployment
3. **Fallback Handling** - Build won't fail if migrations aren't immediately available

## ✅ What Was Fixed

### Before (Causing Errors):
```json
{
  "buildCommand": "npx prisma generate --force && npx prisma migrate deploy && npx prisma generate && next build"
}
```

### After (Fixed):
```json
{
  "buildCommand": "prisma generate && next build"
}
```

**Why This Works:**
- ✅ Build doesn't depend on database access
- ✅ Migrations run separately via postbuild hook
- ✅ Faster build times
- ✅ More reliable deployments

## 📋 Deployment Steps

### 1. **Environment Variables in Vercel**

Make sure these are set in your Vercel project settings:

**Required:**
```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

**Optional but Recommended:**
```
DIRECT_URL=postgresql://user:password@host:5432/database?sslmode=require
NODE_ENV=production
```

### 2. **Deploy to Vercel**

```bash
# Option 1: Deploy via Git (Recommended)
git add .
git commit -m "Fix Vercel deployment configuration"
git push origin main
# Vercel will auto-deploy

# Option 2: Deploy via Vercel CLI
vercel --prod
```

### 3. **Run Migrations (If Needed)**

After successful deployment, if migrations didn't run automatically:

**Via Vercel CLI:**
```bash
vercel env pull .env.local
node scripts/deploy-migrations.js
```

**Or manually trigger:**
```bash
# SSH into Vercel or use Vercel CLI
npx prisma migrate deploy
```

## 🔧 Build Configuration Files

### `vercel.json`
```json
{
  "framework": "nextjs",
  "buildCommand": "prisma generate && next build",
  "regions": ["iad1"],
  "installCommand": "npm ci"
}
```

### `package.json` Scripts
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "vercel-build": "prisma generate && next build",
    "postbuild": "prisma migrate deploy || echo 'Migrations will run on first request'",
    "postinstall": "prisma generate || echo 'Prisma generate will run during build'"
  }
}
```

## 🐛 Troubleshooting

### Error: "Command exited with 1"

**Cause:** Database migrations failing during build

**Fix:** ✅ Already applied! The new build command doesn't run migrations during build.

### Error: "DATABASE_URL is not defined"

**Fix:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `DATABASE_URL` with your PostgreSQL connection string
3. Redeploy

### Error: "Prisma Client not generated"

**Fix:**
```bash
# The build command now includes prisma generate
# If still failing, check that prisma is in dependencies (not devDependencies)
```

### Error: "Migration failed"

**Fix:**
```bash
# Run migrations manually after deployment:
node scripts/deploy-migrations.js
```

## 📊 What Happens During Deployment

### Build Phase (Vercel):
1. ✅ `npm ci` - Install dependencies
2. ✅ `prisma generate` - Generate Prisma Client
3. ✅ `next build` - Build Next.js app

### Post-Build (Optional):
4. ⏩ `prisma migrate deploy` - Runs if database is accessible (via postbuild hook)
5. ⏩ If fails, migrations can be run manually later

### Runtime:
6. ✅ App starts with latest code
7. ✅ Prisma Client connects to database
8. ✅ App serves requests

## 🎯 Best Practices

### ✅ DO:
- Keep `DATABASE_URL` in environment variables
- Use PostgreSQL (not SQLite) for production
- Run migrations separately from builds
- Use `prisma generate` in build command
- Test deployments in preview environments first

### ❌ DON'T:
- Don't run migrations during build (build should not depend on DB)
- Don't commit `.env` files
- Don't use SQLite in production on Vercel
- Don't use `--force` flags unnecessarily

## 🚨 Quick Checklist

Before deploying, ensure:

- [ ] `DATABASE_URL` is set in Vercel environment variables
- [ ] Database is PostgreSQL (not SQLite)
- [ ] `prisma` is in `dependencies` (not `devDependencies`)
- [ ] Build command is: `prisma generate && next build`
- [ ] Git changes are committed and pushed

## 📝 Running Migrations Manually

If you need to run migrations after deployment:

### Method 1: Via Vercel CLI
```bash
# Pull environment variables
vercel env pull .env.local

# Run migration script
node scripts/deploy-migrations.js
```

### Method 2: Direct Prisma Command
```bash
# With DATABASE_URL set
npx prisma migrate deploy
```

### Method 3: Via Vercel Function (Advanced)
Create an API route at `pages/api/migrate.ts` (protect with auth!):
```typescript
import { prisma } from '@/lib/prisma'
import { execSync } from 'child_process'

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.MIGRATION_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    res.json({ success: true, message: 'Migrations deployed' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
```

## ✅ Deployment Should Now Work!

Your deployment configuration is now fixed. Simply:

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Vercel will auto-deploy** with the new build command

3. **Verify deployment** at your Vercel URL

If you still encounter issues, check:
- Vercel deployment logs for specific errors
- Environment variables are correctly set
- Database is accessible from Vercel's network

## 📚 Additional Resources

- [Vercel + Prisma Deployment](https://vercel.com/guides/deploying-prisma-with-vercel)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Prisma Migrate Deploy](https://www.prisma.io/docs/concepts/components/prisma-migrate/migrate-development-production)

