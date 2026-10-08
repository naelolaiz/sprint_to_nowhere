// SPDX-License-Identifier: GPL-3.0-only

// One clock for the day: what the openers quote, what the window shows and
// when the calendar lands all come from the hours you have spent.

import { describe, it, expect, afterEach, vi } from 'vitest';
import { usedMinutes, clockMinutes, clockText, timeOfDay, scheduleMinute, WHEN_WINDOWS, minutesToClock } from '../src/game/clock.js';
import { formatClock, sampleEventCast } from '../src/game/cast.js';
import { EVENTS } from '../src/data/events.js';
import { EVENT_WHEN, whenOf } from '../src/data/schedule.js';
import * as flow from '../src/game/flow.js';
import { midSprint, withRandom } from './helpers.js';
import { descText } from '../src/game/cast.js';

afterEach(() => vi.restoreAllMocks());

describe('the clock', () => {
  it('starts at nine and moves with the hours you spend', () => {
    expect(clockText(midSprint({ dayFocus: 9, dayFocusRemaining: 9 }))).toBe('9:00 AM');
    expect(clockText(midSprint({ dayFocus: 9, dayFocusRemaining: 5.5 }))).toBe('12:30 PM');
    expect(clockText(midSprint({ dayFocus: 9, dayFocusRemaining: 0 }))).toBe('6:00 PM');
    // Staying late extends the day; the clock keeps going rather than rewinding.
    expect(clockText(midSprint({ dayFocus: 11, dayFocusRemaining: 2 }))).toBe('6:00 PM');
    expect(clockText(midSprint({ dayFocus: 11, dayFocusRemaining: 0 }))).toBe('8:00 PM');
    expect(usedMinutes(midSprint({ dayFocus: 7, dayFocusRemaining: 7.5 }))).toBe(0);
  });

  it('names the time of day with sensible edges', () => {
    expect(timeOfDay(9 * 60)).toBe('morning');
    expect(timeOfDay(11 * 60 + 29)).toBe('morning');
    expect(timeOfDay(11 * 60 + 30)).toBe('midday');
    expect(timeOfDay(13 * 60 + 30)).toBe('afternoon');
    expect(timeOfDay(17 * 60)).toBe('evening');
    expect(timeOfDay(19 * 60)).toBe('night');
    expect(timeOfDay(clockMinutes(midSprint({ dayFocus: 9, dayFocusRemaining: 9 })))).toBe('morning');
    expect(minutesToClock(0)).toBe('12:00 AM');
    expect(minutesToClock(12 * 60 + 5)).toBe('12:05 PM');
  });

  it('is the clock the openers quote', () => {
    const s = midSprint({ dayFocus: 9, dayFocusRemaining: 4 });
    const cast = sampleEventCast('quick_sync', [], s);
    expect(formatClock(cast, 0)).toBe('2:00 PM');
    expect(formatClock(cast, 11)).toBe('2:11 PM');
  });

  it('schedules inside the window and inside the day', () => {
    for (const when of Object.keys(WHEN_WINDOWS)) {
      for (let i = 0; i < 200; i++) {
        const m = scheduleMinute(when, 9 * 60);
        expect(m).toBeGreaterThanOrEqual(WHEN_WINDOWS[when][0]);
        expect(m).toBeLessThanOrEqual(WHEN_WINDOWS[when][1]);
        expect(m).toBeLessThanOrEqual(9 * 60 - 30);
      }
    }
    // A short day still gets its afternoon items, earlier.
    for (let i = 0; i < 100; i++) {
      const m = scheduleMinute('afternoon', 5 * 60);
      expect(m).toBeLessThanOrEqual(5 * 60 - 30);
      expect(m).toBeGreaterThanOrEqual(0);
    }
  });

  it('only names real events and real windows in the schedule table', () => {
    const ids = new Set(EVENTS.map(e => e.id));
    for (const [id, when] of Object.entries(EVENT_WHEN)) {
      expect(ids.has(id)).toBe(true);
      expect(Object.keys(WHEN_WINDOWS)).toContain(when);
    }
    expect(whenOf(EVENTS.find(e => e.id === 'quick_sync'))).toBe('any');
    expect(whenOf(EVENTS.find(e => e.id === 'initiative_cancelled'))).toBe('afternoon');
  });
});

