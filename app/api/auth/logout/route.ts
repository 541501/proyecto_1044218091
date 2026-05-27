import { NextRequest, NextResponse } from 'next/server';
import { createClearAuthCookie } from '@/lib/auth';

export async function POST(_req: NextRequest) {
  try {
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );
    response.headers.append('Set-Cookie', createClearAuthCookie());
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Logout failed';
    console.error('[logout]', err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
