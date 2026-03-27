# 📜 Prompts de Ejecución por Fases
## Fullstack TypeScript · Next.js · GitHub · Vercel

> **Archivo:** `PROMPTS_EJECUCION.md`  
> **Proyecto:** Sistema Fullstack TypeScript  
> **Creado:** 2026-03-27  
> **Uso:** Copiar cada prompt completo y pegarlo en una nueva conversación con el agente de IA al inicio de cada fase.  
> **Documentos de referencia requeridos** (adjuntar siempre a la conversación):
> - `PLAN_INFRAESTRUCTURA.md`
> - `PLAN_IMPLEMENTACION_FASES.md`
> - `ESTADO_EJECUCION.md`

---

## ⚠️ Instrucciones de Uso

1. Antes de ejecutar cualquier prompt, **adjuntar los 3 documentos de referencia** al chat.
2. Copiar el prompt de la fase correspondiente **completo**, sin modificar.
3. Al recibir la respuesta del agente, **actualizar manualmente** el `ESTADO_EJECUCION.md` con los datos de inicio que el agente indique.
4. Al finalizar la fase, el agente entregará el contenido para el `RESUMEN_FASE_X.md` — crearlo como archivo independiente.
5. **No ejecutar una fase sin que la anterior esté en estado ✅ Completado** en el estado de ejecución.

---

---

# PROMPT-F0 — Fase 0: Preparación del Entorno

> **Skill del agente:** Ingeniero DevOps / Ingeniero Fullstack Senior  
> **Duración estimada:** Día 0 — previo al inicio del desarrollo  
> **Documentos requeridos:** PLAN_INFRAESTRUCTURA.md · PLAN_IMPLEMENTACION_FASES.md · ESTADO_EJECUCION.md

---

```
Actúa como Ingeniero DevOps y Fullstack Senior con experiencia en ecosistemas 
Node.js, TypeScript y despliegue en Vercel.

DOCUMENTOS DE REFERENCIA:
Tienes adjuntos tres documentos que debes leer completamente antes de actuar:
1. PLAN_INFRAESTRUCTURA.md — arquitectura general del sistema
2. PLAN_IMPLEMENTACION_FASES.md — plan detallado de implementación por fases
3. ESTADO_EJECUCION.md — estado actual de ejecución del proyecto

ACCIÓN INMEDIATA AL INICIAR:
Lo primero que debes hacer es indicarme exactamente qué debo escribir en el 
ESTADO_EJECUCION.md para registrar el inicio de la Fase 0. Proporciona el 
bloque de texto completo y formateado listo para copiar y pegar, con la fecha 
y hora actual, el nombre del prompt (PROMPT-F0) y el campo "En progreso" en 
el panel de control general.

OBJETIVO DE ESTA FASE:
Ejecutar completamente la Fase 0 del PLAN_IMPLEMENTACION_FASES.md: 
"Preparación del Entorno". Tu tarea es guiarme paso a paso para verificar e 
instalar todas las herramientas requeridas y dejar el entorno local listo para 
comenzar el desarrollo.

TAREAS A EJECUTAR:
1. Verificar Node.js 20 LTS — dame el comando exacto y el resultado esperado.
2. Verificar/instalar pnpm 9.x — dame el comando exacto.
3. Verificar Git y configurar identidad — dame los comandos exactos.
4. Listar las extensiones de VS Code a instalar con sus IDs exactos.
5. Guiarme para crear el repositorio en GitHub (vacío, sin README).
6. Guiarme para vincular la cuenta Vercel con GitHub si aún no está vinculada.
7. Darme el contenido exacto del archivo .vscode/settings.json a crear.

CRITERIOS DE SALIDA:
Al finalizar cada tarea, indica explícitamente si el criterio de salida de esa 
tarea fue cumplido. Al completar todas las tareas, ejecuta el checklist 
completo de la Fase 0 del plan y marca cada ítem.

ACCIÓN FINAL — REGISTRO DE CIERRE:
Al completar todas las tareas y el checklist, genera:

1. El bloque de texto completo y formateado para actualizar la sección 
   "Resultado" de la Fase 0 en el ESTADO_EJECUCION.md, con todos los campos 
   completados.

2. El contenido completo del archivo RESUMEN_FASE_0.md — este archivo es 
   independiente del estado de ejecución y debe contener:
   - Fecha de ejecución
   - Versiones exactas instaladas (Node.js, pnpm, Git)
   - Extensiones de VS Code instaladas
   - URL del repositorio GitHub creado
   - Estado de vinculación Vercel-GitHub
   - Problemas encontrados y cómo se resolvieron
   - Tiempo total de ejecución de la fase
   - Confirmación de todos los criterios de salida cumplidos

No avances ni menciones la Fase 1 hasta que yo confirme que el RESUMEN_FASE_0.md 
ha sido creado y el ESTADO_EJECUCION.md ha sido actualizado.
```

