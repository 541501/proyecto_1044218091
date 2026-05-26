import * as React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: { label: string; onClick: () => void };
  eyebrow?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  eyebrow = 'Sin registros',
}) => (
  <div className="border border-dashed border-rule bg-paper-soft/30 px-8 py-16 text-center">
    <div className="font-mono text-[11px] uppercase tracking-wide text-ink-mute">
      {eyebrow}
    </div>
    {icon ? <div className="mt-4 text-ink-mute flex justify-center">{icon}</div> : null}
    <h3 className="mt-2 font-display text-2xl text-ink">{title}</h3>
    {description ? (
      <p className="mt-3 text-sm text-ink-soft max-w-md mx-auto leading-relaxed">{description}</p>
    ) : null}
    {action ? (
      <div className="mt-6">
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      </div>
    ) : null}
  </div>
);
