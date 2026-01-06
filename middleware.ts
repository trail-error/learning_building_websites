import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth_token")?.value
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/signup"]

  // API routes that don't require authentication
  const publicApiRoutes = ["/api/auth/login", "/api/auth/signup"]

  // Check if the route is public
  const isPublicRoute = publicRoutes.includes(pathname) || publicApiRoutes.some((route) => pathname.startsWith(route))

  // If the route is public, allow access
  if (isPublicRoute) {
    // If user is already authenticated and trying to access login/signup, redirect to main
    if (authToken && (pathname === "/login" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/main", request.url))
    }
    return NextResponse.next()
  }

  // If the route is not public and user is not authenticated, redirect to login
  if (!authToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If user is authenticated and accessing a protected route, allow access
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
