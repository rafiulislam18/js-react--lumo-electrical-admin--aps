import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { authenticatedFetch } from '../lib/api';

const formatCurrency = (value: number): string => {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(1) + 'B';
  } else if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  } else {
    return value.toFixed(0);
  }
};

const RevenueStats: React.FC = () => {
  const [overallTotal, setOverallTotal] = useState(0);
  const [revenueThisMonth, setRevenueThisMonth] = useState(0);
  const [revenueLastMonth, setRevenueLastMonth] = useState(0);

  useEffect(() => {
    fetchRevenueStats();
  }, []);

  const fetchRevenueStats = async () => {
    try {
      const response = await authenticatedFetch('/analytics/dashboard/stats/');

      if (response.ok) {
        const data = await response.json();
        setOverallTotal(parseFloat(data.revenue.total));
        setRevenueThisMonth(parseFloat(data.revenue.this_month));
        setRevenueLastMonth(parseFloat(data.revenue.last_month));
      }
    } catch (error) {
      console.error('Failed to fetch revenue stats:', error);
    }
  };

  const percentageChange = revenueLastMonth > 0
    ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(1)
    : '0';
  const isPositive = parseFloat(percentageChange) >= 0;

  return (
    <div className="rounded-card border border-line bg-panel px-4 py-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[.12em] text-mute">
          <DollarSign size={12} className="text-accent" />
          Revenue
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
        R{formatCurrency(overallTotal)}
      </p>

      {/* This Month vs Last Month */}
      <div className="mt-3 flex items-center justify-between border-t border-line pt-2 font-mono text-[11px] text-dim">
        <span>
          R{formatCurrency(revenueThisMonth)}
          <span className="text-mute"> mo</span>
        </span>
        <span className="text-mute">prev R{formatCurrency(revenueLastMonth)}</span>
      </div>
    </div>
  );
};

export default RevenueStats;
