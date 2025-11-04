-- Create a unique index that treats canonicalUrl as primary identity and falls back to sourceUrl
-- This ensures we don't import duplicate recipes when the same recipe has both a canonical URL and source URL
CREATE UNIQUE INDEX IF NOT EXISTS "ImportedRecipe_canonical_or_source_unique"
ON "ImportedRecipe" (COALESCE("canonicalUrl", "sourceUrl"));