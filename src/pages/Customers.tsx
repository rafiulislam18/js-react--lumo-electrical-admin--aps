import React from 'react';
import { Users } from 'lucide-react';

const Customers: React.FC = () => {
  return (
    <>
      <div className="mb-6 lg:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Customers</h1>
        <p className="text-sm sm:text-base text-gray-600 font-medium">View and manage your customers.</p>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-medium">Customers page - Coming soon</p>
            <p className="text-gray-400 text-sm mt-2">Display customer list, profiles, and analytics here</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Customers;
