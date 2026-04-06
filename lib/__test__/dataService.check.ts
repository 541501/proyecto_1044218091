// Archivo temporal para validar tipado estático
import { readJsonFile } from '../dataService';

// Simulación de lectura para validar tipos
const configData = readJsonFile('config.json');
const homeData = readJsonFile('home.json');

// Verificación de tipos (no se ejecuta, solo tipado)
console.log(configData.appName);
console.log(homeData.hero.title);