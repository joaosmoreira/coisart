import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();

  const subtotalWithVat = getSubtotal(); // Total com IVA 23% incluído
  const basePriceWithoutVat = subtotalWithVat / 1.23; // Preço sem IVA
  const vatAmount = subtotalWithVat - basePriceWithoutVat; // Valor do IVA

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="O seu carrinho está vazio"
          description="Adicione peças artesanais únicas do nosso mercado para continuar."
        />
        <div className="text-center mt-6">
          <Link to="/loja">
            <Button variant="primary" className="rounded-2xl">Ir para o Mercado Artesanal</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Cabeçalho da Página */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/loja">
            <Button variant="outline" size="sm" className="p-2 rounded-xl">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-3xl font-bold text-ink">Carrinho de Compras</h1>
            <p className="text-xs text-ink/60">Reveja os artigos selecionados e os valores com e sem IVA</p>
          </div>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-rose/10 text-rose border border-rose/20">
          {items.reduce((sum, i) => sum + i.quantity, 0)} {items.length === 1 ? 'artigo' : 'artigos'} no carrinho
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Lista de Artigos no Carrinho */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4 sm:p-6 divide-y divide-ink/10 space-y-4 bg-white border border-ink/10 shadow-cozy rounded-3xl">
            {items.map((item) => {
              const itemUnitPrice = item.price + (item.isPhysicalPrint ? (item.physicalPrintPrice || 0) : 0);
              const itemTotal = itemUnitPrice * item.quantity;
              const itemBase = itemTotal / 1.23;
              const itemVat = itemTotal - itemBase;

              return (
                <div key={item.productId} className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <img src={item.image} alt={item.title} className="w-20 h-20 rounded-2xl object-cover border border-ink/10 shrink-0" />
                    <div className="space-y-1 min-w-0">
                      <p className="text-[11px] font-bold uppercase text-rose tracking-wider">{item.sellerName}</p>
                      <h3 className="font-bold text-ink text-base truncate">{item.title}</h3>
                      <p className="text-xs text-ink/70 font-medium">
                        Preço Unid. com IVA: <strong className="text-ink">€{itemUnitPrice.toFixed(2)}</strong>
                        {item.isPhysicalPrint && (
                          <span className="text-[10px] text-rose font-bold block mt-0.5">⚡ Digital + 🖼️ Impressão Física</span>
                        )}
                      </p>
                      <p className="text-[11px] text-ink/50">
                        Base sem IVA: €{(itemBase / item.quantity).toFixed(2)} | IVA (23%): €{(itemVat / item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-ink/5">
                    {item.type === 'physical_unique' ? (
                      <span className="text-xs font-bold text-ink/60 bg-cream px-3 py-1.5 rounded-xl border border-ink/10">
                        Peça Única (1 un)
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-ink/60">Qtd:</span>
                        <input
                          type="number"
                          min="1"
                          max={item.stock}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                          className="w-16 h-9 px-2 text-center rounded-xl border border-ink/20 font-bold text-sm bg-white"
                        />
                      </div>
                    )}

                    <div className="text-right">
                      <p className="font-bold text-ink text-base">€{itemTotal.toFixed(2)}</p>
                      <p className="text-[10px] text-ink/50">com IVA 23%</p>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Remover do Carrinho"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </Card>

          <div className="p-4 bg-cream/60 rounded-3xl border border-ink/10 flex items-center justify-between text-xs text-ink/70">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Todos os preços apresentados incluem IVA à taxa legal em vigor (23%).
            </span>
            <Link to="/loja" className="font-bold text-rose hover:underline">
              + Adicionar mais artigos
            </Link>
          </div>
        </div>

        {/* Resumo com Discriminacao de IVA e Botao Finalizar Encomenda */}
        <Card className="p-6 space-y-6 bg-white border border-ink/10 shadow-cozy rounded-3xl sticky top-24">
          <h2 className="font-display text-xl font-bold text-ink border-b border-ink/10 pb-3">Resumo da Compra</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-ink/70">
              <span>Subtotal (Sem IVA / Base)</span>
              <span className="font-mono font-semibold">€{basePriceWithoutVat.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-ink/70">
              <span>Imposto IVA (23% incluído)</span>
              <span className="font-mono font-semibold text-rose">€{vatAmount.toFixed(2)}</span>
            </div>

            <div className="pt-3 border-t border-ink/10 flex justify-between items-end">
              <div>
                <p className="text-xs uppercase font-bold text-ink/50 tracking-wider">Total com IVA</p>
                <p className="text-[10px] text-ink/40">Antes dos portes de envio</p>
              </div>
              <span className="font-display text-3xl font-bold text-ink">€{subtotalWithVat.toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 bg-rose hover:bg-rose/90 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-base shadow-md active:scale-95 transition-all"
          >
            Finalizar Encomenda <ArrowRight className="w-5 h-5" />
          </Button>

          <p className="text-[11px] text-center text-ink/50 leading-relaxed">
            No passo seguinte irá introduzir os dados de entrega, faturação, escolher o método de pagamento e aplicar cupões.
          </p>
        </Card>
      </div>
    </div>
  );
};
