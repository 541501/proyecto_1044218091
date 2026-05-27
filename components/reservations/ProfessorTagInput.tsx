'use client';

import { useState, useEffect, useRef } from 'react';
import { IconX } from '@/components/icons';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'profesor' | 'coordinador' | 'admin';
}

interface ProfessorTagInputProps {
  value: User | null;
  onChange: (user: User | null) => void;
  placeholder?: string;
}

export default function ProfessorTagInput({
  value,
  onChange,
  placeholder = 'Selecciona un docente (ej. @Juan)',
}: ProfessorTagInputProps) {
  const [input, setInput] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar lista de usuarios al montar
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/users/searchable');
        if (res.ok) {
          setUsers(await res.json());
        }
      } catch (err) {
        console.error('Error loading users:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filtrar usuarios cuando cambia el input
  useEffect(() => {
    if (input.startsWith('@')) {
      const searchTerm = input.slice(1).toLowerCase();
      const filtered = users.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm) ||
          u.email.toLowerCase().includes(searchTerm)
      );
      setFilteredUsers(filtered);
      setShowDropdown(filtered.length > 0);
    } else if (input.length > 0) {
      // Si no empieza con @, mostrar dropdown para escribir @
      setShowDropdown(true);
      setFilteredUsers([]);
    } else {
      setShowDropdown(false);
      setFilteredUsers([]);
    }
  }, [input, users]);

  const handleSelectUser = (user: User) => {
    onChange(user);
    setInput('');
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleRemove = () => {
    onChange(null);
    setInput('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
      setInput('');
    }
  };

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (input.startsWith('@') && filteredUsers.length > 0) {
              setShowDropdown(true);
            }
          }}
          placeholder={value ? '' : placeholder}
          maxLength={100}
          className="field text-lg"
          disabled={!!value}
        />

        {/* Tag del usuario seleccionado */}
        {value ? (
          <div className="absolute inset-0 flex items-center pl-3 pointer-events-none">
            <span className="inline-block px-2.5 py-1.5 bg-accent/20 border border-accent/40 rounded font-mono text-[11px] uppercase tracking-wide text-accent flex items-center gap-2">
              @{value.name}
            </span>
          </div>
        ) : null}

        {/* Botón para limpiar */}
        {value ? (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute hover:text-ink transition-colors"
            aria-label="Limpiar selección"
          >
            <IconX size={16} />
          </button>
        ) : null}
      </div>

      {/* Dropdown de usuarios */}
      {showDropdown && !value && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 border border-rule bg-surface shadow-lg z-50"
        >
          {input.length === 0 ? (
            <div className="p-3 text-sm text-ink-mute text-center font-mono text-[11px] uppercase tracking-wide">
              Escribe @ para buscar docentes
            </div>
          ) : input.startsWith('@') && loading ? (
            <div className="p-3 text-sm text-ink-mute text-center">Cargando…</div>
          ) : input.startsWith('@') && filteredUsers.length === 0 ? (
            <div className="p-3 text-sm text-ink-mute text-center">
              No se encontraron docentes
            </div>
          ) : input.startsWith('@') ? (
            <ul className="max-h-64 overflow-y-auto divide-y divide-rule">
              {filteredUsers.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className="w-full px-3 py-2.5 text-left hover:bg-paper-soft transition-colors group"
                  >
                    <div className="font-display text-sm text-ink">@{user.name}</div>
                    <div className="text-xs text-ink-mute mt-0.5">
                      {user.email} · {user.role}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-sm text-ink-mute text-center font-mono text-[11px] uppercase tracking-wide">
              Escribe @ para buscar
            </div>
          )}
        </div>
      )}

      {/* Hint texto */}
      <div className="font-mono text-[10px] text-ink-mute mt-1.5">
        {value
          ? `Docente: ${value.name} (${value.role})`
          : 'Escribe @ y comienza a buscar un docente'}
      </div>
    </div>
  );
}
