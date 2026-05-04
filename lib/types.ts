// ============================================================================
// AUTH AND USER TYPES
// ============================================================================

export type UserRole = 'profesor' | 'coordinador' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  role?: UserRole;
  is_active?: boolean;
  must_change_password?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ============================================================================
// DOMAIN TYPES (Blocks, Slots, Rooms, Reservations)
// ============================================================================

export interface Block {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

export interface Slot {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  order_index: number;
  is_active: boolean;
}

export interface Room {
  id: string;
  block_id: string;
  code: string;
  type: 'salon' | 'laboratorio' | 'auditorio' | 'sala_computo' | 'otro';
  capacity: number;
  equipment: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  room_id: string;
  slot_id: string;
  professor_id: string;
  reservation_date: string; // YYYY-MM-DD
  subject: string;
  group_name: string;
  status: 'confirmada' | 'cancelada';
  cancellation_reason: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  created_by: string;
  created_at: string;
}

// ============================================================================
// JWT PAYLOAD
// ============================================================================

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
  must_change_password?: boolean;
}
