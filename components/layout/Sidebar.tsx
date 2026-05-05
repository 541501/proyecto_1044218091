'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '@/lib/types';

export interface SidebarProps {
  role: UserRole;
  userName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, userName }) => {
  const pathname = usePathname();

  // Definir menú según rol
  const menuItems: { label: string; href: string; show: boolean }[] = [
    { label: 'Inicio', href: '/dashboard', show: true },
    { label: 'Bloques', href: '/blocks', show: true },
    { label: 'Mis Reservas', href: '/reservations/my', show: role === 'profesor' },
    { label: 'Todas las Reservas', href: '/reservations', show: role === 'coordinador' || role === 'admin' },
    { label: 'Reportes', href: '/reports', show: role === 'coordinador' || role === 'admin' },
    { label: 'Administración', href: '/admin/db-setup', show: role === 'admin' },
    { label: 'Perfil', href: '/profile', show: true },
  ];

  const isActive = (href: string) => {
    return pathname?.startsWith(href) || pathname === href;
  };

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col">
      {/* Header */}
      <div className="px-6 py-8 border-b border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold">CS</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">ClassSport</h1>
            <p className="text-xs text-slate-400">Gestión de Salones</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.filter(item => item.show).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
              isActive(item.href)
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User Info */}
      <div className="px-4 py-6 border-t border-slate-700 text-xs text-slate-400">
        <p className="truncate font-medium text-slate-300 mb-1">{userName}</p>
        <p className="capitalize">{role}</p>
      </div>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-slate-700">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-all"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
};
