// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';
import { Person } from './Person.jsx';
import { InitechLogo } from './InitechLogo.jsx';

export const OutdoorScene = ({ event }) => {
  const eid = event?.id;
  const isFireDrill = eid === 'fire_drill';
  const isMorning = eid === 'morning_arrival';
  const banner =
    isFireDrill ? '🔥 FIRE DRILL · ALL HANDS PARKING LOT · ETA 25 MIN' :
    isMorning ? 'MORNING ARRIVAL · LOT B · 9:14 AM' :
    '"GIVING BACK" — Q3 IMPACT DAY';
  const bannerColor = isFireDrill ? C.rust : isMorning ? C.blue : C.amber;
  const footer =
    isFireDrill ? 'WARDEN HAS A CLIPBOARD' :
    isMorning ? 'YOU ARE NOT YET AT YOUR DESK' :
    'PHOTOS WILL APPEAR IN A DECK';

  return (
    <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
      <rect x="0" y="0" width="400" height="120" fill={C.surface}/>
      <rect x="0" y="120" width="400" height="60" fill={C.surface2}/>
      <line x1="0" y1="120" x2="400" y2="120" stroke={C.borderHi} strokeWidth="0.8"/>

{/* Banner */}
      <rect x="40" y="22" width="320" height="26" fill={C.surface2} stroke={bannerColor} strokeWidth="0.8"/>
      <text x="200" y="38" textAnchor="middle" fontSize={isFireDrill ? 7 : isMorning ? 7 : 9} fontFamily={FONT} fill={bannerColor} fontWeight="700" letterSpacing="2">{banner}</text>

      {isFireDrill ? (
        <>
          {/* Building outline behind, stick figures clustered as sales/dev/random groups */}
          <rect x="60" y="60" width="280" height="55" fill="none" stroke={C.borderHi} strokeWidth="0.6" strokeDasharray="2 2"/>
          {/* Building entrance signage */}
          <g transform="translate(184 66)">
            <InitechLogo width={32} dim/>
          </g>
          <text x="200" y="110" textAnchor="middle" fontSize="4" fontFamily={FONT} fill={C.textDimmer}>(EVACUATED BUILDING)</text>
          {/* Clusters */}
          <Person x={75} y={148} type="generic" scale={0.9} label=""/>
          <Person x={88} y={150} type="generic" scale={0.9} label="Doug"/>
          <Person x={102} y={148} type="generic" scale={0.9} label=""/>
          <Person x={195} y={148} type="you" scale={1.2} label="JARED"/>
          <Person x={250} y={148} type="brad" scale={1.0} label="sales"/>
          <Person x={264} y={150} type="generic" scale={0.95} label="Skip"/>
          <Person x={278} y={148} type="generic" scale={0.95} label=""/>
          <Person x={325} y={146} type="manager" scale={1.0} label="warden"/>
        </>
      ) : isMorning ? (
        <>
          {/* Building facade — closed, with the company plaque over the door */}
          <rect x="80" y="60" width="240" height="60" fill={C.bg} stroke={C.borderHi} strokeWidth="0.8"/>
          {/* Windows — skip the slot directly above the door (around x=180-210) */}
          {[100, 140, 220, 260, 300].map((cx, i) => (
            <rect key={i} x={cx} y={70} width="14" height="22" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.4"/>
          ))}
          {/* Glass front doors */}
          <rect x="190" y="92" width="20" height="28" fill={C.surface} stroke={C.amberDim} strokeWidth="0.5"/>
          <line x1="200" y1="92" x2="200" y2="120" stroke={C.amberDim} strokeWidth="0.4"/>
          {/* Badge reader on the wall — red dot if locked out */}
          <g transform="translate(214 104)">
            <rect x="-2" y="-3" width="4" height="6" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.4"/>
            <circle cx="0" cy="-1.5" r="0.7" fill={C.rust}>
              <animate attributeName="opacity" values="0.4;1;0.4" dur="1.6s" repeatCount="indefinite"/>
            </circle>
          </g>
          {/* You at the door, holding a coffee */}
          <Person x={195} y={150} type="you" scale={1.2} label="JARED"/>
          {/* A second figure waiting outside */}
          <Person x={140} y={152} type="engineer" scale={0.95} label="" mood="tired"/>
          {/* Cars in the lot — distant blocks */}
          {[20, 38, 56, 354, 372].map((cx, i) => (
            <g key={i} transform={`translate(${cx} 138)`}>
              <rect x="-7" y="0" width="14" height="6" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.3"/>
              <rect x="-5" y="-3" width="10" height="3" fill={C.surface} stroke={C.borderHi} strokeWidth="0.3"/>
            </g>
          ))}
        </>
      ) : (
        <>
          {/* Boxes */}
          {[0, 1, 2].map(i => (
            <g key={i} transform={`translate(${110 + i * 65} 145)`}>
              <rect x="-14" y="-12" width="28" height="16" fill={C.bg} stroke={C.borderHi} strokeWidth="0.8"/>
              <line x1="-14" y1="-4" x2="14" y2="-4" stroke={C.borderHi} strokeWidth="0.4"/>
              <text x="0" y="-3" textAnchor="middle" fontSize="3" fontFamily={FONT} fill={C.textDim}>DONATIONS</text>
            </g>
          ))}
          <Person x={85} y={140} type="generic" scale={1.05} label="colleague"/>
          <Person x={195} y={148} type="you" scale={1.2} label="JARED"/>
          <Person x={310} y={142} type="brad" scale={1.05} label="Brad"/>
        </>
      )}

      <text x="395" y="172" textAnchor="end" fontSize="4.5" fontFamily={FONT} fill={C.textDimmer}>
        {footer}
      </text>
    </svg>
  );
};
