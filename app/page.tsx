'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        router.push(res.ok ? '/dashboard' : '/login');
      } catch {
        router.push('/login');
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper text-ink-mute">
      <div className="text-center font-mono text-sm uppercase tracking-wide">
        <div
          className="mx-auto h-6 w-6 rounded-full border-2 border-brand border-t-transparent animate-spin"
          aria-hidden
        />
        <p className="mt-4">Cargando…</p>
      </div>
    </div>
  );
}
