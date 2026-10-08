// SPDX-License-Identifier: GPL-3.0-only

import { CAST_POOLS, EVENT_CAST_RULES } from '../data/cast.js';
import { EVENTS } from '../data/events.js';
import { WORKDAY_START_MIN, minutesToClock, usedMinutes } from './clock.js';

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
  cast._baseMin = usedMinutes(state);
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
