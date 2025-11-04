# DormChef Deployment Guide

## Critical: Database Connection for Vercel

**⚠️ IMPORTANT**: Vercel serverless functions REQUIRE connection pooling. Using a direct connection will cause "Can't reach database server" errors.

### Correct Supabase Configuration

#### For Vercel (Production/Preview):

- **Connection Type**: Transaction pooler
- **Port**: 6543 (NOT 5432)
- **Format**: `postgresql://postgres.pluoonxoshbzwpbyhpib:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres`

#### How to Get the Correct Connection String:

1. Go to Supabase Dashboard: https://app.supabase.com/project/pluoonxoshbzwpbyhpib/settings/database
2. Click "Connection String" tab
3. Change **Method dropdown** to: **"Transaction pooler"** (NOT "Direct connection" or "Session pooler")
4. Copy the connection string (it will show port 6543)
5. Replace `[YOUR-PASSWORD]` with your actual database password

#### Why This Matters:

- **Direct Connection (port 5432)**:
  - ❌ Limited to ~60 concurrent connections
  - ❌ Doesn't work with serverless (each function creates new connection)
  - ❌ Will cause "Tenant or user not found" or connection errors

- **Transaction Pooler (port 6543)**:
  - ✅ Uses PgBouncer connection pooling
  - ✅ Handles unlimited serverless function invocations
  - ✅ Required for Vercel deployments

---

## Vercel Environment Variables

Required environment variables in Vercel:

### Database

```
DATABASE_URL=postgresql://postgres.pluoonxoshbzwpbyhpib:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres
```

### Supabase

```
SUPABASE_URL=https://pluoonxoshbzwpbyhpib.supabase.co
SUPABASE_SERVICE_ROLE=[Your service role key]
```

### Clerk Authentication

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=[Your publishable key]
CLERK_SECRET_KEY=[Your secret key]
```

---

## Deployment Checklist

Before deploying:

- [ ] Verify DATABASE_URL uses **Transaction pooler** (port 6543)
- [ ] Check DATABASE_URL contains `.pooler.supabase.com`
- [ ] Confirm all environment variables are set in Vercel
- [ ] Test `/api/health` endpoint after deployment
- [ ] If health check fails, verify connection string format

---

## Troubleshooting

### Error: "Can't reach database server at ...5432"

**Fix**: You're using direct connection. Switch to Transaction pooler (port 6543).

### Error: "Tenant or user not found"

**Fix**: Wrong connection string format or password. Get fresh connection string from Supabase.

### Error: "Failed to fetch recipes"

**Fix**: Check that DATABASE_URL is set correctly in Vercel and redeploy.

---

## After Changing Environment Variables

**Always redeploy after changing environment variables:**

1. Go to Vercel → Deployments
2. Click ⋯ on latest deployment → Redeploy
3. Uncheck "Use existing Build Cache"
4. Click Redeploy

Environment variable changes do NOT automatically apply to existing deployments!

---

## Health Check Endpoint

Monitor deployment health: `https://your-domain.vercel.app/api/health`

Expected response when healthy:

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

---

## Project Info

- **Supabase Project ID**: pluoonxoshbzwpbyhpib
- **Region**: aws-0-us-west-2
- **Pooler Port**: 6543
- **Database**: postgres
