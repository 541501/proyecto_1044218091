/**
 * GET /api/reports/occupancy
 * 
 * Query parameters:
 * - from: YYYY-MM-DD (fecha inicio)
 * - to: YYYY-MM-DD (fecha fin)
 * - blockId: UUID (opcional, filtrar por bloque)
 * - format: 'json' | 'csv' (default: json)
 * 
 * Acceso: coordinador, admin
 * 
 * Retorna:
 * - JSON: Array de OccupancyReportRow
 * - CSV: String CSV con headers de descarga
 * - 404: Sin datos en el período
 * - 400: Parámetros inválidos
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/withRole';
import * as dataService from '@/lib/dataService';
import { generateOccupancyCSV } from '@/lib/reportService';

async function handler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const blockId = searchParams.get('blockId') || undefined;
    const format = searchParams.get('format') || 'json';

    // Validate required parameters
    if (!from || !to) {
      return NextResponse.json(
        { error: 'Los parámetros "from" y "to" son requeridos (formato YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    // Validate date format (simple check)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(from) || !dateRegex.test(to)) {
      return NextResponse.json(
        { error: 'Las fechas deben estar en formato YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Get occupancy report
    const rows = await dataService.getOccupancyReport(from, to, blockId);

    // If no data, return 404
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'No hay datos disponibles para el período solicitado' },
        { status: 404 }
      );
    }

    // Handle format
    if (format === 'csv') {
      const csv = generateOccupancyCSV(rows);
      const filename = `reporte-ocupacion-${from}-${to}.csv`;

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv;charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    }

    // Default: JSON format
    return NextResponse.json(rows, { status: 200 });
  } catch (error: unknown) {
    console.error('[GET /api/reports/occupancy] Error:', error);
    return NextResponse.json(
      { error: 'Error al generar el reporte' },
      { status: 500 }
    );
  }
}

// Apply role-based access control
export const GET = withRole(['coordinador', 'escuela_psicologia', 'escuela_derecho', 'escuela_ciencias', 'admin'])(handler);
