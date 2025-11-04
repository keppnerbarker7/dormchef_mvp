# Recipe Import Feature - Setup Checklist

Use this checklist to get the Recipe Import feature up and running.

## ✅ Pre-Setup (Already Done)

- [x] Netlify configuration created (`netlify.toml`)
- [x] Serverless function implemented (`netlify/functions/import-recipe.ts`)
- [x] Database schema created (`supabase/schema.sql`)
- [x] Client UI built (`recipes.qmd` + `assets/js/recipe-import.js`)
- [x] Dependencies added to `package.json`
- [x] Documentation written
- [x] Test script created (`test-import.sh`)
- [x] Supabase URL configured in `.env`

## 🚨 Critical Steps (YOU NEED TO DO THIS)

### Step 1: Get Supabase Service Role Key

- [ ] Go to https://app.supabase.com/project/pluoonxoshbzwpbyhpib/settings/api
- [ ] Find "Project API keys" section
- [ ] Copy the **service_role** key (the long one that starts with `eyJ...`)
  - ⚠️ **NOT** the anon key (you already provided that one)
  - ⚠️ This key has admin privileges - keep it secret!
- [ ] Update `.env` file:
  ```bash
  # Replace YOUR_SERVICE_ROLE_KEY_HERE with the actual key
  SUPABASE_SERVICE_ROLE=eyJhbGci... (paste your service_role key)
  ```

### Step 2: Apply Database Schema

- [ ] Go to https://app.supabase.com/project/pluoonxoshbzwpbyhpib/sql/new
- [ ] Open `supabase/schema.sql` in your code editor
- [ ] Copy ALL the SQL code
- [ ] Paste it into the Supabase SQL Editor
- [ ] Click "Run" (bottom right)
- [ ] Verify success (should see "Success. No rows returned")
- [ ] Check tables were created:
  - [ ] Go to Table Editor
  - [ ] You should see `recipes` table
  - [ ] You should see `recipe_ingredients` table

### Step 3: Install Dependencies

```bash
npm install
```

Expected new packages:
- `got` (HTTP client)
- `cheerio` (HTML parser)
- `@supabase/supabase-js` (Supabase SDK)
- `@netlify/functions` (Netlify Functions types)

### Step 4: Install Netlify CLI (if not already installed)

```bash
npm install -g netlify-cli
```

Verify installation:
```bash
netlify --version
```

## 🧪 Testing Locally

### Step 5: Start Development Server

```bash
netlify dev
```

What this does:
- Starts your Next.js app (or Quarto if configured)
- Makes serverless functions available at `/api/*`
- Loads environment variables from `.env`
- Creates a local dev server on port 8888

Expected output:
```
◈ Netlify Dev ◈
◈ Starting Netlify Dev with Next.js
◈ Server now ready on http://localhost:8888
```

### Step 6: Test Recipe Import (Manual)

**Option A: Use the UI**

- [ ] Open http://localhost:8888/recipes.html in your browser
- [ ] Paste this test URL:
  ```
  https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/
  ```
- [ ] Click "Import Recipe"
- [ ] Should see:
  - ✅ Recipe title
  - ✅ Recipe image
  - ✅ Ingredients list (with quantities)
  - ✅ Step-by-step instructions
  - ✅ Cooking time and yield
- [ ] Click "Save Recipe"
- [ ] Should see "✓ Saved to your recipes!" message

**Option B: Use curl**

```bash
# Test preview (no save)
curl "http://localhost:8888/api/import-recipe?url=https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/"

# Test save
curl -X POST "http://localhost:8888/api/import-recipe?url=https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/&save=1"
```

**Option C: Use the test script**

```bash
./test-import.sh
```

### Step 7: Verify in Supabase

- [ ] Go to https://app.supabase.com/project/pluoonxoshbzwpbyhpib/editor
- [ ] Click on `recipes` table
- [ ] You should see your imported recipe!
- [ ] Click on `recipe_ingredients` table
- [ ] You should see the parsed ingredients

## 🚀 Deploying to Production

### Step 8: Deploy to Netlify

**Option A: Continuous Deployment (Recommended)**

