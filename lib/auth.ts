import * as jose from 'jose';
import { JWTPayload } from './types';

// Vercel projects bootstrapped via the Supabase Marketplace integration only
// have ClassSport_* env vars. Reuse the Supabase JWT secret for app sessions
// when our own JWT_SECRET isn't provided.
const JWT_SECRET = process.env.JWT_SECRET || process.env.ClassSport_SUPABASE_JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

/**
 * Sign a JWT with the given payload.
 * Expires in 24 hours.
 */
export async function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 24 * 60 * 60; // 24 hours

  const token = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secretKey);

  return token;
}

/**
 * Verify and decode a JWT.
 */
export async function verifyJWT(token: string): Promise<JWTPayload> {
  try {
    const verified = await jose.jwtVerify(token, secretKey);
    return verified.payload as unknown as JWTPayload;
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Extract JWT from request cookie.
 */
export function getTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    console.log('[getTokenFromCookie] No cookie header provided');
    return null;
  }

  const cookies = cookieHeader.split('; ');
  for (const cookie of cookies) {
    const [name, value] = cookie.split('=');
    if (name === 'auth-token' && value) {
      console.log('[getTokenFromCookie] Token found in cookie');
      return decodeURIComponent(value);
    }
  }

  console.log('[getTokenFromCookie] Token not found in cookies');
  return null;
}

/**
 * Create a Set-Cookie header value for the JWT.
 * HttpOnly, Secure (in production), SameSite=Strict.
 */
export function createAuthCookie(token: string, isProduction: boolean = false): string {
  const maxAge = 24 * 60 * 60; // 24 hours in seconds
  const secure = isProduction ? 'Secure; ' : '';
  return `auth-token=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; ${secure}SameSite=Strict`;
}

/**
 * Create a Set-Cookie header to clear the JWT.
 */
export function createClearAuthCookie(): string {
  return 'auth-token=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict';
}
