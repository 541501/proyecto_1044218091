import { NextRequest, NextResponse } from 'next/server';
import * as bcrypt from 'bcryptjs';
import { changePasswordSchema } from '@/lib/schemas';
import { getUserById, updateUser } from '@/lib/dataService';
import { authenticatedRoute } from '@/lib/withAuth';
import { signJWT, createAuthCookie } from '@/lib/auth';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.ClassSport_SUPABASE_JWT_SECRET || 'test-secret',
);

async function handleChangePassword(req: NextRequest, user: any) {
  try {
    console.log('[change-password] Request from user:', user.userId);
    
    const body = await req.json();
    console.log('[change-password] Body keys:', Object.keys(body));

    // Validate input
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      console.error('[change-password] Validation failed:', parsed.error.errors);
      return NextResponse.json(
        { error: 'Invalid password format', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;
    console.log('[change-password] Parsed successfully, has currentPassword:', !!currentPassword);

    // Get current user
    const currentUser = await getUserById(user.userId);
    if (!currentUser) {
      console.log('[change-password] User not found:', user.userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if this is a forced password change (must_change_password=true)
    const authToken = req.cookies.get('auth-token')?.value;
    let mustChangePassword = false;
    
    if (authToken) {
      try {
        const verified = await jose.jwtVerify(authToken, JWT_SECRET);
        mustChangePassword = (verified.payload as any).must_change_password || false;
        console.log('[change-password] Must change password:', mustChangePassword);
      } catch (err) {
        console.log('[change-password] Could not verify token:', err instanceof Error ? err.message : 'unknown');
        // Ignore JWT verification errors
      }
    }

    // If NOT forced password change, verify current password
    if (!mustChangePassword) {
      console.log('[change-password] Verifying current password (not forced change)');
      
      if (!currentPassword) {
        console.log('[change-password] Current password not provided');
        return NextResponse.json(
          { error: 'Current password is required' },
          { status: 400 }
        );
      }

      const passwordMatch = await bcrypt.compare(currentPassword, currentUser.password_hash);
      if (!passwordMatch) {
        console.log('[change-password] Current password is incorrect');
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
      }
      console.log('[change-password] Current password verified');
    } else {
      console.log('[change-password] Skipping current password verification (forced change)');
    }

    // Hash new password
    console.log('[change-password] Hashing new password');
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update user
    console.log('[change-password] Updating user password and must_change_password flag');
    const updatedUser = await updateUser(user.userId, {
      password_hash: newPasswordHash,
      must_change_password: false,
    });

    console.log('[change-password] Password changed successfully for user:', user.userId);

    // Generate new JWT with updated must_change_password flag
    const newToken = await signJWT({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      must_change_password: false, // Now false since we just changed it
    });

    console.log('[change-password] Generated new JWT');

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Password changed successfully',
      user: updatedUser,
    });

    // Set new auth cookie with updated token using the built-in API
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('auth-token', newToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    // Add no-cache headers
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');

    console.log('[change-password] Auth cookie set successfully');
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to change password';
    console.error('[change-password] Error:', message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const POST = authenticatedRoute(handleChangePassword);
