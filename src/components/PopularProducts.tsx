import React from 'react';
import { TrendingUp, ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  totalSold: number;
  totalRevenue: string;
  emoji: string;
}

const PopularProducts: React.FC = () => {
  const products: Product[] = [
    { id: '1', name: 'LED Bulb 60W', category: 'Lighting', totalSold: 1245, totalRevenue: '$18,675', emoji: '💡' },
    { id: '2', name: 'Power Strip 6 Outlet', category: 'Accessories', totalSold: 892, totalRevenue: '$13,380', emoji: '🔌' },
    { id: '3', name: 'Electrical Wire 10 AWG', category: 'Wire & Cable', totalSold: 756, totalRevenue: '$11,340', emoji: '🔗' },
    { id: '4', name: 'Circuit Breaker 20A', category: 'Safety', totalSold: 543, totalRevenue: '$10,860', emoji: '⚡' },
  ].sort((a, b) => b.totalSold - a.totalSold);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="p-2.5 bg-green-100 rounded-lg">
          <TrendingUp size={18} className="text-green-600" />
        </div>
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Popular Products</h3>
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        {products.map((product, index) => (
          <div key={product.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition-all duration-200 cursor-pointer group border border-transparent hover:border-green-100">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Rank Badge */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md">
                {index + 1}
              </div>
              
              {/* Product Icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-base sm:text-lg shadow-sm group-hover:shadow-md transition-all duration-200">
                {product.emoji}
              </div>
              
              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors truncate">{product.name}</p>
                <p className="text-xs text-gray-500 font-medium">{product.category}</p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex flex-col items-end gap-0.5">
              <div className="flex items-center gap-1.5">
                <ShoppingCart size={14} className="text-green-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-gray-900">{product.totalSold.toLocaleString()}</span>
              </div>
              <p className="text-xs text-green-600 font-semibold">{product.totalRevenue}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
        <button className="text-green-600 hover:text-green-700 font-semibold text-xs sm:text-sm transition-all duration-200 hover:underline flex items-center gap-1">
          View All Products
          <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default PopularProducts;