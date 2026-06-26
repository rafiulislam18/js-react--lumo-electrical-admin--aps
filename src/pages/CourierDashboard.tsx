import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../lib/api';
import { Truck, Package, MapPin, Phone, ChevronRight, LogOut, Zap } from 'lucide-react';

interface ActiveOrder {
  id: number;
  customer_name: string;
  phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_province: string;
  delivery_postal_code: string;
  total: string;
  items_count: number;
  created_at: string;
  updated_at: string;
}

const CourierDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ActiveOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await authenticatedFetch('/orders/delivery/dashboard/');
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setOrders(data.active_orders);
      } catch (err) {
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bg text-body">
      {/* Header — terminal status bar */}
      <div className="border-b border-line bg-bg2 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-[7px] bg-accent/15 border border-accent/30 text-accent shrink-0">
              <Truck size={17} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="w-[6px] h-[6px] rounded-full bg-pos shadow-[0_0_8px_#5fcf80] shrink-0" />
                <p className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute">Courier Portal</p>
              </div>
              <p className="text-sm font-semibold text-body leading-tight truncate">
                {user.first_name} {user.last_name}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[7px] bg-panel border border-line font-mono text-[11px] uppercase tracking-[.05em] text-dim hover:text-body hover:border-line2 transition shrink-0"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Status banner */}
        <div className="bg-panel border border-line rounded-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-[7px] bg-accent/15 border border-accent/30 shrink-0">
              <Zap size={19} className="text-accent" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-body">Active Deliveries</p>
              <p className="text-xs text-mute mt-0.5">Orders assigned to you with out-for-delivery status</p>
            </div>
            <div className="ml-auto text-right shrink-0">
              <p className="font-mono text-[26px] font-semibold text-accent tracking-[-.02em] leading-none">{loading ? '—' : orders.length}</p>
              <p className="font-mono text-[11px] text-mute mt-1">orders</p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="font-mono text-xs text-mute uppercase tracking-[.1em] py-12 text-center animate-pulse">
            Loading…
          </div>
        ) : error ? (
          <div className="rounded-card border border-neg/30 bg-neg/10 p-4 text-xs text-neg text-center">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-panel border border-line rounded-card text-center py-[54px] px-4 text-mute">
            <Package size={30} className="mx-auto opacity-50" />
            <p className="mt-3 text-[13.5px] font-semibold text-dim">No active deliveries</p>
            <p className="mt-1 text-xs">You have no orders assigned to you right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-panel border border-line rounded-card p-4 hover:border-line2 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] whitespace-nowrap px-2 py-[3px] rounded-[5px] text-warn bg-warn/[.13] border border-warn/[.28]">
                        #{order.id}
                      </span>
                      <span className="font-mono text-[11px] text-mute">{order.items_count} item{order.items_count !== 1 ? 's' : ''}</span>
                      <span className="font-mono text-xs font-bold text-accent ml-auto">R {order.total}</span>
                    </div>

                    <p className="text-sm font-semibold text-body truncate">{order.customer_name}</p>

                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-dim">
                      <MapPin size={12} className="shrink-0 text-mute" />
                      <span className="truncate">
                        {order.delivery_address}, {order.delivery_city}, {order.delivery_province} {order.delivery_postal_code}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 font-mono text-[11px] text-mute">
                      <Phone size={12} className="shrink-0 text-mute" />
                      <span>{order.phone}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/courier/orders/${order.id}`)}
                  className="mt-3 w-full inline-flex items-center justify-center gap-[7px] py-2.5 text-[12.5px] font-bold rounded-[7px] bg-accent text-accent-ink border border-accent hover:brightness-110 transition"
                >
                  <span>View Details</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourierDashboard;
