import React, { useState, useEffect } from 'react';
import { ShoppingBag, TrendingUp, TrendingDown } from 'lucide-react';
import { authenticatedFetch } from '../lib/api';

const OrderStats: React.FC = () => {
  const [overallTotal, setOverallTotal] = useState(0);
  const [ordersThisMonth, setOrdersThisMonth] = useState(0);
  const [ordersLastMonth, setOrdersLastMonth] = useState(0);

  useEffect(() => {
    fetchOrderStats();
  }, []);

  const fetchOrderStats = async () => {
    try {
      const response = await authenticatedFetch('/analytics/dashboard/stats/');

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
    <div className="rounded-card border border-line bg-panel px-4 py-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[.12em] text-mute">
          <ShoppingBag size={12} className="text-accent" />
          Orders
        </span>
        <span
          className={`inline-flex items-center gap-[3px] font-mono text-[11.5px] font-semibold ${
            isPositive ? 'text-pos' : 'text-neg'
          }`}
        >
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {isPositive ? '+' : ''}
          {percentageChange}%
        </span>
      </div>

      {/* Total */}
      <p className="font-mono text-[26px] font-semibold leading-none tracking-[-.02em] text-body">
        {overallTotal.toLocaleString()}
      </p>

      {/* This Month vs Last Month */}
      <div className="mt-3 flex items-center justify-between border-t border-line pt-2 font-mono text-[11px] text-dim">
        <span>
          {ordersThisMonth.toLocaleString()}
          <span className="text-mute"> mo</span>
        </span>
        <span className="text-mute">prev {ordersLastMonth.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default OrderStats;
