import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles, Download, Layers, ArrowRight, Ban } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { ArtistAvatar } from '@/components/shared/ArtistAvatar';
import { ProductImage } from '@/components/shared/ProductImage';

interface ProductCardProps {
  product: any;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);

  const sellerObj = typeof product.sellerId === 'object' ? product.sellerId : null;
  const isSellerActive = sellerObj ? sellerObj.isActive !== false : true;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isSellerActive) {
      alert('A banca deste artesão encontra-se em pausa. Não é possível adicionar artigos ao carrinho de momento.');
      return;
    }
    const image = product.images && product.images.length > 0 ? product.images[0] : '';
    addItem({
      productId: product._id, sellerId: product.sellerId?._id || product.sellerId,
      sellerName: product.sellerId?.name || 'Artesão Coisart', title: product.title,
      slug: product.slug, price: product.price, image, type: product.type || 'physical_unique',
      stock: product.stock !== undefined ? product.stock : 1
    });
  };

  const isUnique = product.type === 'physical_unique';
  const isDigital = product.type === 'digital';

  return (
    <div className="break-inside-avoid mb-6 group cursor-pointer">
      <Link to={`/produto/${product.slug}`} className="block relative overflow-hidden rounded-3xl bg-cream/30 transition-all duration-300">
        {/* Imagem com escurecimento elegante no Hover para alta legibilidade do texto */}
        <ProductImage
          src={product.images?.[0]}
          alt={product.title}
          className="w-full h-auto object-cover rounded-3xl group-hover:scale-105 group-hover:brightness-75 transition-all duration-500 ease-out min-h-[200px]"
        />

        {/* Badges Flutuantes Minimalistas */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {!isSellerActive && (
            <span className="px-3 py-1 rounded-full bg-amber-100/95 backdrop-blur-md text-amber-900 text-[10px] font-bold tracking-wide shadow-sm flex items-center gap-1">
              <Ban className="w-3 h-3 text-rose" /> Artesão em Pausa
            </span>
          )}
          {isUnique && (
            <span className="px-3 py-1 rounded-full bg-rose/95 backdrop-blur-md text-white text-[10px] font-bold tracking-wide shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Peça Única
            </span>
          )}
          {isDigital && (
            <span className="px-3 py-1 rounded-full bg-sky/95 backdrop-blur-md text-white text-[10px] font-bold tracking-wide shadow-sm flex items-center gap-1">
              <Download className="w-3 h-3" /> Digital
            </span>
          )}
        </div>

        {/* Overlay no Hover: Fundo escuro aveludado + Leve desfocagem para contraste perfeito */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/80 to-ink/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-5 flex flex-col justify-end gap-2 text-left">
          {product.materials && (
            <div className="flex items-center gap-1.5 text-lemon text-xs font-semibold">
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="line-clamp-1">{product.materials}</span>
            </div>
          )}

          {product.description && (
            <p className="text-xs text-white/90 leading-relaxed line-clamp-3 font-sans">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/20 mt-1">
            <span className="text-[11px] font-bold text-lemon flex items-center gap-1 group-hover:underline">
              Clique para ver artigo <ArrowRight className="w-3 h-3" />
            </span>
            {isSellerActive ? (
              <button
                onClick={handleAddToCart}
                className="px-3 py-1.5 rounded-xl bg-white text-ink font-bold text-xs hover:bg-lemon transition-colors flex items-center gap-1 shadow-md active:scale-95 shrink-0"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-rose" /> Comprar
              </button>
            ) : (
              <span
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                className="px-2.5 py-1 rounded-xl bg-white/30 text-white/80 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm select-none cursor-not-allowed line-through shrink-0"
              >
                <Ban className="w-3 h-3 text-rose shrink-0" /> Pausado
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Legenda abaixo da imagem */}
      <div className="mt-2.5 px-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {sellerObj?.name && <ArtistAvatar avatarUrl={sellerObj.avatarUrl} name={sellerObj.name} size="sm" className="w-7 h-7 rounded-xl shrink-0" />}
          <div className="min-w-0">
            <h3 className="font-display text-sm font-bold text-ink group-hover:text-rose transition-colors line-clamp-1">{product.title}</h3>
            <p className="text-[11px] text-ink/60 font-medium truncate">{sellerObj?.name || 'Artesão Coisart'}</p>
          </div>
        </div>
        <span className="font-display text-base font-bold text-ink shrink-0">€{product.price.toFixed(2)}</span>
      </div>
    </div>
  );
};
