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

const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 13 }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={size}
        className={i < rating ? 'text-warn fill-warn' : 'text-line'}
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
      {/* Page Header — terminal status bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-[18px]">
        <div className="flex items-center gap-[11px]">
          <span className="w-[7px] h-[7px] rounded-full bg-pos shadow-[0_0_8px_#5fcf80]" />
          <h1 className="m-0 font-mono text-base font-semibold tracking-[.12em] uppercase text-body">
            Reviews
          </h1>
          <span className="font-mono text-[11.5px] text-mute tracking-[.04em]">// feedback</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 lg:mb-8">
        <div className="bg-panel border border-line rounded-lg px-3.5 py-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9.5px] tracking-[.12em] uppercase text-mute">Total</span>
            <Star size={13} className="text-info" />
          </div>
          <p className="font-mono text-[19px] font-semibold text-body mt-1 leading-none">{stats?.total ?? '—'}</p>
          <p className="mt-1.5 font-mono text-[11px] text-mute">all reviews</p>
        </div>

        <div className="bg-panel border border-line rounded-lg px-3.5 py-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9.5px] tracking-[.12em] uppercase text-mute">Pending</span>
            <Clock size={13} className="text-warn" />
          </div>
          <p className="font-mono text-[19px] font-semibold text-warn mt-1 leading-none">{stats?.unreplied ?? '—'}</p>
          <p className="mt-1.5 font-mono text-[11px] text-mute">unreplied</p>
        </div>

        <div className="bg-panel border border-line rounded-lg px-3.5 py-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9.5px] tracking-[.12em] uppercase text-mute">Done</span>
            <CheckCircle2 size={13} className="text-pos" />
          </div>
          <p className="font-mono text-[19px] font-semibold text-pos mt-1 leading-none">{stats?.replied ?? '—'}</p>
          <p className="mt-1.5 font-mono text-[11px] text-mute">replied</p>
        </div>

        <div className="bg-panel border border-line rounded-lg px-3.5 py-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9.5px] tracking-[.12em] uppercase text-mute">Rating</span>
            <Star size={13} className="text-warn fill-warn" />
          </div>
          <p className="font-mono text-[19px] font-semibold text-accent mt-1 leading-none">
            {stats?.avg_rating != null ? stats.avg_rating.toFixed(1) : '—'}
          </p>
          <p className="mt-1.5 font-mono text-[11px] text-mute">avg rating / 5.0</p>
        </div>
      </div>

      {/* Search + Filter + Sort */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-mute z-10" size={14} />
            <input
              type="text"
              placeholder="Search by product, review, or reviewer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-panel border border-line rounded-[7px] text-[12.5px] text-body placeholder:text-mute outline-none focus:border-accent/50 transition"
            />
          </div>

          {/* Filter Menu */}
          <div className="relative filter-menu-container">
            <button
              type="button"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`inline-flex items-center justify-center gap-[7px] px-3.5 py-2 text-[12.5px] font-bold rounded-[7px] border transition whitespace-nowrap ${
                showFilterMenu || hasActiveFilter
                  ? 'bg-panel2 text-body border-accent/40'
                  : 'bg-panel text-dim border-line hover:border-[#3a3d44] hover:text-body'
              }`}
            >
              <SlidersHorizontal size={14} />
              <span>Filter</span>
              {hasActiveFilter && (
                <span className="ml-1 w-2 h-2 rounded-full bg-accent flex-shrink-0" />
              )}
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-panel rounded-card border border-line shadow-[0_30px_80px_-20px_rgba(0,0,0,.87)] z-20 animate-pop">
                <div className="p-4 space-y-4">
                  {/* Status filter */}
                  <div className="space-y-2">
                    <label className="font-mono text-[10.5px] font-semibold tracking-[.12em] uppercase text-mute block">
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
                        className={`w-full text-left px-3 py-2 rounded-[7px] text-[12.5px] transition-colors border ${
                          statusFilter === value
                            ? 'bg-accent/15 text-accent border-accent/30'
                            : 'bg-panel2 text-dim border-transparent hover:text-body'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Rating filter */}
                  <div className="space-y-2">
                    <label className="font-mono text-[10.5px] font-semibold tracking-[.12em] uppercase text-mute block">
                      Rating
                    </label>
                    <button
                      onClick={() => { setRatingFilter(''); setCurrentPage(1); }}
                      className={`w-full text-left px-3 py-2 rounded-[7px] text-[12.5px] transition-colors border ${
                        ratingFilter === ''
                          ? 'bg-accent/15 text-accent border-accent/30'
                          : 'bg-panel2 text-dim border-transparent hover:text-body'
                      }`}
                    >
                      All Ratings
                    </button>
                    {[5, 4, 3, 2, 1].map((r) => (
                      <button
                        key={r}
                        onClick={() => { setRatingFilter(String(r)); setCurrentPage(1); }}
                        className={`w-full text-left px-3 py-2 rounded-[7px] text-[12.5px] transition-colors border flex items-center gap-2 ${
                          ratingFilter === String(r)
                            ? 'bg-accent/15 text-accent border-accent/30'
                            : 'bg-panel2 text-dim border-transparent hover:text-body'
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
                      className="w-full text-center px-3 py-2 rounded-[7px] font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] text-mute hover:text-body hover:bg-panel2 transition-colors"
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
              className={`inline-flex items-center justify-center gap-[7px] px-3.5 py-2 text-[12.5px] font-bold rounded-[7px] border transition whitespace-nowrap ${
                showSortMenu || sortBy !== 'date' || sortOrder !== 'desc'
                  ? 'bg-panel2 text-body border-accent/40'
                  : 'bg-panel text-dim border-line hover:border-[#3a3d44] hover:text-body'
              }`}
            >
              <ArrowUpDown size={14} />
              <span>Sort</span>
            </button>
            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-panel rounded-card border border-line shadow-[0_30px_80px_-20px_rgba(0,0,0,.87)] z-20 animate-pop">
                <div className="p-4 space-y-2">
                  <label className="font-mono text-[10.5px] font-semibold tracking-[.12em] uppercase text-mute mb-2 block">
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
                      className={`w-full text-left px-3 py-2 rounded-[7px] text-[12.5px] transition-colors border ${
                        sortBy === sb && sortOrder === so
                          ? 'bg-accent/15 text-accent border-accent/30'
                          : 'bg-panel2 text-dim border-transparent hover:text-body'
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
        <div className="mb-6 flex items-center gap-3 p-4 bg-neg/10 border border-neg/30 rounded-card">
          <AlertCircle className="w-5 h-5 text-neg flex-shrink-0" />
          <p className="text-sm text-neg">{error}</p>
        </div>
      )}

      {/* Loading / Empty / List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader className="w-7 h-7 text-accent animate-spin mb-3" />
          <p className="font-mono text-xs text-mute uppercase tracking-[.1em]">Loading reviews…</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-[54px] text-mute">
          <Package size={30} className="mx-auto opacity-50" />
          <div className="mt-3 text-[13.5px] font-semibold text-dim">No reviews found</div>
          {debouncedSearch && <div className="mt-1 text-xs">Try adjusting your search</div>}
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-8">
            {reviews.map((item) => (
              <div
                key={item.id}
                className={`border border-line rounded-lg bg-panel2 transition-colors hover:border-[#3a3d44] ${
                  item.is_replied ? '' : 'border-l-2 border-l-warn'
                }`}
              >
                <div className="px-3.5 py-[13px] sm:p-4">
                  <div className="flex gap-3.5">
                    {/* Avatar */}
                    <div className="w-[34px] h-[34px] rounded-[7px] shrink-0 flex items-center justify-center bg-panel border border-line text-dim font-bold font-mono text-xs">
                      {getProductInitial(item.product)}
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Product + Status */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Tag size={12} className="flex-shrink-0 text-accent" />
                          <p className="text-[11.5px] font-semibold text-accent truncate">{item.product}</p>
                        </div>
                        {item.is_replied ? (
                          <span className="flex-shrink-0 inline-flex items-center gap-[5px] font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] whitespace-nowrap px-2 py-[3px] rounded-[5px] text-pos bg-pos/[.13] border border-pos/[.28]">
                            <CheckCircle2 size={10} /> Replied
                          </span>
                        ) : (
                          <span className="flex-shrink-0 inline-flex items-center gap-[5px] font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] whitespace-nowrap px-2 py-[3px] rounded-[5px] text-warn bg-warn/[.13] border border-warn/[.28]">
                            <Clock size={10} /> Pending
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="mb-2 flex items-center gap-2">
                        <StarRating rating={item.rating} />
                        <span className="font-mono text-[11px] text-mute">{item.rating}/5</span>
                      </div>

                      {/* Comment */}
                      <p className="text-[13.5px] leading-[1.55] text-dim mb-2">
                        &ldquo;{item.comment}&rdquo;
                      </p>

                      {/* Meta + Reply button */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[11px] text-mute">
                          <span className="font-semibold text-[12px] text-body">{item.reviewer_name}</span>
                          <span>·</span>
                          <span className="font-mono">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</span>
                        </div>
                        {!item.is_replied && (
                          <button
                            onClick={() => handleReply(item.id)}
                            disabled={submitting && replyingTo === item.id}
                            className={`inline-flex items-center gap-[7px] px-2.5 py-1.5 text-xs font-bold rounded-[7px] border transition whitespace-nowrap ${
                              replyingTo === item.id
                                ? 'bg-accent/15 text-accent border-accent/30'
                                : 'bg-panel text-dim border-line hover:border-[#3a3d44] hover:text-body'
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
                    <div className="mt-4 border-t border-line pt-4">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={handleTextareaKeyDown}
                        placeholder="Type your reply... (Ctrl+Enter to send)"
                        className="w-full resize-none bg-panel border border-line rounded-[7px] px-3 py-2 text-[12.5px] text-body outline-none focus:border-accent/50 placeholder:text-mute transition"
                        rows={3}
                        autoFocus
                        disabled={submitting}
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          onClick={() => handleReply(item.id)}
                          disabled={submitting}
                          className="inline-flex items-center justify-center gap-[7px] px-2.5 py-1.5 text-xs font-bold rounded-[7px] bg-panel text-dim border border-line hover:border-[#3a3d44] hover:text-body transition disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSendReply}
                          disabled={!replyText.trim() || submitting}
                          className="inline-flex items-center justify-center gap-[7px] px-2.5 py-1.5 text-xs font-bold rounded-[7px] bg-accent text-accent-ink border border-accent hover:brightness-110 transition whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className="font-mono text-xs text-mute">
              Showing <span className="font-semibold text-body">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-body">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
              <span className="font-semibold text-body">{totalCount}</span> reviews
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-panel border border-line text-dim hover:text-body hover:border-[#3a3d44] transition disabled:opacity-40 disabled:cursor-not-allowed"
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
                          : 'bg-panel text-dim border border-line hover:text-body hover:border-[#3a3d44]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-panel border border-line text-dim hover:text-body hover:border-[#3a3d44] transition disabled:opacity-40 disabled:cursor-not-allowed"
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

export default Reviews;
