import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware to protect admin routes
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 1. Check if the path is in the /admin domain
  if (pathname.startsWith('/admin')) {
    
    // 2. Allow the login page itself to be accessed
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }
    
    // 3. Check for the auth cookie set by our login page
    const authCookie = request.cookies.get('admin_auth')
    
    if (!authCookie || authCookie.value !== 'true') {
      // 4. Redirect to login if not authenticated
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

// Ensure middleware only runs on relevant paths for performance
export const config = {
  matcher: ['/admin/:path*'],
}
