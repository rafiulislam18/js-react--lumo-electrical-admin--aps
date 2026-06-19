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
  ArrowUpDown,
} from 'lucide-react';
import OrderDetailModal from '../components/OrderDetailModal';
import OrdersPageStats from '../components/OrdersPageStats';

export interface AdminOrder {
  id: number;
  ordered_by?: number;
  created_at: string;
  total: string;
  paid: boolean;
  items_count: number;
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
  updated_at: string;
  payfast_payment_id?: string;
  assigned_delivery_personnel_name?: string;
  assigned_delivery_personnel_email?: string;
  assigned_delivery_personnel_phone?: string;
}

interface OrderStats {
  total: number;
  order_placed: number;
  assigned_courier: number;
  delivered: number;
}

interface OrderListResponse {
  count: number;
  page: number;
  page_size: number;
  stats: OrderStats;
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
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // Stats locked at initial load — not affected by search or pagination
  const [stats, setStats] = useState<OrderStats | null>(null);

  // Filter and sort state
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentFilter] = useState<string>('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-menu-container') && !target.closest('.sort-menu-container')) {
        setShowFilterMenu(false);
        setShowSortMenu(false);
      }
    };

    if (showFilterMenu || showSortMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showFilterMenu, showSortMenu]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch orders whenever page, search, filter, or sort changes
  useEffect(() => {
    fetchOrders();
  }, [currentPage, pageSize, debouncedSearch, statusFilter, paymentFilter, sortBy, sortOrder]);

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

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      if (paymentFilter) {
        params.append('paid', paymentFilter);
      }

      if (sortBy) {
        const orderPrefix = sortOrder === 'desc' ? '-' : '';
        params.append('ordering', `${orderPrefix}${sortBy}`);
      }

      const response = await authenticatedFetch(`/orders/admin/list/?${params}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch orders'}`);
      }

      const data: OrderListResponse = await response.json();
      setOrders(data.results || []);
      setTotalCount(data.count || 0);
      if (!stats && data.stats) setStats(data.stats);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load orders';
      setError(message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, statusFilter, paymentFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(totalCount / pageSize);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'order_placed':
        return <ShoppingBag size={12} />;
      case 'assigned_courier':
        return <Truck size={12} />;
      case 'delivered':
        return <CheckCircle2 size={12} />;
      default:
        return <Clock size={12} />;
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
      {/* Page Header — terminal status bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-[18px]">
        <div className="flex items-center gap-[11px]">
          <span className="w-[7px] h-[7px] rounded-full bg-pos shadow-[0_0_8px_#5fcf80]" />
          <h1 className="m-0 font-mono text-base font-semibold tracking-[.12em] uppercase text-body">
            Orders
          </h1>
          <span className="font-mono text-[11.5px] text-mute tracking-[.04em]">// fulfilment</span>
        </div>
      </div>

      {/* Stats */}
      <OrdersPageStats stats={stats} />

      {/* Status Tabs + Search + Sort */}
      <div className="mb-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Status tabs — segmented control */}
        <div className="inline-flex gap-[2px] bg-panel border border-line rounded-lg p-[3px] self-start max-w-full overflow-x-auto">
          {[
            { id: '', label: 'All', count: stats?.total },
            { id: 'order_placed', label: 'Placed', count: stats?.order_placed },
            { id: 'assigned_courier', label: 'Assigned', count: stats?.assigned_courier },
            { id: 'delivered', label: 'Delivered', count: stats?.delivered },
          ].map((t) => {
            const on = statusFilter === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setStatusFilter(t.id);
                  setCurrentPage(1);
                  setShowFilterMenu(false);
                }}
                className={on
                  ? 'inline-flex items-center gap-[7px] px-3 py-1.5 rounded-md bg-panel2 text-body shadow-[inset_0_0_0_1px_#23262d] font-mono text-[11.5px] font-semibold uppercase tracking-[.03em] whitespace-nowrap transition-colors'
                  : 'inline-flex items-center gap-[7px] px-3 py-1.5 rounded-md text-mute hover:text-dim font-mono text-[11.5px] font-semibold uppercase tracking-[.03em] whitespace-nowrap transition-colors'}
              >
                {t.label}
                {t.count != null && (
                  <span className={`text-[10.5px] font-bold rounded px-[5px] ${on ? 'text-accent bg-accent/15' : 'text-mute bg-panel2'}`}>
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2.5">
          <div className="flex-1 lg:flex-none lg:w-[280px] relative flex items-center">
            <Search className="absolute left-2.5 text-mute pointer-events-none" size={14} />
            <input
              type="text"
              placeholder="Search ID, customer, email…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-panel border border-line rounded-[7px] pl-8 pr-3 py-2 text-[12.5px] text-body outline-none focus:border-accent/50 placeholder:text-mute transition-colors"
            />
          </div>

          {/* Sort Menu */}
          <div className="relative sort-menu-container">
            <button
              type="button"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className={`inline-flex items-center justify-center gap-[7px] px-3.5 py-2 text-[12.5px] font-bold rounded-[7px] border transition whitespace-nowrap ${
                showSortMenu || sortBy !== 'created_at'
                  ? 'bg-accent/15 text-accent border-accent/40'
                  : 'bg-panel text-dim border-line hover:border-[#3a3d44] hover:text-body'
              }`}
            >
              <ArrowUpDown size={14} />
              <span>Sort</span>
            </button>
            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-panel border border-line rounded-card shadow-[0_18px_50px_-12px_rgba(0,0,0,.85)] z-20 animate-pop">
                <div className="p-3 space-y-3">
                  <div>
                    <label className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute mb-2 block">
                      Sort By
                    </label>
                    <div className="space-y-1.5">
                      <button
                        onClick={() => {
                          setSortBy('created_at');
                          setSortOrder('desc');
                          setCurrentPage(1);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-[7px] text-[12.5px] transition-colors ${
                          sortBy === 'created_at' && sortOrder === 'desc'
                            ? 'bg-accent/15 text-accent border border-accent/30 font-semibold'
                            : 'bg-panel2 text-dim border border-transparent hover:text-body'
                        }`}
                      >
                        Date: Newest First
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('created_at');
                          setSortOrder('asc');
                          setCurrentPage(1);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-[7px] text-[12.5px] transition-colors ${
                          sortBy === 'created_at' && sortOrder === 'asc'
                            ? 'bg-accent/15 text-accent border border-accent/30 font-semibold'
                            : 'bg-panel2 text-dim border border-transparent hover:text-body'
                        }`}
                      >
                        Date: Oldest First
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('total');
                          setSortOrder('desc');
                          setCurrentPage(1);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-[7px] text-[12.5px] transition-colors ${
                          sortBy === 'total' && sortOrder === 'desc'
                            ? 'bg-accent/15 text-accent border border-accent/30 font-semibold'
                            : 'bg-panel2 text-dim border border-transparent hover:text-body'
                        }`}
                      >
                        Amount: Highest
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('total');
                          setSortOrder('asc');
                          setCurrentPage(1);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-[7px] text-[12.5px] transition-colors ${
                          sortBy === 'total' && sortOrder === 'asc'
                            ? 'bg-accent/15 text-accent border border-accent/30 font-semibold'
                            : 'bg-panel2 text-dim border border-transparent hover:text-body'
                        }`}
                      >
                        Amount: Lowest
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-5 flex items-center gap-3 p-4 bg-neg/10 border border-neg/30 rounded-card">
          <AlertCircle className="w-5 h-5 text-neg flex-shrink-0" />
          <p className="text-sm text-neg">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="w-7 h-7 text-accent animate-spin mb-3" />
          <p className="font-mono text-xs text-mute uppercase tracking-[.1em]">Loading orders…</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-[54px] text-mute">
          <Package size={30} className="mx-auto opacity-50" />
          <p className="mt-3 text-[13.5px] font-semibold text-dim">No orders found</p>
          {debouncedSearch && <p className="mt-1 text-xs">Try adjusting your search</p>}
        </div>
      ) : (
        <>
          {/* Orders Table (md+) */}
          <div className="hidden md:block mb-6 overflow-hidden rounded-card border border-line bg-panel">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line">
                  {['Order', 'Customer', 'Date', 'Items', 'Total', 'Paid', 'Status', 'Courier', ''].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-2.5 font-mono text-[9.5px] font-semibold uppercase tracking-[.12em] text-mute ${
                        ['Items', 'Total', 'Paid'].includes(h) ? 'text-right' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedOrderId(order.id);
                      }
                    }}
                    tabIndex={0}
                    className="group border-b border-line last:border-b-0 cursor-pointer outline-none transition-colors hover:bg-panel2/60 focus-visible:bg-panel2/60"
                  >
                    {/* Order */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-[12.5px] font-bold text-body">ORD-{order.id}</span>
                    </td>

                    {/* Customer — avatar + name + city */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-[30px] h-[30px] rounded-[7px] shrink-0 flex items-center justify-center bg-panel2 border border-line text-dim font-bold font-mono text-[11px]">
                          {order.first_name?.[0]?.toUpperCase() || '#'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12.5px] font-semibold text-body truncate">{order.first_name} {order.last_name}</p>
                          <p className="text-[11px] text-mute truncate">{order.delivery_city}</p>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-[11.5px] text-dim">
                      {formatDate(order.created_at)}
                    </td>

                    {/* Items */}
                    <td className="px-4 py-3 text-right whitespace-nowrap font-mono text-[12.5px] text-dim">
                      {order.items_count}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 text-right whitespace-nowrap font-mono text-[12.5px] font-bold text-accent">
                      R{order.total}
                    </td>

                    {/* Paid */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span className={`inline-flex items-center gap-[5px] font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] px-2 py-[3px] rounded-[5px] ${
                        order.paid
                          ? 'text-pos bg-pos/[.13] border border-pos/[.28]'
                          : 'text-warn bg-warn/[.13] border border-warn/[.28]'
                      }`}>
                        {order.paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-[5px] font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] px-2 py-[3px] rounded-[5px] ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {formatStatus(order.status)}
                      </span>
                    </td>

                    {/* Courier */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-[12.5px] font-semibold ${order.assigned_delivery_personnel_name ? 'text-body' : 'text-mute'}`}>
                        {order.assigned_delivery_personnel_name
                          ? `${order.assigned_delivery_personnel_name.split(' ')[0]} ${order.assigned_delivery_personnel_name.split(' ')[1]?.[0] ? order.assigned_delivery_personnel_name.split(' ')[1][0] + '.' : ''}`.trim()
                          : '—'}
                      </span>
                    </td>

                    {/* Chevron */}
                    <td className="px-3 py-3 text-right">
                      <ChevronRight size={16} className="inline text-mute transition-colors group-hover:text-dim" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Orders Cards (mobile) */}
          <div className="md:hidden space-y-2.5 mb-6">
            {orders.map((order) => (
              <div
                key={order.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedOrderId(order.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedOrderId(order.id);
                  }
                }}
                className="border border-line rounded-card bg-panel hover:bg-panel2/60 hover:border-[#3a3d44] transition-colors cursor-pointer outline-none focus-visible:border-accent/60 focus-visible:ring-1 focus-visible:ring-accent/40"
              >
                <div className="p-3.5 flex items-start gap-3">
                  <div className="w-[34px] h-[34px] rounded-[7px] shrink-0 flex items-center justify-center bg-panel2 border border-line text-dim font-bold font-mono text-xs">
                    {order.first_name?.[0]?.toUpperCase() || '#'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-[12.5px] font-bold text-body">ORD-{order.id}</p>
                        <p className="text-xs text-dim mt-0.5">{order.first_name} {order.last_name}</p>
                      </div>
                      <span className={`inline-flex items-center gap-[5px] font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] px-2 py-[3px] rounded-[5px] whitespace-nowrap flex-shrink-0 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {formatStatus(order.status)}
                      </span>
                    </div>
                    <p className="text-xs text-mute truncate">{order.delivery_city}</p>
                    <p className="font-mono text-[10.5px] text-mute mt-0.5">{formatDate(order.created_at)}</p>
                  </div>
                </div>

                <div className="px-3.5 pb-3 flex gap-5 border-t border-line pt-3">
                  <div>
                    <p className="font-mono text-[9.5px] uppercase tracking-[.12em] text-mute mb-1">Items</p>
                    <p className="font-mono text-xs font-semibold text-dim">{order.items_count}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9.5px] uppercase tracking-[.12em] text-mute mb-1">Total</p>
                    <p className="font-mono text-xs font-bold text-accent">R{order.total}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9.5px] uppercase tracking-[.12em] text-mute mb-1">Paid</p>
                    <p className={`font-mono text-xs font-bold ${order.paid ? 'text-pos' : 'text-warn'}`}>
                      {order.paid ? 'Paid' : 'Unpaid'}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[9.5px] uppercase tracking-[.12em] text-mute mb-1">Courier</p>
                    <p className={`text-xs font-semibold ${order.assigned_delivery_personnel_name ? 'text-body' : 'text-mute'}`}>
                      {order.assigned_delivery_personnel_name ? order.assigned_delivery_personnel_name.split(' ')[0] : '—'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Info and Controls */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="font-mono text-xs text-mute">
              Showing <span className="font-semibold text-body">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-body">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
              <span className="font-semibold text-body">{totalCount}</span> orders
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-panel border border-line text-dim hover:text-body hover:border-[#3a3d44] disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="Previous page"
                >
                  <ChevronLeft size={15} />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-8 h-8 px-2 rounded-[7px] font-mono text-xs font-semibold transition ${
                        currentPage === page
                          ? 'bg-accent text-accent-ink border border-accent font-bold'
                          : 'bg-panel border border-line text-dim hover:text-body hover:border-[#3a3d44]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-panel border border-line text-dim hover:text-body hover:border-[#3a3d44] disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="Next page"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Order Detail Modal */}
      {selectedOrderId !== null && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onAssigned={fetchOrders}
        />
      )}
    </>
  );
};

export default Orders;
