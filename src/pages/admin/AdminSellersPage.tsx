import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, Star, Edit3, Power, Search, Sparkles, X, AlertCircle } from 'lucide-react';
import { api } from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ArtistAvatar } from '@/components/shared/ArtistAvatar';

export const AdminSellersPage: React.FC = () => {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const loadSellers = async () => {
    try {
      const data = await api.get<any[]>('/sellers');
      setSellers(data);
    } catch (err) {
      console.error('Erro ao carregar artesãos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellers();
  }, []);

  // Artesãos atualmente em destaque (máximo 3)
  const featuredSellers = useMemo(() => {
    return sellers.filter((s) => s.isFeatured);
  }, [sellers]);

  // Lista filtrada pela barra de pesquisa
  const filteredSellers = useMemo(() => {
    if (!searchQuery.trim()) return sellers;
    const query = searchQuery.toLowerCase();
    return sellers.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.slug.toLowerCase().includes(query) ||
        (Array.isArray(s.disciplines) && s.disciplines.some((d: string) => d.toLowerCase().includes(query)))
    );
  }, [sellers, searchQuery]);

  const handleToggleFeatured = async (seller: any) => {
    setAlertMessage(null);
    const currentlyFeatured = Boolean(seller.isFeatured);

    if (!currentlyFeatured && featuredSellers.length >= 3) {
      setAlertMessage(`Limite de 3 destaques atingido! Remova um dos artesãos em destaque na Homepage antes de adicionar "${seller.name}".`);
      return;
    }

    try {
      await api.put(`/sellers/${seller._id}`, { isFeatured: !currentlyFeatured });
      await loadSellers();
    } catch (err: any) {
      setAlertMessage(err.message || 'Erro ao alterar destaque do artesão.');
    }
  };

  const handleToggleActive = async (seller: any) => {
    const newStatus = !(seller.isActive !== false);
    try {
      await api.put(`/sellers/${seller._id}`, { isActive: newStatus });
      loadSellers();
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar estado da conta.');
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-8">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Gestão de Artesãos & Criadores</h1>
          <p className="text-sm text-ink/70 mt-1">Gerencie os perfis dos artesãos, ative/desactive contas e gira os destaques na Homepage</p>
        </div>
        <Link to="/admin/vendedores/novo">
          <Button variant="primary" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Adicionar Artesão
          </Button>
        </Link>
      </div>

      {/* Alerta de Erro ou Limite de Destaques */}
      {alertMessage && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{alertMessage}</span>
          </div>
          <button onClick={() => setAlertMessage(null)} className="p-1 hover:bg-amber-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-amber-800" />
          </button>
        </div>
      )}

      {/* Painel de Gestão de Destaques na Homepage (Máximo 3) */}
      <div className="bg-gradient-to-r from-cream via-white to-amber-50/50 p-6 rounded-3xl border border-ink/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink/10 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose" />
            <h2 className="font-display text-xl font-bold text-ink">Destaques na Homepage</h2>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose/10 text-rose border border-rose/20">
            {featuredSellers.length} de 3 selecionados
          </span>
        </div>

        {featuredSellers.length === 0 ? (
          <p className="text-xs text-ink/60 italic py-2">Nenhum artesão em destaque no momento. Utilize a pesquisa abaixo para adicionar até 3 destaques.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featuredSellers.map((seller) => (
              <div key={seller._id} className="bg-white p-4 rounded-2xl border border-rose/30 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <ArtistAvatar avatarUrl={seller.avatarUrl} name={seller.name} size="sm" />
                  <div className="min-w-0">
                    <p className="font-bold text-ink text-xs truncate">{seller.name}</p>
                    <p className="text-[11px] text-rose font-medium">⭐ Em destaque</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleFeatured(seller)}
                  className="p-1.5 h-8 text-xs text-rose hover:bg-rose/10 border-rose/30"
                  title="Remover das 3 bancas em destaque"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Barra de Pesquisa de Artesãos */}
      <div className="bg-white p-4 rounded-3xl border border-ink/10 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-ink/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Pesquisar artesão por nome, slug ou técnica..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-2xl bg-cream/30 border-ink/15 focus:bg-white"
          />
        </div>
        <span className="text-xs text-ink/60 font-medium whitespace-nowrap">
          A mostrar {filteredSellers.length} de {sellers.length} artesãos
        </span>
      </div>

      {/* Lista / Grelha de Artesãos */}
      {filteredSellers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum artesão encontrado"
          description="Tente ajustar os termos da sua pesquisa."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSellers.map((seller) => {
            const isActive = seller.isActive !== false;
            const isFeatured = Boolean(seller.isFeatured);

            return (
              <div key={seller._id} className="bg-white rounded-3xl p-6 border border-ink/10 shadow-cozy flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <ArtistAvatar avatarUrl={seller.avatarUrl} name={seller.name} size="sm" />
                      <div>
                        <h3 className="font-bold text-ink text-base">{seller.name}</h3>
                        <p className="text-xs text-ink/60">/banca/{seller.slug}</p>
                      </div>
                    </div>
                    <Badge variant={isActive ? 'mint' : 'rose'}>
                      {isActive ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>

                  {seller.disciplines && seller.disciplines.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {seller.disciplines.map((d: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-cream text-[10px] font-medium text-ink/70 border border-ink/5">
                          {d}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-ink/70 line-clamp-2">{seller.bio || 'Sem biografia.'}</p>
                </div>

                <div className="pt-4 border-t border-ink/10 space-y-2">
                  {/* Botão Rápido de Destaque (Máximo 3) */}
                  <Button
                    size="sm"
                    variant={isFeatured ? 'secondary' : 'outline'}
                    onClick={() => handleToggleFeatured(seller)}
                    className={`w-full flex items-center justify-center gap-1.5 text-xs rounded-xl ${
                      isFeatured
                        ? 'bg-rose text-white hover:bg-rose/90'
                        : 'border-amber-300 text-amber-900 bg-amber-50/50 hover:bg-amber-100'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-white' : 'fill-amber-500 text-amber-500'}`} />
                    {isFeatured ? 'Destaque na Homepage (Ativo)' : 'Adicionar aos Destaques (Homepage)'}
                  </Button>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Button
                      size="sm"
                      variant={isActive ? 'outline' : 'primary'}
                      onClick={() => handleToggleActive(seller)}
                      className="flex items-center gap-1.5 text-xs flex-1"
                    >
                      <Power className="w-3.5 h-3.5" />
                      {isActive ? 'Desativar' : 'Ativar'}
                    </Button>

                    <Link to={`/admin/vendedores/editar/${seller._id}`}>
                      <Button size="sm" variant="outline" className="flex items-center gap-1.5 text-xs">
                        <Edit3 className="w-3.5 h-3.5" /> Editar
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
