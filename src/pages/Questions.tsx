import React, { useState, useEffect, useCallback } from 'react';
import { authenticatedFetch } from '../lib/api';
import {
  Search,
  HelpCircle,
  CheckCircle2,
  Clock,
  Tag,
  MessageSquare,
  Send,
  Loader,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  Package,
} from 'lucide-react';

interface Question {
  id: number;
  product: string;
  question: string;
  asker_name: string;
  date: string;
  is_answered: boolean;
}

interface QuestionStats {
  total: number;
  unanswered: number;
  answered: number;
}

interface QuestionListResponse {
  count: number;
  page: number;
  page_size: number;
  stats: QuestionStats;
  results: Question[];
}

const Questions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<QuestionStats | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('');
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
    fetchQuestions();
  }, [currentPage, pageSize, debouncedSearch, statusFilter, sortBy, sortOrder]);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      });

      if (debouncedSearch) params.append('search', debouncedSearch);
      if (statusFilter) params.append('is_answered', statusFilter);
      if (sortBy) {
        params.append('ordering', `${sortOrder === 'desc' ? '-' : ''}${sortBy}`);
      }

      const response = await authenticatedFetch(`/analytics/questions/?${params}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch questions'}`);
      }

      const data: QuestionListResponse = await response.json();
      setQuestions(data.results || []);
      setTotalCount(data.count || 0);
      if (!stats && data.stats) setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, statusFilter, sortBy, sortOrder]);

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
      const response = await authenticatedFetch(`/analytics/questions/${replyingTo}/answer/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: replyText.trim() }),
      });
      if (response.ok) {
        setReplyText('');
        setReplyingTo(null);
        fetchQuestions();
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSendReply();
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const getProductInitial = (product: string) => product.charAt(0).toUpperCase();

  return (
    <>
      {/* Page Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight">
          Questions
        </h1>
        <p className="text-sm sm:text-base text-slate-400 font-medium">
          Manage and answer customer product questions.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6 lg:mb-8">
        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 transition-all duration-300 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/10">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-cyan-500/15 blur-2xl" />
          <div className="relative flex items-center justify-between mb-2">
            <div className="rounded-lg bg-cyan-500/15 p-2 ring-1 ring-cyan-400/20">
              <HelpCircle size={16} className="text-cyan-300" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">Total</span>
          </div>
          <p className="relative text-2xl lg:text-3xl font-bold text-white tracking-tight">{stats?.total ?? '—'}</p>
          <p className="relative mt-0.5 text-xs font-medium text-slate-400">All Questions</p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 transition-all duration-300 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-500/10">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-amber-500/15 blur-2xl" />
          <div className="relative flex items-center justify-between mb-2">
            <div className="rounded-lg bg-amber-500/15 p-2 ring-1 ring-amber-400/20">
              <Clock size={16} className="text-amber-300" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">Pending</span>
          </div>
          <p className="relative text-2xl lg:text-3xl font-bold text-white tracking-tight">{stats?.unanswered ?? '—'}</p>
          <p className="relative mt-0.5 text-xs font-medium text-slate-400">Unanswered</p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 transition-all duration-300 hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/10">
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-emerald-500/15 blur-2xl" />
          <div className="relative flex items-center justify-between mb-2">
            <div className="rounded-lg bg-emerald-500/15 p-2 ring-1 ring-emerald-400/20">
              <CheckCircle2 size={16} className="text-emerald-300" />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">Done</span>
          </div>
          <p className="relative text-2xl lg:text-3xl font-bold text-white tracking-tight">{stats?.answered ?? '—'}</p>
          <p className="relative mt-0.5 text-xs font-medium text-slate-400">Answered</p>
        </div>
      </div>

      {/* Search + Filter + Sort */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={18} />
            <input
              type="text"
              placeholder="Search by product, question, or asker name..."
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
                showFilterMenu || statusFilter
                  ? 'border-cyan-400/40 bg-slate-700/60 text-white'
                  : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white hover:border-cyan-400/40 hover:bg-slate-700/60'
              }`}
            >
              <SlidersHorizontal size={16} />
              <span>Filter</span>
              {statusFilter && (
                <span className="ml-1 w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
              )}
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-slate-800/95 backdrop-blur rounded-xl border border-slate-700 shadow-xl shadow-black/50 z-20">
                <div className="p-4 space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                    Status
                  </label>
                  {([
                    { value: '', label: 'All Questions' },
                    { value: 'false', label: 'Unanswered' },
                    { value: 'true', label: 'Answered' },
                  ] as const).map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => { setStatusFilter(value); setCurrentPage(1); setShowFilterMenu(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        statusFilter === value
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
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

          {/* Sort Menu */}
          <div className="relative sort-menu-container">
            <button
              type="button"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold backdrop-blur transition-all ${
                showSortMenu || sortBy !== 'date' || sortOrder !== 'desc'
                  ? 'border-cyan-400/40 bg-slate-700/60 text-white'
                  : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white hover:border-cyan-400/40 hover:bg-slate-700/60'
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
                    { sb: 'product', so: 'asc', label: 'Product: A → Z' },
                    { sb: 'product', so: 'desc', label: 'Product: Z → A' },
                  ] as const).map(({ sb, so, label }) => (
                    <button
                      key={label}
                      onClick={() => { setSortBy(sb); setSortOrder(so); setCurrentPage(1); setShowSortMenu(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        sortBy === sb && sortOrder === so
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
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
          <Loader className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
          <p className="text-slate-400">Loading questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-300 text-lg">No questions found</p>
          {debouncedSearch && <p className="text-slate-500 text-sm mt-2">Try adjusting your search</p>}
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-8">
            {questions.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:shadow-xl hover:shadow-cyan-500/10"
              >
                <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="p-4 sm:p-5">
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-1 ring-cyan-400/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-cyan-300">
                        {getProductInitial(item.product)}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Product + Status */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Tag size={12} className="flex-shrink-0 text-cyan-400" />
                          <p className="text-xs font-bold text-cyan-300 truncate">{item.product}</p>
                        </div>
                        <span className={`flex-shrink-0 text-[0.65rem] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                          item.is_answered
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-400/30'
                        }`}>
                          {item.is_answered
                            ? <><CheckCircle2 size={10} /> Answered</>
                            : <><Clock size={10} /> Pending</>
                          }
                        </span>
                      </div>

                      {/* Question */}
                      <p className="text-sm leading-relaxed text-slate-200 mb-2">
                        <MessageSquare size={12} className="mr-1.5 inline text-slate-500" />
                        {item.question}
                      </p>

                      {/* Meta + Reply button */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[0.65rem] text-slate-500">
                          <span className="font-medium">{item.asker_name}</span>
                          <span>·</span>
                          <span>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</span>
                        </div>
                        {!item.is_answered && (
                          <button
                            onClick={() => handleReply(item.id)}
                            disabled={submitting && replyingTo === item.id}
                            className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all duration-200 ${
                              replyingTo === item.id
                                ? 'bg-cyan-500/20 text-cyan-300'
                                : 'text-cyan-400 hover:bg-cyan-500/10'
                            }`}
                          >
                            {replyingTo === item.id ? 'Cancel' : 'Answer'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Answer Box */}
                  {replyingTo === item.id && (
                    <div className="mt-4 border-t border-slate-700/60 pt-4">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={handleTextareaKeyDown}
                        placeholder="Type your answer... (Ctrl+Enter to send)"
                        className="w-full resize-none rounded-lg border border-slate-600/60 bg-slate-800/60 p-3 text-sm text-white transition-all placeholder:text-slate-500 focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
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
                          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-cyan-500/20 transition-all hover:shadow-md hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                        >
                          {submitting ? <Loader size={13} className="animate-spin" /> : <Send size={13} />}
                          {submitting ? 'Sending...' : 'Send Answer'}
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
              <span className="font-semibold text-slate-200">{totalCount}</span> questions
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
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'
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

export default Questions;
