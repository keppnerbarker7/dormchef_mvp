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
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Search for users by username or display name
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: {
              not: userId, // Exclude current user
            },
          },
          {
            OR: [
              {
                username: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                displayName: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        image: true,
        createdAt: true,
      },
      take: limit,
      orderBy: [
        {
          username: 'asc',
        },
      ],
    });

    // Get existing friendships to determine relationship status
    const userIds = users.map(user => user.id);
    const existingFriendships = await prisma.friendship.findMany({
      where: {
        OR: [
          {
            requesterId: userId,
            addresseeId: { in: userIds },
          },
          {
            requesterId: { in: userIds },
            addresseeId: userId,
          },
        ],
      },
      select: {
        requesterId: true,
        addresseeId: true,
        status: true,
      },
    });

    // Create a map of user relationships
    const relationshipMap = new Map();
    existingFriendships.forEach(friendship => {
      const otherUserId = friendship.requesterId === userId
        ? friendship.addresseeId
        : friendship.requesterId;

      relationshipMap.set(otherUserId, {
        status: friendship.status,
        isRequester: friendship.requesterId === userId,
      });
    });

    // Add relationship status to each user
    const usersWithStatus = users.map(user => ({
      ...user,
      relationship: relationshipMap.get(user.id) || null,
    }));

    return NextResponse.json({
      users: usersWithStatus,
      total: usersWithStatus.length,
      query,
    });
  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}