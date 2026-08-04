import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  type: string;
}

export interface OrderData {
  _id: string;
  customerName: string;
  customerEmail: string;
  deliveryMethod: 'digital' | 'fair_pickup' | 'cafe_pickup' | 'shipping';
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'cancelled';
  isResend?: boolean;
  resendReason?: string;
  createdAt: string;
}

interface OrdersTableProps {
  orders: OrderData[];
  onUpdateStatus?: (id: string, status: 'pending' | 'completed' | 'failed' | 'cancelled', isResend?: boolean) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders, onUpdateStatus }) => {
  const deliveryBadges = {
    digital: { label: 'Download Digital', variant: 'sky' as const },
    fair_pickup: { label: 'Levantamento na Feira', variant: 'lemon' as const },
    cafe_pickup: { label: 'Levantamento no Café', variant: 'mint' as const },
    shipping: { label: 'Envio CTT', variant: 'lavender' as const }
  };

  const statusBadges = {
    completed: { label: 'Concluído / Pago', variant: 'mint' as const },
    pending: { label: 'Pendente', variant: 'neutral' as const },
    failed: { label: 'Falhado / Erro', variant: 'rose' as const },
    cancelled: { label: 'Cancelado', variant: 'rose' as const }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-3xl border border-ink/10 shadow-cozy">
      <table className="w-full text-left text-sm text-ink">
        <thead className="bg-cream/60 uppercase text-[11px] tracking-wider font-semibold text-ink/70 border-b border-ink/10">
          <tr>
            <th className="p-4">Cliente</th>
            <th className="p-4">Método Entrega</th>
            <th className="p-4">Artigos</th>
            <th className="p-4">Total</th>
            <th className="p-4">Estado & Reenvio</th>
            <th className="p-4 text-right">Alterar Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {orders.map((order) => {
            const badgeInfo = deliveryBadges[order.deliveryMethod] || { label: order.deliveryMethod, variant: 'neutral' };
            const statusInfo = statusBadges[order.paymentStatus] || { label: order.paymentStatus, variant: 'neutral' };
            return (
              <tr key={order._id} className="hover:bg-cream/30 transition-colors">
                <td className="p-4 font-medium">
                  <p className="font-semibold text-ink">{order.customerName}</p>
                  <p className="text-xs text-ink/60">{order.customerEmail}</p>
                </td>
                <td className="p-4">
                  <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
                </td>
                <td className="p-4 text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="truncate max-w-xs">{item.quantity}x {item.title} (€{item.price.toFixed(2)})</div>
                  ))}
                </td>
                <td className="p-4 font-bold text-ink">€{order.totalAmount.toFixed(2)}</td>
                <td className="p-4">
                  <div className="flex flex-col gap-1.5 items-start">
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    {order.isResend && (
                      <Badge variant="lemon" className="flex items-center gap-1 font-bold text-[10px]">
                        <RefreshCw className="w-3 h-3 text-ink animate-spin-slow" /> 🔁 REENVIO SOLICITADO
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="p-4 text-right">
                  {onUpdateStatus && (
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => onUpdateStatus(order._id, e.target.value as any, order.isResend)}
                        className="h-9 px-2 text-xs rounded-xl border border-ink/15 bg-white font-medium outline-none focus:ring-1 focus:ring-rose"
                      >
                        <option value="completed">Concluído</option>
                        <option value="pending">Pendente</option>
                        <option value="failed">Falhado (Erro)</option>
                        <option value="cancelled">Cancelado</option>
                      </select>

                      <Button
                        size="sm"
                        variant={order.isResend ? 'primary' : 'outline'}
                        onClick={() => onUpdateStatus(order._id, order.paymentStatus, !order.isResend)}
                        className="h-9 px-2.5 text-xs flex items-center gap-1"
                        title="Marcar / Desmarcar como Reenvio por erro de entrega"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {order.isResend ? 'Reenvio Ativo' : 'Reenviar'}
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
