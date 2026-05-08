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

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/10">
      <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-cyan-500/15 blur-2xl transition-opacity duration-300 group-hover:opacity-80" />
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-400 to-sky-500" />

      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Orders</p>
          <div className="rounded-lg bg-cyan-500/15 p-1.5 ring-1 ring-cyan-400/20">
            <ShoppingBag size={16} className="text-cyan-300" />
          </div>
        </div>

        <div className="mb-3 border-b border-dashed border-slate-700/60 pb-3">
          <p className="mb-0.5 text-xs font-medium text-slate-400">Total</p>
          <p className="bg-gradient-to-br from-white to-slate-300 bg-clip-text text-2xl font-extrabold text-transparent">
            {overallTotal.toLocaleString()}
          </p>
        </div>

        <div className="mb-3 grid grid-cols-2 divide-x divide-slate-700/60 gap-3">
          <div>
            <p className="mb-1 text-xs font-medium text-slate-400">This Month</p>
            <p className="text-sm font-bold text-white">{ordersThisMonth.toLocaleString()}</p>
          </div>
          <div className="pl-3">
            <p className="mb-1 text-xs font-medium text-slate-400">Last Month</p>
            <p className="text-sm font-bold text-slate-400">{ordersLastMonth.toLocaleString()}</p>
          </div>
        </div>

        <div
          className={`flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
            isPositive
              ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30'
              : 'bg-red-500/15 text-red-300 ring-red-400/30'
          }`}
        >
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {isPositive ? '+' : ''}
          {percentageChange}% vs last month
        </div>
      </div>
    </div>
  );
};

export default OrderStats;
