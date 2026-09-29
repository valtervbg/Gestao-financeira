import { Router } from 'express';
import { supabase } from '../supabaseClient.js';

const router = Router();

// GET /api/relatorios/estoque -> valor do estoque a preço de custo
router.get('/estoque', async (req, res) => {
  const { data, error } = await supabase.from('produtos').select('*');
  if (error) return res.status(500).json({ error: error.message });
  const valorEstoque = data.reduce((t, p) => t + p.estoque * Number(p.preco_compra), 0);
  const itens = data.reduce((t, p) => t + p.estoque, 0);
  res.json({ produtos: data, itens, valorEstoque });
});

// GET /api/relatorios/lucro?inicio=YYYY-MM-DD&fim=YYYY-MM-DD
router.get('/lucro', async (req, res) => {
  const { inicio, fim } = req.query;
  let vq = supabase.from('vendas').select('total, valor_pago, data');
  let dq = supabase.from('despesas').select('tipo, valor, data');
  if (inicio) { vq = vq.gte('data', inicio); dq = dq.gte('data', inicio); }
  if (fim) { vq = vq.lte('data', fim); dq = dq.lte('data', fim); }
  const [{ data: vendas, error: e1 }, { data: despesas, error: e2 }] = await Promise.all([vq, dq]);
  if (e1) return res.status(500).json({ error: e1.message });
  if (e2) return res.status(500).json({ error: e2.message });
  const recebido = vendas.reduce((t, v) => t + Number(v.valor_pago), 0);
  const outrosGanhos = despesas.filter(d => d.tipo === 'entrada').reduce((t, d) => t + Number(d.valor), 0);
  const saidas = despesas.filter(d => d.tipo === 'saida').reduce((t, d) => t + Number(d.valor), 0);
  res.json({ entradas: recebido + outrosGanhos, saidas, lucro: recebido + outrosGanhos - saidas });
});

export default router;
