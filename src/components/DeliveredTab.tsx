import React from 'react';
import {
  Eye,
  User,
  MapPin,
  CheckCircle2,
  Calendar,
  DownloadCloud,
} from 'lucide-react';
import type { AdminOrder } from '../pages/Orders';

interface DeliveredTabProps {
  orders: AdminOrder[];
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const formatPrice = (value: number) =>
  `R${value.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`;

const DeliveredTab: React.FC<DeliveredTabProps> = ({ orders }) => {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 py-12 px-4 text-center">
        <CheckCircle2 size={36} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-600 font-medium mb-1">No delivered orders</p>
        <p className="text-sm text-gray-400">
          Completed orders will appear here.
        </p>
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
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={18} className="text-green-600" />
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
                <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-[.65rem] font-bold whitespace-nowrap uppercase tracking-wider">
                  Delivered
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
                <p className="text-[.65rem] text-gray-600 mb-0.5">Delivered</p>
                <p className="text-sm font-bold text-gray-900">
                  {order.estimated_delivery
                    ? formatDate(order.estimated_delivery)
                    : '—'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 size={14} className="text-green-600" />
              <p className="text-xs text-green-700 font-semibold">
                Delivered successfully
              </p>
            </div>
          </div>

          {/* Card Footer */}
          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-semibold text-xs">
              <Eye size={14} />
              Invoice
            </button>
            <button
              className="flex items-center justify-center px-2.5 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-xs"
              title="Download Invoice"
            >
              <DownloadCloud size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DeliveredTab;
