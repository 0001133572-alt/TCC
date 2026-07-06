import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import Layout from './pages/erp/Layout';
import Dashboard from './pages/erp/Dashboard';
import PedidosPage from './pages/erp/PedidosPage';
import ProducaoPage from './pages/erp/ProducaoPage';
import EstoquePage from './pages/erp/EstoquePage';
import ClientesPage from './pages/erp/ClientesPage';
import FinanceiroPage from './pages/erp/FinanceiroPage';
import LogisticaPage from './pages/erp/LogisticaPage';
import MotoboyPage from './pages/erp/MotoboyPage';
import ConfigPage from './pages/erp/ConfigPage';
import CupomFiscalPage from './pages/erp/CupomFiscalPage.jsx';
import EstoqueInsumos from './pages/erp/EstoqueInsumos.jsx';
import PortalCliente from './pages/portal/PortalCliente.jsx';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'var(--text-secondary)'}}>Carregando...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/portal" element={<PortalCliente />} />
      <Route path="/erp/*" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/erp/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pedidos" element={<PedidosPage />} />
        <Route path="producao" element={<ProducaoPage />} />
        <Route path="estoque" element={<EstoquePage />} />
        <Route path="estoque-insumos" element={<EstoqueInsumos />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="clientes/:id" element={<ClientesPage />} />
        <Route path="financeiro" element={<FinanceiroPage />} />
                <Route path="cupom-fiscal" element={<CupomFiscalPage />} />
                        <Route path="motoboy" element={<MotoboyPage />} />
        <Route path="configuracoes" element={<ConfigPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;
