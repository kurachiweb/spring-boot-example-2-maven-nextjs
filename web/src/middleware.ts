import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /@username を /username にリライト
  if (pathname.startsWith("/@")) {
    const username = pathname.slice(2).split("/")[0];
    const restOfPath = pathname.slice(2 + username.length);

    const newUrl = request.nextUrl.clone();
    newUrl.pathname = `/users/${username}${restOfPath}`;

    return NextResponse.rewrite(newUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
