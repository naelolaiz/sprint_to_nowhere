// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';
import { Person } from './Person.jsx';
import { SkyPane } from './Sky.jsx';
import { tr } from '../../i18n/index.js';

// Seats on the far side of the table, left to right. You sit on the near
// side, back to the viewer, which is also where the empty chair is.
const FAR_SEATS = [140, 200, 260, 318];

const ChairBack = ({ x, y, w = 14, h = 14, front = false }) => (
  <g>
    <rect x={x - w / 2} y={y} width={w} height={h} rx="2.5" fill={front ? C.surface2 : C.surface} stroke={C.borderHi} strokeWidth="0.5"/>
    <rect x={x - w / 2 + 2} y={y + 2} width={w - 4} height={h - 5} rx="1.5" fill="none" stroke={C.border} strokeWidth="0.4"/>
  </g>
);

const NameTent = ({ x, y, name, color = C.amberDim }) => name ? (
  <g transform={`translate(${x} ${y})`}>
    <polygon points="-9,0 9,0 7,-4 -7,-4" fill={C.surface} stroke={C.borderHi} strokeWidth="0.3"/>
    <text x="0" y="-1.1" textAnchor="middle" fontSize="2.4" fontFamily={FONT} fill={color} letterSpacing="0.3">{name}</text>
  </g>
) : null;

const Laptop = ({ x, y, lit = true }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x="-5" y="-4" width="10" height="5.5" fill="#0a0a0a" stroke={C.border} strokeWidth="0.3"/>
    {lit && <line x1="-4" y1="-2.6" x2="1" y2="-2.6" stroke={C.amber} strokeWidth="0.3"/>}
    {lit && <line x1="-4" y1="-1.6" x2="3" y2="-1.6" stroke={C.text} strokeWidth="0.3"/>}
    {lit && <line x1="-4" y1="-0.6" x2="-1" y2="-0.6" stroke={C.sage} strokeWidth="0.3"/>}
    <rect x="-5.5" y="1.5" width="11" height="0.7" fill={C.surface} stroke={C.borderHi} strokeWidth="0.2"/>
  </g>
);

const Mug = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x="-1.6" y="-2.4" width="3.2" height="2.6" fill={C.surface} stroke={C.borderHi} strokeWidth="0.25"/>
    <path d="M 1.6 -1.8 Q 2.8 -1.2 1.6 -0.4" fill="none" stroke={C.borderHi} strokeWidth="0.25"/>
  </g>
);

