import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import { authenticatedFetch } from '../lib/api';

const formatNumber = (value: number): string => {
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

const Chart: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [timeRange, setTimeRange] = useState('12months');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [chartData, setChartData] = useState<Array<{ month: string; value: number }>>([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchRevenueChart();
  }, [timeRange]);

  const fetchRevenueChart = async () => {
    try {
      const period = timeRange === '12months' ? 'monthly' : timeRange;
      const response = await authenticatedFetch(`/analytics/revenue-chart/?period=${period}`);

      if (response.ok) {
        const data = await response.json();
        setChartData(data.data.map((item: any) => ({
          month: item.label || item.month,
          value: parseFloat(item.revenue),
        })));
      }
    } catch (error) {
      console.error('Failed to fetch revenue chart:', error);
    }
  };

  const data = chartData.length > 0 ? chartData : [];

  if (data.length === 0) {
    return (
      <div className="flex min-w-0 flex-col rounded-card border border-line bg-panel">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-[11px]">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-dim">
            <DollarSign size={13} className="text-accent" />
            Revenue
          </span>
          <select
            value={timeRange}
            onChange={(e) => {
              setTimeRange(e.target.value);
              setHoveredBar(null);
            }}
            className="rounded-[7px] border border-line bg-panel2 px-2.5 py-1.5 text-xs text-body outline-none focus:border-accent/50"
          >
            <option value="12months">Last 12 months</option>
            <option value="30days">Last 30 days</option>
            <option value="7days">Last 7 days</option>
          </select>
        </div>
        <div className="animate-pulse py-12 text-center font-mono text-xs uppercase tracking-[.1em] text-mute">
          Loading chart data...
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const totalRevenue = data.reduce((sum, d) => sum + d.value, 0);
  const avgRevenue = (totalRevenue / data.length).toFixed(0);
  const chartHeight = isMobile ? 140 : isTablet ? 200 : 240;

  const getLabelInterval = () => {
    const dataLength = data.length;
    if (isMobile) {
      if (dataLength > 20) return 5;
      if (dataLength > 10) return 2;
      return 1;
    }
    if (dataLength > 20) return 3;
    return 1;
  };

  const labelInterval = getLabelInterval();

  return (
    <div className="flex min-w-0 flex-col rounded-card border border-line bg-panel">
      {/* Panel header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-[11px]">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-dim">
          <DollarSign size={13} className="text-accent" />
          Revenue
        </span>
        <select
          value={timeRange}
          onChange={(e) => {
            setTimeRange(e.target.value);
            setHoveredBar(null);
          }}
          className="rounded-[7px] border border-line bg-panel2 px-2.5 py-1.5 text-xs text-body outline-none focus:border-accent/50"
        >
          <option value="12months">Last 12 months</option>
          <option value="30days">Last 30 days</option>
          <option value="7days">Last 7 days</option>
        </select>
      </div>

      <div className="min-w-0 flex-1 p-4">
        {/* Mini stats */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-line bg-panel2 p-3">
            <p className="font-mono text-[10.5px] uppercase tracking-[.12em] text-mute">Total</p>
            <p className="mt-1 font-mono text-xl font-semibold tracking-[-.02em] text-accent">
              ${formatNumber(totalRevenue)}
            </p>
          </div>
          <div className="rounded-lg border border-line bg-panel2 p-3">
            <p className="flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[.12em] text-mute">
              <TrendingUp size={11} className="text-accent" />
              Average
            </p>
            <p className="mt-1 font-mono text-xl font-semibold tracking-[-.02em] text-body">
              ${formatNumber(parseFloat(avgRevenue))}
            </p>
          </div>
        </div>

        <div className="relative">
          {/* Y-axis labels */}
          <div
            className="absolute left-0 top-0 flex flex-col justify-between font-mono text-[10px] text-mute"
            style={{ height: chartHeight }}
          >
            <span>${formatNumber(maxValue)}</span>
            <span>${formatNumber(maxValue * 0.75)}</span>
            <span>${formatNumber(maxValue * 0.5)}</span>
            <span>${formatNumber(maxValue * 0.25)}</span>
            <span>$0</span>
          </div>

          {/* Chart area */}
          <div className={`${isMobile ? 'ml-7' : isTablet ? 'ml-10' : 'ml-12'}`}>
            {/* Gridlines + bars wrapper */}
            <div className="relative" style={{ height: chartHeight }}>
              {/* Horizontal gridlines */}
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="border-t border-line" />
                ))}
              </div>

              {/* Bars */}
              <div className="relative flex h-full items-end justify-between gap-0.5 sm:gap-1.5 lg:gap-2">
                {data.map((item, index) => (
                  <div
                    key={index}
                    className="group/bar relative flex flex-1 flex-col items-center"
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <div
                      className={`w-full cursor-pointer rounded-t-[2px] bg-accent transition-opacity duration-150 ${
                        hoveredBar !== null && hoveredBar !== index ? 'opacity-40' : ''
                      }`}
                      style={{
                        height: `${(item.value / maxValue) * chartHeight}px`,
                        minHeight: '3px',
                      }}
                    />
                    {hoveredBar === index && (
                      <div className="absolute -top-12 left-1/2 z-20 -translate-x-1/2 transform whitespace-nowrap rounded-[7px] border border-white/10 bg-[#0a0a0c] px-2 py-1 text-[11px] font-bold text-body shadow-[0_6px_20px_rgba(0,0,0,.5)]">
                        <p className="font-mono text-[9.5px] font-semibold text-mute">{item.month}</p>
                        <p className="font-mono text-accent">${formatNumber(item.value)}</p>
                        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#0a0a0c]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* X-axis labels */}
            <div className="mt-2 flex justify-between gap-0.5 sm:gap-1.5 lg:gap-2">
              {data.map((item, index) => (
                <div key={index} className="flex flex-1 justify-center">
                  <span
                    className={`font-mono text-[10px] font-semibold transition-colors ${
                      hoveredBar === index ? 'text-accent' : 'text-mute'
                    }`}
                  >
                    {index % labelInterval === 0 || index === data.length - 1 ? item.month : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chart;
