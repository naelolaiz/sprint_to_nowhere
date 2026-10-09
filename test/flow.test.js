// SPDX-License-Identifier: GPL-3.0-only

import { describe, it, expect, afterEach, vi } from 'vitest';
import * as flow from '../src/game/flow.js';
import { initialState } from '../src/game/state.js';
import { resetTicketId } from '../src/game/backlog.js';
import { EVENTS, MELTDOWN_EVENT } from '../src/data/events.js';
import { midSprint, ticket, withRandom } from './helpers.js';

afterEach(() => vi.restoreAllMocks());

const planned = () => {
  resetTicketId();
  let s = flow.startGame(initialState());
  for (const t of s.backlog.slice(0, 4)) s = flow.toggleTicket(s, t.id);
  return s;
};

describe('planning', () => {
  it('startGame deals a backlog and clears the plan', () => {
    const s = flow.startGame(initialState());
    expect(s.phase).toBe('planning');
    expect(s.backlog).toHaveLength(10);
    expect(s.sprintPlan).toEqual([]);
  });
  it('toggleTicket adds, removes, and ignores unknown ids', () => {
    let s = flow.startGame(initialState());
    const id = s.backlog[0].id;
    s = flow.toggleTicket(s, id);
    expect(s.sprintPlan.map(t => t.id)).toEqual([id]);
    s = flow.toggleTicket(s, id);
    expect(s.sprintPlan).toEqual([]);
    expect(flow.toggleTicket(s, 'nope')).toBe(s);
  });
});

describe('startSprint', () => {
  it('forces carry-over cleanups into the plan with ids that collide with nothing', () => {
    withRandom([0.99]); // no strategic initiative, deterministic events
    let s = planned();
    s.pendingCleanups = [
      { title: 'Cleanup 1', effort: 5, debt: -1, type: 'refactor', urgent: true },
      { title: 'Cleanup 2', effort: 6, debt: 0, type: 'legacy', urgent: false },
    ];
    const out = flow.startSprint(s);
    expect(out.phase).toBe('execution');
    // The morning opens with a ceremony or at the desk with the day's
    // disruptions on the clock; either way the day has something in it.
    expect(['event', 'work']).toContain(out.subPhase);
    expect(out.scheduledEvents.length + (out.subPhase === 'event' ? 1 : 0)).toBeGreaterThan(0);
    expect(out.currentDay).toBe(1);
    expect(out.sprintPlan).toHaveLength(6);
    expect(new Set(out.sprintPlan.map(t => t.id)).size).toBe(6);
    expect(out.sprintPlan.find(t => t.title === 'Cleanup 2').legacy).toBe(true);
    expect(out.pendingCleanups).toEqual([]);
    expect(out.hourHistory[0]).toEqual({ day: 0, hours: out.sprintPlan.reduce((a, t) => a + t.effort, 0), kind: 'start' });
    expect(out.dayLog.filter(l => /Carry-over/.test(l))).toHaveLength(2);
    if (out.subPhase === 'event') {
      expect(out.currentEvent).toBeTruthy();
      expect(out.recentEventIds).toContain(out.currentEvent.id);
    }
  });

  it('sometimes has management force a strategic initiative in', () => {
    withRandom([0.1, 0.5]);
    const out = flow.startSprint(planned());
    expect(out.sprintPlan.some(t => t.strategic && t.urgent)).toBe(true);
  });

  it('sizes the day from burnout and the bad-day streak', () => {
    withRandom([0.99]);
    const out = flow.startSprint({ ...planned(), burnout: 60, badDayStreak: 0 });
    expect(out.dayFocus).toBe(7);
    expect(out.dayFocusRemaining).toBe(7);
  });
});

