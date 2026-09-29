import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { M, fd, today } from '../lib/format';
import Modal from '../components/Modal';

export function progresso(g, vendas) {
  const v = vendas.filter(v => v.data >= g.data_inicio && v.data <= g.prazo);
  const atual = g.tipo === 'vendas' ? v.reduce((t, x) => t + Number(x.total), 0)
    : g.tipo === 'recebimentos' ? v.reduce((t, x) => t + Number(x.valor_pago), 0) : Number(g.valor_atual);
  const p = Math.min((atual / g.valor_alvo) * 100, 100);
  return { atual, p, falta: Math.max(g.valor_alvo - atual, 0), done: atual >= g.valor_alvo };
}

export function GoalCard({ g, vendas, onDelete, onUpdate, mini = false }) {
  const r = progresso(g, vendas);
  const expirado = !r.done && g.prazo < today();
  const desc = (g.tipo === 'vendas' ? 'Vender ' : g.tipo === 'recebimentos' ? 'Receber ' : 'Atingir ') + M(g.valor_alvo) + ' MT até ' + fd(g.prazo);
  return (
    <div className="card">
      <div className="flex justify-between items-start gap-2">
        <div><div className="font-bold">🎯 {g.titulo}</div><div className="text-xs text-on-surface-variant">{desc}</div></div>
        {!mini && <button onClick={() => onDelete(g.id)} className="text-secondary hover:text-error"><span className="material-symbols-outlined">delete</span></button>}
      </div>
      <div className="font-mono text-sm font-bold mt-3">{M(r.atual)} MT / {M(g.valor_alvo)} MT</div>
      <div className="h-2.5 rounded-full bg-surface-container mt-2 overflow-hidden"><div className="h-full rounded-full bg-primary-container" style={{ width: `${r.p}%` }} /></div>
      <div className="flex justify-between text-xs mt-2">
        <span className={`font-mono font-semibold ${r.done ? 'text-primary' : ''}`}>{r.p.toFixed(1).replace('.', ',')}%</span>
        <span>{r.done ? '✅ Meta concluída' : <>Faltam: <b className="font-mono">{M(r.falta)} MT</b></>}</span>
      </div>
      <div className="flex justify-between items-center text-xs text-secondary mt-2">
        <span>📅 Prazo: {fd(g.prazo)}{expirado && <b className="text-error"> (expirado)</b>}</span>
        {!mini && g.tipo === 'personalizada' && <button onClick={() => onUpdate(g)} className="text-primary font-semibold hover:underline">Atualizar progresso</button>}
      </div>
    </div>
  );
}

export default function Metas() {
  const [metas, setMetas] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  const load = async () => {
    const { data: g } = await supabase.from('metas').select('*').order('created_at');
    const { data: v } = await supabase.from('vendas').select('total, valor_pago, data');
    setMetas(g || []); setVendas(v || []);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ titulo: '', tipo: 'vendas', valor_alvo: '', prazo: '' }); setError(''); setOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    if (Number(form.valor_alvo) <= 0) return setError('Valor alvo inválido.');
    if (form.prazo < today()) return setError('O prazo não pode estar no passado.');
    const { error } = await supabase.from('metas').insert({ titulo: form.titulo, tipo: form.tipo, valor_alvo: Number(form.valor_alvo), prazo: form.prazo, data_inicio: today() });
    if (error) return setError(error.message);
    setOpen(false); load();
  };

  const onDelete = async (id) => { if (!confirm('Apagar esta meta?')) return; await supabase.from('metas').delete().eq('id', id); load(); };
  const onUpdate = async (g) => {
    const v = prompt('Valor atual (MT):', g.valor_atual);
    if (v === null) return;
    await supabase.from('metas').update({ valor_atual: Number(v) }).eq('id', g.id);
    load();
  };

  const results = metas.map(g => progresso(g, vendas));
  const ativas = results.filter(r => !r.done).length;
  const concluidas = results.filter(r => r.done).length;
  const totalAlvo = metas.reduce((t, g) => t + Number(g.valor_alvo), 0);
  const progGeral = totalAlvo ? results.reduce((t, r, i) => t + Math.min(r.atual, metas[i].valor_alvo), 0) / totalAlvo * 100 : 0;
  const restante = results.filter(r => !r.done).reduce((t, r) => t + r.falta, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold tracking-tight">Metas</h1>
          <p className="text-sm text-on-surface-variant">Defina objetivos e acompanhe o progresso do seu negócio.</p>
        </div>
        <button onClick={openNew} className="btn-primary">+ Nova meta</button>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="card"><div className="text-[11px] uppercase font-semibold text-secondary">Metas ativas</div><div className="font-mono text-2xl font-bold mt-2">{ativas}</div></div>
        <div className="card"><div className="text-[11px] uppercase font-semibold text-secondary">Metas concluídas</div><div className="font-mono text-2xl font-bold mt-2 text-primary">{concluidas}</div></div>
        <div className="card"><div className="text-[11px] uppercase font-semibold text-secondary">Progresso geral</div><div className="font-mono text-2xl font-bold mt-2">{progGeral.toFixed(0)}%</div></div>
        <div className="card"><div className="text-[11px] uppercase font-semibold text-secondary">Valor restante</div><div className="font-mono text-2xl font-bold mt-2 text-amber-800">{M(restante)} MT</div></div>
      </div>
      {metas.length === 0 ? <div className="card text-sm text-secondary">Nenhuma meta definida. Clique em "+ Nova meta".</div> : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {metas.map(g => <GoalCard key={g.id} g={g} vendas={vendas} onDelete={onDelete} onUpdate={onUpdate} />)}
        </div>
      )}
      {open && (
        <Modal title="Nova meta" onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="space-y-3">
            <label className="label">Título (ex.: Meta de vendas)<input className="input" required value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} /></label>
            <label className="label">Tipo de meta<select className="input" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
              <option value="vendas">Vendas (automática)</option>
              <option value="recebimentos">Recebimentos (automática)</option>
              <option value="personalizada">Personalizada (manual)</option>
            </select></label>
            <label className="label">Valor alvo (MT)<input className="input" type="number" step="any" min="0" required value={form.valor_alvo} onChange={e => setForm({ ...form, valor_alvo: e.target.value })} /></label>
            <label className="label">Prazo<input className="input" type="date" required value={form.prazo} onChange={e => setForm({ ...form, prazo: e.target.value })} /></label>
            {error && <p className="text-xs text-error">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Cancelar</button>
              <button className="btn-primary">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
