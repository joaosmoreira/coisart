import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Download, Coffee, MapPin, Package, ArrowRight, CreditCard, Building2, Smartphone, ShieldCheck } from 'lucide-react';
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
  const paymentMethod = order?.paymentMethod || 'multibanco';

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-8">
      <div className="flex justify-center">
        <div className="p-4 rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle className="w-16 h-16 text-emerald-600" />
        </div>
      </div>

      <div className="space-y-3">
        <Badge variant="mint" className="text-xs font-bold px-3 py-1">Encomenda Registada com Sucesso!</Badge>
        <h1 className="font-display text-4xl font-bold text-ink">Obrigado pela sua encomenda na Coisart!</h1>
        <p className="text-sm text-ink/70">
          Enviámos uma cópia do resumo do pedido para o e-mail: <strong>{order?.customerEmail || 'do comprador'}</strong>
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6 bg-white border-ink/10 shadow-cozy text-left rounded-3xl">
        <div className="flex items-center justify-between border-b border-ink/10 pb-4 flex-wrap gap-2">
          <div>
            <p className="text-xs uppercase font-bold text-ink/50">N.º de Encomenda</p>
            <p className="font-mono text-sm font-bold text-ink">{id}</p>
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-ink/50">Total da Encomenda</p>
            <p className="font-display text-2xl font-bold text-ink">€{order?.totalAmount?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        {/* DETALHES E INSTRUÇÕES DO MÉTODO DE PAGAMENTO SELECIONADO */}
        <div className="space-y-4 pt-2">
          <h3 className="font-display text-base font-bold text-ink flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-rose" /> Dados de Pagamento
          </h3>

          {/* Multibanco */}
          {paymentMethod === 'multibanco' && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 text-sm">Pagamento por Multibanco (IfthenPay)</span>
                <Badge variant="lemon">Aguarda Pagamento</Badge>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Utilize os dados abaixo para efetuar o pagamento em qualquer caixa Multibanco ou através do seu Homebanking em “Pagamento de Serviços”.
              </p>
              <div className="grid grid-cols-3 gap-2 bg-white p-4 rounded-xl border border-amber-200 text-center font-mono text-sm">
                <div>
                  <p className="text-[10px] text-ink/50 font-sans uppercase font-bold">Entidade</p>
                  <p className="font-bold text-ink">{order?.multibancoEntity || '21523'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-ink/50 font-sans uppercase font-bold">Referência</p>
                  <p className="font-bold text-rose">{order?.multibancoReference || '123 456 789'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-ink/50 font-sans uppercase font-bold">Valor</p>
                  <p className="font-bold text-ink">€{order?.totalAmount?.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* MB WAY */}
          {paymentMethod === 'mbway' && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-rose" /> Pagamento MB WAY
                </span>
                <Badge variant="lemon">Notificação Enviada</Badge>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Enviámos um pedido de pagamento MB WAY para o número <strong>{order?.mbwayPhone || 'indicado'}</strong>. Abra a sua aplicação MB WAY no telemóvel e confirme a transação no valor de <strong>€{order?.totalAmount?.toFixed(2)}</strong>.
              </p>
            </div>
          )}

          {/* Transferência Bancária */}
          {paymentMethod === 'bank_transfer' && (
            <div className="p-5 rounded-2xl bg-cream/80 border border-ink/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink text-sm flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-rose" /> Dados para Transferência Bancária
                </span>
                <Badge variant="rose">Aguarda Transferência</Badge>
              </div>
              <p className="text-xs text-ink/70 leading-relaxed">
                Por favor efetue a transferência bancária para o IBAN abaixo e inclua o N.º de Encomenda como descritivo/referência da transferência.
              </p>
              <div className="p-4 bg-white rounded-xl border border-ink/10 space-y-1.5 text-xs">
                <p><strong>Titular da Conta:</strong> Coisart ~ Mercado Artesanal Lda</p>
                <p><strong>IBAN:</strong> <span className="font-mono font-bold text-ink">PT50 0033 0000 4567 8901 2345 6</span></p>
                <p><strong>SWIFT/BIC:</strong> BPNCPTPL</p>
                <p><strong>Referência / Descritivo:</strong> <span className="font-mono font-bold text-rose">{id}</span></p>
                <p><strong>Montante Exacto:</strong> €{order?.totalAmount?.toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* PayPal */}
          {paymentMethod === 'paypal' && (
            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 text-sm">Pagamento Confirmado via PayPal</span>
                <Badge variant="sky">Concluído</Badge>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                O seu pagamento no valor de <strong>€{order?.totalAmount?.toFixed(2)}</strong> foi confirmado com sucesso através da plataforma PayPal.
              </p>
            </div>
          )}
        </div>

        {/* Instruções para Ficheiros Digitais */}
        {hasDigitalItems && (
          <div className="p-5 rounded-2xl bg-sky/15 border border-sky/30 space-y-3">
            <p className="flex items-center gap-2 font-bold text-ink text-sm">
              <Download className="w-5 h-5 text-sky" /> Ficheiro Digital Pronto para Download Instantâneo
            </p>
            <p className="text-xs text-ink/80 leading-relaxed">
              O seu ficheiro digital já se encontra disponível para download e o link direto permanente foi enviado para o seu e-mail.
            </p>
            <Button size="sm" className="bg-sky text-white font-bold flex items-center gap-1.5">
              <Download className="w-4 h-4" /> Descarregar Ficheiro Digital Agora
            </Button>
          </div>
        )}

        {/* Instruções para Envio / Levantamento */}
        {(!hasDigitalItems || hasPhysicalPrint || isShipping || isCafe || isFair) && (
          <div className="p-5 rounded-2xl bg-cream/40 border border-ink/10 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-rose">
              {hasPhysicalPrint ? '🖼️ Cópia Impressa Física Adicional' : '📦 Envio / Recolha do Artigo Físico'}
            </p>

            {isCafe && (
              <div className="space-y-1 text-xs">
                <p className="flex items-center gap-2 font-bold text-ink">
                  <Coffee className="w-4 h-4 text-mint" /> Ponto de Levantamento: Ah Coisas ~ Concept Store
                </p>
                <p className="text-ink/80 font-medium">📍 Praça das Fontaínhas Loja F, 4795-021 Vila das Aves | Tel: 252 093 463</p>
                <p className="text-ink/70">A sua encomenda estará pronta no balcão. Apresente o seu nome e e-mail ao levantar.</p>
              </div>
            )}

            {isFair && (
              <div className="space-y-1 text-xs">
                <p className="flex items-center gap-2 font-bold text-ink">
                  <MapPin className="w-4 h-4 text-rose" /> Levantamento na Próxima Feira Mensal
                </p>
                <p className="text-ink/70">A sua peça estará guardada na banca do artesão no próximo sábado de feira.</p>
              </div>
            )}

            {isShipping && (
              <div className="space-y-1 text-xs">
                <p className="flex items-center gap-2 font-bold text-ink">
                  <Package className="w-4 h-4 text-rose" /> Envio por CTT / Transportadora
                </p>
                <p className="text-ink/70">O artesão irá embalar e expedir a sua encomenda por CTT assim que o pagamento seja confirmado.</p>
              </div>
            )}
          </div>
        )}
      </Card>

      <Link to="/loja">
        <Button variant="primary" className="px-8 py-3.5 flex items-center gap-2 mx-auto rounded-2xl">
          <ArrowRight className="w-4 h-4" /> Voltar ao Mercado Artesanal
        </Button>
      </Link>
    </div>
  );
};
