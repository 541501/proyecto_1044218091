'use client';

import React from 'react';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: { label: string; onClick: () => void; variant?: 'primary' | 'secondary' | 'ghost' }[];
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, actions = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        </div>
        <div className="px-6 py-4">{children}</div>
        <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          {actions.map((action, idx) => (
            <Button key={idx} variant={action.variant || 'primary'} onClick={action.onClick}>
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
