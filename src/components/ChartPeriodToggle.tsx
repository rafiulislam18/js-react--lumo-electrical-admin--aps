import React from 'react';

export type ChartPeriod = 'monthly' | '30days' | '7days';

export const PERIOD_OPTIONS: { value: ChartPeriod; label: string }[] = [
  { value: 'monthly', label: '12M' },
  { value: '30days', label: '30D' },
  { value: '7days', label: '7D' },
];

interface ChartPeriodToggleProps {
  value: ChartPeriod;
  onChange: (period: ChartPeriod) => void;
}

/** Compact segmented toggle for the dashboard chart time windows. */
const ChartPeriodToggle: React.FC<ChartPeriodToggleProps> = ({ value, onChange }) => (
  <div className="inline-flex gap-[2px] bg-panel2 border border-line rounded-[6px] p-[2px]">
    {PERIOD_OPTIONS.map(({ value: v, label }) => (
      <button
        key={v}
        type="button"
        onClick={() => onChange(v)}
        className={`px-2 py-[3px] rounded-[4px] font-mono text-[10.5px] font-semibold uppercase tracking-[.04em] transition-colors ${
          value === v ? 'bg-accent/15 text-accent' : 'text-mute hover:text-dim'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

export default ChartPeriodToggle;
