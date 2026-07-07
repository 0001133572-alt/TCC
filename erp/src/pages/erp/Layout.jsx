import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, ClipboardList, Package, Warehouse,
  Users, DollarSign, Truck, FileBarChart, Receipt, Settings,
  LogOut, Menu, X, Sun, Moon, ChevronDown, Bell, Bike, Boxes
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '../../components/PageTransition';
import './Layout.css';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import logoXFlow from '../../assets/logo-xflow.png';

const menuConfig = {
  admin: [
    { path: '/erp/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/erp/pedidos', icon: ClipboardList, label: 'Pedidos' },
    { path: '/erp/producao', icon: Package, label: 'Produção' },
    { path: '/erp/estoque', icon: Warehouse, label: 'Estoque Interno' },
    { path: '/erp/estoque-insumos', icon: Boxes, label: 'Estoque Insumos' },
    { path: '/erp/clientes', icon: Users, label: 'Clientes' },
    { path: '/erp/financeiro', icon: DollarSign, label: 'Financeiro' },
    { path: '/erp/cupom-fiscal', icon: Receipt, label: 'Cupom Fiscal' },
    { path: '/erp/configuracoes', icon: Settings, label: 'Configurações' },
  ],
  producao: [
    { path: '/erp/producao', icon: Package, label: 'Produção' },
    { path: '/erp/estoque-insumos', icon: Boxes, label: 'Estoque Insumos' },
  ],
  financeiro: [
    { path: '/erp/financeiro', icon: DollarSign, label: 'Financeiro' },
    { path: '/erp/cupom-fiscal', icon: Receipt, label: 'Cupom Fiscal' },
  ],
  atendente: [
    { path: '/erp/pedidos', icon: ClipboardList, label: 'Pedidos' },
    { path: '/erp/clientes', icon: Users, label: 'Clientes' },
  ],
  motoboy: [
    { path: '/erp/motoboy', icon: Bike, label: 'Painel Motoboy' },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
  }, []);

  // Redirect non-admin users away from dashboard
  useEffect(() => {
    const role = user?.role;
    if (!role || role === 'admin') return;
    const roleFirstRoute = {
      producao: '/erp/producao',
      financeiro: '/erp/financeiro',
      atendente: '/erp/pedidos',
      motoboy: '/erp/motoboy',
    };
    const target = roleFirstRoute[role];
    if (target && (location.pathname === '/erp/dashboard' || location.pathname === '/erp/' || location.pathname === '/erp')) {
      navigate(target, { replace: true });
    }
  }, [location.pathname, user, navigate]);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  // Sincronizar tema entre abas
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'theme') setTheme(e.newValue || 'dark');
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fechar mobile ao navegar
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Resize handler
  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
        setMobileOpen(false);
      }
    };
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const role = user?.role || 'admin';
  const items = menuConfig[role] || menuConfig.admin;

  const userName = user?.name || user?.email?.split('@')[0] || 'Usuário';
  const userInitial = userName.charAt(0).toUpperCase();

  const isActive = useCallback((path) => {
    if (path === '/erp/dashboard') return location.pathname === path;
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  return (
    <div className={`layout ${theme}`}>
      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? 'open' : 'closed'} ${mobileOpen ? 'mobile-open' : ''}`}
        role="navigation"
        aria-label="Navegação principal"
      >
        <div className="sidebar-header">
          <div className="sidebar-logo">
            {sidebarOpen ? (
              <img src={logoXFlow} alt="XFlow" className="logo-img" />
            ) : (
              <div className="logo-icon-small">
                <LayoutDashboard size={22} style={{ color: 'var(--primary)' }} />
              </div>
            )}
          </div>
          {!isMobile && (
            <button
              className="toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
              title={sidebarOpen ? 'Recolher' : 'Expandir'}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}
          {isMobile && (
            <button className="toggle-btn" onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">
            {sidebarOpen && <span>Menu Principal</span>}
          </div>
          {items.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item logout" title={!sidebarOpen ? 'Sair' : undefined}>
            <LogOut size={20} />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            {isMobile && (
              <button
                className="mobile-menu-btn"
                onClick={() => setMobileOpen(true)}
                aria-label="Abrir menu"
              >
                <Menu size={22} />
              </button>
            )}
            <div className="page-title-area">
              <h2 className="page-title">
                {items.find(i => isActive(i.path))?.label || 'Dashboard'}
              </h2>
            </div>
          </div>

          <div className="topbar-right">
            <button className="topbar-icon-btn" aria-label="Notificações">
              <Bell size={18} />
            </button>

            <button className="topbar-icon-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}>
              <div className="theme-icon-wrapper">
                <Sun size={16} className={`theme-icon sun ${theme === 'light' ? 'active' : ''}`} />
                <Moon size={16} className={`theme-icon moon ${theme === 'dark' ? 'active' : ''}`} />
              </div>
            </button>

            {/* User Dropdown */}
            <div className="user-dropdown" ref={dropdownRef}>
              <button
                className="user-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                <div className="user-avatar">{userInitial}</div>
                <div className="user-info-desktop">
                  <span className="user-name">{userName}</span>
                  <span className="user-badge">{role}</span>
                </div>
                <ChevronDown size={14} className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu" role="menu">
                  <div className="dropdown-header">
                    <div className="dropdown-user-avatar">{userInitial}</div>
                    <div>
                      <div className="dropdown-user-name">{userName}</div>
                      <div className="dropdown-user-role">{role}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item" role="menuitem" onClick={() => navigate('/erp/configuracoes')}>
                    <Settings size={16} />
                    <span>Configurações</span>
                  </button>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout" role="menuitem" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-area">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}