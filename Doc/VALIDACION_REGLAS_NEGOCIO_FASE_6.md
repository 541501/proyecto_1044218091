# Validación de Reglas de Negocio — Fase 6

**Última Actualización**: 08-05-2026 23:50  
**Estado**: Verificación manual pendiente en producción

---

## Reglas de Negocio Implementadas

| ID | Regla | Implementación | Estado |
|---|---|---|---|
| **RN-01** | Una reserva es única: no puede haber 2 reservas del mismo profesor para el mismo salón, franja y fecha | Índice UNIQUE parcial en tabla + `checkConflict()` en service | ✅ |
| **RN-02** | No se pueden reservar sábados ni domingos | `validateReservationRules()` verifica `dayOfWeek` | ✅ |
| **RN-03** | No se pueden reservar con más de 60 días de anticipación | `validateReservationRules()` valida `daysDiff <= 60` | ✅ |
| **RN-04** | Solo se pueden cancelar reservas futuras (profesor) o cualquier reserva (admin/coordinador) | `canCancelReservation()` check fecha > hoy | ✅ |
| **RN-05** | Solo el profesor dueño o un admin/coordinador pueden cancelar una reserva | `withRole()` + verificación `professor_id` | ✅ |
| **RN-06** | Un salón desactivado no aparece en búsqueda de disponibilidad | Query filtra `is_active = true` | ✅ |
| **RN-07** | Un usuario suspendido no puede hacer login | `getUserByEmail()` verifica `is_active` | ✅ |
| **RN-08** | Toda operación sobre reservas se registra en auditoría | `recordAudit()` después de cada operación | ✅ |

---

## Pruebas Manuales Requeridas

### Test 1: RN-02 — Intentar reservar sábado

**Paso 1**: Usuario profesor hace login  
**Paso 2**: Va a /blocks → selecciona un salón  
**Paso 3**: Intenta cambiar la fecha del calendar a un sábado (ej: 11/05/2026)  
**Paso 4**: ✅ **Esperado**: La celda no es clickable (gris), no se puede hacer reserva

**Alternativa con API** (test directo):
```bash
# Intenta crear reserva para sábado
curl -X POST http://localhost:3000/api/reservations \
  -H "Cookie: jwt=<token>" \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": "uuid",
    "slot_id": "uuid",
    "reservation_date": "2026-05-11",  # Sábado
    "subject": "Test",
    "group_name": "2024-1 A"
  }'
```
**✅ Esperado**: Response 400 con error "Las reservas solo pueden realizarse de lunes a viernes"

---

### Test 2: RN-03 — Intentar reservar 62 días en el futuro

**Paso 1**: Profesor hace login hoy (08/05/2026)  
**Paso 2**: Intenta reservar para 70 días después (17/07/2026)  
**Paso 3**: ✅ **Esperado**: Error "No se pueden reservar franjas con más de 60 días de anticipación"

**Verificación en código**:
```typescript
// lib/reservationService.ts línea 32
const daysDiff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
if (daysDiff > 60) {
  errors.push('No se pueden reservar franjas con más de 60 días de anticipación');
}
```

---

### Test 3: RN-04 — Intentar cancelar reserva pasada

**Paso 1**: Profesor hace login  
**Paso 2**: Va a /reservations  
**Paso 3**: Observa una reserva de ayer (07/05/2026)  
**Paso 4**: ✅ **Esperado**: No hay botón de cancelación visible (está deshabilitado)

**Verificación en código**:
```typescript
// app/reservations/page.tsx línea ~95
const canCancelReservation = (reservation: Reservation): boolean => {
  if (reservation.status !== 'confirmada') return false;
  if (isAdmin) return true;

  // For professor: only future reservations
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const resDate = new Date(reservation.reservation_date);
  resDate.setHours(0, 0, 0, 0);

  return resDate > today;  // ← Solo futuro
};
```

---

### Test 4: RN-05 — Profesor intenta cancelar reserva de otro profesor