---

---

# PROMPT-F1 — Fase 1: Fundación del Proyecto

> **Skill del agente:** Ingeniero Fullstack Senior — TypeScript / Next.js  
> **Duración estimada:** Días 1–2  
> **Documentos requeridos:** PLAN_INFRAESTRUCTURA.md · PLAN_IMPLEMENTACION_FASES.md · ESTADO_EJECUCION.md  
> **Prerequisito:** Fase 0 en estado ✅ Completado

---

```
Actúa como Ingeniero Fullstack Senior especializado en TypeScript estricto, 
Next.js App Router y arquitectura de proyectos escalables.

DOCUMENTOS DE REFERENCIA:
Tienes adjuntos tres documentos que debes leer completamente antes de actuar:
1. PLAN_INFRAESTRUCTURA.md — arquitectura general del sistema
2. PLAN_IMPLEMENTACION_FASES.md — plan detallado de implementación por fases
3. ESTADO_EJECUCION.md — verifica que la Fase 0 está en estado Completado 
   antes de proceder. Si no lo está, detente e indícame que debo completar 
   la Fase 0 primero.

ACCIÓN INMEDIATA AL INICIAR:
Lo primero que debes hacer es indicarme exactamente qué debo escribir en el 
ESTADO_EJECUCION.md para registrar el inicio de la Fase 1. Proporciona el 
bloque de texto completo y formateado listo para copiar y pegar, actualizando 
el panel de control general con estado "En progreso" para Fase 1 y la fecha 
y hora actual.

OBJETIVO DE ESTA FASE:
Ejecutar completamente la Fase 1 del PLAN_IMPLEMENTACION_FASES.md: 
"Fundación del Proyecto". Crear el proyecto Next.js con TypeScript estricto, 
configurar todas las herramientas de calidad de código y establecer la 
estructura de carpetas definitiva del sistema.

TAREAS A EJECUTAR (en orden estricto):
1. Darme el comando exacto para inicializar el proyecto con pnpm create 
   next-app con todas las flags correctas del plan.
2. Darme el comando para instalar todas las dependencias de producción y 
   desarrollo en una sola instrucción.
3. Entregarme el contenido completo y definitivo del tsconfig.json.
4. Entregarme el contenido completo del .eslintrc.json.
5. Entregarme el contenido completo del .prettierrc.
6. Entregarme el bloque "scripts" completo para el package.json.
7. Entregarme el contenido del next.config.ts.
8. Darme los comandos bash para crear toda la estructura de carpetas y 
   archivos placeholder en una sola ejecución.
9. Entregarme el contenido del .gitignore actualizado.
10. Entregarme el contenido del .env.example.
11. Darme los comandos Git exactos para el primer commit y push a main.

Para cada archivo que me entregues, indica explícitamente cuál es su ruta 
dentro del proyecto y por qué cada configuración importante es necesaria.

VERIFICACIÓN:
Después de cada grupo de tareas, dame los comandos de verificación exactos 
que debo ejecutar y el resultado esperado para confirmar que todo está correcto.

CRITERIOS DE SALIDA:
Al finalizar, ejecuta el checklist completo de la Fase 1 y marca cada ítem. 
Confirma explícitamente que `pnpm dev` levanta sin errores y `pnpm typecheck` 
retorna limpio.

ACCIÓN FINAL — REGISTRO DE CIERRE:
Al completar todas las tareas y el checklist, genera:

1. El bloque de texto completo para actualizar la sección "Resultado" de la 
   Fase 1 en el ESTADO_EJECUCION.md con todos los campos completados, 
   incluyendo el hash del commit inicial y la URL del repositorio.

2. El contenido completo del archivo RESUMEN_FASE_1.md con:
   - Fecha de ejecución
   - Stack de versiones exactas usadas
   - Lista de archivos de configuración creados con su propósito
   - Estructura de carpetas final (árbol de directorios)
   - Scripts disponibles en package.json y su función
   - Decisiones tomadas que difirieron del plan original (si aplica)
   - Problemas encontrados y resoluciones
   - Hash del primer commit y URL del repositorio en GitHub
   - Tiempo total de ejecución de la fase
   - Criterios de salida: todos marcados como cumplidos o con nota

No avances ni menciones la Fase 2 hasta que yo confirme que el 
RESUMEN_FASE_1.md ha sido creado y el ESTADO_EJECUCION.md actualizado.
```

