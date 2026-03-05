import React from 'react';
import { Eye, User, MapPin, CheckCircle2, DownloadCloud } from 'lucide-react';

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

interface DeliveredTabProps {
  orders: Order[];
}

const DeliveredTab: React.FC<DeliveredTabProps> = ({ orders }) => {
  return (
    <div className="space-y-3">
      {orders.length > 0 ? (
        orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
            {/* Card Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 text-base">✅</div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{order.id}</p>
                    <p className="text-xs text-gray-500">{new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold whitespace-nowrap">Delivered</span>
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
                  <p className="text-sm font-bold text-gray-900">${(order.total / 1000).toFixed(0)}K</p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-600">Delivered</p>
                  <p className="text-sm font-bold text-gray-900">{order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}</p>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors font-medium text-xs">
                <Eye size={14} />
                Invoice
              </button>
              <button className="flex items-center justify-center px-2.5 py-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors text-xs" title="Download">
                <DownloadCloud size={14} />
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <div className="text-2xl mb-2">✅</div>
          <p className="text-gray-500 font-medium text-sm">No delivered orders</p>
          <p className="text-gray-400 text-xs mt-1">Orders will appear here</p>
        </div>
      )}
    </div>
  );
};

export default DeliveredTab;
