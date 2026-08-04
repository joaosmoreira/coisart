import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-dashed border-ink/20 my-6">
      <div className="w-14 h-14 rounded-full bg-lemon/50 flex items-center justify-center text-ink mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="font-display text-xl font-semibold text-ink mb-1">{title}</h3>
      <p className="text-sm text-ink/70 max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionText}
        </Button>
      )}
    </div>
  );
};
