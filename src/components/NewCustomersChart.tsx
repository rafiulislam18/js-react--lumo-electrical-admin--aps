import React, { useState, useEffect } from 'react';
import { TrendingUp, Users } from 'lucide-react';
import { authenticatedFetch } from '../lib/api';

const NewCustomersChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [chartData, setChartData] = useState<Array<{ label: string; value: number }>>([]);

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
    fetchNewCustomersChart();
  }, [timeRange]);

  const fetchNewCustomersChart = async () => {
    try {
      const period = timeRange === 'monthly' ? 'monthly' : timeRange;
      const response = await authenticatedFetch(`/analytics/new-customers-chart/?period=${period}`);

      if (response.ok) {
        const data = await response.json();
        setChartData(data.data.map((item: any) => ({
          label: item.label || item.month,
          value: item.customers,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch new customers chart:', error);
    }
  };

  const data = chartData.length > 0 ? chartData : [];

  if (data.length === 0) {
    return (
      <div className="flex min-w-0 flex-col rounded-card border border-line bg-panel">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-[11px]">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-dim">
            <Users size={13} className="text-accent" />
            New Customers
          </span>
          <select
            value={timeRange}
            onChange={(e) => {
              setTimeRange(e.target.value);
              setHoveredBar(null);
            }}
            className="rounded-[7px] border border-line bg-panel2 px-2.5 py-1.5 text-xs text-body outline-none focus:border-accent/50"
          >
            <option value="monthly">Last 12 months</option>
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

  const maxValue = Math.max(...data.map((d: any) => d.value));
  const totalNewCustomers = data.reduce((sum: number, d: any) => sum + d.value, 0);
  const averagePerPeriod = (totalNewCustomers / data.length).toFixed(0);
  const chartHeight = isMobile ? 130 : isTablet ? 180 : 200;

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
          <Users size={13} className="text-accent" />
          New Customers
        </span>
        <select
          value={timeRange}
          onChange={(e) => {
            setTimeRange(e.target.value);
            setHoveredBar(null);
          }}
          className="rounded-[7px] border border-line bg-panel2 px-2.5 py-1.5 text-xs text-body outline-none focus:border-accent/50"
        >
          <option value="monthly">Last 12 months</option>
          <option value="30days">Last 30 days</option>
          <option value="7days">Last 7 days</option>
        </select>
      </div>

      <div className="min-w-0 flex-1 p-4">
        {/* Mini stats */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-line bg-panel2 p-3">
            <p className="flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[.12em] text-mute">
              <Users size={11} className="text-accent" />
              Total New
            </p>
            <p className="mt-1 font-mono text-xl font-semibold tracking-[-.02em] text-accent">
              {totalNewCustomers}
            </p>
          </div>
          <div className="rounded-lg border border-line bg-panel2 p-3">
            <p className="flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[.12em] text-mute">
              <TrendingUp size={11} className="text-accent" />
              Average
            </p>
            <p className="mt-1 font-mono text-xl font-semibold tracking-[-.02em] text-body">
              {averagePerPeriod}
            </p>
          </div>
        </div>

        <div className="relative">
          {/* Y-axis labels */}
          <div
            className="absolute left-0 top-0 flex flex-col justify-between font-mono text-[10px] text-mute"
            style={{ height: chartHeight }}
          >
            <span>{maxValue}</span>
            <span>{Math.round(maxValue * 0.75)}</span>
            <span>{Math.round(maxValue * 0.5)}</span>
            <span>{Math.round(maxValue * 0.25)}</span>
            <span>0</span>
          </div>

          <div className={`${isMobile ? 'ml-7' : isTablet ? 'ml-9' : 'ml-11'}`}>
            <div className="relative" style={{ height: chartHeight }}>
              {/* Horizontal gridlines */}
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="border-t border-line" />
                ))}
              </div>

              {/* Bars */}
              <div className="relative flex h-full items-end justify-between gap-0.5 sm:gap-1.5 lg:gap-2">
                {data.map((item: any, index: number) => (
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
                        <p className="font-mono text-[9.5px] font-semibold text-mute">{item.label}</p>
                        <p className="font-mono text-accent">+{item.value} customers</p>
                        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#0a0a0c]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* X-axis labels */}
            <div className="mt-2 flex justify-between gap-0.5 sm:gap-1.5 lg:gap-2">
              {data.map((item: any, index: number) => (
                <div key={index} className="flex flex-1 justify-center">
                  <span
                    className={`font-mono text-[10px] font-semibold transition-colors ${
                      hoveredBar === index ? 'text-accent' : 'text-mute'
                    }`}
                  >
                    {index % labelInterval === 0 || index === data.length - 1 ? item.label : ''}
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

export default NewCustomersChart;
