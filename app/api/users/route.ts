/**
 * GET /api/users → Lista todos los usuarios (admin only)
 * POST /api/users → Crea nuevo usuario con contraseña temporal (admin only)
 * 
 * Acceso: admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/withRole';
import * as dataService from '@/lib/dataService';
import { createUserSchema } from '@/lib/schemas';

async function handler(request: NextRequest) {
  if (request.method === 'GET') {
    try {
      const users = await dataService.listUsers();
      return NextResponse.json(users, { status: 200 });
    } catch (error: unknown) {
      console.error('[GET /api/users] Error:', error);
      return NextResponse.json(
        { error: 'Error al obtener usuarios' },
        { status: 500 }
      );
    }
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();

      // Validate with Zod schema
      const validation = createUserSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Datos inválidos', details: validation.error.errors },
          { status: 400 }
        );
      }

      const { name, email, role } = validation.data;

      // Generate temporary password (12 random characters)
      const tempPassword = Array.from(
        require('crypto').randomBytes(12),
        (byte: number) => byte.toString(36)
      )
        .join('')
        .substring(0, 12);

      // Create user (password will be hashed in dataService)
      const user = await dataService.createUser({
        name,
        email,
        temporaryPassword: tempPassword,
        role
      });

      // Retorn user info WITH the temporary password
      // This should be shown only once in a modal
      return NextResponse.json(
        {
          user,
          temporaryPassword: tempPassword,
          message: 'Usuario creado. Muestra la contraseña temporal una sola vez.'
        },
        { status: 201 }
      );
    } catch (error: unknown) {
      console.error('[POST /api/users] Error:', error);

      const err = error as Record<string, unknown>;

      // Handle duplicate email
      if (err.code === 'UNIQUE_VIOLATION' || String(err.message).includes('unique')) {
        return NextResponse.json(
          { error: 'El email ya está registrado' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Error al crear el usuario' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  );
}

export const GET = withRole(['admin'])(handler);
export const POST = withRole(['admin'])(handler);
