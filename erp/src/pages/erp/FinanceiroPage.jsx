import { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '../../contexts/DataContext';
import {
  DollarSign, TrendingUp, TrendingDown, Receipt, BarChart3,
  CalendarDays, RefreshCw, Activity, TrendingUp as ChartIcon
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
  AreaChart, Area
} from 'recharts';
import './FinanceiroPage.css';

// =============================================
// Animated Counter Component
// =============================================
function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 2 }) {
  const [display, setDisplay] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!value || value === 0) { setDisplay(0); return; }
    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    timerRef.current = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timerRef.current);
      } else {
        setDisplay(current);
      }
    }, duration / steps);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [value]);

  const formatted = Number(display).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return <>{prefix}{formatted}{suffix}</>;
}

// =============================================
// ChartTooltip
// =============================================
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

// =============================================
// Skeleton
// =============================================
function FinanceiroSkeleton() {
  return (
    <div className="financeiro-page">
      <div className="financeiro-header">
        <div>
          <div className="skeleton skeleton-h1" />
          <div className="skeleton skeleton-p" />
        </div>
      </div>
      <div className="financeiro-metrics">
        {[1, 2, 3].map((i) => (
          <div key={i} className="metric-card skeleton-card">
            <div className="skeleton skeleton-icon" />
            <div className="metric-content">
              <div className="skeleton skeleton-value" />
              <div className="skeleton skeleton-title" />
            </div>
          </div>
        ))}
      </div>
      <div className="financeiro-chart-section">
        <div className="skeleton skeleton-chart-title" style={{ marginBottom: '16px' }} />
        <div className="skeleton skeleton-chart" />
      </div>
    </div>
  );
}

// =============================================
// Period filter button config
// =============================================
const PERIODS = [
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mês' },
  { key: 'year', label: 'Ano' },
];

const DESPESA_RATIO = 0.65;

function filterByPeriod(orders, period) {
  const now = new Date();

  if (period === 'week') {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const startISO = weekStart.toISOString();
    return orders.filter(
      (o) => o.created_at >= startISO && o.status !== 'cancelado'
    );
  }

  if (period === 'month') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    return orders.filter(
      (o) => o.created_at >= monthStart && o.status !== 'cancelado'
    );
  }

  if (period === 'year') {
    const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();
    return orders.filter(
      (o) => o.created_at >= yearStart && o.status !== 'cancelado'
    );
  }

  return [];
}

function buildDailyLineData(orders) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const today = now.getDate();

  const result = [];
  for (let d = 1; d <= today; d++) {
    const dayStart = new Date(now.getFullYear(), now.getMonth(), d, 0, 0, 0).toISOString();
    const dayEnd = new Date(now.getFullYear(), now.getMonth(), d, 23, 59, 59, 999).toISOString();

    const dayOrders = orders.filter(
      (o) => o.created_at >= dayStart && o.created_at <= dayEnd && o.status !== 'cancelado'
    );

    const receita = dayOrders.reduce((acc, o) => acc + o.total, 0);
    const despesa = receita * DESPESA_RATIO;

    result.push({
      dia: `${String(d).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`,
      receita: Number(receita.toFixed(2)),
      despesa: Number(despesa.toFixed(2)),
    });
  }
  return result;
}

function buildWeeklyBarData(orders) {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const totalWeeks = Math.ceil(daysInMonth / 7);

  const result = [];
  for (let w = 0; w < totalWeeks; w++) {
    const weekDayStart = w * 7 + 1;
    const weekDayEnd = Math.min((w + 1) * 7, daysInMonth);
    const today = now.getDate();

    if (weekDayStart > today) break;

    const actualEnd = Math.min(weekDayEnd, today);
    const weekStart = new Date(now.getFullYear(), now.getMonth(), weekDayStart, 0, 0, 0).toISOString();
    const weekEnd = new Date(now.getFullYear(), now.getMonth(), actualEnd, 23, 59, 59, 999).toISOString();

    const weekOrders = orders.filter(
      (o) => o.created_at >= weekStart && o.created_at <= weekEnd && o.status !== 'cancelado'
    );

    const receita = weekOrders.reduce((acc, o) => acc + o.total, 0);
    const despesa = receita * DESPESA_RATIO;

    result.push({
      semana: `Sem ${w + 1}`,
      receita: Number(receita.toFixed(2)),
      despesa: Number(despesa.toFixed(2)),
    });
  }
  return result;
}

function buildMonthlyAreaData(orders) {
  const now = new Date();
  const year = now.getFullYear();
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentMonth = now.getMonth();

  let acumulado = 0;
  const result = [];

  for (let m = 0; m <= currentMonth; m++) {
    const monthStart = new Date(year, m, 1).toISOString();
    const monthEnd = new Date(year, m + 1, 0, 23, 59, 59, 999).toISOString();

    const monthOrders = orders.filter(
      (o) => o.created_at >= monthStart && o.created_at <= monthEnd && o.status !== 'cancelado'
    );

    const receita = monthOrders.reduce((acc, o) => acc + o.total, 0);
    const despesa = receita * DESPESA_RATIO;
    acumulado += receita - despesa;

    result.push({
      mes: monthNames[m],
      lucro: Number(acumulado.toFixed(2)),
    });
  }
  return result;
}

