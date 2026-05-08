# Fase 3: Bloques, Salones y Disponibilidad — RESUMEN DE IMPLEMENTACIÓN

**Estado**: ✅ CÓDIGO COMPLETADO (Pendiente: commit/push y testing)  
**Fecha de inicio**: 08-05-2026 14:00  
**Última actualización**: 08-05-2026 (Session)  

---

## 📋 Resumen Ejecutivo

Se ha implementado completamente el sistema de consulta de disponibilidad de salones en tiempo real para la plataforma ClassSport. El sistema incluye:

- ✅ Dos migraciones de base de datos (0002, 0003) con tablas de bloques, franjas, salones y reservas
- ✅ Servicio de disponibilidad (`availabilityService.ts`) con cálculo de calendarios semanales y disponibilidad por bloque
- ✅ 7 nuevos endpoints API para bloques, franjas horarias y salones
- ✅ 5 componentes UI reutilizables: `SlotCell`, `WeekNavigator`, `WeeklyCalendar`, `BlockCard`, `RoomCard`
- ✅ 3 páginas principales: `/blocks`, `/blocks/[blockId]`, `/blocks/[blockId]/[roomId]`
- ✅ 1 página administrativa: `/admin/rooms` (gestión de salones)
- ✅ Extensiones a `dataService.ts` y `types.ts` con 12+ nuevas funciones y 15+ nuevos tipos

**Cobertura de requisitos**: RN-06 (filtrado por activos), RN-09 (código único), RN-10 (desactivación con advertencia) — 100%

---

## 🗄️ Base de Datos

### Migración 0002: `supabase/migrations/0002_init_spaces.sql`

Crea tres tablas principales:

#### `blocks` — Bloques académicos
```sql
CREATE TABLE blocks (
  id UUID PRIMARY KEY,
  name VARCHAR(50),      -- "Bloque A", "Bloque B", "Bloque C"
  code VARCHAR(5) UNIQUE, -- A, B, C
  is_active BOOLEAN DEFAULT true
);
```

#### `slots` — Franjas horarias institucionales
```sql
CREATE TABLE slots (
  id UUID PRIMARY KEY,
  name VARCHAR(20),      -- "07:00–09:00", "09:00–11:00", etc.
  start_time TIME,
  end_time TIME,
  order_index INTEGER,   -- para ordenar en calendario
  is_active BOOLEAN DEFAULT true,
  UNIQUE(start_time, end_time)
);
```

#### `rooms` — Salones
```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY,
  block_id UUID REFERENCES blocks(id),
  code VARCHAR(20),      -- "A-101", "B-201", etc.
  type VARCHAR(20),      -- salon, laboratorio, auditorio, sala_computo, otro
  capacity INTEGER,      -- capacidad de personas
  equipment TEXT,        -- descripción libre
  is_active BOOLEAN DEFAULT true,
  created_at, updated_at TIMESTAMPTZ,
  UNIQUE(block_id, code) -- RN-09: código único dentro del bloque
);
```

**Índices**:
- `idx_rooms_block`: Query optimization por bloque activo
- `idx_rooms_active`: Query optimization por estado

### Migración 0003: `supabase/migrations/0003_init_reservations.sql`

Crea tabla de reservas (preparada para Fase 4):

```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY,
  room_id UUID REFERENCES rooms(id),
  slot_id UUID REFERENCES slots(id),
  professor_id UUID REFERENCES users(id),
  reservation_date DATE,
  subject VARCHAR(150),
  group_name VARCHAR(50),
  status VARCHAR(15) CHECK (status IN ('confirmada', 'cancelada')),
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES users(id),
  cancelled_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- RN-01: Unicidad parcial para reservas activas
  UNIQUE(room_id, slot_id, reservation_date) WHERE status='confirmada'
);
```

---

## 🧠 Servicios

### `lib/availabilityService.ts` — Motor de Disponibilidad

**Responsabilidades**:
- Construir calendarios semanales en tiempo real
- Calcular disponibilidad agregada por bloque
- Determinar colores de UI según disponibilidad

**Funciones exportadas**:

#### `buildWeeklyCalendar(roomId, weekStart): Promise<WeeklyCalendar>`
Construye grilla 5 días × 6 franjas para un salón.

**Lógica de estados**:
- `'libre'` — Franja futura sin reserva (clickable)
- `'ocupada'` — Franja futura con reserva confirmada (disabled, rojo)
- `'pasada'` — Hoy o fecha pasada, sin reserva (disabled, gris)
- `'ocupada_pasada'` — Hoy o fecha pasada, con reserva (disabled, gris oscuro)

