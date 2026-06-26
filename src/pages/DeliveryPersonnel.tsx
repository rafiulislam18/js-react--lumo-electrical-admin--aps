import React, { useState, useEffect, useCallback } from 'react';
import { authenticatedFetch } from '../lib/api';
import {
  Truck,
  Phone,
  Mail,
  Plus,
  Trash2,
  AlertCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  CalendarDays,
  Package,
} from 'lucide-react';
import CreateDeliveryPersonnelModal from '../components/CreateDeliveryPersonnelModal';
import DeliveryPersonnelDetailModal from '../components/DeliveryPersonnelDetailModal';
import OrderDetailModal from '../components/OrderDetailModal';

interface DeliveryPersonnel {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
  is_active: boolean;
  delivered_orders: number;
  active_orders: number;
}

interface DeliveryPersonnelStats {
  total: number;
  with_active: number;
  without_active: number;
  active_deliveries: number;
  total_delivered: number;
}

interface DeliveryPersonnelListResponse {
  count: number;
  page: number;
  page_size: number;
  stats: DeliveryPersonnelStats;
  results: DeliveryPersonnel[];
}

const DeliveryPersonnelPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [personnel, setPersonnel] = useState<DeliveryPersonnel[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [detailPerson, setDetailPerson] = useState<DeliveryPersonnel | null>(null);
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'active' | 'idle'>('all');

  // Stats locked at initial load — not affected by search or pagination
  const [stats, setStats] = useState<DeliveryPersonnelStats | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchPersonnel();
  }, [currentPage, pageSize, debouncedSearch, availabilityFilter, refreshTrigger]);

  const fetchPersonnel = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      });
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (availabilityFilter !== 'all') params.append('availability', availabilityFilter);
      const response = await authenticatedFetch(`/users/admin/delivery-personnel/?${params}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch delivery personnel'}`);
      }
      const data: DeliveryPersonnelListResponse = await response.json();
      setPersonnel(data.results || []);
      setTotalCount(data.count || 0);
      if (!stats && data.stats) setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load delivery personnel');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, availabilityFilter]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePersonnelCreated = () => {
    setShowModal(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const response = await authenticatedFetch(
        `/users/admin/delivery-personnel/${deleteConfirm.id}/`,
        { method: 'DELETE' }
      );
      if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to delete');
      }
      setDeleteConfirm(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete personnel.');
      setDeleteConfirm(null);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });

  const getInitials = (first: string, last: string) =>
    `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();


  return (
    <>
      {/* Header — terminal status bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-[18px]">
        <div className="flex items-center gap-[11px]">
          <span className="w-[7px] h-[7px] rounded-full bg-pos shadow-[0_0_8px_#5fcf80]" />
          <h1 className="m-0 font-mono text-base font-semibold tracking-[.12em] uppercase text-body">
            Delivery Personnel
          </h1>
          <span className="font-mono text-[11.5px] text-mute tracking-[.04em]">// couriers</span>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-[7px] px-3.5 py-2 text-[12.5px] font-bold rounded-[7px] bg-accent text-accent-ink border border-accent hover:brightness-110 transition whitespace-nowrap"
          >
            <Plus size={14} />
            Add Personnel
          </button>
        </div>
      </div>

      {/* Stats */}
      {(() => {
        const orderTotal = stats ? stats.active_deliveries + stats.total_delivered : 0;
        const deliveredPct = orderTotal > 0 ? Math.round((stats!.total_delivered / orderTotal) * 100) : 0;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 lg:mb-8">
            {/* Total personnel */}
            <div className="bg-panel border border-line rounded-card px-4 py-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute">Couriers</span>
                <Truck size={14} className="text-accent" />
              </div>
              <p className="font-mono text-[26px] font-semibold text-body tracking-[-.02em] leading-none">{stats?.total ?? '—'}</p>
              <p className="mt-2 font-mono text-[11px] text-mute">total personnel</p>
            </div>

            {/* Active vs Delivered */}
            <div className="bg-panel border border-line rounded-card px-4 py-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute">Deliveries</span>
                <CheckCircle2 size={14} className="text-pos" />
              </div>
              <p className="font-mono text-[26px] font-semibold text-pos tracking-[-.02em] leading-none">
                {stats ? `${deliveredPct}% delivered` : '—'}
              </p>
              {/* Two-segment bar: delivered (green) + active (amber) */}
              <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-panel2">
                {stats && orderTotal > 0 && (
                  <>
                    <div className="bg-pos" style={{ width: `${(stats.total_delivered / orderTotal) * 100}%` }} />
                    <div className="bg-warn" style={{ width: `${(stats.active_deliveries / orderTotal) * 100}%` }} />
                  </>
                )}
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 font-mono text-[11px] text-mute">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-pos" />Delivered {stats?.total_delivered ?? '—'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-warn" />Active {stats?.active_deliveries ?? '—'}
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Tabs + Search */}
      <div className="mb-6 lg:mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Availability tabs */}
        <div className="flex sm:inline-flex gap-[2px] bg-panel border border-line rounded-lg p-[3px] max-w-full overflow-x-auto">
          {([
            { value: 'all', label: 'All', count: stats?.total },
            { value: 'active', label: 'With Active Deliveries', count: stats?.with_active },
            { value: 'idle', label: 'No Active Deliveries', count: stats?.without_active },
          ] as const).map(({ value, label, count }) => {
            const on = availabilityFilter === value;
            return (
              <button
                key={value}
                onClick={() => { setAvailabilityFilter(value); setCurrentPage(1); }}
                className={on
                  ? 'inline-flex items-center gap-[7px] px-3 py-1.5 rounded-md bg-panel2 text-body shadow-[inset_0_0_0_1px_rgb(var(--c-line))] font-mono text-[11.5px] font-semibold uppercase tracking-[.03em] whitespace-nowrap transition-colors'
                  : 'inline-flex items-center gap-[7px] px-3 py-1.5 rounded-md text-mute hover:text-dim font-mono text-[11.5px] font-semibold uppercase tracking-[.03em] whitespace-nowrap transition-colors'}
              >
                {label}
                {count != null && (
                  <span className={`text-[10.5px] font-bold rounded px-[5px] ${on ? 'text-accent bg-accent/15' : 'text-mute bg-panel2'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative flex items-center lg:w-[280px]">
          <Search className="absolute left-2.5 text-mute pointer-events-none" size={14} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-panel border border-line rounded-[7px] pl-8 pr-3 py-2 text-[12.5px] text-body outline-none focus:border-accent/50 placeholder:text-mute"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 p-3.5 bg-neg/10 border border-neg/30 rounded-card">
          <AlertCircle className="w-4 h-4 text-neg flex-shrink-0" />
          <p className="text-xs text-neg">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader className="w-6 h-6 text-accent animate-spin mb-3" />
          <p className="font-mono text-xs text-mute uppercase tracking-[.1em]">Loading personnel…</p>
        </div>
      ) : personnel.length === 0 ? (
        <div className="text-center py-[54px] text-mute">
          <Truck size={30} className="mx-auto opacity-50" />
          <p className="mt-3 text-[13.5px] font-semibold text-dim">No delivery personnel found</p>
          {(debouncedSearch || availabilityFilter !== 'all') && (
            <p className="mt-1 text-xs">Try adjusting your search or filter</p>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-8">
            {personnel.map((person) => (
              <div
                key={person.id}
                role="button"
                tabIndex={0}
                onClick={() => setDetailPerson(person)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setDetailPerson(person);
                  }
                }}
                className="bg-panel border border-line rounded-card hover:bg-panel2/40 hover:border-line2 transition-colors cursor-pointer outline-none focus-visible:border-accent/60 focus-visible:ring-1 focus-visible:ring-accent/40"
              >
                <div className="p-4 sm:p-5 flex items-center gap-4">
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-[42px] h-[42px] rounded-[7px] flex items-center justify-center bg-panel2 border border-line font-bold font-mono text-sm ${person.is_active ? 'text-accent' : 'text-dim'}`}>
                    {getInitials(person.first_name, person.last_name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-body text-sm">
                        {person.first_name} {person.last_name}
                      </p>
                      {/* <span
                        className={`inline-flex items-center gap-[5px] font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] whitespace-nowrap px-2 py-[3px] rounded-[5px] ${
                          person.is_active
                            ? 'text-pos bg-pos/[.13] border border-pos/[.28]'
                            : 'text-mute bg-mute/[.13] border border-mute/[.28]'
                        }`}
                      >
                        {person.is_active ? (
                          <><CheckCircle2 size={9} />{' '}Active</>
                        ) : (
                          <><XCircle size={9} />{' '}Inactive</>
                        )}
                      </span> */}
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1 font-mono text-[11px] text-mute">
                        <Mail size={11} className="text-mute" />
                        <span className="truncate max-w-[200px]">{person.email}</span>
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-mute">
                        <Phone size={11} className="text-mute" />
                        {person.phone}
                      </span>
                    </div>
                  </div>

                  {/* Order Stats */}
                  <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                    <div className="inline-flex items-center gap-[5px] font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] whitespace-nowrap px-2.5 py-1 rounded-[5px] text-pos bg-pos/[.13] border border-pos/[.28]">
                      <CheckCircle2 size={12} />
                      <span>{person.delivered_orders}</span>
                      <span className="opacity-70">Delivered</span>
                    </div>
                    <div className="inline-flex items-center gap-[5px] font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] whitespace-nowrap px-2.5 py-1 rounded-[5px] text-warn bg-warn/[.13] border border-warn/[.28]">
                      <Package size={12} />
                      <span>{person.active_orders}</span>
                      <span className="opacity-70">Active</span>
                    </div>
                  </div>

                  {/* Joined date */}
                  <div className="hidden sm:flex flex-col items-end gap-0.5 flex-shrink-0">
                    <div className="flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-mute">
                      <CalendarDays size={10} />
                      Joined
                    </div>
                    <p className="font-mono text-[12.5px] font-bold text-body">{formatDate(person.created_at)}</p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm({ id: person.id, name: `${person.first_name} ${person.last_name}` });
                    }}
                    className="flex-shrink-0 w-8 h-8 rounded-[7px] flex items-center justify-center bg-panel border border-neg/30 text-neg hover:bg-neg/10 transition"
                    title="Remove personnel"
                  >
                    <Trash2 size={15} />
                  </button>

                  {/* Click affordance */}
                  <ChevronRight size={18} className="flex-shrink-0 text-mute" />
                </div>

                {/* Mobile stats and joined */}
                <div className="sm:hidden px-4 pb-3 border-t border-line pt-2.5 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="inline-flex items-center gap-[5px] font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] whitespace-nowrap px-2.5 py-1 rounded-[5px] text-pos bg-pos/[.13] border border-pos/[.28]">
                      <CheckCircle2 size={12} />
                      <span>{person.delivered_orders}</span>
                      <span className="opacity-70">Delivered</span>
                    </div>
                    <div className="inline-flex items-center gap-[5px] font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] whitespace-nowrap px-2.5 py-1 rounded-[5px] text-warn bg-warn/[.13] border border-warn/[.28]">
                      <Package size={12} />
                      <span>{person.active_orders}</span>
                      <span className="opacity-70">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-mute">
                    <CalendarDays size={11} className="text-mute" />
                    <span>Joined {formatDate(person.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="font-mono text-xs text-mute">
              Showing{' '}
              <span className="font-semibold text-dim">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-dim">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
              <span className="font-semibold text-dim">{totalCount}</span> personnel
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
                      className={`min-w-8 h-8 px-1 rounded-[7px] font-mono text-xs font-semibold transition ${
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

      {/* Create Modal */}
      {showModal && (
        <CreateDeliveryPersonnelModal
          onClose={() => setShowModal(false)}
          onSuccess={handlePersonnelCreated}
        />
      )}

      {/* Personnel Detail Modal — order IDs by status */}
      {detailPerson && (
        <DeliveryPersonnelDetailModal
          personnel={detailPerson}
          onClose={() => setDetailPerson(null)}
          onOpenOrder={(orderId) => setDetailOrderId(orderId)}
        />
      )}

      {/* Order Detail Modal — opened from an order chip */}
      {detailOrderId !== null && (
        <OrderDetailModal
          orderId={detailOrderId}
          onClose={() => setDetailOrderId(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade">
          <div className="w-full max-w-sm bg-panel border border-line rounded-card shadow-[0_30px_80px_-20px_rgba(0,0,0,.87)] overflow-hidden animate-pop">
            <div className="px-5 py-5">
              <h3 className="font-mono text-sm font-semibold tracking-[.08em] uppercase text-body mb-2">Remove Personnel</h3>
              <p className="text-sm text-dim mb-5">
                Are you sure you want to remove{' '}
                <span className="font-semibold text-body">"{deleteConfirm.name}"</span>?
                <span className="block mt-1 text-xs text-mute">
                  This will deactivate their account and remove access.
                </span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 text-[12.5px] font-bold rounded-[7px] bg-panel text-dim border border-line hover:border-line2 hover:text-body transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-[12.5px] font-bold rounded-[7px] bg-panel text-neg border border-neg/30 hover:bg-neg/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <><Loader size={14} className="animate-spin" />Removing...</>
                  ) : (
                    <><Trash2 size={14} />Remove</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeliveryPersonnelPage;
