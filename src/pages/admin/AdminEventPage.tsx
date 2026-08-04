import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Save, X, Search, Store, UserPlus, Check, Image as ImageIcon, Upload, Camera, Trash2 } from 'lucide-react';
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

  // Estado de Pesquisa de Artesãos
  const [sellerSearch, setSellerSearch] = useState('');
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Estado do Modal Drag & Drop de Foto do Artesão
  const [activeModalSeller, setActiveModalSeller] = useState<any>(null);
  const [promoPhotoInput, setPromoPhotoInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const loadEventAndSellers = async () => {
    try {
      const [evt, sellersData] = await Promise.all([
        api.get<any>('/event'),
        api.get<any[]>('/sellers')
      ]);

      if (evt) {
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

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (isComboboxOpen && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [highlightedIndex, isComboboxOpen]);

  const searchResults = allSellers.filter((s) => {
    const term = sellerSearch.toLowerCase();
    const nameMatch = s.name?.toLowerCase().includes(term);
    const emailMatch = s.userId?.email?.toLowerCase().includes(term) || s.email?.toLowerCase().includes(term);
    return nameMatch || emailMatch;
  });

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

  const openPhotoModal = (sellerItem: any) => {
    const sellerObj = sellerItem.sellerId || sellerItem;
    setActiveModalSeller({
      id: sellerObj._id || sellerObj,
      name: sellerObj.name || 'Artesão',
      avatarUrl: sellerObj.avatarUrl
    });
    setPromoPhotoInput(sellerItem.promoPhotoUrl || '');
  };

  const closePhotoModal = () => {
    setActiveModalSeller(null);
    setPromoPhotoInput('');
    setIsDragging(false);
  };

  const handleSavePromoPhoto = () => {
    if (!activeModalSeller) return;
    setEventData((prev: any) => ({
      ...prev,
      participatingSellers: prev.participatingSellers.map((item: any) => {
        const id = item.sellerId?._id || item.sellerId || item._id || item;
        if (id === activeModalSeller.id) {
          return { ...item, promoPhotoUrl: promoPhotoInput };
        }
        return item;
      })
    }));
    closePhotoModal();
  };

  // Tratar leitura de Ficheiro de Imagem para DataURL (Drag & Drop)
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecione um ficheiro de imagem válido (PNG, JPG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPromoPhotoInput(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
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
        <p className="text-sm text-ink/70 mt-1">Altere os dados do evento e gira os artesãos que vão estar presentes</p>
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

        {/* Seleção de Artesãos Participantes em Grelha Limpa + Botão de Foto */}
        <Card className="p-6 bg-white border border-ink/10 shadow-cozy space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink/10 pb-3">
            <h3 className="font-display text-lg font-bold text-ink flex items-center gap-2">
              <Store className="w-5 h-5 text-rose" /> Artesãos Presentes nesta Edição ({eventData.participatingSellers.length})
            </h3>
            <span className="text-xs text-ink/60">Pesquise para adicionar artesãos à próxima feira</span>
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
                          ref={(el) => (itemRefs.current[idx] = el)}
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

          {/* Layout Original em Grelha com Ícone para Adicionar Foto Drag & Drop */}
          {eventData.participatingSellers.length === 0 ? (
            <div className="p-6 rounded-2xl bg-cream/40 border border-dashed border-ink/20 text-center text-xs text-ink/50 italic">
              Nenhum artesão selecionado para esta edição. Utilize a caixa de pesquisa acima para adicionar artesãos.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {eventData.participatingSellers.map((item: any) => {
                const seller = item.sellerId || item;
                const sId = seller._id || seller;
                const hasPromoPhoto = Boolean(item.promoPhotoUrl && item.promoPhotoUrl.trim());

                return (
                  <div
                    key={sId}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-sm ${
                      hasPromoPhoto ? 'border-rose/40 bg-rose/5' : 'border-ink/10 bg-cream/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ArtistAvatar avatarUrl={seller.avatarUrl} name={seller.name || 'Artesão'} size="sm" />
                      <div className="min-w-0">
                        <p className="font-bold text-ink text-sm truncate">{seller.name || 'Artesão'}</p>
                        <p className="text-[10px] text-ink/50 truncate">
                          {hasPromoPhoto ? '✓ Foto de publicação adicionada' : (seller.userId?.email || seller.email || '')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Botão de Ícone para Adicionar/Editar Foto do Artesão no Evento */}
                      <button
                        type="button"
                        onClick={() => openPhotoModal(item)}
                        className={`p-2 rounded-xl transition-colors relative ${
                          hasPromoPhoto
                            ? 'bg-rose text-white shadow-sm hover:bg-rose/90'
                            : 'bg-white text-ink/60 hover:text-rose hover:bg-rose/10 border border-ink/10'
                        }`}
                        title={hasPromoPhoto ? 'Alterar foto de publicação do evento' : 'Adicionar foto de publicação do evento'}
                      >
                        <Camera className="w-4 h-4" />
                        {hasPromoPhoto && (
                          <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                        )}
                      </button>

                      {/* Botão de Remover Artesão do Evento */}
                      <button
                        type="button"
                        onClick={() => handleRemoveSeller(sId)}
                        className="p-2 rounded-xl text-ink/40 hover:text-rose hover:bg-white transition-colors"
                        title="Remover artesão do evento"
                      >
                        <X className="w-4 h-4" />
                      </button>
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

      {/* Modal Drag & Drop para Adicionar/Alterar Foto de Publicação do Artesão */}
      {activeModalSeller && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-ink/10 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-ink/10 pb-4">
              <div className="flex items-center gap-3">
                <ArtistAvatar avatarUrl={activeModalSeller.avatarUrl} name={activeModalSeller.name} size="sm" />
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">Foto de Publicação do Evento</h3>
                  <p className="text-xs text-rose font-semibold">{activeModalSeller.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closePhotoModal}
                className="p-2 rounded-2xl hover:bg-cream text-ink/50 hover:text-ink transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Zona de Drag & Drop */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 rounded-3xl border-2 border-dashed text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-rose bg-rose/10 scale-102'
                  : promoPhotoInput
                  ? 'border-emerald-400 bg-emerald-50/50'
                  : 'border-ink/20 bg-cream/30 hover:border-rose hover:bg-rose/5'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {promoPhotoInput ? (
                <div className="space-y-3 w-full flex flex-col items-center">
                  <div className="w-40 h-40 rounded-2xl overflow-hidden shadow-md border-2 border-white relative group">
                    <img src={promoPhotoInput} alt="Pré-visualização" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                      Arraste ou clique para trocar
                    </div>
                  </div>
                  <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Foto Carregada com Sucesso!
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-rose/10 text-rose flex items-center justify-center">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">Arraste a foto da publicação para aqui</p>
                    <p className="text-xs text-ink/60 mt-1">ou clique para selecionar do computador (PNG, JPG, WEBP)</p>
                  </div>
                </>
              )}
            </div>

            {/* Input Alternativo para URL da Foto */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink/70 uppercase">Ou cole o Link / URL da foto</label>
              <Input
                placeholder="https://..."
                value={promoPhotoInput}
                onChange={(e) => setPromoPhotoInput(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Botões de Ação do Modal */}
            <div className="flex items-center justify-between pt-2 border-t border-ink/10">
              {promoPhotoInput ? (
                <button
                  type="button"
                  onClick={() => setPromoPhotoInput('')}
                  className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remover Foto
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={closePhotoModal}>
                  Cancelar
                </Button>
                <Button type="button" size="sm" onClick={handleSavePromoPhoto} className="bg-rose text-white hover:bg-rose/90 font-bold">
                  Guardar Foto
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
