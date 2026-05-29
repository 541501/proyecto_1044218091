import { NextRequest, NextResponse } from 'next/server';
import { JWTPayload, UserRole } from './types';
import { verifyJWT, getTokenFromCookie } from './auth';

/**
 * Función currificada para proteger rutas API con roles específicos
 * Uso: export const GET = withRole(['admin'])(handler)
 * Compatible con rutas dinámicas que usan params
 */
export function withRole(allowedRoles: UserRole[]) {
  return function withAuth(
    handler: (req: NextRequest, user: JWTPayload, ...args: any[]) => Promise<NextResponse>
  ) {
    return async (req: NextRequest, ...args: any[]) => {
      try {
        const cookieHeader = req.headers.get('cookie');
        const token = getTokenFromCookie(cookieHeader);

        if (!token) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await verifyJWT(token);

        if (!allowedRoles.includes(user.role)) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return handler(req, user, ...args);
      } catch (error) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    };
  };
}