---

---

# PROMPT-F2 — Fase 2: Capa de Datos JSON

> **Skill del agente:** Ingeniero Fullstack Senior — TypeScript / Arquitectura de datos  
> **Duración estimada:** Día 3  
> **Documentos requeridos:** PLAN_INFRAESTRUCTURA.md · PLAN_IMPLEMENTACION_FASES.md · ESTADO_EJECUCION.md  
> **Prerequisito:** Fase 1 en estado ✅ Completado

---

```
Actúa como Ingeniero Fullstack Senior con especialización en arquitectura de 
datos, TypeScript estricto y diseño de APIs RESTful en Next.js App Router.

DOCUMENTOS DE REFERENCIA:
Tienes adjuntos tres documentos que debes leer completamente antes de actuar:
1. PLAN_INFRAESTRUCTURA.md — arquitectura general del sistema
2. PLAN_IMPLEMENTACION_FASES.md — plan detallado de implementación por fases
3. ESTADO_EJECUCION.md — verifica que la Fase 1 está en estado Completado 
   antes de proceder. Si no lo está, detente e indícame que debo completar 
   la Fase 1 primero.

ACCIÓN INMEDIATA AL INICIAR:
Lo primero que debes hacer es indicarme exactamente qué debo escribir en el 
ESTADO_EJECUCION.md para registrar el inicio de la Fase 2. Proporciona el 
bloque de texto completo y formateado listo para copiar y pegar, actualizando 
el panel de control general con estado "En progreso" para Fase 2 y la fecha 
y hora actual.

OBJETIVO DE ESTA FASE:
Ejecutar completamente la Fase 2 del PLAN_IMPLEMENTACION_FASES.md: 
"Capa de Datos JSON". Implementar la pseudo-base de datos con archivos JSON, 
los tipos TypeScript, los esquemas de validación Zod y la capa de acceso 
a datos del servidor.

TAREAS A EJECUTAR (en orden estricto):
1. Entregarme el contenido definitivo de data/config.json.
2. Entregarme el contenido definitivo de data/pages/home.json.
3. Entregarme el contenido completo de lib/types/index.ts con todas las 
   interfaces TypeScript que cubran config.json y home.json, usando tipos 
   literales y uniones donde corresponda.
4. Entregarme el contenido completo de data/schema/home.schema.ts con los 
   esquemas Zod y la exportación del tipo inferido.
5. Entregarme el contenido completo de lib/dataReader.ts con las funciones 
   readData y readValidatedData, con JSDoc completo.
6. Entregarme el contenido completo de lib/dataWriter.ts.
7. Entregarme el contenido completo de app/api/data/[resource]/route.ts con 
   la whitelist de seguridad y el manejo de errores.
8. Darme el comando curl exacto para probar la API Route en localhost y el 
   JSON de respuesta esperado para cada caso (éxito y 404).

Para cada archivo, indica su ruta exacta y explica brevemente por qué la 
implementación sigue las decisiones de arquitectura del plan.

VERIFICACIÓN TYPESCRIPT:
Después de entregar todos los archivos, dame la secuencia exacta de comandos 
de verificación y el resultado esperado de cada uno:
- pnpm typecheck
- pnpm lint
- Prueba del endpoint en localhost

CRITERIOS DE SALIDA:
Al finalizar, ejecuta el checklist completo de la Fase 2, marca cada ítem y 
confirma explícitamente que la API Route responde correctamente.

ACCIÓN FINAL — REGISTRO DE CIERRE:
Al completar todas las tareas y el checklist, genera:

1. El bloque de texto completo para actualizar la sección "Resultado" de la 
   Fase 2 en el ESTADO_EJECUCION.md, incluyendo la respuesta real del 
   endpoint /api/data/config en el campo "API verificada".

2. El contenido completo del archivo RESUMEN_FASE_2.md con:
   - Fecha de ejecución
   - Estructura de datos implementada (todos los archivos JSON con su schema)
   - Interfaces TypeScript creadas y su relación con los JSON
   - Esquemas Zod creados y qué validan
   - Funciones de la capa de datos con su firma y propósito
   - Endpoints de API disponibles con sus URLs, métodos y respuestas
   - Decisiones de seguridad tomadas (whitelist, server-only, etc.)
   - Resultado de pnpm typecheck y pnpm lint
   - Problemas encontrados y resoluciones
   - Tiempo total de ejecución de la fase
   - Criterios de salida verificados

No avances ni menciones la Fase 3 hasta que yo confirme que el 
RESUMEN_FASE_2.md ha sido creado y el ESTADO_EJECUCION.md actualizado.
```

