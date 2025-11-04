# Recipe Import Feature - Quick Start Guide

This guide will help you set up and test the Recipe Import feature in under 10 minutes.

## Prerequisites

- Node.js 20+ installed
- A Supabase account (free tier works)
- Netlify CLI installed globally (`npm install -g netlify-cli`)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `got` - HTTP client for fetching recipe pages
- `cheerio` - HTML parsing
- `@supabase/supabase-js` - Supabase client
- `@netlify/functions` - Netlify Functions SDK

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)

2. In your Supabase project dashboard:
   - Go to **SQL Editor**
   - Click "New query"
   - Copy and paste the contents of `supabase/schema.sql`
   - Click "Run"

3. Get your API credentials:
   - Go to **Settings** → **API**
   - Copy your **Project URL** (e.g., `https://xxx.supabase.co`)
   - Copy your **service_role** key (under "Project API keys")

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE=your-service-role-key-here
```

**Important**: Use `service_role`, NOT `anon` key for serverless functions!

### 4. Run Locally

Start the development server:

```bash
netlify dev
```

This will:
- Build and serve your Netlify functions at `/.netlify/functions/*`
- Proxy API calls from `/api/*` to functions
- Start Quarto preview (if configured)
- Load environment variables from `.env`

The site will be available at `http://localhost:8888`

### 5. Test the Import Feature

#### Option A: Use the Web UI

1. Open `http://localhost:8888/recipes.html` in your browser
2. Paste a recipe URL (e.g., from AllRecipes, Food Network, etc.)
3. Click "Import Recipe"
4. Review the preview
5. Click "Save Recipe" to persist to Supabase

#### Option B: Test with curl

Preview without saving:
```bash
curl "http://localhost:8888/api/import-recipe?url=https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/"
```

Import and save:
```bash
curl -X POST "http://localhost:8888/api/import-recipe?url=https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/&save=1"
```

### 6. Verify in Supabase

1. Go to your Supabase project
2. Click **Table Editor**
3. Select the `recipes` table
4. You should see your imported recipe!
5. Check `recipe_ingredients` table for the parsed ingredients

## Deployment to Netlify

### 1. Push to GitHub

```bash
git add .
git commit -m "Add recipe import feature"
git push origin main
```

### 2. Deploy on Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to your GitHub repository
4. Configure build settings:
   - **Build command**: `quarto render` (or leave default if using Next.js)
   - **Publish directory**: `_site` (or `.next` for Next.js)
   - **Functions directory**: `netlify/functions` (auto-detected)

5. Add environment variables:
   - Go to **Site settings** → **Environment variables**
   - Add `SUPABASE_URL`
   - Add `SUPABASE_SERVICE_ROLE`

6. Click "Deploy site"

### 3. Test Production

Once deployed, test your live site:

```bash
curl "https://your-site.netlify.app/api/import-recipe?url=YOUR_RECIPE_URL"
```

## Testing with Real Recipe Sites

Try importing from these sites (they all use Schema.org structured data):

- **AllRecipes**: https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/
- **Serious Eats**: https://www.seriouseats.com/recipes
- **Budget Bytes**: https://www.budgetbytes.com/
- **Minimalist Baker**: https://minimalistbaker.com/recipes/

## Troubleshooting

### "Supabase is not configured" error

Check that:
- `.env` file exists and has both `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE`
- You're using `netlify dev` (not `npm run dev`)
- Environment variables don't have quotes around them

### "Could not extract valid recipe data" error

This means:
- The URL isn't a recipe page (maybe a blog post or recipe list)
- The site doesn't use Schema.org markup
- The page requires JavaScript to render (not supported in v1)

### Import works but Save fails

Check:
- Your `service_role` key has write permissions
- The Supabase schema was applied correctly
- Check the Netlify function logs for specific error messages

### CORS errors in browser

The function includes CORS headers for `*`. If you still see CORS errors:
- Check browser console for the exact error
- Verify the API endpoint is `/api/import-recipe` (not `/.netlify/functions/import-recipe`)

## File Structure

```
.
├── netlify/
│   └── functions/
│       ├── import-recipe.ts      # Main serverless function
│       └── types.ts               # TypeScript types
├── supabase/
│   └── schema.sql                 # Database schema
├── assets/
│   └── js/
│       └── recipe-import.js       # Client-side module
├── recipes.qmd                    # Quarto page with UI
├── netlify.toml                   # Netlify configuration
├── .env.example                   # Example environment variables
└── README.md                      # Full documentation

## Next Steps

Once the basic import is working:

1. **Customize the UI** - Edit `recipes.qmd` and `assets/js/recipe-import.js`
2. **Add image mirroring** - Store images in Supabase Storage instead of remote URLs
3. **Build a recipe collection page** - Display saved recipes from Supabase
4. **Add search** - Use Postgres full-text search on recipe titles/ingredients
5. **Implement meal planning** - Use imported recipes for meal plans

## Need Help?

- Check the full documentation in `README.md`
- Review function logs: `netlify dev` shows console output
- Check Supabase logs in the dashboard
- Verify the database schema is correct using Supabase Table Editor
