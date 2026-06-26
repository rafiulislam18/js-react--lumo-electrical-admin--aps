import React, { useState, useEffect, useId } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { authenticatedFetch } from '../lib/api';

interface OrderStats {
  total: number;
  order_placed: number;
  assigned_courier: number;
  delivered: number;
}

interface OrdersPageStatsProps {
  /** Status breakdown already fetched by the Orders page (null until loaded). */
  stats: OrderStats | null;
}

interface TrendPoint {
  label: string;
  value: number;
}

/** Inline SVG sparkline from a series of values. */
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  // useId() — stable, always-valid gradient id. (Deriving it from `color` broke
  // once colors became rgb(var(--…)) strings, yielding invalid url(#…) refs.)
  const gid = useId();
  if (data.length < 2) return null;
  const w = 100;
  const h = 32;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - ((v - min) / range) * h]);
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `0,${h} ${line} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-9 w-full">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

/** Card chrome shared by all four tiles. */
const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col gap-3 rounded-card border border-line bg-panel px-4 py-3.5 min-w-0">
    {children}
  </div>
);

const fmtCompact = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  return n.toLocaleString();
};

const Delta: React.FC<{ pct: number }> = ({ pct }) => {
  const positive = pct >= 0;
  return (
    <span className={`inline-flex shrink-0 items-center gap-[3px] font-mono text-[11.5px] font-semibold ${positive ? 'text-pos' : 'text-neg'}`}>
      {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {positive ? '+' : ''}{pct.toFixed(1)}%
    </span>
  );
};

const growth = (series: number[]) => {
  if (series.length < 2) return 0;
  const last = series[series.length - 1];
  const prev = series[series.length - 2];
  if (prev <= 0) return last > 0 ? 100 : 0;
  return ((last - prev) / prev) * 100;
};

const OrdersPageStats: React.FC<OrdersPageStatsProps> = ({ stats }) => {
  const [orderTrend, setOrderTrend] = useState<TrendPoint[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<TrendPoint[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersRes, revenueRes] = await Promise.all([
          authenticatedFetch('/analytics/orders-chart/?period=monthly'),
          authenticatedFetch('/analytics/revenue-chart/?period=monthly'),
        ]);
        if (ordersRes.ok) {
          const d = await ordersRes.json();
          setOrderTrend((d.data || []).map((p: { label: string; orders: number }) => ({ label: p.label, value: p.orders })));
        }
        if (revenueRes.ok) {
          const d = await revenueRes.json();
          setRevenueTrend((d.data || []).map((p: { label: string; revenue: string }) => ({ label: p.label, value: parseFloat(p.revenue) || 0 })));
        }
      } catch (error) {
        console.error('Failed to load order trends:', error);
      }
    };
    load();
  }, []);

  const orderSeries = orderTrend.map(p => p.value);
  const revenueSeries = revenueTrend.map(p => p.value);
  const orders12m = orderSeries.reduce((a, b) => a + b, 0);
  const revenue12m = revenueSeries.reduce((a, b) => a + b, 0);

  // Fulfilment breakdown
  const placed = stats?.order_placed ?? 0;
  const assigned = stats?.assigned_courier ?? 0;
  const delivered = stats?.delivered ?? 0;
  const open = placed + assigned; // not yet delivered
  const mixTotal = placed + assigned + delivered;

  // Awaiting courier ring: placed (awaiting) out of all open orders
  const ringPct = open > 0 ? (placed / open) * 100 : 0;
  const R = 22;
  const C = 2 * Math.PI * R;

  const pct = (n: number) => (mixTotal > 0 ? (n / mixTotal) * 100 : 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
      {/* ORDERS · 12M */}
      <Card>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-mono text-[10.5px] uppercase tracking-[.12em] text-mute">Orders · 12M</span>
          <Delta pct={growth(orderSeries)} />
        </div>
        <p className="font-mono text-[28px] font-semibold leading-none tracking-[-.02em] text-body">
          {fmtCompact(orders12m)}
        </p>
        <Sparkline data={orderSeries} color="rgb(var(--c-accent))" />
      </Card>

      {/* REVENUE · 12M */}
      <Card>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-mono text-[10.5px] uppercase tracking-[.12em] text-mute">Revenue · 12M</span>
          <Delta pct={growth(revenueSeries)} />
        </div>
        <p className="font-mono text-[28px] font-semibold leading-none tracking-[-.02em] text-accent">
          R{fmtCompact(revenue12m)}
        </p>
        <Sparkline data={revenueSeries} color="rgb(var(--c-accent))" />
      </Card>

      {/* AWAITING COURIER */}
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="block font-mono text-[10.5px] uppercase tracking-[.12em] text-mute">Awaiting Courier</span>
            <p className="mt-2 font-mono text-[28px] font-semibold leading-none tracking-[-.02em] text-warn">{placed}</p>
            <p className="mt-2 font-mono text-[10.5px] text-mute">of {open} open orders</p>
          </div>
          <svg width="58" height="58" viewBox="0 0 58 58" className="shrink-0">
            <circle cx="29" cy="29" r={R} fill="none" stroke="rgb(var(--c-line))" strokeWidth="5" />
            <circle
              cx="29" cy="29" r={R} fill="none" stroke="rgb(var(--c-accent))" strokeWidth="5" strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C - (ringPct / 100) * C}
              transform="rotate(-90 29 29)"
              className="transition-all duration-700"
            />
            <text x="29" y="29" textAnchor="middle" dominantBaseline="central" className="fill-body font-mono text-[13px] font-bold">
              {placed}
            </text>
          </svg>
        </div>
      </Card>

      {/* FULFILMENT MIX */}
      <Card>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-mute">Fulfilment Mix</span>
        </div>
        <p className="font-mono text-[26px] font-semibold leading-none tracking-[-.02em] text-body">
          {mixTotal.toLocaleString()} <span className="text-[12px] font-medium text-mute">shown</span>
        </p>
        {/* Stacked bar */}
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-panel2">
          <div className="h-full bg-warn transition-all duration-500" style={{ width: `${pct(placed)}%` }} />
          <div className="h-full bg-info transition-all duration-500" style={{ width: `${pct(assigned)}%` }} />
          <div className="h-full bg-pos transition-all duration-500" style={{ width: `${pct(delivered)}%` }} />
        </div>
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-mute">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px] bg-warn" /> Placed {placed}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px] bg-info" /> Assigned {assigned}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px] bg-pos" /> Delivered {delivered}
          </span>
        </div>
      </Card>
    </div>
  );
};

export default OrdersPageStats;