// =============================================
// Main Financeiro Page Component
// =============================================
export default function FinanceiroPage() {
  const [period, setPeriod] = useState('month');
  const { orders, financialStats } = useData();

  const formatCurrency = (value) =>
    `R$ ${Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const periodOrders = useMemo(() => filterByPeriod(orders, period), [orders, period]);

  const receitas = useMemo(
    () => periodOrders.reduce((acc, o) => acc + o.total, 0),
    [periodOrders]
  );
  const despesas = receitas * DESPESA_RATIO;
  const lucro = receitas - despesas;
  const totalTransacoes = periodOrders.length;

  const lineData = useMemo(() => buildDailyLineData(orders), [orders]);
  const barData = useMemo(() => buildWeeklyBarData(orders), [orders]);
  const areaData = useMemo(() => buildMonthlyAreaData(orders), [orders]);

  const tickInterval = barData.length > 6 ? 1 : 0;

  const metricCards = useMemo(() => [
    {
      title: 'Receita Total',
      value: receitas,
      icon: TrendingUp,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      subtitle: 'total de receitas do período',
      prefix: 'R$ ',
      decimals: 2,
    },
    {
      title: 'Despesas Totais',
      value: despesas,
      icon: TrendingDown,
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
      subtitle: 'total de despesas do período',
      prefix: 'R$ ',
      decimals: 2,
    },
    {
      title: 'Lucro Líquido',
      value: lucro,
      icon: DollarSign,
      color: '#fc6901',
      gradient: 'linear-gradient(135deg, #fc6901, #e55a00)',
      subtitle: 'receitas - despesas',
      prefix: 'R$ ',
      decimals: 2,
    },
  ], [receitas, despesas, lucro]);

  return (
    <div className="financeiro-page">
      {/* Header */}
      <div className="financeiro-header">
        <div>
          <h1>Financeiro</h1>
          <p>Resumo financeiro da operação</p>
        </div>
        <div className="financeiro-header-actions">
          <div className="period-filter">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                className={`period-btn ${period === p.key ? 'active' : ''}`}
                onClick={() => setPeriod(p.key)}
              >
                {p.key === 'week' && <CalendarDays size={14} />}
                {p.key === 'month' && <BarChart3 size={14} />}
                {p.key === 'year' && <TrendingUp size={14} />}
                {p.label}
              </button>
            ))}
          </div>
          <button className="refresh-btn" onClick={() => setPeriod(period)} title="Atualizar dados">
            <RefreshCw size={16} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Summary line */}
      <div className="financeiro-summary-bar">
        <Receipt size={16} />
        <span>
          <strong>{totalTransacoes}</strong> transações no período
        </span>
      </div>

      {/* Metrics Cards */}
      <div className="financeiro-metrics">
        {metricCards.map((metric, index) => (
          <div
            key={index}
            className="metric-card"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="metric-icon" style={{ background: metric.gradient }}>
              <metric.icon size={20} color="#fff" />
            </div>
            <div className="metric-content">
              <div className="metric-value">
                <AnimatedCounter
                  value={metric.value}
                  prefix={metric.prefix}
                  decimals={metric.decimals}
                />
              </div>
              <div className="metric-title">{metric.title}</div>
              <div className="metric-subtitle">{metric.subtitle}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico de Linha — Faturamento Diário do Mês */}
      <div className="financeiro-chart-section">
        <div className="chart-section-header">
          <h3><Activity size={18} /> Faturamento Diário</h3>
          <div className="chart-legend-inline">
            <span className="legend-item">
              <span className="legend-dot" style={{ background: '#10b981' }} />
              Receitas
            </span>
            <span className="legend-item">
              <span className="legend-dot" style={{ background: '#ef4444' }} />
              Despesas
            </span>
          </div>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} stroke="var(--border)" axisLine={{ stroke: 'var(--border)', strokeOpacity: 0.5 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} stroke="var(--border)" tickFormatter={(v) => `R$${v}`} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip formatter={(v) => formatCurrency(v)} />} cursor={{ fill: 'var(--bg-tertiary)', opacity: 0.5 }} />
              <Line type="monotone" dataKey="receita" name="Receitas" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="despesa" name="Despesas" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Barras — Receitas vs Despesas por Semana */}
      <div className="financeiro-chart-section">
        <div className="chart-section-header">
          <h3><ChartIcon size={18} /> Receitas vs Despesas por Semana</h3>
          <div className="chart-legend-inline">
            <span className="legend-item">
              <span className="legend-dot" style={{ background: '#10b981' }} />
              Receitas
            </span>
            <span className="legend-item">
              <span className="legend-dot" style={{ background: '#ef4444' }} />
              Despesas
            </span>
          </div>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} barGap={4} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="semana" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} stroke="var(--border)" interval={tickInterval} axisLine={{ stroke: 'var(--border)', strokeOpacity: 0.5 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} stroke="var(--border)" tickFormatter={(v) => `R$${v}`} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip formatter={(v) => formatCurrency(v)} />} cursor={{ fill: 'var(--bg-tertiary)', opacity: 0.5 }} />
              <Bar dataKey="receita" name="Receitas" radius={[4, 4, 0, 0]} fill="#10b981" maxBarSize={48} />
              <Bar dataKey="despesa" name="Despesas" radius={[4, 4, 0, 0]} fill="#ef4444" maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Área — Lucro Acumulado do Ano */}
      <div className="financeiro-chart-section">
        <div className="chart-section-header">
          <h3><Activity size={18} /> Lucro Acumulado do Ano</h3>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={areaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} stroke="var(--border)" axisLine={{ stroke: 'var(--border)', strokeOpacity: 0.5 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} stroke="var(--border)" tickFormatter={(v) => `R$${v}`} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip formatter={(v) => formatCurrency(v)} />} cursor={{ fill: 'var(--bg-tertiary)', opacity: 0.5 }} />
              <defs>
                <linearGradient id="lucroGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fc6901" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#fc6901" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="lucro" name="Lucro Acumulado" stroke="#fc6901" strokeWidth={2} fill="url(#lucroGradient)" dot={{ r: 3, fill: '#fc6901' }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}