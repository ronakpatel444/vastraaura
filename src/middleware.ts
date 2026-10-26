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

  // 1. Handle Admin Routes (/admin, /admin/social, etc.)
  if (isAdminRoute) {
    // If legacy admin cookie is present, allow access
    const legacyAdminCookie = request.cookies.get('admin_auth_token')?.value;
    if (legacyAdminCookie === 'authenticated') {
      return NextResponse.next();
    }

    // Check JWT session
    const sessionCookie = request.cookies.get('session')?.value;
    if (sessionCookie) {
      const session = await decrypt(sessionCookie);
      if (session && session.role === 'ADMIN') {
        return NextResponse.next();
      }
    }

    // Not authenticated as ADMIN -> cleanly redirect to /admin/login
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // 2. Handle Seller, Influencer, and Account Routes
  if (isSellerRoute || isInfluencerRoute || isAccountRoute) {
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const session = await decrypt(sessionCookie);
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isSellerRoute && session.role !== 'SELLER') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (isInfluencerRoute && session.role !== 'INFLUENCER') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 3. Handle Admin Login Page (/admin/login)
  if (path === '/admin/login') {
    const legacyAdminCookie = request.cookies.get('admin_auth_token')?.value;
    if (legacyAdminCookie === 'authenticated') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    const sessionCookie = request.cookies.get('session')?.value;
    if (sessionCookie) {
      const session = await decrypt(sessionCookie);
      if (session && session.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
    // Allow non-admins to view /admin/login
    return NextResponse.next();
  }

  // 4. Handle Customer Login Page (/login)
  if (path === '/login') {
    const sessionCookie = request.cookies.get('session')?.value;
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
