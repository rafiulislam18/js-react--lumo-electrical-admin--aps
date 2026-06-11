import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, TrendingDown } from 'lucide-react';
import { authenticatedFetch } from '../lib/api';

const CustomerStats: React.FC = () => {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [newCustomersThisMonth, setNewCustomersThisMonth] = useState(0);
  const [newCustomersLastMonth, setNewCustomersLastMonth] = useState(0);

  useEffect(() => {
    fetchCustomerStats();
  }, []);

  const fetchCustomerStats = async () => {
    try {
      const response = await authenticatedFetch('/analytics/dashboard/stats/');

      if (response.ok) {
        const data = await response.json();
        setTotalCustomers(data.customers.total);
        setNewCustomersThisMonth(data.customers.this_month);
        setNewCustomersLastMonth(data.customers.last_month);
      }
    } catch (error) {
      console.error('Failed to fetch customer stats:', error);
    }
  };

  const percentageChange = newCustomersLastMonth > 0
    ? ((newCustomersThisMonth - newCustomersLastMonth) / newCustomersLastMonth * 100).toFixed(1)
    : '0';
  const isPositive = parseFloat(percentageChange) >= 0;

  return (
    <div className="rounded-card border border-line bg-panel px-4 py-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[.12em] text-mute">
          <Users size={12} className="text-accent" />
          Customers
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
        {totalCustomers.toLocaleString()}
      </p>

      {/* This Month vs Last Month */}
      <div className="mt-3 flex items-center justify-between border-t border-line pt-2 font-mono text-[11px] text-dim">
        <span>
          +{newCustomersThisMonth}
          <span className="text-mute"> mo</span>
        </span>
        <span className="text-mute">prev +{newCustomersLastMonth}</span>
      </div>
    </div>
  );
};

export default CustomerStats;
