# Capa de Datos — JSON como Base de Datos

Esta carpeta `/data` actúa como la **capa de persistencia plana** del sistema, utilizando archivos JSON estructurados como fuente de verdad en lugar de una base de datos convencional.

## Filosofía de Diseño

- **Server-only access**: Los archivos JSON **nunca** se exponen directamente al cliente. Toda lectura ocurre exclusivamente en Server Components o Route Handlers de Next.js.
- **File system as DB**: Se utiliza el módulo `fs` de Node.js para leer archivos en tiempo de servidor.
- **Validation mandatory**: Todo JSON leído debe pasar por un schema Zod antes de ser utilizado.
- **One file per domain**: Cada entidad conceptual del negocio tiene su propio archivo JSON.

## Archivos JSON Actuales

### `config.json`
Contiene la configuración global de la aplicación:
- `appName`: Nombre de la aplicación
- `version`: Versión actual
- `locale`: Configuración regional
- `theme`: Tema visual (light/dark)

### `home.json`
Contiene el contenido de la página principal (Home):
- `hero`: Sección principal con título, subtítulo y descripción
- `meta`: Metadatos de SEO para la página

## Reglas de Acceso

1. **Nunca importar JSON directamente en componentes cliente** — esto expondría los datos al bundle del navegador.
2. **Siempre leer desde Server Components** o **Route Handlers**.
3. **Validar con Zod** antes de usar cualquier dato del JSON.
4. **Usar funciones tipadas** del servicio de datos (`lib/dataService.ts`).

## Agregando Nuevos Archivos JSON

Para agregar una nueva entidad de datos:

1. Crear el archivo JSON en `/data/nueva-entidad.json` con la estructura deseada.
2. Definir la interfaz TypeScript correspondiente en `/lib/types.ts`.
3. Crear el schema Zod en `/lib/validators.ts`.
4. Agregar función lectora tipada en `/lib/dataService.ts` (ej: `readNuevaEntidad()`).
5. Usar la función en Server Components o Route Handlers.

## Ejemplo de Uso Correcto

```typescript
// ❌ MAL — acceso directo (expone datos al cliente)
import homeData from '@/data/home.json';

// ✅ BIEN — lectura en servidor con validación
const rawData = readJsonFile<HomeData>('home.json');
const validatedData = HomeDataSchema.parse(rawData);
```

## Seguridad

- Los archivos JSON no contienen información sensible.
- Toda la lógica de acceso está centralizada en `lib/dataService.ts`.
- Los datos se validan en runtime con Zod para prevenir corrupciones.

## Estructura JSON Generada

- `/data/config.json`: Configuración global
- `/data/home.json`: Contenido de la página Home