// SPDX-License-Identifier: GPL-3.0-only

// The mechanics the ceremony events lean on: probable outcomes, standing
// daily costs, process changes that lengthen every ticket, estimate
// arguments "resolved" by splitting a card, a capacity commitment that
// arrives next sprint, and events that fire once per run.

import { describe, it, expect, afterEach, vi } from 'vitest';
import { applyChoice, tickDailyTaxes } from '../src/game/mechanics.js';
import { initialState, pickEvent, eventApplicable } from '../src/game/state.js';
import * as flow from '../src/game/flow.js';
import { EVENTS } from '../src/data/events.js';
import { midSprint, ticket, withRandom } from './helpers.js';

afterEach(() => vi.restoreAllMocks());

describe('chance', () => {
  const choice = {
    effect: { focus: -1, chance: { p: 0.5, effect: { debt: 6, focus: -1 }, log: 'it went wrong', elseLog: 'it went fine' } },
    log: 'you chose',
  };

  it('applies the nested effect and its log when the roll lands', () => {
    withRandom([0.1]);
    const s = midSprint({ debt: 20, dayFocusRemaining: 9 });
    const out = applyChoice(s, choice);
    expect(out.debt).toBe(26);
    expect(out.dayFocusRemaining).toBe(7);
    expect(out.dayLog.slice(-2)).toEqual(['you chose', 'it went wrong']);
  });

  it('applies only the base effect and the other log when it misses', () => {
    withRandom([0.9]);
    const s = midSprint({ debt: 20, dayFocusRemaining: 9 });
    const out = applyChoice(s, choice);
    expect(out.debt).toBe(20);
    expect(out.dayFocusRemaining).toBe(8);
    expect(out.dayLog.slice(-2)).toEqual(['you chose', 'it went fine']);
  });

  it('charges the per-interaction drains exactly once either way', () => {
    const base = midSprint({ burnout: 10, focus: 80 });
    withRandom([0.1]);
    const hit = applyChoice(base, choice);
    withRandom([0.9]);
    const miss = applyChoice(base, choice);
    expect(hit.burnout).toBeCloseTo(miss.burnout, 5);
    expect(hit.focus).toBeCloseTo(miss.focus, 5);
  });
});

describe('daily taxes', () => {
  it('a choice records the tax without charging today', () => {
    const s = midSprint({ dayFocusRemaining: 9 });
    const out = applyChoice(s, { effect: { dailyTax: { hours: 0.5, days: 5, label: 'the sync' } } });
    expect(out.dayFocusRemaining).toBe(9);
    expect(out.dailyTaxes).toEqual([{ hours: 0.5, days: 5, label: 'the sync' }]);
  });

  it('ticks hours off the top, logs each, and drops taxes that ran out', () => {
    const t = tickDailyTaxes([
      { hours: 0.5, days: 2, label: 'the sync' },
      { hours: 2, days: 1, label: 'day two' },
      { hours: 1, days: 0, label: 'already over' },
    ]);
    expect(t.hours).toBe(2.5);
    expect(t.taxes).toEqual([{ hours: 0.5, days: 1, label: 'the sync' }]);
    expect(t.log).toHaveLength(2);
    expect(t.log[0]).toContain('the sync');
    expect(t.log[1]).toContain('day two');
  });

  it('comes off the next morning and ends with the sprint', () => {
    withRandom([0.99]);
    const s = midSprint({ burnout: 0, badDayStreak: 0, dailyTaxes: [{ hours: 2, days: 1, label: 'day two' }] });
    const morning = flow.nextDay(s);
    expect(morning.dayFocus).toBe(9);
    expect(morning.dayFocusRemaining).toBe(7);
    expect(morning.dailyTaxes).toEqual([]);
    expect(morning.dayLog.some(l => l.includes('day two'))).toBe(true);

    const taxed = midSprint({ currentDay: 5, dailyTaxes: [{ hours: 0.5, days: 3, label: 'the sync' }] });
    const retro = flow.nextDay(taxed);
    expect(retro.phase).toBe('retro');
    const planning = flow.nextSprint(retro);
    expect(planning.dailyTaxes).toEqual([]);
  });
});