**Paso 1**: Admin crea 2 profesores: Prof A y Prof B  
**Paso 2**: Prof A crea una reserva  
**Paso 3**: Logout, login como Prof B  
**Paso 4**: Va a /reservations  
**Paso 5**: Intenta cancelar la reserva de Prof A vía API o UI  
**Paso 6**: ✅ **Esperado**: Error 403 "No tienes permisos para esta acción"

**Verificación en código**:
```typescript
// app/api/reservations/[id]/route.ts
if (user.role === 'profesor' && reservation.professor_id !== user.id) {
  return NextResponse.json(
    { error: 'No tienes permisos para cancelar esta reserva' },
    { status: 403 }
  );
}
```

---

### Test 5: RN-06 — Salón desactivado no aparece en búsqueda

**Paso 1**: Admin hace login → /admin/rooms (suponiendo que existe)  
**Paso 2**: Encuentra un salón activo (ej: A-101)  
**Paso 3**: Lo desactiva (toggle is_active = false)  
**Paso 4**: Logout, login como profesor  
**Paso 5**: Va a /blocks → Bloque A  
**Paso 6**: ✅ **Esperado**: A-101 no aparece en la lista de salones

**Verificación en código**:
```typescript
// lib/dataService.ts - getRooms()
.eq('is_active', true)  // ← Solo activos
```

---

### Test 6: RN-07 — Usuario suspendido no puede hacer login

**Paso 1**: Admin crea un profesor  
**Paso 2**: Admin lo desactiva (is_active = false)  
**Paso 3**: Intenta login con ese usuario  
**Paso 4**: ✅ **Esperado**: Error "Usuario no activo" o "Credenciales inválidas"

**Verificación en código**:
```typescript
// app/api/auth/login/route.ts
const user = await dataService.getUserByEmail(email);
if (!user || !user.is_active) {
  return NextResponse.json(
    { error: 'Credenciales inválidas' },
    { status: 401 }
  );
}
```

---

### Test 7: RN-08 — Operaciones registradas en auditoría

**Paso 1**: Profesor crea una reserva  
**Paso 2**: Admin hace login → /admin/audit  
**Paso 3**: Navega al mes actual  
**Paso 4**: ✅ **Esperado**: Aparece entrada:
   - Usuario: profesor@uni.edu
   - Acción: `create_reservation`
   - Descripción: "Prof. [Nombre] reservó [Salón] el [Fecha] ([Franja]) para [Materia]"

---

## Notas de Implementación

### Validación de Conflictos (Doble Capa)

1. **Servicio** (`lib/reservationService.ts`):
   ```typescript
   const conflict = await checkConflict(roomId, slotId, date);
   if (conflict) {
     return 409 con detalles del conflicto
   }
   ```

2. **Base de datos** (Índice UNIQUE parcial):
   ```sql
   CREATE UNIQUE INDEX idx_reservations_unique_confirmed
   ON reservations(room_id, slot_id, reservation_date)
   WHERE status = 'confirmada'
   ```
   → Si dos requests llegan simultáneamente (race condition RNF-03), el segundo falla en INSERT

---

## Checklist de Validación Previa a Deploy

- [ ] Test RN-02: Sábado rechazado
- [ ] Test RN-03: 62 días rechazado
- [ ] Test RN-04: Botón cancelación deshabilitado para ayer
- [ ] Test RN-05: Prof B no puede cancelar reserva de Prof A (403)
- [ ] Test RN-06: Salón desactivado no aparece
- [ ] Test RN-07: Usuario suspendido no puede login
- [ ] Test RN-08: Auditoría registra todas las acciones
- [ ] Race condition RNF-03: Dos requests simultáneos → solo uno triunfa
- [ ] npm run typecheck: 0 errores
- [ ] npm run build: exitoso

---

**Próximo paso**: Deploy en Vercel + Testing en Producción (Fase 6.9)
