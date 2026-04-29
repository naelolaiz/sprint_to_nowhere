// SPDX-License-Identifier: GPL-3.0-only

import { FEATURES, BUGS, REFACTORS } from '../data/tickets.js';

export let nextId = 1;
export const resetTicketId = () => { nextId = 1; };

export const mkTicket = (tpl, type, extra = {}) => ({
  id: `t${nextId++}`, type, title: tpl.title,
  effort: tpl.effort, baseEffort: tpl.effort,
  progress: 0, debtImpact: tpl.debt, scopeCreep: 0, shipped: false,
  ...extra,
});

export const sample = (arr, n) => {
  const copy = [...arr]; const out = [];
  for (let i = 0; i < n && copy.length > 0; i++)
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  return out;
};

// Sample n templates from a pool, preferring ones whose title isn't in
// `excludeTitles`. If the un-shipped pool is too small, the remaining slots
// are filled from the full pool — this is what allows backlog repetition
// after the player has burned through ~10 sprints of unique stories.
const sampleAvoiding = (pool, n, excludeTitles) => {
  const avail = pool.filter(t => !excludeTitles.has(t.title));
  const fromAvail = sample(avail, Math.min(n, avail.length));
  if (fromAvail.length === n) return fromAvail;
  const fromAll = sample(pool.filter(t => !fromAvail.includes(t)), n - fromAvail.length);
  return [...fromAvail, ...fromAll];
};

export const generateBacklog = (excludeTitles = new Set()) => [
  ...sampleAvoiding(FEATURES, 5, excludeTitles).map(t => mkTicket(t, 'feature')),
  ...sampleAvoiding(BUGS, 3, excludeTitles).map(t => mkTicket(t, 'bug')),
  ...sampleAvoiding(REFACTORS, 2, excludeTitles).map(t => mkTicket(t, 'refactor')),
];
