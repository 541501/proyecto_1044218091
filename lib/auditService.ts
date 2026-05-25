import 'server-only';
import { getSupabaseAdmin } from './supabase';

export type AuditOperation = 'INSERT' | 'UPDATE' | 'DELETE';
export type AuditEntity = 'reservation' | 'room' | 'user';

export interface AuditEntry {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  user_role: 'profesor' | 'coordinador' | 'admin';
  operation: AuditOperation;
  entity: AuditEntity;
  entity_id?: string | null;
  summary: string;
  metadata?: Record<string, unknown> | null;
}

export type AuditEntryInput = Omit<AuditEntry, 'id' | 'timestamp'>;

export interface AuditFilters {
  from?: string;
  to?: string;
  userId?: string;
  entity?: AuditEntity;
  operation?: AuditOperation;
  limit?: number;
}

export async function appendAudit(entry: AuditEntryInput): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('audit_log').insert({
    user_id: entry.user_id,
    user_email: entry.user_email,
    user_role: entry.user_role,
    operation: entry.operation,
    entity: entry.entity,
    entity_id: entry.entity_id ?? null,
    summary: entry.summary,
    metadata: entry.metadata ?? null,
  });
  if (error) {
    console.error('[auditService] insert failed:', error);
  }
}

export async function listAudit(filters: AuditFilters = {}): Promise<AuditEntry[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase.from('audit_log').select('*').order('timestamp', { ascending: false });

  if (filters.from) query = query.gte('timestamp', filters.from);
  if (filters.to) query = query.lte('timestamp', filters.to);
  if (filters.userId) query = query.eq('user_id', filters.userId);
  if (filters.entity) query = query.eq('entity', filters.entity);
  if (filters.operation) query = query.eq('operation', filters.operation);
  query = query.limit(filters.limit ?? 200);

  const { data, error } = await query;
  if (error) {
    console.error('[auditService] list failed:', error);
    return [];
  }
  return (data ?? []) as AuditEntry[];
}
