import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, Package } from 'lucide-react';

interface LowStockItem {
  id: number;
  name: string;
  current_stock: number;
  minimum_stock: number;
  status: string;
}

const LowStockAlert: React.FC = () => {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchLowStockAlerts();
  }, []);

  const fetchLowStockAlerts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/analytics/low-stock-alerts/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLowStockItems(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch low stock alerts:', error);
    }
  };

  const getStockStatus = (current: number = 0, minimum: number = 50) => {
    const percentage = (current / minimum) * 100;
    if (percentage < 15)
      return {
        level: 'critical',
        label: 'Critical',
        color: 'text-red-700',
        bg: 'bg-gradient-to-br from-red-50 to-rose-50',
        bar: 'bg-gradient-to-r from-red-500 to-rose-600',
        border: 'border-l-red-500',
        chip: 'bg-red-100 text-red-700 ring-red-200',
        pulse: 'animate-pulse',
      };
    if (percentage < 40)
      return {
        level: 'warning',
        label: 'Warning',
        color: 'text-orange-700',
        bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
        bar: 'bg-gradient-to-r from-orange-500 to-amber-500',
        border: 'border-l-orange-500',
        chip: 'bg-orange-100 text-orange-700 ring-orange-200',
        pulse: '',
      };
    return {
      level: 'low',
      label: 'Low',
      color: 'text-yellow-700',
      bg: 'bg-gradient-to-br from-yellow-50 to-amber-50/50',
      bar: 'bg-gradient-to-r from-yellow-400 to-amber-500',
      border: 'border-l-yellow-500',
      chip: 'bg-yellow-100 text-yellow-700 ring-yellow-200',
      pulse: '',
    };
  };

  const sortedItems = [...lowStockItems].sort((a, b) => {
    const statusA = getStockStatus(a.current_stock, a.minimum_stock);
    const statusB = getStockStatus(b.current_stock, b.minimum_stock);
    const statusOrder = { critical: 0, warning: 1, low: 2 };
    const statusDiff =
      statusOrder[statusA.level as keyof typeof statusOrder] -
      statusOrder[statusB.level as keyof typeof statusOrder];
    if (statusDiff !== 0) return statusDiff;
    return (a.current_stock / a.minimum_stock) * 100 - (b.current_stock / b.minimum_stock) * 100;
  });

  const criticalCount = sortedItems.filter(item => (item.current_stock / item.minimum_stock) * 100 < 15).length;

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg sm:p-6">
      <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-red-50/70 blur-3xl" />

      <div className="relative flex flex-col">
        <div className="mb-5 flex items-start justify-between gap-3 sm:mb-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-gradient-to-br from-red-100 to-rose-100 p-2.5 shadow-sm ring-1 ring-red-200/50">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 sm:text-lg lg:text-xl">Low Stock Alert</h3>
              <p className="mt-0.5 text-xs font-medium text-gray-500">
                {lowStockItems.length} items below minimum
              </p>
            </div>
          </div>
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 px-2.5 py-1.5 shadow-sm">
              <TrendingDown size={14} className="text-white" />
              <span className="text-xs font-bold text-white">{criticalCount} Critical</span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto pr-1" style={{ maxHeight: '24rem' }}>
          {sortedItems.map(item => {
            const stockPercentage = (item.current_stock / item.minimum_stock) * 100;
            const status = getStockStatus(item.current_stock, item.minimum_stock);

            return (
              <div
                key={item.id}
                className={`group/item rounded-xl border-l-4 ${status.border} ${status.bg} p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-4`}
              >
                <div className="mb-2.5 flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Package size={14} className={`flex-shrink-0 ${status.color}`} />
                    <p className="truncate text-sm font-bold text-gray-900">{item.name}</p>
                  </div>
                  <p className={`flex-shrink-0 text-sm font-extrabold ${status.color}`}>
                    {stockPercentage.toFixed(0)}%
                  </p>
                </div>

                <div className="mb-2 flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ring-1 ${status.chip} ${
                      status.level === 'critical' ? status.pulse : ''
                    }`}
                  >
                    {status.label}
                  </span>
                  <p className="text-xs font-medium text-gray-600">
                    <span className="font-bold text-gray-900">{item.current_stock}</span>
                    <span className="text-gray-400"> / {item.minimum_stock} units</span>
                  </p>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200/70">
                  <div
                    className={`h-full rounded-full shadow-sm transition-all duration-500 ${status.bar}`}
                    style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LowStockAlert;
