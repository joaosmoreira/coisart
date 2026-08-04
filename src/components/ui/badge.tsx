import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'rose' | 'lemon' | 'mint' | 'sky' | 'lavender' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'neutral', children, ...props }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full tracking-wide shadow-sm border border-ink/5',
        variant === 'rose' && 'bg-rose/30 text-ink font-semibold',
        variant === 'lemon' && 'bg-lemon/60 text-ink',
        variant === 'mint' && 'bg-mint/50 text-ink',
        variant === 'sky' && 'bg-sky/50 text-ink',
        variant === 'lavender' && 'bg-lavender/50 text-ink',
        variant === 'neutral' && 'bg-ink/5 text-ink',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
