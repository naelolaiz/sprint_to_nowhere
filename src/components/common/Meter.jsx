// SPDX-License-Identifier: GPL-3.0-only

import { C } from '../../data/theme.js';

export const Meter = ({ label, value, max, color, danger }) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs mb-1" style={{ color: C.textDim }}>
        <span className="tracking-wider uppercase">{label}</span>
        <span style={{ color: danger ? C.rust : C.text, fontVariantNumeric: 'tabular-nums' }}>
          {Math.round(value)}/{max}
        </span>
      </div>
      <div className="h-1.5" style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}` }}>
        <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};
