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
  Star,
  LogOut,
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
    { id: 'questions', path: '/questions', icon: HelpCircle, label: 'Questions' },
    { id: 'reviews', path: '/reviews', icon: Star, label: 'Reviews' },
    { id: 'products', path: '/products', icon: Package, label: 'Products' },
    { id: 'categories', path: '/categories', icon: ListTree, label: 'Categories' },
    { id: 'customers', path: '/customers', icon: Users, label: 'Customers' },
    { id: 'delivery', path: '/delivery-personnel', icon: Truck, label: 'Delivery Personnel' },
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

  const userEmail = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u.email || u.username || 'admin';
    } catch {
      return 'admin';
    }
  })();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        w-[244px] bg-bg2 h-screen flex flex-col border-r border-line
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-[7px] flex items-center justify-center bg-panel border border-line text-dim hover:text-body hover:border-[#3a3d44] transition lg:hidden z-10"
        >
          <X size={15} />
        </button>

        {/* Brand */}
        <div className="px-[18px] pt-[18px] pb-4 border-b border-line">
          <img src="/images/logo-light.png" alt="Lumo Electrical Logo" className="h-7 w-auto" />
        </div>
        <div className="px-[18px] pt-3 pb-2">
          <span className="font-mono text-[9.5px] tracking-[.18em] uppercase text-mute">Admin Console</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3 pt-1 flex flex-col gap-[3px]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                className={`relative flex items-center gap-[11px] px-3 py-[9px] rounded-lg cursor-pointer text-left transition-all duration-150 border ${
                  isActive
                    ? 'bg-accent/[.12] border-accent/[.28] text-body'
                    : 'border-transparent text-dim hover:bg-panel hover:text-body'
                }`}
                onClick={() => handleNavigate(item.path)}
              >
                {isActive && (
                  <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-[3px] bg-accent" />
                )}
                <Icon size={17} className={`shrink-0 ${isActive ? 'text-accent' : ''}`} />
                <span className={`flex-1 text-[13px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* System status */}
        <div className="px-[18px] py-2.5 border-t border-line flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-pos shadow-[0_0_6px_#5fcf80]" />
          <span className="font-mono text-[10px] tracking-[.1em] uppercase text-mute">System online</span>
          <span className="ml-auto font-mono text-[10px] tracking-[.1em] text-mute">v2.1</span>
        </div>

        {/* User */}
        <div className="p-3 border-t border-line">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-panel border border-line">
            <div className="w-[34px] h-[34px] rounded-[7px] bg-accent text-accent-ink flex items-center justify-center font-extrabold font-mono text-sm shrink-0">
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-semibold text-body">Admin</div>
              <div className="text-[10.5px] text-mute font-mono truncate">{userEmail}</div>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              title={isLoggingOut ? 'Logging out…' : 'Log out'}
              className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-panel border border-line text-dim hover:text-neg hover:border-neg/40 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
