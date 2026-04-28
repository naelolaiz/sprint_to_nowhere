// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';
import { Person } from './Person.jsx';
import { SpeechBubble } from '../common/SpeechBubble.jsx';

export const AuditoriumScene = ({ event }) => {
  const eid = event?.id;
  const slideText =
    eid === 'town_hall' ? ['OUR Q3', 'IS STRONG'] :
    eid === 'all_hands' ? ['WE ARE', 'DISRUPTING'] :
    eid === 'values_refresh' ? ['BOLD', 'FRUGAL', 'BIAS FOR', 'ACTION'] :
    eid === 'compliance' ? ['PHISHING', 'AWARENESS'] :
    eid === 'inclusion_workshop' ? ['INCLUSION', 'THROUGH', 'ACTION'] :
    eid === 'mental_health' ? ['RESILIENCE', '&', 'WELLBEING'] :
    eid === 'reorg' ? ['CONTINUED', 'ALIGNMENT'] :
    ['UPDATE'];

  return (
    <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
      <rect x="0" y="0" width="400" height="180" fill={C.bg}/>
      <rect x="60" y="20" width="280" height="65" fill={C.surface} stroke={C.borderHi} strokeWidth="0.8"/>

      {/* Screen */}
      <rect x="100" y="28" width="120" height="46" fill="#0a0a0a" stroke={C.amber} strokeWidth="1"/>
      {slideText.map((line, i) => (
        <text key={i} x="160" y={42 + i * 11} textAnchor="middle" fontSize="8" fontFamily={FONT} fill={C.amber} fontWeight="700" letterSpacing="1">{line}</text>
      ))}

      {/* CEO podium */}
      {eid === 'town_hall' && (
        <>
          <rect x="252" y="50" width="14" height="22" fill={C.surface2} stroke={C.amber} strokeWidth="0.8"/>
          <Person x={259} y={52} type="ceo" scale={0.9}/>
          <text x="259" y="80" textAnchor="middle" fontSize="4" fontFamily={FONT} fill={C.amberDim}>CEO</text>
        </>
      )}

      {/* Audience rows */}
      {[110, 132, 154].map((rowY, ri) => (
        <g key={ri}>
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <Person key={i} x={60 + i * 45 + ri * 8} y={rowY} type="generic" scale={0.6}/>
          ))}
        </g>
      ))}

      {/* You highlighted */}
      <Person x={68} y={110} type="you" scale={0.75} glow label="JARED"/>

      <text x="10" y="14" fontSize="5" fontFamily={FONT} fill={C.textDimmer} letterSpacing="1">MAIN AUDITORIUM · MANDATORY ATTENDANCE</text>
      <text x="395" y="172" textAnchor="end" fontSize="4.5" fontFamily={FONT} fill={C.textDimmer}>SLIDE 47 OF 89</text>
    </svg>
  );
};
