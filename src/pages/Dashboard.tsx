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
  const [activeTab, setActiveTab] = useState<'stats' | 'actions'>('stats');

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      {/* Hero Header */}
      <div className="relative mb-6 lg:mb-10 overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-5 sm:p-7 lg:p-8 shadow-sm">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-emerald-200/40 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200/70 bg-white/70 px-3 py-1 text-xs font-semibold text-blue-700 backdrop-blur">
              <Sparkles size={12} />
              <span>Live Overview</span>
            </div>
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
              Welcome back 👋
            </h1>
            <p className="max-w-xl text-sm font-medium text-gray-600 sm:text-base">
              Here's what's happening with your business today. Track performance, review activity, and take action.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-3.5 py-2 text-sm font-semibold text-gray-700 shadow-sm backdrop-blur">
              <CalendarDays size={16} className="text-blue-600" />
              <span className="hidden sm:inline">{today}</span>
              <span className="sm:hidden">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <button className="group inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30">
              <TrendingUp size={16} />
              <span>View Reports</span>
              <ArrowUpRight
                size={14}
                className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Only visible on small screens */}
      <div className="md:hidden mb-5 flex gap-2 rounded-xl border border-gray-100 bg-gray-100/80 p-1 shadow-inner backdrop-blur">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
            activeTab === 'stats'
              ? 'bg-white text-blue-600 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 size={16} />
          <span>Stats & Charts</span>
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
            activeTab === 'actions'
              ? 'bg-white text-green-600 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Zap size={16} />
          <span>Take Actions</span>
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
            <div className="rounded-lg bg-blue-100 p-1.5">
              <BarChart3 size={16} className="text-blue-600" />
            </div>
            <h2 className="text-base font-bold tracking-tight text-gray-900">Stats & Charts</h2>
            <div className="ml-2 h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-3">
            <RevenueStats />
            <OrderStats />
            <CustomerStats />
          </div>

          {/* Subsection: Trends */}
          <div className="flex items-center gap-2 pt-1">
            <LineChart size={14} className="text-gray-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Trends
            </span>
            <div className="ml-1 h-px flex-1 bg-gray-100" />
          </div>

          {/* Revenue Chart */}
          <Chart />

          {/* Orders Chart */}
          <OrderChart />

          {/* New Customers Trend */}
          <NewCustomersChart />

          {/* Subsection: Breakdown */}
          <div className="flex items-center gap-2 pt-1">
            <Users size={14} className="text-gray-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Breakdown
            </span>
            <div className="ml-1 h-px flex-1 bg-gray-100" />
          </div>

          {/* Customer Order Breakdown */}
          <CustomerOrderChart />

          {/* Subsection: Catalog */}
          <div className="flex items-center gap-2 pt-1">
            <ShoppingBag size={14} className="text-gray-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Catalog
            </span>
            <div className="ml-1 h-px flex-1 bg-gray-100" />
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
            <div className="rounded-lg bg-green-100 p-1.5">
              <Zap size={16} className="text-green-600" />
            </div>
            <h2 className="text-base font-bold tracking-tight text-gray-900">Take Actions</h2>
            <div className="ml-2 h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
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
