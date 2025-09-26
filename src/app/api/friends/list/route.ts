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
    const includeActivity = searchParams.get('activity') === 'true';

    // Get all accepted friendships
    const friendships = await prisma.friendship.findMany({
      where: {
        AND: [
          {
            OR: [
              { requesterId: userId },
              { addresseeId: userId },
            ],
          },
          { status: 'accepted' },
        ],
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            displayName: true,
            image: true,
          },
        },
        addressee: {
          select: {
            id: true,
            username: true,
            displayName: true,
            image: true,
          },
        },
      },
    });

    // Get friend data (the user who is NOT the current user in each friendship)
    const friends = friendships.map(friendship => {
      return friendship.requesterId === userId
        ? friendship.addressee
        : friendship.requester;
    });

    let friendsWithActivity = friends;

    // Optionally include recent recipe activity
    if (includeActivity && friends.length > 0) {
      const friendIds = friends.map(friend => friend.id);

      // Get recent recipes from friends (last 7 days)
      const recentRecipes = await prisma.recipe.findMany({
        where: {
          authorId: { in: friendIds },
          isPublic: true,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          },
        },
        select: {
          id: true,
          title: true,
          imageUrl: true,
          authorId: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Group recipes by author
      const recipesByAuthor = new Map();
      recentRecipes.forEach(recipe => {
        if (!recipesByAuthor.has(recipe.authorId)) {
          recipesByAuthor.set(recipe.authorId, []);
        }
        recipesByAuthor.get(recipe.authorId).push(recipe);
      });

      // Add activity to each friend
      friendsWithActivity = friends.map(friend => ({
        ...friend,
        recentRecipes: recipesByAuthor.get(friend.id) || [],
        recipeCount: recipesByAuthor.get(friend.id)?.length || 0,
      }));
    }

    return NextResponse.json({
      friends: friendsWithActivity,
      total: friendsWithActivity.length,
    });
  } catch (error) {
    console.error('Friends list fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}