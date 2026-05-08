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
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/60 bg-slate-800/60 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-600">
              <Truck size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Courier Portal</p>
              <p className="text-sm font-semibold text-white leading-tight">
                {user.first_name} {user.last_name}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-slate-700/60"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Status banner */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-600/20 border border-cyan-500/30">
              <Zap size={20} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Active Deliveries</p>
              <p className="text-xs text-slate-400 mt-0.5">Orders assigned to you with out-for-delivery status</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-bold text-white">{loading ? '—' : orders.length}</p>
              <p className="text-xs text-slate-400">orders</p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-300 text-center">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-10 text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-700/60 mx-auto mb-4">
              <Package size={24} className="text-slate-400" />
            </div>
            <p className="text-base font-semibold text-white mb-1">No active deliveries</p>
            <p className="text-sm text-slate-400">You have no orders out for delivery right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-4 hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-2.5 py-0.5">
                        #{order.id}
                      </span>
                      <span className="text-xs text-slate-400">{order.items_count} item{order.items_count !== 1 ? 's' : ''}</span>
                      <span className="text-xs font-semibold text-emerald-400 ml-auto">R {order.total}</span>
                    </div>

                    <p className="text-sm font-semibold text-white truncate">{order.customer_name}</p>

                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400">
                      <MapPin size={12} className="shrink-0 text-slate-500" />
                      <span className="truncate">
                        {order.delivery_address}, {order.delivery_city}, {order.delivery_province} {order.delivery_postal_code}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                      <Phone size={12} className="shrink-0 text-slate-500" />
                      <span>{order.phone}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/courier/orders/${order.id}`)}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
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
