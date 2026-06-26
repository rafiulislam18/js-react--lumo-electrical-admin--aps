import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../lib/api';
import { X, Loader, AlertCircle, Mail, Phone, MapPin, CreditCard, Package, Truck, User, Send, ChevronDown } from 'lucide-react';

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
  status: 'order_placed' | 'assigned_courier' | 'delivered';
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

interface DeliveryPersonnel {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  active_orders: number;
}

interface OrderDetailModalProps {
  orderId: number;
  onClose: () => void;
  /** Called after a successful courier assignment so the parent list can refresh. */
  onAssigned?: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ orderId, onClose, onAssigned }) => {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Courier assignment
  const [personnel, setPersonnel] = useState<DeliveryPersonnel[]>([]);
  const [personnelLoading, setPersonnelLoading] = useState(false);
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<number | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  // Load available couriers only when the order has none assigned yet
  useEffect(() => {
    if (order && !order.assigned_delivery_personnel_name) {
      fetchPersonnel();
    }
  }, [order?.assigned_delivery_personnel_name]);

  const fetchPersonnel = async () => {
    try {
      setPersonnelLoading(true);
      const response = await authenticatedFetch('/users/admin/delivery-personnel/?page_size=100');
      if (response.ok) {
        const data = await response.json();
        setPersonnel(data.results || []);
      }
    } catch (err) {
      console.error('Failed to load delivery personnel:', err);
    } finally {
      setPersonnelLoading(false);
    }
  };

  const handleAssign = async () => {
    if (selectedPersonnelId === null) return;
    setAssigning(true);
    setAssignError(null);
    try {
      const response = await authenticatedFetch(`/orders/${orderId}/assign-delivery-personnel/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_delivery_personnel: selectedPersonnelId }),
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to assign courier');
      }
      setSelectedPersonnelId(null);
      await fetchOrderDetail();
      onAssigned?.();
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : 'Failed to assign courier');
    } finally {
      setAssigning(false);
    }
  };

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
        return 'text-warn bg-warn/[.13] border border-warn/[.28]';
      case 'assigned_courier':
        return 'text-info bg-info/[.13] border border-info/[.28]';
      case 'delivered':
        return 'text-pos bg-pos/[.13] border border-pos/[.28]';
      default:
        return 'text-dim bg-panel2 border border-line';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'order_placed':
        return 'Order Placed';
      case 'assigned_courier':
        return 'Courier Assigned';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[7vh] pb-[4vh] bg-black/60 animate-fade">
      <div className="w-full max-w-2xl max-h-full flex flex-col bg-panel border border-line rounded-card shadow-[0_30px_80px_-20px_rgba(0,0,0,.87)] overflow-hidden animate-pop">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line">
          <div className="w-9 h-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
            <Package size={17} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-mono font-semibold text-sm tracking-[.08em] uppercase text-body">
              ORD-{order?.id || ''}
            </span>
            <div className="font-mono text-xs text-mute mt-0.5">{formatDate(order?.created_at || '')}</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-panel border border-line text-dim hover:text-body hover:border-line2 transition shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader className="w-7 h-7 text-accent animate-spin mb-3" />
              <p className="font-mono text-xs text-mute uppercase tracking-[.1em]">Loading order details…</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-4 bg-neg/10 border border-neg/30 rounded-card">
              <AlertCircle className="w-5 h-5 text-neg flex-shrink-0" />
              <p className="text-sm text-neg">{error}</p>
            </div>
          ) : order ? (
            <div className="space-y-4">
              {/* Status and Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[.12em] text-mute mb-2">Status</p>
                  <span className={`inline-flex items-center gap-[5px] font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] px-2 py-[3px] rounded-[5px] whitespace-nowrap ${getStatusColor(order.status)}`}>
                    {formatStatus(order.status)}
                  </span>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[.12em] text-mute mb-2">Payment</p>
                  <span className={`inline-flex items-center gap-[5px] font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] px-2 py-[3px] rounded-[5px] whitespace-nowrap ${
                    order.paid
                      ? 'text-pos bg-pos/[.13] border border-pos/[.28]'
                      : 'text-warn bg-warn/[.13] border border-warn/[.28]'
                  }`}>
                    {order.paid ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Assign Courier — only when none assigned yet */}
              {!order.assigned_delivery_personnel_name && order.status !== 'delivered' && (
                <div className="rounded-lg border border-line bg-panel2 p-4">
                  <h3 className="font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-dim mb-3 flex items-center gap-2">
                    <Truck size={14} className="text-accent" />
                    Assign Courier
                  </h3>

                  {personnelLoading ? (
                    <div className="flex items-center gap-2 py-2 text-mute">
                      <Loader size={14} className="animate-spin" />
                      <span className="font-mono text-xs">Loading couriers…</span>
                    </div>
                  ) : personnel.length === 0 ? (
                    <p className="text-[12.5px] text-mute">No delivery personnel available.</p>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1 min-w-0">
                          <select
                            value={selectedPersonnelId ?? ''}
                            onChange={(e) => setSelectedPersonnelId(e.target.value ? Number(e.target.value) : null)}
                            disabled={assigning}
                            className="w-full appearance-none bg-panel border border-line rounded-[7px] pl-3 pr-9 py-2 text-[12.5px] text-body outline-none focus:border-accent/50 transition disabled:opacity-50 cursor-pointer"
                          >
                            <option value="">Select courier…</option>
                            {personnel.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.first_name} {p.last_name} ({p.active_orders} active)
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-mute pointer-events-none" />
                        </div>
                        <button
                          onClick={handleAssign}
                          disabled={selectedPersonnelId === null || assigning}
                          className="inline-flex items-center justify-center gap-[7px] px-3.5 py-2 text-[12.5px] font-bold rounded-[7px] bg-accent text-accent-ink border border-accent hover:brightness-110 transition whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {assigning ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
                          {assigning ? 'Assigning…' : 'Assign'}
                        </button>
                      </div>
                      {assignError && (
                        <p className="mt-2 text-[11.5px] text-neg">{assignError}</p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Delivery Personnel */}
              {order.assigned_delivery_personnel_name && (
                <div className="rounded-lg border border-line bg-panel2 p-4">
                  <h3 className="font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-dim mb-3.5 flex items-center gap-2">
                    <Truck size={14} className="text-info" />
                    Delivery Personnel
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[.12em] text-mute mb-1">Name</p>
                      <p className="text-[12.5px] text-body font-medium">{order.assigned_delivery_personnel_name}</p>
                    </div>
                    {order.assigned_delivery_personnel_email && (
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[.12em] text-mute mb-1">Email</p>
                        <p className="text-[12.5px] text-dim flex items-center gap-1.5">
                          <Mail size={13} className="text-mute" />
                          {order.assigned_delivery_personnel_email}
                        </p>
                      </div>
                    )}
                    {order.assigned_delivery_personnel_phone && (
                      <div className="col-span-2">
                        <p className="font-mono text-[10px] uppercase tracking-[.12em] text-mute mb-1">Phone</p>
                        <p className="text-[12.5px] text-dim flex items-center gap-1.5">
                          <Phone size={13} className="text-mute" />
                          {order.assigned_delivery_personnel_phone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div className="rounded-lg border border-line bg-panel2 p-4">
                <h3 className="font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-dim mb-3.5 flex items-center gap-2">
                  <User size={14} className="text-info" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[.12em] text-mute mb-1">Name</p>
                    <p className="text-[12.5px] text-body font-medium">{order.first_name} {order.last_name}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[.12em] text-mute mb-1">Email</p>
                    <p className="text-[12.5px] text-dim flex items-center gap-1.5">
                      <Mail size={13} className="text-mute" />
                      {order.email}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-mono text-[10px] uppercase tracking-[.12em] text-mute mb-1">Phone</p>
                    <p className="text-[12.5px] text-dim flex items-center gap-1.5">
                      <Phone size={13} className="text-mute" />
                      {order.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="rounded-lg border border-line bg-panel2 p-4">
                <h3 className="font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-dim mb-3.5 flex items-center gap-2">
                  <MapPin size={14} className="text-accent" />
                  Delivery Address
                </h3>
                <div className="space-y-2">
                  <p className="text-[12.5px] text-body">{order.delivery_address}</p>
                  <div className="grid grid-cols-2 gap-2 text-[12.5px] text-dim">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-[.08em] text-mute">City: </span>
                      {order.delivery_city}
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-[.08em] text-mute">Province: </span>
                      {order.delivery_province}
                    </div>
                    <div className="col-span-2">
                      <span className="font-mono text-[10px] uppercase tracking-[.08em] text-mute">Postal Code: </span>
                      {order.delivery_postal_code}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="rounded-lg border border-line bg-panel2 p-4">
                <h3 className="font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-dim mb-3.5 flex items-center gap-2">
                  <Package size={14} className="text-pos" />
                  Order Items ({order.items_count})
                </h3>
                <div className="space-y-2.5">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-panel rounded-lg border border-line">
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-12 h-12 rounded-[7px] border border-line object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-semibold text-body truncate">{item.product_name}</p>
                        <p className="font-mono text-xs text-dim mt-0.5">
                          R{item.product_price.toFixed(2)} × {item.quantity} = <span className="text-accent font-semibold">R{(item.product_price * item.quantity).toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="rounded-lg border border-line bg-panel2 p-4">
                <h3 className="font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-dim mb-3.5 flex items-center gap-2">
                  <CreditCard size={14} className="text-accent" />
                  Pricing Breakdown
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] text-dim">Subtotal</span>
                    <span className="font-mono text-[12.5px] text-body">R{parseFloat(order.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] text-dim">Tax (10%)</span>
                    <span className="font-mono text-[12.5px] text-body">R{parseFloat(order.tax).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] text-dim">Shipping</span>
                    <span className="font-mono text-[12.5px] text-body">
                      {parseFloat(order.shipping) === 0 ? 'Free' : `R${parseFloat(order.shipping).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t border-line pt-2.5 mt-2.5 flex items-center justify-between">
                    <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-mute">Order Total</span>
                    <span className="font-mono text-lg font-bold text-accent">R{parseFloat(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Comment */}
              {order.comment && (
                <div className="rounded-lg border border-line bg-panel2 p-4">
                  <h3 className="font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-dim mb-2">Order Comment</h3>
                  <p className="text-[12.5px] text-dim">{order.comment}</p>
                </div>
              )}

              {/* Payment Details */}
              {order.payfast_payment_id && (
                <div className="rounded-lg border border-line bg-panel2 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[.12em] text-mute">PayFast Payment ID: <span className="text-dim font-mono text-xs normal-case tracking-normal">{order.payfast_payment_id}</span></p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-line flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center gap-[7px] px-3.5 py-2 text-[12.5px] font-bold rounded-[7px] bg-panel text-dim border border-line hover:border-line2 hover:text-body transition whitespace-nowrap"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
