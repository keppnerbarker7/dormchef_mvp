import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import * as cheerio from 'cheerio';
import { Prisma } from '@prisma/client';

// Types
interface DormChefRecipe {
  sourceUrl: string;
  canonicalUrl?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  yield?: string | string[];
  totalTimeMinutes?: number;
  ingredients: Array<{
    raw: string;
    qty?: number;
    unit?: string;
    item?: string;
  }>;
  instructions: string[];
  nutrition?: { calories?: string };
  tags?: string[];
  author?: string;
  attributionHtml?: string;
}

// Unit normalization map
const UNIT_MAP: Record<string, string> = {
  teaspoon: 'tsp',
  teaspoons: 'tsp',
  tsp: 'tsp',
  tablespoon: 'Tbsp',
  tablespoons: 'Tbsp',
  tbsp: 'Tbsp',
  cup: 'cup',
  cups: 'cup',
  ounce: 'oz',
  ounces: 'oz',
  oz: 'oz',
  gram: 'g',
  grams: 'g',
  g: 'g',
  milliliter: 'mL',
  milliliters: 'mL',
  ml: 'mL',
  mL: 'mL',
  pound: 'lb',
  pounds: 'lb',
  lb: 'lb',
  liter: 'L',
  liters: 'L',
  l: 'L',
  kilogram: 'kg',
  kilograms: 'kg',
  kg: 'kg',
};

/**
 * Parse ISO8601 duration (e.g., PT1H15M) or phrases like "35 minutes" into minutes
 */
function parseDuration(duration: string | undefined): number | undefined {
  if (!duration) return undefined;

  // ISO8601 format: PT1H15M
  const iso8601Match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (iso8601Match) {
    const hours = parseInt(iso8601Match[1] || '0', 10);
    const minutes = parseInt(iso8601Match[2] || '0', 10);
    return hours * 60 + minutes;
  }

  // Plain text: "35 minutes", "1 hour 15 minutes", etc.
  const hourMatch = duration.match(/(\d+)\s*(?:hour|hr|h)/i);
  const minuteMatch = duration.match(/(\d+)\s*(?:minute|min|m)/i);

  const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;

  if (hours > 0 || minutes > 0) {
    return hours * 60 + minutes;
  }

  return undefined;
}

/**
 * Parse quantity from ingredient text (handles fractions like "1 1/2")
 */
function parseQuantity(text: string): number | undefined {
  const qtyMatch = text.match(/^(\d+)?\s*(\d+\/\d+)?/);
  if (!qtyMatch) return undefined;

  const whole = qtyMatch[1] ? parseInt(qtyMatch[1], 10) : 0;
  const fraction = qtyMatch[2];

  let qty = whole;
  if (fraction) {
    const [num, den] = fraction.split('/').map(Number);
    qty += num / den;
  }

  return qty > 0 ? qty : undefined;
}

/**
 * Normalize unit using UNIT_MAP
 */
function normalizeUnit(unit: string | undefined): string | undefined {
  if (!unit) return undefined;
  const normalized = UNIT_MAP[unit.toLowerCase()];
  return normalized || unit;
}

/**
 * Parse ingredient string into structured format
 */
function parseIngredient(raw: string): {
  raw: string;
  qty?: number;
  unit?: string;
  item?: string;
} {
  const trimmed = raw.trim();
  const qty = parseQuantity(trimmed);

  // Simple heuristic: extract unit and item
  const match = trimmed.match(/^[\d\s\/]+\s*([a-zA-Z]+)\s+(.+)$/);

  if (match) {
    const unit = normalizeUnit(match[1]);
    const item = match[2].trim();
    return { raw: trimmed, qty, unit, item };
  }

  return { raw: trimmed };
}

/**
 * Extract recipe from JSON-LD structured data
 */
