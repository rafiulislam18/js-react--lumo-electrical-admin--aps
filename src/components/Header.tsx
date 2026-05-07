import React, { useState, useEffect, useRef } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../lib/api';

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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const initials = user?.first_name?.[0]?.toUpperCase() || 'A';

  return (
    <header className="lg:hidden sticky top-0 z-10 border-b border-slate-800 bg-gradient-to-bl from-slate-900 via-slate-900/50 to-slate-900 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-3">

        {/* Left: hamburger */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white transition-all flex-shrink-0"
        >
          <Menu size={18} />
        </button>

        {/* Centre: logo */}
        <div className="flex-1 flex justify-center">
          <img src="/images/logo-light.png" alt="Lumo Electrical" className="h-8 sm:h-9 w-auto" />
        </div>

        {/* Right: avatar + dropdown */}
        <div className="relative flex-shrink-0" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center shadow-md shadow-cyan-500/30 transition-all hover:shadow-cyan-500/50 flex-shrink-0"
          >
            <span className="text-xs font-bold text-white">{initials}</span>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden z-50">
              {/* User info */}
              <div className="px-4 py-3 border-b border-slate-800 bg-slate-800/60">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-[0.65rem] text-slate-400 truncate mt-0.5">{user?.email || user?.username}</p>
              </div>

              {/* Logout */}
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:bg-red-500/20 hover:text-red-400 border border-slate-700/50 hover:border-red-400/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut size={14} />
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
