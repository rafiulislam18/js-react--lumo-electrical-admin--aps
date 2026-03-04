import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle2 } from 'lucide-react';
import NewOrdersTab from '../components/NewOrdersTab';
import OutForDeliveryTab from '../components/OutForDeliveryTab';
import DeliveredTab from '../components/DeliveredTab';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  items: number;
  deliveryAddress: string;
  estimatedDelivery?: string;
}

type TabType = 'new' | 'out-for-delivery' | 'delivered';

const Orders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('new');
  const [searchTerm, setSearchTerm] = useState('');

  const orders: Order[] = [
    { id: 'ORD001', customerName: 'Ahmed Khan', customerEmail: 'ahmed@email.com', orderDate: '2024-01-15', total: 12500, status: 'delivered', items: 3, deliveryAddress: 'Dhaka, Bangladesh', estimatedDelivery: '2024-01-18' },
    { id: 'ORD002', customerName: 'Fatima Ali', customerEmail: 'fatima@email.com', orderDate: '2024-01-18', total: 8750, status: 'shipped', items: 2, deliveryAddress: 'Chittagong, Bangladesh', estimatedDelivery: '2024-01-22' },
    { id: 'ORD003', customerName: 'Hassan Ahmed', customerEmail: 'hassan@email.com', orderDate: '2024-01-19', total: 15300, status: 'confirmed', items: 5, deliveryAddress: 'Sylhet, Bangladesh', estimatedDelivery: '2024-01-25' },
    { id: 'ORD004', customerName: 'Amina Khan', customerEmail: 'amina@email.com', orderDate: '2024-01-20', total: 5600, status: 'pending', items: 1, deliveryAddress: 'Rajshahi, Bangladesh', estimatedDelivery: '2024-01-28' },
    { id: 'ORD005', customerName: 'Ibrahim Hasan', customerEmail: 'ibrahim@email.com', orderDate: '2024-01-20', total: 21200, status: 'shipped', items: 6, deliveryAddress: 'Khulna, Bangladesh', estimatedDelivery: '2024-01-24' },
    { id: 'ORD006', customerName: 'Zainab Begum', customerEmail: 'zainab@email.com', orderDate: '2024-01-21', total: 9800, status: 'delivered', items: 3, deliveryAddress: 'Gazipur, Bangladesh', estimatedDelivery: '2024-01-23' },
  ];

  const getTabOrders = () => {
    let filtered = orders;
    
    if (activeTab === 'new') {
      filtered = orders.filter(o => o.status === 'pending' || o.status === 'confirmed');
    } else if (activeTab === 'out-for-delivery') {
      filtered = orders.filter(o => o.status === 'shipped');
    } else if (activeTab === 'delivered') {
      filtered = orders.filter(o => o.status === 'delivered');
    }

    return filtered.filter(order =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredOrders = getTabOrders();

  const getTabStats = () => {
    const newCount = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
    const outForDeliveryCount = orders.filter(o => o.status === 'shipped').length;
    const deliveredCount = orders.filter(o => o.status === 'delivered').length;
    return { newCount, outForDeliveryCount, deliveredCount };
  };

  const stats = getTabStats();

  return (
    <>
      <div className="mb-4 lg:mb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 tracking-tight">Orders</h1>
        <p className="text-sm text-gray-600 font-medium">Manage all orders in one place.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row gap-1.5 mb-6">
        <button
          onClick={() => setActiveTab('new')}
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 justify-center sm:justify-start text-sm ${
            activeTab === 'new'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          <Package size={16} />
          <span>New Orders</span>
          <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${activeTab === 'new' ? 'bg-blue-400' : 'bg-gray-100 text-gray-700'}`}>
            {stats.newCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('out-for-delivery')}
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 justify-center sm:justify-start text-sm ${
            activeTab === 'out-for-delivery'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300 hover:text-purple-600'
          }`}
        >
          <Truck size={16} />
          <span>Our For Delivery</span>
          <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${activeTab === 'out-for-delivery' ? 'bg-purple-400' : 'bg-gray-100 text-gray-700'}`}>
            {stats.outForDeliveryCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('delivered')}
          className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 justify-center sm:justify-start text-sm ${
            activeTab === 'delivered'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300 hover:text-green-600'
          }`}
        >
          <CheckCircle2 size={16} />
          <span>Delivered</span>
          <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${activeTab === 'delivered' ? 'bg-green-400' : 'bg-gray-100 text-gray-700'}`}>
            {stats.deliveredCount}
          </span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'new' && <NewOrdersTab orders={filteredOrders} />}
      {activeTab === 'out-for-delivery' && <OutForDeliveryTab orders={filteredOrders} />}
      {activeTab === 'delivered' && <DeliveredTab orders={filteredOrders} />}
    </>
  );
};

export default Orders;
