import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/create(.*)", "/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // 1. Await the auth() call to get the user object
  const { userId, redirectToSignIn } = await auth();

  // 2. If the user is NOT logged in AND tries to access a protected route
  if (!userId && isProtectedRoute(req)) {
    // 3. Redirect them to the sign-in page manually
    return redirectToSignIn();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
