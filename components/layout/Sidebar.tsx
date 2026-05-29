'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserRole } from '@/lib/types';
import {
  IconBookOpen,
  IconColumns,
  IconCalendar,
  IconClipboard,
  IconChart,
  IconShield,
  IconUser,
  IconUsers,
  IconLogout,
  IconDot,
  IconDoorway,
  IconArchive,
  IconSettings,
  IconClock,
} from '@/components/icons';

export interface SidebarProps {
  role: UserRole;
  userName: string;
}

interface NavItem {
  label: string;
  hint: string;
  href: string;
  icon: React.ReactNode;
  show: boolean;
}

const ROLE_LABEL: Record<UserRole, string> = {
  profesor: 'Docente',
  coordinador: 'Coordinación',
  admin: 'Administración',
};

export const Sidebar: React.FC<SidebarProps> = ({ role, userName }) => {
  const pathname = usePathname();
  const router = useRouter();

  const general: NavItem[] = [
    { label: 'Panel', hint: '01', href: '/dashboard', icon: <IconBookOpen size={18} />, show: true },
    { label: 'Bloques', hint: '02', href: '/blocks', icon: <IconColumns size={18} />, show: true },
    {
      label: 'Mis reservas',
      hint: '03',
      href: '/reservations/my',
      icon: <IconCalendar size={18} />,
      show: role === 'profesor',
    },
    {
      label: 'Reservas',
      hint: '03',
      href: '/reservations',
      icon: <IconClipboard size={18} />,
      show: role === 'coordinador' || role === 'admin',
    },
    {
      label: 'Reportes',
      hint: '04',
      href: '/reports',
      icon: <IconChart size={18} />,
      show: role === 'coordinador' || role === 'admin',
    },
  ];

  const adminItems: NavItem[] = [
    { label: 'Solicitudes', hint: '05', href: '/admin/requests', icon: <IconClipboard size={18} />, show: true },
    { label: 'Horarios', hint: '06', href: '/admin/horarios', icon: <IconClock size={18} />, show: true },
    { label: 'Historial', hint: '07', href: '/admin/historial', icon: <IconArchive size={18} />, show: true },
    { label: 'Salones', hint: '08', href: '/admin/rooms', icon: <IconDoorway size={18} />, show: true },
    { label: 'Usuarios', hint: '09', href: '/admin/users', icon: <IconUsers size={18} />, show: true },
    { label: 'Auditoría', hint: '10', href: '/admin/audit', icon: <IconArchive size={18} />, show: true },
    { label: 'Sistema', hint: '11', href: '/admin/db-setup', icon: <IconSettings size={18} />, show: true },
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const renderItem = (item: NavItem) => {
    const active = isActive(item.href);
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          className={[
            'flex items-center gap-3 px-3 py-2.5 text-sm transition-colors group relative',
            active
              ? 'bg-accent text-[#0B1538]'
              : 'text-ink-soft hover:text-ink hover:bg-paper-soft',
          ].join(' ')}
        >
          <span
            className={[
              'font-mono text-[10px] w-5',
              active ? 'text-[#0B1538]/70' : 'text-ink-mute group-hover:text-ink-soft',
            ].join(' ')}
          >
            {item.hint}
          </span>
          <span className={active ? 'text-[#0B1538]' : ''}>{item.icon}</span>
          <span className="flex-1">{item.label}</span>
          {active ? <IconDot size={6} className="text-[#0B1538]" /> : null}
        </Link>
      </li>
    );
  };

  return (
    <aside
      className="hidden lg:flex w-72 h-screen fixed left-0 top-0 flex-col bg-paper border-r border-rule"
      aria-label="Navegación principal"
    >
      {/* Brand */}
      <div className="px-7 pt-8 pb-6">
        <Link href="/dashboard" className="block group">
          <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute mb-2">
            Institución Universitaria
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl text-ink leading-none">ClassSport</span>
            <IconDot size={6} className="text-accent" />
          </div>
          <div className="text-[12px] text-ink-soft mt-1 font-mono">
            v1.0 · Salones universitarios
          </div>
        </Link>
      </div>

      <div className="rule mx-7" />

      {/* Navigation */}
      <nav className="flex-1 px-4 py-5 overflow-y-auto">
        <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute px-3 mb-2">
          Secciones
        </div>
        <ul className="space-y-px">{general.filter((i) => i.show).map(renderItem)}</ul>

        {role === 'admin' ? (
          <>
            <div className="mt-7 px-3 mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-ink-mute">
              <IconShield size={12} />
              <span>Administración</span>
            </div>
            <ul className="space-y-px">{adminItems.filter((i) => i.show).map(renderItem)}</ul>
          </>
        ) : null}
      </nav>

      <div className="rule mx-7" />

      {/* User */}
      <div className="px-7 py-5">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-ink-mute mb-1">
          <IconUser size={12} />
          <span>Sesión activa</span>
        </div>
        <Link href="/profile" className="block group">
          <div className="font-display text-lg text-ink leading-tight truncate group-hover:underline decoration-accent">
            {userName || 'Sin nombre'}
          </div>
        </Link>
        <div className="text-[12px] text-ink-soft mt-0.5">{ROLE_LABEL[role] ?? role}</div>

        <button
          onClick={handleLogout}
          className="mt-4 inline-flex items-center gap-2 text-[12px] uppercase tracking-wide text-ink-soft hover:text-ink transition-colors group"
        >
          <IconLogout size={14} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};
