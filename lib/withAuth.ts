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
    let token = getTokenFromCookie(req.headers.get('cookie'));
    
    // Fallback: check Authorization header
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      console.log('[withAuth] No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[withAuth] Token found, verifying...');
    
    // Add timeout to JWT verification
    const verifyPromise = verifyJWT(token);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('JWT verification timeout')), 5000)
    );

    let user: JWTPayload;
    try {
      user = await Promise.race([verifyPromise, timeoutPromise as Promise<JWTPayload>]);
    } catch (verifyErr) {
      const errorMsg = verifyErr instanceof Error ? verifyErr.message : 'Verification error';
      console.error('[withAuth] JWT verification failed:', errorMsg);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    console.log('[withAuth] Token verified for user:', user.email);

    // Call the handler with the user context
    const response = await handler(req, user);

    // Add no-store headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
    console.error('[withAuth] Auth error:', errorMessage);
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
