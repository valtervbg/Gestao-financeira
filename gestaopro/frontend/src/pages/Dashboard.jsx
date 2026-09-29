import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { M } from '../lib/format';
import Card from '../components/Card';
import { GoalCard, progresso } from './Metas';

export default function Dashboard({ onNewSale }) {
  const [k, setK] = useState(null);
  const [metas, setMetas] = useState([]);
  const [vendas, setVendas] = useState([]);

  const load = async () => {
    const { data: v } = await supabase.from('vendas').select('total, valor_pago, data');
    const { data: f } = await supabase.from('despesas').select('tipo, valor');
    const { data: g } = await supabase.from('metas').select('*');
    const totalVendas = (v || []).reduce((t, x) => t + Number(x.total), 0);
    const rec = (v || []).reduce((t, x) => t + Number(x.valor_pago), 0);
    const outrosGanhos = (f || []).filter(x => x.tipo === 'entrada').reduce((t, x) => t + Number(x.valor), 0);
    const saidas = (f || []).filter(x => x.tipo === 'saida').reduce((t, x) => t + Number(x.valor), 0);
    setK({ totalVendas, rec, saidas, pendente: totalVendas - rec, lucro: rec + outrosGanhos - saidas });
    setMetas(g || []); setVendas(v || []);
  };
  useEffect(() => { load(); }, []);

  if (!k) return null;

  const ativasPrimeiro = [...metas].sort((a, b) => (progresso(a, vendas).done ? 1 : 0) - (progresso(b, vendas).done ? 1 : 0)).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold tracking-tight">Painel Financeiro &amp; Vendas</h1>
          <p className="text-sm text-on-surface-variant">Visão consolidada do fluxo operacional</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onNewSale} className="btn-primary">+ Nova Venda</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <Card label="Total de vendas" value={`${M(k.totalVendas)} MT`} icon="shopping_bag" />
        <Card label="Total recebido" value={`${M(k.rec)} MT`} icon="payments" />
        <Card label="Total de despesas" value={`${M(k.saidas)} MT`} icon="account_balance_wallet" />
        <div className="card ring-1 ring-primary-container/30 bg-gradient-to-br from-white to-surface-container-low">
          <div className="flex justify-between text-primary"><span className="text-[11px] uppercase font-bold tracking-wide">Lucro</span><span className="material-symbols-outlined">query_stats</span></div>
          <div className={`font-mono text-xl lg:text-2xl font-bold mt-2 ${k.lucro < 0 ? 'text-error' : 'text-primary'}`}>{M(k.lucro)} MT</div>
        </div>
        <Card label="Valores pendentes" value={`${M(k.pendente)} MT`} icon="pending_actions" valueClass="text-amber-800" />
      </div>
      <div className="flex items-center justify-between"><h2 className="font-bold text-lg">Metas</h2><Link to="/metas" className="text-xs text-primary font-semibold hover:underline">Ver todas</Link></div>
      {ativasPrimeiro.length === 0 ? (
        <div className="card text-sm text-secondary">Nenhuma meta definida.</div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ativasPrimeiro.map(g => <GoalCard key={g.id} g={g} vendas={vendas} mini />)}
        </div>
      )}
    </div>
  );
}
