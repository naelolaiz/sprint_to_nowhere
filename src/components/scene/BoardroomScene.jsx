// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';
import { Person } from './Person.jsx';
import { InitechLogo } from './InitechLogo.jsx';
import { SkyPane } from './Sky.jsx';

const Chair = ({ x, y, w = 14, h = 14, front = false }) => (
  <g>
    <rect x={x - w / 2} y={y} width={w} height={h} rx="3" fill={front ? '#2a2318' : '#241f16'} stroke={C.amberDim} strokeWidth="0.5"/>
    <rect x={x - w / 2 + 2} y={y + 2} width={w - 4} height={h - 5} rx="2" fill="none" stroke={C.border} strokeWidth="0.4"/>
  </g>
);

// A long-table boardroom for high-stakes meetings: the AI-initiative kickoff,
// the sales pincer, and similar combo events where multiple stakeholders
// converge. They sit along the far side. You sit on the near side, alone.
export const BoardroomScene = ({ event, clock = 10 * 60 }) => {
  const eid = event?.id;

  const config =
    eid === 'ai_initiative_kickoff' ? {
      banner: 'BOARDROOM · "AGENTIC EVERYTHING" KICKOFF · DAY 1',
      slide: ['AGENTIC', 'EVERYTHING', '*subject to change'],
      slideColor: C.amber,
      vendor: { type: 'vp', label: 'SYNAPSAI' },
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

  // Far-side seats, left to right.
  const seats = [
    { x: 72, type: 'ceo', name: 'CEO', scale: 1.15 },
    { x: 150, type: 'marcus', name: 'MARCUS' },
    config.vendor ? { x: 210, type: config.vendor.type, name: config.vendor.label, mood: 'phone' } : null,
    config.logan ? { x: 268, type: 'vp', name: 'LOGAN (MUTE)', target: true } : null,
  ].filter(Boolean);
  const emptySeats = [210, 268, 326].filter(x => !seats.some(s => s.x === x));

  return (
    <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="board-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.surface}/>
          <stop offset="100%" stopColor={C.bg}/>
        </linearGradient>
        <linearGradient id="board-table" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a3a22"/>
          <stop offset="100%" stopColor="#2e2416"/>
        </linearGradient>
        <radialGradient id="board-spot">
          <stop offset="0%" stopColor={C.amber} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={C.amber} stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Walls / room */}
      <rect x="0" y="0" width="400" height="14" fill={C.surface2}/>
      <rect x="0" y="14" width="400" height="148" fill="url(#board-wall)"/>
      <rect x="0" y="155" width="400" height="25" fill={C.bg}/>
      <line x1="0" y1="155" x2="400" y2="155" stroke={C.borderHi} strokeWidth="0.4"/>

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
      <ellipse cx="72" cy="110" rx="60" ry="40" fill="url(#board-spot)"/>

      {/* Big screen at the head of the room */}
      <g transform="translate(60 22)">
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
        <circle cx="92" cy="6" r="1.4" fill={C.rust}>
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.4s" repeatCount="indefinite"/>
        </circle>
        <text x="86" y="7.5" fontSize="2.6" fontFamily={FONT} fill={C.rust} textAnchor="end">LIVE</text>
        <rect x="0" y="60" width="100" height="6" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.3"/>
        <text x="50" y="64" textAnchor="middle" fontSize="2.6" fontFamily={FONT} fill={C.textDimmer}>SLIDE 3 / 47 · "TRUST THE PROCESS"</text>
      </g>

      {/* Plant on a stand */}
      <g transform="translate(180 78)">
        <rect x="-6" y="0" width="12" height="22" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.4"/>
        <ellipse cx="0" cy="-1" rx="8" ry="2" fill={C.surface}/>
        <path d="M 0 -1 C -8 -10 -7 -22 -1 -28 C 5 -22 8 -10 0 -1" fill="none" stroke={C.sageDim} strokeWidth="0.7"/>
        <path d="M -3 -3 C -10 -14 -8 -22 -5 -25" fill="none" stroke={C.sageDim} strokeWidth="0.5"/>
        <path d="M 3 -3 C 10 -14 8 -22 5 -25" fill="none" stroke={C.sageDim} strokeWidth="0.5"/>
      </g>

      {/* Floor-to-ceiling window: the executive floor gets the view */}
      <g>
        <SkyPane id="board" x={198} y={20} w={94} h={56} clock={clock}
          buildings={[[0.02, 0.7, 0.1], [0.14, 0.56, 0.12], [0.3, 0.46, 0.18], [0.52, 0.64, 0.1], [0.66, 0.5, 0.2], [0.9, 0.6, 0.1]]}/>
        <line x1="245" y1="20" x2="245" y2="76" stroke={C.borderHi} strokeWidth="0.5"/>
      </g>

      {/* Far side: chairs, people, then the table in front of them */}
      {seats.map((s, i) => <Chair key={`c${i}`} x={s.x} y={88}/>)}
      {emptySeats.map((x, i) => <Chair key={`e${i}`} x={x} y={88}/>)}
      {seats.map((s, i) => (
        <g key={i}>
          <Person x={s.x} y={96} type={s.type} scale={s.scale || 1.1} label="" seated mood={s.mood}/>
          {s.target && <text x={s.x} y="79" textAnchor="middle" fontSize="6" fontFamily={FONT} fill={C.amber}>🎯</text>}
        </g>
      ))}

      {/* Long boardroom table, in perspective */}
      <ellipse cx="200" cy="144" rx="175" ry="7" fill="#000" opacity="0.3"/>
      <path d="M 44 100 L 356 100 Q 364 100 366 106 L 384 134 Q 386 138 380 138 L 20 138 Q 14 138 16 134 L 34 106 Q 36 100 44 100 Z"
        fill="url(#board-table)" stroke={C.amberDim} strokeWidth="0.7"/>
      <path d="M 50 102 L 350 102" stroke="#fff" strokeWidth="0.5" opacity="0.1"/>
      {[112, 122, 132].map((y, i) => (
        <line key={i} x1={44 - (y - 100) * 0.5} y1={y} x2={356 + (y - 100) * 0.5} y2={y} stroke={C.amberDim} strokeWidth="0.25" opacity="0.3"/>
      ))}

      {/* Name plates, laptops, mugs */}
      {seats.map((s, i) => (
        <g key={`n${i}`} transform={`translate(${s.x} 110)`}>
          <polygon points="-11,0 11,0 9,-4 -9,-4" fill={C.surface2} stroke={C.amberDim} strokeWidth="0.3"/>
          <text x="0" y="-1.1" textAnchor="middle" fontSize="2.4" fontFamily={FONT} fill={C.amberDim}>{s.name}</text>
        </g>
      ))}
      {[150, 268].map((mx, i) => (
        <g key={i} transform={`translate(${mx} 118)`}>
          <rect x="-5" y="-4" width="10" height="5.5" fill="#0a0a0a" stroke={C.border} strokeWidth="0.3"/>
          <rect x="-5.5" y="1.5" width="11" height="0.7" fill={C.surface} stroke={C.borderHi} strokeWidth="0.2"/>
        </g>
      ))}
      {[90, 170, 230, 310].map((mx, i) => (
        <g key={i} transform={`translate(${mx} 116)`}>
          <rect x="-1.6" y="-2.4" width="3.2" height="2.6" fill={C.surface} stroke={C.borderHi} strokeWidth="0.3"/>
        </g>
      ))}

      {/* Spider conference phone in the middle */}
      <g transform="translate(200 126)">
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

      {/* Catering tray */}
      {config.catering && (
        <g transform="translate(290 128)">
          <rect x="-14" y="-3" width="28" height="6" fill={C.surface} stroke={C.amberDim} strokeWidth="0.4"/>
          {[-10, -3, 4, 11].map((lx, i) => (
            <line key={i} x1={lx} y1="-3" x2={lx} y2="3" stroke={C.amberDim} strokeWidth="0.3"/>
          ))}
          <ellipse cx="-7" cy="0" rx="2" ry="1" fill={C.amber} opacity="0.6"/>
          <ellipse cx="0" cy="0" rx="2" ry="1" fill={C.amberDim} opacity="0.7"/>
          <ellipse cx="7" cy="0" rx="2" ry="1" fill={C.amber} opacity="0.6"/>
          <text x="0" y="9" textAnchor="middle" fontSize="2.5" fontFamily={FONT} fill={C.amberDim}>(catering — on a Tuesday)</text>
        </g>
      )}

      {/* You, on the near side, alone, back to the room */}
      <Person x={330} y={148} type="you" scale={1.4} label="" seated sweat/>
      <Chair x={330} y={151} w={26} h={18} front/>
      <text x="330" y="164" textAnchor="middle" fontSize="3.2" fontFamily={FONT} fill={C.textDimmer} letterSpacing="0.5">JARED</text>
      {/* The chairs on your side that nobody took */}
      <Chair x={100} y={153} w={24} h={14} front/>
      <Chair x={210} y={153} w={24} h={14} front/>

      <text x="20" y="11" fontSize="4.5" fontFamily={FONT} fill={C.textDimmer} letterSpacing="1">{config.banner}</text>
      <text x="380" y="176" textAnchor="end" fontSize="4" fontFamily={FONT} fill={C.textDimmer}>{config.footer}</text>
    </svg>
  );
};