---

---

# PROMPT-F3 — Fase 3: Home "Hola Mundo"

> **Skill del agente:** Diseñador UX/UI + Ingeniero Frontend Senior  
> **Duración estimada:** Días 4–5  
> **Documentos requeridos:** PLAN_INFRAESTRUCTURA.md · PLAN_IMPLEMENTACION_FASES.md · ESTADO_EJECUCION.md  
> **Prerequisito:** Fase 2 en estado ✅ Completado

---

```
Actúa como Diseñador UX/UI Senior y Desarrollador Frontend especializado en 
interfaces elegantes, sistemas de animación CSS avanzados y componentes React 
con TypeScript. Tienes ojo para el detalle visual y criterio estético refinado.

DOCUMENTOS DE REFERENCIA:
Tienes adjuntos tres documentos que debes leer completamente antes de actuar:
1. PLAN_INFRAESTRUCTURA.md — arquitectura general del sistema
2. PLAN_IMPLEMENTACION_FASES.md — plan detallado de implementación por fases
3. ESTADO_EJECUCION.md — verifica que la Fase 2 está en estado Completado 
   antes de proceder. Si no lo está, detente e indícame que debo completar 
   la Fase 2 primero.

ACCIÓN INMEDIATA AL INICIAR:
Lo primero que debes hacer es indicarme exactamente qué debo escribir en el 
ESTADO_EJECUCION.md para registrar el inicio de la Fase 3. Proporciona el 
bloque de texto completo y formateado listo para copiar y pegar, actualizando 
el panel de control general con estado "En progreso" para Fase 3 y la fecha 
y hora actual.

OBJETIVO DE ESTA FASE:
Ejecutar completamente la Fase 3 del PLAN_IMPLEMENTACION_FASES.md: 
"Home Hola Mundo con Efecto Elegante". Construir la página principal con el 
texto centrado, animación de entrada suave y efecto shimmer dorado continuo. 
Todo el código debe ser TypeScript estricto, sin ningún uso de `any`.

TAREAS A EJECUTAR (en orden estricto):
1. Entregarme el contenido completo y definitivo de app/globals.css con:
   - Variables CSS del sistema de diseño
   - Reset base
   - Clase .hero-headline con efecto shimmer dorado animado
   - Clase .hero-subtext 
   - Clase .hero-divider (línea decorativa)
   - Clase .bg-grid (grilla de puntos de fondo)
   - Keyframes para shimmer, fadeUp (con blur), fadeIn
   - Clases utilitarias de animación con delays escalonados

2. Entregarme el contenido completo de app/layout.tsx con tipos correctos.

3. Entregarme el contenido completo de components/ui/BackgroundGrid.tsx 
   con la grilla de puntos y el gradiente radial central.

4. Entregarme el contenido completo de components/ui/HeroText.tsx con:
   - Props tipadas usando la interfaz HeroSection de lib/types/index.ts
   - Indicador "Sistema activo" con punto verde pulsante
   - Headline con clase shimmer
   - Línea decorativa con delay de animación
   - Subtexto con delay mayor
   - Badge del stack tecnológico
   - Return type explícito JSX.Element

5. Entregarme el contenido completo de app/page.tsx que:
   - Sea un Server Component async
   - Use readValidatedData con el HomePageDataSchema de Zod
   - Pase los datos a HeroText correctamente tipados
   - Incluya BackgroundGrid
   - Tenga return type explícito JSX.Element

6. Darme el checklist visual exacto que debo verificar en el navegador una 
   vez que tenga todo funcionando en localhost:3000, con descripción de qué 
   debo ver en cada punto.

CONSIDERACIONES DE DISEÑO:
- El fondo debe ser negro profundo (#000000)
- El efecto shimmer usa tonos dorado-ámbar (#c0a060, #e8d5a3)
- Las animaciones deben sentirse suaves y orgánicas, no mecánicas
- El tipado serif del headline contrasta con el monospace del subtexto
- Todo el diseño debe funcionar en móvil y desktop
- No usar `any` en ningún lugar del código

VERIFICACIÓN TYPESCRIPT Y BUILD:
Después de entregar todos los archivos, dame la secuencia exacta de comandos:
- pnpm typecheck
- pnpm lint
- pnpm build
Y el resultado esperado de cada uno.

CRITERIOS DE SALIDA:
Al finalizar, ejecuta el checklist completo de la Fase 3, incluyendo el 
checklist visual. Confirma explícitamente que `pnpm build` produce un build 
exitoso.

ACCIÓN FINAL — REGISTRO DE CIERRE:
Al completar todas las tareas y el checklist, genera:

1. El bloque de texto completo para actualizar la sección "Resultado" de la 
   Fase 3 en el ESTADO_EJECUCION.md, completando todos los campos de la 
   sección "Validación visual".

2. El contenido completo del archivo RESUMEN_FASE_3.md con:
   - Fecha de ejecución
   - Componentes creados con su responsabilidad (Server vs Client)
   - Sistema de animaciones implementado (lista de keyframes y su efecto)
   - Sistema de diseño: variables CSS y su propósito
   - Paleta de colores usada con códigos hex
   - Tipografías usadas y por qué se eligieron
   - Resultado del checklist visual (cada punto con Sí/No)
   - Resultado de pnpm typecheck, pnpm lint y pnpm build
   - Problemas de TypeScript encontrados y cómo se resolvieron
   - Problemas visuales encontrados y cómo se resolvieron
   - Tiempo total de ejecución de la fase
   - Criterios de salida verificados

No avances ni menciones la Fase 4 hasta que yo confirme que el 
RESUMEN_FASE_3.md ha sido creado y el ESTADO_EJECUCION.md actualizado.
```

