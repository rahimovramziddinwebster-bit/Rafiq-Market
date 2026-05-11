import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role as string | undefined;

    if (pathname.startsWith("/seller") && role !== "SELLER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        if (
          pathname.startsWith("/account") ||
          pathname.startsWith("/seller") ||
          pathname.startsWith("/admin") ||
          pathname.startsWith("/checkout")
        ) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/account/:path*", "/seller/:path*", "/admin/:path*", "/checkout/:path*"],
};
