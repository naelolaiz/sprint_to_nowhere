// SPDX-License-Identifier: GPL-3.0-only

import { useState, useSyncExternalStore } from 'react';
import { C, FONT } from './data/theme.js';
import { initialState } from './game/state.js';
import * as flow from './game/flow.js';
import { HUD } from './components/common/HUD.jsx';
import { MenuPhase } from './components/phases/MenuPhase.jsx';
import { PlanningPhase } from './components/phases/PlanningPhase.jsx';
import { ExecutionPhase } from './components/phases/ExecutionPhase.jsx';
import { RetroPhase } from './components/phases/RetroPhase.jsx';
import { GameOverPhase } from './components/phases/GameOverPhase.jsx';
import { VictoryPhase } from './components/phases/VictoryPhase.jsx';
import { LanguageSwitcher } from './components/common/LanguageSwitcher.jsx';
import { tr, getLocale, subscribe } from './i18n/index.js';

export default function SprintToNowhere() {
  // Lazy initializer: `initialState` resets the ticket-id counter, and the
  // eager form `useState(initialState())` re-ran it on EVERY render — so
  // tickets forced into a sprint (cleanups, CEO specials, strategic
  // initiatives) reused ids already in the plan, and clicking one of them
  // could work on, grow, or cancel a different ticket with the same id.
  const [s, setS] = useState(initialState);
  // Every string is translated while rendering, so a language change only
  // has to re-render from the top.
  useSyncExternalStore(subscribe, getLocale);

  const startGame = () => setS(flow.startGame);
  const toggleTicket = (id) => setS(prev => flow.toggleTicket(prev, id));
  const setCapacity = (c) => setS(prev => flow.setCapacity(prev, c));
  const startSprint = () => setS(flow.startSprint);
  const chooseEvent = (choice) => setS(prev => flow.chooseEvent(prev, choice));
  const work = (id) => setS(prev => flow.work(prev, id));
  const skipWork = () => setS(flow.skipWork);
  const action = (kind) => setS(prev => flow.action(prev, kind));
  const nextDay = () => setS(flow.nextDay);
  const nextSprint = () => setS(flow.nextSprint);
  const restart = () => setS(flow.restart());

  const fontLink = (
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
  );

  return (
    <div className="min-h-screen flex flex-col" style={{
      backgroundColor: C.bg, color: C.text, fontFamily: FONT,
      backgroundImage: `radial-gradient(ellipse at top, ${C.surface} 0%, ${C.bg} 60%)`,
    }}>
      {fontLink}
      {(s.phase === 'planning' || s.phase === 'execution' || s.phase === 'retro') && <HUD s={s}/>}
      {s.phase === 'menu' && <MenuPhase onStart={startGame}/>}
      {s.phase === 'planning' && <PlanningPhase s={s} onToggle={toggleTicket} onStart={startSprint} onSetCapacity={setCapacity}/>}
      {s.phase === 'execution' && <ExecutionPhase s={s} onChoose={chooseEvent} onWork={work} onNextDay={nextDay} onSkipWork={skipWork} onAction={action}/>}
      {s.phase === 'retro' && <RetroPhase s={s} onNext={nextSprint}/>}
      {s.phase === 'gameover' && <GameOverPhase s={s} onRestart={restart}/>}
      {s.phase === 'victory' && <VictoryPhase s={s} onRestart={restart}/>}
      <div className="px-3 sm:px-6 py-2 text-[10px] tracking-widest uppercase flex items-center justify-between gap-3" style={{
        color: C.textDimmer, borderTop: `1px solid ${C.border}`,
      }}>
        <span>{tr`sprint_to_nowhere · v0 · ship anyway`}</span>
        <LanguageSwitcher/>
      </div>
    </div>
  );
}
