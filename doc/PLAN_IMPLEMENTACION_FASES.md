# 🚀 Plan de Implementación por Fases
## Fullstack TypeScript · Next.js · GitHub · Vercel · JSON Data Layer

> **Versión:** 1.0  
> **Fecha:** Marzo 2026  
> **Referencia:** Plan de Infraestructura Fullstack TypeScript v1.0  
> **Duración estimada total:** 8 días hábiles  
> **Metodología:** Entrega incremental — cada fase produce un artefacto funcional y verificable

---

## Resumen Ejecutivo de Fases

| Fase | Nombre | Duración | Entregable principal | Estado |
|:---:|---|:---:|---|:---:|
| 0 | Preparación del entorno | Día 0 | Entorno local listo | ⬜ Pendiente |
| 1 | Fundación del proyecto | Días 1–2 | Repositorio inicializado + estructura base | ⬜ Pendiente |
| 2 | Capa de datos JSON | Día 3 | Data layer tipado y funcional | ⬜ Pendiente |
| 3 | Home "Hola Mundo" | Días 4–5 | Home con efecto shimmer validado localmente | ⬜ Pendiente |
| 4 | CI/CD y Pipeline | Día 6 | GitHub Actions + Vercel conectados | ⬜ Pendiente |
| 5 | Deploy y Validación | Días 7–8 | Sistema en producción verificado end-to-end | ⬜ Pendiente |

---

## Diagrama de Flujo General

```
FASE 0              FASE 1              FASE 2              FASE 3
Preparación  ──▶   Fundación    ──▶   Data Layer   ──▶   Home UI
Entorno local      Repo + Config       JSON + Tipos        Shimmer effect
                                                               │
                                                               ▼
                                                    FASE 4            FASE 5
                                                  CI/CD        ──▶   Deploy
                                                  GitHub Actions      Vercel
                                                  Workflows           Validación
```

---

---

# FASE 0 — Preparación del Entorno

> **Duración:** Día 0 (previo al inicio)  
> **Objetivo:** Garantizar que el entorno local tiene todas las herramientas necesarias antes de escribir una sola línea de código del proyecto.  
> **Entregable:** Checklist de entorno completado ✅

---

## 0.1 Herramientas requeridas

### Node.js 20 LTS

```bash
# Verificar versión instalada
node --version
# Resultado esperado: v20.x.x

# Si no está instalado, usar nvm:
nvm install 20
nvm use 20
nvm alias default 20
```

### pnpm 9.x

```bash
# Instalar pnpm globalmente
npm install -g pnpm@9

# Verificar
pnpm --version
# Resultado esperado: 9.x.x
```

### Git

```bash
# Verificar
git --version
# Resultado esperado: git version 2.x.x

# Configurar identidad (si no está configurada)
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

### Editor recomendado — VS Code

Extensiones obligatorias para este proyecto:

| Extensión | ID | Propósito |
|---|---|---|
| TypeScript Language Features | (incluida en VS Code) | Soporte TypeScript nativo |
| ESLint | `dbaeumer.vscode-eslint` | Linting en tiempo real |
| Tailwind CSS IntelliSense | `bradlc.vscode-tailwindcss` | Autocompletado de clases |
| Prettier | `esbenp.prettier-vscode` | Formateo automático |
| GitLens | `eamodio.gitlens` | Historial Git inline |
| Error Lens | `usernamehero.errorlens` | Errores de TS inline |

## 0.2 Cuentas y accesos requeridos

- [ ] Cuenta en **GitHub** activa con repositorio nuevo creado (vacío, sin README)
- [ ] Cuenta en **Vercel** activa y vinculada con la cuenta GitHub
- [ ] Acceso a **GitHub Actions** habilitado en el repositorio (activo por defecto)

## 0.3 Configuración de VS Code para TypeScript estricto

Crear o verificar el archivo `.vscode/settings.json` en el proyecto:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.strictNullChecks": true
}
```

## 0.4 Criterios de salida de Fase 0

- [ ] `node --version` retorna `v20.x.x`
- [ ] `pnpm --version` retorna `9.x.x`
- [ ] `git --version` retorna resultado válido
- [ ] Repositorio GitHub creado y vacío
- [ ] Cuenta Vercel activa y vinculada a GitHub

