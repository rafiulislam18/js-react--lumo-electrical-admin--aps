import React, { useState, useEffect } from 'react';
import { Users, ShoppingCart } from 'lucide-react';
import { authenticatedFetch } from '../lib/api';

interface BreakdownItem {
  type: string;
  count: number;
  percentage: number;
}

const CustomerOrderChart: React.FC = () => {
  const [breakdownData, setBreakdownData] = useState<BreakdownItem[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);

  useEffect(() => {
    fetchCustomerOrderBreakdown();
  }, []);

  const fetchCustomerOrderBreakdown = async () => {
    try {
      const response = await authenticatedFetch('/analytics/customer-order-breakdown/');

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
    <div className="flex min-w-0 flex-col rounded-card border border-line bg-panel">
      {/* Panel header */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-[11px]">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-dim">
          <Users size={13} className="text-accent" />
          Customer Split
        </span>
        <span className="font-mono text-[11px] text-mute">THIS MONTH</span>
      </div>

      <div className="min-w-0 flex-1 p-4">
        <div className="flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-12 lg:gap-16">
          {/* Circular Chart */}
          <div className="flex flex-col items-center">
            <div className="relative h-52 w-52">
              <svg className="relative h-full w-full -rotate-90 transform" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r={radius} fill="none" stroke="#181b21" strokeWidth="16" />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke="#f6a821"
                  strokeWidth="16"
                  strokeDasharray={circumference}
                  strokeDashoffset={withOrdersStrokeDashoffset}
                  strokeLinecap="butt"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-mono text-3xl font-semibold tracking-[-.02em] text-body">
                  {withOrdersPercent.toFixed(0)}%
                </p>
                <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[.12em] text-mute">
                  With Orders
                </p>
              </div>
            </div>
            <p className="mt-5 text-center text-sm text-dim">
              Out of{' '}
              <span className="font-mono font-bold text-body">{totalCustomers.toLocaleString()}</span>{' '}
              total customers
            </p>
          </div>

          {/* Legend */}
          <div className="w-full space-y-3 sm:w-auto sm:min-w-[220px]">
            {/* Ordered This Month */}
            <div className="rounded-lg border border-line border-l-2 border-l-accent bg-panel2 p-3.5">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-[9px] w-[9px] rounded-[2px] bg-accent" />
                <ShoppingCart size={13} className="text-accent" />
                <p className="font-mono text-xs font-semibold text-body">Ordered This Month</p>
              </div>
              <p className="font-mono text-2xl font-semibold tracking-[-.02em] text-body">
                {orderedData.count.toLocaleString()}
                <span className="ml-1.5 font-mono text-[10.5px] uppercase tracking-[.08em] text-mute">customers</span>
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-panel">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${withOrdersPercent}%` }}
                  />
                </div>
                <p className="font-mono text-[11px] font-bold text-accent">{withOrdersPercent.toFixed(1)}%</p>
              </div>
            </div>

            {/* Didn't Order */}
            <div className="rounded-lg border border-line border-l-2 border-l-[#3a3d44] bg-panel2 p-3.5">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-[9px] w-[9px] rounded-[2px] bg-[#3a3d44]" />
                <ShoppingCart size={13} className="text-dim" />
                <p className="font-mono text-xs font-semibold text-body">Didn't Order</p>
              </div>
              <p className="font-mono text-2xl font-semibold tracking-[-.02em] text-body">
                {notOrderedData.count.toLocaleString()}
                <span className="ml-1.5 font-mono text-[10.5px] uppercase tracking-[.08em] text-mute">customers</span>
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-panel">
                  <div
                    className="h-full rounded-full bg-[#3a3d44]"
                    style={{ width: `${withoutOrdersPercent}%` }}
                  />
                </div>
                <p className="font-mono text-[11px] font-bold text-dim">{withoutOrdersPercent.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderChart;