---

---

# PROMPT-F4 — Fase 4: CI/CD y Pipeline

> **Skill del agente:** Ingeniero DevOps Senior — GitHub Actions / Vercel  
> **Duración estimada:** Día 6  
> **Documentos requeridos:** PLAN_INFRAESTRUCTURA.md · PLAN_IMPLEMENTACION_FASES.md · ESTADO_EJECUCION.md  
> **Prerequisito:** Fase 3 en estado ✅ Completado

---

```
Actúa como Ingeniero DevOps Senior con amplia experiencia en pipelines CI/CD, 
GitHub Actions, despliegue continuo en Vercel y gestión de entornos y 
variables de configuración en proyectos Next.js TypeScript.

DOCUMENTOS DE REFERENCIA:
Tienes adjuntos tres documentos que debes leer completamente antes de actuar:
1. PLAN_INFRAESTRUCTURA.md — arquitectura general del sistema
2. PLAN_IMPLEMENTACION_FASES.md — plan detallado de implementación por fases
3. ESTADO_EJECUCION.md — verifica que la Fase 3 está en estado Completado 
   antes de proceder. Si no lo está, detente e indícame que debo completar 
   la Fase 3 primero.

ACCIÓN INMEDIATA AL INICIAR:
Lo primero que debes hacer es indicarme exactamente qué debo escribir en el 
ESTADO_EJECUCION.md para registrar el inicio de la Fase 4. Proporciona el 
bloque de texto completo y formateado listo para copiar y pegar, actualizando 
el panel de control general con estado "En progreso" para Fase 4 y la fecha 
y hora actual.

OBJETIVO DE ESTA FASE:
Ejecutar completamente la Fase 4 del PLAN_IMPLEMENTACION_FASES.md: 
"CI/CD y Pipeline". Configurar GitHub Actions para validar TypeScript en cada 
PR y conectar el repositorio con Vercel para deploy automático en cada push 
a main.

TAREAS A EJECUTAR (en orden estricto):
1. Entregarme el contenido completo del archivo 
   .github/workflows/ci.yml con los tres jobs: typecheck, lint y build, 
   con caché de pnpm correctamente configurado y manejo de variables 
   de entorno en el step de build.

2. Entregarme el contenido completo del .env.example actualizado.

3. Entregarme el contenido del .env.local que debo crear localmente 
   (recordarme que NO debe ser commiteado).

4. Verificar que el .gitignore tiene las entradas correctas para archivos 
   .env — darme el bloque exacto a agregar si falta algo.

5. Guiarme paso a paso para vincular el proyecto en Vercel:
   - Qué opciones seleccionar en el wizard de importación
   - Tabla exacta con todos los campos de configuración y sus valores
   - Lista exacta de variables de entorno a configurar en Vercel dashboard
   - Cómo configurar las ramas (main, develop) en Settings → Git

6. Darme los comandos Git exactos para:
   - Crear y pushear la rama develop
   - Crear una feature branch de prueba
   - Hacer el commit y push de la feature branch
   - Las instrucciones para abrir el PR en GitHub

7. Explicarme exactamente qué debo ver en GitHub Actions cuando el PR 
   está abierto y cómo interpretar cada paso del workflow.

8. Explicarme exactamente qué debo ver en Vercel cuando el PR está abierto 
   (Preview URL, estado del deploy).

VERIFICACIÓN DEL PIPELINE:
Después de cada tarea de configuración, dame los pasos exactos para verificar 
que funcionó correctamente. Sé específico: "deberías ver X en la pantalla Y".

CRITERIOS DE SALIDA:
Al finalizar, ejecuta el checklist completo de la Fase 4. Para la sección 
"Validación del pipeline", dame el bloque de texto con los resultados reales 
que yo debo completar después de observar los resultados.

ACCIÓN FINAL — REGISTRO DE CIERRE:
Al completar todas las tareas y el checklist, genera:

1. El bloque de texto completo para actualizar la sección "Resultado" de la 
   Fase 4 en el ESTADO_EJECUCION.md, incluyendo la sección de 
   "Validación del pipeline" con los campos a completar.

2. El contenido completo del archivo RESUMEN_FASE_4.md con:
   - Fecha de ejecución
   - Estructura del workflow de GitHub Actions (jobs, steps y su propósito)
   - Variables de entorno configuradas (nombre y entorno, sin valores sensibles)
   - Estrategia de ramas implementada (main, develop, feature/*)
   - Configuración de Vercel (build command, Node version, etc.)
   - Resultado de la ejecución del CI en el PR de prueba
   - URL de preview generada por Vercel para el PR de prueba
   - Tiempos de ejecución del pipeline (GitHub Actions y Vercel)
   - Problemas encontrados y resoluciones
   - Tiempo total de ejecución de la fase
   - Criterios de salida verificados

No avances ni menciones la Fase 5 hasta que yo confirme que el 
RESUMEN_FASE_4.md ha sido creado y el ESTADO_EJECUCION.md actualizado.
```

