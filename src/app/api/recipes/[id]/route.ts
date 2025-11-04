import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
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

    const { id } = await params;

    const recipe = await prisma.recipe.findFirst({
      where: {
        id: id,
        OR: [
          { isPublic: true },
          { authorId: userId },
        ],
      },
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
    });

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Recipe fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const { id } = await params;

    // Check if user owns the recipe
    const existingRecipe = await prisma.recipe.findFirst({
      where: {
        id: id,
        authorId: userId,
      },
    });

    if (!existingRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found or access denied' },
        { status: 404 }
      );
    }

    const {
      title,
      description,
      ingredients,
      instructions,
      prepTime,
      cookTime,
      servings,
      difficulty,
      tags,
      isPublic,
      imageUrl,
    } = await request.json();

    // Validation (same as POST)
    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'At least one ingredient is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(instructions) || instructions.length === 0) {
      return NextResponse.json(
        { error: 'At least one instruction is required' },
        { status: 400 }
      );
    }

    if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty level' },
        { status: 400 }
      );
    }

    // Update recipe
    const updatedRecipe = await prisma.recipe.update({
      where: { id: id },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl || null,
        ingredients,
        instructions: instructions.map((inst: string) => inst.trim()),
        prepTime: parseInt(prepTime),
        cookTime: parseInt(cookTime),
        servings: parseInt(servings),
        difficulty,
        tags: Array.isArray(tags) ? tags : [],
        isPublic: Boolean(isPublic),
      },
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
    });

    return NextResponse.json({
      message: 'Recipe updated successfully',
      recipe: updatedRecipe,
    });
  } catch (error) {
    console.error('Recipe update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const { id } = await params;

    // Check if user owns the recipe
    const existingRecipe = await prisma.recipe.findFirst({
      where: {
        id: id,
        authorId: userId,
      },
    });

    if (!existingRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found or access denied' },
        { status: 404 }
      );
    }

    // Delete recipe (this will cascade delete meal plans due to foreign key)
    await prisma.recipe.delete({
      where: { id: id },
    });

    return NextResponse.json({
      message: 'Recipe deleted successfully',
    });
  } catch (error) {
    console.error('Recipe deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}