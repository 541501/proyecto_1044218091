import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import {
  getReservations,
  getMyReservations,
  getBlocks,
  getRooms,
} from '@/lib/dataService';
import { JWTPayload } from '@/lib/types';

function isoDateOnly(d: Date): string {
  return d.toISOString().split('T')[0];
}

export async function GET(req: NextRequest) {
  return withAuth(req, async (_req: NextRequest, user: JWTPayload) => {
    try {
      const today = new Date();
      const todayStr = isoDateOnly(today);
      const inSeven = new Date(today);
      inSeven.setDate(today.getDate() + 7);
      const inSevenStr = isoDateOnly(inSeven);

      if (user.role === 'profesor') {
        const mine = await getMyReservations(user.userId, {
          status: 'confirmada',
          from: todayStr,
          to: inSevenStr,
        });
        const todayRes = mine
          .filter((r) => r.reservation_date === todayStr)
          .map((r: any) => ({
            id: r.id,
            subject: r.subject,
            roomCode: r.room?.code,
            slotTime: r.slot?.name,
            date: r.reservation_date,
          }));
        const upcoming = mine
          .filter((r) => r.reservation_date > todayStr)
          .slice(0, 6)
          .map((r: any) => ({
            id: r.id,
            subject: r.subject,
            roomCode: r.room?.code,
            slotTime: r.slot?.name,
            date: r.reservation_date,
          }));

        const activeCount = mine.length;

        return NextResponse.json({
          role: 'profesor',
          data: {
            todayReservations: todayRes,
            upcomingReservations: upcoming,
            activeReservationsCount: activeCount,
          },
        });
      }

      // Coordinador / admin → ocupación de hoy por bloque
      const [blocks, todays] = await Promise.all([
        getBlocks(),
        getReservations({ date: todayStr, status: 'confirmada' }),
      ]);

      // Para cada bloque: total de salones activos, ocupados hoy = #reservas que caen en algún room del bloque
      const occupancyPromises = blocks.map(async (b) => {
        const rooms = await getRooms({ blockId: b.id, isActive: true });
        const roomIds = new Set(rooms.map((r) => r.id));
        const occupied = todays.filter((r: any) => roomIds.has(r.room_id ?? r.room?.id)).length;
        return {
          id: b.id,
          name: b.code, // letra A/B/C
          total: rooms.length,
          occupied,
        };
      });
      const blockOccupancy = await Promise.all(occupancyPromises);

      return NextResponse.json({
        role: user.role,
        data: {
          blockOccupancy,
          totalActiveReservations: todays.length,
        },
      });
    } catch (err) {
      console.error('[dashboard]', err);
      return NextResponse.json(
        {
          role: user.role,
          data:
            user.role === 'profesor'
              ? { todayReservations: [], upcomingReservations: [], activeReservationsCount: 0 }
              : { blockOccupancy: [], totalActiveReservations: 0 },
        },
        { status: 200 },
      );
    }
  });
}
