import React, { useState, useEffect, useCallback } from 'react';
import { authenticatedFetch } from '../lib/api';
import {
  Search,
  CheckCircle2,
  Send,
  Loader,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Package,
} from 'lucide-react';
import QuestionsPageStats from '../components/QuestionsPageStats';

interface Question {
  id: number;
  product: string;
  question: string;
  asker_name: string;
  date: string;
  is_answered: boolean;
  answer: string | null;
  answered_at: string | null;
}

interface QuestionStats {
  total: number;
  unanswered: number;
  answered: number;
  avg_response_hours: number | null;
  response_weekly: (number | null)[];
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

  const [statusFilter, setStatusFilter] = useState<string>('false');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.sort-menu-container')) {
        setShowSortMenu(false);
      }
    };
    if (showSortMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSortMenu]);

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

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('') || '?';

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <>
      {/* Page Header — terminal status bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-[18px]">
        <div className="flex items-center gap-[11px]">
          <span className="w-[7px] h-[7px] rounded-full bg-pos shadow-[0_0_8px_#5fcf80]" />
          <h1 className="m-0 font-mono text-base font-semibold tracking-[.12em] uppercase text-body">
            Questions
          </h1>
          <span className="font-mono text-[11.5px] text-mute tracking-[.04em]">// support</span>
        </div>
      </div>

      {/* Stats */}
      <QuestionsPageStats stats={stats} />

      {/* Status Tabs + Search + Sort */}
      <div className="mb-6 lg:mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Status segmented tabs — left */}
        <div className="inline-flex gap-[2px] bg-panel border border-line rounded-lg p-[3px] self-start max-w-full overflow-x-auto">
          {([
            { value: 'false', label: 'Unanswered', count: stats?.unanswered },
            { value: 'true', label: 'Answered', count: stats?.answered },
            { value: '', label: 'All', count: stats?.total },
          ] as const).map(({ value, label, count }) => {
            const on = statusFilter === value;
            return (
              <button
                key={label}
                onClick={() => { setStatusFilter(value); setCurrentPage(1); }}
                className={on
                  ? 'inline-flex items-center gap-[7px] px-3 py-1.5 rounded-md bg-panel2 text-body shadow-[inset_0_0_0_1px_#23262d] font-mono text-[11.5px] font-semibold uppercase tracking-[.03em] whitespace-nowrap transition-colors'
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

        {/* Search + Sort — right */}
        <div className="flex gap-2.5">
          <div className="flex-1 lg:flex-none lg:w-[280px] relative flex items-center">
            <Search className="absolute left-2.5 text-mute pointer-events-none" size={14} />
            <input
              type="text"
              placeholder="Search by product, question, or asker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-panel border border-line rounded-[7px] text-[12.5px] text-body placeholder:text-mute outline-none focus:border-accent/50 transition"
            />
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
                    { sb: 'product', so: 'asc', label: 'Product: A → Z' },
                    { sb: 'product', so: 'desc', label: 'Product: Z → A' },
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
          <p className="font-mono text-xs text-mute uppercase tracking-[.1em]">Loading questions…</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-[54px] text-mute">
          <Package size={30} className="mx-auto opacity-50" />
          <div className="mt-3 text-[13.5px] font-semibold text-dim">No questions found</div>
          {debouncedSearch && <div className="mt-1 text-xs">Try adjusting your search</div>}
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-8">
            {questions.map((item) => (
              <div
                key={item.id}
                className={`border border-line rounded-lg bg-panel2 transition-colors hover:border-[#3a3d44] ${
                  item.is_answered ? '' : 'border-l-2 border-l-warn hover:border-l-warn'
                }`}
              >
                <div className="px-3.5 py-[13px] sm:p-4">
                  <div className="flex gap-3.5">
                    {/* Avatar — asker initials */}
                    <div className="w-[34px] h-[34px] rounded-[7px] shrink-0 flex items-center justify-center bg-panel border border-line text-dim font-bold font-mono text-xs">
                      {getInitials(item.asker_name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Name + Status + Date */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-semibold text-body truncate">{item.asker_name}</span>
                        {item.is_answered ? (
                          <span className="flex-shrink-0 inline-flex items-center gap-[5px] font-mono text-[10px] font-semibold uppercase tracking-[.05em] whitespace-nowrap px-2 py-[3px] rounded-[5px] text-pos bg-pos/[.13] border border-pos/[.28]">
                            <span className="w-1.5 h-1.5 rounded-full bg-pos" /> Answered
                          </span>
                        ) : (
                          <span className="flex-shrink-0 inline-flex items-center gap-[5px] font-mono text-[10px] font-semibold uppercase tracking-[.05em] whitespace-nowrap px-2 py-[3px] rounded-[5px] text-warn bg-warn/[.13] border border-warn/[.28]">
                            <span className="w-1.5 h-1.5 rounded-full bg-warn" /> Unanswered
                          </span>
                        )}
                        <span className="ml-auto flex-shrink-0 font-mono text-[10.5px] text-mute">{formatDate(item.date)}</span>
                      </div>

                      {/* Product */}
                      <div className="flex items-center gap-1.5 mb-2 min-w-0">
                        <Package size={12} className="flex-shrink-0 text-accent" />
                        <p className="text-[11.5px] font-semibold text-accent truncate">{item.product}</p>
                      </div>

                      {/* Question */}
                      <p className="text-[13.5px] leading-[1.55] text-dim">{item.question}</p>

                      {/* Footer — Reply button (open) or answer (answered) */}
                      {item.is_answered ? (
                        <div className="mt-2.5">
                          <div className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-pos">
                            <CheckCircle2 size={12} /> Replied by Admin
                          </div>
                          {item.answer && (
                            <div className="mt-2 flex gap-3 rounded-[7px] border border-line bg-panel px-3 py-2.5">
                              <p className="min-w-0 flex-1 text-[12.5px] leading-[1.55] text-dim">{item.answer}</p>
                              {item.answered_at && (
                                <p className="flex-shrink-0 font-mono text-[10px] text-mute">{formatDate(item.answered_at)}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-2.5">
                          <button
                            onClick={() => handleReply(item.id)}
                            disabled={submitting && replyingTo === item.id}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-[7px] border transition whitespace-nowrap ${
                              replyingTo === item.id
                                ? 'bg-accent/15 text-accent border-accent/30'
                                : 'bg-panel text-dim border-line hover:border-[#3a3d44] hover:text-body'
                            }`}
                          >
                            <Send size={12} />
                            {replyingTo === item.id ? 'Cancel' : 'Reply'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Answer Box */}
                  {replyingTo === item.id && (
                    <div className="mt-4 border-t border-line pt-4">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={handleTextareaKeyDown}
                        placeholder="Type your answer... (Ctrl+Enter to send)"
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
            <div className="font-mono text-xs text-mute">
              Showing <span className="font-semibold text-body">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-body">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
              <span className="font-semibold text-body">{totalCount}</span> questions
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

export default Questions;
