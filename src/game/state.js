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
    pairPartner: null,             // teammate name you paired with today; clears with pairBonus
    boothBonus: false,
    burnout: 0,
    focus: 100,
    morale: 70,                    // motivation / engagement / will-to-build
    badDayStreak: 0,               // consecutive bad days; erodes next-day focus budget
    stayedLate: false,             // worked overtime today; counts as a bad day
    pendingCleanups: [],           // ticket templates queued by chaos events; forced into next sprint
    lastChaosFlavor: null,         // one-line chaos summary surfaced in the next morning's standup
    eventCast: {},
    eventQueue: [],
    atHome: false,                 // true once the player has bailed home for the day; resets each morning
    actionsToday: {},              // { lunch: n, walk: n, coffee: n } — how many times today; resets each morning
    // ----- repetition / continuity tracking (reset only on game restart) -----
    shippedTitles: [],             // every distinct ticket title shipped this run; excluded from new backlogs
    recentEventIds: [],            // last few main events fired; pickEvent avoids them
    recentDescIdx: {},             // { eventId: [last few description indices] } — avoids same opener back-to-back
  };
};

// Are we still "in" a previous event-firing slot? Used to filter the queued
// list when state has changed under us (player went home mid-day, finished a
// promise, etc.) so the next event still makes narrative sense.
export const eventApplicable = (ev, state) => {
  if (!ev) return false;
  if (ev.atHome && !state.atHome) return false;
  if (state.atHome && ev.inOffice) return false;
  if (ev.requires && !ev.requires(state)) return false;
  return true;
};

export const pickEvent = (state, exclude = null, recent = []) => {
  const recentSet = new Set(recent);
  const filterFor = (allowRecent) => EVENTS.filter(e => {
    if (exclude && exclude.has(e.id)) return false;
    if (!allowRecent && recentSet.has(e.id)) return false;
    if (e.atHome && !state.atHome) return false;
    if (state.atHome && e.inOffice) return false;
    if (e.requires && !e.requires(state)) return false;
    return true;
  });
  // Try with the "recent" filter on first; if that wipes the pool, drop it.
  let eligible = filterFor(false);
  if (eligible.length === 0) eligible = filterFor(true);

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
    // ----- CEREMONIES + MORNING (slotted separately in pickDayEvents) -----
    // standup_debug is a variant of daily_standup that fires in the ceremony
    // slot, never as a disruption — keeps the morning narrative coherent.
    if (['backlog_refinement','daily_standup','standup_debug','morning_arrival'].includes(e.id)) w = 0;  // never picked here — see pickDayEvents
    // ----- ONE-OFF + RECURRING -----
    if (e.id === 'one_on_one') w = (state.sprint % 3 === 0 && !state.promise) ? 4 : 0;
    if (e.id === 'initiative_cancelled') w = 5;
    if (e.id === 'kitchen_karen') w = 2;
    if (e.id === 'loud_sales_call') w = 2;
    if (e.id === 'shoulder_tap') w = 2;
    if (e.id === 'mental_health') w = 1;
    // ----- CORPORATE THEATER -----
    if (e.id === 'all_hands') w = 6;
    if (e.id === 'town_hall') w = 5;
    if (e.id === 'values_refresh') w = 4;
    if (e.id === 'engagement_survey') w = 3;
    if (e.id === 'impact_email') w = 3;
    if (e.id === 'inclusion_workshop') w = 3;
    if (e.id === 'ethics_email') w = 3;
    if (e.id === 'volunteer_day') w = 2;
    if (e.id === 'compliance') w = 3;
    if (e.id === 'okr_calibration') w = 3;
    if (e.id === 'rebrand') w = 3;
    if (e.id === 'cto_skiplevel') w = 2;
    if (e.id === 'copilot_mandate') w = 3;
    // ----- COMBINATION EVENTS — multiple pressures at once, weight them like big disruptions -----
    if (e.id === 'sales_pincer') w = 3;
    if (e.id === 'ai_initiative_kickoff') w = 3;
    // Slack flame-war / cross-department friction. Light weight: it should
    // feel inevitable but not dominate the disruption pool.
    if (e.id === 'holy_war') w = 2;
    // Rare guest-keynote spectacle. Don't make it common — its impact relies on
    // surprise. Sprint-2+ only (gated in event.requires too).
    if (e.id === 'dev_summit') w = 1;
    for (let i = 0; i < w; i++) weighted.push(e);
  }
  if (weighted.length === 0) return EVENTS.find(e => e.id === 'quick_sync');
  return weighted[Math.floor(Math.random() * weighted.length)];
};

export const pickDayEvents = (state) => {
  const queue = [];
  const day = state.currentDay;
  const recent = state.recentEventIds || [];

  // Morning-arrival slot: ~15% of days something goes wrong before you're
  // even at your desk. Always fires before standup so the narrative order
  // matches the timeline.
  if (Math.random() < 0.15) {
    const ev = EVENTS.find(e => e.id === 'morning_arrival');
    if (ev && !state.atHome) queue.push(ev);
  }

  // Ceremony slot: standups are daily, refinement happens early or mid-sprint.
  // ~15% of standups derail into a "standup turns into a debug session" variant
  // — that fires INSTEAD of the regular standup, never on top of it, so we
  // don't end up narrating two standups back-to-back in the morning.
  const isRefinementDay = day === 1 || (day === 3 && Math.random() < 0.6);
  const r = Math.random();
  if (isRefinementDay && r < 0.7) {
    const ev = EVENTS.find(e => e.id === 'backlog_refinement');
    if (ev) queue.push(ev);
  } else if (r < 0.75) {
    // Most other days fire daily standup. It IS daily, after all.
    const standupId = Math.random() < 0.15 ? 'standup_debug' : 'daily_standup';
    const ev = EVENTS.find(e => e.id === standupId);
    if (ev) queue.push(ev);
  }

  // Disruption slot — always fires, always biased toward scope-adds. Excludes
  // both the ceremonies above (including the standup-debug variant) AND
  // anything that fired in the last few events so the player doesn't see the
  // same disruption twice in a row.
  const exclude = new Set(['backlog_refinement','daily_standup','standup_debug','morning_arrival']);
  const main = pickEvent(state, exclude, recent);
  if (main) queue.push(main);

  // Bonus extra event on some days — a Marcus "quick chat" or production fire
  // doesn't preclude HQ also dropping a ticket five hours later
  if (day >= 2 && Math.random() < 0.35) {
    const exclude2 = new Set([...exclude, main?.id].filter(Boolean));
    const recentNow = [...recent, main?.id].filter(Boolean);
    const extra = pickEvent(state, exclude2, recentNow);
    if (extra) queue.push(extra);
  }

  return queue;
};

// Append-and-trim helper for recentEventIds. Keep the last 6 — long enough to
// kill back-to-back repeats, short enough to not starve the pool.
export const pushRecentEvent = (recent = [], id) => {
  if (!id) return recent;
  return [...recent, id].slice(-6);
};

// Append-and-trim helper for recent description indexes per event id.
export const pushRecentDesc = (map = {}, id, idx) => {
  if (!id || idx === undefined || idx === null) return map;
  const prev = map[id] || [];
  return { ...map, [id]: [...prev, idx].slice(-3) };
};
