import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search, Plus, X, Eye, Clock, CheckCircle, XCircle, ChevronRight,
  Package, User, CreditCard, FileText, Copy, RefreshCw,
  Filter, Grid, List, Tag, ShoppingCart, Minus, Loader2,
  AlertCircle, Check, Truck, Utensils
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import './PedidosPage.css';

const STATUS_CONFIG = {
  aguardando_pagamento: { label: 'Aguard. Pagamento', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: CreditCard },
  recebido: { label: 'Recebido', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: Clock },
  em_producao: { label: 'Em Produção', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Package },
  pronto: { label: 'Pronto', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', icon: CheckCircle },
  saindo_entrega: { label: 'Saiu para Entrega', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: Truck },
  entregue: { label: 'Entregue', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: CheckCircle },
  cancelado: { label: 'Cancelado', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: XCircle },
};

const PAYMENT_METHODS = [
  { value: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { value: 'pix', label: 'PIX', icon: '📱' },
  { value: 'credito', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'debito', label: 'Cartão de Débito', icon: '💳' },
];

const STATUS_OPTIONS = ['aguardando_pagamento', 'recebido', 'em_producao', 'pronto', 'saindo_entrega', 'entregue', 'cancelado'];

const CATEGORIES = [
  { id: 'todos', name: 'Todos', icon: Utensils },
  { id: 'hamburgueres', name: 'Hambúrgueres', icon: Utensils },
  { id: 'pizzas', name: 'Pizzas', icon: Utensils },
  { id: 'bebidas', name: 'Bebidas', icon: Utensils },
  { id: 'porcoes', name: 'Porções', icon: Utensils },
  { id: 'sobremesas', name: 'Sobremesas', icon: Utensils },
  { id: 'lanches', name: 'Lanches', icon: Utensils },
];

const ITEMS_PER_PAGE = 10;
const DELIVERY_FEE = 5.99;

export default function PedidosPage() {
  const { orders, clients, products, addOrder, updateOrderStatus, cancelOrder, pixPayments, createPixPayment, getPixPaymentByOrderId, pollPixPaymentStatus } = useData();
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState('todos');
  const [productSearch, setProductSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const [formData, setFormData] = useState({
    client_id: '',
    payment_method: 'pix',
    notes: '',
    delivery_fee: DELIVERY_FEE,
    discount: 0,
  });
  const [cartItems, setCartItems] = useState([]);
  const [searchClient, setSearchClient] = useState('');
  const [showClientList, setShowClientList] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [selectedPixPayment, setSelectedPixPayment] = useState(null);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixError, setPixError] = useState(null);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (
          !(o.client_name || '').toLowerCase().includes(term) &&
          !(o.order_number || '').toLowerCase().includes(term)
        ) return false;
      }
      return true;
    });
  }, [orders, statusFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const currentPage = page > totalPages ? 1 : page;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchTerm]);

  const filteredProducts = useMemo(() => {
    let items = products || [];
    if (activeCategory !== 'todos') {
      items = items.filter(p => p.category === activeCategory);
    }
    if (productSearch.trim()) {
      const term = productSearch.toLowerCase();
      items = items.filter(p =>
        p.name.toLowerCase().includes(term)
      );
    }
    return items;
  }, [products, activeCategory, productSearch]);

  const openDetail = (order) => {
    setSelectedOrder(order);
  };

  const filteredClients = (clients || []).filter(c =>
    c.name.toLowerCase().includes(searchClient.toLowerCase()) ||
    (c.phone || '').includes(searchClient)
  );

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        unit_price: Number(product.price),
        quantity: 1,
      }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(i => i.product_id !== productId));
  };

  const updateCartQty = (productId, delta) => {
    setCartItems(prev => prev.map(i =>
      i.product_id === productId
        ? { ...i, quantity: Math.max(1, i.quantity + delta) }
        : i
    ));
  };

  const cartItemsWithSubtotal = useMemo(() =>
    cartItems.map(i => ({
      ...i,
      subtotal: i.unit_price * i.quantity,
    })),
  [cartItems]);

  const cartSubtotal = cartItemsWithSubtotal.reduce((sum, i) => sum + i.subtotal, 0);
  const discount = Number(formData.discount) || 0;
  const deliveryFee = Number(formData.delivery_fee) || 0;
  const cartTotal = cartSubtotal + deliveryFee - discount;

  const handleSubmitOrder = async () => {
    if (!formData.client_id || cartItems.length === 0) return;
    setSubmitting(true);

    const client = (clients || []).find(c => c.id === Number(formData.client_id));
    const orderData = {
      client_id: Number(formData.client_id),
      client_name: client?.name || '',
      client_phone: client?.phone || '',
      client_address: client?.address || '',
      items: cartItemsWithSubtotal.map(i => ({
        product_id: i.product_id,
        name: i.name,
        quantity: i.quantity,
        unit_price: i.unit_price,
        subtotal: i.subtotal,
      })),
      subtotal: cartSubtotal,
      delivery_fee: deliveryFee,
      discount: discount,
      total: cartTotal,
      payment_method: formData.payment_method,
      payment_status: 'pendente',
      status: formData.payment_method === 'pix' ? 'aguardando_pagamento' : 'recebido',
      notes: formData.notes || '',
    };

    const newOrder = addOrder(orderData);

    if (formData.payment_method === 'pix' && newOrder) {
      try {
        setPixLoading(true);
        setPixError(null);
        const pixData = await createPixPayment(newOrder.id, cartTotal, newOrder.order_number);
        if (pixData) {
          setSelectedPixPayment({ ...pixData, orderId: newOrder.id, orderNumber: newOrder.order_number, amount: cartTotal });
          setPixModalOpen(true);
        } else {
          setPixError('Erro ao criar pagamento PIX. Verifique o servidor e tente novamente.');
        }
      } catch (err) {
        console.error('Erro ao criar pagamento PIX:', err);
        setPixError('Erro ao conectar com o servidor de pagamentos.');
      } finally {
        setPixLoading(false);
      }
    }

    setShowNewOrder(false);
    resetForm();
    setSubmitting(false);
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      payment_method: 'pix',
      notes: '',
      delivery_fee: DELIVERY_FEE,
      discount: 0,
    });
    setCartItems([]);
    setSearchClient('');
    setShowClientList(false);
    setProductSearch('');
    setActiveCategory('todos');
  };

  const handleNextStatus = (order) => {
    const statusFlow = ['recebido', 'em_producao', 'pronto', 'saindo_entrega', 'entregue'];
    const currentIdx = statusFlow.indexOf(order.status);
    if (currentIdx >= 0 && currentIdx < statusFlow.length - 1) {
      updateOrderStatus(order.id, statusFlow[currentIdx + 1]);
      if (selectedOrder?.id === order.id) {
        setSelectedOrder({ ...order, status: statusFlow[currentIdx + 1] });
      }
    }
  };

  const handleCancelOrder = (order) => {
    if (window.confirm(`Deseja cancelar o pedido ${order.order_number}?`)) {
      cancelOrder(order.id);
      if (selectedOrder?.id === order.id) {
        setSelectedOrder({ ...order, status: 'cancelado' });
      }
    }
  };

  const formatDate = (d) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  const formatCurrency = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;

  const selectedClientName = (clients || []).find(c => c.id === Number(formData.client_id))?.name || '';

  const openPixModal = (order) => {
    const existingPix = getPixPaymentByOrderId(order.id);
    if (existingPix) {
      setSelectedPixPayment({ ...existingPix, orderId: order.id, orderNumber: order.order_number, amount: order.total });
      setPixModalOpen(true);
    }
  };

  const closePixModal = () => {
    setPixModalOpen(false);
    setSelectedPixPayment(null);
  };

  const checkPixStatus = async () => {
    if (!selectedPixPayment) return;
    try {
      setPixLoading(true);
      const paid = await pollPixPaymentStatus(selectedPixPayment.transaction_id, selectedPixPayment.orderId);
      if (paid) {
        setSelectedPixPayment(prev => ({ ...prev, status: 'pago' }));
      }
    } catch (err) {
      console.error('Erro ao verificar status PIX:', err);
    } finally {
      setPixLoading(false);
    }
  };

  const copyPixCode = () => {
    if (selectedPixPayment?.pix_copia_cola) {
      navigator.clipboard.writeText(selectedPixPayment.pix_copia_cola);
    }
  };

  const getPixTimeRemaining = () => {
    if (!selectedPixPayment?.expires_at) return null;
    const now = new Date();
    const expires = new Date(selectedPixPayment.expires_at);
    const diff = expires - now;
    if (diff <= 0) return 'Expirado';
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const [pixCountdown, setPixCountdown] = useState('');

  useEffect(() => {
    if (!pixModalOpen || !selectedPixPayment?.expires_at) {
      setPixCountdown('');
      return;
    }
    const interval = setInterval(() => {
      const remaining = getPixTimeRemaining();
      setPixCountdown(remaining);
      if (remaining === 'Expirado') {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [pixModalOpen, selectedPixPayment?.expires_at]);

  useEffect(() => {
    if (!pixModalOpen || !selectedPixPayment?.transaction_id) return;
    const interval = setInterval(async () => {
      try {
        const paid = await pollPixPaymentStatus(selectedPixPayment.transaction_id, selectedPixPayment.orderId);
        if (paid) {
          setSelectedPixPayment(prev => ({ ...prev, status: 'pago' }));
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Erro ao verificar status PIX:', err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [pixModalOpen, selectedPixPayment?.transaction_id, selectedPixPayment?.orderId]);

  const getPixStatusLabel = (status) => {
    switch (status) {
      case 'pago': return { label: 'Pago', color: '#10b981', bg: 'rgba(16,185,129,0.12)' };
      case 'expirado': return { label: 'Expirado', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' };
      default: return { label: 'Aguardando pagamento', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
    }
  };

  return (
    <div className="pedidos-page">
      <div className="pedidos-header">
        <div>
          <h1>Pedidos</h1>
          <p>Gerenciamento de pedidos</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNewOrder(true)}>
          <Plus size={18} /> Novo Pedido
        </button>
      </div>

      <div className="pedidos-filters">
        <div className="search-input">
          <Search size={16} />
          <input
            placeholder="Buscar cliente ou número do pedido..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => setSearchTerm('')}>
              <X size={14} />
            </button>
          )}
        </div>
        <select className="status-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
          ))}
        </select>
      </div>

      <div className="pedidos-table-container">
        <table className="pedidos-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length === 0 ? (
              <tr><td colSpan="6" className="table-empty">Nenhum pedido encontrado</td></tr>
            ) : paginatedOrders.map(order => {
              const st = STATUS_CONFIG[order.status] || { label: order.status, color: '#666', bg: 'rgba(0,0,0,0.05)' };
              return (
                <tr key={order.id}>
                  <td className="td-date">{formatDate(order.created_at)}</td>
                  <td className="td-op">{order.order_number || '—'}</td>
                  <td className="td-client">{order.client_name || '—'}<br /><span className="td-phone">{order.client_phone || ''}</span></td>
                  <td className="td-value">{formatCurrency(order.total)}</td>
                  <td>
                    <span className="status-badge" style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => openDetail(order)} title="Ver detalhes"><Eye size={16} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={currentPage <= 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
            <span>{currentPage} / {totalPages}</span>
            <button disabled={currentPage >= totalPages} onClick={() => setPage(p => p + 1)}>Próximo</button>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalhes do Pedido</h3>
              <button className="btn-icon" onClick={() => setSelectedOrder(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="order-detail-grid">
                <div className="detail-section">
                  <h4><FileText size={14} /> Informações</h4>
                  <div className="detail-row"><span>Data</span><span>{formatDate(selectedOrder.created_at)}</span></div>
                  <div className="detail-row"><span>Pedido</span><span className="op-highlight">{selectedOrder.order_number || '—'}</span></div>
                  <div className="detail-row"><span>Pagamento</span><span>{PAYMENT_METHODS.find(m => m.value === selectedOrder.payment_method)?.label || selectedOrder.payment_method || '—'}</span></div>
                  <div className="detail-row"><span>Status Pagamento</span><span>{selectedOrder.payment_status === 'pago' ? 'Pago' : 'Pendente'}</span></div>
                  {selectedOrder.notes && <div className="detail-row"><span>Obs</span><span>{selectedOrder.notes}</span></div>}
                </div>
                <div className="detail-section">
                  <h4><User size={14} /> Cliente</h4>
                  <div className="detail-row"><span>Nome</span><span>{selectedOrder.client_name || '—'}</span></div>
                  <div className="detail-row"><span>Telefone</span><span>{selectedOrder.client_phone || '—'}</span></div>
                  <div className="detail-row"><span>Endereço</span><span>{selectedOrder.client_address || '—'}</span></div>
                </div>
              </div>

              {selectedOrder.items?.length > 0 && (
                <div className="detail-section" style={{ marginTop: 16 }}>
                  <h4><Package size={14} /> Itens do Pedido</h4>
                  <table className="items-table">
                    <thead>
                      <tr><th>Produto</th><th>Qtd</th><th>Preço</th><th>Subtotal</th></tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, i) => (
                        <tr key={i}>
                          <td>{item.name || 'Produto'}</td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.unit_price)}</td>
                          <td>{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'right', fontWeight: 600 }}>Subtotal</td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(selectedOrder.subtotal)}</td>
                      </tr>
                      {selectedOrder.delivery_fee > 0 && (
                        <tr>
                          <td colSpan="3" style={{ textAlign: 'right', fontWeight: 600 }}>Taxa de Entrega</td>
                          <td style={{ fontWeight: 600 }}>{formatCurrency(selectedOrder.delivery_fee)}</td>
                        </tr>
                      )}
                      {selectedOrder.discount > 0 && (
                        <tr>
                          <td colSpan="3" style={{ textAlign: 'right', fontWeight: 600 }}>Desconto</td>
                          <td style={{ fontWeight: 600, color: '#ef4444' }}>-{formatCurrency(selectedOrder.discount)}</td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'right', fontWeight: 700 }}>Total</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(selectedOrder.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              <div className="detail-section" style={{ marginTop: 16 }}>
                <h4><Clock size={14} /> Timeline do Pedido</h4>
                <div className="status-timeline">
                  {['recebido', 'em_producao', 'pronto', 'saindo_entrega', 'entregue'].map((s, i) => {
                    const cfg = STATUS_CONFIG[s];
                    const isActive = selectedOrder.status === s;
                    const isPast = ['recebido', 'em_producao', 'pronto', 'saindo_entrega', 'entregue'].indexOf(selectedOrder.status) >= i;
                    return (
                      <div key={s} className={`timeline-step ${isPast ? 'past' : ''} ${isActive ? 'active' : ''}`}>
                        <div className="timeline-dot" style={{ background: isPast ? cfg.color : 'var(--border)' }}>
                          {isPast && <cfg.icon size={12} />}
                        </div>
                        <div className="timeline-content">
                          <span className="timeline-label">{cfg.label}</span>
                        </div>
                        {i < 4 && <div className={`timeline-line ${isPast ? 'past' : ''}`} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="detail-section" style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {selectedOrder.status !== 'entregue' && selectedOrder.status !== 'cancelado' && (
                  <>
                    <button className="btn-primary" onClick={() => handleNextStatus(selectedOrder)}>
                      Avançar Status
                    </button>
                    <button className="btn-cancel" onClick={() => handleCancelOrder(selectedOrder)} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                      Cancelar Pedido
                    </button>
                  </>
                )}
                {selectedOrder.payment_method === 'pix' && selectedOrder.payment_status === 'pendente' && (
                  <button className="btn-primary" onClick={() => openPixModal(selectedOrder)} style={{ background: '#8b5cf6' }}>
                    <CreditCard size={14} /> Ver PIX
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showNewOrder && (
        <div className="modal-overlay" onClick={() => { setShowNewOrder(false); resetForm(); }}>
          <div className="modal-content modal-full" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Plus size={16} /> Novo Pedido</h3>
              <button className="btn-icon" onClick={() => { setShowNewOrder(false); resetForm(); }}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="pdv-layout">
                {/* LADO ESQUERDO - PRODUTOS */}
                <div className="pdv-left">
                  {/* Cliente + Pagamento + Obs */}
                  <div className="pdv-header-section">
                    <div className="form-group">
                      <label>Cliente <span className="required">*</span></label>
                      <div className="client-search-wrapper">
                        <input
                          placeholder="Buscar cliente por nome ou telefone..."
                          value={formData.client_id ? selectedClientName : searchClient}
                          onChange={e => {
                            setSearchClient(e.target.value);
                            setFormData(prev => ({ ...prev, client_id: '' }));
                            setShowClientList(true);
                          }}
                          onFocus={() => setShowClientList(true)}
                          className="client-search-input"
                        />
                        {showClientList && searchClient && !formData.client_id && (
                          <div className="client-dropdown">
                            {filteredClients.length === 0 ? (
                              <div className="client-dropdown-empty">Nenhum cliente encontrado</div>
                            ) : filteredClients.map(c => (
                              <div
                                key={c.id}
                                className="client-dropdown-item"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, client_id: c.id }));
                                  setSearchClient(c.name);
                                  setShowClientList(false);
                                }}
                              >
                                <span className="client-dropdown-name">{c.name}</span>
                                <span className="client-dropdown-phone">{c.phone}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {formData.client_id && (
                          <button className="client-clear" onClick={() => { setFormData(prev => ({ ...prev, client_id: '' })); setSearchClient(''); }}>
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Pagamento</label>
                        <select
                          value={formData.payment_method}
                          onChange={e => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                          className="form-select"
                        >
                          {PAYMENT_METHODS.map(m => (
                            <option key={m.value} value={m.value}>{m.icon} {m.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Taxa Entrega</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.delivery_fee}
                          onChange={e => setFormData(prev => ({ ...prev, delivery_fee: Number(e.target.value) || 0 }))}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Desconto</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.discount}
                          onChange={e => setFormData(prev => ({ ...prev, discount: Number(e.target.value) || 0 }))}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Observações</label>
                      <textarea
                        placeholder="Observações do pedido..."
                        value={formData.notes}
                        onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        className="form-textarea"
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Catálogo de Produtos */}
                  <div className="product-catalog-section">
                    <div className="catalog-header">
                      <div className="catalog-search">
                        <Search size={16} />
                        <input
                          placeholder="Buscar produto..."
                          value={productSearch}
                          onChange={e => setProductSearch(e.target.value)}
                          className="catalog-search-input"
                        />
                      </div>
                      <div className="view-toggle">
                        <button
                          className={viewMode === 'grid' ? 'active' : ''}
                          onClick={() => setViewMode('grid')}
                          title="Grade"
                        ><Grid size={16} /></button>
                        <button
                          className={viewMode === 'list' ? 'active' : ''}
                          onClick={() => setViewMode('list')}
                          title="Lista"
                        ><List size={16} /></button>
                      </div>
                    </div>

                    <div className="categories-bar">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                          onClick={() => setActiveCategory(cat.id)}
                        >
                          <cat.icon size={14} />
                          <span>{cat.name}</span>
                        </button>
                      ))}
                    </div>

                    <div className={`product-grid ${viewMode}`}>
                      {filteredProducts.length === 0 ? (
                        <div className="catalog-empty">
                          <Package size={32} />
                          <span>Nenhum produto encontrado</span>
                          <p>Tente outra categoria ou termo de busca</p>
                        </div>
                      ) : filteredProducts.map(prod => {
                        const inCart = cartItems.find(i => i.product_id === prod.id);
                        return (
                          <div
                            key={prod.id}
                            className={`product-card ${viewMode === 'list' ? 'list-view' : ''} ${inCart ? 'in-cart' : ''}`}
                            onClick={() => addToCart(prod)}
                          >
                            <div className="product-card-main">
                              <div className="product-card-image">
                                <Tag size={24} style={{ color: 'var(--primary)' }} />
                              </div>
                              <div className="product-card-info">
                                <span className="product-card-name">{prod.name}</span>
                                <span className="product-card-category">{prod.category}</span>
                              </div>
                            </div>
                            <div className="product-card-actions">
                              <span className="product-card-price">{formatCurrency(prod.price)}</span>
                              {inCart ? (
                                <div className="qty-inline">
                                  <button className="qty-btn-sm" onClick={(e) => { e.stopPropagation(); updateCartQty(prod.id, -1); }}>−</button>
                                  <span className="qty-value-sm">{inCart.quantity}</span>
                                  <button className="qty-btn-sm" onClick={(e) => { e.stopPropagation(); updateCartQty(prod.id, 1); }}>+</button>
                                </div>
                              ) : (
                                <button
                                  className="product-card-add"
                                  onClick={(e) => { e.stopPropagation(); addToCart(prod); }}
                                >
                                  <Plus size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* LADO DIREITO - CARRINHO */}
                <div className="pdv-right">
                  <div className="cart-section">
                    <div className="cart-header">
                      <h4><ShoppingCart size={18} /> Carrinho</h4>
                      {cartItems.length > 0 && (
                        <span className="cart-count">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
                      )}
                    </div>

                    {cartItems.length === 0 ? (
                      <div className="cart-empty">
                        <ShoppingCart size={48} />
                        <span>Carrinho vazio</span>
                        <p>Selecione produtos ao lado</p>
                      </div>
                    ) : (
                      <>
                        <div className="cart-items">
                          {cartItems.map(item => (
                            <div key={item.product_id} className="cart-item">
                              <div className="cart-item-info">
                                <span className="cart-item-name">{item.name}</span>
                                <span className="cart-item-unit-price">{formatCurrency(item.unit_price)} cada</span>
                              </div>
                              <div className="cart-item-qty">
                                <button className="qty-btn" onClick={() => updateCartQty(item.product_id, -1)}>−</button>
                                <span className="qty-value">{item.quantity}</span>
                                <button className="qty-btn" onClick={() => updateCartQty(item.product_id, 1)}>+</button>
                              </div>
                              <div className="cart-item-subtotal">
                                {formatCurrency(item.unit_price * item.quantity)}
                              </div>
                              <button className="cart-item-remove" onClick={() => removeFromCart(item.product_id)} title="Remover">
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="cart-summary">
                          <div className="cart-summary-row">
                            <span>Subtotal</span>
                            <span>{formatCurrency(cartSubtotal)}</span>
                          </div>
                          <div className="cart-summary-row">
                            <span>Taxa de Entrega</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={deliveryFee}
                              onChange={e => setFormData(prev => ({ ...prev, delivery_fee: Number(e.target.value) || 0 }))}
                              className="summary-input"
                            />
                          </div>
                          <div className="cart-summary-row">
                            <span>Desconto</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={discount}
                              onChange={e => setFormData(prev => ({ ...prev, discount: Number(e.target.value) || 0 }))}
                              className="summary-input"
                            />
                          </div>
                          <div className="cart-total">
                            <span>Total</span>
                            <span className="cart-total-value">{formatCurrency(cartTotal)}</span>
                          </div>
                        </div>
                      </>
                    )}

                    <button
                      className="btn-primary btn-submit"
                      onClick={handleSubmitOrder}
                      disabled={!formData.client_id || cartItems.length === 0 || submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={18} className="spinning" />
                          Criando...
                        </>
                      ) : (
                        <>
                          <Check size={18} />
                          Finalizar Pedido
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {pixModalOpen && selectedPixPayment && (
        <div className="modal-overlay" onClick={closePixModal}>
          <div className="modal-content modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><CreditCard size={16} /> Pagamento PIX</h3>
              <button className="btn-icon" onClick={closePixModal}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px', fontSize: 14, color: 'var(--text-secondary)' }}>Pedido: {selectedPixPayment.orderNumber}</p>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(selectedPixPayment.amount)}</p>
              </div>

              {selectedPixPayment.qr_code_base64 && (
                <div style={{ padding: 16, background: '#fff', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <img
                    src={`data:image/png;base64,${selectedPixPayment.qr_code_base64}`}
                    alt="QR Code PIX"
                    style={{ width: 200, height: 200, display: 'block' }}
                  />
                </div>
              )}

              {selectedPixPayment.pix_copia_cola && (
                <div style={{ width: '100%' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)' }}>PIX Copia e Cola</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      readOnly
                      value={selectedPixPayment.pix_copia_cola}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                        fontSize: 12,
                        fontFamily: 'monospace',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text)',
                      }}
                    />
                    <button className="btn-primary" onClick={copyPixCode} style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Copy size={14} /> Copiar
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  background: getPixStatusLabel(selectedPixPayment.status).bg,
                  color: getPixStatusLabel(selectedPixPayment.status).color,
                }}>
                  {getPixStatusLabel(selectedPixPayment.status).label}
                </span>
                {pixCountdown && selectedPixPayment.status !== 'pago' && (
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Expira em: {pixCountdown}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                <button
                  className="btn-primary"
                  onClick={checkPixStatus}
                  disabled={pixLoading}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <RefreshCw size={14} className={pixLoading ? 'spinning' : ''} />
                  {pixLoading ? 'Verificando...' : 'Verificar Status'}
                </button>
                <button
                  className="btn-cancel"
                  onClick={closePixModal}
                  style={{ flex: 1, background: 'var(--bg-secondary)', color: 'var(--text)', border: '1px solid var(--border)' }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}