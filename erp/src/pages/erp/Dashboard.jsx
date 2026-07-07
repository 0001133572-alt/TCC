import { useEffect, useState, useMemo } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  DollarSign, Truck, TrendingUp, Package, Clock, MapPin, FileDown
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';
import { useData } from '../../contexts/DataContext';
import './Dashboard.css';

// =============================================
// Animated Counter Component
// =============================================
function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 2 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!value || value === 0) { setDisplay(0); return; }
    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(current);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  const formatted = Number(display).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return <>{prefix}{formatted}{suffix}</>;
}

// =============================================
// Constants
// =============================================
const COLORS = ['#fc6901', '#7b4b34', '#54240d', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6'];

// =============================================
// Skeleton
// =============================================
function DashboardSkeleton() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <div className="skeleton skeleton-h1" />
          <div className="skeleton skeleton-p" />
        </div>
      </div>
      <div className="metrics-grid">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="metric-card skeleton-card">
            <div className="skeleton skeleton-icon" />
            <div className="metric-content">
              <div className="skeleton skeleton-value" />
              <div className="skeleton skeleton-title" />
            </div>
          </div>
        ))}
      </div>
      <div className="charts-grid">
        {[1,2,3,4].map(i => (
          <div key={i} className="chart-card">
            <div className="skeleton skeleton-chart-title" />
            <div className="skeleton skeleton-chart" />
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================
// Main Dashboard Component
// =============================================
export default function Dashboard() {
  const { dashboardStats, financialStats, topProducts, orders, clients } = useData();

  const exportPDF = async () => {
    try {
      await document.fonts.ready;
      const pdf = new jsPDF('p', 'mm', 'a4', { compress: false });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const contentW = pageW - margin * 2;
      const captureOpts = { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false };
      let yPos = margin;
      const checkPageBreak = (neededHeight) => { if (yPos + neededHeight > pageH - margin) { pdf.addPage(); yPos = margin; } };
      const captureAndAdd = async (selector, opts = {}) => {
        const el = document.querySelector(selector);
        if (!el) return;
        const canvas = await html2canvas(el, { ...captureOpts, ...opts });
        const imgData = canvas.toDataURL('image/png', 1.0);
        const scale = contentW / canvas.width;
        const imgH = canvas.height * scale;
        checkPageBreak(imgH);
        pdf.addImage(imgData, 'PNG', margin, yPos, contentW, imgH);
        yPos += imgH + 6;
      };
      const captureNodes = async (selector) => {
        const nodes = document.querySelectorAll(selector);
        for (const node of nodes) {
          const canvas = await html2canvas(node, captureOpts);
          const imgData = canvas.toDataURL('image/png', 1.0);
          const scale = contentW / canvas.width;
          const imgH = canvas.height * scale;
          checkPageBreak(imgH);
          pdf.addImage(imgData, 'PNG', margin, yPos, contentW, imgH);
          yPos += imgH + 6;
        }
      };
      await captureAndAdd('.dashboard-header');
      await captureAndAdd('.metrics-grid');
      await captureNodes('.chart-card');
      await captureAndAdd('.heatmap-section');
      pdf.save('dashboard.pdf');
    } catch (e) {
      console.error('Erro ao gerar PDF:', e);
    }
  };

  const formatCurrency = (value) =>
    `R$ ${Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const metricCards = useMemo(() => [
    {
      title: 'Vendas do Dia',
      value: dashboardStats.vendas_dia || 0,
      icon: DollarSign,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      subtitle: 'faturamento hoje',
      prefix: 'R$ ',
      decimals: 2,
    },
    {
      title: 'Vendas do Mês',
      value: dashboardStats.vendas_mes || 0,
      icon: TrendingUp,
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      subtitle: 'faturamento do mês',
      prefix: 'R$ ',
      decimals: 2,
    },
    {
      title: 'Pedidos em Andamento',
      value: dashboardStats.pedidos_andamento || 0,
      icon: Clock,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      subtitle: 'processando agora',
      prefix: '',
      decimals: 0,
    },
    {
      title: 'Entregas Concluídas',
      value: dashboardStats.entregas_concluidas || 0,
      icon: Truck,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      subtitle: 'entregas realizadas',
      prefix: '',
      decimals: 0,
    },
    {
      title: 'Entregas Pendentes',
      value: dashboardStats.entregas_pendentes || 0,
      icon: Clock,
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      subtitle: 'aguardando entrega',
      prefix: '',
      decimals: 0,
    },
    {
      title: 'Total de Clientes',
      value: dashboardStats.total_clientes || 0,
      icon: Package,
      color: '#fc6901',
      gradient: 'linear-gradient(135deg, #fc6901, #e55a00)',
      subtitle: 'clientes ativos',
      prefix: '',
      decimals: 0,
    },
  ], [dashboardStats]);

  const faturamento30d = useMemo(() => {
    const now = new Date();
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.setHours(0, 0, 0, 0)).toISOString();
      const dayEnd = new Date(d.setHours(23, 59, 59, 999)).toISOString();
      const total = orders
        .filter(o => o.created_at >= dayStart && o.created_at <= dayEnd && o.payment_status === 'pago' && o.status !== 'cancelado')
        .reduce((acc, o) => acc + o.total, 0);
      data.push({ date: dayStart.split('T')[0], total: Math.round(total * 100) / 100 });
    }
    return data;
  }, [orders]);

  const pedidosPorHora = useMemo(() => {
    const distribution = {};
    orders.forEach(o => {
      const hour = new Date(o.created_at).getHours();
      distribution[hour] = (distribution[hour] || 0) + 1;
    });
    const data = [];
    for (let h = 0; h < 24; h++) {
      data.push({ hour: `${String(h).padStart(2, '0')}:00`, count: distribution[h] || 0 });
    }
    return data;
  }, [orders]);

  const produtosMaisVendidos = useMemo(() =>
    topProducts.map(p => ({ name: p.name, quantity: p.count || p.quantity || 0 })),
    [topProducts]
  );

  const heatmapRegions = useMemo(() => {
    const regionCount = {};
    orders.forEach(o => {
      if (o.status === 'cancelado') return;
      const address = o.client_address || '';
      const regionMatch = address.match(/,\s*(.+)$/);
      const region = regionMatch ? regionMatch[1].trim() : address.split(' - ')[1] || address;
      if (!region) return;
      regionCount[region] = (regionCount[region] || 0) + 1;
    });
    return Object.entries(regionCount)
      .map(([name, orders]) => ({ name, orders }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 8);
  }, [orders]);

  const maxOrders = heatmapRegions.length > 0 ? Math.max(...heatmapRegions.map(r => r.orders)) : 1;
  const getHeatColor = (orders) => {
    const intensity = orders / maxOrders;
    if (intensity > 0.7) return '#fc6901';
    if (intensity > 0.4) return '#7b4b34';
    if (intensity > 0.2) return '#54240d';
    return 'var(--bg-tertiary)';
  };
  const getHeatOpacity = (orders) => 0.3 + (orders / maxOrders) * 0.7;

  const ChartTooltip = ({ active, payload, label, formatter }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="chart-tooltip-value" style={{ color: p.color }}>
            {p.name}: {formatter ? formatter(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Visão geral da sua operação</p>
        </div>
        <div className="dashboard-actions">
          <button className="export-pdf-btn" onClick={exportPDF}>
            <FileDown size={16} />
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="metrics-grid">
        {metricCards.map((metric, index) => (
          <div key={index} className="metric-card" style={{ animationDelay: `${index * 0.05}s` }}>
            <div className="metric-icon" style={{ background: metric.gradient }}>
              <metric.icon size={20} color="#fff" />
            </div>
            <div className="metric-content">
              <div className="metric-value">
                <AnimatedCounter value={metric.value} prefix={metric.prefix} decimals={metric.decimals} />
              </div>
              <div className="metric-title">{metric.title}</div>
              <div className="metric-subtitle">{metric.subtitle}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card" style={{ animationDelay: '0.1s' }}>
          <h3>Faturamento dos Últimos 30 Dias</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={faturamento30d}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} tickFormatter={(v) => v.slice(5)} stroke="var(--border)" />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} stroke="var(--border)" tickFormatter={(v) => `R$${v}`} />
                <Tooltip content={<ChartTooltip formatter={(v) => formatCurrency(v)} />} />
                <Line type="monotone" dataKey="total" stroke="#fc6901" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#fc6901', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card" style={{ animationDelay: '0.15s' }}>
          <h3>Pedidos por Hora do Dia</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pedidosPorHora}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} stroke="var(--border)" interval={2} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} stroke="var(--border)" allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#7b4b34">
                  {pedidosPorHora.map((_, i) => (
                    <Cell key={i} fill={i < 12 ? '#7b4b34' : '#fc6901'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card" style={{ animationDelay: '0.2s' }}>
          <h3>Produtos Mais Vendidos</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={produtosMaisVendidos.slice(0, 7)}
                  cx="50%" cy="50%" innerRadius={65} outerRadius={110} paddingAngle={3}
                  dataKey="quantity" nameKey="name" labelLine={true}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {produtosMaisVendidos.slice(0, 7).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={8}
                  formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card" style={{ animationDelay: '0.25s' }}>
          <h3>Finanças do Mês</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={[
                { name: 'Receita', value: financialStats.receita_mes || 0 },
                { name: 'Despesas', value: financialStats.despesas_mes || 0 },
                { name: 'Lucro', value: financialStats.lucro_mes || 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} stroke="var(--border)" />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} stroke="var(--border)" tickFormatter={(v) => `R$${v}`} />
                <Tooltip content={<ChartTooltip formatter={(v) => formatCurrency(v)} />} />
                <defs>
                  <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="despesaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="lucroGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fc6901" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#fc6901" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#receitaGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="value" stroke="#ef4444" fill="url(#despesaGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="value" stroke="#fc6901" fill="url(#lucroGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="heatmap-section">
        <h3>Mapa de Calor - Pedidos por Região</h3>
        <div className="heatmap-grid">
          {heatmapRegions.map((region) => (
            <div key={region.name} className="heatmap-cell"
              style={{
                background: `linear-gradient(135deg, ${getHeatColor(region.orders)}${Math.round(getHeatOpacity(region.orders) * 255).toString(16).padStart(2, '0')}, transparent)`,
                borderColor: getHeatColor(region.orders),
              }}
              title={`${region.name}: ${region.orders} pedidos`}
            >
              <MapPin size={14} color={getHeatColor(region.orders)} />
              <span className="heatmap-name">{region.name}</span>
              <span className="heatmap-value">{region.orders} pedidos</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
