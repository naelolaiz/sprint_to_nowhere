// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';
import { Person } from './Person.jsx';
import { Desk } from './Desk.jsx';
import { InitechLogo } from './InitechLogo.jsx';

const SlackPing = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle cx="0" cy="0" r="2.4" fill={C.rust}/>
    <text x="0" y="1.2" textAnchor="middle" fontSize="2.6" fontFamily={FONT} fill="#000" fontWeight="700">!</text>
  </g>
);

export const OfficeOverview = ({ activeArea, burnout = 0 }) => {
  const noiseLine =
    burnout > 80 ? 'STATUS: STRAINED · NOISE FLOOR: HOSTILE · COFFEE: COLD' :
    burnout > 50 ? 'STATUS: TENSE · NOISE FLOOR: HIGH · COFFEE: COLD' :
    'STATUS: NORMAL · NOISE FLOOR: HIGH · COFFEE: COLD';

  return (
  <svg viewBox="0 0 600 180" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
    <rect x="2" y="2" width="596" height="176" fill={C.bg} stroke={C.borderHi} strokeWidth="1.2"/>
    {/* burnout-driven floor tint — red haze at the edges */}
    {burnout > 60 && (
      <rect x="2" y="2" width="596" height="176" fill={C.burnout} opacity={Math.min(0.08, (burnout - 60) / 500)}/>
    )}

    <text x="10" y="13" fontSize="6" fontFamily={FONT} fill={C.textDimmer} letterSpacing="2">FLOOR 14 · "INNOVATION HUB" · OPEN PLAN</text>
    {/* Wall signage in the empty top strip between the floor label and the meeting rooms */}
    <g transform="translate(348 2)">
      <InitechLogo width={18}/>
    </g>
    <text x="20" y="30" fontSize="5" fontFamily={FONT} fill={C.textDimmer} letterSpacing="1">ENGINEERING POD</text>

    <Desk x={55} y={70} you screen="code" label="JARED"/>
    <Desk x={130} y={70} label="Sarah"/>
    <Desk x={205} y={70} label="Jin"/>
    <Desk x={55} y={130} label="Brad"/>
    <Desk x={130} y={130} label="Doug"/>
    <Desk x={205} y={130} label="Marcus"/>

    {/* Slack notification dots over Jared's desk and Marcus's */}
    <SlackPing x={73} y={56}/>
    {burnout > 40 && <SlackPing x={222} y={116}/>}
    {burnout > 60 && <SlackPing x={147} y={56}/>}

    {activeArea === 'desk' && (
      <rect x="32" y="55" width="46" height="32" fill="none" stroke={C.amber} strokeWidth="0.8" strokeDasharray="3 2"/>
    )}

    <rect x="280" y="22" width="140" height="60" fill="none" stroke={C.borderHi} strokeWidth="0.8" strokeDasharray="2 2"/>
    <text x="285" y="32" fontSize="5" fontFamily={FONT} fill={C.textDimmer} letterSpacing="1">ROOM A · "ASCEND"</text>
    <ellipse cx="350" cy="57" rx="50" ry="13" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.8"/>
    {/* tiny figures around the table — perpetually occupied */}
    <Person x={310} y={57} type="generic" scale={0.45} seated/>
    <Person x={330} y={57} type="marcus" scale={0.5} seated/>
    <Person x={350} y={57} type="brad" scale={0.5} seated mood="phone"/>
    <Person x={370} y={57} type="generic" scale={0.45} seated/>
    <Person x={390} y={57} type="generic" scale={0.45} seated/>

    <rect x="280" y="98" width="140" height="60" fill="none" stroke={C.borderHi} strokeWidth="0.8" strokeDasharray="2 2"/>
    <text x="285" y="108" fontSize="5" fontFamily={FONT} fill={C.textDimmer} letterSpacing="1">ROOM B · "INNOVATE"</text>
    <ellipse cx="350" cy="133" rx="50" ry="13" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.8"/>
    {/* empty room — single figure refreshing tickets-down */}
    <Person x={350} y={133} type="engineer" scale={0.5} seated mood="tired"/>
    {activeArea === 'meeting' && (
      <rect x="280" y="22" width="140" height="60" fill="none" stroke={C.amber} strokeWidth="0.8" strokeDasharray="3 2"/>
    )}

    <rect x="440" y="22" width="140" height="65" fill="none" stroke={C.amberDim} strokeWidth="0.8"/>
    <text x="445" y="33" fontSize="5" fontFamily={FONT} fill={C.amberDim} letterSpacing="1">EXECUTIVE WING</text>
    <Desk x={510} y={65}/>
    {/* "DO NOT DISTURB" placard */}
    <rect x="472" y="55" width="22" height="6" fill={C.amberDim}/>
    <text x="483" y="60" textAnchor="middle" fontSize="2.4" fontFamily={FONT} fill={C.bg} fontWeight="700">DO NOT</text>

    <rect x="440" y="98" width="140" height="60" fill="none" stroke={C.borderHi} strokeWidth="0.8"/>
    <text x="445" y="108" fontSize="5" fontFamily={FONT} fill={C.textDimmer} letterSpacing="1">CAFE</text>
    <circle cx="500" cy="135" r="6" fill="none" stroke={C.borderHi} strokeWidth="0.6"/>
    <line x1="494" y1="135" x2="488" y2="135" stroke={C.borderHi} strokeWidth="0.6"/>
    <text x="500" y="148" textAnchor="middle" fontSize="3" fontFamily={FONT} fill={C.textDimmer}>cold</text>
    {/* Doug perpetually at the espresso machine */}
    <Person x={476} y={142} type="doug" scale={0.6} mood="phone"/>

    <text x="10" y="172" fontSize="4.5" fontFamily={FONT} fill={C.textDimmer}>{noiseLine}</text>
  </svg>
  );
};
