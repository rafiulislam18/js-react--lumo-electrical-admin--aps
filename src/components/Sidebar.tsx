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
        w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 h-screen flex flex-col border-r border-slate-800 shadow-xl
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -top-20 -left-10 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-32 -right-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-800 hidden sm:block lg:hidden z-10"
        >
          <X size={20} className="text-slate-400" />
        </button>

      <div className="relative p-6 hidden sm:block border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5">
            <img src="/images/logo-light.png" alt="Lumo Electrical Logo" className="h-8 sm:h-10 w-auto" />
          </div>
        </div>
      </div>

      <nav className="relative flex-1 px-4 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <div
              key={item.id}
              className={`relative flex items-center justify-between px-4 py-3.5 rounded-xl mb-2 cursor-pointer transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/10 text-white shadow-lg shadow-cyan-500/10 border border-cyan-400/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
              onClick={() => handleNavigate(item.path)}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-gradient-to-b from-cyan-400 to-emerald-400" />
              )}
              <div className="flex items-center gap-3">
                <Icon size={20} className={`transition-colors ${
                  isActive ? 'text-cyan-300' : 'group-hover:text-cyan-300'
                }`} />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
            </div>
          );
        })}
      </nav>

      <div className="relative p-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-800/60 p-3 backdrop-blur">
          {/* User Info - 3/4 width */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-cyan-500/30">
                A
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">Admin</p>
                <p className="text-[0.65rem] text-slate-400 truncate">
                  {(() => { try { const u = JSON.parse(localStorage.getItem('user') || '{}'); return u.email || u.username || 'admin'; } catch { return 'admin'; } })()}
                </p>
              </div>
            </div>
          </div>

          {/* Logout Button - 1/4 width, vertical stack */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex-shrink-0 flex flex-col items-center justify-center gap-0.5 px-2.5 py-2 rounded-lg bg-slate-900/60 hover:bg-red-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group border border-slate-700/50 hover:border-red-400/40"
            title="Logout"
          >
            <LogOut size={15} className="text-slate-400 group-hover:text-red-400 transition-colors" />
            <span className="text-[0.65rem] font-semibold text-slate-400 group-hover:text-red-400 transition-colors text-center whitespace-nowrap">
              {isLoggingOut ? 'Logging Out...' : 'Logout'}
            </span>
          </button>
        </div>
      </div>
      </div>
    </>
  );
};

export default Sidebar;