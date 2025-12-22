// proxy.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define your backend base URL
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Attempts to refresh the access token using the refresh token cookie.
 * @param request The incoming NextRequest.
 * @returns A promise that resolves to the refresh response or null on failure.
 */
async function refreshAccessToken(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;
  if (!refreshToken) return null; // Safety check: No refresh token, no refresh attempt

  try {
    const refreshRes = await fetch(`${BACKEND_API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        // Forward the original request's cookies (including refresh_token) to the backend
        Cookie: request.headers.get("cookie") || "",
        "Content-Type": "application/json",
      },
      // Keep body empty if your backend reads the refresh token from the cookie
    });

    // Check for success (200-299 status)
    if (refreshRes.ok) {
      return refreshRes;
    }

    // 401/403 means refresh token is also invalid/expired
    return null;
  } catch (error) {
    // Log network/fetch errors
    console.error("Error during token refresh in middleware:", error);
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const path = url.pathname;

  // 1. Get current cookies
  const token = request.cookies.get("access_token")?.value || null;
  const rawUser = request.cookies.get("app_user")?.value || null;

  let user: any = null;
  if (rawUser) {
    try {
      const decoded = decodeURIComponent(rawUser);
      user = JSON.parse(decoded);
      if (!user || typeof user !== "object") user = null;
    } catch {
      user = null;
    }
  }

  // Define protected and auth routes
  const isProtected =
    path.startsWith("/bid") ||
    path.startsWith("/profile") ||
    path.startsWith("/admin") ||
    path.startsWith("/agent");
  const isAuthRoute = path === "/sign-in" || path === "/sign-up";

  // --- IGNORE SPECIAL ROUTES ---
  if (
    path.startsWith("/api/auth/refresh") ||
    path.startsWith("/api/auth/logout") ||
    (!isProtected && !isAuthRoute) // Allow public pages
  ) {
    return NextResponse.next();
  }

  // ---------------------------------------
  // 🔑 AUTH CHECK WITH REFRESH LOGIC (Page Protection)
  // ---------------------------------------

  // If a protected page is accessed AND the access token is missing/expired
  if (isProtected && !token) {
    // --- ATTEMPT REFRESH ---
    const refreshResponse = await refreshAccessToken(request);

    if (refreshResponse) {
      console.log("Token refreshed successfully in middleware. Proceeding.");

      const response = NextResponse.next();

      // Forward the new cookies to the browser
      const newCookies = refreshResponse.headers.getSetCookie();
      newCookies.forEach((cookie) => {
        response.headers.append("Set-Cookie", cookie);
      });

      return response; // Success, continue to the protected page
    } else {
      // Refresh failed (refresh token expired)

      // Clear all session cookies and redirect to sign-in
      const response = NextResponse.redirect(new URL("/sign-in", request.url));
      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");
      response.cookies.delete("app_user");
      response.cookies.delete("x-device-id");
      console.log("Refresh failed. Redirecting to sign-in.");
      return response;
    }
  }

  // ---------------------------------------
  // 👥 ROLE & USER DATA CHECKS (Existing Logic)
  // ---------------------------------------

  // Token exists but user cookie broken OR role check fails
  if (token && !user) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (path.startsWith("/admin")) {
    // Not logged in properly
    if (!user || !token) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Logged in but not admin
    if (user.role === "AGENT") {
      return NextResponse.redirect(new URL("/agent/dashboard", request.url));
    }

    // Optional: USER role
    if (user.role === "USER") {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  // ... other role/approval checks ...

  // ---------------------------------------
  // ➡️ FINAL PASS
  // ---------------------------------------

  // Redirect authenticated users away from login pages
  if (isAuthRoute && token && user) {
    if (user.role === "ADMIN")
      return NextResponse.redirect(new URL("/admin", request.url));
    // ... other role redirects ...
  }

  return NextResponse.next();
}

export const config = {
  // Match all paths except those that are static, internal, or part of the login/logout flow
  matcher: [
    "/((?!api/auth/refresh|api/auth/logout|api/auth/login|api|_next/static|_next/image|favicon.ico).*)",
  ],
};
