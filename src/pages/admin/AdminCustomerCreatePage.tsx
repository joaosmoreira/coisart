import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, MapPin } from 'lucide-react';
import { api } from '@/services/apiClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const AdminCustomerCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', nif: '', street: '', city: '', postalCode: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      await api.post('/orders', {
        customerName: formData.name, customerEmail: formData.email,
        customerPhone: formData.phone, customerNif: formData.nif,
        customerAddress: { street: formData.street, city: formData.city, postalCode: formData.postalCode, country: 'Portugal' },
        deliveryMethod: 'cafe_pickup', paymentStatus: 'completed',
        items: [{ productId: '65f000000000000000000000', title: 'Registo Inicial de Cliente', price: 0.0, quantity: 1, type: 'digital' }]
      });
      navigate('/admin/clientes');
    } catch { navigate('/admin/clientes'); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/clientes')} className="p-2"><ArrowLeft className="w-4 h-4" /></Button>
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Criar / Registar Cliente</h1>
          <p className="text-sm text-ink/70">Adicione os dados de contacto, NIF e morada de residência do cliente</p>
        </div>
      </div>

      <Card>
        {error && <div className="p-3 mb-4 rounded-2xl bg-red-50 text-red-700 text-xs">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome Completo do Cliente *" name="name" value={formData.name} onChange={handleChange} required placeholder="ex: Ana Rita Fonseca" />
          <Input label="E-mail de Contacto *" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="ana.fonseca@exemplo.pt" />
          
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
            <Button type="submit" disabled={loading} className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> {loading ? 'A registar...' : 'Guardar Cliente'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
