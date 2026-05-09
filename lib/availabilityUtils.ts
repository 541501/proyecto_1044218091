/**
 * lib/availabilityUtils.ts
 * 
 * Funciones puras de disponibilidad (sin dependencias de servidor)
 * Pueden ser importadas desde componentes cliente
 */

import { BlockAvailability } from './types';

/**
 * Obtiene el color de borde de una tarjeta de bloque según disponibilidad
 */
export function getBlockCardBorderColor(availability: BlockAvailability): string {
  const percentage = availability.availabilityPercentage;
  
  if (percentage === 0) return 'border-red-500';      // Todo ocupado
  if (percentage <= 33) return 'border-amber-500';    // Pocos libres
  return 'border-green-500';                           // Hay libres
}
