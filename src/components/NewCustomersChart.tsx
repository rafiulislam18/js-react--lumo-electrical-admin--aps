import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

const NewCustomersChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const dataByRange = useMemo(() => ({
    monthly: [
      { label: 'Jan', value: 134 },
      { label: 'Feb', value: 201 },
      { label: 'Mar', value: 156 },
      { label: 'Apr', value: 189 },
      { label: 'May', value: 142 },
      { label: 'Jun', value: 198 },
      { label: 'Jul', value: 165 },
      { label: 'Aug', value: 213 },
      { label: 'Sep', value: 178 },
      { label: 'Oct', value: 245 },
      { label: 'Nov', value: 267 },
      { label: 'Dec', value: 309 },
    ],
    '30days': Array.from({ length: 30 }, (_, i) => ({
      label: `Day ${i + 1}`,
      value: Math.floor(Math.random() * 40 + 10)
    })),
    '7days': [
      { label: 'Mon', value: 8 },
      { label: 'Tue', value: 12 },
      { label: 'Wed', value: 10 },
      { label: 'Thu', value: 14 },
      { label: 'Fri', value: 11 },
      { label: 'Sat', value: 9 },
      { label: 'Sun', value: 7 },
    ],
  }), []);

  const data = dataByRange[timeRange as keyof typeof dataByRange];
  const maxValue = Math.max(...data.map(d => d.value));
  const totalNewCustomers = data.reduce((sum, d) => sum + d.value, 0);
  const averagePerPeriod = (totalNewCustomers / data.length).toFixed(0);
  const chartHeight = isMobile ? 110 : isTablet ? 160 : 192;
  
  // Responsive label display - skip labels on very small screens
  const getLabelInterval = () => {
    const dataLength = data.length;
    if (window.innerWidth < 480) {
      if (dataLength > 20) return 5;
      if (dataLength > 10) return 2;
      return 1;
    }
    if (window.innerWidth < 640) return 1;
    return 1;
  };
  
  const labelInterval = getLabelInterval();
  const visibleLabels = data.map((item, idx) => idx % labelInterval === 0 || idx === data.length - 1 ? item.label : '');

  // Responsive Y-axis font size
  const yAxisFontSize = isMobile ? '0.6rem' : isTablet ? '0.75rem' : '0.875rem';
  
  // Responsive X-axis font size and spacing
  const xAxisFontSize = isMobile ? '0.5rem' : isTablet ? '0.625rem' : '0.75rem';
  const xAxisBottomOffset = isMobile ? '-1.75rem' : isTablet ? '-2.25rem' : '-2.75rem';
  const xAxisPaddingBottom = isMobile ? '2.5rem' : isTablet ? '3.5rem' : '4rem';

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-100 rounded-lg">
            <TrendingUp size={20} className="text-orange-600" />
          </div>
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900">New Customers Trend</h3>
        </div>
        <select 
          value={timeRange} 
          onChange={(e) => {
            setTimeRange(e.target.value);
            setHoveredBar(null);
          }}
          className="bg-gray-50 border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
        >
          <option value="monthly">Last 12 months</option>
          <option value="30days">Last 30 days</option>
          <option value="7days">Last 7 days</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 font-medium mb-1">Total New</p>
          <p className="text-2xl font-bold text-gray-900">{totalNewCustomers}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 font-medium mb-1">Average</p>
          <p className="text-2xl font-bold text-gray-900">{averagePerPeriod}</p>
        </div>
      </div>

      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 flex flex-col justify-between text-gray-400 font-medium" style={{ height: chartHeight, fontSize: yAxisFontSize }}>
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>
        
        {/* Chart area */}
        <div className={`${isMobile ? 'ml-5 pl-1.5' : isTablet ? 'ml-8 pl-2.5' : 'ml-10 pl-3'}`}>
          <div className="flex items-end justify-between gap-0.5 sm:gap-1.5 lg:gap-2 relative" style={{ height: chartHeight }}>
            {data.map((item, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center flex-1 group relative"
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                <div 
                  className="bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg w-full transition-all duration-500 hover:from-orange-600 hover:to-orange-500 cursor-pointer shadow-sm hover:shadow-md transform hover:scale-105"
                  style={{ 
                    height: `${(item.value / maxValue) * chartHeight}px`,
                    minHeight: '3px'
                  }}
                />
                {hoveredBar === index && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    {item.label}: {item.value}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* X-axis labels - rotated 90 degrees */}
          <div className="flex justify-between mt-2 sm:mt-3 lg:mt-4 relative" style={{ paddingBottom: xAxisPaddingBottom, minHeight: isMobile ? '70px' : isTablet ? '90px' : '110px' }}>
            {data.map((item, index) => (
              <div key={index} className="flex justify-center flex-1 relative">
                {visibleLabels[index] && (
                  <span 
                    className="text-gray-400 font-medium origin-bottom-center absolute whitespace-nowrap"
                    style={{ 
                      fontSize: xAxisFontSize,
                      transform: 'rotate(270deg)',
                      bottom: xAxisBottomOffset,
                      left: '0%',
                      transformOrigin: 'center center'
                    }}
                  >
                    {visibleLabels[index]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCustomersChart;
