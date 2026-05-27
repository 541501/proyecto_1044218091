import { z } from 'zod';

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email('Email inválido').transform(e => e.toLowerCase()),
  password: z.string().min(1, 'Contraseña requerida'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z
    .string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener mayúsculas, minúsculas y números'
    ),
});

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const createUserSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100),
  email: z.string().email('Email inválido').transform(e => e.toLowerCase()),
  role: z.enum(['profesor', 'coordinador', 'admin']),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['profesor', 'coordinador', 'admin']).optional(),
  is_active: z.boolean().optional(),
});
