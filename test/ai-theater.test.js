// SPDX-License-Identifier: GPL-3.0-only

// The token meter and the mechanics around it: a budget that only ever
// shrinks, an assistant that stops when it is empty, the colleagues who
// paste your question into it first, and the nights it now has.

import { describe, it, expect, afterEach, vi } from 'vitest';
import { applyChoice, spendTokens, refillTokens } from '../src/game/mechanics.js';
import { applyAction } from '../src/game/actions.js';
import { applyTeammateContributions } from '../src/game/team.js';
import { pickEvent } from '../src/game/state.js';
import * as flow from '../src/game/flow.js';
import { EVENTS } from '../src/data/events.js';
import { midSprint, withRandom } from './helpers.js';

afterEach(() => vi.restoreAllMocks());

const mandated = (over = {}) => midSprint({ aiMandate: true, tokenBudget: 100, tokens: 100, tokenUsage: 0, ...over });
const byId = (id) => EVENTS.find(e => e.id === id);

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
    if (r.log.some(l => re.test(l))) return { s, r, seed };
  }
  return null;
};

describe('the mandate', () => {
  it('switches the meter on with a budget the team has mostly spent already', () => {
    const s = applyChoice(midSprint(), { effect: { aiMandate: true } });
    expect(s.aiMandate).toBe(true);
    expect(s.tokenBudget).toBe(100);
    expect(s.tokens).toBe(25);
    expect(s.dayLog.join(' ')).toMatch(/tokens a day/);
  });

  it('waits for sprint two and fires once', () => {
    const ev = byId('ai_mandate');
    expect(ev.once).toBe(true);
    expect(ev.requires({ ...midSprint(), sprint: 1 })).toBe(false);
    expect(ev.requires(midSprint())).toBe(true);
  });

  it('gates the events that only make sense once there is a budget', () => {
    for (const id of ['token_limit', 'ai_dashboard', 'ai_guardrails', 'ai_both_rules', 'ai_demo']) {
      expect(byId(id).requires(midSprint()), id).toBe(false);
      expect(byId(id).requires(mandated()), id).toBe(true);
    }
    expect(byId('ai_efficiency').requires(mandated())).toBe(false);
    expect(byId('ai_efficiency').requires(mandated({ sprint: 3 }))).toBe(true);
  });
});

describe('spending', () => {
  it('never goes below zero and counts what was actually spent', () => {
    const s = mandated({ tokens: 15 });
    expect(spendTokens(s, 20)).toBe(15);
    expect(s.tokens).toBe(0);
    expect(s.tokenUsage).toBe(15);
    expect(spendTokens(s, 5)).toBe(0);
    expect(s.tokenUsage).toBe(15);
  });

  it('a reply can empty the meter for the day', () => {
    const s = applyChoice(mandated(), { effect: { tokens: -1000 } });
    expect(s.tokens).toBe(0);
    expect(s.tokenUsage).toBe(100);
    expect(s.dayLog.join(' ')).toMatch(/No tokens left/);
  });

  it('an assistant-flavoured reply turns manual, at the manual price, once the budget is gone', () => {
    const eff = { useAssistant: { tokens: 20, focus: -0.5, log: 'asked the assistant', elseFocus: -1.5, elseLog: 'did it by hand' } };
    const withTokens = applyChoice(mandated({ dayFocusRemaining: 8 }), { effect: eff });
    expect(withTokens.dayFocusRemaining).toBe(7.5);
    expect(withTokens.tokens).toBe(80);
    expect(withTokens.dayLog.join(' ')).toMatch(/asked the assistant/);
    const empty = applyChoice(mandated({ dayFocusRemaining: 8, tokens: 5 }), { effect: eff });
    expect(empty.dayFocusRemaining).toBe(6.5);
    expect(empty.tokens).toBe(5);
    expect(empty.dayLog.join(' ')).toMatch(/by hand/);
  });
});

describe('the sitting', () => {
  it('spends tokens on the "how AI helped" field, and a quarter hour once they are gone', () => {
    const s = mandated({ dayFocus: 8, dayFocusRemaining: 8, scheduledEvents: [] });
    const id = s.sprintPlan[1].id; // the small bug, so the day does not run out
    withRandom([0.5]);
    const fed = flow.work(s, id);
    expect(fed.tokens).toBe(90);
    expect(fed.dayFocusRemaining).toBeGreaterThan(0.5);
    vi.restoreAllMocks();
    withRandom([0.5]);
    const dry = flow.work({ ...s, tokens: 0 }, id);
    expect(dry.dayFocusRemaining).toBeCloseTo(fed.dayFocusRemaining - 0.25, 5);
    expect(dry.dayLog.join(' ')).toMatch(/by hand/);
  });

  it('leaves the budget alone before the mandate', () => {
    withRandom([0.5]);
    const s = midSprint({ dayFocus: 8, dayFocusRemaining: 8, scheduledEvents: [] });
    const out = flow.work(s, s.sprintPlan[1].id);
    expect(out.tokens).toBe(0);
    expect(out.dayLog.join(' ')).not.toMatch(/tokens/);
  });
});

