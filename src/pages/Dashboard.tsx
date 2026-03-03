import React from 'react';
import Chart from '../components/Chart';
import PopularProducts from '../components/PopularProducts';
import Comments from '../components/Comments';
import RevenueStats from '../components/RevenueStats';
import OrderStats from '../components/OrderStats';
import CustomerStats from '../components/CustomerStats';
import LowStockAlert from '../components/LowStockAlert';
import OrderChart from '../components/OrderChart';
import CustomerOrderChart from '../components/CustomerOrderChart';
import NewCustomersChart from '../components/NewCustomersChart';

const Dashboard: React.FC = () => {
  return (
    <>
      <div className="mb-6 lg:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 font-medium">Welcome back! Here's what's happening with your business today.</p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8 xl:gap-10">
        {/* Left content area */}
        <div className="xl:col-span-3 space-y-6 lg:space-y-8 xl:space-y-10">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <RevenueStats />
            <OrderStats />
            <CustomerStats />
          </div>
          
          {/* Revenue Chart */}
          <Chart />

          {/* Orders Chart */}
          <OrderChart />

          {/* Customer Order Breakdown */}
          <CustomerOrderChart />

          {/* New Customers Trend */}
          <NewCustomersChart />
        </div>
        
        {/* Right sidebar */}
        <div className="space-y-6 lg:space-y-8">
          <LowStockAlert />
          <PopularProducts />
          <Comments />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