---

---

# FASE 1 — Fundación del Proyecto

> **Duración:** Días 1–2  
> **Objetivo:** Crear el proyecto Next.js con TypeScript, configurarlo correctamente y establecer la estructura de carpetas definitiva del sistema.  
> **Entregable:** Repositorio GitHub con proyecto Next.js inicializado, TypeScript configurado en modo estricto y estructura de carpetas creada.

---

## 1.1 Crear el proyecto Next.js

```bash
# Crear el proyecto usando el CLI oficial de Next.js
pnpm create next-app@latest nombre-de-tu-proyecto \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

# Ingresar al directorio
cd nombre-de-tu-proyecto
```

> ⚠️ **Importante:** Responder `No` a la pregunta sobre ESLint durante el wizard — lo configuraremos manualmente para mayor control.

## 1.2 Instalar dependencias adicionales

```bash
# Dependencias de producción
pnpm add zod framer-motion

# Dependencias de desarrollo
pnpm add -D \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint-config-next \
  eslint-plugin-react \
  prettier \
  prettier-plugin-tailwindcss
```

### Tabla de dependencias

| Paquete | Tipo | Propósito |
|---|---|---|
| `zod` | Producción | Validación de esquemas JSON en runtime |
| `framer-motion` | Producción | Animaciones declarativas en React |
| `@typescript-eslint/*` | Desarrollo | Reglas ESLint específicas de TypeScript |
| `prettier-plugin-tailwindcss` | Desarrollo | Ordenamiento automático de clases Tailwind |

## 1.3 Configurar TypeScript — `tsconfig.json`

Reemplazar el `tsconfig.json` generado por el siguiente:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"],
      "@data/*": ["./data/*"],
      "@lib/*": ["./lib/*"],
      "@components/*": ["./components/*"],
      "@types/*": ["./lib/types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

> **Flags clave activados:**
> - `strict: true` — habilita todos los chequeos estrictos de TypeScript
> - `noUnusedLocals` y `noUnusedParameters` — prohibe variables y parámetros sin uso
> - `noImplicitReturns` — todas las rutas de código deben retornar un valor
> - `allowJs: false` — cero archivos JavaScript, todo es TypeScript

## 1.4 Configurar ESLint — `.eslintrc.json`

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-floating-promises": "error",
    "prefer-const": "error"
  }
}
```

## 1.5 Configurar Prettier — `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

## 1.6 Configurar scripts — `package.json`

Asegurarse de que el bloque `scripts` contenga:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:strict": "eslint . --ext .ts,.tsx --max-warnings 0",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "validate": "pnpm typecheck && pnpm lint:strict && pnpm build"
  }
}
```

> `pnpm validate` es el comando de verificación completa antes de cualquier push.

## 1.7 Crear la estructura de carpetas

```bash
# Crear todas las carpetas del proyecto
mkdir -p \
  data/pages \
  data/schema \
  lib/types \
  components/ui \
  components/layout \
  .github/workflows \
  .vscode

# Crear archivos vacíos placeholder
touch \
  lib/dataReader.ts \
  lib/dataWriter.ts \
  lib/types/index.ts \
  components/ui/HeroText.tsx \
  components/layout/RootLayout.tsx \
  data/config.json \
  data/pages/home.json \
  .env.local \
  .env.example
```

## 1.8 Configurar `next.config.ts`

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
```

## 1.9 Inicializar Git y conectar con GitHub

```bash
# Inicializar git (si no fue creado con git)
git init

# Agregar remote apuntando al repositorio GitHub vacío
git remote add origin https://github.com/tu-usuario/tu-repo.git

# Primer commit con la estructura base
git add .
git commit -m "feat: inicializar proyecto Next.js con TypeScript estricto"

# Push a main
git branch -M main
git push -u origin main
```

## 1.10 Criterios de salida de Fase 1

- [ ] `pnpm dev` levanta el servidor en `localhost:3000` sin errores
- [ ] `pnpm typecheck` retorna sin errores
- [ ] `pnpm lint` retorna sin errores
- [ ] Estructura de carpetas creada correctamente
- [ ] Repositorio GitHub tiene el primer commit visible
- [ ] `tsconfig.json` tiene `strict: true` y `allowJs: false`

