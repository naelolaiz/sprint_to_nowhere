// SPDX-License-Identifier: GPL-3.0-only

import { describe, it, expect, afterEach, vi } from 'vitest';
import { applyTeammateContributions } from '../src/game/team.js';
import { midSprint, ticket, withRandom } from './helpers.js';

afterEach(() => vi.restoreAllMocks());

// Random sequence that makes Jin chip in, Sarah skip, Marcus skip, no chaos.
const JIN_ONLY = [0.1, 0.5, 0.9, 0.9, 0.99];

describe('applyTeammateContributions', () => {
  it('returns finite deltas and a well-formed result on many random nights', () => {
    for (let i = 0; i < 500; i++) {
      const s = midSprint();
      s.sprintPlan[0].progress = 3;
      s.sprintPlan[1].shipped = true; s.sprintPlan[1].progress = 4;
      const r = applyTeammateContributions(s);
      for (const k of ['debtDelta', 'moraleDelta', 'burnoutDelta', 'capitalDelta', 'focusDelta']) {
        expect(Number.isFinite(r[k])).toBe(true);
      }
      expect(Array.isArray(r.log)).toBe(true);
      expect(r.sprintPlan).toHaveLength(s.sprintPlan.length);
      for (const t of r.sprintPlan) {
        expect(t.progress).toBeGreaterThanOrEqual(0);
        expect(t.progress).toBeLessThanOrEqual(t.effort);
        if (t.shipped) expect(t.progress).toBe(t.effort);
      }
      for (const c of r.pendingCleanups) {
        expect(typeof c.title).toBe('string');
        expect(c.effort).toBeGreaterThan(0);
        expect(['refactor', 'bug', 'legacy']).toContain(c.type);
      }
      for (const t of r.shipped) expect(t.shipped).toBe(true);
    }
  });

  it("never takes a ticket away from the player when a teammate chips in", () => {
    withRandom(JIN_ONLY);
    const s = midSprint();
    s.sprintPlan[0].progress = 2;           // Feature A: 20%, Jin's pick
    s.sprintPlan[0].assignedTo = 'you';
    s.sprintPlan[1].progress = 3;           // Bug B: 75%
    s.sprintPlan[2].progress = 10;          // Refactor C: 83%
    const r = applyTeammateContributions(s);
    const mine = r.sprintPlan.find(t => t.title === 'Feature A');
    expect(mine.progress).toBeGreaterThan(2);
    expect(mine.assignedTo).toBe('you');
    expect(r.log.some(l => /Jin pushed a quiet fix on "Feature A"/.test(l))).toBe(true);
  });

  it('assigns an untouched ticket to the teammate who worked it', () => {
    withRandom(JIN_ONLY);
    const s = midSprint();
    const r = applyTeammateContributions(s);
    const touched = r.sprintPlan.find(t => t.progress > 0);
    expect(touched.assignedTo).toBe('Jin');
  });

  it('marks a ticket a teammate finishes as shipped and charges its debt', () => {
    withRandom(JIN_ONLY);
    const s = midSprint();
    s.sprintPlan[1] = { ...s.sprintPlan[1], progress: 3.5, assignedTo: 'you' }; // Bug B, 4h
    // Make Bug B the least-progressed ratio target by progressing the others further.
    s.sprintPlan[0].progress = 9.5;
    s.sprintPlan[2].progress = 11.5;
    const r = applyTeammateContributions(s);
    const bug = r.sprintPlan.find(t => t.title === 'Bug B');
    expect(bug.shipped).toBe(true);
    expect(bug.shippedBy).toBe('Jin');
    expect(r.shipped.map(t => t.title)).toContain('Bug B');
    expect(r.debtDelta).toBe(1);
  });

  it('does nothing to an already-shipped plan', () => {
    const s = midSprint();
    s.sprintPlan = s.sprintPlan.map(t => ({ ...t, shipped: true, progress: t.effort }));
    withRandom([0.99]);
    const r = applyTeammateContributions(s);
    expect(r.shipped).toHaveLength(0);
    expect(r.sprintPlan).toEqual(s.sprintPlan);
  });

  it('keeps ownership through a Marcus rewrite of your ticket', () => {
    // Jin skips, Sarah skips, Marcus skips, chaos fires, non-narrative pool, marcus_rewrite.
    const s = midSprint();
    s.sprintPlan[0] = { ...s.sprintPlan[0], progress: 4, assignedTo: 'you' };
    let found = false;
    for (let seed = 0; seed < 2000 && !found; seed++) {
      vi.restoreAllMocks();
      let x = seed;
      vi.spyOn(Math, 'random').mockImplementation(() => {
        x = (x * 9301 + 49297) % 233280;
        return x / 233280;
      });
      const r = applyTeammateContributions(s);
      const rewritten = r.log.find(l => /Marcus "rewrote" the spec/.test(l));
      if (rewritten) {
        found = true;
        const t = r.sprintPlan.find(t => t.title === 'Feature A');
        expect(t.assignedTo).toBe('you');
        expect(t.progress).toBe(0);
        expect(t.effort).toBe(15);
      }
    }
    expect(found).toBe(true);
  });

  it('a chaos night always leaves a standup flavor line behind', () => {
    const s = midSprint();
    s.sprintPlan[0].progress = 3;
    let chaosSeen = 0;
    for (let i = 0; i < 300; i++) {
      const r = applyTeammateContributions(s);
      const chaosLines = r.log.filter(l => /^Overnight:/.test(l) && !/pushed a quiet fix|crushed half|nudged|doc tweak|one more thing|shipped "/.test(l));
      if (chaosLines.length > 0) {
        chaosSeen += 1;
        expect(typeof r.chaosFlavor).toBe('string');
        expect(r.chaosFlavor.length).toBeGreaterThan(10);
      }
    }
    expect(chaosSeen).toBeGreaterThan(50);
  });

  it('keeps a shipped ticket shipped even when chaos targets it', () => {
    const s = midSprint();
    const done = ticket({ title: 'Done D', shipped: true, progress: 8, shippedBy: 'you' });
    s.sprintPlan.push(done);
    for (let i = 0; i < 200; i++) {
      const r = applyTeammateContributions(s);
      const d = r.sprintPlan.find(t => t.title === 'Done D');
      expect(d.shipped).toBe(true);
      expect(d.progress).toBe(8);
    }
  });
});
