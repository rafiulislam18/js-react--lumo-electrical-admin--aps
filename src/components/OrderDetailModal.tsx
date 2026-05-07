import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../lib/api';
import { X, Loader, AlertCircle, Mail, Phone, MapPin, CreditCard, Package, Truck, User } from 'lucide-react';

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string | null;
  product_price: number;
  quantity: number;
}

interface OrderDetail {
  id: number;
  status: 'order_placed' | 'out_for_delivery' | 'delivered';
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_province: string;
  delivery_postal_code: string;
  comment?: string;
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  paid: boolean;
  payfast_payment_id?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  items_count: number;
  assigned_delivery_personnel_name?: string;
  assigned_delivery_personnel_email?: string;
  assigned_delivery_personnel_phone?: string;
}

interface OrderDetailModalProps {
  orderId: number;
  onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ orderId, onClose }) => {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authenticatedFetch(`/orders/admin/${orderId}/`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch order'}`);
      }
      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'order_placed':
        return 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30';
      case 'out_for_delivery':
        return 'bg-amber-500/15 text-amber-300 border border-amber-400/30';
      case 'delivered':
        return 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30';
      default:
        return 'bg-slate-700/40 text-slate-300';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'order_placed':
        return 'Order Placed';
      case 'out_for_delivery':
        return 'Out For Delivery';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-slate-800/80 border border-slate-700/60 rounded-2xl shadow-2xl backdrop-blur">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

        {/* Header */}
        <div className="sticky top-0 bg-slate-800/95 backdrop-blur border-b border-slate-700/50 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Order #{order?.id || ''}</h2>
              <p className="text-sm text-slate-400 mt-1">{formatDate(order?.created_at || '')}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
              <p className="text-slate-400">Loading order details...</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-400/30 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          ) : order ? (
            <div className="space-y-6">
              {/* Status and Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500 mb-2">Status</p>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {formatStatus(order.status)}
                  </span>
                </div>
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500 mb-2">Payment</p>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    order.paid
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                      : 'bg-red-500/15 text-red-300 border border-red-400/30'
                  }`}>
                    {order.paid ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="rounded-xl border border-slate-700/40 bg-slate-700/20 p-4">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <User size={16} className="text-sky-300" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500 mb-1">Name</p>
                    <p className="text-sm text-white font-medium">{order.first_name} {order.last_name}</p>
                  </div>
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500 mb-1">Email</p>
                    <p className="text-sm text-slate-300 flex items-center gap-1.5">
                      <Mail size={13} className="text-slate-400" />
                      {order.email}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500 mb-1">Phone</p>
                    <p className="text-sm text-slate-300 flex items-center gap-1.5">
                      <Phone size={13} className="text-slate-400" />
                      {order.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Personnel */}
              {order.assigned_delivery_personnel_name && (
                <div className="rounded-xl border border-slate-700/40 bg-slate-700/20 p-4">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Truck size={16} className="text-sky-300" />
                    Delivery Personnel
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500 mb-1">Name</p>
                      <p className="text-sm text-white font-medium">{order.assigned_delivery_personnel_name}</p>
                    </div>
                    {order.assigned_delivery_personnel_email && (
                      <div>
                        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500 mb-1">Email</p>
                        <p className="text-sm text-slate-300 flex items-center gap-1.5">
                          <Mail size={13} className="text-slate-400" />
                          {order.assigned_delivery_personnel_email}
                        </p>
                      </div>
                    )}
                    {order.assigned_delivery_personnel_phone && (
                      <div className="col-span-2">
                        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500 mb-1">Phone</p>
                        <p className="text-sm text-slate-300 flex items-center gap-1.5">
                          <Phone size={13} className="text-slate-400" />
                          {order.assigned_delivery_personnel_phone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              <div className="rounded-xl border border-slate-700/40 bg-slate-700/20 p-4">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <MapPin size={16} className="text-cyan-300" />
                  Delivery Address
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-slate-200">{order.delivery_address}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                    <div>
                      <span className="text-slate-500 text-xs">City: </span>
                      {order.delivery_city}
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs">Province: </span>
                      {order.delivery_province}
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 text-xs">Postal Code: </span>
                      {order.delivery_postal_code}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="rounded-xl border border-slate-700/40 bg-slate-700/20 p-4">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Package size={16} className="text-emerald-300" />
                  Order Items ({order.items_count})
                </h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-slate-800/60 rounded-lg border border-slate-700/40">
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-12 h-12 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{item.product_name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          R{item.product_price.toFixed(2)} × {item.quantity} = <span className="text-slate-300 font-semibold">R{(item.product_price * item.quantity).toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="rounded-xl border border-slate-700/40 bg-slate-700/20 p-4">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <CreditCard size={16} className="text-amber-300" />
                  Pricing Breakdown
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="text-slate-200 font-medium">R{parseFloat(order.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Tax (10%)</span>
                    <span className="text-slate-200 font-medium">R{parseFloat(order.tax).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Shipping</span>
                    <span className="text-slate-200 font-medium">
                      {parseFloat(order.shipping) === 0 ? 'Free' : `R${parseFloat(order.shipping).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t border-slate-700/60 pt-2 mt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Total</span>
                    <span className="text-lg font-bold text-cyan-300">R{parseFloat(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Comment */}
              {order.comment && (
                <div className="rounded-xl border border-slate-700/40 bg-slate-700/20 p-4">
                  <h3 className="text-sm font-bold text-white mb-2">Order Comment</h3>
                  <p className="text-sm text-slate-300">{order.comment}</p>
                </div>
              )}

              {/* Payment Details */}
              {order.payfast_payment_id && (
                <div className="rounded-xl border border-slate-700/40 bg-slate-700/20 p-4">
                  <p className="text-xs text-slate-500">PayFast Payment ID: <span className="text-slate-300 font-mono">{order.payfast_payment_id}</span></p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