---

---

# FASE 2 — Capa de Datos JSON

> **Duración:** Día 3  
> **Objetivo:** Implementar la pseudo-base de datos con archivos JSON, definir los tipos TypeScript para cada entidad de datos y crear la capa de lectura tipada.  
> **Entregable:** Módulo `lib/dataReader.ts` funcional, archivos JSON creados con su estructura definitiva y tipos TypeScript validados.

---

## 2.1 Crear los archivos JSON base

### `data/config.json`

```json
{
  "siteName": "Mi App TS",
  "version": "1.0.0",
  "theme": "dark",
  "locale": "es-CO",
  "features": {
    "animations": true,
    "darkMode": true
  }
}
```

### `data/pages/home.json`

```json
{
  "id": "home",
  "hero": {
    "headline": "Hola Mundo",
    "subtext": "TypeScript está funcionando. Pipeline validado.",
    "effect": "shimmer"
  },
  "meta": {
    "title": "Home | Mi App TS",
    "description": "Primer hito de validación del stack TypeScript fullstack"
  },
  "updatedAt": "2026-03-27T00:00:00Z"
}
```

## 2.2 Definir los tipos TypeScript — `lib/types/index.ts`

```typescript
// ============================================================
// Tipos globales del sistema
// ============================================================

// Config global del sitio
export interface SiteConfig {
  siteName: string;
  version: string;
  theme: 'dark' | 'light';
  locale: string;
  features: {
    animations: boolean;
    darkMode: boolean;
  };
}

// Datos de la página Home
export interface HomePageData {
  id: string;
  hero: HeroSection;
  meta: PageMeta;
  updatedAt: string;
}

export interface HeroSection {
  headline: string;
  subtext: string;
  effect: 'shimmer' | 'fade' | 'slide';
}

export interface PageMeta {
  title: string;
  description: string;
}

// Tipo utilitario para respuestas de la API
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  timestamp: string;
  error?: string;
}
```

## 2.3 Crear esquemas de validación Zod — `data/schema/home.schema.ts`

```typescript
import { z } from 'zod';

export const HeroSectionSchema = z.object({
  headline: z.string().min(1, 'El headline no puede estar vacío'),
  subtext: z.string().min(1, 'El subtext no puede estar vacío'),
  effect: z.enum(['shimmer', 'fade', 'slide']),
});

export const PageMetaSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(10),
});

export const HomePageDataSchema = z.object({
  id: z.literal('home'),
  hero: HeroSectionSchema,
  meta: PageMetaSchema,
  updatedAt: z.string().datetime(),
});

// Tipo inferido desde el esquema Zod (single source of truth)
export type HomePageDataFromSchema = z.infer<typeof HomePageDataSchema>;
```

## 2.4 Implementar la capa de lectura — `lib/dataReader.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';
import type { ZodSchema } from 'zod';

// Directorio base de datos
const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Lee un archivo JSON de la carpeta /data y lo retorna tipado.
 * Solo debe llamarse desde Server Components o API Routes.
 *
 * @param filePath - Ruta relativa dentro de /data (ej: 'pages/home.json')
 * @returns Dato tipado con el genérico T
 */
