-- Recipe Import Feature Schema
-- Creates tables for storing imported recipes and their ingredients

-- Main recipes table
create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  canonical_url text,
  title text not null,
  description text,
  image_url text,
  yield text,
  total_time_minutes int,
  instructions jsonb not null default '[]',
  nutrition jsonb,
  tags text[],
  author text,
  attribution_html text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Unique constraint to prevent duplicate imports based on canonical URL (or source URL if canonical not available)
create unique index if not exists recipes_canonical_url_idx
  on recipes (coalesce(canonical_url, source_url));

-- Recipe ingredients table (normalized for querying)
create table if not exists recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  raw text not null,
  qty numeric,
  unit text,
  item text,
  position int -- preserve order
);

create index if not exists recipe_ingredients_recipe_id_idx
  on recipe_ingredients(recipe_id);

create index if not exists recipe_ingredients_item_idx
  on recipe_ingredients(item) where item is not null;

-- Index for searching by title
create index if not exists recipes_title_idx
  on recipes using gin(to_tsvector('english', title));

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger update_recipes_updated_at
  before update on recipes
  for each row
  execute function update_updated_at_column();

-- Comments for documentation
comment on table recipes is 'Stores imported recipes from external URLs';
comment on table recipe_ingredients is 'Normalized ingredient list for each recipe';
comment on column recipes.canonical_url is 'Canonical URL from the source page (if available)';
comment on column recipes.source_url is 'Original URL used for import';
comment on column recipe_ingredients.raw is 'Original ingredient text as extracted';
comment on column recipe_ingredients.qty is 'Parsed quantity (nullable if not parseable)';
comment on column recipe_ingredients.unit is 'Normalized unit (tsp, cup, oz, etc)';
comment on column recipe_ingredients.item is 'Ingredient item name';
