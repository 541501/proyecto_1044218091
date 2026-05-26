'use client';

import { Sidebar } from './Sidebar';
import { UserRole } from '@/lib/types';
import { IconAlert, IconArrowRight } from '@/components/icons';
import Link from 'next/link';

export interface AppLayoutProps {
  children: React.ReactNode;
  role: UserRole;
  userName?: string;
  showSeedBanner?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  role,
  userName = '',
  showSeedBanner = false,
}) => (
  <div className="min-h-screen bg-paper text-ink">
    <Sidebar role={role} userName={userName} />
    <main className="lg:ml-72 min-h-screen flex flex-col">
      {showSeedBanner ? (
        <div className="bg-[var(--seed-bg)] border-b border-[var(--seed-border)] text-[var(--seed-text)]">
          <div className="px-6 py-3 flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2.5">
              <IconAlert size={16} />
              <span>
                <strong className="font-semibold">Modo seed.</strong>{' '}
                Aplica el bootstrap para activar la base de datos.
              </span>
            </div>
            {role === 'admin' ? (
              <Link
                href="/admin/db-setup"
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide hover:underline"
              >
                Ir a configuración <IconArrowRight size={12} />
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="flex-1 px-6 lg:px-12 py-10">{children}</div>
    </main>
  </div>
);
