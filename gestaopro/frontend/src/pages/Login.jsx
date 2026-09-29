import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { session, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (session) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary-container text-white flex items-center justify-center">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </div>
          <div>
            <div className="font-bold text-primary text-lg leading-none">GestãoPro</div>
            <div className="text-[10px] uppercase font-semibold text-secondary tracking-wider">Finanças &amp; Vendas</div>
          </div>
        </div>
        <p className="text-sm text-on-surface-variant">Entre com a sua conta para aceder ao painel.</p>
        <label className="label">Email
          <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@empresa.com" />
        </label>
        <label className="label">Palavra-passe
          <input className="input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        </label>
        {error && <p className="text-xs text-error">{error}</p>}
        <button className="btn-primary w-full py-2.5" disabled={loading}>{loading ? 'A entrar…' : 'Entrar'}</button>
        <p className="text-[11px] text-secondary text-center">O acesso é criado pelo administrador no Supabase (Authentication → Users). Não há registo público.</p>
      </form>
    </div>
  );
}
