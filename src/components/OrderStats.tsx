import React, { useState, useEffect } from 'react';
import { ShoppingBag, TrendingUp, TrendingDown } from 'lucide-react';
import { authenticatedFetch } from '../lib/api';

const OrderStats: React.FC = () => {
  const [overallTotal, setOverallTotal] = useState(0);
  const [ordersThisMonth, setOrdersThisMonth] = useState(0);
  const [ordersLastMonth, setOrdersLastMonth] = useState(0);

  useEffect(() => {
    fetchOrderStats();
  }, []);

  const fetchOrderStats = async () => {
    try {
      const response = await authenticatedFetch('/analytics/dashboard/stats/');

      if (response.ok) {
        const data = await response.json();
        setOverallTotal(data.orders.total);
        setOrdersThisMonth(data.orders.this_month);
        setOrdersLastMonth(data.orders.last_month);
      }
    } catch (error) {
      console.error('Failed to fetch order stats:', error);
    }
  };

  const percentageChange = ordersLastMonth > 0
    ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth * 100).toFixed(1)
    : '0';
  const isPositive = parseFloat(percentageChange) >= 0;

  // Relative bar widths: the larger of the two months fills the bar
  const peak = Math.max(ordersThisMonth, ordersLastMonth, 1);
  const thisPct = (ordersThisMonth / peak) * 100;
  const lastPct = (ordersLastMonth / peak) * 100;

  return (
    <div className="flex flex-col gap-3 rounded-card border border-line bg-panel px-4 py-3.5">
      {/* Header: icon chip + label + delta */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] border border-accent/[.28] bg-accent/[.13] text-accent">
            <ShoppingBag size={14} />
          </span>
          <span className="truncate font-mono text-[10.5px] uppercase tracking-[.12em] text-mute">
            Orders · Total
          </span>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-[3px] font-mono text-[11.5px] font-semibold ${
            isPositive ? 'text-pos' : 'text-neg'
          }`}
        >
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {isPositive ? '+' : ''}
          {percentageChange}%
        </span>
      </div>

      {/* Total */}
      <p className="font-mono text-[28px] font-semibold leading-none tracking-[-.02em] text-body">
        {overallTotal.toLocaleString()}
        <span className="ml-1.5 font-mono text-[10px] font-medium uppercase tracking-[.12em] text-mute">
          All-time
        </span>
      </p>

      {/* This month / Last month progress bars */}
      <div className="flex flex-col gap-2.5 border-t border-line pt-3">
        <div>
          <div className="mb-1 flex items-center justify-between font-mono">
            <span className="text-[10px] uppercase tracking-[.12em] text-mute">This Month</span>
            <span className="text-[11px] font-bold text-body">{ordersThisMonth.toLocaleString()}</span>
          </div>
          <div className="h-[5px] overflow-hidden rounded-full bg-panel2">
            <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${thisPct}%` }} />
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between font-mono">
            <span className="text-[10px] uppercase tracking-[.12em] text-mute">Last Month</span>
            <span className="text-[11px] font-bold text-dim">{ordersLastMonth.toLocaleString()}</span>
          </div>
          <div className="h-[5px] overflow-hidden rounded-full bg-panel2">
            <div className="h-full rounded-full bg-mute transition-all duration-500" style={{ width: `${lastPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStats;
