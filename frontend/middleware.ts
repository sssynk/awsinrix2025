import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware can be used for additional route protection
// Note: Primary auth check is done client-side via AuthContext
export function middleware(request: NextRequest) {
  // You can add additional middleware logic here
  // For example, logging, analytics, etc.
  
  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};


