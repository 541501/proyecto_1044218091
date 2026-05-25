import { NextRequest, NextResponse } from 'next/server';
import * as bcrypt from 'bcryptjs';
import { changePasswordSchema } from '@/lib/schemas';
import { getUserById, updateUser } from '@/lib/dataService';
import { authenticatedRoute } from '@/lib/withAuth';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.ClassSport_SUPABASE_JWT_SECRET || 'test-secret',
);

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

    // Check if this is a forced password change (must_change_password=true)
    const authToken = req.cookies.get('auth-token')?.value;
    let mustChangePassword = false;
    
    if (authToken) {
      try {
        const verified = await jose.jwtVerify(authToken, JWT_SECRET);
        mustChangePassword = (verified.payload as any).must_change_password || false;
      } catch {
        // Ignore JWT verification errors
      }
    }

    // If NOT forced password change, verify current password
    if (!mustChangePassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required' },
          { status: 400 }
        );
      }

      const passwordMatch = await bcrypt.compare(currentPassword, currentUser.password_hash);
      if (!passwordMatch) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
      }
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update user
    await updateUser(user.userId, {
      password_hash: newPasswordHash,
      must_change_password: false,
    });

    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to change password';
    console.error('[change-password]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const POST = authenticatedRoute(handleChangePassword);
