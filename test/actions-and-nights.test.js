// SPDX-License-Identifier: GPL-3.0-only

// Five player actions that each cost something and buy less than they
// promise, and five more ways the office can have a night.

import { describe, it, expect, afterEach, vi } from 'vitest';
import { applyAction } from '../src/game/actions.js';
import { applyChoice } from '../src/game/mechanics.js';
import { applyTeammateContributions } from '../src/game/team.js';
import { pickEvent } from '../src/game/state.js';
import * as flow from '../src/game/flow.js';
import { midSprint, withRandom } from './helpers.js';

afterEach(() => vi.restoreAllMocks());

// Deterministic Math.random from a seed, for hunting a specific chaos case.
const seeded = (seed) => {
  let x = seed;
  vi.spyOn(Math, 'random').mockImplementation(() => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  });
};

// Run applyTeammateContributions over seeds until a log line matches.
const findNight = (mkState, re, max = 4000) => {
  for (let seed = 0; seed < max; seed++) {
    vi.restoreAllMocks();
    seeded(seed);
    const s = mkState();
    const r = applyTeammateContributions(s);
    if (r.log.some(l => re.test(l))) return { s, r };
  }
  return null;
};

const withWork = () => {
  const s = midSprint();
  s.sprintPlan[0] = { ...s.sprintPlan[0], progress: 4 };
  s.sprintPlan[1] = { ...s.sprintPlan[1], progress: 2 };
  return s;
};

describe('block focus time', () => {
  it('usually gets booked over, which costs capital and a sync', () => {
    withRandom([0.1, 0.5]);
    const out = applyAction(midSprint({ dayFocusRemaining: 8, capital: 3 }), 'block');
    expect(out.dayFocusRemaining).toBe(7.75);
    expect(out.capital).toBe(2.5);
    expect(out.actionsToday.block).toBe(1);
    expect(out.subPhase).toBe('event');
    expect(out.currentEvent.id).toBe('quick_sync');
  });

  it('sometimes holds, and that is the whole reward', () => {
    withRandom([0.9, 0.5]);
    const out = applyAction(midSprint({ dayFocusRemaining: 8, focus: 50, burnout: 20 }), 'block');
    expect(out.dayFocusRemaining).toBe(7.75);
    expect(out.focus).toBe(65);
    expect(out.burnout).toBe(18);
    expect(out.subPhase).toBe('work');
  });
});

describe('write the decision down', () => {
  it('shields the most-progressed open ticket for an hour of the day', () => {
    const out = applyAction({ ...withWork(), dayFocusRemaining: 8 }, 'writeup');
    expect(out.dayFocusRemaining).toBe(7);
    expect(out.sprintPlan.find(t => t.title === 'Feature A').shielded).toBe(true);
    expect(out.sprintPlan.find(t => t.title === 'Bug B').shielded).toBeFalsy();
    expect(out.dayLog.at(-1)).toMatch(/A page, with a date/);
  });

  it('still costs the hour when there is nothing to write down', () => {
    const out = applyAction(midSprint({ dayFocusRemaining: 5 }), 'writeup');
    expect(out.dayFocusRemaining).toBe(4);
    expect(out.sprintPlan.every(t => !t.shielded)).toBe(true);
    expect(out.dayLog.at(-1)).toMatch(/TBD/);
  });

  it('a pivot spends the shield and lands the urgent ticket on top anyway', () => {
    const s = applyAction(withWork(), 'writeup');
    const once = applyChoice(s, { effect: { pivotTicket: true } });
    const a = once.sprintPlan.find(t => t.title === 'Feature A');
    expect(a.progress).toBe(4);
    expect(a.shielded).toBe(false);
    expect(once.sprintPlan).toHaveLength(4);
    expect(once.sprintPlan.at(-1).urgent).toBe(true);
    expect(once.dayLog.at(-1)).toMatch(/survived the pivot/);
    // The write-up does not work twice.
    const twice = applyChoice(once, { effect: { pivotTicket: true } });
    expect(twice.sprintPlan.find(t => t.title === 'Feature A')).toBeUndefined();
    expect(twice.sprintCancelled.at(-1).title).toBe('Feature A');
  });

  it('a rewrite spends the shield and keeps the progress, once', () => {
    const s = applyAction(withWork(), 'writeup');
    const once = applyChoice(s, { effect: { wasteProgress: true } });
    const a = once.sprintPlan.find(t => t.title === 'Feature A');
    expect(a.progress).toBe(4);
    expect(a.shielded).toBe(false);
    const twice = applyChoice(once, { effect: { wasteProgress: true } });
    expect(twice.sprintPlan.find(t => t.title === 'Feature A').progress).toBe(0);
  });

  it('an overnight Marcus rewrite becomes a comment when the page exists', () => {
    const mk = () => {
      const s = midSprint();
      s.sprintPlan[0] = { ...s.sprintPlan[0], progress: 4, shielded: true };
      return s;
    };
    const hit = findNight(mk, /found your write-up/);
    expect(hit).not.toBeNull();
    const a = hit.r.sprintPlan.find(t => t.title === 'Feature A');
    expect(a.shielded).toBe(false);
    expect(a.progress).toBeGreaterThanOrEqual(4);
    expect(hit.r.capitalDelta).toBe(-0.5);
    expect(hit.r.log.some(l => /Marcus "rewrote" the spec/.test(l))).toBe(false);
  });

  it('the page is sometimes archived overnight, and sometimes survives', () => {
    let lost = 0; let kept = 0;
    for (let i = 0; i < 300; i++) {
      const s = midSprint({ dayFocusRemaining: 0 });
      s.sprintPlan[0] = { ...s.sprintPlan[0], progress: 4, shielded: true };
      const m = flow.nextDay(s);
      const a = m.sprintPlan.find(t => t.title === 'Feature A');
      const archived = m.dayLog.some(l => /Archive \(2019\)/.test(l));
      const commented = m.dayLog.some(l => /found your write-up/.test(l));
      if (archived) { lost += 1; expect(a.shielded).toBe(false); }
      else if (!commented && a && !a.shipped) { kept += 1; expect(a.shielded).toBe(true); }
    }
    expect(lost).toBeGreaterThan(0);
    expect(kept).toBeGreaterThan(0);
  });
});

