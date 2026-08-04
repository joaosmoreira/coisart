import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Store, Globe, Share2, ExternalLink } from 'lucide-react';
import { api } from '@/services/apiClient';
import { ProductCard } from '@/components/store/ProductCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ArtistAvatar } from '@/components/shared/ArtistAvatar';

export const SellerDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.get<any>(`/sellers/${slug}`)
      .then((data) => {
        if (data && data.seller) {
          setSeller(data.seller);
          setProducts(Array.isArray(data.products) ? data.products : []);
        } else if (data && data.name) {
          setSeller(data);
          setProducts([]);
        } else {
          setSeller(null);
          setProducts([]);
        }
      })
      .catch((err) => {
        console.error('Erro ao carregar detalhes da banca:', err);
        setSeller(null);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (!seller) return <div className="p-12 text-center font-bold text-ink">Banca não encontrada.</div>;

  if (seller.isActive === false) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose/10 text-rose flex items-center justify-center mx-auto">
          <Store className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-3xl font-bold text-ink">Banca Temporariamente Indisponível</h2>
          <p className="text-base text-ink/70 max-w-md mx-auto">
            A banca de <strong>{seller.name}</strong> encontra-se em pausa no momento. Explore outros artesãos disponíveis no nosso mercado.
          </p>
        </div>
        <Link to="/artesaos" className="inline-block pt-2">
          <Button variant="primary" className="rounded-full px-8 py-3">
            Ver Outros Artesãos do Mercado
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <Link to="/loja">
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Mercado
        </Button>
      </Link>

      {/* Banner da Banca do Artesão */}
      <Card className="p-8 bg-cream/50 border-ink/10 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
        <ArtistAvatar avatarUrl={seller.avatarUrl} name={seller.name} size="xl" className="shadow-lg" />
        <div className="space-y-3 flex-1">
          <div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-rose">Artesão Certificado Coisart</span>
              {Array.isArray(seller.disciplines) && seller.disciplines.map((disc: string, i: number) => (
                <span key={i} className="px-2.5 py-0.5 rounded-full bg-white border border-ink/10 text-[11px] font-semibold text-ink/80">
                  {disc}
                </span>
              ))}
            </div>
            <h1 className="font-display text-4xl font-bold text-ink">{seller.name || 'Artesão Coisart'}</h1>
          </div>
          <p className="text-sm text-ink/80 leading-relaxed max-w-2xl">{seller.bio || 'Criador artesanal com peças exclusivas na feira Coisart.'}</p>

          {Array.isArray(seller.links) && seller.links.length > 0 && (
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              {seller.links.map((l: any, i: number) => {
                if (!l || !l.url) return null;
                const platformName = l.platform || 'Instagram';
                const isInstagram = typeof platformName === 'string' && platformName.toLowerCase().includes('instagram');
                return (
                  <a
                    key={i}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-full bg-white border border-ink/15 text-xs font-bold text-ink hover:text-rose flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    {isInstagram ? <Share2 className="w-3.5 h-3.5 text-rose" /> : <Globe className="w-3.5 h-3.5 text-sky" />}
                    {platformName} <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Coleção de Peças da Banca */}
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
            <Store className="w-6 h-6 text-rose" /> Coleção da Banca ({products.length})
          </h2>
          <p className="text-sm text-ink/60">Peças artesanais exclusivas criadas por {seller.name}</p>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={Store}
            title="Nenhum artigo disponível nesta banca"
            description="Esta banca ainda não publicou produtos na feira."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
