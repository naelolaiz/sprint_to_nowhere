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
import { applyChoice, workOnTicket, applyContextSwitch, contextSwitchCost, tickDailyTaxes, spendTokens, refillTokens } from './mechanics.js';
import { applyTeammateContributions } from './team.js';
import { applyAction } from './actions.js';
import { usedMinutes, clockText, scheduleMinute } from './clock.js';
import { whenOf } from '../data/schedule.js';
import { tr } from '../i18n/index.js';

// Events that open the day, in the order pickDayEvents slots them. Everything
// else the roll produces is given a minute on the clock instead.
const MORNING_IDS = new Set(['morning_arrival', 'backlog_refinement', 'daily_standup', 'standup_debug']);

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
    dayLog: [...(s.dayLog || []), `${prefix}${renderCast(tr(ev.title), cast)}`],
    recentEventIds: pushRecentEvent(s.recentEventIds || [], ev.id),
    recentDescIdx: pushRecentDesc(s.recentDescIdx || {}, ev.id, cast?._descIdx),
    onceFired: ev.once && !(s.onceFired || []).includes(ev.id)
      ? [...(s.onceFired || []), ev.id]
      : (s.onceFired || []),
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

// Fire whatever the calendar has reached. Called whenever the clock has
// moved and you are back at your desk: after a sitting, after a break,
// after the last dialog of a chain. The first due item goes on stage; any
// others queue behind it. Items that no longer apply (you went home) drop.
export const fireDue = (s) => {
  if (s.subPhase === 'event') return s;
  const used = usedMinutes(s);
  const sched = s.scheduledEvents || [];
  const due = sched.filter(e => e.at <= used);
  if (due.length === 0) return s;
  const rest = sched.filter(e => e.at > used);
  const evs = due
    .map(e => EVENTS.find(ev => ev.id === e.id))
    .filter(ev => ev && eventApplicable(ev, s));
  const base = { ...s, scheduledEvents: rest };
  if (evs.length === 0) return base;
  const [first, ...more] = evs;
  return {
    ...stageEvent(base, first, `— ${clockText(s)}: `),
    eventQueue: [...more, ...(s.eventQueue || [])],
  };
};

