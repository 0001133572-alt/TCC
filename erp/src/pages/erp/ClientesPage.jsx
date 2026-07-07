import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import {
  Search, Users, UserCheck, UserPlus, Plus, FileDown, Phone, MapPin,
  Package, TrendingUp, X, MoreVertical, Eye, Edit, ShoppingCart,
  History, FileText, Trash2, ChevronDown, ChevronUp, Filter, ArrowUpDown,
  ChevronRight, Mail, Calendar, StickyNote
} from 'lucide-react';
import * as XLSX from 'xlsx';
import './ClientesPage.css';

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
  const { clients: rawClients, orders, addClient, deleteClient, updateClient } = useData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedClient, setSelectedClient] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deleteConfirmClient, setDeleteConfirmClient] = useState(null);
  const [historyClient, setHistoryClient] = useState(null);
  const menuRef = useRef(null);
  const exportMenuRef = useRef(null);
  const tableRef = useRef(null);

  const [form, setForm] = useState({
    name: '', phone: '', email: '', cep: '', city: '',
    street: '', number: '', complement: ''
  });

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActionMenuOpen(null);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setExportMenuOpen(false);
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

  const clients = useMemo(() => {
    if (!rawClients) return [];
    return rawClients.map(c => {
      const clientOrders = orders.filter(o => o.client_id === c.id || o.clientId === c.id);
      const total_pedidos = clientOrders.length;
      const total_gasto = clientOrders.reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0);
      const lastOrder = clientOrders.length > 0
        ? clientOrders.reduce((a, b) => new Date(a.created_at || a.createdAt || a.date) > new Date(b.created_at || b.createdAt || b.date) ? a : b)
        : null;
      const last_order_at = lastOrder ? (lastOrder.created_at || lastOrder.createdAt || lastOrder.date) : c.last_order_at;
      return { ...c, total_pedidos, total_gasto, last_order_at };
    });
  }, [rawClients, orders]);

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
        case 'recentes': va = a.last_order_at || a.created_at; vb = b.last_order_at || b.created_at; break;
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
    setForm({ name: '', phone: '', email: '', cep: '', city: '', street: '', number: '', complement: '' });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSave = () => {
    if (!form.name || !form.phone) return;
    addClient({
      name: form.name,
      phone: form.phone,
      email: form.email,
      cep: form.cep,
      city: form.city,
      street: form.street,
      number: form.number,
      complement: form.complement,
      status: 'novo',
      created_at: new Date().toISOString(),
    });
    closeModal();
  };

  const handleDelete = (id) => {
    setActionMenuOpen(null);
    const client = clients.find(c => c.id === id);
    setDeleteConfirmClient(client);
  };

  const confirmDelete = () => {
    if (deleteConfirmClient) {
      deleteClient(deleteConfirmClient.id);
      if (drawerOpen && selectedClient?.id === deleteConfirmClient.id) closeDrawer();
      setDeleteConfirmClient(null);
    }
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setForm({
      name: client.name || '',
      phone: client.phone || '',
      email: client.email || '',
      cep: client.cep || '',
      city: client.city || '',
      street: client.street || '',
      number: client.number || '',
      complement: client.complement || '',
    });
    setEditModalOpen(true);
    setActionMenuOpen(null);
  };

  const handleEditSave = () => {
    if (!form.name || !form.phone || !editingClient) return;
    updateClient(editingClient.id, {
      name: form.name,
      phone: form.phone,
      email: form.email,
      cep: form.cep,
      city: form.city,
      street: form.street,
      number: form.number,
      complement: form.complement,
    });
    setEditModalOpen(false);
    setEditingClient(null);
  };

  const openNewOrder = (client) => {
    setActionMenuOpen(null);
    navigate(`/erp/pedidos?client_id=${client.id}`);
  };

  const openHistory = (client) => {
    setHistoryClient(client);
    setActionMenuOpen(null);
  };

  const openCupomFiscal = (client) => {
    setActionMenuOpen(null);
    navigate('/erp/cupom-fiscal');
  };

  const handleFormChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const getExportData = () => filtered.map(c => ({
    'Nome': c.name,
    'Telefone': c.phone,
    'Cidade': c.city || '—',
    'Endereço': [c.street, c.number].filter(Boolean).join(', ') || '—',
    'Pedidos': c.total_pedidos,
    'Total Gasto': formatCurrency(c.total_gasto),
    'Último Pedido': formatDate(c.last_order_at || c.last_order_at),
    'Status': STATUS_CONFIG[c.status]?.label || c.status,
  }));

  const exportCSV = () => {
    const data = getExportData();
    const headers = Object.keys(data[0] || {});
    const csvRows = [headers.join(',')];
    data.forEach(row => {
      csvRows.push(headers.map(h => `"${(row[h] ?? '').toString().replace(/"/g, '""')}"`).join(','));
    });
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'clientes.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    setExportMenuOpen(false);
  };

  const exportExcel = () => {
    const data = getExportData();
    const ws = XLSX.utils.json_to_sheet(data);
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, ...data.map(row => String(row[key] ?? '').length)) + 2
    }));
    ws['!cols'] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
    XLSX.writeFile(wb, 'clientes.xlsx');
    setExportMenuOpen(false);
  };

  const exportPDF = async () => {
    if (!tableRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(tableRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const width = imgWidth * ratio;
      const height = imgHeight * ratio;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save('clientes.pdf');
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    }
    setExportMenuOpen(false);
  };

  const metricCards = [
    { title: 'Total de Clientes', value: stats.total, icon: Users, color: '#fc6901', gradient: 'linear-gradient(135deg, #fc6901, #e55a00)', subtitle: 'cadastrados no sistema' },
    { title: 'Clientes Ativos', value: stats.ativos, icon: UserCheck, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)', subtitle: 'comprando regularmente' },
    { title: 'Novos Clientes', value: stats.novos, icon: UserPlus, color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', subtitle: 'últimos 30 dias' },
    { title: 'Inativos', value: stats.inativos, icon: Users, color: '#94a3b8', gradient: 'linear-gradient(135deg, #94a3b8, #64748b)', subtitle: 'sem pedidos recentes' },
  ];

  return (
    <div className="clientes-page">
      <div className="clientes-header">
        <div>
          <h1>Clientes</h1>
          <p>Gerencie seus clientes e acompanhe todo o relacionamento comercial.</p>
        </div>
        <div className="clientes-actions">
          <div className="export-dropdown" ref={exportMenuRef}>
            <button className="export-btn" onClick={() => setExportMenuOpen(!exportMenuOpen)}>
              <FileDown size={16} />
              Exportar
            </button>
            {exportMenuOpen && (
              <div className="export-menu">
                <button onClick={exportPDF}><FileText size={14} /> Exportar PDF</button>
                <button onClick={exportExcel}><FileDown size={14} /> Exportar Excel</button>
                <button onClick={exportCSV}><FileDown size={14} /> Exportar CSV</button>
              </div>
            )}
          </div>
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
            placeholder="Pesquisar por nome, telefone ou cidade..."
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
                  <span><MapPin size={12} /> {client.city || '—'}</span>
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
        <div className="clientes-table-wrapper" ref={tableRef}>
          <table className="clientes-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="sortable">Cliente {sortField === 'name' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}</th>
                <th>Telefone</th>
                <th className="hide-mobile">Cidade</th>
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
                    <td className="hide-mobile"><MapPin size={13} className="cell-icon" /> {client.city || '—'}</td>
                    <td className="hide-tablet">{formatDate(client.last_order_at || client.last_order_at)}</td>
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
                            <button onClick={() => openEditModal(client)}><Edit size={14} /> Editar</button>
                            <button onClick={() => openNewOrder(client)}><ShoppingCart size={14} /> Novo Pedido</button>
                            <div className="action-divider" />
                            <button onClick={() => openHistory(client)}><History size={14} /> Histórico</button>
                            <button onClick={() => openCupomFiscal(client)}><FileText size={14} /> Emitir Cupom Fiscal</button>
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
                <div className="contact-row"><MapPin size={14} /><span>{selectedClient.street}{selectedClient.number ? `, ${selectedClient.number}` : ''}{selectedClient.complement ? ` - ${selectedClient.complement}` : ''}</span></div>
                {selectedClient.city && <div className="contact-row"><MapPin size={14} /><span>{selectedClient.city}{selectedClient.cep ? ` — ${selectedClient.cep}` : ''}</span></div>}
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
              </div>

              {selectedClient.last_order_at && (
                <div className="drawer-section">
                  <h4><Calendar size={14} /> Último Pedido</h4>
                  <p className="drawer-text">{formatDate(selectedClient.last_order_at)}</p>
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
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => handleFormChange('email', e.target.value)} placeholder="email@exemplo.com" />
                </div>
                <div className="form-group">
                  <label>CEP</label>
                  <input type="text" value={form.cep} onChange={e => handleFormChange('cep', e.target.value)} placeholder="00000-000" />
                </div>
              </div>
              <div className="form-row form-row-3">
                <div className="form-group">
                  <label>Cidade</label>
                  <input type="text" value={form.city} onChange={e => handleFormChange('city', e.target.value)} placeholder="Cidade" />
                </div>
                <div className="form-group">
                  <label>Rua</label>
                  <input type="text" value={form.street} onChange={e => handleFormChange('street', e.target.value)} placeholder="Nome da rua" />
                </div>
                <div className="form-group">
                  <label>Número</label>
                  <input type="text" value={form.number} onChange={e => handleFormChange('number', e.target.value)} placeholder="Nº" />
                </div>
              </div>
              <div className="form-group">
                <label>Complemento</label>
                <input type="text" value={form.complement} onChange={e => handleFormChange('complement', e.target.value)} placeholder="Apto, sala..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>Cancelar</button>
              <button className="btn-save" onClick={handleSave} disabled={!form.name || !form.phone}>Salvar Cliente</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Cliente</h2>
              <button className="btn-close" onClick={() => setEditModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nome *</label>
                <input type="text" value={form.name} onChange={e => handleFormChange('name', e.target.value)} placeholder="Nome do cliente" />
              </div>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label>Telefone *</label>
                  <input type="tel" value={form.phone} onChange={e => handleFormChange('phone', e.target.value)} placeholder="(00) 00000-0000" />
                </div>
                <div className="form-group">
                  <label>E-mail</label>
                  <input type="email" value={form.email} onChange={e => handleFormChange('email', e.target.value)} placeholder="email@exemplo.com" />
                </div>
              </div>
              <div className="form-group">
                <label>CEP</label>
                <input type="text" value={form.cep} onChange={e => handleFormChange('cep', e.target.value)} placeholder="00000-000" />
              </div>
              <div className="form-row form-row-3">
                <div className="form-group">
                  <label>Cidade</label>
                  <input type="text" value={form.city} onChange={e => handleFormChange('city', e.target.value)} placeholder="Cidade" />
                </div>
                <div className="form-group">
                  <label>Rua</label>
                  <input type="text" value={form.street} onChange={e => handleFormChange('street', e.target.value)} placeholder="Nome da rua" />
                </div>
                <div className="form-group">
                  <label>Número</label>
                  <input type="text" value={form.number} onChange={e => handleFormChange('number', e.target.value)} placeholder="Nº" />
                </div>
              </div>
              <div className="form-group">
                <label>Complemento</label>
                <input type="text" value={form.complement} onChange={e => handleFormChange('complement', e.target.value)} placeholder="Apto, sala..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setEditModalOpen(false)}>Cancelar</button>
              <button className="btn-save" onClick={handleEditSave} disabled={!form.name || !form.phone}>Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmClient && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmClient(null)}>
          <div className="modal-content modal-confirm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Excluir Cliente</h2>
              <button className="btn-close" onClick={() => setDeleteConfirmClient(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p>Tem certeza que deseja excluir <strong>{deleteConfirmClient.name}</strong>?</p>
              <p style={{color: 'var(--text-tertiary)', fontSize: '13px', marginTop: 8}}>Esta ação não pode ser desfeita.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setDeleteConfirmClient(null)}>Cancelar</button>
              <button className="btn-delete" onClick={confirmDelete}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyClient && (
        <div className="modal-overlay" onClick={() => setHistoryClient(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Histórico de Pedidos — {historyClient.name}</h2>
              <button className="btn-close" onClick={() => setHistoryClient(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {orders.filter(o => o.client_id === historyClient.id || o.client_name === historyClient.name).length === 0 ? (
                <p style={{color: 'var(--text-tertiary)', textAlign: 'center', padding: '32px 0'}}>Nenhum pedido encontrado para este cliente.</p>
              ) : (
                <div className="history-list">
                  {orders
                    .filter(o => o.client_id === historyClient.id || o.client_name === historyClient.name)
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .map(order => (
                      <div key={order.id} className="history-item">
                        <div className="history-item-header">
                          <span className="history-order-number">#{order.order_number || order.id}</span>
                          <span className={`status-badge status-${order.status}`}>{order.status}</span>
                        </div>
                        <div className="history-item-details">
                          <span>{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                          <span>{order.payment_method === 'pix' ? 'PIX' : order.payment_method === 'credit' ? 'Crédito' : order.payment_method === 'debit' ? 'Débito' : 'Dinheiro'}</span>
                          <span style={{fontWeight: 600}}>R$ {(order.total || 0).toFixed(2)}</span>
                        </div>
                        {order.items && order.items.length > 0 && (
                          <div className="history-item-products">
                            {order.items.map((item, idx) => (
                              <span key={idx}>{item.name} x{item.quantity}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
