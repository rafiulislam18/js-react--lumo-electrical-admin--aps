import React from 'react';
import { Eye, User, MapPin, Navigation } from 'lucide-react';

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

interface OutForDeliveryTabProps {
  orders: Order[];
}

const OutForDeliveryTab: React.FC<OutForDeliveryTabProps> = ({ orders }) => {
  return (
    <div className="space-y-3">
      {orders.length > 0 ? (
        orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
            {/* Card Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 text-base">🚚</div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{order.id}</p>
                    <p className="text-xs text-gray-500">{new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold whitespace-nowrap">Out For Delivery</span>
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
                  <p className="text-xs text-gray-600">Est. Delivery</p>
                  <p className="text-sm font-bold text-gray-900">{order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}</p>
                </div>
              </div>

              {/* Delivery Progress */}
              <div className="bg-purple-50 rounded p-2.5 border border-purple-200">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-purple-600 rounded-full"></div>
                  </div>
                  <span className="text-xs font-bold text-gray-600">67%</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <button className="flex items-center justify-center gap-1.5 w-full px-2.5 py-1.5 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors font-medium text-xs">
                <Navigation size={14} />
                Track
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <div className="text-2xl mb-2">🚚</div>
          <p className="text-gray-500 font-medium text-sm">No orders out for delivery</p>
          <p className="text-gray-400 text-xs mt-1">All orders being prepared</p>
        </div>
      )}
    </div>
  );
};

export default OutForDeliveryTab;
