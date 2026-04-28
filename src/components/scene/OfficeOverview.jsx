// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';
import { Person } from './Person.jsx';
import { Desk } from './Desk.jsx';

export const OfficeOverview = ({ activeArea }) => (
  <svg viewBox="0 0 600 180" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
    <rect x="2" y="2" width="596" height="176" fill={C.bg} stroke={C.borderHi} strokeWidth="1.2"/>
    <text x="10" y="13" fontSize="6" fontFamily={FONT} fill={C.textDimmer} letterSpacing="2">FLOOR 14 · "INNOVATION HUB" · OPEN PLAN</text>
    <text x="20" y="30" fontSize="5" fontFamily={FONT} fill={C.textDimmer} letterSpacing="1">ENGINEERING POD</text>

    <Desk x={55} y={70} you screen="code" label="JARED"/>
    <Desk x={130} y={70} label="Sarah"/>
    <Desk x={205} y={70} label="Jin"/>
    <Desk x={55} y={130} label="Brad"/>
    <Desk x={130} y={130} label="Doug"/>
    <Desk x={205} y={130} label="Marcus"/>
    {activeArea === 'desk' && (
      <rect x="32" y="55" width="46" height="32" fill="none" stroke={C.amber} strokeWidth="0.8" strokeDasharray="3 2"/>
    )}

    <rect x="280" y="22" width="140" height="60" fill="none" stroke={C.borderHi} strokeWidth="0.8" strokeDasharray="2 2"/>
    <text x="285" y="32" fontSize="5" fontFamily={FONT} fill={C.textDimmer} letterSpacing="1">ROOM A · "ASCEND"</text>
    <ellipse cx="350" cy="57" rx="50" ry="13" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.8"/>

    <rect x="280" y="98" width="140" height="60" fill="none" stroke={C.borderHi} strokeWidth="0.8" strokeDasharray="2 2"/>
    <text x="285" y="108" fontSize="5" fontFamily={FONT} fill={C.textDimmer} letterSpacing="1">ROOM B · "INNOVATE"</text>
    <ellipse cx="350" cy="133" rx="50" ry="13" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.8"/>
    {activeArea === 'meeting' && (
      <rect x="280" y="22" width="140" height="60" fill="none" stroke={C.amber} strokeWidth="0.8" strokeDasharray="3 2"/>
    )}

    <rect x="440" y="22" width="140" height="65" fill="none" stroke={C.amberDim} strokeWidth="0.8"/>
    <text x="445" y="33" fontSize="5" fontFamily={FONT} fill={C.amberDim} letterSpacing="1">EXECUTIVE WING</text>
    <Desk x={510} y={65}/>

    <rect x="440" y="98" width="140" height="60" fill="none" stroke={C.borderHi} strokeWidth="0.8"/>
    <text x="445" y="108" fontSize="5" fontFamily={FONT} fill={C.textDimmer} letterSpacing="1">CAFE</text>
    <circle cx="500" cy="135" r="6" fill="none" stroke={C.borderHi} strokeWidth="0.6"/>
    <line x1="494" y1="135" x2="488" y2="135" stroke={C.borderHi} strokeWidth="0.6"/>
    <text x="500" y="148" textAnchor="middle" fontSize="3" fontFamily={FONT} fill={C.textDimmer}>cold</text>

    <text x="10" y="172" fontSize="4.5" fontFamily={FONT} fill={C.textDimmer}>STATUS: NORMAL · NOISE FLOOR: HIGH · COFFEE: COLD</text>
  </svg>
);
