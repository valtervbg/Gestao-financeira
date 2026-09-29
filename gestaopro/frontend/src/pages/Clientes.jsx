import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { M, nextCode } from '../lib/format';
import Table from '../components/Table';
import Modal from '../components/Modal';

export default function Clientes() {
  const [rows, setRows] = useState([]);
  const [vendasByCliente, setVendasByCliente] = useState({});
  const [open, setOpen] = useState(false);
  const [hist, setHist] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  const load = async () => {
    const { data: c } = await supabase.from('clientes').select('*').order('created_at');
    const { data: v } = await supabase.from('vendas').select('*, produtos(nome)').order('data', { ascending: false });
    setRows(c || []);
    const map = {};
    (v || []).forEach(x => { (map[x.cliente_id] ||= []).push(x); });
    setVendasByCliente(map);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ codigo: nextCode('C', rows), nome: '', telefone: '', localizacao: '' }); setError(''); setOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nome) return setError('Preencha o nome.');
    const { error } = await supabase.from('clientes').insert(form);
    if (error) return setError(error.message);
    setOpen(false); load();
  };

  const remove = async (id) => {
    if (!confirm('Apagar este cliente?')) return;
    await supabase.from('clientes').delete().eq('id', id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-on-surface-variant">O histórico de compras é guardado automaticamente</p>
        </div>
        <button onClick={openNew} className="btn-primary">+ Novo Cliente</button>
      </div>
      <Table headers={['ID', 'Nome', 'Telefone', 'Localização', '>Compras', '>Total comprado (MT)', '']}
        rows={rows.map(c => {
          const v = vendasByCliente[c.id] || [];
          return [
            <b className="text-primary">{c.codigo}</b>, c.nome, c.telefone || '—', c.localizacao || '—',
            v.length, M(v.reduce((t, x) => t + Number(x.total), 0)),
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => setHist(c)} className="text-primary font-semibold hover:underline">Histórico</button>
              <button onClick={() => remove(c.id)} className="text-secondary hover:text-error"><span className="material-symbols-outlined">delete</span></button>
            </div>,
          ];
        })} empty="Nenhum cliente cadastrado." />
      {open && (
        <Modal title="Novo Cliente" onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="space-y-3">
            <label className="label">ID<input className="input" value={form.codigo} readOnly /></label>
            <label className="label">Nome<input className="input" required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></label>
            <label className="label">Número de telefone<input className="input" type="tel" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} /></label>
            <label className="label">Localização (bairro / cidade)<input className="input" value={form.localizacao} onChange={e => setForm({ ...form, localizacao: e.target.value })} /></label>
            {error && <p className="text-xs text-error">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Cancelar</button>
              <button className="btn-primary">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
      {hist && (
        <Modal title={hist.nome} onClose={() => setHist(null)}>
          <p className="text-sm text-secondary mb-2">{hist.telefone || '—'} · 📍 {hist.localizacao || '—'}</p>
          {(vendasByCliente[hist.id] || []).length === 0 && <p className="text-sm text-secondary">Sem compras registadas.</p>}
          {(vendasByCliente[hist.id] || []).map(s => (
            <div key={s.id} className="flex justify-between py-2 border-b border-surface-container text-xs">
              <span>{s.data} · {s.numero}<br />{s.quantidade}x {s.produtos?.nome}</span>
              <span className="font-mono font-bold">{M(s.total)} MT</span>
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
}
