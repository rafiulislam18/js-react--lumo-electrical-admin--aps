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
    <header className="lg:hidden sticky top-0 z-10 border-b border-line bg-bg2 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-3">

        {/* Left: hamburger */}
        <button
          onClick={onMenuClick}
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-panel border border-line text-dim hover:text-body hover:border-[#3a3d44] transition shrink-0"
        >
          <Menu size={16} />
        </button>

        {/* Centre: logo */}
        <div className="flex-1 flex justify-center">
          <img src="/images/logo-light.png" alt="Lumo Electrical" className="h-7 sm:h-8 w-auto" />
        </div>

        {/* Right: avatar + dropdown */}
        <div className="relative shrink-0" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="h-9 w-9 rounded-[7px] bg-accent text-accent-ink flex items-center justify-center font-extrabold font-mono text-sm shrink-0 hover:brightness-110 transition"
          >
            {initials}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-card border border-line bg-panel shadow-[0_20px_50px_-12px_rgba(0,0,0,.87)] overflow-hidden z-50 animate-pop">
              {/* User info */}
              <div className="px-4 py-3 border-b border-line">
                <p className="text-[12.5px] font-semibold text-body truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-[10.5px] font-mono text-mute truncate mt-0.5">{user?.email || user?.username}</p>
              </div>

              {/* Logout */}
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-[7px] text-xs font-bold text-dim bg-panel border border-line hover:text-neg hover:border-neg/40 hover:bg-neg/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut size={14} />
                  {isLoggingOut ? 'Logging out…' : 'Logout'}
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
