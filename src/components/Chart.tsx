import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign } from 'lucide-react';

const Chart: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [timeRange, setTimeRange] = useState('12months');
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
    '12months': [
      { month: 'Jan', value: 180 },
      { month: 'Feb', value: 280 },
      { month: 'Mar', value: 320 },
      { month: 'Apr', value: 250 },
      { month: 'May', value: 90 },
      { month: 'Jun', value: 160 },
      { month: 'Jul', value: 120 },
      { month: 'Aug', value: 200 },
      { month: 'Sep', value: 180 },
      { month: 'Oct', value: 300 },
      { month: 'Nov', value: 320 },
      { month: 'Dec', value: 310 },
    ],
    '30days': Array.from({ length: 30 }, (_, i) => ({
      month: `Day ${i + 1}`,
      value: Math.floor(Math.random() * 250 + 50)
    })),
    '7days': [
      { month: 'Mon', value: 92 },
      { month: 'Tue', value: 156 },
      { month: 'Wed', value: 198 },
      { month: 'Thu', value: 142 },
      { month: 'Fri', value: 267 },
      { month: 'Sat', value: 245 },
      { month: 'Sun', value: 178 },
    ]
  }), []);

  const data = dataByRange[timeRange as keyof typeof dataByRange];

  const maxValue = Math.max(...data.map(d => d.value));
  const chartHeight = isMobile ? 120 : isTablet ? 180 : 224;
  
  // Responsive label display for x-axis
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
  const visibleLabels = data.map((item, idx) => idx % labelInterval === 0 || idx === data.length - 1 ? item.month : '');

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
          <div className="p-2.5 bg-green-100 rounded-lg">
            <DollarSign size={20} className="text-green-600" />
          </div>
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900">Revenue Chart</h3>
        </div>
        <select 
          value={timeRange}
          onChange={(e) => {
            setTimeRange(e.target.value);
            setHoveredBar(null);
          }}
          className="bg-gray-50 border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
        >
          <option value="12months">Last 12 months</option>
          <option value="30days">Last 30 days</option>
          <option value="7days">Last 7 days</option>
        </select>
      </div>
      
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 flex flex-col justify-between text-gray-400 font-medium" style={{ height: chartHeight, fontSize: yAxisFontSize }}>
          <span>400k</span>
          <span>300k</span>
          <span>200k</span>
          <span>100k</span>
          <span>0k</span>
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
                  className="bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg w-full transition-all duration-500 hover:from-green-600 hover:to-green-500 cursor-pointer shadow-sm hover:shadow-md transform hover:scale-105"
                  style={{ 
                    height: `${(item.value / maxValue) * chartHeight}px`,
                    minHeight: '3px'
                  }}
                />
                {hoveredBar === index && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    {item.month}: ${item.value}k
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* X-axis labels - rotated 90 degrees */}
          <div className="flex justify-between relative" style={{ paddingBottom: xAxisPaddingBottom, minHeight: isMobile ? '70px' : isTablet ? '90px' : '110px' }}>
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

export default Chart;