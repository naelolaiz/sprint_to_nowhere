// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';
import { Person } from './Person.jsx';
import { SpeechBubble } from '../common/SpeechBubble.jsx';
import { Desk } from './Desk.jsx';

export const ExecutiveScene = () => (
  <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
    <rect x="20" y="20" width="360" height="140" fill={C.surface} stroke={C.amber} strokeWidth="1"/>
    <text x="30" y="34" fontSize="5" fontFamily={FONT} fill={C.amberDim} letterSpacing="2">CEO'S CORNER OFFICE · 14F</text>

    <rect x="270" y="40" width="90" height="62" fill="none" stroke={C.borderHi} strokeWidth="0.8"/>
    <line x1="315" y1="40" x2="315" y2="102" stroke={C.borderHi} strokeWidth="0.5"/>
    <line x1="270" y1="71" x2="360" y2="71" stroke={C.borderHi} strokeWidth="0.5"/>

    <rect x="60" y="105" width="180" height="6" fill={C.surface2} stroke={C.amber} strokeWidth="0.8"/>
    <Person x={150} y={130} type="ceo" scale={1.4} label="CEO"/>
    <SpeechBubble x={170} y={50} text='"We should do THIS!"' w={130}/>

    <text x="30" y="170" fontSize="4.5" fontFamily={FONT} fill={C.textDimmer}>SLACK PING · NEW IDEA · ROADMAP UPDATING</text>
  </svg>
);
