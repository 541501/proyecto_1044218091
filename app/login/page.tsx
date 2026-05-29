'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { IconArrowRight, IconAlert, IconDot } from '@/components/icons';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('[login] Sending login request...');
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      console.log('[login] Login response status:', res.status);

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[login] Login failed:', data.error);
        setError(data.error || 'Error en la autenticación');
        setIsLoading(false);
        return;
      }

      const loginData = await res.json();
      console.log('[login] Login successful, storing user data');

      // Store user in sessionStorage to avoid extra fetch
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('currentUser', JSON.stringify(loginData.user));
      }

      // Wait for cookie to be set
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('[login] Redirecting to dashboard...');
      router.push('/dashboard');
      
    } catch (err) {
      console.error('[login] Error:', err);
      setError('Error de conexión. Intenta de nuevo.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-paper text-ink relative overflow-hidden">
      {/* Decorative architectural lines */}
      <svg
        className="absolute top-0 right-0 h-full w-1/2 text-ink/[0.045] hidden md:block"
        viewBox="0 0 600 800"
        fill="none"
        aria-hidden
      >
        <g stroke="currentColor" strokeWidth="1">
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={i} x1={i * 50} y1="0" x2={i * 50 + 200} y2="800" />
          ))}
          <rect x="120" y="180" width="240" height="320" />
          <rect x="160" y="220" width="60" height="60" />
          <rect x="240" y="220" width="60" height="60" />
          <rect x="160" y="300" width="60" height="60" />
          <rect x="240" y="300" width="60" height="60" />
          <rect x="160" y="380" width="60" height="60" />
          <rect x="240" y="380" width="60" height="60" />
          <line x1="80" y1="500" x2="400" y2="500" strokeWidth="2" />
        </g>
      </svg>

      <div className="relative z-10 min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
        {/* Editorial left rail */}
        <div className="px-10 lg:px-16 py-12 lg:py-20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-mute">
              <IconDot size={6} className="text-accent" />
              <span>Institución Universitaria · Edición 2026</span>
            </div>

            <h1 className="mt-14 font-display text-[clamp(3rem,7vw,5.5rem)] leading-[0.95] text-ink">
              ClassSport
              <span className="block italic text-accent text-[clamp(2rem,4.5vw,3.5rem)] mt-1">
                — gestión de salones
              </span>
            </h1>

            <p className="mt-8 max-w-md text-ink-soft text-[15px] leading-relaxed">
              Sistema oficial para reserva de salones académicos. Disponibilidad en tiempo real,
              calendario semanal por aula y registro auditable de cada operación.
            </p>

            <div className="mt-10 rule w-32" />

            <ul className="mt-6 space-y-2 text-[13px] font-mono text-ink-soft uppercase tracking-wide">
              <li className="flex items-baseline gap-3">
                <span className="text-ink-mute">01</span>
                <span>Disponibilidad por bloque</span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-ink-mute">02</span>
                <span>Calendario semanal en vivo</span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-ink-mute">03</span>
                <span>Reporte de ocupación · CSV</span>
              </li>
            </ul>
          </div>

          <div className="mt-12 text-[11px] font-mono uppercase tracking-wide text-ink-mute">
            <p>SIST0200 · Lógica y Programación</p>
            <p className="mt-1">Juan Gutiérrez · Doc 1044218091</p>
            <p className="mt-3">Agradecimiento a Jhonatan Castro</p>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
          className="px-6 lg:px-14 py-12 lg:py-20 flex items-center"
        >
          <div className="w-full max-w-md mx-auto">
            <div className="bg-surface border border-rule border-t-[4px] border-t-accent shadow-[0_20px_60px_-20px_rgba(229,180,84,0.30)]">
              <div className="px-8 pt-8 pb-6">
                <div className="font-mono text-[10px] uppercase tracking-wide text-ink-mute">
                  Acceso
                </div>
                <h2 className="font-display text-3xl text-ink mt-1 leading-tight">
                  Inicio de sesión
                </h2>
                <p className="text-sm text-ink-soft mt-2">
                  Usa la cuenta institucional asignada por administración.
                </p>
              </div>

              <div className="rule mx-8" />

              <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-2"
                  >
                    01 · Correo institucional
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu.nombre@institucion.edu.co"
                    className="field"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-2"
                  >
                    02 · Contraseña
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="field"
                    required
                  />
                </div>

                {error ? (
                  <div className="flex items-start gap-2.5 p-3 border-l-2 border-bad bg-bad-bg text-bad text-sm">
                    <IconAlert size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group w-full py-3 px-4 bg-accent text-[#0B1538] inline-flex items-center justify-between gap-2 transition-colors hover:bg-accent-deep disabled:opacity-50 cursor-pointer"
                >
                  <span className="font-mono text-[11px] uppercase tracking-wide">
                    {isLoading ? 'Verificando…' : 'Ingresar al sistema'}
                  </span>
                  <IconArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              </form>

              <div className="rule mx-8" />

              <div className="px-8 py-5 text-[12px] text-ink-mute">
                No hay registro público. Las cuentas las crea el administrador.
              </div>
            </div>

            <p className="mt-5 font-mono text-[10px] text-ink-mute uppercase tracking-wide text-center">
              © 2026 · ClassSport
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
