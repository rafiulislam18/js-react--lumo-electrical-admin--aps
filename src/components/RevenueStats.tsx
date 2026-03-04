import React from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const RevenueStats: React.FC = () => {
  const revenueThisMonth = 39403450;
  const revenueLastMonth = 36520000;
  const percentageChange = ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(1);
  const isPositive = parseFloat(percentageChange) >= 0;

  return (
    <div className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Revenue</p>
        <div className="p-1 bg-green-100 rounded-lg">
          <DollarSign size={14} className="text-green-600" />
        </div>
      </div>

      <div className="mb-2">
        <p className="text-lg font-bold text-gray-900">${(revenueThisMonth / 1000000).toFixed(1)}M</p>
        <p className="text-xs text-gray-500 mt-0.5">This Month</p>
      </div>

      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold w-fit ${
        isPositive 
          ? 'bg-emerald-100 text-emerald-700' 
          : 'bg-red-100 text-red-700'
      }`}>
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {isPositive ? '+' : ''}{percentageChange}%
      </div>
    </div>
  );
};

export default RevenueStats;
