import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../lib/api';
import ChartPeriodToggle, { ChartPeriod } from './ChartPeriodToggle';

const formatRand = (value: number): string => {
  if (value >= 1000000000) {
    return 'R' + (value / 1000000000).toFixed(1) + 'B';
  } else if (value >= 1000000) {
    return 'R' + (value / 1000000).toFixed(1) + 'M';
  } else if (value >= 1000) {
    return 'R' + (value / 1000).toFixed(1) + 'K';
  } else {
    return 'R' + value.toFixed(0);
  }
};

const HEIGHT = 186;
const GAP = 0.34; // fraction of each slot left empty (mockup BarChart)

const PERIOD_TITLE: Record<ChartPeriod, string> = {
  monthly: 'Revenue · 12M',
  '30days': 'Revenue · 30D',
  '7days': 'Revenue · 7D',
};

const Chart: React.FC = () => {
  const [hover, setHover] = useState<number | null>(null);
  const [chartData, setChartData] = useState<Array<{ month: string; value: number }>>([]);
  const [period, setPeriod] = useState<ChartPeriod>('monthly');

  useEffect(() => {
    fetchRevenueChart();
  }, [period]);

  const fetchRevenueChart = async () => {
    try {
      const response = await authenticatedFetch(`/analytics/revenue-chart/?period=${period}`);

      if (response.ok) {
        const data = await response.json();
        setChartData(data.data.map((item: any) => ({
          month: item.label || item.month,
          value: parseFloat(item.revenue),
        })));
      }
    } catch (error) {
      console.error('Failed to fetch revenue chart:', error);
    }
  };

  const data = chartData;
  const max = data.length ? Math.max(...data.map(d => d.value)) : 1;
  const n = data.length;
  const slot = n ? 100 / n : 100;
  const bw = slot * (1 - GAP);

  return (
    <div className="flex min-w-0 flex-col rounded-card border border-line bg-panel">
      {/* Panel header */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-[11px]">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-dim">
          {PERIOD_TITLE[period]}
        </span>
        <ChartPeriodToggle value={period} onChange={setPeriod} />
      </div>

      <div className="min-w-0 flex-1 p-4">
        {data.length === 0 ? (
          <div className="animate-pulse py-12 text-center font-mono text-xs uppercase tracking-[.1em] text-mute">
            Loading chart data...
          </div>
        ) : (
          <div className="relative w-full">
            <svg
              width="100%"
              height={HEIGHT}
              viewBox={`0 0 100 ${HEIGHT}`}
              preserveAspectRatio="none"
              className="overflow-visible"
            >
              {/* Gridlines */}
              {[0.25, 0.5, 0.75, 1].map((t, i) => (
                <line
                  key={i}
                  x1={0}
                  x2={100}
                  y1={HEIGHT - t * HEIGHT}
                  y2={HEIGHT - t * HEIGHT}
                  stroke="rgb(var(--c-line))"
                  strokeWidth={0.5}
                  vectorEffect="non-scaling-stroke"
                />
              ))}

              {/* Bars */}
              {data.map((d, i) => {
                const h = (d.value / max) * (HEIGHT - 8);
                const x = i * slot + (slot - bw) / 2;
                const active = hover === i;
                return (
                  <rect
                    key={i}
                    x={x}
                    y={HEIGHT - h}
                    width={bw}
                    height={h}
                    rx={1.33}
                    fill="rgb(var(--c-accent))"
                    opacity={hover === null || active ? 1 : 0.4}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    className="transition-opacity duration-150"
                  />
                );
              })}
            </svg>

            {/* X labels — thin out when there are many bars so they don't collide */}
            <div className="mt-1.5 flex">
              {data.map((d, i) => {
                // Aim for roughly ≤12 visible labels
                const step = Math.ceil(n / 12);
                const show = hover === i || i % step === 0 || i === n - 1;
                return (
                  <div
                    key={i}
                    className={`flex-1 text-center font-mono text-[10px] font-semibold transition-colors duration-150 truncate ${
                      hover === i ? 'text-accent' : 'text-mute'
                    }`}
                  >
                    {show ? d.month : ''}
                  </div>
                );
              })}
            </div>

            {/* Tooltip */}
            {hover !== null && (
              <div
                className="pointer-events-none absolute z-[5] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-[7px] border border-line bg-bg2 px-[9px] py-[5px] text-[11px] font-bold text-body shadow-[0_6px_20px_rgba(0,0,0,.5)]"
                style={{ left: `${hover * slot + slot / 2}%`, top: -6 }}
              >
                <div className="font-mono text-[9.5px] font-semibold text-mute">
                  {data[hover].month}
                </div>
                <div className="font-mono text-accent">{formatRand(data[hover].value)}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chart;