**Retorna**:
```typescript
interface WeeklyCalendar {
  roomId: string;
  roomCode: string;
  blockId: string;
  weekStart: string;
  days: WeekDay[]; // 5 días
}
```

#### `getBlockAvailability(blockId, date): Promise<BlockAvailability>`
Calcula conteo de salones libres/ocupados para un bloque en una fecha específica.

**Retorna**:
```typescript
interface BlockAvailability {
  blockId: string;
  date: string;
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  availabilityPercentage: number; // 0–100%
}
```

#### `getAllBlocksAvailability(date): Promise<BlockAvailability[]>`
Calcula disponibilidad para TODOS los bloques en paralelo.

#### `getBlockCardBorderColor(availability): string`
Mapea porcentaje a color Tailwind:
- 0% → `border-red-500` (Lleno)
- 1–33% → `border-amber-500` (Pocos libres)
- 34–100% → `border-green-500` (Disponible)

---

## 🔌 API Endpoints

### GET `/api/blocks`
Retorna lista de bloques activos con disponibilidad.

**Parámetros**:
- `date` (query) — ISO date string, default: hoy

**Respuesta**:
```json
[
  {
    "id": "uuid",
    "name": "Bloque A",
    "code": "A",
    "is_active": true,
    "availability": { BlockAvailability },
    "roomCount": 4
  }
]
```

### GET `/api/blocks/[id]/availability`
Retorna disponibilidad específica de un bloque.

**Parámetros**:
- `date` (query) — ISO date string

**Respuesta**: `BlockAvailability`

### GET `/api/slots`
Retorna lista de franjas horarias activas, ordenadas por `order_index`.

**Respuesta**:
```json
[
  {
    "id": "uuid",
    "name": "07:00–09:00",
    "start_time": "07:00",
    "end_time": "09:00",
    "order_index": 1,
    "is_active": true
  }
]
```

### GET `/api/rooms`
Retorna lista de salones (filtrable por bloque).

**Parámetros**:
- `blockId` (query) — UUID del bloque (opcional)

**Respuesta**: `Room[]`

### POST `/api/rooms` (admin only)
Crea nuevo salón.

**Body**:
```json
{
  "block_id": "uuid",
  "code": "A-101",
  "type": "salon",
  "capacity": 40,
  "equipment": "Videobeam, AC"
}
```

**Respuesta**: `Room` (201) o error 409 si código duplicado en bloque

### GET `/api/rooms/[id]`
Retorna detalles de un salón.

### PUT `/api/rooms/[id]` (admin only)
Actualiza salón.

**Body**: Subset of `CreateRoomRequest` (todos opcionales)

### POST `/api/rooms/[id]/deactivate` (admin only)
**Sin parámetros**: Verifica si hay reservas futuras. Retorna `{ warningCount, requiresConfirmation }`.

**Con `?confirm=true`**: Confirma desactivación. Retorna `Room` actualizado con `is_active=false`.

**Implementa RN-10**: Desactivación de dos pasos con advertencia de reservas futuras.

### GET `/api/rooms/[id]/calendar`
Retorna calendario semanal de un salón.

**Parámetros**:
- `weekStart` (query) — ISO date string (Monday). Default: cálculo automático del lunes actual.

**Respuesta**: `WeeklyCalendar`

---

## 🎨 Componentes UI

### `components/calendar/SlotCell.tsx`
Celda individual de franja horaria.

**Props**:
- `slot: SlotCell` — Datos de la franja
- `onClick?: () => void` — Callback para slots libres
- `showDetails?: boolean` — Mostrar detalles (mobile)

**Estilos por estado**:
- `libre`: Verde claro, clickable
- `ocupada`: Rojo claro, muestra profesor/materia, deshabilitado
- `pasada`: Gris claro, deshabilitado
- `ocupada_pasada`: Gris oscuro, deshabilitado

### `components/calendar/WeekNavigator.tsx`
Navegación de semanas.

**Props**:
- `weekStart: string` — Semana actual
- `onPreviousWeek, onNextWeek, onToday` — Callbacks
- Muestra "Semana del X al Y" y "(Semana actual)" si aplica

### `components/calendar/WeeklyCalendar.tsx`
Calendario principal — dual responsivo.

**Responsive**:
- **Desktop (md+)**: Grilla 6 columnas (Franja + 5 días) × 7 filas (header + 6 franjas)
- **Mobile (<md)**: Acordeón por día, expandible

