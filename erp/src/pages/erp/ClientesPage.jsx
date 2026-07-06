import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, Users, UserCheck, UserPlus, Plus, FileDown, Phone, MapPin,
  Package, TrendingUp, Star, X, MoreVertical, Eye, Edit, ShoppingCart,
  History, FileText, Trash2, ChevronDown, ChevronUp, Filter, ArrowUpDown,
  ChevronRight, Mail, Calendar, CreditCard, StickyNote, XCircle
} from 'lucide-react';
import './ClientesPage.css';

const MOCK_CLIENTS = [
  { id: 1, name: 'João Silva', phone: '(11) 99876-5432', cpf: '123.456.789-00', email: 'joao.silva@email.com', city: 'São Paulo', state: 'SP', street: 'Rua Augusta', number: 1250, complemento: 'Apto 42', cep: '01304-000', status: 'ativo', total_pedidos: 12, total_gasto: 2450.00, ultima_compra: '2026-06-28T14:30:00', pagamento_preferido: 'PIX', observacoes: 'Cliente fiel, sempre elogia os produtos.', favorites: [{ name: 'Hambúrguer Artesanal', count: 5 }, { name: 'Combo Família', count: 3 }], created_at: '2025-01-15T10:00:00' },
  { id: 2, name: 'Maria Oliveira', phone: '(31) 98765-4321', cpf: '987.654.321-00', email: 'maria.oliveira@email.com', city: 'Belo Horizonte', state: 'MG', street: 'Rua da Bahia', number: 450, complemento: 'Sala 101', cep: '30160-010', status: 'ativo', total_pedidos: 25, total_gasto: 5890.00, ultima_compra: '2026-06-30T18:45:00', pagamento_preferido: 'Cartão de Crédito', observacoes: 'Compra toda semana. Prefere entrega noturna.', favorites: [{ name: 'Pizza Margherita', count: 8 }, { name: 'Açaí 500ml', count: 6 }], created_at: '2024-11-20T10:00:00' },
  { id: 3, name: 'Pedro Henrique', phone: '(21) 99765-4321', cpf: '456.789.123-00', email: 'pedro.henrique@email.com', city: 'Rio de Janeiro', state: 'RJ', street: 'Rua das Laranjeiras', number: 300, complemento: '', cep: '22240-000', status: 'ativo', total_pedidos: 15, total_gasto: 3200.00, ultima_compra: '2026-06-27T19:00:00', pagamento_preferido: 'Dinheiro', observacoes: '', favorites: [{ name: 'Combo Família', count: 6 }, { name: 'Batata Frita', count: 5 }], created_at: '2025-03-10T10:00:00' },
  { id: 4, name: 'Ana Paula Costa', phone: '(41) 99876-1234', cpf: '321.654.987-00', email: 'ana.paula@email.com', city: 'Curitiba', state: 'PR', street: 'Rua XV de Novembro', number: 780, complemento: 'Casa', cep: '80020-310', status: 'novo', total_pedidos: 3, total_gasto: 380.00, ultima_compra: '2026-06-22T17:20:00', pagamento_preferido: 'PIX', observacoes: 'Cliente novo, primeira compra em junho.', favorites: [{ name: 'Açaí 500ml', count: 2 }], created_at: '2026-06-01T10:00:00' },
  { id: 5, name: 'Carlos Eduardo', phone: '(51) 99654-3210', cpf: '654.321.987-00', email: 'carlos.eduardo@email.com', city: 'Porto Alegre', state: 'RS', street: 'Rua dos Andradas', number: 1100, complemento: 'Loja 3', cep: '90020-007', status: 'ativo', total_pedidos: 32, total_gasto: 8100.00, ultima_compra: '2026-06-29T20:45:00', pagamento_preferido: 'Cartão de Débito', observacoes: 'Maior cliente do mês. Sempre compra combos.', favorites: [{ name: 'Combo Família', count: 12 }, { name: 'Pizza Margherita', count: 8 }], created_at: '2024-08-05T10:00:00' },
  { id: 6, name: 'Fernanda Souza', phone: '(71) 99543-2109', cpf: '789.123.456-00', email: 'fernanda.souza@email.com', city: 'Salvador', state: 'BA', street: 'Rua Chile', number: 250, complemento: '', cep: '40015-000', status: 'ativo', total_pedidos: 10, total_gasto: 1650.00, ultima_compra: '2026-06-24T16:00:00', pagamento_preferido: 'PIX', observacoes: '', favorites: [{ name: 'Açaí 500ml', count: 4 }, { name: 'Hambúrguer Artesanal', count: 3 }], created_at: '2025-06-15T10:00:00' },
  { id: 7, name: 'Lucas Ferreira', phone: '(61) 99432-1098', cpf: '147.258.369-00', email: 'lucas.ferreira@email.com', city: 'Brasília', state: 'DF', street: 'SQN 308, Bloco A', number: 102, complemento: 'Conjunto B', cep: '70747-020', status: 'ativo', total_pedidos: 18, total_gasto: 4300.00, ultima_compra: '2026-06-27T20:15:00', pagamento_preferido: 'Cartão de Crédito', observacoes: 'Trabalha perto, entrega no escritório.', favorites: [{ name: 'Combo Família', count: 7 }, { name: 'Pizza Margherita', count: 5 }], created_at: '2025-02-20T10:00:00' },
  { id: 8, name: 'Juliana Costa', phone: '(85) 99321-0987', cpf: '258.369.147-00', email: 'juliana.costa@email.com', city: 'Fortaleza', state: 'CE', street: 'Rua Barão de Aracati', number: 600, complemento: '', cep: '60115-080', status: 'inativo', total_pedidos: 5, total_gasto: 720.00, ultima_compra: '2026-05-10T15:00:00', pagamento_preferido: 'Dinheiro', observacoes: 'Não faz pedido desde maio.', favorites: [{ name: 'Batata Frita', count: 3 }], created_at: '2025-09-01T10:00:00' },
  { id: 9, name: 'Rafael Santos', phone: '(92) 99210-9876', cpf: '369.147.258-00', email: 'rafael.santos@email.com', city: 'Manaus', state: 'AM', street: 'Rua Ramos Ferreira', number: 1050, complemento: '', cep: '69010-120', status: 'ativo', total_pedidos: 14, total_gasto: 2800.00, ultima_compra: '2026-06-23T19:45:00', pagamento_preferido: 'PIX', observacoes: '', favorites: [{ name: 'Hambúrguer Artesanal', count: 5 }, { name: 'Combo Família', count: 4 }], created_at: '2025-04-10T10:00:00' },
  { id: 10, name: 'Beatriz Lima', phone: '(81) 99109-8765', cpf: '951.753.486-00', email: 'beatriz.lima@email.com', city: 'Recife', state: 'PE', street: 'Rua da Aurora', number: 350, complemento: 'Apto 201', cep: '50050-000', status: 'novo', total_pedidos: 2, total_gasto: 260.00, ultima_compra: '2026-06-21T17:30:00', pagamento_preferido: 'PIX', observacoes: 'Indicada pela Maria Oliveira.', favorites: [{ name: 'Açaí 500ml', count: 2 }], created_at: '2026-06-15T10:00:00' },
  { id: 11, name: 'Thiago Almeida', phone: '(62) 99098-7654', cpf: '753.486.951-00', email: 'thiago.almeida@email.com', city: 'Goiânia', state: 'GO', street: 'Rua 84', number: 500, complemento: '', cep: '74013-010', status: 'inativo', total_pedidos: 3, total_gasto: 450.00, ultima_compra: '2026-04-20T18:00:00', pagamento_preferido: 'Dinheiro', observacoes: 'Mudou de cidade.', favorites: [{ name: 'Hambúrguer Artesanal', count: 2 }], created_at: '2026-01-05T10:00:00' },
  { id: 12, name: 'Camila Ribeiro', phone: '(91) 98987-6543', cpf: '486.951.753-00', email: 'camila.ribeiro@email.com', city: 'Belém', state: 'PA', street: 'Rua do Padre Eutíquio', number: 900, complemento: '', cep: '66033-000', status: 'ativo', total_pedidos: 7, total_gasto: 1120.00, ultima_compra: '2026-06-25T16:45:00', pagamento_preferido: 'Cartão de Crédito', observacoes: '', favorites: [{ name: 'Açaí 500ml', count: 3 }, { name: 'Pizza Margherita', count: 2 }], created_at: '2025-11-10T10:00:00' },
  { id: 13, name: 'Felipe Martins', phone: '(27) 98876-5432', cpf: '159.357.486-00', email: 'felipe.martins@email.com', city: 'Vitória', state: 'ES', street: 'Av. Jerônimo Monteiro', number: 700, complemento: 'Sala 302', cep: '29010-010', status: 'ativo', total_pedidos: 11, total_gasto: 2100.00, ultima_compra: '2026-06-28T19:30:00', pagamento_preferido: 'PIX', observacoes: 'Gosta de pedir à noite.', favorites: [{ name: 'Combo Família', count: 4 }, { name: 'Hambúrguer Artesanal', count: 3 }], created_at: '2025-07-20T10:00:00' },
  { id: 14, name: 'Larissa Pereira', phone: '(48) 98765-4321', cpf: '357.486.159-00', email: 'larissa.pereira@email.com', city: 'Florianópolis', state: 'SC', street: 'Rua Tenente Marones de Gusmão', number: 120, complemento: '', cep: '88010-010', status: 'ativo', total_pedidos: 28, total_gasto: 6800.00, ultima_compra: '2026-06-30T12:00:00', pagamento_preferido: 'Cartão de Crédito', observacoes: 'Cliente desde janeiro. Sempre elogia.', favorites: [{ name: 'Pizza Margherita', count: 10 }, { name: 'Batata Frita', count: 8 }], created_at: '2024-06-01T10:00:00' },
  { id: 15, name: 'Gabriel Rodrigues', phone: '(43) 98654-3210', cpf: '486.159.357-00', email: 'gabriel.rodrigues@email.com', city: 'Londrina', state: 'PR', street: 'Av. Higienópolis', number: 800, complemento: '', cep: '86010-000', status: 'inativo', total_pedidos: 4, total_gasto: 680.00, ultima_compra: '2026-03-15T17:00:00', pagamento_preferido: 'PIX', observacoes: 'Último pedido em março.', favorites: [{ name: 'Hambúrguer Artesanal', count: 2 }], created_at: '2025-12-01T10:00:00' },
  { id: 16, name: 'Mariana Nascimento', phone: '(32) 98543-2109', cpf: '753.486.159-00', email: 'mariana.nascimento@email.com', city: 'Juiz de Fora', state: 'MG', street: 'Rua Halfeld', number: 1000, complemento: 'Apto 503', cep: '36010-010', status: 'ativo', total_pedidos: 16, total_gasto: 3500.00, ultima_compra: '2026-06-26T20:00:00', pagamento_preferido: 'Cartão de Débito', observacoes: '', favorites: [{ name: 'Combo Família', count: 6 }, { name: 'Pizza Margherita', count: 4 }], created_at: '2025-05-15T10:00:00' },
  { id: 17, name: 'Igor Costa', phone: '(19) 98432-1098', cpf: '258.951.753-00', email: 'igor.costa@email.com', city: 'Campinas', state: 'SP', street: 'Rua Barão de Jaguara', number: 900, complemento: '', cep: '13013-010', status: 'ativo', total_pedidos: 13, total_gasto: 2750.00, ultima_compra: '2026-06-27T13:30:00', pagamento_preferido: 'PIX', observacoes: '', favorites: [{ name: 'Hambúrguer Artesanal', count: 5 }, { name: 'Coca-Cola 2L', count: 4 }], created_at: '2025-08-20T10:00:00' },
  { id: 18, name: 'Patrícia Santos', phone: '(13) 98321-0987', cpf: '951.753.486-00', email: 'patricia.santos@email.com', city: 'Santos', state: 'SP', street: 'Rua XV de Novembro', number: 150, complemento: 'Casa', cep: '11013-000', status: 'inativo', total_pedidos: 2, total_gasto: 320.00, ultima_compra: '2026-02-10T16:00:00', pagamento_preferido: 'Dinheiro', observacoes: 'Mudou para outra cidade.', favorites: [{ name: 'Pizza Margherita', count: 1 }], created_at: '2026-01-10T10:00:00' },
  { id: 19, name: 'André Oliveira', phone: '(21) 98210-9876', cpf: '159.753.486-00', email: 'andre.oliveira@email.com', city: 'Niterói', state: 'RJ', street: 'Rua São Francisco', number: 400, complemento: '', cep: '24020-000', status: 'ativo', total_pedidos: 19, total_gasto: 4100.00, ultima_compra: '2026-06-29T15:45:00', pagamento_preferido: 'PIX', observacoes: 'Compra semanalmente.', favorites: [{ name: 'Combo Família', count: 7 }, { name: 'Batata Frita', count: 5 }], created_at: '2025-04-01T10:00:00' },
  { id: 20, name: 'Isabela Fernandes', phone: '(16) 98109-8765', cpf: '486.951.753-00', email: 'isabela.fernandes@email.com', city: 'Ribeirão Preto', state: 'SP', street: 'Rua Augusta', number: 500, complemento: 'Apto 102', cep: '14010-010', status: 'novo', total_pedidos: 2, total_gasto: 290.00, ultima_compra: '2026-06-24T18:30:00', pagamento_preferido: 'PIX', observacoes: 'Primeira compra esta semana.', favorites: [{ name: 'Açaí 500ml', count: 2 }], created_at: '2026-06-20T10:00:00' },
];

