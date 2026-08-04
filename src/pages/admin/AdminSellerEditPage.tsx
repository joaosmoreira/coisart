import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { api } from '@/services/apiClient';
import { slugify } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ArtistAvatar } from '@/components/shared/ArtistAvatar';
import { AvatarUploader } from '@/components/admin/AvatarUploader';

export const AdminSellerEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '', slug: '', bio: '', avatarUrl: '', instagramUrl: '', isFeatured: false, isActive: true
  });

  useEffect(() => {
    api.get<any[]>('/sellers').then(sellers => {
      const found = sellers.find(s => s._id === id);
      if (found) {
        const insta = found.links?.find((l: any) => l.platform === 'Instagram' || l.platform === 'Website')?.url || '';
        setFormData({
          name: found.name, slug: found.slug, bio: found.bio || '', avatarUrl: found.avatarUrl || '',
          instagramUrl: insta, isFeatured: Boolean(found.isFeatured), isActive: found.isActive !== false
        });
      }
    }).catch(() => setError('Erro ao carregar dados do vendedor.')).finally(() => setLoading(false));
  }, [id]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => {
      const next = { ...prev, [name]: val };
      if (name === 'name') next.slug = slugify(value);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const links = formData.instagramUrl ? [{ platform: 'Instagram', url: formData.instagramUrl }] : [];
      await api.put(`/sellers/${id}`, {
        name: formData.name, slug: formData.slug || slugify(formData.name), bio: formData.bio,
        avatarUrl: formData.avatarUrl, links, isFeatured: formData.isFeatured, isActive: formData.isActive
      });
      navigate('/admin/vendedores');
    } catch (err: any) { setError(err.message || 'Erro ao atualizar vendedor.'); } finally { setSaving(false); }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/vendedores')} className="p-2"><ArrowLeft className="w-4 h-4" /></Button>
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Editar Vendedor / Artesão</h1>
          <p className="text-sm text-ink/70">Atualize foto de perfil, dados da banca e estado da conta</p>
        </div>
      </div>

      <Card>
        {error && <div className="p-3 mb-4 rounded-2xl bg-red-50 text-red-700 text-xs">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AvatarUploader
            avatarUrl={formData.avatarUrl}
            name={formData.name || 'Artesão'}
            onChange={(url) => setFormData((prev) => ({ ...prev, avatarUrl: url }))}
            maxSizeMB={5}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome da Banca / Artesão" name="name" value={formData.name} onChange={handleChange} required />
            <Input label="Slug / URL (auto-gerado sem acentos)" name="slug" value={formData.slug} onChange={handleChange} required readOnly className="bg-cream/60" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase text-ink/70">Biografia / Apresentação</label>
            <textarea name="bio" rows={3} value={formData.bio} onChange={handleChange} className="w-full p-3 rounded-2xl border border-ink/15 text-sm focus:ring-2 focus:ring-rose outline-none" />
          </div>

          <Input label="Link de Instagram / Website" name="instagramUrl" value={formData.instagramUrl} onChange={handleChange} />

          <div className="p-4 bg-cream/50 rounded-2xl border border-ink/10 space-y-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 rounded text-mint focus:ring-mint" />
              <label htmlFor="isActive" className="text-sm text-ink font-bold">Conta Ativa (Disponível no Marketplace)</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isFeatured" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-4 h-4 rounded text-rose focus:ring-rose" />
              <label htmlFor="isFeatured" className="text-sm text-ink font-medium">Destacar este Vendedor na Homepage</label>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/vendedores')}>Cancelar</Button>
            <Button type="submit" disabled={saving} className="flex items-center gap-2">
              <Save className="w-4 h-4" /> {saving ? 'A guardar...' : 'Guardar Alterações'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
