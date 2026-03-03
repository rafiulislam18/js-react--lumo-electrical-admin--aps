import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

const NewCustomersChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState('monthly');

  const dataByRange = {
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
    '30days': [
      { label: '1-5', value: 23 },
      { label: '6-10', value: 31 },
      { label: '11-15', value: 28 },
      { label: '16-20', value: 35 },
      { label: '21-25', value: 42 },
      { label: '26-30', value: 52 },
    ],
    '7days': [
      { label: 'Mon', value: 8 },
      { label: 'Tue', value: 12 },
      { label: 'Wed', value: 10 },
      { label: 'Thu', value: 14 },
      { label: 'Fri', value: 11 },
      { label: 'Sat', value: 9 },
      { label: 'Sun', value: 7 },
    ],
  };

  const data = dataByRange[timeRange as keyof typeof dataByRange];
  const maxValue = Math.max(...data.map(d => d.value));
  const totalNewCustomers = data.reduce((sum, d) => sum + d.value, 0);
  const averagePerPeriod = (totalNewCustomers / data.length).toFixed(0);

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
          onChange={(e) => setTimeRange(e.target.value)}
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
        <div className="absolute left-0 top-0 h-40 lg:h-48 flex flex-col justify-between text-xs text-gray-400 font-medium">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>
        
        {/* Chart area */}
        <div className="ml-10 lg:ml-12 pl-3 lg:pl-4">
          <div className="flex items-end justify-between h-40 lg:h-48 gap-2 lg:gap-3">
            {data.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1 group">
                <div 
                  className="bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg w-full transition-all duration-500 hover:from-orange-600 hover:to-orange-500 cursor-pointer shadow-sm hover:shadow-md transform hover:scale-105"
                  style={{ 
                    height: `${(item.value / maxValue) * 160}px`,
                    minHeight: '6px'
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* X-axis labels */}
          <div className="flex justify-between mt-3 lg:mt-4 text-xs text-gray-400 font-medium">
            {data.map((item, index) => (
              <span key={index}>{item.label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCustomersChart;
