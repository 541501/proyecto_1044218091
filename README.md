# 🚀 README — Proyecto Fullstack Next.js + TypeScript + Vercel

## 📋 Descripción

Este es un proyecto **Fullstack TypeScript** con arquitectura moderna:

- **Frontend**: Next.js 14+ (App Router) + React 18 + Tailwind CSS + Framer Motion
- **Backend**: Next.js Route Handlers + TypeScript
- **Base de Datos**: JSON como fuente de datos en `/data`
- **Despliegue**: Vercel + GitHub (CI/CD automático)

## 🛠️ Estructura del Proyecto

```
📦 proyecto/
├── 📁 app/                    # Next.js App Router
│   ├── api/                   # Route Handlers (API serverless)
│   ├── layout.tsx             # Layout raíz
│   ├── page.tsx               # Home
│   └── globals.css            # Estilos globales
├── 📁 components/             # Componentes React reutilizables
├── 📁 lib/                    # Utilidades y servicios TypeScript
├── 📁 data/                   # Capa de datos JSON
├── 📁 public/                 # Assets estáticos
├── 📄 package.json            # Dependencias
├── 📄 tsconfig.json           # Configuración TypeScript
├── 📄 next.config.ts          # Configuración Next.js
├── 📄 tailwind.config.ts      # Configuración Tailwind
├── 📄 .env.example            # Template de variables de entorno
└── 📄 vercel.json             # Configuración de despliegue
```

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+ o superior
- npm o yarn

### Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Crear .env.local (copia de .env.example)
cp .env.example .env.local

# 3. Ejecutar en modo desarrollo
npm run dev
```

La aplicación estará disponible en **http://localhost:3000**

## 📝 Scripts Disponibles

| Script | Descripción |
|--------|------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm start` | Inicia servidor de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm run typecheck` | Valida tipos TypeScript |
| `npm run validate` | Ejecuta typecheck + lint |

## 🔍 Validación de Código

```bash
# Validar tipos TypeScript
npm run typecheck

# Validar y lint completo
npm run validate
```

## 🌐 Despliegue en Vercel

1. Conectar tu repositorio GitHub a [Vercel](https://vercel.com)
2. Vercel detecta automáticamente Next.js
3. Cada `push` a `main` dispara un despliegue automático
4. Las variables de entorno se configuran en el dashboard de Vercel

### Variables de Entorno en Vercel

Ir a **Settings → Environment Variables** y agregar:
```
NEXT_PUBLIC_APP_NAME=Mi App TypeScript
```

## 📚 Documentación Completa

- [**PLAN_INFRAESTRUCTURA.md**](Doc/PLAN_INFRAESTRUCTURA.md) — Arquitectura completa del sistema
- [**ESTADO_EJECUCION.md**](Doc/ESTADO_EJECUCION.md) — Historial de ejecución del proyecto
- [**data/README.md**](data/README.md) — Guía de la capa de datos JSON

## 🏗️ Arquitectura Principal

### Server → Client Flow

```
Server Component (app/page.tsx)
  ↓
readJsonFile('home.json') [fs - servidor]
  ↓
Validar con Zod
  ↓
Pass props a Client Component
  ↓
HolaMundo.tsx (Framer Motion)
  ↓
Render en navegador
```

### Principios Clave

✅ **TypeScript Strict** — Todo tipado, sin `any`  
✅ **JSON as DB** — Persistencia directa en archivos  
✅ **Server-Only Data** — Nunca exponer JSONs al cliente  
✅ **Zero Config** — Vercel auto-detecta configuración  
✅ **CI/CD Automático** — GitHub → Vercel  

## 🤝 Contribuir

1. Crear rama: `git checkout -b feature/nombre`
2. Commit: `git commit -m "Descripción clara"`
3. Push: `git push origin feature/nombre`
4. Abrir Pull Request

## 📄 Licencia

Proyecto educativo - 2026

---

**Próximos pasos**: Ver [ESTADO_EJECUCION.md](Doc/ESTADO_EJECUCION.md) para el progreso completo del proyecto.
