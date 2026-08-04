import React, { useState, useEffect } from 'react';
import { Search, X, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Props {
  customers: any[];
  selectedCustomer: any;
  onSelect: (customer: any) => void;
  onClear: () => void;
}

export const CustomerSearchCombobox: React.FC<Props> = ({ customers, selectedCustomer, onSelect, onClear }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm)) ||
    (c.nif && c.nif.includes(searchTerm))
  );

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

  return (
    <div className="relative flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase text-ink/70">
        Pesquisar Cliente (Navegação por Setas ↑↓ & Enter)
      </label>

      {selectedCustomer ? (
        <div className="p-3.5 rounded-2xl bg-mint/30 border border-mint flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-ink" />
            <div>
              <p className="font-bold text-ink text-sm">{selectedCustomer.name}</p>
              <p className="text-xs text-ink/70">{selectedCustomer.email} • Tel: {selectedCustomer.phone} • NIF: {selectedCustomer.nif}</p>
            </div>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={onClear} className="h-8 gap-1">
            <X className="w-3.5 h-3.5" /> Limpar
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Input
            placeholder="Escreva nome, e-mail, telefone ou NIF (use setas ↑↓ e Enter)..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="pr-10"
          />
          <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-ink/40" />

          {isOpen && searchTerm.length > 0 && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-ink/15 shadow-cozy max-h-56 overflow-y-auto divide-y divide-ink/10">
              {filtered.length === 0 ? (
                <div className="p-3 text-xs text-ink/50 text-center">
                  Nenhum cliente encontrado com "{searchTerm}". Preencha os campos abaixo para registar novo.
                </div>
              ) : (
                filtered.map((c, idx) => {
                  const isHighlighted = idx === highlightedIndex;
                  return (
                    <div
                      key={c.email}
                      onClick={() => { onSelect(c); setSearchTerm(''); setIsOpen(false); }}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`p-3 cursor-pointer flex items-center justify-between text-xs transition-colors ${
                        isHighlighted ? 'bg-mint/20 font-semibold border-l-4 border-mint' : 'hover:bg-cream/60'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-ink">{c.name}</p>
                        <p className="text-ink/60">{c.email} • Tel: {c.phone}</p>
                      </div>
                      <Badge variant="mint">NIF: {c.nif}</Badge>
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
