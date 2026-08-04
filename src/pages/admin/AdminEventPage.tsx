import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Save, Plus, X, Search, Store, UserPlus, Check, Image as ImageIcon } from 'lucide-react';
import { api } from '@/services/apiClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ArtistAvatar } from '@/components/shared/ArtistAvatar';

export const AdminEventPage: React.FC = () => {
  const [eventData, setEventData] = useState<any>({
    title: '',
    date: '',
    time: '',
    location: '',
    bannerUrl: '',
    description: '',
    participatingSellers: []
  });

  const [allSellers, setAllSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Estado de Pesquisa de Artesãos para Adicionar ao Evento
  const [sellerSearch, setSellerSearch] = useState('');
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const navigate = useNavigate();

  const loadEventAndSellers = async () => {
    try {
      const [evt, sellersData] = await Promise.all([
        api.get<any>('/event'),
        api.get<any[]>('/sellers')
      ]);

      if (evt) {
        // Normalizar participatingSellers para o formato { sellerId, promoPhotoUrl }
        const normalizedSellers = (evt.participatingSellers || []).map((item: any) => {
          if (item.sellerId) return item;
          return { sellerId: item, promoPhotoUrl: '' };
        });

        setEventData({
          title: evt.title || '',
          date: evt.date || '',
          time: evt.time || '',
          location: evt.location || '',
          bannerUrl: evt.bannerUrl || '',
          description: evt.description || '',
          participatingSellers: normalizedSellers
        });
      }
      setAllSellers(sellersData || []);
    } catch (err) {
      console.error('Erro ao carregar dados do evento:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventAndSellers();
  }, []);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [sellerSearch]);

  // Artesãos filtrados pela pesquisa
  const searchResults = allSellers.filter((s) => {
    const term = sellerSearch.toLowerCase();
    const nameMatch = s.name?.toLowerCase().includes(term);
    const emailMatch = s.userId?.email?.toLowerCase().includes(term) || s.email?.toLowerCase().includes(term);
    return nameMatch || emailMatch;
  });

  // Verificar se o artesão já está adicionado na lista do evento
  const isSelected = (sellerId: string) => {
    return eventData.participatingSellers.some((item: any) => {
      const id = item.sellerId?._id || item.sellerId || item._id || item;
      return id === sellerId;
    });
  };

  const handleAddSeller = (seller: any) => {
    if (isSelected(seller._id)) return;
    setEventData((prev: any) => ({
      ...prev,
      participatingSellers: [...prev.participatingSellers, { sellerId: seller, promoPhotoUrl: '' }]
    }));
    setSellerSearch('');
    setIsComboboxOpen(false);
  };

  const handleRemoveSeller = (sellerId: string) => {
    setEventData((prev: any) => ({
      ...prev,
      participatingSellers: prev.participatingSellers.filter((item: any) => {
        const id = item.sellerId?._id || item.sellerId || item._id || item;
        return id !== sellerId;
      })
    }));
  };

  const handleUpdatePromoPhoto = (sellerId: string, url: string) => {
    setEventData((prev: any) => ({
      ...prev,
      participatingSellers: prev.participatingSellers.map((item: any) => {
        const id = item.sellerId?._id || item.sellerId || item._id || item;
        if (id === sellerId) {
          return { ...item, promoPhotoUrl: url };
        }
        return item;
      })
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isComboboxOpen || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = searchResults[highlightedIndex];
      if (target && !isSelected(target._id)) {
        handleAddSeller(target);
      }
    } else if (e.key === 'Escape') {
      setIsComboboxOpen(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const formattedSellers = eventData.participatingSellers.map((item: any) => ({
        sellerId: item.sellerId?._id || item.sellerId || item._id || item,
        promoPhotoUrl: item.promoPhotoUrl || ''
      }));

      const payload = {
        ...eventData,
        participatingSellers: formattedSellers
      };

      await api.put('/event', payload);
      setMessage('Edição da próxima feira guardada com sucesso!');
      loadEventAndSellers();
    } catch (err: any) {
      setError(err.message || 'Erro ao guardar dados do evento.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Gestão da Próxima Feira</h1>
        <p className="text-sm text-ink/70 mt-1">Altere as informações promocionais e adicione a publicação de cada artesão</p>
      </div>

      {message && <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">{message}</div>}
      {error && <div className="p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">{error}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Informações Básicas do Evento */}
        <Card className="p-6 bg-white border border-ink/10 shadow-cozy space-y-4">
          <h3 className="font-display text-lg font-bold text-ink flex items-center gap-2 border-b border-ink/10 pb-3">
            <Calendar className="w-5 h-5 text-rose" /> Dados Gerais do Evento
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome / Título da Feira"
              value={eventData.title}
              onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              placeholder="ex: Feira Coisart — Edição de Primavera 2026"
              required
            />
            <Input
              label="Data do Evento"
              value={eventData.date}
              onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
              placeholder="ex: Sábado e Domingo, 16 & 17 de Maio de 2026"
              required
            />
            <Input
              label="Horário de Funcionamento"
              value={eventData.time}
              onChange={(e) => setEventData({ ...eventData, time: e.target.value })}
              placeholder="ex: 10:00 - 19:00"
              required
            />
            <Input
              label="Localização / Morada"
              value={eventData.location}
              onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
              placeholder="ex: Praça das Fontaínhas, Vila das Aves"
              required
            />
          </div>

          <Input
            label="URL da Imagem do Cartaz / Banner Principal"
            value={eventData.bannerUrl}
            onChange={(e) => setEventData({ ...eventData, bannerUrl: e.target.value })}
            placeholder="ex: https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200"
          />

          <div>
            <label className="text-xs font-semibold uppercase text-ink/70 mb-1.5 block">
              Descrição Detalhada do Evento
            </label>
            <textarea
              rows={4}
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              className="w-full p-3.5 rounded-2xl border border-ink/15 text-sm bg-white focus:ring-2 focus:ring-rose outline-none font-sans"
              placeholder="Descreva a edição, workshops e programa..."
              required
            />
          </div>
        </Card>

        {/* Seleção de Artesãos Participantes com Pesquisa por Setas e Fotos de Publicação de Rede Social */}
        <Card className="p-6 bg-white border border-ink/10 shadow-cozy space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink/10 pb-3">
            <h3 className="font-display text-lg font-bold text-ink flex items-center gap-2">
              <Store className="w-5 h-5 text-rose" /> Artesãos e Fotos de Publicação do Evento ({eventData.participatingSellers.length})
            </h3>
            <span className="text-xs text-ink/60">Setas ↑↓ e Enter funcionam na pesquisa</span>
          </div>

          {/* Campo de Pesquisa Inteligente com Navegação por Setas */}
          <div className="relative space-y-1.5">
            <label className="text-xs font-semibold uppercase text-ink/70 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-rose" /> Pesquisar Artesão (Use Setas ↑↓ e Enter)
            </label>
            <div className="relative">
              <Input
                placeholder="Escreva nome do artesão (use setas ↑↓ e Enter para selecionar)..."
                value={sellerSearch}
                onChange={(e) => {
                  setSellerSearch(e.target.value);
                  setIsComboboxOpen(true);
                }}
                onFocus={() => setIsComboboxOpen(true)}
                onKeyDown={handleKeyDown}
                className="pr-10"
              />
              <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-ink/40" />

              {/* Lista Desdobrável de Pesquisa */}
              {isComboboxOpen && sellerSearch.trim().length > 0 && (
                <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-ink/15 shadow-xl max-h-60 overflow-y-auto divide-y divide-ink/10">
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center space-y-3">
                      <p className="text-xs text-ink/60">
                        Nenhum artesão registado com o nome <strong>"{sellerSearch}"</strong>.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => navigate('/admin/artesaos/novo')}
                        className="bg-rose text-white hover:bg-rose/90 text-xs gap-1.5 py-1.5 rounded-xl inline-flex items-center"
                      >
                        <UserPlus className="w-4 h-4" /> Criar Novo Artesão no Sistema
                      </Button>
                    </div>
                  ) : (
                    searchResults.map((s, idx) => {
                      const alreadyAdded = isSelected(s._id);
                      const isHighlighted = idx === highlightedIndex;
                      return (
                        <div
                          key={s._id}
                          onClick={() => !alreadyAdded && handleAddSeller(s)}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                          className={`p-3 flex items-center justify-between text-xs transition-colors ${
                            alreadyAdded
                              ? 'bg-cream/40 opacity-60 cursor-not-allowed'
                              : isHighlighted
                              ? 'bg-rose/10 font-semibold border-l-4 border-rose cursor-pointer'
                              : 'hover:bg-cream/60 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <ArtistAvatar avatarUrl={s.avatarUrl} name={s.name} size="sm" />
                            <div>
                              <p className="font-bold text-ink text-sm">{s.name}</p>
                              <p className="text-ink/60">{s.userId?.email || s.email || ''}</p>
                            </div>
                          </div>
                          {alreadyAdded ? (
                            <Badge variant="outline" className="gap-1 text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
                              <Check className="w-3 h-3 text-emerald-600" /> Adicionado
                            </Badge>
                          ) : (
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                              isHighlighted ? 'bg-rose text-white' : 'bg-rose/10 text-rose'
                            }`}>
                              {isHighlighted ? 'Premir Enter ↵' : '+ Adicionar à Feira'}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Lista de Artesãos Confirmados com Input para Foto da Publicação / Grafismo */}
          {eventData.participatingSellers.length === 0 ? (
            <div className="p-6 rounded-2xl bg-cream/40 border border-dashed border-ink/20 text-center text-xs text-ink/50 italic">
              Nenhum artesão selecionado para esta edição. Utilize a caixa de pesquisa acima para adicionar artesãos.
            </div>
          ) : (
            <div className="space-y-4">
              {eventData.participatingSellers.map((item: any) => {
                const seller = item.sellerId || item;
                const sId = seller._id || seller;
                return (
                  <div
                    key={sId}
                    className="p-4 rounded-2xl border border-ink/10 bg-cream/30 space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <ArtistAvatar avatarUrl={seller.avatarUrl} name={seller.name || 'Artesão'} size="sm" />
                        <div className="min-w-0">
                          <p className="font-bold text-ink text-sm truncate">{seller.name || 'Artesão'}</p>
                          <p className="text-[11px] text-ink/60 truncate">{seller.userId?.email || seller.email || ''}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSeller(sId)}
                        className="p-1.5 rounded-xl text-ink/40 hover:text-rose hover:bg-white transition-colors shrink-0"
                        title="Remover artesão do evento"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* URL da Foto Promocional / Publicação com Grafismo */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-ink/10">
                      <div className="flex-1 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-rose shrink-0" />
                        <Input
                          placeholder="URL da Foto de Publicação do Evento (ex: cartaz com grafismo do artesão)..."
                          value={item.promoPhotoUrl || ''}
                          onChange={(e) => handleUpdatePromoPhoto(sId, e.target.value)}
                          className="text-xs"
                        />
                      </div>
                      {item.promoPhotoUrl && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-rose/30 shrink-0 bg-white">
                          <img src={item.promoPhotoUrl} alt="Publicação Artesão" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Botão de Guardar Alterações */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={saving}
            size="lg"
            className="px-8 py-3 bg-rose text-white hover:bg-rose/90 font-bold flex items-center gap-2 rounded-2xl shadow-lg active:scale-95 transition-all"
          >
            <Save className="w-5 h-5" /> {saving ? 'A guardar evento...' : 'Guardar Alterações da Feira'}
          </Button>
        </div>
      </form>
    </div>
  );
};
