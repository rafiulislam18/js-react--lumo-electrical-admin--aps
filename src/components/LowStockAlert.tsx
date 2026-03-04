import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';

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
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg lg:text-xl font-bold text-gray-900">Low Stock Alert</h3>
          <p className="text-sm text-gray-600 mt-1">{lowStockItems.length} products below minimum stock</p>
        </div>
        <div className="p-2.5 bg-red-100 rounded-lg">
          <AlertTriangle size={20} className="text-red-600" />
        </div>
      </div>

      <div className="space-y-3">
        {lowStockItems.map((item) => {
          const stockPercentage = (item.currentStock / item.minimumStock) * 100;
          const severity = stockPercentage < 20 ? 'critical' : stockPercentage < 50 ? 'warning' : 'low';
          
          const severityColors = {
            critical: { bg: 'bg-red-50', bar: 'bg-red-500', text: 'text-red-700' },
            warning: { bg: 'bg-orange-50', bar: 'bg-orange-500', text: 'text-orange-700' },
            low: { bg: 'bg-yellow-50', bar: 'bg-yellow-500', text: 'text-yellow-700' },
          };
          
          const colors = severityColors[severity];

          return (
            <div key={item.id} className={`${colors.bg} rounded-lg p-3 border border-gray-100`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Package size={16} className={colors.text} />
                  <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                  {item.currentStock}/{item.minimumStock}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${colors.bar}`}
                  style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* <button className="w-full mt-4 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200">
        Reorder Stock
      </button> */}
    </div>
  );
};

export default LowStockAlert;
