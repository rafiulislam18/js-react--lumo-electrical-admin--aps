import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authenticatedFetch } from '../lib/api';
import { ArrowLeft, MapPin, Phone, Mail, Package, Receipt, MessageSquare, CheckCircle2 } from 'lucide-react';

interface OrderItem {
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: string;
}

interface OrderDetail {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_province: string;
  delivery_postal_code: string;
  comment: string;
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  items: OrderItem[];
  items_count: number;
  created_at: string;
}

const CourierOrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await authenticatedFetch(`/orders/delivery/${orderId}/`);
        if (!response.ok) throw new Error('Order not found');
        const data = await response.json();
        setOrder(data);
      } catch {
        setError('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleMarkDelivered = async () => {
    setMarking(true);
    try {
      const response = await authenticatedFetch(`/orders/delivery/${orderId}/mark-delivered/`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to mark as delivered');
      navigate('/courier/dashboard');
    } catch {
      setError('Failed to mark order as delivered. Please try again.');
    } finally {
      setMarking(false);
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-red-300 text-sm">{error || 'Order not found.'}</p>
        <button onClick={() => navigate('/courier/dashboard')} className="text-cyan-400 text-sm hover:underline">
          Back to dashboard
        </button>
      </div>
    );
  }

  const fullAddress = `${order.delivery_address}, ${order.delivery_city}, ${order.delivery_province} ${order.delivery_postal_code}`;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/60 bg-slate-800/60 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/courier/dashboard')}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-xs text-slate-400 font-medium">Delivery Order</p>
            <p className="text-sm font-semibold text-white leading-tight">#{order.id}</p>
          </div>
          <span className="ml-auto text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
            Out for Delivery
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Customer Info */}
        <section className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Customer</h2>
          <div className="space-y-3">
            <p className="text-base font-semibold text-white">{order.customer_name}</p>
            <div className="flex items-center gap-2.5 text-sm text-slate-300">
              <Phone size={14} className="text-slate-500 shrink-0" />
              <span>{order.customer_phone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-300">
              <Mail size={14} className="text-slate-500 shrink-0" />
              <span>{order.customer_email}</span>
            </div>
          </div>
        </section>

        {/* Delivery Address */}
        <section className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Delivery Address</h2>
          <div className="flex items-start gap-2.5">
            <MapPin size={15} className="text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-200 leading-relaxed">{fullAddress}</p>
          </div>
        </section>

        {/* Special Instructions */}
        {order.comment && (
          <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
            <h2 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MessageSquare size={13} />
              Special Instructions
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">{order.comment}</p>
          </section>
        )}

        {/* Order Items */}
        <section className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Package size={13} />
            Items ({order.items_count})
          </h2>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {item.product_image ? (
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center shrink-0">
                    <Package size={16} className="text-slate-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.product_name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Qty: {item.quantity} × R {item.unit_price}</p>
                </div>
                <p className="text-sm font-semibold text-white shrink-0">
                  R {(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Summary */}
        <section className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Receipt size={13} />
            Summary
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>R {order.subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Tax</span>
              <span>R {order.tax}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Shipping</span>
              <span>R {order.shipping}</span>
            </div>
            <div className="h-px bg-slate-700/60 my-1" />
            <div className="flex justify-between text-base font-bold text-white">
              <span>Total</span>
              <span>R {order.total}</span>
            </div>
          </div>
        </section>

        {/* Mark as Delivered */}
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
          >
            <CheckCircle2 size={17} />
            Mark as Delivered
          </button>
        ) : (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-3">
            <p className="text-sm font-semibold text-white text-center">Confirm delivery for order #{order.id}?</p>
            <p className="text-xs text-slate-400 text-center">This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                disabled={marking}
                className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm font-medium hover:bg-slate-700/60 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkDelivered}
                disabled={marking}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {marking ? (
                  <><div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Confirming...</>
                ) : (
                  <><CheckCircle2 size={15} />Confirm</>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CourierOrderDetail;
