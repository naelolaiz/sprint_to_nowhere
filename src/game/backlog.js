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

export const generateBacklog = () => [
  ...sample(FEATURES, 5).map(t => mkTicket(t, 'feature')),
  ...sample(BUGS, 3).map(t => mkTicket(t, 'bug')),
  ...sample(REFACTORS, 2).map(t => mkTicket(t, 'refactor')),
];
