import React, { useState, useEffect } from 'react';
import { Star, Send, Tag } from 'lucide-react';

interface Review {
  id: number;
  product: string;
  comment: string;
  rating: number;
  reviewer_name: string;
  date: string;
}

const NewReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [avgRating, setAvgRating] = useState<number>(0);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchNewReviews();
  }, []);

  const fetchNewReviews = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/analytics/new-reviews/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setAvgRating(data.avg_rating);
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

  const handleSendReply = () => {
    if (replyText.trim()) {
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSendReply();
    }
  };

  const getProductInitial = (product: string) => product.charAt(0).toUpperCase();

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg sm:p-6">
      <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-yellow-50/70 blur-3xl" />

      <div className="relative flex flex-col">
        <div className="mb-5 flex items-center gap-3 sm:mb-6">
          <div className="rounded-xl bg-gradient-to-br from-yellow-100 to-amber-100 p-2.5 shadow-sm ring-1 ring-yellow-200/50">
            <Star size={18} className="text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900 sm:text-lg lg:text-xl">New Reviews</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-gray-500">
              <Star size={10} className="fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-gray-700">{avgRating}</span>
              <span>average rating</span>
            </p>
          </div>
          <span className="rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
            {reviews.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pr-1" style={{ maxHeight: '24rem', minHeight: '24rem' }}>
          <div className="space-y-3">
            {reviews.map((item) => (
              <div
                key={item.id}
                className="group/r rounded-xl border border-gray-100 bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-yellow-200 hover:shadow-md sm:p-4"
              >
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-sm font-bold text-white shadow-sm">
                    {getProductInitial(item.product)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <Tag size={11} className="flex-shrink-0 text-yellow-600" />
                        <p className="truncate text-xs font-bold text-yellow-700">{item.product}</p>
                      </div>
                      {/* Star rating */}
                      <div className="flex flex-shrink-0 items-center gap-0.5 rounded-md bg-yellow-50 px-1.5 py-0.5 ring-1 ring-yellow-200">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={
                              i < item.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-700 sm:text-sm">
                      &ldquo;{item.comment}&rdquo;
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-[0.65rem] font-medium text-gray-400">{new Date(item.date).toLocaleDateString()}</p>
                      <button
                        onClick={() => handleReply(item.id)}
                        className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all duration-200 ${
                          replyingTo === item.id
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'text-yellow-600 hover:bg-yellow-50'
                        }`}
                      >
                        {replyingTo === item.id ? 'Cancel' : 'Reply'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reply Box */}
                {replyingTo === item.id && (
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={handleTextareaKeyDown}
                      placeholder="Type your reply... (Ctrl+Enter to send)"
                      className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs transition-all focus:border-yellow-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/30 sm:text-sm"
                      rows={3}
                      autoFocus
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        onClick={() => handleReply(item.id)}
                        className="rounded-lg px-3 py-1.5 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim()}
                        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                      >
                        <Send size={13} />
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewReviews;
