import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, MapPin, Coffee, Phone, Clock, Store } from 'lucide-react';
import { api } from '@/services/apiClient';
import { WaveDivider } from '@/components/shared/WaveDivider';
import { ProductCard } from '@/components/store/ProductCard';
import { SellerCard } from '@/components/store/SellerCard';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [featuredSellers, setFeaturedSellers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any[]>('/products'),
      api.get<any[]>('/sellers?isFeatured=true'),
      api.get<any[]>('/categories')
    ])
      .then(([prods, sellers, cats]) => {
        setFeaturedProducts(Array.isArray(prods) ? prods.slice(0, 24) : []);
        setFeaturedSellers(Array.isArray(sellers) ? sellers.slice(0, 3) : []);
        setCategories(Array.isArray(cats) ? cats : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-0">
      {/* Hero Editorial Artesanal */}
      <section className="relative bg-cream py-20 sm:py-28 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose/15 text-rose text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4" /> Feira de Artes & Mercado Vivo
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-ink tracking-tight leading-tight">
            O carinho de uma feira local, <br />
            <span className="text-rose italic font-normal">feita à mão em Portugal</span>
          </h1>
          <p className="text-base sm:text-lg text-ink/70 max-w-xl mx-auto font-medium leading-relaxed">
            Ilustração, gesso, bordados, marcenaria e instrumentos construídos com alma por artesãos independentes.
          </p>
          <div className="pt-4 flex justify-center">
            <Link to="/loja">
              <button className="px-8 py-4 rounded-full bg-rose text-white font-bold text-sm hover:bg-rose/90 transition-all shadow-lg active:scale-95 flex items-center gap-2">
                Explorar Mercado <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      <WaveDivider fillColor="#ffffff" />

      {/* Disciplinas em Pill Badges */}
      <section className="bg-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-6 text-center">
          <h2 className="font-display text-2xl font-bold text-ink">Disciplinas Artesanais</h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((cat) => (
              <Link key={cat._id} to={`/loja?categoria=${cat.slug}`} className="px-6 py-3 rounded-full bg-cream hover:bg-lemon border border-ink/10 text-ink font-bold text-xs transition-all shadow-sm">
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider fillColor="#FAF8F5" />

      {/* Galeria Masonry de Peças em Destaque */}
      <section className="bg-cream py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-end justify-between border-b border-ink/10 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-rose">Seleção Galeria</span>
              <h2 className="font-display text-3xl font-bold text-ink">Peças com Alma</h2>
            </div>
            <Link to="/loja" className="text-rose font-bold text-xs hover:underline flex items-center gap-1">
              Ver Todo o Mercado <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </div>
      </section>

      <WaveDivider fillColor="#ffffff" />

      {/* Bancas de Artesãos */}
      <section className="bg-white py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-end justify-between border-b border-ink/10 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-rose">Criadores Independentes</span>
              <h2 className="font-display text-3xl font-bold text-ink">Bancas dos Nossos Artesãos</h2>
            </div>
            <Link to="/artesaos" className="text-rose font-bold text-xs hover:underline flex items-center gap-1">
              Ver Todos os Artesãos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredSellers.map((seller) => (
              <SellerCard key={seller._id} seller={seller} />
            ))}
          </div>
        </div>
      </section>

      {/* Cartão Oficial do Ponto de Recolha Parceiro */}
      <section className="bg-cream py-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl p-8 border border-ink/10 shadow-cozy grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <span className="p-3 rounded-2xl bg-mint/40 text-ink inline-block"><Coffee className="w-6 h-6" /></span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose">Ponto de Recolha Parceiro</span>
              <h3 className="font-display text-2xl font-bold text-ink mt-0.5">Ah Coisas ~ Concept Store</h3>
            </div>
            <p className="text-xs text-ink/70 leading-relaxed flex items-start gap-2">
              <MapPin className="w-4 h-4 text-rose shrink-0 mt-0.5" />
              <span>Praça das Fontaínhas Loja F, 4795-021 Vila das Aves</span>
            </p>
            <p className="text-xs text-ink/70 flex items-center gap-2">
              <Phone className="w-4 h-4 text-mint shrink-0" />
              <span>Telefone: <strong>252 093 463</strong></span>
            </p>
          </div>

          <div className="space-y-3 p-5 rounded-2xl bg-cream/50 border border-ink/10">
            <p className="flex items-center gap-2 text-xs font-bold text-ink uppercase tracking-wider">
              <Clock className="w-4 h-4 text-rose" /> Horário de Funcionamento
            </p>
            <div className="text-[11px] text-ink/80 space-y-1 font-medium border-t border-ink/10 pt-2">
              <p><strong>Terça a Quinta:</strong> 10:00–19:45 | 21:15–00:00</p>
              <p><strong>Sexta e Sábado:</strong> 10:00–19:45 | 21:15–02:00</p>
              <p><strong>Segunda-feira:</strong> 21:15–00:00</p>
              <p className="text-red-600 font-bold">Domingo: Encerrado</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
