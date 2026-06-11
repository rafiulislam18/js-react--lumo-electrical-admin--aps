import React, { useState } from 'react';
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
  BarChart3,
  Zap,
  CalendarDays,
  LineChart,
  ShoppingBag,
  Users,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'actions'>('actions');

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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
          <span className="inline-flex items-center gap-1.5 rounded-[7px] border border-line bg-panel px-2.5 py-[7px] font-mono text-[11px] text-dim">
            <CalendarDays size={13} className="text-accent" />
            <span>{today}</span>
          </span>
        </div>
      </div>

      {/* Tab Navigation - Only visible on small screens */}
      <div className="md:hidden mb-5 flex gap-[2px] rounded-lg border border-line bg-panel p-[3px]">
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex flex-1 items-center justify-center gap-[7px] rounded-md px-3 py-2 font-mono text-[11.5px] font-semibold uppercase tracking-[.03em] transition-colors ${
            activeTab === 'actions'
              ? 'bg-panel2 text-body shadow-[inset_0_0_0_1px_#23262d]'
              : 'text-mute hover:text-body'
          }`}
        >
          <Zap size={14} className={activeTab === 'actions' ? 'text-accent' : ''} />
          <span>Take Actions</span>
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-1 items-center justify-center gap-[7px] rounded-md px-3 py-2 font-mono text-[11.5px] font-semibold uppercase tracking-[.03em] transition-colors ${
            activeTab === 'stats'
              ? 'bg-panel2 text-body shadow-[inset_0_0_0_1px_#23262d]'
              : 'text-mute hover:text-body'
          }`}
        >
          <BarChart3 size={14} className={activeTab === 'stats' ? 'text-accent' : ''} />
          <span>Stats &amp; Charts</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:gap-6">
        {/* Left content area - Stats & Charts Tab */}
        <div
          className={`order-1 space-y-5 transition-all duration-200 md:order-1 md:col-span-3 md:space-y-6 ${
            activeTab === 'stats' ? 'block' : 'hidden md:block'
          }`}
        >
          {/* Section heading */}
          <div className="hidden items-center gap-2 md:flex">
            <BarChart3 size={14} className="text-accent" />
            <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-dim">
              Stats &amp; Charts
            </h2>
            <div className="ml-2 h-px flex-1 bg-line" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-3">
            <RevenueStats />
            <OrderStats />
            <CustomerStats />
          </div>

          {/* Subsection: Trends */}
          <div className="flex items-center gap-2 pt-1">
            <LineChart size={13} className="text-mute" />
            <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[.12em] text-mute">
              Trends
            </span>
            <div className="ml-1 h-px flex-1 bg-line" />
          </div>

          {/* Revenue Chart */}
          <Chart />

          {/* Orders Chart */}
          <OrderChart />

          {/* New Customers Trend */}
          <NewCustomersChart />

          {/* Subsection: Breakdown */}
          <div className="flex items-center gap-2 pt-1">
            <Users size={13} className="text-mute" />
            <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[.12em] text-mute">
              Breakdown
            </span>
            <div className="ml-1 h-px flex-1 bg-line" />
          </div>

          {/* Customer Order Breakdown */}
          <CustomerOrderChart />

          {/* Subsection: Catalog */}
          <div className="flex items-center gap-2 pt-1">
            <ShoppingBag size={13} className="text-mute" />
            <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[.12em] text-mute">
              Catalog
            </span>
            <div className="ml-1 h-px flex-1 bg-line" />
          </div>

          {/* Popular Products */}
          <PopularProducts />
        </div>

        {/* Right content area - Take Actions Tab */}
        <div
          className={`order-2 space-y-5 transition-all duration-200 md:order-2 md:col-span-2 md:space-y-6 ${
            activeTab === 'actions' ? 'block' : 'hidden md:block'
          }`}
        >
          {/* Section heading */}
          <div className="hidden items-center gap-2 md:flex">
            <Zap size={14} className="text-accent" />
            <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-dim">
              Take Actions
            </h2>
            <div className="ml-2 h-px flex-1 bg-line" />
          </div>

          {/* New Orders Section */}
          <NewOrders />

          {/* Low Stock Alert */}
          <LowStockAlert />

          {/* New Questions */}
          <NewQuestions />

          {/* New Reviews */}
          <NewReviews />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
