// SPDX-License-Identifier: GPL-3.0-only

import { ArrowRight } from 'lucide-react';
import { C, FONT } from '../../data/theme.js';
import { TicketCard } from '../common/TicketCard.jsx';
import { Btn } from '../common/Btn.jsx';
import { PlanningScene } from '../scene/PlanningScene.jsx';

export const PlanningPhase = ({ s, onToggle, onStart, onSetCapacity }) => {
  const planned = s.sprintPlan;
  const capacity = planned.reduce((sum, t) => sum + t.effort, 0);
  const cap = s.sprintCapacity ?? 60;
  const overCapacity = capacity > cap;
  const hasRefactor = planned.some(t => t.type === 'refactor');

  return (
    <div className="flex-1 flex flex-col lg:overflow-hidden">
      {/* Sprint planning scene — the team is here, mostly */}
      <div className="h-44 sm:h-52 lg:h-56 shrink-0" style={{
        backgroundColor: C.bg,
        borderBottom: `1px solid ${C.border}`,
        backgroundImage: `linear-gradient(to bottom, ${C.surface} 0%, ${C.bg} 100%)`,
      }}>
        <PlanningScene sprint={s.sprint}/>
      </div>

      {/* Existing planning interactions */}
      <div className="flex-1 flex flex-col p-3 sm:p-6 gap-4 sm:gap-6 lg:overflow-auto">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="text-xs tracking-[0.3em] mb-1" style={{ color: C.amberDim }}>SPRINT {s.sprint} — PLANNING</div>
          <div className="text-base sm:text-lg" style={{ color: C.text }}>
            Pick tickets for the sprint. {cap}-point capacity. Try not to laugh (or to sleep).
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs flex-wrap sm:flex-shrink-0" style={{ color: C.textDim }}>
          <span className="tracking-wider uppercase">Capacity</span>
          {[40, 50, 60, 70, 80].map(c => (
            <button
              key={c}
              onClick={() => onSetCapacity(c)}
              className="px-2 py-1 transition-colors"
              style={{
                backgroundColor: cap === c ? C.surface : 'transparent',
                color: cap === c ? C.amber : C.textDim,
                border: `1px solid ${cap === c ? C.amber : C.border}`,
                fontFamily: FONT,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      {/* Mobile-only sticky summary so the points sum stays visible while scrolling the backlog */}
      <div
        className="lg:hidden sticky top-0 z-10 -mx-3 px-3 py-2 flex items-center gap-3 text-xs"
        style={{
          backgroundColor: C.surface,
          borderBottom: `1px solid ${C.border}`,
          color: C.textDim,
        }}
      >
        <span className="tracking-wider uppercase whitespace-nowrap">
          Plan · {planned.length}
        </span>
        <div className="flex-1 h-1" style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}` }}>
          <div className="h-full transition-all" style={{
            width: `${Math.min(100, (capacity / cap) * 100)}%`,
            backgroundColor: overCapacity ? C.rust : capacity > cap * 0.8 ? C.amber : C.sage,
          }} />
        </div>
        <span className="whitespace-nowrap" style={{ color: overCapacity ? C.rust : C.text, fontVariantNumeric: 'tabular-nums' }}>
          {capacity}/{cap}pt
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 flex-1">
        <div>
          <div className="text-xs tracking-wider uppercase mb-3" style={{ color: C.textDim }}>
            Backlog ({s.backlog.length})
          </div>
          <div className="space-y-2">
            {s.backlog.map(t => {
              const inPlan = planned.some(p => p.id === t.id);
              return (
                <TicketCard key={t.id} t={t} onClick={() => onToggle(t.id)} selected={inPlan} />
              );
            })}
          </div>
        </div>
        <div>
          <div className="text-xs tracking-wider uppercase mb-3 flex justify-between" style={{ color: C.textDim }}>
            <span>Sprint Plan ({planned.length})</span>
            <span style={{ color: overCapacity ? C.rust : C.textDim, fontVariantNumeric: 'tabular-nums' }}>
              {capacity}pt / {cap}pt
            </span>
          </div>
          <div className="h-1 mb-4" style={{ backgroundColor: C.surface2, border: `1px solid ${C.border}` }}>
            <div className="h-full transition-all" style={{
              width: `${Math.min(100, (capacity / cap) * 100)}%`,
              backgroundColor: overCapacity ? C.rust : capacity > cap * 0.8 ? C.amber : C.sage,
            }} />
          </div>
          {planned.length === 0 ? (
            <div className="text-sm italic p-4 text-center" style={{
              color: C.textDimmer, border: `1px dashed ${C.border}`,
            }}>
              No tickets selected. Click backlog items to add them.
            </div>
          ) : (
            <div className="space-y-2">
              {planned.map(t => (
                <TicketCard key={t.id} t={t} onClick={() => onToggle(t.id)} compact />
              ))}
            </div>
          )}
          {!hasRefactor && planned.length > 0 && (
            <div className="text-xs mt-4 p-3" style={{
              color: C.amber, backgroundColor: C.surface, border: `1px solid ${C.amberDim}`,
            }}>
              ⚠ No refactors planned. Debt only goes up from here.
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Btn onClick={onStart} disabled={planned.length === 0 || overCapacity}>
          <span className="flex items-center gap-2">START SPRINT <ArrowRight size={14}/></span>
        </Btn>
      </div>
      </div>
    </div>
  );
};