describe('inflateAll', () => {
  it('lengthens every open ticket and leaves finished ones alone', () => {
    const s = midSprint();
    s.sprintPlan = [
      ticket({ title: 'Open', effort: 8, progress: 2 }),
      ticket({ title: 'Done', effort: 4, progress: 4, shipped: true }),
      ticket({ title: 'Untouched', effort: 6 }),
    ];
    const out = applyChoice(s, { effect: { inflateAll: 2 } });
    expect(out.sprintPlan.map(t => t.effort)).toEqual([10, 4, 8]);
    expect(out.hourHistory.at(-1).kind).toBe('scope');
    expect(out.dayLog.at(-1)).toContain('2h');
    expect(out.morale).toBeLessThan(s.morale - 3);
  });
});

describe('splitTicket', () => {
  it('replaces the first untouched ticket with two halves that add up to more', () => {
    const s = midSprint();
    s.sprintPlan = [
      ticket({ title: 'Started', effort: 8, progress: 3 }),
      ticket({ title: 'Fresh', effort: 8, debtImpact: 5, urgent: true }),
      ticket({ title: 'Also fresh', effort: 4 }),
    ];
    const out = applyChoice(s, { effect: { splitTicket: true } });
    const titles = out.sprintPlan.map(t => t.title);
    expect(titles).toEqual(['Started', 'Fresh (part 1)', 'Fresh (part 2)', 'Also fresh']);
    const parts = out.sprintPlan.slice(1, 3);
    expect(parts.map(t => t.effort)).toEqual([5, 5]);
    expect(parts.every(t => t.urgent && t.type === 'feature' && t.progress === 0)).toBe(true);
    expect(new Set(out.sprintPlan.map(t => t.id)).size).toBe(4);
    expect(out.dayLog.at(-1)).toContain('"Fresh" (8h)');
  });

  it('does nothing when every ticket has been touched', () => {
    const s = midSprint();
    s.sprintPlan = [ticket({ title: 'Started', effort: 8, progress: 1 })];
    const out = applyChoice(s, { effect: { splitTicket: true } });
    expect(out.sprintPlan.map(t => t.title)).toEqual(['Started']);
  });
});

describe('velocity commitment', () => {
  it('raises next sprint\'s capacity and forces one extra backlog ticket at kickoff', () => {
    const s = midSprint({ currentDay: 5, sprintCapacity: 60 });
    const committed = applyChoice(s, { effect: { velocityCommit: true } });
    expect(committed.velocityCommit).toBe(true);
    const planning = flow.nextSprint(flow.nextDay(committed));
    expect(planning.sprintCapacity).toBe(72);
    expect(planning.velocityCommit).toBe(true);
    const chosen = flow.toggleTicket(planning, planning.backlog[0].id);
    withRandom([0.99]); // no strategic initiative, so the plan grows by exactly one
    const started = flow.startSprint(chosen);
    expect(started.sprintPlan).toHaveLength(2);
    expect(started.sprintPlan[1].id).not.toBe(planning.backlog[0].id);
    expect(started.velocityCommit).toBe(false);
    expect(started.dayLog.some(l => l.includes('20% more'))).toBe(true);
  });

  it('folding an estimate makes the audit likelier but changes nothing today', () => {
    const s = midSprint({ sprint: 3 });
    const out = applyChoice(s, { effect: { foldEstimate: true } });
    expect(out.foldedEstimates).toBe(1);
    expect(out.sprintPlan).toEqual(s.sprintPlan);
  });
});

describe('once-per-run events', () => {
  const once = EVENTS.filter(e => e.once);

  it('exist and are gated out after they fire', () => {
    expect(once.length).toBeGreaterThan(0);
    const fresh = { ...initialState(), phase: 'execution', sprint: 5, currentDay: 2, sprintPlan: [ticket()], aiMandate: true };
    for (const ev of once) {
      expect(eventApplicable(ev, fresh), `${ev.id} should be eligible before firing`).toBe(true);
      const after = flow.stageEvent(fresh, ev);
      expect(after.onceFired).toContain(ev.id);
      expect(eventApplicable(ev, after), `${ev.id} should not fire twice`).toBe(false);
      for (let i = 0; i < 200; i++) expect(pickEvent(after, new Set(), [])?.id).not.toBe(ev.id);
    }
  });

  it('survive the sprint boundary', () => {
    const s = midSprint({ currentDay: 5, onceFired: once.map(e => e.id) });
    const next = flow.nextSprint(flow.nextDay(s));
    expect(next.onceFired).toEqual(once.map(e => e.id));
  });
});
