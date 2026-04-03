import { updateSession } from '@/lib/supabase/middleware'
import { authorizeRequest } from '@/lib/auth/session'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const authGate = await authorizeRequest(request)
  if (authGate) {
    return authGate
  }

  const pathname = request.nextUrl.pathname
  if (
    pathname.startsWith('/api/auth') ||
    pathname === '/' ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/verify')
  ) {
    return NextResponse.next()
  }

  try {
    return await updateSession(request)
  } catch (error) {
    console.error('Middleware session update failed, continuing without Supabase session sync:', error)
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
