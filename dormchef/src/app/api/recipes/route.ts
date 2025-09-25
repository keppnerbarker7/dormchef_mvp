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

    let searchParams: URLSearchParams;
    try {
      const url = new URL(request.url);
      searchParams = url.searchParams;
    } catch (error) {
      console.error('Invalid URL:', request.url);
      searchParams = new URLSearchParams();
    }
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const difficulty = searchParams.get('difficulty') || '';
    const authorId = searchParams.get('author') || '';

    // Build where clause
    const where: any = {
      OR: [
        { isPublic: true },
        { authorId: userId },
      ],
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    if (tags.length > 0) {
      where.tags = {
        hasEvery: tags,
      };
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    // Get recipes with pagination
    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
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
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.recipe.count({ where }),
    ]);

    return NextResponse.json({
      recipes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Recipe fetch error:', error);
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

    // Validation
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

    if (prepTime < 0 || cookTime < 0 || servings < 1) {
      return NextResponse.json(
        { error: 'Invalid time or serving values' },
        { status: 400 }
      );
    }

    // Validate ingredients format
    for (const ingredient of ingredients) {
      if (!ingredient.name || !ingredient.unit || ingredient.amount <= 0) {
        return NextResponse.json(
          { error: 'Invalid ingredient format' },
          { status: 400 }
        );
      }
    }

    // Create recipe
    const recipe = await prisma.recipe.create({
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
        authorId: userId,
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

    return NextResponse.json(
      {
        message: 'Recipe created successfully',
        recipe,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Recipe creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}