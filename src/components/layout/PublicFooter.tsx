import React from 'react';
import { Link } from 'react-router-dom';
import { WaveDivider } from '@/components/shared/WaveDivider';
import { MapPin, Coffee, Phone, Sparkles } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  const footerBlue = '#1E3E62';

  return (
    <footer className="mt-16">
      <WaveDivider fillColor={footerBlue} />

      <div style={{ backgroundColor: footerBlue }} className="text-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-cream/15">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex gap-1" aria-hidden>
                  <span className="size-2.5 rounded-full bg-rose" />
                  <span className="size-2.5 rounded-full bg-lemon" />
                  <span className="size-2.5 rounded-full bg-mint" />
                </span>
                <span className="font-display text-2xl font-bold tracking-tight text-cream">Coisart</span>
              </div>
              <p className="text-sm text-cream/70 leading-relaxed">
                O carinho de uma feira de artesanato local, online. Peças únicas feitas à mão por artesãos independentes.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-display text-base font-bold text-cream flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-lemon" /> PONTO DE RECOLHA PARCEIRO
              </h4>
              <div className="text-xs text-cream/80 space-y-2">
                <p className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-mint" /> <strong>Ah Coisas ~ Concept Store</strong>
                </p>
                <p className="flex items-center gap-2 text-[11px] text-cream/70">
                  <MapPin className="w-3.5 h-3.5 text-rose shrink-0" /> Praça das Fontaínhas Loja F, 4795-021 Vila das Aves
                </p>
                <p className="flex items-center gap-2 text-[11px] text-cream/70">
                  <Phone className="w-3.5 h-3.5 text-lemon shrink-0" /> Tel: 252 093 463
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-display text-base font-bold text-cream">NAVEGAÇÃO RÁPIDA</h4>
              <ul className="text-xs text-cream/70 space-y-2">
                <li><Link to="/artesaos" className="hover:text-rose transition-colors">Artesãos da Coisart</Link></li>
                <li><Link to="/loja" className="hover:text-rose transition-colors">Mercado Artesanal</Link></li>
                <li><Link to="/carrinho" className="hover:text-rose transition-colors">Ver Carrinho de Compras</Link></li>
                <li><Link to="/admin" className="hover:text-rose transition-colors">Área do Artesão / Backoffice</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 text-center text-xs text-cream/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} Coisart. Feito com carinho artesanal em Vila das Aves, Portugal.</p>
            <p className="text-[11px]">Plataforma Warm Cozy & Marketplace Multi-Vendedor</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
