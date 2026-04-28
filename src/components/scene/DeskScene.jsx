// SPDX-License-Identifier: GPL-3.0-only

import { Coffee } from 'lucide-react';
import { C, FONT } from '../../data/theme.js';
import { Person } from './Person.jsx';
import { Desk } from './Desk.jsx';
import { SpeechBubble } from '../common/SpeechBubble.jsx';

export const DeskScene = ({ event, debt }) => {
  const eid = event?.id;
  const screen =
    eid === 'production_fire' || eid === 'dependency' ? 'fire' :
    ['ethics_email','impact_email'].includes(eid) ? 'email' :
    eid === 'engagement_survey' ? 'survey' :
    eid === 'on_call' ? 'fire' :
    eid === 'pivot' || eid === 'requirements_changed' ? 'pivot' :
    eid === 'tickets_down' || eid === 'network_down' ? 'down' :
    eid === 'broken_package' ? 'sdk' :
    'code';
  const intruder =
    eid === 'shoulder_tap' ? { type: 'brad', say: '"Wait til I tell you about Ojai..."' } :
    eid === 'scope_change' ? { type: 'marcus', say: '"Tiny tweak — crypto tipping?"' } :
    eid === 'refactor_bumped' ? { type: 'manager', say: '"Need to deprio the refactor..."' } :
    eid === 'hq_drop' ? { type: 'manager', say: '"Great learning op!"' } :
    eid === 'loud_sales_call' ? { type: 'generic', say: '"...synergy at scale, right?"' } :
    eid === 'pivot' ? { type: 'marcus', say: '"...different direction. Park what you have."' } :
    eid === 'requirements_changed' ? { type: 'marcus', say: '"reqs are kinda different now"' } :
    null;

  return (
    <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
      <rect x="0" y="0" width="400" height="135" fill={C.bg}/>
      <rect x="0" y="135" width="400" height="45" fill={C.surface}/>
      <line x1="0" y1="135" x2="400" y2="135" stroke={C.borderHi} strokeWidth="0.5"/>

      {/* Window */}
      <rect x="22" y="22" width="78" height="60" fill="none" stroke={C.borderHi} strokeWidth="0.8"/>
      <line x1="61" y1="22" x2="61" y2="82" stroke={C.borderHi} strokeWidth="0.5"/>
      <line x1="22" y1="52" x2="100" y2="52" stroke={C.borderHi} strokeWidth="0.5"/>
      <text x="61" y="92" textAnchor="middle" fontSize="4" fontFamily={FONT} fill={C.textDimmer}>SOUTH FACING</text>

      {/* Plant */}
      <g transform="translate(345 100)">
        <rect x="-6" y="0" width="12" height="8" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.5"/>
        <path d="M 0 0 C -4 -8 -3 -14 0 -16 C 3 -14 4 -8 0 0" fill="none" stroke={C.sageDim} strokeWidth="0.6"/>
      </g>

      {/* Your desk - big in foreground */}
      <g transform="translate(200 132) scale(2.1)">
        <Desk x={0} y={0} you screen={screen}/>
      </g>

      {/* Coffee mug */}
      <g transform="translate(150 122)">
        <rect x="-3" y="-4" width="6" height="6" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.7"/>
        <path d="M 3 -2.5 Q 5.5 0 3 2" fill="none" stroke={C.borderHi} strokeWidth="0.7"/>
        <line x1="-2" y1="-3.5" x2="2" y2="-3.5" stroke={C.amber} strokeWidth="0.6"/>
      </g>

      {/* You at desk */}
      <Person x={200} y={146} type="you" scale={1.2}/>

      {/* Intruder */}
      {intruder && (
        <>
          <Person x={285} y={150} type={intruder.type} scale={1.2} alert/>
          <SpeechBubble x={235} y={88} text={intruder.say} w={120}/>
        </>
      )}

      {/* Fire alert overlay */}
      {(eid === 'production_fire' || eid === 'on_call' || eid === 'dependency') && (
        <>
          <text x="200" y="48" textAnchor="middle" fontSize="18" fill={C.rust}>⚠</text>
          <text x="200" y="65" textAnchor="middle" fontSize="6" fontFamily={FONT} fill={C.rust} fontWeight="700" letterSpacing="2">PRODUCTION INCIDENT</text>
        </>
      )}

      {/* HQ box */}
      {eid === 'hq_drop' && (
        <g transform="translate(125 135)">
          <rect x="-14" y="-18" width="28" height="22" fill={C.surface2} stroke={C.rust} strokeWidth="1.2"/>
          <line x1="-14" y1="-9" x2="14" y2="-9" stroke={C.rust} strokeWidth="0.6"/>
          <line x1="0" y1="-18" x2="0" y2="4" stroke={C.rust} strokeWidth="0.6"/>
          <text x="0" y="-12" textAnchor="middle" fontSize="3.5" fontFamily={FONT} fill={C.rust} fontWeight="700">FROM HQ</text>
          <text x="0" y="-3" textAnchor="middle" fontSize="2.4" fontFamily={FONT} fill={C.textDim}>"FRAGILE"</text>
        </g>
      )}

      {/* CEO idea ping */}
      {eid === 'ceo_idea' && (
        <SpeechBubble x={70} y={55} text='"We should do this. By next week?"' w={170}/>
      )}

      <text x="395" y="14" textAnchor="end" fontSize="4.5" fontFamily={FONT} fill={C.textDimmer}>JARED'S DESK · OPEN PLAN</text>
      {debt > 70 && (
        <text x="10" y="172" fontSize="4.5" fontFamily={FONT} fill={C.rust} letterSpacing="1">CODEBASE STATUS: FRAGILE</text>
      )}
    </svg>
  );
};
