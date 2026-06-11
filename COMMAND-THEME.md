# Command Theme — Style Guide (Lumo Electrical Admin)

Dark "terminal/console" aesthetic. Reference mockup: `C:\Users\Rafi\Downloads\Admin Dashboard\command-app\` (plain-JS React mockup using inline styles + CSS vars). This app implements the same look with **Tailwind classes** (tokens already defined in `tailwind.config.js`).

## Tokens (Tailwind class names)

| Purpose | Token | Hex | Example classes |
|---|---|---|---|
| Page background | `bg` | `#0a0b0d` | `bg-bg` |
| Sidebar background | `bg2` | `#0c0d10` | `bg-bg2` |
| Card/panel surface | `panel` | `#101216` | `bg-panel` |
| Raised surface (rows, inputs-in-cards) | `panel2` | `#181b21` | `bg-panel2` |
| Borders (ALL borders) | `line` | `#23262d` | `border-line` |
| Primary text | `body` | `#e9ebef` | `text-body` |
| Secondary text | `dim` | `#9aa0aa` | `text-dim` |
| Muted/labels | `mute` | `#5f6670` | `text-mute` |
| Accent (amber) | `accent` | `#f6a821` | `text-accent`, `bg-accent`, `bg-accent/15` |
| Text on amber | `accent-ink` | `#1a1205` | `text-accent-ink` |
| Positive | `pos` | `#5fcf80` | `text-pos` |
| Negative/danger | `neg` | `#f0726f` | `text-neg` |
| Warning | `warn` | `#fbb845` | `text-warn` |
| Info | `info` | `#6aa6f5` | `text-info` |

Fonts: `font-sans` = IBM Plex Sans (body), `font-mono` = IBM Plex Mono (numbers, labels, IDs, badges, table headers, KPIs).
Radius: panels/cards `rounded-card` (10px); buttons/inputs/badges `rounded-[7px]` or `rounded-lg`; small chips `rounded` (4-5px).
Animations: `animate-fade` (overlays), `animate-pop` (modals/dropdowns).

## Hard rules

