// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';
import { Person } from './Person.jsx';
import { SpeechBubble } from '../common/SpeechBubble.jsx';

export const KitchenScene = () => (
  <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
    <rect x="0" y="0" width="400" height="180" fill={C.bg}/>
    <rect x="0" y="120" width="400" height="60" fill={C.surface}/>
    <line x1="0" y1="120" x2="400" y2="120" stroke={C.borderHi} strokeWidth="0.6"/>

    {/* Counter */}
    <rect x="40" y="100" width="180" height="14" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.8"/>

    {/* Espresso machine */}
    <g transform="translate(80 80)">
      <rect x="-14" y="0" width="28" height="22" fill={C.surface2} stroke={C.amber} strokeWidth="0.9"/>
      <rect x="-10" y="3" width="20" height="6" fill="#0a0a0a" stroke={C.amberDim} strokeWidth="0.5"/>
      <text x="0" y="7.5" textAnchor="middle" fontSize="3" fontFamily={FONT} fill={C.amber}>READY</text>
      <rect x="-3" y="11" width="6" height="6" fill={C.bg} stroke={C.borderHi} strokeWidth="0.4"/>
      <line x1="-7" y1="22" x2="-7" y2="26" stroke={C.borderHi} strokeWidth="0.6"/>
      <line x1="7" y1="22" x2="7" y2="26" stroke={C.borderHi} strokeWidth="0.6"/>
      <text x="0" y="-4" textAnchor="middle" fontSize="3" fontFamily={FONT} fill={C.textDimmer}>"LA MARZOCCO" (BROKEN)</text>
    </g>

    {/* Fridge */}
    <g transform="translate(170 76)">
      <rect x="-14" y="0" width="28" height="42" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.8"/>
      <line x1="-14" y1="18" x2="14" y2="18" stroke={C.borderHi} strokeWidth="0.4"/>
      <rect x="9" y="6" width="2" height="6" fill={C.borderHi}/>
      <rect x="9" y="22" width="2" height="6" fill={C.borderHi}/>
      <text x="0" y="50" textAnchor="middle" fontSize="3" fontFamily={FONT} fill={C.textDimmer}>SHARED FRIDGE</text>
    </g>

    {/* Sign */}
    <g transform="translate(280 38)">
      <rect x="0" y="0" width="100" height="32" fill={C.surface} stroke={C.amber} strokeWidth="0.8"/>
      <text x="50" y="13" textAnchor="middle" fontSize="5" fontFamily={FONT} fill={C.amber} fontWeight="700">PLEASE</text>
      <text x="50" y="22" textAnchor="middle" fontSize="4" fontFamily={FONT} fill={C.text}>label your milk.</text>
      <text x="50" y="29" textAnchor="middle" fontSize="3" fontFamily={FONT} fill={C.textDimmer}>(this is the 4th sign)</text>
    </g>

    {/* Doug at espresso */}
    <Person x={80} y={145} type="generic" scale={1.4} label="Doug"/>
    <SpeechBubble x={130} y={70} text='"Did you fix the milk thing?"' w={140}/>

    {/* You */}
    <Person x={290} y={150} type="you" scale={1.3} label="JARED"/>

    <text x="10" y="14" fontSize="5" fontFamily={FONT} fill={C.textDimmer} letterSpacing="1">CAFE / KITCHEN · COFFEE: COLD</text>
    <text x="395" y="172" textAnchor="end" fontSize="4.5" fontFamily={FONT} fill={C.textDimmer}>SLACK MESSAGE BEING DICTATED</text>
  </svg>
);
