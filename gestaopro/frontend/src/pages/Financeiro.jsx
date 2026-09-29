import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { M, today } from '../lib/format';
import Table from '../components/Table';
import Modal from '../components/Modal';

const CATS = { entrada: ['Outros ganhos'], saida: ['Despesas', 'Compras de produtos', 'Outros gastos'] };

export default function Financeiro() {
  const [vendas, setVendas] = useState([]);
  const [lanc, setLanc] = useState([]);
  const [open, setOpen] = useState(null); // 'in' | 'out' | null
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  const load = async () => {
    const { data: v } = await supabase.from('vendas').select('total, valor_pago');
    const { data: f } = await supabase.from('despesas').select('*').order('data', { ascending: false });
    setVendas(v || []); setLanc(f || []);
  };
  useEffect(() => { load(); }, []);

  const rec = vendas.reduce((t, v) => t + Number(v.valor_pago), 0);
  const outrosGanhos = lanc.filter(x => x.tipo === 'entrada').reduce((t, x) => t + Number(x.valor), 0);
  const cat = (c) => lanc.filter(x => x.tipo === 'saida' && x.categoria === c).reduce((t, x) => t + Number(x.valor), 0);
  const saidas = lanc.filter(x => x.tipo === 'saida').reduce((t, x) => t + Number(x.valor), 0);
  const entradas = rec + outrosGanhos;
  const lucro = entradas - saidas;

  const openNew = (tipo) => { setForm({ tipo, categoria: CATS[tipo][0], descricao: '', valor: '', data: today() }); setError(''); setOpen(tipo); };

  const submit = async (e) => {
    e.preventDefault();
    if (Number(form.valor) <= 0) return setError('Valor inválido.');
    const { error } = await supabase.from('despesas').insert(form);
    if (error) return setError(error.message);
    setOpen(null); load();
  };

  const remove = async (id) => { if (!confirm('Apagar este lançamento?')) return; await supabase.from('despesas').delete().eq('id', id); load(); };

  const L = (l, v, bold) => (
    <div className={`flex justify-between py-2 border-b border-surface-container text-sm ${bold ? 'font-bold' : ''}`}>
      <span>{l}</span><span className="font-mono font-semibold">{M(v)} MT</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-sm text-on-surface-variant">Entradas, saídas e lucro</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openNew('entrada')} className="btn-primary">+ Entrada</button>
          <button onClick={() => openNew('saida')} className="btn-primary">+ Saída</button>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card"><h2 className="font-bold text-lg text-primary mb-1">Entradas</h2>{L('Vendas (valor recebido)', rec)}{L('Outros ganhos', outrosGanhos)}{L('Total de entradas', entradas, true)}</div>
        <div className="card"><h2 className="font-bold text-lg text-error mb-1">Saídas</h2>{L('Despesas', cat('Despesas'))}{L('Compras de produtos', cat('Compras de produtos'))}{L('Outros gastos', cat('Outros gastos'))}{L('Total de saídas', saidas, true)}</div>
      </div>
      <div className="card">
        <div className="flex justify-between text-secondary"><span className="text-[11px] uppercase font-semibold">Lucro = Entradas − Saídas</span></div>
        <div className={`font-mono text-2xl font-bold mt-2 ${lucro < 0 ? 'text-error' : 'text-primary'}`}>{M(lucro)} MT</div>
      </div>
      <Table headers={['Data', 'Tipo', 'Categoria', 'Descrição', '>Valor (MT)', '']}
        rows={lanc.map(x => [x.data, x.tipo === 'entrada' ? <span className="text-primary font-semibold">Entrada</span> : <span className="text-error font-semibold">Saída</span>, x.categoria, x.descricao, M(x.valor),
          <button onClick={() => remove(x.id)} className="text-secondary hover:text-error"><span className="material-symbols-outlined">delete</span></button>])}
        empty="Sem lançamentos manuais." />
      {open && (
        <Modal title={open === 'entrada' ? 'Nova Entrada' : 'Nova Saída'} onClose={() => setOpen(null)}>
          <form onSubmit={submit} className="space-y-3">
            <label className="label">Categoria<select className="input" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
              {CATS[open].map(c => <option key={c}>{c}</option>)}
            </select></label>
            <label className="label">Descrição<input className="input" required value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></label>
            <label className="label">Valor (MT)<input className="input" type="number" step="any" min="0" required value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} /></label>
            <label className="label">Data<input className="input" type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} /></label>
            {error && <p className="text-xs text-error">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setOpen(null)} className="btn-ghost">Cancelar</button>
              <button className="btn-primary">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
