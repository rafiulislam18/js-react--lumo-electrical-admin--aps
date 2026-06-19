import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../lib/api';
import AreaChart from './AreaChart';
import ChartPeriodToggle, { ChartPeriod } from './ChartPeriodToggle';

const OrderChart: React.FC = () => {
  const [chartData, setChartData] = useState<Array<{ label: string; value: number }>>([]);
  const [period, setPeriod] = useState<ChartPeriod>('monthly');

  useEffect(() => {
    fetchOrderChart();
  }, [period]);

  const fetchOrderChart = async () => {
    try {
      const response = await authenticatedFetch(`/analytics/orders-chart/?period=${period}`);

      if (response.ok) {
        const data = await response.json();
        setChartData(data.data.map((item: any) => ({
          label: item.label || item.month,
          value: item.orders,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch orders chart:', error);
    }
  };

  return (
    <div className="flex min-w-0 flex-col rounded-card border border-line bg-panel">
      {/* Panel header */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-[11px]">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-dim">
          Orders Trend
        </span>
        <ChartPeriodToggle value={period} onChange={setPeriod} />
      </div>

      <div className="min-w-0 flex-1 p-3">
        {chartData.length === 0 ? (
          <div className="animate-pulse py-6 text-center font-mono text-xs uppercase tracking-[.1em] text-mute">
            Loading...
          </div>
        ) : (
          <AreaChart
            data={chartData}
            height={74}
            format={(v) => `${v.toLocaleString()} orders`}
          />
        )}
      </div>
    </div>
  );
};

export default OrderChart;
