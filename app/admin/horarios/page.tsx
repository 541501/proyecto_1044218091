'use client';

import { Suspense, useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Reservation } from '@/lib/types';
import ReservationsCalendar from '@/components/reservations/ReservationsCalendar';
import {
  IconDot,
  IconSearch,
  IconX,
  IconChevronLeft,
} from '@/components/icons';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'profesor' | 'coordinador' | 'admin';
}

export default function HorariosPage() {
  return (
    <Suspense fallback={<div className="p-8 text-ink-mute font-mono text-sm uppercase">Cargando…</div>}>
      <HorariosContent />
    </Suspense>
  );
}

function HorariosContent() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [professors, setProfessors] = useState<User[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [input, setInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredProfessors, setFilteredProfessors] = useState<User[]>([]);

  // Cargar usuario actual y lista de profesores y coordinadores
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const meRes = await fetch('/api/auth/me', { credentials: 'include' });
        const me = meRes.ok ? (await meRes.json()).user : null;
        setUser(me);

        // Cargar lista de profesores y coordinadores
        const profRes = await fetch('/api/users/searchable');
        if (profRes.ok) {
          const allUsers = await profRes.json();
          // Filtrar profesores y coordinadores
          setProfessors(allUsers.filter((u: User) => u.role === 'profesor' || u.role === 'coordinador'));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Cargar reservas cuando se selecciona un profesor
  useEffect(() => {
    if (!selectedProfessor) {
      setReservations([]);
      return;
    }

    (async () => {
      try {
        setLoadingReservations(true);
        const res = await fetch(`/api/reservations/professor/${selectedProfessor.id}`);
        if (res.ok) {
          setReservations(await res.json());
        }
      } finally {
        setLoadingReservations(false);
      }
    })();
  }, [selectedProfessor]);

  // Filtrar profesores cuando cambia el input
  useEffect(() => {
    if (input.startsWith('@')) {
      const searchTerm = input.slice(1).toLowerCase();
      const filtered = professors.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.email.toLowerCase().includes(searchTerm)
      );
      setFilteredProfessors(filtered);
      setShowDropdown(filtered.length > 0);
    } else if (input.length > 0) {
      setShowDropdown(true);
      setFilteredProfessors([]);
    } else {
      setShowDropdown(false);
      setFilteredProfessors([]);
    }
  }, [input, professors]);

  const handleSelectProfessor = (prof: User) => {
    setSelectedProfessor(prof);
    setInput('');
    setShowDropdown(false);
  };

  const handleRemove = () => {
    setSelectedProfessor(null);
    setInput('');
    setReservations([]);
  };

  if (!user || (user.role !== 'admin' && user.role !== 'coordinador')) {
    return (
      <AppLayout role={user?.role || 'profesor'} userName={user?.name}>
        <div className="max-w-3xl mx-auto p-8">
          <EmptyState
            title="Acceso denegado"
            description="Solo administradores y coordinadores pueden acceder a esta sección."
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role={user?.role || 'profesor'} userName={user?.name}>
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-soft hover:text-ink transition-colors mb-8"
        >
          <IconChevronLeft size={14} />
          Volver
        </button>

        <header className="mb-10 animate-rise">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ink-mute mb-3">
            <IconDot size={6} className="text-accent" />
            <span>Administración · Horarios</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-[0.95] text-ink">
            Consulta el
            <span className="italic text-accent"> horario</span> de usuarios.
          </h1>
        </header>

        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          {/* Sidebar con buscador */}
          <div className="space-y-6">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wide text-ink-soft mb-3">
                Buscar usuario
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => {
                    if (input.startsWith('@') && filteredProfessors.length > 0) {
                      setShowDropdown(true);
                    }
                  }}
                  placeholder={selectedProfessor ? '' : 'Escribe @usuario'}
                  maxLength={100}
                  className="field text-sm w-full"
                  disabled={!!selectedProfessor}
                />

                {/* Tag del profesor seleccionado */}
                {selectedProfessor ? (
                  <div className="absolute inset-0 flex items-center pl-3 pointer-events-none">
                    <span className="inline-block px-2.5 py-1.5 bg-accent/20 border border-accent/40 rounded font-mono text-[11px] uppercase tracking-wide text-accent flex items-center gap-2">
                      @{selectedProfessor.name}
                    </span>
                  </div>
                ) : null}

                {/* Botón para limpiar */}
                {selectedProfessor ? (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute hover:text-ink transition-colors"
                    aria-label="Limpiar selección"
                  >
                    <IconX size={16} />
                  </button>
                ) : null}

                {/* Dropdown de profesores */}
                {showDropdown && filteredProfessors.length > 0 ? (
                  <div className="absolute top-full left-0 right-0 mt-2 max-h-64 overflow-y-auto bg-paper border border-rule rounded shadow-lg z-50">
                    {filteredProfessors.map((prof) => (
                      <button
                        key={prof.id}
                        onClick={() => handleSelectProfessor(prof)}
                        className="w-full text-left px-4 py-2.5 hover:bg-paper-soft transition-colors border-b border-rule last:border-0"
                      >
                        <div className="font-mono text-[11px] uppercase tracking-wide text-accent">
                          @{prof.name}
                        </div>
                        <div className="text-sm text-ink-mute">{prof.email}</div>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Info del profesor */}
            {selectedProfessor && (
              <div className="p-4 bg-paper-soft border border-rule rounded space-y-3">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">
                    {selectedProfessor.role === 'coordinador' ? 'Coordinador' : 'Profesor'}
                  </div>
                  <div className="font-medium text-ink">{selectedProfessor.name}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">
                    Correo
                  </div>
                  <div className="font-mono text-sm text-ink-mute break-all">{selectedProfessor.email}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">
                    Reservas
                  </div>
                  <div className="font-medium text-ink">
                    {loadingReservations ? '...' : reservations.length}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contenido principal */}
          <div>
            {!selectedProfessor ? (
              <EmptyState
                title="Selecciona un usuario"
                description="Busca y selecciona un profesor o coordinador para ver su horario de reservas."
              />
            ) : loadingReservations ? (
              <div className="text-center py-12">
                <div className="text-ink-mute font-mono text-sm uppercase">Cargando horario…</div>
              </div>
            ) : reservations.length === 0 ? (
              <EmptyState
                title="Sin reservas"
                description={`${selectedProfessor.name} no tiene reservas.`}
              />
            ) : (
              <div>
                <div className="mb-6">
                  <h2 className="font-display text-2xl text-ink mb-2">Horario de {selectedProfessor.name}</h2>
                  <p className="text-sm text-ink-mute">
                    {reservations.length} reserva{reservations.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <ReservationsCalendar
                  reservations={reservations}
                  userId={selectedProfessor.id}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
