import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { M } from '../lib/format';

export default function Topbar({ onNewSale }) {
  const { profile, user, signOut } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const list = [];
    const { data: vendas } = await supabase.from('vendas').select('numero, total, valor_pago');
    (vendas || []).filter(v => Number(v.total) > Number(v.valor_pago)).forEach(v =>
      list.push({ icon: 'schedule', title: 'Pagamento pendente', desc: `${v.numero}: faltam ${M(v.total - v.valor_pago)} MT` }));

    const { data: produtos } = await supabase.from('produtos').select('nome, estoque');
    (produtos || []).filter(p => p.estoque < 10).forEach(p =>
      list.push({ icon: 'inventory_2', title: 'Estoque baixo', desc: `${p.nome}: ${p.estoque} unidade(s) (mínimo: 10)` }));

    const { data: metas } = await supabase.from('metas').select('titulo, valor_alvo, valor_atual, tipo, prazo, data_inicio');
    const { data: vAll } = await supabase.from('vendas').select('total, valor_pago, data');
    (metas || []).forEach(g => {
      const v = (vAll || []).filter(v => v.data >= g.data_inicio && v.data <= g.prazo);
      const atual = g.tipo === 'vendas' ? v.reduce((t, x) => t + Number(x.total), 0)
        : g.tipo === 'recebimentos' ? v.reduce((t, x) => t + Number(x.valor_pago), 0) : Number(g.valor_atual);
      if (atual >= g.valor_alvo) list.push({ icon: 'flag', title: 'Meta concluída', desc: g.titulo });
      else if (g.prazo < new Date().toISOString().slice(0, 10)) list.push({ icon: 'event_busy', title: 'Meta com prazo expirado', desc: g.titulo });
    });
    setNotifs(list);
  };

  useEffect(() => { load(); const i = setInterval(load, 15000); return () => clearInterval(i); }, []);

  return (
    <header className="sticky z-30 h-16 bg-white/90 backdrop-blur px-4 lg:px-10 flex items-center justify-between shadow-sm" style={{ top: 'env(safe-area-inset-top,0px)' }}>
      <div className="font-bold text-primary lg:hidden">GestãoPro</div>
      <div className="hidden lg:block text-sm text-secondary">Moeda: Metical (MT / MZN)</div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <button onClick={() => setOpen(o => !o)} title="Notificações" className="relative w-9 h-9 rounded-lg flex items-center justify-center text-secondary hover:bg-surface-container">
            <span className="material-symbols-outlined">notifications</span>
            {notifs.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" />}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg p-3 max-h-96 overflow-y-auto">
              <div className="font-bold text-sm mb-2">Notificações</div>
              {notifs.length === 0 && <p className="text-xs text-secondary">Sem notificações.</p>}
              {notifs.map((n, i) => (
                <div key={i} className="flex gap-2 py-2 border-b border-surface-container last:border-0">
                  <span className="material-symbols-outlined text-primary text-lg">{n.icon}</span>
                  <div className="text-xs"><div className="font-semibold">{n.title}</div><div className="text-on-surface-variant">{n.desc}</div></div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={onNewSale} className="btn-primary">+ Nova Venda</button>
        <NavLink to="/perfil" className="w-8 h-8 rounded-full bg-primary-fixed text-primary font-bold text-xs flex items-center justify-center">
          {(profile?.nome || user?.email || '?').slice(0, 2).toUpperCase()}
        </NavLink>
      </div>
    </header>
  );
}
