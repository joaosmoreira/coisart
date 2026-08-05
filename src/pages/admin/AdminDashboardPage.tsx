import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, ShoppingBag, PlusCircle, ExternalLink, FolderTree, Calendar, UserCheck, Grid } from 'lucide-react';
import { api } from '@/services/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { OrdersTable, OrderData } from '@/components/admin/OrdersTable';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { Button } from '@/components/ui/button';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ products: 0, sellers: 0, orders: 0, totalRevenue: 0 });
  const [recentOrders, setRecentOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [prods, orders] = await Promise.all([
          api.get<any[]>('/products'),
          api.get<OrderData[]>('/orders')
        ]);

        let sellerCount = 0;
        if (user?.role === 'admin') {
          const sellers = await api.get<any[]>('/sellers');
          sellerCount = sellers.length;
        }

        const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

        setStats({
          products: prods.length,
          sellers: sellerCount,
          orders: orders.length,
          totalRevenue
        });
        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        console.error('Erro ao carregar dados do painel:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Painel de Gestão</h1>
          <p className="text-sm text-ink/70 mt-1">
            Bem-vindo de volta! {user?.role === 'admin' ? 'Visão global da feira e marketplace Coisart.' : 'Gestão dos seus artigos e encomendas.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/produtos/novo">
            <Button variant="primary" size="sm" className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> Novo Artigo
            </Button>
          </Link>
        </div>
      </div>

      {/* Grelha de Aplicações / Ícones de Módulos (Estilo Smartphone / Ecrã Principal) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase font-bold tracking-wider text-rose flex items-center gap-1.5">
            <Grid className="w-4 h-4" /> Aplicações & Módulos do Backoffice
          </h2>
          <span className="text-[11px] text-ink/50 font-medium">Acesso rápido</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          <Link
            to="/admin/produtos"
            className="p-4 rounded-3xl bg-white border border-ink/10 shadow-cozy hover:shadow-xl hover:border-rose/40 hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose/10 text-rose flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-ink">Produtos</span>
          </Link>

          {user?.role === 'admin' && (
            <>
              <Link
                to="/admin/vendedores"
                className="p-4 rounded-3xl bg-white border border-ink/10 shadow-cozy hover:shadow-xl hover:border-lemon/60 hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-2 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-ink">Vendedores</span>
              </Link>

              <Link
                to="/admin/categorias"
                className="p-4 rounded-3xl bg-white border border-ink/10 shadow-cozy hover:shadow-xl hover:border-mint/60 hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-2 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FolderTree className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-ink">Categorias</span>
              </Link>

              <Link
                to="/admin/evento"
                className="p-4 rounded-3xl bg-white border border-ink/10 shadow-cozy hover:shadow-xl hover:border-rose/40 hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-2 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose/10 text-rose flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-ink">Próxima Feira</span>
              </Link>
            </>
          )}

          <Link
            to="/admin/clientes"
            className="p-4 rounded-3xl bg-white border border-ink/10 shadow-cozy hover:shadow-xl hover:border-sky/60 hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-ink">Clientes</span>
          </Link>

          <Link
            to="/admin/encomendas"
            className="p-4 rounded-3xl bg-white border border-ink/10 shadow-cozy hover:shadow-xl hover:border-purple/60 hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-ink">Encomendas</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard title="Total Produtos" value={stats.products} icon={Package} color="rose" />
        {user?.role === 'admin' && (
          <AdminStatsCard title="Vendedores" value={stats.sellers} icon={Users} color="lemon" />
        )}
        <AdminStatsCard title="Encomendas" value={stats.orders} icon={ShoppingBag} color="mint" />
        <AdminStatsCard title="Faturação Total" value={`€${stats.totalRevenue.toFixed(2)}`} icon={ExternalLink} color="lavender" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-ink">Encomendas Recentes</h2>
          <Link to="/admin/encomendas" className="text-xs font-semibold text-ink hover:underline">
            Ver todas →
          </Link>
        </div>
        <OrdersTable orders={recentOrders} />
      </div>
    </div>
  );
};
