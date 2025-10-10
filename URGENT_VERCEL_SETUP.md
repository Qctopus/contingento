# 🚨 URGENT: Vercel Setup Instructions

## ✅ What I Just Fixed

**CRITICAL BUG FOUND AND FIXED:**
- Your `schema.prisma` was configured for **SQLite** (local database)
- Vercel needs **PostgreSQL** (cloud database)
- **Fix committed and pushed** - Vercel will auto-redeploy in ~2 minutes

## 🎯 What You Need to Do NOW (3 Steps)

### **Step 1: Get a PostgreSQL Database** (5 minutes)

You need a cloud PostgreSQL database. Choose ONE option:

#### Option A: Neon (Recommended - Free tier, fast)
1. Go to: https://neon.tech
2. Sign up with GitHub
3. Create a new project: "contingento-db"
4. Copy the connection string (it looks like):
   ```
   postgresql://user:password@ep-xyz-123.region.aws.neon.tech/neondb?sslmode=require
   ```

#### Option B: Supabase (Free tier, includes auth)
1. Go to: https://supabase.com
2. Create new project: "contingento"
3. Go to Settings → Database → Connection String
4. Copy the connection string

#### Option C: Railway (Easy, free trial)
1. Go to: https://railway.app
2. Create new PostgreSQL database
3. Copy connection string from "Connect" tab

---

### **Step 2: Set DATABASE_URL in Vercel** (2 minutes)

1. Go to: https://vercel.com/dashboard
2. Click your **"contingento"** project
3. Go to: **Settings** → **Environment Variables**
4. Add this variable:

```
Name:  DATABASE_URL
Value: [paste your PostgreSQL connection string from Step 1]

✅ Check ALL boxes:
   ☑ Production
   ☑ Preview
   ☑ Development
```

5. Click **"Save"**

⚠️ **CRITICAL:** The connection string MUST end with `?sslmode=require`

Example:
```
postgresql://user:pass@host.neon.tech:5432/db?sslmode=require
                                                ↑ MUST HAVE THIS!
```

---

### **Step 3: Run Database Migrations** (1 minute)

Your production database is empty! Run migrations to create tables:

```bash
# Set your production DATABASE_URL locally for migration
$env:DATABASE_URL="postgresql://your-connection-string-here"

# Run migrations to create tables
npx prisma migrate deploy

# Seed initial data (parishes, business types, strategies)
npx prisma db seed
```

**IMPORTANT:** Replace `your-connection-string-here` with the actual URL from Step 1!

---

## 🔄 Vercel Auto-Deployment Status

After you set the DATABASE_URL in Step 2:

1. **Vercel will automatically redeploy** (takes ~2 minutes)
2. The new deployment will use the PostgreSQL schema
3. Your app should work!

### Check Deployment Status:
1. Go to: https://vercel.com/dashboard
2. Click **"Deployments"** tab
3. Wait for the latest deployment to show **"Ready"** status

---

## ✅ How to Verify It's Working

After Vercel redeploys, test these URLs:

```
https://your-app.vercel.app/api/admin2/parishes
https://your-app.vercel.app/api/admin2/business-types
https://your-app.vercel.app/api/admin2/strategies
```

**Expected result:** JSON data (not 500 errors!)

Example good response:
```json
{
  "success": true,
  "parishes": [
    { "id": "...", "name": "Kingston", ... }
  ]
}
```

---

## 🐛 Troubleshooting

### Problem: "Prisma Client not found" after redeploy
**Solution:** Vercel is still using old build. Force redeploy:
1. Go to Deployments → Latest deployment
2. Click **"..."** → **"Redeploy"**

### Problem: "Connection refused" or "timeout"
**Solution:** Check DATABASE_URL:
- ✅ Must include `?sslmode=require`
- ✅ Must be the PostgreSQL URL (not SQLite path)
- ✅ Database must be running and accessible

### Problem: "Table does not exist"
**Solution:** You didn't run migrations! Run:
```bash
npx prisma migrate deploy
```

### Problem: Still getting errors
**Solution:** Check Vercel function logs:
1. Deployments → [Latest] → Functions tab
2. Look for detailed error messages

---

## 📋 Quick Checklist

- [ ] Created PostgreSQL database (Neon/Supabase/Railway)
- [ ] Copied connection string (ends with `?sslmode=require`)
- [ ] Added DATABASE_URL to Vercel environment variables
- [ ] Checked all 3 boxes (Production, Preview, Development)
- [ ] Ran `npx prisma migrate deploy` with production DATABASE_URL
- [ ] Waited for Vercel to auto-redeploy (~2 min)
- [ ] Tested API endpoints (should return JSON, not 500 errors)
- [ ] Verified admin2 dashboard loads with data

---

## 🚀 Expected Timeline

| Time | Action | Status |
|------|--------|--------|
| 0:00 | Get PostgreSQL database | ⏳ You do this |
| 0:05 | Set DATABASE_URL in Vercel | ⏳ You do this |
| 0:07 | Vercel auto-redeploys | ⏳ Automatic |
| 0:09 | Run migrations on prod DB | ⏳ You do this |
| 0:10 | Test app - should work! | ✅ Success! |

---

## 💡 What Changed?

**Before (broken):**
```prisma
datasource db {
  provider = "sqlite"  ← For local development only!
  url = env("DATABASE_URL")
}
```

**After (fixed):**
```prisma
datasource db {
  provider = "postgresql"  ← Works on Vercel!
  url = env("DATABASE_URL")
}
```

---

## 🆘 Still Not Working?

If you've done all steps and it's still broken:

1. **Check Vercel build logs** for "prisma generate" success
2. **Check function logs** for detailed errors
3. **Verify DATABASE_URL** is exactly right (copy-paste, no spaces)
4. **Force redeploy** from Vercel dashboard
5. **Hard refresh browser** (Ctrl+Shift+R)

**Last resort:** Send me the Vercel function logs and I'll diagnose!

---

**NEXT STEP:** Go get a PostgreSQL database NOW! → https://neon.tech (fastest option)

