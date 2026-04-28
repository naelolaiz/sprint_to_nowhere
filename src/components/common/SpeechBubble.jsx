// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';

export const SpeechBubble = ({ x, y, text, w = 110 }) => (
  <g>
    <rect x={x} y={y} width={w} height="14" rx="2" fill={C.surface2} stroke={C.amber} strokeWidth="0.8"/>
    <polygon points={`${x + 14},${y + 14} ${x + 18},${y + 14} ${x + 16},${y + 19}`} fill={C.surface2} stroke={C.amber} strokeWidth="0.8"/>
    <text x={x + 5} y={y + 9} fontSize="5.5" fontFamily={FONT} fill={C.text}>{text}</text>
  </g>
);
