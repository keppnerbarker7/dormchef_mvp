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
      },
    });
    console.log('User upsert result:', user);

    const { recipeId, day, mealType, weekStart } = await request.json();

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
    const recipe = await prisma.recipe.findFirst({
      where: {
        id: recipeId,
        OR: [
          { isPublic: true },
          { authorId: userId },
        ],
      },
    });

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found or not accessible' },
        { status: 400 }
      );
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

    let meal;
    if (existingMeal) {
      meal = await prisma.plannedMeal.update({
        where: { id: existingMeal.id },
        data: { recipeId },
      });
    } else {
      meal = await prisma.plannedMeal.create({
        data: {
          mealPlanId: mealPlan.id,
          day: dayNumber,
          mealType,
          recipeId,
        },
      });
    }

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