# 🏗️ Plan de Infraestructura — Fullstack TypeScript + GitHub + Vercel

> **Versión:** 1.0  
> **Fecha:** Marzo 2026  
> **Arquitecto:** Plan generado como referencia de implementación  
> **Stack:** Next.js · TypeScript · Vercel · JSON como capa de datos

---

## 1. Visión General

Este documento define la arquitectura completa para un sistema fullstack basado en **TypeScript puro**, desplegado automáticamente en **Vercel** desde un repositorio **GitHub**. La persistencia de datos se gestiona mediante archivos **JSON estructurados** en una carpeta `/data`, eliminando la dependencia de bases de datos convencionales.

El primer hito de validación es un **Home con "Hola Mundo"** centrado, con efecto visual elegante, que confirme el funcionamiento integral del pipeline TypeScript → Build → Deploy.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión recomendada |
|---|---|---|
| Framework | Next.js (App Router) | 14.x o superior |
| Lenguaje | TypeScript | 5.x |
| Estilos | Tailwind CSS | 3.x |
| Animaciones | CSS custom + Framer Motion | 11.x |
| Datos | JSON files (`/data`) | — |
| Tipado de datos | Zod (validación de esquemas JSON) | 3.x |
| Runtime | Node.js | 20.x LTS |
| Deploy | Vercel | — |
| CI/CD | GitHub → Vercel (auto-deploy) | — |
| Package manager | pnpm | 9.x |

---

## 3. Estructura del Repositorio

```
/
├── .github/
│   └── workflows/
│       └── ci.yml                  # Validación TypeScript en PR
│
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # Root layout global
│   ├── page.tsx                    # Home — "Hola Mundo"
│   ├── globals.css                 # Estilos globales + variables CSS
│   └── api/                        # API Routes (serverless functions)
│       └── data/
│           └── [resource]/
│               └── route.ts        # Endpoint genérico para leer JSON
│
├── components/                     # Componentes reutilizables
│   ├── ui/
│   │   ├── HeroText.tsx            # Componente "Hola Mundo" animado
│   │   └── ParticleBackground.tsx  # Efecto de fondo elegante
│   └── layout/
│       └── RootLayout.tsx
│
├── data/                           # 📁 Capa de datos JSON (pseudo-DB)
│   ├── config.json                 # Configuración global del sitio
│   ├── pages/
│   │   └── home.json               # Contenido dinámico del Home
│   └── schema/                     # Esquemas de validación Zod
│       └── home.schema.ts
│
├── lib/                            # Utilidades del servidor
│   ├── dataReader.ts               # Función para leer archivos JSON
│   ├── dataWriter.ts               # Función para escribir JSON (API routes)
│   └── types/
│       └── index.ts                # Tipos TypeScript globales
│
├── public/                         # Assets estáticos
│   └── fonts/
│
├── .env.local                      # Variables de entorno locales
├── .env.example                    # Plantilla de variables (commiteado)
├── .gitignore
├── next.config.ts                  # Config de Next.js en TypeScript
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. Arquitectura de Datos (JSON como Base de Datos)

### 4.1 Filosofía

La carpeta `/data` actúa como una base de datos de solo lectura en producción. Las escrituras se manejan únicamente desde **API Routes del servidor** — nunca desde el cliente directamente.

### 4.2 Estructura del archivo `data/pages/home.json`

```json
{
  "id": "home",
  "hero": {
    "headline": "Hola Mundo",
    "subtext": "Bienvenido al sistema. TypeScript está funcionando.",
    "effect": "shimmer"
  },
  "meta": {
    "title": "Home | Mi App",
    "description": "Primer hito de validación del stack TypeScript"
  },
  "updatedAt": "2026-03-27T00:00:00Z"
}
```

### 4.3 Estructura del archivo `data/config.json`

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

### 4.4 Capa de lectura — `lib/dataReader.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export async function readData<T>(filePath: string): Promise<T> {
  const fullPath = path.join(DATA_DIR, filePath);
  const raw = await fs.readFile(fullPath, 'utf-8');
  return JSON.parse(raw) as T;
}
```

> **Regla de oro:** `readData` solo se llama desde Server Components o API Routes. Nunca desde componentes cliente.

---

## 5. Pipeline CI/CD — GitHub → Vercel

### 5.1 Flujo completo

```
Desarrollador
     │
     ▼
