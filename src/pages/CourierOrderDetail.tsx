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
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="font-mono text-xs text-mute uppercase tracking-[.1em] animate-pulse">Loading…</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-neg text-xs">{error || 'Order not found.'}</p>
        <button onClick={() => navigate('/courier/dashboard')} className="text-accent text-sm font-semibold hover:underline">
          Back to dashboard
        </button>
      </div>
    );
  }

  const fullAddress = `${order.delivery_address}, ${order.delivery_city}, ${order.delivery_province} ${order.delivery_postal_code}`;

  return (
    <div className="min-h-screen bg-bg text-body">
      {/* Header — terminal status bar */}
      <div className="border-b border-line bg-bg2 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <button
            onClick={() => navigate('/courier/dashboard')}
            className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-panel border border-line text-dim hover:text-body hover:border-[#3a3d44] transition shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-[6px] h-[6px] rounded-full bg-pos shadow-[0_0_8px_#5fcf80] shrink-0" />
              <p className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute">Delivery Order</p>
            </div>
            <p className="font-mono text-sm font-semibold text-body leading-tight">#{order.id}</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-[5px] font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] whitespace-nowrap px-2 py-[3px] rounded-[5px] text-warn bg-warn/[.13] border border-warn/[.28]">
            <span className="w-1.5 h-1.5 rounded-full bg-warn" />
            Out for Delivery
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Customer Info */}
        <section className="bg-panel border border-line rounded-card p-4">
          <h2 className="font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-dim mb-4">Customer</h2>
          <div className="space-y-3">
            <p className="text-base font-semibold text-body">{order.customer_name}</p>
            <div className="flex items-center gap-2.5 font-mono text-xs text-dim">
              <Phone size={14} className="text-mute shrink-0" />
              <span>{order.customer_phone}</span>
            </div>
            <div className="flex items-center gap-2.5 font-mono text-xs text-dim">
              <Mail size={14} className="text-mute shrink-0" />
              <span>{order.customer_email}</span>
            </div>
          </div>
        </section>

        {/* Delivery Address */}
        <section className="bg-panel border border-line rounded-card p-4">
          <h2 className="font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-dim mb-4">Delivery Address</h2>
          <div className="flex items-start gap-2.5">
            <MapPin size={15} className="text-accent shrink-0 mt-0.5" />
            <p className="text-sm text-body leading-relaxed">{fullAddress}</p>
          </div>
        </section>

        {/* Special Instructions */}
        {order.comment && (
          <section className="bg-panel border border-line border-l-2 border-l-warn rounded-card p-4">
            <h2 className="font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-warn mb-3 flex items-center gap-2">
              <MessageSquare size={13} />
              Special Instructions
            </h2>
            <p className="text-sm text-dim leading-relaxed">{order.comment}</p>
          </section>
        )}

        {/* Order Items */}
        <section className="bg-panel border border-line rounded-card p-4">
          <h2 className="font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-dim mb-4 flex items-center gap-2">
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
                    className="w-12 h-12 rounded-[7px] object-cover bg-panel2 border border-line shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-[7px] bg-panel2 border border-line flex items-center justify-center shrink-0">
                    <Package size={16} className="text-mute" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-body truncate">{item.product_name}</p>
                  <p className="font-mono text-[11px] text-mute mt-0.5">Qty: {item.quantity} × R {item.unit_price}</p>
                </div>
                <p className="font-mono text-sm font-semibold text-body shrink-0">
                  R {(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Summary */}
        <section className="bg-panel border border-line rounded-card p-4">
          <h2 className="font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-dim mb-4 flex items-center gap-2">
            <Receipt size={13} />
            Summary
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-dim">
              <span>Subtotal</span>
              <span className="font-mono">R {order.subtotal}</span>
            </div>
            <div className="flex justify-between text-dim">
              <span>Tax</span>
              <span className="font-mono">R {order.tax}</span>
            </div>
            <div className="flex justify-between text-dim">
              <span>Shipping</span>
              <span className="font-mono">R {order.shipping}</span>
            </div>
            <div className="h-px bg-line my-1" />
            <div className="flex justify-between text-base font-bold text-body">
              <span>Total</span>
              <span className="font-mono text-accent">R {order.total}</span>
            </div>
          </div>
        </section>

        {/* Mark as Delivered */}
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="w-full inline-flex items-center justify-center gap-[7px] py-3 text-[12.5px] font-bold rounded-[7px] bg-accent text-accent-ink border border-accent hover:brightness-110 transition"
          >
            <CheckCircle2 size={17} />
            Mark as Delivered
          </button>
        ) : (
          <div className="bg-panel border border-pos/30 rounded-card p-4 space-y-3 animate-pop">
            <p className="text-sm font-semibold text-body text-center">
              Confirm delivery for order <span className="font-mono">#{order.id}</span>?
            </p>
            <p className="text-xs text-mute text-center">This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                disabled={marking}
                className="flex-1 inline-flex items-center justify-center py-2.5 text-[12.5px] font-bold rounded-[7px] bg-panel text-dim border border-line hover:border-[#3a3d44] hover:text-body transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkDelivered}
                disabled={marking}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-[12.5px] font-bold rounded-[7px] bg-pos/15 text-pos border border-pos/40 hover:bg-pos/25 transition disabled:opacity-50"
              >
                {marking ? (
                  <><div className="h-3.5 w-3.5 rounded-full border-2 border-pos border-t-transparent animate-spin" />Confirming...</>
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
