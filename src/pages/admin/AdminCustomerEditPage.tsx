import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, MapPin } from 'lucide-react';
import { api } from '@/services/apiClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

export const AdminCustomerEditPage: React.FC = () => {
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', nif: '', street: '', city: '', postalCode: ''
  });

  useEffect(() => {
    if (!email) return;
    api.get<any>(`/customers/${encodeURIComponent(email)}`)
      .then(cust => {
        setFormData({
          name: cust.name, email: cust.email,
          phone: cust.phone !== 'Não especificado' ? cust.phone : '',
          nif: cust.nif !== 'N/A' ? cust.nif : '',
          street: cust.address?.street || '',
          city: cust.address?.city || '',
          postalCode: cust.address?.postalCode || ''
        });
      })
      .catch(() => setError('Erro ao carregar dados do cliente.'))
      .finally(() => setLoading(false));
  }, [email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!email) return; setSaving(true); setError('');
    try {
      await api.put(`/customers/${encodeURIComponent(email)}`, formData);
      navigate(`/admin/clientes/${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar dados do cliente.');
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/clientes')} className="p-2"><ArrowLeft className="w-4 h-4" /></Button>
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Editar Ficha de Cliente</h1>
          <p className="text-sm text-ink/70">Atualize os dados de contacto, NIF e morada de residência do cliente</p>
        </div>
      </div>

      <Card>
        {error && <div className="p-3 mb-4 rounded-2xl bg-red-50 text-red-700 text-xs">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome Completo do Cliente *" name="name" value={formData.name} onChange={handleChange} required placeholder="Ana Rita" />
          <Input label="E-mail de Contacto *" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="ana@exemplo.pt" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Telefone *" name="phone" value={formData.phone} onChange={handleChange} required placeholder="912 345 678" />
            <Input label="NIF (Opcional)" name="nif" value={formData.nif} onChange={handleChange} placeholder="234567890" />
          </div>

          <div className="p-4 bg-cream/50 rounded-2xl border border-ink/10 space-y-3">
            <label className="text-xs font-semibold uppercase text-ink/70 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose" /> Morada de Residência / Envio (Opcional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input label="Rua / Morada" name="street" value={formData.street} onChange={handleChange} placeholder="Rua Central, nº 10" />
              <Input label="Cidade" name="city" value={formData.city} onChange={handleChange} placeholder="Porto" />
              <Input label="Código Postal" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="4000-100" />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/clientes')}>Cancelar</Button>
            <Button type="submit" disabled={saving} className="flex items-center gap-2">
              <Save className="w-4 h-4" /> {saving ? 'A guardar...' : 'Guardar Alterações'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
