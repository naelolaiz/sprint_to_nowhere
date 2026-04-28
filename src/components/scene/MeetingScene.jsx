// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';
import { Person } from './Person.jsx';

export const MeetingScene = ({ event }) => {
  const eid = event?.id;

  // WHO is in the room (or on the call). The dialog body owns what they SAY.
  const others =
    eid === 'one_on_one' ? [{ type: 'manager', label: 'manager', x: 250 }] :
    eid === 'quick_sync' ? [{ type: 'marcus', label: 'Marcus (PM)', x: 250, mood: 'phone' }] :
    eid === 'initiative_cancelled' ? [] :
    eid === 'standup_debug' ? [
      { type: 'engineer', label: '', x: 240, mood: 'tired' },
      { type: 'marcus', label: 'Marcus', x: 285 },
    ] :
    eid === 'interview' ? [{ type: 'intern', label: 'candidate', x: 250 }] :
    eid === 'new_hire' ? [{ type: 'intern', label: 'new hire', x: 250 }] :
    eid === 'backlog_refinement' ? [
      { type: 'marcus', label: 'Marcus', x: 215 },
      { type: 'doug', label: 'Doug', x: 260 },
      { type: 'engineer', label: '', x: 305, mood: 'tired' },
    ] :
    eid === 'daily_standup' ? [
      { type: 'marcus', label: 'Marcus', x: 215 },
      { type: 'brad', label: 'Brad', x: 258, mood: 'phone' },
      { type: 'doug', label: 'Doug', x: 300 },
      { type: 'engineer', label: '', x: 342, mood: 'sleep' },
    ] :
    eid === 'meeting_cascade' ? [
      { type: 'marcus', label: 'Marcus', x: 215 },
      { type: 'brad', label: 'sales (leaving)', x: 260, mood: 'phone' },
      { type: 'engineer', label: 'platform', x: 305 },
    ] :
    eid === 'requirements_changed' ? [
      { type: 'marcus', label: 'Marcus', x: 215 },
      { type: 'engineer', label: 'designer', x: 260 },
      { type: 'vp', label: 'design lead', x: 305 },
    ] :
    [{ type: 'generic', label: '', x: 250 }];

  const wbContent =
    eid === 'one_on_one' ? '"YOUR GROWTH"' :
    eid === 'quick_sync' ? 'AGENDA: ?' :
    eid === 'initiative_cancelled' ? 'INITIATIVE' :
    eid === 'interview' ? 'BEHAVIORAL Qs' :
    eid === 'new_hire' ? 'WELCOME!' :
    eid === 'standup_debug' ? 'STACK TRACE 🔥' :
    eid === 'backlog_refinement' ? 'STORY POINTS = ?' :
    eid === 'daily_standup' ? 'YESTERDAY/TODAY/BLOCKERS/VIBES' :
    eid === 'meeting_cascade' ? 'AGENDA: TBD' :
    eid === 'requirements_changed' ? 'v3 — final final' :
    'Q3 GOALS';

  const wbColor =
    eid === 'initiative_cancelled' ? C.rust :
    eid === 'standup_debug' ? C.rust :
    eid === 'requirements_changed' ? C.burnout :
    C.amber;

  const banner =
    eid === 'one_on_one' ? 'ROOM B · "INNOVATE" · 1:1 RECURRING · 30 MIN' :
    eid === 'initiative_cancelled' ? 'ROOM A · POST-MORTEM · NO QUORUM' :
    eid === 'daily_standup' ? 'ZOOM · 15 MIN ON CAL · 22 MIN IN' :
    eid === 'backlog_refinement' ? 'ZOOM · 90 MIN · 47 TICKETS LEFT' :
    eid === 'meeting_cascade' ? 'ROOM A · 30 MIN · STARTED 23 LATE' :
    eid === 'requirements_changed' ? 'FIGMA HUDDLE · 7 ATTENDEES · v3 FINAL' :
    eid === 'interview' ? 'ROOM C · LOOP INTERVIEW · ROUND 5/5' :
    eid === 'new_hire' ? 'ROOM B · ONBOARDING · WEEK 2' :
    eid === 'standup_debug' ? 'ZOOM · STANDUP · 41 MIN IN' :
    'ROOM A · "ASCEND" · 11:00–11:15';

  return (
    <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="meeting-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.surface}/>
          <stop offset="100%" stopColor={C.bg}/>
        </linearGradient>
        <linearGradient id="meeting-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.surface2}/>
          <stop offset="100%" stopColor={C.bg}/>
        </linearGradient>
        <pattern id="ceiling-tiles" width="20" height="10" patternUnits="userSpaceOnUse">
          <rect width="20" height="10" fill={C.surface}/>
          <line x1="0" y1="0" x2="20" y2="0" stroke={C.border} strokeWidth="0.4"/>
          <line x1="0" y1="0" x2="0" y2="10" stroke={C.border} strokeWidth="0.4"/>
        </pattern>
      </defs>

      {/* Ceiling */}
      <rect x="0" y="0" width="400" height="14" fill="url(#ceiling-tiles)"/>
      {/* Recessed lights */}
      {[80, 200, 320].map((cx, i) => (
        <g key={i}>
          <rect x={cx - 10} y="3" width="20" height="3" fill={C.amber} opacity="0.6"/>
          <rect x={cx - 9} y="3.5" width="18" height="2" fill="#fff" opacity="0.15"/>
        </g>
      ))}

      {/* Wall */}
      <rect x="0" y="14" width="400" height="125" fill="url(#meeting-wall)"/>
      {/* Wall trim */}
      <line x1="0" y1="14" x2="400" y2="14" stroke={C.borderHi} strokeWidth="0.6"/>
      <line x1="0" y1="138" x2="400" y2="138" stroke={C.borderHi} strokeWidth="0.5"/>

      {/* Floor */}
      <rect x="0" y="138" width="400" height="42" fill="url(#meeting-floor)"/>
      {/* Carpet seams */}
      {[148, 158, 168].map((y, i) => (
        <line key={i} x1="0" y1={y} x2="400" y2={y} stroke={C.surface2} strokeWidth="0.15" opacity="0.7"/>
      ))}

      {/* Glass wall pane on the left (conference room is glass-walled) */}
      <g opacity="0.35">
        <rect x="20" y="20" width="60" height="115" fill={C.borderHi} opacity="0.1" stroke={C.borderHi} strokeWidth="0.5"/>
        <line x1="50" y1="20" x2="50" y2="135" stroke={C.borderHi} strokeWidth="0.4"/>
        {/* Reflection streak */}
        <line x1="28" y1="30" x2="42" y2="80" stroke="#fff" strokeWidth="0.4" opacity="0.15"/>
        {/* Hint of an open-plan figure walking past */}
        <circle cx="40" cy="100" r="2" fill={C.textDimmer} opacity="0.5"/>
        <line x1="40" y1="102" x2="40" y2="115" stroke={C.textDimmer} strokeWidth="0.6" opacity="0.5"/>
      </g>

      {/* Wall art: a framed company values poster */}
      <g transform="translate(330 30)">
        <rect x="0" y="0" width="48" height="32" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.5"/>
        <rect x="2" y="2" width="44" height="28" fill="#0a0a0a"/>
        <text x="24" y="11" textAnchor="middle" fontSize="3" fontFamily={FONT} fill={C.amber} fontWeight="700">BOLD</text>
        <text x="24" y="17" textAnchor="middle" fontSize="3" fontFamily={FONT} fill={C.amber} fontWeight="700">FRUGAL</text>
        <text x="24" y="23" textAnchor="middle" fontSize="3" fontFamily={FONT} fill={C.amber} fontWeight="700">BIAS / ACTION</text>
        <text x="24" y="28" textAnchor="middle" fontSize="2.2" fontFamily={FONT} fill={C.textDimmer}>(Q3 refresh)</text>
      </g>

      {/* Whiteboard */}
      <g transform="translate(115 28)">
        {/* frame */}
        <rect x="-3" y="-3" width="176" height="60" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.5"/>
        {/* board */}
        <rect x="0" y="0" width="170" height="54" fill="#0d0e10" stroke={C.borderHi} strokeWidth="0.6"/>
        {/* main heading */}
        <text x="85" y="14" textAnchor="middle" fontSize="9" fontFamily={FONT} fill={wbColor} fontWeight="700">{wbContent}</text>
        {/* Marker tray + pens */}
        <rect x="0" y="56" width="170" height="2" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.3"/>
        <rect x="6" y="55" width="10" height="3" fill={C.amber}/>
        <rect x="20" y="55" width="10" height="3" fill={C.sage}/>
        <rect x="34" y="55" width="10" height="3" fill={C.rust}/>
        <rect x="48" y="55" width="10" height="3" fill={C.blue}/>
        {/* Sticky notes scattered on the board */}
        <rect x="6" y="22" width="14" height="11" fill={C.amber} opacity="0.7" transform="rotate(-3 13 27)"/>
        <text x="13" y="29" textAnchor="middle" fontSize="2.2" fontFamily={FONT} fill="#000" transform="rotate(-3 13 29)" fontWeight="700">FEAT-12</text>
        <rect x="22" y="24" width="14" height="11" fill={C.rust} opacity="0.7" transform="rotate(2 29 30)"/>
        <text x="29" y="31" textAnchor="middle" fontSize="2.2" fontFamily={FONT} fill="#000" transform="rotate(2 29 31)" fontWeight="700">BUG-7</text>
        <rect x="38" y="22" width="14" height="11" fill={C.sage} opacity="0.7" transform="rotate(-1 45 27)"/>
        <text x="45" y="29" textAnchor="middle" fontSize="2.2" fontFamily={FONT} fill="#000" transform="rotate(-1 45 29)" fontWeight="700">REF-3</text>
        {/* Annotations */}
        <text x="6" y="42" fontSize="2.4" fontFamily={FONT} fill={C.text}>velocity goal:</text>
        <text x="34" y="42" fontSize="2.4" fontFamily={FONT} fill={C.amber}>aspirational</text>
        <text x="6" y="48" fontSize="2.4" fontFamily={FONT} fill={C.text}>capacity:</text>
        <text x="28" y="48" fontSize="2.4" fontFamily={FONT} fill={C.rust}>vibes</text>
        {/* Cancellation slash */}
        {eid === 'initiative_cancelled' && (
          <line x1="6" y1="40" x2="160" y2="14" stroke={C.rust} strokeWidth="2"/>
        )}
        {/* Annotations specific to events */}
        {eid === 'requirements_changed' && (
          <text x="85" y="32" textAnchor="middle" fontSize="3" fontFamily={FONT} fill={C.textDim}>(file 14 was also "final final")</text>
        )}
      </g>

      {/* Conference table — drawn first, then chairs+people */}
      <ellipse cx="200" cy="125" rx="115" ry="22" fill="#000" opacity="0.25"/>
      <ellipse cx="200" cy="123" rx="115" ry="22" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.8"/>
      {/* Wood grain */}
      {[105, 121, 137].map((y, i) => (
        <ellipse key={i} cx="200" cy={y} rx="100" ry="0.6" fill={C.borderHi} opacity="0.3"/>
      ))}

      {/* Table props */}
      {/* Spider phone in the middle */}
      <g transform="translate(200 122)">
        <ellipse cx="0" cy="0" rx="8" ry="4" fill={C.surface} stroke={C.borderHi} strokeWidth="0.5"/>
        <ellipse cx="0" cy="-0.6" rx="6" ry="3" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.3"/>
        {/* Dial pad dots */}
        {[-3, 0, 3].map((dx, ci) => (
          [-1, 0.5].map((dy, ri) => (
            <circle key={`${ci}-${ri}`} cx={dx} cy={dy} r="0.4" fill={C.amberDim}/>
          ))
        ))}
      </g>

      {/* Laptops/notebooks */}
      <g transform="translate(160 122)">
        <rect x="-5" y="-2" width="10" height="5" fill="#0a0a0a" stroke={C.border} strokeWidth="0.3"/>
        <rect x="-5.5" y="3" width="11" height="0.6" fill={C.surface} stroke={C.borderHi} strokeWidth="0.2"/>
      </g>
      <g transform="translate(240 122)">
        <rect x="-5" y="-2" width="10" height="5" fill="#0a0a0a" stroke={C.border} strokeWidth="0.3"/>
        <line x1="-4" y1="-1" x2="0" y2="-1" stroke={C.amber} strokeWidth="0.3"/>
        <line x1="-4" y1="0" x2="3" y2="0" stroke={C.text} strokeWidth="0.3"/>
        <line x1="-4" y1="1" x2="-1" y2="1" stroke={C.sage} strokeWidth="0.3"/>
        <rect x="-5.5" y="3" width="11" height="0.6" fill={C.surface} stroke={C.borderHi} strokeWidth="0.2"/>
      </g>
      {/* Coffee mugs */}
      {[145, 175, 225, 275].map((mx, i) => (
        <g key={i} transform={`translate(${mx} 122)`}>
          <rect x="-1.5" y="-1.6" width="3" height="2.2" fill={C.surface} stroke={C.borderHi} strokeWidth="0.25"/>
        </g>
      ))}
      {/* Water glass */}
      <g transform="translate(290 121)">
        <rect x="-1.4" y="-2" width="2.8" height="3" fill={C.blue} opacity="0.25" stroke={C.borderHi} strokeWidth="0.2"/>
      </g>

      {/* You */}
      <Person x={155} y={125} type="you" scale={1.4} label="JARED" seated/>

      {/* Others */}
      {others.map((o, i) => (
        <Person key={i} x={o.x} y={125} type={o.type} scale={1.4} label={o.label} seated mood={o.mood}/>
      ))}

      {/* Empty chair, implied viewer position on the near side */}
      <g transform="translate(200 148)">
        <rect x="-6" y="0" width="12" height="3" fill={C.surface} stroke={C.borderHi} strokeWidth="0.4"/>
        <line x1="-5" y1="3" x2="-5" y2="7" stroke={C.borderHi} strokeWidth="0.4"/>
        <line x1="5" y1="3" x2="5" y2="7" stroke={C.borderHi} strokeWidth="0.4"/>
      </g>

      {/* "no one came" annotation for cancelled-initiative post-mortem */}
      {eid === 'initiative_cancelled' && (
        <>
          <text x="290" y="128" textAnchor="middle" fontSize="6" fontFamily={FONT} fill={C.textDimmer} fontStyle="italic">(no one came)</text>
          {/* Empty chairs */}
          {[235, 265, 295, 325].map((cx, i) => (
            <g key={i} transform={`translate(${cx} 148)`}>
              <rect x="-5" y="0" width="10" height="3" fill={C.surface} stroke={C.borderHi} strokeWidth="0.3"/>
            </g>
          ))}
        </>
      )}

      {/* Floating phone artifact for daily_standup */}
      {eid === 'daily_standup' && (
        <g transform="translate(248 121)">
          <rect x="-2.4" y="-1.6" width="4.8" height="2.8" fill="#0a0a0a" stroke={C.amberDim} strokeWidth="0.3"/>
          <text x="0" y="0.6" textAnchor="middle" fontSize="1.4" fontFamily={FONT} fill={C.amber}>r/pickleball</text>
        </g>
      )}

      {/* Loom-replay screen for standup-debug */}
      {eid === 'standup_debug' && (
        <g transform="translate(335 122)">
          <rect x="-7" y="-3" width="14" height="9" fill="#0a0a0a" stroke={C.rust} strokeWidth="0.4"/>
          <text x="0" y="0.5" textAnchor="middle" fontSize="2" fontFamily={FONT} fill={C.rust}>TypeError</text>
          <text x="0" y="3" textAnchor="middle" fontSize="1.6" fontFamily={FONT} fill={C.rustDim}>at line 47</text>
          <circle cx="-5.5" cy="-2" r="0.6" fill={C.rust}>
            <animate attributeName="opacity" values="0.4;1;0.4" dur="0.9s" repeatCount="indefinite"/>
          </circle>
        </g>
      )}

      {/* Headers */}
      <text x="20" y="34" fontSize="5" fontFamily={FONT} fill={C.textDimmer} letterSpacing="1">{banner}</text>
      <text x="395" y="14" textAnchor="end" fontSize="4.5" fontFamily={FONT} fill={C.textDimmer}>MEETING IN PROGRESS</text>

      {/* Footer */}
      <text x="395" y="172" textAnchor="end" fontSize="4" fontFamily={FONT} fill={C.textDimmer}>
        {eid === 'daily_standup' ? '4 PEOPLE TYPING IN CHAT' :
         eid === 'backlog_refinement' ? 'BIMODAL VOTE DISTRIBUTION DETECTED' :
         eid === 'meeting_cascade' ? '14 MIN OVER · NEXT MEETING IS NOW' :
         eid === 'requirements_changed' ? 'FIGMA HAS UNSAVED CHANGES' :
         'AUDIO: ✓ · VIDEO: ✓ · CHAT: 47 UNREAD'}
      </text>
    </svg>
  );
};
