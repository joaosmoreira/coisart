import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Users, FolderTree, ShoppingBag, UserCheck, LogOut, Calendar, Grid, ExternalLink, X } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [appDrawerOpen, setAppDrawerOpen] = useState(false);

  React.useEffect(() => {
    setAppDrawerOpen(false);
  }, [location.pathname]);

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
          { label: 'Categorias', to: '/admin/categorias', icon: FolderTree },
          { label: 'Próxima Feira', to: '/admin/evento', icon: Calendar }
        ]
      : []),
    { label: 'Clientes', to: '/admin/clientes', icon: UserCheck },
    { label: 'Encomendas', to: '/admin/encomendas', icon: ShoppingBag }
  ];

  return (
    <div className="min-h-screen bg-cream flex flex-col lg:flex-row font-sans text-ink">
      {/* 1. NAVEGAÇÃO LATERAL PARA DESKTOP (Ecrãs Grandes >= 1024px) */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-ink/10 flex-col justify-between p-6 h-screen sticky top-0 shrink-0 shadow-sm">
        <div>
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex gap-1" aria-hidden>
                <span className="size-2.5 rounded-full bg-rose" />
                <span className="size-2.5 rounded-full bg-lemon" />
                <span className="size-2.5 rounded-full bg-mint" />
              </span>
              <span className="font-display text-xl font-bold tracking-tight">Coisart</span>
            </Link>
            <div className="mt-2 text-[10px] font-bold text-rose uppercase tracking-widest bg-rose/10 px-2.5 py-1 rounded-full inline-block">
              Backoffice {user?.role === 'admin' ? 'Admin' : 'Vendedor'}
            </div>
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
                        ? 'bg-rose text-white shadow-md font-semibold'
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

        <div className="pt-6 border-t border-ink/10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="text-xs truncate">
              <p className="font-semibold text-ink truncate">{user?.email}</p>
              <p className="text-ink/50 uppercase text-[10px] tracking-wider">{user?.role}</p>
            </div>
            <Badge variant={user?.role === 'admin' ? 'rose' : 'mint'}>
              {user?.role === 'admin' ? 'Admin' : 'Vendedor'}
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="w-full flex items-center justify-center gap-2 rounded-xl text-xs font-bold">
            <LogOut className="w-3.5 h-3.5" /> Terminar Sessão
          </Button>
        </div>
      </aside>

      {/* 2. CABEÇALHO COMPACTO MOBILE / TABLET (Ecrãs < 1024px) */}
      <header className="lg:hidden bg-white/95 backdrop-blur-md border-b border-ink/10 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-sm">
        <Link to="/admin" className="flex items-center gap-2">
          <span className="flex gap-1" aria-hidden>
            <span className="size-2 rounded-full bg-rose" />
            <span className="size-2 rounded-full bg-lemon" />
            <span className="size-2 rounded-full bg-mint" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-ink">Coisart</span>
          <span className="text-[10px] font-bold text-rose bg-rose/10 px-2 py-0.5 rounded-full uppercase">App</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1 rounded-xl">
              <ExternalLink className="w-3 h-3 text-rose" /> Ver Loja
            </Button>
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-cream hover:bg-rose/10 text-ink/70 hover:text-rose transition-colors"
            title="Terminar Sessão"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 3. CONTEÚDO PRINCIPAL (Com padding inferior para não cobrir pela dock no mobile/tablet) */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-28 lg:pb-8">
        <Outlet />
      </main>

      {/* 4. BARRA DE NAVEGAÇÃO INFERIOR TIPO APP DOCK PARA MOBILE E TABLETS (< 1024px) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-ink/10 px-2 py-2 flex items-center justify-around shadow-2xl">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
              isActive ? 'text-rose font-bold scale-105' : 'text-ink/60 hover:text-ink'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Painel</span>
        </NavLink>

        <NavLink
          to="/admin/produtos"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
              isActive ? 'text-rose font-bold scale-105' : 'text-ink/60 hover:text-ink'
            }`
          }
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px]">Produtos</span>
        </NavLink>

        <NavLink
          to="/admin/encomendas"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
              isActive ? 'text-rose font-bold scale-105' : 'text-ink/60 hover:text-ink'
            }`
          }
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px]">Encomendas</span>
        </NavLink>

        {user?.role === 'admin' && (
          <NavLink
            to="/admin/evento"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
                isActive ? 'text-rose font-bold scale-105' : 'text-ink/60 hover:text-ink'
              }`
            }
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px]">Feira</span>
          </NavLink>
        )}

        <button
          onClick={() => setAppDrawerOpen(true)}
          className="flex flex-col items-center gap-1 p-1.5 rounded-xl text-ink/70 hover:text-rose transition-all"
        >
          <Grid className="w-5 h-5 text-rose" />
          <span className="text-[10px]">Menu Apps</span>
        </button>
      </nav>

      {/* 5. GAVETA DESDOBRÁVEL DE MÓDULOS PARA MOBILE / TABLET */}
      {appDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl p-6 space-y-6 shadow-2xl border-t border-ink/10 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <div className="flex items-center gap-2">
                <Grid className="w-5 h-5 text-rose" />
                <h3 className="font-display text-lg font-bold text-ink">Módulos da Aplicação</h3>
              </div>
              <button
                onClick={() => setAppDrawerOpen(false)}
                className="p-2 rounded-xl bg-cream text-ink/60 hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact}
                    className={({ isActive }) =>
                      `p-3.5 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all ${
                        isActive
                          ? 'bg-rose/10 border-rose text-rose font-bold shadow-sm'
                          : 'bg-cream/40 border-ink/10 text-ink/80 hover:bg-cream'
                      }`
                    }
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-bold leading-tight">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
