import { NextRequest, NextResponse } from 'next/server';
import * as bcrypt from 'bcryptjs';
import { changePasswordSchema } from '@/lib/schemas';
import { getUserById, updateUser, recordAudit } from '@/lib/dataService';
import { authenticatedRoute } from '@/lib/withAuth';

async function handleChangePassword(req: NextRequest, user: any) {
  try {
    const body = await req.json();

    // Validate input
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 400 });
    }

    const { currentPassword, newPassword } = parsed.data;

    // Get current user
    const currentUser = await getUserById(user.userId);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, currentUser.password_hash);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update user
    await updateUser(user.userId, {
      password_hash: newPasswordHash,
      must_change_password: false,
    });

    // Record audit
    try {
      await recordAudit({
        user_id: user.userId,
        user_email: user.email,
        user_role: user.role,
        action: 'login',
        entity: 'user',
        entity_id: user.userId,
        summary: `Cambió su contraseña`,
      });
    } catch (auditErr) {
      console.warn('[change-password] Audit recording failed:', auditErr);
    }

    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to change password';
    console.error('[change-password]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const POST = authenticatedRoute(handleChangePassword);
