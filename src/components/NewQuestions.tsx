import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../lib/api';
import { HelpCircle, Send, MessageSquare, Tag, Loader, ArrowRight } from 'lucide-react';

interface Question {
  id: number;
  product: string;
  question: string;
  asker_name: string;
  date: string;
  is_answered: boolean;
}

const NewQuestions: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNewQuestions();
  }, []);

  const fetchNewQuestions = async () => {
    try {
      const response = await authenticatedFetch('/analytics/new-questions/');

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Failed to fetch new questions:', error);
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
        const response = await authenticatedFetch(`/analytics/questions/${replyingTo}/answer/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ answer: replyText.trim() }),
        });

        if (response.ok) {
          setQuestions(prev => prev.filter(q => q.id !== replyingTo));
          setReplyText('');
          setReplyingTo(null);
        }
      } catch (error) {
        console.error('Failed to submit answer:', error);
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
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur p-4 shadow-sm transition-all duration-300 hover:shadow-lg sm:p-6">
      <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative flex flex-col">
        <div className="mb-5 flex items-center gap-3 sm:mb-6">
          <div className="rounded-xl bg-cyan-500/15 p-2.5 shadow-sm ring-1 ring-cyan-400/20">
            <HelpCircle size={18} className="text-cyan-300" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-white sm:text-lg lg:text-xl">New Questions</h3>
            <p className="mt-0.5 text-xs font-medium text-slate-400">{questions.length} unanswered</p>
          </div>
          <button
            onClick={() => navigate('/questions')}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-cyan-400 transition-colors hover:bg-cyan-500/10"
          >
            View All <ArrowRight size={13} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1" style={{ maxHeight: '24rem', minHeight: '24rem' }}>
          <div className="space-y-3">
            {questions.map((item) => (
              <div
                key={item.id}
                className="group/q rounded-xl border border-slate-700/60 bg-slate-800/50 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:shadow-md hover:shadow-cyan-500/10 sm:p-4"
              >
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-bold text-white shadow-sm">
                    {getProductInitial(item.product)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <Tag size={11} className="flex-shrink-0 text-cyan-400" />
                      <p className="truncate text-xs font-bold text-cyan-300">{item.product}</p>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                      <MessageSquare size={11} className="mr-1 inline text-slate-500" />
                      {item.question}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-[0.65rem] font-medium text-slate-500">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => handleReply(item.id)}
                        disabled={submitting && replyingTo === item.id}
                        className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all duration-200 ${
                          replyingTo === item.id
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'text-cyan-400 hover:bg-cyan-500/10'
                        }`}
                      >
                        {replyingTo === item.id ? 'Cancel' : 'Reply'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reply Box */}
                {replyingTo === item.id && (
                  <div className="mt-3 border-t border-slate-700/60 pt-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={handleTextareaKeyDown}
                      placeholder="Type your reply... (Ctrl+Enter to send)"
                      className="w-full resize-none rounded-lg border border-slate-600/60 bg-slate-800/60 p-2.5 text-xs text-white transition-all placeholder:text-slate-500 focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 sm:text-sm"
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
    </div>
  );
};

export default NewQuestions;
