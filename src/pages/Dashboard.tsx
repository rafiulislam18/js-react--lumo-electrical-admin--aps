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
  Sparkles,
  TrendingUp,
  LineChart,
  ShoppingBag,
  Users,
  ArrowUpRight,
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
      {/* Hero Header */}
      {/* <div className="relative mb-6 lg:mb-10 overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-5 sm:p-7 lg:p-8 shadow-lg">
        
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300 backdrop-blur">
              <Sparkles size={12} />
              <span>Live Overview</span>
            </div>
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Welcome back 👋
            </h1>
            <p className="max-w-xl text-sm font-medium text-slate-400 sm:text-base">
              Here's what's happening with your business today. Track performance, review activity, and take action.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800/60 px-3.5 py-2 text-sm font-semibold text-slate-200 shadow-sm backdrop-blur">
              <CalendarDays size={16} className="text-cyan-300" />
              <span className="">{today}</span>
            </div>
          </div>
        </div>
      </div> */}

      {/* Tab Navigation - Only visible on small screens */}
      <div className="md:hidden mb-5 flex gap-2 rounded-xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-1 shadow-inner">
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
            activeTab === 'actions'
              ? 'bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 text-emerald-300 shadow-md ring-1 ring-emerald-400/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap size={16} />
          <span>Take Actions</span>
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
            activeTab === 'stats'
              ? 'bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 text-cyan-300 shadow-md ring-1 ring-cyan-400/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 size={16} />
          <span>Stats & Charts</span>
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
            <div className="rounded-lg bg-cyan-500/15 p-1.5 ring-1 ring-cyan-400/20">
              <BarChart3 size={16} className="text-cyan-300" />
            </div>
            <h2 className="text-base font-bold tracking-tight text-white">Stats & Charts</h2>
            <div className="ml-2 h-px flex-1 bg-gradient-to-r from-slate-600 to-transparent" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-3">
            <RevenueStats />
            <OrderStats />
            <CustomerStats />
          </div>

          {/* Subsection: Trends */}
          <div className="flex items-center gap-2 pt-1">
            <LineChart size={14} className="text-slate-400" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Trends
            </span>
            <div className="ml-1 h-px flex-1 bg-slate-700/60" />
          </div>

          {/* Revenue Chart */}
          <Chart />

          {/* Orders Chart */}
          <OrderChart />

          {/* New Customers Trend */}
          <NewCustomersChart />

          {/* Subsection: Breakdown */}
          <div className="flex items-center gap-2 pt-1">
            <Users size={14} className="text-slate-400" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Breakdown
            </span>
            <div className="ml-1 h-px flex-1 bg-slate-700/60" />
          </div>

          {/* Customer Order Breakdown */}
          <CustomerOrderChart />

          {/* Subsection: Catalog */}
          <div className="flex items-center gap-2 pt-1">
            <ShoppingBag size={14} className="text-slate-400" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Catalog
            </span>
            <div className="ml-1 h-px flex-1 bg-slate-700/60" />
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
            <div className="rounded-lg bg-emerald-500/15 p-1.5 ring-1 ring-emerald-400/20">
              <Zap size={16} className="text-emerald-300" />
            </div>
            <h2 className="text-base font-bold tracking-tight text-white">Take Actions</h2>
            <div className="ml-2 h-px flex-1 bg-gradient-to-r from-slate-600 to-transparent" />
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
