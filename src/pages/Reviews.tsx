import React, { useState, useEffect, useCallback } from 'react';
import { authenticatedFetch } from '../lib/api';
import {
  Search,
  Star,
  CheckCircle2,
  Clock,
  Tag,
  Send,
  Loader,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  Package,
} from 'lucide-react';

interface Review {
  id: number;
  product: string;
  comment: string;
  rating: number;
  reviewer_name: string;
  date: string;
  is_replied: boolean;
}

interface ReviewStats {
  total: number;
  unreplied: number;
  replied: number;
  avg_rating: number;
}

interface ReviewListResponse {
  count: number;
  page: number;
  page_size: number;
  stats: ReviewStats;
  results: Review[];
}

const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 11 }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={size}
        className={i < rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-600 text-slate-600'}
      />
    ))}
  </div>
);

const Reviews: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ReviewStats | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [ratingFilter, setRatingFilter] = useState<string>('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    fetchReviews();
  }, [currentPage, pageSize, debouncedSearch, statusFilter, ratingFilter, sortBy, sortOrder]);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      });

      if (debouncedSearch) params.append('search', debouncedSearch);
      if (statusFilter) params.append('is_replied', statusFilter);
      if (ratingFilter) params.append('rating', ratingFilter);
      if (sortBy) {
        params.append('ordering', `${sortOrder === 'desc' ? '-' : ''}${sortBy}`);
      }

      const response = await authenticatedFetch(`/analytics/reviews/?${params}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch reviews'}`);
      }

      const data: ReviewListResponse = await response.json();
      setReviews(data.results || []);
      setTotalCount(data.count || 0);
      if (!stats && data.stats) setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, statusFilter, ratingFilter, sortBy, sortOrder]);

  const handleReply = (id: number) => {
    if (replyingTo === id) {
      setReplyingTo(null);
      setReplyText('');
    } else {
      setReplyingTo(id);
      setReplyText('');
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || replyingTo === null) return;
    setSubmitting(true);
    try {
      const response = await authenticatedFetch(`/analytics/reviews/${replyingTo}/reply/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText.trim() }),
      });
      if (response.ok) {
        setReplyText('');
        setReplyingTo(null);
        fetchReviews();
      }
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSendReply();
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasActiveFilter = statusFilter || ratingFilter;
  const getProductInitial = (product: string) => product.charAt(0).toUpperCase();

  return (
    <>
      {/* Page Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight">
          Reviews
        </h1>
        <p className="text-sm sm:text-base text-slate-400 font-medium">
          Manage and reply to customer product reviews.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 lg:mb-8">
        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 transition-all duration-300 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-500/10">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-amber-500/15 blur-2xl" />
          <div className="relative flex items-center justify-between mb-2">
            <div className="rounded-lg bg-amber-500/15 p-2 ring-1 ring-amber-400/20">
              <Star size={16} className="text-amber-300" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">Total</span>
          </div>
          <p className="relative text-2xl lg:text-3xl font-bold text-white tracking-tight">{stats?.total ?? '—'}</p>
          <p className="relative mt-0.5 text-xs font-medium text-slate-400">All Reviews</p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 transition-all duration-300 hover:border-orange-400/40 hover:shadow-lg hover:shadow-orange-500/10">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-orange-500/15 blur-2xl" />
          <div className="relative flex items-center justify-between mb-2">
            <div className="rounded-lg bg-orange-500/15 p-2 ring-1 ring-orange-400/20">
              <Clock size={16} className="text-orange-300" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">Pending</span>
          </div>
          <p className="relative text-2xl lg:text-3xl font-bold text-white tracking-tight">{stats?.unreplied ?? '—'}</p>
          <p className="relative mt-0.5 text-xs font-medium text-slate-400">Unreplied</p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 transition-all duration-300 hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/10">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-emerald-500/15 blur-2xl" />
          <div className="relative flex items-center justify-between mb-2">
            <div className="rounded-lg bg-emerald-500/15 p-2 ring-1 ring-emerald-400/20">
              <CheckCircle2 size={16} className="text-emerald-300" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">Done</span>
          </div>
          <p className="relative text-2xl lg:text-3xl font-bold text-white tracking-tight">{stats?.replied ?? '—'}</p>
          <p className="relative mt-0.5 text-xs font-medium text-slate-400">Replied</p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 transition-all duration-300 hover:border-yellow-400/40 hover:shadow-lg hover:shadow-yellow-500/10">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-yellow-500/15 blur-2xl" />
          <div className="relative flex items-center justify-between mb-2">
            <div className="rounded-lg bg-yellow-500/15 p-2 ring-1 ring-yellow-400/20">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">Rating</span>
          </div>
          <p className="relative text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {stats?.avg_rating != null ? stats.avg_rating.toFixed(1) : '—'}
          </p>
          <p className="relative mt-0.5 text-xs font-medium text-slate-400">Avg Rating</p>
        </div>
      </div>

      {/* Search + Filter + Sort */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={18} />
            <input
              type="text"
              placeholder="Search by product, review, or reviewer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-800/60 backdrop-blur rounded-xl border border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400/60 focus:outline-none transition-all text-sm"
            />
          </div>

          {/* Filter Menu */}
          <div className="relative filter-menu-container">
            <button
              type="button"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold backdrop-blur transition-all ${
                showFilterMenu || hasActiveFilter
                  ? 'border-amber-400/40 bg-slate-700/60 text-white'
                  : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white hover:border-amber-400/40 hover:bg-slate-700/60'
              }`}
            >
              <SlidersHorizontal size={16} />
              <span>Filter</span>
              {hasActiveFilter && (
                <span className="ml-1 w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
              )}
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-slate-800/95 backdrop-blur rounded-xl border border-slate-700 shadow-xl shadow-black/50 z-20">
                <div className="p-4 space-y-4">
                  {/* Status filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                      Status
                    </label>
                    {([
                      { value: '', label: 'All Reviews' },
                      { value: 'false', label: 'Unreplied' },
                      { value: 'true', label: 'Replied' },
                    ] as const).map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => { setStatusFilter(value); setCurrentPage(1); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          statusFilter === value
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                            : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Rating filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                      Rating
                    </label>
                    <button
                      onClick={() => { setRatingFilter(''); setCurrentPage(1); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        ratingFilter === ''
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                          : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      All Ratings
                    </button>
                    {[5, 4, 3, 2, 1].map((r) => (
                      <button
                        key={r}
                        onClick={() => { setRatingFilter(String(r)); setCurrentPage(1); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                          ratingFilter === String(r)
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                            : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        <StarRating rating={r} size={10} />
                        <span>{r} star{r !== 1 ? 's' : ''}</span>
                      </button>
                    ))}
                  </div>

                  {hasActiveFilter && (
                    <button
                      onClick={() => { setStatusFilter(''); setRatingFilter(''); setCurrentPage(1); setShowFilterMenu(false); }}
                      className="w-full text-center px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
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
                showSortMenu || sortBy !== 'date' || sortOrder !== 'desc'
                  ? 'border-amber-400/40 bg-slate-700/60 text-white'
                  : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white hover:border-amber-400/40 hover:bg-slate-700/60'
              }`}
            >
              <ArrowUpDown size={16} />
              <span>Sort</span>
            </button>
            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-slate-800/95 backdrop-blur rounded-xl border border-slate-700 shadow-xl shadow-black/50 z-20">
                <div className="p-4 space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                    Sort By
                  </label>
                  {([
                    { sb: 'date', so: 'desc', label: 'Date: Newest First' },
                    { sb: 'date', so: 'asc', label: 'Date: Oldest First' },
                    { sb: 'rating', so: 'desc', label: 'Rating: Highest' },
                    { sb: 'rating', so: 'asc', label: 'Rating: Lowest' },
                  ] as const).map(({ sb, so, label }) => (
                    <button
                      key={label}
                      onClick={() => { setSortBy(sb); setSortOrder(so); setCurrentPage(1); setShowSortMenu(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        sortBy === sb && sortOrder === so
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                          : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-400/30 rounded-xl backdrop-blur">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Loading / Empty / List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader className="w-8 h-8 text-amber-400 animate-spin mb-3" />
          <p className="text-slate-400">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-300 text-lg">No reviews found</p>
          {debouncedSearch && <p className="text-slate-500 text-sm mt-2">Try adjusting your search</p>}
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-8">
            {reviews.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-400/40 hover:shadow-xl hover:shadow-amber-500/10"
              >
                <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="p-4 sm:p-5">
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 ring-1 ring-amber-400/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-amber-300">
                        {getProductInitial(item.product)}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Product + Status */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Tag size={12} className="flex-shrink-0 text-amber-400" />
                          <p className="text-xs font-bold text-amber-300 truncate">{item.product}</p>
                        </div>
                        <span className={`flex-shrink-0 text-[0.65rem] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                          item.is_replied
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-400/30'
                        }`}>
                          {item.is_replied
                            ? <><CheckCircle2 size={10} /> Replied</>
                            : <><Clock size={10} /> Pending</>
                          }
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex items-center gap-0.5 rounded-md bg-amber-500/15 px-1.5 py-0.5 ring-1 ring-amber-400/30">
                          <StarRating rating={item.rating} />
                        </div>
                        <span className="text-xs text-slate-500">{item.rating}/5</span>
                      </div>

                      {/* Comment */}
                      <p className="text-sm leading-relaxed text-slate-200 mb-2">
                        &ldquo;{item.comment}&rdquo;
                      </p>

                      {/* Meta + Reply button */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[0.65rem] text-slate-500">
                          <span className="font-medium">{item.reviewer_name}</span>
                          <span>·</span>
                          <span>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</span>
                        </div>
                        {!item.is_replied && (
                          <button
                            onClick={() => handleReply(item.id)}
                            disabled={submitting && replyingTo === item.id}
                            className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all duration-200 ${
                              replyingTo === item.id
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'text-amber-400 hover:bg-amber-500/10'
                            }`}
                          >
                            {replyingTo === item.id ? 'Cancel' : 'Reply'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reply Box */}
                  {replyingTo === item.id && (
                    <div className="mt-4 border-t border-slate-700/60 pt-4">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={handleTextareaKeyDown}
                        placeholder="Type your reply... (Ctrl+Enter to send)"
                        className="w-full resize-none rounded-lg border border-slate-600/60 bg-slate-800/60 p-3 text-sm text-white transition-all placeholder:text-slate-500 focus:border-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        rows={3}
                        autoFocus
                        disabled={submitting}
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          onClick={() => handleReply(item.id)}
                          disabled={submitting}
                          className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-400 transition-colors hover:bg-slate-700/60 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSendReply}
                          disabled={!replyText.trim() || submitting}
                          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-amber-500/20 transition-all hover:shadow-md hover:shadow-amber-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                        >
                          {submitting ? <Loader size={13} className="animate-spin" /> : <Send size={13} />}
                          {submitting ? 'Sending...' : 'Send Reply'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-400">
              Showing <span className="font-semibold text-slate-200">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-slate-200">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
              <span className="font-semibold text-slate-200">{totalCount}</span> reviews
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
                          ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-md shadow-amber-500/30'
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

export default Reviews;
