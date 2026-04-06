# 📁 Capa de Datos — JSON como Base de Datos

## Propósito

Esta carpeta contiene archivos **JSON estructurados** que actúan como la fuente de verdad de datos para la aplicación. En lugar de depender de una base de datos convencional, utilizamos **archivos JSON** que son:

- **Versionables** en Git
- **Legibles** y fáciles de mantener
- **Tipados** con TypeScript y validados con Zod
- **Seguros**: nunca accesibles directamente desde el cliente

## ⚠️ Regla de Acceso — Crítico

Los archivos JSON en esta carpeta **NUNCA** deben ser:
- Expuestos directamente al navegador
- Accedidos desde Client Components
- Incluidos en rutas que devuelvan JSON sin validación

Toda lectura de JSON ocurre **exclusivamente** en:
- **Server Components** (`app/page.tsx`, etc.)
- **Route Handlers** (`app/api/*/route.ts`)
- **Servicios backend** (`lib/dataService.ts`)

## 📄 Archivos de Datos

### `config.json`
Configuración global de la aplicación. Cargada una sola vez durante el build.

**Estructura:**
```json
{
  "appName": "Mi App TypeScript",
  "version": "1.0.0",
  "locale": "es-CO",
  "theme": "dark"
}
```

**Uso:**
```typescript
import { readJsonFile } from '@/lib/dataService';
const config = readJsonFile('config.json');
```

---

### `home.json`
Contenido de la página Home, incluyendo el mensaje "Hola Mundo" y metadatos.

**Estructura:**
```json
{
  "hero": {
    "title": "Hola Mundo",
    "subtitle": "TypeScript + Next.js + Vercel",
    "description": "Sistema fullstack funcionando correctamente.",
    "animationStyle": "typewriter"
  },
  "meta": {
    "pageTitle": "Home | Mi App",
    "description": "Página principal del sistema"
  }
}
```

**Uso:**
```typescript
const homeData = readJsonFile<HomeData>('home.json');
```

---

## 🔄 Cómo Agregar Nuevos Archivos JSON

1. **Crear el archivo** en `/data/mi-archivo.json` con estructura bien formada
2. **Definir la interfaz TypeScript** en `/lib/types.ts`
3. **Crear el schema Zod** en `/lib/validators.ts`
4. **Usar en Server Component o Route Handler** con validación

Ejemplo:
```typescript
// 1. types.ts
export interface MyData {
  items: string[];
}

// 2. validators.ts
export const MyDataSchema = z.object({
  items: z.array(z.string()),
});

// 3. En tu Server Component
const data = readJsonFile<MyData>('mi-archivo.json');
const validated = MyDataSchema.parse(data);
```

---

## 📊 Restricciones y Límites

| Aspecto | Límite/Pauta |
|--------|-------------|
| Tamaño máximo por archivo | 1MB (recomendado < 100KB) |
| Formato | JSON válido, sin comentarios |
| Codificación | UTF-8 |
| Acceso | Solo Server-side (Node.js) |
| Validación | Obligatoria con Zod |

---

## 🚀 Despliegue en Vercel

Los archivos JSON se incluyen automáticamente en el bundle de Vercel durante el build (`npm run build`). No requieren configuración adicional.

---

*Documentación v1.0 — Actualizar conforme se agreguen nuevos datos*
