// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';
import { Person } from './Person.jsx';
import { SpeechBubble } from '../common/SpeechBubble.jsx';

export const PlanningScene = ({ sprint }) => {
  const marcusLines = [
    '"Capacity check?"',
    '"Anyone see risks?"',
    '"Are we committing?"',
    '"Quick parking lot?"',
    '"Let\'s timebox this..."',
    '"Going once... twice..."',
  ];
  const marcusLine = marcusLines[((sprint || 1) - 1) % marcusLines.length];
  return (
    <svg viewBox="0 0 600 200" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
      {/* Room background */}
      <rect x="20" y="20" width="560" height="160" fill={C.surface} opacity="0.4" stroke={C.borderHi} strokeWidth="1"/>

      {/* Header / footer text */}
      <text x="30" y="34" fontSize="5" fontFamily={FONT} fill={C.textDimmer} letterSpacing="1">
        ROOM A · "ASCEND" · SPRINT {sprint} PLANNING · 47 MINUTES IN
      </text>
      <text x="570" y="172" textAnchor="end" fontSize="4.5" fontFamily={FONT} fill={C.textDimmer}>
        RUNNING 17 MINUTES OVER · NEXT MEETING IN 0
      </text>

      {/* Whiteboard / kanban with sticky notes */}
      <g transform="translate(180 42)">
        <rect x="0" y="0" width="240" height="50" fill="#0d0e10" stroke={C.borderHi} strokeWidth="0.8"/>
        <text x="120" y="11" textAnchor="middle" fontSize="4.5" fontFamily={FONT} fill={C.amber} fontWeight="700" letterSpacing="2">
          SPRINT {sprint} BACKLOG
        </text>

        {/* Sticky notes */}
        <rect x="12" y="17" width="34" height="26" fill={C.amber} opacity="0.7"/>
        <text x="29" y="27" textAnchor="middle" fontSize="3" fontFamily={FONT} fill="#000" fontWeight="700">FEAT-12</text>
        <text x="29" y="35" textAnchor="middle" fontSize="2.5" fontFamily={FONT} fill="#000">8h</text>

        <rect x="50" y="17" width="34" height="26" fill={C.rust} opacity="0.7"/>
        <text x="67" y="27" textAnchor="middle" fontSize="3" fontFamily={FONT} fill="#000" fontWeight="700">BUG-7</text>
        <text x="67" y="35" textAnchor="middle" fontSize="2.5" fontFamily={FONT} fill="#000">4h</text>

        <rect x="88" y="17" width="34" height="26" fill={C.sage} opacity="0.7"/>
        <text x="105" y="27" textAnchor="middle" fontSize="3" fontFamily={FONT} fill="#000" fontWeight="700">REF-3</text>
        <text x="105" y="35" textAnchor="middle" fontSize="2.5" fontFamily={FONT} fill="#000">12h</text>

        <rect x="126" y="17" width="34" height="26" fill={C.amber} opacity="0.7"/>
        <text x="143" y="27" textAnchor="middle" fontSize="3" fontFamily={FONT} fill="#000" fontWeight="700">FEAT-9</text>
        <text x="143" y="35" textAnchor="middle" fontSize="2.5" fontFamily={FONT} fill="#000">6h</text>

        <rect x="164" y="17" width="34" height="26" fill={C.blue} opacity="0.7"/>
        <text x="181" y="27" textAnchor="middle" fontSize="3" fontFamily={FONT} fill="#000" fontWeight="700">LEG-2</text>
        <text x="181" y="35" textAnchor="middle" fontSize="2.5" fontFamily={FONT} fill="#000">14h</text>

        {/* "Urgent" sticky with CEO star */}
        <rect x="202" y="17" width="34" height="26" fill={C.rust} opacity="0.55" stroke={C.rust} strokeWidth="0.5" strokeDasharray="2 1"/>
        <text x="219" y="27" textAnchor="middle" fontSize="3" fontFamily={FONT} fill="#000" fontWeight="700">URGENT</text>
        <text x="219" y="35" textAnchor="middle" fontSize="2.4" fontFamily={FONT} fill="#000">CEO ★</text>
      </g>

      {/* You standing presenting at the board */}
      <Person x={140} y={130} type="you" scale={0.95} label="JARED"/>

      {/* People drawn FIRST, table will cover their lower bodies */}
      {/* Marcus — the only one engaged, has clipboard */}
      <Person x={210} y={143} type="marcus" scale={1.0} label="Marcus" seated/>

      {/* Brad — looking at his phone */}
      <Person x={285} y={143} type="brad" scale={1.0} label="Brad" seated/>

      {/* Sarah — on her laptop */}
      <Person x={355} y={143} type="generic" scale={1.0} label="Sarah" seated/>

      {/* Doug — milk spreadsheet (homelab guy) */}
      <Person x={425} y={143} type="generic" scale={1.0} label="Doug" seated/>

      {/* Jin — asleep */}
      <Person x={495} y={143} type="generic" scale={1.0} label="Jin" seated/>

      {/* Conference table — drawn AFTER figures so it covers their lower bodies */}
      <ellipse cx="350" cy="160" rx="200" ry="20" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.8"/>

      {/* Items on the table — drawn AFTER table */}
      {/* Marcus's clipboard */}
      <g transform="translate(218 150)">
        <rect x="-3" y="-2" width="6" height="8" fill={C.bg} stroke={C.sage} strokeWidth="0.5"/>
        <line x1="-2" y1="0" x2="2" y2="0" stroke={C.sage} strokeWidth="0.3"/>
        <line x1="-2" y1="1.5" x2="2" y2="1.5" stroke={C.sage} strokeWidth="0.3"/>
        <line x1="-2" y1="3" x2="2" y2="3" stroke={C.sage} strokeWidth="0.3"/>
        <line x1="-2" y1="4.5" x2="2" y2="4.5" stroke={C.sage} strokeWidth="0.3"/>
      </g>

      {/* Brad's phone showing r/pickleball */}
      <g transform="translate(290 150)">
        <rect x="-3" y="-2" width="6" height="9" fill="#0a0a0a" stroke={C.amberDim} strokeWidth="0.5"/>
        <rect x="-2.5" y="-1" width="5" height="6" fill={C.surface}/>
        <text x="0" y="1" textAnchor="middle" fontSize="1.6" fontFamily={FONT} fill={C.amber}>r/pickleball</text>
        <text x="0" y="3" textAnchor="middle" fontSize="1.4" fontFamily={FONT} fill={C.text}>Stefan tutorial</text>
        <text x="0" y="4.5" textAnchor="middle" fontSize="1.4" fontFamily={FONT} fill={C.textDimmer}>↑1.2k · 47 cmts</text>
      </g>

      {/* Sarah's laptop showing code */}
      <g transform="translate(360 150)">
        <rect x="-7" y="-3" width="14" height="8" fill="#0a0a0a" stroke={C.borderHi} strokeWidth="0.5"/>
        <line x1="-6" y1="-1.5" x2="-3" y2="-1.5" stroke={C.sage} strokeWidth="0.4"/>
        <line x1="-6" y1="-0.3" x2="3" y2="-0.3" stroke={C.amber} strokeWidth="0.4"/>
        <line x1="-6" y1="0.9" x2="-1" y2="0.9" stroke={C.text} strokeWidth="0.4"/>
        <line x1="-6" y1="2.1" x2="2" y2="2.1" stroke={C.blue} strokeWidth="0.4"/>
        <line x1="-6" y1="3.3" x2="-2" y2="3.3" stroke={C.sage} strokeWidth="0.4"/>
        <rect x="-8" y="5" width="16" height="1.2" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.3"/>
      </g>

      {/* Doug's milk spreadsheet */}
      <g transform="translate(430 150)">
        <rect x="-6" y="-3" width="12" height="9" fill={C.bg} stroke={C.sage} strokeWidth="0.6"/>
        <rect x="-6" y="-3" width="12" height="1.4" fill={C.sage} opacity="0.3"/>
        <text x="0" y="-1.7" textAnchor="middle" fontSize="1.5" fontFamily={FONT} fill={C.sage}>milk_v47.xlsx</text>
        {/* Grid */}
        {[-1.4, 0.4, 2.2, 4].map((yy, i) => (
          <line key={i} x1="-6" y1={yy} x2="6" y2={yy} stroke={C.sage} strokeWidth="0.2"/>
        ))}
        {[-3, -1, 1, 3].map((xx, i) => (
          <line key={i} x1={xx} y1="-1.6" x2={xx} y2="6" stroke={C.sage} strokeWidth="0.2"/>
        ))}
      </g>

      {/* Z's drifting up from Jin */}
      <text x="505" y="125" fontSize="6" fontFamily={FONT} fill={C.textDimmer} fontStyle="italic">z</text>
      <text x="510" y="118" fontSize="5" fontFamily={FONT} fill={C.textDimmer} fontStyle="italic">z</text>
      <text x="515" y="112" fontSize="4" fontFamily={FONT} fill={C.textDimmer} fontStyle="italic">z</text>

      {/* Marcus's speech bubble */}
      <SpeechBubble x={235} y={100} text={marcusLine} w={80}/>

      {/* Empty chair on the near side (where the viewer would be) — implied */}
    </svg>
  );
};