// Roll the day's events. The ceremonies (and a locked door) open the day;
// every disruption gets a minute on the clock and lands when the day
// reaches it. Anything a reply queued for "tomorrow" (a production fire
// from testing in prod, say) opens the morning ahead of the roll.
const beginDay = (s) => {
  const queued = (s.pendingEvents || [])
    .map(id => EVENTS.find(e => e.id === id))
    .filter(ev => ev && eventApplicable(ev, s));
  // The roll treats the queued ids as recent, so the same disruption does
  // not open the morning and then come straight back as the day's draw.
  const rollFrom = queued.length > 0
    ? { ...s, recentEventIds: [...(s.recentEventIds || []), ...queued.map(ev => ev.id)] }
    : s;
  const rolled = pickDayEvents(rollFrom);
  const morning = rolled.filter(ev => MORNING_IDS.has(ev.id));
  const later = rolled.filter(ev => !MORNING_IDS.has(ev.id));
  const budgetMinutes = Math.round((s.dayFocus || 9) * 60);
  const scheduled = later
    .map(ev => ({ id: ev.id, at: scheduleMinute(whenOf(ev), budgetMinutes) }))
    .sort((a, b) => a.at - b.at);
  const queue = [...queued, ...morning];
  const base = {
    ...s,
    pendingEvents: [],
    scheduledEvents: scheduled,
    resumeTicketId: null,
    leaving: false,
    eventQueue: [],
  };
  if (queue.length === 0) {
    // Nothing on the calendar at nine. Straight to the desk, unless the
    // first item is already due.
    return fireDue({ ...base, subPhase: 'work', dialogNode: 'start' });
  }
  return { ...stageEvent(base, queue[0]), eventQueue: queue.slice(1) };
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
      initialLog.push(tr`📋 Carry-over from a previous sprint: "${t.title}" (${t.effort}h). Forced into the sprint.`);
    }
  }
  // You committed to 20% more last sprint. Here is the 20%: one more ticket
  // from the backlog, chosen by someone who did not read it.
  if (prev.velocityCommit) {
    const planned = new Set(plan.map(t => t.id));
    const spare = (prev.backlog || []).filter(t => !planned.has(t.id));
    if (spare.length > 0) {
      const extra = { ...spare[Math.floor(Math.random() * spare.length)] };
      plan = [...plan, extra];
      initialLog.push(tr`📋 You committed to 20% more. Here is the 20%: "${extra.title}" (${extra.effort}h). "We believe in you."`);
    }
  }
  // 35% chance management forces a strategic initiative into the sprint
  if (Math.random() < 0.35) {
    const tpl = STRATEGIC_INITIATIVES[Math.floor(Math.random() * STRATEGIC_INITIATIVES.length)];
    const init = mkTicket(tpl, 'feature', { strategic: true, urgent: true });
    plan = [...plan, init];
    initialLog.push(tr`📋 Management added "${init.title}" to your sprint. "It's a top priority."`);
  }
  const startHours = totalRemaining(plan);
  const dayBudget = dailyFocusBudget(prev.burnout, prev.badDayStreak);
  const tok = refillTokens(prev);
  const next = {
    ...prev, phase: 'execution', subPhase: 'event',
    currentDay: 1, dayFocus: dayBudget, dayFocusRemaining: dayBudget,
    dayLog: [...initialLog, ...tok.log], sprintShipped: [], sprintBumped: [], sprintCancelled: [],
    tokenBudget: tok.tokenBudget, tokens: tok.tokens, tokenUsage: 0,
    debtAtSprintStart: prev.debt,
    sprintPlan: plan,
    stayedLate: false,
    pendingCleanups: [],
    velocityCommit: false,
    askTaxToday: 0,
    boothClosedToday: false,
    dndToday: false,
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
    return { ...stageEvent(newState, nextEv, tr`— and then: `), eventQueue: rest };
  }
  // Otherwise, back to the desk: whatever the clock has reached fires now.
  // If you were on your way out, the summary is where you were going.
  const desk = fireDue({ ...newState, subPhase: 'work', dialogNode: 'start', eventQueue: [] });
  if (desk.subPhase === 'event') return desk;
  return newState.leaving ? { ...desk, subPhase: 'day-summary' } : desk;
};

// Sit down on a ticket. The first one of the day is free to start; every
// later one pays the context-switch tax first, unless you are sitting back
// down on the ticket an interruption pulled you off. The next calendar item
// caps how long you get to sit: you work until it lands, it fires, and the
// ticket waits. The day ends when the hours are gone or nothing is left to
// work on; otherwise you are back at your desk with whatever is left.
export const work = (prev, id) => {
  const resuming = !!prev.resumeTicketId && prev.resumeTicketId === id;
  const switches = prev.actionsToday?.work || 0;
  let s = prev;
  if (switches > 0 && !resuming) {
    if (prev.dayFocusRemaining <= contextSwitchCost(switches).hours) {
      return {
        ...prev,
        subPhase: 'day-summary',
        dayLog: [...prev.dayLog, tr`You opened the next ticket, read the description twice, and the day was over. It will still be there tomorrow. So will the description.`],
      };
    }
    s = applyContextSwitch(prev, switches);
  }
  const nextAt = (s.scheduledEvents || [])[0]?.at;
  const cap = nextAt == null ? Infinity : Math.max(0, (nextAt - usedMinutes(s)) / 60);
  if (cap <= 0) {
    // The switch ate the time before the next item. It lands as you sit.
    return fireDue({ ...s, resumeTicketId: id, dayLog: [...s.dayLog, tr`You sat down. Before the first keystroke:`] });
  }
  const before = s.dayFocusRemaining;
  s = workOnTicket(s, id, cap);
  // Under the mandate every sitting ends with the "how AI helped" field. The
  // assistant fills it while there are tokens; after that you do, and the
  // form takes its quarter hour.
  if (s.aiMandate && s.dayFocusRemaining < before) {
    s = { ...s };
    if (spendTokens(s, 10) === 0) {
      s.dayFocusRemaining = Math.max(0, s.dayFocusRemaining - 0.25);
      s.dayLog = [...s.dayLog, tr`🪙 No tokens left, so you wrote the "how AI helped" field by hand. The form rejected "n/a." A quarter hour.`];
    }
  }
  const t = s.sprintPlan.find(x => x.id === id);
  const interrupted = cap < Infinity && usedMinutes(s) >= nextAt
    && t && !t.shipped && t.progress < t.effort && s.dayFocusRemaining > 0;
  s = {
    ...s,
    actionsToday: { ...(s.actionsToday || {}), work: resuming ? switches : switches + 1 },
    resumeTicketId: interrupted ? id : null,
  };
  const open = s.sprintPlan.some(x => !x.shipped && x.progress < x.effort);
  const more = s.dayFocusRemaining > 0 && open;
  return fireDue({ ...s, subPhase: more ? 'work' : 'day-summary' });
};

