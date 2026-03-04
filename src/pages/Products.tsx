import React, { useState } from 'react';
import { Package, Search, Plus, Edit2, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  image: string;
}

const Products: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const products: Product[] = [
    { id: 'P001', name: 'LED Bulb 60W', category: 'Lighting', price: 250, stock: 145, status: 'active', image: '💡' },
    { id: 'P002', name: 'Power Strip 6 Outlet', category: 'Accessories', price: 1500, stock: 89, status: 'active', image: '🔌' },
    { id: 'P003', name: 'Electrical Wire 10 AWG', category: 'Wire & Cable', price: 450, stock: 67, status: 'active', image: '🔗' },
    { id: 'P004', name: 'Circuit Breaker 20A', category: 'Safety', price: 2000, stock: 42, status: 'active', image: '⚡' },
    { id: 'P005', name: 'Switch Socket Single', category: 'Switches', price: 350, stock: 234, status: 'active', image: '🔘' },
    { id: 'P006', name: 'Electrical Panel 200A', category: 'Panels', price: 15000, stock: 12, status: 'active', image: '📦' },
  ];

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="mb-6 lg:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Products</h1>
        <p className="text-sm sm:text-base text-gray-600 font-medium">Manage your product inventory and catalog.</p>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 lg:mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                {product.image}
              </div>
              <span className={`text-xs font-bold px-2.5 py-1.5 rounded-full ${
                product.status === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {product.status}
              </span>
            </div>

            <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-1">{product.name}</h3>
            <p className="text-xs text-gray-500 mb-4">{product.category}</p>

            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-600">Price</p>
                <p className="font-bold text-gray-900">৳{product.price.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Stock</p>
                <p className="font-bold text-gray-900">{product.stock}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm">
                <Edit2 size={16} />
                Edit
              </button>
              <button className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Products;
