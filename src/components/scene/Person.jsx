// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';

const personColors = {
  you: C.text, ceo: C.amber, manager: C.blue,
  brad: C.rust, marcus: C.sage, generic: C.textDim,
  doug: C.amberDim, engineer: C.blue, karen: C.burnout,
  vp: C.amber, intern: C.sage,
  // "evangelist" = the Ballmer-archetype guest keynote speaker. Sweat-soaked
  // polo, mid-yell, energy of a man about to lift the podium over his head.
  evangelist: C.rust,
};

export const PersonAccessory = ({ type }) => {
  if (type === 'ceo') return (
    <g>
      {/* fleece-vest collar */}
      <polygon points="-2.6,-3 2.6,-3 2.2,1.5 -2.2,1.5" fill={C.amberDim} stroke={C.amber} strokeWidth="0.4"/>
      <line x1="0" y1="-3" x2="0" y2="1.5" stroke={C.bg} strokeWidth="0.4"/>
      {/* flag/lanyard tail */}
      <polygon points="-1,-3 1,-3 1.5,5 0,7 -1.5,5" fill={C.amber}/>
    </g>
  );
  if (type === 'brad') return (
    <g>
      {/* phone in hand */}
      <rect x="3.8" y="-3" width="2.6" height="3.6" fill={C.bg} stroke={C.rust} strokeWidth="0.7"/>
      <line x1="4.2" y1="-2" x2="6" y2="-2" stroke={C.rust} strokeWidth="0.3"/>
      {/* sunglasses on head — propped up */}
      <line x1="-2" y1="-11.5" x2="2" y2="-11.5" stroke={C.rust} strokeWidth="0.7"/>
      <circle cx="-1.2" cy="-11.5" r="0.7" fill={C.rust}/>
      <circle cx="1.2" cy="-11.5" r="0.7" fill={C.rust}/>
    </g>
  );
  if (type === 'marcus') return (
    <g>
      {/* clipboard */}
      <rect x="3.8" y="-3" width="3.2" height="4" fill={C.bg} stroke={C.sage} strokeWidth="0.7"/>
      <line x1="4.2" y1="-2" x2="6.4" y2="-2" stroke={C.sage} strokeWidth="0.4"/>
      <line x1="4.2" y1="-1" x2="6.4" y2="-1" stroke={C.sage} strokeWidth="0.4"/>
      <line x1="4.2" y1="0" x2="6" y2="0" stroke={C.sage} strokeWidth="0.4"/>
      {/* over-ear headphones around neck */}
      <path d="M -3.5 -7 Q -3.5 -10 0 -10 Q 3.5 -10 3.5 -7" fill="none" stroke={C.sage} strokeWidth="0.5"/>
    </g>
  );
  if (type === 'manager') return (
    <g>
      {/* glasses */}
      <circle cx="-1.4" cy="-9" r="1" fill="none" stroke={C.blue} strokeWidth="0.5"/>
      <circle cx="1.4" cy="-9" r="1" fill="none" stroke={C.blue} strokeWidth="0.5"/>
      <line x1="-0.4" y1="-9" x2="0.4" y2="-9" stroke={C.blue} strokeWidth="0.4"/>
    </g>
  );
  if (type === 'doug') return (
    <g>
      {/* mustache */}
      <path d="M -2 -7 Q -1 -6.4 0 -7 Q 1 -6.4 2 -7" stroke={C.amberDim} strokeWidth="0.7" fill="none"/>
      {/* mug */}
      <rect x="-7" y="-2" width="3.5" height="3.5" fill={C.surface2} stroke={C.amberDim} strokeWidth="0.5"/>
      <path d="M -3.5 -1 Q -2 0 -3.5 1.4" fill="none" stroke={C.amberDim} strokeWidth="0.4"/>
      <line x1="-6.5" y1="-1.5" x2="-4" y2="-1.5" stroke={C.amber} strokeWidth="0.4"/>
      {/* belt — slightly low */}
      <line x1="-3" y1="2" x2="3" y2="2" stroke={C.amberDim} strokeWidth="0.5"/>
    </g>
  );
  if (type === 'engineer') return (
    <g>
      {/* hair — short bob */}
      <path d="M -3.5 -10 Q -3.5 -13 0 -13 Q 3.5 -13 3.5 -10 L 3.5 -8 L -3.5 -8 Z" fill={C.blue} opacity="0.65"/>
      {/* laptop */}
      <rect x="-7" y="0" width="6" height="3.5" fill="#0a0a0a" stroke={C.blue} strokeWidth="0.5"/>
      <line x1="-6.5" y1="1" x2="-2" y2="1" stroke={C.sage} strokeWidth="0.3"/>
      <line x1="-6.5" y1="1.8" x2="-3" y2="1.8" stroke={C.amber} strokeWidth="0.3"/>
      <rect x="-7.5" y="3.5" width="7" height="0.7" fill={C.surface2} stroke={C.borderHi} strokeWidth="0.2"/>
    </g>
  );
  if (type === 'karen') return (
    <g>
      {/* big glasses */}
      <circle cx="-1.6" cy="-9" r="1.3" fill="none" stroke={C.burnout} strokeWidth="0.6"/>
      <circle cx="1.6" cy="-9" r="1.3" fill="none" stroke={C.burnout} strokeWidth="0.6"/>
      {/* clipboard with EXCLAMATION energy */}
      <rect x="3.8" y="-2" width="3.6" height="4.6" fill={C.bg} stroke={C.burnout} strokeWidth="0.7"/>
      <text x="5.6" y="0.8" textAnchor="middle" fontSize="3" fontFamily={FONT} fill={C.burnout} fontWeight="700">!</text>
    </g>
  );
  if (type === 'vp') return (
    <g>
      {/* vest with logo */}
      <polygon points="-3,-3 3,-3 2.5,3 -2.5,3" fill={C.amberDim} stroke={C.amber} strokeWidth="0.4"/>
      <rect x="-1.2" y="-1.2" width="2.4" height="1.2" fill={C.amber}/>
      {/* lanyard */}
      <line x1="-1" y1="-3" x2="-1" y2="2" stroke={C.amber} strokeWidth="0.3"/>
    </g>
  );
  if (type === 'intern') return (
    <g>
      {/* ID badge on lanyard */}
      <line x1="-1" y1="-5" x2="-1" y2="2" stroke={C.sage} strokeWidth="0.3"/>
      <rect x="-2.2" y="2" width="2.4" height="2.2" fill={C.surface2} stroke={C.sage} strokeWidth="0.4"/>
    </g>
  );
  if (type === 'evangelist') return (
    <g>
      {/* polo collar — open neck, drenched */}
      <polygon points="-2.8,-3 2.8,-3 2.4,1.8 -2.4,1.8" fill={C.rust} opacity="0.55" stroke={C.rust} strokeWidth="0.4"/>
      <polygon points="-1.4,-3 0,-1.5 1.4,-3" fill={C.bg} stroke={C.rust} strokeWidth="0.4"/>
      {/* armpit sweat patches */}
      <ellipse cx="-3.4" cy="-2" rx="1.4" ry="2" fill={C.burnoutDim} opacity="0.7"/>
      <ellipse cx="3.4" cy="-2" rx="1.4" ry="2" fill={C.burnoutDim} opacity="0.7"/>
      {/* shouting mouth — wide-open O on the head */}
      <ellipse cx="0" cy="-7.7" rx="0.9" ry="1.4" fill="#000" stroke={C.rust} strokeWidth="0.3"/>
      {/* clenched fists held high */}
      <circle cx="-5.2" cy="-2.5" r="0.9" fill={C.rust}/>
      <circle cx="5.2" cy="-2.5" r="0.9" fill={C.rust}/>
      {/* radiating sweat droplets */}
      <path d="M -5 -10 Q -4.5 -9 -5 -8.4 Q -5.5 -9 -5 -10 Z" fill={C.burnout}/>
      <path d="M 5 -10 Q 5.5 -9 5 -8.4 Q 4.5 -9 5 -10 Z" fill={C.burnout}/>
      <path d="M 0 -14 Q 0.6 -13 0 -12.4 Q -0.6 -13 0 -14 Z" fill={C.burnout}/>
    </g>
  );
  return null;
};