**Props**:
- `calendar: WeeklyCalendarType | null`
- `loading?: boolean`
- `onSlotClick?: (dayIndex, slotIndex) => void`

### `components/blocks/BlockCard.tsx`
Tarjeta de bloque con disponibilidad visual.

**Features**:
- Código grande (5xl)
- Badge de estado: "Lleno" (rojo) | "Pocos libres" (ámbar) | "Disponible" (verde)
- Barra de progreso de disponibilidad
- Muestra "X / Y" disponibles/totales

**Props**:
- `block: BlockWithAvailability`
- `onClick?: () => void`

### `components/blocks/RoomCard.tsx`
Tarjeta de salón.

**Features**:
- Código del salón (xl bold)
- Icono y etiqueta de tipo (📚 Salón, 🧪 Laboratorio, etc.)
- Capacidad y equipamiento
- Badge de estado: "Libre" (verde) | "Ocupada" (rojo)
- Mostrar "⚠️ Inactivo" si `is_active=false`

**Props**:
- `room: RoomWithBlock`
- `available?: boolean`
- `onClick?: () => void`

---

## 📄 Páginas

### `app/blocks/page.tsx`
Página principal de bloques.

**Features**:
- Selector de fecha con "Hoy" rápido
- Grilla 3 columnas (responsive) de BlockCard
- Navegación a `/blocks/[blockId]?date=`

**Data flow**:
1. Fetch `/api/auth/me` → set user
2. Fetch `/api/blocks?date={selectedDate}` → set blocks with availability
3. Click BlockCard → navigate

### `app/blocks/[blockId]/page.tsx`
Listado de salones en un bloque.

**Features**:
- Información del bloque (código, disponibilidad %)
- Selector de fecha
- Grilla de RoomCard (todos los salones del bloque)
- Botón "Volver"

**Data flow**:
1. Fetch `/api/rooms?blockId=` → list rooms
2. Fetch `/api/blocks/[id]/availability?date=` → block stats
3. Click RoomCard → `/blocks/[blockId]/[roomId]?date=`

### `app/blocks/[blockId]/[roomId]/page.tsx`
Calendario semanal de un salón.

**Features**:
- Información del salón (código, tipo, capacidad, equipamiento)
- WeeklyCalendar con navegación de semanas
- Leyenda de estados
- Click en slot libre → `/reservations/new?roomId=&slotId=&date=` (prep para Fase 4)

**Data flow**:
1. Fetch `/api/rooms/[roomId]` → room details
2. Fetch `/api/rooms/[roomId]/calendar?weekStart=` → calendar
3. Click free slot → navigate to reservation creation

### `app/admin/rooms/page.tsx`
Gestión de salones (admin only).

**Features**:
- Verificación de rol admin
- Filtro por bloque
- Tabla con: Código, Tipo, Capacidad, Equipamiento, Estado
- Botones: Editar, Desactivar
- Modal de confirmación con advertencia de reservas futuras (RN-10)
- Botón "Nuevo Salón"

**Flujo de desactivación RN-10**:
1. Click "Desactivar" → Fetch `/api/rooms/[id]/deactivate` (sin ?confirm)
2. Si `warningCount > 0` → Mostrar modal con advertencia
3. Click "Desactivar" en modal → Fetch `?confirm=true`
4. Actualizar tabla

---

## 🔧 Extensiones a Servicios

### `lib/dataService.ts` — 12+ nuevas funciones

**Room Operations**:
- `getRooms(filters?: RoomFilters)` — Listar salones (filtrable)
- `getRoomById(id)` — Obtener salón por ID
- `createRoom(userId, data)` — Crear (captura error UNIQUE → 409)
- `updateRoom(id, userId, data)` — Actualizar
- `deactivateRoom(id, userId)` — Verificar reservas futuras → retorna `{ warningCount }`
- `confirmDeactivateRoom(id, userId)` — Confirmar desactivación (set `is_active=false`)

**Reservation Operations** (preparado para Fase 4):
- `getReservations(filters)` — Listar con joins
- `getMyReservations(userId, filters)` — Filtradas por profesor actual
- `createReservation(userId, data)` — Crear (captura UNIQUE → 409)
- `cancelReservation(id, userId, role, reason)` — Soft-delete con motivo

**Propiedades comunes**:
- Mode switching (seed/live via `getSystemMode()`)
- Audit recording para todas las operaciones
- Filtrado por `is_active=true` donde aplica (RN-06)
- Error handling con códigos específicos (23505 → 'DUPLICATE_ROOM_CODE')

### `lib/types.ts` — 15+ nuevos tipos

