// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';

// Greedy word-wrap: approximate (in monospace at fontSize 5.5, ~3.3px per char)
// so a w=110 bubble fits ~30 chars per line. Renders as multiple <text> rows.
const wrap = (text, maxChars) => {
  if (Array.isArray(text)) return text;
  const words = String(text).split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length <= maxChars) {
      cur = (cur + ' ' + w).trim();
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
};

export const SpeechBubble = ({ x, y, text, w = 110, color = C.amber, tail = 'bottom-left' }) => {
  // Empirical: at fontSize 5.5 in JetBrains Mono, ~3.4px per glyph.
  // Padding of 6px on the inside leaves ~(w-6)/3.4 chars per line.
  const charWidth = 3.4;
  const maxChars = Math.max(10, Math.floor((w - 6) / charWidth));
  const lines = wrap(text, maxChars);
  const lineH = 6.5;
  const padTop = 6;
  const padBot = 4;
  const h = padTop + lines.length * lineH + padBot - 2;

  let tailPoints = `${x + 14},${y + h} ${x + 18},${y + h} ${x + 16},${y + h + 5}`;
  if (tail === 'bottom-right') tailPoints = `${x + w - 18},${y + h} ${x + w - 14},${y + h} ${x + w - 16},${y + h + 5}`;
  if (tail === 'top') tailPoints = `${x + 14},${y} ${x + 18},${y} ${x + 16},${y - 5}`;

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="2" fill={C.surface2} stroke={color} strokeWidth="0.8"/>
      <polygon points={tailPoints} fill={C.surface2} stroke={color} strokeWidth="0.8"/>
      {/* mask the tail join so it looks like one shape */}
      <line x1={x + 14} y1={y + h} x2={x + 18} y2={y + h} stroke={C.surface2} strokeWidth="1.2"/>
      {lines.map((line, i) => (
        <text key={i} x={x + 5} y={y + padTop + i * lineH + 1} fontSize="5.5" fontFamily={FONT} fill={C.text}>
          {line}
        </text>
      ))}
    </g>
  );
};
