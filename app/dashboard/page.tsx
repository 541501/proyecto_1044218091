'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  IconCalendar,
  IconCalendarPlus,
  IconArrowRight,
  IconColumns,
  IconChart,
  IconDot,
  IconClock,
  IconBookOpen,
} from '@/components/icons';

interface User {
  userId: string;
  email: string;
  role: 'profesor' | 'coordinador' | 'admin';
  name?: string;
}

const ROLE_LEAD: Record<string, string> = {
  profesor: 'Panel del docente',
  coordinador: 'Coordinación académica',
  admin: 'Administración del sistema',
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleEmergencyLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('[logout]', err);
    } finally {
      router.push('/login');
    }
  };

  useEffect(() => {
    (async () => {
      try {
        console.log('[dashboard] Fetching user data...');
        
        // Fetch con timeout de 10 segundos
        const meController = new AbortController();
        const meTimeoutId = setTimeout(() => meController.abort(), 10000);
        
        const meRes = await fetch('/api/auth/me', { 
          credentials: 'include',
          signal: meController.signal 
        });
        clearTimeout(meTimeoutId);
        
        console.log('[dashboard] /api/auth/me response:', meRes.status);
        
        if (!meRes.ok) {
          const errorData = await meRes.json().catch(() => ({}));
          console.error('[dashboard] Auth error:', errorData);
          throw new Error(errorData.error || 'Not authenticated');
        }
        
        const meData = await meRes.json();
        console.log('[dashboard] User data:', meData.user?.email);
        setUser(meData.user);

        // Try to fetch dashboard data, but don't fail if it doesn't exist
        try {
          const dashController = new AbortController();
          const dashTimeoutId = setTimeout(() => dashController.abort(), 10000);
          
          const dashRes = await fetch('/api/dashboard', { 
            credentials: 'include',
            signal: dashController.signal 
          });
          clearTimeout(dashTimeoutId);
          
          if (dashRes.ok) {
            const dashData = await dashRes.json();
            setDashboardData(dashData.data ?? dashData);
          }
        } catch (dashErr) {
          console.warn('[dashboard] Dashboard data fetch failed (non-blocking):', dashErr);
          // Continue anyway - dashboard data is optional
        }
      } catch (err) {
        console.error('[dashboard] Load error:', err);
        // Dar un pequeño delay antes de redirigir para evitar loops
        setTimeout(() => router.push('/login'), 500);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper text-ink-soft font-mono text-sm uppercase tracking-wide">
        <div className="text-center">
          <div className="mb-4">Cargando panel…</div>
          <button
            onClick={handleEmergencyLogout}
            disabled={isLoggingOut}
            className="px-3 py-2 text-xs bg-ink text-paper hover:bg-ink-soft disabled:opacity-50 transition-colors"
          >
            {isLoggingOut ? 'Cerrando…' : 'Cerrar sesión'}
          </button>
        </div>
      </div>
    );
  }

  const firstName = user.name?.split(' ')[0] || user.email.split('@')[0];
  const today = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <AppLayout role={user.role} userName={user.name || user.email}>
      <div className="max-w-6xl mx-auto">
        {/* Editorial header */}
        <header className="mb-12 animate-rise">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-mute mb-3">
            <IconDot size={6} className="text-accent" />
            <span>{ROLE_LEAD[user.role] ?? user.role}</span>
            <span className="text-ink-mute/40">/</span>
            <span className="capitalize">{today}</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-[0.95] text-ink">
            Buen día,
            <span className="italic text-accent"> {firstName}</span>.
          </h1>
          <p className="mt-4 max-w-xl text-ink-soft text-[15px] leading-relaxed">
            {user.role === 'profesor'
              ? 'Aquí encuentras tu actividad académica, próximas reservas y el acceso rápido para crear una nueva.'
              : 'Vista de conjunto de la ocupación institucional, con acciones rápidas para gestión y reportería.'}
          </p>

          <div className="rule mt-10" />
        </header>

        {/* Profesor */}
        {user.role === 'profesor' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <section className="lg:col-span-2 space-y-8">
              <Module
                eyebrow="Hoy · Reservas confirmadas"
                title="Tus clases del día"
                count={dashboardData?.todayReservations?.length ?? 0}
              >
                {dashboardData?.todayReservations?.length ? (
                  <ReservationList items={dashboardData.todayReservations} />
                ) : (
                  <EmptyState
                    eyebrow="Sin actividad"
                    title="No tienes clases hoy"
                    description="Cuando tengas reservas confirmadas para hoy aparecerán acá."
                  />
                )}
              </Module>

              <Module
                eyebrow="Próximos 7 días"
                title="Reservas en agenda"
                count={dashboardData?.upcomingReservations?.length ?? 0}
              >
                {dashboardData?.upcomingReservations?.length ? (
                  <ReservationList items={dashboardData.upcomingReservations} />
                ) : (
                  <EmptyState
                    eyebrow="Calendario libre"
                    title="Sin reservas próximas"
                    description="Reserva tu próximo bloque académico desde la vista de bloques."
                    action={{ label: 'Reservar salón', onClick: () => router.push('/blocks') }}
                  />
                )}
              </Module>
            </section>

            {/* Side rail */}
            <aside className="space-y-6">
              <QuickAction
                href="/blocks"
                label="Nueva reserva"
                hint="Disponibilidad por bloque"
                icon={<IconCalendarPlus size={20} />}
              />
              <QuickAction
                href="/reservations/my"
                label="Mis reservas"
                hint="Historial y cancelaciones"
                icon={<IconBookOpen size={20} />}
              />
              <KpiCard
                label="Reservas activas"
                value={dashboardData?.activeReservationsCount ?? '—'}
                hint="confirmadas en tu cuenta"
                icon={<IconClock size={18} />}
              />
            </aside>
          </div>
        )}

        {/* Coordinador y Admin */}
        {(user.role === 'coordinador' || user.role === 'admin') && (
          <div className="space-y-10">
            <Module
              eyebrow="Hoy · Ocupación institucional"
              title="Estado de los bloques"
            >
              {dashboardData?.blockOccupancy?.length ? (
                <div className="grid sm:grid-cols-3 gap-4">
                  {dashboardData.blockOccupancy.map((block: any) => {
                    const pct = block.total > 0 ? Math.round((block.occupied / block.total) * 100) : 0;
                    return (
                      <div key={block.id} className="border border-rule bg-surface p-5">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute">
                              Bloque
                            </div>
                            <div className="font-display text-3xl text-ink">{block.name}</div>
                          </div>
                          <Badge variant={pct > 70 ? 'danger' : pct > 30 ? 'warning' : 'success'}>
                            {pct}%
                          </Badge>
                        </div>
                        <div className="rule mt-4" />
                        <div className="mt-4 flex items-baseline justify-between text-sm">
                          <span className="text-ink-soft">{block.occupied} ocupadas</span>
                          <span className="font-mono text-ink-mute">{block.total} totales</span>
                        </div>
                        <div className="mt-3 h-px bg-rule relative">
                          <div
                            className="absolute inset-y-0 left-0 h-px bg-brand"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  eyebrow="Sin datos"
                  title="Aún no hay ocupación que reportar"
                  description="Cuando se registren reservas verás la ocupación por bloque acá."
                />
              )}
            </Module>

            <div className="grid lg:grid-cols-3 gap-6">
              <QuickAction
                href="/reservations"
                label="Ver reservas"
                hint="Gestión global"
                icon={<IconBookOpen size={20} />}
              />
              <QuickAction
                href="/reports"
                label="Reporte de ocupación"
                hint="Descarga CSV por período"
                icon={<IconChart size={20} />}
              />
              {user.role === 'admin' ? (
                <QuickAction
                  href="/admin/rooms"
                  label="Administrar salones"
                  hint="Crear · editar · desactivar"
                  icon={<IconColumns size={20} />}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function Module({
  eyebrow,
  title,
  count,
  children,
}: {
  eyebrow: string;
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute">
            {eyebrow}
          </div>
          <h2 className="font-display text-3xl text-ink leading-tight mt-1">{title}</h2>
        </div>
        {typeof count === 'number' ? (
          <div className="font-mono text-xs text-ink-mute">
            <span className="text-ink font-medium">{String(count).padStart(2, '0')}</span> reg.
          </div>
        ) : null}
      </div>
      <div className="rule-strong mb-5" />
      {children}
    </section>
  );
}

function ReservationList({ items }: { items: any[] }) {
  return (
    <ul className="divide-y divide-rule border-y border-rule">
      {items.map((r: any) => (
        <li key={r.id} className="py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="font-display text-xl text-ink truncate">
              {r.subject || r.roomName || 'Reserva'}
            </div>
            <div className="text-sm text-ink-soft mt-0.5 flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <IconColumns size={14} />
                {r.roomCode || r.roomName}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <IconClock size={14} />
                {r.slotTime || r.slotName}
              </span>
              {r.date ? (
                <span className="font-mono text-[12px] text-ink-mute">{r.date}</span>
              ) : null}
            </div>
          </div>
          <Badge variant="success">Confirmada</Badge>
        </li>
      ))}
    </ul>
  );
}

function QuickAction({
  href,
  label,
  hint,
  icon,
}: {
  href: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group block border border-rule bg-surface p-5 hover:border-ink transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="text-ink">{icon}</div>
        <IconArrowRight
          size={18}
          className="text-ink-mute group-hover:text-ink group-hover:translate-x-1 transition-all"
        />
      </div>
      <div className="font-display text-xl text-ink mt-4">{label}</div>
      <div className="font-mono text-[11px] uppercase tracking-wide text-ink-mute mt-1">
        {hint}
      </div>
    </Link>
  );
}

function KpiCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="border border-rule bg-paper-soft/40 p-5">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-ink-mute">
        {icon}
        <span>{label}</span>
      </div>
      <div className="font-display text-5xl text-ink mt-3 leading-none">{value}</div>
      <div className="text-[12px] text-ink-soft mt-2">{hint}</div>
    </div>
  );
}
