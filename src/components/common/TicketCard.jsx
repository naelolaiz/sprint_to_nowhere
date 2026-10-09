// SPDX-License-Identifier: GPL-3.0-only

import { CheckCircle2 } from 'lucide-react';
import { C } from '../../data/theme.js';
import { ticketLabel, ticketColor } from '../../game/ticketDisplay.js';
import { TicketIcon } from './TicketIcon.jsx';
import { tr, msg } from '../../i18n/index.js';

const statusOf = (t) => {
  if (t.shipped) return 'done';
  if (t.progress > 0) return 'in-progress';
  return 'open';
};

const STATUS_STYLE = {
  open:          { label: msg`OPEN`,        fg: C.textDim, border: C.border },
  'in-progress': { label: msg`IN PROGRESS`, fg: C.amber,   border: C.amberDim },
  done:          { label: msg`DONE`,        fg: C.sage,    border: C.sage },
};

// Who is on a ticket is kept in English in the game state ("you",
// "you & Sam", "the assistant") so the logic can read it; this is the label.
const assigneeLabel = (who) => {
  if (who === 'you') return tr`you`;
  const m = /^you & (.+)$/.exec(who);
  if (m) return tr`you & ${m[1]}`;
  if (who === 'Sarah & Jin') return tr`Sarah & Jin`;
  if (who === 'the assistant') return tr`the assistant`;
  return tr(who);
};

export const TicketCard = ({ t, onClick, selected, disabled, compact }) => {
  const pct = (t.progress / t.effort) * 100;
  const typeColor = ticketColor(t);
  const status = statusOf(t);
  const statusStyle = STATUS_STYLE[status];
  const assignee = t.shipped ? t.shippedBy : t.assignedTo;
  // "you" or "you & X" both mean you're on the ticket — not a steal candidate.
  const isTeammateOwned = !t.shipped && assignee && !assignee.startsWith('you');
  const badgeFg = isTeammateOwned ? C.rust : statusStyle.fg;
  const badgeBorder = isTeammateOwned ? C.rustDim : statusStyle.border;
  const stealHint = isTeammateOwned && onClick && !disabled
    ? tr`Working this would mean taking it from @${assigneeLabel(assignee)}. Costs morale.`
    : undefined;
  // top/right/bottom share one color; the left edge is the ticket-type stripe.
  const edgeColor = (c) => `${c} ${c} ${c} ${typeColor}`;
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      title={stealHint}
      className={`${onClick && !disabled ? 'cursor-pointer' : ''} transition-all`}
      style={{
        backgroundColor: selected ? C.surface2 : C.surface,
        // Longhands only: mixing `border` with `borderLeft` in one style
        // object makes React warn on every re-render.
        borderStyle: 'solid',
        borderWidth: '1px 1px 1px 3px',
        borderColor: edgeColor(selected ? C.amber : C.border),
        padding: compact ? '8px 10px' : '10px 12px',
        opacity: t.shipped ? 0.5 : (disabled ? 0.45 : 1),
        cursor: disabled ? 'not-allowed' : undefined,
      }}
      onMouseEnter={(e) => onClick && !disabled && (e.currentTarget.style.borderColor = edgeColor(selected ? C.amber : C.borderHi))}
      onMouseLeave={(e) => onClick && !disabled && (e.currentTarget.style.borderColor = edgeColor(selected ? C.amber : C.border))}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
          <TicketIcon type={t.type} t={t} />
          <span className="text-[10px] tracking-widest uppercase" style={{ color: typeColor }}>
            {ticketLabel(t)}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 tracking-wider" style={{ color: badgeFg, border: `1px solid ${badgeBorder}` }}>
            {tr(statusStyle.label)}{assignee ? ` · @${assigneeLabel(assignee)}` : ''}
          </span>
          {isTeammateOwned && (
            <span className="text-[10px] px-1.5 py-0.5 tracking-wider" style={{ color: C.rust, border: `1px solid ${C.rustDim}` }}>
              {tr`TAKE?`}
            </span>
          )}
          {t.urgent && !t.strategic && !t.legacy && (
            <span className="text-[10px] px-1.5 py-0.5" style={{ color: C.rust, border: `1px solid ${C.rustDim}` }}>
              P0
            </span>
          )}
          {t.scopeCreep > 0 && (
            <span className="text-[10px] px-1.5 py-0.5" style={{ color: C.amber, border: `1px solid ${C.amberDim}` }}>
              {tr`SCOPE+${t.scopeCreep}`}
            </span>
          )}
        </div>
        <span className="text-xs whitespace-nowrap" style={{ color: C.textDim, fontVariantNumeric: 'tabular-nums' }}>
          {Math.round(t.progress)}/{t.effort}h
        </span>
      </div>
      <div className="text-sm mt-1.5 leading-snug" style={{ color: t.shipped ? C.textDim : C.text }}>
        {t.shipped && <CheckCircle2 size={12} className="inline mr-1.5" style={{ color: C.sage }} />}
        {tr(t.title)}
      </div>
      {t.progress > 0 && !t.shipped && (
        <div className="h-0.5 mt-2" style={{ backgroundColor: C.border }}>
          <div className="h-full" style={{ width: `${pct}%`, backgroundColor: typeColor }} />
        </div>
      )}
    </div>
  );
};
