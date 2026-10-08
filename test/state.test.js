// SPDX-License-Identifier: GPL-3.0-only

import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  dailyFocusBudget, pickEvent, pickDayEvents, eventApplicable,
  pushRecentEvent, pushRecentDesc, totalRemaining, initialState,
} from '../src/game/state.js';
import { EVENTS } from '../src/data/events.js';
import { midSprint, ticket } from './helpers.js';

afterEach(() => vi.restoreAllMocks());

describe('dailyFocusBudget', () => {
  it('is a full 9h day when rested', () => {
    expect(dailyFocusBudget(0, 0)).toBe(9);
  });
  it('erodes with burnout and bad-day streaks but never below 5h', () => {
    expect(dailyFocusBudget(50, 0)).toBe(7);
    expect(dailyFocusBudget(0, 4)).toBe(7);
    expect(dailyFocusBudget(100, 10)).toBe(5);
  });
});

describe('totalRemaining', () => {
  it('ignores over-progressed tickets', () => {
    expect(totalRemaining([ticket({ effort: 8, progress: 10 }), ticket({ effort: 4, progress: 1 })])).toBe(3);
  });
});

describe('eventApplicable', () => {
  it('drops in-office events once the player is home, and home events in the office', () => {
    const office = EVENTS.find(e => e.inOffice);
    const home = EVENTS.find(e => e.atHome);
    expect(eventApplicable(office, { atHome: true })).toBe(false);
    expect(eventApplicable(office, { atHome: false })).toBe(true);
    expect(eventApplicable(home, { atHome: false })).toBe(false);
    expect(eventApplicable(home, { atHome: true })).toBe(true);
  });
  it('honors the event requires() predicate', () => {
    const ev = { id: 'x', requires: (s) => s.sprint >= 3 };
    expect(eventApplicable(ev, { sprint: 2 })).toBe(false);
    expect(eventApplicable(ev, { sprint: 3 })).toBe(true);
  });
});

describe('pickEvent', () => {
  it('never returns an excluded, recent, or context-inappropriate event', () => {
    const s = midSprint({ atHome: true });
    const exclude = new Set(['backlog_refinement', 'daily_standup', 'standup_debug', 'morning_arrival']);
    const recent = ['quick_sync', 'scope_change'];
    for (let i = 0; i < 300; i++) {
      const ev = pickEvent(s, exclude, recent);
      expect(exclude.has(ev.id)).toBe(false);
      expect(recent.includes(ev.id)).toBe(false);
      expect(ev.inOffice).toBeFalsy();
      if (ev.requires) expect(ev.requires(s)).toBe(true);
    }
  });
  it('never fires a ceremony as a disruption', () => {
    const s = midSprint();
    for (let i = 0; i < 300; i++) {
      const ev = pickEvent(s, new Set(), []);
      expect(['backlog_refinement', 'daily_standup', 'standup_debug', 'morning_arrival']).not.toContain(ev.id);
    }
  });
});

describe('pickDayEvents', () => {
  it('keeps the morning in order: arrival, then one ceremony, then disruptions', () => {
    const s = midSprint({ currentDay: 2 });
    for (let i = 0; i < 200; i++) {
      const q = pickDayEvents(s).map(e => e.id);
      const ceremonies = q.filter(id => ['backlog_refinement', 'daily_standup', 'standup_debug'].includes(id));
      expect(ceremonies.length).toBeLessThanOrEqual(1);
      const arrival = q.indexOf('morning_arrival');
      if (arrival >= 0) expect(arrival).toBe(0);
      if (ceremonies.length) expect(q.indexOf(ceremonies[0])).toBeLessThanOrEqual(1);
      expect(q.length).toBeGreaterThanOrEqual(1);
      expect(new Set(q).size).toBe(q.length);
    }
  });
  it('always produces at least one disruption on day 1', () => {
    const s = { ...initialState(), phase: 'execution', currentDay: 1, sprintPlan: [] };
    for (let i = 0; i < 50; i++) expect(pickDayEvents(s).length).toBeGreaterThanOrEqual(1);
  });
});

describe('recent trackers', () => {
  it('keep the last six event ids and last three opener indices', () => {
    let r = [];
    for (let i = 0; i < 10; i++) r = pushRecentEvent(r, `e${i}`);
    expect(r).toEqual(['e4', 'e5', 'e6', 'e7', 'e8', 'e9']);
    let m = {};
    for (let i = 0; i < 5; i++) m = pushRecentDesc(m, 'all_hands', i);
    expect(m.all_hands).toEqual([2, 3, 4]);
    expect(pushRecentDesc(m, 'x', undefined)).toBe(m);
  });
});
