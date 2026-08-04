import React, { useEffect, useState } from 'react';
import { FolderTree, Plus } from 'lucide-react';
import { api } from '@/services/apiClient';
import { slugify } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const loadCategories = async () => {
    try {
      const data = await api.get<any[]>('/categories');
      setCategories(data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(slugify(val));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      await api.post('/categories', { name, slug: slug || slugify(name) });
      setName('');
      setSlug('');
      loadCategories();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar categoria.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Gestão de Categorias</h1>
        <p className="text-sm text-ink/70 mt-1">Categorias de disciplinas artesanais da feira (Pintura, Ilustração, Bordados, Gesso, Livros)</p>
      </div>

      <Card>
        <h3 className="font-display text-lg font-bold text-ink mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-rose" /> Adicionar Nova Categoria
        </h3>
        {error && <div className="p-3 mb-4 rounded-2xl bg-red-50 text-red-700 text-xs">{error}</div>}
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <Input label="Nome da Categoria" value={name} onChange={handleNameChange} required placeholder="ex: Céramica & Gesso" />
          <Input label="Slug / URL (auto-gerado)" value={slug} onChange={(e) => setSlug(e.target.value)} required readOnly className="bg-cream/60" />
          <Button type="submit" disabled={creating} className="h-11">
            {creating ? 'A guardar...' : 'Criar Categoria'}
          </Button>
        </form>
      </Card>

      <div className="bg-white rounded-3xl p-6 border border-ink/10 shadow-cozy">
        <h3 className="font-display text-lg font-bold text-ink mb-4 flex items-center gap-2">
          <FolderTree className="w-5 h-5 text-mint" /> Categorias Ativas ({categories.length})
        </h3>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <div key={cat._id} className="p-4 rounded-2xl border border-ink/10 bg-cream/50 flex items-center gap-3">
              <div>
                <p className="font-bold text-ink">{cat.name}</p>
                <p className="text-xs text-ink/50">/loja?categoria={cat.slug}</p>
              </div>
              <Badge variant="mint">Ativa</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
