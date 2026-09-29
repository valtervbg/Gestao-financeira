import { NavLink } from 'react-router-dom';
import { NAV } from './Sidebar';

export default function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur flex shadow-[0_-2px_12px_rgba(11,28,48,.06)]" style={{ paddingBottom: 'env(safe-area-inset-bottom,0px)' }}>
      {NAV.slice(0, 5).map(([to, , icon, short]) => (
        <NavLink key={to} to={to} end={to === '/'}
          className={({ isActive }) => `flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] ${isActive ? 'text-primary-container font-bold' : 'text-on-surface-variant'}`}>
          <span className="material-symbols-outlined">{icon}</span>{short}
        </NavLink>
      ))}
    </nav>
  );
}
