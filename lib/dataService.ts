import fs from 'fs';
import path from 'path';
import { HomeDataSchema, AppConfigSchema } from './validators';
import type { HomeData, AppConfig } from './types';

/**
 * Función genérica para lectura de archivos JSON
 * @param filename - Nombre del archivo en la carpeta /data
 * @returns Contenido del archivo parseado como tipo T
 */
export function readJsonFile<T>(filename: string): T {
  const filePath = path.join(process.cwd(), 'data', filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

/**
 * Lee y valida config.json
 * Garantiza que los datos cumplen con AppConfig
 * @returns Datos de configuración validados
 * @throws ZodError si la validación falla
 */
export function readAppConfig(): AppConfig {
  const rawData = readJsonFile<AppConfig>('config.json');
  return AppConfigSchema.parse(rawData);
}

/**
 * Lee y valida home.json
 * Garantiza que los datos cumplen con HomeData
 * @returns Datos de página Home validados
 * @throws ZodError si la validación falla
 */
export function readHomeData(): HomeData {
  const rawData = readJsonFile<HomeData>('home.json');
  return HomeDataSchema.parse(rawData);
}
