import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ADMIN_COOKIE_NAME = 'skr_admin_token'
  
  // Protect all /admin/* routes except login, forgot-password, and reset-password
  const isAuthPage = pathname.startsWith('/admin/login') || 
                     pathname.startsWith('/admin/forgot-password') || 
                     pathname.startsWith('/admin/reset-password')

  if (pathname.startsWith('/admin') && !isAuthPage) {
    // Check for the admin cookie presence
    // Note: We can only check for existence here, backend verifies the actual JWT
    const hasToken = request.cookies.has(ADMIN_COOKIE_NAME)
    
    if (!hasToken) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
