/**
 * GET /api/users/[id] → Obtiene usuario por ID (admin only)
 * PUT /api/users/[id] → Actualiza usuario (admin only)
 * DELETE /api/users/[id] → Elimina usuario (admin only)
 * 
 * Acceso: admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/withRole';
import * as dataService from '@/lib/dataService';
import { updateUserSchema } from '@/lib/schemas';

export const GET = withRole(['admin'])(async (request: NextRequest, user, { id }) => {
  try {
    const userData = await dataService.getUserById(id);

    if (!userData) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(userData, { status: 200 });
  } catch (error: unknown) {
    console.error('[GET /api/users/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener el usuario' },
      { status: 500 }
    );
  }
});

export const PUT = withRole(['admin'])(async (request: NextRequest, user, { id }) => {
  try {
    const body = await request.json();

    // Validate with Zod schema
    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      );
    }

    const userData = await dataService.updateUser(id, validation.data);

    return NextResponse.json(userData, { status: 200 });
  } catch (error: unknown) {
    console.error('[PUT /api/users/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el usuario' },
      { status: 500 }
    );
  }
});

export const DELETE = withRole(['admin'])(async (request: NextRequest, user, { id }) => {
  try {
    await dataService.deleteUser(id);
    return NextResponse.json({ message: 'Usuario desactivado exitosamente' }, { status: 200 });
  } catch (error: unknown) {
    console.error('[DELETE /api/users/[id]] Error:', error);
    
    return NextResponse.json(
      { error: 'Error al desactivar el usuario' },
      { status: 500 }
    );
  }
});
