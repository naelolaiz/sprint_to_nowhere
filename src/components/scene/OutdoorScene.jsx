// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';
import { Person } from './Person.jsx';
import { SpeechBubble } from '../common/SpeechBubble.jsx';

export const OutdoorScene = ({ event }) => {
  const isFireDrill = event?.id === 'fire_drill';
  const banner = isFireDrill
    ? '🔥 FIRE DRILL · ALL HANDS PARKING LOT · ETA 25 MIN'
    : '"GIVING BACK" — Q3 IMPACT DAY';
  return (
    <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
      <rect x="0" y="0" width="400" height="120" fill={C.surface}/>
      <rect x="0" y="120" width="400" height="60" fill={C.surface2}/>
      <line x1="0" y1="120" x2="400" y2="120" stroke={C.borderHi} strokeWidth="0.8"/>

      {/* Sun */}
      <circle cx="350" cy="42" r="14" fill="none" stroke={C.amberDim} strokeWidth="0.8"/>
      <circle cx="350" cy="42" r="9" fill="none" stroke={C.amberDim} strokeWidth="0.6"/>

      {/* Banner */}
      <rect x="40" y="22" width="320" height="26" fill={C.surface2} stroke={isFireDrill ? C.rust : C.amber} strokeWidth="0.8"/>
      <text x="200" y="38" textAnchor="middle" fontSize={isFireDrill ? 7 : 9} fontFamily={FONT} fill={isFireDrill ? C.rust : C.amber} fontWeight="700" letterSpacing="2">{banner}</text>

      {isFireDrill ? (
        <>
          {/* Building outline behind, stick figures clustered as sales/dev/random groups */}
          <rect x="60" y="60" width="280" height="55" fill="none" stroke={C.borderHi} strokeWidth="0.6" strokeDasharray="2 2"/>
          <text x="200" y="70" textAnchor="middle" fontSize="4" fontFamily={FONT} fill={C.textDimmer}>(EVACUATED BUILDING)</text>
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
        {isFireDrill ? 'WARDEN HAS A CLIPBOARD' : 'PHOTOS WILL APPEAR IN A DECK'}
      </text>
    </svg>
  );
};
