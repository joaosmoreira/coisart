import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
          variant === 'primary' && 'bg-ink text-cream hover:bg-ink/90 shadow-cozy',
          variant === 'secondary' && 'bg-rose text-white hover:bg-rose/90 shadow-sm',
          variant === 'outline' && 'border border-ink/15 bg-white text-ink hover:bg-cream',
          variant === 'ghost' && 'text-ink hover:bg-ink/5',
          variant === 'danger' && 'bg-red-500 text-white hover:bg-red-600',
          size === 'sm' && 'h-9 px-3 text-xs',
          size === 'md' && 'h-11 px-5 text-sm',
          size === 'lg' && 'h-13 px-7 text-base',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
