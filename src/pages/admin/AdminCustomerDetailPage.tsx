import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, CreditCard, ShoppingBag, Euro, Edit3, MapPin } from 'lucide-react';
import { api } from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

export const AdminCustomerDetailPage: React.FC = () => {
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) return;
    api.get<any>(`/customers/${encodeURIComponent(email)}`)
      .then(setCustomer)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [email]);

  if (loading) return <LoadingSkeleton />;
  if (!customer) return <div className="p-8 text-center text-ink">Cliente não encontrado.</div>;

  const hasAddress = customer.address && (customer.address.street || customer.address.city);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/clientes')} className="p-2"><ArrowLeft className="w-4 h-4" /></Button>
          <div>
            <h1 className="font-display text-3xl font-bold text-ink">Ficha de Cliente</h1>
            <p className="text-sm text-ink/70">Dados de contacto, NIF, morada e histórico de compras</p>
          </div>
        </div>
        <Link to={`/admin/clientes/editar/${encodeURIComponent(customer.email)}`}>
          <Button variant="primary" className="flex items-center gap-2"><Edit3 className="w-4 h-4" /> Editar Dados do Cliente</Button>
        </Link>
      </div>

      <Card className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose/40 text-ink"><User className="w-6 h-6" /></div>
          <div><p className="text-xs uppercase text-ink/50 font-semibold">Nome</p><p className="font-bold text-ink">{customer.name}</p></div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sky/50 text-ink"><Mail className="w-6 h-6" /></div>
          <div className="truncate"><p className="text-xs uppercase text-ink/50 font-semibold">E-mail</p><p className="font-semibold text-ink text-xs truncate">{customer.email}</p></div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-lemon/60 text-ink"><Phone className="w-6 h-6" /></div>
          <div><p className="text-xs uppercase text-ink/50 font-semibold">Telefone</p><p className="font-bold text-ink">{customer.phone}</p></div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-mint/50 text-ink"><CreditCard className="w-6 h-6" /></div>
          <div><p className="text-xs uppercase text-ink/50 font-semibold">NIF (Opcional)</p><Badge variant="mint">{customer.nif}</Badge></div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center justify-between p-6 sm:col-span-2">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-lavender/50 text-ink mt-1"><MapPin className="w-6 h-6" /></div>
            <div>
              <p className="text-xs uppercase text-ink/50 font-semibold">Morada de Residência / Envio</p>
              {hasAddress ? (
                <div className="mt-1">
                  <p className="font-bold text-ink">{customer.address.street}</p>
                  <p className="text-sm text-ink/70">{customer.address.postalCode} {customer.address.city}, {customer.address.country || 'Portugal'}</p>
                </div>
              ) : (
                <p className="text-sm text-ink/50 italic mt-1">Nenhuma morada registada. Clique em editar para adicionar.</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="flex items-center justify-between p-6">
          <div>
            <p className="text-xs uppercase text-ink/50 font-semibold">Total Gasto em Compras</p>
            <h3 className="font-display text-2xl font-bold text-ink mt-1">€{customer.totalSpent.toFixed(2)}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-rose/40 text-ink"><Euro className="w-6 h-6" /></div>
        </Card>
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold text-ink mb-4">Histórico Completo de Encomendas ({customer.totalOrders})</h2>
        <OrdersTable orders={customer.history} />
      </div>
    </div>
  );
};
