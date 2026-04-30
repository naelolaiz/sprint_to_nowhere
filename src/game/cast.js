// SPDX-License-Identifier: GPL-3.0-only

import { CAST_POOLS, EVENT_CAST_RULES } from '../data/cast.js';
import { EVENTS } from '../data/events.js';

// Workday is modeled as 9 AM start; dayFocus hours of focus + 1h lunch fit
// into the wall-clock day. We linearly map "focus hours used" onto wall time
// so descriptions like "It is 2:14 PM" can be computed dynamically from the
// current state instead of being hard-coded to a specific hour.
const WORKDAY_START_MIN = 9 * 60;
const minutesToClock = (totalMinutesSinceMidnight) => {
  const m = ((totalMinutesSinceMidnight % (24 * 60)) + 24 * 60) % (24 * 60);
  const hour24 = Math.floor(m / 60);
  const minute = m % 60;
  const isPM = hour24 >= 12;
  const hour12 = ((hour24 + 11) % 12) + 1;
  return `${hour12}:${String(minute).padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;
};

// Compute "minutes elapsed since 9 AM" from a state snapshot. Each hour of
// dayFocusRemaining consumed = one wall-clock hour past the start.
const stateBaseMinutes = (state) => {
  const dayBudget = state.dayFocus || 9;
  const remaining = state.dayFocusRemaining ?? dayBudget;
  const usedHours = Math.max(0, dayBudget - remaining);
  return Math.round(usedHours * 60);
};

// Locked at event-fire time in cast._baseMin so the in-event timeline doesn't
// drift if the player burns focus during the dialog. Pass an offset (minutes)
// to render times relative to the event's start: formatClock(cast, 11) is
// "eleven minutes after the event opened."
export const formatClock = (cast, offsetMin = 0) => {
  const base = (cast && cast._baseMin) ?? 0;
  return minutesToClock(WORKDAY_START_MIN + base + offsetMin);
};

// Returns the variant pool for a given event id. We look at event-level
// `descriptions` first; if the event uses node-level descriptions on its
// `start` node, that pool is used instead.
const eventDescPool = (eid) => {
  const ev = EVENTS.find(e => e.id === eid);
  if (!ev) return [];
  if (Array.isArray(ev.descriptions)) return ev.descriptions;
  const startKey = ev.start || 'start';
  const startNode = ev.nodes?.[startKey];
  if (startNode && Array.isArray(startNode.descriptions)) return startNode.descriptions;
  return [];
};

// Descriptions can be plain strings, or {text, requires(state)} objects when
// they only fit one context (in-office vs at-home). Eligible-by-default.
export const isDescEligible = (desc, state) => {
  if (desc == null) return false;
  if (typeof desc === 'string') return true;
  if (typeof desc === 'function') return true;
  if (typeof desc === 'object' && desc.requires) return !!desc.requires(state);
  return true;
};

export const descText = (desc) => {
  if (desc == null) return desc;
  if (typeof desc === 'object' && 'text' in desc) return desc.text;
  return desc;
};

// `recentIdxs` is a small array of indices recently used for THIS event. We
// pick a fresh one from the eligible-for-this-state subset. If the recent
// list already covers most of the eligible variants, we drop the freshness
// constraint so we don't loop forever.
export const sampleEventCast = (eid, recentIdxs = [], state = {}) => {
  const rules = EVENT_CAST_RULES[eid] || {};
  const cast = {};
  for (const [key, pool] of Object.entries(rules)) {
    const arr = CAST_POOLS[pool] || [];
    cast[key] = arr[Math.floor(Math.random() * arr.length)];
  }
  // Lock the wall-clock baseline so descriptions can render dynamic times
  // ("It is 2:14 PM") that match the actual in-game time when the event fires
  // — not a hard-coded afternoon when it's actually morning.
  cast._baseMin = stateBaseMinutes(state);
  const pool = eventDescPool(eid);
  const eligible = pool
    .map((d, i) => (isDescEligible(d, state) ? i : -1))
    .filter(i => i >= 0);
  if (eligible.length > 1) {
    const blockedSet = new Set(recentIdxs.filter(i => eligible.includes(i)));
    const fresh = blockedSet.size >= eligible.length - 1
      ? eligible
      : eligible.filter(i => !blockedSet.has(i));
    cast._descIdx = fresh[Math.floor(Math.random() * fresh.length)];
  } else if (eligible.length === 1) {
    cast._descIdx = eligible[0];
  } else {
    cast._descIdx = Math.floor(Math.random() * 1000);
  }
  return cast;
};

export const renderCast = (text, cast) => {
  if (typeof text !== 'string') return text;
  return text.replace(/\{(\w+)\}/g, (_, key) => (cast && cast[key]) || `{${key}}`);
};
