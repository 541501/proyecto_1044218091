'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Edit2, ToggleRight, Copy, AlertCircle } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'profesor' | 'coordinador' | 'admin';
  is_active: boolean;
  last_login_at: string | null;
}

interface CreateUserModalState {
  open: boolean;
  name: string;
  email: string;
  role: 'profesor' | 'coordinador' | 'admin';
  tempPassword?: string;
  loading: boolean;
  error: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [createModal, setCreateModal] = useState<CreateUserModalState>({
    open: false,
    name: '',
    email: '',
    role: 'profesor',
    loading: false,
    error: ''
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load user and users list
  useEffect(() => {
    const loadData = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const userData = await meRes.json();
          setUser(userData.user);
        } else {
          router.push('/login');
          return;
        }

        const usersRes = await fetch('/api/users');
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  // Handle user creation
  const handleCreateUser = async () => {
    setCreateModal(prev => ({ ...prev, error: '', loading: true }));

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createModal.name,
          email: createModal.email,
          role: createModal.role
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Show temporary password in modal
        setCreateModal(prev => ({
          ...prev,
          tempPassword: data.temporaryPassword,
          loading: false,
          name: '',
          email: '',
          role: 'profesor'
        }));

        // Refresh users list
        const usersRes = await fetch('/api/users');
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
        }
      } else {
        const errorData = await response.json();
        setCreateModal(prev => ({
          ...prev,
          error: errorData.error || 'Error al crear el usuario',
          loading: false
        }));
      }
    } catch (err: any) {
      setCreateModal(prev => ({
        ...prev,
        error: 'Error al crear el usuario: ' + err.message,
        loading: false
      }));
    }
  };

  const handleCopyPassword = () => {
    if (createModal.tempPassword) {
      navigator.clipboard.writeText(createModal.tempPassword);
      setCopiedId('password');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: !currentStatus
        })
      });

      if (response.ok) {
        // Refresh users list
        const usersRes = await fetch('/api/users');
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
        }
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: any = {
      profesor: 'Profesor',
      coordinador: 'Coordinador',
      admin: 'Administrador'
    };
    return labels[role] || role;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Nunca';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AppLayout role={user?.role} userName={user?.name} showSeedBanner>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestión de Usuarios</h1>
            <p className="text-slate-600">
              Crea y administra las cuentas de usuario del sistema
            </p>
          </div>
          <Button
            onClick={() => setCreateModal(prev => ({ ...prev, open: true }))}
            className="bg-blue-600 hover:bg-blue-700"
          >
            + Crear Usuario
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg text-red-900">
            {error}
          </div>
        )}

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-slate-600">Cargando usuarios...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
            <div className="text-slate-600">No hay usuarios registrados</div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Rol
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Último Acceso
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                        {u.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{u.email}</td>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {getRoleLabel(u.role)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            u.is_active
                              ? 'bg-green-100 text-green-900'
                              : 'bg-slate-100 text-slate-900'
                          }`}
                        >
                          {u.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {formatDate(u.last_login_at)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleActive(u.id, u.is_active)}
                            className={`p-2 rounded transition-colors ${
                              u.is_active
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={u.is_active ? 'Desactivar' : 'Activar'}
                          >
                            <ToggleRight size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {createModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Crear Nuevo Usuario
            </h3>

            {!createModal.tempPassword ? (
              <>
                {/* Form */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={createModal.name}
                      onChange={(e) =>
                        setCreateModal(prev => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Ej: Juan García"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={createModal.email}
                      onChange={(e) =>
                        setCreateModal(prev => ({ ...prev, email: e.target.value }))
                      }
                      placeholder="juan@universidad.edu"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Rol *
                    </label>
                    <select
                      value={createModal.role}
                      onChange={(e) =>
                        setCreateModal(prev => ({
                          ...prev,
                          role: e.target.value as any
                        }))
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="profesor">Profesor</option>
                      <option value="coordinador">Coordinador</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>

                {/* Error */}
                {createModal.error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded text-red-900 text-sm">
                    {createModal.error}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setCreateModal(prev => ({
                        ...prev,
                        open: false,
                        name: '',
                        email: '',
                        role: 'profesor',
                        error: ''
                      }))
                    }
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateUser}
                    disabled={
                      createModal.loading ||
                      !createModal.name ||
                      !createModal.email
                    }
                  >
                    {createModal.loading ? 'Creando...' : 'Crear Usuario'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Show Temporary Password */}
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-300 rounded-lg">
                    <div className="flex gap-2 mb-2">
                      <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-blue-900">
                          Contraseña Temporal Generada
                        </div>
                        <div className="text-sm text-blue-800 mt-1">
                          Esta es la única vez que se muestra. Cópiala en un lugar seguro.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Contraseña Temporal
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={createModal.tempPassword}
                        readOnly
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-mono text-sm"
                      />
                      <button
                        onClick={handleCopyPassword}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="Copiar"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                    {copiedId === 'password' && (
                      <div className="text-xs text-green-600 mt-1">✓ Copiado</div>
                    )}
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-sm text-amber-900">
                    <strong>Recuerda:</strong> El usuario deberá cambiar esta contraseña
                    al hacer login por primera vez.
                  </div>

                  <div className="flex gap-3 justify-end">
                    <Button
                      onClick={() =>
                        setCreateModal(prev => ({
                          ...prev,
                          open: false,
                          tempPassword: undefined,
                          name: '',
                          email: '',
                          role: 'profesor',
                          error: ''
                        }))
                      }
                    >
                      Listo
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
