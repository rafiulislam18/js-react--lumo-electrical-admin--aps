import React from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const RevenueStats: React.FC = () => {
  const overallTotal = 892534000;
  const revenueThisMonth = 39403450;
  const revenueLastMonth = 36520000;
  const percentageChange = ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(1);
  const isPositive = parseFloat(percentageChange) >= 0;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Revenue</p>
        <div className="p-1.5 bg-green-100 rounded-lg">
          <DollarSign size={16} className="text-green-600" />
        </div>
      </div>

      {/* Total */}
      <div className="mb-3 pb-3 border-b border-gray-100">
        <p className="text-xs text-gray-500 font-medium mb-0.5">Total</p>
        <p className="text-xl font-bold text-gray-900">${(overallTotal / 1000000).toFixed(1)}M</p>
      </div>

      {/* This Month vs Last Month */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">This Month</p>
          <p className="text-sm font-semibold text-gray-900">${(revenueThisMonth / 1000000).toFixed(1)}M</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Last Month</p>
          <p className="text-sm font-semibold text-gray-900">${(revenueLastMonth / 1000000).toFixed(1)}M</p>
        </div>
      </div>

      {/* Percentage Change */}
      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${
        isPositive 
          ? 'bg-emerald-100 text-emerald-700' 
          : 'bg-red-100 text-red-700'
      }`}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {isPositive ? '+' : ''}{percentageChange}% of last month
      </div>
    </div>
  );
};

export default RevenueStats;
