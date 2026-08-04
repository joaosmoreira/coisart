import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ProductImage } from '@/components/shared/ProductImage';

interface Props {
  products: any[];
  onAddProduct: (product: any) => void;
}

export const ProductSearchCombobox: React.FC<Props> = ({ products, onAddProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const filtered = products.filter(p => {
    const term = searchTerm.toLowerCase();
    const titleMatch = p.title?.toLowerCase().includes(term);
    const sellerMatch = p.sellerId?.name?.toLowerCase().includes(term);
    const catMatch = p.categoryId?.name?.toLowerCase().includes(term);
    return titleMatch || sellerMatch || catMatch;
  });

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlightedIndex]) {
        onAddProduct(filtered[highlightedIndex]);
        setSearchTerm('');
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase text-ink/70 flex items-center justify-between">
        <span>Adicionar Artigo à Encomenda (Setas ↑↓ & Enter)</span>
        <span className="text-[10px] text-rose font-bold">Pesquisa por Título, Artesão ou Categoria</span>
      </label>

      <div className="relative">
        <Input
          placeholder="Escreva título, artesão ou categoria (use setas ↑↓ e Enter)..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pr-10"
        />
        <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-ink/40" />

        {isOpen && searchTerm.length > 0 && (
          <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-ink/15 shadow-cozy max-h-64 overflow-y-auto divide-y divide-ink/10">
            {filtered.length === 0 ? (
              <div className="p-4 text-xs text-ink/50 text-center">
                Nenhum artigo encontrado com "{searchTerm}".
              </div>
            ) : (
              filtered.map((p, idx) => {
                const isHighlighted = idx === highlightedIndex;
                return (
                  <div
                    key={p._id}
                    onClick={() => {
                      onAddProduct(p);
                      setSearchTerm('');
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`p-3 cursor-pointer flex items-center justify-between gap-3 text-xs transition-colors ${
                      isHighlighted ? 'bg-rose/10 font-semibold border-l-4 border-rose' : 'hover:bg-cream/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ProductImage
                        src={p.images?.[0]}
                        alt={p.title}
                        className="w-10 h-10 rounded-xl object-cover border border-ink/10"
                      />
                      <div>
                        <p className="font-bold text-ink text-sm">{p.title}</p>
                        <p className="text-[11px] text-ink/60">
                          Banca: <strong>{p.sellerId?.name || 'Artesão'}</strong> • {p.categoryId?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink text-sm">€{p.price?.toFixed(2)}</span>
                      <button
                        type="button"
                        className={`px-2.5 py-1 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                          isHighlighted ? 'bg-rose text-white ring-2 ring-rose/30' : 'bg-rose/10 text-rose'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" /> {isHighlighted ? 'Premir Enter' : 'Adicionar'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
