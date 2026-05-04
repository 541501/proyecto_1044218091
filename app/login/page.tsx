'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error en la autenticación');
        setIsLoading(false);
        return;
      }

      // Login successful
      router.push('/dashboard');
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, #0F172A 0%, #1a2e4f 50%, #0F172A 100%)`,
        backgroundAttachment: 'fixed',
        position: 'relative',
      }}
    >
      {/* Patrón geométrico de fondo */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 24%, rgba(29, 78, 216, 0.05) 25%, rgba(29, 78, 216, 0.05) 26%, transparent 27%, transparent 74%, rgba(29, 78, 216, 0.05) 75%, rgba(29, 78, 216, 0.05) 76%, transparent 77%, transparent),
            linear-gradient(0deg, transparent 24%, rgba(29, 78, 216, 0.05) 25%, rgba(29, 78, 216, 0.05) 26%, transparent 27%, transparent 74%, rgba(29, 78, 216, 0.05) 75%, rgba(29, 78, 216, 0.05) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Tarjeta de formulario */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm px-6"
      >
        <div
          className="bg-white rounded-xl shadow-xl p-8"
          style={{
            borderTop: '4px solid #1D4ED8',
            boxShadow: '0 8px 40px rgba(15, 23, 42, 0.25)',
          }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <svg
              width="52"
              height="52"
              viewBox="0 0 52 52"
              className="text-blue-600"
              fill="currentColor"
            >
              <g>
                {/* Building silhouette */}
                <path d="M14 12h24v28H14z" fillOpacity="0.3" />
                <rect x="16" y="14" width="6" height="6" />
                <rect x="25" y="14" width="6" height="6" />
                <rect x="34" y="14" width="6" height="6" />
                <rect x="16" y="23" width="6" height="6" />
                <rect x="25" y="23" width="6" height="6" />
                <rect x="34" y="23" width="6" height="6" />
                <rect x="16" y="32" width="6" height="6" />
                <rect x="25" y="32" width="6" height="6" />
                <rect x="34" y="32" width="6" height="6" />
                <path d="M24 40h4v4h-4z" />
              </g>
            </svg>
          </div>

          {/* Título */}
          <h1
            className="text-2xl font-bold text-center mb-2"
            style={{ color: '#0F172A' }}
          >
            ClassSport
          </h1>

          {/* Tagline */}
          <p
            className="text-sm text-center mb-8"
            style={{ color: '#64748B' }}
          >
            Gestión de salones universitarios.
          </p>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: '#0F172A' }}
              >
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.email@institution.edu.co"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition"
                style={{
                  borderColor: '#CBD5E1',
                  '--tw-ring-color': '#1D4ED8',
                } as React.CSSProperties}
                required
              />
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
                style={{ color: '#0F172A' }}
              >
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition"
                style={{
                  borderColor: '#CBD5E1',
                  '--tw-ring-color': '#1D4ED8',
                } as React.CSSProperties}
                required
              />
            </div>

            {/* Error message */}
            {error && (
              <div
                className="p-3 rounded-lg text-sm"
                style={{
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  borderLeft: '3px solid #DC2626',
                }}
              >
                {error}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 rounded-lg font-medium text-white transition hover:brightness-110"
              style={{
                backgroundColor: '#1D4ED8',
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {/* Pie */}
          <p
            className="text-xs text-center mt-8"
            style={{ color: '#94A3B8' }}
          >
            Institución Universitaria
          </p>
        </div>
      </motion.div>
    </div>
  );
}
