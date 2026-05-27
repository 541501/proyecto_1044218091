import { NextRequest, NextResponse } from 'next/server';
import { getUserById, toSafeUser } from '@/lib/dataService';
import { authenticatedRoute } from '@/lib/withAuth';
import { User } from '@/lib/types';

async function handleMe(req: NextRequest, user: any) {
  try {
    console.log('[me] Fetching user with ID:', user.userId);
    
    // Timeout de 15 segundos para la consulta (aumentado de 8 para mayor tolerancia)
    const userPromise = getUserById(user.userId);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Database query timeout after 15s')), 15000)
    );
    
    const fullUser = (await Promise.race([userPromise, timeoutPromise])) as User | null;
    
    if (!fullUser) {
      console.log('[me] User not found for ID:', user.userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
