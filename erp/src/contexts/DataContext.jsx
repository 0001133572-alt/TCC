import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { paymentService } from '../services/paymentService';
import { useRealtimeSync } from '../hooks/useRealtimeSync';

const DataContext = createContext(null);

const generateDate = (daysAgo, hoursAgo = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
};

const initialClients = [
  {
    id: 1,
    name: 'João Silva',
    phone: '(11) 99876-5432',
    email: 'joao.silva@email.com',
    city: 'São Paulo',
    street: 'Rua Augusta',
    number: '1234',
    complement: 'Apto 52',
    cep: '01305-100',
    status: 'ativo',
    total_pedidos: 12,
    total_gasto: 487.50,
    created_at: generateDate(180),
    last_order_at: generateDate(1),
  },
  {
    id: 2,
    name: 'Maria Oliveira',
    phone: '(11) 98765-4321',
    email: 'maria.oliveira@email.com',
    city: 'São Paulo',
    street: 'Av. Paulista',
    number: '567',
    complement: '',
    cep: '01310-100',
    status: 'ativo',
    total_pedidos: 8,
    total_gasto: 312.00,
    created_at: generateDate(120),
    last_order_at: generateDate(2),
  },
  {
    id: 3,
    name: 'Pedro Santos',
    phone: '(11) 97654-3210',
    email: 'pedro.santos@email.com',
    city: 'São Paulo',
    street: 'Rua Liberdade',
    number: '89',
    complement: '',
    cep: '01503-000',
    status: 'ativo',
    total_pedidos: 15,
    total_gasto: 623.90,
    created_at: generateDate(90),
    last_order_at: generateDate(0),
  },
  {
    id: 4,
    name: 'Ana Carolina Souza',
    phone: '(11) 96543-2109',
    email: 'ana.souza@email.com',
    city: 'São Paulo',
    street: 'Rua Oscar Freire',
    number: '789',
    complement: 'Loja 2',
    cep: '01426-000',
    status: 'ativo',
    total_pedidos: 6,
    total_gasto: 245.70,
    created_at: generateDate(60),
    last_order_at: generateDate(3),
  },
  {
    id: 5,
    name: 'Lucas Ferreira',
    phone: '(11) 95432-1098',
    email: 'lucas.ferreira@email.com',
    city: 'Guarulhos',
    street: 'Rua Guarani',
    number: '456',
    complement: 'Casa',
    cep: '07123-456',
    status: 'ativo',
    total_pedidos: 3,
    total_gasto: 134.97,
    created_at: generateDate(45),
    last_order_at: generateDate(5),
  },
  {
    id: 6,
    name: 'Juliana Costa',
    phone: '(11) 94321-0987',
    email: 'juliana.costa@email.com',
    city: 'São Paulo',
    street: 'Rua Haddock Lobo',
    number: '321',
    complement: '',
    cep: '01414-001',
    status: 'ativo',
    total_pedidos: 20,
    total_gasto: 890.00,
    created_at: generateDate(200),
    last_order_at: generateDate(0),
  },
  {
    id: 7,
    name: 'Roberto Almeida',
    phone: '(11) 93210-9876',
    email: 'roberto.almeida@email.com',
    city: 'São Paulo',
    street: 'Av. Brigadeiro',
    number: '1500',
    complement: 'Sala 301',
    cep: '01312-000',
    status: 'inativo',
    total_pedidos: 1,
    total_gasto: 45.99,
    created_at: generateDate(300),
    last_order_at: generateDate(90),
  },
  {
    id: 8,
    name: 'Fernanda Lima',
    phone: '(11) 92109-8765',
    email: 'fernanda.lima@email.com',
    city: 'São Paulo',
    street: 'Rua Bela Cintra',
    number: '678',
    complement: 'Apto 12',
    cep: '01415-000',
    status: 'ativo',
    total_pedidos: 9,
    total_gasto: 398.50,
    created_at: generateDate(150),
    last_order_at: generateDate(1),
  },
  {
    id: 9,
    name: 'Rafael Moura',
    phone: '(11) 91098-7654',
    email: 'rafael.moura@email.com',
    city: 'Campinas',
    street: 'Rua Barão de Jaguara',
    number: '100',
    complement: '',
    cep: '13013-100',
    status: 'ativo',
    total_pedidos: 5,
    total_gasto: 210.95,
    created_at: generateDate(75),
    last_order_at: generateDate(4),
  },
  {
    id: 10,
    name: 'Camila Pereira',
    phone: '(11) 90987-6543',
    email: 'camila.pereira@email.com',
    city: 'São Paulo',
    street: 'Rua Pamplona',
    number: '543',
    complement: '',
    cep: '01405-000',
    status: 'ativo',
    total_pedidos: 7,
    total_gasto: 287.30,
    created_at: generateDate(100),
    last_order_at: generateDate(2),
  },
];

