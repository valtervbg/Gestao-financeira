import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { M, nextCode } from '../lib/format';
import Table from '../components/Table';
import Modal from '../components/Modal';

export default function Produtos() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await supabase.from('produtos').select('*').order('created_at');
    setRows(data || []);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setForm({ codigo: nextCode('P', rows), nome: '', preco_compra: '', preco_venda: '', estoque: 0 });
    setError(''); setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nome || Number(form.preco_venda) <= 0) return setError('Preencha o nome e o preço de venda.');
    const { error } = await supabase.from('produtos').insert({
      codigo: form.codigo, nome: form.nome,
      preco_compra: Number(form.preco_compra) || 0,
      preco_venda: Number(form.preco_venda),
      estoque: Number(form.estoque) || 0,
    });
    if (error) return setError(error.message);
    setOpen(false); load();
  };

  const remove = async (id) => {
    if (!confirm('Apagar este produto?')) return;
    await supabase.from('produtos').delete().eq('id', id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold tracking-tight">Produtos</h1>
          <p className="text-sm text-on-surface-variant">Cadastro de produtos e preços</p>
        </div>
        <button onClick={openNew} className="btn-primary">+ Novo Produto</button>
      </div>
      <Table headers={['ID', 'Produto', '>Compra (MT)', '>Venda (MT)', '>Estoque', '']}
        rows={rows.map(p => [
          <b className="text-primary">{p.codigo}</b>, p.nome, M(p.preco_compra), M(p.preco_venda),
          <b className={p.estoque < 10 ? 'text-error' : ''}>{p.estoque}</b>,
          <button onClick={() => remove(p.id)} className="text-secondary hover:text-error"><span className="material-symbols-outlined">delete</span></button>,
        ])} empty="Nenhum produto cadastrado." />
      {open && (
        <Modal title="Novo Produto" onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="space-y-3">
            <label className="label">ID / Código<input className="input" value={form.codigo} readOnly /></label>
            <label className="label">Nome do produto<input className="input" required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></label>
            <label className="label">Preço de compra (MT)<input className="input" type="number" step="any" min="0" value={form.preco_compra} onChange={e => setForm({ ...form, preco_compra: e.target.value })} /></label>
            <label className="label">Preço de venda (MT)<input className="input" type="number" step="any" min="0" required value={form.preco_venda} onChange={e => setForm({ ...form, preco_venda: e.target.value })} /></label>
            <label className="label">Quantidade em estoque<input className="input" type="number" min="0" value={form.estoque} onChange={e => setForm({ ...form, estoque: e.target.value })} /></label>
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
