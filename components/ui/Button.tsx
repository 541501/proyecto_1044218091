import * as React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'ink' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-brand text-paper border border-brand hover:bg-brand-soft hover:border-brand-soft',
  ink:
    'bg-ink text-paper border border-ink hover:bg-[#1F2630]',
  secondary:
    'bg-surface text-ink border border-rule hover:border-ink hover:bg-paper-soft',
  ghost:
    'bg-transparent text-ink border border-transparent hover:bg-paper-soft',
  danger:
    'bg-bad text-white border border-bad hover:opacity-90',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-[12px] tracking-wide uppercase font-medium',
  md: 'px-4 py-2 text-[13px] tracking-wide uppercase font-medium',
  lg: 'px-6 py-3 text-sm tracking-wide uppercase font-medium',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, children, className = '', disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={[
        'inline-flex items-center justify-center gap-2 transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      ].join(' ')}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
