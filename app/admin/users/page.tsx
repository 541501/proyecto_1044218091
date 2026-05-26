'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  IconPlus,
  IconPencil,
  IconKey,
  IconAlert,
  IconCheck,
  IconDot,
  IconShield,
} from '@/components/icons';

type Role = 'profesor' | 'coordinador' | 'admin';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  last_login_at: string | null;
}

const ROLE_LABEL: Record<Role, string> = {
  profesor: 'Profesor',
  coordinador: 'Coordinador',
  admin: 'Administrador',
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ kind: 'ok' | 'warn'; text: string } | null>(null);

  // Create
  const [openCreate, setOpenCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('profesor');
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Edit
  const [openEdit, setOpenEdit] = useState(false);
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<Role>('profesor');
  const [editActive, setEditActive] = useState(true);
  const [editError, setEditError] = useState<string | null>(null);

  const refresh = async () => {
    const r = await fetch('/api/users');
    if (r.ok) setUsers(await r.json());
  };

  useEffect(() => {
    (async () => {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) return router.replace('/login');
      const userData = (await meRes.json()).user;
      if (userData?.role !== 'admin') return router.replace('/dashboard');
      setMe(userData);
      await refresh();
      setLoading(false);
    })();
  }, [router]);

  const flashToast = (kind: 'ok' | 'warn', text: string) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreate = async () => {
    setCreateError(null);
    if (!newName.trim() || !newEmail.trim()) {
      setCreateError('Nombre y email son requeridos.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), email: newEmail.trim(), role: newRole }),
      });
      if (res.ok) {
        const data = await res.json();
        setTempPassword(data.temporaryPassword);
        await refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setCreateError(data.error || 'Error al crear el usuario.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (!tempPassword) return;
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeCreate = () => {
    setOpenCreate(false);
    setNewName('');
    setNewEmail('');
    setNewRole('profesor');
    setTempPassword(null);
    setCreateError(null);
  };

  const openEditModal = (u: UserRow) => {
    setEditTarget(u);
    setEditName(u.name);
    setEditRole(u.role);
    setEditActive(u.is_active);
    setEditError(null);
    setOpenEdit(true);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setEditError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/users/${editTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          role: editRole,
          is_active: editActive,
        }),
      });
      if (res.ok) {
        setOpenEdit(false);
        await refresh();
        flashToast('ok', 'Usuario actualizado.');
      } else {
        const data = await res.json().catch(() => ({}));
        setEditError(data.error || 'Error al actualizar el usuario.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (u: UserRow) => {
    const res = await fetch(`/api/users/${u.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !u.is_active }),
    });
    if (res.ok) {
      await refresh();
      flashToast(u.is_active ? 'warn' : 'ok', u.is_active ? 'Usuario suspendido.' : 'Usuario reactivado.');
    }
  };

  const fmtDate = (s: string | null) => {
    if (!s) return <span className="italic text-ink-mute">Nunca</span>;
    return new Date(s).toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AppLayout role={me?.role || 'admin'} userName={me?.name}>
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 animate-rise">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-mute mb-3">
            <IconDot size={6} className="text-accent" />
            <span>Administración · Personas</span>
          </div>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h1 className="font-display text-5xl md:text-6xl leading-[0.95] text-ink">
              Usuarios
              <span className="italic text-accent"> del sistema</span>
            </h1>
            <Button variant="ink" onClick={() => setOpenCreate(true)}>
              <IconPlus size={14} />
              Nuevo usuario
            </Button>
          </div>
        </header>

        {toast ? (
          <div
            className={[
              'mb-6 px-4 py-3 border-l-2 text-sm inline-flex items-center gap-2.5',
              toast.kind === 'ok' ? 'border-ok bg-ok-bg/60 text-ok' : 'border-warn bg-warn-bg/60 text-warn',
            ].join(' ')}
          >
            <IconCheck size={16} />
            {toast.text}
          </div>
        ) : null}

        {loading ? (
          <div className="text-center py-12 font-mono text-sm uppercase tracking-wide text-ink-mute">
            Cargando usuarios…
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            eyebrow="Sin usuarios"
            title="No hay cuentas registradas"
            description="Crea las cuentas iniciales para coordinadores y docentes."
            action={{ label: 'Crear usuario', onClick: () => setOpenCreate(true) }}
          />
        ) : (
          <div className="border border-rule bg-surface overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-paper-soft border-b border-rule">
                <tr className="text-left text-ink-mute">
                  <Th>Nombre</Th>
                  <Th>Correo</Th>
                  <Th>Rol</Th>
                  <Th>Estado</Th>
                  <Th>Último acceso</Th>
                  <Th className="text-right">Acciones</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {users.map((u) => (
                  <tr key={u.id} className={u.is_active ? '' : 'opacity-70'}>
                    <td className="px-4 py-3">
                      <div className="font-display text-base text-ink">{u.name}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-ink-soft">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.role === 'admin' ? 'accent' : 'info'}>
                        {ROLE_LABEL[u.role]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.is_active ? 'success' : 'default'}>
                        {u.is_active ? 'Activo' : 'Suspendido'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-ink-soft font-mono text-[12px]">
                      {fmtDate(u.last_login_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-ink-mute hover:text-brand hover:bg-brand-tint transition-colors"
                          title="Editar usuario"
                        >
                          <IconPencil size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={[
                            'p-1.5 transition-colors',
                            u.is_active
                              ? 'text-ink-mute hover:text-bad hover:bg-bad-bg'
                              : 'text-ink-mute hover:text-ok hover:bg-ok-bg',
                          ].join(' ')}
                          title={u.is_active ? 'Suspender' : 'Reactivar'}
                        >
                          <IconShield size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create modal */}
        <Modal
          isOpen={openCreate}
          onClose={closeCreate}
          title="Crear nuevo usuario"
          eyebrow="Cuenta institucional"
          size="md"
          actions={
            tempPassword
              ? [{ label: 'Listo', variant: 'ink', onClick: closeCreate }]
              : [
                  {
                    label: 'Crear cuenta',
                    variant: 'ink',
                    onClick: handleCreate,
                    isLoading: submitting,
                  },
                ]
          }
        >
          {tempPassword ? (
            <div className="space-y-4">
              <div className="flex items-start gap-2.5 px-4 py-3 border-l-2 border-warn bg-warn-bg/70 text-warn text-sm">
                <IconAlert size={16} className="mt-0.5" />
                <span>
                  Esta es la <strong>única vez</strong> que se muestra la contraseña temporal. Cópiala y entrégasela al usuario.
                </span>
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-2">
                  Contraseña temporal
                </label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={tempPassword}
                    className="field font-mono text-lg flex-1"
                  />
                  <button
                    onClick={handleCopy}
                    className="h-[42px] px-3 border border-ink bg-ink text-paper inline-flex items-center gap-2 hover:bg-[#1F2630] transition-colors"
                    title="Copiar"
                  >
                    <IconKey size={14} />
                    <span className="font-mono text-[11px] uppercase tracking-wide">
                      {copied ? 'Copiado' : 'Copiar'}
                    </span>
                  </button>
                </div>
              </div>
              <p className="text-xs text-ink-soft">
                El usuario deberá cambiar la contraseña en su primer inicio de sesión.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {createError ? (
                <div className="px-4 py-3 border-l-2 border-bad bg-bad-bg text-bad text-sm inline-flex items-center gap-2.5">
                  <IconAlert size={16} />
                  <span>{createError}</span>
                </div>
              ) : null}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-2">
                  01 · Nombre completo
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="field"
                  placeholder="Ej. María Fernanda López"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-2">
                  02 · Correo institucional
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="field"
                  placeholder="maria.lopez@institucion.edu.co"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-2">
                  03 · Rol
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['profesor', 'coordinador', 'admin'] as Role[]).map((r) => {
                    const active = newRole === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setNewRole(r)}
                        className={[
                          'px-3 py-2 border text-sm transition-colors',
                          active
                            ? 'bg-ink text-paper border-ink'
                            : 'border-rule text-ink-soft hover:border-ink hover:text-ink',
                        ].join(' ')}
                      >
                        <span className="font-mono text-[11px] uppercase tracking-wide">
                          {ROLE_LABEL[r]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Edit modal */}
        <Modal
          isOpen={openEdit}
          onClose={() => setOpenEdit(false)}
          title={editTarget ? `Editar ${editTarget.name}` : 'Editar usuario'}
          eyebrow="Actualizar cuenta"
          actions={[
            {
              label: 'Guardar',
              variant: 'ink',
              onClick: handleEdit,
              isLoading: submitting,
            },
          ]}
        >
          <div className="space-y-5">
            {editError ? (
              <div className="px-4 py-3 border-l-2 border-bad bg-bad-bg text-bad text-sm inline-flex items-center gap-2.5">
                <IconAlert size={16} />
                <span>{editError}</span>
              </div>
            ) : null}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="field"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-2">
                Rol
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['profesor', 'coordinador', 'admin'] as Role[]).map((r) => {
                  const active = editRole === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setEditRole(r)}
                      className={[
                        'px-3 py-2 border text-sm transition-colors',
                        active
                          ? 'bg-ink text-paper border-ink'
                          : 'border-rule text-ink-soft hover:border-ink hover:text-ink',
                      ].join(' ')}
                    >
                      <span className="font-mono text-[11px] uppercase tracking-wide">
                        {ROLE_LABEL[r]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="inline-flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={editActive}
                onChange={(e) => setEditActive(e.target.checked)}
                className="h-4 w-4 accent-ink"
              />
              <span className="text-sm text-ink">Cuenta activa</span>
            </label>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={[
        'px-4 py-3 font-mono text-[10px] uppercase tracking-wide font-medium',
        className,
      ].join(' ')}
    >
      {children}
    </th>
  );
}
