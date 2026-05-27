'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import RoomCard from '@/components/blocks/RoomCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { RoomWithBlock, BlockAvailability } from '@/lib/types';
import {
  IconChevronLeft,
  IconCalendar,
  IconDot,
  IconColumns,
  IconChevronRight,
} from '@/components/icons';

export default function BlockDetailsPage({
  params: paramsPromise,
}: {
  params: Promise<{ blockId: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [rooms, setRooms] = useState<RoomWithBlock[]>([]);
  const [block, setBlock] = useState<any>(null);
  const [availability, setAvailability] = useState<BlockAvailability | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    searchParams.get('date') || new Date().toISOString().split('T')[0],
  );
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const meRes = await fetch('/api/auth/me', { credentials: 'include' });
        if (meRes.ok) {
          setUser((await meRes.json()).user ?? null);
        }

        const [blocksRes, roomsRes, availRes] = await Promise.all([
          fetch('/api/blocks', { credentials: 'include' }),
          fetch(`/api/rooms?blockId=${params.blockId}`, { credentials: 'include' }),
          fetch(`/api/blocks/${params.blockId}/availability?date=${selectedDate}`, { credentials: 'include' }),
        ]);

        if (roomsRes.ok) setRooms(await roomsRes.json());
        if (availRes.ok) setAvailability(await availRes.json());

        if (blocksRes.ok) {
          const list = await blocksRes.json();
          setBlock(list.find((b: any) => b.id === params.blockId) ?? null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [params.blockId, selectedDate]);

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
        <button
          onClick={() => router.back()}
          className="mb-8 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-soft hover:text-ink transition-colors"
        >
          <IconChevronLeft size={14} />
          Bloques
        </button>

        <header className="mb-10 animate-rise">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-mute mb-3">
            <IconDot size={6} className="text-accent" />
            <span>Bloque {block?.code ?? '—'}</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-[0.95] text-ink">
            {block?.name ?? 'Salones del bloque'}
          </h1>
          {availability ? (
            <p className="mt-4 text-ink-soft text-[15px]">
              <span className="text-ink font-medium">{availability.availableRooms}</span>{' '}
              de <span className="font-mono">{availability.totalRooms}</span> salones libres este día ·{' '}
              <span className="italic capitalize">{dateLabel}</span>
            </p>
          ) : null}
        </header>

        <div className="border-y border-rule py-4 mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-ink">
            <IconCalendar size={20} className="text-ink-soft" />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute">
                Fecha
              </div>
              <div className="font-display text-xl capitalize">{dateLabel}</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
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
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 font-mono text-sm uppercase tracking-wide text-ink-mute">
            Cargando salones…
          </div>
        ) : rooms.length === 0 ? (
          <EmptyState
            eyebrow="Sin salones"
            title="Este bloque no tiene salones aún"
            description="Pídele al administrador que registre salones para este bloque."
            icon={<IconColumns size={32} />}
            action={
              user?.role === 'admin'
                ? {
                    label: 'Crear salón',
                    onClick: () => router.push(`/admin/rooms/new?blockId=${params.blockId}`),
                  }
                : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                available={room.is_active}
                onClick={() => router.push(`/blocks/${params.blockId}/${room.id}?date=${selectedDate}`)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
