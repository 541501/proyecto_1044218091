/**
 * lib/errorHandler.ts
 * Centraliza el manejo de errores HTTP globales
 */

import { useRouter } from 'next/navigation';

export interface ErrorDetails {
  status: number;
  message: string;
  title?: string;
  details?: string;
  conflictInfo?: {
    roomCode: string;
    slotName: string;
    date: string;
    professorName: string;
    subject: string;
  };
}

/**
 * Maneja errores API según status code
 * Retorna objeto con instrucciones para el frontend
 */
export async function handleApiError(
  response: Response,
  defaultMessage: string = 'Error al procesar la solicitud'
): Promise<ErrorDetails> {
  const status = response.status;

  try {
    const data = await response.json();

    // 401: Sesión expirada
    if (status === 401) {
      return {
        status: 401,
        message: 'Tu sesión ha expirado',
        title: 'Sesión Expirada',
        details: 'Por favor inicia sesión nuevamente'
      };
    }

    // 403: Sin permisos
    if (status === 403) {
      return {
        status: 403,
        message: 'No tienes permisos para esta acción.',
        title: 'Acceso Denegado'
      };
    }

    // 409: Conflicto
    if (status === 409) {
      // Verificar si es un conflicto de reserva con detalles
      if (data.conflict) {
        return {
          status: 409,
          message: `El salón ${data.conflict.roomCode} ya está reservado en ese horario por Prof. ${data.conflict.professorName} — ${data.conflict.subject}`,
          title: 'Conflicto de Reserva',
          conflictInfo: data.conflict
        };
      }

      // Otros conflictos 409 (reglas de negocio)
      return {
        status: 409,
        message: data.error || 'No se puede completar esta acción en este momento',
        title: 'Operación No Permitida'
      };
    }

    // 404: No encontrado
    if (status === 404) {
      return {
        status: 404,
        message: data.error || 'Recurso no encontrado',
        title: 'No Encontrado'
      };
    }

    // 400: Solicitud inválida
    if (status === 400) {
      return {
        status: 400,
        message: data.error || defaultMessage,
        title: 'Datos Inválidos'
      };
    }

    // 500+: Error del servidor
    return {
      status,
      message: 'Error al procesar la solicitud. Intenta nuevamente.',
      title: 'Error del Servidor'
    };
  } catch (e) {
    // Si no se puede parsear JSON, retornar mensaje genérico
    return {
      status,
      message: defaultMessage,
      title: 'Error'
    };
  }
}

/**
 * Hook para redirigir en caso de 401
 */
export function useAuthErrorHandler() {
  const router = useRouter();

  return {
    handleAuthError: (status: number) => {
      if (status === 401) {
        // Toast se maneja desde el componente que llama
        router.push('/login');
      }
    }
  };
}