export const MeetingScene = ({ event, clock = 10 * 60 }) => {
  const eid = event?.id;

  // WHO is across the table. The dialog body owns what they SAY.
  const others =
    eid === 'one_on_one' ? [{ type: 'manager', name: 'MANAGER' }] :
    eid === 'quick_sync' ? [{ type: 'marcus', name: 'MARCUS · PM', mood: 'phone' }] :
    eid === 'initiative_cancelled' ? [] :
    eid === 'standup_debug' ? [
      { type: 'engineer', name: '', mood: 'tired' },
      { type: 'marcus', name: 'MARCUS' },
    ] :
    eid === 'interview' ? [{ type: 'intern', name: 'CANDIDATE' }] :
    eid === 'new_hire' ? [{ type: 'intern', name: 'NEW HIRE' }] :
    eid === 'backlog_refinement' ? [
      { type: 'marcus', name: 'MARCUS' },
      { type: 'doug', name: 'DOUG' },
      { type: 'engineer', name: '', mood: 'tired' },
    ] :
    eid === 'daily_standup' ? [
      { type: 'marcus', name: 'MARCUS' },
      { type: 'brad', name: 'BRAD', mood: 'phone' },
      { type: 'doug', name: 'DOUG' },
      { type: 'engineer', name: '', mood: 'sleep' },
    ] :
    eid === 'meeting_cascade' ? [
      { type: 'marcus', name: 'MARCUS' },
      { type: 'brad', name: tr`SALES (LEAVING)`, mood: 'phone' },
      { type: 'engineer', name: tr`PLATFORM` },
    ] :
    eid === 'requirements_changed' ? [
      { type: 'marcus', name: 'MARCUS' },
      { type: 'engineer', name: tr`DESIGNER` },
      { type: 'vp', name: tr`DESIGN LEAD` },
    ] :
    [{ type: 'generic', name: '' }];

  // Fill the seats from the middle out so a 1:1 is not two people at opposite
  // ends of a six-seat table (that is a different, sadder meeting).
  const seatOrder = others.length === 1 ? [1] : others.length === 2 ? [1, 2] : others.length === 3 ? [0, 1, 2] : [0, 1, 2, 3];
  const seated = others.map((o, i) => ({ ...o, x: FAR_SEATS[seatOrder[i]] }));
  const emptyFar = FAR_SEATS.filter(x => !seated.some(o => o.x === x));

  const wbContent =
    eid === 'one_on_one' ? tr`"YOUR GROWTH"` :
    eid === 'quick_sync' ? tr`AGENDA: ?` :
    eid === 'initiative_cancelled' ? tr`INITIATIVE` :
    eid === 'interview' ? tr`BEHAVIORAL Qs` :
    eid === 'new_hire' ? tr`WELCOME!` :
    eid === 'standup_debug' ? tr`STACK TRACE 🔥` :
    eid === 'backlog_refinement' ? tr`STORY POINTS = ?` :
    eid === 'daily_standup' ? tr`YESTERDAY / TODAY / VIBES` :
    eid === 'meeting_cascade' ? tr`AGENDA: TBD` :
    eid === 'requirements_changed' ? tr`v3 — final final` :
    tr`Q3 GOALS`;

  const wbColor =
    eid === 'initiative_cancelled' ? C.rust :
    eid === 'standup_debug' ? C.rust :
    eid === 'requirements_changed' ? C.burnout :
    C.amber;

  const banner =
    eid === 'one_on_one' ? tr`ROOM B · "INNOVATE" · 1:1 RECURRING · 30 MIN` :
    eid === 'initiative_cancelled' ? tr`ROOM A · POST-MORTEM · NO QUORUM` :
    eid === 'daily_standup' ? tr`ROOM A · STANDUP · 15 MIN ON CAL · 22 MIN IN` :
    eid === 'backlog_refinement' ? tr`ROOM A · REFINEMENT · 90 MIN · 47 TICKETS LEFT` :
    eid === 'meeting_cascade' ? tr`ROOM A · 30 MIN · STARTED 23 LATE` :
    eid === 'requirements_changed' ? tr`ROOM B · FIGMA HUDDLE · 7 ATTENDEES · v3 FINAL` :
    eid === 'interview' ? tr`ROOM C · LOOP INTERVIEW · ROUND 5/5` :
    eid === 'new_hire' ? tr`ROOM B · ONBOARDING · WEEK 2` :
    eid === 'standup_debug' ? tr`ROOM A · STANDUP · 41 MIN IN` :
    tr`ROOM A · "ASCEND" · 11:00–11:15`;

  const footer =
    eid === 'daily_standup' ? tr`4 PEOPLE TYPING IN CHAT` :
    eid === 'backlog_refinement' ? tr`BIMODAL VOTE DISTRIBUTION DETECTED` :
    eid === 'meeting_cascade' ? tr`14 MIN OVER · NEXT MEETING IS NOW` :
    eid === 'requirements_changed' ? tr`FIGMA HAS UNSAVED CHANGES` :
    tr`AUDIO: ✓ · VIDEO: ✓ · CHAT: 47 UNREAD`;

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
        <linearGradient id="meeting-table" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3426"/>
          <stop offset="100%" stopColor={C.surface2}/>
        </linearGradient>
        <pattern id="ceiling-tiles" width="20" height="10" patternUnits="userSpaceOnUse">
          <rect width="20" height="10" fill={C.surface}/>
          <line x1="0" y1="0" x2="20" y2="0" stroke={C.border} strokeWidth="0.4"/>
          <line x1="0" y1="0" x2="0" y2="10" stroke={C.border} strokeWidth="0.4"/>
        </pattern>
      </defs>

      {/* Ceiling */}
      <rect x="0" y="0" width="400" height="14" fill="url(#ceiling-tiles)"/>
      {[80, 200, 320].map((cx, i) => (
        <g key={i}>
          <rect x={cx - 10} y="3" width="20" height="3" fill={C.amber} opacity="0.6"/>
          <rect x={cx - 9} y="3.5" width="18" height="2" fill="#fff" opacity="0.15"/>
        </g>
      ))}

      {/* Wall and floor */}
      <rect x="0" y="14" width="400" height="124" fill="url(#meeting-wall)"/>
      <line x1="0" y1="14" x2="400" y2="14" stroke={C.borderHi} strokeWidth="0.6"/>
      <rect x="0" y="138" width="400" height="42" fill="url(#meeting-floor)"/>
      <line x1="0" y1="138" x2="400" y2="138" stroke={C.borderHi} strokeWidth="0.5"/>
      {[150, 162, 174].map((y, i) => (
        <line key={i} x1="0" y1={y} x2="400" y2={y} stroke={C.surface2} strokeWidth="0.15" opacity="0.7"/>
      ))}

      {/* Glass wall on the left, open plan beyond it */}
      <g opacity="0.4">
        <rect x="0" y="20" width="40" height="118" fill={C.borderHi} opacity="0.08" stroke={C.borderHi} strokeWidth="0.5"/>
        <line x1="20" y1="20" x2="20" y2="138" stroke={C.borderHi} strokeWidth="0.4"/>
        <line x1="6" y1="30" x2="16" y2="80" stroke="#fff" strokeWidth="0.4" opacity="0.15"/>
        <circle cx="12" cy="100" r="2" fill={C.textDimmer} opacity="0.5"/>
        <line x1="12" y1="102" x2="12" y2="115" stroke={C.textDimmer} strokeWidth="0.6" opacity="0.5"/>
      </g>

      {/* Framed company values, between the glass and the whiteboard */}
      <g transform="translate(46 22)">
        <rect x="0" y="0" width="46" height="32" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.5"/>
        <rect x="2" y="2" width="42" height="28" fill="#0a0a0a"/>
        <text x="23" y="11" textAnchor="middle" fontSize="3" fontFamily={FONT} fill={C.amber} fontWeight="700">{tr`BOLD`}</text>
        <text x="23" y="17" textAnchor="middle" fontSize="3" fontFamily={FONT} fill={C.amber} fontWeight="700">{tr`FRUGAL`}</text>
        <text x="23" y="23" textAnchor="middle" fontSize="3" fontFamily={FONT} fill={C.amber} fontWeight="700">{tr`BIAS / ACTION`}</text>
        <text x="23" y="28" textAnchor="middle" fontSize="2.2" fontFamily={FONT} fill={C.textDimmer}>{tr`(Q3 refresh)`}</text>
      </g>

      {/* Whiteboard */}
      <g transform="translate(100 18)">
        <rect x="-3" y="-3" width="156" height="54" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.5"/>
        <rect x="0" y="0" width="150" height="48" fill="#0d0e10" stroke={C.borderHi} strokeWidth="0.6"/>
        <text x="75" y="13" textAnchor="middle" fontSize="7.5" fontFamily={FONT} fill={wbColor} fontWeight="700">{wbContent}</text>
        <rect x="0" y="50" width="150" height="2" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.3"/>
        <rect x="6" y="49" width="10" height="3" fill={C.amber}/>
        <rect x="20" y="49" width="10" height="3" fill={C.sage}/>
        <rect x="34" y="49" width="10" height="3" fill={C.rust}/>
        <rect x="48" y="49" width="10" height="3" fill={C.blue}/>
        <rect x="6" y="20" width="14" height="11" fill={C.amber} opacity="0.7" transform="rotate(-3 13 25)"/>
        <text x="13" y="27" textAnchor="middle" fontSize="2.2" fontFamily={FONT} fill="#000" transform="rotate(-3 13 27)" fontWeight="700">FEAT-12</text>
        <rect x="22" y="22" width="14" height="11" fill={C.rust} opacity="0.7" transform="rotate(2 29 28)"/>
        <text x="29" y="29" textAnchor="middle" fontSize="2.2" fontFamily={FONT} fill="#000" transform="rotate(2 29 29)" fontWeight="700">BUG-7</text>
        <rect x="38" y="20" width="14" height="11" fill={C.sage} opacity="0.7" transform="rotate(-1 45 25)"/>
        <text x="45" y="27" textAnchor="middle" fontSize="2.2" fontFamily={FONT} fill="#000" transform="rotate(-1 45 27)" fontWeight="700">REF-3</text>
        <text x="60" y="38" fontSize="2.4" fontFamily={FONT} fill={C.text}>{tr`velocity goal:`}</text>
        <text x="88" y="38" fontSize="2.4" fontFamily={FONT} fill={C.amber}>{tr`aspirational`}</text>
        <text x="60" y="44" fontSize="2.4" fontFamily={FONT} fill={C.text}>{tr`capacity:`}</text>
        <text x="82" y="44" fontSize="2.4" fontFamily={FONT} fill={C.rust}>{tr`vibes`}</text>
        {eid === 'initiative_cancelled' && (
          <line x1="6" y1="36" x2="144" y2="12" stroke={C.rust} strokeWidth="2"/>
        )}
        {eid === 'requirements_changed' && (
          <text x="75" y="30" textAnchor="middle" fontSize="3" fontFamily={FONT} fill={C.textDim}>{tr`(file 14 was also "final final")`}</text>
        )}
      </g>

      {/* Window on the right: the clock decides what is out there */}
      <g>
        <SkyPane id="meeting" x={262} y={18} w={126} h={50} clock={clock}/>
        <line x1="325" y1="18" x2="325" y2="68" stroke={C.borderHi} strokeWidth="0.5"/>
        <line x1="262" y1="43" x2="388" y2="43" stroke={C.borderHi} strokeWidth="0.5"/>
      </g>

      {/* Far side: chairs, then the people in them, then the table in front */}
      {seated.map((o, i) => <ChairBack key={`c${i}`} x={o.x} y={86}/>)}
      {emptyFar.map((x, i) => <ChairBack key={`e${i}`} x={x} y={86}/>)}
      {seated.map((o, i) => (
        <Person key={i} x={o.x} y={94} type={o.type} scale={1.25} label="" seated mood={o.mood}/>
      ))}

      {/* Conference table: far edge behind the laptops, near edge at your elbows */}
      <ellipse cx="200" cy="146" rx="160" ry="8" fill="#000" opacity="0.3"/>
      <path d="M 60 100 L 340 100 Q 352 100 356 108 L 370 136 Q 372 140 366 140 L 34 140 Q 28 140 30 136 L 44 108 Q 48 100 60 100 Z"
        fill="url(#meeting-table)" stroke={C.borderHi} strokeWidth="0.8"/>
      <path d="M 66 102 L 334 102" stroke="#fff" strokeWidth="0.5" opacity="0.08"/>
      {[112, 122, 132].map((y, i) => (
        <line key={i} x1={60 - (y - 100) * 0.3} y1={y} x2={340 + (y - 100) * 0.3} y2={y} stroke={C.borderHi} strokeWidth="0.25" opacity="0.35"/>
      ))}

      {/* On the table */}
      {seated.map((o, i) => <NameTent key={`n${i}`} x={o.x} y={109} name={o.name}/>)}
      {seated.map((o, i) => (
        o.type === 'engineer' || o.type === 'marcus'
          ? <Laptop key={`l${i}`} x={o.x + 1} y={117} lit={o.type === 'engineer'}/>
          : <Mug key={`m${i}`} x={o.x + 4} y={115}/>
      ))}
      <g transform="translate(200 125)">
        <ellipse cx="0" cy="0" rx="9" ry="4" fill={C.surface} stroke={C.borderHi} strokeWidth="0.5"/>
        <ellipse cx="0" cy="-0.6" rx="7" ry="3" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.3"/>
        {[-3, 0, 3].map((dx, ci) => (
          [-1, 0.5].map((dy, ri) => (
            <circle key={`${ci}-${ri}`} cx={dx} cy={dy} r="0.45" fill={C.amberDim}/>
          ))
        ))}
      </g>
      <Mug x={150} y={133}/>
      <g transform="translate(256 131)">
        <rect x="-1.4" y="-3" width="2.8" height="3.6" fill={C.blue} opacity="0.25" stroke={C.borderHi} strokeWidth="0.2"/>
      </g>

      {/* Brad's phone, face up, next to his mug */}
      {seated.filter(o => o.type === 'brad').map((o, i) => (
        <g key={i} transform={`translate(${o.x - 6} 117)`}>
          <rect x="-2.4" y="-1.6" width="4.8" height="2.8" fill="#0a0a0a" stroke={C.amberDim} strokeWidth="0.3"/>
          <text x="0" y="0.6" textAnchor="middle" fontSize="1.3" fontFamily={FONT} fill={C.amber}>r/pickleball</text>
        </g>
      ))}

      {/* Loom replay for the standup that became a debug session */}
      {eid === 'standup_debug' && (
        <g transform="translate(300 124)">
          <rect x="-8" y="-4" width="16" height="9" fill="#0a0a0a" stroke={C.rust} strokeWidth="0.4"/>
          <text x="0" y="-0.2" textAnchor="middle" fontSize="2.2" fontFamily={FONT} fill={C.rust}>TypeError</text>
          <text x="0" y="3" textAnchor="middle" fontSize="1.7" fontFamily={FONT} fill={C.rustDim}>{tr`at line 47`}</text>
          <circle cx="-6.5" cy="-2.6" r="0.6" fill={C.rust}>
            <animate attributeName="opacity" values="0.4;1;0.4" dur="0.9s" repeatCount="indefinite"/>
          </circle>
        </g>
      )}

      {/* The post-mortem nobody attended */}
      {eid === 'initiative_cancelled' && (
        <text x="230" y="122" textAnchor="middle" fontSize="6" fontFamily={FONT} fill={C.textDimmer} fontStyle="italic">{tr`(no one came)`}</text>
      )}

      {/* Near side: you, back to the room, and the chair nobody took */}
      <Person x={90} y={150} type="you" scale={1.45} label="" seated/>
      <ChairBack x={90} y={153} w={26} h={18} front/>
      <text x="90" y="166" textAnchor="middle" fontSize="3.2" fontFamily={FONT} fill={C.textDimmer} letterSpacing="0.5">JARED</text>
      <ChairBack x={300} y={155} w={24} h={14} front/>

      {/* Headers and footer */}
      <text x="20" y="11" fontSize="4.5" fontFamily={FONT} fill={C.textDimmer} letterSpacing="1">{banner}</text>
      <text x="395" y="11" textAnchor="end" fontSize="4.5" fontFamily={FONT} fill={C.textDimmer}>{tr`MEETING IN PROGRESS`}</text>
      <text x="395" y="172" textAnchor="end" fontSize="4" fontFamily={FONT} fill={C.textDimmer}>{footer}</text>
    </svg>
  );
};
