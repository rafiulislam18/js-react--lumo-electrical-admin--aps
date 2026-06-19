import React, { useId, useState } from 'react';

interface AreaPoint {
  label: string;
  value: number;
}

interface AreaChartProps {
  data: AreaPoint[];
  color?: string;
  height?: number;
  format?: (v: number) => string;
}

/** Compact area/line chart with hover crosshair + tooltip (Command theme). */
const AreaChart: React.FC<AreaChartProps> = ({
  data,
  color = '#f6a821',
  height = 74,
  format = (v) => String(v),
}) => {
  const [hover, setHover] = useState<number | null>(null);
  const gid = useId();

  if (data.length < 2) {
    return <div style={{ height }} />;
  }

  const W = 320;
  const H = height;
  const vals = data.map((d) => d.value);
  const max = Math.max(...vals);
  const min = Math.min(...vals) * 0.92;
  const range = max - min || 1;
  const pts = data.map((d, i) => [
    (i / (data.length - 1)) * W,
    H - 18 - ((d.value - min) / range) * (H - 30),
  ]);
  const line = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(' ');
  const area = `${line} L${W} ${H} L0 ${H} Z`;

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const rx = ((e.clientX - r.left) / r.width) * W;
    let best = 0;
    let bd = Infinity;
    pts.forEach((p, i) => {
      const d = Math.abs(p[0] - rx);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    setHover(best);
  };

  return (
    <div className="relative w-full">
      <svg
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        onMouseLeave={() => setHover(null)}
        onMouseMove={handleMove}
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.32} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {[0.33, 0.66].map((t, i) => (
          <line
            key={i}
            x1={0}
            x2={W}
            y1={(H - 18) * t + 6}
            y2={(H - 18) * t + 6}
            stroke="#23262d"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={area} fill={`url(#${gid})`} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {hover !== null && (
          <g>
            <line
              x1={pts[hover][0]}
              x2={pts[hover][0]}
              y1={6}
              y2={H - 12}
              stroke={color}
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.5}
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={pts[hover][0]}
              cy={pts[hover][1]}
              r={3.5}
              fill={color}
              stroke="#0a0a0c"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        )}
      </svg>

      {/* X labels (every 2nd) */}
      <div className="mt-1 flex">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex-1 text-center font-mono text-[9.5px] font-semibold text-mute"
          >
            {i % 2 === 0 ? d.label : ''}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 z-[5] -translate-x-1/2 -translate-y-[110%] whitespace-nowrap rounded-[7px] border border-white/10 bg-[#0a0a0c] px-2 py-1 text-[11px] font-bold text-body shadow-[0_6px_20px_rgba(0,0,0,.5)]"
          style={{ left: `${(pts[hover][0] / W) * 100}%` }}
        >
          <div className="font-mono text-[9.5px] font-semibold text-mute">{data[hover].label}</div>
          <div className="font-mono" style={{ color }}>{format(data[hover].value)}</div>
        </div>
      )}
    </div>
  );
};

export default AreaChart;
