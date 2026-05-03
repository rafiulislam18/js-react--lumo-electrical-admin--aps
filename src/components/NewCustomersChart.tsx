import React, { useState, useEffect } from 'react';
import { TrendingUp, Users } from 'lucide-react';

const NewCustomersChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [chartData, setChartData] = useState<Array<{ label: string; value: number }>>([]);

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
    fetchNewCustomersChart();
  }, [timeRange]);

  const fetchNewCustomersChart = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const period = timeRange === 'monthly' ? 'monthly' : timeRange;
      const url = `${API_URL}/analytics/new-customers-chart/?period=${period}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

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
      <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg sm:p-6 lg:p-8">
        <div className="relative">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between lg:mb-7">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 p-2.5 shadow-sm ring-1 ring-purple-200/50">
                <Users size={20} className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 lg:text-xl">New Customers Trend</h3>
                <p className="mt-0.5 text-xs font-medium text-gray-500">Track new customer acquisition</p>
              </div>
            </div>
            <select
              value={timeRange}
              onChange={(e) => {
                setTimeRange(e.target.value);
                setHoveredBar(null);
              }}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium transition-all duration-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 lg:px-4 lg:py-2.5"
            >
              <option value="monthly">Last 12 months</option>
              <option value="30days">Last 30 days</option>
              <option value="7days">Last 7 days</option>
            </select>
          </div>
          <div className="py-12 text-center text-gray-500">Loading chart data...</div>
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
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-orange-50/70 blur-3xl" />

      <div className="relative">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between lg:mb-7">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 p-2.5 shadow-sm ring-1 ring-orange-200/50">
              <TrendingUp size={20} className="text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 lg:text-xl">New Customers Trend</h3>
              <p className="mt-0.5 text-xs font-medium text-gray-500">Customer acquisition over time</p>
            </div>
          </div>
          <select
            value={timeRange}
            onChange={(e) => {
              setTimeRange(e.target.value);
              setHoveredBar(null);
            }}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium transition-all duration-200 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 lg:px-4 lg:py-2.5"
          >
            <option value="monthly">Last 12 months</option>
            <option value="30days">Last 30 days</option>
            <option value="7days">Last 7 days</option>
          </select>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-3">
            <p className="flex items-center gap-1 text-xs font-medium text-gray-600">
              <Users size={12} className="text-orange-600" />
              Total New
            </p>
            <p className="mt-0.5 text-xl font-extrabold text-orange-700">{totalNewCustomers}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-3">
            <p className="flex items-center gap-1 text-xs font-medium text-gray-600">
              <TrendingUp size={12} className="text-orange-600" />
              Average
            </p>
            <p className="mt-0.5 text-xl font-extrabold text-gray-900">{averagePerPeriod}</p>
          </div>
        </div>

        <div className="relative">
          <div
            className="absolute left-0 top-0 flex flex-col justify-between text-[0.65rem] font-semibold text-gray-400 sm:text-xs"
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
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="border-t border-dashed border-gray-100" />
                ))}
              </div>

              <div className="relative flex h-full items-end justify-between gap-0.5 sm:gap-1.5 lg:gap-2">
                {data.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="group/bar relative flex flex-1 flex-col items-center"
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <div
                      className={`w-full cursor-pointer rounded-t-lg bg-gradient-to-t from-orange-500 via-orange-400 to-amber-300 shadow-sm transition-all duration-300 hover:shadow-orange-300 hover:shadow-md ${
                        hoveredBar === index ? 'from-orange-600 via-orange-500 to-amber-400' : ''
                      }`}
                      style={{
                        height: `${(item.value / maxValue) * chartHeight}px`,
                        minHeight: '3px',
                      }}
                    />
                    {hoveredBar === index && (
                      <div className="absolute -top-12 left-1/2 z-20 -translate-x-1/2 transform whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg">
                        <p className="font-semibold">{item.label}</p>
                        <p className="text-orange-300">+{item.value} customers</p>
                        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2 flex justify-between gap-0.5 sm:gap-1.5 lg:gap-2">
              {data.map((item: any, index: number) => (
                <div key={index} className="flex flex-1 justify-center">
                  <span
                    className={`text-[0.6rem] font-semibold sm:text-xs ${
                      hoveredBar === index ? 'text-orange-600' : 'text-gray-400'
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
