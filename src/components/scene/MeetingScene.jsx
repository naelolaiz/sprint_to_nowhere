// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';
import { Person } from './Person.jsx';
import { SpeechBubble } from '../common/SpeechBubble.jsx';

export const MeetingScene = ({ event }) => {
  const eid = event?.id;
  const others =
    eid === 'one_on_one' ? [{ type: 'manager', label: 'manager', x: 250 }] :
    eid === 'quick_sync' ? [{ type: 'marcus', label: 'Marcus (PM)', x: 250 }] :
    eid === 'initiative_cancelled' ? [] :
    eid === 'standup_debug' ? [
      { type: 'generic', label: '', x: 240 },
      { type: 'marcus', label: 'Marcus', x: 285 },
    ] :
    eid === 'interview' ? [{ type: 'generic', label: 'candidate', x: 250 }] :
    eid === 'new_hire' ? [{ type: 'generic', label: 'new hire', x: 250 }] :
    eid === 'backlog_refinement' ? [
      { type: 'marcus', label: 'Marcus', x: 215 },
      { type: 'brad', label: 'sales', x: 260 },
      { type: 'generic', label: '', x: 305 },
    ] :
    eid === 'daily_standup' ? [
      { type: 'marcus', label: 'Marcus', x: 220 },
      { type: 'brad', label: '', x: 265 },
      { type: 'generic', label: '', x: 305 },
    ] :
    eid === 'meeting_cascade' ? [
      { type: 'marcus', label: 'Marcus', x: 215 },
      { type: 'brad', label: 'sales (leaving)', x: 260 },
      { type: 'generic', label: 'platform', x: 305 },
    ] :
    [{ type: 'generic', label: '', x: 250 }];

  const wbContent =
    eid === 'one_on_one' ? '"YOUR GROWTH"' :
    eid === 'quick_sync' ? 'AGENDA: ?' :
    eid === 'initiative_cancelled' ? 'INITIATIVE' :
    eid === 'interview' ? 'BEHAVIORAL Qs' :
    eid === 'new_hire' ? 'WELCOME!' :
    eid === 'standup_debug' ? 'STANDUP' :
    eid === 'backlog_refinement' ? 'STORY POINTS?' :
    eid === 'daily_standup' ? 'YESTERDAY/TODAY/BLOCKERS' :
    eid === 'meeting_cascade' ? 'AGENDA: ?' :
    'Q3 GOALS';

  return (
    <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
      <rect x="20" y="20" width="360" height="140" fill={C.surface} opacity="0.4" stroke={C.borderHi} strokeWidth="1"/>

      {/* Whiteboard */}
      <g>
        <rect x="120" y="30" width="160" height="44" fill="#0d0e10" stroke={C.borderHi} strokeWidth="0.8"/>
        <text x="200" y="55" textAnchor="middle" fontSize="9" fontFamily={FONT} fill={eid === 'initiative_cancelled' ? C.rust : C.amber} fontWeight="700">{wbContent}</text>
        {eid === 'initiative_cancelled' && (
          <line x1="135" y1="62" x2="265" y2="42" stroke={C.rust} strokeWidth="2"/>
        )}
        {eid === 'one_on_one' && (
          <text x="200" y="68" textAnchor="middle" fontSize="4" fontFamily={FONT} fill={C.textDim}>(reads aloud)</text>
        )}
      </g>

      {/* Conference table */}
      <ellipse cx="200" cy="125" rx="105" ry="22" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.8"/>

      {/* You */}
      <Person x={155} y={125} type="you" scale={1.4} label="JARED"/>

      {/* Others */}
      {others.map((o, i) => (
        <Person key={i} x={o.x} y={125} type={o.type} scale={1.4} label={o.label}/>
      ))}

      {eid === 'initiative_cancelled' && (
        <text x="290" y="128" textAnchor="middle" fontSize="6" fontFamily={FONT} fill={C.textDimmer} fontStyle="italic">(no one came)</text>
      )}

      <text x="30" y="34" fontSize="5" fontFamily={FONT} fill={C.textDimmer} letterSpacing="1">
        {eid === 'one_on_one' ? 'ROOM B · "INNOVATE" · 1:1 RECURRING' :
         eid === 'initiative_cancelled' ? 'ROOM A · POST-MORTEM' :
         'ROOM A · "ASCEND" · 11:00–11:15'}
      </text>
      <text x="395" y="14" textAnchor="end" fontSize="4.5" fontFamily={FONT} fill={C.textDimmer}>MEETING IN PROGRESS</text>
    </svg>
  );
};
