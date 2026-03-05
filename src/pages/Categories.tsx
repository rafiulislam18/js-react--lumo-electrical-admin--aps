import React, { useState } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, Package } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: string;
  productCount: number;
  revenue: number;
  status: 'active' | 'inactive';
  description: string;
}

const Categories: React.FC = () => {
  const [categories] = useState<Category[]>([
    { id: 'CAT001', name: 'Lighting', icon: '💡', productCount: 156, revenue: 2450000, status: 'active', description: 'LED bulbs, tubes, and fixtures' },
    { id: 'CAT002', name: 'Switches & Sockets', icon: '🔘', productCount: 89, revenue: 1820000, status: 'active', description: 'Wall switches and power outlets' },
    { id: 'CAT003', name: 'Wires & Cables', icon: '🔗', productCount: 234, revenue: 3560000, status: 'active', description: 'Electric wires and cable bundles' },
    { id: 'CAT004', name: 'Circuit Protection', icon: '⚡', productCount: 67, revenue: 1340000, status: 'active', description: 'Breakers and safety devices' },
    { id: 'CAT005', name: 'Panels & Distribution', icon: '📦', productCount: 42, revenue: 4890000, status: 'active', description: 'Electrical panels and distribution boards' },
    { id: 'CAT006', name: 'Testing Equipment', icon: '📊', productCount: 28, revenue: 2100000, status: 'inactive', description: 'Multimeters and testing tools' },
  ]);

  return (
    <>
      <div className="mb-6 lg:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Categories</h1>
        <p className="text-sm sm:text-base text-gray-600 font-medium">Organize and manage product categories.</p>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 lg:mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <p className="text-xs text-blue-700 font-semibold mb-1">Total Categories</p>
          <p className="text-xl lg:text-2xl font-bold text-blue-900">6</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <p className="text-xs text-green-700 font-semibold mb-1">Active</p>
          <p className="text-xl lg:text-2xl font-bold text-green-900">5</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <p className="text-xs text-purple-700 font-semibold mb-1">Total Products</p>
          <p className="text-xl lg:text-2xl font-bold text-purple-900">616</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <p className="text-xs text-orange-700 font-semibold mb-1">Total Revenue</p>
          <p className="text-xl lg:text-2xl font-bold text-orange-900">$16.2k</p>
        </div>
      </div>

      {/* Add Category Button */}
      <div className="mb-6 lg:mb-8">
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {categories.map(category => (
          <div key={category.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-3xl">
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{category.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1.5 rounded-full ${
                category.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {category.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Package size={14} className="text-blue-600" />
                  <p className="text-xs text-gray-600">Products</p>
                </div>
                <p className="font-bold text-lg text-gray-900">{category.productCount}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp size={14} className="text-green-600" />
                  <p className="text-xs text-gray-600">Revenue</p>
                </div>
                <p className="font-bold text-lg text-gray-900">${(category.revenue / 1000).toFixed(1)}K</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm">
                <Edit2 size={16} />
                Edit
              </button>
              <button className="flex items-center justify-center px-3 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Categories;
