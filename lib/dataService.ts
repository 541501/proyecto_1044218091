import fs from 'fs';
import path from 'path';
import { HomeDataSchema, AppConfigSchema } from './validators';
import type { HomeData, AppConfig } from './types';

// Tipo genérico para lectura de cualquier JSON
export function readJsonFile<T>(filename: string): T {
  const filePath = path.join(process.cwd(), 'data', filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

// Función tipada para leer datos del home
export function readHomeData(): HomeData {
  const rawData = readJsonFile('home.json');
  return HomeDataSchema.parse(rawData);
}

// Función tipada para leer configuración de la app
export function readAppConfig(): AppConfig {
  const rawData = readJsonFile('config.json');
  return AppConfigSchema.parse(rawData);
}