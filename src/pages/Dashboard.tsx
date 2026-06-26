import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from '../components/Chart';
import PopularProducts from '../components/PopularProducts';
import NewQuestions from '../components/NewQuestions';
import NewReviews from '../components/NewReviews';
import RevenueStats from '../components/RevenueStats';
import OrderStats from '../components/OrderStats';
import CustomerStats from '../components/CustomerStats';
import LowStockAlert from '../components/LowStockAlert';
import OrderChart from '../components/OrderChart';
import CustomerOrderChart from '../components/CustomerOrderChart';
import NewCustomersChart from '../components/NewCustomersChart';
import NewOrders from '../components/NewOrders';
import {
  Truck,
  AlertTriangle,
  HelpCircle,
  Star,
  CalendarDays,
  X,
  ArrowRight,
  LucideIcon,
} from 'lucide-react';

type ActionId = 'orders' | 'lowStock' | 'questions' | 'reviews';

interface ActionMeta {
  label: string;
  dockLabel: string;
  sub: string;
  icon: LucideIcon;
  tone: 'accent' | 'warn';
  route: string;
}

const ACTIONS: Record<ActionId, ActionMeta> = {
  orders: { label: 'New Orders', dockLabel: 'Orders', sub: 'Awaiting courier assignment', icon: Truck, tone: 'accent', route: '/orders' },
  lowStock: { label: 'Low Stock', dockLabel: 'Stock', sub: 'Items below minimum level', icon: AlertTriangle, tone: 'warn', route: '/products' },
  questions: { label: 'Questions', dockLabel: 'Questions', sub: 'Awaiting your reply', icon: HelpCircle, tone: 'accent', route: '/questions' },
  reviews: { label: 'Reviews', dockLabel: 'Reviews', sub: 'Recently submitted', icon: Star, tone: 'accent', route: '/reviews' },
};

const ACTION_IDS: ActionId[] = ['orders', 'lowStock', 'questions', 'reviews'];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [modal, setModal] = useState<ActionId | null>(null);
  const [counts, setCounts] = useState<Record<ActionId, number>>({
    orders: 0,
    lowStock: 0,
    questions: 0,
    reviews: 0,
  });

  // Stable per-action count callbacks for the always-mounted panels
  const onOrdersCount = useCallback((n: number) => setCounts(c => ({ ...c, orders: n })), []);
  const onLowStockCount = useCallback((n: number) => setCounts(c => ({ ...c, lowStock: n })), []);
  const onQuestionsCount = useCallback((n: number) => setCounts(c => ({ ...c, questions: n })), []);
  const onReviewsCount = useCallback((n: number) => setCounts(c => ({ ...c, reviews: n })), []);

  // Close modal on Escape
  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModal(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal]);

  const today = new Date()
    .toLocaleDateString('en-ZA', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();

  const M = modal ? ACTIONS[modal] : null;
  const ModalIcon = M?.icon;

  return (
    <>
      {/* Page header — terminal status bar */}
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-[11px]">
          <span className="h-[7px] w-[7px] rounded-full bg-pos shadow-[0_0_8px_#5fcf80]" />
          <h1 className="m-0 font-mono text-base font-semibold uppercase tracking-[.12em] text-body">
            Dashboard
          </h1>
          <span className="font-mono text-[11.5px] tracking-[.04em] text-mute">// overview</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Action dock buttons */}
          {ACTION_IDS.map((id) => {
            const m = ACTIONS[id];
            const Icon = m.icon;
            const isWarn = m.tone === 'warn';
            return (
              <button
                key={id}
                title={m.label}
                onClick={() => setModal(id)}
                className={`group inline-flex items-center gap-2 rounded-[7px] border border-line bg-panel px-[11px] py-[7px] font-mono text-dim transition-all duration-150 hover:text-body ${
                  isWarn ? 'hover:border-warn' : 'hover:border-accent'
                }`}
              >
                <Icon size={15} className={isWarn ? 'text-warn' : 'text-accent'} />
                <span className="hidden text-[11px] uppercase tracking-[.04em] sm:inline">{m.dockLabel}</span>
                <span
                  className={`rounded px-[5px] text-[10.5px] font-bold leading-[15px] text-accent-ink ${
                    isWarn ? 'bg-warn' : 'bg-accent'
                  }`}
                >
                  {counts[id]}
                </span>
              </button>
            );
          })}

          {/* Date chip */}
          <span className="hidden items-center gap-1.5 rounded-[7px] border border-line bg-panel px-2.5 py-[7px] font-mono text-[11px] text-dim md:inline-flex">
            <CalendarDays size={13} className="text-accent" />
            <span>{today}</span>
          </span>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <RevenueStats />
        <OrderStats />
        <CustomerStats />
      </div>

      {/* Charts: big revenue bars + stacked trend panels */}
      <div className="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-[1.55fr_1fr]">
        <Chart />
        <div className="grid grid-rows-2 gap-3">
          <OrderChart />
          <NewCustomersChart />
        </div>
      </div>

      {/* Popular products + customer split */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.55fr_1fr]">
        <PopularProducts />
        <CustomerOrderChart />
      </div>

      {/* Action modal — panels stay mounted so counts load with the page */}
      <div
        onClick={() => setModal(null)}
        className={`fixed inset-0 z-[60] items-start justify-center bg-black/60 px-4 pb-[4vh] pt-[7vh] ${
          modal ? 'flex animate-fade' : 'hidden'
        }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-[90%] w-full max-w-[560px] flex-col overflow-hidden rounded-card border border-line bg-panel shadow-[0_30px_80px_-20px_rgba(0,0,0,.87)] animate-pop"
        >
          {/* Modal header */}
          <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
            {M && ModalIcon && (
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  M.tone === 'warn' ? 'bg-warn/15 text-warn' : 'bg-accent/15 text-accent'
                }`}
              >
                <ModalIcon size={17} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold uppercase tracking-[.08em] text-body">
                  {M?.label}
                </span>
                {modal && (
                  <span
                    className={`rounded px-[7px] py-px font-mono text-[11px] font-bold ${
                      M?.tone === 'warn' ? 'bg-warn/15 text-warn' : 'bg-accent/15 text-accent'
                    }`}
                  >
                    {counts[modal]}
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-xs text-mute">{M?.sub}</div>
            </div>
            {M && (
              <button
                onClick={() => {
                  navigate(M.route);
                  setModal(null);
                }}
                className="inline-flex shrink-0 items-center gap-1 rounded-[7px] border border-line bg-panel px-2.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[.05em] text-accent transition hover:border-accent/40 hover:brightness-110"
              >
                View All <ArrowRight size={12} />
              </button>
            )}
            <button
              onClick={() => setModal(null)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] border border-line bg-panel text-dim transition hover:border-line2 hover:text-body"
            >
              <X size={15} />
            </button>
          </div>

          {/* Modal body — all four panels mounted, only the active one visible */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className={modal === 'orders' ? '' : 'hidden'}>
              <NewOrders bare onCountChange={onOrdersCount} />
            </div>
            <div className={modal === 'lowStock' ? '' : 'hidden'}>
              <LowStockAlert bare onCountChange={onLowStockCount} />
            </div>
            <div className={modal === 'questions' ? '' : 'hidden'}>
              <NewQuestions bare onCountChange={onQuestionsCount} />
            </div>
            <div className={modal === 'reviews' ? '' : 'hidden'}>
              <NewReviews bare onCountChange={onReviewsCount} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
