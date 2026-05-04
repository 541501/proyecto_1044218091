import { NextRequest, NextResponse } from 'next/server';
import { createClearAuthCookie } from '@/lib/auth';
import { recordAudit } from '@/lib/dataService';
import { authenticatedRoute } from '@/lib/withAuth';

async function handleLogout(req: NextRequest, user: any) {
  try {
    // Record audit
    try {
      await recordAudit({
        user_id: user.userId,
        user_email: user.email,
        user_role: user.role,
        action: 'logout',
        entity: 'user',
        entity_id: user.userId,
        summary: `Usuario cerró sesión`,
      });
    } catch (auditErr) {
      console.warn('[logout] Audit recording failed:', auditErr);
    }

    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', createClearAuthCookie());
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Logout failed';
    console.error('[logout]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const POST = authenticatedRoute(handleLogout);
