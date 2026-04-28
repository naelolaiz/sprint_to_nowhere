// SPDX-License-Identifier: GPL-3.0-only

import { ArrowRight } from 'lucide-react';
import { C, FONT } from '../../data/theme.js';
import { getEventNode } from '../../game/state.js';
import { renderCast } from '../../game/cast.js';
import { TicketCard } from '../common/TicketCard.jsx';
import { BurnDown } from '../common/BurnDown.jsx';
import { Btn } from '../common/Btn.jsx';
import { Stage } from '../scene/Stage.jsx';

export const ExecutionPhase = ({ s, onChoose, onWork, onNextDay, onSkipWork, onAction }) => {
  const Ev = s.currentEvent;
  const EvIcon = Ev?.icon;
  const workableTickets = s.sprintPlan.filter(t => !t.shipped && t.progress < t.effort);

  return (
    <div className="flex-1 flex flex-col lg:grid lg:grid-cols-5 gap-0 lg:overflow-hidden">
      {/* Left: stage + action area */}
      <div className="lg:col-span-3 flex flex-col lg:overflow-hidden lg:border-r" style={{ borderColor: C.border }}>
        {/* STAGE */}
        <div className="h-44 sm:h-56 lg:h-60 shrink-0" style={{
          backgroundColor: C.bg,
          borderBottom: `1px solid ${C.border}`,
          backgroundImage: `linear-gradient(to bottom, ${C.surface} 0%, ${C.bg} 100%)`,
        }}>
          <Stage subPhase={s.subPhase} currentEvent={s.currentEvent} debt={s.debt} burnout={s.burnout} morale={s.morale}/>
        </div>

        {/* Action area (scrollable on desktop, flows on mobile) */}
        <div className="flex-1 p-3 sm:p-6 lg:overflow-auto">
        <div className="text-xs tracking-[0.3em] mb-4" style={{ color: C.amberDim }}>
          DAY {s.currentDay} OF 5 · {s.dayFocusRemaining.toFixed(1)}h FOCUS LEFT
        </div>

        {s.subPhase === 'event' && Ev && (() => {
          const node = getEventNode(Ev, s.dialogNode);
          let rawDesc = node.description;
          // Variant resolution: prefer node-level descriptions array, then event-level.
          // The variant index is locked into eventCast at fire time so the same one
          // shows for the duration of the dialog.
          if (!rawDesc) {
            const idx = (s.eventCast && s.eventCast._descIdx) || 0;
            if (Array.isArray(node.descriptions) && node.descriptions.length > 0) {
              rawDesc = node.descriptions[idx % node.descriptions.length];
            } else if (Array.isArray(Ev.descriptions) && Ev.descriptions.length > 0) {
              rawDesc = Ev.descriptions[idx % Ev.descriptions.length];
            }
          }
          const desc = typeof rawDesc === 'function'
            ? rawDesc(s)
            : renderCast(rawDesc, s.eventCast);
          const isMultiTurn = !!Ev.nodes;
          const isStartNode = !isMultiTurn || s.dialogNode === (Ev.start || 'start');
          return (
          <div className="p-4 sm:p-6" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
            {isStartNode && (
              <div className="flex items-center gap-3 mb-3">
                {EvIcon && <EvIcon size={20} style={{ color: C.amber }}/>}
                <div className="text-base font-semibold" style={{ color: C.text }}>{renderCast(Ev.title, s.eventCast)}</div>
              </div>
            )}
            {!isStartNode && (
              <div className="text-[10px] tracking-[0.3em] mb-2" style={{ color: C.amberDim }}>
                {renderCast(Ev.title, s.eventCast).toUpperCase()} · CONTINUED
              </div>
            )}
            <div className="text-sm mb-6 leading-relaxed" style={{ color: C.textDim }}>
              {desc}
            </div>
            <div className="space-y-2">
              {node.choices.map((c, i) => (
                <button key={i} onClick={() => onChoose(c)}
                  className="w-full text-left px-4 py-3 text-sm transition-colors"
                  style={{
                    backgroundColor: C.surface2, color: C.text,
                    border: `1px solid ${C.border}`, fontFamily: FONT,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.amber; e.currentTarget.style.backgroundColor = C.surface; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.backgroundColor = C.surface2; }}
                >
                  → {renderCast(c.label, s.eventCast)}{c.next ? ' …' : ''}
                </button>
              ))}
            </div>
          </div>
          );
        })()}

        {s.subPhase === 'work' && (
          <div>
            <div className="text-sm mb-4" style={{ color: C.textDim }}>
              {s.dayFocusRemaining > 0
                ? `What do you want to do? ${s.dayFocusRemaining.toFixed(1)}h remaining.`
                : 'No hours left. End the day.'}
            </div>

            {/* Active bonuses display */}
            {(s.pairBonus || s.boothBonus) && (
              <div className="text-xs mb-3 p-2" style={{ color: C.amber, backgroundColor: C.surface, border: `1px solid ${C.amberDim}` }}>
                Active for next ticket work:
                {s.pairBonus && <span className="ml-2">⊕ pairing +50%</span>}
                {s.boothBonus && <span className="ml-2">⊕ focus mode +30%</span>}
              </div>
            )}

            {s.dayFocusRemaining > 0 && workableTickets.length > 0 && (
              <>
                <div className="text-[10px] tracking-widest uppercase mb-2" style={{ color: C.textDimmer }}>
                  Sit down at your computer
                </div>
                <div className="space-y-2 mb-5">
                  {workableTickets.map(t => (
                    <TicketCard key={t.id} t={t} onClick={() => onWork(t.id)} />
                  ))}
                </div>

                <div className="text-[10px] tracking-widest uppercase mb-2" style={{ color: C.textDimmer }}>
                  Or do something else
                </div>
                <div className="grid grid-cols-1 gap-2 mb-6">
                  <button
                    onClick={() => onAction('pair')}
                    disabled={s.pairBonus || s.dayFocusRemaining < 1.5 || s.capital < 0.5}
                    className="text-left px-3 py-2.5 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ backgroundColor: C.surface2, color: C.text, border: `1px solid ${C.border}`, fontFamily: FONT }}
                    onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = C.amber)}
                    onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = C.border)}
                  >
                    <span style={{ color: C.amber }}>👥 Pair with Sarah </span>
                    <span style={{ color: C.textDim }}>· 1.5h, costs 0.5 capital · +50% on your next ticket work</span>
                  </button>
                  <button
                    onClick={() => onAction('booth')}
                    disabled={s.boothBonus || s.capital < 1}
                    className="text-left px-3 py-2.5 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ backgroundColor: C.surface2, color: C.text, border: `1px solid ${C.border}`, fontFamily: FONT }}
                    onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = C.amber)}
                    onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = C.border)}
                  >
                    <span style={{ color: C.amber }}>🚪 Hide in a phone booth </span>
                    <span style={{ color: C.textDim }}>· 0h, costs 1 capital · +30% on your next ticket work</span>
                  </button>
                  <button
                    onClick={() => onAction('coffee')}
                    disabled={s.dayFocusRemaining < 1}
                    className="text-left px-3 py-2.5 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ backgroundColor: C.surface2, color: C.text, border: `1px solid ${C.border}`, fontFamily: FONT }}
                    onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = C.amber)}
                    onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = C.border)}
                  >
                    <span style={{ color: C.amber }}>☕ Take a coffee break </span>
                    <span style={{ color: C.textDim }}>· 1h · risk of small talk</span>
                  </button>
                  <button
                    onClick={() => onAction('ask')}
                    disabled={s.dayFocusRemaining < 1 || s.capital < 0.5}
                    className="text-left px-3 py-2.5 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ backgroundColor: C.surface2, color: C.text, border: `1px solid ${C.border}`, fontFamily: FONT }}
                    onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = C.amber)}
                    onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = C.border)}
                  >
                    <span style={{ color: C.amber }}>🙋 Ask Jin for help </span>
                    <span style={{ color: C.textDim }}>· 1h, costs 0.5 capital · unstick a stuck ticket (small progress boost)</span>
                  </button>
                  <button
                    onClick={() => onAction('lunch')}
                    disabled={s.dayFocusRemaining < 1}
                    className="text-left px-3 py-2.5 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ backgroundColor: C.surface2, color: C.text, border: `1px solid ${C.border}`, fontFamily: FONT }}
                    onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = C.amber)}
                    onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = C.border)}
                  >
                    <span style={{ color: C.amber }}>🥪 Take a real lunch </span>
                    <span style={{ color: C.textDim }}>· 1h · −6 burnout, +22 focus, +8 morale</span>
                  </button>
                  <button
                    onClick={() => onAction('walk')}
                    disabled={s.dayFocusRemaining < 0.5}
                    className="text-left px-3 py-2.5 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ backgroundColor: C.surface2, color: C.text, border: `1px solid ${C.border}`, fontFamily: FONT }}
                    onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = C.amber)}
                    onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = C.border)}
                  >
                    <span style={{ color: C.amber }}>🚶 Take a short walk </span>
                    <span style={{ color: C.textDim }}>· 0.5h · −3 burnout, +10 focus, +3 morale</span>
                  </button>
                </div>
              </>
            )}

            {(() => {
              if (s.stayedLate) return null;
              const hard = s.sprintPlan.find(t =>
                !t.shipped && t.progress > 0 && t.progress < t.effort &&
                (t.type === 'bug' || t.effort >= 5));
              if (!hard) return null;
              return (
                <div className="mb-6">
                  <div className="text-[10px] tracking-widest uppercase mb-2" style={{ color: C.textDimmer }}>
                    Push past the workday
                  </div>
                  <button
                    onClick={() => onAction('late')}
                    className="w-full text-left px-3 py-2.5 text-sm transition-colors"
                    style={{ backgroundColor: C.surface2, color: C.text, border: `1px solid ${C.border}`, fontFamily: FONT }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.amber)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
                  >
                    <span style={{ color: C.amber }}>🌙 Stay late on "{hard.title}" </span>
                    <span style={{ color: C.textDim }}>· +2h tonight · +8 burnout, −2 morale · counts as a bad day</span>
                  </button>
                </div>
              );
            })()}

            {(s.dayFocusRemaining === 0 || workableTickets.length === 0) && (
              <div className="text-sm italic p-4 text-center mb-4" style={{
                color: C.textDimmer, border: `1px dashed ${C.border}`,
              }}>
                {workableTickets.length === 0 ? 'All sprint tickets shipped or blocked.' : 'No focus left for today.'}
              </div>
            )}

            {(s.dayFocusRemaining === 0 || workableTickets.length === 0) && (
              <Btn onClick={onSkipWork} full>
                <span className="flex items-center justify-center gap-2">
                  WRAP UP DAY <ArrowRight size={14}/>
                </span>
              </Btn>
            )}
          </div>
        )}

        {s.subPhase === 'day-summary' && (
          <div>
            <div style={{
              backgroundColor: C.surface, border: `1px solid ${C.border}`, padding: 20, marginBottom: 16,
            }}>
              <div className="text-xs tracking-wider uppercase mb-3" style={{ color: C.textDim }}>
                Day {s.currentDay} log
              </div>
              <div className="space-y-2 text-sm" style={{ color: C.text }}>
                {s.dayLog.map((l, i) => <div key={i} className="leading-relaxed">{l}</div>)}
              </div>
            </div>
            <Btn onClick={onNextDay} full>
              <span className="flex items-center justify-center gap-2">
                {s.currentDay >= 5 ? 'END SPRINT' : `BEGIN DAY ${s.currentDay + 1}`} <ArrowRight size={14}/>
              </span>
            </Btn>
          </div>
        )}
        </div>
      </div>

      {/* Right: burn-down + sprint plan */}
      <div className="lg:col-span-2 p-3 sm:p-6 lg:overflow-auto lg:border-t-0 border-t" style={{ backgroundColor: C.bg, borderColor: C.border }}>
        <BurnDown
          history={s.hourHistory}
          currentRemaining={s.sprintPlan.reduce((sum, t) => sum + Math.max(0, t.effort - t.progress), 0)}
          currentDay={s.currentDay}
          dayFocusRemaining={s.dayFocusRemaining}
          dayBudget={s.dayFocus || 9}
        />
        <div className="text-xs tracking-wider uppercase mb-3" style={{ color: C.textDim }}>
          Sprint Plan
        </div>
        <div className="space-y-2">
          {s.sprintPlan.map(t => <TicketCard key={t.id} t={t} compact />)}
        </div>
      </div>
    </div>
  );
};
