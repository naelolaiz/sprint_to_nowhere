// SPDX-License-Identifier: GPL-3.0-only

import { vi } from 'vitest';
import { initialState } from '../src/game/state.js';
import { mkTicket } from '../src/game/backlog.js';

// A mid-sprint state with a few tickets, ready to be poked at.
export const midSprint = (overrides = {}) => {
  const s = initialState();
  const plan = [
    mkTicket({ title: 'Feature A', effort: 10, debt: 6 }, 'feature'),
    mkTicket({ title: 'Bug B', effort: 4, debt: 1 }, 'bug'),
    mkTicket({ title: 'Refactor C', effort: 12, debt: -10 }, 'refactor'),
  ];
  return {
    ...s,
    phase: 'execution',
    subPhase: 'work',
    sprint: 2,
    currentDay: 2,
    sprintPlan: plan,
    hourHistory: [{ day: 0, hours: 26, kind: 'start' }],
    ...overrides,
  };
};

export const ticket = (overrides = {}) => ({
  ...mkTicket({ title: 'T', effort: 8, debt: 2 }, 'feature'),
  ...overrides,
});

// Drive Math.random through a fixed sequence (cycles when exhausted).
export const withRandom = (values) => {
  let i = 0;
  const spy = vi.spyOn(Math, 'random').mockImplementation(() => {
    const v = values[i % values.length];
    i += 1;
    return v;
  });
  return spy;
};
