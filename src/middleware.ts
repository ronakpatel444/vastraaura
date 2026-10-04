import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Paths that require specific roles
  const isAdminRoute = path.startsWith('/admin') && path !== '/admin/login';
  const isSellerRoute = path.startsWith('/seller') && path !== '/seller/login' && path !== '/seller/register';
  const isInfluencerRoute = path.startsWith('/influencer') && path !== '/influencer/login' && path !== '/influencer/register';
  const isAccountRoute = path.startsWith('/account');

  if (isAdminRoute || isSellerRoute || isInfluencerRoute || isAccountRoute) {
    const sessionCookie = request.cookies.get('session')?.value;
    
    // Legacy fallback for MVP admin (temporary preservation)
    const legacyAdminCookie = request.cookies.get('admin_auth_token')?.value;
    if (isAdminRoute && legacyAdminCookie === 'authenticated' && !sessionCookie) {
       return NextResponse.next();
    }

    if (!sessionCookie) {
      if (isAdminRoute) return NextResponse.redirect(new URL('/admin/login', request.url));
      if (isSellerRoute) return NextResponse.redirect(new URL('/login', request.url));
      if (isInfluencerRoute) return NextResponse.redirect(new URL('/login', request.url));
      if (isAccountRoute) return NextResponse.redirect(new URL('/login', request.url));
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const session = await decrypt(sessionCookie);

    if (!session) {
      // Invalid or expired token
      if (isAdminRoute) return NextResponse.redirect(new URL('/admin/login', request.url));
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based access control
    if (isAdminRoute && session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (isSellerRoute && session.role !== 'SELLER') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (isInfluencerRoute && session.role !== 'INFLUENCER') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Redirect authenticated users away from login pages
  if (path === '/admin/login' || path === '/login') {
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (path === '/admin/login') {
       const legacyAdminCookie = request.cookies.get('admin_auth_token')?.value;
       if (legacyAdminCookie === 'authenticated') {
         return NextResponse.redirect(new URL('/admin', request.url));
       }
    }

    if (sessionCookie) {
      const session = await decrypt(sessionCookie);
      if (session) {
        if (session.role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url));
        if (session.role === 'SELLER') return NextResponse.redirect(new URL('/seller', request.url));
        if (session.role === 'INFLUENCER') return NextResponse.redirect(new URL('/influencer', request.url));
        if (session.role === 'CUSTOMER') return NextResponse.redirect(new URL('/account', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/seller/:path*',
    '/influencer/:path*',
    '/account/:path*',
    '/login'
  ],
};
