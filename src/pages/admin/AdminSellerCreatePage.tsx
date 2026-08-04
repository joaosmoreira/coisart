import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Upload, Image as ImageIcon } from 'lucide-react';
import { api } from '@/services/apiClient';
import { slugify } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ArtistAvatar } from '@/components/shared/ArtistAvatar';
import { AvatarUploader } from '@/components/admin/AvatarUploader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const AdminSellerCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '', password: '', name: '', slug: '', bio: '', avatarUrl: '', instagramUrl: '', isFeatured: false
  });

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
    e.preventDefault(); setLoading(true); setError('');
    try {
      const links = formData.instagramUrl ? [{ platform: 'Instagram', url: formData.instagramUrl }] : [];
      await api.post('/sellers', {
        email: formData.email, password: formData.password, name: formData.name,
        slug: formData.slug || slugify(formData.name), bio: formData.bio, avatarUrl: formData.avatarUrl,
        links, isFeatured: formData.isFeatured
      });
      navigate('/admin/vendedores');
    } catch (err: any) { setError(err.message || 'Erro ao criar conta de vendedor.'); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/vendedores')} className="p-2"><ArrowLeft className="w-4 h-4" /></Button>
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Criar Conta de Vendedor / Artesão</h1>
          <p className="text-sm text-ink/70">Crie uma nova banca de vendedor exclusiva gerida pelo Administrador</p>
        </div>
      </div>

      <Card>
        {error && <div className="p-3 mb-4 rounded-2xl bg-red-50 text-red-700 text-xs">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="E-mail do Vendedor" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="artesao@coisart.pt" />
            <Input label="Palavra-passe de Acesso" name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome da Banca / Artesão" name="name" value={formData.name} onChange={handleChange} required placeholder="ex: Atelier da Sofia" />
            <Input label="Slug / URL (auto-gerado sem acentos)" name="slug" value={formData.slug} onChange={handleChange} required readOnly className="bg-cream/60" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase text-ink/70">Biografia / Apresentação</label>
            <textarea name="bio" rows={3} value={formData.bio} onChange={handleChange} placeholder="Descreva o conceito artesanal e história..." className="w-full p-3 rounded-2xl border border-ink/15 text-sm focus:ring-2 focus:ring-rose outline-none" />
          </div>

          <AvatarUploader
            avatarUrl={formData.avatarUrl}
            name={formData.name || 'Novo Artesão'}
            onChange={(url) => setFormData((prev) => ({ ...prev, avatarUrl: url }))}
            maxSizeMB={5}
          />

          <Input label="Link de Instagram / Website" name="instagramUrl" value={formData.instagramUrl} onChange={handleChange} placeholder="https://instagram.com/..." />

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="isFeatured" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-4 h-4 rounded text-rose focus:ring-rose" />
            <label htmlFor="isFeatured" className="text-sm text-ink font-medium">Destacar este Vendedor na Homepage</label>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/vendedores')}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> {loading ? 'A criar...' : 'Criar Vendedor'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
