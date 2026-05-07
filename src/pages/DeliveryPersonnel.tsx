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
  XCircle,
  CalendarDays,
  Package,
  TrendingUp,
} from 'lucide-react';
import CreateDeliveryPersonnelModal from '../components/CreateDeliveryPersonnelModal';

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
  }, [currentPage, pageSize, debouncedSearch, refreshTrigger]);

  const fetchPersonnel = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      });
      if (debouncedSearch) params.append('search', debouncedSearch);
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
  }, [currentPage, pageSize, debouncedSearch]);

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
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight">
          Delivery Personnel
        </h1>
        <p className="text-sm sm:text-base text-slate-400 font-medium">
          Manage your delivery team members.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 mb-6 lg:mb-8 max-w-xs">
        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 transition-all duration-300 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/10">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-cyan-500/15 blur-2xl" />
          <div className="relative flex items-center justify-between mb-2">
            <div className="rounded-lg bg-cyan-500/15 p-2 ring-1 ring-cyan-400/20">
              <Truck size={16} className="text-cyan-300" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">Total</span>
          </div>
          <p className="relative text-2xl lg:text-3xl font-bold text-white tracking-tight">{stats?.total ?? '—'}</p>
          <p className="relative mt-0.5 text-xs font-medium text-slate-400">Personnel</p>
        </div>
      </div>

      {/* Search and Add */}
      <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-800/60 backdrop-blur rounded-xl border border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400/60 focus:outline-none transition-all text-sm"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-cyan-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all whitespace-nowrap"
        >
          <Plus size={18} />
          Add Personnel
        </button>
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
          <p className="text-slate-400">Loading delivery personnel...</p>
        </div>
      ) : personnel.length === 0 ? (
        <div className="text-center py-16">
          <Truck className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-300 text-lg">No delivery personnel found</p>
          {debouncedSearch && <p className="text-slate-500 text-sm mt-2">Try adjusting your search</p>}
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-8">
            {personnel.map((person) => (
              <div
                key={person.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur transition-all duration-300 hover:border-slate-600/60 hover:shadow-xl hover:shadow-black/20"
              >
                <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="p-4 sm:p-5 flex items-center gap-4">
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-lg bg-gradient-to-br ${person.is_active ? 'from-cyan-500 to-sky-600' : 'from-slate-600 to-slate-700'}`}>
                    {getInitials(person.first_name, person.last_name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-white text-sm">
                        {person.first_name} {person.last_name}
                      </p>
                      {/* <span
                        className={`inline-flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          person.is_active
                            ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/25'
                            : 'bg-slate-700/60 text-slate-400 ring-1 ring-slate-600/40'
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
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Mail size={11} className="text-slate-500" />
                        <span className="truncate max-w-[200px]">{person.email}</span>
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Phone size={11} className="text-slate-500" />
                        {person.phone}
                      </span>
                    </div>
                  </div>

                  {/* Order Stats */}
                  <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 ring-1 ring-emerald-400/20">
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      <span className="text-emerald-300 font-semibold">{person.delivered_orders}</span>
                      <span className="text-emerald-300/70">Delivered</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-amber-500/15 ring-1 ring-amber-400/20">
                      <Package size={12} className="text-amber-400" />
                      <span className="text-amber-300 font-semibold">{person.active_orders}</span>
                      <span className="text-amber-300/70">Active</span>
                    </div>
                  </div>

                  {/* Joined date */}
                  <div className="hidden sm:flex flex-col items-end gap-0.5 flex-shrink-0">
                    <div className="flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">
                      <CalendarDays size={10} />
                      Joined
                    </div>
                    <p className="text-sm font-bold text-white">{formatDate(person.created_at)}</p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteConfirm({ id: person.id, name: `${person.first_name} ${person.last_name}` })}
                    className="flex-shrink-0 p-2 text-red-300 bg-red-500/15 rounded-lg hover:bg-red-500/25 transition-colors ring-1 ring-red-400/20"
                    title="Remove personnel"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Mobile stats and joined */}
                <div className="sm:hidden px-4 pb-3 border-t border-slate-700/50 pt-2.5 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 ring-1 ring-emerald-400/20">
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      <span className="text-emerald-300 font-semibold">{person.delivered_orders}</span>
                      <span className="text-emerald-300/70">Delivered</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-amber-500/15 ring-1 ring-amber-400/20">
                      <Package size={12} className="text-amber-400" />
                      <span className="text-amber-300 font-semibold">{person.active_orders}</span>
                      <span className="text-amber-300/70">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <CalendarDays size={11} className="text-slate-500" />
                    <span>Joined {formatDate(person.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-400">
              Showing{' '}
              <span className="font-semibold text-slate-200">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-slate-200">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
              <span className="font-semibold text-slate-200">{totalCount}</span> personnel
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

      {/* Create Modal */}
      {showModal && (
        <CreateDeliveryPersonnelModal
          onClose={() => setShowModal(false)}
          onSuccess={handlePersonnelCreated}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-sm bg-slate-800/80 border border-slate-700/60 rounded-2xl shadow-2xl backdrop-blur overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/50 to-transparent" />
            <div className="px-6 py-5">
              <h3 className="text-base font-bold text-white mb-2">Remove Personnel</h3>
              <p className="text-sm text-slate-300 mb-5">
                Are you sure you want to remove{' '}
                <span className="font-semibold text-white">"{deleteConfirm.name}"</span>?
                <span className="block mt-1 text-xs text-slate-500">
                  This will deactivate their account and remove access.
                </span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-700/60 text-slate-200 rounded-xl font-semibold hover:bg-slate-700 transition-colors border border-slate-600/60 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/80 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
