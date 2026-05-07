import React, { useState, useEffect, useCallback } from 'react';
import { authenticatedFetch } from '../lib/api';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Mail,
  Phone,
  MapPin,
  Building2,
  ChevronDown,
  AlertCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
  Users,
  ShoppingBag,
  BadgeCheck,
} from 'lucide-react';

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

interface CustomerStats {
  total: number;
  trade: number;
  retail: number;
}

interface CustomerListResponse {
  count: number;
  page: number;
  page_size: number;
  stats: CustomerStats;
  results: Customer[];
}

const Customers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedCustomers, setExpandedCustomers] = useState<Set<number>>(new Set());
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerTypeFilter, setCustomerTypeFilter] = useState<'all' | 'trade' | 'retail'>('all');
  const [sortBy, setSortBy] = useState<'joined_newest' | 'joined_oldest' | 'orders' | 'spent'>('joined_newest');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Stats locked at initial load — not affected by search or pagination
  const [stats, setStats] = useState<CustomerStats | null>(null);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, pageSize, debouncedSearch, customerTypeFilter, sortBy]);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      });
      if (debouncedSearch) params.append('search', debouncedSearch);

      if (customerTypeFilter !== 'all') {
        params.append('customer_type', customerTypeFilter);
      }

      // Map UI sort options to backend ordering parameter
      const orderingMap: Record<string, string> = {
        joined_newest: '-date_joined',
        joined_oldest: 'date_joined',
        orders: '-total_orders',
        spent: '-total_spent',
      };
      params.append('ordering', orderingMap[sortBy]);

      const response = await authenticatedFetch(`/users/admin/customers/?${params}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch customers'}`);
      }
      const data: CustomerListResponse = await response.json();
      setCustomers(data.results || []);
      setTotalCount(data.count || 0);
      if (!stats && data.stats) setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, customerTypeFilter, sortBy]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const toggleExpand = (id: number) => {
    setExpandedCustomers((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getInitials = (first: string, last: string) =>
    `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();

  const getAvatarGradient = (type?: string) =>
    type === 'Trade'
      ? 'from-violet-500 to-purple-600'
      : 'from-cyan-500 to-sky-600';

  const getTypeBadge = (type?: string) => {
    if (type === 'Trade')
      return 'bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/25';
    if (type === 'Retail')
      return 'bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/25';
    return 'bg-slate-700/60 text-slate-400 ring-1 ring-slate-600/40';
  };

  const DetailField = ({ label, value }: { label: string; value?: string }) => (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-slate-200">{value || '—'}</p>
    </div>
  );

  return (
    <>
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight">Customers</h1>
        <p className="text-sm sm:text-base text-slate-400 font-medium">View and manage your customers.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6 lg:mb-8">
        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 transition-all duration-300 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/10">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-cyan-500/15 blur-2xl" />
          <div className="relative flex items-center justify-between mb-2">
            <div className="rounded-lg bg-cyan-500/15 p-2 ring-1 ring-cyan-400/20">
              <Users size={16} className="text-cyan-300" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">Total</span>
          </div>
          <p className="relative text-2xl lg:text-3xl font-bold text-white tracking-tight">{stats?.total ?? '—'}</p>
          <p className="relative mt-0.5 text-xs font-medium text-slate-400">Customers</p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 transition-all duration-300 hover:border-violet-400/40 hover:shadow-lg hover:shadow-violet-500/10">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-violet-500/15 blur-2xl" />
          <div className="relative flex items-center justify-between mb-2">
            <div className="rounded-lg bg-violet-500/15 p-2 ring-1 ring-violet-400/20">
              <Building2 size={16} className="text-violet-300" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">Trade</span>
          </div>
          <p className="relative text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {stats?.trade ?? '—'}
          </p>
          <p className="relative mt-0.5 text-xs font-medium text-slate-400">Trade Members</p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 transition-all duration-300 hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/10">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-emerald-500/15 blur-2xl" />
          <div className="relative flex items-center justify-between mb-2">
            <div className="rounded-lg bg-emerald-500/15 p-2 ring-1 ring-emerald-400/20">
              <BadgeCheck size={16} className="text-emerald-300" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">Retail</span>
          </div>
          <p className="relative text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {stats?.retail ?? '—'}
          </p>
          <p className="relative mt-0.5 text-xs font-medium text-slate-400">Retail Members</p>
        </div>

      </div>

      {/* Search + Filter + Sort */}
      <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-800/60 backdrop-blur rounded-xl border border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400/60 focus:outline-none transition-all text-sm"
          />
        </div>

        {/* Filter Menu */}
        <div className="relative filter-menu-container">
          <button
            type="button"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold backdrop-blur transition-all ${
              showFilterMenu || customerTypeFilter !== 'all'
                ? 'border-cyan-400/40 bg-slate-700/60 text-white'
                : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white hover:border-cyan-400/40 hover:bg-slate-700/60'
            }`}
          >
            <SlidersHorizontal size={16} />
            <span>Filter</span>
          </button>
          {showFilterMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur rounded-xl border border-slate-700 shadow-xl shadow-black/50 z-20">
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                    Customer Type
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setCustomerTypeFilter('all');
                        setCurrentPage(1);
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        customerTypeFilter === 'all'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                          : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      All Customers
                    </button>
                    <button
                      onClick={() => {
                        setCustomerTypeFilter('trade');
                        setCurrentPage(1);
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        customerTypeFilter === 'trade'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                          : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      Trade
                    </button>
                    <button
                      onClick={() => {
                        setCustomerTypeFilter('retail');
                        setCurrentPage(1);
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        customerTypeFilter === 'retail'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                          : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      Retail
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sort Menu */}
        <div className="relative sort-menu-container">
          <button
            type="button"
            onClick={() => setShowSortMenu(!showSortMenu)}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold backdrop-blur transition-all ${
              showSortMenu || sortBy !== 'joined_newest'
                ? 'border-cyan-400/40 bg-slate-700/60 text-white'
                : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white hover:border-cyan-400/40 hover:bg-slate-700/60'
            }`}
          >
            <ArrowUpDown size={16} />
            <span>Sort</span>
          </button>
          {showSortMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur rounded-xl border border-slate-700 shadow-xl shadow-black/50 z-20">
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                    Sort By
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSortBy('joined_newest');
                        setCurrentPage(1);
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        sortBy === 'joined_newest'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                          : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      Joined: Newest
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('joined_oldest');
                        setCurrentPage(1);
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        sortBy === 'joined_oldest'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                          : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      Joined: Oldest
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('orders');
                        setCurrentPage(1);
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        sortBy === 'orders'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                          : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      Most Orders
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('spent');
                        setCurrentPage(1);
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        sortBy === 'spent'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                          : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      Highest Spent
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-400/30 rounded-xl backdrop-blur">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
          <p className="text-slate-400">Loading customers...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-300 text-lg">No customers found</p>
          {debouncedSearch && <p className="text-slate-500 text-sm mt-2">Try adjusting your search</p>}
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-8">
            {customers.map((customer) => {
              const isExpanded = expandedCustomers.has(customer.id);
              const type = customer.customer_profile?.customer_type;

              return (
                <div
                  key={customer.id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur transition-all duration-300 hover:border-slate-600/60 hover:shadow-xl hover:shadow-black/20"
                >
                  {/* Top accent line on hover */}
                  <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                  {/* Main row */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${getAvatarGradient(type)} flex items-center justify-center text-sm font-bold text-white shadow-lg`}>
                        {getInitials(customer.first_name, customer.last_name)}
                      </div>

                      {/* Name + contact */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-white text-sm">
                            {customer.first_name} {customer.last_name}
                          </p>
                          <span className={`inline-flex items-center text-[0.6rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${getTypeBadge(type)}`}>
                            {type || 'Pending'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Mail size={11} className="text-slate-500" />
                            <span className="truncate max-w-[180px]">{customer.email}</span>
                          </span>
                          {customer.customer_profile?.phone && (
                            <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
                              <Phone size={11} className="text-slate-500" />
                              {customer.customer_profile.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="hidden sm:flex items-center gap-5 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Orders</p>
                          <div className="flex items-center gap-1 justify-end">
                            <ShoppingBag size={12} className="text-cyan-400" />
                            <p className="text-sm font-bold text-white">{customer.total_orders}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Spent</p>
                          <p className="text-sm font-bold text-white">R{customer.total_spent.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Joined</p>
                          <p className="text-sm font-bold text-white">
                            {new Date(customer.date_joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {/* Expand button */}
                      {customer.customer_profile && (
                        <button
                          onClick={() => toggleExpand(customer.id)}
                          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            isExpanded
                              ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/30'
                              : 'bg-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700 ring-1 ring-slate-600/40'
                          }`}
                        >
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          />
                          <span className="hidden sm:inline">Details</span>
                        </button>
                      )}
                    </div>

                    {/* Mobile quick stats */}
                    <div className="sm:hidden flex gap-5 mt-3 pt-3 border-t border-slate-700/50 text-xs">
                      <div>
                        <p className="text-slate-500 mb-0.5">Orders</p>
                        <p className="font-bold text-white">{customer.total_orders}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-0.5">Spent</p>
                        <p className="font-bold text-white">R{customer.total_spent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-0.5">Joined</p>
                        <p className="font-bold text-white">
                          {new Date(customer.date_joined).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded details panel */}
                  {isExpanded && customer.customer_profile && (
                    <div className="border-t border-slate-700/60 bg-slate-900/30 px-5 py-5 space-y-5">

                      {/* Contact */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="rounded-md bg-cyan-500/15 p-1 ring-1 ring-cyan-400/20">
                            <Phone size={12} className="text-cyan-300" />
                          </div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Contact</h4>
                          <div className="h-px flex-1 bg-slate-700/60" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <DetailField label="Phone" value={customer.customer_profile.phone} />
                          <DetailField label="Email" value={customer.email} />
                        </div>
                      </div>

                      {/* Addresses */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Billing */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="rounded-md bg-sky-500/15 p-1 ring-1 ring-sky-400/20">
                              <MapPin size={12} className="text-sky-300" />
                            </div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Billing Address</h4>
                          </div>
                          <div className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-3 space-y-2.5">
                            <DetailField label="Address" value={customer.customer_profile.billing_address} />
                            <div className="grid grid-cols-2 gap-2.5">
                              <DetailField label="City" value={customer.customer_profile.billing_city} />
                              <DetailField label="Province" value={customer.customer_profile.billing_province} />
                            </div>
                            <DetailField label="Postal Code" value={customer.customer_profile.billing_postal_code} />
                          </div>
                        </div>

                        {/* Delivery */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="rounded-md bg-emerald-500/15 p-1 ring-1 ring-emerald-400/20">
                              <MapPin size={12} className="text-emerald-300" />
                            </div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Delivery Address</h4>
                          </div>
                          <div className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-3 space-y-2.5">
                            <DetailField label="Address" value={customer.customer_profile.delivery_address} />
                            <div className="grid grid-cols-2 gap-2.5">
                              <DetailField label="City" value={customer.customer_profile.delivery_city} />
                              <DetailField label="Province" value={customer.customer_profile.delivery_province} />
                            </div>
                            <DetailField label="Postal Code" value={customer.customer_profile.delivery_postal_code} />
                          </div>
                        </div>
                      </div>

                      {/* Trade business info */}
                      {type === 'Trade' && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="rounded-md bg-violet-500/15 p-1 ring-1 ring-violet-400/20">
                              <Building2 size={12} className="text-violet-300" />
                            </div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Business Information</h4>
                            <div className="h-px flex-1 bg-slate-700/60" />
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <DetailField label="Company Name" value={customer.customer_profile.company_name} />
                            <DetailField label="Business Type" value={customer.customer_profile.business_type} />
                            <DetailField label="Registration" value={customer.customer_profile.company_registration} />
                            <DetailField label="VAT Number" value={customer.customer_profile.vat_number} />
                            <DetailField label="PO Number" value={customer.customer_profile.po_number} />
                            <DetailField label="Procurement Contact" value={customer.customer_profile.procurement_contact} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-400">
              Showing{' '}
              <span className="font-semibold text-slate-200">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-slate-200">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
              <span className="font-semibold text-slate-200">{totalCount}</span> customers
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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

export default Customers;
