import { NextResponse, type NextRequest } from 'next/server';
import { readAppConfig } from '@/lib/dataService';
import type { AppConfig } from '@/lib/types';

/**
 * GET /api/config
 * Retorna la configuración global de la aplicación validada
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Leer y validar datos con Zod automáticamente
    const appConfig: AppConfig = readAppConfig();
    
    return NextResponse.json(
      {
        success: true,
        data: appConfig,
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
