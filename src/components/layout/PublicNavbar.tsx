import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingBag, Store, UserCheck } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { Badge } from '@/components/ui/badge';

export const PublicNavbar: React.FC = () => {
  const totalItems = useCartStore((state) => state.getTotalItems());

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-ink/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Logo Oficial da Coisart exigido pelo utilizador */}
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-3 rounded-full bg-rose animate-pulse" />
            <span className="size-3 rounded-full bg-lemon" />
            <span className="size-3 rounded-full bg-mint" />
          </span>
          <span className="font-display text-2xl font-bold tracking-tight text-ink">Coisart</span>
        </Link>

        {/* Links Principais */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-sm font-semibold transition-colors ${
                isActive ? 'text-rose font-bold' : 'text-ink/80 hover:text-ink'
              }`
            }
          >
            Início
          </NavLink>
          <NavLink
            to="/artesaos"
            className={({ isActive }) =>
              `text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive ? 'text-rose font-bold' : 'text-ink/80 hover:text-ink'
              }`
            }
          >
            Artesãos
          </NavLink>
          <NavLink
            to="/loja"
            className={({ isActive }) =>
              `text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive ? 'text-rose font-bold' : 'text-ink/80 hover:text-ink'
              }`
            }
          >
            <Store className="w-4 h-4" /> Mercado Artesanal
          </NavLink>
          <NavLink
            to="/admin"
            className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-ink/20 text-ink/70 hover:bg-cream hover:text-ink transition-colors flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5" /> Backoffice
          </NavLink>
        </nav>

        {/* Carrinho de Compras */}
        <Link to="/carrinho" className="relative">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-cream hover:bg-rose/20 text-ink font-semibold text-sm border border-ink/10 transition-all duration-200 shadow-sm active:scale-95">
            <ShoppingBag className="w-4 h-4 text-rose" />
            <span className="hidden sm:inline">Carrinho</span>
            {totalItems > 0 && (
              <Badge variant="rose" className="font-bold ml-0.5">
                {totalItems}
              </Badge>
            )}
          </button>
        </Link>
      </div>
    </header>
  );
};
