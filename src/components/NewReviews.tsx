import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../lib/api';
import { Star, Send, Tag, Loader, ArrowRight } from 'lucide-react';

interface Review {
  id: number;
  product: string;
  comment: string;
  rating: number;
  reviewer_name: string;
  date: string;
}

const NewReviews: React.FC = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNewReviews();
  }, []);

  const fetchNewReviews = async () => {
    try {
      const response = await authenticatedFetch('/analytics/new-reviews/');

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Failed to fetch new reviews:', error);
    }
  };

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
    if (replyText.trim() && replyingTo !== null) {
      setSubmitting(true);
      try {
        const response = await authenticatedFetch(`/analytics/reviews/${replyingTo}/reply/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reply: replyText.trim() }),
        });

        if (response.ok) {
          setReviews(prev => prev.filter(r => r.id !== replyingTo));
          setReplyText('');
          setReplyingTo(null);
        }
      } catch (error) {
        console.error('Failed to submit reply:', error);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSendReply();
    }
  };

  const getProductInitial = (product: string) => product.charAt(0).toUpperCase();

  return (
    <div className="flex min-w-0 flex-col rounded-card border border-line bg-panel">
      {/* Panel header */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-[11px]">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-dim">
          <Star size={13} className="text-accent" />
          New Reviews
          <span className="font-mono text-[10.5px] normal-case tracking-normal text-mute">
            {reviews.length} unreplied
          </span>
        </span>
        <button
          onClick={() => navigate('/reviews')}
          className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-[.05em] text-accent transition hover:brightness-110"
        >
          View All <ArrowRight size={12} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: '24rem', minHeight: '24rem' }}>
        <div className="space-y-2.5">
          {reviews.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-line bg-panel2 px-3.5 py-[13px]"
            >
              <div className="flex gap-3">
                {/* Avatar */}
                <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[7px] border border-line bg-panel font-mono text-xs font-bold text-dim">
                  {getProductInitial(item.product)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <Tag size={11} className="flex-shrink-0 text-accent" />
                      <p className="truncate text-[11.5px] font-semibold text-accent">{item.product}</p>
                    </div>
                    {/* Star rating */}
                    <div className="flex flex-shrink-0 items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={
                            i < item.rating
                              ? 'fill-warn text-warn'
                              : 'text-line'
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[13px] leading-relaxed text-dim">
                    &ldquo;{item.comment}&rdquo;
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="font-mono text-[10.5px] text-mute">{new Date(item.date).toLocaleDateString()}</p>
                    <button
                      onClick={() => handleReply(item.id)}
                      disabled={submitting && replyingTo === item.id}
                      className={`rounded-[7px] border px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[.05em] transition ${
                        replyingTo === item.id
                          ? 'border-accent/[.28] bg-accent/[.13] text-accent'
                          : 'border-line bg-panel text-dim hover:border-[#3a3d44] hover:text-body'
                      }`}
                    >
                      {replyingTo === item.id ? 'Cancel' : 'Reply'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Reply Box */}
              {replyingTo === item.id && (
                <div className="mt-3 border-t border-line pt-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={handleTextareaKeyDown}
                    placeholder="Type your reply... (Ctrl+Enter to send)"
                    className="w-full resize-none rounded-[7px] border border-line bg-panel p-2.5 text-xs text-body outline-none transition placeholder:text-mute focus:border-accent/50 sm:text-[12.5px]"
                    rows={3}
                    autoFocus
                    disabled={submitting}
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      onClick={() => handleReply(item.id)}
                      disabled={submitting}
                      className="rounded-[7px] border border-line bg-panel px-3 py-1.5 text-xs font-bold text-dim transition hover:border-[#3a3d44] hover:text-body disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || submitting}
                      className="inline-flex items-center gap-1.5 rounded-[7px] border border-accent bg-accent px-3 py-1.5 text-xs font-bold text-accent-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? <Loader size={13} className="animate-spin" /> : <Send size={13} />}
                      {submitting ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewReviews;
