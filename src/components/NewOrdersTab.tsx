import React, { useState } from 'react';
import {
  Eye,
  User,
  MapPin,
  ShoppingBag,
  Calendar,
} from 'lucide-react';
import type { AdminOrder } from '../pages/Orders';

interface NewOrdersTabProps {
  orders: AdminOrder[];
}

const couriers = [
  { id: 'C001', name: 'Raihan Ahmed', area: 'Cape Town North' },
  { id: 'C002', name: 'Karim Hassan', area: 'Cape Town South' },
  { id: 'C003', name: 'Arif Khan', area: 'Stellenbosch' },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const formatPrice = (value: number) =>
  `R${value.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`;

const NewOrdersTab: React.FC<NewOrdersTabProps> = ({ orders }) => {
  const [selectedCourier, setSelectedCourier] = useState<{
    [key: number]: string;
  }>({});

  const handleAssignCourier = (orderId: number) => {
    if (selectedCourier[orderId]) {
      alert(`Order #${orderId} assigned to courier ${selectedCourier[orderId]}`);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 py-12 px-4 text-center">
        <ShoppingBag size={36} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-600 font-medium mb-1">No new orders</p>
        <p className="text-sm text-gray-400">All orders have been assigned.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
        >
          {/* Card Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShoppingBag size={18} className="text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    Order #{order.id}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={11} />
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-[.65rem] font-bold whitespace-nowrap uppercase tracking-wider">
                  New
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[.65rem] font-bold whitespace-nowrap ${
                    order.paid
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {order.paid ? '✓ Paid' : 'Unpaid'}
                </span>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="px-4 py-4 space-y-3 flex-1">
            {/* Customer */}
            <div className="flex items-start gap-2 text-sm">
              <User
                size={14}
                className="text-gray-400 flex-shrink-0 mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">
                  {order.customer_name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {order.customer_email}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2 text-sm">
              <MapPin
                size={14}
                className="text-gray-400 flex-shrink-0 mt-0.5"
              />
              <p className="text-xs text-gray-600 line-clamp-2 flex-1">
                {order.delivery_address}
              </p>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-[.65rem] text-gray-600 mb-0.5">Items</p>
                <p className="text-sm font-bold text-gray-900">
                  {order.items_count}
                </p>
              </div>
              <div>
                <p className="text-[.65rem] text-gray-600 mb-0.5">Amount</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatPrice(order.total)}
                </p>
              </div>
              <div>
                <p className="text-[.65rem] text-gray-600 mb-0.5">ETA</p>
                <p className="text-sm font-bold text-gray-900">
                  {order.estimated_delivery
                    ? formatDate(order.estimated_delivery)
                    : '—'}
                </p>
              </div>
            </div>

            {/* Courier Assignment */}
            <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-200">
              <p className="text-[.65rem] text-blue-700 font-bold uppercase tracking-wider mb-1.5">
                Assign Courier
              </p>
              <div className="flex gap-2">
                <select
                  value={selectedCourier[order.id] || ''}
                  onChange={(e) =>
                    setSelectedCourier({
                      ...selectedCourier,
                      [order.id]: e.target.value,
                    })
                  }
                  className="flex-1 px-2.5 py-1.5 bg-white rounded border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-xs font-medium"
                >
                  <option value="">Select courier...</option>
                  {couriers.map((courier) => (
                    <option key={courier.id} value={courier.id}>
                      {courier.name} — {courier.area}
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
          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
            <button className="flex items-center justify-center gap-1.5 w-full px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-semibold text-xs">
              <Eye size={14} />
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewOrdersTab;
