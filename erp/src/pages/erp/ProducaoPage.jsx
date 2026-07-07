import { useState, useCallback, useMemo } from 'react';
import { Clock, Package, User, Flame, Truck, CheckCircle, XCircle, AlertTriangle, Loader2, RotateCcw } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import './ProducaoPage.css';

const STATUS_CONFIG = {
  recebido: { label: 'Recebido', color: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: Package, dotColor: '#6366f1' },
  em_producao: { label: 'Em Produção', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: Flame, dotColor: '#3b82f6' },
  pronto: { label: 'Pronto', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: CheckCircle, dotColor: '#10b981' },
  saindo_entrega: { label: 'Saiu para Entrega', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Truck, dotColor: '#f59e0b' },
  entregue: { label: 'Entregue', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: CheckCircle, dotColor: '#8b5cf6' },
  cancelado: { label: 'Cancelado', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: XCircle, dotColor: '#ef4444' },
};

const STATUS_FLOW = ['recebido', 'em_producao', 'pronto', 'saindo_entrega', 'entregue'];

const PRIORITY_CONFIG = {
  alta: { label: 'Alta', className: 'alta', color: '#ef4444' },
  media: { label: 'Média', className: 'media', color: '#f59e0b' },
  baixa: { label: 'Baixa', className: 'baixa', color: '#10b981' },
};

function getPriority(total) {
  if (total >= 60) return 'alta';
  if (total >= 35) return 'media';
  return 'baixa';
}

function getProductNames(order) {
  const items = order.items;
  if (!items || items.length === 0) return [];
  return items.map(item => item.name || 'Produto').filter(Boolean);
}

