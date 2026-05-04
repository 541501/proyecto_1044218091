import { NextRequest, NextResponse } from 'next/server';
import { JWTPayload, UserRole } from './types';

/**
 * Middleware to check if user has required role(s).
 * Must be used after withAuth middleware.
 */
export async function withRole(
  req: NextRequest,
  user: JWTPayload,
  allowedRoles: UserRole[],
  handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return handler(req, user);
}

/**
 * Helper to create a role-protected API route handler.
 * Usage:
 *   export const POST = roleProtectedRoute(['admin'], async (req, user) => { ... })
 */
export function roleProtectedRoute(
  allowedRoles: UserRole[],
  handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>
) {
  return async (req: NextRequest, user: JWTPayload) => {
    return withRole(req, user, allowedRoles, handler);
  };
}
