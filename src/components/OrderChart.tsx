import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';

const OrderChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState('12months');

  const dataByRange = {
    '12months': [
      { month: 'Jan', value: 892 },
      { month: 'Feb', value: 1145 },
      { month: 'Mar', value: 1289 },
      { month: 'Apr', value: 1034 },
      { month: 'May', value: 756 },
      { month: 'Jun', value: 892 },
      { month: 'Jul', value: 645 },
      { month: 'Aug', value: 1023 },
      { month: 'Sep', value: 934 },
      { month: 'Oct', value: 1245 },
      { month: 'Nov', value: 1289 },
      { month: 'Dec', value: 1234 },
    ],
    '30days': [
      { month: 'Day 1', value: 45 },
      { month: 'Day 5', value: 78 },
      { month: 'Day 10', value: 92 },
      { month: 'Day 15', value: 85 },
      { month: 'Day 20', value: 110 },
      { month: 'Day 25', value: 125 },
      { month: 'Day 30', value: 135 },
    ],
    '7days': [
      { month: 'Mon', value: 34 },
      { month: 'Tue', value: 45 },
      { month: 'Wed', value: 52 },
      { month: 'Thu', value: 48 },
      { month: 'Fri', value: 65 },
      { month: 'Sat', value: 78 },
      { month: 'Sun', value: 42 },
    ],
  };

  const data = dataByRange[timeRange as keyof typeof dataByRange];
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 rounded-lg">
            <ShoppingBag size={20} className="text-blue-600" />
          </div>
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900">Orders Chart</h3>
        </div>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200"
        >
          <option value="12months">Last 12 months</option>
          <option value="30days">Last 30 days</option>
          <option value="7days">Last 7 days</option>
        </select>
      </div>
      
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-48 lg:h-56 flex flex-col justify-between text-xs text-gray-400 font-medium">
          <span>{(maxValue).toLocaleString()}</span>
          <span>{(maxValue * 0.75).toLocaleString()}</span>
          <span>{(maxValue * 0.5).toLocaleString()}</span>
          <span>{(maxValue * 0.25).toLocaleString()}</span>
          <span>0</span>
        </div>
        
        {/* Chart area */}
        <div className="ml-12 lg:ml-16 pl-3 lg:pl-4">
          <div className="flex items-end justify-between h-48 lg:h-56 gap-2 lg:gap-3">
            {data.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1 group">
                <div 
                  className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg w-full transition-all duration-500 hover:from-blue-600 hover:to-blue-500 cursor-pointer shadow-sm hover:shadow-md transform hover:scale-105"
                  style={{ 
                    height: `${(item.value / maxValue) * 200}px`,
                    minHeight: '6px'
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* X-axis labels */}
          <div className="flex justify-between mt-3 lg:mt-4 text-xs text-gray-400 font-medium">
            {data.map((item, index) => (
              <span key={index}>{item.month}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderChart;
