import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../lib/api';

interface BreakdownItem {
  type: string;
  count: number;
  percentage: number;
}

const formatRand = (value: number): string => {
  if (value >= 1000000) {
    return 'R' + (value / 1000000).toFixed(1) + 'M';
  } else if (value >= 1000) {
    return 'R' + (value / 1000).toFixed(1) + 'K';
  }
  return 'R' + value.toFixed(2);
};

const CustomerOrderChart: React.FC = () => {
  const [breakdownData, setBreakdownData] = useState<BreakdownItem[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState<number | null>(null);

  useEffect(() => {
    fetchCustomerOrderBreakdown();
  }, []);

  const fetchCustomerOrderBreakdown = async () => {
    try {
      const response = await authenticatedFetch('/analytics/customer-order-breakdown/');

      if (response.ok) {
        const data = await response.json();
        setBreakdownData(data.breakdown);
        setTotalCustomers(data.total_customers || 0);
        const avg = parseFloat(data.avg_order_value);
        setAvgOrderValue(Number.isNaN(avg) ? null : avg);
      }
    } catch (error) {
      console.error('Failed to fetch customer order breakdown:', error);
    }
  };

  // Last 30 days' three-way split: returning, new, and didn't order.
  const returningData = breakdownData.find(d => d.type === 'Returning Customers') || { type: 'Returning Customers', count: 0, percentage: 0 };
  const newData = breakdownData.find(d => d.type === 'New Customers') || { type: 'New Customers', count: 0, percentage: 0 };
  const noOrderData = breakdownData.find(d => d.type.includes("Didn't Order")) || { type: "Didn't Order", count: 0, percentage: 0 };

  // Center of the donut shows the share that ordered at all in the last 30 days.
  const orderedPercent = returningData.percentage + newData.percentage;

  // Donut geometry (size 120, thickness 18)
  const size = 120;
  const thickness = 18;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  // Each segment is drawn as a dash of length (pct * circumference), offset by
  // the cumulative length of the segments before it. Negative dashoffset
  // advances the dash clockwise around the (already -90°-rotated) circle.
  const segments = [
    { data: returningData, color: '#f6a821' }, // accent (amber)
    { data: newData, color: '#6aa9ff' },       // blue
    { data: noOrderData, color: '#3a3d44' },   // muted grey
  ];
  let cumulative = 0;
  const arcs = segments.map((seg) => {
    const len = (seg.data.percentage / 100) * circumference;
    const arc = { color: seg.color, len, offset: -cumulative };
    cumulative += len;
    return arc;
  });

  const legend = [
    { label: returningData.type, count: returningData.count, percentage: returningData.percentage, swatch: 'bg-[#f6a821]' },
    { label: newData.type, count: newData.count, percentage: newData.percentage, swatch: 'bg-[#6aa9ff]' },
    { label: noOrderData.type, count: noOrderData.count, percentage: noOrderData.percentage, swatch: 'bg-[#3a3d44]' },
  ];

  return (
    <div className="flex min-w-0 flex-col rounded-card border border-line bg-panel">
      {/* Panel header */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-[11px]">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-dim">
          Customer Split
        </span>
        <span className="font-mono text-[11px] text-mute">LAST 30 DAYS</span>
      </div>

      <div className="min-w-0 flex-1 p-4">
        <div className="flex flex-col items-center gap-[18px] sm:flex-row">
          {/* Donut */}
          <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg className="h-full w-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#181b21"
                strokeWidth={thickness}
              />
              {arcs.map((arc, i) => (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${arc.len} ${circumference - arc.len}`}
                  strokeDashoffset={arc.offset}
                  strokeLinecap="butt"
                  className="transition-all duration-700"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-[22px] font-semibold text-body">
                {orderedPercent.toFixed(0)}%
              </span>
              <span className="font-mono text-[9.5px] uppercase tracking-[.12em] text-mute">
                Ordered
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex w-full min-w-0 flex-1 flex-col gap-2.5">
            {legend.map((b) => (
              <div key={b.label} className="flex items-center gap-2 font-mono">
                <span className={`h-[9px] w-[9px] shrink-0 rounded-[2px] ${b.swatch}`} />
                <span className="min-w-0 flex-1 truncate text-xs text-dim">
                  {b.label}
                  <span className="text-mute"> · {b.count.toLocaleString()}</span>
                </span>
                <span className="text-[13px] font-bold text-body">{b.percentage.toFixed(0)}%</span>
              </div>
            ))}

            <div className="mt-1 border-t border-line pt-2.5 font-mono">
              <span className="text-[9.5px] uppercase tracking-[.12em] text-mute">
                Avg Order Value · Last 30 Days
              </span>
              <div className="mt-1 text-[19px] font-semibold text-body">
                {avgOrderValue !== null ? formatRand(avgOrderValue) : '—'}
              </div>
            </div>

            <p className="font-mono text-[10.5px] text-mute">
              of {totalCustomers.toLocaleString()} total customers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderChart;
