/**
 * GET /api/rooms/[id]/calendar
 * Retorna el calendario semanal de un salón
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildWeeklyCalendar } from '@/lib/availabilityService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let weekStart = searchParams.get('weekStart');

    if (!weekStart) {
      // Si no se proporciona, calcular el lunes de esta semana
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));
      weekStart = monday.toISOString().split('T')[0];
    }

    const calendar = await buildWeeklyCalendar(params.id, weekStart);

    return NextResponse.json(calendar);
  } catch (error) {
    console.error('[GET /api/rooms/:id/calendar] Error:', error);
    return NextResponse.json(
      { error: 'Error fetching calendar' },
      { status: 500 }
    );
  }
}
