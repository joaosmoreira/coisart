import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Check } from 'lucide-react';
import { api } from '@/services/apiClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CustomerSearchCombobox } from '@/components/admin/CustomerSearchCombobox';
import { ProductSearchCombobox } from '@/components/admin/ProductSearchCombobox';

export const AdminOrderCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    customerName: '', customerEmail: '', customerPhone: '', customerNif: '',
    deliveryMethod: 'cafe_pickup', paymentStatus: 'pending',
    selectedProductId: '', quantity: '1', street: '', city: '', postalCode: ''
  });

  useEffect(() => {
    Promise.all([api.get<any[]>('/products'), api.get<any[]>('/customers')]).then(([prods, custs]) => {
      setProducts(prods); setCustomers(custs);
      if (prods.length > 0) setFormData(prev => ({ ...prev, selectedProductId: prods[0]._id }));
    });
  }, []);

  const selectCustomer = (c: any) => {
    setSelectedCustomer(c);
    setFormData(prev => ({
      ...prev, customerName: c.name, customerEmail: c.email,
      customerPhone: c.phone !== 'Não especificado' ? c.phone : '', customerNif: c.nif !== 'N/A' ? c.nif : '',
      street: c.address?.street || prev.street, city: c.address?.city || prev.city, postalCode: c.address?.postalCode || prev.postalCode
    }));
  };

  const clearCustomer = () => {
    setSelectedCustomer(null);
    setFormData(prev => ({ ...prev, customerName: '', customerEmail: '', customerPhone: '', customerNif: '', street: '', city: '', postalCode: '' }));
  };

  const selectedProd = products.find(p => p._id === formData.selectedProductId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      if (!selectedProd) throw new Error('Selecione um artigo válido.');
      const addrObj = { street: formData.street, city: formData.city, postalCode: formData.postalCode, country: 'Portugal' };
      const payload = {
        customerName: formData.customerName, customerEmail: formData.customerEmail, customerPhone: formData.customerPhone, customerNif: formData.customerNif,
        deliveryMethod: formData.deliveryMethod, paymentStatus: formData.paymentStatus,
        customerAddress: addrObj, shippingAddress: formData.deliveryMethod === 'shipping' ? addrObj : undefined,
        items: [{ productId: selectedProd._id, sellerId: selectedProd.sellerId?._id || selectedProd.sellerId, title: selectedProd.title, price: selectedProd.price, quantity: Number(formData.quantity) || 1, type: selectedProd.type }]
      };
      await api.post('/orders', payload); navigate('/admin/encomendas');
    } catch (err: any) { setError(err.message || 'Erro ao criar encomenda.'); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/encomendas')} className="p-2"><ArrowLeft className="w-4 h-4" /></Button>
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Criar Encomenda Manual</h1>
          <p className="text-sm text-ink/70">Pesquisa inteligente de clientes e artigos em tempo real</p>
        </div>
      </div>

      <Card>
        {error && <div className="p-3 mb-4 rounded-2xl bg-red-50 text-red-700 text-xs">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <CustomerSearchCombobox customers={customers} selectedCustomer={selectedCustomer} onSelect={selectCustomer} onClear={clearCustomer} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome do Cliente *" name="customerName" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} required placeholder="Ana Rita" />
            <Input label="E-mail do Cliente *" name="customerEmail" type="email" value={formData.customerEmail} onChange={e => setFormData({ ...formData, customerEmail: e.target.value })} required placeholder="ana@exemplo.pt" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Telefone *" name="customerPhone" value={formData.customerPhone} onChange={e => setFormData({ ...formData, customerPhone: e.target.value })} required placeholder="912 345 678" />
            <Input label="NIF (Opcional)" name="customerNif" value={formData.customerNif} onChange={e => setFormData({ ...formData, customerNif: e.target.value })} placeholder="234567890" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase text-ink/70">Método de Entrega</label>
              <select name="deliveryMethod" value={formData.deliveryMethod} onChange={e => setFormData({ ...formData, deliveryMethod: e.target.value })} className="h-11 px-4 rounded-2xl border border-ink/15 text-sm bg-white font-medium">
                <option value="cafe_pickup">☕ Levantamento na Ah Coisas (Vila das Aves)</option>
                <option value="fair_pickup">🎪 Levantamento na Feira Mensal</option>
                <option value="shipping">📦 Envio CTT / Transportadora (Exige Morada)</option>
                <option value="digital">⚡ Download Digital Instantâneo</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase text-ink/70">Estado do Pagamento</label>
              <select name="paymentStatus" value={formData.paymentStatus} onChange={e => setFormData({ ...formData, paymentStatus: e.target.value })} className="h-11 px-4 rounded-2xl border border-ink/15 text-sm bg-white font-medium">
                <option value="pending">Pendente / Aguarda Pagamento (Por Omissão)</option>
                <option value="completed">Concluído / Pago</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          {formData.deliveryMethod === 'shipping' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-cream/50 rounded-2xl border border-ink/10">
              <Input label="Rua / Morada CTT *" name="street" value={formData.street} onChange={e => setFormData({ ...formData, street: e.target.value })} required placeholder="Rua Central, nº 10" />
              <Input label="Cidade *" name="city" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} required placeholder="Porto" />
              <Input label="Código Postal *" name="postalCode" value={formData.postalCode} onChange={e => setFormData({ ...formData, postalCode: e.target.value })} required placeholder="4000-100" />
            </div>
          )}

          {/* Pesquisa Inteligente de Artigos */}
          <div className="p-4 bg-cream/30 rounded-2xl border border-ink/10 space-y-3">
            <ProductSearchCombobox products={products} onAddProduct={(p) => setFormData(prev => ({ ...prev, selectedProductId: p._id }))} />
            
            {selectedProd && (
              <div className="p-3 bg-white rounded-2xl border border-rose/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <img src={selectedProd.images?.[0]} alt={selectedProd.title} className="w-10 h-10 rounded-xl object-cover border border-ink/10" />
                  <div>
                    <p className="font-bold text-ink flex items-center gap-1"><Check className="w-3.5 h-3.5 text-rose" /> {selectedProd.title}</p>
                    <p className="text-ink/60">Banca: {selectedProd.sellerId?.name || 'Artesão'} • €{selectedProd.price.toFixed(2)}</p>
                  </div>
                </div>
                <Input label="Quantidade" name="quantity" type="number" min="1" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} required className="w-24 h-9 text-center font-bold" />
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/encomendas')}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> {loading ? 'A registar...' : 'Registar Encomenda'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
