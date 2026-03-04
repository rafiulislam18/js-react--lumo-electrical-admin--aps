import React from 'react';
import { Users } from 'lucide-react';

const CustomerOrderChart: React.FC = () => {
  const totalCustomers = 10243;
  const customersWithOrders = 7892;
  const customersWithoutOrders = totalCustomers - customersWithOrders;

  const withOrdersPercent = (customersWithOrders / totalCustomers) * 100;
  const withoutOrdersPercent = (customersWithoutOrders / totalCustomers) * 100;

  // SVG circle parameters
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const withOrdersStrokeDashoffset = circumference - (withOrdersPercent / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-purple-100 rounded-lg">
          <Users size={20} className="text-purple-600" />
        </div>
        <h3 className="text-xl lg:text-2xl font-bold text-gray-900">Customers Breakdown</h3>
      </div>

      <div className="flex flex-col sm:flex-row lg:flex-row items-center justify-center gap-10 sm:gap-20">
        {/* Circular Chart */}
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="16"
              />
              {/* Customers with orders segment */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="url(#gradientWith)"
                strokeWidth="16"
                strokeDasharray={circumference}
                strokeDashoffset={withOrdersStrokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradientWith" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold text-gray-900">{withOrdersPercent.toFixed(0)}%</p>
              <p className="text-xs text-gray-500 mt-1">With Orders This Month</p>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-6">
            Out of <span className="font-semibold">{totalCustomers.toLocaleString()}</span> total customers
          </p>
        </div>

        {/* Legend and Stats */}
        <div className="pl-4 pb-4 sm:pl-0 sm:pb-0 space-y-6 w-full sm:w-auto">
          {/* Customers with orders */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500 to-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Placed Orders This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {customersWithOrders.toLocaleString()}
                <span className="text-sm font-normal text-gray-500"> Customers</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">{withOrdersPercent.toFixed(1)}% of total</p>
            </div>
          </div>

          {/* Customers without orders */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-300 to-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Not Ordered Yet</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {customersWithoutOrders.toLocaleString()}
                <span className="text-sm font-normal text-gray-500"> Customers</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">{withoutOrdersPercent.toFixed(1)}% of total</p>
            </div>
          </div>

          {/* Additional insight */}
          {/* <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 mt-6">
            <p className="text-xs text-purple-700">
              <span className="font-semibold">{withOrdersPercent.toFixed(0)}%</span> of your customers have already engaged with your products
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderChart;
