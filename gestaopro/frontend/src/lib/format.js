export const M = (n) => (Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const today = () => new Date().toISOString().slice(0, 10);
export const fd = (d) => {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  const MES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${+day} ${MES[m - 1]} ${y}`;
};
export const nextCode = (prefix, list, key = 'codigo') => {
  const max = list.reduce((m, x) => Math.max(m, parseInt(String(x[key]).replace(/\D/g, '')) || 0), 0);
  return prefix + String(max + 1).padStart(3, '0');
};
