// SPDX-License-Identifier: GPL-3.0-only

// The mandate reaches the stories that already existed: the openers of the
// recurring ceremonies, the team's nights, the retro, the endings and the
// meltdown.

import { describe, it, expect, afterEach, vi } from 'vitest';
import { applyTeammateContributions } from '../src/game/team.js';
import { resolveEventText } from '../src/game/dialog.js';
import { descText } from '../src/game/cast.js';
import * as flow from '../src/game/flow.js';
import { EVENTS, MELTDOWN_EVENT } from '../src/data/events.js';
import { MELTDOWN_FLAVORS } from '../src/data/meltdownFlavors.js';
import { AI_RETRO_LINES, aiRetroLine, AI_GAME_OVER, AI_VICTORY_LINE } from '../src/data/aiFlavors.js';
import { midSprint } from './helpers.js';

afterEach(() => vi.restoreAllMocks());

const mandated = (over = {}) => midSprint({ aiMandate: true, tokenBudget: 100, tokens: 100, tokenUsage: 0, ...over });
const byId = (id) => EVENTS.find(e => e.id === id);

// Deterministic Math.random from a seed, for hunting a specific night.
const seeded = (seed) => {
  let x = seed;
  vi.spyOn(Math, 'random').mockImplementation(() => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  });
};

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

// Every opener of an event, rendered for a state with one untouched card.
const openers = (ev) => {
  const pool = ev.descriptions || ev.nodes[ev.start].descriptions;
  const s = mandated({ aiEfficiency: true, sprintPlan: [{ id: 't1', title: 'Reactions on comments', type: 'feature', effort: 8, progress: 0, shipped: false }] });
  return pool.map(d => { const t = descText(d); return typeof t === 'function' ? t(s, { _baseMin: 0 }) : t; });
};

describe('the theme in the ceremonies', () => {
  it('every recurring story has at least one opener about the assistant', () => {
    const ids = [
      'daily_standup', 'backlog_refinement', 'all_hands', 'production_fire', 'scope_change', 'ceo_idea',
      'one_on_one', 'standup_debug', 'sprint_review', 'retro_action_items', 'planning_poker', 'dod_v7',
      'agile_coach', 'velocity_audit', 'staging_booked', 'ci_queue', 'security_scanner',
    ];
    for (const id of ids) {
      const n = openers(byId(id)).filter(t => /assistant|\bAI\b|token|agent/i.test(t)).length;
      expect(n, id).toBeGreaterThanOrEqual(1);
    }
    expect(openers(byId('daily_standup')).filter(t => /assistant/.test(t)).length).toBeGreaterThanOrEqual(5);
    expect(openers(byId('all_hands')).filter(t => /assistant|token|\bAI\b/.test(t)).length).toBeGreaterThanOrEqual(8);
  });

  it('every 1:1 opener still sets up the career question the replies answer', () => {
    for (const text of openers(byId('one_on_one'))) {
      expect(/excit|energ|growth|meaningful/i.test(text), text.slice(0, 60)).toBe(true);
    }
    // the layoffs framing only shows up once the layoffs have happened
    const gated = byId('one_on_one').descriptions.find(d => typeof d === 'object' && d.requires);
    expect(gated).toBeTruthy();
    expect(gated.requires(mandated())).toBe(false);
    expect(gated.requires(mandated({ aiEfficiency: true }))).toBe(true);
  });
});

