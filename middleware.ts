import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

interface JWTPayload {
  userId: string;
  email: string;
  role: 'profesor' | 'coordinador' | 'admin';
  must_change_password: boolean;
  iat?: number;
  exp?: number;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.ClassSport_SUPABASE_JWT_SECRET || 'test-secret',
);

const roleRoutes = {
  admin: ['/admin', '/reports'],
  coordinador: ['/reports'],
  profesor: [],
};

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Rutas públicas
  if (pathname === '/login' || pathname === '/' || pathname === '/api/auth/login' || pathname === '/api/auth/logout' || pathname === '/api/system/mode' || pathname === '/api/system/diagnose' || pathname === '/api/system/bootstrap') {
    return NextResponse.next();
  }

  // Verificar token
  const authToken = req.cookies.get('auth-token')?.value;

  if (!authToken) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const verified = await jose.jwtVerify(authToken, JWT_SECRET);
    const payload = verified.payload as unknown as JWTPayload;
    const role = payload.role;
    const mustChangePassword = payload.must_change_password;

    // If must_change_password, redirect to /profile (except for /profile itself and /api/auth/change-password)
    if (mustChangePassword && pathname !== '/profile' && !pathname.startsWith('/api/auth/change-password') && !pathname.startsWith('/api/auth/logout')) {
      return NextResponse.redirect(new URL('/profile?action=change-password', req.url));
    }

    // Proteger rutas por rol
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (pathname.startsWith('/reports') && role !== 'admin' && role !== 'coordinador') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Profesor intenta acceder a /reservations (listado global)
    if (pathname === '/reservations' && role === 'profesor') {
      return NextResponse.redirect(new URL('/reservations/my', req.url));
    }

    return NextResponse.next();
  } catch (err) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
