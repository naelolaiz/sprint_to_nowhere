// SPDX-License-Identifier: GPL-3.0-only

import { EVENTS } from '../data/events.js';
import { resetTicketId } from './backlog.js';

export const totalRemaining = (plan) => plan.reduce(
  (sum, t) => sum + Math.max(0, t.effort - t.progress),
  0,
);

// 9-hour workday baseline (8h focus + 1h lunch). Independent of sprint capacity.
// Erodes with current burnout AND a streak of bad days — sleep restores partially,
// but consecutive grind days compound into a lower ceiling the next morning.
//   burnout penalty: floor(burnout/25) — up to 3h
//   streak penalty: floor(streak/2), capped at 2 — up to 2h
//   floor: 5h (you're still alive)
export const dailyFocusBudget = (burnout = 0, badDayStreak = 0) => {
  const burnoutPenalty = Math.floor(burnout / 25);
  const streakPenalty = Math.min(2, Math.floor(badDayStreak / 2));
  return Math.max(5, 9 - burnoutPenalty - streakPenalty);
};

export const getEventNode = (event, dialogNode) => {
  if (!event) return null;
  if (event.nodes) {
    return event.nodes[dialogNode] || event.nodes[event.start || 'start'];
  }
  // Flat event: leave description empty if there's a `descriptions` array — the
  // renderer will pick the locked variant.
  return {
    description: Array.isArray(event.descriptions) ? null : event.description,
    choices: event.choices,
  };
};

export const initialState = () => {
  resetTicketId();
  return {
    phase: 'menu',
    sprint: 1,
    debt: 25,
    capital: 5,
    backlog: [],
    sprintPlan: [],
    sprintCapacity: 60,             // points committed per 5-day sprint, configurable in planning
    currentDay: 1,
    dayFocus: 9,                    // 9h workday (8h focus + 1h lunch); burnout erodes it
    dayFocusRemaining: 9,
    subPhase: null,
    currentEvent: null,
    dayLog: [],
    sprintLog: [],
    sprintShipped: [],
    sprintBumped: [],
    sprintCancelled: [],
    sprintsSurvived: 0,
    totalShipped: 0,
    debtAtSprintStart: 25,
    lastRetro: null,
    promise: null,
    hourHistory: [],
    dialogNode: 'start',
    pairBonus: false,
    boothBonus: false,
    burnout: 0,
    focus: 100,
    morale: 70,                    // motivation / engagement / will-to-build
    badDayStreak: 0,               // consecutive bad days; erodes next-day focus budget
    stayedLate: false,             // worked overtime today; counts as a bad day
    eventCast: {},
    eventQueue: [],
  };
};

export const pickEvent = (state, exclude = null) => {
  const eligible = EVENTS.filter(e => {
    if (exclude && exclude.has(e.id)) return false;
    if (e.requires && !e.requires(state)) return false;
    return true;
  });
  const weighted = [];
  for (const e of eligible) {
    let w = 1;
    // ----- SCOPE-ADDING EVENTS (weighted heavily, this is the point) -----
    if (e.id === 'production_fire') w = state.debt > 60 ? 6 : (state.debt > 40 ? 4 : 3);
    if (e.id === 'refactor_bumped') w = 5;          // refactor → urgent feature swap
    if (e.id === 'scope_change') w = 6;             // Marcus grows a feature
    if (e.id === 'ceo_idea') w = 4;                 // CEO Slacks a new ticket
    if (e.id === 'hq_drop') w = state.promise ? 10 : 4;  // fires regardless of promise now
    // ----- PIVOT / WORK-WASTERS (heavy weights — this is a core mechanic now) -----
    if (e.id === 'pivot') w = 5;
    if (e.id === 'requirements_changed') w = 5;
    if (e.id === 'reorg') w = 3;
    // ----- BLOCKERS / INTERRUPTIONS -----
    if (e.id === 'broken_package') w = 4;
    if (e.id === 'tickets_down') w = 3;
    if (e.id === 'network_down') w = 3;
    if (e.id === 'fire_drill') w = 2;
    if (e.id === 'meeting_cascade') w = 4;
    if (e.id === 'building_issue') w = 3;
    // ----- CEREMONIES (slotted separately in pickDayEvents) -----
    if (['backlog_refinement','daily_standup'].includes(e.id)) w = 0;  // never picked here — see pickDayEvents
    // ----- ONE-OFF + RECURRING -----
    if (e.id === 'one_on_one') w = (state.sprint % 3 === 0 && !state.promise) ? 4 : 0;
    if (e.id === 'initiative_cancelled') w = 5;
    if (e.id === 'kitchen_karen') w = 2;
    if (e.id === 'loud_sales_call') w = 2;
    if (e.id === 'shoulder_tap') w = 2;
    if (e.id === 'mental_health') w = 1;
    // corporate theater is common background radiation
    if (['ethics_email','town_hall','volunteer_day','values_refresh','engagement_survey','impact_email','inclusion_workshop'].includes(e.id)) w = 2;
    // ----- COMBINATION EVENTS — multiple pressures at once, weight them like big disruptions -----
    if (e.id === 'sales_pincer') w = 3;
    if (e.id === 'ai_initiative_kickoff') w = 3;
    for (let i = 0; i < w; i++) weighted.push(e);
  }
  if (weighted.length === 0) return EVENTS.find(e => e.id === 'quick_sync');
  return weighted[Math.floor(Math.random() * weighted.length)];
};

export const pickDayEvents = (state) => {
  const queue = [];
  const day = state.currentDay;

  // Ceremony slot: standups are daily, refinement happens early or mid-sprint
  const isRefinementDay = day === 1 || (day === 3 && Math.random() < 0.6);
  const r = Math.random();
  if (isRefinementDay && r < 0.7) {
    const ev = EVENTS.find(e => e.id === 'backlog_refinement');
    if (ev) queue.push(ev);
  } else if (r < 0.75) {
    // Most other days fire daily standup. It IS daily, after all.
    const ev = EVENTS.find(e => e.id === 'daily_standup');
    if (ev) queue.push(ev);
  }

  // Disruption slot — always fires, always biased toward scope-adds
  const exclude = new Set(['backlog_refinement','daily_standup']);
  const main = pickEvent(state, exclude);
  if (main) queue.push(main);

  // Bonus extra event on some days — a Marcus "quick chat" or production fire
  // doesn't preclude HQ also dropping a ticket five hours later
  if (day >= 2 && Math.random() < 0.35) {
    const exclude2 = new Set([...exclude, main?.id].filter(Boolean));
    const extra = pickEvent(state, exclude2);
    if (extra) queue.push(extra);
  }

  return queue;
};
