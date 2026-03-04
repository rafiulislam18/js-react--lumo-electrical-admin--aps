import React from 'react';
import { ShoppingBag, TrendingUp, TrendingDown } from 'lucide-react';

const OrderStats: React.FC = () => {
  const ordersThisMonth = 1234;
  const ordersLastMonth = 1089;
  const percentageChange = ((ordersThisMonth - ordersLastMonth) / ordersLastMonth * 100).toFixed(1);
  const isPositive = parseFloat(percentageChange) >= 0;

  return (
    <div className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Orders</p>
        <div className="p-1 bg-blue-100 rounded-lg">
          <ShoppingBag size={14} className="text-blue-600" />
        </div>
      </div>

      <div className="mb-2">
        <p className="text-lg font-bold text-gray-900">{ordersThisMonth.toLocaleString()}</p>
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

export default OrderStats;
