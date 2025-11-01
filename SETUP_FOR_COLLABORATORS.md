# Setup Guide for Collaborators

## 🚨 Important: You Need Your Own Database!

**DO NOT copy the DATABASE_URL from another developer's `.env` file!** Each developer needs their own PostgreSQL database.

## Why?

- Database credentials are personal and should never be shared
- Each developer should have their own isolated development database
- The `.env` file is gitignored for security reasons

## Setup Steps

### 1. Get Your Own PostgreSQL Database

Choose one of these options:

#### Option A: Cloud Database (Recommended - Free & Easy)

**Neon (Recommended for beginners):**
1. Go to https://neon.tech
2. Sign up for free account
3. Create a new project
4. Copy the connection string (looks like `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`)

**Supabase:**
1. Go to https://supabase.com
2. Sign up and create a new project
3. Go to Settings → Database
4. Copy the "Connection string" under "Connection pooling"

**Railway:**
1. Go to https://railway.app
2. Create a new project
3. Add PostgreSQL service
4. Copy the DATABASE_URL from the service variables

#### Option B: Local PostgreSQL Installation

**Windows:**
```bash
# Install PostgreSQL
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/

# After installation, create a database:
psql -U postgres
CREATE DATABASE contingento;
\q

# Your DATABASE_URL will be:
# postgresql://postgres:your_password@localhost:5432/contingento
```

**Mac:**
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create database
createdb contingento

# Your DATABASE_URL will be:
# postgresql://username@localhost:5432/contingento
```

**Linux:**
```bash
# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb contingento

# Your DATABASE_URL will be:
# postgresql://postgres:password@localhost:5432/contingento
```

### 2. Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and replace with your actual database URL:
   ```
   DATABASE_URL="your_actual_postgresql_connection_string_here"
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Database Schema

```bash
# Generate Prisma client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev
```

### 5. Verify Database Connection

Test that everything works:

```bash
node scripts/verify-db-connection.js
```

You should see:
```
✅ DATABASE_URL is set
✅ DATABASE_URL is PostgreSQL format
✅ SSL mode is configured
📡 Testing connection...
✅ Database connection successful!
```

### 6. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 🔧 Troubleshooting

### Error: "DATABASE_URL environment variable not found"

**Cause:** Environment variables not loaded properly.

**Solutions:**
1. Make sure your file is named `.env.local` (not `.env` or `.env.txt`)
2. Restart your terminal/dev server after creating the file
3. Check that the file is in the root directory (same folder as `package.json`)

### Error: "Can't reach database server"

**Causes & Solutions:**

1. **Wrong connection string format**
   - PostgreSQL format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require`
   - Check for typos in username, password, host, port, or database name

2. **Database not running (local setup)**
   ```bash
   # Windows
   pg_ctl start -D "C:\Program Files\PostgreSQL\15\data"
   
   # Mac
   brew services start postgresql@15
   
   # Linux
   sudo systemctl start postgresql
   ```

3. **Cloud database firewall**
   - Most cloud databases allow all connections by default
   - Check your provider's dashboard if you have IP restrictions

4. **Missing SSL mode**
   - Cloud databases require `?sslmode=require` at the end of the URL
   - Add it if missing: `...database?sslmode=require`

### Error: "Schema not found" or "Table does not exist"

**Cause:** Database migrations not run.

**Solution:**
```bash
npx prisma migrate dev
```

### Using the Wrong File Name

- ✅ `.env.local` - **Recommended** (Next.js loads this automatically)
- ✅ `.env` - Also works
- ❌ `.env.txt` - Won't work (wrong extension)
- ❌ `env.local` - Won't work (missing the dot)

## 🔒 Security Reminders

- ⚠️ **NEVER** commit your `.env` or `.env.local` file to Git
- ⚠️ **NEVER** share your DATABASE_URL with others
- ⚠️ **NEVER** use someone else's database credentials
- ✅ Each developer should have their own database
- ✅ Use `.env.example` to show what variables are needed (without actual values)

## 📚 Need More Help?

- **Prisma Docs:** https://www.prisma.io/docs/getting-started
- **Next.js Environment Variables:** https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
- **PostgreSQL Tutorial:** https://www.postgresql.org/docs/current/tutorial.html

## Quick Reference: Database Providers

| Provider | Free Tier | Setup Time | Best For |
|----------|-----------|------------|----------|
| [Neon](https://neon.tech) | ✅ 3 GB | 2 min | Beginners |
| [Supabase](https://supabase.com) | ✅ 500 MB | 3 min | Feature-rich |
| [Railway](https://railway.app) | ✅ $5 credit | 2 min | Simple |
| Local PostgreSQL | ✅ Unlimited | 10-15 min | Full control |



