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
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const mustChange = searchParams.get('action') === 'change-password';

  const handleLogout = async () => {
    try {
      // Clear sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('currentUser');
      }
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {}
    router.replace('/login');
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    let autoRedirectId: NodeJS.Timeout | undefined;
    let fetchTimeoutId: NodeJS.Timeout | undefined;
    let isMounted = true;
    
    // Auto-redirect después de 25 segundos si no carga
    autoRedirectId = setTimeout(() => {
      if (isMounted) {
        console.log('[profile] Auto-redirecting due to timeout');
        router.push('/login');
      }
    }, 25000);
    
    // Mostrar botón de logout después de 10 segundos
    timeoutId = setTimeout(() => {
      if (isMounted) {
        console.log('[profile] Showing logout button due to timeout');
        setLoadingTimeout(true);
      }
    }, 10000);

    (async () => {
      try {
        console.log('[profile] Fetching user data...');
        
        // First, try to get user from sessionStorage (just logged in)
        let userData = null;
        if (typeof window !== 'undefined') {
          const storedUser = sessionStorage.getItem('currentUser');
          if (storedUser) {
            console.log('[profile] User found in sessionStorage');
            userData = JSON.parse(storedUser);
            sessionStorage.removeItem('currentUser'); // Remove after using
          }
        }
        
        // If not in sessionStorage, fetch from server
        if (!userData) {
          const controller = new AbortController();
          fetchTimeoutId = setTimeout(() => {
            console.log('[profile] Aborting fetch (timeout)');
            controller.abort();
          }, 15000);
          
          const res = await fetch('/api/auth/me', { 
            credentials: 'include',
            signal: controller.signal 
          });
          clearTimeout(fetchTimeoutId);
          
          if (!res.ok) {
            if (isMounted) {
              console.log('[profile] Fetch failed with status:', res.status);
              if (res.status === 401 || res.status === 403) {
                router.push('/login');
              }
            }
            return;
          }
          
          const data = await res.json();
          userData = data.user;
        }
        
        if (isMounted && userData) {
          console.log('[profile] User data loaded successfully');
          setUser(userData);
          if (autoRedirectId) clearTimeout(autoRedirectId);
          if (timeoutId) clearTimeout(timeoutId);
          if (userData.must_change_password) {
            addToast('Debes cambiar tu contraseña antes de continuar', 'warning');
          }
        }
      } catch (err) {
        if (isMounted) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          console.error('[profile] Fetch error:', errorMsg, err);
          // No redirigir aquí, dejar que el auto-redirect maneje esto después de 25s
          // Esto permite que el usuario tenga acceso al botón de logout
        }
      }
    })();
    
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (autoRedirectId) clearTimeout(autoRedirectId);
      if (fetchTimeoutId) clearTimeout(fetchTimeoutId);
    };
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
        const data = await res.json();
        addToast('Contraseña actualizada con éxito', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        if (mustChange) {
          // After forced password change, redirect to dashboard
          console.log('[profile] Forced password change successful, redirecting to dashboard');
          setTimeout(() => router.push('/dashboard'), 1500);
        } else {
          // For voluntary password change, update the user state with new token
          console.log('[profile] Password change successful');
          // The new cookie will be set automatically by the response header
          // No need to do anything else - user is already authenticated
        }
      }
    } catch (err) {
      console.error('[profile] Password change error:', err);
      addToast('Error al cambiar contraseña', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper text-ink-mute">
        <div className="text-center">
          <div className="font-mono text-sm uppercase tracking-wide mb-6">
            {loadingTimeout ? 'Sesión tardando en cargar' : 'Cargando perfil…'}
          </div>
          <div className="mx-auto h-6 w-6 rounded-full border-2 border-brand border-t-transparent animate-spin mb-8" />
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-ink text-paper border border-ink hover:bg-ink-soft transition-colors font-mono text-sm uppercase tracking-wide"
          >
            Cerrar sesión
          </button>
        </div>
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