describe('openers and the clock', () => {
  const openers = (ev) => {
    const pool = Array.isArray(ev.descriptions) ? ev.descriptions : (ev.nodes?.[ev.start || 'start']?.descriptions || []);
    const s = midSprint({ dayFocus: 9, dayFocusRemaining: 9 });
    return pool.map(d => {
      const t = descText(d);
      return typeof t === 'function' ? t(s, { _baseMin: 0 }) : t;
    }).filter(t => typeof t === 'string');
  };

  it('afternoon events never open with "this morning", morning events never with "this afternoon"', () => {
    for (const ev of EVENTS) {
      const when = whenOf(ev);
      for (const text of openers(ev)) {
        if (when === 'afternoon') expect(text, ev.id).not.toMatch(/\bthis morning\b/i);
        if (when === 'morning') expect(text, ev.id).not.toMatch(/\bthis afternoon\b|\bafter lunch\b/i);
      }
    }
  });

  it('an opener that states the time states the clock', () => {
    const reorg = EVENTS.find(e => e.id === 'reorg');
    const texts = openers(reorg);
    expect(texts.some(t => /It is 9:00 AM\./.test(t))).toBe(true);
    expect(texts.some(t => /It is 10:43/.test(t))).toBe(false);
  });
});

// A morning with a standup and one disruption at a known minute.
const dayWith = (atMinutes, overrides = {}) => {
  const s = midSprint({ dayFocus: 9, dayFocusRemaining: 9, subPhase: 'work', eventQueue: [], ...overrides });
  s.scheduledEvents = atMinutes.map((at, i) => ({ id: ['quick_sync', 'loud_sales_call', 'shoulder_tap'][i % 3], at })).sort((a, b) => a.at - b.at);
  return s;
};

