// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read access token (single source of truth)
  const token = request.cookies.get("access_token")?.value;

  // Define routes
  const isAuthRoute =
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up");

  const isProtectedRoute =
    pathname.startsWith("/bid") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/agent");

  // --------------------------------------------------
  // 1️⃣ Allow all non-protected, non-auth routes
  // --------------------------------------------------
  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  // --------------------------------------------------
  // 2️⃣ If accessing protected route WITHOUT token → sign-in
  // --------------------------------------------------
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(
      new URL("/sign-in", request.url),
    );
  }

  // --------------------------------------------------
  // 3️⃣ If accessing sign-in / sign-up WITH token → /bid
  // --------------------------------------------------
  if (isAuthRoute && token) {
    return NextResponse.redirect(
      new URL("/bid", request.url),
    );
  }

  // --------------------------------------------------
  // 4️⃣ Otherwise allow request
  // --------------------------------------------------
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to all routes except:
    // - API routes
    // - Next.js internals
    // - static files
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
