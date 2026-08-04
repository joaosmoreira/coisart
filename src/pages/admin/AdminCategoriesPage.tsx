import React, { useEffect, useState, useMemo } from 'react';
import { FolderTree, Plus, Package, AlertCircle, CheckCircle2, Edit3, Trash2, Save, X } from 'lucide-react';
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

  // Estado para Edição de Categoria
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

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

  const activeCategories = useMemo(() => {
    return categories.filter((c) => (c.productCount || 0) > 0);
  }, [categories]);

  const emptyCategories = useMemo(() => {
    return categories.filter((c) => (!c.productCount || c.productCount === 0));
  }, [categories]);

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

  const handleStartEdit = (cat: any) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditSlug(cat.slug);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setSavingEdit(true);
    setError('');

    try {
      await api.put(`/categories/${editingCategory._id}`, {
        name: editName,
        slug: editSlug || slugify(editName)
      });
      setEditingCategory(null);
      loadCategories();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar categoria.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (cat: any) => {
    if (!confirm(`Tem a certeza que deseja eliminar a categoria "${cat.name}"?`)) return;
    setError('');
    try {
      await api.delete(`/categories/${cat._id}`);
      loadCategories();
    } catch (err: any) {
      alert(err.message || 'Erro ao eliminar categoria.');
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Gestão de Categorias</h1>
        <p className="text-sm text-ink/70 mt-1">Edite nomes, slugs e monitorize a contagem de artigos ativos em stock</p>
      </div>

      {/* Modal / Formulário de Edição de Categoria */}
      {editingCategory && (
        <Card className="p-6 bg-cream/60 border-2 border-rose/30 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-ink/10 pb-3">
            <h3 className="font-display text-lg font-bold text-ink flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-rose" /> Editar Categoria: <span className="text-rose">{editingCategory.name}</span>
            </h3>
            <button onClick={() => setEditingCategory(null)} className="text-ink/40 hover:text-ink">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSaveEdit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <Input
              label="Nome da Categoria"
              value={editName}
              onChange={(e) => {
                setEditName(e.target.value);
                setEditSlug(slugify(e.target.value));
              }}
              required
            />
            <Input
              label="Slug / URL (Personalizável)"
              value={editSlug}
              onChange={(e) => setEditSlug(slugify(e.target.value))}
              required
            />
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingCategory(null)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={savingEdit} className="flex-1 bg-rose text-white hover:bg-rose/90 flex items-center justify-center gap-1">
                <Save className="w-4 h-4" /> {savingEdit ? 'A guardar...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <h3 className="font-display text-lg font-bold text-ink mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-rose" /> Adicionar Nova Categoria
        </h3>
        {error && <div className="p-3 mb-4 rounded-2xl bg-red-50 text-red-700 text-xs font-medium">{error}</div>}
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <Input label="Nome da Categoria / Disciplina" value={name} onChange={handleNameChange} required placeholder="ex: Joalharia Escultórica" />
          <Input label="Slug / URL (auto-gerado)" value={slug} onChange={(e) => setSlug(e.target.value)} required className="bg-cream/60" />
          <Button type="submit" disabled={creating} className="h-11">
            {creating ? 'A guardar...' : 'Criar Categoria'}
          </Button>
        </form>
      </Card>

      {/* ÁREA 1: Categorias com Artigos Disponíveis em Stock */}
      <div className="bg-white rounded-3xl p-6 border border-ink/10 shadow-cozy space-y-4">
        <div className="flex items-center justify-between border-b border-ink/10 pb-3">
          <h3 className="font-display text-lg font-bold text-ink flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Categorias com Artigos Disponíveis em Stock ({activeCategories.length})
          </h3>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Mercado Ativo
          </span>
        </div>

        {activeCategories.length === 0 ? (
          <p className="text-xs text-ink/50 py-4 italic text-center">Nenhuma categoria com artigos em stock no momento.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeCategories.map((cat) => (
              <div key={cat._id} className="p-4 rounded-2xl border border-emerald-200/60 bg-emerald-50/30 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-ink text-sm">{cat.name}</p>
                    <button
                      onClick={() => handleStartEdit(cat)}
                      className="p-1 rounded-lg text-ink/40 hover:text-rose hover:bg-white transition-colors"
                      title="Editar Categoria e Slug"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-ink/50 font-mono mt-0.5">/loja?categoria={cat.slug}</p>
                </div>
                <div className="pt-2 border-t border-emerald-100 flex items-center justify-between">
                  <Badge variant="mint" className="gap-1 text-[11px] font-bold">
                    <Package className="w-3.5 h-3.5" /> {cat.productCount} {cat.productCount === 1 ? 'artigo em stock' : 'artigos em stock'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ÁREA 2: Categorias Sem Artigos / Vazias */}
      <div className="bg-white rounded-3xl p-6 border border-ink/10 shadow-cozy space-y-4">
        <div className="flex items-center justify-between border-b border-ink/10 pb-3">
          <h3 className="font-display text-lg font-bold text-ink flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" /> Categorias Sem Artigos / Vazias ({emptyCategories.length})
          </h3>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Aguardam Artigos
          </span>
        </div>

        {emptyCategories.length === 0 ? (
          <p className="text-xs text-ink/50 py-4 italic text-center">Todas as categorias possuem artigos em stock!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {emptyCategories.map((cat) => (
              <div key={cat._id} className="p-4 rounded-2xl border border-dashed border-ink/20 bg-cream/30 flex flex-col justify-between space-y-3 opacity-90">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-ink/80 text-sm">{cat.name}</p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-1 rounded-lg text-ink/40 hover:text-rose hover:bg-white transition-colors"
                        title="Editar Categoria e Slug"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="p-1 rounded-lg text-ink/40 hover:text-red-600 hover:bg-white transition-colors"
                        title="Eliminar Categoria Vazia"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-ink/50 font-mono mt-0.5">/loja?categoria={cat.slug}</p>
                </div>
                <div className="pt-2 border-t border-ink/10 flex items-center justify-between">
                  <Badge variant="outline" className="border-amber-300 text-amber-900 bg-amber-50/50 gap-1 text-[11px]">
                    <AlertCircle className="w-3 h-3 text-amber-600" /> 0 artigos (Vazia)
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
