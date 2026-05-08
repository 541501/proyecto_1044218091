/**
 * GET /api/slots
 * Retorna lista de franjas horarias
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSlots } from '@/lib/dataService';

export async function GET(request: NextRequest) {
  try {
    const slots = await getSlots();
    return NextResponse.json(slots);
  } catch (error) {
    console.error('[GET /api/slots] Error:', error);
    return NextResponse.json(
      { error: 'Error fetching slots' },
      { status: 500 }
    );
  }
}
