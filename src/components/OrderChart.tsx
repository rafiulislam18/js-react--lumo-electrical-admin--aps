import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { authenticatedFetch } from '../lib/api';
import AreaChart from './AreaChart';

const OrderChart: React.FC = () => {
  const [chartData, setChartData] = useState<Array<{ label: string; value: number }>>([]);

  useEffect(() => {
    fetchOrderChart();
  }, []);

  const fetchOrderChart = async () => {
    try {
      const response = await authenticatedFetch('/analytics/orders-chart/?period=monthly');

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

  // Delta: latest month vs previous month
  const now = chartData.length >= 1 ? chartData[chartData.length - 1].value : 0;
  const prev = chartData.length >= 2 ? chartData[chartData.length - 2].value : 0;
  const pc = prev > 0 ? ((now - prev) / prev) * 100 : 0;
  const isPositive = pc >= 0;

  return (
    <div className="flex min-w-0 flex-col rounded-card border border-line bg-panel">
      {/* Panel header */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-[11px]">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-dim">
          Orders Trend
        </span>
        {chartData.length >= 2 && (
          <span
            className={`inline-flex items-center gap-[3px] font-mono text-[11.5px] font-semibold ${
              isPositive ? 'text-pos' : 'text-neg'
            }`}
          >
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isPositive ? '+' : ''}
            {pc.toFixed(1)}%
          </span>
        )}
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
