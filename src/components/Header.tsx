import React from 'react';
import { Search, Plus, Bell, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 sticky top-0 z-10">
      <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-0">
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 lg:hidden flex-shrink-0"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden flex-shrink-0">
            <img src="/images/logo.png" alt="Lumo Electrical Logo" className="h-9 sm:h-12 w-auto ml-1 sm:ml-0" />
          </div>
        </div>
        
        <div className="flex-1 max-w-lg mx-2 sm:mx-4 hidden sm:block min-w-0">
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 flex-shrink-0" size={20} />
            <input
              type="text"
              placeholder="Search orders, products, categories, customers..."
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 lg:py-3 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 text-xs sm:text-sm placeholder-gray-500"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0">
          {/* Mobile search button */}
          <button className="p-1.5 sm:p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-all duration-200 sm:hidden flex-shrink-0">
            <Search size={18} />
          </button>
          
          <button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-2 sm:px-3 lg:px-6 py-1.5 sm:py-2 lg:py-2.5 rounded-lg sm:rounded-xl font-semibold flex items-center gap-1 lg:gap-2 transition-all duration-200 shadow-md sm:shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex-shrink-0">
            <Plus size={18} />
            <span className="hidden sm:inline text-xs sm:text-sm lg:text-base">Create Product</span>
          </button>
          
          <button className="p-1.5 sm:p-2 lg:p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-all duration-200 relative flex-shrink-0">
            <Bell size={20} />
            <span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 w-2 sm:w-3 h-2 sm:h-3 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="w-7 sm:w-8 h-7 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex-shrink-0">
            <span className="text-white font-semibold text-xs sm:text-xs lg:text-sm">U</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;