const initialStock = [
  { id: 1, product_id: 101, name: 'Pão de Hambúrguer', quantity: 200, min_stock: 50, unit: 'un' },
  { id: 2, product_id: 102, name: 'Carne Moída', quantity: 50, min_stock: 15, unit: 'kg' },
  { id: 3, product_id: 103, name: 'Queijo Cheddar', quantity: 30, min_stock: 10, unit: 'kg' },
  { id: 4, product_id: 104, name: 'Alface', quantity: 20, min_stock: 5, unit: 'kg' },
  { id: 5, product_id: 105, name: 'Tomate', quantity: 25, min_stock: 8, unit: 'kg' },
  { id: 6, product_id: 106, name: 'Molho Especial', quantity: 15, min_stock: 5, unit: 'L' },
  { id: 7, product_id: 107, name: 'Batata', quantity: 40, min_stock: 10, unit: 'kg' },
  { id: 8, product_id: 108, name: 'Coca-Cola 2L', quantity: 60, min_stock: 20, unit: 'un' },
  { id: 9, product_id: 109, name: 'Bacon', quantity: 10, min_stock: 3, unit: 'kg' },
  { id: 10, product_id: 110, name: 'Cebola', quantity: 15, min_stock: 5, unit: 'kg' },
  { id: 11, product_id: 111, name: 'Ovo', quantity: 100, min_stock: 30, unit: 'un' },
  { id: 12, product_id: 112, name: 'Farinha de Trigo', quantity: 20, min_stock: 5, unit: 'kg' },
  { id: 13, product_id: 113, name: 'Leite', quantity: 30, min_stock: 10, unit: 'L' },
  { id: 14, product_id: 114, name: 'Açúcar', quantity: 25, min_stock: 8, unit: 'kg' },
  { id: 15, product_id: 115, name: 'Chocolate', quantity: 12, min_stock: 4, unit: 'kg' },
];

const productPrices = {
  'X-Burger': 1.00,
  'X-Bacon': 27.90,
  'X-Egg': 24.90,
  'X-Tudo': 32.90,
  'X-Frango': 25.90,
  'Batata Frita': 14.90,
  'Onion Rings': 16.90,
  'Milkshake': 18.90,
  'Refrigerante': 8.90,
  'Água': 5.90,
};

const calculateSubtotal = (items) =>
  items.reduce((acc, item) => acc + item.quantity * item.unit_price, 0);

