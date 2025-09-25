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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        school: true,
        dietaryRestrictions: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Add bio field (we'll store it in a separate table later)
    const profile = {
      ...user,
      bio: '', // Placeholder for now
      image: user.image || '',
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
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

    const { displayName, school, dietaryRestrictions, bio } = await request.json();

    // Validation
    if (!displayName?.trim()) {
      return NextResponse.json(
        { error: 'Display name is required' },
        { status: 400 }
      );
    }

    if (displayName.length > 50) {
      return NextResponse.json(
        { error: 'Display name must be 50 characters or less' },
        { status: 400 }
      );
    }

    if (school && school.length > 100) {
      return NextResponse.json(
        { error: 'School name must be 100 characters or less' },
        { status: 400 }
      );
    }

    if (bio && bio.length > 300) {
      return NextResponse.json(
        { error: 'Bio must be 300 characters or less' },
        { status: 400 }
      );
    }

    if (!Array.isArray(dietaryRestrictions)) {
      return NextResponse.json(
        { error: 'Invalid dietary restrictions format' },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: displayName.trim(),
        school: school?.trim() || null,
        dietaryRestrictions,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        school: true,
        dietaryRestrictions: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}