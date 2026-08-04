import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'rose' | 'lemon' | 'mint' | 'sky' | 'lavender';
}

export const AdminStatsCard: React.FC<AdminStatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'rose'
}) => {
  const bgColors = {
    rose: 'bg-rose/40 text-ink',
    lemon: 'bg-lemon/60 text-ink',
    mint: 'bg-mint/50 text-ink',
    sky: 'bg-sky/50 text-ink',
    lavender: 'bg-lavender/50 text-ink'
  };

  return (
    <Card className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink/60">{title}</p>
        <h3 className="font-display text-3xl font-bold text-ink mt-1">{value}</h3>
        {subtitle && <p className="text-xs text-ink/70 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-4 rounded-2xl ${bgColors[color]} shadow-sm`}>
        <Icon className="w-6 h-6" />
      </div>
    </Card>
  );
};