function extractFromJsonLd(html: string): Partial<DormChefRecipe> | null {
  const $ = cheerio.load(html);
  const scripts = $('script[type="application/ld+json"]');

  for (let i = 0; i < scripts.length; i++) {
    try {
      const content = $(scripts[i]).html();
      if (!content) continue;

      const data = JSON.parse(content);

      // Handle @graph arrays
      const recipes = data['@graph']
        ? data['@graph'].filter((item: { '@type'?: string }) => item['@type'] === 'Recipe')
        : data['@type'] === 'Recipe' ? [data] : [];

      if (recipes.length === 0) continue;

      const recipe = recipes[0];

      // Extract ingredients
      const ingredientList = Array.isArray(recipe.recipeIngredient)
        ? recipe.recipeIngredient
        : [];

      const ingredients = ingredientList.map((ing: string) => parseIngredient(ing));

      // Extract instructions
      let instructions: string[] = [];
      if (Array.isArray(recipe.recipeInstructions)) {
        instructions = recipe.recipeInstructions.map((inst: string | { text?: string; name?: string }) => {
          if (typeof inst === 'string') return inst;
          if (typeof inst === 'object') {
            if (inst.text) return inst.text;
            if (inst.name) return inst.name;
          }
          return '';
        }).filter(Boolean);
      } else if (typeof recipe.recipeInstructions === 'string') {
        instructions = recipe.recipeInstructions.split(/\n+/).filter(Boolean);
      }

      // Extract author name properly
      let authorName: string | undefined;
      if (recipe.author) {
        if (typeof recipe.author === 'string') {
          authorName = recipe.author;
        } else if (typeof recipe.author === 'object' && recipe.author.name) {
          authorName = recipe.author.name;
        }
      }

      return {
        title: recipe.name,
        description: recipe.description,
        imageUrl: Array.isArray(recipe.image) ? recipe.image[0] : recipe.image,
        yield: recipe.recipeYield,
        totalTimeMinutes: parseDuration(recipe.totalTime),
        ingredients,
        instructions,
        author: authorName,
        nutrition: recipe.nutrition ? {
          calories: recipe.nutrition.calories,
        } : undefined,
      };
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Extract recipe from URL
 */
async function extractRecipe(url: string): Promise<DormChefRecipe> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; RecipeBot/1.0)',
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const finalUrl = response.url;

  // Try JSON-LD first
  const jsonLdData = extractFromJsonLd(html);
  if (jsonLdData && jsonLdData.title && jsonLdData.ingredients && jsonLdData.instructions) {
    return {
      sourceUrl: url,
      canonicalUrl: finalUrl !== url ? finalUrl : undefined,
      tags: [],
      ...jsonLdData,
    } as DormChefRecipe;
  }

  throw new Error('Could not extract valid recipe data from the provided URL');
}

/**
 * GET - Preview recipe without saving
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'Missing required parameter: url' },
        { status: 422 }
      );
    }

    // Validate URL format
    if (!/^https?:\/\//i.test(url.trim())) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 422 }
      );
    }

    // Extract recipe (preview only)
    const recipe = await extractRecipe(url.trim());

    return NextResponse.json({ recipe });

  } catch (error) {
    console.error('Error importing recipe:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : undefined;

    if (errorMessage.includes('Could not extract')) {
      return NextResponse.json(
        {
          error: 'Could not extract valid recipe data from the provided URL',
          details: errorMessage,
        },
        { status: 422 }
      );
    }

    if (errorName === 'AbortError' || errorName === 'TimeoutError') {
      return NextResponse.json(
        {
          error: 'Request timeout',
          details: 'The site took too long to respond',
        },
        { status: 500 }
      );
    }

    if (errorMessage.includes('fetch')) {
      return NextResponse.json(
        {
          error: 'Failed to fetch the URL',
          details: 'The site may be down or blocking requests',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Import and save recipe
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Ensure user exists in database
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: `${userId}@temp.clerk`,
        dietaryRestrictions: [],
      },
    });

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'Missing required parameter: url' },
        { status: 422 }
      );
    }

    // Validate URL format
    if (!/^https?:\/\//i.test(url.trim())) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 422 }
      );
    }

    // Extract recipe
    const recipe = await extractRecipe(url.trim());

    // Normalize yield to a string
    const normalizedYield = Array.isArray(recipe.yield)
      ? recipe.yield.join(' or ')
      : recipe.yield;

    try {
      // Try to create new recipe
      const created = await prisma.importedRecipe.create({
        data: {
          userId, // Multi-tenant: assign to current user
          sourceUrl: recipe.sourceUrl,
          canonicalUrl: recipe.canonicalUrl || null,
          title: recipe.title,
          description: recipe.description || null,
          imageUrl: recipe.imageUrl || null,
          yield: normalizedYield || null,
          totalTimeMinutes: recipe.totalTimeMinutes || null,
          instructions: recipe.instructions as unknown as Prisma.JsonArray,
          nutrition: (recipe.nutrition || null) as Prisma.JsonValue,
          tags: recipe.tags || [],
          author: recipe.author || null,
          attributionHtml: recipe.attributionHtml || null,
          ingredients: {
            create: (recipe.ingredients || []).map((ing, idx) => ({
              raw: ing.raw,
              qty: ing.qty != null ? new Prisma.Decimal(ing.qty) : null,
              unit: ing.unit || null,
              item: ing.item || null,
              position: idx,
            })),
          },
        },
        include: {
          ingredients: true,
        },
      });

      return NextResponse.json({
        recipe: created,
        id: created.id,
      });

    } catch (error) {
      // Handle unique constraint violation (user already imported this URL)
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        // Find existing recipe for this user and URL
        const existing = await prisma.importedRecipe.findFirst({
          where: {
            userId,
            sourceUrl: recipe.sourceUrl,
          },
          include: { ingredients: true },
        });

        if (existing) {
          return NextResponse.json(
            {
              recipe: existing,
              id: existing.id,
              note: 'You have already imported this recipe',
            },
            { status: 200 }
          );
        }
      }

      // Re-throw other errors
      console.error('Error saving recipe to database:', error);
      throw error;
    }

  } catch (error) {
    console.error('Error importing recipe:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : undefined;

    if (errorMessage.includes('Could not extract')) {
      return NextResponse.json(
        {
          error: 'Could not extract valid recipe data from the provided URL',
          details: errorMessage,
        },
        { status: 422 }
      );
    }

    if (errorName === 'AbortError' || errorName === 'TimeoutError') {
      return NextResponse.json(
        {
          error: 'Request timeout',
          details: 'The site took too long to respond',
        },
        { status: 500 }
      );
    }

    if (errorMessage.includes('fetch')) {
      return NextResponse.json(
        {
          error: 'Failed to fetch the URL',
          details: 'The site may be down or blocking requests',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
