import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Image as ImageIcon, Key, CheckCircle2, X, Mail } from 'lucide-react';
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
    email: '', name: '', slug: '', bio: '', avatarUrl: '', instagramUrl: '', isFeatured: false, isActive: true
  });

  // Estados para o fluxo dedicado de alteração de palavra-passe
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    api.get<any[]>('/sellers').then(sellers => {
      const found = sellers.find(s => s._id === id);
      if (found) {
        const insta = found.links?.find((l: any) => l.platform === 'Instagram' || l.platform === 'Website')?.url || '';
        setFormData({
          email: found.userId?.email || found.email || '',
          name: found.name, slug: found.slug, bio: found.bio || '', avatarUrl: found.avatarUrl || '',
          instagramUrl: insta, isFeatured: Boolean(found.isFeatured), isActive: found.isActive !== false
        });
      }
    }).catch(() => setError('Erro ao carregar dados do vendedor.')).finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => {
      const next = { ...prev, [name]: val };
      if (name === 'name') next.slug = slugify(value);
      return next;
    });
  };

  const handleConfirmPasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As palavras-passes inseridas não coincidem.');
      return;
    }

    setUpdatingPassword(true);
    try {
      await api.put(`/sellers/${id}`, { password: newPassword });
      setPasswordSuccess('Palavra-passe alterada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess('');
      }, 1800);
    } catch (err: any) {
      setPasswordError(err.message || 'Erro ao alterar palavra-passe.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const links = formData.instagramUrl ? [{ platform: 'Instagram', url: formData.instagramUrl }] : [];
      await api.put(`/sellers/${id}`, {
        email: formData.email,
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
          <p className="text-sm text-ink/70">Atualize foto de perfil, credenciais de login e dados da banca</p>
        </div>
      </div>

      <Card>
        {error && <div className="p-3 mb-4 rounded-2xl bg-red-50 text-red-700 text-xs font-medium">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Secção de Credenciais de Acesso (E-mail + Botão Alterar Palavra-passe) */}
          <div className="space-y-3">
            <Input
              label="E-mail de Acesso (Login)"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="artesao@coisart.pt"
            />

            {!showPasswordForm ? (
              <div className="flex items-center justify-between p-4 bg-cream/40 rounded-2xl border border-ink/10">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-rose shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-ink uppercase tracking-wider">Segurança da Conta</p>
                    <p className="text-xs text-ink/60">Palavra-passe protegida</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowPasswordForm(true); setPasswordError(''); setPasswordSuccess(''); setNewPassword(''); setConfirmPassword(''); }}
                  className="flex items-center gap-1.5 text-xs rounded-xl border-ink/20 hover:bg-rose/10 hover:text-rose hover:border-rose transition-all"
                >
                  <Key className="w-3.5 h-3.5" /> Alterar palavra-passe
                </Button>
              </div>
            ) : (
              <div className="p-5 bg-cream/60 rounded-2xl border-2 border-rose/30 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-ink/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-rose" />
                    <h4 className="font-bold text-sm text-ink">Alterar Palavra-passe do Vendedor</h4>
                  </div>
                  <button type="button" onClick={() => setShowPasswordForm(false)} className="text-ink/40 hover:text-ink">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {passwordError && <div className="p-2.5 rounded-xl bg-red-100 text-red-700 text-xs font-medium">{passwordError}</div>}
                {passwordSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {passwordSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink/70 mb-1 block">Nova Palavra-passe</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink/70 mb-1 block">Confirmar Nova Palavra-passe</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a palavra-passe"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink/10">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowPasswordForm(false)}>
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleConfirmPasswordChange}
                    disabled={updatingPassword}
                    className="bg-rose text-white hover:bg-rose/90 flex items-center gap-1.5 shadow-md active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {updatingPassword ? 'A atualizar...' : 'Confirmar Nova Palavra-passe'}
                  </Button>
                </div>
              </div>
            )}
          </div>

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
