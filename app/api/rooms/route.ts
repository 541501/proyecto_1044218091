/**
 * GET /api/rooms
 * POST /api/rooms (admin only)
 * Retorna lista de salones o crea uno nuevo
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';
import { getRooms, createRoom } from '@/lib/dataService';
import { JWTPayload } from '@/lib/types';
import z from 'zod';

const CreateRoomSchema = z.object({
  block_id: z.string().uuid(),
  code: z.string().min(1).max(20),
  type: z.enum(['salon', 'laboratorio', 'auditorio', 'sala_computo', 'otro']),
  capacity: z.number().int().positive(),
  equipment: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const blockId = searchParams.get('blockId');
    
    const rooms = await getRooms({
      blockId: blockId || undefined,
      isActive: true
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error('[GET /api/rooms] Error:', error);
    return NextResponse.json(
      { error: 'Error fetching rooms' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return withRole(['admin'])(async (req: NextRequest, user: JWTPayload) => {
    try {
      const body = await req.json();
      const validated = CreateRoomSchema.parse(body);

      const room = await createRoom(user.userId, validated);

      return NextResponse.json(room, { status: 201 });
    } catch (error: unknown) {
      console.error('[POST /api/rooms] Error:', error);
      
      const err = error as Record<string, unknown>;
      if (err.code === 'DUPLICATE_ROOM_CODE') {
        return NextResponse.json(
          { error: 'Ya existe un salón con este código en el bloque' },
          { status: 409 }
        );
      }

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validación fallida', details: error.errors },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Error creating room' },
        { status: 500 }
      );
    }
  })(request);
}