describe('the nights', () => {
  it('the assistant chips in half an hour and charges two debt for it, only under the mandate', () => {
    const hit = findNight(() => mandated(), /the assistant opened a PR/);
    expect(hit).not.toBeNull();
    expect(hit.r.debtDelta).toBeGreaterThanOrEqual(2);
    expect(hit.r.log.some(l => /\+0\.5h, \+2 debt/.test(l))).toBe(true);
    expect(hit.r.sprintPlan.some(t => t.assignedTo === 'the assistant' || t.assignedTo?.startsWith('you'))).toBe(true);
    expect(findNight(() => midSprint(), /the assistant/, 1500)).toBeNull();
  });

  it('the summary job drains most of the morning budget and counts the drain as usage', () => {
    const hit = findNight(() => mandated(), /summarize every PR/);
    expect(hit).not.toBeNull();
    expect(hit.r.drainTokens).toBe(0.7);
    expect(hit.r.chaosFlavor).toBeTruthy();
    vi.restoreAllMocks();
    seeded(hit.seed);
    const m = flow.nextDay({ ...hit.s, tokenUsage: 50 });
    expect(m.tokenBudget).toBe(100);
    expect(m.tokens).toBe(30);
    expect(m.tokenUsage).toBe(70);
    expect(findNight(() => midSprint(), /summarize every PR/, 1500)).toBeNull();
  });

  it('a quiet night leaves the morning budget whole', () => {
    const hit = findNight(() => mandated(), /^Overnight: Jin pushed/);
    expect(hit).not.toBeNull();
    expect(hit.r.drainTokens).toBe(0);
  });

  it('the coverage rewrite adds debt and a cleanup ticket on the card it touched', () => {
    const withWork = () => mandated({ sprintPlan: midSprint().sprintPlan.map(t => ({ ...t, progress: 2 })) });
    const hit = findNight(withWork, /improve test coverage/);
    expect(hit).not.toBeNull();
    expect(hit.r.debtDelta).toBeGreaterThanOrEqual(4);
    const cleanup = hit.r.pendingCleanups.find(c => /test something again/.test(c.title));
    expect(cleanup).toBeTruthy();
    expect(cleanup.effort).toBe(5);
    expect(hit.s.sprintPlan.some(t => cleanup.title.includes(t.title))).toBe(true);
    const noMandate = () => ({ ...withWork(), aiMandate: false });
    expect(findNight(noMandate, /improve test coverage/, 1500)).toBeNull();
  });

  it('the people transitioned for efficiency come back as contractors, with an onboarding ticket for you', () => {
    const hit = findNight(() => mandated({ aiEfficiency: true }), /back, as a contractor/);
    expect(hit).not.toBeNull();
    expect(hit.r.pendingCleanups.some(c => /Onboard the contractor/.test(c.title))).toBe(true);
    expect(hit.r.capitalDelta).toBeLessThanOrEqual(-0.5);
    expect(hit.r.chaosFlavor).toBeTruthy();
    expect(findNight(() => mandated(), /back, as a contractor/, 1500)).toBeNull();
  });
});

describe('the screens', () => {
  it('the retro line is picked by sprint and cycles', () => {
    expect(aiRetroLine({ sprint: 1 })).toBe(AI_RETRO_LINES[0]);
    expect(aiRetroLine({ sprint: 2 })).toBe(AI_RETRO_LINES[1]);
    expect(aiRetroLine({ sprint: AI_RETRO_LINES.length + 1 })).toBe(AI_RETRO_LINES[0]);
    expect(aiRetroLine(undefined)).toBe(AI_RETRO_LINES[0]);
    for (const l of AI_RETRO_LINES) expect(l.length).toBeGreaterThan(40);
  });

  it('both endings and the victory carry the budget with them', () => {
    expect(AI_GAME_OVER.burnout).toMatch(/Limit reached/);
    expect(AI_GAME_OVER.debt).toMatch(/budget/);
    expect(AI_VICTORY_LINE).toMatch(/tokens/);
  });
});

describe('the meltdown', () => {
  it('offers the assistant only once there is one, and its door leads to real endings', () => {
    const choice = MELTDOWN_EVENT.nodes.open.choices.find(c => c.next === 'assistant');
    expect(choice).toBeTruthy();
    expect(choice.requires(midSprint())).toBe(false);
    expect(choice.requires(mandated())).toBe(true);
    const plain = resolveEventText(MELTDOWN_EVENT, { ...midSprint(), dialogNode: 'open', eventCast: {} });
    const withAi = resolveEventText(MELTDOWN_EVENT, { ...mandated(), dialogNode: 'open', eventCast: {} });
    expect(withAi.choices.length).toBe(plain.choices.length + 1);
    const node = MELTDOWN_EVENT.nodes.assistant;
    expect(node.description).toMatch(/limit/i);
    expect(node.choices.filter(c => c.meltdownEnding).length).toBe(2);
    expect(node.choices.some(c => c.next === 'breathe')).toBe(true);
  });

  it('every ending anywhere in the meltdown has a flavor', () => {
    for (const [key, node] of Object.entries(MELTDOWN_EVENT.nodes)) {
      for (const c of node.choices) {
        if (c.meltdownEnding) {
          const f = MELTDOWN_FLAVORS[c.meltdownEnding];
          expect(f, `${key}: ${c.meltdownEnding}`).toBeTruthy();
          expect(f.title && f.sub && f.body, c.meltdownEnding).toBeTruthy();
        }
      }
    }
  });
});
