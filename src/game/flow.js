// SPDX-License-Identifier: GPL-3.0-only

// Pure phase transitions for the game loop. Each function takes the previous
// state and returns the next one, so the React shell stays a thin wrapper and
// the whole loop can be exercised in tests.

import { STRATEGIC_INITIATIVES } from '../data/tickets.js';
import { EVENTS, MELTDOWN_EVENT } from '../data/events.js';
import { generateBacklog, mkTicket } from './backlog.js';
import { sampleEventCast, renderCast } from './cast.js';
import {
  initialState, totalRemaining, pickDayEvents, dailyFocusBudget,
  eventApplicable, pushRecentEvent, pushRecentDesc,
} from './state.js';
import { applyChoice, workOnTicket, applyContextSwitch, contextSwitchCost } from './mechanics.js';
import { applyTeammateContributions } from './team.js';

const quickSync = () => EVENTS.find(e => e.id === 'quick_sync');

// Put an event on stage: lock its cast + opener variant, log the title, and
// remember it so the next picks avoid repeating it.
export const stageEvent = (s, ev, prefix = '— ') => {
  const cast = sampleEventCast(ev.id, s.recentDescIdx?.[ev.id] || [], s);
  return {
    ...s,
    subPhase: 'event',
    currentEvent: ev,
    dialogNode: ev.start || 'start',
    eventCast: cast,
    dayLog: [...(s.dayLog || []), `${prefix}${renderCast(ev.title, cast)}`],
    recentEventIds: pushRecentEvent(s.recentEventIds || [], ev.id),
    recentDescIdx: pushRecentDesc(s.recentDescIdx || {}, ev.id, cast?._descIdx),
  };
};

// Burnout meltdown: one last dialog instead of an instant game-over.
const stageMeltdown = (s) => ({
  ...s,
  phase: 'execution',
  subPhase: 'event',
  currentEvent: MELTDOWN_EVENT,
  dialogNode: 'open',
  eventCast: {},
  eventQueue: [],
});

// Roll the day's events and put the first one on stage.
const beginDay = (s) => {
  const queue = pickDayEvents(s);
  const first = queue[0] || quickSync();
  return { ...stageEvent(s, first), eventQueue: queue.slice(1) };
};

export const startGame = (prev) => ({
  ...prev, phase: 'planning',
  backlog: generateBacklog(new Set(prev.shippedTitles || [])),
  sprintPlan: [],
  debtAtSprintStart: prev.debt, sprintShipped: [], sprintBumped: [], dayLog: [],
});

export const toggleTicket = (prev, id) => {
  const inPlan = prev.sprintPlan.some(t => t.id === id);
  if (inPlan) return { ...prev, sprintPlan: prev.sprintPlan.filter(t => t.id !== id) };
  const t = prev.backlog.find(t => t.id === id);
  if (!t) return prev;
  return { ...prev, sprintPlan: [...prev.sprintPlan, { ...t }] };
};

export const setCapacity = (prev, c) => ({ ...prev, sprintCapacity: c });

export const startSprint = (prev) => {
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
    actionsToday: {},
  };
  return beginDay(next);
};

export const chooseEvent = (prev, choice) => {
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
  // Dialog resolved. Look for the next still-applicable event in the queue
  // (state may have changed under us — e.g. atHome flipped — so blindly
  // popping the next event can produce out-of-order narratives like a fire
  // drill firing after the player has already gone home).
  let queue = newState.eventQueue || [];
  while (queue.length > 0 && !eventApplicable(queue[0], newState)) {
    queue = queue.slice(1);
  }
  if (queue.length > 0) {
    const [nextEv, ...rest] = queue;
    return { ...stageEvent(newState, nextEv, '— and then: '), eventQueue: rest };
  }
  // Otherwise, off to work.
  return { ...newState, subPhase: 'work', dialogNode: 'start', eventQueue: [] };
};

