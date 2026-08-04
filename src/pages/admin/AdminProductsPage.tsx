import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, Store, Filter, Search, Tag } from 'lucide-react';
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

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza que deseja desativar este artigo?')) return;
    try {
      await api.delete(`/products/${id}`);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao desativar.');
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
              <table className="w-full text-left text-sm text-ink">
                <thead className="bg-white uppercase text-[10px] tracking-wider font-semibold text-ink/50 border-b border-ink/10">
                  <tr>
                    <th className="p-3 pl-4">Artigo</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Preço</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3 text-right pr-4">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10 bg-white">
                  {g.items.map((p) => {
                    const b = getBadge(p.type);
                    return (
                      <tr key={p._id} className="hover:bg-cream/30 transition-colors">
                        <td className="p-3 pl-4 flex items-center gap-3">
                          <ProductImage src={p.images?.[0]} alt={p.title} className="w-10 h-10 rounded-xl object-cover border border-ink/10" />
                          <div>
                            <p className="font-semibold text-ink text-sm">{p.title}</p>
                            <p className="text-[11px] text-ink/50">{p.categoryId?.name || 'Sem Categoria'}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={b.variant}>{b.label}</Badge>
                        </td>
                        <td className="p-3 font-bold text-ink">€{p.price.toFixed(2)}</td>
                        <td className="p-3 font-semibold text-xs">{p.stock} un.</td>
                        <td className="p-3 pr-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link to={`/admin/produtos/editar/${p._id}`}>
                              <Button size="sm" variant="outline" className="p-1.5">
                                <Edit className="w-3.5 h-3.5 text-ink/70" />
                              </Button>
                            </Link>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(p._id)} className="p-1.5 text-red-500 hover:bg-red-50">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
