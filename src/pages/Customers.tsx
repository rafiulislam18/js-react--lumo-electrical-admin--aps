import React, { useState } from 'react';
import { Search, Mail, Phone, TrendingUp, MessageCircle, MapPin } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  segment: 'vip' | 'regular' | 'new';
  avatar: string;
}

const Customers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const customers: Customer[] = [
    { id: 'C001', name: 'Ahmed Khan', email: 'ahmed@email.com', phone: '+880 1700 123456', joinDate: '2023-05-10', totalOrders: 24, totalSpent: 85000, lastOrder: '2024-01-20', segment: 'vip', avatar: '👨' },
    { id: 'C002', name: 'Fatima Ali', email: 'fatima@email.com', phone: '+880 1700 234567', joinDate: '2023-08-22', totalOrders: 15, totalSpent: 56200, lastOrder: '2024-01-18', segment: 'regular', avatar: '👩' },
    { id: 'C003', name: 'Hassan Ahmed', email: 'hassan@email.com', phone: '+880 1700 345678', joinDate: '2023-11-15', totalOrders: 8, totalSpent: 34500, lastOrder: '2024-01-19', segment: 'regular', avatar: '👨' },
    { id: 'C004', name: 'Amina Khan', email: 'amina@email.com', phone: '+880 1700 456789', joinDate: '2024-01-05', totalOrders: 2, totalSpent: 8900, lastOrder: '2024-01-20', segment: 'new', avatar: '👩' },
    { id: 'C005', name: 'Ibrahim Hasan', email: 'ibrahim@email.com', phone: '+880 1700 567890', joinDate: '2023-06-18', totalOrders: 32, totalSpent: 128500, lastOrder: '2024-01-19', segment: 'vip', avatar: '👨' },
    { id: 'C006', name: 'Zainab Begum', email: 'zainab@email.com', phone: '+880 1700 678901', joinDate: '2023-09-30', totalOrders: 19, totalSpent: 72300, lastOrder: '2024-01-21', segment: 'regular', avatar: '👩' },
  ];

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSegmentColor = (segment: string) => {
    switch(segment) {
      case 'vip': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'regular': return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'new': return 'bg-green-100 text-green-800 border border-green-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="mb-6 lg:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Customers</h1>
        <p className="text-sm sm:text-base text-gray-600 font-medium">View and manage your customers.</p>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 lg:mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <p className="text-xs text-blue-700 font-semibold mb-1">Total Customers</p>
          <p className="text-xl lg:text-2xl font-bold text-blue-900">842</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
          <p className="text-xs text-yellow-700 font-semibold mb-1">VIP Members</p>
          <p className="text-xl lg:text-2xl font-bold text-yellow-900">128</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <p className="text-xs text-green-700 font-semibold mb-1">New This Month</p>
          <p className="text-xl lg:text-2xl font-bold text-green-900">24</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <p className="text-xs text-purple-700 font-semibold mb-1">Total Revenue</p>
          <p className="text-xl lg:text-2xl font-bold text-purple-900">৳8.2M</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 lg:mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Customers List */}
      <div className="space-y-3">
        {filteredCustomers.map(customer => (
          <div key={customer.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0 text-lg">
                    {customer.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{customer.name}</p>
                    <p className="text-xs text-gray-500">ID: {customer.id}</p>
                  </div>
                  <span className={`ml-auto sm:ml-2 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getSegmentColor(customer.segment)}`}>
                    {customer.segment}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-gray-600 ml-15 sm:ml-0">
                  <div className="flex items-center gap-1">
                    <Mail size={14} />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1">
                    <Phone size={14} />
                    {customer.phone}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:flex sm:items-center gap-4 sm:gap-6 text-right sm:text-left">
                <div>
                  <p className="text-xs text-gray-600">Orders</p>
                  <p className="font-bold text-gray-900">{customer.totalOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Spent</p>
                  <p className="font-bold text-gray-900">৳{(customer.totalSpent / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Last Order</p>
                  <p className="font-bold text-gray-900 text-sm">{new Date(customer.lastOrder).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>

              <button className="w-full sm:w-auto px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm">
                <MessageCircle size={16} className="inline mr-2" />
                Message
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Customers;
