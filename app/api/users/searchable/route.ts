/**
 * GET /api/users/searchable
 * Retorna lista de docentes y administradores activos (para autocompletar @mention)
 * Acceso: público (autenticado)
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticatedRoute } from '@/lib/withAuth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { JWTPayload } from '@/lib/types';

export const GET = authenticatedRoute(async (req: NextRequest, user: JWTPayload) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Obtener todos los usuarios activos con roles profesor, coordinador, escuela o admin
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('is_active', true)
      .in('role', ['profesor', 'coordinador', 'esc_psicologia', 'esc_derecho', 'esc_ciencias', 'admin'])
      .order('name', { ascending: true });

    if (error) {
      console.error('[GET /api/users/searchable] Error:', error);
      return NextResponse.json(
        { error: 'Error al obtener usuarios' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('[GET /api/users/searchable] Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
});
