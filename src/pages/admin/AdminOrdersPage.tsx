import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, PlusCircle } from 'lucide-react';
import { api } from '@/services/apiClient';
import { OrdersTable, OrderData } from '@/components/admin/OrdersTable';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const data = await api.get<OrderData[]>('/orders');
      setOrders(data);
    } catch (err) {
      console.error('Erro ao carregar encomendas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'pending' | 'completed' | 'failed' | 'cancelled', isResend?: boolean) => {
    try {
      await api.put(`/orders/${id}/status`, { paymentStatus: status, isResend });
      loadOrders();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar estado.');
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Gestão de Encomendas</h1>
          <p className="text-sm text-ink/70 mt-1">
            Gestão de estados, controlo de falhas e sinalização de reenvios por erro de entrega
          </p>
        </div>
        <Link to="/admin/encomendas/nova">
          <Button variant="primary" className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Criar Encomenda Manual
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Nenhuma encomenda recebida"
          description="Ainda não existem encomendas registadas."
        />
      ) : (
        <OrdersTable orders={orders} onUpdateStatus={handleUpdateStatus} />
      )}
    </div>
  );
};
