import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label className="text-xs font-semibold uppercase tracking-wider text-ink/70">{label}</label>}
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full h-11 px-4 rounded-2xl border border-ink/15 bg-white text-ink placeholder:text-ink/40 text-sm focus:outline-none focus:ring-2 focus:ring-rose focus:border-rose transition-all duration-200',
            error && 'border-red-500 focus:ring-red-300',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
