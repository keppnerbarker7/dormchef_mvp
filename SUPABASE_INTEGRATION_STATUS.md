# Supabase Integration Status

## Completed ✅

### 1. Database Schema Updates
- Added `bio` field to User model for profile persistence
- Changed Recipe `tags` from Json to String[] for proper Prisma filtering with `hasEvery`
- Added `userId` field to ImportedRecipe for multi-tenant support
- Added foreign key relationship: ImportedRecipe → User
- Added unique constraint: `@@unique([userId, sourceUrl])` on ImportedRecipe
- Added indexes for recipe filtering: prepTime, cookTime
- **Database Status**: Schema synced to Supabase via `prisma db push`

### 2. Bug Fixes from Previous Session
- Fixed Friends API authentication (changed `session?.user?.id` to `userId`)
  - File: `src/app/api/friends/[id]/route.ts` (lines 13, 119)
- Fixed Next.js 15 params await deprecation in all dynamic routes:
  - `src/app/api/recipes/[id]/route.ts` (GET, PUT, DELETE)
  - `src/app/api/meal-plans/[id]/route.ts` (DELETE)
  - `src/app/api/friends/[id]/route.ts` (PATCH, DELETE)

## Remaining Tasks 🔧

### 3. Import Recipe Next.js API Route (CRITICAL)
**Status**: NOT STARTED
**File**: `src/app/api/import-recipe/route.ts` (needs creation)

**Requirements**:
- Copy logic from `netlify/functions/import-recipe.ts`
- Add userId parameter from Clerk auth
- Save imported recipes with userId to ImportedRecipe table
- Return same JSON shape as Netlify function
- Handle both preview (GET) and save (POST) modes

**Implementation Note**: Update `netlify/functions/import-recipe.ts` to also include userId when saving.

###  4. Recipe Filtering Fixes (CRITICAL)
**Status**: NOT STARTED
**Files**:
- `src/app/api/recipes/route.ts` (API)
- `src/app/recipes/page.tsx` (UI - if needed)

**Changes Required**:
```typescript
// API changes in /api/recipes GET handler:
- Rename query param: `author` → `authorId`
- Add support for `maxPrepTime` filter (prepTime + cookTime <= maxPrepTime)
- Fix `isPublic` filter (currently works, but verify)
- Update `tags` filtering to use `hasEvery` (now works with String[])

// Example implementation:
if (maxPrepTime) {
  where.AND = where.AND || [];
  where.AND.push({
    OR: [
      { prepTime: { lte: parseInt(maxPrepTime) } },
      {
        AND: [
          { prepTime: { gte: 0 } },
          { cookTime: { gte: 0 } },
        ],
        // Use raw query for sum if needed
      }
    ]
  });
}
```

### 5. Friends Workflow Repair (HIGH PRIORITY)
**Status**: PARTIALLY FIXED (auth only)
**Files**:
- `src/app/api/friends/route.ts` (needs creation/update)
- `src/app/api/friends/list/route.ts` (needs update)

**Requirements**:
- Add GET `/api/friends?status=pending|accepted&type=sent|received`
- Return proper shape: `{ friends: Array<{id, friend: User, status, isRequester, createdAt}> }`
- PATCH handler for accept/decline (already exists in `[id]/route.ts` but verify it works)
- Ensure UI at `src/app/friends/page.tsx` matches expected data shape

### 6. Profile API & Clerk Synchronization (HIGH PRIORITY)
**Status**: PARTIALLY COMPLETE (bio field exists, needs full implementation)
**File**: `src/app/api/profile/route.ts`

**Changes Required**:
```typescript
// PUT handler - update to handle bio:
const { displayName, school, dietaryRestrictions, bio, image } = await request.json();

// Add bio to update:
const updatedUser = await prisma.user.update({
  where: { id: userId },
  data: {
    displayName: displayName.trim(),
    school: school?.trim() || null,
    dietaryRestrictions,
    bio: bio?.trim() || null,
    image: image || null, // NEW: persist image from Clerk
  },
});
```

**Clerk Sync Strategy**:
- User upsert calls should pull real Clerk data (displayName, email, image)
- Update all `user.upsert()` calls to fetch from Clerk API first (or use Clerk webhook)
- Currently using temp email `${userId}@temp.clerk` - replace with real Clerk data

### 7. Dashboard Stats (MEDIUM PRIORITY)
**Status**: NOT STARTED
**File**: `src/app/dashboard/page.tsx` or create `src/app/api/dashboard/stats/route.ts`

**Replace Mocked Data**:
```typescript
// Current mocked values → Real queries:
- totalRecipes: 24 → COUNT recipes where authorId = userId
- plannedMeals: 15 → COUNT planned meals for current week
- weekStreak: 3 → Calculate consecutive weeks with meal plans
- friends: 8 → COUNT friendships where status = 'accepted'
- nextMeal: Mock object → Query next upcoming planned meal
```

### 8. Shopping List Ingredient Categories (MEDIUM PRIORITY)
**Status**: NEEDS VERIFICATION
**File**: `src/app/api/shopping-list/route.ts` (line 126)

**Current State**:
```typescript
category: ing.category || 'Other' // Default category added
```

**Verify**:
- Recipe ingredients include `category` field in Json
- Category aggregation works in shopping list UI
- Update recipe creation form if needed to capture ingredient categories

### 9. Update Netlify Function for Multi-Tenant (CRITICAL)
**File**: `netlify/functions/import-recipe.ts`

**Changes**:
```typescript
// Add after line 347 (in saveRecipe function):
async function saveRecipe(recipe: DormChefRecipe, userId: string): Promise<SavedRecipe> {
  const created = await prisma.importedRecipe.create({
    data: {
      userId: userId, // ADD THIS
      sourceUrl: recipe.sourceUrl,
      // ... rest of fields
    },
  });
}

// Update handler to get userId from Clerk/auth context
```

## Environment Variables

Ensure these are set:
- `DATABASE_URL` - Supabase Postgres connection string ✅
- `DIRECT_URL` - Supabase direct connection (for migrations) ✅
- `CLERK_SECRET_KEY` - For server-side auth ✅
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - For client-side auth ✅

## Migration Notes

**IMPORTANT**: The migration folder is incomplete. The database was synced using `prisma db push` instead of migrations. For production:

1. Run `npx prisma migrate dev --name complete_schema` to create a proper migration
2. Or document that `prisma db push` was used for this project
3. Update README with migration instructions

## Next Steps

Priority order:
1. **Import Recipe API** - Users can't import recipes to Vercel deployment without this
2. **Recipe Filtering** - Feed and search won't work properly
3. **Friends Workflow** - Social features broken
4. **Profile Sync** - Bio and Clerk data not persisting
5. **Dashboard Stats** - Currently shows fake data
6. **Ingredient Categories** - Shopping list organization

## Testing Checklist

After implementation:
- [ ] Import a recipe via URL (both Netlify and Next.js routes)
- [ ] Filter recipes by tags, difficulty, author, maxPrepTime
- [ ] Send, accept, and decline friend requests
- [ ] Update profile with bio, school, dietary restrictions
- [ ] Verify dashboard shows real counts
- [ ] Generate shopping list with categorized ingredients
- [ ] Verify all data is scoped to logged-in user (multi-tenant)
