# DormChef Troubleshooting Guide

## Database Connection Issues on Vercel

### Quick Fix Checklist

If you see database connection errors on Vercel, verify your `DATABASE_URL` has ALL of these:

```
postgresql://postgres.pluoonxoshbzwpbyhpib:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Required Components:**

- ✅ Port: `6543` (NOT 5432)
- ✅ Host: `aws-0-us-west-2.pooler.supabase.com` (with `.pooler`)
- ✅ Parameter: `?pgbouncer=true` (CRITICAL - disables prepared statements)

---

## Common Errors and Solutions

### Error 1: "Can't reach database server at ...5432"

**Symptom:** Health check fails with connection error to port 5432

**Cause:** Using direct connection instead of Transaction pooler

**Fix:**

1. Go to Supabase: https://app.supabase.com/project/pluoonxoshbzwpbyhpib/settings/database
2. Click "Connection String" tab
3. Change Method dropdown to: **"Transaction pooler"** (shows port 6543)
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your password
6. **ADD** `?pgbouncer=true` to the end
7. Update in Vercel → Settings → Environment Variables → DATABASE_URL
8. Redeploy

---

### Error 2: "Tenant or user not found"

**Symptom:** Connection fails with authentication error

**Cause:** Wrong password or malformed connection string

**Fix:**

1. Verify you're using the correct password
2. Check for typos in the connection string
3. Make sure password is URL-encoded (`%3F` instead of `?`, etc.)
4. Get fresh connection string from Supabase dashboard

---

### Error 3: "prepared statement 's0' already exists"

**Symptom:** Database queries fail with PostgresError code "42P05"

**Cause:** Missing `?pgbouncer=true` parameter in DATABASE_URL

**Fix:**

1. Go to Vercel → Settings → Environment Variables
2. Edit DATABASE_URL
3. Add `?pgbouncer=true` to the end of the connection string
4. Save and redeploy

**Why this happens:**

- PgBouncer in transaction mode doesn't support prepared statements
- Prisma uses prepared statements by default
- The `pgbouncer=true` parameter tells Prisma to disable them

---

### Error 4: "Failed to fetch recipes"

**Symptom:** Frontend shows "Failed to load recipes" or empty state

**Cause:** Database connection not working or wrong environment variables

**Fix:**

1. Check `/api/health` endpoint: `https://your-domain.vercel.app/api/health`
2. Verify all environment variables are set:
   - DATABASE_URL
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE
   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   - CLERK_SECRET_KEY
3. After changing env vars, **always redeploy**

---

## How to Get the Correct Connection String

### Step-by-Step Guide:

1. **Go to Supabase Dashboard**
   - Navigate to: https://app.supabase.com/project/pluoonxoshbzwpbyhpib/settings/database

2. **Find Connection String Section**
   - Look for "Connection string" section
   - You should see a dropdown labeled "Method"

3. **Select Transaction Pooler**
   - Click the Method dropdown
   - Select "Transaction pooler" (NOT "Direct connection" or "Session pooler")
   - The connection string will update to show port 6543

4. **Copy and Modify**
   - Copy the connection string
   - Replace `[YOUR-PASSWORD]` with your actual database password
   - **IMPORTANT:** Add `?pgbouncer=true` to the end

5. **Final Format Should Be:**
   ```
   postgresql://postgres.pluoonxoshbzwpbyhpib:D8gE%3Fc3kG.b*THp@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

---

## Environment Variable Update Workflow

**CRITICAL:** Environment variable changes don't automatically apply!

### After Updating Any Environment Variable in Vercel:

1. Go to **Deployments** tab
2. Click **⋯** (three dots) on the latest deployment
3. Select **Redeploy**
4. **Uncheck** "Use existing Build Cache"
5. Click **Redeploy**
6. Wait for deployment to complete (~2 minutes)
7. Test the `/api/health` endpoint

---

## Health Check Endpoint

Monitor your deployment at: `https://your-domain.vercel.app/api/health`

### Healthy Response:

