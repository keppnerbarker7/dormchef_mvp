import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
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
    const status = searchParams.get('status') as 'pending' | 'accepted' | 'declined' | null;
    const type = searchParams.get('type') as 'sent' | 'received' | null;

    let whereClause: any = {};

    if (type === 'sent') {
      whereClause.requesterId = session.user.id;
    } else if (type === 'received') {
      whereClause.addresseeId = session.user.id;
    } else {
      // Get all friendships where user is either requester or addressee
      whereClause = {
        OR: [
          { requesterId: session.user.id },
          { addresseeId: session.user.id }
        ]
      };
    }

    if (status) {
      whereClause.status = status;
    }

    const friendships = await prisma.friendship.findMany({
      where: whereClause,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform data to be more user-friendly
    const transformedFriendships = friendships.map(friendship => {
      const isRequester = friendship.requesterId === session.user.id;
      const friend = isRequester ? friendship.addressee : friendship.requester;

      return {
        id: friendship.id,
        friend,
        status: friendship.status,
        isRequester,
        createdAt: friendship.createdAt,
        updatedAt: friendship.updatedAt,
      };
    });

    return NextResponse.json({
      friendships: transformedFriendships,
      total: transformedFriendships.length,
    });
  } catch (error) {
    console.error('Friends fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { addresseeId } = await request.json();

    if (!addresseeId) {
      return NextResponse.json(
        { error: 'Receiver ID is required' },
        { status: 400 }
      );
    }

    if (addresseeId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot send friend request to yourself' },
        { status: 400 }
      );
    }

    // Check if addressee exists
    const addressee = await prisma.user.findUnique({
      where: { id: addresseeId },
      select: { id: true, username: true, displayName: true },
    });

    if (!addressee) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          {
            requesterId: session.user.id,
            addresseeId: addresseeId,
          },
          {
            requesterId: addresseeId,
            addresseeId: session.user.id,
          },
        ],
      },
    });

    if (existingFriendship) {
      let message = '';
      switch (existingFriendship.status) {
        case 'pending':
          message = 'Friend request already sent or received';
          break;
        case 'accepted':
          message = 'Already friends with this user';
          break;
        case 'declined':
          message = 'Friend request was previously declined';
          break;
      }
      return NextResponse.json(
        { error: message },
        { status: 409 }
      );
    }

    // Create friend request
    const friendship = await prisma.friendship.create({
      data: {
        requesterId: session.user.id,
        addresseeId: addresseeId,
        status: 'pending',
      },
      include: {
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

    return NextResponse.json({
      message: 'Friend request sent successfully',
      friendship: {
        id: friendship.id,
        friend: friendship.addressee,
        status: friendship.status,
        isRequester: true,
        createdAt: friendship.createdAt,
        updatedAt: friendship.updatedAt,
      },
    });
  } catch (error) {
    console.error('Friend request creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}