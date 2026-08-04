import React from 'react';
import { cn } from '@/lib/utils';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn('bg-white rounded-3xl border border-ink/10 p-6 shadow-cozy', className)}
      {...props}
    >
      {children}
    </div>
  );
};
