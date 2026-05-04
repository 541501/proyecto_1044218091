import { NextRequest, NextResponse } from 'next/server';
import * as bcrypt from 'bcryptjs';
import { loginSchema } from '@/lib/schemas';
import { getUserByEmail, toSafeUser, recordAudit } from '@/lib/dataService';
import { signJWT, createAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { email, password } = parsed.data;

    // Get user by email
    const user = await getUserByEmail(email);
    if (!user) {
      // Generic error message (never reveal whether email exists)
      return NextResponse.json({ error: 'Correo o contraseña incorrectos' }, { status: 401 });
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'La cuenta ha sido desactivada. Contacta al administrador.' },
        { status: 403 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Correo o contraseña incorrectos' }, { status: 401 });
    }

    // Create JWT
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      must_change_password: user.must_change_password,
    });

    // Record audit
    try {
      await recordAudit({
        user_id: user.id,
        user_email: user.email,
        user_role: user.role,
        action: 'login',
        entity: 'user',
        entity_id: user.id,
        summary: `${user.name} inició sesión`,
      });
    } catch (auditErr) {
      console.warn('[login] Audit recording failed:', auditErr);
    }

    // Create response
    const response = NextResponse.json({
      user: toSafeUser(user),
      token,
    });

    // Set auth cookie
    const isProduction = process.env.NODE_ENV === 'production';
    response.headers.set('Set-Cookie', createAuthCookie(token, isProduction));

    // Add no-cache headers
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed';
    console.error('[login]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
