// SPDX-License-Identifier: GPL-3.0-only

import { Play } from 'lucide-react';
import { C, FONT } from '../../data/theme.js';
import { Btn } from '../common/Btn.jsx';

export const MenuPhase = ({ onStart }) => (
  <div className="flex-1 flex items-center justify-center p-12">
    <div className="max-w-xl text-center">
      <div className="text-xs tracking-[0.4em] mb-4" style={{ color: C.amberDim }}>A ROGUELIKE OFFICE PARODY</div>
      <h1 className="text-5xl font-bold mb-3 leading-none" style={{ color: C.text, letterSpacing: '-0.02em' }}>
        Sprint to Nowhere
      </h1>
      <div className="text-sm mb-10" style={{ color: C.textDim, lineHeight: 1.6 }}>
        You are a developer. You will plan a sprint.<br/>
        Reality will intrude. You will adapt.<br/>
        The codebase will rot. This is the natural order.
      </div>
      <div className="text-left mb-10 p-5 text-xs leading-relaxed" style={{
        backgroundColor: C.surface, border: `1px solid ${C.border}`, color: C.textDim,
      }}>
        <div className="mb-3" style={{ color: C.amber }}>// HOW TO PLAY</div>
        <div className="mb-1.5">→ Each sprint, choose tickets from the backlog (60-pt default capacity, configurable)</div>
        <div className="mb-1.5">→ Each day, an event fires. Choose how to handle it.</div>
        <div className="mb-1.5">→ Then pick a ticket, or pair, hide, ask for help, or get coffee.</div>
        <div className="mb-1.5">→ Refactors lower debt. Features and rushed work raise it.</div>
        <div className="mb-1.5">→ Every interaction also raises burnout. Weekends recover some.</div>
        <div className="mb-1.5">→ Above 50% debt or burnout, you work slower.</div>
        <div style={{ color: C.rust }}>→ Either bar at 100% ends your career.</div>
      </div>
      <Btn onClick={onStart}><span className="flex items-center gap-2"><Play size={14}/>BEGIN CAREER</span></Btn>
    </div>
  </div>
);
