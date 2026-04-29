// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';

export const ScreenContent = ({ kind }) => {
  if (kind === 'fire') return (
    <g>
      <rect x="-11" y="-13" width="22" height="9" fill={C.rust} opacity="0.3"/>
      <text x="0" y="-9" textAnchor="middle" fontSize="3.5" fontWeight="700" fontFamily={FONT} fill={C.rust}>P0 ALERT</text>
      <text x="0" y="-6.2" textAnchor="middle" fontSize="2.4" fontFamily={FONT} fill={C.rust}>BigCorp dashboard</text>
      <text x="0" y="-4.2" textAnchor="middle" fontSize="2.4" fontFamily={FONT} fill={C.rust}>showing wrong data</text>
    </g>
  );
  if (kind === 'email') return (
    <g>
      <rect x="-11" y="-13" width="22" height="2" fill={C.surface2}/>
      <text x="-10" y="-9" fontSize="2" fontFamily={FONT} fill={C.amberDim}>FROM: ceo@</text>
      <text x="-10" y="-7" fontSize="2" fontFamily={FONT} fill={C.text}>RE: Our commit-</text>
      <text x="-10" y="-5" fontSize="2" fontFamily={FONT} fill={C.text}>ment to ethics</text>
    </g>
  );
  if (kind === 'meeting') {
    // 3×2 Zoom-grid: tiny avatars on a black call screen. The active speaker
    // (top-left) is rimmed in amber; one tile is camera-off; one is on phone.
    const tiles = [
      { x: -8.5, y: -10.5, color: C.text,    active: true,  cam: true },
      { x: -2.5, y: -10.5, color: C.sage,    active: false, cam: true },
      { x:  3.5, y: -10.5, color: C.blue,    active: false, cam: true },
      { x: -8.5, y:  -6.5, color: C.amberDim,active: false, cam: false }, // camera off
      { x: -2.5, y:  -6.5, color: C.rust,    active: false, cam: true },  // brad-ish
      { x:  3.5, y:  -6.5, color: C.text,    active: false, cam: true },
    ];
    return (
      <g>
        <rect x="-11" y="-13" width="22" height="9" fill="#0a0a0a"/>
        {tiles.map((t, i) => (
          <g key={i}>
            <rect x={t.x - 2.6} y={t.y - 1.7} width="5.2" height="3.4" fill={C.surface2}
                  stroke={t.active ? C.amber : '#000'} strokeWidth={t.active ? 0.4 : 0.25}/>
            {t.cam ? (
              <>
                <circle cx={t.x} cy={t.y - 0.4} r="0.7" fill={t.color} opacity="0.85"/>
                <path d={`M ${t.x - 1.3} ${t.y + 1.3} Q ${t.x} ${t.y + 0.2} ${t.x + 1.3} ${t.y + 1.3}`}
                      stroke={t.color} strokeWidth="0.4" fill="none" opacity="0.85"/>
              </>
            ) : (
              <text x={t.x} y={t.y + 0.6} textAnchor="middle" fontSize="2"
                    fontFamily={FONT} fill={C.textDimmer}>cam off</text>
            )}
          </g>
        ))}
      </g>
    );
  }
  if (kind === 'survey') return (
    <g>
      <rect x="-11" y="-13" width="22" height="9" fill={C.surface2}/>
      <text x="0" y="-10" textAnchor="middle" fontSize="2.5" fontFamily={FONT} fill={C.text}>ENGAGEMENT</text>
      <line x1="-9" y1="-8.5" x2="9" y2="-8.5" stroke={C.border} strokeWidth="0.3"/>
      <text x="-9" y="-6" fontSize="1.8" fontFamily={FONT} fill={C.textDim}>Q1: ◯◯●◯◯</text>
      <text x="-9" y="-4" fontSize="1.8" fontFamily={FONT} fill={C.textDim}>Q2: ◯◯●◯◯</text>
    </g>
  );
  if (kind === 'down') return (
    <g>
      <rect x="-11" y="-13" width="22" height="9" fill={C.surface2}/>
      <text x="0" y="-9.5" textAnchor="middle" fontSize="2.6" fontWeight="700" fontFamily={FONT} fill={C.rust}>503</text>
      <text x="0" y="-7" textAnchor="middle" fontSize="2.2" fontFamily={FONT} fill={C.rustDim}>Server error</text>
      <text x="0" y="-5" textAnchor="middle" fontSize="2.2" fontFamily={FONT} fill={C.textDimmer}>please try again</text>
    </g>
  );
  if (kind === 'sdk') return (
    <g>
      <rect x="-11" y="-13" width="22" height="9" fill={C.surface2}/>
      <text x="-9" y="-10" fontSize="2.4" fontWeight="700" fontFamily={FONT} fill={C.rust}>TypeError</text>
      <text x="-9" y="-7.5" fontSize="2" fontFamily={FONT} fill={C.rustDim}>Cannot read</text>
      <text x="-9" y="-5.5" fontSize="2" fontFamily={FONT} fill={C.rustDim}>'token' of</text>
      <text x="-9" y="-3.5" fontSize="2" fontFamily={FONT} fill={C.rustDim}>undefined</text>
    </g>
  );
  if (kind === 'pivot') return (
    <g>
      <rect x="-11" y="-13" width="22" height="9" fill={C.rust} opacity="0.25"/>
      <text x="0" y="-9.5" textAnchor="middle" fontSize="2.6" fontWeight="700" fontFamily={FONT} fill={C.rust}>NEW DIRECTION</text>
      <text x="0" y="-7" textAnchor="middle" fontSize="2.2" fontFamily={FONT} fill={C.rustDim}>(par-ent branch:</text>
      <text x="0" y="-5" textAnchor="middle" fontSize="2.2" fontFamily={FONT} fill={C.rustDim}>scrap_v2_FINAL)</text>
    </g>
  );
  // default: code
  return (
    <g>
      <rect x="-11" y="-13" width="22" height="2" fill={C.surface2}/>
      <line x1="-10" y1="-10" x2="-3" y2="-10" stroke={C.sage} strokeWidth="0.5"/>
      <line x1="-9" y1="-8" x2="3" y2="-8" stroke={C.amber} strokeWidth="0.5"/>
      <line x1="-9" y1="-6" x2="-1" y2="-6" stroke={C.text} strokeWidth="0.5"/>
      <line x1="-7" y1="-4" x2="5" y2="-4" stroke={C.blue} strokeWidth="0.5"/>
    </g>
  );
};
