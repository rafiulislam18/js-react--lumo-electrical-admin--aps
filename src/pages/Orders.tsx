import React, { useState, useEffect, useCallback } from 'react';
import { authenticatedFetch } from '../lib/api';
import {
  Search,
  Truck,
  CheckCircle2,
  ShoppingBag,
  Clock,
  AlertCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
  Package,
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';

export interface AdminOrder {
  id: number;
  ordered_by?: number;
  created_at: string;
  total: string;
  paid: boolean;
  items_count: number;
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
  updated_at: string;
  payfast_payment_id?: string;
}

interface OrderListResponse {
  count: number;
  page: number;
  page_size: number;
  results: AdminOrder[];
}

const Orders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch orders whenever page or search changes
  useEffect(() => {
    fetchOrders();
  }, [currentPage, pageSize, debouncedSearch]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      });

      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      const response = await authenticatedFetch(`/orders/admin/list/?${params}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch orders'}`);
      }

      const data: OrderListResponse = await response.json();
      setOrders(data.results || []);
      setTotalCount(data.count || 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load orders';
      setError(message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch]);

  const totalPages = Math.ceil(totalCount / pageSize);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'order_placed':
        return <ShoppingBag size={16} />;
      case 'out_for_delivery':
        return <Truck size={16} />;
      case 'delivered':
        return <CheckCircle2 size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'order_placed':
        return 'Order Placed';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight">
          Orders
        </h1>
        <p className="text-sm sm:text-base text-slate-400 font-medium">
          Manage and track customer orders.
        </p>
      </div>

      {/* Stats — premium glass cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 lg:mb-8">
        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 transition-all duration-300 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/10">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-cyan-500/15 blur-2xl transition-opacity group-hover:opacity-100" />
          <div className="relative flex items-center justify-between mb-2">
            <div className="rounded-lg bg-cyan-500/15 p-2 ring-1 ring-cyan-400/20">
              <ShoppingBag size={16} className="text-cyan-300" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">Total</span>
          </div>
          <p className="relative text-2xl lg:text-3xl font-bold text-white tracking-tight">{totalCount}</p>
          <p className="relative mt-0.5 text-xs font-medium text-slate-400">All Orders</p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 transition-all duration-300 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-500/10">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-amber-500/15 blur-2xl" />
          <div className="relative flex items-center justify-between mb-2">
            <div className="rounded-lg bg-amber-500/15 p-2 ring-1 ring-amber-400/20">
              <Clock size={16} className="text-amber-300" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">Pending</span>
          </div>
          <p className="relative text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {orders.filter((o) => o.status === 'order_placed').length}
          </p>
          <p className="relative mt-0.5 text-xs font-medium text-slate-400">Awaiting</p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 transition-all duration-300 hover:border-sky-400/40 hover:shadow-lg hover:shadow-sky-500/10">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-sky-500/15 blur-2xl" />
          <div className="relative flex items-center justify-between mb-2">
            <div className="rounded-lg bg-sky-500/15 p-2 ring-1 ring-sky-400/20">
              <Truck size={16} className="text-sky-300" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">In Transit</span>
          </div>
          <p className="relative text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {orders.filter((o) => o.status === 'out_for_delivery').length}
          </p>
          <p className="relative mt-0.5 text-xs font-medium text-slate-400">On the way</p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 transition-all duration-300 hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/10">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-emerald-500/15 blur-2xl" />
          <div className="relative flex items-center justify-between mb-2">
            <div className="rounded-lg bg-emerald-500/15 p-2 ring-1 ring-emerald-400/20">
              <CheckCircle2 size={16} className="text-emerald-300" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">Delivered</span>
          </div>
          <p className="relative text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {orders.filter((o) => o.status === 'delivered').length}
          </p>
          <p className="relative mt-0.5 text-xs font-medium text-slate-400">Completed</p>
        </div>
      </div>

      {/* Search + Filter + Sort */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 z-10" size={18} />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-800/60 backdrop-blur rounded-xl border border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400/60 focus:outline-none transition-all text-sm"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 backdrop-blur text-sm font-semibold text-slate-300 hover:text-white hover:border-cyan-400/40 hover:bg-slate-700/60 transition-all"
          >
            <SlidersHorizontal size={16} />
            <span>Filter</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 backdrop-blur text-sm font-semibold text-slate-300 hover:text-white hover:border-cyan-400/40 hover:bg-slate-700/60 transition-all"
          >
            <ArrowUpDown size={16} />
            <span>Sort</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-400/30 rounded-xl backdrop-blur">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
          <p className="text-slate-400">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-300 text-lg">No orders found</p>
          {debouncedSearch && <p className="text-slate-500 text-sm mt-2">Try adjusting your search</p>}
        </div>
      ) : (
        <>
          {/* Orders List — premium glass cards */}
          <div className="space-y-3 mb-8">
            {orders.map((order) => (
              <div
                key={order.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:shadow-xl hover:shadow-cyan-500/10"
              >
                {/* Subtle accent glow on hover */}
                <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Order ID, Avatar, Customer */}
                  <div className="flex-1 min-w-0 flex items-start gap-3">
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 ring-1 ring-cyan-400/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-cyan-300">
                        {order.first_name?.[0]?.toUpperCase() || '#'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white">Order #{order.id}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {order.first_name} {order.last_name}
                          </p>
                        </div>
                        <span className={`text-[0.7rem] font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 flex items-center gap-1 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {formatStatus(order.status)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{order.email}</p>
                      <p className="text-[0.7rem] text-slate-600 mt-0.5">{formatDate(order.created_at)}</p>
                    </div>
                  </div>

                  {/* Vertical separator + details (hidden on mobile) */}
                  <div className="hidden sm:flex items-center gap-5 flex-shrink-0">
                    <div className="h-12 w-px bg-slate-700/60" />
                    <div className="grid grid-cols-3 gap-5 min-w-fit">
                      <div className="text-right">
                        <p className="text-[0.65rem] uppercase tracking-wider text-slate-500 mb-0.5">Items</p>
                        <p className="text-sm font-bold text-white">{order.items_count}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[0.65rem] uppercase tracking-wider text-slate-500 mb-0.5">Amount</p>
                        <p className="text-sm font-bold text-white">R{order.total}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[0.65rem] uppercase tracking-wider text-slate-500 mb-0.5">Payment</p>
                        <p className={`text-sm font-bold ${order.paid ? 'text-emerald-400' : 'text-red-400'}`}>
                          {order.paid ? 'Paid' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* View Button */}
                  <button className="px-4 py-2 bg-gradient-to-br from-cyan-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all font-semibold text-sm whitespace-nowrap">
                    View Details
                  </button>
                </div>

                {/* Mobile Details */}
                <div className="sm:hidden px-4 pb-3 flex gap-5 text-xs border-t border-slate-700/50 pt-3">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-wider text-slate-500 mb-0.5">Items</p>
                    <p className="font-bold text-white">{order.items_count}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-wider text-slate-500 mb-0.5">Amount</p>
                    <p className="font-bold text-white">R{order.total}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-wider text-slate-500 mb-0.5">Payment</p>
                    <p className={`font-bold ${order.paid ? 'text-emerald-400' : 'text-red-400'}`}>
                      {order.paid ? 'Paid' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Info and Controls */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-400">
              Showing <span className="font-semibold text-slate-200">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-slate-200">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
              <span className="font-semibold text-slate-200">{totalCount}</span> orders
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Previous page"
                >
                  <ChevronLeft size={18} className="text-slate-300" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-10 h-10 rounded-lg font-medium transition-all ${
                        currentPage === page
                          ? 'bg-gradient-to-br from-cyan-500 to-emerald-600 text-white shadow-md shadow-cyan-500/30'
                          : 'border border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Next page"
                >
                  <ChevronRight size={18} className="text-slate-300" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Orders;
