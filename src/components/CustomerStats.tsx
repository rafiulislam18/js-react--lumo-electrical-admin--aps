import React from 'react';
import { Users, TrendingUp, TrendingDown } from 'lucide-react';

const CustomerStats: React.FC = () => {
  const totalCustomers = 10243;
  const newCustomersThisMonth = 154;
  const newCustomersLastMonth = 128;
  const percentageChange = ((newCustomersThisMonth - newCustomersLastMonth) / newCustomersLastMonth * 100).toFixed(1);
  const isPositive = parseFloat(percentageChange) >= 0;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Customers</p>
        <div className="p-1.5 bg-purple-100 rounded-lg">
          <Users size={16} className="text-purple-600" />
        </div>
      </div>

      {/* Total */}
      <div className="mb-3 pb-3 border-b border-gray-100">
        <p className="text-xs text-gray-500 font-medium mb-0.5">Total</p>
        <p className="text-xl font-bold text-gray-900">{totalCustomers.toLocaleString()}</p>
      </div>

      {/* New Customers This Month vs Last Month */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">This Month</p>
          <p className="text-sm font-semibold text-gray-900">+{newCustomersThisMonth}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Last Month</p>
          <p className="text-sm font-semibold text-gray-900">+{newCustomersLastMonth}</p>
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

export default CustomerStats;
