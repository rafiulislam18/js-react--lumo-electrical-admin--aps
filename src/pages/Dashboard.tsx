import React from 'react';
import { ChevronDown } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import UserAvatar from '../components/UserAvatar';
import Chart from '../components/Chart';
import PopularProducts from '../components/PopularProducts';
import Comments from '../components/Comments';

const Dashboard: React.FC = () => {
  const users = [
    { name: 'Johnson D.' },
    { name: 'Didinya J.' },
    { name: 'Penny L.' },
    { name: 'Elon M.' },
  ];

  return (
    <>
      <div className="mb-6 lg:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 font-medium">Welcome back! Here's what's happening with your business today.</p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8 xl:gap-10">
        {/* Left content area */}
        <div className="xl:col-span-3 space-y-6 lg:space-y-8 xl:space-y-10">
          {/* Overview section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-4">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Overview</h2>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                <span className="text-sm text-gray-700 font-medium">All Time</span>
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 xl:gap-8 mb-6 lg:mb-8 xl:mb-10">
              <MetricCard 
                title="Customers" 
                value="10,243" 
                change="8%" 
                changeType="increase" 
              />
              <MetricCard 
                title="Income" 
                value="$39,403,450" 
                change="8%" 
                changeType="increase" 
              />
            </div>
          </div>
          
          {/* Welcome section */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 xl:p-10 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-6 lg:mb-8">Welcome to our new online experience</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {users.map((user, index) => (
                <UserAvatar key={index} name={user.name} />
              ))}
            </div>
          </div>
          
          {/* Chart */}
          <Chart />
        </div>
        
        {/* Right sidebar */}
        <div className="space-y-6 lg:space-y-8">
          <PopularProducts />
          <Comments />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
