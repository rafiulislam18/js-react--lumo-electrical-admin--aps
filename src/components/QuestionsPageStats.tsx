import React, { useId } from 'react';

interface QuestionStats {
  total: number;
  unanswered: number;
  answered: number;
  avg_response_hours: number | null;
  response_weekly: (number | null)[];
}

interface QuestionsPageStatsProps {
  /** Stats already fetched by the Questions page (null until loaded). */
  stats: QuestionStats | null;
}

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col gap-3 rounded-card border border-line bg-panel px-4 py-3.5 min-w-0">
    {children}
  </div>
);

/** Inline SVG sparkline (line + soft area fill). Null values render as 0 baseline. */
const Sparkline: React.FC<{ data: (number | null)[]; color: string }> = ({ data, color }) => {
  // useId() — stable, always-valid gradient id. (Deriving it from `color` broke
  // once colors became rgb(var(--…)) strings, yielding invalid url(#…) refs.)
  const gid = useId();
  const series = data.map((v) => v ?? 0);
  if (series.length < 2) return null;
  const w = 100;
  const h = 32;
  const max = Math.max(...series, 1);
  const step = w / (series.length - 1);
  const pts = series.map((v, i) => [i * step, h - (v / max) * h]);
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `0,${h} ${line} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-9 w-full">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

const fmtResponse = (hours: number | null) => {
  if (hours == null) return '—';
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 48) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
};

const QuestionsPageStats: React.FC<QuestionsPageStatsProps> = ({ stats }) => {
  const total = stats?.total ?? 0;
  const answered = stats?.answered ?? 0;
  const unanswered = stats?.unanswered ?? 0;

  const answeredPct = total > 0 ? Math.round((answered / total) * 100) : 0;
  const unansweredRingPct = total > 0 ? (unanswered / total) * 100 : 0;

  const R = 22;
  const C = 2 * Math.PI * R;

  // Weekly response-time trend (13 weeks, oldest -> newest)
  const weekly = stats?.response_weekly ?? [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 lg:mb-8">
      {/* AVG RESPONSE TIME — last 13 weeks */}
      <Card>
        <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-mute">Avg Response Time · 90d</span>
        <p className="font-mono text-[26px] font-semibold leading-none tracking-[-.02em] text-accent">
          {fmtResponse(stats?.avg_response_hours ?? null)}
        </p>
        {/* 13-week response-time trend (oldest -> newest) */}
        <Sparkline data={weekly} color="rgb(var(--c-accent))" />
      </Card>

      {/* UNANSWERED QUESTIONS */}
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="block font-mono text-[10.5px] uppercase tracking-[.12em] text-mute">Unanswered Questions</span>
            <p className="mt-2 font-mono text-[26px] font-semibold leading-none tracking-[-.02em] text-warn">{unanswered}</p>
            <p className="mt-2 font-mono text-[10.5px] text-mute">of {total} total</p>
          </div>
          <svg width="58" height="58" viewBox="0 0 58 58" className="shrink-0">
            <circle cx="29" cy="29" r={R} fill="none" stroke="rgb(var(--c-line))" strokeWidth="5" />
            <circle
              cx="29" cy="29" r={R} fill="none" stroke="rgb(var(--c-warn))" strokeWidth="5" strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C - (unansweredRingPct / 100) * C}
              transform="rotate(-90 29 29)"
              className="transition-all duration-700"
            />
            <text x="29" y="29" textAnchor="middle" dominantBaseline="central" className="fill-body font-mono text-[13px] font-bold">
              {unanswered}
            </text>
          </svg>
        </div>
      </Card>

      {/* RESOLUTION */}
      <Card>
        <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-mute">Resolution</span>
        <p className="font-mono text-[26px] font-semibold leading-none tracking-[-.02em] text-pos">
          {answeredPct}% <span className="text-[13px] font-medium text-dim">answered</span>
        </p>
        {/* Two-segment bar: answered (green) + unanswered (amber) */}
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-panel2">
          <div className="h-full bg-pos transition-all duration-500" style={{ width: `${total > 0 ? (answered / total) * 100 : 0}%` }} />
          <div className="h-full bg-warn transition-all duration-500" style={{ width: `${total > 0 ? (unanswered / total) * 100 : 0}%` }} />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-mute">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px] bg-pos" /> Answered {answered}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px] bg-warn" /> Unanswered {unanswered}
          </span>
        </div>
      </Card>
    </div>
  );
};

export default QuestionsPageStats;
