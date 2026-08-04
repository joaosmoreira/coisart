import React, { useState, useEffect } from 'react';
import { Search, X, Store } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArtistAvatar } from '@/components/shared/ArtistAvatar';

interface Props {
  sellers: any[];
  selectedSeller: any;
  onSelect: (seller: any) => void;
  onClear: () => void;
  isLocked?: boolean;
}

export const SellerSearchCombobox: React.FC<Props> = ({
  sellers,
  selectedSeller,
  onSelect,
  onClear,
  isLocked = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const filtered = sellers.filter((s) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = s.name?.toLowerCase().includes(term);
    const emailMatch = s.userId?.email?.toLowerCase().includes(term) || s.email?.toLowerCase().includes(term);
    const slugMatch = s.slug?.toLowerCase().includes(term);
    const instaMatch = Array.isArray(s.links) && s.links.some((l: any) => l.url?.toLowerCase().includes(term));
    return nameMatch || emailMatch || slugMatch || instaMatch;
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
        onSelect(filtered[highlightedIndex]);
        setSearchTerm('');
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getInstaHandle = (seller: any) => {
    const link = seller.links?.find((l: any) => l.platform?.toLowerCase().includes('instagram') || l.url?.includes('instagram.com'));
    if (!link) return '';
    return link.url.replace(/https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, '');
  };

  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (isOpen && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div className="relative flex flex-col gap-1.5 flex-1">
      <label className="text-xs font-semibold uppercase text-ink/70 flex items-center gap-1.5">
        <Store className="w-3.5 h-3.5 text-rose" /> Pesquisar Artesão (Navegação por Setas ↑↓ & Enter)
      </label>

      {selectedSeller ? (
        <div className="p-3.5 rounded-2xl bg-cream/70 border border-rose/30 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <ArtistAvatar avatarUrl={selectedSeller.avatarUrl} name={selectedSeller.name} size="sm" />
            <div>
              <p className="font-bold text-ink text-sm">{selectedSeller.name}</p>
              <p className="text-xs text-ink/70 flex items-center gap-2">
                <span>{selectedSeller.userId?.email || selectedSeller.email || ''}</span>
                {getInstaHandle(selectedSeller) && (
                  <span className="text-rose font-medium">{getInstaHandle(selectedSeller)}</span>
                )}
              </p>
            </div>
          </div>
          {!isLocked && (
            <Button type="button" size="sm" variant="outline" onClick={onClear} className="h-8 gap-1 rounded-xl text-xs">
              <X className="w-3.5 h-3.5 text-ink/60" /> Limpar Filtro
            </Button>
          )}
        </div>
      ) : (
        <div className="relative">
          <Input
            placeholder="Escreva nome, e-mail ou @instagram (use setas ↑↓ e Enter)..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="pr-10"
          />
          <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-ink/40" />

          {isOpen && searchTerm.length > 0 && (
            <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-ink/15 shadow-xl max-h-60 overflow-y-auto divide-y divide-ink/10">
              {filtered.length === 0 ? (
                <div className="p-3.5 text-xs text-ink/50 text-center">
                  Nenhum artesão encontrado com "{searchTerm}".
                </div>
              ) : (
                filtered.map((s, idx) => {
                  const insta = getInstaHandle(s);
                  const email = s.userId?.email || s.email || '';
                  const isHighlighted = idx === highlightedIndex;
                  return (
                    <div
                      key={s._id}
                      ref={(el) => (itemRefs.current[idx] = el)}
                      onClick={() => {
                        onSelect(s);
                        setSearchTerm('');
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`p-3 cursor-pointer flex items-center justify-between text-xs transition-colors ${
                        isHighlighted ? 'bg-rose/10 font-semibold border-l-4 border-rose' : 'hover:bg-cream/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ArtistAvatar avatarUrl={s.avatarUrl} name={s.name} size="sm" />
                        <div>
                          <p className="font-bold text-ink text-sm">{s.name}</p>
                          <p className="text-ink/60">
                            {email} {insta && `• ${insta}`}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        isHighlighted ? 'bg-rose text-white' : 'bg-rose/10 text-rose'
                      }`}>
                        {isHighlighted ? 'Premir Enter ↵' : 'Selecionar'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