---

---

# PROMPT-F5 — Fase 5: Deploy y Validación en Producción

> **Skill del agente:** Ingeniero Fullstack Senior + QA Engineer — Validación end-to-end  
> **Duración estimada:** Días 7–8  
> **Documentos requeridos:** PLAN_INFRAESTRUCTURA.md · PLAN_IMPLEMENTACION_FASES.md · ESTADO_EJECUCION.md  
> **Prerequisito:** Fase 4 en estado ✅ Completado

---

```
Actúa como Ingeniero Fullstack Senior y QA Engineer con experiencia en 
validación end-to-end de sistemas en producción, análisis de logs de deploy 
en Vercel, pruebas de APIs REST y auditorías de performance con Lighthouse. 
Tu responsabilidad es garantizar que el sistema funciona perfectamente en 
producción antes de declararlo completo.

DOCUMENTOS DE REFERENCIA:
Tienes adjuntos tres documentos que debes leer completamente antes de actuar:
1. PLAN_INFRAESTRUCTURA.md — arquitectura general del sistema
2. PLAN_IMPLEMENTACION_FASES.md — plan detallado de implementación por fases
3. ESTADO_EJECUCION.md — verifica que la Fase 4 está en estado Completado 
   antes de proceder. Si no lo está, detente e indícame que debo completar 
   la Fase 4 primero. Además, lee todas las fases anteriores del historial 
   para contexto completo del estado actual del proyecto.

ACCIÓN INMEDIATA AL INICIAR:
Lo primero que debes hacer es indicarme exactamente qué debo escribir en el 
ESTADO_EJECUCION.md para registrar el inicio de la Fase 5. Proporciona el 
bloque de texto completo y formateado listo para copiar y pegar, actualizando 
el panel de control general con estado "En progreso" para Fase 5 y la fecha 
y hora actual.

OBJETIVO DE ESTA FASE:
Ejecutar completamente la Fase 5 del PLAN_IMPLEMENTACION_FASES.md: 
"Deploy y Validación en Producción". Hacer el merge final a main, monitorear 
el deploy en Vercel y validar el funcionamiento completo del sistema en la 
URL pública de producción.

TAREAS A EJECUTAR (en orden estricto):
1. Darme los comandos Git exactos para el merge final de develop a main 
   con el mensaje de commit correcto para un merge no fast-forward.

2. Explicarme exactamente qué debo monitorear en el dashboard de Vercel 
   durante el deploy: dónde ver los logs, qué pasos esperar, cuánto 
   tiempo aproximado y cómo reconocer que el deploy fue exitoso.

3. Darme los comandos curl completos para probar cada endpoint de la API 
   en producción, con la URL de producción como placeholder 
   (https://TU-APP.vercel.app) y la respuesta JSON exacta esperada para:
   - GET /api/data/config → éxito
   - GET /api/data/pages%2Fhome → éxito  
   - GET /api/data/recurso-invalido → 404

4. Darme el checklist visual completo de la Fase 5 con descripción detallada 
   de qué debo ver en producción para cada punto.

5. Guiarme en la ejecución del checklist final de calidad TypeScript:
   - pnpm validate (comando completo que corre los 3 checks)
   - Interpretar el resultado esperado de cada check

6. Guiarme para ejecutar la auditoría Lighthouse en Chrome DevTools:
   - Pasos exactos para llegar a Lighthouse
   - Configuración recomendada para la auditoría
   - Cómo interpretar los resultados y qué score mínimo es aceptable

7. Entregarme el contenido completo del README.md actualizado con:
   - Nombre y descripción del proyecto
   - Badge de estado de Vercel (con placeholder de URL)
   - URL de producción
   - Tabla de entornos (main/develop)
   - Stack tecnológico
   - Instrucciones de instalación y desarrollo local
   - Comandos disponibles
   - Estructura del proyecto
   - Descripción de la capa de datos JSON
   - Enlace a los planes de documentación

VALIDACIÓN FINAL INTEGRAL:
Al tener todos los resultados reales, recorre conmigo el checklist completo 
de la Fase 5. Para cada ítem, dime exactamente qué resultado indica éxito y 
qué resultado indica un problema a resolver.

CRITERIOS DE SALIDA DEL PROYECTO:
Una vez completados todos los checklists, declara explícitamente si el 
sistema cumple todos los criterios de salida del proyecto según el 
PLAN_IMPLEMENTACION_FASES.md. Si alguno no se cumple, indica exactamente 
qué hacer para resolverlo.

ACCIÓN FINAL — REGISTRO DE CIERRE:
Al completar todas las tareas, el checklist y la validación final, genera:

1. El bloque de texto completo para actualizar la sección "Resultado" de la 
   Fase 5 en el ESTADO_EJECUCION.md, completando todos los campos de la 
   sección "Validación en producción".

2. La actualización completa del panel de control general del 
   ESTADO_EJECUCION.md marcando todas las fases como Completado y el 
   progreso global al 100%.

3. El contenido completo del archivo RESUMEN_FASE_5.md con:
   - Fecha de ejecución
   - URL de producción definitiva
   - Hash del commit de deploy final
   - Resultado de cada endpoint de API probado en producción
   - Resultado del checklist visual en producción
   - Scores de Lighthouse (Performance, Accessibility, Best Practices, SEO)
   - Resultado de pnpm validate
   - Tiempo de build en Vercel
   - Problemas encontrados en producción y resoluciones
   - Tiempo total de ejecución de la fase
   - Criterios de salida verificados

4. Un mensaje de cierre del proyecto con:
   - Resumen ejecutivo de todo lo construido
   - Stack completo con versiones
   - URLs del sistema (producción, repositorio GitHub)
   - Próximas extensiones recomendadas del plan de infraestructura
   - Fecha y estado final: SISTEMA EN PRODUCCIÓN ✅
```

