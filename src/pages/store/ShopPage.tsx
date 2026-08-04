import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Sparkles, Filter } from 'lucide-react';
import { api } from '@/services/apiClient';
import { ProductCard } from '@/components/store/ProductCard';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedCategory = searchParams.get('categoria') || '';
  const selectedType = searchParams.get('tipo') || '';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    api.get<any[]>('/categories').then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (selectedCategory) query.set('categoria', selectedCategory);
    if (selectedType) query.set('tipo', selectedType);
    if (searchQuery) query.set('search', searchQuery);

    api.get<any[]>(`/products?${query.toString()}`)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedType, searchQuery]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Cabeçalho Editorial */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-rose">Galeria & Mercado Vivo</span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink">Galeria de Peças Artesanais</h1>
        <p className="text-sm text-ink/70">Fotografia e criação artística independente produzida à mão em Portugal</p>
      </div>

      {/* Barra de Filtros Horizontal Minimalista (Pills) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-ink/10">
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto py-1">
          <button
            onClick={() => updateFilter('categoria', '')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              !selectedCategory ? 'bg-ink text-cream shadow-sm' : 'bg-cream/60 hover:bg-cream text-ink'
            }`}
          >
            Todas as Disciplinas
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => updateFilter('categoria', cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat.slug ? 'bg-rose text-white shadow-sm' : 'bg-cream/60 hover:bg-lemon text-ink'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Filtro por Tipo e Barra de Pesquisa */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedType}
            onChange={(e) => updateFilter('tipo', e.target.value)}
            className="h-10 px-3 rounded-2xl border border-ink/15 text-xs bg-white font-bold text-ink outline-none"
          >
            <option value="">Todos os Tipos</option>
            <option value="physical_unique">✨ Peça Única</option>
            <option value="physical_multiple">📦 Peça Múltipla</option>
            <option value="digital">⚡ Digital</option>
          </select>

          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Pesquisar..."
              value={searchQuery}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full h-10 pl-3 pr-8 rounded-2xl border border-ink/15 text-xs bg-white font-medium outline-none"
            />
            <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-ink/40" />
          </div>
        </div>
      </div>

      {/* Galeria em Grelha MASONRY Editorial */}
      <main>
        {loading ? (
          <LoadingSkeleton />
        ) : products.length === 0 ? (
          <EmptyState icon={Sparkles} title="Nenhuma peça encontrada" description="Tente escolher outra disciplina ou pesquisar por outro termo artesanal." />
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {products.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
