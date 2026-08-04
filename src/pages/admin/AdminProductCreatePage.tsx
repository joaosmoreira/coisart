import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { api } from '@/services/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { slugify } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ImageUploader } from '@/components/admin/ImageUploader';

export const AdminProductCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '', slug: '', description: '', materials: '', price: '',
    type: 'physical_unique', digitalFileUrl: '', allowPhysicalPrint: false, physicalPrintPrice: '5.00',
    images: [] as string[], stock: '1', categoryId: '', sellerId: user?.sellerId || ''
  });

  useEffect(() => {
    api.get<any[]>('/categories').then(data => {
      setCategories(data);
      if (data.length > 0) setFormData(prev => ({ ...prev, categoryId: data[0]._id }));
    });
    if (user?.role === 'admin') api.get<any[]>('/sellers').then(setSellers);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => {
      const next = { ...prev, [name]: val };
      if (name === 'title') next.slug = slugify(value);
      if (name === 'type') {
        if (value === 'physical_unique') next.stock = '1';
        if (value === 'digital' && next.stock === '1') next.stock = '999';
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const payload = {
        ...formData, price: Number(formData.price), physicalPrintPrice: Number(formData.physicalPrintPrice) || 0,
        stock: formData.type === 'physical_unique' ? 1 : Number(formData.stock),
        images: formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800']
      };
      await api.post('/products', payload); navigate('/admin/produtos');
    } catch (err: any) { setError(err.message || 'Erro ao criar artigo.'); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/produtos')} className="p-2"><ArrowLeft className="w-4 h-4" /></Button>
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Criar Novo Artigo</h1>
          <p className="text-sm text-ink/70">Configure o tipo, preço, imagens e opções de impressão física</p>
        </div>
      </div>

      <Card>
        {error && <div className="p-3 mb-4 rounded-2xl bg-red-50 text-red-700 text-xs">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Título do Artigo" name="title" value={formData.title} onChange={handleChange} required placeholder="ex: Ilustração Digital Botânica" />
          <Input label="Slug / URL (auto-gerado)" name="slug" value={formData.slug} onChange={handleChange} required readOnly className="bg-cream/60" />
          <Input label="Materiais Utilizados (opcional)" name="materials" value={formData.materials} onChange={handleChange} placeholder="Pigmentos minerais, algodão..." />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase text-ink/70">Descrição</label>
            <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className="w-full p-3 rounded-2xl border border-ink/15 text-sm outline-none" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase text-ink/70">Tipo de Artigo</label>
              <select name="type" value={formData.type} onChange={handleChange} className="h-11 px-4 rounded-2xl border border-ink/15 text-sm bg-white font-medium">
                <option value="physical_unique">Peça Única Física (Stock = 1)</option>
                <option value="physical_multiple">Peça Física Múltipla</option>
                <option value="digital">Download Digital Instantâneo</option>
              </select>
            </div>
            <Input label="Preço Base (€)" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required />
          </div>

          {formData.type === 'digital' && (
            <div className="p-4 bg-sky/20 rounded-2xl border border-sky/30 space-y-3">
              <Input label="URL do Ficheiro Digital" name="digitalFileUrl" value={formData.digitalFileUrl} onChange={handleChange} placeholder="https://coisart.pt/downloads/..." />
              <label className="flex items-center gap-2 text-sm font-bold text-ink cursor-pointer">
                <input type="checkbox" name="allowPhysicalPrint" checked={formData.allowPhysicalPrint} onChange={handleChange} className="w-4 h-4 rounded text-rose focus:ring-rose" />
                Permitir ao cliente encomendar impressão física opcional?
              </label>
              {formData.allowPhysicalPrint && (
                <Input label="Preço Extra para Impressão Física (€)" name="physicalPrintPrice" type="number" step="0.01" value={formData.physicalPrintPrice} onChange={handleChange} required />
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Stock Disponível" name="stock" type="number" value={formData.type === 'physical_unique' ? '1' : formData.stock} onChange={handleChange} disabled={formData.type === 'physical_unique'} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase text-ink/70">Categoria</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="h-11 px-4 rounded-2xl border border-ink/15 text-sm bg-white" required>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <ImageUploader images={formData.images} onChange={(imgs) => setFormData(prev => ({ ...prev, images: imgs }))} />

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/produtos')}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="flex items-center gap-2"><Save className="w-4 h-4" /> {loading ? 'A guardar...' : 'Guardar Artigo'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
