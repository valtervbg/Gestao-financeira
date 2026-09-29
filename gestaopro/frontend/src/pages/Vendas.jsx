import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { M, today, nextCode } from '../lib/format';
import Table from '../components/Table';
import Modal from '../components/Modal';

const FP = ['Dinheiro (Numerário)', 'M-Pesa', 'e-Mola', 'mKesh', 'POS / Cartão', 'Transferência'];

export default function Vendas({ openSignal, onOpenHandled }) {
  const [rows, setRows] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  const load = async () => {
    const { data: s } = await supabase.from('vendas').select('*, clientes(nome), produtos(nome)').order('created_at', { ascending: false });
    const { data: p } = await supabase.from('produtos').select('*');
    const { data: c } = await supabase.from('clientes').select('*');
    setRows(s || []); setProdutos(p || []); setClientes(c || []);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setForm({ numero: nextCode('V-', rows, 'numero'), data: today(), cliente_id: '', produto_id: produtos[0]?.id || '', quantidade: 1, preco: produtos[0]?.preco_venda || 0, valor_pago: '', forma_pagamento: FP[0] });
    setError(''); setOpen(true);
  };
  useEffect(() => { if (openSignal) { openNew(); onOpenHandled?.(); } }, [openSignal]); // eslint-disable-line

  const produto = produtos.find(p => p.id === form.produto_id);
  const total = (Number(form.quantidade) || 0) * (Number(form.preco) || 0);

  const onField = (k, v) => {
    const f = { ...form, [k]: v };
    if (k === 'produto_id') { const p = produtos.find(x => x.id === v); f.preco = p?.preco_venda || 0; }
    setForm(f);
  };

  const submit = async (e) => {
    e.preventDefault();
    const q = Number(form.quantidade), pg = Number(form.valor_pago || total);
    if (!produto) return setError('Escolha um produto.');
    if (q <= 0) return setError('Quantidade inválida.');
    if (q > produto.estoque) return setError(`Estoque insuficiente (disponível: ${produto.estoque}).`);
    if (pg > total) return setError('O valor pago excede o total.');
    const { error } = await supabase.from('vendas').insert({
      numero: form.numero, data: form.data, cliente_id: form.cliente_id || null, produto_id: form.produto_id,
      quantidade: q, preco: Number(form.preco), valor_pago: pg, forma_pagamento: form.forma_pagamento,
    });
    if (error) return setError(error.message);
    setOpen(false); load();
  };

  const receber = async (s) => {
    const pend = Number(s.total) - Number(s.valor_pago);
    const v = Number(prompt(`Valor recebido (máx. ${M(pend)} MT):`, pend));
    if (!v || v <= 0 || v > pend) return;
    await supabase.from('vendas').update({ valor_pago: Number(s.valor_pago) + v }).eq('id', s.id);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Apagar esta venda? O estoque será devolvido.')) return;
    await supabase.from('vendas').delete().eq('id', id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold tracking-tight">Vendas</h1>
          <p className="text-sm text-on-surface-variant">Registo de vendas com cálculo automático</p>
        </div>
        <button onClick={openNew} className="btn-primary">+ Nova Venda</button>
      </div>
      <Table headers={['Nº', 'Data', 'Cliente', 'Produto', '>Qtd', '>Preço', '>Total', '>Pago', '>Pendente', 'Pagamento', 'Estado', '']}
        rows={rows.map(s => {
          const pend = Number(s.total) - Number(s.valor_pago);
          return [
            <b className="text-primary">{s.numero}</b>, s.data, s.clientes?.nome || 'Consumidor Final', s.produtos?.nome,
            s.quantidade, M(s.preco), <b>{M(s.total)}</b>, M(s.valor_pago), M(pend), s.forma_pagamento,
            pend > 0 ? <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">Pendente</span> : <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 font-semibold">Pago</span>,
            <div className="flex items-center gap-2 justify-end">
              {pend > 0 && <button onClick={() => receber(s)} className="px-2 py-1 rounded bg-primary-container text-white font-semibold">Receber</button>}
              <button onClick={() => remove(s.id)} className="text-secondary hover:text-error"><span className="material-symbols-outlined">delete</span></button>
            </div>,
          ];
        })} empty="Nenhuma venda registada." />
      {open && (
        <Modal title="Nova Venda" onClose={() => setOpen(false)}>
          {produtos.length === 0 ? <p className="text-sm">Cadastre um produto antes de registar vendas.</p> : (
            <form onSubmit={submit} className="space-y-3">
              <label className="label">Nº da venda<input className="input" value={form.numero} readOnly /></label>
              <label className="label">Data<input className="input" type="date" value={form.data} onChange={e => onField('data', e.target.value)} /></label>
              <label className="label">Cliente<select className="input" value={form.cliente_id} onChange={e => onField('cliente_id', e.target.value)}>
                <option value="">Consumidor Final</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select></label>
              <label className="label">Produto<select className="input" value={form.produto_id} onChange={e => onField('produto_id', e.target.value)}>
                {produtos.map(p => <option key={p.id} value={p.id}>{p.nome} (estoque {p.estoque})</option>)}
              </select></label>
              <label className="label">Quantidade<input className="input" type="number" min="1" value={form.quantidade} onChange={e => onField('quantidade', e.target.value)} /></label>
              <label className="label">Preço (MT)<input className="input" type="number" step="any" value={form.preco} onChange={e => onField('preco', e.target.value)} /></label>
              <label className="label">Total (MT)<input className="input" value={M(total)} readOnly /></label>
              <label className="label">Valor pago (MT)<input className="input" type="number" step="any" placeholder={M(total)} value={form.valor_pago} onChange={e => onField('valor_pago', e.target.value)} /></label>
              <label className="label">Forma de pagamento<select className="input" value={form.forma_pagamento} onChange={e => onField('forma_pagamento', e.target.value)}>
                {FP.map(f => <option key={f}>{f}</option>)}
              </select></label>
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
