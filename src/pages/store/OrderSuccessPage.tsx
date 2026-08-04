import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Download, Coffee, MapPin, Package, ArrowRight } from 'lucide-react';
import { api } from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get<any[]>(`/orders`)
      .then(orders => {
        const found = orders.find(o => o._id === id);
        setOrder(found || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSkeleton />;

  const hasDigitalItems = order?.items?.some((i: any) => i.type === 'digital');
  const hasPhysicalPrint = order?.items?.some((i: any) => i.isPhysicalPrint);
  const isCafe = order?.deliveryMethod === 'cafe_pickup';
  const isFair = order?.deliveryMethod === 'fair_pickup';
  const isShipping = order?.deliveryMethod === 'shipping';

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
      <div className="flex justify-center">
        <div className="p-4 rounded-full bg-mint/30 text-ink"><CheckCircle className="w-16 h-16 text-mint" /></div>
      </div>

      <div className="space-y-3">
        <Badge variant="mint" className="text-xs font-bold px-3 py-1">Encomenda Recebida com Sucesso!</Badge>
        <h1 className="font-display text-4xl font-bold text-ink">Obrigado pela tua compra artesanal!</h1>
        <p className="text-sm text-ink/70">Receberás todas as novidades no e-mail: <strong>{order?.customerEmail || 'do comprador'}</strong></p>
      </div>

      <Card className="p-8 space-y-6 bg-cream/40 border-ink/10 text-left">
        <div className="flex items-center justify-between border-b border-ink/10 pb-4">
          <div>
            <p className="text-xs uppercase font-bold text-ink/50">Número da Encomenda</p>
            <p className="font-mono text-sm font-bold text-ink">{id}</p>
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-ink/50">Total Pago</p>
            <p className="font-display text-2xl font-bold text-ink">€{order?.totalAmount?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        {/* Instruções Dinâmicas para Ficheiros Digitais */}
        {hasDigitalItems && (
          <div className="p-5 rounded-2xl bg-sky/15 border border-sky/30 space-y-3">
            <p className="flex items-center gap-2 font-bold text-ink text-sm"><Download className="w-5 h-5 text-sky" /> Ficheiro Digital Pronto para Download Instantâneo</p>
            <p className="text-xs text-ink/80 leading-relaxed">
              O teu ficheiro digital já se encontra disponível para download e o link direto permanente foi enviado para o teu e-mail.
            </p>
            <Button size="sm" className="bg-sky text-white font-bold flex items-center gap-1.5"><Download className="w-4 h-4" /> Descarregar Ficheiro Digital Agora</Button>
          </div>
        )}

        {/* Instruções Dinâmicas para Cópia Física ou Envio */}
        {(!hasDigitalItems || hasPhysicalPrint || isShipping || isCafe || isFair) && (
          <div className="p-5 rounded-2xl bg-white border border-ink/10 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-rose">
              {hasPhysicalPrint ? '🖼️ Cópia Impressa Física Adicional' : '📦 Envio / Recolha do Artigo Físico'}
            </p>

            {isCafe && (
              <div className="space-y-1 text-xs">
                <p className="flex items-center gap-2 font-bold text-ink"><Coffee className="w-4 h-4 text-mint" /> Ponto de Levantamento: Ah Coisas ~ Concept Store</p>
                <p className="text-ink/80 font-medium">📍 Praça das Fontaínhas Loja F, 4795-021 Vila das Aves | Tel: 252 093 463</p>
                <p className="text-ink/70">A cópia impressa estará pronta no balcão. Apresenta o teu nome e e-mail.</p>
              </div>
            )}

            {isFair && (
              <div className="space-y-1 text-xs">
                <p className="flex items-center gap-2 font-bold text-ink"><MapPin className="w-4 h-4 text-rose" /> Levantamento na Próxima Feira Mensal</p>
                <p className="text-ink/70">A tua peça impressa estará guardada na banca do artesão no próximo sábado de feira.</p>
              </div>
            )}

            {isShipping && (
              <div className="space-y-1 text-xs">
                <p className="flex items-center gap-2 font-bold text-ink"><Package className="w-4 h-4 text-rose" /> Envio por CTT / Transportadora</p>
                <p className="text-ink/70">O artesão irá embalar e expedir a tua cópia impressa por CTT com número de registo.</p>
              </div>
            )}
          </div>
        )}
      </Card>

      <Link to="/loja">
        <Button variant="primary" className="px-8 py-3.5 flex items-center gap-2 mx-auto"><ArrowRight className="w-4 h-4" /> Voltar ao Mercado Artesanal</Button>
      </Link>
    </div>
  );
};
