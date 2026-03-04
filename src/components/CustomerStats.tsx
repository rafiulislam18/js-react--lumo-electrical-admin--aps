import React from 'react';
import { Users } from 'lucide-react';

const CustomerStats: React.FC = () => {
  const totalCustomers = 10243;
  const newCustomersThisMonth = 154;

  return (
    <div className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Customers</p>
        <div className="p-1 bg-purple-100 rounded-lg">
          <Users size={14} className="text-purple-600" />
        </div>
      </div>

      <div className="mb-2">
        <p className="text-lg font-bold text-gray-900">{totalCustomers.toLocaleString()}</p>
        <p className="text-xs text-gray-500 mt-0.5">Total Customers</p>
      </div>

      <div className="flex items-center">
        <div className="flex items-center px-1 py-0.5 rounded-full text-xs font-semibold">
          <span className="text-emerald-500 italic">+{newCustomersThisMonth}</span>
        </div>
        <span className="text-xs text-gray-600 italic">This Month</span>
      </div>
    </div>
  );
};

export default CustomerStats;
