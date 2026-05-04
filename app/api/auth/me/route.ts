import { NextRequest, NextResponse } from 'next/server';
import { getUserById, toSafeUser } from '@/lib/dataService';
import { authenticatedRoute } from '@/lib/withAuth';

async function handleMe(req: NextRequest, user: any) {
  try {
    const fullUser = await getUserById(user.userId);
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
