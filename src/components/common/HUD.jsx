// SPDX-License-Identifier: GPL-3.0-only

import { C } from '../../data/theme.js';
import { Meter } from './Meter.jsx';

export const HUD = ({ s }) => (
  <div className="grid grid-cols-2 sm:grid-cols-6 gap-x-3 gap-y-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-4" style={{
    borderBottom: `1px solid ${C.border}`, backgroundColor: C.surface,
  }}>
    <Meter label="Tech Debt" value={s.debt} max={100}
      color={s.debt > 75 ? C.rust : s.debt > 50 ? C.amber : C.sage}
      danger={s.debt > 75} />
    <Meter label="Burnout" value={s.burnout} max={100}
      color={s.burnout > 75 ? C.rust : s.burnout > 50 ? C.burnout : C.burnoutDim}
      danger={s.burnout > 75} />
    <Meter label="Morale" value={s.morale} max={100}
      color={s.morale < 25 ? C.rust : s.morale < 50 ? C.amber : C.sage}
      danger={s.morale < 25} />
    <Meter label="Focus" value={s.focus} max={100}
      color={s.focus < 30 ? C.rust : s.focus < 60 ? C.amber : C.sage} />
    <Meter label="Political Capital" value={s.capital} max={5} color={C.blue} />
    <div className="flex items-center justify-end gap-3 text-xs self-end" style={{ color: C.textDim }}>
      <span className="tracking-wider uppercase">S<span style={{ color: C.amber, fontWeight: 600 }}>{s.sprint}</span></span>
      {s.phase === 'execution' && (
        <span className="tracking-wider uppercase">D<span style={{ color: C.amber, fontWeight: 600 }}>{s.currentDay}/5</span></span>
      )}
    </div>
  </div>
);