describe('the calendar', () => {
  it('splits the roll: ceremonies open the day, disruptions get a minute', () => {
    // morning_arrival no, refinement no (day 2 => standup path), standup yes
    withRandom([0.99, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
    const s = midSprint({ subPhase: 'day-summary', currentDay: 1, dayFocusRemaining: 0 });
    const out = flow.nextDay(s);
    expect(out.subPhase).toBe('event');
    expect(['daily_standup', 'standup_debug']).toContain(out.currentEvent.id);
    expect(out.eventQueue).toEqual([]);
    expect(out.scheduledEvents.length).toBeGreaterThanOrEqual(1);
    for (const e of out.scheduledEvents) {
      expect(typeof e.id).toBe('string');
      expect(e.at).toBeGreaterThanOrEqual(0);
      expect(e.at).toBeLessThanOrEqual(out.dayFocus * 60 - 30);
    }
    const ats = out.scheduledEvents.map(e => e.at);
    expect([...ats].sort((a, b) => a - b)).toEqual(ats);
  });

  it('lands afternoon items in the afternoon', () => {
    for (let i = 0; i < 300; i++) {
      const out = flow.nextDay(midSprint({ subPhase: 'day-summary', currentDay: 2, dayFocusRemaining: 0, burnout: 0, badDayStreak: 0 }));
      for (const e of out.scheduledEvents) {
        const when = whenOf(EVENTS.find(ev => ev.id === e.id));
        const [lo, hi] = WHEN_WINDOWS[when];
        expect(e.at).toBeGreaterThanOrEqual(Math.min(lo, out.dayFocus * 60 - 30));
        expect(e.at).toBeLessThanOrEqual(hi);
      }
    }
  });

  it('interrupts a sitting when the clock reaches the next item, and the ticket waits', () => {
    const s = dayWith([120]);
    s.sprintPlan[0] = { ...s.sprintPlan[0], effort: 10, progress: 0 };
    const out = flow.work(s, s.sprintPlan[0].id);
    expect(out.subPhase).toBe('event');
    expect(out.currentEvent.id).toBe('quick_sync');
    expect(out.dayFocusRemaining).toBe(7);
    expect(out.scheduledEvents).toEqual([]);
    expect(out.resumeTicketId).toBe(s.sprintPlan[0].id);
    expect(out.dayLog.some(l => /^— 11:00 AM: /.test(l))).toBe(true);
    const t = out.sprintPlan[0];
    expect(t.progress).toBeGreaterThan(0);
    expect(t.progress).toBeLessThan(t.effort);
  });

  it('sitting back down on the interrupted ticket costs no context switch', () => {
    const s = dayWith([60]);
    s.sprintPlan[0] = { ...s.sprintPlan[0], effort: 10, progress: 0 };
    const id = s.sprintPlan[0].id;
    const cut = flow.work(s, id);
    expect(cut.actionsToday.work).toBe(1);
    // Resolve the interruption, then resume.
    const back = flow.chooseEvent({ ...cut, dialogNode: 'start' }, { effect: {} });
    expect(back.subPhase).toBe('work');
    expect(back.resumeTicketId).toBe(id);
    const resumed = flow.work(back, id);
    expect(resumed.actionsToday.work).toBe(1);
    expect(resumed.dayLog.some(l => /Context switch|before the first keystroke/i.test(l))).toBe(false);
    expect(resumed.resumeTicketId).toBeNull();
    // A different ticket after the interruption still pays the tax.
    const other = flow.work(back, s.sprintPlan[1].id);
    expect(other.actionsToday.work).toBe(2);
  });

  it('fires what is due after a break and chains several due items', () => {
    const s = dayWith([10, 20]);
    const out = flow.action(s, 'lunch');
    expect(out.subPhase).toBe('event');
    expect(out.currentEvent.id).toBe('quick_sync');
    expect(out.eventQueue.map(e => e.id)).toEqual(['loud_sales_call']);
    expect(out.scheduledEvents).toEqual([]);
  });

  it('a break that fires its own ambush leaves the calendar for afterwards', () => {
    withRandom([0.1]);
    const s = dayWith([10], { atHome: false });
    const out = flow.action(s, 'coffee');
    expect(out.subPhase).toBe('event');
    expect(out.currentEvent.id).toBe('kitchen_karen');
    expect(out.scheduledEvents).toHaveLength(1);
    const after = flow.chooseEvent({ ...out, dialogNode: 'start' }, { effect: {} });
    expect(after.currentEvent.id).toBe('quick_sync');
  });

  it('drops a scheduled item that no longer applies', () => {
    const s = dayWith([30]);
    s.scheduledEvents = [{ id: 'fire_drill', at: 30 }];
    s.atHome = true;
    const out = flow.action(s, 'lunch');
    expect(out.subPhase).toBe('work');
    expect(out.scheduledEvents).toEqual([]);
  });

  it('calling it a day early does not cancel the rest of the calendar', () => {
    const s = dayWith([300, 420]);
    const out = flow.skipWork({ ...s, dayFocusRemaining: 6 });
    expect(out.subPhase).toBe('event');
    expect(out.leaving).toBe(true);
    expect(out.dayFocusRemaining).toBe(2);
    expect(out.eventQueue).toHaveLength(1);
    const next = flow.chooseEvent({ ...out, dialogNode: 'start' }, { effect: {} });
    expect(next.subPhase).toBe('event');
    const done = flow.chooseEvent({ ...next, dialogNode: 'start' }, { effect: {} });
    expect(done.subPhase).toBe('day-summary');
    expect(flow.nextDay(done).leaving).toBe(false);
  });

  it('calling it a day with an empty calendar is just the summary', () => {
    const out = flow.skipWork(dayWith([]));
    expect(out.subPhase).toBe('day-summary');
  });

  it('a switch that eats the gap fires the item as you sit down', () => {
    const s = dayWith([50], { actionsToday: { work: 1 } });
    const id = s.sprintPlan[1].id;
    const out = flow.work(s, id);
    expect(out.subPhase).toBe('event');
    expect(out.resumeTicketId).toBe(id);
    expect(out.dayLog.some(l => /Before the first keystroke/.test(l))).toBe(true);
  });
});
