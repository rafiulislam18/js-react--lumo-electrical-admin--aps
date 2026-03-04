import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';

const NewReviews: React.FC = () => {
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  const reviews = [
    {
      id: 1,
      product: 'LED Bulb 60W',
      review: 'Excellent quality and fast delivery. Highly recommend!',
      rating: 5,
      date: '3 hours ago'
    },
    {
      id: 2,
      product: 'Power Strip 6 Outlet',
      review: 'Great products! Good customer service and quality.',
      rating: 5,
      date: '6 hours ago'
    },
    {
      id: 3,
      product: 'Electrical Wire 10 AWG',
      review: 'Very good quality wire, exactly as described.',
      rating: 4,
      date: '10 hours ago'
    },
    {
      id: 4,
      product: 'Circuit Breaker 20A',
      review: 'Professional grade equipment. Works perfectly.',
      rating: 5,
      date: '1 day ago'
    },
    {
      id: 5,
      product: 'LED Lighting Fixture',
      review: 'Love the design and brightness. Best purchase!',
      rating: 5,
      date: '2 days ago'
    },
    {
      id: 6,
      product: 'Power Outlet 120V',
      review: 'Safe and reliable. Perfect for my home setup.',
      rating: 5,
      date: '2 days ago'
    },
    {
      id: 7,
      product: 'Cable Management Kit',
      review: 'Keeps my cables organized and neat.',
      rating: 4,
      date: '3 days ago'
    },
    {
      id: 8,
      product: 'Electrical Panel 200A',
      review: 'Heavy duty and built to last. Excellent value.',
      rating: 5,
      date: '3 days ago'
    }
  ];

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
      console.log(`Reply sent for review ${replyingTo}:`, replyText);
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow Ctrl+Enter or Cmd+Enter to send
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSendReply();
    }
    // Regular Enter key creates a new line (default behavior)
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="p-2.5 bg-yellow-100 rounded-lg">
          <Star size={18} className="text-yellow-600" />
        </div>
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">New Reviews</h3>
      </div>
      
      {/* Scrollable content */}
      <div className="overflow-y-auto flex-1 min-h-96 max-h-96">
        <div className="space-y-3 sm:space-y-4 pr-2">
          {reviews.map((item) => (
            <div key={item.id} className="border-b border-gray-100 pb-3 sm:pb-4 last:border-b-0">
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                {item.review}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
                <p className="text-xs text-yellow-600 font-semibold">
                  Product: <span className="text-yellow-700">{item.product}</span>
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-0.5">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 whitespace-nowrap">{item.date}</p>
                  <button
                    onClick={() => handleReply(item.id)}
                    className="text-xs font-semibold text-yellow-600 hover:text-yellow-800 transition-colors"
                  >
                    Reply
                  </button>
                </div>
              </div>

              {/* Reply Box */}
              {replyingTo === item.id && (
                <div className="mt-3 pt-3 pl-1 border-t border-gray-100">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={handleTextareaKeyDown}
                    placeholder="Type your reply here... (Ctrl+Enter to send)"
                    className="w-full p-2 text-xs sm:text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSendReply}
                      className="flex items-center gap-1 px-3 py-1.5 bg-yellow-600 text-white text-xs font-semibold rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      <Send size={14} />
                      Send
                    </button>
                    <button
                      onClick={() => handleReply(item.id)}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
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
