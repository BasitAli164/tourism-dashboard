// Import necessary utilities from Next.js and NextAuth.js
import { NextRequest, NextResponse } from "next/server"; // For handling requests/responses
import { getToken } from "next-auth/jwt"; // To extract the JWT token
export { default } from "next-auth/middleware"; // Default NextAuth middleware

// Middleware function that runs on matched routes
export async function middleware(request: NextRequest) {
  // Extract the JWT token from the request (checks if user is authenticated)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET, // Ensure secret is provided
  }); // Get the URL object to access the current path
  const url = request.nextUrl;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BLOCK 1: Redirect logged-in users away from auth pages
  // Purpose: Prevent authenticated users from accessing sign-in/sign-up or homepage
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Redirect logged-in users away from auth pages
  if (
    token &&
    (url.pathname.startsWith("/signin") || url.pathname.startsWith("/signup"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BLOCK 2: Protect dashboard routes from unauthenticated users
  // Purpose: Ensure only logged-in users can access /dashboard/*
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Protect all dashboard routes if token not available
  if (
    !token &&
    (url.pathname.startsWith("/dashboard") ||
      url.pathname.startsWith("/support") ||
      url.pathname === "/tours" || //Both case are working well and good
      url.pathname === "/feedbacks" ||
      url.pathname === "/inquiries" ||
      url.pathname === "/bookings" ||
      url.pathname === "/settings" ||
      url.pathname === "/profile")
  ) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BLOCK 3: Default behavior
  // Purpose: Allow the request to proceed if no conditions are met
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return NextResponse.next();
}
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BLOCK 4: Matcher configuration
// Purpose: Define which routes should trigger this middleware
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const config = {
  matcher: [
    "/signin", // Trigger on sign-in page
    "/signup", // Trigger on sign-up page
    "/dashboard/:path*", // Now catches all dashboard subroutes
    "/tours/:path*", // Trigger on all tour sub-routes (e.g., /tour/1)
    "/support",
    "/settings",
    "/feedbacks",
    "/inquiries",
    "/bookings",
    "/profile",
  ],
};
