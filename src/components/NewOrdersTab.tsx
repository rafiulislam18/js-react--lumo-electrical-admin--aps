import React, { useState } from 'react';
import { Eye, User, MapPin, Clock, Truck } from 'lucide-react';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  total: number;
  items: number;
  deliveryAddress: string;
  estimatedDelivery?: string;
}

interface NewOrdersTabProps {
  orders: Order[];
}

const NewOrdersTab: React.FC<NewOrdersTabProps> = ({ orders }) => {
  const [selectedCourier, setSelectedCourier] = useState<{ [key: string]: string }>({});

  const couriers = [
    { id: 'C001', name: 'Raihan Ahmed', area: 'Dhaka North' },
    { id: 'C002', name: 'Karim Hassan', area: 'Dhaka South' },
    { id: 'C003', name: 'Arif Khan', area: 'Chittagong' },
  ];

  const handleAssignCourier = (orderId: string) => {
    if (selectedCourier[orderId]) {
      alert(`Order ${orderId} assigned to courier ${selectedCourier[orderId]}`);
    }
  };

  return (
    <div className="space-y-3">
      {orders.length > 0 ? (
        orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
            {/* Card Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 text-base">📋</div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{order.id}</p>
                    <p className="text-xs text-gray-500">{new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold whitespace-nowrap">New</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="px-4 py-3 space-y-2.5">
              {/* Customer & Address Row */}
              <div className="flex items-center gap-2 text-sm">
                <User size={14} className="text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{order.customerName}</p>
                  <p className="text-xs text-gray-500 truncate">{order.deliveryAddress}</p>
                </div>
              </div>

              {/* Order Details Row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-600">Items</p>
                  <p className="text-sm font-bold text-gray-900">{order.items}</p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-600">Amount</p>
                  <p className="text-sm font-bold text-gray-900">৳{(order.total / 1000).toFixed(0)}K</p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-600">Ready</p>
                  <p className="text-sm font-bold text-gray-900">Today</p>
                </div>
              </div>

              {/* Courier Assignment */}
              <div className="bg-blue-50 rounded p-2.5 border border-blue-200">
                <div className="flex gap-2">
                  <select
                    value={selectedCourier[order.id] || ''}
                    onChange={(e) => setSelectedCourier({ ...selectedCourier, [order.id]: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 bg-white rounded border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-xs font-medium"
                  >
                    <option value="">Select courier...</option>
                    {couriers.map(courier => (
                      <option key={courier.id} value={courier.id}>
                        {courier.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssignCourier(order.id)}
                    disabled={!selectedCourier[order.id]}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold text-xs whitespace-nowrap"
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <button className="flex items-center justify-center gap-1.5 w-full px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors font-medium text-xs">
                <Eye size={14} />
                Details
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <div className="text-2xl mb-2">📋</div>
          <p className="text-gray-500 font-medium text-sm">No new orders</p>
          <p className="text-gray-400 text-xs mt-1">All orders assigned</p>
        </div>
      )}
    </div>
  );
};

export default NewOrdersTab;
