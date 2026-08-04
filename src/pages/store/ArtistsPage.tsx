import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Sparkles, Search, Filter, Palette, Share2, ArrowRight, Store, ChevronLeft, ChevronRight, Grid } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/services/apiClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ArtistAvatar } from '@/components/shared/ArtistAvatar';

export const ArtistsPage: React.FC = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('Todas');
  const [isExpanded, setIsExpanded] = useState(false);

  // Drag-to-scroll state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    api.get<any[]>('/sellers')
      .then(data => {
        if (Array.isArray(data)) {
          setArtists(data);
        } else {
          setArtists([]);
        }
      })
      .catch(err => {
        console.error('Erro ao carregar artesãos:', err);
        setArtists([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Calcula a contagem de artesãos por disciplina
  const disciplineCounts = useMemo(() => {
    const map: Record<string, number> = {};
    if (Array.isArray(artists)) {
      artists.forEach(a => {
        if (a && Array.isArray(a.disciplines)) {
          a.disciplines.forEach(d => {
            if (d && typeof d === 'string') {
              map[d] = (map[d] || 0) + 1;
            }
          });
        }
      });
    }
    return map;
  }, [artists]);

  // Extrai todas as disciplinas únicas existentes
  const allDisciplines = useMemo(() => {
    const set = new Set<string>();
    if (Array.isArray(artists)) {
      artists.forEach(a => {
        if (a && Array.isArray(a.disciplines)) {
          a.disciplines.forEach(d => {
            if (d && typeof d === 'string') set.add(d);
          });
        }
      });
    }
    return ['Todas', ...Array.from(set).sort()];
  }, [artists]);

  // Filtra artesãos por pesquisa de texto e disciplina selecionada
  const filteredArtists = useMemo(() => {
    if (!Array.isArray(artists)) return [];
    return artists.filter(artist => {
      if (!artist) return false;
      const nameMatch = artist.name && typeof artist.name === 'string' && artist.name.toLowerCase().includes(searchQuery.toLowerCase());
      const bioMatch = artist.bio && typeof artist.bio === 'string' && artist.bio.toLowerCase().includes(searchQuery.toLowerCase());
      const discMatch = Array.isArray(artist.disciplines) && artist.disciplines.some((d: string) => typeof d === 'string' && d.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSearch = nameMatch || bioMatch || discMatch;

      const matchesDiscipline =
        selectedDiscipline === 'Todas' ||
        (Array.isArray(artist.disciplines) && artist.disciplines.includes(selectedDiscipline));

      return matchesSearch && matchesDiscipline;
    });
  }, [artists, searchQuery, selectedDiscipline]);

  // Funções de arrasto de rato para a barra de disciplinas
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const scrollBy = (offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Cabeçalho acolhedor sobre os Artesãos da Coisart */}
      <div className="bg-gradient-to-r from-cream via-white to-rose/10 p-8 sm:p-12 rounded-3xl border border-ink/10 relative overflow-hidden shadow-sm">
        <div className="max-w-3xl space-y-4">
          <Badge variant="rose" className="w-fit flex items-center gap-1.5 px-3 py-1 font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5" /> Comunidade de Criadores
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink tracking-tight">
            Artesãos da Coisart
          </h1>
          <p className="text-sm sm:text-base text-ink/80 leading-relaxed font-sans">
            Ao longo dos anos e das várias edições da feira, fomos tendo o privilégio de acolher artesãos incríveis — alguns estiveram em edições passadas, outros voltaram mais tarde e muitos continuam a marcar presença. Esta página reúne todos os criadores que já fizeram parte da nossa história!
          </p>
        </div>
      </div>

      {/* Painel Avançado de Pesquisa e Filtros por Disciplina */}
      <div className="bg-white p-6 rounded-3xl border border-ink/10 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Pesquisar por nome do artesão, biografia ou técnica..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-2xl bg-cream/30 border-ink/15 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-rose shrink-0" />
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="h-11 px-4 rounded-2xl border border-ink/15 bg-cream/30 text-xs font-bold text-ink focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="Todas">Todas as Disciplinas ({artists.length})</option>
              {Object.entries(disciplineCounts)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([disc, count]) => (
                  <option key={disc} value={disc}>
                    {disc} ({count})
                  </option>
                ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs rounded-2xl font-bold flex items-center gap-1.5 whitespace-nowrap h-11 px-4"
            >
              <Grid className="w-3.5 h-3.5 text-rose" />
              {isExpanded ? 'Recolher Barra' : 'Ver Todas'}
            </Button>
          </div>
        </div>

        {/* Modo Grelha Expandida ou Barra Horizontal Arrastável */}
        {isExpanded ? (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-ink/10 animate-fadeIn">
            {allDisciplines.map((disc) => {
              const count = disc === 'Todas' ? artists.length : disciplineCounts[disc] || 0;
              const isSelected = selectedDiscipline === disc;
              return (
                <button
                  key={disc}
                  onClick={() => setSelectedDiscipline(disc)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                    isSelected
                      ? 'bg-rose text-white font-bold ring-2 ring-rose/20'
                      : 'bg-cream text-ink/75 hover:bg-rose/10 hover:text-rose border border-ink/5'
                  }`}
                >
                  <span>{disc}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-ink/5 text-ink/60'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="relative flex items-center gap-2 pt-3 border-t border-ink/10">
            <button
              onClick={() => scrollBy(-250)}
              className="p-2 rounded-2xl bg-cream hover:bg-rose/15 text-ink hover:text-rose border border-ink/10 shadow-sm shrink-0 transition-colors hidden sm:flex"
              title="Deslocar para a esquerda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeaveOrUp}
              onMouseUp={handleMouseLeaveOrUp}
              onMouseMove={handleMouseMove}
              className="flex items-center gap-2 overflow-x-auto py-1.5 cursor-grab active:cursor-grabbing select-none flex-1 scrollbar-none"
            >
              {allDisciplines.map((disc) => {
                const count = disc === 'Todas' ? artists.length : disciplineCounts[disc] || 0;
                const isSelected = selectedDiscipline === disc;
                return (
                  <button
                    key={disc}
                    onClick={() => setSelectedDiscipline(disc)}
                    className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all shadow-sm ${
                      isSelected
                        ? 'bg-rose text-white font-bold ring-2 ring-rose/20'
                        : 'bg-cream text-ink/75 hover:bg-rose/10 hover:text-rose border border-ink/5'
                    }`}
                  >
                    <span>{disc}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-ink/10 text-ink/70'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => scrollBy(250)}
              className="p-2 rounded-2xl bg-cream hover:bg-rose/15 text-ink hover:text-rose border border-ink/10 shadow-sm shrink-0 transition-colors hidden sm:flex"
              title="Deslocar para a direita"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Lista de Artesãos */}
      {filteredArtists.length === 0 ? (
        <EmptyState
          icon={Palette}
          title="Nenhum artesão encontrado"
          description="Tente ajustar a sua pesquisa ou selecionar outra disciplina artesanal."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtists.map((artist) => {
            const instagramLinks = artist.links?.filter((l: any) => l.platform?.toLowerCase().includes('instagram')) || [];

            return (
              <div
                key={artist._id}
                className="bg-white rounded-3xl p-6 border border-ink/10 shadow-cozy hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5 relative group"
              >
                <div className="space-y-4">
                  {/* Avatar + Nome + Disciplinas */}
                  <div className="flex items-start gap-4">
                    <ArtistAvatar avatarUrl={artist.avatarUrl} name={artist.name} size="lg" />
                    <div className="flex-1 min-w-0">
                      <h2 className="font-display text-xl font-bold text-ink truncate group-hover:text-rose transition-colors">
                        {artist.name}
                      </h2>
                      <p className="text-xs text-ink/50 font-semibold uppercase tracking-wider mb-2">Artesão Coisart</p>
                      
                      {artist.disciplines && artist.disciplines.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {artist.disciplines.map((disc: string, idx: number) => (
                            <Badge key={idx} variant="rose" className="text-[10px] px-2 py-0.5 font-bold">
                              {disc}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Biografia */}
                  <p className="text-xs text-ink/75 leading-relaxed line-clamp-3 bg-cream/40 p-3 rounded-2xl border border-ink/5 italic">
                    "{artist.bio || 'Criador artesanal com peças exclusivas feitas à mão.'}"
                  </p>
                </div>

                {/* Ações: Instagram + Banca */}
                <div className="space-y-3 pt-2 border-t border-ink/10">
                  {instagramLinks.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {instagramLinks.map((link: any, idx: number) => {
                        const handle = link.url.replace(/\/$/, '').split('/').pop();
                        return (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream hover:bg-rose/10 text-xs font-semibold text-rose transition-colors border border-rose/20"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>@{handle}</span>
                          </a>
                        );
                      })}
                    </div>
                  )}

                  <Link to={`/banca/${artist.slug}`} className="block">
                    <Button variant="outline" className="w-full flex items-center justify-center gap-2 rounded-2xl hover:bg-cream">
                      <Store className="w-4 h-4 text-rose" /> Visitar Banca do Artesão <ArrowRight className="w-4 h-4 text-ink/40" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default ArtistsPage;