git push → rama feature/*
     │
     ▼
GitHub PR abierto
     │
     ├──▶ GitHub Actions: tsc --noEmit (chequeo de tipos)
     │    GitHub Actions: pnpm lint
     │    GitHub Actions: pnpm build (validar que compila)
     │
     ▼ (aprobado)
Merge a main
     │
     ▼
Vercel detecta push a main
     │
     ├──▶ Instala dependencias (pnpm)
     ├──▶ Ejecuta: next build
     ├──▶ Deploy automático a producción
     │
     ▼
URL pública activa en Vercel
```

### 5.2 Archivo `.github/workflows/ci.yml`

```yaml
name: CI — TypeScript Check

on:
  pull_request:
    branches: [main]

jobs:
  typecheck:
    name: Type Check & Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: TypeScript check
        run: pnpm tsc --noEmit

      - name: Lint
        run: pnpm lint

      - name: Build
        run: pnpm build
```

---

## 6. Configuración TypeScript — `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
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
      "@components/*": ["./components/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

> **`strict: true`** es obligatorio. Garantiza que el tipado sea real y no decorativo.

---

## 7. Hito 1 — Home "Hola Mundo" con Efecto Elegante

### 7.1 `app/page.tsx` — Server Component

```typescript
import { readData } from '@lib/dataReader';
import HeroText from '@components/ui/HeroText';

interface HomeData {
  hero: {
    headline: string;
    subtext: string;
    effect: string;
  };
  meta: {
    title: string;
  };
}

export default async function HomePage() {
  const data = await readData<HomeData>('pages/home.json');

  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <HeroText
        headline={data.hero.headline}
        subtext={data.hero.subtext}
      />
    </main>
  );
}
```

### 7.2 `components/ui/HeroText.tsx` — Client Component (animación)

```typescript
'use client';

import { useEffect, useState } from 'react';

interface HeroTextProps {
  headline: string;
  subtext: string;
}

export default function HeroText({ headline, subtext }: HeroTextProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`text-center transition-all duration-1000 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <h1 className="hero-headline shimmer-text">
        {headline}
      </h1>
      <p className="hero-subtext">
        {subtext}
      </p>
    </div>
  );
}
```

### 7.3 Efecto Shimmer — `app/globals.css`

```css
:root {
  --color-bg: #000000;
  --color-text: #ffffff;
  --color-accent: #c0a060;
  --shimmer-duration: 3s;
}

.hero-headline {
  font-size: clamp(3rem, 10vw, 8rem);
  font-weight: 300;
  letter-spacing: 0.15em;
  background: linear-gradient(
    90deg,
    #ffffff 0%,
    #c0a060 40%,
    #ffffff 60%,
    #c0a060 100%
  );
  background-size: 300% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer var(--shimmer-duration) ease-in-out infinite;
}

.hero-subtext {
  margin-top: 1.5rem;
  font-size: clamp(0.9rem, 2vw, 1.1rem);
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

@keyframes shimmer {
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
}
```

---

## 8. Variables de Entorno

### `.env.example` (commiteado en el repo)

```bash
# App
NEXT_PUBLIC_APP_NAME="Mi App TS"
NEXT_PUBLIC_APP_URL="https://mi-app.vercel.app"

# Entorno
NODE_ENV="development"
```

### Reglas

- Nunca commitear `.env.local` — ya está en `.gitignore`
- Las variables `NEXT_PUBLIC_*` son accesibles en el cliente
- Las variables sin prefijo solo están disponibles en el servidor
- En Vercel: configurar las variables en **Settings → Environment Variables**

---

## 9. Configuración de Vercel

### 9.1 Vinculación del proyecto

1. Ir a [vercel.com](https://vercel.com) → **Add New Project**
2. Importar el repositorio GitHub
3. Framework: **Next.js** (detectado automáticamente)
4. Build Command: `pnpm build`
5. Output Directory: `.next` (automático)
6. Install Command: `pnpm install`
7. Node.js Version: **20.x**

### 9.2 `next.config.ts`

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    typedRoutes: true,   // Tipado de rutas en tiempo de compilación
  },
};

export default nextConfig;
```

### 9.3 Ramas y entornos en Vercel

| Rama Git | Entorno Vercel | URL |
|---|---|---|
| `main` | Production | `mi-app.vercel.app` |
| `develop` | Preview | `mi-app-git-develop.vercel.app` |
| `feature/*` | Preview automático por PR | URL única por PR |

---

## 10. Comandos de Desarrollo

```bash
# Clonar e instalar
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo
pnpm install

# Desarrollo local
pnpm dev           # http://localhost:3000

# Verificaciones antes de hacer push
pnpm tsc --noEmit  # Chequeo de tipos
pnpm lint          # ESLint
pnpm build         # Build de producción local

# Actualizar dependencias
pnpm update --latest
```

---

## 11. Fases de Implementación

### Fase 1 — Fundación (Día 1–2)
- [ ] Crear repositorio en GitHub
- [ ] Inicializar proyecto: `pnpm create next-app@latest --typescript --tailwind --app`
- [ ] Configurar `tsconfig.json` con `strict: true`
- [ ] Crear estructura de carpetas (`/data`, `/lib`, `/components`)
- [ ] Crear `data/config.json` y `data/pages/home.json`
- [ ] Implementar `lib/dataReader.ts`

### Fase 2 — Home Hola Mundo (Día 2–3)
- [ ] Implementar `app/page.tsx` con lectura de JSON
- [ ] Crear `components/ui/HeroText.tsx`
- [ ] Aplicar efecto shimmer en `globals.css`
- [ ] Validar en `localhost:3000`
- [ ] Confirmar que TypeScript no reporta errores (`pnpm tsc --noEmit`)

### Fase 3 — CI/CD (Día 3–4)
- [ ] Crear `.github/workflows/ci.yml`
- [ ] Vincular repositorio con Vercel
- [ ] Configurar variables de entorno en Vercel
- [ ] Hacer push a `main` y validar deploy automático
- [ ] Verificar URL pública de Vercel

### Fase 4 — Validación final
- [ ] Abrir un PR de prueba y confirmar que GitHub Actions pasa
- [ ] Verificar que el Home carga correctamente en la URL de Vercel
- [ ] Confirmar que el efecto shimmer funciona en producción
- [ ] Revisar los logs de build en Vercel dashboard

---

## 12. Checklist de Calidad TypeScript

Antes de considerar el sistema listo, verificar:

- [ ] `strict: true` activado en `tsconfig.json`
- [ ] Cero usos de `any` explícito en el código
- [ ] Todos los datos JSON tienen interfaces TypeScript correspondientes
- [ ] `readData<T>` usa genéricos correctamente
- [ ] `pnpm tsc --noEmit` retorna sin errores
- [ ] `pnpm build` completa sin errores ni warnings de tipos
- [ ] GitHub Actions pasa en todos los PRs

---

## 13. Decisiones de Arquitectura y Justificaciones

| Decisión | Alternativa descartada | Razón |
|---|---|---|
| Next.js App Router | Pages Router | Server Components nativos, mejor soporte TypeScript |
| `/data` con JSON | SQLite / Supabase | Cero dependencias externas, deploy estático posible |
| `readData` solo en servidor | API calls desde cliente | Seguridad, los archivos JSON nunca exponen rutas internas |
| `pnpm` | npm / yarn | Más rápido, mejor manejo de dependencias, compatible con Vercel |
| `strict: true` | Tipado relajado | TypeScript sin strict mode es decorativo, no funcional |
| Zod para validar JSON | Sin validación | Los JSON pueden corromperse; Zod garantiza el contrato de tipos en runtime |

---

## 14. Próximas Extensiones (Post Hito 1)

Una vez validado el Home, la arquitectura permite expandir hacia:

- **API Routes CRUD** sobre los archivos JSON (`/api/data/[resource]`)
- **Autenticación** con NextAuth.js (tokens en JSON)
- **Panel de administración** para editar los JSON desde una UI
- **ISR (Incremental Static Regeneration)** para regenerar páginas cuando cambian los JSON
- **Middleware de validación** con Zod en todas las API Routes

---

*Este plan es la base mínima viable para un sistema TypeScript fullstack funcional, mantenible y desplegable de forma continua. Cada decisión está orientada a maximizar la solidez del tipado y la simplicidad operacional.*
