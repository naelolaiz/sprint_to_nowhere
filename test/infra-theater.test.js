// SPDX-License-Identifier: GPL-3.0-only

// The mechanics the infrastructure events lean on: an event queued for
// tomorrow morning, an urgent bug, a capped loss of progress, a dearer
// ask-a-colleague for the rest of the day, and a cleanup ticket queued for
// the next sprint.

import { describe, it, expect, afterEach, vi } from 'vitest';
import { applyChoice } from '../src/game/mechanics.js';
import { applyAction } from '../src/game/actions.js';
import * as flow from '../src/game/flow.js';
import { midSprint, ticket, withRandom } from './helpers.js';

afterEach(() => vi.restoreAllMocks());

describe('queueEvent', () => {
  it('opens tomorrow with the queued event, ahead of the roll, then forgets it', () => {
    const s = applyChoice(midSprint({ currentDay: 2 }), { effect: { queueEvent: 'production_fire' } });
    expect(s.pendingEvents).toEqual(['production_fire']);
    const morning = flow.nextDay(s);
    expect(morning.currentEvent.id).toBe('production_fire');
    expect(morning.pendingEvents).toEqual([]);
    expect(morning.eventQueue.map(e => e.id)).not.toContain('production_fire');
  });

  it('drops a queued event that no longer applies in the morning', () => {
    // velocity_audit needs sprint 3; this is sprint 2.
    const s = applyChoice(midSprint({ currentDay: 2, sprint: 2 }), { effect: { queueEvent: 'velocity_audit' } });
    const morning = flow.nextDay(s);
    expect(morning.currentEvent.id).not.toBe('velocity_audit');
    expect(morning.pendingEvents).toEqual([]);
  });

  it('carries over a sprint boundary and fires on day one', () => {
    const s = applyChoice(midSprint({ currentDay: 5 }), { effect: { queueEvent: 'production_fire' } });
    const planning = flow.nextSprint(flow.nextDay(s));
    const chosen = flow.toggleTicket(planning, planning.backlog[0].id);
    const started = flow.startSprint(chosen);
    expect(started.currentEvent.id).toBe('production_fire');
  });
});

describe('addUrgentBug', () => {
  it('adds an urgent bug ticket and dents morale', () => {
    const s = midSprint();
    const out = applyChoice(s, { effect: { addUrgentBug: true } });
    expect(out.sprintPlan).toHaveLength(s.sprintPlan.length + 1);
    const added = out.sprintPlan.at(-1);
    expect(added.type).toBe('bug');
    expect(added.urgent).toBe(true);
    expect(added.progress).toBe(0);
    expect(out.morale).toBeLessThan(s.morale - 3);
    expect(out.hourHistory.at(-1).kind).toBe('scope');
  });
});

describe('loseProgress', () => {
  it('takes up to the cap off the most-progressed ticket', () => {
    const s = midSprint();
    s.sprintPlan = [
      ticket({ title: 'A little', effort: 8, progress: 1 }),
      ticket({ title: 'A lot', effort: 10, progress: 6 }),
    ];
    const out = applyChoice(s, { effect: { loseProgress: 2 } });
    expect(out.sprintPlan.map(t => t.progress)).toEqual([1, 4]);
    expect(out.dayLog.at(-1)).toContain('"A lot" lost 2.0h');
  });

  it('never goes below zero', () => {
    const s = midSprint();
    s.sprintPlan = [ticket({ title: 'Barely', effort: 8, progress: 0.5 })];
    const out = applyChoice(s, { effect: { loseProgress: 2 } });
    expect(out.sprintPlan[0].progress).toBe(0);
    expect(out.dayLog.at(-1)).toContain('lost 0.5h');
  });

  it('does nothing when nothing has been started', () => {
    const s = midSprint();
    const out = applyChoice(s, { effect: { loseProgress: 2 } });
    expect(out.sprintPlan.map(t => t.progress)).toEqual(s.sprintPlan.map(t => t.progress));
  });
});

describe('askTax', () => {
  it('makes asking a colleague dearer for the rest of the day, then resets', () => {
    withRandom([0.5]);
    const plain = applyAction(midSprint({ dayFocusRemaining: 9 }), 'ask');
    expect(plain.dayFocusRemaining).toBe(8);

    const taxed = applyChoice(midSprint({ dayFocusRemaining: 9 }), { effect: { askTax: 0.25 } });
    expect(taxed.askTaxToday).toBe(0.25);
    const twice = applyChoice(taxed, { effect: { askTax: 0.25 } });
    expect(twice.askTaxToday).toBe(0.5);
    const asked = applyAction(twice, 'ask');
    expect(asked.dayFocusRemaining).toBe(7.5); // 1h ask + 0.5h tax
    expect(asked.dayLog.at(-1)).toContain('extra 0.5h');

    const morning = flow.nextDay(asked);
    expect(morning.askTaxToday).toBe(0);
  });
});

describe('addCleanup', () => {
  it('queues a ticket that is forced into the next sprint', () => {
    const s = applyChoice(midSprint({ currentDay: 5 }), {
      effect: { addCleanup: { title: 'Re-enable the thing', effort: 6, debt: -2, type: 'refactor' } },
    });
    expect(s.pendingCleanups).toEqual([{ title: 'Re-enable the thing', effort: 6, debt: -2, type: 'refactor', urgent: false }]);
    expect(s.dayLog.at(-1)).toContain('Queued for next sprint');
    const planning = flow.nextSprint(flow.nextDay(s));
    withRandom([0.99]);
    const started = flow.startSprint(planning);
    const forced = started.sprintPlan.find(t => t.title === 'Re-enable the thing');
    expect(forced).toBeTruthy();
    expect(forced.type).toBe('refactor');
    expect(forced.effort).toBe(6);
  });
});
