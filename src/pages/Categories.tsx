import React from 'react';
import { Layers } from 'lucide-react';

const Categories: React.FC = () => {
  return (
    <>
      <div className="mb-6 lg:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Categories</h1>
        <p className="text-sm sm:text-base text-gray-600 font-medium">Organize and manage product categories.</p>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Layers size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-medium">Categories page - Coming soon</p>
            <p className="text-gray-400 text-sm mt-2">Display category listings, hierarchy, and management here</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Categories;
