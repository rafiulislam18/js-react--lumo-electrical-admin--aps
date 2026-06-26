import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CustomerStats {
  total: number;
  trade: number;
  retail: number;
  acquisition_series: number[];
  acquisition_change: number | null;
  acquisition_last_12: number;
  new_30d: number;
  returning_30d: number;
  not_ordered: number;
  returning_pct: number;
  avg_order_value: number;
}

interface CustomersPageStatsProps {
  /** Stats already fetched by the Customers page (null until loaded). */
  stats: CustomerStats | null;
}

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col gap-3 rounded-card border border-line bg-panel px-4 py-3.5 min-w-0">
    {children}
  </div>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-mute">{children}</span>
);

/** A compact area sparkline built from an array of values. */
const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
  const W = 240;
  const H = 44;
  const max = Math.max(1, ...data);
  const n = data.length;
  // Map each value to an (x, y) point inside the viewbox
  const pts = data.map((v, i) => {
    const x = n > 1 ? (i / (n - 1)) * W : 0;
    const y = H - (v / max) * (H - 4) - 2; // 2px padding top/bottom
    return [x, y] as const;
  });
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `0,${H} ${line} ${W},${H}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-11">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b9dff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#5b9dff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#spark-fill)" />
      <polyline
        points={line}
        fill="none"
        stroke="#5b9dff"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

const CustomersPageStats: React.FC<CustomersPageStatsProps> = ({ stats }) => {
  const total = stats?.total ?? 0;
  const trade = stats?.trade ?? 0;
  const retail = stats?.retail ?? 0;
  const series = stats?.acquisition_series ?? [];
  const change = stats?.acquisition_change ?? null;
  const newCount = stats?.new_30d ?? 0;
  const returning = stats?.returning_30d ?? 0;
  const notOrdered = stats?.not_ordered ?? 0;
  const returningPct = stats?.returning_pct ?? 0;
  const aov = stats?.avg_order_value ?? 0;

  // Card 2 — segmented bar across the three cohorts
  const cohortTotal = newCount + returning + notOrdered;
  const pct = (n: number) => (cohortTotal > 0 ? (n / cohortTotal) * 100 : 0);

  // Card 3 — ring gauge of trade share
  const typed = trade + retail;
  const tradePct = typed > 0 ? Math.round((trade / typed) * 100) : 0;
  const R = 22;
  const C = 2 * Math.PI * R;
  const dash = (tradePct / 100) * C;

  // Card 4 — compact Rand formatting (R2K, R12.4K, R1.2M)
  const formatRand = (value: number) => {
    if (value >= 1_000_000) return `R${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `R${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
    return `R${Math.round(value)}`;
  };

  const changePositive = (change ?? 0) >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1.6fr_1fr_1.1fr] gap-3 mb-6 lg:mb-8">
      {/* CARD 1 — ACQUISITION · 12M */}
      <Card>
        <div className="flex items-center justify-between gap-2">
          <Label>Acquisition · 12M</Label>
          {change != null && (
            <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold ${changePositive ? 'text-pos' : 'text-neg'}`}>
              {changePositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {changePositive ? '+' : ''}{change}%
            </span>
          )}
        </div>
        <p className="font-mono text-[30px] font-semibold leading-none tracking-[-.02em] text-body">
          {stats ? total.toLocaleString() : '—'}
        </p>
        <div className="mt-auto">
          {series.length > 0 ? <Sparkline data={series} /> : <div className="h-11" />}
        </div>
      </Card>

      {/* CARD 2 — NEW VS RETURNING (last 30 days) */}
      <Card>
        <Label>New vs Returning · 30d</Label>
        <p className="font-mono text-[30px] font-semibold leading-none tracking-[-.02em] text-accent">
          {stats ? `${returningPct}%` : '—'} <span className="text-[14px] font-medium text-dim">returning</span>
        </p>
        {/* Three-segment bar: returning (amber) + new (blue) + not ordered (grey) */}
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-panel2">
          <div className="h-full bg-accent transition-all duration-500" style={{ width: `${pct(returning)}%` }} />
          <div className="h-full bg-info transition-all duration-500" style={{ width: `${pct(newCount)}%` }} />
          <div className="h-full bg-mute/40 transition-all duration-500" style={{ width: `${pct(notOrdered)}%` }} />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-mute">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px] bg-accent" /> Returning {returning}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px] bg-info" /> New {newCount}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px] bg-mute/40" /> Not ordered {notOrdered}
          </span>
        </div>
      </Card>

      {/* CARD 3 — ACCOUNT MIX (trade vs retail) */}
      <Card>
        <Label>Account Mix</Label>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="font-mono text-[30px] font-semibold leading-none tracking-[-.02em] text-accent">
              {stats ? `${tradePct}%` : '—'}
            </p>
            <p className="mt-1.5 font-mono text-[11px] text-mute">trade</p>
          </div>
          {/* Ring gauge */}
          <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0 -rotate-90">
            <circle cx="28" cy="28" r={R} fill="none" stroke="rgb(var(--c-line))" strokeWidth="6" />
            <circle
              cx="28"
              cy="28"
              r={R}
              fill="none"
              stroke="currentColor"
              className="text-accent transition-all duration-500"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${C}`}
            />
          </svg>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-mute">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px] bg-accent" /> Trade {trade}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px] bg-mute/40" /> Retail {retail}
          </span>
        </div>
      </Card>

      {/* CARD 4 — AVG ORDER VALUE (last 30 days) */}
      <Card>
        <Label>Avg Order Value · 30d</Label>
        <p className="font-mono text-[30px] font-semibold leading-none tracking-[-.02em] text-pos">
          {stats ? formatRand(aov) : '—'}
        </p>
        <p className="mt-auto font-mono text-[11px] text-mute">across paid orders in the last 30 days</p>
      </Card>
    </div>
  );
};

export default CustomersPageStats;
