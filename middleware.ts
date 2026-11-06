import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/services/:path*",
    "/security/:path*",
    "/cleanup/:path*",
    "/history/:path*",
    "/settings/:path*",
    "/api/services/:path*",
    "/api/security/:path*",
    "/api/history/:path*",
    "/api/cleanup/:path*",
    "/api/dashboard/:path*",
    "/api/user/:path*",
  ],
};
