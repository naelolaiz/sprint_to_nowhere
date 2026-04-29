// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';
import { Person } from './Person.jsx';
import { InitechLogo } from './InitechLogo.jsx';

export const ExecutiveScene = () => (
  <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
    {/* Office walls */}
    <rect x="20" y="20" width="360" height="140" fill={C.surface} stroke={C.amber} strokeWidth="1"/>
    <text x="30" y="34" fontSize="5" fontFamily={FONT} fill={C.amberDim} letterSpacing="2">CEO'S CORNER OFFICE · 14F</text>

    {/* Wall plaque next to the door */}
    <g transform="translate(40 42)">
      <InitechLogo width={34}/>
    </g>

    {/* Floor band — subtle horizon at the bottom of the wall */}
    <rect x="20" y="138" width="360" height="22" fill={C.surface2} opacity="0.4"/>
    <line x1="20" y1="138" x2="380" y2="138" stroke={C.borderHi} strokeWidth="0.4" opacity="0.6"/>

    {/* Window with skyline behind the desk */}
    <rect x="240" y="40" width="120" height="58" fill="#0a0c14" stroke={C.borderHi} strokeWidth="0.8"/>
    <line x1="300" y1="40" x2="300" y2="98" stroke={C.borderHi} strokeWidth="0.5"/>
    <line x1="240" y1="69" x2="360" y2="69" stroke={C.borderHi} strokeWidth="0.5"/>
    {/* Skyline silhouette */}
    {[
      [248, 80, 12, 18], [262, 75, 10, 23], [274, 70, 16, 28],
      [292, 78, 9, 20], [302, 72, 14, 26], [318, 76, 8, 22],
      [328, 68, 18, 30], [348, 74, 10, 24],
    ].map(([x, y, w, h], i) => (
      <rect key={i} x={x} y={y} width={w} height={h} fill="#1a1c20"/>
    ))}

    {/* CEO Slack-style ping panel — over to the left so it doesn't overlap the window */}
    <g transform="translate(110 50)">
      <rect x="0" y="0" width="120" height="44" fill={C.surface2} stroke={C.amberDim} strokeWidth="0.7"/>
      <rect x="0" y="0" width="120" height="7" fill={C.amberDim}/>
      <text x="4" y="5" fontSize="3.5" fontFamily={FONT} fill={C.bg} fontWeight="700">SLACK · DRAFT TO #ENGINEERING</text>
      <text x="4" y="14" fontSize="3" fontFamily={FONT} fill={C.amber}>cursor blinking · CEO is typing…</text>
      <line x1="4" y1="18" x2="116" y2="18" stroke={C.border} strokeWidth="0.3"/>
      <rect x="4" y="22" width="92" height="2.2" fill={C.textDim} opacity="0.5"/>
      <rect x="4" y="26" width="110" height="2.2" fill={C.textDim} opacity="0.5"/>
      <rect x="4" y="30" width="74" height="2.2" fill={C.textDim} opacity="0.5"/>
      <rect x="4" y="34" width="56" height="2.2" fill={C.textDim} opacity="0.5"/>
      <text x="114" y="40" textAnchor="end" fontSize="2.6" fontFamily={FONT} fill={C.amber}>by next week 🙏</text>
    </g>

    {/* CEO seated behind the desk — drawn first, then the desk covers the body */}
    <Person x={200} y={108} type="ceo" scale={1.5} label="" mood="phone" seated/>

    {/* Floor shadow under the desk */}
    <ellipse cx="200" cy="148" rx="92" ry="3" fill="#000" opacity="0.35"/>

    {/* Executive desk — wide slab with visible front face and legs */}
    <g>
      {/* desk surface */}
      <rect x="108" y="118" width="184" height="5" fill={C.surface2} stroke={C.amber} strokeWidth="0.9"/>
      {/* desk front (modesty panel) */}
      <rect x="116" y="123" width="168" height="20" fill={C.surface} stroke={C.amberDim} strokeWidth="0.6"/>
      {/* desk legs */}
      <rect x="116" y="123" width="3" height="22" fill={C.amberDim}/>
      <rect x="281" y="123" width="3" height="22" fill={C.amberDim}/>
      {/* monitor on desk, facing CEO (back of monitor visible to viewer) */}
      <rect x="174" y="106" width="52" height="14" fill={C.surface} stroke={C.amberDim} strokeWidth="0.6"/>
      <rect x="178" y="108" width="44" height="9" fill="#0a0a0a"/>
      <rect x="194" y="120" width="12" height="2.5" fill={C.surface2} stroke={C.amberDim} strokeWidth="0.3"/>
      {/* a printout in front of CEO */}
      <rect x="148" y="120" width="14" height="3" fill={C.surface} stroke={C.amberDim} strokeWidth="0.3"/>
      {/* coffee cup */}
      <rect x="240" y="115" width="6" height="6" fill={C.surface2} stroke={C.amberDim} strokeWidth="0.4"/>
      <path d="M 246 117 Q 249 119 246 121" fill="none" stroke={C.amberDim} strokeWidth="0.4"/>
    </g>

    {/* CEO label below the desk */}
    <text x="200" y="155" textAnchor="middle" fontSize="5" fontFamily={FONT} fill={C.amberDim} letterSpacing="0.5">CEO</text>

    {/* Brand poster on the side wall */}
    <g transform="translate(310 110)">
      <rect x="0" y="0" width="58" height="22" fill="#0a0a0a" stroke={C.amberDim} strokeWidth="0.4"/>
      <text x="29" y="8" textAnchor="middle" fontSize="3.4" fontFamily={FONT} fill={C.amber} fontWeight="700">SHIP</text>
      <text x="29" y="14" textAnchor="middle" fontSize="3.4" fontFamily={FONT} fill={C.amber} fontWeight="700">ANYWAY</text>
      <text x="29" y="19" textAnchor="middle" fontSize="2.2" fontFamily={FONT} fill={C.textDimmer}>– our values</text>
    </g>

    <text x="30" y="170" fontSize="4.5" fontFamily={FONT} fill={C.textDimmer}>SLACK PING · NEW IDEA · ROADMAP UPDATING</text>
  </svg>
);
