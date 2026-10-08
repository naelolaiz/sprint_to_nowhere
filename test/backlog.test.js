// SPDX-License-Identifier: GPL-3.0-only

import { describe, it, expect } from 'vitest';
import { generateBacklog, mkTicket, sample, resetTicketId } from '../src/game/backlog.js';
import { FEATURES, BUGS, REFACTORS } from '../src/data/tickets.js';

describe('generateBacklog', () => {
  it('builds 5 features, 3 bugs and 2 refactors with unique ids and titles', () => {
    for (let i = 0; i < 50; i++) {
      const b = generateBacklog();
      expect(b.filter(t => t.type === 'feature')).toHaveLength(5);
      expect(b.filter(t => t.type === 'bug')).toHaveLength(3);
      expect(b.filter(t => t.type === 'refactor')).toHaveLength(2);
      expect(new Set(b.map(t => t.id)).size).toBe(10);
      expect(new Set(b.map(t => t.title)).size).toBe(10);
      for (const t of b) {
        expect(t.progress).toBe(0);
        expect(t.shipped).toBe(false);
        expect(t.scopeCreep).toBe(0);
        expect(t.baseEffort).toBe(t.effort);
      }
    }
  });

  it('avoids titles already shipped while enough remain', () => {
    const shipped = new Set(FEATURES.slice(0, 20).map(t => t.title));
    for (let i = 0; i < 50; i++) {
      const b = generateBacklog(shipped);
      for (const t of b.filter(t => t.type === 'feature')) expect(shipped.has(t.title)).toBe(false);
    }
  });

  it('falls back to repeats only when the pool is exhausted', () => {
    const shipped = new Set(BUGS.map(t => t.title));
    const b = generateBacklog(shipped);
    expect(b.filter(t => t.type === 'bug')).toHaveLength(3);
  });
});

describe('ticket ids', () => {
  it('keep increasing across backlogs and forced tickets until an explicit reset', () => {
    resetTicketId();
    const a = generateBacklog();
    const forced = mkTicket({ title: 'Forced', effort: 8, debt: 8 }, 'feature', { urgent: true });
    const b = generateBacklog();
    const all = [...a, forced, ...b].map(t => t.id);
    expect(new Set(all).size).toBe(all.length);
    resetTicketId();
    expect(mkTicket({ title: 'X', effort: 1, debt: 0 }, 'bug').id).toBe('t1');
  });
});

describe('sample', () => {
  it('returns n distinct items and tolerates small pools', () => {
    const out = sample(REFACTORS, 5);
    expect(out).toHaveLength(5);
    expect(new Set(out.map(t => t.title)).size).toBe(5);
    expect(sample([1, 2], 5)).toHaveLength(2);
  });
});
