import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");
    const isAdminPage = req.nextUrl.pathname.startsWith("/admin");

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return null;
    }

    if (isAdminPage) {
      if (!isAuth || token.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url)); // or /unauthorized
      }
    }

    return null;
  },
  {
    callbacks: {
      // This is necessary because `withAuth` requires a returning true to trigger the middleware function
      authorized: ({ token, req }) => {
        const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");
        if (isAuthPage) return true;
        // Require auth for protected routes like profile, orders, checkout, admin
        const isProtectedRoute = req.nextUrl.pathname.startsWith("/admin") || req.nextUrl.pathname.startsWith("/profile") || req.nextUrl.pathname.startsWith("/checkout");
        if (isProtectedRoute) return !!token;
        return true; // Allow public routes
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/login", "/register", "/profile/:path*", "/checkout"],
};
