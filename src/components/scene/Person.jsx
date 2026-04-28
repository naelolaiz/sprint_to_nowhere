// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';

export const personColors = {
  you: C.text, ceo: C.amber, manager: C.blue,
  brad: C.rust, marcus: C.sage, generic: C.textDim,
};

export const PersonAccessory = ({ type }) => {
  if (type === 'ceo') return <polygon points="-1,-3 1,-3 1.5,5 0,7 -1.5,5" fill={C.amber}/>;
  if (type === 'brad') return <rect x="3.8" y="-3" width="2.6" height="3.6" fill={C.bg} stroke={C.rust} strokeWidth="0.7"/>;
  if (type === 'marcus') return (
    <g>
      <rect x="3.8" y="-3" width="3.2" height="4" fill={C.bg} stroke={C.sage} strokeWidth="0.7"/>
      <line x1="4.2" y1="-2" x2="6.4" y2="-2" stroke={C.sage} strokeWidth="0.4"/>
      <line x1="4.2" y1="-1" x2="6.4" y2="-1" stroke={C.sage} strokeWidth="0.4"/>
      <line x1="4.2" y1="0" x2="6" y2="0" stroke={C.sage} strokeWidth="0.4"/>
    </g>
  );
  if (type === 'manager') return (
    <g>
      <circle cx="-1.4" cy="-9" r="1" fill="none" stroke={C.blue} strokeWidth="0.5"/>
      <circle cx="1.4" cy="-9" r="1" fill="none" stroke={C.blue} strokeWidth="0.5"/>
    </g>
  );
  return null;
};

export const Person = ({ x, y, type = 'generic', label, scale = 1, glow, alert, seated }) => {
  const c = personColors[type] || C.textDim;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {glow && <circle cx="0" cy="0" r="22" fill={c} opacity="0.08"/>}
      <circle cx="0" cy="-9" r="3.5" fill={C.bg} stroke={c} strokeWidth="1.2"/>
      <line x1="0" y1="-5.5" x2="0" y2={seated ? 5 : 7} stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="-4" y1="-1" x2="4" y2="-1" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      {!seated && (
        <>
          <line x1="0" y1="7" x2="-3.5" y2="14" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="0" y1="7" x2="3.5" y2="14" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
        </>
      )}
      <PersonAccessory type={type}/>
      {alert && <text x="0" y="-15" textAnchor="middle" fontSize="7" fontFamily={FONT} fill={C.rust} fontWeight="700">!</text>}
      {label && (
        <text x="0" y={seated ? 14 : 22} textAnchor="middle" fontSize="5" fontFamily={FONT} fill={C.textDimmer} letterSpacing="0.5">{label}</text>
      )}
    </g>
  );
};
