'use client';

import * as React from 'react';
import { Button } from './Button';
import { IconX } from '@/components/icons';

export interface ModalAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'ink';
  isLoading?: boolean;
  disabled?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  actions?: ModalAction[];
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  eyebrow,
  children,
  actions = [],
  size = 'sm',
}) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(20,24,29,0.55)' }}
      onClick={onClose}
    >
      <div
        className={`bg-surface border border-rule w-full ${sizes[size]} animate-rise`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-rule">
          <div>
            {eyebrow ? (
              <div className="font-mono text-[11px] uppercase tracking-wide text-ink-mute mb-1">
                {eyebrow}
              </div>
            ) : null}
            <h2 className="font-display text-xl text-ink leading-tight">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-ink-mute hover:text-ink transition-colors"
            aria-label="Cerrar"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="px-6 py-5 text-ink-soft text-sm leading-relaxed">{children}</div>

        <div className="px-6 py-4 border-t border-rule flex justify-end gap-3 bg-paper-soft/40">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          {actions.map((a, i) => (
            <Button
              key={i}
              variant={a.variant ?? 'primary'}
              onClick={a.onClick}
              isLoading={a.isLoading}
              disabled={a.disabled}
            >
              {a.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
