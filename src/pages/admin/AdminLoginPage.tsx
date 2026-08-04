import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { api } from '@/services/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.post<{ token: string; user: any }>('/auth/login', { email, password });
      setAuth(data.token, data.user);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Erro ao efetuar login. Verifique os dados fornecidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 bg-grid-pattern">
      <Card className="w-full max-w-md p-8 shadow-cozy border border-ink/10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <span className="flex gap-1" aria-hidden>
              <span className="size-3 rounded-full bg-rose" />
              <span className="size-3 rounded-full bg-lemon" />
              <span className="size-3 rounded-full bg-mint" />
            </span>
            <span className="font-display text-2xl font-bold tracking-tight text-ink">Coisart</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">Acesso ao Backoffice</h1>
          <p className="text-sm text-ink/60 mt-1">Inicie sessão como Administrador ou Vendedor da feira</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="E-mail"
            type="email"
            placeholder="sofia@coisart.pt"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Palavra-passe"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading} className="w-full mt-2 flex items-center justify-center gap-2">
            <LogIn className="w-4 h-4" /> {loading ? 'A autenticar...' : 'Entrar no Painel'}
          </Button>
        </form>

        <div className="mt-8 pt-4 border-t border-ink/10 text-center text-xs text-ink/50">
          <p className="font-semibold text-ink/70 mb-1">Credenciais de Teste Rápidas:</p>
          <p>Admin: <code className="bg-cream px-1 rounded">admin@coisart.pt</code> / <code className="bg-cream px-1 rounded">coisart123</code></p>
          <p>Vendedora Sofia: <code className="bg-cream px-1 rounded">sofia@coisart.pt</code> / <code className="bg-cream px-1 rounded">coisart123</code></p>
        </div>
      </Card>
    </div>
  );
};
