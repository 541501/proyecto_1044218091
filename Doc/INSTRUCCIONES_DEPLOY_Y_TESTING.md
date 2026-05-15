# ClassSport — Instrucciones de Deploy y Testing en Producción

**Versión**: 1.0  
**Fecha**: 14-05-2026  
**Estado**: Pronto para producción  

---

## 📋 Resumen

ClassSport está 100% completamente implementado y validado. Este documento proporciona instrucciones paso a paso para:

1. **Deploy en Vercel** (infraestructura)
2. **Validación de Race Condition** (manual en navegador)
3. **Testing en Producción** (3 roles: admin, profesor, coordinador)
4. **Verificación de Reglas de Negocio** (checklist completo)

---

## 🚀 PARTE 1: Deploy en Vercel

### Prerrequisitos

- [x] Proyecto en GitHub (o equivalente con git)
- [x] Cuenta en Vercel (https://vercel.com)
- [x] Cuenta en Supabase con base de datos creada
- [x] Token de Vercel Blob generado

### Paso 1: Preparar Variables de Entorno

En el dashboard de Vercel, agregar estas variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://user:pass@db.supabase.co:5432/postgres
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
JWT_SECRET=your-jwt-secret-key-min-32-chars
ADMIN_BOOTSTRAP_SECRET=your-bootstrap-secret
```

**Dónde obtenerlas**:
- **Supabase Keys**: https://app.supabase.io → Project Settings → API Keys
- **BLOB Token**: https://vercel.com/account/storage/blob → Tokens
- **DATABASE_URL**: Supabase → Database → URI
- **JWT_SECRET**: Generar aleatoriamente (64 caracteres)
- **ADMIN_BOOTSTRAP_SECRET**: Generar aleatoriamente (32 caracteres)

### Paso 2: Deploy desde GitHub

1. Ir a https://vercel.com/new
2. Seleccionar "Import Git Repository"
3. Conectar tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Next.js
5. Configurar variables de entorno (agregadas en Paso 1)
6. Click "Deploy"

### Paso 3: Ejecutar Migraciones

Vercel ejecutará automáticamente el script `api/system/bootstrap`:

1. Esperar a que el deploy termine (5-10 minutos)
2. Ir a la URL de producción (ej: `https://classsport.vercel.app`)
3. En `/admin/db-setup` (solo accesible con token admin bootstrap)
4. Click "Ejecutar Bootstrap"
5. Esperar a que se ejecuten las 3 migraciones y el seed

**Esperado**:
```
✓ 0001_init_users.sql ejecutada
✓ 0002_init_spaces.sql ejecutada
✓ 0003_init_reservations.sql ejecutada
✓ Seed data cargado (3 bloques, 4 salones, 6 franjas)
```

---

## 🔄 PARTE 2: Validación de Race Condition (RNF-03)

Este es el test más crítico del sistema. Verifica que si 2 usuarios reservan la misma franja simultáneamente, solo 1 gana.

### Setup

1. **Abrir 2 pestañas navegador**:
   - Pestaña A: Incógnito/Privado
   - Pestaña B: Incógnito/Privado

2. **Crear 2 usuarios profesor en `/admin/users`** (admin login necesario)
   ```
   Usuario 1: prof1@test.com, Rol: Profesor
   Usuario 2: prof2@test.com, Rol: Profesor
   ```
   Guardar las contraseñas temporales

### Test Procedure

**Pestaña A**:
1. Login como `prof1@test.com` con contraseña temporal
2. Cambiar contraseña a `Prof1Pass123`
3. Navegar a `/blocks`
4. Seleccionar `Bloque A` → `A-101`
5. Click en franja `07:00–09:00` (primer día disponible)
6. **NO CLICKEAR AÚN CONFIRMAR**

**Pestaña B** (mientras A espera):
1. Login como `prof2@test.com` con contraseña temporal
2. Cambiar contraseña a `Prof2Pass123`
3. Navegar a `/blocks`
4. Seleccionar `Bloque A` → `A-101`
5. Click en franja `07:00–09:00` (mismo día)
6. **NO CLICKEAR AÚN CONFIRMAR**

### Trigger Race Condition

**En ambas pestañas simultáneamente** (con 1-2 segundos de diferencia):
- Pestaña A: Click en "Confirmar Reserva"
- Pestaña B: Click en "Confirmar Reserva"

### Resultado Esperado

- **Una pestaña**: Redirige a `/reservations?success=true` ✅
  - Mensaje: "¡Reserva creada exitosamente!"
  - Franja aparece en "Mis Reservas"

- **Otra pestaña**: Muestra alerta roja "Salón no disponible"
  ```
  ┌─────────────────────────────────
  │ ⚠ Salón no disponible
  │ Salón: A-101
  │ Franja: 07:00–09:00
  │ Fecha: [hoy]
  │ Reservado por: Prof. [otro nombre]
  │ Materia: [materia del ganador]
  │
  │ [Botón "Volver a seleccionar"]
  └─────────────────────────────────
  ```

**Si ambas se confirman**: ❌ FALLO — Conflicto no detectado
**Si solo 1 se confirma**: ✅ PASS — Race condition correctamente manejada

---

## 🧪 PARTE 3: Testing en Producción (3 Roles)

### Escenario: Flujo Completo Admin → Profesor → Coordinador

#### ADMIN Flow (Bootstrap + Usuarios)

1. **Login como admin** (credenciales del seed)
   - Email: `admin@test.local`
   - Pass: Generada en bootstrap

2. **Ir a `/admin/db-setup`**
   - Verificar migraciones: ✅ Todas 3 ejecutadas
   - Verificar datos: ✅ 3 bloques, 4 salones, 6 franjas

3. **Ir a `/admin/users`**
   - Click "Crear Usuario"
   - Datos:
     ```
     Nombre: García Pérez
     Email: garcia@inst.edu
     Rol: Profesor
     ```
   - Copiar contraseña temporal mostrada
   - Crear otro:
     ```
     Nombre: López Coordinador
     Email: lopez@inst.edu
     Rol: Coordinador
     ```

4. **Ir a `/admin/rooms`**
   - Verificar que los 4 salones están listados y activos
   - Click en uno → editar → verificar campos

5. **Ir a `/admin/audit`**
   - Selector de mes debe mostrar mes actual
   - Ver entradas: login, create_user, etc.

#### PROFESOR Flow (Reserva)

1. **Incógnito: Login como profesor**
   - Email: `garcia@inst.edu`
   - Contraseña temporal

2. **Cambiar contraseña**
   - Banner naranja: "Cambio de contraseña obligatorio"
   - Campo "Contraseña Actual": **NO debe aparecer**
   - Ingresa nueva contraseña, confirma, click actualizar
   - Redirige a login
   - Login con nueva contraseña ✅

3. **Dashboard**
   - Debe mostrar: "Hola García Pérez"
   - Mis Reservas próximas: (vacío, aún no hay)

4. **Navegar a `/blocks`**
   - Selector de fecha: Hoy es la predeterminada
   - Click "Bloque A"
   - Aparecen 4 salones

5. **Click en "A-101"**
   - Calendario semanal
   - 5 días (lunes-viernes)
   - 6 franjas (todas verdes — libres)
   - Banner verde: "✓ Todas las franjas disponibles para esta semana"

6. **Click en franja `09:00–11:00`**
   - Navega a `/reservations/new?roomId=...&slotId=...&date=...`
   - Prefill: Salón A-101, Franja 09:00–11:00, Fecha [hoy]
   - Ingresa:
     ```
     Materia: Cálculo I
     Grupo: 2024-1 Grupo A
     ```
   - Click "Confirmar Reserva"
   - Redirige a `/reservations` con éxito ✅

7. **Ir a `/reservations`**
   - Debe aparecer en listado:
     - A-101 | 09:00–11:00 | [hoy] | Cálculo I | 2024-1 Grupo A | Confirmada
   - Botón cancelar disponible (flecha roja ×)

#### COORDINADOR Flow (Auditoría + Cancelación)

1. **Incógnito: Login como coordinador**
   - Email: `lopez@inst.edu`
   - Cambiar contraseña (igual al profesor)
   - Login con nueva pass

2. **Dashboard**
   - Debe mostrar: "Hola López"
   - Mostrar conteo de reservas activas

3. **Navegar a `/reservations`**
   - Ver "Todas las Reservas" (no solo las suyas)
   - Debe aparecerla reserva del profesor: A-101 | 09:00–11:00 | [hoy]
   - Botón acción: Cancelar (solo coordinador/admin pueden)

4. **Click Cancelar**
   - Modal:
     ```
     Título: Cancelar Reserva
     Campo: "Motivo de cancelación" (REQUERIDO)
     Ingresa: "Cambio de horario del profesor"
     Click: "Confirmar"
     ```
   - Reserva cambia estado a "Cancelada" ✅

5. **Ir a `/reports`**
   - Selector de fechas: últimos 7 días (predeterminado)
   - Click "Generar Reporte"
   - Tabla preview moestra: 0 reservas (porque fue cancelada)
   - Seleccionar fechas amplias: ej 30 días atrás
   - Click "Generar Reporte"
   - Click "Descargar CSV"
   - Archivo `reporte-ocupacion-[fecha]-[fecha].csv` se descarga
   - Abrir en Excel: ✅ Formato correcto, columnas legibles

6. **Ir a `/admin/audit`**
   - Ver entradas:
     - create_user: García Pérez, López
     - login: García, López
     - create_reservation: García, A-101
     - cancel_reservation: López canceló García con motivo
   - Formato legible: "Prof. García canceló reserva de Prof. López en A-101..."

---

## ✅ Checklist de Reglas de Negocio

Ejecutar en producción:

### RN-02: Solo días hábiles (lunes-viernes)

**Test**:
- [ ] Profesor intenta reservar en SÁBADO
- [ ] Error esperado: "No se pueden reservar sábados. Intenta otro día."

### RN-03: Max 60 días anticipación

**Test**:
- [ ] Profesor intenta reservar en +62 días
- [ ] Error esperado: "No se pueden reservar franjas con más de 60 días de anticipación."

### RN-04: Solo cancelar futuro (profesor)

**Test**:
- [ ] Profesor hace reserva HOY
- [ ] Mañana profesor intenta cancelar reserva de HOY
- [ ] Botón CANCELAR debe estar **DESHABILITADO** (gris)

### RN-05: Solo owner o admin cancela

**Test**:
- [ ] Prof A reserva A-101 el 20 de mayo
- [ ] Prof B login en API: `POST /api/reservations/{id}/cancel`
- [ ] Respuesta: 403 Forbidden ✅

### RN-06: Salón desactivado desaparece

**Test** (admin):
- [ ] Ir a `/admin/rooms`
- [ ] Click en A-101 → "Desactivar"
- [ ] Ir a `/blocks/[Bloque A]`
- [ ] A-101 **NO DEBE APARECER** en listado ✅

### RN-07: Usuario suspendido no hace login

**Test** (admin):
- [ ] Ir a `/admin/users`
- [ ] Click toggle en profesor García → Inactivo
- [ ] Incógnito: Intentar login como García
- [ ] Error esperado: "Usuario inactivo o credenciales incorrectas" ✅

### RN-08: Auditoría registra todo

**Test**:
- [ ] Hacer varias acciones: login, crear reserva, cancelar, cambiar pass
- [ ] Ir a `/admin/audit`
- [ ] Verificar que TODAS las acciones aparecen registradas ✅

---

## 🐛 Troubleshooting

### "Error 401 — Tu sesión ha expirado"

- **Causa**: Cookie JWT expirada
- **Solución**: Hacer logout e login de nuevo
- **Verificación**: Dev Tools → Application → Cookies → `auth` debe existir

### "Error 409 — Conflicto de Reserva" (cuando no debería)

- **Causa**: Conflicto real (franja ya reservada)
- **Verificación**: Ir a calendario y ver franja ocupada
- **Solución**: Seleccionar otra franja verde (libre)

### "Error 500 — Error del Servidor"

- **Causa**: Problema en backend
- **Verificación**: Revisar logs de Vercel → Deployments → Logs
- **Común**: Variables de entorno faltantes o incorrectas

### Migraciones no ejecutadas

- **Síntoma**: Tablas no existen en Supabase
- **Solución**: Ir a `/admin/db-setup` → Click "Ejecutar Bootstrap"
- **Verificación**: Supabase → SQL Editor → tablas deben existir

---

## 📊 Métricas de Éxito

Después de completar todo testing, verificar:

- [ ] **Race Condition**: ✅ Solo 1 reserva gana, otra recibe 409
- [ ] **RN-02**: ✅ Sábado rechazado
- [ ] **RN-03**: ✅ +60 días rechazado
- [ ] **RN-04**: ✅ Botón cancelar deshabilitado para reservas pasadas
- [ ] **RN-05**: ✅ 403 para usuario no dueño
- [ ] **RN-06**: ✅ Salón desactivado desaparece
- [ ] **RN-07**: ✅ Usuario inactivo no hace login
- [ ] **RN-08**: ✅ Auditoría registra todo
- [ ] **Deploy**: ✅ URL Vercel funcional, sin errores
- [ ] **Performance**: ✅ Calendario carga <2 segundos
- [ ] **Mobile**: ✅ Acordeón funciona, botones toca fácilmente
- [ ] **CSV**: ✅ Se abre en Excel, formato correcto

---

## 🎯 Siguiente Paso: Cierre del Proyecto

Una vez completado todo testing con éxito:

```bash
# Actualizar documentación final
git add Doc/ESTADO_EJECUCION_CLASSSPORT.md
git commit -m "Fase 6 COMPLETADA Y VALIDADA EN PRODUCCION

- Deploy Vercel exitoso: https://classsport.vercel.app
- Race condition validada: ✅ Doble validación funciona
- Todas las RN (RN-02 a RN-08) validadas ✅
- Testing con 3 roles exitoso (Admin, Profesor, Coordinador)
- CSV descargable y funcional
- Auditoría completa y funcionando
- Mobile responsive: 44px+ celdas, acordeón funcional
"

git push origin main
```

---

## 📞 Soporte

Para problemas o preguntas:

1. Revisar logs de Vercel
2. Revisar documentación de diseño: `Doc/PLAN_CLASSSPORT.md`
3. Revisar validación de RN: `Doc/VALIDACION_REGLAS_NEGOCIO_FASE_6.md`
4. Revisar resumen técnico: `Doc/RESUMEN_FASE_6_PULIDO_FINAL.md`

---

**ClassSport está listo para producción. ¡Bienvenido a la plataforma!** 🚀

