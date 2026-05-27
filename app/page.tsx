'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const res = await fetch('/api/auth/me', { 
          credentials: 'include',
          signal: controller.signal 
        });
        clearTimeout(timeoutId);
        
        if (res.ok) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('[home] Auth check error:', err);
        router.push('/login');
      }
    })();
  }, [router]);

  const handleEmergencyLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/login');
    } catch (err) {
      console.error('[logout]', err);
      // Forzar redirección aún si falla
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper text-ink-mute">
      <div className="text-center font-mono text-sm uppercase tracking-wide">
        <div
          className="mx-auto h-6 w-6 rounded-full border-2 border-brand border-t-transparent animate-spin"
          aria-hidden
        />
        <p className="mt-4">Cargando…</p>
        
        <button
          onClick={handleEmergencyLogout}
          disabled={isLoggingOut}
          className="mt-8 px-4 py-2 text-xs bg-ink text-paper hover:bg-ink-soft disabled:opacity-50 transition-colors"
        >
          {isLoggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
        </button>
      </div>
    </div>
  );
}