describe('chooseEvent', () => {
  const flat = EVENTS.find(e => e.id === 'quick_sync');
  const office = EVENTS.find(e => e.inOffice);

  it('advances multi-turn dialogs and applies effects', () => {
    const s = midSprint({ subPhase: 'event', currentEvent: flat, dialogNode: 'start', dayFocusRemaining: 9, eventQueue: [] });
    const mid = flow.chooseEvent(s, { next: 'later', effect: { focus: -1 } });
    expect(mid.dialogNode).toBe('later');
    expect(mid.subPhase).toBe('event');
    expect(mid.dayFocusRemaining).toBe(8);
  });

  it('moves to the next queued event, skipping ones that no longer apply', () => {
    const s = midSprint({ subPhase: 'event', currentEvent: flat, dialogNode: 'start', eventQueue: [office, flat] });
    const out = flow.chooseEvent(s, { effect: { goHome: true } });
    expect(out.atHome).toBe(true);
    expect(out.subPhase).toBe('event');
    expect(out.currentEvent.id).not.toBe(office.id);
    expect(out.dayLog.at(-1)).toMatch(/^— and then: /);
  });

  it('goes to work once the queue is empty', () => {
    const s = midSprint({ subPhase: 'event', currentEvent: flat, dialogNode: 'start', eventQueue: [] });
    const out = flow.chooseEvent(s, { effect: { focus: -2 } });
    expect(out.subPhase).toBe('work');
    expect(out.eventQueue).toEqual([]);
    expect(out.dialogNode).toBe('start');
  });

  it('a meltdown ending is game over with that flavor', () => {
    const s = midSprint({ subPhase: 'event', currentEvent: MELTDOWN_EVENT, dialogNode: 'boardroom' });
    const out = flow.chooseEvent(s, { meltdownEnding: 'walked_out' });
    expect(out.phase).toBe('gameover');
    expect(out.gameOverReason).toBe('meltdown');
    expect(out.meltdownEnding).toBe('walked_out');
  });
});

describe('work / skipWork', () => {
  it('a ticket that eats the whole day ends it', () => {
    const s = midSprint({ dayFocusRemaining: 9, focus: 100, morale: 70 });
    const out = flow.work(s, s.sprintPlan[2].id); // Refactor C, 12h
    expect(out.subPhase).toBe('day-summary');
    expect(out.dayFocusRemaining).toBe(0);
    expect(out.actionsToday.work).toBe(1);
    expect(flow.skipWork(s).subPhase).toBe('day-summary');
  });

  it('a short ticket leaves you at your desk with the rest of the day', () => {
    const s = midSprint({ dayFocusRemaining: 9, focus: 100, morale: 70, debt: 0, burnout: 0 });
    const bug = s.sprintPlan.find(t => t.type === 'bug'); // 4h
    const out = flow.work(s, bug.id);
    expect(out.subPhase).toBe('work');
    expect(out.dayFocusRemaining).toBeGreaterThan(0);
    expect(out.sprintPlan.find(t => t.id === bug.id).shipped).toBe(true);
    expect(out.actionsToday.work).toBe(1);
  });

  it('the second ticket of the day pays a context-switch tax first, the third pays more', () => {
    const s = midSprint({ dayFocusRemaining: 9, focus: 100, morale: 70, debt: 0, burnout: 0 });
    s.sprintPlan = [
      ticket({ title: 'Small 1', effort: 2 }),
      ticket({ title: 'Small 2', effort: 2 }),
      ticket({ title: 'Big', effort: 20 }),
    ];
    const one = flow.work(s, s.sprintPlan[0].id);
    expect(one.dayFocusRemaining).toBe(7);
    const two = flow.work(one, s.sprintPlan[1].id);
    // 1.0h switch, then the 2h ticket (a little slower now that focus took a hit)
    expect(two.sprintPlan[1].shipped).toBe(true);
    expect(two.dayFocusRemaining).toBeLessThanOrEqual(4);
    expect(two.dayFocusRemaining).toBeGreaterThanOrEqual(3);
    expect(two.focus).toBeLessThan(one.focus - 9);
    expect(two.burnout).toBeGreaterThan(one.burnout);
    expect(two.actionsToday.work).toBe(2);
    // Every context-switch flavor line ends in the hours it cost; the wording varies.
    expect(two.dayLog.some(l => l.includes('1.0h'))).toBe(true);
    const three = flow.work(two, s.sprintPlan[2].id);
    // 1.5h switch, then the rest of the day on the big one
    expect(three.subPhase).toBe('day-summary');
    expect(three.dayFocusRemaining).toBe(0);
    const big = three.sprintPlan.find(t => t.title === 'Big');
    expect(big.progress).toBeGreaterThan(0);
    expect(big.progress).toBeLessThanOrEqual(2.5 * 1.3); // at most 2.5h of work, morale bonus aside
  });

  it('with too little day left to switch, opening another ticket just ends the day', () => {
    const s = midSprint({ dayFocusRemaining: 1, actionsToday: { work: 1 } });
    const out = flow.work(s, s.sprintPlan[0].id);
    expect(out.subPhase).toBe('day-summary');
    expect(out.sprintPlan[0].progress).toBe(0);
    expect(out.dayFocusRemaining).toBe(1);
    expect(out.dayLog.at(-1)).toMatch(/the day was over/);
  });

  it('the day ends when every ticket is done, even with hours left', () => {
    const s = midSprint({ dayFocusRemaining: 9, focus: 100, morale: 70, debt: 0, burnout: 0 });
    s.sprintPlan = [ticket({ title: 'Only', effort: 2 })];
    const out = flow.work(s, s.sprintPlan[0].id);
    expect(out.subPhase).toBe('day-summary');
    expect(out.dayFocusRemaining).toBe(7);
  });

  it('nextDay resets the per-day work counter', () => {
    withRandom([0.99]);
    const out = flow.nextDay(midSprint({ subPhase: 'day-summary', currentDay: 2, actionsToday: { work: 3 } }));
    expect(out.actionsToday).toEqual({});
  });
});

