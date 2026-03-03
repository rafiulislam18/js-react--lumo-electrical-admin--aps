import React from 'react';
import { Users } from 'lucide-react';

const CustomerOrderChart: React.FC = () => {
  const totalCustomers = 10243;
  const customersWithOrders = 7892;
  const customersWithoutOrders = totalCustomers - customersWithOrders;

  const colors = {
    with: 'bg-gradient-to-r from-emerald-500 to-green-500',
    without: 'bg-gradient-to-r from-gray-300 to-gray-400',
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-6 lg:mb-8">
        <div className="p-2.5 bg-purple-100 rounded-lg">
          <Users size={20} className="text-purple-600" />
        </div>
        <h3 className="text-xl lg:text-2xl font-bold text-gray-900">Total Customers vs Orders</h3>
      </div>

      <div className="space-y-6">
        {/* Total Customers */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full" />
              <span className="text-sm font-medium text-gray-700">Customers who placed orders</span>
            </div>
            <span className="text-lg font-bold text-gray-900">{customersWithOrders.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div 
              className={`h-full ${colors.with} transition-all duration-500`}
              style={{ width: `${(customersWithOrders / totalCustomers) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">{((customersWithOrders / totalCustomers) * 100).toFixed(1)}% of total customers</p>
        </div>

        {/* Customers without orders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full" />
              <span className="text-sm font-medium text-gray-700">No orders yet</span>
            </div>
            <span className="text-lg font-bold text-gray-900">{customersWithoutOrders.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div 
              className={`h-full ${colors.without} transition-all duration-500`}
              style={{ width: `${(customersWithoutOrders / totalCustomers) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">{((customersWithoutOrders / totalCustomers) * 100).toFixed(1)}% of total customers</p>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mt-6">
          <p className="text-sm text-gray-600">
            Out of <span className="font-semibold text-gray-900">{totalCustomers.toLocaleString()}</span> total customers, 
            <span className="font-semibold text-emerald-600"> {customersWithOrders.toLocaleString()}</span> have placed at least one order this month.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderChart;
