/**
 * GET /api/users/[id] → Obtiene usuario por ID (admin only)
 * PUT /api/users/[id] → Actualiza usuario (admin only)
 * 
 * Acceso: admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/withRole';
import * as dataService from '@/lib/dataService';
import { updateUserSchema } from '@/lib/schemas';

async function handler(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  if (request.method === 'GET') {
    try {
      const user = await dataService.getUserById(id);

      if (!user) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json(user, { status: 200 });
    } catch (error: any) {
      console.error('[GET /api/users/[id]] Error:', error);
      return NextResponse.json(
        { error: 'Error al obtener el usuario' },
        { status: 500 }
      );
    }
  }

  if (request.method === 'PUT') {
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

      const user = await dataService.updateUser(id, validation.data);

      return NextResponse.json(user, { status: 200 });
    } catch (error: any) {
      console.error('[PUT /api/users/[id]] Error:', error);
      return NextResponse.json(
        { error: 'Error al actualizar el usuario' },
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
export const PUT = withRole(['admin'])(handler);
