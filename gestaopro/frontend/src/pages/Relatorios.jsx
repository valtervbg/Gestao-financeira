import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { M } from '../lib/format';
import Table from '../components/Table';
import Card from '../components/Card';

const TABS = [['vendas', 'Vendas'], ['despesas', 'Despesas'], ['lucro', 'Lucro'], ['estoque', 'Estoque']];

export default function Relatorios() {
  const [tab, setTab] = useState('vendas');
  const [vendas, setVendas] = useState([]);
  const [lanc, setLanc] = useState([]);
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    (async () => {
      const { data: v } = await supabase.from('vendas').select('*, clientes(nome), produtos(nome)').order('data', { ascending: false });
      const { data: f } = await supabase.from('despesas').select('*').order('data', { ascending: false });
      const { data: p } = await supabase.from('produtos').select('*');
      setVendas(v || []); setLanc(f || []); setProdutos(p || []);
    })();
  }, []);

  const rec = vendas.reduce((t, v) => t + Number(v.valor_pago), 0);
  const totalVendas = vendas.reduce((t, v) => t + Number(v.total), 0);
  const pendente = totalVendas - rec;
  const outrosGanhos = lanc.filter(x => x.tipo === 'entrada').reduce((t, x) => t + Number(x.valor), 0);
  const cat = (c) => lanc.filter(x => x.tipo === 'saida' && x.categoria === c).reduce((t, x) => t + Number(x.valor), 0);
  const saidas = lanc.filter(x => x.tipo === 'saida').reduce((t, x) => t + Number(x.valor), 0);
  const entradas = rec + outrosGanhos;
  const lucro = entradas - saidas;
  const margem = entradas ? (lucro / entradas * 100) : 0;
  const itens = produtos.reduce((t, p) => t + p.estoque, 0);
  const valorEstoque = produtos.reduce((t, p) => t + p.estoque * Number(p.preco_compra), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-4xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-sm text-on-surface-variant">Os principais indicadores</p>
      </div>
      <div className="flex gap-1 bg-surface-container p-1 rounded-lg w-fit">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-3 py-1 rounded text-xs font-semibold ${tab === k ? 'bg-white text-primary shadow-sm' : 'text-secondary'}`}>{l}</button>
        ))}
      </div>

      {tab === 'vendas' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card label="Total vendido" value={`${M(totalVendas)} MT`} />
            <Card label="Nº de vendas" value={vendas.length} />
            <Card label="Recebido" value={`${M(rec)} MT`} />
            <Card label="Pendente" value={`${M(pendente)} MT`} valueClass="text-amber-800" />
          </div>
          <Table headers={['Nº', 'Data', 'Cliente', 'Produto', '>Qtd', '>Total (MT)', '>Pago (MT)']}
            rows={vendas.map(s => [s.numero, s.data, s.clientes?.nome || 'Consumidor Final', s.produtos?.nome, s.quantidade, M(s.total), M(s.valor_pago)])} />
        </>
      )}

      {tab === 'despesas' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card label="Total de saídas" value={`${M(saidas)} MT`} valueClass="text-error" />
            <Card label="Despesas" value={`${M(cat('Despesas'))} MT`} />
            <Card label="Compras de produtos" value={`${M(cat('Compras de produtos'))} MT`} />
            <Card label="Outros gastos" value={`${M(cat('Outros gastos'))} MT`} />
          </div>
          <Table headers={['Data', 'Categoria', 'Descrição', '>Valor (MT)']}
            rows={lanc.filter(x => x.tipo === 'saida').map(x => [x.data, x.categoria, x.descricao, M(x.valor)])}
            empty="Nenhuma despesa registada." />
        </>
      )}

      {tab === 'lucro' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card label="Entradas" value={`${M(entradas)} MT`} />
            <Card label="Saídas" value={`${M(saidas)} MT`} />
            <Card label="Lucro" value={`${M(lucro)} MT`} valueClass={lucro < 0 ? 'text-error' : 'text-primary'} />
            <Card label="Margem" value={`${margem.toFixed(1).replace('.', ',')} %`} />
          </div>
        </>
      )}

      {tab === 'estoque' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Card label="Itens em estoque" value={itens} />
            <Card label="Valor em estoque (custo)" value={`${M(valorEstoque)} MT`} />
          </div>
          <Table headers={['ID', 'Produto', '>Compra', '>Venda', '>Qtd', '>Valor (MT)']}
            rows={produtos.map(p => [p.codigo, p.nome, M(p.preco_compra), M(p.preco_venda), p.estoque, M(p.estoque * p.preco_compra)])} />
        </>
      )}
    </div>
  );
}
