import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // Validate DATABASE_URL format for serverless environments
  const databaseUrl = process.env.DATABASE_URL || '';
  const warnings: string[] = [];

  // Check if using pooled connection (required for Vercel)
  if (process.env.NODE_ENV === 'production') {
    if (!databaseUrl.includes(':6543')) {
      warnings.push(
        'WARNING: DATABASE_URL should use port 6543 (Transaction pooler) for serverless environments'
      );
    }
    if (!databaseUrl.includes('.pooler.supabase.com')) {
      warnings.push(
        'WARNING: DATABASE_URL should use pooler endpoint (.pooler.supabase.com) for serverless'
      );
    }
    if (databaseUrl.includes(':5432')) {
      warnings.push(
        'CRITICAL: Using port 5432 (direct connection) will fail in serverless. Use Transaction pooler (port 6543)!'
      );
    }
  }

  try {
    // Test database connection
    await prisma.$connect();
    const userCount = await prisma.user.count();

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      userCount,
      warnings: warnings.length > 0 ? warnings : undefined,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseServiceRole: !!process.env.SUPABASE_SERVICE_ROLE,
        hasClerkPublishable: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        hasClerkSecret: !!process.env.CLERK_SECRET_KEY,
        nodeEnv: process.env.NODE_ENV,
        databasePort: databaseUrl.match(/:(\d+)\//)?.[1] || 'unknown',
        usingPooler: databaseUrl.includes('.pooler.supabase.com'),
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
        troubleshooting:
          warnings.length > 0
            ? 'Check DEPLOYMENT.md for correct DATABASE_URL configuration'
            : undefined,
        env: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          hasSupabaseUrl: !!process.env.SUPABASE_URL,
          hasSupabaseServiceRole: !!process.env.SUPABASE_SERVICE_ROLE,
          hasClerkPublishable: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
          hasClerkSecret: !!process.env.CLERK_SECRET_KEY,
          nodeEnv: process.env.NODE_ENV,
          databasePort: databaseUrl.match(/:(\d+)\//)?.[1] || 'unknown',
          usingPooler: databaseUrl.includes('.pooler.supabase.com'),
        },
      },
      { status: 500 }
    );
  }
}
