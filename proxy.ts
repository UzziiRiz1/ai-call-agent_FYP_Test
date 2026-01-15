import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// Renaming 'middleware' to 'proxy' to satisfy the environment error
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("token")?.value

  // 1. Root Path "/" Handling
  if (pathname === "/") {
    if (token) {
      // If logged in, go to dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } else {
      // If NOT logged in, go to login
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // 2. Auth Check for protected routes
  // (Ideally the matcher handles this, but we double check)
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      console.error("JWT_SECRET is not defined in proxy/middleware")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const encodedSecret = new TextEncoder().encode(secret)
    await jwtVerify(token, encodedSecret)

    return NextResponse.next()
  } catch (err) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - api/setup (setup route)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - public (public files if any)
     */
    "/",
    "/dashboard/:path*",
    "/calls/:path*",
    "/settings/:path*",
    "/patients/:path*",
    "/doctors/:path*",
    "/appointments/:path*",
    "/admin/:path*",
    "/analytics/:path*",
  ],
}
