import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile(.*)',
  '/recipes(.*)',
  '/meal-planner(.*)',
  '/shopping-list(.*)',
  '/friends(.*)',
  '/api/((?!auth|webhooks).*)' // Protect API routes except auth and webhooks
])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect()
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}