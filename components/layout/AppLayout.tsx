'use client';

import { Sidebar } from './Sidebar';
import { UserRole } from '@/lib/types';

export interface AppLayoutProps {
  children: React.ReactNode;
  role: UserRole;
  userName?: string;
  showSeedBanner?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, role, userName = '', showSeedBanner = false }) => (
  <div className="flex">
    <Sidebar role={role} userName={userName} />
    <main className="flex-1 ml-64">
      {showSeedBanner && (
        <div className="w-full px-6 py-3 text-center border-b" style={{ backgroundColor: 'var(--seed-bg)', borderColor: 'var(--seed-border)', color: 'var(--seed-text)' }}>
          <p className="text-sm font-medium">
            🌱 Modo desarrollo (sin base de datos). Accede a{' '}
            <a href="/admin/db-setup" className="font-semibold underline hover:no-underline">
              /admin/db-setup
            </a>{' '}
            para ejecutar el bootstrap.
          </p>
        </div>
      )}
      <div className="p-8">
        {children}
      </div>
    </main>
  </div>
);
