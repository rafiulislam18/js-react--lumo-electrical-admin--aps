import React, { useState, useEffect, useRef } from 'react';
import { Menu, CalendarDays, Bell, ChevronRight, Truck, AlertTriangle, HelpCircle, Star, Sun, Moon, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../lib/api';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onMenuClick: () => void;
}

interface NotificationCounts {
  orders: number;
  lowStock: number;
  questions: number;
  reviews: number;
}

interface NotificationItem {
  icon: LucideIcon;
  tone: 'accent' | 'warn';
  label: string;
  to: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const bellRef = useRef<HTMLDivElement>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const userName = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u.first_name || u.username || 'Admin';
    } catch {
      return 'Admin';
    }
  })();
  const [counts, setCounts] = useState<NotificationCounts>({ orders: 0, lowStock: 0, questions: 0, reviews: 0 });

  // Fetch notification counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [ordersRes, stockRes, questionsRes, reviewsRes] = await Promise.all([
          authenticatedFetch('/analytics/unassigned-paid-orders/'),
          authenticatedFetch('/analytics/low-stock-alerts/'),
          authenticatedFetch('/analytics/new-questions/'),
          authenticatedFetch('/analytics/new-reviews/'),
        ]);

        const next: NotificationCounts = { orders: 0, lowStock: 0, questions: 0, reviews: 0 };
        if (ordersRes.ok) next.orders = (await ordersRes.json()).orders?.length ?? 0;
        if (stockRes.ok) next.lowStock = (await stockRes.json()).products?.length ?? 0;
        if (questionsRes.ok) next.questions = (await questionsRes.json()).questions?.length ?? 0;
        if (reviewsRes.ok) next.reviews = (await reviewsRes.json()).reviews?.length ?? 0;
        setCounts(next);
      } catch (error) {
        console.error('Failed to fetch notification counts:', error);
      }
    };
    fetchCounts();
  }, []);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifOpen]);

  const total = counts.orders + counts.lowStock + counts.questions + counts.reviews;

  const items: NotificationItem[] = [
    { icon: Truck, tone: 'accent', label: `${counts.orders} orders awaiting courier`, to: '/orders' },
    { icon: AlertTriangle, tone: 'warn', label: `${counts.lowStock} products low on stock`, to: '/products' },
    { icon: HelpCircle, tone: 'accent', label: `${counts.questions} open questions`, to: '/questions' },
    { icon: Star, tone: 'accent', label: `${counts.reviews} new reviews`, to: '/reviews' },
  ];

  const today = new Date()
    .toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();

  return (
    <header className="sticky top-0 z-10 flex h-[60px] shrink-0 items-center gap-3.5 border-b border-line bg-bg2 px-4 sm:px-[18px]">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-panel text-dim transition hover:border-line2 hover:text-body lg:hidden"
      >
        <Menu size={16} />
      </button>

      {/* Welcome greeting — large screens */}
      <p className="hidden flex-1 font-mono text-[13px] text-dim sm:block">
        Welcome back, <span className="font-bold text-body">{userName}</span>
      </p>

      <div className="ml-auto flex items-center gap-2.5">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-panel text-dim transition hover:border-line2 hover:text-body"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Date chip */}
        <span className="items-center gap-[7px] rounded-lg border border-line bg-panel px-[11px] py-2 font-mono text-[11px] text-dim flex">
          <CalendarDays size={13} className="text-accent" />
          {today}
        </span>

        {/* Notifications */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setIsNotifOpen(o => !o)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-panel text-dim transition hover:border-line2 hover:text-body"
          >
            <Bell size={16} />
            {total > 0 && (
              <span className="absolute -right-[5px] -top-[5px] flex h-4 min-w-[16px] items-center justify-center rounded-full border-2 border-bg bg-accent px-1 font-mono text-[9.5px] font-extrabold text-accent-ink">
                {total}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-11 z-50 w-[290px] overflow-hidden rounded-card border border-line bg-panel shadow-[0_20px_50px_-12px_rgba(0,0,0,.87)] animate-pop">
              <div className="border-b border-line px-3.5 py-[11px]">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-dim">
                  Notifications · {total}
                </span>
              </div>
              {items.map((it, i) => {
                const Icon = it.icon;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      navigate(it.to);
                      setIsNotifOpen(false);
                    }}
                    className={`flex w-full items-center gap-[11px] px-3.5 py-[11px] text-left transition-colors hover:bg-panel2 ${
                      i < items.length - 1 ? 'border-b border-line' : ''
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] ${
                        it.tone === 'warn' ? 'bg-warn/15 text-warn' : 'bg-accent/15 text-accent'
                      }`}
                    >
                      <Icon size={14} />
                    </span>
                    <span className="min-w-0 flex-1 text-[12.5px] text-body">{it.label}</span>
                    <ChevronRight size={14} className="shrink-0 text-mute" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
