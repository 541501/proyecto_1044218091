/**
 * GET /api/audit?month=YYYYMM&entity=&operation=&userId=&limit=
 *
 * Lee del audit_log de Postgres.
 * Acceso: admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/withRole';
import * as dataService from '@/lib/dataService';

function monthRange(yyyymm: string): { from: string; to: string } | null {
  if (!/^\d{6}$/.test(yyyymm)) return null;
  const year = Number(yyyymm.slice(0, 4));
  const month = Number(yyyymm.slice(4, 6));
  if (month < 1 || month > 12) return null;
  const from = new Date(Date.UTC(year, month - 1, 1)).toISOString();
  const to = new Date(Date.UTC(year, month, 1)).toISOString();
  return { from, to };
}

async function handler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const entity = searchParams.get('entity') as 'reservation' | 'room' | 'user' | null;
    const operation = searchParams.get('operation') as 'INSERT' | 'UPDATE' | 'DELETE' | null;
    const userId = searchParams.get('userId');
    const limit = searchParams.get('limit');

    const filters: Record<string, any> = {};
    if (month) {
      const range = monthRange(month);
      if (!range) {
        return NextResponse.json(
          { error: 'El parámetro "month" debe estar en formato YYYYMM' },
          { status: 400 },
        );
      }
      filters.from = range.from;
      filters.to = range.to;
    }
    if (entity) filters.entity = entity;
    if (operation) filters.operation = operation;
    if (userId) filters.userId = userId;
    if (limit) filters.limit = Math.min(1000, Math.max(1, Number(limit) || 200));

    const entries = await dataService.listAudit(filters);
    return NextResponse.json(entries, { status: 200 });
  } catch (error: unknown) {
    console.error('[GET /api/audit] Error:', error);
    return NextResponse.json({ error: 'Error al obtener la auditoría' }, { status: 500 });
  }
}

export const GET = withRole(['admin'])(handler);