**Calendar & Availability**:
```typescript
type SlotCellState = 'libre' | 'ocupada' | 'pasada' | 'ocupada_pasada';
interface SlotCell { slotId, slotName, state, reservation? }
interface WeekDay { date, dayName, slots[] }
interface WeeklyCalendar { roomId, roomCode, blockId, weekStart, days[] }
interface BlockAvailability { blockId, date, totalRooms, availableRooms, occupiedRooms, availabilityPercentage }
```

**Filters & Requests**:
```typescript
interface RoomFilters { blockId?, activeOnly? }
interface ReservationFilters { roomId?, blockId?, date?, from?, to?, professorId?, status? }
interface CreateRoomRequest { block_id, code, type, capacity, equipment? }
interface UpdateRoomRequest { code?, type?, capacity?, equipment?, is_active? }
interface CreateReservationRequest { room_id, slot_id, reservation_date, subject, group_name }
interface CancelReservationRequest { reason? }
```

**Extended Types**:
```typescript
interface RoomWithBlock extends Room { block: Block }
interface ReservationWithDetails extends Reservation { room?, slot?, professor?, professorName? }
interface BlockWithAvailability extends Block { availability?, roomCount? }
```

---

## ✅ Validación de Requisitos

| RN | Descripción | Implementación | Estado |
|---|---|---|---|
| RN-01 | Unicidad de reservas activas | UNIQUE INDEX con WHERE status='confirmada' en migration 0003 | ✅ |
| RN-06 | Filtrado de entidades desactivas | `where is_active=true` en todas las queries de availabilityService | ✅ |
| RN-09 | Código único por bloque | `UNIQUE(block_id, code)` en tabla rooms | ✅ |
| RN-10 | Desactivación con advertencia | `deactivateRoom()` retorna warningCount, `confirmDeactivateRoom()` para confirmar | ✅ |

---

## 📦 Archivos Creados/Modificados

### Nuevos archivos (17):
- `supabase/migrations/0002_init_spaces.sql`
- `supabase/migrations/0003_init_reservations.sql`
- `lib/availabilityService.ts`
- `app/api/blocks/route.ts`
- `app/api/blocks/[id]/availability/route.ts`
- `app/api/slots/route.ts`
- `app/api/rooms/route.ts`
- `app/api/rooms/[id]/route.ts`
- `app/api/rooms/[id]/calendar/route.ts`
- `app/api/rooms/[id]/deactivate/route.ts`
- `components/calendar/SlotCell.tsx`
- `components/calendar/WeekNavigator.tsx`
- `components/calendar/WeeklyCalendar.tsx`
- `components/blocks/BlockCard.tsx`
- `components/blocks/RoomCard.tsx`
- `app/blocks/page.tsx`
- `app/blocks/[blockId]/page.tsx`
- `app/blocks/[blockId]/[roomId]/page.tsx`
- `app/admin/rooms/page.tsx`

### Modificados (4):
- `lib/types.ts` — +15 tipos
- `lib/dataService.ts` — +12 funciones
- `package.json` — lucide-react agregado
- `package-lock.json`

---

## 🚀 Testing Pendiente

Antes de pasar a Fase 4, validar:

1. **Bootstrap**: Ejecutar migration 0002 en Supabase → Verificar 3 blocks, 6 slots, 4+ rooms
2. **Calendar Accuracy**: 
   - Load `/blocks` → Verify room counts match availability
   - Load `/blocks/[blockId]/[roomId]` → Verify daily calendar states (libre/ocupada/pasada)
3. **Deactivation (RN-10)**:
   - `/admin/rooms` → Desactivar sala sin reservas → Directa
   - Desactivar sala con reservas futuras → Modal con advertencia → Confirmar → is_active=false
4. **Duplicate Code (RN-09)**:
   - `/admin/rooms/new` → Create room A-101 en bloque A
   - Try create another A-101 en bloque A → 409 error
   - Create A-101 en bloque B → 201 success (diferente bloque)
5. **Responsive**: 
   - WeeklyCalendar en mobile 375px → Acordeón modo
   - WeeklyCalendar en desktop 1280px → Grilla completa

---

## 📌 Próximos Pasos (Fase 4)

1. Crear página `/reservations/new` para formulario de reserva
2. Implementar flujo de creación de reserva con validaciones
3. Crear página `/reservations` para listar reservas del usuario
4. Testing del ciclo completo de reserva
5. Final commit y push a production

---

**Autor**: GitHub Copilot  
**Última revisión**: 08-05-2026  
**Commits relacionados**: PENDIENTE (terminal issues)