describe('nextDay', () => {
  it('ends the game at 100 debt and melts down at 100 burnout before anything else', () => {
    const dead = flow.nextDay(midSprint({ subPhase: 'day-summary', debt: 100, currentDay: 5 }));
    expect(dead.phase).toBe('gameover');
    expect(dead.gameOverReason).toBe('debt');
    expect(dead.hourHistory.at(-1).kind).toBe('eod');
    const melt = flow.nextDay(midSprint({ subPhase: 'day-summary', burnout: 100, currentDay: 5 }));
    expect(melt.phase).toBe('execution');
    expect(melt.currentEvent).toBe(MELTDOWN_EVENT);
    expect(melt.dialogNode).toBe('open');
  });

  it('goes to retro after day 5, and to victory only after ten sprints with debt under 15', () => {
    const retro = flow.nextDay(midSprint({ subPhase: 'day-summary', currentDay: 5, sprintsSurvived: 3 }));
    expect(retro.phase).toBe('retro');
    expect(retro.sprintsSurvived).toBe(4);
    const notYet = flow.nextDay(midSprint({ subPhase: 'day-summary', currentDay: 5, sprintsSurvived: 9, debt: 15 }));
    expect(notYet.phase).toBe('retro');
    const win = flow.nextDay(midSprint({ subPhase: 'day-summary', currentDay: 5, sprintsSurvived: 9, debt: 14 }));
    expect(win.phase).toBe('victory');
    expect(win.sprintsSurvived).toBe(10);
  });

  it('rolls over the night: sleep, team, chaos bookkeeping, fresh morning', () => {
    withRandom([0.99]); // nobody works, no chaos, deterministic events
    const s = midSprint({
      subPhase: 'day-summary', currentDay: 2, burnout: 40, stayedLate: false, badDayStreak: 0,
      atHome: true, actionsToday: { coffee: 3 }, dayLog: ['old'], pairBonus: true,
    });
    const out = flow.nextDay(s);
    expect(out.currentDay).toBe(3);
    expect(out.burnout).toBe(36);
    expect(out.badDayStreak).toBe(0);
    expect(out.dayFocus).toBe(8);
    expect(out.dayFocusRemaining).toBe(8);
    expect(out.atHome).toBe(false);
    expect(out.actionsToday).toEqual({});
    expect(['event', 'work']).toContain(out.subPhase);
    expect(out.scheduledEvents.length + (out.subPhase === 'event' ? 1 : 0)).toBeGreaterThan(0);
    expect(out.dayLog.some(l => /^old$/.test(l))).toBe(false);
    expect(out.focus).toBe(100 - Math.floor(36 * 0.4));
  });

  it('a late night counts as a bad day: poor sleep and a growing streak', () => {
    withRandom([0.99]);
    const out = flow.nextDay(midSprint({ subPhase: 'day-summary', currentDay: 2, burnout: 40, stayedLate: true, badDayStreak: 1 }));
    expect(out.burnout).toBe(39);
    expect(out.badDayStreak).toBe(2);
    expect(out.dayFocus).toBe(7);
    expect(out.stayedLate).toBe(false);
  });

  it('a night that pushes a bar to 100 still sends you to work; the reckoning comes that evening', () => {
    const lcg = (seed) => { let x = seed; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; };
    let sawDebt = false, sawBurnout = false;
    for (let seed = 0; seed < 3000 && !(sawDebt && sawBurnout); seed++) {
      vi.restoreAllMocks();
      vi.spyOn(Math, 'random').mockImplementation(lcg(seed));
      const debtNight = midSprint({ subPhase: 'day-summary', currentDay: 2, debt: 95 });
      debtNight.sprintPlan[0].progress = 3;
      const d = flow.nextDay(debtNight);
      expect(d.phase).toBe('execution');
      expect(['event', 'work']).toContain(d.subPhase);
      if (d.debt >= 100) {
        sawDebt = true;
        expect(d.currentEvent).not.toBe(MELTDOWN_EVENT);
        const evening = flow.nextDay({ ...d, subPhase: 'day-summary' });
        expect(evening.phase).toBe('gameover');
        expect(evening.gameOverReason).toBe('debt');
      }
      const burnNight = midSprint({ subPhase: 'day-summary', currentDay: 2, burnout: 99, stayedLate: true });
      const b = flow.nextDay(burnNight);
      expect(b.phase).toBe('execution');
      if (b.burnout >= 100) {
        sawBurnout = true;
        expect(b.currentEvent).not.toBe(MELTDOWN_EVENT);
        const evening = flow.nextDay({ ...b, subPhase: 'day-summary' });
        expect(evening.currentEvent).toBe(MELTDOWN_EVENT);
        expect(evening.subPhase).toBe('event');
      }
    }
    expect(sawDebt).toBe(true);
    expect(sawBurnout).toBe(true);
  });

  it('a teammate finishing a ticket overnight counts it as shipped and remembers the title', () => {
    withRandom([0.1, 0.5, 0.9, 0.9, 0.99]); // Jin works, no chaos
    const s = midSprint({ subPhase: 'day-summary', currentDay: 2 });
    s.sprintPlan[1] = { ...s.sprintPlan[1], progress: 3.5 };
    s.sprintPlan[0].progress = 9.5;
    s.sprintPlan[2].progress = 11.5;
    const out = flow.nextDay(s);
    expect(out.totalShipped).toBe(1);
    expect(out.sprintShipped[0].title).toBe('Bug B');
    expect(out.shippedTitles).toContain('Bug B');
  });
});

