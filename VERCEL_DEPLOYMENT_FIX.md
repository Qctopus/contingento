# 🚨 Vercel Deployment Fix - "Failed to Load Data" Error

## 🔍 Problem
Vercel deployment succeeded but the app shows "Failed to load data" errors. This is typically caused by:
1. ❌ **SCHEMA MISMATCH**: Prisma configured for SQLite but Vercel needs PostgreSQL
2. ❌ Missing DATABASE_URL environment variable
3. ❌ Prisma Client not generated during build
4. ❌ Database connection issues from Vercel

## ✅ CRITICAL FIX (Already Applied!)

**The schema has been updated from SQLite to PostgreSQL.** 

Previous error:
```
error: Error validating datasource `db`: the URL must start with the protocol `file:`.
 --> schema.prisma:4
 | 
 3 | provider = "sqlite"
 4 | url = env("DATABASE_URL")
```

**Fixed in latest commit:** `prisma/schema.prisma` now uses `provider = "postgresql"`

This change has been pushed to GitHub and Vercel will auto-redeploy with the fix!

## ✅ Solution - Step by Step

### **Step 1: Set Environment Variables in Vercel**

1. Go to your Vercel project: https://vercel.com/dashboard
2. Click on your project → **Settings** → **Environment Variables**
3. Add these **REQUIRED** variables:

```
DATABASE_URL
Value: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
Environment: Production, Preview, Development

NEXTAUTH_URL  
Value: https://your-project.vercel.app
Environment: Production

NEXTAUTH_URL (for preview)
Value: https://$VERCEL_URL
Environment: Preview, Development

NEXTAUTH_SECRET
Value: (generate with: openssl rand -base64 32)
Environment: Production, Preview, Development
```

### **Step 2: Verify Database Connection**

**For Neon/Supabase/Railway Postgres:**
```
postgresql://user:password@ep-xyz-123.region.aws.neon.tech/dbname?sslmode=require
```

**Important:** 
- ✅ Must include `?sslmode=require` for cloud databases
- ✅ Database must be accessible from Vercel's IP addresses
- ✅ Test connection string locally first

### **Step 3: Run Database Migrations**

If your database is empty, run migrations:

```bash
# Set your DATABASE_URL locally
export DATABASE_URL="your_production_database_url"

# Run migrations
npx prisma migrate deploy

# Seed data (if you have seed scripts)
npx prisma db seed
```

### **Step 4: Redeploy to Vercel**

After setting environment variables:

1. Go to **Deployments** tab
2. Click the **...** menu on latest deployment
3. Click **Redeploy**
4. Check the build logs for errors

### **Step 5: Check Vercel Build Logs**

Look for these in the deployment logs:

✅ **Good signs:**
```
Running "prisma generate"
✓ Generated Prisma Client
✓ Compiled successfully
```

❌ **Bad signs:**
```
Error: Prisma Client could not locate the Query Engine
Database connection failed
```

### **Step 6: Verify Prisma Configuration**

The build should automatically run `prisma generate`. Verify in `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "next build"
  }
}
```

## 🐛 Common Issues & Fixes

### Issue 1: "Prisma Client could not locate Query Engine"
**Fix:** Add to `package.json`:
```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

### Issue 2: "Database connection failed"
**Fixes:**
1. Check DATABASE_URL is correct
2. Ensure database allows connections from Vercel IPs
3. Add `?sslmode=require` to connection string
4. Verify database is running and accessible

### Issue 3: "Failed to load data" on specific pages
**Fixes:**
1. Check API route logs in Vercel dashboard
2. Look for CORS issues
3. Verify Prisma queries in `/api` routes
4. Check serverless function timeout (default: 10s)

### Issue 4: API routes return 500 errors
**Fix:** Check Vercel function logs:
1. Go to **Deployments** → Click deployment
2. Click **Functions** tab
3. Look for error messages in each API route

## 🔧 Advanced Troubleshooting

### Enable Debug Logging

Add to `next.config.js`:
```javascript
const nextConfig = {
  // ... existing config
  env: {
    PRISMA_LOG_LEVEL: 'info',
  }
}
```

### Check Database Schema

Run locally with production DATABASE_URL:
```bash
npx prisma db pull
npx prisma generate
npm run dev
```

If it works locally, the issue is Vercel-specific.

### Increase Serverless Function Timeout

In `vercel.json`:
```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

## 📋 Quick Checklist

Before redeploying, verify:

- [ ] DATABASE_URL set in Vercel env vars
- [ ] NEXTAUTH_URL set correctly
- [ ] NEXTAUTH_SECRET set
- [ ] Database is accessible from internet
- [ ] Connection string has `?sslmode=require`
- [ ] Migrations have been run on production DB
- [ ] `postinstall` script in package.json
- [ ] Build logs show "prisma generate" succeeded
- [ ] No TypeScript errors (or ignored in next.config.js)

## 🆘 Still Not Working?

1. **Check Vercel Dashboard Logs:**
   - Deployments → [Your Deployment] → View Function Logs
   - Look for API route errors

2. **Test API Routes Directly:**
   ```
   https://your-app.vercel.app/api/admin2/parishes
   ```
   Check if you get JSON response or error

3. **Verify Database Data:**
   ```bash
   npx prisma studio --url="your_production_database_url"
   ```
   Confirm data exists in tables

4. **Check Network Tab:**
   - Open browser DevTools → Network
   - Look for failed API requests
   - Check error responses

## 🎯 Most Common Fix

**90% of the time, it's the DATABASE_URL!**

1. Copy your production database URL
2. Add to Vercel environment variables
3. Include `?sslmode=require` at the end
4. Redeploy

Example:
```
postgresql://user:pass@host.aws.neon.tech:5432/dbname?sslmode=require
```

## ✅ Success Indicators

After fixing, you should see:
- ✅ Admin2 dashboard loads with parish data
- ✅ Wizard shows business types
- ✅ No console errors in browser
- ✅ API routes return data (not 500 errors)
- ✅ Multipliers tab shows configured multipliers

---

**Need more help?** Check the Vercel function logs at:
`https://vercel.com/[your-team]/[your-project]/deployments/[deployment-id]`

