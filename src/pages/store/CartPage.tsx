import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowLeft, MapPin, CheckCircle, Download, Truck, Coffee } from 'lucide-react';
import { useCartStore, SHIPPING_FEE_PER_SELLER } from '@/store/useCartStore';
import { api } from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, getSubtotal, getShippingFee, getTotalAmount, getUniquePhysicalSellersCount } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', nif: '',
    deliveryMethod: 'cafe_pickup', street: '', city: '', postalCode: ''
  });

  const hasDigitalPrint = items.some(i => i.isPhysicalPrint);
  const sellersCount = getUniquePhysicalSellersCount();
  const shippingFee = getShippingFee(formData.deliveryMethod);
  const subtotal = getSubtotal();
  const totalAmount = getTotalAmount(formData.deliveryMethod);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault(); if (items.length === 0) return;
    setLoading(true); setError('');
    try {
      const addrObj = { street: formData.street, city: formData.city, postalCode: formData.postalCode, country: 'Portugal' };
      const orderPayload = {
        customerName: formData.name, customerEmail: formData.email, customerPhone: formData.phone, customerNif: formData.nif,
        deliveryMethod: formData.deliveryMethod, paymentStatus: 'pending', customerAddress: addrObj,
        shippingAddress: formData.deliveryMethod === 'shipping' ? addrObj : undefined,
        totalAmount,
        items: items.map(i => ({ productId: i.productId, sellerId: i.sellerId, title: i.title, price: i.price, quantity: i.quantity, type: i.type, isPhysicalPrint: i.isPhysicalPrint }))
      };
      const res = await api.post<any>('/orders', orderPayload);
      clearCart(); navigate(`/sucesso/${res._id}`);
    } catch (err: any) { setError(err.message || 'Erro ao finalizar encomenda.'); } finally { setLoading(false); }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState icon={ShoppingBag} title="O seu carrinho está vazio" description="Adicione peças artesanais únicas do nosso mercado para continuar." />
        <div className="text-center mt-6"><Link to="/loja"><Button variant="primary">Ir para o Mercado Artesanal</Button></Link></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/loja"><Button variant="outline" size="sm" className="p-2"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <h1 className="font-display text-3xl font-bold text-ink">Carrinho & Checkout</h1>
      </div>

      {error && <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 divide-y divide-ink/10 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="pt-4 first:pt-0 flex items-center justify-between gap-4">
                <img src={item.image} alt={item.title} className="w-20 h-20 rounded-2xl object-cover border border-ink/10" />
                <div className="flex-1 space-y-1">
                  <p className="text-[11px] font-bold uppercase text-rose">{item.sellerName}</p>
                  <h3 className="font-bold text-ink text-base">{item.title}</h3>
                  <p className="text-xs font-bold text-ink/70">
                    €{(item.price + (item.isPhysicalPrint ? (item.physicalPrintPrice || 0) : 0)).toFixed(2)} cada
                    {item.isPhysicalPrint && <span className="text-[10px] text-rose font-semibold block">⚡ Digital + 🖼️ Impressão Física</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {item.type === 'physical_unique' ? <span className="text-xs font-bold text-ink/60 bg-cream px-3 py-1.5 rounded-xl border">1 Unid</span> : <input type="number" min="1" max={item.stock} value={item.quantity} onChange={(e) => updateQuantity(item.productId, Number(e.target.value))} className="w-16 h-9 px-2 text-center rounded-xl border border-ink/20 font-bold text-sm" />}
                  <button onClick={() => removeItem(item.productId)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </Card>
        </div>

        <Card className="p-6 space-y-6">
          <h2 className="font-display text-xl font-bold text-ink border-b border-ink/10 pb-3">Finalizar Encomenda</h2>
          <form onSubmit={handleCheckout} className="space-y-4">
            <Input label="Nome Completo *" name="name" value={formData.name} onChange={handleChange} required placeholder="ex: Ana Rita" />
            <Input label="E-mail *" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="ana@exemplo.pt" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Telefone *" name="phone" value={formData.phone} onChange={handleChange} required placeholder="912 345 678" />
              <Input label="NIF (Opcional)" name="nif" value={formData.nif} onChange={handleChange} placeholder="234567890" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-ink/70">Método de Entrega</label>
              <select name="deliveryMethod" value={formData.deliveryMethod} onChange={handleChange} className="w-full h-11 px-4 rounded-2xl border border-ink/15 text-xs bg-white font-medium">
                <option value="cafe_pickup">☕ Levantamento na Ah Coisas (Vila das Aves) — GRÁTIS</option>
                <option value="fair_pickup">🎪 Levantamento na Feira Mensal — GRÁTIS</option>
                <option value="shipping">📦 Envio CTT / Transportadora (€{SHIPPING_FEE_PER_SELLER.toFixed(2)} por artesão)</option>
              </select>
            </div>

            {formData.deliveryMethod === 'shipping' && (
              <div className="space-y-3 p-3.5 bg-cream/60 rounded-2xl border border-ink/10">
                <div className="flex items-center justify-between text-xs font-bold text-ink">
                  <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-rose" /> Portes CTT ({sellersCount} Artesãos)</span>
                  <span>€{shippingFee.toFixed(2)}</span>
                </div>
                <Input label="Rua *" name="street" value={formData.street} onChange={handleChange} required placeholder="Rua Central, nº 10" />
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Cidade *" name="city" value={formData.city} onChange={handleChange} required placeholder="Porto" />
                  <Input label="Cód. Postal *" name="postalCode" value={formData.postalCode} onChange={handleChange} required placeholder="4000-100" />
                </div>
              </div>
            )}

            {formData.deliveryMethod !== 'shipping' && (
              <div className="p-3 bg-mint/20 rounded-2xl border border-mint/40 text-xs text-ink/80 flex items-center gap-2">
                <Coffee className="w-4 h-4 text-mint shrink-0" />
                <span>Ao levantar no ponto parceiro em Vila das Aves ou na Feira Mensal, <strong>economiza €{ (sellersCount * SHIPPING_FEE_PER_SELLER).toFixed(2) } em portes</strong>!</span>
              </div>
            )}

            <div className="pt-4 border-t border-ink/10 space-y-1.5">
              <div className="flex justify-between text-xs text-ink/70"><span>Subtotal dos Artigos</span><span>€{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-xs text-ink/70"><span>Portes de Envio</span><span>{shippingFee > 0 ? `€${shippingFee.toFixed(2)}` : 'GRÁTIS'}</span></div>
              <div className="flex justify-between items-center text-lg font-bold text-ink pt-2 border-t"><span>Total Final</span><span className="font-display text-2xl font-bold text-ink">€{totalAmount.toFixed(2)}</span></div>
            </div>

            <Button type="submit" disabled={loading} className="w-full py-3.5 bg-rose hover:bg-rose/90 text-white font-bold rounded-2xl flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" /> {loading ? 'A processar...' : `Confirmar Encomenda (€${totalAmount.toFixed(2)})`}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
