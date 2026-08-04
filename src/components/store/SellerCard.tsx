import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Share2, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArtistAvatar } from '@/components/shared/ArtistAvatar';

interface SellerCardProps {
  seller: any;
}

export const SellerCard: React.FC<SellerCardProps> = ({ seller }) => {
  const instagramLink = seller.links?.find((l: any) => l.platform?.toLowerCase().includes('instagram'))?.url;
  const isActive = seller.isActive !== false;

  return (
    <div className={`bg-white rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between space-y-4 text-center group ${
      isActive ? 'border-ink/10 shadow-cozy hover:shadow-xl' : 'border-ink/15 bg-cream/30 opacity-85 shadow-sm'
    }`}>
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <ArtistAvatar avatarUrl={seller.avatarUrl} name={seller.name} size="lg" className={isActive ? '' : 'grayscale-[30%]'} />
          {isActive ? (
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-lemon border border-ink/10 text-ink shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-cream border border-ink/15 text-rose shadow-sm" title="Banca Indisponível">
              <Ban className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        <div>
          <h3 className="font-display text-xl font-bold text-ink">{seller.name}</h3>
          {!isActive ? (
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-rose/10 text-rose text-[10px] font-bold uppercase tracking-wider">
              Banca Indisponível
            </span>
          ) : (
            <p className="text-xs text-ink/50 font-semibold uppercase tracking-wider">Artesão Coisart</p>
          )}
        </div>

        {/* Disciplinas / Categorias */}
        {seller.disciplines && seller.disciplines.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 pt-1">
            {seller.disciplines.map((disc: string, idx: number) => (
              <Badge key={idx} variant="cream" className="text-[11px] font-medium border border-ink/10 text-ink/80">
                {disc}
              </Badge>
            ))}
          </div>
        )}

        <p className="text-xs text-ink/70 line-clamp-3 leading-relaxed">
          {seller.bio || 'Criador independente com peças artesanais exclusivas feitas à mão.'}
        </p>
      </div>

      <div className="space-y-2 pt-2">
        {instagramLink && (
          <a
            href={instagramLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-rose hover:text-rose-600 transition-colors w-full py-1"
          >
            <Share2 className="w-3.5 h-3.5" /> Ver no Instagram
          </a>
        )}

        {isActive ? (
          <Link to={`/banca/${seller.slug}`} className="w-full block">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2 rounded-2xl group-hover:border-rose transition-colors">
              Visitar Banca do Artesão <ArrowRight className="w-4 h-4 text-rose" />
            </Button>
          </Link>
        ) : (
          <div className="w-full py-2.5 px-4 rounded-2xl bg-cream/80 border border-ink/15 text-ink/50 text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed select-none">
            <span className="line-through">Visitar Banca do Artesão</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose shrink-0">(Indisponível)</span>
          </div>
        )}
      </div>
    </div>
  );
};
