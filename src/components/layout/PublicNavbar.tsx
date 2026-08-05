import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ShoppingBag, Store, UserCheck, Calendar, Paintbrush, Menu, X, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { Badge } from '@/components/ui/badge';

export const PublicNavbar: React.FC = () => {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Fechar o menu mobile ao mudar de página
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-ink/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Logo Oficial da Coisart */}
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-3 rounded-full bg-rose animate-pulse" />
            <span className="size-3 rounded-full bg-lemon" />
            <span className="size-3 rounded-full bg-mint" />
          </span>
          <span className="font-display text-2xl font-bold tracking-tight text-ink">Coisart</span>
        </Link>

        {/* Links Principais para Ecrãs Médios e Grandes (Desktop / Tablet paisagem) */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink
            to="/proxima-feira"
            className={({ isActive }) =>
              `text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive ? 'text-rose font-bold' : 'text-ink/80 hover:text-ink'
              }`
            }
          >
            <Calendar className="w-4 h-4 text-rose" /> Próxima Feira
          </NavLink>
          <NavLink
            to="/artesaos"
            className={({ isActive }) =>
              `text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive ? 'text-rose font-bold' : 'text-ink/80 hover:text-ink'
              }`
            }
          >
            <Paintbrush className="w-4 h-4 text-mint" /> Artesãos
          </NavLink>
          <NavLink
            to="/loja"
            className={({ isActive }) =>
              `text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive ? 'text-rose font-bold' : 'text-ink/80 hover:text-ink'
              }`
            }
          >
            <Store className="w-4 h-4 text-rose" /> Mercado
          </NavLink>
          <NavLink
            to="/admin"
            className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-ink/20 text-ink/70 hover:bg-cream hover:text-ink transition-colors flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5" /> Backoffice
          </NavLink>
        </nav>

        {/* Ações de Topo: Carrinho + Botão Hambúrguer no Mobile */}
        <div className="flex items-center gap-3">
          <Link to="/carrinho" className="relative">
            <button className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-2xl bg-cream hover:bg-rose/20 text-ink font-semibold text-sm border border-ink/10 transition-all duration-200 shadow-sm active:scale-95">
              <ShoppingBag className="w-4 h-4 text-rose" />
              <span className="hidden sm:inline">Carrinho</span>
              {totalItems > 0 && (
                <Badge variant="rose" className="font-bold ml-0.5">
                  {totalItems}
                </Badge>
              )}
            </button>
          </Link>

          {/* Botão Hambúrguer Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-2xl bg-cream text-ink border border-ink/10 hover:bg-rose/10 transition-colors active:scale-95"
            aria-label="Abrir Menu de Navegação"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-rose" /> : <Menu className="w-6 h-6 text-ink" />}
          </button>
        </div>
      </div>

      {/* Gaveta / Menu Desdobrável Mobile (Ecrãs Pequenos) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-ink/10 px-4 py-6 space-y-3 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <NavLink
            to="/proxima-feira"
            className={({ isActive }) =>
              `flex items-center justify-between p-3.5 rounded-2xl text-base font-bold transition-all ${
                isActive ? 'bg-rose/10 text-rose border border-rose/20' : 'bg-cream/40 text-ink hover:bg-cream'
              }`
            }
          >
            <span className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-rose" /> Próxima Feira
            </span>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </NavLink>

          <NavLink
            to="/artesaos"
            className={({ isActive }) =>
              `flex items-center justify-between p-3.5 rounded-2xl text-base font-bold transition-all ${
                isActive ? 'bg-rose/10 text-rose border border-rose/20' : 'bg-cream/40 text-ink hover:bg-cream'
              }`
            }
          >
            <span className="flex items-center gap-3">
              <Paintbrush className="w-5 h-5 text-mint" /> Artesãos
            </span>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </NavLink>

          <NavLink
            to="/loja"
            className={({ isActive }) =>
              `flex items-center justify-between p-3.5 rounded-2xl text-base font-bold transition-all ${
                isActive ? 'bg-rose/10 text-rose border border-rose/20' : 'bg-cream/40 text-ink hover:bg-cream'
              }`
            }
          >
            <span className="flex items-center gap-3">
              <Store className="w-5 h-5 text-rose" /> Mercado
            </span>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </NavLink>

          <div className="pt-2">
            <NavLink
              to="/admin"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-ink text-white text-sm font-bold shadow-md hover:bg-ink/90 transition-all"
            >
              <span className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-lemon" /> Aceder ao Backoffice (Admin / Vendedor)
              </span>
              <ChevronRight className="w-4 h-4 text-lemon" />
            </NavLink>
          </div>
        </div>
      )}
    </header>
  );
};