// mood: 'tired' | 'angry' | 'phone' | 'celebrate' | 'sleep'
export const PersonMood = ({ mood }) => {
  if (mood === 'tired') return (
    <text x="6" y="-12" fontSize="5" fontFamily={FONT} fill={C.textDimmer} fontStyle="italic">~</text>
  );
  if (mood === 'sleep') return (
    <g>
      <text x="6" y="-12" fontSize="5" fontFamily={FONT} fill={C.textDimmer} fontStyle="italic">z</text>
      <text x="9" y="-16" fontSize="4" fontFamily={FONT} fill={C.textDimmer} fontStyle="italic">z</text>
    </g>
  );
  if (mood === 'angry') return (
    <text x="0" y="-16" textAnchor="middle" fontSize="5" fontFamily={FONT} fill={C.rust} fontWeight="700">!?</text>
  );
  if (mood === 'phone') return (
    <g>
      <rect x="2" y="-7" width="2" height="3" fill="#0a0a0a" stroke={C.amber} strokeWidth="0.3"/>
      <text x="3" y="-4.5" textAnchor="middle" fontSize="1.6" fontFamily={FONT} fill={C.amber}>📱</text>
    </g>
  );
  if (mood === 'celebrate') return (
    <text x="0" y="-16" textAnchor="middle" fontSize="5" fontFamily={FONT} fill={C.amber} fontWeight="700">★</text>
  );
  if (mood === 'target') return (
    <text x="0" y="-16" textAnchor="middle" fontSize="5" fontFamily={FONT} fill={C.amber} fontWeight="700">🎯</text>
  );
  return null;
};

export const Person = ({ x, y, type = 'generic', label, scale = 1, glow, alert, seated, mood, sweat }) => {
  const c = personColors[type] || C.textDim;
  const headStroke = sweat ? C.burnout : c;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {glow && <circle cx="0" cy="0" r="22" fill={c} opacity="0.08"/>}
      {sweat && <circle cx="0" cy="0" r="14" fill={C.burnoutDim} opacity="0.12"/>}
      {/* head */}
      <circle cx="0" cy="-9" r="3.5" fill={C.bg} stroke={headStroke} strokeWidth="1.2"/>
      {/* sweat drop */}
      {sweat && <path d="M 3.5 -10 Q 4.2 -8.5 3.5 -7.8 Q 2.8 -8.5 3.5 -10 Z" fill={C.burnout}/>}
      {/* body */}
      <line x1="0" y1="-5.5" x2="0" y2={seated ? 5 : 7} stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      {/* arms */}
      <line x1="-4" y1="-1" x2="4" y2="-1" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      {!seated && (
        <>
          <line x1="0" y1="7" x2="-3.5" y2="14" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="0" y1="7" x2="3.5" y2="14" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
        </>
      )}
      <PersonAccessory type={type}/>
      <PersonMood mood={mood}/>
      {alert && <text x="0" y="-15" textAnchor="middle" fontSize="7" fontFamily={FONT} fill={C.rust} fontWeight="700">!</text>}
      {label && (
        <text x="0" y={seated ? 14 : 22} textAnchor="middle" fontSize="5" fontFamily={FONT} fill={C.textDimmer} letterSpacing="0.5">{label}</text>
      )}
    </g>
  );
};