describe('headphones on, status red', () => {
  it('is free, sets the flag, and resets in the morning', () => {
    withRandom([0.9, 0.9]);
    const out = applyAction(midSprint({ dayFocusRemaining: 8, capital: 3 }), 'dnd');
    expect(out.dndToday).toBe(true);
    expect(out.dayFocusRemaining).toBe(8);
    expect(out.capital).toBe(3);
    expect(out.subPhase).toBe('work');
    expect(flow.nextDay(out).dndToday).toBe(false);
  });

  it('can still get a tap on the shoulder, and a note about being hard to reach', () => {
    withRandom([0.1, 0.9, 0.5]);
    const tapped = applyAction(midSprint({ dayFocusRemaining: 8 }), 'dnd');
    expect(tapped.currentEvent.id).toBe('shoulder_tap');
    vi.restoreAllMocks();
    withRandom([0.9, 0.1]);
    const noted = applyAction(midSprint({ dayFocusRemaining: 8, capital: 3 }), 'dnd');
    expect(noted.capital).toBe(2.5);
    expect(noted.dayLog.at(-1)).toMatch(/hard to reach/);
  });

  it('halves the odds of a coffee ambush instead of removing them', () => {
    withRandom([0.4]);
    const plain = applyAction(midSprint({ dayFocusRemaining: 8, atHome: false }), 'coffee');
    expect(plain.currentEvent.id).toBe('shoulder_tap');
    vi.restoreAllMocks();
    withRandom([0.4]);
    const quiet = applyAction(midSprint({ dayFocusRemaining: 8, atHome: false, dndToday: true }), 'coffee');
    expect(quiet.subPhase).toBe('work');
    vi.restoreAllMocks();
    withRandom([0.1]);
    const anyway = applyAction(midSprint({ dayFocusRemaining: 8, atHome: false, dndToday: true }), 'coffee');
    expect(anyway.currentEvent.id).toBe('kitchen_karen');
  });
});

describe('vent in the private chat', () => {
  it('usually helps a little and changes nothing', () => {
    withRandom([0.5, 0.5]);
    const out = applyAction(midSprint({ dayFocusRemaining: 8, burnout: 30, morale: 50 }), 'vent');
    expect(out.dayFocusRemaining).toBe(7.75);
    expect(out.burnout).toBe(26);
    expect(out.morale).toBe(55);
    expect(out.actionsToday.vent).toBe(1);
  });

  it('occasionally gets screenshotted', () => {
    withRandom([0.05]);
    const out = applyAction(midSprint({ dayFocusRemaining: 8, capital: 3, morale: 50 }), 'vent');
    expect(out.capital).toBe(1.5);
    expect(out.morale).toBe(42);
    expect(out.dayLog.at(-1)).toMatch(/screenshotted/);
  });
});

