// SPDX-License-Identifier: GPL-3.0-only

import { CheckCircle2 } from 'lucide-react';
import { C } from '../../data/theme.js';
import { ticketLabel, ticketColor } from '../../game/ticketDisplay.js';
import { TicketIcon } from './TicketIcon.jsx';

const statusOf = (t) => {
  if (t.shipped) return 'done';
  if (t.progress > 0) return 'in-progress';
  return 'open';
};

const STATUS_STYLE = {
  open:          { label: 'OPEN',        fg: C.textDim, border: C.border },
  'in-progress': { label: 'IN PROGRESS', fg: C.amber,   border: C.amberDim },
  done:          { label: 'DONE',        fg: C.sage,    border: C.sage },
};

export const TicketCard = ({ t, onClick, selected, disabled, compact }) => {
  const pct = (t.progress / t.effort) * 100;
  const typeColor = ticketColor(t);
  const status = statusOf(t);
  const statusStyle = STATUS_STYLE[status];
  const assignee = t.shipped ? t.shippedBy : t.assignedTo;
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`${onClick && !disabled ? 'cursor-pointer' : ''} transition-all`}
      style={{
        backgroundColor: selected ? C.surface2 : C.surface,
        border: `1px solid ${selected ? C.amber : C.border}`,
        borderLeft: `3px solid ${typeColor}`,
        padding: compact ? '8px 10px' : '10px 12px',
        opacity: t.shipped ? 0.5 : 1,
      }}
      onMouseEnter={(e) => onClick && !disabled && (e.currentTarget.style.borderColor = selected ? C.amber : C.borderHi)}
      onMouseLeave={(e) => onClick && !disabled && (e.currentTarget.style.borderColor = selected ? C.amber : C.border)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
          <TicketIcon type={t.type} t={t} />
          <span className="text-[10px] tracking-widest uppercase" style={{ color: typeColor }}>
            {ticketLabel(t)}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 tracking-wider" style={{ color: statusStyle.fg, border: `1px solid ${statusStyle.border}` }}>
            {statusStyle.label}{assignee ? ` · @${assignee}` : ''}
          </span>
          {t.urgent && !t.strategic && !t.legacy && (
            <span className="text-[10px] px-1.5 py-0.5" style={{ color: C.rust, border: `1px solid ${C.rustDim}` }}>
              P0
            </span>
          )}
          {t.scopeCreep > 0 && (
            <span className="text-[10px] px-1.5 py-0.5" style={{ color: C.amber, border: `1px solid ${C.amberDim}` }}>
              SCOPE+{t.scopeCreep}
            </span>
          )}
        </div>
        <span className="text-xs whitespace-nowrap" style={{ color: C.textDim, fontVariantNumeric: 'tabular-nums' }}>
          {Math.round(t.progress)}/{t.effort}h
        </span>
      </div>
      <div className="text-sm mt-1.5 leading-snug" style={{ color: t.shipped ? C.textDim : C.text }}>
        {t.shipped && <CheckCircle2 size={12} className="inline mr-1.5" style={{ color: C.sage }} />}
        {t.title}
      </div>
      {t.progress > 0 && !t.shipped && (
        <div className="h-0.5 mt-2" style={{ backgroundColor: C.border }}>
          <div className="h-full" style={{ width: `${pct}%`, backgroundColor: typeColor }} />
        </div>
      )}
    </div>
  );
};
