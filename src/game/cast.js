// SPDX-License-Identifier: GPL-3.0-only

import { CAST_POOLS, EVENT_CAST_RULES } from '../data/cast.js';

export const sampleEventCast = (eid) => {
  const rules = EVENT_CAST_RULES[eid] || {};
  const cast = {};
  for (const [key, pool] of Object.entries(rules)) {
    const arr = CAST_POOLS[pool] || [];
    cast[key] = arr[Math.floor(Math.random() * arr.length)];
  }
  // Lock in a random variant index for this fire. We pick a number larger
  // than any reasonable variant count; renderers modulo by their own length.
  // This covers both event-level `descriptions` and node-level `descriptions`.
  cast._descIdx = Math.floor(Math.random() * 1000);
  return cast;
};

export const renderCast = (text, cast) => {
  if (typeof text !== 'string') return text;
  return text.replace(/\{(\w+)\}/g, (_, key) => (cast && cast[key]) || `{${key}}`);
};
