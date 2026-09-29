import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function Perfil() {
  const { user, profile, signOut } = useAuth();
  const [nome, setNome] = useState(profile?.nome || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const save = async () => {
    setSaving(true); setMsg('');
    const { error } = await supabase.from('profiles').update({ nome }).eq('id', user.id);
    setSaving(false);
    setMsg(error ? 'Erro ao guardar.' : 'Perfil atualizado.');
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl lg:text-4xl font-bold tracking-tight">Perfil</h1>
        <p className="text-sm text-on-surface-variant">Os seus dados de acesso ao GestãoPro</p>
      </div>
      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary-fixed text-primary font-bold text-xl flex items-center justify-center">
          {(profile?.nome || user?.email || '?').slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-lg">{profile?.nome || 'Utilizador'}</div>
          <div className="text-sm text-secondary">{user?.email}</div>
          <div className="text-xs text-secondary mt-0.5">{profile?.cargo || 'Administrador'}</div>
        </div>
      </div>
      <div className="card space-y-3">
        <label className="label">Nome de exibição
          <input className="input" value={nome} onChange={e => setNome(e.target.value)} />
        </label>
        <label className="label">Email
          <input className="input opacity-70" value={user?.email || ''} disabled />
        </label>
        <div className="flex items-center gap-2 pt-2">
          <button onClick={save} className="btn-primary" disabled={saving}>{saving ? 'A guardar…' : 'Guardar alterações'}</button>
          {msg && <span className="text-xs text-secondary">{msg}</span>}
        </div>
      </div>
      <button onClick={signOut} className="btn-ghost text-error flex items-center gap-2">
        <span className="material-symbols-outlined text-base">logout</span> Terminar sessão
      </button>
    </div>
  );
}
