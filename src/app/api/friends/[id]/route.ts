import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { status } = await request.json();

    if (!['accepted', 'declined'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be either "accepted" or "declined"' },
        { status: 400 }
      );
    }

    // Find the friendship
    const friendship = await prisma.friendship.findUnique({
      where: { id },
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

    if (!friendship) {
      return NextResponse.json(
        { error: 'Friend request not found' },
        { status: 404 }
      );
    }

    // Check if user is the addressee (only addressee can accept/decline)
    if (friendship.addresseeId !== userId) {
      return NextResponse.json(
        { error: 'Only the addressee can respond to friend requests' },
        { status: 403 }
      );
    }

    // Check if request is still pending
    if (friendship.status !== 'pending') {
      return NextResponse.json(
        { error: 'Friend request has already been responded to' },
        { status: 400 }
      );
    }

    // Update the friendship status
    const updatedFriendship = await prisma.friendship.update({
      where: { id },
      data: { status },
      include: {
        requester: {
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
      message: `Friend request ${status} successfully`,
      friendship: {
        id: updatedFriendship.id,
        friend: updatedFriendship.requester,
        status: updatedFriendship.status,
        isRequester: false,
        createdAt: updatedFriendship.createdAt,
        updatedAt: updatedFriendship.updatedAt,
      },
    });
  } catch (error) {
    console.error('Friend request update error:', error);
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
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find the friendship
    const friendship = await prisma.friendship.findUnique({
      where: { id },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: 'Friendship not found' },
        { status: 404 }
      );
    }

    // Check if user is part of this friendship
    if (friendship.requesterId !== userId && friendship.addresseeId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to delete this friendship' },
        { status: 403 }
      );
    }

    // Delete the friendship
    await prisma.friendship.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Friendship removed successfully',
    });
  } catch (error) {
    console.error('Friendship deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}