'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import RoomForm, { RoomFormValues } from '@/components/admin/RoomForm';
import { IconChevronLeft, IconDot } from '@/components/icons';

export default function NewRoomPage() {
  return (
    <Suspense fallback={<div className="p-8 text-ink-mute font-mono uppercase text-sm">Cargando…</div>}>
      <NewRoomContent />
    </Suspense>
  );
}

function NewRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialBlockId = searchParams.get('blockId');

  const [user, setUser] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const me = await fetch('/api/auth/me');
      if (!me.ok) return router.replace('/login');
      const userData = (await me.json()).user;
      if (userData?.role !== 'admin') return router.replace('/dashboard');
      setUser(userData);

      const b = await fetch('/api/blocks');
      if (b.ok) setBlocks(await b.json());
    })();
  }, [router]);

  const handleSubmit = async (values: RoomFormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          block_id: values.block_id,
          code: values.code,
          type: values.type,
          capacity: values.capacity,
          equipment: values.equipment || undefined,
        }),
      });
      if (res.status === 201) {
        router.push('/admin/rooms?created=1');
      } else if (res.status === 409) {
        const data = await res.json();
        setError(data.error || 'Ya existe un salón con ese código en el bloque.');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Error al crear el salón.');
      }
    } catch {
      setError('Error de red al crear el salón.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout role={user?.role || 'admin'} userName={user?.name}>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-soft hover:text-ink transition-colors mb-8"
        >
          <IconChevronLeft size={14} />
          Salones
        </button>

        <header className="mb-10 animate-rise">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-mute mb-3">
            <IconDot size={6} className="text-accent" />
            <span>Administración · Inventario</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-[0.95] text-ink">
            Nuevo
            <span className="italic text-accent"> salón</span>
          </h1>
          <p className="mt-4 max-w-xl text-ink-soft text-[15px] leading-relaxed">
            Registra un nuevo espacio físico. El código debe ser único dentro de su bloque.
          </p>
        </header>

        <RoomForm
          mode="create"
          blocks={blocks}
          initial={{ block_id: initialBlockId || undefined }}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isSubmitting={submitting}
          errorMessage={error}
        />
      </div>
    </AppLayout>
  );
}
