import React, { useState, useEffect, useCallback } from 'react';
import { Search, Mail, Phone, MapPin, Building2, ChevronDown, AlertCircle, Loader, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomerProfile {
  phone?: string;
  customer_type?: string;
  billing_address?: string;
  billing_city?: string;
  billing_province?: string;
  billing_postal_code?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_province?: string;
  delivery_postal_code?: string;
  company_name?: string;
  vat_number?: string;
  company_registration?: string;
  business_type?: string;
  po_number?: string;
  procurement_contact?: string;
  monthly_statement_preference?: boolean;
}

interface Customer {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  customer_profile: CustomerProfile | null;
  total_orders: number;
  total_spent: number;
  date_joined: string;
}

interface CustomerListResponse {
  count: number;
  page: number;
  page_size: number;
  results: Customer[];
}

const Customers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedCustomers, setExpandedCustomers] = useState<Set<number>>(new Set());
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch customers whenever page, page size, or search changes
  useEffect(() => {
    fetchCustomers();
  }, [currentPage, pageSize, debouncedSearch]);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('access_token');

      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      });

      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      const response = await fetch(`${API_URL}/users/admin/customers/?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            const refreshResponse = await fetch(`${API_URL}/users/token/refresh/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refresh: refreshToken }),
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              localStorage.setItem('access_token', refreshData.access);
              return fetchCustomers();
            }
          }
        }
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch customers'}`);
      }

      const data: CustomerListResponse = await response.json();
      setCustomers(data.results || []);
      setTotalCount(data.count || 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load customers';
      setError(message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, API_URL]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const toggleExpand = (id: number) => {
    const next = new Set(expandedCustomers);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedCustomers(next);
  };

  const getCustomerTypeColor = (type?: string) => {
    return type === 'Trade'
      ? 'bg-purple-100 text-purple-800 border border-purple-300'
      : 'bg-blue-100 text-blue-800 border border-blue-300';
  };

  return (
    <>
      <div className="mb-6 lg:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Customers</h1>
        <p className="text-sm sm:text-base text-gray-600 font-medium">View and manage your customers.</p>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 lg:mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <p className="text-xs text-blue-700 font-semibold mb-1">Total Customers</p>
          <p className="text-xl lg:text-2xl font-bold text-blue-900">{totalCount}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
          <p className="text-xs text-yellow-700 font-semibold mb-1">Trade Members</p>
          <p className="text-xl lg:text-2xl font-bold text-yellow-900">
            {customers.filter((c: Customer) => c.customer_profile?.customer_type === 'Trade').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <p className="text-xs text-green-700 font-semibold mb-1">Retail Members</p>
          <p className="text-xl lg:text-2xl font-bold text-green-900">
            {customers.filter((c: Customer) => c.customer_profile?.customer_type === 'Retail').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <p className="text-xs text-purple-700 font-semibold mb-1">Total Revenue</p>
          <p className="text-xl lg:text-2xl font-bold text-purple-900">
            R{(customers.reduce((sum: number, c: Customer) => sum + c.total_spent, 0) / 1000).toFixed(1)}K
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 lg:mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
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
          <p className="text-gray-600">Loading customers...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No customers found</p>
          {debouncedSearch && <p className="text-gray-500 text-sm mt-2">Try adjusting your search</p>}
        </div>
      ) : (
        <>
          {/* Customers List */}
          <div className="space-y-3">
            {customers.map((customer: Customer) => (
            <div key={customer.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
              {/* Main Row */}
              <div className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0 text-lg">
                        {customer.first_name[0]}{customer.last_name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">{customer.first_name} {customer.last_name}</p>
                        <p className="text-xs text-gray-500">@{customer.username}</p>
                      </div>
                      <span className={`ml-auto sm:ml-2 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getCustomerTypeColor(customer.customer_profile?.customer_type)}`}>
                        {customer.customer_profile?.customer_type || 'Pending'}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-gray-600 ml-15 sm:ml-0">
                      <div className="flex items-center gap-1">
                        <Mail size={14} />
                        <span className="truncate">{customer.email}</span>
                      </div>
                      <div className="hidden sm:flex items-center gap-1">
                        <Phone size={14} />
                        {customer.customer_profile?.phone || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:flex sm:items-center gap-4 sm:gap-6 text-right sm:text-left">
                    <div>
                      <p className="text-xs text-gray-600">Orders</p>
                      <p className="font-bold text-gray-900">{customer.total_orders}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Spent</p>
                      <p className="font-bold text-gray-900">R{(customer.total_spent / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Joined</p>
                      <p className="font-bold text-gray-900 text-sm">{new Date(customer.date_joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleExpand(customer.id)}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <ChevronDown size={16} style={{ transform: expandedCustomers.has(customer.id) ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                    Details
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedCustomers.has(customer.id) && customer.customer_profile && (
                <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-4">
                  {/* Contact Info */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Phone size={16} className="text-blue-600" />
                      Contact Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{customer.customer_profile.phone || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Email</p>
                        <p className="text-sm font-medium text-gray-900">{customer.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin size={16} className="text-blue-600" />
                      Billing Address
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Address</p>
                        <p className="text-sm font-medium text-gray-900">{customer.customer_profile?.billing_address || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">City</p>
                        <p className="text-sm font-medium text-gray-900">{customer.customer_profile?.billing_city || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Province</p>
                        <p className="text-sm font-medium text-gray-900">{customer.customer_profile?.billing_province || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Postal Code</p>
                        <p className="text-sm font-medium text-gray-900">{customer.customer_profile?.billing_postal_code || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin size={16} className="text-blue-600" />
                      Delivery Address
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Address</p>
                        <p className="text-sm font-medium text-gray-900">{customer.customer_profile?.delivery_address || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">City</p>
                        <p className="text-sm font-medium text-gray-900">{customer.customer_profile?.delivery_city || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Province</p>
                        <p className="text-sm font-medium text-gray-900">{customer.customer_profile?.delivery_province || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Postal Code</p>
                        <p className="text-sm font-medium text-gray-900">{customer.customer_profile?.delivery_postal_code || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Trade/Business Details */}
                  {customer.customer_profile?.customer_type === 'Trade' && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Building2 size={16} className="text-blue-600" />
                        Business Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Company Name</p>
                          <p className="text-sm font-medium text-gray-900">{customer.customer_profile?.company_name || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Business Type</p>
                          <p className="text-sm font-medium text-gray-900">{customer.customer_profile?.business_type || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Company Registration</p>
                          <p className="text-sm font-medium text-gray-900">{customer.customer_profile?.company_registration || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">VAT Number</p>
                          <p className="text-sm font-medium text-gray-900">{customer.customer_profile?.vat_number || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">PO Number</p>
                          <p className="text-sm font-medium text-gray-900">{customer.customer_profile?.po_number || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Procurement Contact</p>
                          <p className="text-sm font-medium text-gray-900">{customer.customer_profile?.procurement_contact || '—'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          </div>

          {/* Pagination Info and Controls */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
              <span className="font-semibold">{totalCount}</span> customers
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

export default Customers;
