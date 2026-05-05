import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../lib/api';
import {
  Home,
  Package,
  Users,
  ShoppingBag,
  Truck,
  ListTree,
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    { id: 'dashboard', path: '/', icon: Home, label: 'Dashboard' },
    { id: 'orders', path: '/orders', icon: ShoppingBag, label: 'Orders' },
    { id: 'products', path: '/products', icon: Package, label: 'Products' },
    { id: 'categories', path: '/categories', icon: ListTree, label: 'Categories' },
    { id: 'customers', path: '/customers', icon: Users, label: 'Customers' },
    { id: 'delivery', path: '/delivery-personnel', icon: Truck, label: 'Delivery Personnel' },
    // { id: 'shop', icon: ShoppingBag, label: 'Shop' },
    // { id: 'income', icon: DollarSign, label: 'Income' },
    // { id: 'promote', icon: TrendingUp, label: 'Promote' },
  ];

  // Determine active item based on current location
  const activeItem = useMemo(() => {
    const item = menuItems.find(m => m.path === location.pathname);
    return item?.id || 'dashboard';
  }, [location.pathname]);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
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
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 hidden sm:block lg:hidden"
        >
          <X size={20} className="text-gray-500" />
        </button>
        
      <div className="p-6 hidden sm:block border-b border-gray-50">
        <div className="flex items-center gap-2">
          <img src="/images/logo.png" alt="Lumo Electrical Logo" className="h-10 sm:h-12 w-auto ml-2" />
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
            </div>
          );
        })}
      </nav>
      
      <div className="p-4 space-y-2 border-t border-gray-50">
        {/* <div className="flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group">
          <div className="flex items-center gap-3">
            <HelpCircle size={20} className="group-hover:text-gray-700 transition-colors" />
            <span className="font-medium text-sm">Help</span>
          </div>
          <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm">8</span>
        </div> */}
        
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut size={20} className="group-hover:text-red-600 transition-colors" />
          <span className="font-medium text-sm">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
      </div>
    </>
  );
};

export default Sidebar;