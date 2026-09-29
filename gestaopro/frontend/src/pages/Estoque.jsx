import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { today } from '../lib/format';
import Table from '../components/Table';
import Modal from '../components/Modal';

export default function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [movs, setMovs] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  const load = async () => {
    const { data: p } = await supabase.from('produtos').select('*');
    const { data: m } = await supabase.from('estoque_movimentos').select('*, produtos(nome)').order('created_at', { ascending: false }).limit(15);
    setProdutos(p || []); setMovs(m || []);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ produto_id: produtos[0]?.id || '', quantidade: 1, data: today() }); setError(''); setOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    if (Number(form.quantidade) <= 0) return setError('Quantidade inválida.');
    const { error } = await supabase.from('estoque_movimentos').insert({ produto_id: form.produto_id, tipo: 'entrada', quantidade: Number(form.quantidade), data: form.data, motivo: 'Compra' });
    if (error) return setError(error.message);
    setOpen(false); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold tracking-tight">Estoque</h1>
          <p className="text-sm text-on-surface-variant">Entradas, saídas e quantidade atual calculadas automaticamente</p>
        </div>
        <button onClick={openNew} className="btn-primary">+ Entrada de produtos</button>
      </div>
      <Table headers={['Produto', '>Atual']}
        rows={produtos.map(p => [p.nome, <b className={p.estoque < 10 ? 'text-error' : ''}>{p.estoque}</b>])}
        empty="Sem produtos." />
      <h2 className="font-bold text-lg">Movimentos recentes</h2>
      <Table headers={['Data', 'Produto', 'Tipo', '>Qtd', 'Motivo']}
        rows={movs.map(m => [m.data, m.produtos?.nome, m.tipo === 'entrada' ? <span className="text-primary font-semibold">Entrada</span> : <span className="text-error font-semibold">Saída</span>, m.quantidade, m.motivo])}
        empty="Sem movimentos." />
      {open && (
        <Modal title="Entrada de produtos" onClose={() => setOpen(false)}>
          {produtos.length === 0 ? <p className="text-sm">Cadastre um produto primeiro.</p> : (
            <form onSubmit={submit} className="space-y-3">
              <label className="label">Produto<select className="input" value={form.produto_id} onChange={e => setForm({ ...form, produto_id: e.target.value })}>
                {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select></label>
              <label className="label">Quantidade<input className="input" type="number" min="1" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value })} /></label>
              <label className="label">Data<input className="input" type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} /></label>
              {error && <p className="text-xs text-error">{error}</p>}
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Cancelar</button>
                <button className="btn-primary">Guardar</button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
