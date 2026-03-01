import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Users, 
  ShoppingBag, 
  HelpCircle, 
  LogOut,
  ChevronDown,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', path: '/', icon: Home, label: 'Dashboard', hasDropdown: false },
    { id: 'orders', path: '/orders', icon: ShoppingBag, label: 'Orders', hasDropdown: true },
    { id: 'products', path: '/products', icon: Package, label: 'Products', hasDropdown: true },
    { id: 'customers', path: '/customers', icon: Users, label: 'Customers', hasDropdown: true },
    // { id: 'shop', icon: ShoppingBag, label: 'Shop', hasDropdown: true },
    // { id: 'income', icon: DollarSign, label: 'Income', hasDropdown: true },
    // { id: 'promote', icon: TrendingUp, label: 'Promote', hasDropdown: true },
  ];

  // Determine active item based on current location
  const activeItem = useMemo(() => {
    const item = menuItems.find(m => m.path === location.pathname);
    return item?.id || 'dashboard';
  }, [location.pathname]);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose(); // Close mobile menu when item is selected
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        w-64 bg-white h-screen flex flex-col border-r border-gray-100 shadow-sm
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 lg:hidden"
        >
          <X size={20} className="text-gray-500" />
        </button>
        
      <div className="p-6 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <span className="text-2xl font-bold text-gray-900 tracking-tight">Duka</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`flex items-center justify-between px-4 py-3.5 rounded-xl mb-2 cursor-pointer transition-all duration-200 group ${
                activeItem === item.id 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border border-blue-100' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => handleNavigate(item.path)}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} className={`transition-colors ${
                  activeItem === item.id ? 'text-blue-600' : 'group-hover:text-gray-700'
                }`} />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              {item.hasDropdown && (
                <ChevronDown size={16} className={`transition-colors ${
                  activeItem === item.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'
                }`} />
              )}
            </div>
          );
        })}
      </nav>
      
      <div className="p-4 space-y-2 border-t border-gray-50">
        <div className="flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group">
          <div className="flex items-center gap-3">
            <HelpCircle size={20} className="group-hover:text-gray-700 transition-colors" />
            <span className="font-medium text-sm">Help</span>
          </div>
          <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm">8</span>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group">
          <LogOut size={20} className="group-hover:text-red-600 transition-colors" />
          <span className="font-medium text-sm">Logout</span>
        </div>
      </div>
      </div>
    </>
  );
};

export default Sidebar;