const STATUS_CONFIG = {
  ativo: { label: 'Ativo', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  novo: { label: 'Novo', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  inativo: { label: 'Inativo', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
};

function formatCurrency(v) {
  return `R$ ${(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR');
}

function getInitials(name) {
  return name?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '?';
}

export default function ClientesPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedClient, setSelectedClient] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const menuRef = useRef(null);

  const [form, setForm] = useState({
    name: '', phone: '', cpf: '', email: '', cep: '', city: '', state: '',
    street: '', number: '', complemento: '', observacoes: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setClients(MOCK_CLIENTS);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActionMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const checkWidth = () => {
      setViewMode(window.innerWidth < 768 ? 'cards' : 'table');
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const stats = useMemo(() => ({
    total: clients.length,
    ativos: clients.filter(c => c.status === 'ativo').length,
    novos: clients.filter(c => c.status === 'novo').length,
    inativos: clients.filter(c => c.status === 'inativo').length,
  }), [clients]);

  const filtered = useMemo(() => {
    let list = [...clients];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.cpf?.includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      );
    }

    if (filterStatus !== 'todos') {
      list = list.filter(c => c.status === filterStatus);
    }

    list.sort((a, b) => {
      let va, vb;
      switch (sortField) {
        case 'name': va = a.name; vb = b.name; break;
        case 'recentes': va = a.created_at; vb = b.created_at; break;
        case 'gasto': va = a.total_gasto; vb = b.total_gasto; break;
        case 'pedidos': va = a.total_pedidos; vb = b.total_pedidos; break;
        default: va = a.name; vb = b.name;
      }
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === 'asc' ? va - vb : vb - va;
    });

    return list;
  }, [clients, search, filterStatus, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const openDrawer = (client) => {
    setSelectedClient(client);
    setDrawerOpen(true);
    setActionMenuOpen(null);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedClient(null), 300);
  };

  const openModal = () => {
    setForm({ name: '', phone: '', cpf: '', email: '', cep: '', city: '', state: '', street: '', number: '', complemento: '', observacoes: '' });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSave = () => {
    if (!form.name || !form.phone) return;
    const newClient = {
      id: Date.now(),
      ...form,
      status: 'novo',
      total_pedidos: 0,
      total_gasto: 0,
      ultima_compra: null,
      pagamento_preferido: 'PIX',
      favorites: [],
      created_at: new Date().toISOString(),
    };
    setClients(prev => [newClient, ...prev]);
    closeModal();
  };

  const handleDelete = (id) => {
    setClients(prev => prev.filter(c => c.id !== id));
    setActionMenuOpen(null);
    if (drawerOpen && selectedClient?.id === id) closeDrawer();
  };

  const handleFormChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const metricCards = [
    { title: 'Total de Clientes', value: stats.total, icon: Users, color: '#fc6901', gradient: 'linear-gradient(135deg, #fc6901, #e55a00)', subtitle: 'cadastrados no sistema' },
    { title: 'Clientes Ativos', value: stats.ativos, icon: UserCheck, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)', subtitle: 'comprando regularmente' },
    { title: 'Novos Clientes', value: stats.novos, icon: UserPlus, color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', subtitle: 'últimos 30 dias' },
    { title: 'Inativos', value: stats.inativos, icon: Users, color: '#94a3b8', gradient: 'linear-gradient(135deg, #94a3b8, #64748b)', subtitle: 'sem pedidos recentes' },
  ];

  if (loading) {
    return (
      <div className="clientes-page">
        <div className="clientes-header">
          <div>
            <div className="skeleton skeleton-h1" />
            <div className="skeleton skeleton-p" />
          </div>
        </div>
        <div className="clientes-metrics">
          {[1,2,3,4].map(i => (
            <div key={i} className="metric-card skeleton-card">
              <div className="skeleton skeleton-icon" />
              <div className="metric-content">
                <div className="skeleton skeleton-value" />
                <div className="skeleton skeleton-title" />
              </div>
            </div>
          ))}
        </div>
        <div className="skeleton skeleton-table" />
      </div>
    );
  }

  return (
    <div className="clientes-page">
      <div className="clientes-header">
        <div>
          <h1>Clientes</h1>
          <p>Gerencie seus clientes e acompanhe todo o relacionamento comercial.</p>
        </div>
        <div className="clientes-actions">
          <button className="export-btn" onClick={() => {}}>
            <FileDown size={16} />
            Exportar
          </button>
          <button className="new-client-btn" onClick={openModal}>
            <Plus size={16} />
            Novo Cliente
          </button>
        </div>
      </div>

      <div className="clientes-metrics">
        {metricCards.map((metric, index) => (
          <div key={index} className="metric-card" style={{ animationDelay: `${index * 0.05}s` }}>
            <div className="metric-icon" style={{ background: metric.gradient }}>
              <metric.icon size={20} color="#fff" />
            </div>
            <div className="metric-content">
              <div className="metric-value">{metric.value}</div>
              <div className="metric-title">{metric.title}</div>
              <div className="metric-subtitle">{metric.subtitle}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="clientes-toolbar">
        <div className="clientes-search">
          <Search size={16} />
          <input
            placeholder="Pesquisar por nome, CPF, telefone ou cidade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="clientes-filters">
          <div className="filter-group">
            <Filter size={14} />
            <span className="filter-label">Filtro:</span>
            {['todos', 'ativo', 'novo', 'inativo'].map(s => (
              <button
                key={s}
                className={`filter-btn ${filterStatus === s ? 'active' : ''}`}
                onClick={() => setFilterStatus(s)}
              >
                {s === 'todos' ? 'Todos' : STATUS_CONFIG[s]?.label || s}
              </button>
            ))}
          </div>
          <div className="filter-group">
            <ArrowUpDown size={14} />
            <span className="filter-label">Ordenar:</span>
            {[
              { key: 'name', label: 'Nome' },
              { key: 'recentes', label: 'Mais recentes' },
              { key: 'gasto', label: 'Maior valor' },
              { key: 'pedidos', label: 'Mais pedidos' },
            ].map(opt => (
              <button
                key={opt.key}
                className={`filter-btn ${sortField === opt.key ? 'active' : ''}`}
                onClick={() => handleSort(opt.key)}
              >
                {opt.label}
                {sortField === opt.key && (
                  sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="clientes-empty">
          <div className="empty-illustration">
            <Users size={64} strokeWidth={1} />
          </div>
          <h3>Nenhum cliente encontrado</h3>
          <p>{search ? 'Tente ajustar os filtros de pesquisa.' : 'Cadastre seu primeiro cliente para começar a receber pedidos.'}</p>
          {!search && (
            <button className="new-client-btn" onClick={openModal}>
              <Plus size={16} />
              Cadastrar Cliente
            </button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        <div className="clientes-cards-grid">
          {filtered.map((client, index) => {
            const status = STATUS_CONFIG[client.status] || STATUS_CONFIG.ativo;
            return (
              <div key={client.id} className="cliente-card-mobile" style={{ animationDelay: `${index * 0.03}s` }}>
                <div className="cliente-card-header">
                  <div className="cliente-avatar" style={{ background: `linear-gradient(135deg, ${status.color}, ${status.color}dd)` }}>
                    {getInitials(client.name)}
                  </div>
                  <div className="cliente-card-info">
                    <h3>{client.name}</h3>
                    <span className="cliente-phone"><Phone size={12} /> {client.phone}</span>
                  </div>
                  <span className="status-badge" style={{ color: status.color, background: status.bg }}>{status.label}</span>
                </div>
                <div className="cliente-card-details">
                  <span><MapPin size={12} /> {client.city}/{client.state}</span>
                  <span><Package size={12} /> {client.total_pedidos} pedidos</span>
                  <span><TrendingUp size={12} /> {formatCurrency(client.total_gasto)}</span>
                </div>
                <div className="cliente-card-actions">
                  <button className="card-action-btn" onClick={() => openDrawer(client)}>Ver detalhes</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="clientes-table-wrapper">
          <table className="clientes-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="sortable">Cliente {sortField === 'name' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}</th>
                <th>Telefone</th>
                <th className="hide-mobile">Cidade</th>
                <th className="hide-tablet">CPF</th>
                <th onClick={() => handleSort('recentes')} className="sortable hide-tablet">Último Pedido {sortField === 'recentes' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}</th>
                <th onClick={() => handleSort('pedidos')} className="sortable">Pedidos {sortField === 'pedidos' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}</th>
                <th onClick={() => handleSort('gasto')} className="sortable">Total Gasto {sortField === 'gasto' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client, index) => {
                const status = STATUS_CONFIG[client.status] || STATUS_CONFIG.ativo;
                return (
                  <tr key={client.id} style={{ animationDelay: `${index * 0.02}s` }}>
                    <td>
                      <div className="cliente-cell">
                        <div className="cliente-avatar" style={{ background: `linear-gradient(135deg, ${status.color}, ${status.color}dd)` }}>
                          {getInitials(client.name)}
                        </div>
                        <div className="cliente-cell-info">
                          <span className="cliente-name">{client.name}</span>
                          <span className="cliente-email">{client.email}</span>
                        </div>
                      </div>
                    </td>
                    <td><Phone size={13} className="cell-icon" /> {client.phone}</td>
                    <td className="hide-mobile"><MapPin size={13} className="cell-icon" /> {client.city}/{client.state}</td>
                    <td className="hide-tablet cell-mono">{client.cpf}</td>
                    <td className="hide-tablet">{formatDate(client.ultima_compra)}</td>
                    <td><strong>{client.total_pedidos}</strong></td>
                    <td className="cell-currency">{formatCurrency(client.total_gasto)}</td>
                    <td><span className="status-badge" style={{ color: status.color, background: status.bg }}>{status.label}</span></td>
                    <td>
                      <div className="action-cell" ref={actionMenuOpen === client.id ? menuRef : undefined}>
                        <button className="action-toggle" onClick={() => setActionMenuOpen(actionMenuOpen === client.id ? null : client.id)}>
                          <MoreVertical size={16} />
                        </button>
                        {actionMenuOpen === client.id && (
                          <div className="action-dropdown">
                            <button onClick={() => openDrawer(client)}><Eye size={14} /> Visualizar</button>
                            <button onClick={() => {}}><Edit size={14} /> Editar</button>
                            <button onClick={() => {}}><ShoppingCart size={14} /> Novo Pedido</button>
                            <button onClick={() => {}}><History size={14} /> Histórico</button>
                            <button onClick={() => {}}><FileText size={14} /> Emitir Cupom Fiscal</button>
                            <div className="action-divider" />
                            <button className="action-danger" onClick={() => handleDelete(client.id)}><Trash2 size={14} /> Excluir</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {drawerOpen && selectedClient && (
        <div className="drawer-overlay" onClick={closeDrawer}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>Perfil do Cliente</h2>
              <button className="drawer-close" onClick={closeDrawer}><X size={18} /></button>
            </div>
            <div className="drawer-body">
              <div className="drawer-profile">
                <div className="drawer-avatar" style={{ background: `linear-gradient(135deg, ${(STATUS_CONFIG[selectedClient.status] || STATUS_CONFIG.ativo).color}, ${(STATUS_CONFIG[selectedClient.status] || STATUS_CONFIG.ativo).color}dd)` }}>
                  {getInitials(selectedClient.name)}
                </div>
                <div className="drawer-profile-info">
                  <h3>{selectedClient.name}</h3>
                  <span className="status-badge" style={{
                    color: (STATUS_CONFIG[selectedClient.status] || STATUS_CONFIG.ativo).color,
                    background: (STATUS_CONFIG[selectedClient.status] || STATUS_CONFIG.ativo).bg
                  }}>
                    {(STATUS_CONFIG[selectedClient.status] || STATUS_CONFIG.ativo).label}
                  </span>
                </div>
              </div>

              <div className="drawer-contact-info">
                <div className="contact-row"><Phone size={14} /><span>{selectedClient.phone}</span></div>
                {selectedClient.email && <div className="contact-row"><Mail size={14} /><span>{selectedClient.email}</span></div>}
                <div className="contact-row"><MapPin size={14} /><span>{selectedClient.street}, {selectedClient.number}{selectedClient.complemento ? ` - ${selectedClient.complemento}` : ''}</span></div>
                <div className="contact-row"><MapPin size={14} /><span>{selectedClient.city}/{selectedClient.state} — {selectedClient.cep}</span></div>
              </div>

              <div className="drawer-stats-grid">
                <div className="drawer-stat">
                  <span className="drawer-stat-value">{selectedClient.total_pedidos}</span>
                  <span className="drawer-stat-label">Pedidos</span>
                </div>
                <div className="drawer-stat">
                  <span className="drawer-stat-value">{formatCurrency(selectedClient.total_gasto)}</span>
                  <span className="drawer-stat-label">Total Gasto</span>
                </div>
                <div className="drawer-stat">
                  <span className="drawer-stat-value">{selectedClient.total_pedidos > 0 ? formatCurrency(selectedClient.total_gasto / selectedClient.total_pedidos) : 'R$ 0,00'}</span>
                  <span className="drawer-stat-label">Ticket Médio</span>
                </div>
                <div className="drawer-stat">
                  <span className="drawer-stat-value">{selectedClient.pagamento_preferido || '—'}</span>
                  <span className="drawer-stat-label">Pagamento</span>
                </div>
              </div>

              {selectedClient.favorites?.length > 0 && (
                <div className="drawer-section">
                  <h4><Star size={14} /> Produtos Favoritos</h4>
                  <div className="drawer-list">
                    {selectedClient.favorites.map((fav, i) => (
                      <div key={i} className="drawer-list-item">
                        <span>{fav.name}</span>
                        <span className="drawer-list-count">{fav.count}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedClient.ultima_compra && (
                <div className="drawer-section">
                  <h4><Calendar size={14} /> Última Compra</h4>
                  <p className="drawer-text">{formatDate(selectedClient.ultima_compra)}</p>
                </div>
              )}

              {selectedClient.observacoes && (
                <div className="drawer-section">
                  <h4><StickyNote size={14} /> Observações</h4>
                  <p className="drawer-text">{selectedClient.observacoes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo Cliente</h2>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Nome *</label>
                  <input type="text" value={form.name} onChange={e => handleFormChange('name', e.target.value)} placeholder="Nome completo" />
                </div>
                <div className="form-group">
                  <label>Telefone *</label>
                  <input type="text" value={form.phone} onChange={e => handleFormChange('phone', e.target.value)} placeholder="(00) 00000-0000" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>CPF</label>
                  <input type="text" value={form.cpf} onChange={e => handleFormChange('cpf', e.target.value)} placeholder="000.000.000-00" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => handleFormChange('email', e.target.value)} placeholder="email@exemplo.com" />
                </div>
              </div>
              <div className="form-row form-row-3">
                <div className="form-group">
                  <label>CEP</label>
                  <input type="text" value={form.cep} onChange={e => handleFormChange('cep', e.target.value)} placeholder="00000-000" />
                </div>
                <div className="form-group">
                  <label>Cidade</label>
                  <input type="text" value={form.city} onChange={e => handleFormChange('city', e.target.value)} placeholder="Cidade" />
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <input type="text" value={form.state} onChange={e => handleFormChange('state', e.target.value)} placeholder="UF" maxLength={2} />
                </div>
              </div>
              <div className="form-row form-row-3">
                <div className="form-group">
                  <label>Rua</label>
                  <input type="text" value={form.street} onChange={e => handleFormChange('street', e.target.value)} placeholder="Nome da rua" />
                </div>
                <div className="form-group">
                  <label>Número</label>
                  <input type="text" value={form.number} onChange={e => handleFormChange('number', e.target.value)} placeholder="Nº" />
                </div>
                <div className="form-group">
                  <label>Complemento</label>
                  <input type="text" value={form.complemento} onChange={e => handleFormChange('complemento', e.target.value)} placeholder="Apto, sala..." />
                </div>
              </div>
              <div className="form-group">
                <label>Observações</label>
                <textarea value={form.observacoes} onChange={e => handleFormChange('observacoes', e.target.value)} placeholder="Notas sobre o cliente..." rows={3} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>Cancelar</button>
              <button className="btn-save" onClick={handleSave} disabled={!form.name || !form.phone}>Salvar Cliente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
