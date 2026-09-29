import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import Dashboard from './pages/Dashboard';
import Produtos from './pages/Produtos';
import Clientes from './pages/Clientes';
import Vendas from './pages/Vendas';
import Financeiro from './pages/Financeiro';
import Estoque from './pages/Estoque';
import Metas from './pages/Metas';
import Relatorios from './pages/Relatorios';

function Shell() {
  const navigate = useNavigate();
  const [openSale, setOpenSale] = useState(0);
  const goSale = () => { navigate('/vendas'); setOpenSale(n => n + 1); };

  return (
    <div>
      <Sidebar />
      <div className="lg:pl-64 pb-20 lg:pb-0">
        <Topbar onNewSale={goSale} />
        <main className="p-4 lg:p-10 max-w-[1720px] mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard onNewSale={goSale} />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/vendas" element={<Vendas openSignal={openSale} onOpenHandled={() => {}} />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/metas" element={<Metas />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/perfil" element={<Perfil />} />
          </Routes>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<ProtectedRoute><Shell /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}
