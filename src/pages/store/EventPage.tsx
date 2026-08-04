import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Sparkles, Store, ArrowRight, HeartHandshake } from 'lucide-react';
import { api } from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { SellerCard } from '@/components/store/SellerCard';

export const EventPage: React.FC = () => {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>('/event')
      .then(setEvent)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-3xl font-bold text-ink">Próxima Feira Coisart</h1>
        <p className="text-ink/70 text-sm">As informações da próxima edição serão reveladas em breve!</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-16 pt-4 sm:pt-8 px-4 sm:px-6">
      {/* Banner / Hero Section com Imagem de Capa do Evento (Espaçado da Navbar) */}
      <section className="relative min-h-[380px] sm:min-h-[460px] rounded-3xl overflow-hidden max-w-7xl mx-auto border border-ink/10 shadow-xl bg-ink text-white flex flex-col justify-end p-6 sm:p-12">
        <div className="absolute inset-0 z-0">
          <img
            src={event.bannerUrl || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200'}
            alt={event.title}
            className="w-full h-full object-cover opacity-50 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
        </div>

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex flex-wrap gap-2">
            <Badge variant="rose" className="font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Próximo Evento Presencial
            </Badge>
            <Badge variant="lemon" className="font-bold text-ink">
              Entrada Livre
            </Badge>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight text-white">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/90 pt-2 font-medium">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/20">
              <Calendar className="w-4 h-4 text-lemon shrink-0" />
              <span>{event.date}</span>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/20">
              <Clock className="w-4 h-4 text-sky shrink-0" />
              <span>{event.time}</span>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/20">
              <MapPin className="w-4 h-4 text-rose shrink-0" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Secção Principal de Informação & Localização */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <Card className="md:col-span-2 p-8 bg-white border border-ink/10 shadow-cozy space-y-6">
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-rose">Programa & Destaques</span>
            <h2 className="font-display text-2xl font-bold text-ink">Sobre a Edição</h2>
          </div>
          <p className="text-ink/80 text-base leading-relaxed whitespace-pre-line font-sans">
            {event.description}
          </p>

          <div className="p-5 rounded-2xl bg-cream/60 border border-ink/10 space-y-3">
            <h4 className="font-display text-sm font-bold text-ink flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-rose" /> Apoio Local & Ponto de Encontro
            </h4>
            <p className="text-xs text-ink/75 leading-relaxed">
              Feira organizada em parceria comunitária com a <strong>Ah Coisas ~ Concept Store</strong> na Praça das Fontaínhas, Loja F, Vila das Aves. Venha celebrar o artesanato local, experimentar workshops e apoiar os artesãos da nossa região!
            </p>
          </div>
        </Card>

        {/* Ficha Rápida do Evento */}
        <Card className="p-6 bg-cream/50 border border-ink/10 shadow-cozy space-y-6">
          <h3 className="font-display text-lg font-bold text-ink flex items-center gap-2 border-b border-ink/10 pb-3">
            <Store className="w-5 h-5 text-rose" /> Ficha da Edição
          </h3>

          <div className="space-y-4 text-xs text-ink/80">
            <div>
              <p className="font-bold text-ink/50 uppercase tracking-wider text-[10px]">Data & Calendário</p>
              <p className="font-bold text-ink text-sm mt-0.5">{event.date}</p>
            </div>

            <div>
              <p className="font-bold text-ink/50 uppercase tracking-wider text-[10px]">Horário de Funcionamento</p>
              <p className="font-bold text-ink text-sm mt-0.5">{event.time}</p>
            </div>

            <div>
              <p className="font-bold text-ink/50 uppercase tracking-wider text-[10px]">Local do Evento</p>
              <p className="font-bold text-ink text-sm mt-0.5">{event.location}</p>
            </div>

            <div>
              <p className="font-bold text-ink/50 uppercase tracking-wider text-[10px]">Preço de Entrada</p>
              <p className="font-bold text-emerald-700 text-sm mt-0.5">Gratuito / Entrada Livre</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Artesãos Confirmados para esta Edição */}
      <section className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-ink/10 pb-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-rose">Bancas Confirmadas</span>
            <h2 className="font-display text-3xl font-bold text-ink mt-1">
              Artesãos Presentes nesta Edição ({event.participatingSellers?.length || 0})
            </h2>
          </div>
          <p className="text-xs text-ink/60">Explore as publicações da feira e aceda à banca de cada artesão.</p>
        </div>

        {!event.participatingSellers || event.participatingSellers.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-cream/40 border border-ink/10 text-ink/60 text-sm italic">
            A lista de artesãos participantes para esta edição será divulgada muito em breve.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {event.participatingSellers.map((item: any, idx: number) => {
              const seller = item.sellerId || item;
              const promoUrl = item.promoPhotoUrl;

              if (promoUrl && promoUrl.trim()) {
                return (
                  <div key={seller._id || idx} className="bg-white rounded-3xl border border-ink/10 overflow-hidden shadow-cozy hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                    <div>
                      {/* Foto de Publicação do Evento com Grafismo */}
                      <div className="relative aspect-square overflow-hidden bg-cream">
                        <img src={promoUrl} alt={`Publicação ${seller.name}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-ink/10 text-[10px] font-bold text-ink flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-3 h-3 text-rose" /> Destaque Feira
                        </div>
                      </div>

                      {/* Informações do Artesão */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center gap-3">
                          <ArtistAvatar avatarUrl={seller.avatarUrl} name={seller.name} size="sm" className="w-10 h-10 rounded-2xl shrink-0" />
                          <div>
                            <h3 className="font-display text-lg font-bold text-ink">{seller.name}</h3>
                            {seller.disciplines && seller.disciplines.length > 0 && (
                              <p className="text-xs text-rose font-semibold">{seller.disciplines.join(' • ')}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <Button
                        onClick={() => window.location.href = `/banca/${seller.slug}`}
                        className="w-full bg-cream hover:bg-rose/20 text-ink font-bold text-xs py-2.5 rounded-2xl border border-ink/10 transition-colors flex items-center justify-center gap-1.5"
                      >
                        Visitar Banca do Artesão <ArrowRight className="w-3.5 h-3.5 text-rose" />
                      </Button>
                    </div>
                  </div>
                );
              }

              return <SellerCard key={seller._id || idx} seller={seller} />;
            })}
          </div>
        )}
      </section>
    </div>
  );
};
