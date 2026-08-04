import React, { useState } from 'react';
import { Package, Sparkles } from 'lucide-react';

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = ''
}) => {
  const [error, setError] = useState(false);

  const hasImage = src && typeof src === 'string' && src.trim() !== '' && !error;

  if (hasImage) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setError(true)}
        className={className}
      />
    );
  }

  return (
    <div
      className={`bg-gradient-to-br from-cream via-white to-lemon/20 border border-ink/10 flex flex-col items-center justify-center p-4 text-center shadow-inner relative overflow-hidden shrink-0 ${className}`}
      title={`${alt} (Sem fotografia)`}
    >
      <div className="p-2.5 rounded-2xl bg-rose/10 text-rose mb-1 shadow-sm border border-rose/20">
        <Package className="w-6 h-6" />
      </div>
      <span className="text-[11px] font-bold text-ink/80 line-clamp-1 max-w-[90%] leading-tight">{alt}</span>
      <span className="text-[9px] text-ink/50 font-semibold uppercase tracking-wider mt-0.5 flex items-center gap-1">
        <Sparkles className="w-2.5 h-2.5 text-rose" /> Arte Artesanal
      </span>
    </div>
  );
};
