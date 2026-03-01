import React from 'react';

const Chart: React.FC = () => {
  const data = [
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
  ];

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-4">
        <h3 className="text-xl lg:text-2xl font-bold text-gray-900">Total Income</h3>
        <select className="bg-gray-50 border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200">
          <option>All Time</option>
          <option>Last 30 days</option>
          <option>Last 7 days</option>
        </select>
      </div>
      
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-40 sm:h-48 lg:h-56 flex flex-col justify-between text-xs text-gray-400 font-medium">
          <span>400k</span>
          <span>300k</span>
          <span>200k</span>
          <span>100k</span>
          <span>0k</span>
        </div>
        
        {/* Chart area */}
        <div className="ml-8 sm:ml-10 lg:ml-12 pl-2 sm:pl-3 lg:pl-4">
          <div className="flex items-end justify-between h-40 sm:h-48 lg:h-56 gap-1 sm:gap-2 lg:gap-3">
            {data.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1 group">
                <div 
                  className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg w-full transition-all duration-500 hover:from-blue-600 hover:to-blue-500 cursor-pointer shadow-sm hover:shadow-md transform hover:scale-105"
                  style={{ 
                    height: `${(item.value / maxValue) * (window.innerWidth < 640 ? 150 : window.innerWidth < 1024 ? 180 : 210)}px`,
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

export default Chart;