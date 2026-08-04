import React from 'react';
import { Palette } from 'lucide-react';

interface ArtistAvatarProps {
  avatarUrl?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ArtistAvatar: React.FC<ArtistAvatarProps> = ({
  avatarUrl,
  name,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10 rounded-xl text-xs',
    md: 'w-16 h-16 rounded-2xl text-sm',
    lg: 'w-20 h-20 rounded-3xl text-base',
    xl: 'w-32 h-32 rounded-3xl text-xl'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14'
  };

  if (avatarUrl && avatarUrl.trim() !== '') {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClasses[size]} object-cover border-2 border-white shadow-md ${className}`}
      />
    );
  }

  // Cores suaves de fallback baseadas no nome
  const colors = [
    'from-rose/20 to-lemon/30 text-rose border-rose/30',
    'from-lemon/30 to-mint/30 text-ink border-lemon/40',
    'from-mint/30 to-sky/30 text-teal-800 border-mint/40',
    'from-purple-100 to-rose/20 text-purple-700 border-purple-200'
  ];
  const safeName = typeof name === 'string' && name.trim() !== '' ? name : 'Artesão';
  const charCode = safeName.charCodeAt(0) || 0;
  const colorScheme = colors[charCode % colors.length];

  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-br ${colorScheme} border-2 flex flex-col items-center justify-center shadow-sm shrink-0 relative overflow-hidden ${className}`}
      title={`${name} (Sem foto de perfil)`}
    >
      <Palette className={`${iconSizes[size]} opacity-85`} />
      <span className="sr-only">{name}</span>
    </div>
  );
};
