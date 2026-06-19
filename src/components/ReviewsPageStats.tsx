import React from 'react';
import { Star } from 'lucide-react';

interface ReviewStats {
  total: number;
  unreplied: number;
  replied: number;
  avg_rating: number;
  rating_counts: Record<string, number>;
}

interface ReviewsPageStatsProps {
  /** Stats already fetched by the Reviews page (null until loaded). */
  stats: ReviewStats | null;
}

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col gap-3 rounded-card border border-line bg-panel px-4 py-3.5 min-w-0">
    {children}
  </div>
);

const ReviewsPageStats: React.FC<ReviewsPageStatsProps> = ({ stats }) => {
  const total = stats?.total ?? 0;
  const avg = stats?.avg_rating ?? 0;
  const replied = stats?.replied ?? 0;
  const unreplied = stats?.unreplied ?? 0;
  const counts = stats?.rating_counts ?? {};

  const fiveStar = counts['5'] ?? 0;
  const fiveStarShare = total > 0 ? Math.round((fiveStar / total) * 100) : 0;
  const maxCount = Math.max(1, ...[5, 4, 3, 2, 1].map((s) => counts[String(s)] ?? 0));

  const repliedPct = total > 0 ? Math.round((replied / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1.6fr_1fr_1fr] gap-3 mb-6 lg:mb-8">
      {/* AVERAGE RATING */}
      <Card>
        <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-mute">Average Rating</span>
        <p className="font-mono text-[34px] font-semibold leading-none tracking-[-.02em] text-accent">
          {avg.toFixed(1)} <span className="text-[15px] font-medium text-mute">/ 5.0</span>
        </p>
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={i < Math.round(avg) ? 'fill-warn text-warn' : 'text-line'}
            />
          ))}
        </div>
      </Card>

      {/* DISTRIBUTION */}
      <Card>
        <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-mute">Distribution</span>
        <div className="flex flex-col gap-1.5">
          {[5, 4, 3, 2, 1].map((starVal) => {
            const n = counts[String(starVal)] ?? 0;
            return (
              <div key={starVal} className="flex items-center gap-2.5">
                <span className="flex shrink-0 items-center gap-0.5 font-mono text-[11px] text-dim w-7">
                  {starVal} <Star size={10} className="fill-warn text-warn" />
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-panel2">
                  <div
                    className="h-full rounded-full bg-warn transition-all duration-500"
                    style={{ width: `${(n / maxCount) * 100}%` }}
                  />
                </div>
                <span className="shrink-0 w-5 text-right font-mono text-[11px] font-semibold text-dim">{n}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* REPLIED VS UNREPLIED */}
      <Card>
        <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-mute">Replied</span>
        <p className="font-mono text-[34px] font-semibold leading-none tracking-[-.02em] text-pos">
          {repliedPct}% <span className="text-[13px] font-medium text-dim">replied</span>
        </p>
        {/* Two-segment bar: replied (green) + unreplied (amber) */}
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-panel2">
          <div className="h-full bg-pos transition-all duration-500" style={{ width: `${total > 0 ? (replied / total) * 100 : 0}%` }} />
          <div className="h-full bg-warn transition-all duration-500" style={{ width: `${total > 0 ? (unreplied / total) * 100 : 0}%` }} />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-mute">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px] bg-pos" /> Replied {replied}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px] bg-warn" /> Unreplied {unreplied}
          </span>
        </div>
      </Card>

      {/* TOTAL REVIEWS */}
      <Card>
        <div>
          <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-mute">Total Reviews</span>
          <p className="mt-2 font-mono text-[28px] font-semibold leading-none tracking-[-.02em] text-body">
            {total.toLocaleString()}
          </p>
        </div>
        <div>
          <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-mute">5-Star Share</span>
          <p className="mt-2 font-mono text-[28px] font-semibold leading-none tracking-[-.02em] text-pos">
            {fiveStarShare}%
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ReviewsPageStats;
