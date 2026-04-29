// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';
import { Person } from './Person.jsx';
import { Desk } from './Desk.jsx';
import { InitechLogo } from './InitechLogo.jsx';

export const DeskScene = ({ event, debt = 0, burnout = 0, morale = 70, stayedLate = false }) => {
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

  // Intruder roster — WHO is standing at your desk. Dialog body has the words.
  const intruder =
    eid === 'shoulder_tap' ? { type: 'brad', mood: 'phone' } :
    eid === 'scope_change' ? { type: 'marcus' } :
    eid === 'refactor_bumped' ? { type: 'manager' } :
    eid === 'hq_drop' ? { type: 'manager' } :
    eid === 'loud_sales_call' ? { type: 'brad', mood: 'phone' } :
    eid === 'pivot' ? { type: 'marcus' } :
    eid === 'requirements_changed' ? { type: 'marcus' } :
    eid === 'reorg' ? { type: 'manager' } :
    eid === 'broken_package' ? { type: 'engineer' } :
    eid === 'building_issue' ? { type: 'doug' } :
    null;

  const canCount = burnout > 80 ? 3 : burnout > 60 ? 2 : burnout > 40 ? 1 : 0;
  const moraleLow = morale < 30;
  const debtCritical = debt > 70;
  // Window goes dark only when the player actually stayed late tonight.
  const isLate = stayedLate;
  const fireAlert = eid === 'production_fire' || eid === 'on_call' || eid === 'dependency';

  return (
    <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
      {/* ----- Background: ceiling → wall → carpet, with slight gradient ----- */}
      <defs>
        <linearGradient id="wall-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isLate ? '#0d0c0a' : C.surface}/>
          <stop offset="100%" stopColor={C.bg}/>
        </linearGradient>
        <linearGradient id="floor-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.surface}/>
          <stop offset="100%" stopColor={C.surface2}/>
        </linearGradient>
        <linearGradient id="window-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isLate ? '#0a0c14' : '#3a4a5c'}/>
          <stop offset="100%" stopColor={isLate ? '#1a1814' : '#586a7c'}/>
        </linearGradient>
        {/* Pulse animation for the fire alert */}
        <radialGradient id="alert-glow">
          <stop offset="0%" stopColor={C.rust} stopOpacity="0.5"/>
          <stop offset="100%" stopColor={C.rust} stopOpacity="0"/>
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="400" height="135" fill="url(#wall-grad)"/>
      <rect x="0" y="135" width="400" height="45" fill="url(#floor-grad)"/>
      <line x1="0" y1="135" x2="400" y2="135" stroke={C.borderHi} strokeWidth="0.5"/>

      {/* Ceiling — fluorescent strip lights */}
      <rect x="80" y="2" width="60" height="2" fill={isLate ? C.amberDim : C.amber} opacity={isLate ? 0.3 : 0.55}/>
      <rect x="180" y="2" width="60" height="2" fill={isLate ? C.amberDim : C.amber} opacity={isLate ? 0.3 : 0.55}/>
      <rect x="280" y="2" width="60" height="2" fill={isLate ? C.amberDim : C.amber} opacity={isLate ? 0.3 : 0.55}/>
      {/* Ceiling tile grid */}
      {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((cx, i) => (
        <line key={i} x1={cx} y1="0" x2={cx} y2="14" stroke={C.borderHi} strokeWidth="0.3" opacity="0.5"/>
      ))}
      <line x1="0" y1="14" x2="400" y2="14" stroke={C.borderHi} strokeWidth="0.3" opacity="0.5"/>

      {/* Carpet tiles — a faint herringbone hint */}
      {[145, 155, 165, 175].map((cy, i) => (
        <line key={i} x1="0" y1={cy} x2="400" y2={cy} stroke={C.surface2} strokeWidth="0.2" opacity="0.6"/>
      ))}

      {/* burnout-driven ambient red tint */}
      {burnout > 70 && (
        <rect x="0" y="0" width="400" height="180" fill={C.burnout} opacity="0.05"/>
      )}

      {/* ----- Window at left, with skyline ----- */}
      <g>
        <rect x="22" y="22" width="78" height="60" fill="url(#window-grad)" stroke={C.borderHi} strokeWidth="0.8"/>
        {/* Skyline silhouette */}
        <g opacity={isLate ? 0.85 : 0.5}>
          <rect x="22" y="62" width="14" height="20" fill="#1a1c20"/>
          <rect x="36" y="55" width="9" height="27" fill="#1a1c20"/>
          <rect x="45" y="48" width="20" height="34" fill="#1a1c20"/>
          <rect x="65" y="60" width="11" height="22" fill="#1a1c20"/>
          <rect x="76" y="52" width="24" height="30" fill="#1a1c20"/>
          {/* Lit windows in those buildings — small dots */}
          {isLate && [
            [48, 60], [56, 65], [50, 72], [82, 60], [88, 70], [40, 70],
          ].map((p, i) => (
            <rect key={i} x={p[0]} y={p[1]} width="1" height="1" fill={C.amber} opacity="0.7"/>
          ))}
        </g>
        {/* Window frame crossbars */}
        <line x1="61" y1="22" x2="61" y2="82" stroke={C.borderHi} strokeWidth="0.5"/>
        <line x1="22" y1="52" x2="100" y2="52" stroke={C.borderHi} strokeWidth="0.5"/>
        {/* Faint reflection on the glass */}
        <line x1="26" y1="26" x2="38" y2="48" stroke="#fff" strokeWidth="0.3" opacity="0.08"/>
        <text x="61" y="92" textAnchor="middle" fontSize="4" fontFamily={FONT} fill={C.textDimmer}>
          {isLate ? 'IT IS DARK NOW' : 'SOUTH FACING'}
        </text>
      </g>

      {/* ----- Wall calendar — Xs cross days, more Xs as sprint progresses ----- */}
      <g transform="translate(112 24)">
        <rect x="0" y="0" width="40" height="32" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.4"/>
        <rect x="0" y="0" width="40" height="6" fill={C.amberDim}/>
        <text x="20" y="4.5" textAnchor="middle" fontSize="3" fontFamily={FONT} fill={C.bg} fontWeight="700">Q3 — SPRINT</text>
        {/* 5x5 day grid */}
        {[0, 1, 2, 3, 4].map(r => (
          [0, 1, 2, 3, 4].map(c => (
            <g key={`${r}-${c}`}>
              <rect x={2 + c * 7.4} y={9 + r * 4.8} width="6.8" height="4.4" fill="none" stroke={C.borderHi} strokeWidth="0.3"/>
              {/* X-mark on past days — sparse to keep it readable */}
              {(r * 5 + c) < (debt > 50 ? 14 : 8) && (
                <>
                  <line x1={2.5 + c * 7.4} y1={9.5 + r * 4.8} x2={8.6 + c * 7.4} y2={12.9 + r * 4.8} stroke={C.rust} strokeWidth="0.4"/>
                  <line x1={8.6 + c * 7.4} y1={9.5 + r * 4.8} x2={2.5 + c * 7.4} y2={12.9 + r * 4.8} stroke={C.rust} strokeWidth="0.4"/>
                </>
              )}
            </g>
          ))
        ))}
      </g>

      {/* ----- Inspirational poster (deeply hated) ----- */}
      <g transform="translate(160 22)">
        <rect x="0" y="0" width="46" height="34" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.4"/>
        <rect x="2" y="2" width="42" height="22" fill="#0a0a0a"/>
        <text x="23" y="11" textAnchor="middle" fontSize="3" fontFamily={FONT} fill={C.amber} fontWeight="700">SHIP</text>
        <text x="23" y="16" textAnchor="middle" fontSize="3" fontFamily={FONT} fill={C.amber} fontWeight="700">ANYWAY</text>
        <text x="23" y="21" textAnchor="middle" fontSize="2.2" fontFamily={FONT} fill={C.textDimmer}>– our values</text>
        <text x="23" y="29" textAnchor="middle" fontSize="2.4" fontFamily={FONT} fill={C.textDimmer}>(Q3 refresh)</text>
      </g>

      {/* ----- Cubicle wall on the right with a coworker visible ----- */}
      <g>
        <rect x="350" y="60" width="50" height="75" fill={C.surface2} stroke={C.border} strokeWidth="0.5" opacity="0.85"/>
        {/* fabric texture */}
        {[68, 76, 84, 92, 100, 108, 116, 124].map((y, i) => (
          <line key={i} x1="350" y1={y} x2="400" y2={y} stroke={C.border} strokeWidth="0.2" opacity="0.6"/>
        ))}
        {/* Sticky note pinned to the cubicle wall */}
        <g transform="translate(360 75)">
          <rect x="0" y="0" width="14" height="11" fill={C.amber} opacity="0.7" transform="rotate(-3)"/>
          <text x="2" y="5" fontSize="1.8" fontFamily={FONT} fill="#000" transform="rotate(-3 2 5)">DEPLOY:</text>
          <text x="2" y="8" fontSize="1.8" fontFamily={FONT} fill="#000" transform="rotate(-3 2 8)">FRIDAY 4PM</text>
        </g>
        {/* Adjacent dev's monitor peeking over the wall */}
        <rect x="360" y="100" width="32" height="14" fill="#0a0a0a" stroke={C.border} strokeWidth="0.4"/>
        <line x1="362" y1="103" x2="375" y2="103" stroke={C.sage} strokeWidth="0.3"/>
        <line x1="362" y1="105" x2="380" y2="105" stroke={C.text} strokeWidth="0.3"/>
        <line x1="362" y1="107" x2="372" y2="107" stroke={C.amber} strokeWidth="0.3"/>
        <line x1="362" y1="109" x2="382" y2="109" stroke={C.blue} strokeWidth="0.3"/>
        <line x1="362" y1="111" x2="378" y2="111" stroke={C.text} strokeWidth="0.3"/>
      </g>

      {/* ----- Plant — wilts when morale is low ----- */}
      <g transform={`translate(338 100)${moraleLow ? ' rotate(-8)' : ''}`}>
        <rect x="-7" y="0" width="14" height="9" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.5"/>
        <line x1="-7" y1="2" x2="7" y2="2" stroke={C.borderHi} strokeWidth="0.3"/>
        <path d="M 0 0 C -5 -8 -4 -16 0 -18 C 4 -16 5 -8 0 0" fill="none" stroke={moraleLow ? C.amberDim : C.sageDim} strokeWidth="0.7"/>
        <path d="M -2 -2 C -6 -10 -5 -14 -3 -15" fill="none" stroke={moraleLow ? C.amberDim : C.sageDim} strokeWidth="0.5"/>
        <path d="M 2 -2 C 6 -10 5 -14 3 -15" fill="none" stroke={moraleLow ? C.amberDim : C.sageDim} strokeWidth="0.5"/>
        {moraleLow && <text x="0" y="14" textAnchor="middle" fontSize="2.4" fontFamily={FONT} fill={C.textDimmer}>(thirsty)</text>}
      </g>

      {/* ----- Company plaque on the empty wall between the poster and the cubicle, hung at window height ----- */}
      <g transform="translate(258 36)">
        <InitechLogo width={36} dim/>
      </g>

      {/* ----- Whiteboard sliver visible on the back wall (between window and poster) ----- */}
      <g transform="translate(108 60)">
        <rect x="0" y="0" width="48" height="20" fill="#0d0e10" stroke={C.borderHi} strokeWidth="0.4"/>
        <text x="24" y="6" textAnchor="middle" fontSize="2.8" fontFamily={FONT} fill={C.amber} fontWeight="700">SPRINT</text>
        <text x="3" y="11" fontSize="1.8" fontFamily={FONT} fill={C.text}>· auth refactor</text>
        <text x="3" y="14" fontSize="1.8" fontFamily={FONT} fill={C.text}>· export feature</text>
        <text x="3" y="17" fontSize="1.8" fontFamily={FONT} fill={C.rust}>· "tiny tweak"</text>
      </g>

      {/* ----- Soft floor shadow under your desk for grounding ----- */}
      <ellipse cx="200" cy="170" rx="78" ry="5" fill="#000" opacity="0.25"/>

      {/* ----- Your desk - big in foreground ----- */}
      <g transform="translate(200 132) scale(2.1)">
        <Desk x={0} y={0} you screen={screen}/>
      </g>

      {/* ----- Desk props -----
          Geometry note: the desk is at translate(200,132) scale(2.1), so the
          desk-top surface in SVG space is at y≈132 (its top edge). Each prop
          is positioned so its visual base lands at y≈132 — i.e. it sits ON
          the desk rather than floating in the gap between the monitor's
          bottom edge (y≈126) and the surface. Horizontally we keep props
          off-center to avoid the keyboard area at x=192–208. */}

      {/* Stack of papers/printout — base at y≈132 */}
      <g transform="translate(228 124)">
        <rect x="0" y="-1" width="14" height="9" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.3"/>
        <rect x="1" y="0" width="14" height="9" fill={C.surface} stroke={C.borderHi} strokeWidth="0.4"/>
        <line x1="2" y1="3" x2="13" y2="3" stroke={C.textDim} strokeWidth="0.2" opacity="0.6"/>
        <line x1="2" y1="5" x2="11" y2="5" stroke={C.textDim} strokeWidth="0.2" opacity="0.6"/>
        <line x1="2" y1="7" x2="12" y2="7" stroke={C.textDim} strokeWidth="0.2" opacity="0.6"/>
      </g>

      {/* Headphones on the desk — cup bottoms at y=132 (group y=130, cup ry=2) */}
      <g transform="translate(220 130)">
        <path d="M -5 0 Q -5 -6 0 -6 Q 5 -6 5 0" fill="none" stroke={C.text} strokeWidth="0.7"/>
        <ellipse cx="-5" cy="0" rx="1.4" ry="2" fill={C.surface2} stroke={C.text} strokeWidth="0.4"/>
        <ellipse cx="5" cy="0" rx="1.4" ry="2" fill={C.surface2} stroke={C.text} strokeWidth="0.4"/>
        <ellipse cx="0" cy="3" rx="6" ry="0.7" fill="#000" opacity="0.25"/>
      </g>

      {/* Coffee mug — base (rect bottom y=2 in group) at y=132 */}
      <g transform="translate(150 130)">
        <ellipse cx="0" cy="3" rx="3.2" ry="0.8" fill="#000" opacity="0.35"/>
        <rect x="-3" y="-4" width="6" height="6" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.7"/>
        <path d="M 3 -2.5 Q 5.5 0 3 2" fill="none" stroke={C.borderHi} strokeWidth="0.7"/>
        <line x1="-2" y1="-3.5" x2="2" y2="-3.5" stroke={C.amber} strokeWidth="0.6"/>
        {/* Steam — only if coffee is still hot (low burnout) */}
        {burnout < 50 && (
          <>
            <path d="M -1 -5 Q -2 -8 0 -11" fill="none" stroke={C.textDimmer} strokeWidth="0.3" opacity="0.6"/>
            <path d="M 1 -5 Q 2 -8 0 -11" fill="none" stroke={C.textDimmer} strokeWidth="0.3" opacity="0.6"/>
          </>
        )}
      </g>

      {/* Empty cans pile up as burnout rises — bases on the desk at y=132 */}
      {canCount >= 1 && (
        <g transform="translate(160 132)">
          <rect x="0" y="-6" width="3" height="6" fill={C.surface2} stroke={C.rust} strokeWidth="0.4"/>
          <line x1="0.5" y1="-4" x2="2.5" y2="-4" stroke={C.rust} strokeWidth="0.3"/>
          <ellipse cx="1.5" cy="-6" rx="1.5" ry="0.4" fill={C.rust} opacity="0.4"/>
        </g>
      )}
      {canCount >= 2 && (
        <g transform="translate(165 132)">
          <rect x="0" y="-6" width="3" height="6" fill={C.surface2} stroke={C.amberDim} strokeWidth="0.4"/>
          <line x1="0.5" y1="-4" x2="2.5" y2="-4" stroke={C.amberDim} strokeWidth="0.3"/>
        </g>
      )}
      {canCount >= 3 && (
        <g transform="translate(170 132)">
          <rect x="0" y="-6" width="3" height="6" fill={C.surface2} stroke={C.burnout} strokeWidth="0.4"/>
          <text x="1.5" y="-1" textAnchor="middle" fontSize="1.5" fontFamily={FONT} fill={C.burnout}>3rd</text>
        </g>
      )}

      {/* Floor shadow under you */}
      <ellipse cx="200" cy="161" rx="6" ry="1.2" fill="#000" opacity="0.3"/>

      {/* You at desk — sweat appears at high burnout */}
      <Person x={200} y={146} type="you" scale={1.2} sweat={burnout > 70} mood={burnout > 85 ? 'tired' : null}/>

      {/* Intruder */}
      {intruder && (
        <>
          <ellipse cx="285" cy="166" rx="6" ry="1.2" fill="#000" opacity="0.3"/>
          <Person x={285} y={150} type={intruder.type} scale={1.2} alert mood={intruder.mood}/>
        </>
      )}

      {/* ----- Alert / overlay layer ----- */}

      {/* Fire alert — pulsing glow */}
      {fireAlert && (
        <>
          <circle cx="200" cy="56" r="22" fill="url(#alert-glow)">
            <animate attributeName="r" values="18;28;18" dur="1.4s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.55;0.85;0.55" dur="1.4s" repeatCount="indefinite"/>
          </circle>
          <text x="200" y="50" textAnchor="middle" fontSize="20" fill={C.rust}>⚠</text>
          <text x="200" y="66" textAnchor="middle" fontSize="6" fontFamily={FONT} fill={C.rust} fontWeight="700" letterSpacing="2">PRODUCTION INCIDENT</text>
        </>
      )}

      {/* HQ box */}
      {eid === 'hq_drop' && (
        <g transform="translate(125 135)">
          <ellipse cx="0" cy="6" rx="14" ry="2" fill="#000" opacity="0.4"/>
          <rect x="-14" y="-18" width="28" height="22" fill={C.surface2} stroke={C.rust} strokeWidth="1.2"/>
          <line x1="-14" y1="-9" x2="14" y2="-9" stroke={C.rust} strokeWidth="0.6"/>
          <line x1="0" y1="-18" x2="0" y2="4" stroke={C.rust} strokeWidth="0.6"/>
          <text x="0" y="-12" textAnchor="middle" fontSize="3.5" fontFamily={FONT} fill={C.rust} fontWeight="700">FROM HQ</text>
          <text x="0" y="-3" textAnchor="middle" fontSize="2.4" fontFamily={FONT} fill={C.textDim}>"FRAGILE"</text>
          <text x="0" y="2" textAnchor="middle" fontSize="2" fontFamily={FONT} fill={C.textDim}>this side up ↑</text>
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
          {/* blinking notification dot */}
          <circle cx="167" cy="3.5" r="1.6" fill={C.rust}>
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.2s" repeatCount="indefinite"/>
          </circle>
        </g>
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

      {/* Tickets-down sticky */}
      {eid === 'tickets_down' && (
        <g transform="translate(330 50)">
          <rect x="-22" y="-14" width="44" height="20" fill={C.amber} opacity="0.7" transform="rotate(2)"/>
          <text x="0" y="-7" textAnchor="middle" fontSize="3" fontFamily={FONT} fill="#000" fontWeight="700" transform="rotate(2 0 -7)">JIRA DOWN</text>
          <text x="0" y="-2" textAnchor="middle" fontSize="2.4" fontFamily={FONT} fill="#000" transform="rotate(2 0 -2)">"investigating"</text>
          <text x="0" y="3" textAnchor="middle" fontSize="2.2" fontFamily={FONT} fill="#000" transform="rotate(2 0 3)">— 3 hrs ago</text>
        </g>
      )}

      {/* Network down — wifi-off icon */}
      {eid === 'network_down' && (
        <g transform="translate(345 30)">
          <path d="M -8 -2 Q 0 -10 8 -2" fill="none" stroke={C.rust} strokeWidth="1.2"/>
          <path d="M -5 1 Q 0 -4 5 1" fill="none" stroke={C.rustDim} strokeWidth="1"/>
          <line x1="-9" y1="-9" x2="9" y2="3" stroke={C.rust} strokeWidth="1.4"/>
          <text x="0" y="13" textAnchor="middle" fontSize="3" fontFamily={FONT} fill={C.rust}>WIFI: ✗</text>
        </g>
      )}

      {/* ----- Title strip ----- */}
      <text x="395" y="14" textAnchor="end" fontSize="4.5" fontFamily={FONT} fill={C.textDimmer}>
        JARED'S DESK · OPEN PLAN · {isLate ? '21:47' : '10:14'}
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
