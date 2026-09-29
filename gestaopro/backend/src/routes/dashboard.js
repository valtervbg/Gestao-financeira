import { Router } from 'express';
import { supabase } from '../supabaseClient.js';

const router = Router();

// GET /api/dashboard -> KPIs reais calculados a partir do Supabase
router.get('/', async (req, res) => {
  try {
    const [{ data: vendas, error: e1 }, { data: despesas, error: e2 }] = await Promise.all([
      supabase.from('vendas').select('total, valor_pago'),
      supabase.from('despesas').select('tipo, valor'),
    ]);
    if (e1) throw e1;
    if (e2) throw e2;

    const totalVendas = vendas.reduce((t, v) => t + Number(v.total), 0);
    const totalRecebido = vendas.reduce((t, v) => t + Number(v.valor_pago), 0);
    const pendente = totalVendas - totalRecebido;
    const outrosGanhos = despesas.filter(d => d.tipo === 'entrada').reduce((t, d) => t + Number(d.valor), 0);
    const totalDespesas = despesas.filter(d => d.tipo === 'saida').reduce((t, d) => t + Number(d.valor), 0);
    const entradas = totalRecebido + outrosGanhos;
    const lucro = entradas - totalDespesas;

    res.json({
      totalVendas, totalRecebido, totalDespesas, pendente, lucro,
      numeroVendas: vendas.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
