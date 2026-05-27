'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import BlockCard from '@/components/blocks/BlockCard';
import { BlockWithAvailability } from '@/lib/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconCalendar, IconDot, IconChevronLeft, IconChevronRight } from '@/components/icons';

export default function BlocksPage() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<BlockWithAvailability[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const meRes = await fetch('/api/auth/me', { credentials: 'include' });
        if (meRes.ok) {
          const userData = await meRes.json();
          setUser(userData.user ?? userData);
        }
        const blocksRes = await fetch(`/api/blocks?date=${selectedDate}`, { credentials: 'include' });
        if (blocksRes.ok) {
          setBlocks(await blocksRes.json());
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedDate]);

  const shiftDay = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const dateLabel = new Date(selectedDate).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <AppLayout role={user?.role || 'profesor'} userName={user?.name} showSeedBanner>
      <div className="max-w-6xl mx-auto">
        {/* Editorial header */}
        <header className="mb-10 animate-rise">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-mute mb-3">
            <IconDot size={6} className="text-accent" />
            <span>Capítulo II · Disponibilidad por bloque</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-[0.95] text-ink">
            Bloques
            <span className="italic text-accent"> académicos</span>
          </h1>
          <p className="mt-4 max-w-xl text-ink-soft text-[15px] leading-relaxed">
            Selecciona un bloque para revisar los salones libres en la fecha elegida. La disponibilidad se calcula en tiempo real.
          </p>
        </header>

        {/* Date selector */}
        <div className="border-y border-rule py-4 mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-ink">
            <IconCalendar size={20} className="text-ink-soft" />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute">
                Fecha consultada
              </div>
              <div className="font-display text-xl capitalize">{dateLabel}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => shiftDay(-1)}
              className="h-9 w-9 border border-rule hover:border-ink hover:bg-paper-soft inline-flex items-center justify-center text-ink-soft hover:text-ink transition-colors"
              aria-label="Día anterior"
            >
              <IconChevronLeft size={16} />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="field h-9 py-0 text-sm"
            />
            <button
              onClick={() => shiftDay(1)}
              className="h-9 w-9 border border-rule hover:border-ink hover:bg-paper-soft inline-flex items-center justify-center text-ink-soft hover:text-ink transition-colors"
              aria-label="Día siguiente"
            >
              <IconChevronRight size={16} />
            </button>
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="ml-2 h-9 px-3 text-[11px] font-mono uppercase tracking-wide border border-rule text-ink-soft hover:border-ink hover:text-ink transition-colors"
            >
              Hoy
            </button>
          </div>
        </div>

        {/* Block grid */}
        {loading ? (
          <div className="text-center py-12 font-mono text-sm uppercase tracking-wide text-ink-mute">
            Cargando bloques…
          </div>
        ) : blocks.length === 0 ? (
          <EmptyState
            eyebrow="Sin bloques"
            title="No hay bloques registrados"
            description="Pide al administrador que cree los bloques iniciales desde la sección de salones."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {blocks.map((block) => (
              <BlockCard
                key={block.id}
                block={block}
                onClick={() => router.push(`/blocks/${block.id}?date=${selectedDate}`)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
