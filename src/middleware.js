// middleware.js
import { NextResponse } from 'next/server';

export async function middleware(req) {
  console.log("Middleware running for path:", req.nextUrl.pathname);
  
  // Check for auth cookies - using a different approach to check
  const cookieHeader = req.headers.get('cookie') || '';
  const hasAuthCookie = cookieHeader.includes('sb-access-token') || 
                        cookieHeader.includes('sb-refresh-token') || 
                        cookieHeader.includes('supabase-auth-token');
  
  console.log("Auth cookie present:", hasAuthCookie);
  
  // Temporarily disable redirect to troubleshoot
  // if (req.nextUrl.pathname.startsWith('/feed') && !hasAuthCookie) {
  //   console.log("No auth cookie found, would redirect to home");
  //   return NextResponse.redirect(new URL('/', req.url));
  // }
  
  console.log("Proceeding to requested page");
  return NextResponse.next();
}

// Only run middleware on the feed routes
export const config = {
  matcher: ['/feed/:path*'],
};