```json
{
  "status": "healthy",
  "database": "connected",
  "userCount": 0,
  "env": {
    "hasDatabaseUrl": true,
    "hasSupabaseUrl": true,
    "hasSupabaseServiceRole": true,
    "hasClerkPublishable": true,
    "hasClerkSecret": true,
    "nodeEnv": "production"
  }
}
```

### Unhealthy Response:

```json
{
  "status": "unhealthy",
  "error": "Error message here",
  "stack": "Stack trace...",
  "env": { ... }
}
```

**What to check when unhealthy:**

1. Read the `error` field - it tells you what's wrong
2. Check `env` object - make sure all values are `true`
3. Look at the error message for clues:
   - "Can't reach database" → Wrong connection type
   - "Tenant or user not found" → Wrong password/format
   - "prepared statement" → Missing `?pgbouncer=true`

---

## Project Configuration Reference

### Supabase Project Details:

- **Project ID:** pluoonxoshbzwpbyhpib
- **Region:** aws-0-us-west-2
- **Dashboard:** https://app.supabase.com/project/pluoonxoshbzwpbyhpib

### Required Vercel Environment Variables:

```bash
# Database (Transaction pooler with pgbouncer=true)
DATABASE_URL=postgresql://postgres.pluoonxoshbzwpbyhpib:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true

# Supabase
SUPABASE_URL=https://pluoonxoshbzwpbyhpib.supabase.co
SUPABASE_SERVICE_ROLE=[Your service role key]

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=[Your publishable key]
CLERK_SECRET_KEY=[Your secret key]
```

---

## Why Serverless Requires Special Configuration

### The Problem:

- Vercel uses serverless functions (AWS Lambda)
- Each function invocation creates a NEW connection
- Direct database connections (port 5432) have limited connection pools (~60)
- With many users, you'll exhaust connections quickly

### The Solution:

- **Transaction pooler (port 6543)** uses PgBouncer
- PgBouncer reuses connections across function invocations
- Can handle unlimited concurrent serverless functions
- Requires `?pgbouncer=true` parameter for Prisma compatibility

### Connection Types Compared:

| Type               | Port | Endpoint               | Use Case                            | Vercel Compatible? |
| ------------------ | ---- | ---------------------- | ----------------------------------- | ------------------ |
| Direct             | 5432 | `db.*.supabase.co`     | Local development, migrations       | ❌ NO              |
| Session pooler     | 6543 | `.pooler.supabase.com` | Long-running connections            | ⚠️ Maybe           |
| Transaction pooler | 6543 | `.pooler.supabase.com` | Serverless (with `?pgbouncer=true`) | ✅ YES             |

---

## Quick Commands

### Test Health Endpoint:

```bash
curl https://your-domain.vercel.app/api/health
```

### Check Database Connection Locally:

```bash
npx prisma db execute --schema=./prisma/schema.prisma --stdin <<< "SELECT 1 as test;"
```

### View Vercel Deployment Logs:

1. Go to Vercel Dashboard → Deployments
2. Click on the deployment
3. Click "Runtime Logs" tab
4. Look for errors during API calls

---

## Emergency Rollback

If a deployment breaks production:

1. **Quick Rollback:**
   - Vercel Dashboard → Deployments
   - Find last working deployment (green checkmark)
   - Click ⋯ → Promote to Production

2. **Git Rollback:**
   ```bash
   git log --oneline -10  # Find last working commit
   git reset --hard <commit-hash>
   git push origin main --force
   ```

---

## Prevention Checklist

Before deploying database-related changes:

- [ ] Test locally first with `npm run dev`
- [ ] Verify DATABASE_URL has `?pgbouncer=true`
- [ ] Check health endpoint locally: `http://localhost:3000/api/health`
- [ ] Commit changes with clear message
- [ ] Monitor Vercel deployment logs
- [ ] Test `/api/health` on production after deploy
- [ ] Test actual app functionality (recipes, friends, etc.)

---

## Contact Info & Resources

- **Supabase Docs:** https://supabase.com/docs/guides/database/connecting-to-postgres
- **Prisma + PgBouncer:** https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#pgbouncer
- **Vercel Environment Variables:** https://vercel.com/docs/concepts/projects/environment-variables
