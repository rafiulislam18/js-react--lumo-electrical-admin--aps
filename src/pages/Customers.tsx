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
  AlertCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
  Users,
  ShoppingBag,
} from 'lucide-react';
import CustomersPageStats from '../components/CustomersPageStats';

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
  acquisition_series: number[];
  acquisition_change: number | null;
  acquisition_last_12: number;
  new_30d: number;
  returning_30d: number;
  not_ordered: number;
  returning_pct: number;
  avg_order_value: number;
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
      ? 'text-accent border-accent/30'
      : 'text-dim border-line';

  const getTypeBadge = (type?: string) => {
    if (type === 'Trade')
      return 'text-accent bg-accent/[.13] border border-accent/[.28]';
    if (type === 'Retail')
      return 'text-pos bg-pos/[.13] border border-pos/[.28]';
    return 'text-warn bg-warn/[.13] border border-warn/[.28]';
  };

  const DetailField = ({ label, value }: { label: string; value?: string }) => (
    <div>
      <p className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute mb-1">{label}</p>
      <p className="text-sm font-medium text-body">{value || '—'}</p>
    </div>
  );

  return (
    <>
      {/* Header — terminal status bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-[18px]">
        <div className="flex items-center gap-[11px]">
          <span className="w-[7px] h-[7px] rounded-full bg-pos shadow-[0_0_8px_#5fcf80]" />
          <h1 className="m-0 font-mono text-base font-semibold tracking-[.12em] uppercase text-body">Customers</h1>
          <span className="font-mono text-[11.5px] text-mute tracking-[.04em]">// accounts</span>
        </div>
      </div>

      {/* Stats */}
      <CustomersPageStats stats={stats} />

      {/* Search + Filter + Sort */}
      <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative flex items-center">
          <Search className="absolute left-2.5 text-mute pointer-events-none" size={14} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-panel border border-line rounded-[7px] pl-8 pr-3 py-2 text-[12.5px] text-body outline-none focus:border-accent/50 placeholder:text-mute transition-colors"
          />
        </div>

        {/* Filter Menu */}
        <div className="relative filter-menu-container">
          <button
            type="button"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className={`inline-flex items-center justify-center gap-[7px] px-3.5 py-2 text-[12.5px] font-bold rounded-[7px] border transition whitespace-nowrap ${
              showFilterMenu || customerTypeFilter !== 'all'
                ? 'bg-accent/15 text-accent border-accent/40'
                : 'bg-panel text-dim border-line hover:border-line2 hover:text-body'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>Filter</span>
          </button>
          {showFilterMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-panel rounded-card border border-line shadow-[0_30px_80px_-20px_rgba(0,0,0,.87)] z-20 animate-pop">
              <div className="p-4 space-y-4">
                <div>
                  <label className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute mb-2 block">
                    Customer Type
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setCustomerTypeFilter('all');
                        setCurrentPage(1);
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-[7px] text-[12.5px] transition-colors ${
                        customerTypeFilter === 'all'
                          ? 'bg-accent/15 text-accent border border-accent/40'
                          : 'bg-panel2 text-dim border border-line hover:text-body hover:border-line2'
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
                      className={`w-full text-left px-3 py-2 rounded-[7px] text-[12.5px] transition-colors ${
                        customerTypeFilter === 'trade'
                          ? 'bg-accent/15 text-accent border border-accent/40'
                          : 'bg-panel2 text-dim border border-line hover:text-body hover:border-line2'
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
                      className={`w-full text-left px-3 py-2 rounded-[7px] text-[12.5px] transition-colors ${
                        customerTypeFilter === 'retail'
                          ? 'bg-accent/15 text-accent border border-accent/40'
                          : 'bg-panel2 text-dim border border-line hover:text-body hover:border-line2'
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
            className={`inline-flex items-center justify-center gap-[7px] px-3.5 py-2 text-[12.5px] font-bold rounded-[7px] border transition whitespace-nowrap ${
              showSortMenu || sortBy !== 'joined_newest'
                ? 'bg-accent/15 text-accent border-accent/40'
                : 'bg-panel text-dim border-line hover:border-line2 hover:text-body'
            }`}
          >
            <ArrowUpDown size={14} />
            <span>Sort</span>
          </button>
          {showSortMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-panel rounded-card border border-line shadow-[0_30px_80px_-20px_rgba(0,0,0,.87)] z-20 animate-pop">
              <div className="p-4 space-y-4">
                <div>
                  <label className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute mb-2 block">
                    Sort By
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSortBy('joined_newest');
                        setCurrentPage(1);
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-[7px] text-[12.5px] transition-colors ${
                        sortBy === 'joined_newest'
                          ? 'bg-accent/15 text-accent border border-accent/40'
                          : 'bg-panel2 text-dim border border-line hover:text-body hover:border-line2'
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
                      className={`w-full text-left px-3 py-2 rounded-[7px] text-[12.5px] transition-colors ${
                        sortBy === 'joined_oldest'
                          ? 'bg-accent/15 text-accent border border-accent/40'
                          : 'bg-panel2 text-dim border border-line hover:text-body hover:border-line2'
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
                      className={`w-full text-left px-3 py-2 rounded-[7px] text-[12.5px] transition-colors ${
                        sortBy === 'orders'
                          ? 'bg-accent/15 text-accent border border-accent/40'
                          : 'bg-panel2 text-dim border border-line hover:text-body hover:border-line2'
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
                      className={`w-full text-left px-3 py-2 rounded-[7px] text-[12.5px] transition-colors ${
                        sortBy === 'spent'
                          ? 'bg-accent/15 text-accent border border-accent/40'
                          : 'bg-panel2 text-dim border border-line hover:text-body hover:border-line2'
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
        <div className="mb-6 flex items-center gap-3 p-4 bg-neg/10 border border-neg/30 rounded-card">
          <AlertCircle className="w-5 h-5 text-neg flex-shrink-0" />
          <p className="text-sm text-neg">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader className="w-6 h-6 text-accent animate-spin mb-3" />
          <p className="font-mono text-xs text-mute uppercase tracking-[.1em]">Loading customers…</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-[54px] text-mute">
          <Users size={30} className="mx-auto opacity-50" />
          <p className="mt-3 text-[13.5px] font-semibold text-dim">No customers found</p>
          {debouncedSearch && <p className="mt-1 text-xs">Try adjusting your search</p>}
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
                  className="overflow-hidden rounded-card border border-line bg-panel transition-colors hover:border-line2"
                >
                  {/* Main row */}
                  <div
                    {...(customer.customer_profile
                      ? {
                          role: 'button' as const,
                          tabIndex: 0,
                          onClick: () => toggleExpand(customer.id),
                          onKeyDown: (e: React.KeyboardEvent) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              toggleExpand(customer.id);
                            }
                          },
                        }
                      : {})}
                    className={`p-4 sm:p-5 outline-none ${
                      customer.customer_profile
                        ? 'cursor-pointer transition-colors hover:bg-panel2/40 focus-visible:bg-panel2/40'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-11 h-11 rounded-[7px] bg-panel2 border flex items-center justify-center text-xs font-bold font-mono ${getAvatarGradient(type)}`}>
                        {getInitials(customer.first_name, customer.last_name)}
                      </div>

                      {/* Name + contact */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-body text-sm">
                            {customer.first_name} {customer.last_name}
                          </p>
                          <span className={`inline-flex items-center font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] whitespace-nowrap px-2 py-[3px] rounded-[5px] ${getTypeBadge(type)}`}>
                            {type || 'Pending'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 font-mono text-xs text-mute">
                            <Mail size={11} className="text-mute" />
                            <span className="truncate max-w-[180px]">{customer.email}</span>
                          </span>
                          {customer.customer_profile?.phone && (
                            <span className="hidden sm:flex items-center gap-1 font-mono text-xs text-mute">
                              <Phone size={11} className="text-mute" />
                              {customer.customer_profile.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="hidden sm:flex items-center gap-5 flex-shrink-0">
                        <div className="text-right">
                          <p className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute mb-0.5">Orders</p>
                          <div className="flex items-center gap-1 justify-end">
                            <ShoppingBag size={12} className="text-dim" />
                            <p className="font-mono text-sm font-bold text-body">{customer.total_orders}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute mb-0.5">Spent</p>
                          <p className="font-mono text-sm font-bold text-accent">R{customer.total_spent.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute mb-0.5">Joined</p>
                          <p className="font-mono text-sm font-bold text-body">
                            {new Date(customer.date_joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {/* Expand affordance */}
                      {customer.customer_profile && (
                        <ChevronRight
                          size={18}
                          className={`flex-shrink-0 text-mute transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      )}
                    </div>

                    {/* Mobile quick stats */}
                    <div className="sm:hidden flex gap-5 mt-3 pt-3 border-t border-line text-xs">
                      <div>
                        <p className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute mb-0.5">Orders</p>
                        <p className="font-mono font-bold text-body">{customer.total_orders}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute mb-0.5">Spent</p>
                        <p className="font-mono font-bold text-accent">R{customer.total_spent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute mb-0.5">Joined</p>
                        <p className="font-mono font-bold text-body">
                          {new Date(customer.date_joined).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded details panel */}
                  {isExpanded && customer.customer_profile && (
                    <div className="border-t border-line bg-bg2 px-5 py-5 space-y-5">

                      {/* Contact */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="rounded-md bg-accent/[.13] border border-accent/[.26] p-1">
                            <Phone size={12} className="text-accent" />
                          </div>
                          <h4 className="font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-dim">Contact</h4>
                          <div className="h-px flex-1 bg-line" />
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
                            <div className="rounded-md bg-info/[.13] border border-info/[.26] p-1">
                              <MapPin size={12} className="text-info" />
                            </div>
                            <h4 className="font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-dim">Billing Address</h4>
                          </div>
                          <div className="rounded-lg border border-line bg-panel2 p-3 space-y-2.5">
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
                            <div className="rounded-md bg-pos/[.13] border border-pos/[.26] p-1">
                              <MapPin size={12} className="text-pos" />
                            </div>
                            <h4 className="font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-dim">Delivery Address</h4>
                          </div>
                          <div className="rounded-lg border border-line bg-panel2 p-3 space-y-2.5">
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
                            <div className="rounded-md bg-accent/[.13] border border-accent/[.26] p-1">
                              <Building2 size={12} className="text-accent" />
                            </div>
                            <h4 className="font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-dim">Business Information</h4>
                            <div className="h-px flex-1 bg-line" />
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
            <div className="font-mono text-xs text-mute">
              Showing{' '}
              <span className="font-semibold text-body">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-body">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
              <span className="font-semibold text-body">{totalCount}</span> customers
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-panel border border-line text-dim hover:text-body hover:border-line2 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-8 h-8 px-2 rounded-[7px] font-mono text-xs font-semibold transition ${
                        currentPage === page
                          ? 'bg-accent text-accent-ink border border-accent'
                          : 'bg-panel border border-line text-dim hover:text-body hover:border-line2'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-panel border border-line text-dim hover:text-body hover:border-line2 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={16} />
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
