import { NextResponse, type NextRequest } from 'next/server';
import { readHomeData } from '@/lib/dataService';
import type { HomeData } from '@/lib/types';

/**
 * GET /api/data
 * Retorna los datos de la página Home validados
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Leer y validar datos con Zod automáticamente
    const homeData: HomeData = readHomeData();
    
    return NextResponse.json(
      {
        success: true,
        data: homeData,
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
