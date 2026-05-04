import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookie, verifyJWT } from './auth';
import { JWTPayload } from './types';

/**
 * Middleware for API routes to verify JWT authentication.
 * Adds Cache-Control: no-store to prevent caching.
 * Returns 401 if token is invalid or missing.
 */
export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const token = getTokenFromCookie(req.headers.get('cookie'));

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyJWT(token);

    // Call the handler with the user context
    const response = await handler(req, user);

    // Add no-store headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
    return NextResponse.json({ error: errorMessage }, { status: 401 });
  }
}

/**
 * Helper to create an authenticated API route handler.
 * Usage:
 *   export const POST = authenticatedRoute(async (req, user) => { ... })
 */
export function authenticatedRoute(
  handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>
) {
  return (req: NextRequest) => withAuth(req, handler);
}
