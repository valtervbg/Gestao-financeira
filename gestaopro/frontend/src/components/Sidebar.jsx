import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const NAV = [
  ['/', 'Dashboard', 'dashboard', 'Início'],
  ['/produtos', 'Produtos', 'inventory_2', 'Produtos'],
  ['/clientes', 'Clientes', 'group', 'Clientes'],
  ['/vendas', 'Vendas', 'point_of_sale', 'Vendas'],
  ['/financeiro', 'Financeiro', 'account_balance_wallet', 'Finanças'],
  ['/estoque', 'Estoque', 'warehouse', 'Estoque'],
  ['/metas', 'Metas', 'flag', 'Metas'],
  ['/relatorios', 'Relatórios', 'bar_chart', 'Relat.'],
];

export default function Sidebar() {
  const { profile, user, signOut } = useAuth();
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white flex-col justify-between shadow-sm z-40">
      <div>
        <div className="h-16 px-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-container text-white flex items-center justify-center">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </div>
          <div className="leading-none">
            <div className="font-bold text-primary">GestãoPro</div>
            <div className="text-[10px] font-semibold uppercase text-secondary tracking-wider">Finanças &amp; Vendas</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1 px-2 mt-2">
          {NAV.map(([to, label, icon]) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary-container text-white font-bold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container'}`}>
              <span className="material-symbols-outlined">{icon}</span>{label}
            </NavLink>
          ))}
        </nav>
      </div>
      <NavLink to="/perfil" className="p-4 flex items-center gap-2 hover:bg-surface-container-low">
        <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary font-bold text-xs flex items-center justify-center">
          {(profile?.nome || user?.email || '?').slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold truncate">{profile?.nome || 'Utilizador'}</div>
          <div className="text-[11px] text-secondary truncate">{user?.email}</div>
        </div>
        <button onClick={(e) => { e.preventDefault(); signOut(); }} title="Sair" className="text-secondary hover:text-error">
          <span className="material-symbols-outlined">logout</span>
        </button>
      </NavLink>
    </aside>
  );
}
