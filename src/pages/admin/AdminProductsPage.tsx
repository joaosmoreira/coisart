import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, Store } from 'lucide-react';
import { api } from '@/services/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ArtistAvatar } from '@/components/shared/ArtistAvatar';
import { ProductImage } from '@/components/shared/ProductImage';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedSeller, setSelectedSeller] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const loadProducts = async () => {
    try {
      const ep = user?.role === 'seller' && user?.sellerId ? `/products?vendedor=${user.sellerId}` : '/products';
      const data = await api.get<any[]>(ep);
      setProducts(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadProducts(); }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza que deseja desativar este artigo?')) return;
    try { await api.delete(`/products/${id}`); loadProducts(); } catch (err: any) { alert(err.message || 'Erro ao desativar.'); }
  };

  const getBadge = (t: string) => {
    if (t === 'digital') return { label: 'Digital', variant: 'sky' as const };
    if (t === 'physical_multiple') return { label: 'Múltipla', variant: 'lemon' as const };
    return { label: 'Peça Única', variant: 'rose' as const };
  };

  const sellerGroups = products.reduce((acc: Record<string, { id: string; name: string; avatar: string; items: any[] }>, p) => {
    const sId = p.sellerId?._id || 'desconhecido';
    if (!acc[sId]) {
      acc[sId] = { id: sId, name: p.sellerId?.name || 'Artesão Coisart', avatar: p.sellerId?.avatarUrl || '', items: [] };
    }
    acc[sId].items.push(p); return acc;
  }, {});

  const list = Object.values(sellerGroups);
  const filtered = selectedSeller ? list.filter(g => g.id === selectedSeller) : list;

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Gestão de Artigos</h1>
          <p className="text-sm text-ink/70 mt-1">Organizados por Banca ({products.length} artigos no total)</p>
        </div>
        <Link to="/admin/produtos"><Button variant="primary" onClick={() => navigate('/admin/produtos/novo')} className="flex items-center gap-2"><Plus className="w-4 h-4" /> Adicionar Novo Artigo</Button></Link>
      </div>

      {user?.role === 'admin' && list.length > 1 && (
        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-ink/10">
          <Store className="w-4 h-4 text-rose shrink-0" />
          <label className="text-xs font-bold uppercase text-ink/70">Filtrar Banca:</label>
          <select value={selectedSeller} onChange={e => setSelectedSeller(e.target.value)} className="h-10 px-3 rounded-xl border border-ink/15 text-xs bg-white font-medium">
            <option value="">-- Todas as Bancas ({list.length}) --</option>
            {list.map(g => <option key={g.id} value={g.id}>{g.name} ({g.items.length} artigos)</option>)}
          </select>
        </div>
      )}

      {products.length === 0 ? (
        <EmptyState icon={Package} title="Nenhum artigo encontrado" description="Ainda não existem artigos criados no catálogo." actionText="Criar Primeiro Artigo" onAction={() => navigate('/admin/produtos/novo')} />
      ) : (
        <div className="space-y-6">
          {filtered.map(g => (
            <Card key={g.id} className="p-0 overflow-hidden border-ink/15 shadow-cozy">
              <div className="p-4 bg-cream/60 border-b border-ink/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ArtistAvatar avatarUrl={g.avatar} name={g.name} size="sm" />
                  <div><h3 className="font-display text-base font-bold text-ink">{g.name}</h3><p className="text-[11px] text-ink/60">{g.items.length} artigos</p></div>
                </div>
              </div>
              <table className="w-full text-left text-sm text-ink">
                <thead className="bg-white uppercase text-[10px] tracking-wider font-semibold text-ink/50 border-b border-ink/10">
                  <tr><th className="p-3 pl-4">Artigo</th><th className="p-3">Tipo</th><th className="p-3">Preço</th><th className="p-3">Stock</th><th className="p-3 text-right pr-4">Ações</th></tr>
                </thead>
                <tbody className="divide-y divide-ink/10 bg-white">
                  {g.items.map(p => {
                    const b = getBadge(p.type);
                    return (
                      <tr key={p._id} className="hover:bg-cream/30 transition-colors">
                        <td className="p-3 pl-4 flex items-center gap-3">
                          <ProductImage src={p.images?.[0]} alt={p.title} className="w-10 h-10 rounded-xl object-cover border border-ink/10" />
                          <div><p className="font-semibold text-ink text-sm">{p.title}</p><p className="text-[11px] text-ink/50">{p.categoryId?.name || 'Sem Categoria'}</p></div>
                        </td>
                        <td className="p-3"><Badge variant={b.variant}>{b.label}</Badge></td>
                        <td className="p-3 font-bold text-ink">€{p.price.toFixed(2)}</td>
                        <td className="p-3 font-semibold text-xs">{p.stock} un.</td>
                        <td className="p-3 pr-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link to={`/admin/produtos/editar/${p._id}`}><Button size="sm" variant="outline" className="p-1.5"><Edit className="w-3.5 h-3.5 text-ink/70" /></Button></Link>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(p._id)} className="p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></Button>
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
