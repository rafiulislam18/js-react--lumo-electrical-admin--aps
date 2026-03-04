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
import { BarChart3, Zap } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'actions'>('stats');

  return (
    <>
      <div className="mb-6 lg:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 font-medium">Welcome back! Here's what's happening with your business today.</p>
      </div>
      
      {/* Tab Navigation - Only visible on small screens */}
      <div className="md:hidden mb-4 flex gap-2 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${ activeTab === 'stats'
            ? 'bg-white text-blue-600 shadow-md'
            : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 size={16} />
          <span>Stats & Charts</span>
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
            activeTab === 'actions'
              ? 'bg-white text-green-600 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Zap size={16} />
          <span>Take Actions</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
        {/* Left content area - Stats & Charts Tab */}
        <div className={`md:col-span-3 space-y-4 md:space-y-6 order-1 md:order-1 transition-all duration-200 ${
          activeTab === 'stats' ? 'block' : 'hidden md:block'
        }`}>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-3">
            <RevenueStats />
            <OrderStats />
            <CustomerStats />
          </div>

          {/* Revenue Chart */}
          <Chart />

          {/* Orders Chart */}
          <OrderChart />

          {/* New Customers Trend */}
          <NewCustomersChart />

          {/* Customer Order Breakdown */}
          <CustomerOrderChart />

          {/* Popular Products */}
          <PopularProducts />
        </div>

        {/* Right content area - Take Actions Tab */}
        <div className={`md:col-span-2 space-y-4 md:space-y-6 order-2 md:order-2 transition-all duration-200 ${
          activeTab === 'actions' ? 'block' : 'hidden md:block'
        }`}>
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
