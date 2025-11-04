import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

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
        dietaryRestrictions: [], // Empty array for new users
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
      weekStartDate.setDate(now.getDate() - now.getDay()); // Start of current week
    }

    // Normalize to start of day
    weekStartDate.setHours(0, 0, 0, 0);

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
            recipe: {
              include: {
                author: {
                  select: {
                    id: true,
                    username: true,
                    displayName: true,
                    image: true,
                  },
                },
              },
            },
          },
          orderBy: [
            { day: 'asc' },
            { mealType: 'asc' },
          ],
        },
      },
    });

    if (!mealPlan) {
      // Return empty meal plan structure
      return NextResponse.json({
        mealPlans: [],
      });
    }

    return NextResponse.json({
      mealPlans: mealPlan.meals,
    });
  } catch (error) {
    console.error('Meal plan fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Ensure user exists in database (create if not exists for Clerk users)
    console.log('Creating/finding user with ID:', userId);
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {}, // Don't update existing users
      create: {
        id: userId,
        email: `${userId}@temp.clerk`, // Temporary email, should be updated with real data
        username: `user_${userId.slice(-8)}`, // Generate username from user ID
        dietaryRestrictions: [], // Empty array for new users
      },
    });
    console.log('User upsert result:', user);

    const { recipeId, day, mealType, weekStart } = await request.json();
    console.log('POST /api/meal-plans - Received recipeId:', recipeId, 'type:', typeof recipeId);

    if (!recipeId || !day || !mealType || !weekStart) {
      return NextResponse.json(
        { error: 'Missing required fields: recipeId, day, mealType, weekStart' },
        { status: 400 }
      );
    }

    if (!['breakfast', 'lunch', 'dinner'].includes(mealType)) {
      return NextResponse.json(
        { error: 'Invalid meal type' },
        { status: 400 }
      );
    }

    // Verify recipe exists and is accessible
    // Check both user-created recipes and imported recipes
    console.log('Searching for recipe with ID:', recipeId);
    const [userRecipe, importedRecipe] = await Promise.all([
      prisma.recipe.findFirst({
        where: {
          id: recipeId,
          OR: [
            { isPublic: true },
            { authorId: userId },
          ],
        },
      }),
      prisma.importedRecipe.findUnique({
        where: { id: recipeId },
        include: { ingredients: true },
      }),
    ]);

    console.log('Found userRecipe:', userRecipe ? userRecipe.id : 'null');
    console.log('Found importedRecipe:', importedRecipe ? importedRecipe.id : 'null');

    if (!userRecipe && !importedRecipe) {
      console.log('Recipe not found in either table');
      return NextResponse.json(
        { error: 'Recipe not found or not accessible' },
        { status: 400 }
      );
    }

    // If it's an imported recipe, convert it to a user recipe first
    let finalRecipeId = recipeId;
    if (importedRecipe && !userRecipe) {
      console.log('🔄 Converting imported recipe to user recipe:', importedRecipe.id);
      console.log('Imported recipe data:', {
        title: importedRecipe.title,
        ingredientsCount: importedRecipe.ingredients?.length,
        hasInstructions: Array.isArray(importedRecipe.instructions),
      });
      // Convert imported recipe to user recipe
      try {
        const convertedRecipe = await prisma.recipe.create({
          data: {
            title: importedRecipe.title,
            description: importedRecipe.description || `Imported from ${new URL(importedRecipe.sourceUrl).hostname}`,
            imageUrl: importedRecipe.imageUrl,
            ingredients: importedRecipe.ingredients.map((ing) => ({
              name: ing.item || ing.raw,
              amount: ing.qty ? Number(ing.qty) : 1,
              unit: ing.unit || 'unit',
            })),
            instructions: Array.isArray(importedRecipe.instructions)
              ? importedRecipe.instructions
              : [],
            prepTime: 0, // Imported recipes don't have separate prep/cook times
            cookTime: importedRecipe.totalTimeMinutes || 30,
            servings: importedRecipe.yield ? parseInt(importedRecipe.yield) || 4 : 4,
            difficulty: 'Medium', // Default difficulty
            tags: importedRecipe.tags || [],
            isPublic: false, // Converted recipes are private by default
            authorId: userId,
          },
        });
        finalRecipeId = convertedRecipe.id;
        console.log('✅ Converted recipe created with ID:', finalRecipeId, 'type:', typeof finalRecipeId);
      } catch (conversionError) {
        console.error('❌ Error converting imported recipe:', conversionError);
        return NextResponse.json(
          { error: 'Failed to convert imported recipe' },
          { status: 500 }
        );
      }
    } else {
      console.log('Using existing recipe ID:', finalRecipeId);
    }

    const weekDate = new Date(weekStart);
    weekDate.setHours(0, 0, 0, 0);

    // Convert day name to number for database
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNumber = dayNames.indexOf(day.toLowerCase());

    if (dayNumber === -1) {
      return NextResponse.json(
        { error: 'Invalid day name' },
        { status: 400 }
      );
    }

    // Create or find the meal plan for this week
    const mealPlan = await prisma.mealPlan.upsert({
      where: {
        userId_weekStartDate: {
          userId: userId,
          weekStartDate: weekDate,
        },
      },
      update: {},
      create: {
        userId: userId,
        weekStartDate: weekDate,
      },
    });

    // Check if there's already a meal for this slot and replace it
    const existingMeal = await prisma.plannedMeal.findFirst({
      where: {
        mealPlanId: mealPlan.id,
        day: dayNumber,
        mealType: mealType,
      },
    });

    console.log('Creating/updating planned meal with finalRecipeId:', finalRecipeId);
    let meal;
    if (existingMeal) {
      console.log('Updating existing meal:', existingMeal.id);
      meal = await prisma.plannedMeal.update({
        where: { id: existingMeal.id },
        data: { recipeId: finalRecipeId },
      });
    } else {
      console.log('Creating new planned meal with:', {
        mealPlanId: mealPlan.id,
        day: dayNumber,
        mealType,
        recipeId: finalRecipeId,
      });
      meal = await prisma.plannedMeal.create({
        data: {
          mealPlanId: mealPlan.id,
          day: dayNumber,
          mealType,
          recipeId: finalRecipeId,
        },
      });
    }
    console.log('✅ Meal saved successfully:', meal.id);

    return NextResponse.json({
      message: 'Meal added successfully',
      meal,
    });
  } catch (error) {
    console.error('Meal plan creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}