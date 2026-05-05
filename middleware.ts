import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'test-secret');

const roleRoutes = {
  admin: ['/admin', '/reports'],
  coordinador: ['/reports'],
  profesor: [],
};

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Rutas públicas
  if (pathname === '/login' || pathname === '/') {
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
    const role = (verified.payload as any).role as string;

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
