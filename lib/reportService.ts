/**
 * Report Service — Generación de CSV de ocupación
 * 
 * Genera reportes de ocupación de salones en formato CSV.
 * Las columnas son exactas según el plan: Fecha, Bloque, Salón, Código, Franja, Profesor, Materia, Grupo, Estado
 */

export interface OccupancyReportRow {
  fecha: string;           // YYYY-MM-DD
  bloque: string;          // Nombre del bloque (ej: "Bloque A")
  salon: string;           // Nombre del salón
  codigo: string;          // Código del salón (ej: "A-101")
  franja: string;          // Nombre de la franja (ej: "07:00–09:00")
  profesor: string;        // Nombre del profesor
  materia: string;         // Nombre de la materia
  grupo: string;           // Nombre del grupo
  estado: string;          // Estado de la reserva (confirmada, cancelada)
}

/**
 * Genera un CSV como string a partir de un array de filas de ocupación.
 * 
 * Las columnas son:
 * Fecha, Bloque, Salón, Código, Franja, Profesor, Materia, Grupo, Estado
 * 
 * @param rows Array de datos de ocupación
 * @returns String con el contenido CSV (incluyendo headers)
 */
export function generateOccupancyCSV(rows: OccupancyReportRow[]): string {
  // Headers
  const headers = ['Fecha', 'Bloque', 'Salón', 'Código', 'Franja', 'Profesor', 'Materia', 'Grupo', 'Estado'];

  // Escapar comillas en campos de datos
  const escapeCSV = (value: string | undefined): string => {
    if (!value) return '';
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  // Convertir rows a lineas CSV
  const csvLines: string[] = [
    // Header
    headers.map(h => escapeCSV(h)).join(','),
    
    // Rows
    ...rows.map(row =>
      [
        escapeCSV(row.fecha),
        escapeCSV(row.bloque),
        escapeCSV(row.salon),
        escapeCSV(row.codigo),
        escapeCSV(row.franja),
        escapeCSV(row.profesor),
        escapeCSV(row.materia),
        escapeCSV(row.grupo),
        escapeCSV(row.estado)
      ].join(',')
    )
  ];

  // Retornar CSV con salto de línea al final
  return csvLines.join('\n') + '\n';
}
