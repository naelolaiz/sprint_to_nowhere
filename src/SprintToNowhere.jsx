// SPDX-License-Identifier: GPL-3.0-only

import { useState } from 'react';
import { C, FONT } from './data/theme.js';
import { STRATEGIC_INITIATIVES } from './data/tickets.js';
import { EVENTS, MELTDOWN_EVENT } from './data/events.js';
import { generateBacklog, mkTicket } from './game/backlog.js';
import { sampleEventCast, renderCast } from './game/cast.js';
import { initialState, totalRemaining, pickDayEvents, dailyFocusBudget } from './game/state.js';
import { applyChoice, workOnTicket } from './game/mechanics.js';
import { applyTeammateContributions } from './game/team.js';
import { HUD } from './components/common/HUD.jsx';
import { MenuPhase } from './components/phases/MenuPhase.jsx';
import { PlanningPhase } from './components/phases/PlanningPhase.jsx';
import { ExecutionPhase } from './components/phases/ExecutionPhase.jsx';
import { RetroPhase } from './components/phases/RetroPhase.jsx';
import { GameOverPhase } from './components/phases/GameOverPhase.jsx';
import { VictoryPhase } from './components/phases/VictoryPhase.jsx';

export default function SprintToNowhere() {
  const [s, setS] = useState(initialState());

  const startGame = () => setS(prev => ({
    ...prev, phase: 'planning', backlog: generateBacklog(), sprintPlan: [],
    debtAtSprintStart: prev.debt, sprintShipped: [], sprintBumped: [], dayLog: [],
  }));

  const toggleTicket = (id) => setS(prev => {
    const inPlan = prev.sprintPlan.some(t => t.id === id);
    if (inPlan) return { ...prev, sprintPlan: prev.sprintPlan.filter(t => t.id !== id) };
    const t = prev.backlog.find(t => t.id === id);
    return { ...prev, sprintPlan: [...prev.sprintPlan, { ...t }] };
  });

  const startSprint = () => setS(prev => {
    let plan = prev.sprintPlan.map(t => ({ ...t }));
    const initialLog = [];
    // Drain any cleanup tickets that previous sprints' chaos events queued
    if (prev.pendingCleanups && prev.pendingCleanups.length > 0) {
      for (const c of prev.pendingCleanups) {
        const t = mkTicket(
          { title: c.title, effort: c.effort, debt: c.debt },
          c.type || 'refactor',
          { urgent: !!c.urgent, legacy: c.type === 'legacy' },
        );
        plan = [...plan, t];
        initialLog.push(`📋 Carry-over from a previous sprint: "${t.title}" (${t.effort}h). Forced into the sprint.`);
      }
    }
    // 35% chance management forces a strategic initiative into the sprint
    if (Math.random() < 0.35) {
      const tpl = STRATEGIC_INITIATIVES[Math.floor(Math.random() * STRATEGIC_INITIATIVES.length)];
      const init = mkTicket(tpl, 'feature', { strategic: true, urgent: true });
      plan = [...plan, init];
      initialLog.push(`📋 Management added "${init.title}" to your sprint. "It's a top priority."`);
    }
    const startHours = totalRemaining(plan);
    const dayBudget = dailyFocusBudget(prev.burnout, prev.badDayStreak);
    const next = {
      ...prev, phase: 'execution', subPhase: 'event',
      currentDay: 1, dayFocus: dayBudget, dayFocusRemaining: dayBudget,
      dayLog: initialLog, sprintShipped: [], sprintBumped: [], sprintCancelled: [],
      debtAtSprintStart: prev.debt,
      sprintPlan: plan,
      stayedLate: false,
      pendingCleanups: [],
      hourHistory: [{ day: 0, hours: startHours, kind: 'start' }],
      dialogNode: 'start',
      atHome: false,
    };
    const queue = pickDayEvents(next);
    next.currentEvent = queue[0] || EVENTS.find(e => e.id === 'quick_sync');
    next.eventQueue = queue.slice(1);
    if (next.currentEvent?.start) next.dialogNode = next.currentEvent.start;
    next.eventCast = next.currentEvent ? sampleEventCast(next.currentEvent.id) : {};
    return next;
  });

  const chooseEvent = (choice) => setS(prev => {
    const newState = applyChoice(prev, choice);
    if (choice.meltdownEnding) {
      // Terminal meltdown choice — game over with this specific flavor
      return {
        ...newState,
        phase: 'gameover',
        gameOverReason: 'meltdown',
        meltdownEnding: choice.meltdownEnding,
      };
    }
    if (choice.next) {
      // Multi-turn dialog: advance to next node, stay in event subPhase
      return { ...newState, dialogNode: choice.next };
    }
    // Dialog resolved. If there's another event queued for today, fire it next.
    if (newState.eventQueue && newState.eventQueue.length > 0) {
      const [nextEv, ...rest] = newState.eventQueue;
      const nextCast = sampleEventCast(nextEv.id);
      return {
        ...newState,
        currentEvent: nextEv,
        eventQueue: rest,
        dialogNode: nextEv.start || 'start',
        eventCast: nextCast,
        subPhase: 'event',
        dayLog: [...newState.dayLog, `— and then: ${renderCast(nextEv.title, nextCast)}`],
      };
    }
    // Otherwise, off to work.
    return { ...newState, subPhase: 'work', dialogNode: 'start' };
  });

  const work = (id) => setS(prev => ({
    ...workOnTicket(prev, id), subPhase: 'day-summary',
  }));

  const skipWork = () => setS(prev => ({ ...prev, subPhase: 'day-summary' }));

  const action = (kind) => setS(prev => {
    let s = { ...prev, sprintPlan: prev.sprintPlan.map(t => ({ ...t })) };
    if (kind === 'pair') {
      s.dayFocusRemaining = Math.max(0, s.dayFocusRemaining - 1.5);
      s.capital = Math.max(0, s.capital - 0.5);
      s.pairBonus = true;
      s.burnout = Math.max(0, s.burnout - 3);
      s.focus = Math.min(100, s.focus + 12);
      s.morale = Math.min(100, s.morale + 6);
      s.dayLog = [...s.dayLog, 'Paired with Sarah for 90 minutes. She rubber-ducked your weird race condition. You lost 1.5h but you\'re unstuck — and a little less alone.'];
    } else if (kind === 'booth') {
      s.capital = Math.max(0, s.capital - 1);
      s.boothBonus = true;
      s.burnout = Math.max(0, s.burnout - 4);
      s.focus = Math.min(100, s.focus + 25);
      s.morale = Math.min(100, s.morale + 4);
      s.dayLog = [...s.dayLog, 'You walked over to a phone booth and locked the door. Slack is on snooze. Headphones in. The next ticket will hit harder, and the office will be tolerable for a while.'];
    } else if (kind === 'lunch') {
      // A real lunch — leaving the building, sitting somewhere quiet, no laptop.
      // Costs an hour of focus-time but recovers significantly more than a coffee.
      s.dayFocusRemaining = Math.max(0, s.dayFocusRemaining - 1);
      s.burnout = Math.max(0, s.burnout - 6);
      s.focus = Math.min(100, s.focus + 22);
      s.morale = Math.min(100, s.morale + 8);
      const lunchFlavors = [
        'You walked four blocks and ate at the place with the good banh mi. You did not check Slack. The world kept going.',
        'You sat at the park bench by the office. Your sandwich was unremarkable. The pigeons were content. You let yourself watch them for ten minutes.',
        'You ate alone at the counter of the diner across the street. The coffee was bad. The booth was quiet. Nobody asked you anything.',
        'You drove to the grocery store, bought a rotisserie chicken and two apples, ate them in your parked car listening to one full album.',
      ];
      s.dayLog = [...s.dayLog, lunchFlavors[Math.floor(Math.random() * lunchFlavors.length)]];
    } else if (kind === 'walk') {
      // A short walk around the block — small but free recovery, no political cost
      s.dayFocusRemaining = Math.max(0, s.dayFocusRemaining - 0.5);
      s.burnout = Math.max(0, s.burnout - 3);
      s.focus = Math.min(100, s.focus + 10);
      s.morale = Math.min(100, s.morale + 3);
      const walkFlavors = [
        'You walked around the block. You noticed three things you had not noticed before. None of them were work.',
        'You walked to the end of the parking lot and back. Your eyes adjusted to looking far. Your shoulders dropped a centimeter.',
        'You walked through the lobby, around the building, and back. The security guard nodded at you. You nodded back. It was nice.',
      ];
      s.dayLog = [...s.dayLog, walkFlavors[Math.floor(Math.random() * walkFlavors.length)]];
    } else if (kind === 'coffee') {
      s.dayFocusRemaining = Math.max(0, s.dayFocusRemaining - 1);
      if (s.atHome) {
        // Coffee in your own kitchen — no Doug, no Brad, no spreadsheet.
        // ~25% chance a housemate / partner / kid / cat needs a moment.
        if (Math.random() < 0.25) {
          const ev = EVENTS.find(e => e.id === 'home_household');
          if (ev) {
            s.subPhase = 'event';
            s.currentEvent = ev;
            s.dialogNode = ev.start || 'start';
            s.eventCast = sampleEventCast(ev.id);
            return s;
          }
        }
        s.burnout = Math.max(0, s.burnout - 3);
        s.focus = Math.min(100, s.focus + 18);
        const homeCoffeeFlavors = [
          'You made coffee in your own kitchen. Nobody had a theory about the milk. The window faced a tree. The ten minutes were yours.',
          'You stood at the counter while the kettle boiled. The light was good. You did not check Slack.',
          'You drank coffee on the back step. A bird did something on a fence. You watched it for the whole song.',
        ];
        s.dayLog = [...s.dayLog, homeCoffeeFlavors[Math.floor(Math.random() * homeCoffeeFlavors.length)]];
        return s;
      }
      s.dayLog = [...s.dayLog, 'You head to the kitchen for coffee.'];
      const r = Math.random();
      if (r < 0.35) {
        // Doug ambush at the espresso machine — fire the actual dialog tree
        const ev = EVENTS.find(e => e.id === 'kitchen_karen');
        if (ev) {
          s.subPhase = 'event';
          s.currentEvent = ev;
          s.dialogNode = ev.start || 'start';
          s.eventCast = sampleEventCast(ev.id);
        }
      } else if (r < 0.6) {
        // On the way back, Brad rolls his chair to intercept — fire his dialog tree
        s.dayLog = [...s.dayLog, 'On your way back, Brad rolled his chair into the aisle to intercept you.'];
        const ev = EVENTS.find(e => e.id === 'shoulder_tap');
        if (ev) {
          s.subPhase = 'event';
          s.currentEvent = ev;
          s.dialogNode = ev.start || 'start';
          s.eventCast = sampleEventCast(ev.id);
        }
      } else {
        // Clean break — focus and burnout both improve
        s.burnout = Math.max(0, s.burnout - 3);
        s.focus = Math.min(100, s.focus + 18);
        s.dayLog = [...s.dayLog, 'A clean coffee break. The kitchen was empty. You stared out the window for 4 minutes. It helped.'];
      }
    } else if (kind === 'late') {
      // Voluntary overtime — push past the workday on a hard ticket.
      // Costly: burnout, morale, and counts as a bad day (next day's budget shrinks).
      s.dayFocusRemaining = s.dayFocusRemaining + 2;
      s.dayFocus = (s.dayFocus || 9) + 2;
      s.burnout = Math.min(100, s.burnout + 8);
      s.morale = Math.max(0, s.morale - 2);
      s.stayedLate = true;
      const hard = s.sprintPlan.find(t =>
        !t.shipped && t.progress > 0 && t.progress < t.effort &&
        (t.type === 'bug' || t.effort >= 5));
      s.dayLog = [...s.dayLog, hard
        ? `You stayed late chasing "${hard.title}". The fluorescent lights got worse. +2h, +8 burnout.`
        : 'You stayed late. The office cleared out. The cleaners came. +2h, +8 burnout.'];
    } else if (kind === 'ask') {
      s.dayFocusRemaining = Math.max(0, s.dayFocusRemaining - 1);
      s.capital = Math.max(0, s.capital - 0.5);
      s.focus = Math.min(100, s.focus + 5);
      // Find the least-progressed unfinished ticket and bump it
      const candidates = s.sprintPlan
        .map((t, i) => ({ t, i }))
        .filter(({ t }) => !t.shipped && t.progress < t.effort);
      if (candidates.length > 0) {
        candidates.sort((a, b) => (a.t.progress / a.t.effort) - (b.t.progress / b.t.effort));
        const { i } = candidates[0];
        const stuck = s.sprintPlan[i];
        const bump = Math.min(3, stuck.effort - stuck.progress);
        s.sprintPlan[i] = { ...stuck, progress: stuck.progress + bump };
        s.dayLog = [...s.dayLog, `You walked over to Jin's desk. Asked about "${stuck.title}". They pointed at one line and said "that's your bug." +${bump.toFixed(0)}h progress.`];
      } else {
        s.dayLog = [...s.dayLog, 'You went to ask Jin for help. Nothing to ask about. You both stared at his screen for a polite minute.'];
      }
    }
    return s;
  });

  const nextDay = () => setS(prev => {
    const snapshot = { day: prev.currentDay, hours: totalRemaining(prev.sprintPlan), kind: 'eod' };
    const history = [...prev.hourHistory, snapshot];
    if (prev.debt >= 100) return { ...prev, hourHistory: history, phase: 'gameover', gameOverReason: 'debt' };
    if (prev.burnout >= 100) {
      // BURNOUT MELTDOWN — instead of an instant game-over, fire one last dialog
      return {
        ...prev,
        hourHistory: history,
        subPhase: 'event',
        currentEvent: MELTDOWN_EVENT,
        dialogNode: 'open',
        eventCast: {},
      };
    }
    if (prev.currentDay >= 5) {
      const sprintsSurvived = prev.sprintsSurvived + 1;
      if (sprintsSurvived >= 10 && prev.debt < 15) {
        return { ...prev, hourHistory: history, phase: 'victory', sprintsSurvived };
      }
      return { ...prev, hourHistory: history, phase: 'retro', sprintsSurvived };
    }
    // Overnight bookkeeping. Yesterday was "bad" if you stayed late or ended above ~65 burnout.
    // Bad nights = poor sleep (smaller burnout drop) and the streak grows; calm nights reset it.
    const wasBadDay = prev.stayedLate || prev.burnout > 65;
    const sleepRecovery = wasBadDay ? 1 : 4;
    // The team also worked overnight (allegedly). They can finish tickets;
    // the player wakes up to find them shipped (and inherits the debt). Some
    // nights also produce a CHAOS event — broken builds, AI-pilot pushes,
    // QA reopening old tickets — which can bump burnout and queue cleanup
    // tickets for future sprints.
    const team = applyTeammateContributions(prev);
    const newBurnout = Math.max(0, Math.min(100,
      prev.burnout - sleepRecovery + (team.burnoutDelta || 0)
    ));
    const newStreak = wasBadDay ? (prev.badDayStreak || 0) + 1 : 0;
    const newBudget = dailyFocusBudget(newBurnout, newStreak);
    const next = {
      ...prev,
      hourHistory: history,
      currentDay: prev.currentDay + 1,
      sprintPlan: team.sprintPlan,
      sprintShipped: [...prev.sprintShipped, ...team.shipped],
      totalShipped: prev.totalShipped + team.shipped.length,
      debt: Math.max(0, prev.debt + team.debtDelta),
      morale: Math.max(0, Math.min(100, prev.morale + team.moraleDelta)),
      capital: Math.max(0, Math.min(5, prev.capital + (team.capitalDelta || 0))),
      pendingCleanups: [...(prev.pendingCleanups || []), ...(team.pendingCleanups || [])],
      lastChaosFlavor: team.chaosFlavor || null,
      dayFocus: newBudget,
      dayFocusRemaining: newBudget,
      burnout: newBurnout,
      badDayStreak: newStreak,
      stayedLate: false,
      atHome: false,
      dayLog: team.log,
      subPhase: 'event',
      dialogNode: 'start',
      // morning focus ceiling drops as burnout climbs — exhausted devs start the day
      // distracted. Chaos events can knock that ceiling further down.
      focus: Math.max(0, Math.min(100,
        Math.max(40, 100 - Math.floor(newBurnout * 0.4)) + (team.focusDelta || 0)
      )),
    };
    const queue = pickDayEvents(next);
    next.currentEvent = queue[0] || EVENTS.find(e => e.id === 'quick_sync');
    next.eventQueue = queue.slice(1);
    if (next.currentEvent?.start) next.dialogNode = next.currentEvent.start;
    next.eventCast = next.currentEvent ? sampleEventCast(next.currentEvent.id) : {};
    return next;
  });

  const nextSprint = () => setS(prev => {
    if (prev.debt >= 100) return { ...prev, phase: 'gameover', gameOverReason: 'debt' };
    if (prev.burnout >= 100) {
      return {
        ...prev,
        phase: 'execution',
        subPhase: 'event',
        currentEvent: MELTDOWN_EVENT,
        dialogNode: 'open',
        eventCast: {},
      };
    }
    // weekend recovery — burnout drops, the bad-day streak resets, you stop staying late.
    const recovered = Math.max(0, prev.burnout - 12);
    return {
      ...prev, phase: 'planning',
      sprint: prev.sprint + 1,
      backlog: generateBacklog(), sprintPlan: [],
      debtAtSprintStart: prev.debt,
      burnout: recovered,
      badDayStreak: 0,
      stayedLate: false,
    };
  });

  const restart = () => setS(initialState());

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
      {s.phase === 'planning' && <PlanningPhase s={s} onToggle={toggleTicket} onStart={startSprint} onSetCapacity={(c) => setS(prev => ({ ...prev, sprintCapacity: c }))}/>}
      {s.phase === 'execution' && <ExecutionPhase s={s} onChoose={chooseEvent} onWork={work} onNextDay={nextDay} onSkipWork={skipWork} onAction={action}/>}
      {s.phase === 'retro' && <RetroPhase s={s} onNext={nextSprint}/>}
      {s.phase === 'gameover' && <GameOverPhase s={s} onRestart={restart}/>}
      {s.phase === 'victory' && <VictoryPhase s={s} onRestart={restart}/>}
      <div className="px-3 sm:px-6 py-2 text-[10px] tracking-widest uppercase" style={{
        color: C.textDimmer, borderTop: `1px solid ${C.border}`,
      }}>
        sprint_to_nowhere · v0 · ship anyway
      </div>
    </div>
  );
}
