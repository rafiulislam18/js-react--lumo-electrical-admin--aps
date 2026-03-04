import React from 'react';
import { AlertTriangle, TrendingDown } from 'lucide-react';

interface LowStockItem {
  id: string;
  name: string;
  currentStock: number;
  minimumStock: number;
}

const LowStockAlert: React.FC = () => {
  const lowStockItems: LowStockItem[] = [
    { id: '1', name: 'LED Bulb 60W', currentStock: 15, minimumStock: 50 },
    { id: '2', name: 'Electrical Wire 2.5mm', currentStock: 8, minimumStock: 100 },
    { id: '3', name: 'Circuit Breaker 32A', currentStock: 3, minimumStock: 20 },
    { id: '4', name: 'Switch Socket Single', currentStock: 22, minimumStock: 50 },
    { id: '5', name: 'Power Strip 6 Outlet', currentStock: 5, minimumStock: 30 },
  ];

  const getStockStatus = (current: number, minimum: number) => {
    const percentage = (current / minimum) * 100;
    if (percentage < 15) return { level: 'critical', label: 'Critical', color: 'text-red-700', bg: 'bg-red-50', bar: 'bg-red-500', border: 'border-red-200' };
    if (percentage < 40) return { level: 'warning', label: 'Warning', color: 'text-orange-700', bg: 'bg-orange-50', bar: 'bg-orange-500', border: 'border-orange-200' };
    return { level: 'low', label: 'Low', color: 'text-yellow-700', bg: 'bg-yellow-50', bar: 'bg-yellow-500', border: 'border-yellow-200' };
  };

  // Sort items by status first, then by percentage (lowest first)
  const sortedItems = [...lowStockItems].sort((a, b) => {
    const statusA = getStockStatus(a.currentStock, a.minimumStock);
    const statusB = getStockStatus(b.currentStock, b.minimumStock);
    
    const statusOrder = { critical: 0, warning: 1, low: 2 };
    const statusDiff = statusOrder[statusA.level as keyof typeof statusOrder] - statusOrder[statusB.level as keyof typeof statusOrder];
    
    if (statusDiff !== 0) return statusDiff;
    
    // If same status, sort by percentage (lowest first)
    const percentageA = (a.currentStock / a.minimumStock) * 100;
    const percentageB = (b.currentStock / b.minimumStock) * 100;
    return percentageA - percentageB;
  });

  const criticalCount = sortedItems.filter(item => {
    const percentage = (item.currentStock / item.minimumStock) * 100;
    return percentage < 15;
  }).length;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col">
      <div className="flex items-start justify-between mb-4 sm:mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-red-100 rounded-lg">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Low Stock Alert</h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 ml-11">{lowStockItems.length} items below minimum</p>
        </div>
        {criticalCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-100 rounded-lg">
            <TrendingDown size={14} className="text-red-600" />
            <span className="text-xs font-bold text-red-700">{criticalCount} Critical</span>
          </div>
        )}
      </div>

      <div className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto max-h-96">
        {sortedItems.map((item) => {
          const stockPercentage = (item.currentStock / item.minimumStock) * 100;
          const status = getStockStatus(item.currentStock, item.minimumStock);
          
          return (
            <div key={item.id} className={`${status.bg} border ${status.border} rounded-xl p-3 sm:p-4 hover:shadow-md transition-all duration-200 group`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-blue-700 truncate">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                    <p className="text-xs text-gray-600"><span className="font-semibold">{item.currentStock}</span>/{item.minimumStock}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900">{stockPercentage.toFixed(0)}%</p>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-300 ${status.bar}`}
                  style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LowStockAlert;
