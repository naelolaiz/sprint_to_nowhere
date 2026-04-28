// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';

export const BurnDown = ({ history, currentRemaining, currentDay, dayFocusRemaining, dayBudget = 8 }) => {
  const W = 280, H = 110, P = 18;
  // Build the points list in the same fractional-day coordinate space the rest of the
  // game writes to hourHistory. The "current" tip is the current sprintPlan total
  // pinned at wherever the simulated workday currently sits.
  const points = [...(history || [])];
  if (points.length === 0) return null;
  const liveDay = (currentDay || 1) - 1 + Math.max(0.001, Math.min(0.999,
    1 - Math.max(0, Math.min(1, (dayFocusRemaining ?? dayBudget) / dayBudget))));
  const lastPoint = points[points.length - 1];
  if (lastPoint.day < liveDay && currentRemaining !== undefined) {
    points.push({ day: liveDay, hours: currentRemaining, kind: 'live' });
  }

  const startHours = points[0]?.hours || 40;
  const maxY = Math.max(startHours * 1.1, ...points.map(p => p.hours)) * 1.05 || 1;
  const xFor = (d) => P + (Math.max(0, Math.min(5, d)) / 5) * (W - 2 * P);
  const yFor = (h) => H - P - (h / maxY) * (H - 2 * P);

  // Build a STEP-line path: hold horizontal until next event, then jump vertically.
  // This is what gives the skyscraper-skyline silhouette — scope additions become
  // sudden vertical jumps instead of getting averaged into smooth diagonals.
  let pathD = '';
  let areaD = '';
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const x = xFor(p.day);
    const y = yFor(p.hours);
    if (i === 0) {
      pathD = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      areaD = `M ${x.toFixed(1)} ${(H - P).toFixed(1)} L ${x.toFixed(1)} ${y.toFixed(1)}`;
    } else {
      const prev = points[i - 1];
      const prevY = yFor(prev.hours);
      // Step: horizontal hold from prev's x to current x at PREV height, then vertical jump to current y.
      pathD += ` L ${x.toFixed(1)} ${prevY.toFixed(1)} L ${x.toFixed(1)} ${y.toFixed(1)}`;
      areaD += ` L ${x.toFixed(1)} ${prevY.toFixed(1)} L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
  }
  // close the area down to baseline
  const lastX = xFor(points[points.length - 1].day);
  areaD += ` L ${lastX.toFixed(1)} ${(H - P).toFixed(1)} Z`;

  // What the textbook says SHOULD happen — a clean linear burn-down to zero.
  const idealD = `M ${xFor(0)} ${yFor(startHours)} L ${xFor(5)} ${yFor(0)}`;

  const trend = points[points.length - 1].hours - points[0].hours;
  const goingUp = trend > 0;
  const trendColor = goingUp ? C.rust : trend < 0 ? C.sage : C.textDim;
  const lineColor = goingUp ? C.rust : C.amber;
  const fillColor = goingUp ? C.rustDim : C.amberDim;

  return (
    <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, padding: 14, marginBottom: 16 }}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-[10px] tracking-widest uppercase" style={{ color: C.textDim }}>
          Sprint Burn-{goingUp ? 'Up' : 'Down'}
        </div>
        <div className="text-xs" style={{ color: trendColor, fontVariantNumeric: 'tabular-nums' }}>
          {goingUp ? '↑' : trend < 0 ? '↓' : '·'} {trend >= 0 ? '+' : ''}{Math.round(trend)}h
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {/* axes */}
        <line x1={P} y1={H - P} x2={W - P} y2={H - P} stroke={C.border} strokeWidth="1"/>
        <line x1={P} y1={P} x2={P} y2={H - P} stroke={C.border} strokeWidth="1"/>
        {/* day ticks */}
        {[0,1,2,3,4,5].map(d => (
          <text key={d} x={xFor(d)} y={H - 4} fill={C.textDimmer} fontSize="8" textAnchor="middle" fontFamily={FONT}>
            d{d}
          </text>
        ))}
        {/* starting hours reference */}
        <line x1={xFor(0)} y1={yFor(startHours)} x2={xFor(5)} y2={yFor(startHours)}
              stroke={C.borderHi} strokeWidth="0.6" strokeDasharray="1 3" opacity="0.5"/>
        {/* the textbook plan that nobody is following */}
        <path d={idealD} stroke={C.borderHi} strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.6"/>
        {/* skyscraper silhouette (filled area under step line) */}
        <path d={areaD} fill={fillColor} opacity="0.25"/>
        {/* the actual stepped line */}
        <path d={pathD} stroke={lineColor} strokeWidth="1.5" fill="none" strokeLinejoin="miter"/>
        {/* event markers — scope adds in rust, work in sage, eod in amber */}
        {points.map((p, i) => {
          const c =
            p.kind === 'scope' ? C.rust :
            p.kind === 'work' ? C.sage :
            p.kind === 'shrink' ? C.sage :
            p.kind === 'eod' ? C.amber :
            p.kind === 'live' ? C.amber :
            C.textDim;
          const r = (p.kind === 'scope' || p.kind === 'eod') ? 2.2 : 1.6;
          return <circle key={i} cx={xFor(p.day)} cy={yFor(p.hours)} r={r} fill={c}/>;
        })}
      </svg>
      <div className="text-[10px] mt-1 flex items-center justify-between" style={{ color: C.textDimmer }}>
        <span>Dotted = the plan. Solid = reality.</span>
        <span style={{ color: C.rust }}>● scope</span>
      </div>
    </div>
  );
};
