import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, Package } from 'lucide-react';
import { authenticatedFetch } from '../lib/api';

interface LowStockItem {
  id: number;
  name: string;
  current_stock: number;
  minimum_stock: number;
  status: string;
}

interface LowStockAlertProps {
  /** Render only the rows (no panel chrome) — used inside the dashboard modal. */
  bare?: boolean;
  /** Reports the number of low-stock items upward (dock button counts). */
  onCountChange?: (count: number) => void;
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ bare = false, onCountChange }) => {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchLowStockAlerts();
  }, []);

  // Report the true total (not just the ≤10 shown) so dashboard badges stay accurate
  useEffect(() => {
    onCountChange?.(totalCount);
  }, [totalCount, onCountChange]);

  const fetchLowStockAlerts = async () => {
    try {
      const response = await authenticatedFetch('/analytics/low-stock-alerts/');

      if (response.ok) {
        const data = await response.json();
        setLowStockItems(data.products);
        setTotalCount(data.count ?? data.products.length);
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
        color: 'text-neg',
        bar: 'bg-neg',
        border: 'border-l-neg',
        chip: 'text-neg bg-neg/[.13] border border-neg/[.28]',
        pulse: 'animate-pulse',
      };
    if (percentage < 40)
      return {
        level: 'warning',
        label: 'Warning',
        color: 'text-warn',
        bar: 'bg-warn',
        border: 'border-l-warn',
        chip: 'text-warn bg-warn/[.13] border border-warn/[.28]',
        pulse: '',
      };
    return {
      level: 'low',
      label: 'Low',
      color: 'text-accent',
      bar: 'bg-accent',
      border: 'border-l-accent',
      chip: 'text-accent bg-accent/[.13] border border-accent/[.28]',
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

  const rows = sortedItems.map(item => {
    const stockPercentage = (item.current_stock / item.minimum_stock) * 100;
    const status = getStockStatus(item.current_stock, item.minimum_stock);

    return (
      <div
        key={item.id}
        className={`rounded-lg border border-line border-l-2 ${status.border} bg-panel2 px-3.5 py-[13px]`}
      >
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Package size={14} className={`flex-shrink-0 ${status.color}`} />
            <p className="truncate text-[13px] font-semibold text-body">{item.name}</p>
          </div>
          <p className={`flex-shrink-0 font-mono text-sm font-bold ${status.color}`}>
            {stockPercentage.toFixed(0)}%
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={`inline-flex whitespace-nowrap rounded-[5px] px-2 py-[3px] font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] ${status.chip} ${
              status.level === 'critical' ? status.pulse : ''
            }`}
          >
            {status.label}
          </span>
          <div className="h-[5px] min-w-[60px] flex-1 overflow-hidden rounded-full bg-panel">
            <div
              className={`h-full rounded-full transition-all duration-500 ${status.bar}`}
              style={{ width: `${Math.min(stockPercentage, 100)}%` }}
            />
          </div>
          <p className="whitespace-nowrap font-mono text-[11px] text-dim">
            {item.current_stock}
            <span className="text-mute"> / {item.minimum_stock} units</span>
          </p>
        </div>
      </div>
    );
  });

  const empty = (
    <div className="py-[54px] text-center text-mute">
      <Package size={30} className="mx-auto opacity-50" />
      <p className="mt-3 text-[13.5px] font-semibold text-dim">Stock levels healthy</p>
      <p className="mt-1 text-xs">No items below minimum level</p>
    </div>
  );

  if (bare) {
    return sortedItems.length > 0 ? <div className="space-y-2.5">{rows}</div> : empty;
  }

  return (
    <div className="flex min-w-0 flex-col rounded-card border border-line bg-panel">
      {/* Panel header */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-[11px]">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-dim">
          <AlertTriangle size={13} className="text-warn" />
          Low Stock
          <span className="font-mono text-[10.5px] normal-case tracking-normal text-mute">
            {totalCount} below minimum
          </span>
        </span>
        {criticalCount > 0 && (
          <span className="inline-flex items-center gap-[5px] whitespace-nowrap rounded-[5px] border border-neg/[.28] bg-neg/[.13] px-2 py-[3px] font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] text-neg">
            <TrendingDown size={12} />
            {criticalCount} Critical
          </span>
        )}
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto p-4" style={{ maxHeight: '24rem' }}>
        {rows}
      </div>

      {sortedItems.length === 0 && empty}
    </div>
  );
};

export default LowStockAlert;
