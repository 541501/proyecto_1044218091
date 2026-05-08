/**
 * GET /api/rooms/[id]
 * PUT /api/rooms/[id] (admin only)
 * Retorna detalles de un salón o lo actualiza
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';
import { getRoomById, updateRoom } from '@/lib/dataService';
import { JWTPayload } from '@/lib/types';
import z from 'zod';

const UpdateRoomSchema = z.object({
  code: z.string().min(1).max(20).optional(),
  type: z.enum(['salon', 'laboratorio', 'auditorio', 'sala_computo', 'otro']).optional(),
  capacity: z.number().int().positive().optional(),
  equipment: z.string().optional(),
  is_active: z.boolean().optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const room = await getRoomById(params.id);

    if (!room) {
      return NextResponse.json(
        { error: 'Salón no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error('[GET /api/rooms/:id] Error:', error);
    return NextResponse.json(
      { error: 'Error fetching room' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withRole(['admin'])(async (req: NextRequest, user: JWTPayload) => {
    try {
      const body = await req.json();
      const validated = UpdateRoomSchema.parse(body);

      const room = await updateRoom(params.id, user.userId, validated);

      return NextResponse.json(room);
    } catch (error: any) {
      console.error('[PUT /api/rooms/:id] Error:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validación fallida', details: error.errors },
          { status: 400 }
        );
      }

      if (error.message?.includes('salón con este código')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Error updating room' },
        { status: 500 }
      );
    }
  })(request);
}