function formatCurrency(v) {
  return `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `${diffMin}min`;
  if (diffHours < 24) return `${diffHours}h`;
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function getTimeInStatus(order) {
  if (!order.updated_at) return 0;
  const updated = new Date(order.updated_at);
  const now = new Date();
  return Math.floor((now - updated) / 60000);
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

export default function ProducaoPage() {
  const { orders: allOrders, updateOrderStatus } = useData();
  const [viewMode, setViewMode] = useState('cards');
  const [refreshing, setRefreshing] = useState(false);

  const orders = useMemo(() =>
    allOrders
      .filter(o => o.status !== 'cancelado')
      .sort((a, b) => {
        const aIdx = STATUS_FLOW.indexOf(a.status);
        const bIdx = STATUS_FLOW.indexOf(b.status);
        if (aIdx !== bIdx) return aIdx - bIdx;
        return new Date(a.created_at) - new Date(b.created_at);
      }),
  [allOrders]);

  const grouped = useMemo(() => {
    const groups = {};
    STATUS_FLOW.forEach(s => groups[s] = []);
    orders.forEach(order => {
      if (groups[order.status]) {
        groups[order.status].push(order);
      } else {
        groups.recebido.push(order);
      }
    });
    return groups;
  }, [orders]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleStatusChange = useCallback((orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
  }, [updateOrderStatus]);

  const getNextStatus = (currentStatus) => {
    const idx = STATUS_FLOW.indexOf(currentStatus);
    if (idx >= 0 && idx < STATUS_FLOW.length - 1) return STATUS_FLOW[idx + 1];
    return null;
  };

  const getPrevStatus = (currentStatus) => {
    const idx = STATUS_FLOW.indexOf(currentStatus);
    if (idx > 0) return STATUS_FLOW[idx - 1];
    return null;
  };

  const stats = useMemo(() => ({
    recebido: grouped.recebido?.length || 0,
    em_producao: grouped.em_producao?.length || 0,
    pronto: grouped.pronto?.length || 0,
    saindo_entrega: grouped.saindo_entrega?.length || 0,
    entregue: grouped.entregue?.length || 0,
    total: orders.length,
  }), [grouped, orders.length]);

  return (
    <div className="producao-page">
      {/* Header */}
      <div className="producao-header">
        <div>
          <h1>Produção</h1>
          <p>Controle de produção em tempo real — {stats.total} pedidos ativos</p>
        </div>
        <div className="producao-header-right">
          <div className="view-toggle">
            <button
              className={viewMode === 'cards' ? 'active' : ''}
              onClick={() => setViewMode('cards')}
              title="Visualização em Cards"
            >
              <Package size={16} />
            </button>
            <button
              className={viewMode === 'kanban' ? 'active' : ''}
              onClick={() => setViewMode('kanban')}
              title="Visualização Kanban"
            >
              <RotateCcw size={16} />
            </button>
          </div>
          <button className="btn-primary" onClick={handleRefresh} disabled={refreshing} style={{ padding: '8px 16px' }}>
            <Loader2 size={16} className={refreshing ? 'spinning' : ''} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="producao-stats">
        <div className="stat-item recebido">
          <span className="stat-count">{stats.recebido}</span>
          <span className="stat-label">Recebidos</span>
        </div>
        <div className="stat-item em_producao">
          <span className="stat-count">{stats.em_producao}</span>
          <span className="stat-label">Em Produção</span>
        </div>
        <div className="stat-item pronto">
          <span className="stat-count">{stats.pronto}</span>
          <span className="stat-label">Prontos</span>
        </div>
        <div className="stat-item saindo_entrega">
          <span className="stat-count">{stats.saindo_entrega}</span>
          <span className="stat-label">Saindo</span>
        </div>
        <div className="stat-item entregue">
          <span className="stat-count">{stats.entregue}</span>
          <span className="stat-label">Entregues</span>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="producao-cards-grid">
          {STATUS_FLOW.map(status => {
            const columnOrders = grouped[status] || [];
            const config = STATUS_CONFIG[status];
            return (
              <div key={status} className="producao-column">
                <div className="producao-column-header" style={{ borderLeftColor: config.dotColor }}>
                  <div className="column-header-left">
                    <div className="column-dot" style={{ background: config.dotColor }} />
                    <h3 className="column-title">{config.label}</h3>
                  </div>
                  <span className="column-count">{columnOrders.length}</span>
                </div>
                <div className="producao-cards-list">
                  {columnOrders.length === 0 ? (
                    <div className="column-empty">
                      <Package size={32} />
                      <span>Nenhum pedido</span>
                    </div>
                  ) : (
                    columnOrders.map(order => {
                      const products = getProductNames(order);
                      const priority = getPriority(Number(order.total || 0));
                      const priorityCfg = PRIORITY_CONFIG[priority];
                      const timeInStatus = getTimeInStatus(order);
                      const config = STATUS_CONFIG[order.status] || STATUS_CONFIG[status];
                      const nextStatus = getNextStatus(order.status);
                      const prevStatus = getPrevStatus(order.status);

                      return (
                        <article
                          key={order.id}
                          className={`producao-card ${priorityCfg.className}`}
                          style={{ borderLeftColor: config.dotColor }}
                        >
                          {/* Header do Card */}
                          <div className="card-header">
                            <div className="card-id">
                              <span className="order-number">{order.order_number}</span>
                              <span className="card-status" style={{ background: config.bg, color: config.color }}>
                                <config.icon size={12} />
                                {config.label}
                              </span>
                            </div>
                            <span className={`card-priority priority-${priorityCfg.className}`}>{priorityCfg.label}</span>
                          </div>

                          {/* Cliente */}
                          <div className="card-client">
                            <User size={14} />
                            <span>{order.client_name || 'Cliente não informado'}</span>
                          </div>

                          {/* Tempo no status atual */}
                          <div className="card-timer">
                            <Clock size={12} />
                            <span className="timer-value">{formatDuration(timeInStatus)}</span>
                            <span className="timer-label">no status</span>
                            {timeInStatus > 30 && (
                              <AlertTriangle size={12} className="timer-warning" title={`Atenção: ${formatDuration(timeInStatus)} neste status`} />
                            )}
                          </div>

                          {/* Produtos */}
                          {products.length > 0 && (
                            <div className="card-products">
                              {products.slice(0, 4).map((name, i) => (
                                <span key={i} className="product-tag">{name}</span>
                              ))}
                              {products.length > 4 && (
                                <span className="product-tag more">+{products.length - 4}</span>
                              )}
                            </div>
                          )}

                          {/* Valor e Horário */}
                          <div className="card-footer">
                            <div className="card-value">{formatCurrency(order.total)}</div>
                            <div className="card-time">
                              <Clock size={12} />
                              {formatTime(order.created_at)}
                            </div>
                          </div>

                          {/* Ações */}
                          <div className="card-actions">
                            {prevStatus && (
                              <button
                                className="action-btn prev"
                                onClick={() => handleStatusChange(order.id, prevStatus)}
                                title="Voltar status"
                              >
                                <RotateCcw size={14} />
                              </button>
                            )}
                            <div className="action-divider" />
                            {nextStatus ? (
                              <button
                                className="action-btn next primary"
                                onClick={() => handleStatusChange(order.id, nextStatus)}
                                title={`Avançar para ${STATUS_CONFIG[nextStatus].label}`}
                              >
                                <config.icon size={14} />
                                <span>Avançar</span>
                              </button>
                            ) : (
                              <span className="action-completed">
                                <CheckCircle size={14} />
                                <span>Concluído</span>
                              </span>
                            )}
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="kanban-board">
          {STATUS_FLOW.map(status => {
            const columnOrders = grouped[status] || [];
            const config = STATUS_CONFIG[status];
            return (
              <div
                key={status}
                className="kanban-column"
                style={{ borderTopColor: config.dotColor }}
              >
                <div className="kanban-column-header" style={{ background: `linear-gradient(135deg, ${config.dotColor}, ${config.dotColor}dd)` }}>
                  <div className="kanban-column-title">
                    <span className="kanban-column-dot" style={{ background: '#fff' }} />
                    {config.label}
                  </div>
                  <span className="kanban-column-count">{columnOrders.length}</span>
                </div>
                <div className="kanban-cards">
                  {columnOrders.length === 0 ? (
                    <div className="kanban-empty">
                      <Package size={24} />
                      <span>Nenhum pedido</span>
                    </div>
                  ) : (
                    columnOrders.map(order => {
                      const products = getProductNames(order);
                      const priority = getPriority(Number(order.total || 0));
                      const priorityCfg = PRIORITY_CONFIG[priority];
                      const timeInStatus = getTimeInStatus(order);
                      const nextStatus = getNextStatus(order.status);

                      return (
                        <div
                          key={order.id}
                          className={`kanban-card ${priorityCfg.className}`}
                          style={{ borderLeftColor: config.dotColor }}
                        >
                          <div className="kanban-card-header">
                            <span className="kanban-card-op">{order.order_number}</span>
                            <span className={`card-priority priority-${priorityCfg.className}`}>{priorityCfg.label}</span>
                          </div>
                          <div className="kanban-card-client">{order.client_name}</div>
                          <div className="kanban-card-timer">
                            <Clock size={11} />
                            <span>{formatDuration(timeInStatus)}</span>
                            {timeInStatus > 30 && <AlertTriangle size={11} className="timer-warning" />}
                          </div>
                          {products.length > 0 && (
                            <div className="kanban-card-products">
                              {products.slice(0, 3).map((name, i) => (
                                <span key={i} className="kanban-card-product-tag">{name}</span>
                              ))}
                              {products.length > 3 && <span className="kanban-card-product-more">+{products.length - 3}</span>}
                            </div>
                          )}
                          <div className="kanban-card-footer">
                            <span className="kanban-card-value">{formatCurrency(order.total)}</span>
                            {nextStatus && (
                              <button
                                className="kanban-advance-btn"
                                onClick={() => handleStatusChange(order.id, nextStatus)}
                                title={`Avançar para ${STATUS_CONFIG[nextStatus].label}`}
                              >
                                <config.icon size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}