const initialOrders = [
  {
    id: 1,
    order_number: 'PED-0001',
    client_id: 1,
    client_name: 'João Silva',
    client_phone: '(11) 99876-5432',
    client_address: 'Rua Augusta, 1234 - São Paulo',
    items: [
      { product_id: 101, name: 'X-Burger', quantity: 2, unit_price: 22.90, subtotal: 45.80 },
      { product_id: 102, name: 'Batata Frita', quantity: 1, unit_price: 14.90, subtotal: 14.90 },
      { product_id: 103, name: 'Refrigerante', quantity: 2, unit_price: 8.90, subtotal: 17.80 },
    ],
    subtotal: 78.50,
    delivery_fee: 5.99,
    discount: 0,
    total: 84.49,
    payment_method: 'pix',
    payment_status: 'pago',
    status: 'entregue',
    notes: '',
    created_at: generateDate(0, 2),
    updated_at: generateDate(0, 1),
  },
  {
    id: 2,
    order_number: 'PED-0002',
    client_id: 3,
    client_name: 'Pedro Santos',
    client_phone: '(11) 97654-3210',
    client_address: 'Rua Liberdade, 89 - São Paulo',
    items: [
      { product_id: 201, name: 'X-Tudo', quantity: 1, unit_price: 32.90, subtotal: 32.90 },
      { product_id: 202, name: 'X-Bacon', quantity: 1, unit_price: 27.90, subtotal: 27.90 },
      { product_id: 203, name: 'Milkshake', quantity: 2, unit_price: 18.90, subtotal: 37.80 },
    ],
    subtotal: 98.60,
    delivery_fee: 5.99,
    discount: 5.00,
    total: 99.59,
    payment_method: 'cartao',
    payment_status: 'pago',
    status: 'saiu_entrega',
    notes: 'Sem cebola no X-Tudo',
    created_at: generateDate(0, 3),
    updated_at: generateDate(0, 1),
  },
  {
    id: 3,
    order_number: 'PED-0003',
    client_id: 6,
    client_name: 'Juliana Costa',
    client_phone: '(11) 94321-0987',
    client_address: 'Rua Haddock Lobo, 321 - São Paulo',
    items: [
      { product_id: 301, name: 'X-Frango', quantity: 3, unit_price: 25.90, subtotal: 77.70 },
      { product_id: 302, name: 'Onion Rings', quantity: 2, unit_price: 16.90, subtotal: 33.80 },
      { product_id: 303, name: 'Água', quantity: 3, unit_price: 5.90, subtotal: 17.70 },
    ],
    subtotal: 129.20,
    delivery_fee: 5.99,
    discount: 0,
    total: 135.19,
    payment_method: 'pix',
    payment_status: 'pago',
    status: 'pronto',
    notes: '',
    created_at: generateDate(0, 1),
    updated_at: generateDate(0, 0),
  },
  {
    id: 4,
    order_number: 'PED-0004',
    client_id: 2,
    client_name: 'Maria Oliveira',
    client_phone: '(11) 98765-4321',
    client_address: 'Av. Paulista, 567 - São Paulo',
    items: [
      { product_id: 401, name: 'X-Burger', quantity: 1, unit_price: 22.90, subtotal: 22.90 },
      { product_id: 402, name: 'X-Egg', quantity: 1, unit_price: 24.90, subtotal: 24.90 },
      { product_id: 403, name: 'Batata Frita', quantity: 1, unit_price: 14.90, subtotal: 14.90 },
      { product_id: 404, name: 'Refrigerante', quantity: 2, unit_price: 8.90, subtotal: 17.80 },
    ],
    subtotal: 80.50,
    delivery_fee: 5.99,
    discount: 10.00,
    total: 76.49,
    payment_method: 'dinheiro',
    payment_status: 'pago',
    status: 'em_producao',
    notes: 'Troco para R$ 100',
    created_at: generateDate(0, 0),
    updated_at: generateDate(0, 0),
  },
  {
    id: 5,
    order_number: 'PED-0005',
    client_id: 8,
    client_name: 'Fernanda Lima',
    client_phone: '(11) 92109-8765',
    client_address: 'Rua Bela Cintra, 678 - São Paulo',
    items: [
      { product_id: 501, name: 'X-Tudo', quantity: 2, unit_price: 32.90, subtotal: 65.80 },
      { product_id: 502, name: 'Milkshake', quantity: 1, unit_price: 18.90, subtotal: 18.90 },
    ],
    subtotal: 84.70,
    delivery_fee: 5.99,
    discount: 0,
    total: 90.69,
    payment_method: 'cartao',
    payment_status: 'pendente',
    status: 'recebido',
    notes: '',
    created_at: generateDate(0, 0),
    updated_at: generateDate(0, 0),
  },
  {
    id: 6,
    order_number: 'PED-0006',
    client_id: 4,
    client_name: 'Ana Carolina Souza',
    client_phone: '(11) 96543-2109',
    client_address: 'Rua Oscar Freire, 789 - São Paulo',
    items: [
      { product_id: 601, name: 'X-Bacon', quantity: 2, unit_price: 27.90, subtotal: 55.80 },
      { product_id: 602, name: 'Onion Rings', quantity: 1, unit_price: 16.90, subtotal: 16.90 },
      { product_id: 603, name: 'Água', quantity: 2, unit_price: 5.90, subtotal: 11.80 },
    ],
    subtotal: 84.50,
    delivery_fee: 5.99,
    discount: 0,
    total: 90.49,
    payment_method: 'pix',
    payment_status: 'pago',
    status: 'entregue',
    notes: '',
    created_at: generateDate(1, 5),
    updated_at: generateDate(1, 3),
  },
  {
    id: 7,
    order_number: 'PED-0007',
    client_id: 9,
    client_name: 'Rafael Moura',
    client_phone: '(11) 91098-7654',
    client_address: 'Rua Barão de Jaguara, 100 - Campinas',
    items: [
      { product_id: 701, name: 'X-Frango', quantity: 1, unit_price: 25.90, subtotal: 25.90 },
      { product_id: 702, name: 'X-Burger', quantity: 1, unit_price: 22.90, subtotal: 22.90 },
      { product_id: 703, name: 'Refrigerante', quantity: 1, unit_price: 8.90, subtotal: 8.90 },
    ],
    subtotal: 57.70,
    delivery_fee: 5.99,
    discount: 0,
    total: 63.69,
    payment_method: 'dinheiro',
    payment_status: 'pago',
    status: 'saiu_entrega',
    notes: '',
    created_at: generateDate(0, 4),
    updated_at: generateDate(0, 2),
  },
  {
    id: 8,
    order_number: 'PED-0008',
    client_id: 10,
    client_name: 'Camila Pereira',
    client_phone: '(11) 90987-6543',
    client_address: 'Rua Pamplona, 543 - São Paulo',
    items: [
      { product_id: 801, name: 'X-Tudo', quantity: 1, unit_price: 32.90, subtotal: 32.90 },
      { product_id: 802, name: 'Batata Frita', quantity: 2, unit_price: 14.90, subtotal: 29.80 },
      { product_id: 803, name: 'Milkshake', quantity: 2, unit_price: 18.90, subtotal: 37.80 },
    ],
    subtotal: 100.50,
    delivery_fee: 5.99,
    discount: 15.00,
    total: 91.49,
    payment_method: 'cartao',
    payment_status: 'recusado',
    status: 'cancelado',
    notes: 'Pagamento recusado pelo operador',
    created_at: generateDate(1, 10),
    updated_at: generateDate(1, 8),
  },
  {
    id: 9,
    order_number: 'PED-0009',
    client_id: 5,
    client_name: 'Lucas Ferreira',
    client_phone: '(11) 95432-1098',
    client_address: 'Rua Guarani, 456 - Guarulhos',
    items: [
      { product_id: 901, name: 'X-Egg', quantity: 2, unit_price: 24.90, subtotal: 49.80 },
      { product_id: 902, name: 'Água', quantity: 2, unit_price: 5.90, subtotal: 11.80 },
    ],
    subtotal: 61.60,
    delivery_fee: 5.99,
    discount: 0,
    total: 67.59,
    payment_method: 'pix',
    payment_status: 'pago',
    status: 'em_producao',
    notes: '',
    created_at: generateDate(0, 0),
    updated_at: generateDate(0, 0),
  },
  {
    id: 10,
    order_number: 'PED-0010',
    client_id: 1,
    client_name: 'João Silva',
    client_phone: '(11) 99876-5432',
    client_address: 'Rua Augusta, 1234 - São Paulo',
    items: [
      { product_id: 1001, name: 'X-Burger', quantity: 1, unit_price: 22.90, subtotal: 22.90 },
      { product_id: 1002, name: 'X-Bacon', quantity: 1, unit_price: 27.90, subtotal: 27.90 },
      { product_id: 1003, name: 'Batata Frita', quantity: 1, unit_price: 14.90, subtotal: 14.90 },
      { product_id: 1004, name: 'Refrigerante', quantity: 1, unit_price: 8.90, subtotal: 8.90 },
    ],
    subtotal: 74.60,
    delivery_fee: 5.99,
    discount: 5.00,
    total: 75.59,
    payment_method: 'cartao',
    payment_status: 'pago',
    status: 'recebido',
    notes: 'Pedido para aniversário',
    created_at: generateDate(0, 0),
    updated_at: generateDate(0, 0),
  },
];

