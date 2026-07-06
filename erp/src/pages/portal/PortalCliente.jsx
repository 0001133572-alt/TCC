import { useState, useEffect, useRef, useMemo } from 'react';
import './PortalCliente.css';
import {
  Search,
  ShoppingCart,
  X,
  Plus,
  Minus,
  Clock,
  MapPin,
  Phone,
  CreditCard,
  Banknote,
  Smartphone,
  ChevronRight,
  Check,
  Package,
  Star,
  Flame,
  Trash2,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'todos', name: 'Todos', icon: '🍽️' },
  { id: 'hamburgueres', name: 'Hambúrgueres', icon: '🍔' },
  { id: 'pizzas', name: 'Pizzas', icon: '🍕' },
  { id: 'bebidas', name: 'Bebidas', icon: '🥤' },
  { id: 'porcoes', name: 'Porções', icon: '🍟' },
  { id: 'sobremesas', name: 'Sobremesas', icon: '🍰' },
  { id: 'lanches', name: 'Lanches', icon: '🌮' },
];

const PRODUCTS = [
  {
    id: 1,
    name: 'X-Bacon Especial',
    description: 'Pão brioche, hambúrguer artesanal 180g, queijo cheddar, bacon crocante, alface, tomate e molho especial da casa.',
    price: 32.90,
    old_price: null,
    category: 'hamburgueres',
    prep_time: '15-20 min',
    ingredients: ['Pão Brioche', 'Hambúrguer 180g', 'Cheddar', 'Bacon', 'Alface', 'Tomate', 'Molho Especial'],
  },
  {
    id: 2,
    name: 'Combo Família',
    description: '4 hambúrgueres clássicos, 2 batatas grandes, 4 refris 600ml e 2 milk shakes. Perfeito para dividir em família!',
    price: 89.90,
    old_price: 110.00,
    category: 'hamburgueres',
    prep_time: '25-30 min',
    ingredients: ['4x Hambúrguer Clássico', '2x Batata Grande', '4x Refri 600ml', '2x Milk Shake'],
  },
  {
    id: 3,
    name: 'X-Tudo Premium',
    description: 'Pão australiano, hambúrguer duplo 180g, queijo provolone, ovo, presunto, bacon, milho, ervilha e maionese temperada.',
    price: 38.90,
    old_price: null,
    category: 'hamburgueres',
    prep_time: '18-22 min',
    ingredients: ['Pão Australiano', '2x Hambúrguer 180g', 'Provolone', 'Ovo', 'Presunto', 'Bacon', 'Milho', 'Ervilha'],
  },
  {
    id: 4,
    name: 'Smash Burger',
    description: 'Dois smash de carne 80g, queijo cheddar derretido, cebola caramelizada e molho especial em pão brioche.',
    price: 29.90,
    old_price: 34.90,
    category: 'hamburgueres',
    prep_time: '12-15 min',
    ingredients: ['Pão Brioche', '2x Smash 80g', 'Cheddar', 'Cebola Caramelizada', 'Molho Especial'],
  },
  {
    id: 5,
    name: 'Pizza Margherita',
    description: 'Massa artesanal fina, molho de tomate San Marzano, muzzarella de búfala, manjericão fresco e azeite extra virgem.',
    price: 45.90,
    old_price: null,
    category: 'pizzas',
    prep_time: '20-25 min',
    ingredients: ['Massa Artesanal', 'Molho San Marzano', 'Muzza Búfala', 'Manjericão', 'Azeite'],
  },
  {
    id: 6,
    name: 'Pizza 4 Queijos',
    description: 'Massa crocante com molho branco, muzzarella, gorgonzola, provolone e parmesão. Para os amantes de queijo!',
    price: 49.90,
    old_price: null,
    category: 'pizzas',
    prep_time: '20-25 min',
    ingredients: ['Massa Crocante', 'Molho Branco', 'Muzza', 'Gorgonzola', 'Provolone', 'Parmesão'],
  },
  {
    id: 7,
    name: 'Pizza Calabresa',
    description: 'Molho de tomate artesanal, calabresa fatiada, cebola roxa, azeitonas pretas e oregano fresco.',
    price: 42.90,
    old_price: 48.90,
    category: 'pizzas',
    prep_time: '18-22 min',
    ingredients: ['Massa Artesanal', 'Molho de Tomate', 'Calabresa', 'Cebola Roxa', 'Azeitona', 'Oregano'],
  },
  {
    id: 8,
    name: 'Coca-Cola 2L',
    description: 'Coca-Cola gelada garrafa de 2 litros. Perfeita para acompanhar seu pedido.',
    price: 14.90,
    old_price: null,
    category: 'bebidas',
    prep_time: '2-5 min',
    ingredients: ['Coca-Cola 2L'],
  },
  {
    id: 9,
    name: 'Suco Natural Laranja',
    description: 'Suco de laranja natural feito na hora, sem adição de açúcar. 500ml.',
    price: 12.90,
    old_price: null,
    category: 'bebidas',
    prep_time: '5-8 min',
    ingredients: ['Laranja Natural', 'Gelo'],
  },
  {
    id: 10,
    name: 'Milk Shake Artesanal',
    description: 'Milk shake cremoso feito com sorvete artesanal. Sabores: chocolate, morango, baunilha ou nutella com morango.',
    price: 18.90,
    old_price: null,
    category: 'sobremesas',
    prep_time: '8-12 min',
    ingredients: ['Sorvete Artesanal', 'Leite', 'Calha do Sabor Escolhido'],
  },
  {
    id: 11,
    name: 'Batata Frita Grande',
    description: 'Batata frita crocante por fora, macia por dentro, temperada com sal rosa e ervas finas. Porção grande.',
    price: 22.90,
    old_price: null,
    category: 'porcoes',
    prep_time: '12-15 min',
    ingredients: ['Batata', 'Sal Rosa', 'Ervas Finas', 'Óleo'],
  },
  {
    id: 12,
    name: 'Onion Rings',
    description: 'Anéis de cebola empanados e crocantes, acompanham molho ranch caseiro. 15 unidades.',
    price: 26.90,
    old_price: 30.90,
    category: 'porcoes',
    prep_time: '10-14 min',
    ingredients: ['Cebola', 'Farinha Panko', 'Molho Ranch'],
  },
  {
    id: 13,
    name: 'Frango com Milho',
    description: 'Porção generosa de frango desfiado temperado com milho, cebola, pimentão e queijo gratinado.',
    price: 34.90,
    old_price: null,
    category: 'porcoes',
    prep_time: '15-18 min',
    ingredients: ['Frango Desfiado', 'Milho', 'Cebola', 'Pimentão', 'Queijo'],
  },
  {
    id: 14,
    name: 'Brownie com Sorvete',
    description: 'Brownie de chocolate meio amargo quentinho com bola de sorvete de creme por cima e calda de chocolate belga.',
    price: 24.90,
    old_price: null,
    category: 'sobremesas',
    prep_time: '8-10 min',
    ingredients: ['Brownie Chocolate', 'Sorvete Creme', 'Calda Chocolate Belga'],
  },
  {
    id: 15,
    name: 'Taco Mexicano',
    description: 'Taco recheado com carne moída temperada, queijo derretido, alface, tomate, creme de leite e guacamole.',
    price: 19.90,
    old_price: null,
    category: 'lanches',
    prep_time: '12-15 min',
    ingredients: ['Tortilha', 'Carne Moída', 'Queijo', 'Alface', 'Tomate', 'Creme de Leite', 'Guacamole'],
  },
  {
    id: 16,
    name: 'Hot Dog Especial',
    description: 'Cachorro quente completo com salsicha premium, purê de batata, milho, ervilha, queijo ralado e molho da casa.',
    price: 21.90,
    old_price: null,
    category: 'lanches',
    prep_time: '10-12 min',
    ingredients: ['Pão Hot Dog', 'Salsicha Premium', 'Purê de Batata', 'Milho', 'Ervilha', 'Queijo', 'Molho Especial'],
  },
  {
    id: 17,
    name: 'Coxinha de Frango',
    description: 'Coxinha cremosa de frango com catupiry, empanada e frita na hora. 6 unidades.',
    price: 18.90,
    old_price: null,
    category: 'lanches',
    prep_time: '12-15 min',
    ingredients: ['Massa Caseira', 'Frango Desfiado', 'Catupiry', 'Farinha de Rosca'],
  },
  {
    id: 18,
    name: 'Guaraná Antarctica 2L',
    description: 'Guaraná Antarctica gelado garrafa de 2 litros. O clássico para acompanhar o lanche.',
    price: 12.90,
    old_price: null,
    category: 'bebidas',
    prep_time: '2-5 min',
    ingredients: ['Guaraná Antarctica 2L'],
  },
  {
    id: 19,
    name: 'Água Mineral 500ml',
    description: 'Água mineral sem gás. Gelada e refrescante.',
    price: 5.90,
    old_price: null,
    category: 'bebidas',
    prep_time: '1-2 min',
    ingredients: ['Água Mineral'],
  },
  {
    id: 20,
    name: 'Pudim de Leite',
    description: 'Pudim de leite condensado caseiro com calda de caramelo. Fatia generosa.',
    price: 16.90,
    old_price: null,
    category: 'sobremesas',
    prep_time: '3-5 min',
    ingredients: ['Leite Condensado', 'Leite', 'Ovos', 'Calda Caramelo'],
  },
];

