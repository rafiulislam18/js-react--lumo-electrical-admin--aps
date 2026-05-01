import React from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const RevenueStats: React.FC = () => {
  const overallTotal = 892534000;
  const revenueThisMonth = 39403450;
  const revenueLastMonth = 36520000;
  const percentageChange = ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(1);
  const isPositive = parseFloat(percentageChange) >= 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-100">
      {/* Decorative blob */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-emerald-100/60 blur-2xl transition-opacity duration-300 group-hover:opacity-80" />
      {/* Accent bar */}
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 to-green-600" />

      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Revenue</p>
          <div className="rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 p-1.5 shadow-sm">
            <DollarSign size={16} className="text-emerald-600" />
          </div>
        </div>

        {/* Total */}
        <div className="mb-3 border-b border-dashed border-gray-200 pb-3">
          <p className="mb-0.5 text-xs font-medium text-gray-500">Total</p>
          <p className="bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-2xl font-extrabold text-transparent">
            R{(overallTotal / 1000000).toFixed(1)}M
          </p>
        </div>

        {/* This Month vs Last Month */}
        <div className="mb-3 grid grid-cols-2 divide-x divide-gray-100 gap-3">
          <div>
            <p className="mb-1 text-xs font-medium text-gray-500">This Month</p>
            <p className="text-sm font-bold text-gray-900">R{(revenueThisMonth / 1000000).toFixed(1)}M</p>
          </div>
          <div className="pl-3">
            <p className="mb-1 text-xs font-medium text-gray-500">Last Month</p>
            <p className="text-sm font-bold text-gray-500">R{(revenueLastMonth / 1000000).toFixed(1)}M</p>
          </div>
        </div>

        {/* Percentage Change */}
        <div
          className={`flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
            isPositive
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
              : 'bg-red-50 text-red-700 ring-red-200'
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

export default RevenueStats;
