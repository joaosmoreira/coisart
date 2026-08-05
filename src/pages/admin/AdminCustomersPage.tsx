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
        <div className="space-y-4">
          {/* 1. VISUALIZAÇÃO EM CARTÕES PARA MOBILE (< md) */}
          <div className="md:hidden space-y-3">
            {customers.map((cust) => (
              <div key={cust.email} className="p-4 bg-white rounded-3xl border border-ink/10 shadow-cozy space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-ink/10 pb-3">
                  <div>
                    <h4 className="font-bold text-ink text-base">{cust.name}</h4>
                    <p className="text-xs text-ink/60">{cust.email}</p>
                  </div>
                  <Badge variant={cust.nif !== 'N/A' ? 'lavender' : 'neutral'}>
                    <CreditCard className="w-3 h-3" /> NIF: {cust.nif}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-ink/80 bg-cream/40 p-2.5 rounded-2xl border border-ink/5">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-rose" /> {cust.phone}
                  </span>
                  <span className="font-semibold">{cust.totalOrders} encom. efetuadas</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-ink/50">Total Gasto na Loja</p>
                    <p className="font-bold text-ink text-lg">€{cust.totalSpent.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/clientes/${encodeURIComponent(cust.email)}`}>
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                        <Eye className="w-3.5 h-3.5" /> Ficha
                      </Button>
                    </Link>
                    <Link to={`/admin/clientes/editar/${encodeURIComponent(cust.email)}`}>
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                        <Edit3 className="w-3.5 h-3.5" /> Editar
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 2. VISUALIZAÇÃO EM TABELA PARA ECRÃS MÉDIOS E GRANDES (>= md) */}
          <div className="hidden md:block bg-white rounded-3xl border border-ink/10 shadow-cozy overflow-x-auto">
            <table className="w-full text-left text-sm text-ink min-w-[650px]">
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
                    <td className="p-4 font-medium text-ink/80">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-ink/40" /> {cust.phone}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant={cust.nif !== 'N/A' ? 'lavender' : 'neutral'}>
                        <CreditCard className="w-3 h-3" /> {cust.nif}
                      </Badge>
                    </td>
                    <td className="p-4 font-semibold">{cust.totalOrders} encom.</td>
                    <td className="p-4 font-bold text-ink text-base">€{cust.totalSpent.toFixed(2)}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