const PRODUCTS = [
  { id: 1, name: 'X-Bacon Especial', price: 1.00, category: 'hamburgueres' },
  { id: 2, name: 'Combo Família', price: 1.00, category: 'hamburgueres' },
  { id: 3, name: 'X-Tudo Premium', price: 1.00, category: 'hamburgueres' },
  { id: 4, name: 'Smash Burger', price: 1.00, category: 'hamburgueres' },
  { id: 5, name: 'Pizza Margherita', price: 1.00, category: 'pizzas' },
  { id: 6, name: 'Pizza 4 Queijos', price: 1.00, category: 'pizzas' },
  { id: 7, name: 'Pizza Calabresa', price: 1.00, category: 'pizzas' },
  { id: 8, name: 'Coca-Cola 2L', price: 1.00, category: 'bebidas' },
  { id: 9, name: 'Suco Natural Laranja', price: 1.00, category: 'bebidas' },
  { id: 10, name: 'Milk Shake Artesanal', price: 1.00, category: 'sobremesas' },
  { id: 11, name: 'Batata Frita Grande', price: 1.00, category: 'porcoes' },
  { id: 12, name: 'Onion Rings', price: 1.00, category: 'porcoes' },
];

const deriveProductionOrders = (orders) =>
  orders
    .filter((o) => ['recebido', 'em_producao', 'pronto', 'saiu_entrega'].includes(o.status))
    .map((o) => ({
      id: o.id,
      order_number: o.order_number,
      items: o.items,
      status: o.status,
      client_name: o.client_name,
      notes: o.notes,
      created_at: o.created_at,
    }));

