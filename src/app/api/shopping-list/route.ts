import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Ingredient } from '@/types';

interface CombinedIngredient {
  name: string;
  totalAmount: number;
  unit: string;
  category: string;
  isPurchased: boolean;
}

function combineIngredients(ingredients: Ingredient[]): CombinedIngredient[] {
  const ingredientMap = new Map<string, CombinedIngredient>();

  ingredients.forEach((ingredient) => {
    const key = `${ingredient.name.toLowerCase()}-${ingredient.unit.toLowerCase()}`;

    if (ingredientMap.has(key)) {
      const existing = ingredientMap.get(key)!;
      existing.totalAmount += ingredient.amount;
    } else {
      ingredientMap.set(key, {
        name: ingredient.name,
        totalAmount: ingredient.amount,
        unit: ingredient.unit,
        category: ingredient.category,
        isPurchased: false,
      });
    }
  });

  return Array.from(ingredientMap.values()).sort((a, b) => {
    // Sort by category, then by name
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Ensure user exists in database (create if not exists for Clerk users)
    await prisma.user.upsert({
      where: { id: userId },
      update: {}, // Don't update existing users
      create: {
        id: userId,
        email: `${userId}@temp.clerk`, // Temporary email, should be updated with real data
        username: `user_${userId.slice(-8)}`, // Generate username from user ID
      },
    });

    let searchParams: URLSearchParams;
    try {
      const url = new URL(request.url);
      searchParams = url.searchParams;
    } catch (error) {
      console.error('Invalid URL:', request.url);
      searchParams = new URLSearchParams();
    }
    const weekParam = searchParams.get('week');

    let weekStartDate: Date;
    if (weekParam) {
      weekStartDate = new Date(weekParam);
    } else {
      // Default to current week
      const now = new Date();
      weekStartDate = new Date(now);
      weekStartDate.setDate(now.getDate() - now.getDay());
    }

    weekStartDate.setHours(0, 0, 0, 0);

    // Get meal plan for the week
    const mealPlan = await prisma.mealPlan.findUnique({
      where: {
        userId_weekStartDate: {
          userId: userId,
          weekStartDate,
        },
      },
      include: {
        meals: {
          include: {
            recipe: true,
          },
        },
      },
    });

    if (!mealPlan || mealPlan.meals.length === 0) {
      return NextResponse.json({
        id: null,
        userId: userId,
        weekStartDate,
        items: [],
        createdAt: null,
        updatedAt: null,
      });
    }

    // Collect all ingredients from the meal plan
    const allIngredients: Ingredient[] = [];

    mealPlan.meals.forEach((meal) => {
      if (meal.recipe && Array.isArray(meal.recipe.ingredients)) {
        allIngredients.push(...(meal.recipe.ingredients as Ingredient[]));
      }
    });

    // Combine similar ingredients
    const combinedIngredients = combineIngredients(allIngredients);

    // Check if shopping list already exists
    let shoppingList = await prisma.shoppingList.findUnique({
      where: {
        userId_weekStartDate: {
          userId: userId,
          weekStartDate,
        },
      },
    });

    if (shoppingList) {
      // Merge with existing purchased status
      const existingItems = shoppingList.items as any[];
      const existingItemMap = new Map(
        existingItems.map(item => [
          `${item.name.toLowerCase()}-${item.unit.toLowerCase()}`,
          item.isPurchased
        ])
      );

      combinedIngredients.forEach(ingredient => {
        const key = `${ingredient.name.toLowerCase()}-${ingredient.unit.toLowerCase()}`;
        if (existingItemMap.has(key)) {
          ingredient.isPurchased = existingItemMap.get(key);
        }
      });

      // Update shopping list
      shoppingList = await prisma.shoppingList.update({
        where: { id: shoppingList.id },
        data: {
          items: combinedIngredients,
        },
      });
    } else {
      // Create new shopping list
      shoppingList = await prisma.shoppingList.create({
        data: {
          userId: userId,
          weekStartDate,
          items: combinedIngredients,
        },
      });
    }

    return NextResponse.json({
      ...shoppingList,
      items: combinedIngredients,
    });
  } catch (error) {
    console.error('Shopping list generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Ensure user exists in database (create if not exists for Clerk users)
    await prisma.user.upsert({
      where: { id: userId },
      update: {}, // Don't update existing users
      create: {
        id: userId,
        email: `${userId}@temp.clerk`, // Temporary email, should be updated with real data
        username: `user_${userId.slice(-8)}`, // Generate username from user ID
      },
    });

    const { weekStartDate, items } = await request.json();

    if (!weekStartDate || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    const weekDate = new Date(weekStartDate);
    weekDate.setHours(0, 0, 0, 0);

    // Update shopping list
    const shoppingList = await prisma.shoppingList.upsert({
      where: {
        userId_weekStartDate: {
          userId: userId,
          weekStartDate: weekDate,
        },
      },
      update: {
        items,
      },
      create: {
        userId: userId,
        weekStartDate: weekDate,
        items,
      },
    });

    return NextResponse.json({
      message: 'Shopping list updated successfully',
      shoppingList,
    });
  } catch (error) {
    console.error('Shopping list update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}