// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';
import { Person } from './Person.jsx';
import { ScreenContent } from './ScreenContent.jsx';

export const Desk = ({ x, y, screen = 'code', label, you, accent }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x="-22" y="0" width="44" height="3" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.8"/>
    <line x1="-20" y1="3" x2="-20" y2="14" stroke={C.borderHi} strokeWidth="0.8"/>
    <line x1="20" y1="3" x2="20" y2="14" stroke={C.borderHi} strokeWidth="0.8"/>
    <rect x="-1" y="-2" width="2" height="2" fill={C.borderHi}/>
    <rect x="-4" y="-3" width="8" height="1" fill={C.borderHi}/>
    <rect x="-12" y="-14" width="24" height="11" fill={you ? '#0a0a0a' : C.surface2} stroke={you ? (accent || C.amber) : C.border} strokeWidth="1"/>
    {you && <ScreenContent kind={screen}/>}
    <rect x="-8" y="0" width="16" height="2" fill={C.surface2} stroke={C.border} strokeWidth="0.5"/>
    {label && <text x="0" y="22" textAnchor="middle" fontSize="5" fontFamily={FONT} fill={C.textDimmer}>{label}</text>}
  </g>
);
