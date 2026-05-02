import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware to protect admin routes
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ADMIN_COOKIE_NAME = 'skr_admin_token'
  
  // 1. Check if the path is in the /admin domain
  if (pathname.startsWith('/admin')) {
    
    // 2. Allow auth-related pages to be accessed without session
    const isAuthPage = pathname === '/admin/login' || 
                       pathname === '/admin/forgot-password' || 
                       pathname === '/admin/reset-password'
    
    if (isAuthPage) {
      return NextResponse.next()
    }
    
    // 3. Check for the auth cookie presence
    // Note: We only check for existence here; backend verifies the actual JWT
    const hasToken = request.cookies.has(ADMIN_COOKIE_NAME)
    
    if (!hasToken) {
      // 4. Redirect to login if not authenticated
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

// Ensure proxy only runs on relevant paths for performance
export const config = {
  matcher: ['/admin/:path*'],
}
