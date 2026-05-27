'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { IconDot, IconAlert, IconKey, IconUser } from '@/components/icons';

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-ink-mute font-mono text-sm uppercase">Cargando…</div>}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const mustChange = searchParams.get('action') === 'change-password';

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) return router.push('/login');
      const data = await res.json();
      setUser(data.user);
      if (data.user.must_change_password) {
        addToast('Debes cambiar tu contraseña antes de continuar', 'warning');
      }
    })();
  }, [router, addToast]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return addToast('Las contraseñas no coinciden', 'error');
    }
    setLoading(true);
    try {
      const body: any = { newPassword };
      if (!mustChange) body.currentPassword = currentPassword;
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        addToast(err.error || 'Error al cambiar contraseña', 'error');
      } else {
        addToast('Contraseña actualizada con éxito', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (mustChange) setTimeout(() => router.push('/login'), 1500);
      }
    } catch {
      addToast('Error al cambiar contraseña', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-mute font-mono text-sm uppercase tracking-wide">
        Cargando perfil…
      </div>
    );
  }

  return (
    <AppLayout role={user.role} userName={user.name || user.email}>
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 animate-rise">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-mute mb-3">
            <IconDot size={6} className="text-accent" />
            <span>Tu cuenta</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-[0.95] text-ink">
            Perfil
            <span className="italic text-accent"> personal</span>
          </h1>
        </header>

        {mustChange ? (
          <div className="mb-8 flex items-start gap-3 px-5 py-4 border-l-4 border-accent bg-accent-soft text-warn">
            <IconAlert size={18} className="mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <strong className="font-semibold text-ink">Cambio obligatorio.</strong>{' '}
              Debes definir una nueva contraseña antes de continuar usando el sistema.
            </div>
          </div>
        ) : null}

        {/* Identity */}
        <section className="mb-10">
          <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute mb-3 inline-flex items-center gap-2">
            <IconUser size={14} />
            Identidad
          </div>
          <div className="grid sm:grid-cols-3 gap-px bg-rule border border-rule">
            <Field label="Nombre" value={user.name || '—'} />
            <Field label="Correo" value={user.email} mono />
            <Field label="Rol" value={user.role} capitalize />
          </div>
        </section>

        {/* Change password */}
        <section>
          <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute mb-3 inline-flex items-center gap-2">
            <IconKey size={14} />
            Seguridad
          </div>
          <div className="border border-rule bg-surface p-6">
            <h2 className="font-display text-2xl text-ink leading-tight mb-1">
              {mustChange ? 'Establece tu nueva contraseña' : 'Cambiar contraseña'}
            </h2>
            <p className="text-sm text-ink-soft">
              Usa una combinación segura: mínimo 8 caracteres con mayúsculas, minúsculas y números.
            </p>

            <form onSubmit={handleChangePassword} className="mt-6 space-y-5">
              {!mustChange ? (
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-2">
                    Contraseña actual
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="field"
                    required
                  />
                </div>
              ) : null}

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-2">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="field"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-2">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="field"
                  required
                />
              </div>

              <div className="pt-4 border-t border-rule flex justify-end">
                <Button type="submit" variant="primary" isLoading={loading}>
                  <IconKey size={14} />
                  Actualizar contraseña
                </Button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

function Field({
  label,
  value,
  mono,
  capitalize,
}: {
  label: string;
  value: string;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="bg-surface px-5 py-4">
      <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute">{label}</div>
      <div
        className={[
          'mt-1 text-ink',
          mono ? 'font-mono text-[14px]' : 'font-display text-xl',
          capitalize ? 'capitalize' : '',
        ].join(' ')}
      >
        {value}
      </div>
    </div>
  );
}
