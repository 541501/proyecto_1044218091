import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'flush' | 'ink';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', children, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-surface border border-rule',
      flush: 'bg-paper border border-rule',
      ink: 'bg-ink text-paper border border-ink',
    };
    return (
      <div
        ref={ref}
        className={`${variants[variant]} p-6 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

export const CardHeader = ({
  children,
  className = '',
  eyebrow,
}: {
  children: React.ReactNode;
  className?: string;
  eyebrow?: string;
}) => (
  <div className={`mb-5 ${className}`}>
    {eyebrow ? (
      <div className="font-mono text-[11px] uppercase tracking-wide text-ink-mute mb-2">
        {eyebrow}
      </div>
    ) : null}
    {children}
  </div>
);

export const CardTitle = ({
  children,
  className = '',
  as: As = 'h2',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}) => (
  <As className={`font-display text-2xl text-ink leading-tight ${className}`}>{children}</As>
);

export const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

export const CardFooter = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`mt-6 pt-4 border-t border-rule ${className}`}>{children}</div>
);
