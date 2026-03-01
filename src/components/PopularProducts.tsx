import React from 'react';

interface Product {
  id: string;
  name: string;
  category: string;
  earnings: string;
  emoji: string;
}

const PopularProducts: React.FC = () => {
  const products: Product[] = [
    { id: '1', name: 'Product A', category: 'UI Kit', earnings: '$5461', emoji: '🎨' },
    { id: '2', name: 'Product B', category: 'UI Kit', earnings: '$5461', emoji: '💻' },
    { id: '3', name: 'Product C', category: 'UI Kit', earnings: '$5461', emoji: '📱' },
    { id: '4', name: 'Product D', category: 'UI Kit', earnings: '$5461', emoji: '🍌' },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Popular Products</h3>
      </div>
      
      <div className="space-y-1 mb-4 lg:mb-6">
        <div className="flex justify-between text-xs sm:text-sm font-semibold text-gray-500 pb-3 uppercase tracking-wide">
          <span>Product</span>
          <span>Earnings</span>
        </div>
      </div>
      
      <div className="space-y-3 lg:space-y-5">
        {products.map((product) => (
          <div key={product.id} className="flex items-center justify-between p-2 lg:p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-lg lg:text-xl shadow-sm group-hover:shadow-md transition-all duration-200">
                {product.emoji}
              </div>
              <div>
                <p className="text-sm lg:text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{product.name}</p>
                <p className="text-xs lg:text-sm text-gray-500 font-medium">{product.category}</p>
              </div>
            </div>
            <span className="font-bold text-gray-900 text-sm lg:text-lg">{product.earnings}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-gray-100">
        <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-all duration-200 hover:underline">
          All Products
        </button>
      </div>
    </div>
  );
};

export default PopularProducts;