const PROMOS = [
  { id: 1, title: 'Combo Família', subtitle: 'Para 4 pessoas com economia de R$ 20', color: '#7b4b34' },
  { id: 2, title: 'X-Bacon Especial', subtitle: 'O melhor bacon da cidade com 15% OFF', color: '#fc6901' },
  { id: 3, title: 'Frete Grátis', subtitle: 'Acima de R$ 50,00 a entrega é por nossa conta', color: '#10b981' },
];

const CATEGORY_GRADIENTS = {
  hamburgueres: 'linear-gradient(135deg, #fc6901, #e55a00)',
  pizzas: 'linear-gradient(135deg, #ef4444, #dc2626)',
  bebidas: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  porcoes: 'linear-gradient(135deg, #f59e0b, #d97706)',
  sobremesas: 'linear-gradient(135deg, #ec4899, #db2777)',
  lanches: 'linear-gradient(135deg, #10b981, #059669)',
};

const CATEGORY_ICONS = {
  hamburgueres: '🍔',
  pizzas: '🍕',
  bebidas: '🥤',
  porcoes: '🍟',
  sobremesas: '🍰',
  lanches: '🌮',
};

function formatCurrency(value) {
  return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
}

function getDiscount(price, oldPrice) {
  if (!oldPrice) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export default function PortalCliente() {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalQty, setModalQty] = useState(1);
  const [modalNote, setModalNote] = useState('');
  const [step, setStep] = useState('menu');
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    address: '',
    number: '',
    complement: '',
    payment: 'pix',
    notes: '',
  });
  const [promoIndex, setPromoIndex] = useState(0);
  const [orderStatusStep, setOrderStatusStep] = useState(0);
  const [bumpBadge, setBumpBadge] = useState(false);

  const cartRef = useRef(null);

  // Auto-rotate promo banners
  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % PROMOS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Order status auto-advance
  useEffect(() => {
    if (step !== 'status') return;
    setOrderStatusStep(0);
    const t1 = setTimeout(() => setOrderStatusStep(1), 3000);
    const t2 = setTimeout(() => setOrderStatusStep(2), 6000);
    const t3 = setTimeout(() => setOrderStatusStep(3), 9000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [step]);

  const filteredProducts = useMemo(() => {
    let items = PRODUCTS;
    if (activeCategory !== 'todos') {
      items = items.filter((p) => p.category === activeCategory);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
      );
    }
    return items;
  }, [activeCategory, searchTerm]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

  const deliveryFee = cartTotal >= 50 ? 0 : 5.99;
  const cartDiscount = useMemo(() => {
    return cart.reduce((sum, item) => {
      if (item.product.old_price) {
        return sum + (item.product.old_price - item.product.price) * item.qty;
      }
      return sum;
    }, 0);
  }, [cart]);
  const orderTotal = cartTotal + deliveryFee;

  function openProductModal(product) {
    setSelectedProduct(product);
    setModalQty(1);
    setModalNote('');
  }

  function closeProductModal() {
    setSelectedProduct(null);
    setModalQty(1);
    setModalNote('');
  }

  function addToCart() {
    if (!selectedProduct) return;
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === selectedProduct.id && item.note === modalNote
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === selectedProduct.id && item.note === modalNote
            ? { ...item, qty: item.qty + modalQty }
            : item
        );
      }
      return [...prev, { product: selectedProduct, qty: modalQty, note: modalNote }];
    });
    closeProductModal();
    setBumpBadge(true);
    setTimeout(() => setBumpBadge(false), 300);
  }

  function updateCartQty(index, delta) {
    setCart((prev) =>
      prev
        .map((item, i) =>
          i === index ? { ...item, qty: item.qty + delta } : item
        )
        .filter((item) => item.qty > 0)
    );
  }

  function removeCartItem(index) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  function handleCheckout() {
    setCartOpen(false);
    setStep('checkout');
  }

  function handleConfirmOrder() {
    setStep('status');
  }

  function handleBackToMenu() {
    setStep('menu');
    setCart([]);
    setCheckoutForm({
      name: '',
      phone: '',
      address: '',
      number: '',
      complement: '',
      payment: 'pix',
      notes: '',
    });
  }

  function updateCheckoutForm(field, value) {
    setCheckoutForm((prev) => ({ ...prev, [field]: value }));
  }

  const ORDER_STEPS = [
    { label: 'Pedido Recebido', time: 'Agora' },
    { label: 'Em Produção', time: 'Preparando...' },
    { label: 'Saiu para Entrega', time: 'A caminho' },
    { label: 'Entregue', time: '' },
  ];

  if (step === 'status') {
    return (
      <div className="portal-page">
        <div className="portal-header">
          <div className="portal-header-brand">
            <span className="portal-header-name">
              Burger<span>Shop</span>
            </span>
          </div>
        </div>
        <div className="order-status-page">
          <div className="order-status-header">
            <div className="order-status-icon">🍔</div>
            <h2 className="order-status-title">Pedido Confirmado!</h2>
            <p className="order-status-subtitle">
              Seu pedido está sendo preparado com carinho
            </p>
            <span className="order-status-number">#12345</span>
          </div>
          <div className="order-progress">
            <h3 className="order-progress-title">Acompanhe seu pedido</h3>
            {ORDER_STEPS.map((s, i) => {
              let status = 'pending';
              if (i < orderStatusStep) status = 'completed';
              else if (i === orderStatusStep) status = 'active';

              return (
                <div key={i} className={`order-step ${status}`}>
                  <div className="order-step-dot-wrapper">
                    <div className="order-step-dot">
                      {status === 'completed' ? <Check /> : status === 'active' ? <Flame size={18} /> : <Package size={18} />}
                    </div>
                    {i < ORDER_STEPS.length - 1 && <div className="order-step-line" />}
                  </div>
                  <div className="order-step-content">
                    <p className="order-step-label">{s.label}</p>
                    {status === 'completed' && (
                      <p className="order-step-time">✓ Concluído</p>
                    )}
                    {status === 'active' && (
                      <p className="order-step-time">● Em andamento...</p>
                    )}
                    {status === 'pending' && s.time && (
                      <p className="order-step-time">{s.time}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <button className="cart-checkout-btn" style={{ marginTop: 24 }} onClick={handleBackToMenu}>
            Voltar ao Cardápio
          </button>
        </div>
      </div>
    );
  }

  if (step === 'checkout') {
    return (
      <div className="portal-page">
        <div className="portal-header">
          <div className="portal-header-brand">
            <button
              onClick={() => setStep('menu')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Voltar</span>
            </button>
          </div>
          <span className="portal-header-name">
            Burger<span>Shop</span>
          </span>
          <div className="portal-header-actions" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          <div className="checkout-form">
            <h2 className="checkout-form-title">Finalizar Pedido</h2>

            <div className="checkout-form-group">
              <label className="checkout-form-label">Nome Completo</label>
              <input
                className="checkout-form-input"
                type="text"
                placeholder="Seu nome completo"
                value={checkoutForm.name}
                onChange={(e) => updateCheckoutForm('name', e.target.value)}
              />
            </div>

            <div className="checkout-form-group">
              <label className="checkout-form-label">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Phone size={14} /> Telefone
                </span>
              </label>
              <input
                className="checkout-form-input"
                type="tel"
                placeholder="(11) 99999-9999"
                value={checkoutForm.phone}
                onChange={(e) => updateCheckoutForm('phone', e.target.value)}
              />
            </div>

            <div className="checkout-form-group">
              <label className="checkout-form-label">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} /> Endereço
                </span>
              </label>
              <input
                className="checkout-form-input"
                type="text"
                placeholder="Rua, Avenida..."
                value={checkoutForm.address}
                onChange={(e) => updateCheckoutForm('address', e.target.value)}
              />
            </div>

            <div className="checkout-form-row">
              <div className="checkout-form-group">
                <label className="checkout-form-label">Número</label>
                <input
                  className="checkout-form-input"
                  type="text"
                  placeholder="Nº"
                  value={checkoutForm.number}
                  onChange={(e) => updateCheckoutForm('number', e.target.value)}
                />
              </div>
              <div className="checkout-form-group">
                <label className="checkout-form-label">Complemento</label>
                <input
                  className="checkout-form-input"
                  type="text"
                  placeholder="Apto, Bloco..."
                  value={checkoutForm.complement}
                  onChange={(e) => updateCheckoutForm('complement', e.target.value)}
                />
              </div>
            </div>

            <div className="checkout-form-group">
              <label className="checkout-form-label">Observações</label>
              <textarea
                className="checkout-form-textarea"
                placeholder="Alguma observação para o pedido? (ex: sem cebola, ponto da carne...)"
                value={checkoutForm.notes}
                onChange={(e) => updateCheckoutForm('notes', e.target.value)}
              />
            </div>

            <div className="checkout-payment">
              <h4 className="checkout-payment-title">Forma de Pagamento</h4>
              <div className="checkout-payment-options">
                {[
                  { id: 'pix', name: 'PIX', desc: 'Aprovação instantânea', icon: <Smartphone size={20} />, iconClass: 'pix' },
                  { id: 'cash', name: 'Dinheiro', desc: 'Pagamento na entrega', icon: <Banknote size={20} />, iconClass: 'cash' },
                  { id: 'card', name: 'Cartão', desc: 'Crédito ou débito na entrega', icon: <CreditCard size={20} />, iconClass: 'card' },
                ].map((method) => (
                  <div
                    key={method.id}
                    className={`checkout-payment-option ${checkoutForm.payment === method.id ? 'selected' : ''}`}
                    onClick={() => updateCheckoutForm('payment', method.id)}
                  >
                    <div className="checkout-payment-radio" />
                    <div className={`checkout-payment-icon ${method.iconClass}`}>{method.icon}</div>
                    <div className="checkout-payment-info">
                      <div className="checkout-payment-name">{method.name}</div>
                      <div className="checkout-payment-desc">{method.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="checkout-confirm-btn" onClick={handleConfirmOrder}>
              <Check size={20} />
              Confirmar Pedido
            </button>
          </div>

          <div style={{ background: 'var(--bg-secondary, #fff)', border: '1px solid var(--border, #e8dfd7)', borderRadius: 'var(--radius-lg, 16px)', padding: 24, position: 'sticky', top: 88 }}>
            <h3 style={{ fontFamily: 'var(--font-display, Poppins)', fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary, #2d241e)' }}>
              Resumo do Pedido
            </h3>
            {cart.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border, #e8dfd7)' }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary, #7a6a5e)' }}>
                  {item.qty}x {item.product.name}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary, #2d241e)' }}>
                  {formatCurrency(item.product.price * item.qty)}
                </span>
              </div>
            ))}
            <div style={{ marginTop: 12 }}>
              <div className="cart-summary-row">
                <span className="cart-summary-label">Subtotal</span>
                <span className="cart-summary-value">{formatCurrency(cartTotal)}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="cart-summary-row discount">
                  <span className="cart-summary-label">Desconto</span>
                  <span className="cart-summary-value">-{formatCurrency(cartDiscount)}</span>
                </div>
              )}
              <div className="cart-summary-row">
                <span className="cart-summary-label">Taxa de entrega</span>
                <span className="cart-summary-value">
                  {deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee)}
                </span>
              </div>
              {deliveryFee === 0 && (
                <p className="cart-summary-delivery-note">Frete grátis acima de R$ 50,00</p>
              )}
              <div className="cart-summary-row total">
                <span className="cart-summary-label">Total</span>
                <span className="cart-summary-value">{formatCurrency(orderTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-page">
      {/* Header */}
      <div className="portal-header">
        <div className="portal-header-brand">
          <span className="portal-header-name">
            Burger<span>Shop</span>
          </span>
        </div>
        <div className="portal-header-actions">
          <button className="portal-cart-btn" onClick={() => setCartOpen(true)}>
            <ShoppingCart />
            {cartItemCount > 0 && (
              <span className={`portal-cart-badge ${bumpBadge ? 'bump' : ''}`}>{cartItemCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="portal-hero" style={{ background: PROMOS[promoIndex].color }}>
        <div className="portal-hero-overlay" />
        <div className="portal-hero-content">
          <span className="portal-hero-tag">
            <Flame size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Promoção
          </span>
          <h1 className="portal-hero-title">{PROMOS[promoIndex].title}</h1>
          <p className="portal-hero-subtitle">{PROMOS[promoIndex].subtitle}</p>
          <button className="portal-hero-cta" onClick={() => document.querySelector('.portal-search-input')?.focus()}>
            Ver Cardápio <ChevronRight size={18} />
          </button>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {PROMOS.map((_, i) => (
              <button
                key={i}
                onClick={() => setPromoIndex(i)}
                style={{
                  width: i === promoIndex ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === promoIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="portal-categories">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className={`category-card ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <div className="category-card-icon">{cat.icon}</div>
            <span className="category-card-label">{cat.name}</span>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="portal-search">
        <div className="portal-search-icon">
          <Search />
        </div>
        <input
          className="portal-search-input"
          type="text"
          placeholder="Buscar no cardápio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-tertiary, #b0a296)' }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>🔍</div>
          <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px', color: 'var(--text-secondary, #7a6a5e)' }}>
            Nenhum item encontrado
          </p>
          <p style={{ fontSize: 13, margin: 0 }}>
            Tente buscar por outro nome ou categoria
          </p>
        </div>
      ) : (
        <div className="portal-products-grid">
          {filteredProducts.map((product) => {
            const discount = getDiscount(product.price, product.old_price);
            return (
              <div
                key={product.id}
                className="product-card"
                onClick={() => openProductModal(product)}
              >
                <div className="product-card-image">
                  <div
                    className="product-card-image-placeholder"
                    style={{ background: CATEGORY_GRADIENTS[product.category] }}
                  >
                    {CATEGORY_ICONS[product.category]}
                  </div>
                  {discount && <span className="product-card-discount">-{discount}%</span>}
                  <div className="product-card-prep-time">
                    <Clock size={12} />
                    {product.prep_time}
                  </div>
                </div>
                <div className="product-card-body">
                  <h3 className="product-card-name">{product.name}</h3>
                  <p className="product-card-description">{product.description}</p>
                  <div className="product-card-footer">
                    <div className="product-card-price">
                      <span className="product-card-price-current">{formatCurrency(product.price)}</span>
                      {product.old_price && (
                        <span className="product-card-price-old">{formatCurrency(product.old_price)}</span>
                      )}
                    </div>
                    <button
                      className="product-card-add-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openProductModal(product);
                      }}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <div className="product-modal-overlay" onClick={closeProductModal}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            <button className="product-modal-close" onClick={closeProductModal}>
              <X />
            </button>
            <div className="product-modal-image">
              <div
                className="product-modal-image-placeholder"
                style={{ background: CATEGORY_GRADIENTS[selectedProduct.category] }}
              >
                {CATEGORY_ICONS[selectedProduct.category]}
              </div>
            </div>
            <div className="product-modal-body">
              <div className="product-modal-info">
                <h2 className="product-modal-name">{selectedProduct.name}</h2>
                <p className="product-modal-description">{selectedProduct.description}</p>
                <div className="product-modal-price-row">
                  <span className="product-modal-price">{formatCurrency(selectedProduct.price)}</span>
                  {selectedProduct.old_price && (
                    <span className="product-modal-price-old">{formatCurrency(selectedProduct.old_price)}</span>
                  )}
                </div>
              </div>

              {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
                <div className="product-modal-ingredients">
                  <h4 className="product-modal-ingredients-title">Ingredientes</h4>
                  <ul className="product-modal-ingredients-list">
                    {selectedProduct.ingredients.map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="product-modal-qty">
                <span className="product-modal-qty-label">Quantidade</span>
                <div className="product-modal-qty-controls">
                  <button
                    className="product-modal-qty-btn"
                    onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                    disabled={modalQty <= 1}
                  >
                    <Minus size={18} />
                  </button>
                  <span className="product-modal-qty-value">{modalQty}</span>
                  <button
                    className="product-modal-qty-btn"
                    onClick={() => setModalQty((q) => q + 1)}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="product-modal-note">
                <label className="product-modal-note-label">Observação (opcional)</label>
                <textarea
                  placeholder="Ex: sem cebola, trocar ketchup por mostarda..."
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                />
              </div>

              <button className="product-modal-add-btn" onClick={addToCart}>
                <ShoppingCart size={18} />
                Adicionar ao Carrinho
                <span className="product-modal-add-btn-price">
                  - {formatCurrency(selectedProduct.price * modalQty)}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Overlay */}
      {cartOpen && <div className="cart-overlay" onClick={() => setCartOpen(false)} />}

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="cart-drawer" ref={cartRef}>
          <div className="cart-header">
            <h2 className="cart-header-title">
              Meu Pedido
              {cart.length > 0 && <span className="cart-header-count">({cartItemCount} {cartItemCount === 1 ? 'item' : 'itens'})</span>}
            </h2>
            <button className="cart-header-close" onClick={() => setCartOpen(false)}>
              <X />
            </button>
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty-icon">🛒</div>
                <p className="cart-empty-text">Seu carrinho está vazio</p>
                <p className="cart-empty-subtext">Adicione itens do cardápio para começar</p>
              </div>
            ) : (
              cart.map((item, i) => (
                <div key={i} className="cart-item">
                  <div className="cart-item-image">
                    <div
                      className="cart-item-image-placeholder"
                      style={{ background: CATEGORY_GRADIENTS[item.product.category] }}
                    >
                      {CATEGORY_ICONS[item.product.category]}
                    </div>
                  </div>
                  <div className="cart-item-info">
                    <h4 className="cart-item-name">{item.product.name}</h4>
                    {item.note && <p className="cart-item-note">"{item.note}"</p>}
                    <span className="cart-item-price">{formatCurrency(item.product.price)}</span>
                  </div>
                  <div className="cart-item-controls">
                    <button
                      className="cart-item-qty-btn"
                      onClick={() => updateCartQty(i, -1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="cart-item-qty-value">{item.qty}</span>
                    <button
                      className="cart-item-qty-btn"
                      onClick={() => updateCartQty(i, 1)}
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      className="cart-item-remove"
                      onClick={() => removeCartItem(i)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="cart-summary">
              <div className="cart-summary-row">
                <span className="cart-summary-label">Subtotal</span>
                <span className="cart-summary-value">{formatCurrency(cartTotal)}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="cart-summary-row discount">
                  <span className="cart-summary-label">Desconto</span>
                  <span className="cart-summary-value">-{formatCurrency(cartDiscount)}</span>
                </div>
              )}
              <div className="cart-summary-row">
                <span className="cart-summary-label">Taxa de entrega</span>
                <span className="cart-summary-value">
                  {deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee)}
                </span>
              </div>
              {deliveryFee === 0 && (
                <p className="cart-summary-delivery-note">Frete grátis acima de R$ 50,00</p>
              )}
              <div className="cart-summary-row total">
                <span className="cart-summary-label">Total</span>
                <span className="cart-summary-value">{formatCurrency(orderTotal)}</span>
              </div>
              <button className="cart-checkout-btn" onClick={handleCheckout}>
                Finalizar Pedido
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Cart Button */}
      {step === 'menu' && cartItemCount > 0 && !cartOpen && (
        <button
          className="portal-cart-btn"
          onClick={() => setCartOpen(true)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            zIndex: 900,
            boxShadow: '0 4px 20px rgba(252, 105, 1, 0.4)',
          }}
        >
          <ShoppingCart size={24} />
          <span className={`portal-cart-badge ${bumpBadge ? 'bump' : ''}`}>{cartItemCount}</span>
        </button>
      )}
    </div>
  );
}
