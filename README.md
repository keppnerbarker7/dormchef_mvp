This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font/local`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to load fonts locally without external network dependencies.

## Fonts

DormChef uses **Inter** and **Poppins** fonts, stored locally in the repository to avoid dependency on Google Fonts CDN during development and build.

### Font Files

Font files are located in:
- `public/fonts/inter/` - Inter Regular, Medium, SemiBold, Bold (weights 400-700)
- `public/fonts/poppins/` - Poppins Regular, Medium, SemiBold, Bold (weights 400-700)

All fonts are in `.woff2` format for optimal web performance.

### Why Local Fonts?

The application was configured to use local fonts instead of `next/font/google` to:
1. Eliminate dependency on `fonts.googleapis.com` during builds
2. Ensure fonts load reliably in restricted network environments
3. Improve build performance by avoiding external font downloads
4. Maintain consistent typography across all environments

**Important**: These font files are committed to version control and should remain in the repository. Do not add `public/fonts/` to `.gitignore`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Recipe Import Feature

DormChef includes a powerful recipe import feature that extracts recipe data from any URL using structured data (JSON-LD, Microdata) or heuristic fallback methods.

### Architecture

- **Frontend**: Quarto page (`recipes.qmd`) with client-side JavaScript module
- **Backend**: Netlify serverless function (TypeScript)
- **Database**: Supabase (PostgreSQL)
- **Extraction**: Multi-method approach (JSON-LD → Microdata → Heuristic)

### Setup

#### 1. Install Dependencies

```bash
npm install got cheerio @supabase/supabase-js @netlify/functions
npm install -D @types/node
```

#### 2. Configure Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the schema migration:

```bash
# Apply the schema
psql -h your-db.supabase.co -U postgres -d postgres -f supabase/schema.sql
```

Or use the Supabase SQL editor to run the contents of `supabase/schema.sql`.

#### 3. Set Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then edit `.env` and add your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE=your-service-role-key
```

**Important**: Use the `service_role` key for serverless functions, not the `anon` key. Find both in your Supabase project settings under API.

#### 4. Local Development

Run the development environment with Netlify Dev:

```bash
# Install Netlify CLI if you haven't already
npm install -g netlify-cli

# Start local dev server
netlify dev
```

This will:
- Start Quarto preview on port 4444
- Make serverless functions available at `/api/*`
- Load environment variables from `.env`

Access the import page at `http://localhost:8888/recipes.html`

### Deployment

#### Deploy to Netlify

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com) and create a new site
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build command: `quarto render`
   - Publish directory: `_site`
   - Functions directory: `netlify/functions`

3. **Set Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE`

4. **Deploy**
   - Push to your main branch or click "Deploy site"
   - Netlify will automatically build and deploy

### API Endpoints

#### `GET /api/import-recipe?url={url}`

Preview a recipe without saving.

**Response**:
```json
{
  "recipe": {
    "sourceUrl": "https://example.com/recipe",
    "canonicalUrl": "https://example.com/recipe",
    "title": "Chocolate Chip Cookies",
    "ingredients": [...],
    "instructions": [...],
    ...
  }
}
```

#### `POST /api/import-recipe?url={url}&save=1`

Import and save a recipe to Supabase.

**Response**:
```json
{
  "recipe": {...},
  "id": "uuid-here"
}
```

### Database Schema

**recipes** table:
- `id` (uuid, primary key)
- `source_url` (text, required)
- `canonical_url` (text, nullable)
- `title` (text, required)
- `description`, `image_url`, `yield`, `total_time_minutes`
- `instructions` (jsonb array)
- `nutrition` (jsonb object)
- `tags` (text array)
- `author`, `attribution_html`
- `created_at`, `updated_at` (timestamps)

**recipe_ingredients** table:
- `id` (uuid, primary key)
- `recipe_id` (uuid, foreign key)
- `raw` (text, original ingredient string)
- `qty` (numeric, nullable)
- `unit` (text, normalized unit)
- `item` (text, ingredient name)
- `position` (int, for ordering)

### Extraction Strategy

The importer tries multiple methods in order:

1. **JSON-LD**: Looks for `<script type="application/ld+json">` with `@type: "Recipe"`
   - Handles `@graph` arrays
   - Parses ISO8601 durations (`PT1H15M`)
   - Extracts structured recipe data

2. **Microdata/RDFa**: Scans for `itemtype="http://schema.org/Recipe"`
   - Reads `itemprop` attributes
   - Fallback for sites without JSON-LD

3. **Heuristic Fallback**: Common CSS selectors and meta tags
   - Title from `<h1>` or `<title>`
   - Image from `og:image` meta tag
   - Ingredients/instructions from common class names

### Normalization

- **Quantities**: Parses fractions like "1 1/2" → 1.5
- **Units**: Maps common units (teaspoon → tsp, tablespoon → Tbsp, etc.)
- **Times**: Converts ISO8601 or plain text to minutes
- **Instructions**: Splits strings by newlines or periods

### Testing

Test the import functionality:

```bash
# Using curl
curl "http://localhost:8888/api/import-recipe?url=https://example.com/recipe"

# Save to database
curl -X POST "http://localhost:8888/api/import-recipe?url=https://example.com/recipe&save=1"
```

### Supported Sites

Works with any site using Schema.org structured data, including:
- AllRecipes
- Food Network
- NYT Cooking
- Bon Appétit
- Serious Eats
- Most food blogs with recipe markup

### Troubleshooting

**"Could not extract valid recipe data"**
- Check if the URL is a recipe page (not a list or blog post)
- Some sites may require JavaScript rendering (not supported in v1)

**"Failed to fetch the URL"**
- Site may be blocking requests or down
- Check network connectivity

**Duplicate recipes**
- Recipes are deduplicated by `canonical_url` or `source_url`
- Re-importing updates the existing record

### Future Enhancements (TODOs)

- [ ] Mirror images to Supabase Storage instead of storing remote URLs
- [ ] Semantic ingredient parsing (better unit/quantity extraction)
- [ ] Headless browser support for JavaScript-rendered sites
- [ ] Batch import from multiple URLs
- [ ] Recipe similarity detection