// A break, a favor, a walk: the action itself, then whatever the clock has
// reached while you were away from the keyboard.
export const action = (prev, kind) => fireDue(applyAction(prev, kind));

// Call it a day. Whatever was still on the calendar lands on your way out:
// leaving early has never once cancelled a meeting.
export const skipWork = (prev) => {
  const left = (prev.scheduledEvents || []).filter(e => e.at > usedMinutes(prev));
  if (left.length === 0) return { ...prev, subPhase: 'day-summary', leaving: false };
  const lastAt = left[left.length - 1].at;
  const spent = Math.min(prev.dayFocusRemaining, Math.max(0, lastAt - usedMinutes(prev)) / 60);
  const out = {
    ...prev,
    leaving: true,
    dayFocusRemaining: Math.max(0, prev.dayFocusRemaining - spent),
    dayLog: [...(prev.dayLog || []), tr`You started packing up. The calendar had other plans.`],
  };
  return fireDue(out);
};

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
  // Decision records do not always survive the night: someone "tidies" the
  // wiki, and the page is now under Archive (2019).
  const archiveLog = [];
  const planAfterNight = team.sprintPlan.map(t => {
    if (!t.shielded || t.shipped) return t;
    if (Math.random() < 0.4) {
      archiveLog.push(tr`Overnight: the page you wrote for "${t.title}" was moved to "Archive (2019)" during a wiki tidy-up. The decision is still made. Nobody can find it.`);
      return { ...t, shielded: false };
    }
    return t;
  });
  const newBurnout = Math.max(0, Math.min(100,
    prev.burnout - sleepRecovery + (team.burnoutDelta || 0)
  ));
  const newStreak = wasBadDay ? (prev.badDayStreak || 0) + 1 : 0;
  const newBudget = dailyFocusBudget(newBurnout, newStreak);
  // Standing commitments (the sync you now own, day two of the offsite) come
  // off the top of the morning before anything else happens.
  const tax = tickDailyTaxes(prev.dailyTaxes);
  // A night that moved the budget reset makes this morning the expensive one.
  const tokenReset = team.tokenReset || prev.tokenReset || 'midnight';
  const tok = refillTokens({ ...prev, tokenReset });
  // A job that ran on the fresh budget overnight leaves the morning mostly
  // spent, and the spend counts as usage, which leadership reads as waste.
  const drained = team.drainTokens ? Math.round(tok.tokens * team.drainTokens) : 0;
  const next = {
    ...prev,
    hourHistory: history,
    currentDay: prev.currentDay + 1,
    sprintPlan: planAfterNight,
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
    dayFocusRemaining: Math.max(0, newBudget - tax.hours),
    dailyTaxes: tax.taxes,
    burnout: newBurnout,
    badDayStreak: newStreak,
    stayedLate: false,
    atHome: false,
    actionsToday: {},
    askTaxToday: team.askTax || 0,
    boothClosedToday: false,
    dndToday: false,
    scheduledEvents: [],
    resumeTicketId: null,
    leaving: false,
    tokenReset,
    tokenBudget: tok.tokenBudget,
    tokens: tok.tokens - drained,
    tokenUsage: drained,
    dayLog: [...team.log, ...archiveLog, ...tax.log, ...tok.log],
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
    // Standing commitments end with the sprint; the "20% more" you agreed to
    // shows up here as a bigger capacity number and, at kickoff, a ticket.
    dailyTaxes: [],
    sprintCapacity: prev.velocityCommit
      ? Math.round((prev.sprintCapacity ?? 60) * 1.2)
      : prev.sprintCapacity,
  };
};

export const restart = () => initialState();
