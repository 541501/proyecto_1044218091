/**
 * GET /api/audit?month=YYYYMM
 * 
 * Obtiene la auditoría del mes especificado.
 * Acceso: admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/withRole';
import * as dataService from '@/lib/dataService';

async function handler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    if (!month || !/^\d{6}$/.test(month)) {
      return NextResponse.json(
        { error: 'El parámetro "month" es requerido en formato YYYYMM' },
        { status: 400 }
      );
    }

    const entries = await dataService.readAuditMonth(month);

    return NextResponse.json(entries, { status: 200 });
  } catch (error: unknown) {
    console.error('[GET /api/audit] Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener la auditoría' },
      { status: 500 }
    );
  }
}

export const GET = withRole(['admin'])(handler);
