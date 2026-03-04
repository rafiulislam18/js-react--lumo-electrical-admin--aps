import React, { useState } from 'react';
import { HelpCircle, Send } from 'lucide-react';

const NewQuestions: React.FC = () => {
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  const questions = [
    {
      id: 1,
      product: 'Electrical Panel 200A',
      question: 'What are the specifications and maximum capacity?',
      date: '2 hours ago'
    },
    {
      id: 2,
      product: 'LED Lighting Fixture',
      question: 'Is there a warranty on the lighting fixtures?',
      date: '5 hours ago'
    },
    {
      id: 3,
      product: 'Power Strip 6 Outlet',
      question: 'Can I use this with high-power appliances?',
      date: '8 hours ago'
    },
    {
      id: 4,
      product: 'Circuit Breaker 20A',
      question: 'What is the installation process?',
      date: '12 hours ago'
    },
    {
      id: 5,
      product: 'Electrical Wire 10 AWG',
      question: 'How many meters does one roll contain?',
      date: '1 day ago'
    },
    {
      id: 6,
      product: 'LED Bulb 60W',
      question: 'What is the lifespan of these LED bulbs?',
      date: '1 day ago'
    },
    {
      id: 7,
      product: 'Power Outlet 120V',
      question: 'Is this outlet compatible with all devices?',
      date: '2 days ago'
    },
    {
      id: 8,
      product: 'Cable Management Kit',
      question: 'How much cable length can this kit manage?',
      date: '2 days ago'
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
      console.log(`Reply sent for question ${replyingTo}:`, replyText);
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
        <div className="p-2.5 bg-blue-100 rounded-lg">
          <HelpCircle size={18} className="text-blue-600" />
        </div>
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">New Questions</h3>
      </div>
      
      {/* Scrollable content */}
      <div className="overflow-y-auto flex-1 min-h-96 max-h-96">
        <div className="space-y-3 sm:space-y-4 pr-2">
          {questions.map((item) => (
            <div key={item.id} className="border-b border-gray-100 pb-3 sm:pb-4 last:border-b-0">
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                {item.question}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mt-2">
                <p className="text-xs text-blue-600 font-semibold">
                  Product: <span className="text-blue-700">{item.product}</span>
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-400 whitespace-nowrap">{item.date}</p>
                  <button
                    onClick={() => handleReply(item.id)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
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
                    className="w-full p-2 text-xs sm:text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSendReply}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
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

export default NewQuestions;
