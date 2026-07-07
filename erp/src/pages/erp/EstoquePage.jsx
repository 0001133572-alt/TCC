import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, X, Search, ArrowUpDown, History } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import './EstoquePage.css';

export default function EstoquePage() {
  const { stock, adjustStock, checkLowStock } = useData();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [showMovements, setShowMovements] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('entrada');
  const [formQty, setFormQty] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (stock !== undefined) setLoading(false);
  }, [stock]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const openMovement = (item, type) => {
    setSelectedProduct(item);
    setModalType(type);
    setFormQty('');
    setFormDesc('');
    setModalOpen(true);
  };

  const handleSaveMovement = () => {
    if (!formQty || Number(formQty) <= 0 || !selectedProduct) return;
    const qty = Number(formQty);
    const desc = formDesc || (modalType === 'entrada' ? 'Ajuste manual' : 'Retirada manual');

    adjustStock(selectedProduct.product_id, qty, modalType);

    const newMovement = {
      id: Date.now(),
      type: modalType,
      quantity: qty,
      description: desc,
      product_name: selectedProduct.name || 'Produto',
      created_at: new Date().toISOString(),
    };

    setMovements(prev => [newMovement, ...prev]);
    setModalOpen(false);
  };

  const lowStockItems = checkLowStock();
  const lowStockIds = new Set(lowStockItems.map(item => item.product_id));

  const filtered = stock
    .filter(item => {
      const name = (item.name || '').toLowerCase();
      return name.includes(search.toLowerCase());
    })
    .sort((a, b) => {
      let va, vb;
      if (sortField === 'name') {
        va = (a.name || '').toLowerCase();
        vb = (b.name || '').toLowerCase();
      } else if (sortField === 'quantity') {
        va = a.quantity;
        vb = b.quantity;
      }
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const SortIcon = ({ field }) => (
    <ArrowUpDown size={12} className={`sort-icon${sortField === field ? ' active' : ''}`} />
  );

  return (
    <div className="estoque-page">
      <div className="estoque-header">
        <div>
          <h1>Estoque</h1>
          <p>{loading ? 'Carregando...' : `${stock.length} produtos cadastrados`}</p>
        </div>
        <div className="estoque-header-actions">
          <button
            className={`estoque-btn ${showMovements ? 'active' : ''}`}
            onClick={() => setShowMovements(!showMovements)}
          >
            <History size={16} />
            Movimentações
          </button>
        </div>
      </div>

      <div className="estoque-search">
        <Search size={16} />
        <input
          type="text"
          placeholder="Buscar produto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && <X size={16} className="clear-btn" onClick={() => setSearch('')} />}
      </div>

      {loading ? (
        <div className="estoque-loading">
          {Array.from({ length: 5 }, (_, i) => <div key={i} className="estoque-skeleton-row" />)}
        </div>
      ) : (
        <>
          <div className="estoque-table-wrapper">
            <table className="estoque-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')} className="sortable">
                    Produto <SortIcon field="name" />
                  </th>
                  <th onClick={() => handleSort('quantity')} className="sortable">
                    Quantidade <SortIcon field="quantity" />
                  </th>
                  <th>Est. Mínimo</th>
                  <th>Unidade</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="estoque-empty">
                      <Package size={32} />
                      <p>Nenhum produto encontrado</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(item => {
                    const minStock = item.min_stock ?? 10;
                    const isLow = item.quantity <= minStock;
                    const isCritical = item.quantity <= 3;
                    return (
                      <tr key={item.id} className={isLow ? 'row-low' : ''}>
                        <td className="product-cell">
                          <div className="product-icon">
                            <Package size={16} color={isLow ? '#ef4444' : '#fc6901'} />
                          </div>
                          <span>{item.name || 'Produto sem nome'}</span>
                        </td>
                        <td className={`qty-cell ${isLow ? 'low' : ''} ${isCritical ? 'critical' : ''}`}>
                          {item.quantity}
                        </td>
                        <td className="min-stock-cell">{minStock}</td>
                        <td className="unit-cell">{item.unit || 'un'}</td>
                        <td>
                          <span className={`stock-badge ${isCritical ? 'critical' : isLow ? 'low' : 'ok'}`}>
                            {isCritical ? 'Crítico' : isLow ? 'Baixo' : 'Normal'}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button
                            className="action-btn entrada"
                            title="Registrar entrada"
                            onClick={() => openMovement(item, 'entrada')}
                          >
                            + Entrada
                          </button>
                          <button
                            className="action-btn saida"
                            title="Registrar saída"
                            onClick={() => openMovement(item, 'saida')}
                          >
                            - Saída
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {showMovements && (
            <div className="estoque-movements">
              <h3>Movimentações Recentes</h3>
              <div className="movements-list">
                {movements.length === 0 ? (
                  <p className="movements-empty">Nenhuma movimentação registrada</p>
                ) : (
                  movements.map(mov => (
                    <div key={mov.id} className={`movement-item ${mov.type}`}>
                      <div className="movement-icon">
                        {mov.type === 'entrada' ? '⬆' : '⬇'}
                      </div>
                      <div className="movement-info">
                        <strong>{mov.product_name || 'Produto'}</strong>
                        <span>{mov.description || '—'}</span>
                      </div>
                      <div className={`movement-qty ${mov.type}`}>
                        {mov.type === 'entrada' ? '+' : ''}{mov.quantity}
                      </div>
                      <div className="movement-date">
                        {new Date(mov.created_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <div className="movement-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="movement-modal" onClick={e => e.stopPropagation()}>
            <div className="movement-modal-header">
              <h3>{modalType === 'entrada' ? 'Registrar Entrada' : 'Registrar Saída'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <div className="movement-modal-body">
              <p className="modal-product-name">
                <strong>Produto:</strong> {selectedProduct?.name || 'Produto'}
              </p>
              <p className="modal-current-qty">
                <strong>Estoque atual:</strong> {selectedProduct?.quantity || 0} unidades
              </p>
              <div className="form-group">
                <label>Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={formQty}
                  onChange={e => setFormQty(e.target.value)}
                  placeholder="0"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Descrição (opcional)</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder={modalType === 'entrada' ? 'Compra de insumos...' : 'Retirada para produção...'}
                />
              </div>
            </div>
            <div className="movement-modal-footer">
              <button className="btn-cancel" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button
                className={`btn-confirm ${modalType}`}
                onClick={handleSaveMovement}
                disabled={!formQty || Number(formQty) <= 0 || saving}
              >
                {saving ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
