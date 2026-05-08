import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, TrendingDown } from 'lucide-react';
import { authenticatedFetch } from '../lib/api';

const CustomerStats: React.FC = () => {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [newCustomersThisMonth, setNewCustomersThisMonth] = useState(0);
  const [newCustomersLastMonth, setNewCustomersLastMonth] = useState(0);

  useEffect(() => {
    fetchCustomerStats();
  }, []);

  const fetchCustomerStats = async () => {
    try {
      const response = await authenticatedFetch('/analytics/dashboard/stats/');

      if (response.ok) {
        const data = await response.json();
        setTotalCustomers(data.customers.total);
        setNewCustomersThisMonth(data.customers.this_month);
        setNewCustomersLastMonth(data.customers.last_month);
      }
    } catch (error) {
      console.error('Failed to fetch customer stats:', error);
    }
  };

  const percentageChange = newCustomersLastMonth > 0
    ? ((newCustomersThisMonth - newCustomersLastMonth) / newCustomersLastMonth * 100).toFixed(1)
    : '0';
  const isPositive = parseFloat(percentageChange) >= 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/40 hover:shadow-lg hover:shadow-violet-500/10">
      <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-violet-500/15 blur-2xl transition-opacity duration-300 group-hover:opacity-80" />
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-violet-400 to-fuchsia-500" />

      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Customers</p>
          <div className="rounded-lg bg-violet-500/15 p-1.5 ring-1 ring-violet-400/20">
            <Users size={16} className="text-violet-300" />
          </div>
        </div>

        <div className="mb-3 border-b border-dashed border-slate-700/60 pb-3">
          <p className="mb-0.5 text-xs font-medium text-slate-400">Total</p>
          <p className="bg-gradient-to-br from-white to-slate-300 bg-clip-text text-2xl font-extrabold text-transparent">
            {totalCustomers.toLocaleString()}
          </p>
        </div>

        <div className="mb-3 grid grid-cols-2 divide-x divide-slate-700/60 gap-3">
          <div>
            <p className="mb-1 text-xs font-medium text-slate-400">This Month</p>
            <p className="text-sm font-bold text-white">+{newCustomersThisMonth}</p>
          </div>
          <div className="pl-3">
            <p className="mb-1 text-xs font-medium text-slate-400">Last Month</p>
            <p className="text-sm font-bold text-slate-400">+{newCustomersLastMonth}</p>
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

export default CustomerStats;