describe('update the board', () => {
  it('costs half an hour and a little morale, and keeps the audit away for one day', () => {
    const out = applyAction(midSprint({ dayFocusRemaining: 8, morale: 50, currentDay: 2 }), 'board');
    expect(out.dayFocusRemaining).toBe(7.5);
    expect(out.morale).toBe(48);
    expect(out.boardAccurateUntilDay).toBe(3);

    const sweep = Array.from({ length: 2000 }, (_, i) => i / 2000);
    const picks = (state) => {
      vi.restoreAllMocks();
      withRandom(sweep);
      const ids = new Set();
      for (let i = 0; i < sweep.length; i++) ids.add(pickEvent(state).id);
      return ids;
    };
    const base = { sprint: 3, atHome: false };
    expect(picks(midSprint({ ...base, currentDay: 3, boardAccurateUntilDay: 3 })).has('velocity_audit')).toBe(false);
    expect(picks(midSprint({ ...base, currentDay: 4, boardAccurateUntilDay: 3 })).has('velocity_audit')).toBe(true);
  });
});

describe('five more nights', () => {
  it('an auto-merged major bump adds debt and a pin-it-back ticket', () => {
    const hit = findNight(withWork, /auto-merge/);
    expect(hit).not.toBeNull();
    expect(hit.r.debtDelta).toBeGreaterThanOrEqual(4);
    expect(hit.r.pendingCleanups.some(c => /Pin everything back/.test(c.title))).toBe(true);
  });

  it('a two-approval rule grows every ticket with work on it', () => {
    const hit = findNight(withWork, /branch-protection policy/);
    expect(hit).not.toBeNull();
    for (const title of ['Feature A', 'Bug B']) {
      const before = hit.s.sprintPlan.find(t => t.title === title);
      const after = hit.r.sprintPlan.find(t => t.title === title);
      if (after.shipped) continue;
      expect(after.effort).toBeGreaterThanOrEqual(before.effort + 1);
    }
  });

  it('a wiki migration makes asking cost more, for one day', () => {
    const hit = findNight(withWork, /wiki was migrated/);
    expect(hit).not.toBeNull();
    expect(hit.r.askTax).toBe(0.5);

    // The tax reaches the next morning and is gone the morning after.
    let morning = null;
    for (let seed = 0; seed < 4000 && !morning; seed++) {
      vi.restoreAllMocks();
      seeded(seed);
      const m = flow.nextDay(midSprint({ dayFocusRemaining: 0 }));
      if (m.dayLog.some(l => /wiki was migrated/.test(l))) morning = m;
    }
    expect(morning).not.toBeNull();
    expect(morning.askTaxToday).toBe(0.5);
    vi.restoreAllMocks();
    withRandom([0.99]);
    const after = flow.nextDay({ ...morning, dayFocusRemaining: 0 });
    expect(after.askTaxToday).toBe(0);
  });

  it('a stale-flag cleanup removes up to three hours from the biggest ticket', () => {
    const hit = findNight(withWork, /stale flag cleanup/);
    expect(hit).not.toBeNull();
    const line = hit.r.log.find(l => /stale flag cleanup/.test(l));
    expect(line).toMatch(/−[0-9.]+h, −6 morale/);
    expect(hit.r.moraleDelta).toBeLessThanOrEqual(-6);
  });

  it('the retro action item finds an owner, with a meeting about it', () => {
    const hit = findNight(withWork, /found an owner/);
    expect(hit).not.toBeNull();
    expect(hit.r.pendingCleanups.some(c => /reduce meetings/.test(c.title))).toBe(true);
    expect(hit.r.moraleDelta).toBeLessThanOrEqual(-2);
  });

  it('none of the new nights can leave a ticket outside its bounds', () => {
    for (let i = 0; i < 400; i++) {
      const r = applyTeammateContributions(withWork());
      for (const t of r.sprintPlan) {
        expect(t.progress).toBeGreaterThanOrEqual(0);
        expect(t.progress).toBeLessThanOrEqual(t.effort);
      }
      expect(Number.isFinite(r.askTax)).toBe(true);
    }
  });
});
