import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Sparkles, Download, Store, Layers, Share2, ArrowRight } from 'lucide-react';
import { api } from '@/services/apiClient';
import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ArtistAvatar } from '@/components/shared/ArtistAvatar';
import { ProductImage } from '@/components/shared/ProductImage';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [wantsPhysicalPrint, setWantsPhysicalPrint] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (!slug) return;
    api.get<any>(`/products/${slug}`)
      .then(prod => {
        setProduct(prod);
        if (prod.images && prod.images.length > 0) setActiveImage(prod.images[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSkeleton />;
  if (!product) return <div className="p-12 text-center font-bold text-ink">Artigo não encontrado.</div>;

  const isUnique = product.type === 'physical_unique';
  const isDigital = product.type === 'digital';
  const hasPrintOption = isDigital && product.allowPhysicalPrint;
  const printExtraPrice = product.physicalPrintPrice || 0;
  const finalPrice = product.price + (wantsPhysicalPrint ? printExtraPrice : 0);

  const handleAddToCart = () => {
    const img = activeImage || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800';
    addItem({
      productId: product._id, sellerId: product.sellerId?._id || product.sellerId,
      sellerName: product.sellerId?.name || 'Artesão Coisart', title: product.title,
      slug: product.slug, price: product.price, image: img, type: product.type || 'physical_unique',
      stock: product.stock !== undefined ? product.stock : 1,
      isPhysicalPrint: wantsPhysicalPrint, physicalPrintPrice: printExtraPrice
    });
    navigate('/carrinho');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-4">
          <div className="rounded-3xl overflow-hidden bg-cream/40 border border-ink/10 shadow-cozy">
            <ProductImage src={activeImage} alt={product.title} className="w-full h-auto object-cover max-h-[600px] min-h-[300px] rounded-3xl" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {isUnique && <Badge variant="rose" className="font-bold flex items-center gap-1"><Sparkles className="w-3 h-3" /> Peça Única</Badge>}
              {isDigital && <Badge variant="sky" className="font-bold flex items-center gap-1"><Download className="w-3 h-3" /> Digital</Badge>}
              <Badge variant="neutral">{product.categoryId?.name || 'Artesanato'}</Badge>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">{product.title}</h1>
            <p className="font-display text-3xl font-bold text-ink">€{finalPrice.toFixed(2)}</p>
          </div>

          {/* Opções de Impressão Física Opcional para Artigos Digitais */}
          {hasPrintOption && (
            <Card className="p-4 bg-sky/15 border-sky/30 space-y-3">
              <h4 className="text-xs uppercase font-bold text-sky flex items-center gap-1.5"><Download className="w-4 h-4" /> Formato de Entrega</h4>
              <div className="space-y-2">
                <label className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${!wantsPhysicalPrint ? 'bg-white border-rose ring-2 ring-rose/20 font-bold' : 'bg-white/60 border-ink/10'}`}>
                  <div className="flex items-center gap-2 text-xs">
                    <input type="radio" name="printFormat" checked={!wantsPhysicalPrint} onChange={() => setWantsPhysicalPrint(false)} className="text-rose" />
                    <span>⚡ Apenas Ficheiro Digital (Acesso vitalício para download)</span>
                  </div>
                  <span className="font-bold text-ink text-sm">€{product.price.toFixed(2)}</span>
                </label>

                <label className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${wantsPhysicalPrint ? 'bg-white border-rose ring-2 ring-rose/20 font-bold' : 'bg-white/60 border-ink/10'}`}>
                  <div className="flex items-center gap-2 text-xs">
                    <input type="radio" name="printFormat" checked={wantsPhysicalPrint} onChange={() => setWantsPhysicalPrint(true)} className="text-rose" />
                    <span>🖼️ Ficheiro Digital + Impressão Física Enviada (+€{printExtraPrice.toFixed(2)})</span>
                  </div>
                  <span className="font-bold text-ink text-sm">€{(product.price + printExtraPrice).toFixed(2)}</span>
                </label>
              </div>
              <p className="text-[11px] text-ink/70 italic leading-relaxed bg-white/70 p-2.5 rounded-xl border border-ink/10">
                📌 <strong>Nota:</strong> O ficheiro digital fica <strong>sempre disponível no teu e-mail/conta para voltar a fazer download</strong> a qualquer altura. A cópia física impressa é enviada <strong>1 única vez</strong> por CTT.
              </p>
            </Card>
          )}

          <div className="p-4 bg-cream/40 rounded-2xl border border-ink/10 space-y-2">
            <h4 className="text-xs uppercase font-bold text-rose tracking-wider flex items-center gap-1.5"><Layers className="w-4 h-4" /> Materiais</h4>
            <p className="text-sm font-semibold text-ink">{product.materials || 'Materiais nobres de proveniência sustentável'}</p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-ink/10 space-y-2">
            <h4 className="text-xs uppercase font-bold text-ink/60 tracking-wider">Descrição & História</h4>
            <p className="text-ink/80 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>

          {/* Cartão do Artesão Responsável */}
          {product.sellerId && (
            <Card className="p-6 bg-cream/50 border border-ink/10 space-y-4">
              <div className="flex items-center gap-4">
                <ArtistAvatar avatarUrl={product.sellerId.avatarUrl} name={product.sellerId.name || 'Artesão'} size="lg" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose">Criador desta Peça</span>
                  <h3 className="font-display text-xl font-bold text-ink truncate">{product.sellerId.name}</h3>
                  {product.sellerId.bio && (
                    <p className="text-xs text-ink/75 line-clamp-2 mt-1 italic font-sans font-normal">
                      "{product.sellerId.bio}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-ink/10">
                {product.sellerId.links && product.sellerId.links.length > 0 ? (
                  <a
                    href={product.sellerId.links[0].url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose hover:underline"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Instagram do Artesão
                  </a>
                ) : <div />}

                <Link to={`/banca/${product.sellerId.slug}`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs rounded-xl">
                    <Store className="w-3.5 h-3.5 text-rose" /> Visitar Banca do Artesão <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          <Button size="lg" onClick={handleAddToCart} className="w-full py-4 text-base font-bold flex items-center justify-center gap-2 rounded-3xl bg-rose hover:bg-rose/90 text-white shadow-lg active:scale-95 transition-all">
            <ShoppingBag className="w-5 h-5" /> Adicionar ao Carrinho de Compras (€{finalPrice.toFixed(2)})
          </Button>
        </div>
      </div>
    </div>
  );
};
