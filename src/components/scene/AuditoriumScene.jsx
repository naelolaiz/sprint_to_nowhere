// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';
import { Person } from './Person.jsx';
import { InitechLogo } from './InitechLogo.jsx';

export const AuditoriumScene = ({ event }) => {
  const eid = event?.id;

  const slideText =
    eid === 'town_hall' ? ['OUR Q3', 'IS STRONG'] :
    eid === 'all_hands' ? ['WE ARE', 'DISRUPTING'] :
    eid === 'values_refresh' ? ['BOLD', 'FRUGAL', 'BIAS FOR', 'ACTION'] :
    eid === 'compliance' ? ['PHISHING', 'AWARENESS', 'Q3'] :
    eid === 'inclusion_workshop' ? ['INCLUSION', 'THROUGH', 'ACTION'] :
    eid === 'mental_health' ? ['RESILIENCE', '&', 'WELLBEING'] :
    eid === 'reorg' ? ['CONTINUED', 'ALIGNMENT'] :
    eid === 'engagement_survey' ? ['YOUR', 'VOICE', 'MATTERS'] :
    eid === 'dev_summit' ? ['WE ❤', 'DEVELOPERS'] :
    ['UPDATE'];

  const slideNo =
    eid === 'town_hall' ? 'SLIDE 47 / 89' :
    eid === 'all_hands' ? 'SLIDE 22 / 41' :
    eid === 'values_refresh' ? 'SLIDE 14 / 38' :
    eid === 'compliance' ? 'MODULE 2 / 7' :
    eid === 'inclusion_workshop' ? 'SLIDE 9 / 94' :
    eid === 'mental_health' ? 'SLIDE 11 / 78' :
    eid === 'reorg' ? 'NO SLIDE COUNT' :
    eid === 'dev_summit' ? 'SLIDE 1 / 1' :
    'SLIDE — / —';

  return (
    <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="stage-spot" cx="50%" cy="0%">
          <stop offset="0%" stopColor={C.amber} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={C.amber} stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="aud-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.surface}/>
          <stop offset="100%" stopColor={C.bg}/>
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="400" height="180" fill={C.bg}/>

      {/* Stage area with subtle wood texture */}
      <rect x="40" y="92" width="320" height="14" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.5"/>
      <line x1="40" y1="98" x2="360" y2="98" stroke={C.border} strokeWidth="0.3" opacity="0.7"/>
      <line x1="40" y1="102" x2="360" y2="102" stroke={C.border} strokeWidth="0.3" opacity="0.7"/>

      {/* Spotlight beams from above onto the screen */}
      <ellipse cx="200" cy="50" rx="180" ry="60" fill="url(#stage-spot)"/>

      {/* Company plaque high on the side wall, between the exit sign and the screen */}
      <g transform="translate(12 48)">
        <InitechLogo width={32} dim/>
      </g>

      {/* Big AV screen + projector wash */}
      <g>
        <rect x="58" y="18" width="284" height="74" fill={C.surface} stroke={C.borderHi} strokeWidth="0.8"/>
        {/* Inner screen */}
        <rect x="68" y="26" width="184" height="58" fill="#0a0a0a" stroke={C.amber} strokeWidth="1"/>
        {slideText.map((line, i) => (
          <text key={i}
            x="160"
            y={42 + i * 11}
            textAnchor="middle"
            fontSize="9"
            fontFamily={FONT}
            fill={C.amber}
            fontWeight="700"
            letterSpacing="1"
          >
            {line}
          </text>
        ))}

        {/* Speaker notes / next-slide preview to the right */}
        <rect x="262" y="26" width="76" height="58" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.4"/>
        <rect x="266" y="29" width="68" height="20" fill="#0a0a0a"/>
        <text x="300" y="40" textAnchor="middle" fontSize="3" fontFamily={FONT} fill={C.amberDim}>NEXT SLIDE</text>
        <text x="300" y="44" textAnchor="middle" fontSize="2.5" fontFamily={FONT} fill={C.textDim}>(another vibe)</text>
        {/* Notes lines */}
        {[53, 56, 59, 62, 65, 68, 71].map((y, i) => (
          <rect key={i} x="266" y={y} width="68" height="1.5" fill={C.textDim} opacity="0.5"/>
        ))}
        <text x="300" y="82" textAnchor="middle" fontSize="2.5" fontFamily={FONT} fill={C.amberDim}>{slideNo}</text>

        {/* Live indicator */}
        <circle cx="335" cy="22" r="1.5" fill={C.rust}>
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <text x="332" y="23.5" fontSize="2.5" fontFamily={FONT} fill={C.rust} textAnchor="end">LIVE</text>
      </g>

      {/* Stage spotlights overhead */}
      {[80, 200, 320].map((cx, i) => (
        <g key={i} transform={`translate(${cx} 16)`}>
          <rect x="-3" y="-4" width="6" height="3" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.3"/>
          <polygon points="-1.5,-1 1.5,-1 3,2 -3,2" fill={C.amber} opacity="0.65"/>
        </g>
      ))}

      {/* Exit signs */}
      <g transform="translate(8 30)">
        <rect x="0" y="0" width="22" height="9" fill={C.sage} opacity="0.85"/>
        <text x="11" y="6" textAnchor="middle" fontSize="4.5" fontFamily={FONT} fill="#000" fontWeight="700">EXIT</text>
        <polygon points="22,0 26,4.5 22,9" fill={C.sage} opacity="0.85"/>
      </g>
      <g transform="translate(370 30)">
        <rect x="0" y="0" width="22" height="9" fill={C.sage} opacity="0.85"/>
        <text x="11" y="6" textAnchor="middle" fontSize="4.5" fontFamily={FONT} fill="#000" fontWeight="700">EXIT</text>
        <polygon points="0,0 -4,4.5 0,9" fill={C.sage} opacity="0.85"/>
      </g>

      {/* Podium for town-hall: speaker present */}
      {eid === 'town_hall' && (
        <g>
          <rect x="252" y="50" width="14" height="22" fill={C.surface2} stroke={C.amber} strokeWidth="0.8"/>
          <Person x={259} y={52} type="ceo" scale={0.9}/>
          <text x="259" y="80" textAnchor="middle" fontSize="4" fontFamily={FONT} fill={C.amberDim}>CEO</text>
        </g>
      )}

      {/* Dev-summit guest keynote: sweaty evangelist mid-yell at center stage,
          shouting DEVELOPERS over and over. Big speech bubble for emphasis. */}
      {eid === 'dev_summit' && (
        <g>
          {/* Podium */}
          <rect x="190" y="58" width="20" height="32" fill={C.surface2} stroke={C.rust} strokeWidth="0.8"/>
          <line x1="200" y1="58" x2="200" y2="48" stroke={C.rust} strokeWidth="0.4"/>
          <circle cx="200" cy="47" r="1.4" fill={C.rust}/>
          {/* Speaker, slightly larger because his energy demands it */}
          <Person x={200} y={56} type="evangelist" scale={1.1}/>
          {/* Speech bubble — DEVELOPERS, getting louder */}
          <g transform="translate(228 32)">
            <rect x="0" y="0" width="118" height="38" fill={C.surface} stroke={C.rust} strokeWidth="0.8"/>
            <polygon points="-6,18 0,12 0,24" fill={C.surface} stroke={C.rust} strokeWidth="0.8"/>
            <text x="6" y="13" fontSize="6" fontFamily={FONT} fill={C.rust} fontWeight="700" letterSpacing="0.5">DEVELOPERS!</text>
            <text x="6" y="22" fontSize="7" fontFamily={FONT} fill={C.rust} fontWeight="700" letterSpacing="0.6">DEVELOPERS!!</text>
            <text x="6" y="32" fontSize="9" fontFamily={FONT} fill={C.rust} fontWeight="700" letterSpacing="0.8">DEVELOPERS!!!</text>
          </g>
          <text x="200" y="96" textAnchor="middle" fontSize="3.5" fontFamily={FONT} fill={C.rust}>GUEST KEYNOTE</text>
        </g>
      )}

      {/* Audience floor */}
      <rect x="0" y="106" width="400" height="74" fill="url(#aud-floor)"/>

      {/* Audience seats — three banked rows, varied figures */}
      {[
        { y: 116, scale: 0.55, n: 9 },
        { y: 138, scale: 0.62, n: 9 },
        { y: 160, scale: 0.7, n: 8 },
      ].map((row, ri) => (
        <g key={ri}>
          {Array.from({ length: row.n }).map((_, i) => {
            const x = 40 + i * (320 / row.n) + ri * 6;
            // Sprinkle variety: some on phones, some sleepy, some glowing
            const types = ['generic', 'doug', 'engineer', 'brad', 'karen', 'generic', 'marcus', 'intern', 'generic'];
            const moods = ['sleep', null, 'phone', null, null, 'tired', null, null, 'phone'];
            const t = types[(i + ri) % types.length];
            const m = moods[(i + ri) % moods.length];
            return <Person key={i} x={x} y={row.y} type={t} scale={row.scale} mood={m}/>;
          })}
        </g>
      ))}

      {/* You highlighted */}
      <Person x={68} y={116} type="you" scale={0.65} glow label="JARED"/>

      {/* Ceiling AC vents */}
      <g opacity="0.5">
        {[40, 200, 360].map((cx, i) => (
          <g key={i} transform={`translate(${cx} 4)`}>
            <rect x="-12" y="0" width="24" height="3" fill="none" stroke={C.borderHi} strokeWidth="0.3"/>
            {[-9, -6, -3, 0, 3, 6, 9].map((x, j) => (
              <line key={j} x1={x} y1="0" x2={x} y2="3" stroke={C.borderHi} strokeWidth="0.2"/>
            ))}
          </g>
        ))}
      </g>

      <text x="10" y="14" fontSize="5" fontFamily={FONT} fill={C.textDimmer} letterSpacing="1">MAIN AUDITORIUM · MANDATORY ATTENDANCE · DOORS NOTED</text>
      <text x="395" y="172" textAnchor="end" fontSize="4.5" fontFamily={FONT} fill={C.textDimmer}>{slideNo} · CHAT IS MODERATED</text>
    </svg>
  );
};
