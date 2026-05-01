import React, { useState } from 'react';
import { HelpCircle, Send, MessageSquare, Tag } from 'lucide-react';

const NewQuestions: React.FC = () => {
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  const questions = [
    { id: 1, product: 'Electrical Panel 200A', question: 'What are the specifications and maximum capacity?', date: '2 hours ago' },
    { id: 2, product: 'LED Lighting Fixture', question: 'Is there a warranty on the lighting fixtures?', date: '5 hours ago' },
    { id: 3, product: 'Power Strip 6 Outlet', question: 'Can I use this with high-power appliances?', date: '8 hours ago' },
    { id: 4, product: 'Circuit Breaker 20A', question: 'What is the installation process?', date: '12 hours ago' },
    { id: 5, product: 'Electrical Wire 10 AWG', question: 'How many meters does one roll contain?', date: '1 day ago' },
    { id: 6, product: 'LED Bulb 60W', question: 'What is the lifespan of these LED bulbs?', date: '1 day ago' },
    { id: 7, product: 'Power Outlet 120V', question: 'Is this outlet compatible with all devices?', date: '2 days ago' },
    { id: 8, product: 'Cable Management Kit', question: 'How much cable length can this kit manage?', date: '2 days ago' },
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
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSendReply();
    }
  };

  const getProductInitial = (product: string) => product.charAt(0).toUpperCase();

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg sm:p-6">
      <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-blue-50/70 blur-3xl" />

      <div className="relative flex flex-col">
        <div className="mb-5 flex items-center gap-3 sm:mb-6">
          <div className="rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 p-2.5 shadow-sm ring-1 ring-blue-200/50">
            <HelpCircle size={18} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900 sm:text-lg lg:text-xl">New Questions</h3>
            <p className="mt-0.5 text-xs font-medium text-gray-500">{questions.length} unanswered</p>
          </div>
          <span className="rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
            {questions.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pr-1" style={{ maxHeight: '24rem', minHeight: '24rem' }}>
          <div className="space-y-3">
            {questions.map((item) => (
              <div
                key={item.id}
                className="group/q rounded-xl border border-gray-100 bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-4"
              >
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 text-sm font-bold text-white shadow-sm">
                    {getProductInitial(item.product)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <Tag size={11} className="flex-shrink-0 text-blue-500" />
                      <p className="truncate text-xs font-bold text-blue-700">{item.product}</p>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-700 sm:text-sm">
                      <MessageSquare size={11} className="mr-1 inline text-gray-400" />
                      {item.question}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-[0.65rem] font-medium text-gray-400">{item.date}</p>
                      <button
                        onClick={() => handleReply(item.id)}
                        className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all duration-200 ${
                          replyingTo === item.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-blue-600 hover:bg-blue-50'
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
                      className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 text-xs transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/30 sm:text-sm"
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
                        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
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

export default NewQuestions;
