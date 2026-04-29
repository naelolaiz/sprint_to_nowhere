// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';
import { Person } from './Person.jsx';
import { Desk } from './Desk.jsx';

// Working-from-home variant of DeskScene. Same player + same screen vocabulary,
// different surroundings: warm wall, kitchen counter behind the desk, a
// houseplant that doesn't wilt, no fluorescent ceiling, no cubicle.
export const HomeDeskScene = ({ event, debt = 0, burnout = 0, morale = 70 }) => {
  const eid = event?.id;
  const screen =
    eid === 'production_fire' || eid === 'dependency' || eid === 'on_call' ? 'fire' :
    ['ethics_email','impact_email'].includes(eid) ? 'email' :
    eid === 'engagement_survey' ? 'survey' :
    eid === 'pivot' || eid === 'requirements_changed' ? 'pivot' :
    eid === 'tickets_down' || eid === 'network_down' ? 'down' :
    eid === 'broken_package' ? 'sdk' :
    'code';

  const moraleLow = morale < 30;
  const debtCritical = debt > 70;
  const isLate = burnout > 75;
  const fireAlert = eid === 'production_fire' || eid === 'on_call' || eid === 'dependency';

  return (
    <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="home-wall-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isLate ? '#1a1410' : '#3a2e22'}/>
          <stop offset="100%" stopColor={isLate ? '#0f0a08' : '#241c14'}/>
        </linearGradient>
        <linearGradient id="home-floor-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a2a1c"/>
          <stop offset="100%" stopColor="#1f160e"/>
        </linearGradient>
        <linearGradient id="home-window-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isLate ? '#0a0c14' : '#9ec0d6'}/>
          <stop offset="100%" stopColor={isLate ? '#1a1814' : '#c8d9aa'}/>
        </linearGradient>
        <radialGradient id="home-alert-glow">
          <stop offset="0%" stopColor={C.rust} stopOpacity="0.5"/>
          <stop offset="100%" stopColor={C.rust} stopOpacity="0"/>
        </radialGradient>
        <pattern id="home-floor-planks" x="0" y="0" width="38" height="6" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="38" y2="0" stroke="#150e08" strokeWidth="0.4" opacity="0.6"/>
          <line x1="19" y1="0" x2="19" y2="6" stroke="#150e08" strokeWidth="0.3" opacity="0.4"/>
        </pattern>
      </defs>

      {/* Wall + wood floor */}
      <rect x="0" y="0" width="400" height="135" fill="url(#home-wall-grad)"/>
      <rect x="0" y="135" width="400" height="45" fill="url(#home-floor-grad)"/>
      <rect x="0" y="135" width="400" height="45" fill="url(#home-floor-planks)"/>
      <line x1="0" y1="135" x2="400" y2="135" stroke="#100a06" strokeWidth="0.6"/>

      {/* burnout-driven ambient red tint */}
      {burnout > 70 && (
        <rect x="0" y="0" width="400" height="180" fill={C.burnout} opacity="0.05"/>
      )}

      {/* ----- Big window with curtains and a tree outside ----- */}
      <g>
        {/* curtain rod */}
        <line x1="14" y1="20" x2="148" y2="20" stroke="#1a120a" strokeWidth="1"/>
        <circle cx="14" cy="20" r="1.2" fill="#1a120a"/>
        <circle cx="148" cy="20" r="1.2" fill="#1a120a"/>
        {/* glass */}
        <rect x="22" y="22" width="118" height="64" fill="url(#home-window-grad)" stroke="#1a120a" strokeWidth="0.8"/>
        {/* outside scene — tree silhouette + a neighbor's roofline */}
        <g opacity={isLate ? 0.85 : 0.7}>
          <rect x="22" y="78" width="118" height="8" fill={isLate ? '#0e0a06' : '#7a8e5a'}/>
          <polygon points="60,78 80,52 100,78" fill={isLate ? '#0a0806' : '#3a4a30'}/>
          <polygon points="95,78 112,60 130,78" fill={isLate ? '#0a0806' : '#3a4a30'}/>
          <circle cx="40" cy="64" r="14" fill={isLate ? '#0a0806' : '#5a7038'}/>
          <line x1="40" y1="64" x2="40" y2="80" stroke={isLate ? '#06040a' : '#3a2820'} strokeWidth="1"/>
          {/* moon when it's late */}
          {isLate && <circle cx="120" cy="38" r="5" fill="#e6dcb8" opacity="0.85"/>}
          {/* sun glow when it's day */}
          {!isLate && <circle cx="120" cy="38" r="6" fill="#f0d680" opacity="0.5"/>}
        </g>
        {/* mullion */}
        <line x1="81" y1="22" x2="81" y2="86" stroke="#1a120a" strokeWidth="0.6"/>
        <line x1="22" y1="54" x2="140" y2="54" stroke="#1a120a" strokeWidth="0.6"/>
        {/* curtains pulled aside */}
        <path d="M 14 22 Q 18 50 16 86 Q 22 86 24 22 Z" fill="#5a3a26" opacity="0.85"/>
        <path d="M 148 22 Q 144 50 146 86 Q 140 86 138 22 Z" fill="#5a3a26" opacity="0.85"/>
      </g>

      {/* ----- "Working from home" sign / framed photo on the wall ----- */}
      <g transform="translate(168 26)">
        <rect x="0" y="0" width="50" height="36" fill="#2a1f14" stroke="#5a3a20" strokeWidth="0.6"/>
        <rect x="2" y="2" width="46" height="28" fill="#0d0a06"/>
        <text x="25" y="13" textAnchor="middle" fontSize="3.6" fontFamily={FONT} fill={C.amber} fontWeight="700" letterSpacing="1">HOME</text>
        <text x="25" y="20" textAnchor="middle" fontSize="3" fontFamily={FONT} fill={C.textDim}>(no commute)</text>
        <text x="25" y="26" textAnchor="middle" fontSize="2.4" fontFamily={FONT} fill={C.textDimmer}>— a personal value</text>
        <text x="25" y="34" textAnchor="middle" fontSize="2.4" fontFamily={FONT} fill={C.textDimmer}>v1, do not refresh</text>
      </g>

      {/* ----- Bookshelf to the right ----- */}
      <g transform="translate(232 22)">
        <rect x="0" y="0" width="58" height="60" fill="#241910" stroke="#1a120a" strokeWidth="0.5"/>
        {/* shelves */}
        <line x1="0" y1="20" x2="58" y2="20" stroke="#3a2820" strokeWidth="0.6"/>
        <line x1="0" y1="40" x2="58" y2="40" stroke="#3a2820" strokeWidth="0.6"/>
        {/* books */}
        {[2, 6, 11, 15, 22, 27, 33, 41, 46, 52].map((x, i) => (
          <rect key={`b1-${i}`} x={x} y={3} width={[3,4,3.5,5,4,5,3.5,4,5,3.5][i]} height="16"
            fill={['#7a3a26','#5a4a30','#7d6a3c','#3a4a5c','#5a3a4c','#3a5a4c','#7a3a4c','#3a3a5c','#5a4a4c','#6a4a30'][i]}
            opacity="0.85"/>
        ))}
        {[3, 8, 14, 19, 25, 31, 37, 44, 50].map((x, i) => (
          <rect key={`b2-${i}`} x={x} y={23} width={[4,3.5,4.5,4,5,4,5,4,3.5][i]} height="16"
            fill={['#3a4a5c','#5a4a30','#7a3a4c','#3a5a4c','#7a3a26','#5a3a4c','#3a3a5c','#7a4a30','#5a4a4c'][i]}
            opacity="0.85"/>
        ))}
        {/* a plant on the bottom shelf */}
        <g transform="translate(8 50)">
          <rect x="-3" y="0" width="6" height="6" fill="#5a3a20" stroke="#3a2418" strokeWidth="0.3"/>
          <path d="M 0 0 C -4 -8 -3 -12 0 -14 C 3 -12 4 -8 0 0" fill="none" stroke={C.sageDim} strokeWidth="0.6"/>
        </g>
        {/* coffee mug on the middle shelf */}
        <g transform="translate(46 39)">
          <rect x="-2.5" y="-5" width="5" height="5" fill="#a8835a" stroke="#3a2418" strokeWidth="0.3"/>
          <path d="M 2.5 -3.5 Q 4 -1.5 2.5 0" fill="none" stroke="#3a2418" strokeWidth="0.3"/>
        </g>
        {/* a small framed photo */}
        <rect x="20" y="46" width="14" height="10" fill="#2a1f14" stroke="#5a3a20" strokeWidth="0.4"/>
        <rect x="22" y="48" width="10" height="6" fill="#5a7038"/>
      </g>

      {/* ----- Kitchen-table edge / mug + pet area on the left ----- */}
      {/* sleeping cat on a small rug */}
      <g transform="translate(46 152)">
        <ellipse cx="0" cy="2" rx="14" ry="3.5" fill="#3a2820" opacity="0.85"/>
        <ellipse cx="0" cy="0" rx="9" ry="3" fill="#a08260" opacity="0.95"/>
        <circle cx="-7" cy="-1" r="2.4" fill="#a08260"/>
        <path d="M -8.6 -2.6 L -8 -4 L -7 -2.6" fill="#7a5a3a"/>
        <path d="M -5.4 -2.6 L -5 -4 L -4 -2.6" fill="#7a5a3a"/>
        <path d="M 8 0 Q 12 -2 9 -3" fill="none" stroke="#a08260" strokeWidth="1.6"/>
        <text x="-12" y="-3" fontSize="3" fontFamily={FONT} fill={C.textDimmer} fontStyle="italic">z</text>
        <text x="-10" y="-6" fontSize="2.4" fontFamily={FONT} fill={C.textDimmer} fontStyle="italic">z</text>
      </g>

      {/* ----- Soft floor shadow under your desk for grounding ----- */}
      <ellipse cx="200" cy="170" rx="78" ry="5" fill="#000" opacity="0.3"/>

      {/* ----- Your desk - same as office, big in foreground ----- */}
      <g transform="translate(200 132) scale(2.1)">
        <Desk x={0} y={0} you screen={screen}/>
      </g>

      {/* Coffee mug — your kitchen one, visible steam */}
      <g transform="translate(150 130)">
        <ellipse cx="0" cy="3" rx="3.2" ry="0.8" fill="#000" opacity="0.35"/>
        <rect x="-3" y="-4" width="6" height="6" fill="#a8835a" stroke="#3a2418" strokeWidth="0.6"/>
        <path d="M 3 -2.5 Q 5.5 0 3 2" fill="none" stroke="#3a2418" strokeWidth="0.6"/>
        {burnout < 60 && (
          <>
            <path d="M -1 -5 Q -2 -8 0 -11" fill="none" stroke={C.textDimmer} strokeWidth="0.3" opacity="0.7"/>
            <path d="M 1 -5 Q 2 -8 0 -11" fill="none" stroke={C.textDimmer} strokeWidth="0.3" opacity="0.7"/>
          </>
        )}
      </g>

      {/* Houseplant on the desk — never wilts at home */}
      <g transform="translate(228 124)">
        <rect x="-4" y="0" width="8" height="6" fill="#5a3a20" stroke="#3a2418" strokeWidth="0.3"/>
        <path d="M 0 0 C -5 -7 -4 -13 0 -15 C 4 -13 5 -7 0 0" fill="none" stroke={moraleLow ? C.sageDim : C.sage} strokeWidth="0.7"/>
        <path d="M -2 -2 C -5 -8 -4 -12 -2 -13" fill="none" stroke={moraleLow ? C.sageDim : C.sage} strokeWidth="0.5"/>
        <path d="M 2 -2 C 5 -8 4 -12 2 -13" fill="none" stroke={moraleLow ? C.sageDim : C.sage} strokeWidth="0.5"/>
      </g>

      {/* Floor shadow under you */}
      <ellipse cx="200" cy="161" rx="6" ry="1.2" fill="#000" opacity="0.3"/>

      {/* You at desk — wearing the t-shirt you slept in */}
      <Person x={200} y={146} type="you" scale={1.2} sweat={burnout > 70} mood={burnout > 85 ? 'tired' : null}/>

      {/* ----- Alert / overlay layer ----- */}

      {fireAlert && (
        <>
          <circle cx="200" cy="56" r="22" fill="url(#home-alert-glow)">
            <animate attributeName="r" values="18;28;18" dur="1.4s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.55;0.85;0.55" dur="1.4s" repeatCount="indefinite"/>
          </circle>
          <text x="200" y="50" textAnchor="middle" fontSize="20" fill={C.rust}>⚠</text>
          <text x="200" y="66" textAnchor="middle" fontSize="6" fontFamily={FONT} fill={C.rust} fontWeight="700" letterSpacing="2">PRODUCTION INCIDENT</text>
        </>
      )}

      {/* Calendar invite for meeting cascades */}
      {eid === 'meeting_cascade' && (
        <g transform="translate(80 50)">
          <rect x="-2" y="-2" width="90" height="38" fill="#000" opacity="0.25"/>
          <rect x="0" y="0" width="86" height="34" fill={C.surface2} stroke={C.amberDim} strokeWidth="0.6"/>
          <rect x="0" y="0" width="86" height="6" fill={C.amberDim}/>
          <text x="43" y="4.5" textAnchor="middle" fontSize="3.5" fontFamily={FONT} fill={C.bg} fontWeight="700">CALENDAR INVITE</text>
          <text x="4" y="13" fontSize="3.2" fontFamily={FONT} fill={C.text}>[hold for chat]</text>
          <text x="4" y="19" fontSize="2.8" fontFamily={FONT} fill={C.textDim}>30 min · 8 attendees</text>
          <text x="4" y="25" fontSize="2.8" fontFamily={FONT} fill={C.textDim}>agenda: TBD</text>
          <text x="4" y="31" fontSize="2.5" fontFamily={FONT} fill={C.amber}>STARTS IN 4 MIN</text>
        </g>
      )}

      {/* CEO Slack-shaped ping floating in (no canned line) */}
      {eid === 'ceo_idea' && (
        <g transform="translate(70 38)">
          <rect x="-2" y="-2" width="174" height="42" fill="#000" opacity="0.25"/>
          <rect x="0" y="0" width="170" height="38" fill={C.surface2} stroke={C.amberDim} strokeWidth="0.7"/>
          <rect x="0" y="0" width="170" height="7" fill={C.amberDim}/>
          <text x="4" y="5" fontSize="3.5" fontFamily={FONT} fill={C.bg} fontWeight="700">SLACK · DM FROM CEO</text>
          <text x="4" y="15" fontSize="3" fontFamily={FONT} fill={C.amber}>CEO · 1:23 AM</text>
          <line x1="4" y1="20" x2="166" y2="20" stroke={C.border} strokeWidth="0.3"/>
          <rect x="4" y="23" width="120" height="2.5" fill={C.textDim} opacity="0.5"/>
          <rect x="4" y="27" width="148" height="2.5" fill={C.textDim} opacity="0.5"/>
          <rect x="4" y="31" width="92" height="2.5" fill={C.textDim} opacity="0.5"/>
          <text x="166" y="34" textAnchor="end" fontSize="2.6" fontFamily={FONT} fill={C.amber}>1 unread · 🙏</text>
          <circle cx="167" cy="3.5" r="1.6" fill={C.rust}>
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.2s" repeatCount="indefinite"/>
          </circle>
        </g>
      )}

      {/* ----- WFH badge — bottom-left, persistent ----- */}
      <g transform="translate(8 150)">
        <rect x="-2" y="-7" width="60" height="11" fill="#0a0806" stroke={C.amberDim} strokeWidth="0.6" opacity="0.95"/>
        <circle cx="3" cy="-1.5" r="1.6" fill={C.sage}>
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2.2s" repeatCount="indefinite"/>
        </circle>
        <text x="8" y="0.5" fontSize="4.2" fontFamily={FONT} fill={C.amber} fontWeight="700" letterSpacing="1">WFH · LIVE</text>
      </g>

      {/* ----- Title strip ----- */}
      <text x="395" y="14" textAnchor="end" fontSize="4.5" fontFamily={FONT} fill={C.textDimmer}>
        JARED'S APARTMENT · {isLate ? '21:47' : '10:14'} · COMMUTE: 0M
      </text>
      {debtCritical && (
        <text x="10" y="172" fontSize="4.5" fontFamily={FONT} fill={C.rust} letterSpacing="1">
          CODEBASE STATUS: FRAGILE
        </text>
      )}
      {burnout > 80 && (
        <text x="395" y="172" textAnchor="end" fontSize="4.5" fontFamily={FONT} fill={C.burnout} letterSpacing="1">
          BURNOUT: CRITICAL
        </text>
      )}
    </svg>
  );
};