describe('nextSprint', () => {
  it('recovers over the weekend, clears boosts and trackers, and keeps shipped titles', () => {
    const s = midSprint({
      phase: 'retro', burnout: 50, badDayStreak: 3, stayedLate: true, pairBonus: true, pairPartner: 'Jin',
      boothBonus: true, lastChaosFlavor: 'x', recentEventIds: ['a'], recentDescIdx: { a: [1] },
      shippedTitles: ['Bug B'], debt: 40, sprint: 2,
    });
    const out = flow.nextSprint(s);
    expect(out.phase).toBe('planning');
    expect(out.sprint).toBe(3);
    expect(out.burnout).toBe(38);
    expect(out.badDayStreak).toBe(0);
    expect(out.pairBonus).toBe(false);
    expect(out.pairPartner).toBeNull();
    expect(out.boothBonus).toBe(false);
    expect(out.lastChaosFlavor).toBeNull();
    expect(out.recentEventIds).toEqual([]);
    expect(out.recentDescIdx).toEqual({});
    expect(out.shippedTitles).toEqual(['Bug B']);
    expect(out.debtAtSprintStart).toBe(40);
    expect(out.backlog).toHaveLength(10);
    expect(out.backlog.some(t => t.title === 'Bug B')).toBe(false);
  });
});

describe('a whole sprint, end to end', () => {
  it('runs five days without throwing, with unique ticket ids throughout', () => {
    for (let run = 0; run < 20; run++) {
      let s = planned();
      s.pendingCleanups = [{ title: 'Carry', effort: 5, debt: 0, type: 'bug', urgent: true }];
      s = flow.startSprint(s);
      let guard = 0;
      while (s.phase === 'execution' && guard++ < 500) {
        expect(new Set(s.sprintPlan.map(t => t.id)).size).toBe(s.sprintPlan.length);
        if (s.subPhase === 'event') {
          const node = s.currentEvent.nodes ? s.currentEvent.nodes[s.dialogNode] : s.currentEvent;
          const choices = node.choices.filter(c => !c.requires || c.requires(s));
          expect(choices.length).toBeGreaterThan(0);
          s = flow.chooseEvent(s, choices[Math.floor(Math.random() * choices.length)]);
        } else if (s.subPhase === 'work') {
          const open = s.sprintPlan.filter(t => !t.shipped && t.progress < t.effort);
          s = open.length && s.dayFocusRemaining > 0 ? flow.work(s, open[0].id) : flow.skipWork(s);
        } else if (s.subPhase === 'day-summary') {
          s = flow.nextDay(s);
        } else {
          throw new Error(`unexpected subPhase ${s.subPhase}`);
        }
      }
      expect(['retro', 'gameover', 'victory']).toContain(s.phase);
      expect(guard).toBeLessThan(500);
    }
  });
});

describe('restart', () => {
  it('starts from a clean menu state', () => {
    const s = flow.restart();
    expect(s.phase).toBe('menu');
    expect(s.sprint).toBe(1);
    expect(s.debt).toBe(25);
    expect(ticket().id).toBe('t1');
  });
});