---

---

## 📌 Referencia Rápida de Prompts

| Prompt | Fase | Skill | Prerequisito |
|---|---|---|---|
| PROMPT-F0 | Preparación del entorno | DevOps / Fullstack Senior | Ninguno |
| PROMPT-F1 | Fundación del proyecto | Fullstack Senior TypeScript | F0 ✅ |
| PROMPT-F2 | Capa de datos JSON | Fullstack Senior / Arquitectura | F1 ✅ |
| PROMPT-F3 | Home Hola Mundo | Diseñador UX/UI + Frontend Senior | F2 ✅ |
| PROMPT-F4 | CI/CD y Pipeline | DevOps Senior GitHub/Vercel | F3 ✅ |
| PROMPT-F5 | Deploy y Validación | Fullstack Senior + QA Engineer | F4 ✅ |

---

## 📎 Archivos de resumen generados por fase

Al ejecutar cada fase, se crea un archivo independiente de resumen:

```
RESUMEN_FASE_0.md  ← generado al completar Fase 0
RESUMEN_FASE_1.md  ← generado al completar Fase 1
RESUMEN_FASE_2.md  ← generado al completar Fase 2
RESUMEN_FASE_3.md  ← generado al completar Fase 3
RESUMEN_FASE_4.md  ← generado al completar Fase 4
RESUMEN_FASE_5.md  ← generado al completar Fase 5
```

Estos archivos son **independientes** del `ESTADO_EJECUCION.md`. El estado de ejecución tiene el historial completo y acumulativo. Los resúmenes de fase son documentos autocontenidos de cada etapa.

---

*Usar cada prompt completo, sin modificaciones, en una conversación nueva con los tres documentos de referencia adjuntos.*