export async function readData<T>(filePath: string): Promise<T> {
  const fullPath = path.join(DATA_DIR, filePath);

  try {
    const raw = await fs.readFile(fullPath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new Error(
      `Error leyendo el archivo de datos "${filePath}": ${
        error instanceof Error ? error.message : 'Error desconocido'
      }`
    );
  }
}

/**
 * Lee un archivo JSON y lo valida con un esquema Zod.
 * Lanza un error si los datos no cumplen el esquema.
 *
 * @param filePath - Ruta relativa dentro de /data
 * @param schema - Esquema Zod para validar los datos
 */
export async function readValidatedData<T>(
  filePath: string,
  schema: ZodSchema<T>
): Promise<T> {
  const raw = await readData<unknown>(filePath);
  const result = schema.safeParse(raw);

  if (!result.success) {
    throw new Error(
      `Datos inválidos en "${filePath}": ${result.error.message}`
    );
  }

  return result.data;
}
```

## 2.5 Implementar la capa de escritura — `lib/dataWriter.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Escribe datos en un archivo JSON dentro de /data.
 * Solo debe llamarse desde API Routes con método POST/PUT.
 *
 * @param filePath - Ruta relativa dentro de /data
 * @param data - Datos a escribir (se serializan a JSON)
 */
export async function writeData<T>(filePath: string, data: T): Promise<void> {
  const fullPath = path.join(DATA_DIR, filePath);

  try {
    const serialized = JSON.stringify(data, null, 2);
    await fs.writeFile(fullPath, serialized, 'utf-8');
  } catch (error) {
    throw new Error(
      `Error escribiendo el archivo "${filePath}": ${
        error instanceof Error ? error.message : 'Error desconocido'
      }`
    );
  }
}
```

## 2.6 Crear la API Route de datos — `app/api/data/[resource]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { readData } from '@lib/dataReader';
import type { ApiResponse } from '@lib/types';

interface RouteParams {
  params: { resource: string };
}

export async function GET(
  _req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<unknown>>> {
  const { resource } = params;

  // Whitelist de recursos permitidos (seguridad)
  const allowedResources = ['config', 'pages/home'];

  if (!allowedResources.includes(resource)) {
    return NextResponse.json(
      {
        data: null,
        success: false,
        timestamp: new Date().toISOString(),
        error: `Recurso "${resource}" no encontrado`,
      },
      { status: 404 }
    );
  }

  try {
    const data = await readData<unknown>(`${resource}.json`);
    return NextResponse.json({
      data,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        data: null,
        success: false,
        timestamp: new Date().toISOString(),
        error: 'Error interno al leer los datos',
      },
      { status: 500 }
    );
  }
}
```

## 2.7 Criterios de salida de Fase 2

- [ ] `data/config.json` y `data/pages/home.json` creados con estructura correcta
- [ ] `lib/types/index.ts` define todas las interfaces sin errores de TS
- [ ] `lib/dataReader.ts` compila sin errores (`pnpm typecheck`)
- [ ] `lib/dataWriter.ts` compila sin errores
- [ ] `data/schema/home.schema.ts` valida correctamente el JSON con Zod
- [ ] La API Route responde en `localhost:3000/api/data/config` con los datos JSON
- [ ] La API Route retorna 404 para recursos no permitidos

---

---

# FASE 3 — Home "Hola Mundo" con Efecto Elegante

> **Duración:** Días 4–5  
> **Objetivo:** Construir la página principal del sistema con el texto "Hola Mundo" centrado, animación de entrada suave y efecto shimmer elegante. Validar visualmente en local.  
> **Entregable:** Página Home funcional y visualmente terminada en `localhost:3000`.

---

## 3.1 Configurar estilos globales — `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ============================================================
   Variables CSS del sistema de diseño
   ============================================================ */
:root {
  --color-bg: #000000;
  --color-surface: #0a0a0a;
  --color-text: #ffffff;
  --color-text-muted: rgba(255, 255, 255, 0.35);
  --color-accent-gold: #c0a060;
  --color-accent-light: #e8d5a3;
  --shimmer-duration: 3.5s;
  --entrance-duration: 1200ms;
  --entrance-delay: 200ms;
}

/* ============================================================
   Reset y base
   ============================================================ */
*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: 'Georgia', 'Times New Roman', serif;
  -webkit-font-smoothing: antialiased;
}

/* ============================================================
   Componente: Hero Headline con efecto Shimmer
   ============================================================ */
.hero-headline {
  font-size: clamp(3rem, 10vw, 8rem);
  font-weight: 300;
  letter-spacing: 0.18em;
  line-height: 1.1;
  text-transform: uppercase;

  background: linear-gradient(
    90deg,
    var(--color-text)         0%,
    var(--color-accent-gold)  35%,
    var(--color-accent-light) 50%,
    var(--color-accent-gold)  65%,
    var(--color-text)         100%
  );
  background-size: 250% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  animation: shimmer var(--shimmer-duration) ease-in-out infinite;
}

/* ============================================================
   Componente: Hero Subtext
   ============================================================ */
.hero-subtext {
  margin-top: 2rem;
  font-size: clamp(0.75rem, 1.5vw, 0.95rem);
  color: var(--color-text-muted);
  letter-spacing: 0.4em;
  text-transform: uppercase;
  font-family: 'Courier New', monospace;
}

/* ============================================================
   Componente: Línea decorativa bajo el headline
   ============================================================ */
.hero-divider {
  width: 4rem;
  height: 1px;
  margin: 2rem auto;
  background: linear-gradient(
    90deg,
    transparent,
    var(--color-accent-gold),
    transparent
  );
}

/* ============================================================
   Efecto: Partículas de fondo (puntos)
   ============================================================ */
.bg-grid {
  position: fixed;
  inset: 0;
  background-image: radial-gradient(
    circle,
    rgba(192, 160, 96, 0.08) 1px,
    transparent 1px
  );
  background-size: 48px 48px;
  pointer-events: none;
  z-index: 0;
}

/* ============================================================
   Animaciones
   ============================================================ */
@keyframes shimmer {
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(2rem);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ============================================================
   Utilidades de animación
   ============================================================ */
.animate-fade-up {
  animation: fadeUp var(--entrance-duration) cubic-bezier(0.16, 1, 0.3, 1)
    var(--entrance-delay) both;
}

.animate-fade-in {
  animation: fadeIn 800ms ease var(--entrance-delay) both;
}

.animate-delay-300 { animation-delay: 300ms; }
.animate-delay-600 { animation-delay: 600ms; }
.animate-delay-900 { animation-delay: 900ms; }
```

## 3.2 Crear el componente HeroText — `components/ui/HeroText.tsx`

```typescript
'use client';

import type { HeroSection } from '@lib/types';

interface HeroTextProps {
  hero: HeroSection;
}

export default function HeroText({ hero }: HeroTextProps): JSX.Element {
  return (
    <div className="relative z-10 text-center px-6">

      {/* Indicador de estado del sistema */}
      <div className="animate-fade-in animate-delay-300 mb-10 inline-flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span
          style={{
            fontSize: '0.7rem',
            letterSpacing: '0.35em',
            color: 'var(--color-text-muted)',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
          }}
        >
          Sistema activo
        </span>
      </div>

      {/* Headline principal con shimmer */}
      <h1 className="hero-headline animate-fade-up">
        {hero.headline}
      </h1>

      {/* Línea decorativa */}
      <div className="hero-divider animate-fade-in animate-delay-600" />

      {/* Subtexto */}
      <p className="hero-subtext animate-fade-up animate-delay-600">
        {hero.subtext}
      </p>

      {/* Badge de stack */}
      <div className="animate-fade-in animate-delay-900 mt-12 inline-flex items-center gap-2">
        <span
          style={{
            fontSize: '0.65rem',
            letterSpacing: '0.25em',
            color: 'rgba(192, 160, 96, 0.5)',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            border: '1px solid rgba(192, 160, 96, 0.2)',
            padding: '0.4rem 1rem',
            borderRadius: '999px',
          }}
        >
          Next.js · TypeScript · Vercel
        </span>
      </div>

    </div>
  );
}
```

## 3.3 Crear el fondo decorativo — `components/ui/BackgroundGrid.tsx`

```typescript
export default function BackgroundGrid(): JSX.Element {
  return (
    <>
      {/* Grid de puntos */}
      <div className="bg-grid" aria-hidden="true" />

      {/* Gradiente radial central */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(192,160,96,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
    </>
  );
}
```

## 3.4 Implementar el Root Layout — `app/layout.tsx`

```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mi App TS',
  description: 'Sistema fullstack TypeScript · Next.js · Vercel',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
```

## 3.5 Implementar la página Home — `app/page.tsx`

```typescript
import { readValidatedData } from '@lib/dataReader';
import { HomePageDataSchema } from '@data/schema/home.schema';
import HeroText from '@components/ui/HeroText';
import BackgroundGrid from '@components/ui/BackgroundGrid';

export default async function HomePage(): Promise<JSX.Element> {
  // Lectura y validación de datos desde JSON
  const pageData = await readValidatedData(
    'pages/home.json',
    HomePageDataSchema
  );

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      {/* Efectos de fondo */}
      <BackgroundGrid />

      {/* Contenido principal */}
      <HeroText hero={pageData.hero} />
    </main>
  );
}
```

## 3.6 Verificación visual local

```bash
# Iniciar servidor de desarrollo
pnpm dev

# Abrir en el navegador
open http://localhost:3000
```

**Checklist visual:**
- [ ] El texto "HOLA MUNDO" aparece centrado horizontal y verticalmente
- [ ] El efecto shimmer dorado anima continuamente sobre el texto
- [ ] El texto entra con un fade + movimiento hacia arriba suave
- [ ] La línea decorativa aparece con retraso después del headline
- [ ] El subtexto aparece con retraso posterior a la línea
- [ ] El indicador "Sistema activo" parpadea en verde
- [ ] El fondo tiene la grilla de puntos apenas visible
- [ ] No hay errores en la consola del navegador

## 3.7 Criterios de salida de Fase 3

- [ ] `pnpm typecheck` — sin errores
- [ ] `pnpm lint` — sin errores
- [ ] `pnpm build` — build de producción exitoso
- [ ] Home renderiza visualmente correcto en `localhost:3000`
- [ ] Los datos del `home.json` se leen correctamente y aparecen en pantalla
- [ ] Las animaciones funcionan correctamente

---

---

# FASE 4 — Pipeline CI/CD

> **Duración:** Día 6  
> **Objetivo:** Configurar GitHub Actions para validar TypeScript en cada PR y conectar el repositorio con Vercel para deploy automático en cada push a `main`.  
> **Entregable:** Pipeline CI/CD operativo — PRs validados automáticamente, deploys en Vercel al hacer merge.

---

## 4.1 Crear el workflow de GitHub Actions — `.github/workflows/ci.yml`

```yaml
name: CI — Validación TypeScript

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  validate:
    name: TypeScript · Lint · Build
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      # 1. Obtener el código
      - name: Checkout del repositorio
        uses: actions/checkout@v4

      # 2. Configurar pnpm
      - name: Configurar pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      # 3. Configurar Node.js con caché de pnpm
      - name: Configurar Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      # 4. Instalar dependencias (usa lockfile exacto)
      - name: Instalar dependencias
        run: pnpm install --frozen-lockfile

      # 5. Verificación de tipos TypeScript
      - name: TypeScript — chequeo de tipos
        run: pnpm typecheck

      # 6. Linting
      - name: ESLint — análisis estático
        run: pnpm lint:strict

      # 7. Build de producción
      - name: Next.js — build de producción
        run: pnpm build
        env:
          NEXT_PUBLIC_APP_NAME: ${{ vars.APP_NAME || 'Mi App TS' }}
          NEXT_PUBLIC_APP_URL: ${{ vars.APP_URL || 'http://localhost:3000' }}
```

## 4.2 Crear el archivo de variables de entorno

### `.env.example` (commiteado en el repo)

```bash
# =============================================
# Variables de entorno — Mi App TS
# Copiar como .env.local y completar los valores
# =============================================

# Nombre de la aplicación (visible en el cliente)
NEXT_PUBLIC_APP_NAME="Mi App TS"

# URL pública de la aplicación
NEXT_PUBLIC_APP_URL="https://tu-app.vercel.app"

# Entorno (development | production | test)
NODE_ENV="development"
```

### `.env.local` (NO commiteado — en `.gitignore`)

```bash
NEXT_PUBLIC_APP_NAME="Mi App TS"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## 4.3 Actualizar `.gitignore`

Asegurarse de que el `.gitignore` incluya:

```gitignore
# Dependencias
node_modules/
.pnpm-store/

# Next.js
.next/
out/
build/

# Variables de entorno locales (NUNCA commitear)
.env.local
.env.development.local
.env.test.local
.env.production.local

# Sistema operativo
.DS_Store
Thumbs.db

# Editor
.vscode/
!.vscode/settings.json
!.vscode/extensions.json

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# TypeScript cache
*.tsbuildinfo
```

## 4.4 Conectar Vercel con GitHub

### Paso a paso en la plataforma Vercel:

1. Ir a [vercel.com/new](https://vercel.com/new)
2. Seleccionar **"Import Git Repository"**
3. Buscar y seleccionar el repositorio GitHub del proyecto
4. En la pantalla de configuración:

| Campo | Valor |
|---|---|
| Framework Preset | **Next.js** (detectado auto) |
| Root Directory | `.` (raíz del proyecto) |
| Build Command | `pnpm build` |
| Output Directory | `.next` (automático) |
| Install Command | `pnpm install` |
| Node.js Version | **20.x** |

5. Expandir **"Environment Variables"** y agregar:

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_APP_NAME` | Mi App TS |
| `NEXT_PUBLIC_APP_URL` | (Vercel lo asignará automáticamente) |

6. Hacer clic en **"Deploy"**

### Configuración de ramas en Vercel:

Una vez creado el proyecto, ir a **Settings → Git**:

| Rama | Entorno | Auto-deploy |
|---|---|---|
| `main` | Production | ✅ Activado |
| `develop` | Preview | ✅ Activado |
| `feature/*` | Preview por PR | ✅ Activado (automático) |

## 4.5 Crear y pushear rama develop

```bash
# Crear rama develop
git checkout -b develop
git push -u origin develop

# Crear una feature branch para probar el pipeline
git checkout -b feature/test-pipeline
echo "# Test pipeline" >> PIPELINE_TEST.md
git add PIPELINE_TEST.md
git commit -m "test: validar pipeline CI/CD"
git push -u origin feature/test-pipeline
```

Luego abrir un PR en GitHub de `feature/test-pipeline` → `main` y verificar que GitHub Actions se ejecuta.

## 4.6 Criterios de salida de Fase 4

- [ ] `.github/workflows/ci.yml` existe y es sintácticamente válido
- [ ] Al abrir un PR, GitHub Actions se ejecuta automáticamente
- [ ] El workflow pasa los 3 pasos: typecheck, lint, build
- [ ] Proyecto creado y configurado en Vercel
- [ ] Variables de entorno configuradas en Vercel
- [ ] Vercel muestra preview URL por cada PR de GitHub

---

---

# FASE 5 — Deploy y Validación en Producción

> **Duración:** Días 7–8  
> **Objetivo:** Hacer el merge final a `main`, verificar el deploy en producción de Vercel, validar el comportamiento end-to-end del sistema completo y ejecutar los checklists de calidad finales.  
> **Entregable:** Sistema en producción funcionando con URL pública de Vercel. Todos los checklists completados.

---

## 5.1 Merge final a main

```bash
# Asegurarse de estar en main actualizado
git checkout main
git pull origin main

# Mergear develop (o la feature branch) a main
git merge develop --no-ff -m "feat: sistema base - Home Hola Mundo validado"

# Push a main — esto dispara el deploy en Vercel
git push origin main
```

## 5.2 Monitoreo del deploy en Vercel

1. Ir al **Dashboard de Vercel** → proyecto → pestaña **"Deployments"**
2. Verificar que el deploy está en estado **"Building"**
3. Revisar los logs en tiempo real:

```
[10:32:01] Cloning repository...
[10:32:05] Installing dependencies with pnpm...
[10:32:30] Running "pnpm build"...
[10:32:31] info  - Linting and checking validity of types...
[10:32:45] info  - Creating an optimized production build...
[10:33:10] ✓ Compiled successfully
[10:33:11] ✓ Collecting page data
[10:33:12] ✓ Generating static pages (2/2)
[10:33:13] ✓ Finalizing page optimization
[10:33:15] Build completed. Deploying...
[10:33:20] ✓ Deployment complete → https://tu-app.vercel.app
```

4. Verificar que el estado final es **"Ready"** ✅

## 5.3 Validación funcional en producción

Abrir la URL pública `https://tu-app.vercel.app` y verificar:

### Validación visual

- [ ] El texto "HOLA MUNDO" aparece centrado en pantalla
- [ ] El efecto shimmer dorado anima correctamente
- [ ] Las animaciones de entrada funcionan (fade + slide up)
- [ ] El indicador "Sistema activo" es visible
- [ ] El badge del stack aparece en la parte inferior
- [ ] El fondo tiene la grilla de puntos
- [ ] El diseño es responsive (probar en móvil)

### Validación técnica

```bash
# Probar la API Route en producción
curl https://tu-app.vercel.app/api/data/config
# Esperado: { "data": { "siteName": "Mi App TS", ... }, "success": true }

curl https://tu-app.vercel.app/api/data/pages%2Fhome
# Esperado: { "data": { "id": "home", "hero": {...}, ... }, "success": true }

curl https://tu-app.vercel.app/api/data/recurso-invalido
# Esperado: { "success": false, "error": "Recurso no encontrado" }
```

### Validación de performance

En Chrome DevTools → Lighthouse:

| Métrica | Objetivo |
|---|---|
| Performance | ≥ 90 |
| Accessibility | ≥ 90 |
| Best Practices | ≥ 90 |
| SEO | ≥ 90 |

## 5.4 Checklist de calidad TypeScript — Final

Ejecutar localmente antes de cerrar la fase:

```bash
# Ejecutar validación completa
pnpm validate

# Equivalente a:
# pnpm typecheck   → tsc --noEmit
# pnpm lint:strict → eslint con max-warnings 0
# pnpm build       → next build
```

- [ ] `pnpm typecheck` — 0 errores de TypeScript
- [ ] `pnpm lint:strict` — 0 errores, 0 warnings de ESLint
- [ ] `pnpm build` — build exitoso sin warnings de tipos
- [ ] Cero usos de `any` explícito en el código fuente
- [ ] Todos los archivos JSON tienen interfaces TypeScript correspondientes
- [ ] `readData<T>` usa genéricos correctamente en todos los call sites
- [ ] Todos los componentes tienen tipos explícitos en sus props

## 5.5 Checklist de pipeline CI/CD — Final

- [ ] GitHub Actions pasa en todos los PRs abiertos
- [ ] El workflow de CI tiene los 3 pasos: typecheck, lint, build
- [ ] Vercel hace deploy automático al hacer merge a `main`
- [ ] Vercel genera Preview URLs para cada PR
- [ ] Las variables de entorno están correctamente configuradas en Vercel
- [ ] Los logs de build en Vercel no muestran errores ni warnings críticos

## 5.6 Documentar la URL de producción

Al finalizar la Fase 5, actualizar el `README.md` del proyecto:

```markdown
## 🚀 Deploy

**Producción:** https://tu-app.vercel.app

| Rama | Entorno | URL |
|---|---|---|
| `main` | Producción | https://tu-app.vercel.app |
| `develop` | Preview | https://tu-app-git-develop.vercel.app |

## Stack

- Next.js 14 + App Router
- TypeScript 5 (strict mode)
- Tailwind CSS
- Vercel (deploy)
- GitHub Actions (CI)
- JSON files como capa de datos
```

## 5.7 Criterios de salida de Fase 5 — y del proyecto

- [ ] URL pública de Vercel activa y mostrando el Home correctamente
- [ ] Todos los checklists de las 6 fases completados
- [ ] `pnpm validate` pasa localmente sin errores
- [ ] GitHub Actions verde en el último commit de `main`
- [ ] API Routes responden correctamente en producción
- [ ] README actualizado con la URL de producción
- [ ] El sistema está listo para escalar hacia nuevas funcionalidades

---

---

## Resumen de Criterios de Salida por Fase

| Fase | Criterio principal | Verificación |
|:---:|---|---|
| 0 | Entorno local configurado | `node --version`, `pnpm --version` |
| 1 | Proyecto inicializado en GitHub | `pnpm dev` sin errores + repo con commits |
| 2 | Data layer funcional | API Route responde datos del JSON |
| 3 | Home visual validado | `localhost:3000` con shimmer funcionando |
| 4 | Pipeline activo | GitHub Actions verde + Vercel conectado |
| 5 | Producción validada | URL pública + checklists completos |

---

## Comandos de Referencia Rápida

```bash
# Verificación completa antes de push
pnpm validate

# Desarrollo local
pnpm dev

# Solo chequeo de tipos
pnpm typecheck

# Build de producción local
pnpm build && pnpm start

# Probar API en local
curl http://localhost:3000/api/data/config
```

---

*Este plan de implementación está diseñado para ser ejecutado en orden estricto. Cada fase tiene sus propios criterios de salida que deben cumplirse antes de avanzar a la siguiente. El objetivo de este enfoque incremental es detectar errores lo antes posible y garantizar que cada capa del sistema funciona de forma independiente antes de integrarla con las demás.*
