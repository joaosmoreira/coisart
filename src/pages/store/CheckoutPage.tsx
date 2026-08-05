import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Truck, Coffee, ShieldCheck, UserCheck, Lock, CreditCard, Building2, Smartphone } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, clearCart, getSubtotal, getShippingFee, getTotalAmount, getUniquePhysicalSellersCount } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Formulário de Checkout (Morada Principal = Comprador / Faturação)
  const [formData, setFormData] = useState({
    name: user?.email ? user.email.split('@')[0] : '',
    email: user?.email || '',
    phone: '',
    nif: '', // NIF do cliente é Opcional
    deliveryMethod: 'cafe_pickup' as 'digital' | 'fair_pickup' | 'cafe_pickup' | 'shipping',
    street: '',
    city: '',
    postalCode: '',

    // Morada de Entrega Diferente (ex: Prenda)
    separateShipping: false,
    recipientName: '',
    recipientPhone: '',
    shippingStreet: '',
    shippingCity: '',
    shippingPostalCode: '',

    // Notas de Encomenda
    notes: '',

    // Criar Conta
    createAccount: false,
    password: '',

    // Método de Pagamento (Multibanco por omissão)
    paymentMethod: 'multibanco' as 'multibanco' | 'bank_transfer' | 'mbway' | 'paypal',
    mbwayPhone: '',

    // Termos e Condições
    acceptTerms: false
  });

  const sellersCount = getUniquePhysicalSellersCount();
  const shippingFee = getShippingFee(formData.deliveryMethod);
  const subtotalWithVat = getSubtotal();
  const basePriceWithoutVat = subtotalWithVat / 1.23;
  const vatAmount = subtotalWithVat - basePriceWithoutVat;
  const totalAmount = getTotalAmount(formData.deliveryMethod);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (!formData.acceptTerms) {
      setError('Por favor confirme que leu e aceita os Termos e Condições da loja.');
      return;
    }

    if (formData.paymentMethod === 'mbway' && !formData.mbwayPhone) {
      setError('Por favor insira o número de telemóvel associado à sua conta MB WAY.');
      return;
    }

    if (formData.createAccount && !user && !formData.password) {
      setError('Por favor escolha uma palavra-passe para a criação da sua nova conta.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Morada de Faturação / Comprador
      const customerAddressObj = {
        street: formData.street,
        city: formData.city,
        postalCode: formData.postalCode,
        country: 'Portugal'
      };

      // Morada de Entrega Diferente (se aplicável)
      const shippingAddressObj = formData.separateShipping
        ? {
            street: formData.shippingStreet || formData.street,
            city: formData.shippingCity || formData.city,
            postalCode: formData.shippingPostalCode || formData.postalCode,
            country: 'Portugal'
          }
        : customerAddressObj;

      const orderPayload = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerNif: formData.nif || '',
        customerAddress: customerAddressObj,
        deliveryMethod: formData.deliveryMethod,
        separateShipping: formData.separateShipping,
        recipientDetails: formData.separateShipping
          ? { name: formData.recipientName, phone: formData.recipientPhone }
          : undefined,
        shippingAddress: shippingAddressObj,
        notes: formData.notes,
        createAccount: formData.createAccount && !user,
        password: formData.password,
        paymentMethod: formData.paymentMethod,
        mbwayPhone: formData.paymentMethod === 'mbway' ? formData.mbwayPhone : '',
        totalAmount,
        items: items.map(i => ({
          productId: i.productId,
          sellerId: i.sellerId,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          type: i.type,
          isPhysicalPrint: i.isPhysicalPrint
        }))
      };

      const res = await api.post<any>('/orders', orderPayload);
      clearCart();
      navigate(`/encomenda-confirmada/${res._id}`);
    } catch (err: any) {
      setError(err.message || 'Erro ao finalizar a encomenda.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={UserCheck}
          title="Não existem artigos no checkout"
          description="O seu carrinho está vazio. Adicione produtos na loja para avançar."
        />
        <div className="text-center mt-6">
          <Link to="/loja">
            <Button variant="primary" className="rounded-2xl">Voltar ao Mercado</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Cabeçalho do Checkout */}
      <div className="flex items-center gap-4 border-b border-ink/10 pb-4">
        <Link to="/carrinho">
          <Button variant="outline" size="sm" className="p-2 rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Checkout & Dados de Compra</h1>
          <p className="text-xs text-ink/60">Preencha os dados de faturação, morada de entrega e selecione o método de pagamento</p>
        </div>
      </div>

      {/* Banner de Aviso de Conta Existente */}
      {!user && (
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Já é cliente registado na Coisart? Faça login para preencher os seus dados automaticamente.</span>
          </div>
          <Link to={`/login?redirect=/checkout`}>
            <Button size="sm" variant="outline" className="h-9 text-xs font-bold border-amber-300 hover:bg-amber-100 rounded-xl whitespace-nowrap">
              Iniciar Sessão →
            </Button>
          </Link>
        </div>
      )}

      {error && <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm font-semibold border border-red-200">{error}</div>}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Coluna 1 e 2: Dados do Comprador / Faturação, Entrega Separada, Conta e Pagamento */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. DADOS DO COMPRADOR E FATURAÇÃO (Padrão) */}
          <Card className="p-6 space-y-4 bg-white border border-ink/10 shadow-cozy rounded-3xl">
            <h2 className="font-display text-xl font-bold text-ink border-b border-ink/10 pb-3 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-rose" /> Dados do Comprador & Faturação
            </h2>

            <p className="text-xs text-ink/60">Estes dados serão utilizados para emissão da fatura e contacto da encomenda:</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nome Completo *" name="name" value={formData.name} onChange={handleChange} required placeholder="ex: Ana Rita Costa" />
              <Input label="E-mail *" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="ana@exemplo.pt" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Telemóvel *" name="phone" value={formData.phone} onChange={handleChange} required placeholder="912 345 678" />
              <Input label="NIF (Opcional para Fatura)" name="nif" value={formData.nif} onChange={handleChange} placeholder="234567890 (Opcional)" />
            </div>

            <div className="pt-2 border-t border-ink/10 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-ink/70">
                Morada Principal / Faturação {formData.deliveryMethod !== 'shipping' && '(Opcional)'}
              </p>
              <Input
                label={`Rua / Morada ${formData.deliveryMethod === 'shipping' ? '*' : '(Opcional)'}`}
                name="street"
                value={formData.street}
                onChange={handleChange}
                required={formData.deliveryMethod === 'shipping'}
                placeholder="Rua Central, nº 10"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={`Cidade / Localidade ${formData.deliveryMethod === 'shipping' ? '*' : '(Opcional)'}`}
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required={formData.deliveryMethod === 'shipping'}
                  placeholder="Porto"
                />
                <Input
                  label={`Código Postal ${formData.deliveryMethod === 'shipping' ? '*' : '(Opcional)'}`}
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  required={formData.deliveryMethod === 'shipping'}
                  placeholder="4000-100"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-ink/10">
              <label className="text-xs font-bold uppercase tracking-wider text-ink/70">Método de Entrega</label>
              <select name="deliveryMethod" value={formData.deliveryMethod} onChange={handleChange} className="w-full h-11 px-4 rounded-2xl border border-ink/15 text-xs bg-white font-bold outline-none focus:ring-2 focus:ring-rose">
                <option value="cafe_pickup">☕ Levantamento na Ah Coisas (Vila das Aves) — GRÁTIS</option>
                <option value="fair_pickup">🎪 Levantamento na Feira Mensal — GRÁTIS</option>
                <option value="shipping">📦 Envio CTT / Transportadora (€4.50 por artesão)</option>
              </select>
            </div>

            {formData.deliveryMethod !== 'shipping' && (
              <div className="p-3.5 bg-mint/20 rounded-2xl border border-mint/40 text-xs text-ink/80 flex items-center gap-2">
                <Coffee className="w-4 h-4 text-mint shrink-0" />
                <span>Ao escolher levantamento em Vila das Aves ou na Feira Mensal, <strong>economiza €{(sellersCount * 4.5).toFixed(2)} em portes de envio</strong>!</span>
              </div>
            )}
          </Card>

          {/* 2. MORADA DE ENTREGA DIFERENTE (Apenas visível se o método for Envio CTT / Transportadora) */}
          {formData.deliveryMethod === 'shipping' && (
            <Card className="p-6 space-y-4 bg-white border border-ink/10 shadow-cozy rounded-3xl animate-in fade-in duration-200">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="separateShipping"
                  checked={formData.separateShipping}
                  onChange={handleChange}
                  className="w-5 h-5 rounded-lg text-rose focus:ring-rose border-ink/20 cursor-pointer"
                />
                <span className="font-bold text-ink text-sm sm:text-base">
                  Enviar para uma morada de entrega diferente?
                </span>
              </label>

              {formData.separateShipping && (
                <div className="space-y-4 pt-3 border-t border-ink/10 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Nome do Destinatário *" name="recipientName" value={formData.recipientName} onChange={handleChange} required={formData.separateShipping} placeholder="ex: Maria Silva" />
                    <Input label="Telemóvel do Destinatário (Opcional)" name="recipientPhone" value={formData.recipientPhone} onChange={handleChange} placeholder="961 234 567" />
                  </div>

                  <Input label="Morada de Entrega *" name="shippingStreet" value={formData.shippingStreet} onChange={handleChange} required={formData.separateShipping} placeholder="Rua Central, nº 45, 1º Esq" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Cidade *" name="shippingCity" value={formData.shippingCity} onChange={handleChange} required={formData.separateShipping} placeholder="Braga" />
                    <Input label="Código Postal *" name="shippingPostalCode" value={formData.shippingPostalCode} onChange={handleChange} required={formData.separateShipping} placeholder="4700-001" />
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* 3. NOTAS DE ENCOMENDA (OPCIONAL) */}
          <Card className="p-6 space-y-3 bg-white border border-ink/10 shadow-cozy rounded-3xl">
            <label className="text-xs font-bold uppercase tracking-wider text-ink/70">
              Notas de encomenda (opcional)
            </label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Notas sobre a sua encomenda, por exemplo, recomendações de entrega ou mensagem especial de oferta para acompanhar a prenda..."
              className="w-full p-3.5 rounded-2xl border border-ink/15 text-sm outline-none focus:ring-2 focus:ring-rose bg-cream/20"
            />
          </Card>

          {/* 4. OPÇÃO DE CRIAR UMA CONTA */}
          {!user && (
            <Card className="p-6 space-y-4 bg-white border border-ink/10 shadow-cozy rounded-3xl">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="createAccount"
                  checked={formData.createAccount}
                  onChange={handleChange}
                  className="w-5 h-5 rounded-lg text-rose focus:ring-rose border-ink/20 cursor-pointer"
                />
                <span className="font-bold text-ink text-sm sm:text-base">
                  Criar uma conta?
                </span>
              </label>

              {formData.createAccount && (
                <div className="pt-3 border-t border-ink/10 space-y-3 animate-in fade-in duration-200">
                  <p className="text-xs text-ink/60">
                    Ao criar conta, os dados introduzidos serão guardados para acompanhar a encomenda e efetuar compras futuras mais rapidamente.
                  </p>
                  <Input
                    label="Palavra-passe para a nova conta *"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={formData.createAccount}
                    placeholder="Escolha uma palavra-passe segura..."
                  />
                </div>
              )}
            </Card>
          )}

          {/* 5. TABELA DE SELEÇÃO DO MÉTODO DE PAGAMENTO */}
          <Card className="p-6 space-y-4 bg-white border border-ink/10 shadow-cozy rounded-3xl">
            <h2 className="font-display text-xl font-bold text-ink border-b border-ink/10 pb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-rose" /> Método de Pagamento
            </h2>

            <div className="divide-y divide-ink/10 rounded-2xl border border-ink/15 overflow-hidden">
              {/* Opção 1: Multibanco */}
              <label className={`p-4 flex items-start gap-3 cursor-pointer transition-colors ${formData.paymentMethod === 'multibanco' ? 'bg-amber-50/60' : 'bg-white hover:bg-cream/40'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="multibanco"
                  checked={formData.paymentMethod === 'multibanco'}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-rose focus:ring-rose cursor-pointer"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink text-sm">Pagamento de Serviços no Multibanco</span>
                    <Badge variant="lemon" className="text-[10px]">IfthenPay</Badge>
                  </div>
                  <p className="text-xs text-ink/70 leading-relaxed">
                    “Pagamento de Serviços”, com entidade e referência, em qualquer caixa Multibanco ou através do seu serviço de homebanking. (Apenas disponível para clientes de bancos Portugueses. Serviço de pagamento prestado pela IfthenPay.)
                  </p>
                </div>
              </label>

              {/* Opção 2: Transferência Bancária */}
              <label className={`p-4 flex items-start gap-3 cursor-pointer transition-colors ${formData.paymentMethod === 'bank_transfer' ? 'bg-amber-50/60' : 'bg-white hover:bg-cream/40'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={formData.paymentMethod === 'bank_transfer'}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-rose focus:ring-rose cursor-pointer"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-rose" />
                    <span className="font-bold text-ink text-sm">Transferência Bancária</span>
                  </div>
                  <p className="text-xs text-ink/70 leading-relaxed">
                    Efectue o seu pagamento por transferência bancária ou depósito directo na nossa conta. Por favor indique o N.º de Encomenda como referência da transferência ou depósito. A sua encomenda não será enviada até confirmação do montante na nossa conta.
                  </p>
                </div>
              </label>

              {/* Opção 3: MB WAY */}
              <label className={`p-4 flex items-start gap-3 cursor-pointer transition-colors ${formData.paymentMethod === 'mbway' ? 'bg-amber-50/60' : 'bg-white hover:bg-cream/40'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="mbway"
                  checked={formData.paymentMethod === 'mbway'}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-rose focus:ring-rose cursor-pointer"
                />
                <div className="space-y-2 w-full">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-rose" />
                    <span className="font-bold text-ink text-sm">MB WAY</span>
                    <Badge variant="lemon" className="text-[10px]">IfthenPay</Badge>
                  </div>
                  <p className="text-xs text-ink/70 leading-relaxed">
                    Pagamento simples, utilizando o “MB WAY” no seu telemóvel. (Apenas disponível para clientes de bancos portugueses com a app MB WAY instalada. Serviço de pagamento prestado pela IfthenPay.)
                  </p>

                  {formData.paymentMethod === 'mbway' && (
                    <div className="pt-2 animate-in fade-in duration-200">
                      <Input
                        label="O seu número de telemóvel associado ao MB WAY *"
                        name="mbwayPhone"
                        value={formData.mbwayPhone}
                        onChange={handleChange}
                        required={formData.paymentMethod === 'mbway'}
                        placeholder="912 345 678"
                        className="bg-white max-w-sm"
                      />
                    </div>
                  )}
                </div>
              </label>

              {/* Opção 4: PayPal */}
              <label className={`p-4 flex items-start gap-3 cursor-pointer transition-colors ${formData.paymentMethod === 'paypal' ? 'bg-amber-50/60' : 'bg-white hover:bg-cream/40'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  checked={formData.paymentMethod === 'paypal'}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-rose focus:ring-rose cursor-pointer"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-800 text-sm">PayPal</span>
                    <Badge variant="sky" className="text-[10px]">Proteção ao Comprador</Badge>
                  </div>
                  <p className="text-xs text-ink/70 leading-relaxed">
                    Pague em toda a segurança através da sua conta PayPal ou cartão de crédito/débito com a proteção oficial ao comprador PayPal.
                  </p>
                </div>
              </label>
            </div>
          </Card>

          {/* 6. POLÍTICA DE PRIVACIDADE E TERMOS DE CONDIÇÃO */}
          <Card className="p-6 space-y-4 bg-white border border-ink/10 shadow-cozy rounded-3xl">
            <p className="text-xs text-ink/70 leading-relaxed">
              Os seus dados pessoais serão utilizados para processar a sua encomenda, para melhorar a sua experiência em toda a loja e para os propósitos descritos na nossa <span className="underline font-semibold cursor-pointer">política de privacidade</span>.
            </p>

            <label className="flex items-start gap-3 cursor-pointer select-none pt-2 border-t border-ink/10">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                required
                className="mt-0.5 w-5 h-5 rounded-lg text-rose focus:ring-rose border-ink/20 cursor-pointer shrink-0"
              />
              <span className="text-sm font-bold text-ink">
                Li e aceito os <span className="underline text-rose">termos e condições</span> da loja *
              </span>
            </label>
          </Card>
        </div>

        {/* Coluna 3: Resumo da Encomenda & Botão Dinâmico (PayPal vs Padrão) */}
        <div className="space-y-6">
          <Card className="p-6 space-y-6 bg-white border border-ink/10 shadow-cozy rounded-3xl sticky top-24">
            <h3 className="font-display text-xl font-bold text-ink border-b border-ink/10 pb-3">Resumo da Encomenda</h3>

            <div className="space-y-3 divide-y divide-ink/10">
              {items.map(item => (
                <div key={item.productId} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-ink truncate">{item.quantity}x {item.title}</p>
                    <p className="text-[10px] text-ink/50">{item.sellerName}</p>
                  </div>
                  <span className="font-bold text-ink shrink-0">€{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-ink/10 space-y-2 text-xs">
              <div className="flex justify-between text-ink/70">
                <span>Subtotal (Sem IVA)</span>
                <span className="font-mono">€{basePriceWithoutVat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-ink/70">
                <span>Imposto IVA (23%)</span>
                <span className="font-mono text-rose">€{vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-ink/70">
                <span>Portes de Envio</span>
                <span>{shippingFee > 0 ? `€${shippingFee.toFixed(2)}` : 'GRÁTIS'}</span>
              </div>

              <div className="pt-3 border-t border-ink/10 flex justify-between items-end">
                <div>
                  <p className="text-xs uppercase font-bold text-ink/50 tracking-wider">Total Final</p>
                  <p className="text-[10px] text-ink/40">com IVA e Portes</p>
                </div>
                <span className="font-display text-3xl font-bold text-ink">€{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* BOTÃO DINÂMICO CONFORME MÉTODO DE PAGAMENTO (PayPal vs Padrão) */}
            {formData.paymentMethod === 'paypal' ? (
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#FFC439] hover:bg-[#F2BA31] text-[#003087] font-bold text-base rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all border border-[#E1AD30]"
              >
                <span className="font-black text-lg italic tracking-tighter text-[#003087]">Pay<span className="text-[#0079C1]">Pal</span></span>
                <span>Pagar com PayPal (€{totalAmount.toFixed(2)})</span>
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-rose hover:bg-rose/90 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-base shadow-md active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                {loading ? 'A processar...' : `Confirmar Encomenda (€${totalAmount.toFixed(2)})`}
              </Button>
            )}

            <div className="p-3.5 bg-cream/60 rounded-2xl border border-ink/10 text-[11px] text-ink/60 space-y-1">
              <p className="font-bold text-ink flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Pagamento Seguro Garantido
              </p>
              <p>Os seus dados são encriptados e processados em segurança pela Coisart e IfthenPay.</p>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
};
