// SPDX-License-Identifier: GPL-3.0-only

import { describe, it, expect, afterEach, vi } from 'vitest';
import { applyChoice, workOnTicket, debtSpeedPenalty, burnoutSpeedPenalty, dayFrac, contextSwitchCost, applyContextSwitch } from '../src/game/mechanics.js';
import { EVENTS } from '../src/data/events.js';
import { midSprint, ticket } from './helpers.js';

afterEach(() => vi.restoreAllMocks());

describe('speed penalties', () => {
  it('never speed you up and get worse as things get worse', () => {
    const ds = [0, 50, 51, 65, 66, 80, 81, 100].map(debtSpeedPenalty);
    const bs = [0, 50, 51, 70, 71, 85, 86, 100].map(burnoutSpeedPenalty);
    for (const arr of [ds, bs]) {
      for (let i = 1; i < arr.length; i++) expect(arr[i]).toBeLessThanOrEqual(arr[i - 1]);
      expect(arr[0]).toBe(1);
    }
  });
});

describe('dayFrac', () => {
  it('stays strictly inside the current day', () => {
    expect(dayFrac({ currentDay: 2, dayFocus: 9, dayFocusRemaining: 9 })).toBeCloseTo(1.001, 3);
    expect(dayFrac({ currentDay: 2, dayFocus: 9, dayFocusRemaining: 0 })).toBeCloseTo(1.999, 3);
  });
});

describe('applyChoice', () => {
  it('clamps every meter to its range', () => {
    const s = midSprint({ debt: 99, capital: 5, burnout: 99, morale: 100, focus: 100 });
    const out = applyChoice(s, { effect: { debt: 50, capital: 3, burnout: 50, morale: 50, focusPct: 50 } });
    expect(out.debt).toBe(100);
    expect(out.capital).toBe(5);
    expect(out.burnout).toBe(100);
    expect(out.morale).toBeLessThanOrEqual(100);
    expect(out.focus).toBeLessThanOrEqual(100);
    const low = applyChoice(midSprint({ debt: 1, capital: 0, burnout: 0, morale: 0, focus: 0 }), { effect: { debt: -50, capital: -3, burnout: -50, morale: -50, focusPct: -50 } });
    expect(low.debt).toBe(0);
    expect(low.capital).toBe(0);
    expect(low.burnout).toBe(0);
    expect(low.morale).toBe(0);
    expect(low.focus).toBe(0);
  });

  it('charges a small interaction tax even for a no-op choice', () => {
    const s = midSprint();
    const out = applyChoice(s, {});
    expect(out.burnout).toBeGreaterThan(s.burnout);
    expect(out.focus).toBeLessThan(s.focus);
    expect(out.morale).toBeLessThan(s.morale);
  });

  it('scopeCreep grows an unshipped feature by 6h and records a scope point', () => {
    const s = midSprint();
    const out = applyChoice(s, { effect: { scopeCreep: true } });
    const feat = out.sprintPlan.find(t => t.type === 'feature');
    expect(feat.effort).toBe(16);
    expect(feat.scopeCreep).toBe(1);
    expect(out.hourHistory.at(-1).kind).toBe('scope');
    expect(out.morale).toBeLessThan(s.morale);
  });

  it('bumpRefactor swaps the refactor for an urgent feature and remembers it', () => {
    const s = midSprint();
    const out = applyChoice(s, { effect: { bumpRefactor: true } });
    expect(out.sprintPlan.some(t => t.type === 'refactor')).toBe(false);
    expect(out.sprintPlan.some(t => t.urgent)).toBe(true);
    expect(out.sprintBumped).toHaveLength(1);
    expect(out.sprintBumped[0].bumped).toBe('Refactor C');
  });

  it('pivotTicket throws away the most-progressed ticket', () => {
    const s = midSprint();
    s.sprintPlan[0].progress = 3;
    s.sprintPlan[1].progress = 2.5;
    const out = applyChoice(s, { effect: { pivotTicket: true } });
    expect(out.sprintPlan.find(t => t.title === 'Feature A')).toBeUndefined();
    expect(out.sprintCancelled[0]).toEqual({ title: 'Feature A', hoursLost: 3 });
  });

  it('wasteProgress zeroes the most-progressed ticket without replacing it', () => {
    const s = midSprint();
    s.sprintPlan[2].progress = 7;
    const out = applyChoice(s, { effect: { wasteProgress: true } });
    expect(out.sprintPlan.find(t => t.title === 'Refactor C').progress).toBe(0);
    expect(out.sprintPlan).toHaveLength(3);
  });

  it('cancelInitiative only removes a strategic ticket', () => {
    const s = midSprint();
    expect(applyChoice(s, { effect: { cancelInitiative: true } }).sprintPlan).toHaveLength(3);
    s.sprintPlan.push(ticket({ title: '[STRATEGIC] thing', strategic: true, progress: 4 }));
    const out = applyChoice(s, { effect: { cancelInitiative: true } });
    expect(out.sprintPlan).toHaveLength(3);
    expect(out.sprintCancelled[0].hoursLost).toBe(4);
  });

  it('goHome drops queued in-office events and may inject a home one', () => {
    const office = EVENTS.find(e => e.inOffice);
    const remote = EVENTS.find(e => !e.inOffice && !e.atHome);
    const s = midSprint({ eventQueue: [office, remote] });
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // no injection
    const out = applyChoice(s, { effect: { goHome: true } });
    expect(out.atHome).toBe(true);
    expect(out.eventQueue.map(e => e.id)).toEqual([remote.id]);
  });

  it('renders cast placeholders in the choice log', () => {
    const s = midSprint({ eventCast: { person: 'Doug' } });
    const out = applyChoice(s, { log: '{person} talked for an hour.' });
    expect(out.dayLog.at(-1)).toBe('Doug talked for an hour.');
  });

  it('uses the logByDesc override for the opener that was rolled', () => {
    const s = midSprint({ eventCast: { _descIdx: 2 } });
    const choice = { log: 'generic', logByDesc: { 2: 'specific' } };
    expect(applyChoice(s, choice).dayLog.at(-1)).toBe('specific');
    expect(applyChoice(midSprint({ eventCast: { _descIdx: 1 } }), choice).dayLog.at(-1)).toBe('generic');
  });
});

