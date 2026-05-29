import { NextRequest, NextResponse } from 'next/server';
import { getUserById, toSafeUser } from '@/lib/dataService';
import { authenticatedRoute } from '@/lib/withAuth';
import { User } from '@/lib/types';

async function handleMe(req: NextRequest, user: any) {
  try {
    console.log('[me] Request received from user:', user.userId, user.email);
    
    // Validate userId exists
    if (!user.userId) {
      console.error('[me] No userId in token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Add timeout to database query
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database query timeout')), 10000)
    );

    let fullUser: User | null;
    try {
      fullUser = await Promise.race([getUserById(user.userId), timeoutPromise as Promise<User>]);
    } catch (dbErr) {
      const errorMsg = dbErr instanceof Error ? dbErr.message : 'Database error';
      console.error('[me] Database query failed:', errorMsg);
      return NextResponse.json({ error: 'Database timeout or error' }, { status: 500 });
    }
    
    if (!fullUser) {
      console.log('[me] User not found in database for ID:', user.userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!fullUser.is_active) {
      console.log('[me] User is inactive:', fullUser.email);
      return NextResponse.json({ error: 'User account is inactive' }, { status: 403 });
    }

    console.log('[me] User found successfully:', fullUser.email);
    const response = NextResponse.json({ user: toSafeUser(fullUser) });
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch user';
    console.error('[me] Error:', message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = authenticatedRoute(handleMe);