// Sit down on a ticket. The first one of the day is free to start; every
// later one pays the context-switch tax first. The day ends when the hours
// are gone or nothing is left to work on; otherwise you are back at your
// desk with whatever is left of the afternoon.
export const work = (prev, id) => {
  const switches = prev.actionsToday?.work || 0;
  let s = prev;
  if (switches > 0) {
    if (prev.dayFocusRemaining <= contextSwitchCost(switches).hours) {
      return {
        ...prev,
        subPhase: 'day-summary',
        dayLog: [...prev.dayLog, 'You opened the next ticket, read the description twice, and the day was over. It will still be there tomorrow. So will the description.'],
      };
    }
    s = applyContextSwitch(prev, switches);
  }
  s = workOnTicket(s, id);
  s = { ...s, actionsToday: { ...(s.actionsToday || {}), work: switches + 1 } };
  const open = s.sprintPlan.some(t => !t.shipped && t.progress < t.effort);
  const more = s.dayFocusRemaining > 0 && open;
  return { ...s, subPhase: more ? 'work' : 'day-summary' };
};

export const skipWork = (prev) => ({ ...prev, subPhase: 'day-summary' });

export const nextDay = (prev) => {
  const snapshot = { day: prev.currentDay, hours: totalRemaining(prev.sprintPlan), kind: 'eod' };
  const history = [...prev.hourHistory, snapshot];
  if (prev.debt >= 100) return { ...prev, hourHistory: history, phase: 'gameover', gameOverReason: 'debt' };
  if (prev.burnout >= 100) {
    // BURNOUT MELTDOWN — instead of an instant game-over, fire one last dialog
    return stageMeltdown({ ...prev, hourHistory: history });
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
    // Append titles teammates shipped overnight so future backlogs skip
    // them too. Keep the list deduplicated.
    shippedTitles: Array.from(new Set([
      ...(prev.shippedTitles || []),
      ...team.shipped.map(t => t.title).filter(Boolean),
    ])),
    debt: Math.max(0, Math.min(100, prev.debt + team.debtDelta)),
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
    actionsToday: {},
    dayLog: team.log,
    subPhase: 'event',
    dialogNode: 'start',
    // morning focus ceiling drops as burnout climbs — exhausted devs start the day
    // distracted. Chaos events can knock that ceiling further down.
    focus: Math.max(0, Math.min(100,
      Math.max(40, 100 - Math.floor(newBurnout * 0.4)) + (team.focusDelta || 0)
    )),
  };
  // A night that pushes a bar to 100 does NOT end things here: you still get
  // up, go to work, and have the day. The checks at the top of nextDay catch
  // it that evening — by design, you explode at the office, not in bed.
  return beginDay(next);
};

export const nextSprint = (prev) => {
  if (prev.debt >= 100) return { ...prev, phase: 'gameover', gameOverReason: 'debt' };
  if (prev.burnout >= 100) return stageMeltdown(prev);
  // weekend recovery — burnout drops, the bad-day streak resets, you stop staying late.
  const recovered = Math.max(0, prev.burnout - 12);
  return {
    ...prev, phase: 'planning',
    sprint: prev.sprint + 1,
    backlog: generateBacklog(new Set(prev.shippedTitles || [])),
    sprintPlan: [],
    debtAtSprintStart: prev.debt,
    burnout: recovered,
    badDayStreak: 0,
    stayedLate: false,
    // Pair / phone-booth boosts fade over the weekend.
    pairBonus: false,
    pairPartner: null,
    boothBonus: false,
    // The chaos flavor from the last night of the prior sprint shouldn't
    // bleed into next week's standup — clear it on the sprint boundary.
    lastChaosFlavor: null,
    // Reset per-sprint repetition trackers so the new week starts fresh,
    // but keep `shippedTitles` (it persists across sprints).
    recentEventIds: [],
    recentDescIdx: {},
  };
};

export const restart = () => initialState();
