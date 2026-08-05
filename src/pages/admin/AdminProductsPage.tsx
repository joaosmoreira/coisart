import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, Search, Tag, ExternalLink, AlertTriangle } from 'lucide-react';
import { api } from '@/services/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ArtistAvatar } from '@/components/shared/ArtistAvatar';
import { ProductImage } from '@/components/shared/ProductImage';
import { SellerSearchCombobox } from '@/components/admin/SellerSearchCombobox';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Estado para Modal de Confirmação de Eliminação
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { user } = useAuthStore();
  const navigate = useNavigate();

  const isSellerRole = user?.role === 'seller' && Boolean(user?.sellerId);

  const loadData = async () => {
    try {
      const [prodsData, sellersData, catsData] = await Promise.all([
        api.get<any[]>('/products'),
        api.get<any[]>('/sellers'),
        api.get<any[]>('/categories')
      ]);

      setProducts(prodsData || []);
      setSellers(sellersData || []);
      setCategories(catsData || []);

      // Se for um vendedor com sessão iniciada, bloqueia a pesquisa ao seu próprio perfil
      if (isSellerRole && Array.isArray(sellersData)) {
        const ownSeller = sellersData.find(s => s._id === user?.sellerId || s.userId?._id === user?.userId);
        if (ownSeller) {
          setSelectedSeller(ownSeller);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${productToDelete._id}`);
      setProductToDelete(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao desativar artigo.');
    } finally {
      setDeleting(false);
    }
  };

  const getBadge = (t: string) => {
    if (t === 'digital') return { label: 'Digital', variant: 'sky' as const };
    if (t === 'physical_multiple') return { label: 'Múltipla', variant: 'lemon' as const };
    return { label: 'Peça Única', variant: 'rose' as const };
  };

  // Filtragem combinada por Artesão Selecionado, Categoria e Pesquisa de Texto
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Filtro por Vendedor / Artesão
      if (selectedSeller) {
        const pSellerId = p.sellerId?._id || p.sellerId;
        if (pSellerId !== selectedSeller._id) return false;
      }

      // Filtro por Categoria
      if (selectedCategory) {
        const pCatId = p.categoryId?._id || p.categoryId;
        if (pCatId !== selectedCategory) return false;
      }

      // Filtro por Pesquisa de Texto do Produto
      if (productSearch.trim()) {
        const term = productSearch.toLowerCase();
        const titleMatch = p.title?.toLowerCase().includes(term);
        const matMatch = p.materials?.toLowerCase().includes(term);
        if (!titleMatch && !matMatch) return false;
      }

      return true;
    });
  }, [products, selectedSeller, selectedCategory, productSearch]);

  // Agrupamento dos produtos filtrados por Banca / Vendedor
  const sellerGroups = useMemo(() => {
    return filteredProducts.reduce((acc: Record<string, { id: string; name: string; avatar: string; items: any[] }>, p) => {
      const sId = p.sellerId?._id || 'desconhecido';
      if (!acc[sId]) {
        acc[sId] = {
          id: sId,
          name: p.sellerId?.name || 'Artesão Coisart',
          avatar: p.sellerId?.avatarUrl || '',
          items: []
        };
      }
      acc[sId].items.push(p);
      return acc;
    }, {});
  }, [filteredProducts]);

  const list = Object.values(sellerGroups);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Gestão de Artigos</h1>
          <p className="text-sm text-ink/70 mt-1">
            Organizados por Banca ({filteredProducts.length} de {products.length} artigos apresentados)
          </p>
        </div>
        <Link to="/admin/produtos/novo">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Adicionar Novo Artigo
          </Button>
        </Link>
      </div>

      {/* Painel de Filtros e Pesquisa Inteligente */}
      <Card className="p-5 bg-white border border-ink/10 shadow-cozy space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4">
          {/* Pesquisa de Artesão por Combobox (Nome, E-mail ou Instagram) */}
          <SellerSearchCombobox
            sellers={sellers}
            selectedSeller={selectedSeller}
            onSelect={(s) => setSelectedSeller(s)}
            onClear={() => setSelectedSeller(null)}
            isLocked={isSellerRole}
          />

          {/* Filtro por Categoria */}
          <div className="flex flex-col gap-1.5 md:w-64">
            <label className="text-xs font-semibold uppercase text-ink/70 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-mint" /> Categoria do Artigo
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 rounded-2xl border border-ink/15 text-xs bg-white font-medium focus:ring-2 focus:ring-rose outline-none"
            >
              <option value="">-- Todas as Categorias ({categories.length}) --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pesquisa por Nome do Artigo */}
          <div className="flex flex-col gap-1.5 md:w-64">
            <label className="text-xs font-semibold uppercase text-ink/70 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-sky" /> Pesquisar Artigo
            </label>
            <Input
              placeholder="Título ou materiais..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="h-10 text-xs"
            />
          </div>
        </div>
      </Card>

      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum artigo encontrado"
          description="Nenhum artigo corresponde aos filtros de artesão, categoria ou texto selecionados."
          actionText="Criar Novo Artigo"
          onAction={() => navigate('/admin/produtos/novo')}
        />
      ) : (
        <div className="space-y-6">
          {list.map((g) => (
            <Card key={g.id} className="p-0 overflow-hidden border-ink/15 shadow-cozy">
              <div className="p-4 bg-cream/60 border-b border-ink/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ArtistAvatar avatarUrl={g.avatar} name={g.name} size="sm" />
                  <div>
                    <h3 className="font-display text-base font-bold text-ink">{g.name}</h3>
                    <p className="text-[11px] text-ink/60">{g.items.length} artigos listados</p>
                  </div>
                </div>
              </div>

              {/* Grelha Responsiva de Cartões de Produtos (1 col no mobile, 2 col no tablet, 3 col no desktop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-white">
                {g.items.map((p) => {
                  const b = getBadge(p.type);
                  return (
                    <div key={p._id} className="p-4 rounded-3xl border border-ink/10 bg-cream/20 shadow-sm flex flex-col justify-between space-y-3 hover:border-rose/40 hover:shadow-md transition-all">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <ProductImage src={p.images?.[0]} alt={p.title} className="w-16 h-16 rounded-2xl object-cover border border-ink/10 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-ink text-sm truncate">{p.title}</h4>
                            <p className="text-xs text-ink/60">{p.categoryId?.name || 'Sem Categoria'}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge variant={b.variant}>{b.label}</Badge>
                              <span className="text-[11px] font-semibold text-ink/70">{p.stock} un. stock</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-ink/10 flex-wrap gap-2">
                        <span className="font-bold text-ink text-lg">€{p.price.toFixed(2)}</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Botão Ver Artigo (Link para a página pública em Tom Pastel) */}
                          <Link to={`/artigo/${p.slug}`} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs gap-1 font-bold rounded-xl bg-sky-100 border border-sky-300 text-sky-950 hover:bg-sky-200 shadow-sm flex items-center">
                              <ExternalLink className="w-3.5 h-3.5 text-sky-700" /> Ver Artigo
                            </Button>
                          </Link>

                          {/* Botão Editar */}
                          <Link to={`/admin/produtos/editar/${p._id}`}>
                            <Button size="sm" variant="outline" className="h-8 px-2 text-xs gap-1 font-bold rounded-xl">
                              <Edit className="w-3.5 h-3.5" /> Editar
                            </Button>
                          </Link>

                          {/* Botão Eliminar com Confirmação */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setProductToDelete(p)}
                            className="h-8 px-2 text-xs text-red-500 hover:bg-red-50 font-bold rounded-xl"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Segurança para Confirmação de Eliminação de Artigo */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-ink/10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 border-b border-ink/10 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-ink">Confirmar Eliminação</h3>
                <p className="text-xs text-ink/60">Segurança do Backoffice</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-ink/80 bg-cream/40 p-4 rounded-2xl border border-ink/5">
              <p>Tem a certeza que deseja eliminar / desativar o artigo:</p>
              <p className="font-bold text-ink text-base">"{productToDelete.title}"</p>
              <p className="text-xs text-ink/60">Esta ação irá remover o produto do mercado público e da lista de vendas.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setProductToDelete(null)}
                disabled={deleting}
                className="rounded-xl text-xs font-bold"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={confirmDeleteProduct}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs"
              >
                <Trash2 className="w-4 h-4" /> {deleting ? 'A eliminar...' : 'Sim, Eliminar Artigo'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
