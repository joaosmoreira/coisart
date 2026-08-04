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
        <div className="bg-white rounded-3xl border border-ink/10 shadow-cozy overflow-hidden">
          <table className="w-full text-left text-sm text-ink">
            <thead className="bg-cream/60 uppercase text-[11px] tracking-wider font-semibold text-ink/70 border-b border-ink/10">
              <tr>
                <th className="p-4">Cliente</th>
                <th className="p-4">Telefone</th>
                <th className="p-4">NIF</th>
                <th className="p-4">Encomendas</th>
                <th className="p-4">Total Gasto</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {customers.map((cust) => (
                <tr key={cust.email} className="hover:bg-cream/30 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-ink">{cust.name}</p>
                    <p className="text-xs text-ink/60">{cust.email}</p>
                  </td>
                  <td className="p-4 font-medium text-ink/80 flex items-center gap-1.5 pt-5">
                    <Phone className="w-3.5 h-3.5 text-ink/40" /> {cust.phone}
                  </td>
                  <td className="p-4">
                    <Badge variant={cust.nif !== 'N/A' ? 'lavender' : 'neutral'}>
                      <CreditCard className="w-3 h-3" /> {cust.nif}
                    </Badge>
                  </td>
                  <td className="p-4 font-semibold">{cust.totalOrders} encom.</td>
                  <td className="p-4 font-bold text-ink text-base">€{cust.totalSpent.toFixed(2)}</td>
                  <td className="p-4 text-right flex items-center justify-end gap-2 pt-4">
                    <Link to={`/admin/clientes/${encodeURIComponent(cust.email)}`}>
                      <Button size="sm" variant="outline" className="flex items-center gap-1.5 text-xs">
                        <Eye className="w-3.5 h-3.5" /> Ficha
                      </Button>
                    </Link>
                    <Link to={`/admin/clientes/editar/${encodeURIComponent(cust.email)}`}>
                      <Button size="sm" variant="outline" className="flex items-center gap-1.5 text-xs">
                        <Edit3 className="w-3.5 h-3.5" /> Editar
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
