// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';
import { Person } from './Person.jsx';

export const ExecutiveScene = () => (
  <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
    <rect x="20" y="20" width="360" height="140" fill={C.surface} stroke={C.amber} strokeWidth="1"/>
    <text x="30" y="34" fontSize="5" fontFamily={FONT} fill={C.amberDim} letterSpacing="2">CEO'S CORNER OFFICE · 14F</text>

    <rect x="270" y="40" width="90" height="62" fill="none" stroke={C.borderHi} strokeWidth="0.8"/>
    <line x1="315" y1="40" x2="315" y2="102" stroke={C.borderHi} strokeWidth="0.5"/>
    <line x1="270" y1="71" x2="360" y2="71" stroke={C.borderHi} strokeWidth="0.5"/>

    <rect x="60" y="105" width="180" height="6" fill={C.surface2} stroke={C.amber} strokeWidth="0.8"/>
    <Person x={150} y={130} type="ceo" scale={1.4} label="CEO" mood="phone"/>

    {/* CEO's actual message lives in the dialog body. Here we just show a
        generic Slack-input placeholder, never a fixed quote. */}
    <g transform="translate(170 50)">
      <rect x="0" y="0" width="180" height="44" fill={C.surface2} stroke={C.amberDim} strokeWidth="0.7"/>
      <rect x="0" y="0" width="180" height="7" fill={C.amberDim}/>
      <text x="4" y="5" fontSize="3.5" fontFamily={FONT} fill={C.bg} fontWeight="700">SLACK · DRAFT TO #ENGINEERING</text>
      <text x="4" y="14" fontSize="3" fontFamily={FONT} fill={C.amber}>cursor blinking · CEO is typing…</text>
      <line x1="4" y1="18" x2="176" y2="18" stroke={C.border} strokeWidth="0.3"/>
      <rect x="4" y="22" width="142" height="2.2" fill={C.textDim} opacity="0.5"/>
      <rect x="4" y="26" width="170" height="2.2" fill={C.textDim} opacity="0.5"/>
      <rect x="4" y="30" width="118" height="2.2" fill={C.textDim} opacity="0.5"/>
      <rect x="4" y="34" width="76" height="2.2" fill={C.textDim} opacity="0.5"/>
      <text x="174" y="40" textAnchor="end" fontSize="2.6" fontFamily={FONT} fill={C.amber}>by next week 🙏</text>
    </g>

    <text x="30" y="170" fontSize="4.5" fontFamily={FONT} fill={C.textDimmer}>SLACK PING · NEW IDEA · ROADMAP UPDATING</text>
  </svg>
);
