import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, Eye, Phone, CreditCard, UserPlus, Edit3 } from 'lucide-react';
import { api } from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';

export interface CustomerData {
  name: string;
  email: string;
  phone: string;
  nif: string;
  totalOrders: number;
  totalSpent: number;
}

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<CustomerData[]>('/customers')
      .then(setCustomers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Gestão de Clientes</h1>
          <p className="text-sm text-ink/70 mt-1">Consulte e edite o perfil dos clientes da feira, contacto, NIF e faturação total</p>
        </div>
        <Link to="/admin/clientes/novo">
          <Button variant="primary" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Adicionar Cliente Manual
          </Button>
        </Link>
      </div>

      {customers.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="Nenhum cliente registado"
          description="Ainda não existem compras ou registos de clientes."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {customers.map((cust) => (
            <div key={cust.email} className="p-5 bg-white rounded-3xl border border-ink/10 shadow-cozy flex flex-col justify-between space-y-4 hover:border-rose/30 transition-all">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-ink/10 pb-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-ink text-base truncate">{cust.name}</h4>
                    <p className="text-xs text-ink/60 truncate">{cust.email}</p>
                  </div>
                  <Badge variant={cust.nif !== 'N/A' ? 'lavender' : 'neutral'} className="shrink-0">
                    <CreditCard className="w-3 h-3" /> NIF: {cust.nif}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-ink/80 bg-cream/40 p-3 rounded-2xl border border-ink/5">
                  <span className="flex items-center gap-1 font-medium">
                    <Phone className="w-3.5 h-3.5 text-rose" /> {cust.phone}
                  </span>
                  <span className="font-bold text-ink/70">{cust.totalOrders} encom. efetuadas</span>
                </div>
              </div>

              <div className="pt-3 border-t border-ink/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-ink/50">Total Gasto na Loja</p>
                  <p className="font-bold text-ink text-xl">€{cust.totalSpent.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/admin/clientes/${encodeURIComponent(cust.email)}`}>
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1 font-bold rounded-xl">
                      <Eye className="w-3.5 h-3.5" /> Ficha
                    </Button>
                  </Link>
                  <Link to={`/admin/clientes/editar/${encodeURIComponent(cust.email)}`}>
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1 font-bold rounded-xl">
                      <Edit3 className="w-3.5 h-3.5" /> Editar
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
