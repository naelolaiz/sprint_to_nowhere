// SPDX-License-Identifier: GPL-3.0-only

// The two mechanics the corporate events add: a day with every booth
// booked, and an event that follows the current one later the same day.

import { describe, it, expect, afterEach, vi } from 'vitest';
import { applyChoice } from '../src/game/mechanics.js';
import { applyAction } from '../src/game/actions.js';
import * as flow from '../src/game/flow.js';
import { EVENTS } from '../src/data/events.js';
import { midSprint } from './helpers.js';

afterEach(() => vi.restoreAllMocks());

describe('boothClosed', () => {
  it('turns the booth into a walk with no bonus, in the office only, until tomorrow', () => {
    const s = applyChoice(midSprint({ capital: 3, dayFocusRemaining: 9 }), { effect: { boothClosed: true } });
    expect(s.boothClosedToday).toBe(true);
    const tried = applyAction(s, 'booth');
    expect(tried.boothBonus).toBe(false);
    expect(tried.capital).toBe(3);
    expect(tried.dayFocusRemaining).toBe(8.75);
    expect(tried.dayLog.at(-1)).toMatch(/booked/);

    const home = applyAction({ ...s, atHome: true }, 'booth');
    expect(home.boothBonus).toBe(true);
    expect(home.capital).toBe(2);

    const morning = flow.nextDay(s);
    expect(morning.boothClosedToday).toBe(false);
  });
});

describe('queueToday', () => {
  it('appends the event to today\'s queue and it plays after the current dialog', () => {
    const s = midSprint({ atHome: false, eventQueue: [] });
    const staged = flow.stageEvent(s, EVENTS.find(e => e.id === 'quick_sync'));
    const out = flow.chooseEvent(staged, { effect: { queueToday: 'loud_sales_call' } });
    expect(out.currentEvent.id).toBe('loud_sales_call');
  });

  it('drops an event that does not fit the day', () => {
    const s = midSprint({ atHome: true, eventQueue: [] });
    const staged = flow.stageEvent(s, EVENTS.find(e => e.id === 'quick_sync'));
    const out = flow.chooseEvent(staged, { effect: { queueToday: 'loud_sales_call' } }); // office-only
    expect(out.subPhase).toBe('work');
    expect(out.eventQueue).toEqual([]);
  });
});
