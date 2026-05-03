import React, { useState, useEffect } from 'react';
import { ShoppingBag, TrendingUp, TrendingDown } from 'lucide-react';

const OrderStats: React.FC = () => {
  const [overallTotal, setOverallTotal] = useState(0);
  const [ordersThisMonth, setOrdersThisMonth] = useState(0);
  const [ordersLastMonth, setOrdersLastMonth] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchOrderStats();
  }, []);

  const fetchOrderStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/analytics/dashboard/stats/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOverallTotal(data.orders.total);
        setOrdersThisMonth(data.orders.this_month);
        setOrdersLastMonth(data.orders.last_month);
      }
    } catch (error) {
      console.error('Failed to fetch order stats:', error);
    }
  };

  const percentageChange = ordersLastMonth > 0
    ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth * 100).toFixed(1)
    : '0';
  const isPositive = parseFloat(percentageChange) >= 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-100">
      <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-blue-100/60 blur-2xl transition-opacity duration-300 group-hover:opacity-80" />
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400 to-indigo-600" />

      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Orders</p>
          <div className="rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 p-1.5 shadow-sm">
            <ShoppingBag size={16} className="text-blue-600" />
          </div>
        </div>

        <div className="mb-3 border-b border-dashed border-gray-200 pb-3">
          <p className="mb-0.5 text-xs font-medium text-gray-500">Total</p>
          <p className="bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-2xl font-extrabold text-transparent">
            {overallTotal.toLocaleString()}
          </p>
        </div>

        <div className="mb-3 grid grid-cols-2 divide-x divide-gray-100 gap-3">
          <div>
            <p className="mb-1 text-xs font-medium text-gray-500">This Month</p>
            <p className="text-sm font-bold text-gray-900">{ordersThisMonth.toLocaleString()}</p>
          </div>
          <div className="pl-3">
            <p className="mb-1 text-xs font-medium text-gray-500">Last Month</p>
            <p className="text-sm font-bold text-gray-500">{ordersLastMonth.toLocaleString()}</p>
          </div>
        </div>

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

export default OrderStats;
