import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Users, FolderTree, ShoppingBag, UserCheck, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Painel', to: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Produtos', to: '/admin/produtos', icon: Package },
    ...(user?.role === 'admin'
      ? [
          { label: 'Vendedores', to: '/admin/vendedores', icon: Users },
          { label: 'Categorias', to: '/admin/categorias', icon: FolderTree }
        ]
      : []),
    { label: 'Clientes', to: '/admin/clientes', icon: UserCheck },
    { label: 'Encomendas', to: '/admin/encomendas', icon: ShoppingBag }
  ];

  return (
    <div className="min-h-screen bg-cream flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-ink/10 flex flex-col justify-between p-6 md:h-screen md:sticky md:top-0 shrink-0">
        <div>
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex gap-1" aria-hidden>
                <span className="size-2.5 rounded-full bg-rose" />
                <span className="size-2.5 rounded-full bg-lemon" />
                <span className="size-2.5 rounded-full bg-mint" />
              </span>
              <span className="font-display text-xl tracking-tight">Coisart</span>
            </Link>
            <div className="mt-2 text-xs font-semibold text-ink/50 uppercase tracking-widest">Backoffice</div>
          </div>

          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-rose/40 text-ink shadow-sm font-semibold'
                        : 'text-ink/70 hover:bg-cream hover:text-ink'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-ink/10 flex flex-col gap-3 mt-6">
          <div className="flex items-center justify-between">
            <div className="text-xs truncate">
              <p className="font-semibold text-ink truncate">{user?.email}</p>
              <p className="text-ink/50 uppercase text-[10px] tracking-wider">{user?.role}</p>
            </div>
            <Badge variant={user?.role === 'admin' ? 'rose' : 'mint'}>
              {user?.role === 'admin' ? 'Admin' : 'Vendedor'}
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="w-full flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" /> Terminar Sessão
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};
