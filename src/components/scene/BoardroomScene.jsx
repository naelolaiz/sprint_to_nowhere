// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';
import { Person } from './Person.jsx';
import { InitechLogo } from './InitechLogo.jsx';

// A long-table boardroom for high-stakes meetings: the AI-initiative kickoff,
// the sales pincer, and similar combo events where multiple stakeholders converge.
export const BoardroomScene = ({ event }) => {
  const eid = event?.id;

  const config =
    eid === 'ai_initiative_kickoff' ? {
      banner: 'BOARDROOM · "AGENTIC EVERYTHING" KICKOFF · DAY 1',
      slide: ['AGENTIC', 'EVERYTHING', '*subject to change'],
      slideColor: C.amber,
      vendor: { type: 'vp', label: 'Synapsai' },
      logan: true,
      catering: true,
      footer: 'CATERING ON A TUESDAY · CEO IN A BLAZER OVER A HOODIE',
    } :
    eid === 'sales_pincer' ? {
      banner: 'ROOM C · "ALIGNMENT" · 15 MIN ON CAL · 47 MIN IN',
      slide: ['ENGINEERING', '+ SALES', 'ALIGNMENT'],
      slideColor: C.sage,
      vendor: null,
      logan: false,
      catering: false,
      footer: 'BOTH SMILING · BOTH STILL SMILING',
    } :
    eid === 'cto_skiplevel' ? {
      banner: 'EXECUTIVE SUITE · COFFEE CHAT · 30 MIN',
      slide: ['LISTENING', '"NO AGENDA"'],
      slideColor: C.blue,
      vendor: null,
      logan: false,
      catering: false,
      footer: 'CTO HAS A PRINTED SHEET',
    } :
    {
      banner: 'BOARDROOM',
      slide: ['EXECUTIVE', 'REVIEW'],
      slideColor: C.amber,
      vendor: null,
      logan: false,
      catering: false,
      footer: '',
    };

  return (
    <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="board-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.surface}/>
          <stop offset="100%" stopColor={C.bg}/>
        </linearGradient>
        <linearGradient id="board-table" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={C.surface2}/>
          <stop offset="50%" stopColor={C.surface}/>
          <stop offset="100%" stopColor={C.surface2}/>
        </linearGradient>
        <radialGradient id="board-spot">
          <stop offset="0%" stopColor={C.amber} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={C.amber} stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Walls / room */}
      <rect x="0" y="0" width="400" height="14" fill={C.surface2}/>
      <rect x="0" y="14" width="400" height="148" fill="url(#board-wall)"/>
      <rect x="0" y="162" width="400" height="18" fill={C.bg}/>

      {/* Brass plaque on the back wall */}
      <g transform="translate(18 26)">
        <InitechLogo width={36} dim/>
      </g>

      {/* Coffered ceiling */}
      {[60, 140, 220, 300].map((cx, i) => (
        <g key={i}>
          <rect x={cx} y="2" width="60" height="9" fill="none" stroke={C.borderHi} strokeWidth="0.3"/>
          <rect x={cx + 25} y="4" width="10" height="3" fill={C.amber} opacity="0.5"/>
        </g>
      ))}

      {/* Wall art: framed painting (vague abstract) */}
      <g transform="translate(304 28)">
        <rect x="0" y="0" width="76" height="50" fill={C.surface} stroke={C.amberDim} strokeWidth="0.6"/>
        <rect x="3" y="3" width="70" height="44" fill="#0a0a0a"/>
        <ellipse cx="22" cy="24" rx="12" ry="8" fill={C.amberDim} opacity="0.55"/>
        <ellipse cx="42" cy="32" rx="14" ry="6" fill={C.rust} opacity="0.45"/>
        <ellipse cx="55" cy="18" rx="9" ry="4" fill={C.sage} opacity="0.45"/>
        <text x="38" y="45" textAnchor="middle" fontSize="2.2" fontFamily={FONT} fill={C.textDimmer}>"momentum (acrylic)"</text>
      </g>

      {/* Spotlight wash on the head of the table */}
      <ellipse cx="56" cy="116" rx="60" ry="40" fill="url(#board-spot)"/>

      {/* big screen at the head of the room */}
      <g transform="translate(60 26)">
        <rect x="-3" y="-3" width="106" height="64" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.5"/>
        <rect x="0" y="0" width="100" height="58" fill="#0a0a0a" stroke={config.slideColor} strokeWidth="1"/>
        {config.slide.map((line, i) => (
          <text key={i}
            x="50"
            y={20 + i * 14}
            textAnchor="middle"
            fontSize={i === config.slide.length - 1 && line.startsWith('*') ? 4 : 9}
            fontFamily={FONT}
            fill={config.slideColor}
            fontWeight={i === config.slide.length - 1 && line.startsWith('*') ? 400 : 700}
            letterSpacing="1"
          >
            {line}
          </text>
        ))}
        {/* fake "live" indicator */}
        <circle cx="92" cy="6" r="1.4" fill={C.rust}>
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.4s" repeatCount="indefinite"/>
        </circle>
        <text x="86" y="7.5" fontSize="2.6" fontFamily={FONT} fill={C.rust} textAnchor="end">LIVE</text>
        {/* speaker notes pane */}
        <rect x="0" y="60" width="100" height="6" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.3"/>
        <text x="50" y="64" textAnchor="middle" fontSize="2.6" fontFamily={FONT} fill={C.textDimmer}>SLIDE 3 / 47 · "TRUST THE PROCESS"</text>
      </g>

      {/* Plant on a stand */}
      <g transform="translate(190 80)">
        <rect x="-7" y="0" width="14" height="40" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.4"/>
        <ellipse cx="0" cy="-1" rx="9" ry="2" fill={C.surface}/>
        <path d="M 0 -1 C -8 -10 -7 -22 -1 -28 C 5 -22 8 -10 0 -1" fill="none" stroke={C.sageDim} strokeWidth="0.7"/>
        <path d="M -3 -3 C -10 -14 -8 -22 -5 -25" fill="none" stroke={C.sageDim} strokeWidth="0.5"/>
        <path d="M 3 -3 C 10 -14 8 -22 5 -25" fill="none" stroke={C.sageDim} strokeWidth="0.5"/>
      </g>

      {/* Floor shadow under table */}
      <ellipse cx="200" cy="146" rx="170" ry="9" fill="#000" opacity="0.3"/>

      {/* long boardroom table */}
      <rect x="38" y="100" width="324" height="38" fill="url(#board-table)" stroke={C.borderHi} strokeWidth="0.8" rx="2"/>
      {/* Wood grain */}
      {[107, 115, 123, 131].map((y, i) => (
        <line key={i} x1="42" y1={y} x2="358" y2={y} stroke={C.borderHi} strokeWidth="0.25" opacity="0.4"/>
      ))}

      {/* Spider conference phone in the middle */}
      <g transform="translate(200 119)">
        <ellipse cx="0" cy="0" rx="9" ry="4" fill={C.surface} stroke={C.borderHi} strokeWidth="0.5"/>
        <ellipse cx="0" cy="-0.6" rx="7" ry="3" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.3"/>
        {[-3, 0, 3].map((dx, ci) => (
          [-1, 0.5].map((dy, ri) => (
            <circle key={`${ci}-${ri}`} cx={dx} cy={dy} r="0.5" fill={C.amberDim}/>
          ))
        ))}
        <circle cx="0" cy="-0.6" r="0.6" fill={C.rust}>
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.2s" repeatCount="indefinite"/>
        </circle>
      </g>

      {/* CEO at head of table (left) */}
      <Person x={56} y={116} type="ceo" scale={1.1} label="CEO" seated mood="celebrate"/>

      {/* Marcus mid-table */}
      <Person x={155} y={116} type="marcus" scale={1.1} label="Marcus" seated/>

      {/* Optional AI-vendor founder */}
      {config.vendor && (
        <Person x={205} y={116} type={config.vendor.type} scale={1.1} label={config.vendor.label} seated mood="phone"/>
      )}

      {/* Logan from leadership */}
      {config.logan && (
        <g>
          <Person x={255} y={116} type="vp" scale={1.05} label="Logan (mute)" seated/>
          <text x="255" y="98" textAnchor="middle" fontSize="6" fontFamily={FONT} fill={C.amber}>🎯</text>
        </g>
      )}

      {/* You at the far end — alone */}
      <Person x={340} y={116} type="you" scale={1.1} label="JARED" seated sweat/>

      {/* Catering tray */}
      {config.catering && (
        <g transform="translate(280 113)">
          <rect x="-14" y="-3" width="28" height="6" fill={C.surface} stroke={C.amberDim} strokeWidth="0.4"/>
          <line x1="-10" y1="-3" x2="-10" y2="3" stroke={C.amberDim} strokeWidth="0.3"/>
          <line x1="-3" y1="-3" x2="-3" y2="3" stroke={C.amberDim} strokeWidth="0.3"/>
          <line x1="4" y1="-3" x2="4" y2="3" stroke={C.amberDim} strokeWidth="0.3"/>
          <line x1="11" y1="-3" x2="11" y2="3" stroke={C.amberDim} strokeWidth="0.3"/>
          {/* small pastries */}
          <ellipse cx="-7" cy="0" rx="2" ry="1" fill={C.amber} opacity="0.6"/>
          <ellipse cx="0" cy="0" rx="2" ry="1" fill={C.amberDim} opacity="0.7"/>
          <ellipse cx="7" cy="0" rx="2" ry="1" fill={C.amber} opacity="0.6"/>
          <text x="0" y="9" textAnchor="middle" fontSize="2.5" fontFamily={FONT} fill={C.amberDim}>(catering — on a Tuesday)</text>
        </g>
      )}

      {/* Notepads / laptops */}
      {[80, 130, 230, 320].map((mx, i) => (
        <g key={i} transform={`translate(${mx} 109)`}>
          <rect x="-5" y="-1.6" width="10" height="4" fill="#0a0a0a" stroke={C.border} strokeWidth="0.3"/>
          <rect x="-5.5" y="2.4" width="11" height="0.6" fill={C.surface} stroke={C.borderHi} strokeWidth="0.2"/>
        </g>
      ))}

      {/* Coffee mugs along the table */}
      {[80, 130, 180, 230, 280, 320].map((mx, i) => (
        <g key={i} transform={`translate(${mx} 105)`}>
          <rect x="-1.6" y="-1.8" width="3.2" height="2.4" fill={C.surface} stroke={C.borderHi} strokeWidth="0.3"/>
        </g>
      ))}

      {/* Name plates in front of each seat */}
      {[
        { x: 56, name: 'CEO' },
        { x: 155, name: 'MARCUS' },
        { x: 340, name: 'YOU' },
      ].map((np, i) => (
        <g key={i} transform={`translate(${np.x} 138)`}>
          <rect x="-7" y="0" width="14" height="3" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.3"/>
          <text x="0" y="2" textAnchor="middle" fontSize="2.4" fontFamily={FONT} fill={C.amberDim}>{np.name}</text>
        </g>
      ))}

      {/* Floor */}
      <rect x="0" y="155" width="400" height="25" fill={C.bg}/>
      <line x1="0" y1="155" x2="400" y2="155" stroke={C.borderHi} strokeWidth="0.4"/>

      <text x="20" y="11" fontSize="4.5" fontFamily={FONT} fill={C.textDimmer} letterSpacing="1">{config.banner}</text>
      <text x="380" y="172" textAnchor="end" fontSize="4" fontFamily={FONT} fill={C.textDimmer}>{config.footer}</text>
    </svg>
  );
};
