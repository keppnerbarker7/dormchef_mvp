-- Add bio column to User table
ALTER TABLE "User" ADD COLUMN "bio" TEXT;

-- Change Recipe tags from Json to String array
ALTER TABLE "Recipe" ALTER COLUMN "tags" DROP DEFAULT;
ALTER TABLE "Recipe" ALTER COLUMN "tags" TYPE TEXT[] USING
  CASE
    WHEN jsonb_typeof(tags::jsonb) = 'array' THEN ARRAY(SELECT jsonb_array_elements_text(tags::jsonb))
    ELSE ARRAY[]::TEXT[]
  END;

-- Add indexes for recipe filtering
CREATE INDEX IF NOT EXISTS "Recipe_prepTime_idx" ON "Recipe"("prepTime");
CREATE INDEX IF NOT EXISTS "Recipe_cookTime_idx" ON "Recipe"("cookTime");

-- Drop old unique constraint on ImportedRecipe if it exists
DO $$ BEGIN
  ALTER TABLE "ImportedRecipe" DROP CONSTRAINT IF EXISTS "ImportedRecipe_canonicalUrl_key";
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Delete existing ImportedRecipe records (temporary for migration)
DELETE FROM "ImportedRecipeIngredient";
DELETE FROM "ImportedRecipe";

-- Add userId column to ImportedRecipe
ALTER TABLE "ImportedRecipe" ADD COLUMN "userId" TEXT NOT NULL;

-- Add foreign key constraint
ALTER TABLE "ImportedRecipe" ADD CONSTRAINT "ImportedRecipe_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add index on userId
CREATE INDEX "ImportedRecipe_userId_idx" ON "ImportedRecipe"("userId");

-- Add unique constraint on userId + sourceUrl
CREATE UNIQUE INDEX "ImportedRecipe_userId_sourceUrl_key" ON "ImportedRecipe"("userId", "sourceUrl");
