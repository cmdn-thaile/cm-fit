import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const auth0 = new Auth0Client({
  authorizationParameters: {
    scope: "openid profile email",
  },
});

export async function middleware(request: NextRequest) {
  // Always run Auth0 middleware first — it handles /auth/* routes
  const response = await auth0.middleware(request);

  const { pathname } = request.nextUrl;

  // Don't require auth for /auth/* routes or API routes
  if (pathname.startsWith("/auth") || pathname.startsWith("/login")) {
    return response;
  }

  // For all other routes, check session
  const session = await auth0.getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
