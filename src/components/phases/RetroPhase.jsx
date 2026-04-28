// SPDX-License-Identifier: GPL-3.0-only

import { CheckCircle2, XCircle, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { C, FONT } from '../../data/theme.js';
import { TicketIcon } from '../common/TicketIcon.jsx';
import { Btn } from '../common/Btn.jsx';

export const RetroPhase = ({ s, onNext }) => {
  const debtChange = s.debt - s.debtAtSprintStart;
  const notShipped = s.sprintPlan.filter(t => !t.shipped);
  const flavor =
    s.sprintCancelled.length > 0 ? `${s.sprintCancelled.length} strategic initiative${s.sprintCancelled.length > 1 ? 's were' : ' was'} cancelled. Hours of work, gone. The VP is "exploring new opportunities."` :
    s.sprintShipped.length === 0 ? "An entire sprint and nothing shipped. The standup will be tense." :
    s.sprintShipped.every(t => t.type === 'feature') ? "Lots of shipping! No refactoring! Sustainable!" :
    s.sprintBumped.length > 0 ? `${s.sprintBumped.length} refactor${s.sprintBumped.length > 1 ? 's were' : ' was'} sacrificed. We'll get to it next sprint.` :
    debtChange < 0 ? "You actually paid down debt. Take a screenshot — this rarely happens." :
    "A normal sprint. The codebase is slightly worse than before.";

  return (
    <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
      <div className="max-w-2xl w-full">
        <div className="text-xs tracking-[0.3em] mb-1" style={{ color: C.amberDim }}>SPRINT {s.sprint} — RETROSPECTIVE</div>
        <div className="text-2xl mb-6" style={{ color: C.text }}>What went well? What didn't?</div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, padding: 16 }}>
            <div className="text-xs tracking-wider uppercase mb-3 flex items-center gap-2" style={{ color: C.sage }}>
              <CheckCircle2 size={12}/>SHIPPED ({s.sprintShipped.length})
            </div>
            {s.sprintShipped.length === 0 ? (
              <div className="text-sm italic" style={{ color: C.textDimmer }}>Nothing.</div>
            ) : s.sprintShipped.map(t => (
              <div key={t.id} className="text-sm mb-1.5 flex items-start gap-2" style={{ color: C.text }}>
                <TicketIcon type={t.type} t={t} size={12}/>
                <span className="flex-1">{t.title}</span>
                <span className="text-xs" style={{ color: t.debtChange > 0 ? C.rust : C.sage }}>
                  {t.debtChange >= 0 ? '+' : ''}{t.debtChange}
                </span>
              </div>
            ))}
          </div>
          <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, padding: 16 }}>
            <div className="text-xs tracking-wider uppercase mb-3 flex items-center gap-2" style={{ color: C.rust }}>
              <XCircle size={12}/>UNSHIPPED ({notShipped.length})
            </div>
            {notShipped.length === 0 ? (
              <div className="text-sm italic" style={{ color: C.textDimmer }}>None! Rare.</div>
            ) : notShipped.map(t => (
              <div key={t.id} className="text-sm mb-1.5 flex items-start gap-2" style={{ color: C.textDim }}>
                <TicketIcon type={t.type} t={t} size={12}/>
                <span className="flex-1">{t.title}</span>
                <span className="text-xs">{Math.round(t.progress)}/{t.effort}h</span>
              </div>
            ))}
          </div>
        </div>

        {s.sprintBumped.length > 0 && (
          <div className="mb-4 p-4" style={{ backgroundColor: C.surface, border: `1px solid ${C.rustDim}` }}>
            <div className="text-xs tracking-wider uppercase mb-2" style={{ color: C.rust }}>DEPRIORITIZED</div>
            {s.sprintBumped.map((b, i) => (
              <div key={i} className="text-sm" style={{ color: C.textDim }}>
                <span style={{ textDecoration: 'line-through' }}>{b.bumped}</span> → {b.replacement}
              </div>
            ))}
          </div>
        )}

        {s.sprintCancelled.length > 0 && (
          <div className="mb-6 p-4" style={{ backgroundColor: C.surface, border: `1px solid ${C.rustDim}` }}>
            <div className="text-xs tracking-wider uppercase mb-2 flex items-center gap-2" style={{ color: C.rust }}>
              <XCircle size={12}/>CANCELLED INITIATIVES
            </div>
            {s.sprintCancelled.map((c, i) => (
              <div key={i} className="text-sm" style={{ color: C.textDim }}>
                <span style={{ textDecoration: 'line-through' }}>{c.title}</span>
                <span className="ml-2 text-xs" style={{ color: C.rust }}>({c.hoursLost}h lost)</span>
              </div>
            ))}
          </div>
        )}

        <div className="mb-6 p-5" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs tracking-wider uppercase" style={{ color: C.textDim }}>Tech Debt</div>
            <div className="flex items-center gap-2 text-sm" style={{
              color: debtChange > 0 ? C.rust : debtChange < 0 ? C.sage : C.textDim,
            }}>
              {debtChange > 0 ? <TrendingUp size={14}/> : debtChange < 0 ? <TrendingDown size={14}/> : null}
              {s.debtAtSprintStart} → {Math.round(s.debt)} ({debtChange >= 0 ? '+' : ''}{Math.round(debtChange)})
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs tracking-wider uppercase" style={{ color: C.textDim }}>Burnout (after weekend recovery)</div>
            <div className="text-sm" style={{ color: s.burnout > 70 ? C.rust : s.burnout > 40 ? C.burnout : C.textDim }}>
              {Math.round(s.burnout)} → {Math.max(0, Math.round(s.burnout) - 12)} <span style={{ color: C.sage }}>(−12)</span>
            </div>
          </div>
          <div className="text-sm italic mt-3" style={{ color: C.textDim }}>"{flavor}"</div>
        </div>

        <div className="flex justify-end">
          <Btn onClick={onNext}>
            <span className="flex items-center gap-2">PLAN NEXT SPRINT <ArrowRight size={14}/></span>
          </Btn>
        </div>
      </div>
    </div>
  );
};