const derivePayments = (orders) =>
  orders.map((o) => ({
    id: o.id,
    order_id: o.id,
    order_number: o.order_number,
    client_name: o.client_name,
    amount: o.total,
    method: o.payment_method,
    status: o.payment_status,
    created_at: o.created_at,
  }));

export function DataProvider({ children }) {
  const [orders, setOrders] = useState(initialOrders);
  const [clients, setClients] = useState(initialClients);
  const [stock, setStock] = useState(initialStock);
  const [pixPayments, setPixPayments] = useState([]);
  const pollingRef = useRef(null);

  const productionOrders = useMemo(() => deriveProductionOrders(orders), [orders]);

  const payments = useMemo(() => derivePayments(orders), [orders]);

  const handleRealtimeChange = useCallback((table, payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    console.log(`[Realtime] ${table} - ${eventType}`, newRecord || oldRecord);

    if (table === 'orders') {
      if (eventType === 'INSERT') {
        setOrders((prev) => {
          const exists = prev.find((o) => o.id === newRecord.id);
          if (exists) return prev;
          return [newRecord, ...prev];
        });
      } else if (eventType === 'UPDATE') {
        setOrders((prev) =>
          prev.map((o) => (o.id === newRecord.id ? { ...o, ...newRecord } : o))
        );
      } else if (eventType === 'DELETE') {
        setOrders((prev) => prev.filter((o) => o.id !== oldRecord.id));
      }
    } else if (table === 'clients') {
      if (eventType === 'INSERT') {
        setClients((prev) => {
          const exists = prev.find((c) => c.id === newRecord.id);
          if (exists) return prev;
          return [...prev, newRecord];
        });
      } else if (eventType === 'UPDATE') {
        setClients((prev) =>
          prev.map((c) => (c.id === newRecord.id ? { ...c, ...newRecord } : c))
        );
      } else if (eventType === 'DELETE') {
        setClients((prev) => prev.filter((c) => c.id !== oldRecord.id));
      }
    } else if (table === 'stock') {
      if (eventType === 'INSERT' || eventType === 'UPDATE') {
        setStock((prev) => {
          const exists = prev.find((s) => s.id === newRecord.id);
          if (exists) {
            return prev.map((s) => (s.id === newRecord.id ? { ...s, ...newRecord } : s));
          }
          return [...prev, newRecord];
        });
      } else if (eventType === 'DELETE') {
        setStock((prev) => prev.filter((s) => s.id !== oldRecord.id));
      }
    }
  }, []);

  useRealtimeSync(
    [
      { table: 'orders', event: '*' },
      { table: 'clients', event: '*' },
      { table: 'stock', event: '*' },
    ],
    handleRealtimeChange
  );

  const addOrder = useCallback((orderData) => {
    const newId = Math.max(0, ...orders.map((o) => o.id)) + 1;
    const now = new Date().toISOString();
    const orderNumber = `PED-${String(newId).padStart(4, '0')}`;
    const subtotal = calculateSubtotal(orderData.items);
    const total = subtotal + (orderData.delivery_fee || 5.99) - (orderData.discount || 0);

    const isPix = orderData.payment_method === 'pix';

    const newOrder = {
      id: newId,
      order_number: orderNumber,
      client_id: orderData.client_id,
      client_name: orderData.client_name,
      client_phone: orderData.client_phone,
      client_address: orderData.client_address,
      items: orderData.items.map((item) => ({
        ...item,
        subtotal: item.quantity * item.unit_price,
      })),
      subtotal,
      delivery_fee: orderData.delivery_fee || 5.99,
      discount: orderData.discount || 0,
      total,
      payment_method: orderData.payment_method,
      payment_status: isPix ? 'pendente' : 'pendente',
      status: isPix ? 'aguardando_pagamento' : 'recebido',
      notes: orderData.notes || '',
      created_at: now,
      updated_at: now,
    };

    setOrders((prev) => [newOrder, ...prev]);

    if (!isPix) {
      setStock((prev) =>
        prev.map((s) => {
          const ordered = orderData.items.find((i) => i.product_id === s.product_id);
          if (ordered) {
            return { ...s, quantity: Math.max(0, s.quantity - ordered.quantity) };
          }
          return s;
        })
      );
    }

    setClients((prev) =>
      prev.map((c) => {
        if (c.id === orderData.client_id) {
          return {
            ...c,
            total_pedidos: c.total_pedidos + 1,
            total_gasto: c.total_gasto + total,
            last_order_at: now,
          };
        }
        return c;
      })
    );

    return newOrder;
  }, [orders]);

  const confirmPayment = useCallback((orderId) => {
    const now = new Date().toISOString();
    let confirmedOrder = null;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          confirmedOrder = {
            ...o,
            status: 'recebido',
            payment_status: 'pago',
            updated_at: now,
          };
          return confirmedOrder;
        }
        return o;
      })
    );

    if (confirmedOrder) {
      setStock((prev) =>
        prev.map((s) => {
          const ordered = confirmedOrder.items.find((i) => i.product_id === s.product_id);
          if (ordered) {
            return { ...s, quantity: Math.max(0, s.quantity - ordered.quantity) };
          }
          return s;
        })
      );
    }

    return confirmedOrder;
  }, []);

  const updateOrderStatus = useCallback((orderId, newStatus) => {
    const now = new Date().toISOString();
    let updatedOrder = null;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          updatedOrder = {
            ...o,
            status: newStatus,
            updated_at: now,
            payment_status: newStatus === 'entregue' ? 'pago' : o.payment_status,
          };
          return updatedOrder;
        }
        return o;
      })
    );

    return updatedOrder;
  }, []);

  const cancelOrder = useCallback((orderId) => {
    const now = new Date().toISOString();
    let cancelledOrder = null;

    setOrders((prev) => {
      const order = prev.find((o) => o.id === orderId);
      if (!order) return prev;

      cancelledOrder = {
        ...order,
        status: 'cancelado',
        payment_status: 'cancelado',
        updated_at: now,
      };

      return prev.map((o) => (o.id === orderId ? cancelledOrder : o));
    });

    if (cancelledOrder) {
      setStock((prev) =>
        prev.map((s) => {
          const returned = cancelledOrder.items.find((i) => i.product_id === s.product_id);
          if (returned) {
            return { ...s, quantity: s.quantity + returned.quantity };
          }
          return s;
        })
      );
    }

    return cancelledOrder;
  }, []);

  const adjustStock = useCallback((productId, quantityChange, type) => {
    setStock((prev) =>
      prev.map((s) => {
        if (s.product_id === productId) {
          const newQty =
            type === 'entrada' ? s.quantity + quantityChange : s.quantity - quantityChange;
          return { ...s, quantity: Math.max(0, newQty) };
        }
        return s;
      })
    );
  }, []);

  const checkLowStock = useCallback(() => {
    return stock.filter((s) => s.quantity <= s.min_stock);
  }, [stock]);

  const updatePaymentStatus = useCallback((paymentId, newStatus) => {
    const now = new Date().toISOString();

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === paymentId) {
          return {
            ...o,
            payment_status: newStatus,
            updated_at: now,
          };
        }
        return o;
      })
    );
  }, []);

  const addClient = useCallback((clientData) => {
    const newId = Math.max(0, ...clients.map((c) => c.id)) + 1;
    const now = new Date().toISOString();
    const newClient = {
      id: newId,
      name: clientData.name,
      phone: clientData.phone,
      email: clientData.email,
      city: clientData.city,
      street: clientData.street,
      number: clientData.number,
      complement: clientData.complement || '',
      cep: clientData.cep,
      status: 'ativo',
      total_pedidos: 0,
      total_gasto: 0,
      created_at: now,
      last_order_at: null,
    };
    setClients((prev) => [...prev, newClient]);
    return newClient;
  }, [clients]);

  const createPixPayment = useCallback(async (orderId, amount, description) => {
    const result = await paymentService.createPixPayment({
      amount,
      description: description || `Pedido #${orderId}`,
      external_id: String(orderId),
      expiration: 1800,
    });

    if (result.success && result.transaction) {
      const pixData = {
        order_id: orderId,
        transaction_id: result.transaction.id,
        txid: result.transaction.txid,
        external_id: result.transaction.external_id,
        amount: result.transaction.amount,
        fee: result.transaction.fee,
        net_amount: result.transaction.net_amount,
        status: result.transaction.status,
        pix_copia_cola: result.transaction.pix_copia_cola,
        qr_code_base64: result.transaction.qr_code_base64,
        expires_at: result.transaction.expires_at,
        created_at: new Date().toISOString(),
      };

      setPixPayments((prev) => [...prev, pixData]);
      return pixData;
    }

    throw new Error(result.error || 'NexusPag não retornou dados da transação');
  }, []);

  const getPixPaymentByOrderId = useCallback((orderId) => {
    return pixPayments.find((p) => p.order_id === orderId) || null;
  }, [pixPayments]);

  const pollPixPaymentStatus = useCallback(async (transactionId, orderId) => {
    try {
      const result = await paymentService.getPaymentStatus(transactionId);
      if (result.status === 'paid') {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, payment_status: 'pago', updated_at: new Date().toISOString() }
              : o
          )
        );
        setPixPayments((prev) =>
          prev.map((p) =>
            p.transaction_id === transactionId
              ? { ...p, status: 'paid', payer_name: result.payer_name, paid_at: result.paid_at }
              : p
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao consultar pagamento:', error);
      return false;
    }
  }, []);

  const getClientStats = useCallback(
    (clientId) => {
      const client = clients.find((c) => c.id === clientId);
      if (!client) return null;

      const clientOrders = orders.filter((o) => o.client_id === clientId);
      const totalSpent = clientOrders.reduce((acc, o) => acc + o.total, 0);
      const totalOrders = clientOrders.length;
      const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

      return {
        client,
        total_orders: totalOrders,
        total_spent: totalSpent,
        avg_order_value: avgOrderValue,
        last_order: clientOrders.length > 0 ? clientOrders[0] : null,
      };
    },
    [clients, orders]
  );

  const dashboardStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

    const vendas_dia = orders
      .filter(
        (o) =>
          o.created_at >= todayISO &&
          o.payment_status === 'pago' &&
          o.status !== 'cancelado'
      )
      .reduce((acc, o) => acc + o.total, 0);

    const vendas_mes = orders
      .filter(
        (o) =>
          o.created_at >= monthStart &&
          o.payment_status === 'pago' &&
          o.status !== 'cancelado'
      )
      .reduce((acc, o) => acc + o.total, 0);

    const pedidos_andamento = orders.filter(
      (o) =>
        ['recebido', 'em_producao', 'pronto', 'saiu_entrega'].includes(o.status) &&
        o.status !== 'cancelado'
    ).length;

    const entregas_concluidas = orders.filter((o) => o.status === 'entregue').length;

    const entregas_pendentes = orders.filter(
      (o) => ['saiu_entrega', 'pronto'].includes(o.status)
    ).length;

    const total_clientes = clients.filter((c) => c.status === 'ativo').length;

    return {
      vendas_dia,
      vendas_mes,
      pedidos_andamento,
      entregas_concluidas,
      entregas_pendentes,
      total_clientes,
    };
  }, [orders, clients]);

  const financialStats = useMemo(() => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

    const receita_mes = orders
      .filter(
        (o) =>
          o.created_at >= monthStart &&
          o.payment_status === 'pago' &&
          o.status !== 'cancelado'
      )
      .reduce((acc, o) => acc + o.total, 0);

    const despesas_mes = receita_mes * 0.65;
    const lucro_mes = receita_mes - despesas_mes;

    const receita_diaria = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0)).toISOString();
      const dayEnd = new Date(date.setHours(23, 59, 59, 999)).toISOString();

      const dayTotal = orders
        .filter(
          (o) =>
            o.created_at >= dayStart &&
            o.created_at <= dayEnd &&
            o.payment_status === 'pago' &&
            o.status !== 'cancelado'
        )
        .reduce((acc, o) => acc + o.total, 0);

      receita_diaria.push({
        date: dayStart.split('T')[0],
        value: dayTotal,
      });
    }

    return {
      receita_mes,
      despesas_mes,
      lucro_mes,
      receita_diaria,
    };
  }, [orders]);

  const topProducts = useMemo(() => {
    const productCount = {};
    orders
      .filter((o) => o.status !== 'cancelado')
      .forEach((o) => {
        o.items.forEach((item) => {
          if (!productCount[item.name]) {
            productCount[item.name] = { name: item.name, count: 0, revenue: 0 };
          }
          productCount[item.name].count += item.quantity;
          productCount[item.name].revenue += item.subtotal;
        });
      });

    return Object.values(productCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [orders]);

  const productionList = useMemo(
    () =>
      orders.filter((o) =>
        ['recebido', 'em_producao', 'pronto', 'saiu_entrega'].includes(o.status)
      ),
    [orders]
  );

  const value = useMemo(
    () => ({
      orders,
      clients,
      stock,
      products: PRODUCTS,
      productionOrders,
      payments,
      pixPayments,
      addOrder,
      confirmPayment,
      updateOrderStatus,
      cancelOrder,
      adjustStock,
      checkLowStock,
      updatePaymentStatus,
      addClient,
      getClientStats,
      createPixPayment,
      getPixPaymentByOrderId,
      pollPixPaymentStatus,
      dashboardStats,
      financialStats,
      topProducts,
      productionList,
    }),
    [
      orders,
      clients,
      stock,
      productionOrders,
      payments,
      pixPayments,
      addOrder,
      confirmPayment,
      updateOrderStatus,
      cancelOrder,
      adjustStock,
      checkLowStock,
      updatePaymentStatus,
      addClient,
      getClientStats,
      createPixPayment,
      getPixPaymentByOrderId,
      pollPixPaymentStatus,
      dashboardStats,
      financialStats,
      topProducts,
      productionList,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export default DataProvider;
