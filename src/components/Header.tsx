import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Bell, Menu, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../lib/api';
import NotificationPanel from './NotificationPanel';

interface HeaderProps {
  onMenuClick: () => void;
}

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

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
    <header className="lg:hidden bg-white/80 backdrop-blur-md border-b border-gray-100 px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 sticky top-0 z-10">
      <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-0">
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 lg:hidden flex-shrink-0"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Mobile logo */}
        <div className="flex items-center lg:hidden flex-shrink-0">
          <img src="/images/logo.png" alt="Lumo Electrical Logo" className="h-9 sm:h-12 w-auto" />
        </div>
        
        {/* <div className="flex-1 max-w-lg mx-2 sm:mx-4 hidden sm:block min-w-0">
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 flex-shrink-0" size={20} />
            <input
              type="text"
              placeholder="Search orders, products, categories, customers..."
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 lg:py-3 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 text-xs sm:text-sm placeholder-gray-500"
            />
          </div>
        </div> */}
        
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0">
          {/* Mobile search button */}
          {/* <button className="p-1.5 sm:p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-all duration-200 sm:hidden flex-shrink-0">
            <Search size={18} />
          </button> */}

          {/* TODO: Create Notification feature later */}
          {/* <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-1.5 sm:p-2 lg:p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-all duration-200 relative flex-shrink-0"
            >
              <Bell size={20} />
              <span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 w-2 sm:w-3 h-2 sm:h-3 bg-red-500 rounded-full"></span>
            </button>
            <NotificationPanel isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
          </div> */}

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-7 sm:w-8 h-7 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex-shrink-0 hover:from-orange-500 hover:to-pink-600"
            >
              <span className="text-white font-semibold text-xs sm:text-xs lg:text-sm">
                {user?.first_name?.[0]?.toUpperCase() || 'A'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-600">{user?.email}</p>
                </div>

                {/* Menu Items */}
                {/* <div className="py-2">
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    disabled={isLoggingOut}
                  >
                    <Settings size={16} className="text-gray-600" />
                    Settings
                  </button>
                </div> */}

                {/* Logout Button */}
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <LogOut size={16} />
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;