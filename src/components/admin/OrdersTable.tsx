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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {orders.map((order) => {
        const badgeInfo = deliveryBadges[order.deliveryMethod] || { label: order.deliveryMethod, variant: 'neutral' };
        const statusInfo = statusBadges[order.paymentStatus] || { label: order.paymentStatus, variant: 'neutral' };
        return (
          <div key={order._id} className="p-5 bg-white rounded-3xl border border-ink/10 shadow-cozy flex flex-col justify-between space-y-4 hover:border-rose/30 transition-all">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-ink/10 pb-3">
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-ink text-base truncate">{order.customerName}</h4>
                  <p className="text-xs text-ink/60 truncate">{order.customerEmail}</p>
                </div>
                <Badge variant={statusInfo.variant} className="shrink-0">{statusInfo.label}</Badge>
              </div>

              <div className="flex flex-wrap gap-2 items-center text-xs">
                <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
                {order.isResend && (
                  <Badge variant="lemon" className="flex items-center gap-1 font-bold text-[10px]">
                    <RefreshCw className="w-3 h-3 text-ink animate-spin-slow" /> REENVIO SOLICITADO
                  </Badge>
                )}
              </div>

              <div className="space-y-1.5 bg-cream/40 p-3.5 rounded-2xl border border-ink/5">
                <p className="text-[10px] font-bold uppercase text-ink/50 tracking-wider">Artigos da Encomenda</p>
                {order.items.map((item, idx) => (
                  <div key={idx} className="text-xs font-medium text-ink flex justify-between gap-2">
                    <span className="truncate">{item.quantity}x {item.title}</span>
                    <span className="font-bold shrink-0">€{item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-ink/10 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-ink/50">Total Encomenda</p>
                  <p className="font-bold text-ink text-xl">€{order.totalAmount.toFixed(2)}</p>
                </div>

                {onUpdateStatus && (
                  <Button
                    size="sm"
                    variant={order.isResend ? 'primary' : 'outline'}
                    onClick={() => onUpdateStatus(order._id, order.paymentStatus, !order.isResend)}
                    className="h-8 px-2.5 text-xs flex items-center gap-1 font-bold rounded-xl"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {order.isResend ? 'Reenvio Ativo' : 'Marcar Reenvio'}
                  </Button>
                )}
              </div>

              {onUpdateStatus && (
                <div className="flex items-center gap-2 pt-1 border-t border-ink/5">
                  <span className="text-xs text-ink/60 font-medium">Estado:</span>
                  <select
                    value={order.paymentStatus}
                    onChange={(e) => onUpdateStatus(order._id, e.target.value as any, order.isResend)}
                    className="h-9 px-3 text-xs rounded-xl border border-ink/15 bg-cream/30 font-bold outline-none focus:ring-2 focus:ring-rose flex-1 cursor-pointer"
                  >
                    <option value="completed">Concluído / Pago</option>
                    <option value="pending">Pendente</option>
                    <option value="failed">Falhado / Erro</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