1. **NO gradients, NO white/slate backgrounds, NO cyan/emerald/blue-themed Tailwind palette colors.** Replace every `slate-*`, `cyan-*`, `emerald-*`, `gray-*`, `white` background usage with tokens above.
2. **Preserve ALL logic untouched**: state, hooks, API calls, props, handlers, routing, data mapping, loading/error states. This is a re-skin only.
3. Keep `lucide-react` icons (don't swap icon library), adjust their size/color via className/size prop to match the look.
4. Keep responsive behavior (`sm: lg:` breakpoints) at least as good as current.
5. Tone color is semantic: amber=accent/brand/primary, warn=pending/low stock, pos=success/delivered/online, neg=critical/error/delete, info=informational.
6. Status colors at low opacity for fills: `bg-warn/15 text-warn border-warn/30` pattern.

## Recipes (match these closely)

### Micro-label (uppercase mono)
```jsx
<span className="font-mono text-[10.5px] tracking-[.12em] uppercase text-mute">Label</span>
```

### Panel (card with header)
```jsx
<div className="bg-panel border border-line rounded-card flex flex-col min-w-0">
  <div className="flex items-center justify-between gap-3 px-4 py-[11px] border-b border-line">
    <span className="font-mono text-[11px] font-semibold tracking-[.12em] uppercase text-dim">Title</span>
    {/* right side: actions / mono sub-label */}
  </div>
  <div className="p-4 flex-1 min-w-0">{/* body */}</div>
</div>
```

### KPI tile
```jsx
<div className="bg-panel border border-line rounded-card px-4 py-3.5">
  <div className="flex items-center justify-between mb-2.5">{/* micro-label + delta */}</div>
  <div className="font-mono text-[26px] font-semibold text-body tracking-[-.02em] leading-none">R 1.2M</div>
  <div className="mt-2 font-mono text-[11px] text-mute">sub text</div>
</div>
```

### Delta (trend %)
```jsx
<span className={`inline-flex items-center gap-[3px] font-mono text-[11.5px] font-semibold ${up ? 'text-pos' : 'text-neg'}`}>
  {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{up ? '+' : ''}{pc.toFixed(1)}%
</span>
```

### Badge (status chip)
```jsx
// tone = accent | warn | pos | neg | info | mute
<span className="inline-flex items-center gap-[5px] font-mono text-[10.5px] font-semibold uppercase tracking-[.05em] whitespace-nowrap px-2 py-[3px] rounded-[5px] text-warn bg-warn/[.13] border border-warn/[.28]">
  {/* optional dot: */}<span className="w-1.5 h-1.5 rounded-full bg-warn" />Pending
</span>
```

### Buttons
```jsx
// primary (amber)
<button className="inline-flex items-center justify-center gap-[7px] px-3.5 py-2 text-[12.5px] font-bold rounded-[7px] bg-accent text-accent-ink border border-accent hover:brightness-110 transition whitespace-nowrap">
// ghost
<button className="... bg-panel text-dim border border-line hover:border-[#3a3d44] hover:text-body transition">
// solid
<button className="... bg-panel2 text-body border border-line">
// small size: px-2.5 py-1.5 text-xs
// icon button (32px square)
<button className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-panel border border-line text-dim hover:text-body hover:border-[#3a3d44] transition">
// danger ghost: text-neg border-neg/30 hover:bg-neg/10
```

### Inputs / selects / textareas
```jsx
<input className="w-full bg-panel border border-line rounded-[7px] px-3 py-2 text-[12.5px] text-body outline-none focus:border-accent/50 placeholder:text-mute" />
// search input: relative wrapper, <Search size={14}/> absolutely positioned left-2.5 text-mute, input pl-8
// inside a panel/modal use bg-panel2 or keep bg-panel — match mockup page
// labels above inputs: micro-label recipe
```

### Tabs (segmented control)
```jsx
<div className="inline-flex gap-[2px] bg-panel border border-line rounded-lg p-[3px]">
  <button className={on
    ? 'inline-flex items-center gap-[7px] px-3 py-1.5 rounded-md bg-panel2 text-body shadow-[inset_0_0_0_1px_#23262d] font-mono text-[11.5px] font-semibold uppercase tracking-[.03em]'
    : 'inline-flex items-center gap-[7px] px-3 py-1.5 rounded-md text-mute font-mono text-[11.5px] font-semibold uppercase tracking-[.03em]'}>
    Label
    {count != null && <span className={`text-[10.5px] font-bold rounded px-[5px] ${on ? 'text-accent bg-accent/15' : 'text-mute bg-panel2'}`}>{count}</span>}
  </button>
</div>
```

### Page header (terminal status bar) — every page starts with this
```jsx
<div className="flex items-center justify-between gap-4 flex-wrap mb-[18px]">
  <div className="flex items-center gap-[11px]">
    <span className="w-[7px] h-[7px] rounded-full bg-pos shadow-[0_0_8px_#5fcf80]" />
    <h1 className="m-0 font-mono text-base font-semibold tracking-[.12em] uppercase text-body">Orders</h1>
    <span className="font-mono text-[11.5px] text-mute tracking-[.04em]">// fulfilment</span>
  </div>
  <div className="flex items-center gap-2.5 flex-wrap">{/* actions */}</div>
</div>
```
Path strings per page: dashboard `// overview`, orders `// fulfilment`, questions `// support`, reviews `// feedback`, products `// catalogue`, categories `// taxonomy`, customers `// accounts`, delivery `// couriers`.

### Tables
```jsx
<table className="w-full border-collapse">
  <thead><tr>
    <th className="text-left px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[.08em] text-mute border-b border-line whitespace-nowrap">SKU</th>
  </tr></thead>
  <tbody><tr className="hover:bg-panel2/50 transition-colors">
    <td className="px-4 py-3 text-[13px] text-body border-b border-line align-middle">…</td>
  </tr></tbody>
</table>
```
Numbers/IDs/prices in cells: `font-mono`. Money totals highlighted: `text-accent font-bold font-mono`. Tables live in a Panel with `p-0` body.

### Avatar (initials, square-ish)
```jsx
<div className="w-[34px] h-[34px] rounded-[7px] shrink-0 flex items-center justify-center bg-panel2 border border-line text-dim font-bold font-mono text-xs">{initials}</div>
```

### Stars
```jsx
{[1,2,3,4,5].map(i => <Star key={i} size={13} className={i <= rating ? 'text-warn fill-warn' : 'text-line'} />)}
```

### List row (inside panels — orders, questions, low stock…)
```jsx
<div className="border border-line rounded-lg bg-panel2 px-3.5 py-[13px] border-l-2 border-l-warn">{/* accent left edge optional */}</div>
```

### Empty state
```jsx
<div className="text-center py-[54px] text-mute">
  <Inbox size={30} className="mx-auto opacity-50" />
  <div className="mt-3 text-[13.5px] font-semibold text-dim">No results</div>
  <div className="mt-1 text-xs">sub text</div>
</div>
```

### Modal
```jsx
<div onClick={onClose} className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[7vh] pb-[4vh] bg-black/60 animate-fade">
  <div onClick={e => e.stopPropagation()} className="w-full max-w-[560px] max-h-[90%] flex flex-col bg-panel border border-line rounded-card shadow-[0_30px_80px_-20px_rgba(0,0,0,.87)] overflow-hidden animate-pop">
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line">
      <div className="w-9 h-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">{/* icon */}</div>
      <div className="flex-1 min-w-0">
        <span className="font-mono font-semibold text-sm tracking-[.08em] uppercase text-body">Title</span>
        <div className="text-mute text-xs mt-0.5">subtitle</div>
      </div>
      {/* close icon-button */}
    </div>
    <div className="p-4 overflow-y-auto flex-1">{/* body */}</div>
    <div className="px-4 py-3 border-t border-line flex justify-end gap-2.5">{/* footer buttons */}</div>
  </div>
</div>
```

### Progress bar (stock levels)
```jsx
<div className="flex-1 h-[5px] rounded-full bg-panel overflow-hidden">
  <div className="h-full rounded-full bg-warn" style={{ width: `${pct}%` }} />
</div>
```

### Loading state
Use a simple mono terminal-style line, e.g. `<div className="font-mono text-xs text-mute uppercase tracking-[.1em] py-12 text-center animate-pulse">Loading…</div>` or skeleton blocks `bg-panel2 animate-pulse rounded`.

### Charts (SVG, no library)
Charts use amber `#f6a821` stroke/fill with gradient fade (`stopOpacity` 0.28→0), gridlines `#23262d`, labels `#5f6670` 10px font-mono. Keep existing chart components' data handling; restyle colors/fonts only. Tooltip: `bg-[#0a0a0c] border border-white/10 rounded-[7px] px-2 py-1 text-[11px] font-bold`.
