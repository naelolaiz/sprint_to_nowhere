// SPDX-License-Identifier: GPL-3.0-only

import { Award, RotateCcw } from 'lucide-react';
import { C, FONT } from '../../data/theme.js';
import { Meter } from '../common/Meter.jsx';
import { Btn } from '../common/Btn.jsx';

export const VictoryPhase = ({ s, onRestart }) => (
  <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
    <div className="max-w-lg text-center">
      <Award size={64} className="mx-auto mb-6" style={{ color: C.sage }}/>
      <div className="text-xs tracking-[0.4em] mb-3" style={{ color: C.sageDim }}>STATISTICALLY IMPROBABLE</div>
      <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: C.text, letterSpacing: '-0.02em' }}>
        Healthy Codebase
      </h1>
      <div className="text-sm mb-8" style={{ color: C.textDim, lineHeight: 1.7 }}>
        After {s.sprint} sprints, the tech debt is below 15. The tests pass. The docs are accurate. New hires understand the deployment process.<br/><br/>
        This has never happened before. Someone is filming a documentary.
      </div>
      <Btn onClick={onRestart}><span className="flex items-center gap-2"><RotateCcw size={14}/>PLAY AGAIN</span></Btn>
    </div>
  </div>
);
