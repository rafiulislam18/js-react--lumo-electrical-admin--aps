import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';

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

  const API_URL = import.meta.env.VITE_API_URL;

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
      const token = localStorage.getItem('access_token');
      const period = timeRange === '12months' ? 'monthly' : timeRange;
      const url = `${API_URL}/analytics/revenue-chart/?period=${period}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

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
      <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg sm:p-6 lg:p-8">
        <div className="relative">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between lg:mb-7">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 p-2.5 shadow-sm ring-1 ring-emerald-200/50">
                <DollarSign size={20} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 lg:text-xl">Revenue Chart</h3>
                <p className="mt-0.5 text-xs font-medium text-gray-500">Track revenue performance over time</p>
              </div>
            </div>
            <select
              value={timeRange}
              onChange={(e) => {
                setTimeRange(e.target.value);
                setHoveredBar(null);
              }}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium transition-all duration-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 lg:px-4 lg:py-2.5"
            >
              <option value="12months">Last 12 months</option>
              <option value="30days">Last 30 days</option>
              <option value="7days">Last 7 days</option>
            </select>
          </div>
          <div className="py-12 text-center text-gray-500">Loading chart data...</div>
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
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg sm:p-6 lg:p-8">
      {/* Subtle decorative gradient */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-emerald-50/70 blur-3xl" />

      <div className="relative">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between lg:mb-7">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 p-2.5 shadow-sm ring-1 ring-emerald-200/50">
              <DollarSign size={20} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 lg:text-xl">Revenue Chart</h3>
              <p className="mt-0.5 text-xs font-medium text-gray-500">Track revenue performance over time</p>
            </div>
          </div>
          <select
            value={timeRange}
            onChange={(e) => {
              setTimeRange(e.target.value);
              setHoveredBar(null);
            }}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium transition-all duration-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 lg:px-4 lg:py-2.5"
          >
            <option value="12months">Last 12 months</option>
            <option value="30days">Last 30 days</option>
            <option value="7days">Last 7 days</option>
          </select>
        </div>

        {/* Mini stats */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-3">
            <p className="text-xs font-medium text-gray-600">Total</p>
            <p className="mt-0.5 text-xl font-extrabold text-emerald-700">${formatNumber(totalRevenue)}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-3">
            <p className="flex items-center gap-1 text-xs font-medium text-gray-600">
              <TrendingUp size={12} className="text-emerald-600" />
              Average
            </p>
            <p className="mt-0.5 text-xl font-extrabold text-gray-900">${formatNumber(parseFloat(avgRevenue))}</p>
          </div>
        </div>

        <div className="relative">
          {/* Y-axis labels */}
          <div
            className="absolute left-0 top-0 flex flex-col justify-between text-[0.65rem] font-semibold text-gray-400 sm:text-xs"
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
                  <div key={i} className="border-t border-dashed border-gray-100" />
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
                      className={`w-full cursor-pointer rounded-t-lg bg-gradient-to-t from-emerald-500 via-emerald-400 to-green-300 shadow-sm transition-all duration-300 hover:shadow-emerald-300 hover:shadow-md ${
                        hoveredBar === index ? 'from-emerald-600 via-emerald-500 to-green-400' : ''
                      }`}
                      style={{
                        height: `${(item.value / maxValue) * chartHeight}px`,
                        minHeight: '3px',
                      }}
                    />
                    {hoveredBar === index && (
                      <div className="absolute -top-12 left-1/2 z-20 -translate-x-1/2 transform whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg">
                        <p className="font-semibold">{item.month}</p>
                        <p className="text-emerald-300">${formatNumber(item.value)}</p>
                        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
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
                    className={`text-[0.6rem] font-semibold sm:text-xs ${
                      hoveredBar === index ? 'text-emerald-600' : 'text-gray-400'
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