describe('workOnTicket', () => {
  it('spends the hours the ticket needs, not the whole day, and ships it', () => {
    const s = midSprint({ dayFocusRemaining: 9, focus: 100, morale: 70, burnout: 0, debt: 0 });
    const bug = s.sprintPlan.find(t => t.type === 'bug');
    const out = workOnTicket(s, bug.id);
    const done = out.sprintPlan.find(t => t.id === bug.id);
    expect(done.shipped).toBe(true);
    expect(done.progress).toBe(done.effort);
    expect(out.dayFocusRemaining).toBeGreaterThan(0);
    expect(out.totalShipped).toBe(1);
    expect(out.sprintShipped).toHaveLength(1);
    expect(out.shippedTitles).toContain('Bug B');
    expect(out.hourHistory.at(-1).kind).toBe('work');
  });

  it('never ships the same ticket twice', () => {
    const s = midSprint({ dayFocusRemaining: 9 });
    const bug = s.sprintPlan.find(t => t.type === 'bug');
    const once = workOnTicket(s, bug.id);
    const twice = workOnTicket(once, bug.id);
    expect(twice.totalShipped).toBe(1);
    expect(twice.dayLog).toHaveLength(once.dayLog.length);
  });

  it('refuses to work with no hours left', () => {
    const s = midSprint({ dayFocusRemaining: 0 });
    const out = workOnTicket(s, s.sprintPlan[0].id);
    expect(out.sprintPlan[0].progress).toBe(0);
  });

  it('is slower when debt, burnout, focus and morale are bad', () => {
    const good = midSprint({ dayFocusRemaining: 4, debt: 0, burnout: 0, focus: 100, morale: 100 });
    const bad = midSprint({ dayFocusRemaining: 4, debt: 90, burnout: 90, focus: 30, morale: 10 });
    const id = good.sprintPlan[0].id;
    expect(workOnTicket(bad, id).sprintPlan[0].progress).toBeLessThan(workOnTicket(good, id).sprintPlan[0].progress);
  });

  it('consumes pairing and booth bonuses after one session', () => {
    const s = midSprint({ dayFocusRemaining: 2, pairBonus: true, pairPartner: 'Sarah', boothBonus: true });
    const out = workOnTicket(s, s.sprintPlan[0].id);
    expect(out.pairBonus).toBe(false);
    expect(out.pairPartner).toBeNull();
    expect(out.boothBonus).toBe(false);
    expect(out.dayLog.at(-1)).toMatch(/pairing \+50%, focus mode \+30%/);
  });

  it("taking a teammate's ticket costs morale; pairing in with them does not", () => {
    const s = midSprint({ dayFocusRemaining: 2, morale: 50 });
    s.sprintPlan[0].assignedTo = 'Jin';
    const stolen = workOnTicket(s, s.sprintPlan[0].id);
    expect(stolen.morale).toBeLessThan(50);
    expect(stolen.dayLog.at(-1)).toMatch(/took .* from @Jin/);
    expect(stolen.sprintPlan[0].assignedTo).toBe('you');

    const paired = workOnTicket({ ...s, pairBonus: true, pairPartner: 'Jin' }, s.sprintPlan[0].id);
    expect(paired.dayLog.at(-1)).toMatch(/paired in on @Jin/);
    expect(paired.sprintPlan[0].assignedTo).toBe('you & Jin');
    expect(paired.morale).toBeGreaterThan(stolen.morale);
  });

  it('shipping a scope-crept feature adds extra debt', () => {
    const s = midSprint({ dayFocusRemaining: 9, debt: 20, focus: 100, morale: 100 });
    const bug = s.sprintPlan.find(t => t.type === 'bug');
    const clean = workOnTicket(s, bug.id);
    const crept = midSprint({ dayFocusRemaining: 9, debt: 20, focus: 100, morale: 100 });
    crept.sprintPlan[0] = { ...crept.sprintPlan[0], effort: 2, scopeCreep: 2 };
    const out = workOnTicket(crept, crept.sprintPlan[0].id);
    expect(out.sprintShipped[0].debtChange).toBe(6 + 4);
    expect(clean.sprintShipped[0].debtChange).toBe(1);
  });
});

describe('context switching', () => {
  it('costs more with every switch', () => {
    const a = contextSwitchCost(1), b = contextSwitchCost(2), c = contextSwitchCost(3);
    expect(a).toEqual({ hours: 1, focus: 10, burnout: 1.5 });
    expect(b.hours).toBeGreaterThan(a.hours);
    expect(c.hours).toBeGreaterThan(b.hours);
    expect(c.focus).toBeGreaterThan(a.focus);
    expect(contextSwitchCost(0).hours).toBe(1);
  });
  it('takes hours, focus and burnout, and never goes below zero hours', () => {
    const s = midSprint({ dayFocusRemaining: 0.5, focus: 50, burnout: 99 });
    const out = applyContextSwitch(s, 1);
    expect(out.dayFocusRemaining).toBe(0);
    expect(out.focus).toBe(40);
    expect(out.burnout).toBe(100);
    expect(out.dayLog.length).toBe(s.dayLog.length + 1);
    expect(out.dayLog.at(-1)).toMatch(/0\.5h/);
  });
});
