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

interface NewQuestionsProps {
  /** Render only the rows (no panel chrome) — used inside the dashboard modal. */
  bare?: boolean;
  /** Reports the number of unanswered questions upward (dock button counts). */
  onCountChange?: (count: number) => void;
}

const NewQuestions: React.FC<NewQuestionsProps> = ({ bare = false, onCountChange }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNewQuestions();
  }, []);

  // Report the true total (not just the ≤10 shown) so dashboard badges stay accurate
  useEffect(() => {
    onCountChange?.(totalCount);
  }, [totalCount, onCountChange]);

  const fetchNewQuestions = async () => {
    try {
      const response = await authenticatedFetch('/analytics/new-questions/');

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
        setTotalCount(data.count ?? data.questions.length);
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
          // Drop the answered question, then silently refetch so the next
          // question (the 11th) slides into the freed slot and count updates.
          setQuestions(prev => prev.filter(q => q.id !== replyingTo));
          setReplyText('');
          setReplyingTo(null);
          fetchNewQuestions();
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

  const rows = questions.map((item) => (
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
          <div className="mb-1.5 flex items-center gap-1.5">
            <Tag size={11} className="flex-shrink-0 text-accent" />
            <p className="truncate text-[11.5px] font-semibold text-accent">{item.product}</p>
          </div>
          <p className="text-[13px] leading-relaxed text-dim">
            <MessageSquare size={11} className="mr-1 inline text-mute" />
            {item.question}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <button
              onClick={() => handleReply(item.id)}
              disabled={submitting && replyingTo === item.id}
              className={`inline-flex items-center gap-1.5 rounded-[7px] border px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[.05em] transition ${
                replyingTo === item.id
                  ? 'border-accent/[.28] bg-accent/[.13] text-accent'
                  : 'border-line bg-panel text-dim hover:border-line2 hover:text-body'
              }`}
            >
              <Send size={11} />
              {replyingTo === item.id ? 'Cancel' : 'Reply'}
            </button>
            <p className="font-mono text-[10.5px] text-mute">
              {new Date(item.date).toLocaleDateString()}
            </p>
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
              className="rounded-[7px] border border-line bg-panel px-3 py-1.5 text-xs font-bold text-dim transition hover:border-line2 hover:text-body disabled:opacity-50"
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
  ));

  const empty = (
    <div className="py-[54px] text-center text-mute">
      <HelpCircle size={30} className="mx-auto opacity-50" />
      <p className="mt-3 text-[13.5px] font-semibold text-dim">No open questions</p>
    </div>
  );

  if (bare) {
    return questions.length > 0 ? <div className="space-y-2.5">{rows}</div> : empty;
  }

  return (
    <div className="flex min-w-0 flex-col rounded-card border border-line bg-panel">
      {/* Panel header */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-[11px]">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-dim">
          <HelpCircle size={13} className="text-accent" />
          New Questions
          <span className="font-mono text-[10.5px] normal-case tracking-normal text-mute">
            {totalCount} unanswered
          </span>
        </span>
        <button
          onClick={() => navigate('/questions')}
          className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-[.05em] text-accent transition hover:brightness-110"
        >
          View All <ArrowRight size={12} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: '24rem', minHeight: '24rem' }}>
        <div className="space-y-2.5">{rows}</div>
        {questions.length === 0 && empty}
      </div>
    </div>
  );
};

export default NewQuestions;
