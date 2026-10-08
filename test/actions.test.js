// SPDX-License-Identifier: GPL-3.0-only

import { describe, it, expect, afterEach, vi } from 'vitest';
import { applyAction } from '../src/game/actions.js';
import { workOnTicket } from '../src/game/mechanics.js';
import { CAST_POOLS } from '../src/data/cast.js';
import { midSprint, ticket, withRandom } from './helpers.js';

afterEach(() => vi.restoreAllMocks());

describe('applyAction', () => {
  it('ask never finishes a ticket for you', () => {
    const s = midSprint({ dayFocusRemaining: 9 });
    // Least-progressed ratio: Bug B at 0/4 vs others at 0 — make the others progressed.
    s.sprintPlan[0].progress = 5;
    s.sprintPlan[2].progress = 6;
    s.sprintPlan[1].progress = 2; // 2/4 = 50%, still the lowest ratio below
    s.sprintPlan[0].progress = 9; // 90%
    s.sprintPlan[2].progress = 11; // 92%
    const out = applyAction(s, 'ask');
    const bug = out.sprintPlan.find(t => t.title === 'Bug B');
    expect(bug.shipped).toBe(false);
    expect(bug.progress).toBeLessThan(bug.effort);
    expect(bug.progress).toBe(3);
    expect(out.dayFocusRemaining).toBe(8);
    expect(out.capital).toBe(4.5);
    // ...and sitting down to finish it ships it through the normal path.
    const done = workOnTicket(out, bug.id);
    expect(done.sprintPlan.find(t => t.id === bug.id).shipped).toBe(true);
  });

  it('ask on a nearly-done ticket adds no progress but still costs the hour', () => {
    const s = midSprint({ dayFocusRemaining: 9 });
    s.sprintPlan = [ticket({ title: 'Almost', effort: 4, progress: 3.5 })];
    const out = applyAction(s, 'ask');
    expect(out.sprintPlan[0].progress).toBe(3.5);
    expect(out.dayFocusRemaining).toBe(8);
    expect(out.dayLog.at(-1)).toMatch(/The last hour is always yours/);
  });

  it('ask with nothing to work on still spends the hour', () => {
    const s = midSprint({ dayFocusRemaining: 3 });
    s.sprintPlan = s.sprintPlan.map(t => ({ ...t, shipped: true, progress: t.effort }));
    const out = applyAction(s, 'ask');
    expect(out.dayFocusRemaining).toBe(2);
    expect(out.dayLog.at(-1)).toMatch(/Nothing to ask about/);
  });

  it('pair partners can be anyone who touches tickets overnight', () => {
    const seen = new Set();
    for (let i = 0; i < 400; i++) seen.add(applyAction(midSprint(), 'pair').pairPartner);
    expect(seen.has('Jin')).toBe(true);
    expect(seen.has('Sarah')).toBe(true);
    for (const p of seen) expect([...CAST_POOLS.engineers, ...CAST_POOLS.jins]).toContain(p);
  });

  it('pair sets the bonus and partner and costs time and capital', () => {
    const out = applyAction(midSprint({ dayFocusRemaining: 9, capital: 3 }), 'pair');
    expect(out.pairBonus).toBe(true);
    expect(typeof out.pairPartner).toBe('string');
    expect(out.dayFocusRemaining).toBe(7.5);
    expect(out.capital).toBe(2.5);
  });

  it('booth costs capital and no time', () => {
    const out = applyAction(midSprint({ dayFocusRemaining: 9, capital: 3 }), 'booth');
    expect(out.boothBonus).toBe(true);
    expect(out.dayFocusRemaining).toBe(9);
    expect(out.capital).toBe(2);
  });

  it('lunch and walks have diminishing returns and count per day', () => {
    let s = midSprint({ dayFocusRemaining: 9, burnout: 50, focus: 20, morale: 30 });
    const one = applyAction(s, 'lunch');
    const two = applyAction(one, 'lunch');
    expect(one.burnout - s.burnout).toBeLessThan(0);
    expect(Math.abs(two.burnout - one.burnout)).toBeLessThan(Math.abs(one.burnout - s.burnout));
    expect(two.actionsToday.lunch).toBe(2);
    expect(two.dayFocusRemaining).toBe(7);
    const w1 = applyAction(two, 'walk');
    const w2 = applyAction(w1, 'walk');
    expect(w2.actionsToday.walk).toBe(2);
    expect(w2.dayFocusRemaining).toBe(6);
  });

  it('coffee helps for two cups and hurts from the fourth', () => {
    withRandom([0.99]); // clean breaks, no ambush
    let s = midSprint({ dayFocusRemaining: 9, burnout: 50, focus: 40 });
    const cups = [];
    for (let i = 0; i < 4; i++) { s = applyAction(s, 'coffee'); cups.push({ focus: s.focus, burnout: s.burnout }); }
    expect(cups[0].focus).toBeGreaterThan(40);
    expect(cups[3].focus).toBeLessThan(cups[2].focus);
    expect(cups[3].burnout).toBeGreaterThan(cups[2].burnout);
    expect(s.actionsToday.coffee).toBe(4);
    expect(s.dayFocusRemaining).toBeCloseTo(9 - 4 / 3, 5);
    expect(s.subPhase).toBe('work');
  });

  it('coffee in the office can turn into a kitchen ambush dialog', () => {
    withRandom([0.1]);
    const out = applyAction(midSprint({ dayFocusRemaining: 9 }), 'coffee');
    expect(out.subPhase).toBe('event');
    expect(out.currentEvent.id).toBe('kitchen_karen');
    expect(out.recentEventIds).toContain('kitchen_karen');
    expect(out.eventCast._descIdx).toBeDefined();
  });

  it('coffee at home never summons office people', () => {
    withRandom([0.1]);
    const out = applyAction(midSprint({ dayFocusRemaining: 9, atHome: true }), 'coffee');
    expect(out.currentEvent?.id ?? 'none').not.toBe('kitchen_karen');
    if (out.subPhase === 'event') expect(out.currentEvent.atHome).toBe(true);
  });

  it('staying late buys two hours at a cost and marks a bad day', () => {
    const s = midSprint({ dayFocusRemaining: 1, dayFocus: 9, burnout: 10, morale: 50 });
    s.sprintPlan[0].progress = 2;
    const out = applyAction(s, 'late');
    expect(out.dayFocusRemaining).toBe(3);
    expect(out.dayFocus).toBe(11);
    expect(out.burnout).toBe(18);
    expect(out.morale).toBe(48);
    expect(out.stayedLate).toBe(true);
  });

  it('unknown actions are a no-op', () => {
    const s = midSprint();
    const out = applyAction(s, 'nap');
    expect(out.dayFocusRemaining).toBe(s.dayFocusRemaining);
    expect(out.dayLog).toEqual(s.dayLog);
  });
});
