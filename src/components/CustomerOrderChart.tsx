import React, { useState, useEffect } from 'react';
import { Users, ShoppingCart } from 'lucide-react';

interface BreakdownItem {
  type: string;
  count: number;
  percentage: number;
}

const CustomerOrderChart: React.FC = () => {
  const [breakdownData, setBreakdownData] = useState<BreakdownItem[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchCustomerOrderBreakdown();
  }, []);

  const fetchCustomerOrderBreakdown = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/analytics/customer-order-breakdown/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBreakdownData(data.breakdown);
        setTotalCustomers(data.total_customers || 0);
      }
    } catch (error) {
      console.error('Failed to fetch customer order breakdown:', error);
    }
  };

  // Find the data for "Ordered This Month"
  const orderedData = breakdownData.find(d => d.type === 'Ordered This Month') || { type: 'Ordered This Month', count: 0, percentage: 0 };
  const notOrderedData = breakdownData.find(d => d.type.includes("Didn't Order")) || { type: "Didn't Order", count: 0, percentage: 0 };

  const withOrdersPercent = orderedData.percentage;
  const withoutOrdersPercent = notOrderedData.percentage;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const withOrdersStrokeDashoffset = circumference - (withOrdersPercent / 100) * circumference;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-purple-50/70 blur-3xl" />

      <div className="relative">
        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 p-2.5 shadow-sm ring-1 ring-purple-200/50">
            <Users size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 lg:text-xl">Customers Breakdown</h3>
            <p className="mt-0.5 text-xs font-medium text-gray-500">Engagement split for this month</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-12 lg:gap-16">
          {/* Circular Chart */}
          <div className="flex flex-col items-center">
            <div className="relative h-52 w-52">
              {/* Soft glow */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-emerald-200/40 to-green-200/40 blur-xl" />
              <svg className="relative h-full w-full -rotate-90 transform" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="16" />
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
                  className="transition-all duration-700"
                  style={{ filter: 'drop-shadow(0 2px 6px rgba(16, 185, 129, 0.35))' }}
                />
                <defs>
                  <linearGradient id="gradientWith" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="bg-gradient-to-br from-emerald-600 to-green-700 bg-clip-text text-4xl font-extrabold text-transparent">
                  {withOrdersPercent.toFixed(0)}%
                </p>
                <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-wider text-gray-500">
                  With Orders
                </p>
              </div>
            </div>
            <p className="mt-5 text-center text-sm text-gray-600">
              Out of <span className="font-bold text-gray-900">{totalCustomers.toLocaleString()}</span> total customers
            </p>
          </div>

          {/* Legend */}
          <div className="w-full space-y-3 sm:w-auto sm:min-w-[220px]">
            {/* Ordered This Month */}
            <div className="rounded-xl border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-md bg-emerald-100 p-1">
                  <ShoppingCart size={14} className="text-emerald-700" />
                </div>
                <p className="text-sm font-semibold text-gray-900">Ordered This Month</p>
              </div>
              <p className="text-2xl font-extrabold text-gray-900">
                {orderedData.count.toLocaleString()}
                <span className="ml-1 text-xs font-medium text-gray-500">customers</span>
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-600"
                    style={{ width: `${withOrdersPercent}%` }}
                  />
                </div>
                <p className="text-xs font-bold text-emerald-700">{withOrdersPercent.toFixed(1)}%</p>
              </div>
            </div>

            {/* Didn't Order */}
            <div className="rounded-xl border-l-4 border-blue-300 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-md bg-blue-100 p-1">
                  <ShoppingCart size={14} className="text-blue-600" />
                </div>
                <p className="text-sm font-semibold text-gray-900">Didn't Order</p>
              </div>
              <p className="text-2xl font-extrabold text-gray-900">
                {notOrderedData.count.toLocaleString()}
                <span className="ml-1 text-xs font-medium text-gray-500">customers</span>
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gray-300 to-gray-400"
                    style={{ width: `${withoutOrdersPercent}%` }}
                  />
                </div>
                <p className="text-xs font-bold text-gray-600">{withoutOrdersPercent.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderChart;
