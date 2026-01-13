import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  // Skip all auth checks and allow access to all routes
  return NextResponse.next()

  /* Original auth code - commented out for development
  const token = request.cookies.get("token")?.value

  // Public routes
  const isPublicRoute = request.nextUrl.pathname === "/" || request.nextUrl.pathname === "/login"

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Protected routes require authentication
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const payload = await verifyToken(token)

  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Admin-only routes
  if (request.nextUrl.pathname.startsWith("/admin") && payload.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
  */
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/calls/:path*"],
}
