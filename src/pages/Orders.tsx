import React, { useState, useEffect, useCallback } from 'react';
import { authenticatedFetch } from '../lib/api';
import {
  Search,
  Truck,
  CheckCircle2,
  ShoppingBag,
  DollarSign,
  Clock,
  AlertCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
  Package,
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
        return 'bg-blue-100 text-blue-700 border border-blue-300';
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-700 border border-orange-300';
      case 'delivered':
        return 'bg-green-100 text-green-700 border border-green-300';
      default:
        return 'bg-gray-100 text-gray-700';
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
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
          Orders
        </h1>
        <p className="text-sm sm:text-base text-gray-600 font-medium">
          Manage and track customer orders.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 lg:mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-1.5 mb-1">
            <ShoppingBag size={14} className="text-blue-700" />
            <p className="text-xs text-blue-700 font-semibold">Total Orders</p>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-blue-900">{totalCount}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock size={14} className="text-orange-700" />
            <p className="text-xs text-orange-700 font-semibold">Placed</p>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-orange-900">
            {orders.filter((o) => o.status === 'order_placed').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center gap-1.5 mb-1">
            <Truck size={14} className="text-yellow-700" />
            <p className="text-xs text-yellow-700 font-semibold">In Transit</p>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-yellow-900">
            {orders.filter((o) => o.status === 'out_for_delivery').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 size={14} className="text-green-700" />
            <p className="text-xs text-green-700 font-semibold">Delivered</p>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-green-900">
            {orders.filter((o) => o.status === 'delivered').length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 lg:mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by order ID, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600 text-lg">No orders found</p>
          {debouncedSearch && <p className="text-gray-500 text-sm mt-2">Try adjusting your search</p>}
        </div>
      ) : (
        <>
          {/* Orders Table */}
          <div className="space-y-3 mb-8">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Order ID and Customer */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">Order #{order.id}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {order.first_name} {order.last_name}
                        </p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 flex items-center gap-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {formatStatus(order.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{order.email}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.created_at)}</p>
                  </div>

                  {/* Order Details (hidden on mobile) */}
                  <div className="hidden sm:grid grid-cols-3 gap-4 flex-shrink-0 min-w-fit">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-0.5">Items</p>
                      <p className="text-sm font-bold text-gray-900">{order.items_count}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-0.5">Amount</p>
                      <p className="text-sm font-bold text-gray-900">R{order.total}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-0.5">Payment</p>
                      <p className={`text-sm font-bold ${order.paid ? 'text-green-600' : 'text-red-600'}`}>
                        {order.paid ? 'Paid' : 'Pending'}
                      </p>
                    </div>
                  </div>

                  {/* View Button */}
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm whitespace-nowrap">
                    View Details
                  </button>
                </div>

                {/* Mobile Details */}
                <div className="sm:hidden px-4 pb-3 flex gap-4 text-xs border-t border-gray-50">
                  <div>
                    <p className="text-gray-500 mb-1">Items</p>
                    <p className="font-bold text-gray-900">{order.items_count}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Amount</p>
                    <p className="font-bold text-gray-900">R{order.total}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Payment</p>
                    <p className={`font-bold ${order.paid ? 'text-green-600' : 'text-red-600'}`}>
                      {order.paid ? 'Paid' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Info and Controls */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
              <span className="font-semibold">{totalCount}</span> orders
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Previous page"
                >
                  <ChevronLeft size={18} className="text-gray-600" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-10 h-10 rounded-lg font-medium transition-all ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Next page"
                >
                  <ChevronRight size={18} className="text-gray-600" />
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
