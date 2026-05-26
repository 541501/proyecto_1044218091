'use client';

import { Sidebar } from './Sidebar';
import { UserRole } from '@/lib/types';

export interface AppLayoutProps {
  children: React.ReactNode;
  role: UserRole;
  userName?: string;
  /** @deprecated — el sistema ya no usa modo seed */
  showSeedBanner?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, role, userName = '' }) => (
  <div className="min-h-screen bg-paper text-ink">
    <Sidebar role={role} userName={userName} />
    <main className="lg:ml-72 min-h-screen flex flex-col">
      <div className="flex-1 px-6 lg:px-12 py-10">{children}</div>
    </main>
  </div>
);
