// SPDX-License-Identifier: GPL-3.0-only

import { Skull, Flame, RotateCcw } from 'lucide-react';
import { C, FONT } from '../../data/theme.js';
import { MELTDOWN_FLAVORS } from '../../data/meltdownFlavors.js';
import { Btn } from '../common/Btn.jsx';

export const GameOverPhase = ({ s, onRestart }) => {
  const isMeltdown = s.gameOverReason === 'meltdown';
  const isBurnout = s.gameOverReason === 'burnout' || isMeltdown;
  const meltdown = isMeltdown ? (MELTDOWN_FLAVORS[s.meltdownEnding] || MELTDOWN_FLAVORS.walked_off) : null;
  const Icon = isMeltdown ? Flame : Skull;
  return (
    <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-auto">
      <div className="max-w-lg w-full text-center">
        <Icon size={64} className="mx-auto mb-6" style={{ color: isBurnout ? C.burnout : C.rust }}/>
        <div className="text-xs tracking-[0.4em] mb-3" style={{ color: isBurnout ? C.burnoutDim : C.rustDim }}>
          {meltdown ? meltdown.sub : isBurnout ? 'PERSONAL FAILURE' : 'FATAL ERROR'}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: C.text, letterSpacing: '-0.02em' }}>
          {meltdown ? meltdown.title : isBurnout ? 'Burnt Out' : 'Codebase Unmaintainable'}
        </h1>
        <div className="text-sm mb-8 text-left" style={{ color: C.textDim, lineHeight: 1.7 }}>
          {meltdown ? meltdown.body : isBurnout
            ? 'You stopped responding to Slack on a Tuesday afternoon. Your manager called twice and you let it ring. You typed a resignation email, deleted it, typed it again, sent it. Your manager replied within seven minutes asking if you could "circle back next week." There is no next week.'
            : 'Tech debt reached 100. The senior engineers have circulated a Google Doc titled "A Modest Proposal: Rewrite." A consultant has been hired. You are updating your résumé.'}
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8 text-center">
          <div className="p-3 sm:p-4" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
            <div className="text-2xl" style={{ color: C.amber }}>{s.sprintsSurvived}</div>
            <div className="text-xs tracking-wider uppercase mt-1" style={{ color: C.textDim }}>Sprints Survived</div>
          </div>
          <div className="p-3 sm:p-4" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
            <div className="text-2xl" style={{ color: C.amber }}>{s.totalShipped}</div>
            <div className="text-xs tracking-wider uppercase mt-1" style={{ color: C.textDim }}>Tickets Shipped</div>
          </div>
          <div className="p-3 sm:p-4" style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
            <div className="text-2xl" style={{ color: isBurnout ? C.burnout : C.amber }}>
              {Math.round(isBurnout ? s.burnout : s.debt)}
            </div>
            <div className="text-xs tracking-wider uppercase mt-1" style={{ color: C.textDim }}>
              {isBurnout ? 'Final Burnout' : 'Final Debt'}
            </div>
          </div>
        </div>
        <Btn onClick={onRestart}><span className="flex items-center gap-2"><RotateCcw size={14}/>NEW CAREER</span></Btn>
      </div>
    </div>
  );
};
