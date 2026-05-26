import * as React from 'react';

type Variant = 'default' | 'success' | 'danger' | 'warning' | 'info' | 'brand' | 'accent';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  children: React.ReactNode;
}

const variants: Record<Variant, string> = {
  default: 'text-ink-soft border-rule bg-surface',
  success: 'text-ok border-ok/40 bg-ok-bg',
  danger: 'text-bad border-bad/40 bg-bad-bg',
  warning: 'text-warn border-warn/40 bg-warn-bg',
  info: 'text-brand border-brand/40 bg-brand-tint',
  brand: 'text-paper border-brand bg-brand',
  accent: 'text-accent border-accent/40 bg-accent-soft',
};

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = 'default', children, className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={[
        'inline-flex items-center gap-1.5 px-2 py-0.5 border',
        'font-mono text-[11px] uppercase tracking-wide',
        variants[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  ),
);

Badge.displayName = 'Badge';
