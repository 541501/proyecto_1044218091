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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withRole(['admin'])(async (req: NextRequest) => {
    try {
      const user = await dataService.getUserById(id);

      if (!user) {
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json(user, { status: 200 });
    } catch (error: unknown) {
      console.error('[GET /api/users/[id]] Error:', error);
      return NextResponse.json(
        { error: 'Error al obtener el usuario' },
        { status: 500 }
      );
    }
  })(request);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withRole(['admin'])(async (req: NextRequest) => {
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
    } catch (error: unknown) {
      console.error('[PUT /api/users/[id]] Error:', error);
      return NextResponse.json(
        { error: 'Error al actualizar el usuario' },
        { status: 500 }
      );
    }
  })(request);
}