- [ ] Push your code to GitHub:
  ```bash
  git add .
  git commit -m "Add recipe import feature"
  git push origin main
  ```

- [ ] Go to https://app.netlify.com
- [ ] Click "Add new site" → "Import an existing project"
- [ ] Connect your GitHub repository
- [ ] Configure build settings:
  - Build command: `npm run build` (or `quarto render` if using Quarto)
  - Publish directory: `.next` (or `_site` for Quarto)
  - Functions directory: `netlify/functions` (auto-detected)

- [ ] Add environment variables:
  - Go to **Site settings** → **Environment variables** → **Add a variable**
  - Add `SUPABASE_URL` = `https://pluoonxoshbzwpbyhpib.supabase.co`
  - Add `SUPABASE_SERVICE_ROLE` = (your service_role key from Step 1)
  - ⚠️ Make sure to add your actual service_role key, not the placeholder!

- [ ] Click "Deploy site"

- [ ] Wait for deployment to complete (~2-5 minutes)

**Option B: Manual Deploy**

```bash
netlify deploy --prod
```

### Step 9: Test Production

- [ ] Get your live site URL (e.g., `https://your-site.netlify.app`)
- [ ] Test the import:
  ```bash
  curl "https://your-site.netlify.app/api/import-recipe?url=https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/"
  ```
- [ ] Open `https://your-site.netlify.app/recipes.html` in browser
- [ ] Import a recipe and verify it works

## 🔍 Troubleshooting

### "Supabase is not configured" error

**Cause**: Environment variables not loaded

**Fix**:
- [ ] Check `.env` file exists and has both variables
- [ ] Restart `netlify dev`
- [ ] For production: verify environment variables in Netlify dashboard

### "Could not extract valid recipe data"

**Cause**: URL is not a recipe page or doesn't have structured data

**Fix**:
- [ ] Make sure URL is a recipe page (not a blog post or recipe list)
- [ ] Try a different recipe from a major site (AllRecipes, Food Network, etc.)
- [ ] Check the site uses Schema.org markup (most do)

### Import works but Save fails

**Cause**: Using anon key instead of service_role key

**Fix**:
- [ ] Verify you added the **service_role** key (not anon key) to `.env`
- [ ] The service_role key should be different (and longer) than the anon key
- [ ] Check Supabase logs for specific errors

### 404 on `/api/import-recipe`

**Cause**: Netlify redirects not working

**Fix**:
- [ ] Verify `netlify.toml` exists with correct redirects
- [ ] Check you're using `netlify dev` (not `npm run dev`)
- [ ] Try accessing `/.netlify/functions/import-recipe` directly

### TypeScript compilation errors

**Cause**: Missing types or dependencies

**Fix**:
- [ ] Run `npm install` again
- [ ] Check `netlify/functions/tsconfig.json` exists
- [ ] Clear cache: `rm -rf .netlify` and restart

## 📚 Additional Resources

- **Full Documentation**: See `README.md` (Recipe Import Feature section)
- **Quick Start Guide**: See `RECIPE_IMPORT_QUICKSTART.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Test Script**: Run `./test-import.sh` after setup

## ✨ Success Criteria

You're all set when:

- [x] Supabase service_role key is in `.env`
- [x] Database schema is applied (tables exist)
- [x] Dependencies installed (`npm install` completed)
- [x] `netlify dev` starts without errors
- [x] Can import a recipe via UI at `http://localhost:8888/recipes.html`
- [x] Recipe appears in Supabase Table Editor
- [x] Deployed to Netlify and working in production

## 🎉 Next Steps After Setup

Once everything is working:

1. **Customize the UI**: Edit `recipes.qmd` to match your app's design
2. **Add authentication**: Integrate with your existing auth system
3. **Build a recipe collection page**: Display saved recipes
4. **Add meal planning**: Use imported recipes in meal plans
5. **Implement search**: Query recipes by ingredients or title
6. **Mirror images**: Store images in Supabase Storage (see TODOs)

---

**Estimated setup time**: 10-15 minutes

**Need help?** Check the troubleshooting section or review the full documentation in `README.md`.
