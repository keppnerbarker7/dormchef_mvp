import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile(.*)',
  '/recipes(.*)',
  '/meal-planner(.*)',
  '/shopping-list(.*)',
  '/friends(.*)',
])

const isPublicApiRoute = createRouteMatcher([
  '/api/auth(.*)',
  '/api/webhooks(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  // Don't protect public API routes
  if (isPublicApiRoute(req)) return

  // Protect other API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    await auth.protect()
    return
  }

  // Protect app routes
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}