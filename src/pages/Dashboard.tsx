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
import NewOrders from '../components/NewOrders';

const Dashboard: React.FC = () => {
  return (
    <>
      <div className="mb-6 lg:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 font-medium">Welcome back! Here's what's happening with your business today.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
        {/* Left content area */}
        <div className="md:col-span-2 space-y-4 md:space-y-6 order-1">
          {/* New Orders Section */}
          <NewOrders />

          {/* Low Stock Alert */}
          <LowStockAlert />

          {/* Popular Products */}
          <PopularProducts />

          {/* Comments */}
          <Comments />
        </div>

        {/* Right content area - Charts */}
        <div className="md:col-span-3 space-y-4 md:space-y-6 order-2 md:order-2">
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
        </div>
      </div>
    </>
  );
};

export default Dashboard;
