// SPDX-License-Identifier: GPL-3.0-only

import { C } from '../../data/theme.js';
import { skyFor } from './sky.js';

// A pane of sky with an optional skyline. `id` must be unique per scene so
// the gradient ids do not collide when two scenes mount at once.
export const SkyPane = ({ id, x, y, w, h, clock, skyline = true, buildings = null, stroke = C.borderHi, sunX = null, sunY = null, moonX = 0.78, moonY = 0.26 }) => {
  const sky = skyFor(clock);
  const night = sky.phase === 'night';
  const gid = `sky-${id}-${sky.phase}`;
  const horizon = y + h * 0.66;
  const blocks = buildings || [
    [0.00, 0.62, 0.17], [0.17, 0.50, 0.12], [0.29, 0.38, 0.25],
    [0.54, 0.58, 0.14], [0.68, 0.44, 0.32],
  ];
  // Window lights in the skyline: a few by day, most of them at night.
  const lit = blocks.flatMap(([bx, by, bw], i) => {
    const rows = night ? [0.18, 0.42, 0.68] : [0.42];
    return rows.map((r, j) => [bx + bw * (0.25 + 0.5 * ((i + j) % 2)), by + (1 - by) * r]);
  });
  const stars = night ? [[0.12, 0.12], [0.3, 0.2], [0.52, 0.09], [0.66, 0.24], [0.88, 0.14], [0.78, 0.33], [0.2, 0.36]] : [];
  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sky.top}/>
          <stop offset="100%" stopColor={sky.bottom}/>
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${gid})`}/>
      {stars.map(([sx, sy], i) => (
        <circle key={i} cx={x + sx * w} cy={y + sy * h} r={0.4} fill="#e8e2d0" opacity="0.8"/>
      ))}
      {sky.sun != null && (() => {
        const cx = x + (sunX ?? sky.sun) * w;
        const cy = y + h * (sunY ?? (sky.phase === 'evening' ? 0.6 : sky.phase === 'midday' ? 0.18 : 0.3));
        return (
          <g>
            <circle cx={cx} cy={cy} r={Math.min(w, h) * 0.09} fill={sky.sunColor} opacity="0.9"/>
            <circle cx={cx} cy={cy} r={Math.min(w, h) * 0.16} fill={sky.sunColor} opacity="0.18"/>
          </g>
        );
      })()}
      {night && (
        <g>
          <circle cx={x + moonX * w} cy={y + h * moonY} r={Math.min(w, h) * 0.14} fill="#e6dcb8" opacity="0.1"/>
          <circle cx={x + moonX * w} cy={y + h * moonY} r={Math.min(w, h) * 0.07} fill="#e6dcb8" opacity="0.92"/>
          <circle cx={x + moonX * w - Math.min(w, h) * 0.02} cy={y + h * moonY + Math.min(w, h) * 0.015} r={Math.min(w, h) * 0.012} fill="#cfc4a0" opacity="0.8"/>
        </g>
      )}
      {/* haze band on the horizon */}
      <rect x={x} y={horizon - h * 0.12} width={w} height={h * 0.12} fill="#fff" opacity={sky.haze * 0.25}/>
      {skyline && (
        <g>
          {blocks.map(([bx, by, bw], i) => (
            <rect key={i} x={x + bx * w} y={y + by * h} width={bw * w} height={h - by * h} fill={night ? '#0e1016' : '#2c3440'} opacity={night ? 0.95 : 0.8}/>
          ))}
          {lit.map(([lx, ly], i) => (
            <rect key={i} x={x + lx * w} y={y + ly * h} width={Math.max(0.8, w * 0.014)} height={Math.max(0.8, h * 0.02)} fill={C.amber} opacity={night ? 0.8 : 0.35}/>
          ))}
        </g>
      )}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={stroke} strokeWidth="0.8"/>
    </g>
  );
};
