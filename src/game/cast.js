// SPDX-License-Identifier: GPL-3.0-only

import { CAST_POOLS, EVENT_CAST_RULES } from '../data/cast.js';
import { EVENTS } from '../data/events.js';

// Returns the count of variant openers for a given event id — used to pick a
// non-repeating index. We look at event-level `descriptions` first; if the
// event uses node-level descriptions on its `start` node, that count is used
// instead. Anything else: 0 (no rotation needed).
const eventDescCount = (eid) => {
  const ev = EVENTS.find(e => e.id === eid);
  if (!ev) return 0;
  if (Array.isArray(ev.descriptions)) return ev.descriptions.length;
  const startKey = ev.start || 'start';
  const startNode = ev.nodes?.[startKey];
  if (startNode && Array.isArray(startNode.descriptions)) return startNode.descriptions.length;
  return 0;
};

// `recentIdxs` is a small array of indices recently used for THIS event. We
// pick a fresh one. If the recent list already covers most of the variants,
// we drop the freshness constraint so we don't loop forever.
export const sampleEventCast = (eid, recentIdxs = []) => {
  const rules = EVENT_CAST_RULES[eid] || {};
  const cast = {};
  for (const [key, pool] of Object.entries(rules)) {
    const arr = CAST_POOLS[pool] || [];
    cast[key] = arr[Math.floor(Math.random() * arr.length)];
  }
  const count = eventDescCount(eid);
  if (count > 1) {
    const recent = recentIdxs.filter(i => i < count);
    const blocked = recent.length >= count - 1 ? [] : recent;
    let idx;
    let safety = 12;
    do {
      idx = Math.floor(Math.random() * count);
      safety -= 1;
    } while (blocked.includes(idx) && safety > 0);
    cast._descIdx = idx;
  } else {
    cast._descIdx = Math.floor(Math.random() * 1000);
  }
  return cast;
};

export const renderCast = (text, cast) => {
  if (typeof text !== 'string') return text;
  return text.replace(/\{(\w+)\}/g, (_, key) => (cast && cast[key]) || `{${key}}`);
};
