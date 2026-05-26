'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function MyReservationsRedirect() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const router = useRouter();
  const sp = useSearchParams();
  useEffect(() => {
    const qs = sp.toString();
    router.replace(`/reservations${qs ? '?' + qs : ''}`);
  }, [router, sp]);
  return (
    <div className="min-h-screen flex items-center justify-center text-ink-mute font-mono text-sm uppercase tracking-wide">
      Redirigiendo…
    </div>
  );
}