describe('asking a colleague', () => {
  it('spends their tokens too, and costs an extra half hour when there are none', () => {
    withRandom([0.5]);
    const a = applyAction(mandated({ dayFocusRemaining: 8 }), 'ask');
    expect(a.tokens).toBe(80);
    expect(a.dayFocusRemaining).toBe(7);
    vi.restoreAllMocks();
    withRandom([0.5]);
    const b = applyAction(mandated({ dayFocusRemaining: 8, tokens: 0 }), 'ask');
    expect(b.dayFocusRemaining).toBe(6.5);
    expect(b.dayLog.join(' ')).toMatch(/from memory/);
  });
});

describe('the morning refill', () => {
  it('cuts the budget after a high-usage day and after a low-usage day alike', () => {
    expect(refillTokens(mandated({ tokenUsage: 90 })).tokenBudget).toBe(90);
    expect(refillTokens(mandated({ tokenUsage: 10 })).tokenBudget).toBe(90);
    expect(refillTokens(mandated({ tokenUsage: 50 })).tokenBudget).toBe(100);
    expect(refillTokens(mandated({ tokenBudget: 20, tokenUsage: 20 })).tokenBudget).toBe(20);
  });

  it('starts the morning half empty once finance moved the reset', () => {
    const r = refillTokens(mandated({ tokenUsage: 50, tokenReset: 'fiscal' }));
    expect(r.tokenBudget).toBe(100);
    expect(r.tokens).toBe(50);
  });

  it('does nothing before the mandate', () => {
    const r = refillTokens(midSprint());
    expect(r).toEqual({ tokenBudget: 0, tokens: 0, tokenUsage: 0, log: [] });
  });

  it('lands in the state the next morning', () => {
    withRandom([0.99]);
    const m = flow.nextDay(mandated({ tokens: 3, tokenUsage: 97 }));
    expect(m.tokenBudget).toBe(90);
    expect(m.tokens).toBe(90);
    expect(m.tokenUsage).toBe(0);
    expect(m.dayLog.join(' ')).toMatch(/waste/);
  });
});

describe('efficiency', () => {
  it('right-sizes the budget, adds two legacy tickets and makes the limit likelier', () => {
    withRandom([0.5]);
    const s = applyChoice(mandated({ tokens: 90 }), { effect: { addLegacy: 2, cutTokenBudget: 0.6 } });
    expect(s.tokenBudget).toBe(60);
    expect(s.tokens).toBe(60);
    expect(s.aiEfficiency).toBe(true);
    expect(s.sprintPlan.filter(t => t.legacy).length).toBe(2);
    expect(s.dayLog.filter(l => /Legacy project assigned/.test(l)).length).toBe(2);
  });

  it('weighs the limit event up once efficiency has happened', () => {
    const count = (st) => {
      let n = 0;
      for (let i = 0; i < 400; i++) {
        withRandom([i / 400]);
        if (pickEvent(st).id === 'token_limit') n++;
        vi.restoreAllMocks();
      }
      return n;
    };
    expect(count(midSprint())).toBe(0);
    const base = count(mandated());
    expect(base).toBeGreaterThan(0);
    expect(count(mandated({ aiEfficiency: true }))).toBeGreaterThan(base);
  });
});

describe('the nights', () => {
  it('the agent\'s night shift adds debt and queues a cleanup, only under the mandate', () => {
    const hit = findNight(() => mandated(), /autonomous mode/);
    expect(hit).not.toBeNull();
    expect(hit.r.debtDelta).toBeGreaterThanOrEqual(5);
    expect(hit.r.pendingCleanups.some(c => /night shift/.test(c.title))).toBe(true);
    expect(findNight(() => midSprint(), /autonomous mode/, 1500)).toBeNull();
  });

  it('the moved reset makes mornings half empty and the first ask slower', () => {
    const hit = findNight(() => mandated(), /fiscal day/);
    expect(hit).not.toBeNull();
    expect(hit.r.tokenReset).toBe('fiscal');
    expect(hit.r.askTax).toBe(0.5);
    vi.restoreAllMocks();
    seeded(hit.seed);
    const m = flow.nextDay({ ...hit.s, tokenUsage: 50 });
    expect(m.tokenReset).toBe('fiscal');
    expect(m.tokens).toBe(50);
    expect(m.askTaxToday).toBe(0.5);
    // and it stays moved
    expect(findNight(() => mandated({ tokenReset: 'fiscal' }), /fiscal day/, 1500)).toBeNull();
  });
});

describe('the news', () => {
  it('every bubble headline ends with Marcus asking for a response, and the sync follows the same day', () => {
    const ev = byId('ai_news_bubble');
    for (const d of ev.descriptions) expect(/respon/i.test(d), d.slice(0, 60)).toBe(true);
    const staged = flow.stageEvent(midSprint({ eventQueue: [] }), ev);
    const out = flow.chooseEvent(staged, ev.choices[2]);
    expect(out.currentEvent.id).toBe('ai_response_sync');
  });

  it('every rehire headline carries both halves of the story', () => {
    for (const d of byId('ai_news_rehire').descriptions) {
      expect(/replac|cut|laid off|lay|replaced/i.test(d) && /rehir|contract|seeks|hiring/i.test(d), d.slice(0, 60)).toBe(true);
    }
  });
});
