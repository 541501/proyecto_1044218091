import { NextRequest, NextResponse } from 'next/server';
import { getUserById, toSafeUser } from '@/lib/dataService';
import { authenticatedRoute } from '@/lib/withAuth';

async function handleMe(req: NextRequest, user: any) {
  try {
    // Timeout de 8 segundos para la consulta
    const userPromise = getUserById(user.userId);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database query timeout')), 8000)
    );
    
    const fullUser = await Promise.race([userPromise, timeoutPromise]);
    
    if (!fullUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const response = NextResponse.json({ user: toSafeUser(fullUser) });
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch user';
    console.error('[me]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = authenticatedRoute(handleMe);
