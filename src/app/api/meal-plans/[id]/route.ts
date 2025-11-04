import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Find the meal and verify ownership through meal plan
    const meal = await prisma.plannedMeal.findFirst({
      where: {
        id: id,
        mealPlan: {
          userId: userId,
        },
      },
    });

    if (!meal) {
      return NextResponse.json(
        { error: 'Meal not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the meal
    await prisma.plannedMeal.delete({
      where: { id: id },
    });

    return NextResponse.json({
      message: 'Meal removed successfully',
    });
  } catch (error) {
    console.error('Meal deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}