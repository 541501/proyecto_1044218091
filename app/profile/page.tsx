'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Suspense, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500">Cargando…</div>}>
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
  const mustChangePassword = searchParams.get('action') === 'change-password';

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) router.push('/login');
      else {
        const data = await res.json();
        setUser(data.user);
        
        // If must_change_password but no current password field shown, inform user
        if (data.user.must_change_password) {
          addToast('Debes cambiar tu contraseña antes de acceder al sistema', 'warning');
        }
      }
    })();
  }, [router, addToast]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mustChangePassword && !currentPassword) {
      // For initial password change, no need for current password
      if (newPassword !== confirmPassword) {
        addToast('Las contraseñas no coinciden', 'error');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newPassword }),
        });

        if (!res.ok) {
          const err = await res.json();
          addToast(err.error || 'Error al cambiar contraseña', 'error');
        } else {
          addToast('Contraseña actualizada exitosamente. Por favor inicia sesión nuevamente.', 'success');
          // Redirect to login to get new JWT without must_change_password flag
          setTimeout(() => router.push('/login'), 2000);
        }
      } catch (err) {
        console.error('Error:', err);
        addToast('Error al cambiar contraseña', 'error');
      } finally {
        setLoading(false);
      }
    } else {
      // Regular password change (requires current password)
      if (newPassword !== confirmPassword) {
        addToast('Las contraseñas no coinciden', 'error');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword, newPassword }),
        });

        if (!res.ok) {
          const err = await res.json();
          addToast(err.error || 'Error al cambiar contraseña', 'error');
        } else {
          addToast('Contraseña actualizada exitosamente', 'success');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }
      } catch (err) {
        console.error('Error:', err);
        addToast('Error al cambiar contraseña', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  if (!user) return <div className="text-center py-20">Cargando...</div>;

  return (
    <AppLayout role={user.role} userName={user.email}>
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Perfil</h1>
          <p className="text-slate-600">Administra tu información personal y contraseña</p>
        </div>

        {mustChangePassword && (
          <div className="bg-orange-50 border border-orange-300 rounded-lg p-4 flex gap-3">
            <div className="flex-shrink-0 text-orange-600 text-lg">⚠️</div>
            <div>
              <p className="font-semibold text-orange-900">Cambio de contraseña obligatorio</p>
              <p className="text-sm text-orange-800 mt-1">Debes cambiar tu contraseña antes de poder acceder al sistema.</p>
            </div>
          </div>
        )}

        <Card>
          <CardTitle>Información Personal</CardTitle>
          <CardContent className="mt-4 space-y-3">
            <div>
              <label className="text-sm text-slate-600">Nombre</label>
              <p className="font-medium text-slate-900">{user.name || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Email</label>
              <p className="font-medium text-slate-900">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-slate-600">Rol</label>
              <p className="font-medium text-slate-900 capitalize">{user.role}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>{mustChangePassword ? 'Establecer Nueva Contraseña' : 'Cambiar Contraseña'}</CardTitle>
          <CardContent className="mt-4">
            <form onSubmit={handleChangePassword} className="space-y-4">
              {!mustChangePassword && (
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Mínimo 8 caracteres, incluye mayúscula, minúscula y números
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <Button type="submit" variant="primary" isLoading={loading} disabled={loading} className="w-full">
                Actualizar Contraseña
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
