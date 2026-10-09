// SPDX-License-Identifier: GPL-3.0-only

// Structural checks over the dialog data. Anything that fails here would show
// up in play as a dead button, a missing opener, a literal "{dev}" on screen,
// or a choice whose effect silently does nothing.

import { describe, it, expect } from 'vitest';
import { EVENTS, MELTDOWN_EVENT } from '../src/data/events.js';
import { EVENT_CAST_RULES } from '../src/data/cast.js';
import { initialState } from '../src/game/state.js';

const KNOWN_EFFECTS = new Set([
  'focus', 'focusPct', 'debt', 'capital', 'burnout', 'morale',
  'bumpRefactor', 'scopeCreep', 'addUrgentFeature', 'cancelInitiative',
  'pivotTicket', 'wasteProgress', 'addLegacy', 'promise', 'clearPromise',
  'goHome', 'returnOffice',
  'chance', 'dailyTax', 'inflateAll', 'splitTicket', 'foldEstimate', 'velocityCommit',
  'addUrgentBug', 'loseProgress', 'queueEvent', 'askTax', 'addCleanup',
  'queueToday', 'boothClosed',
  'tokens', 'useAssistant', 'aiMandate', 'cutTokenBudget',
]);
const KNOWN_CHOICE_KEYS = new Set(['label', 'effect', 'log', 'next', 'requires', 'logByDesc', 'meltdownEnding']);

const base = initialState();
const CONTEXTS = {
  office: { ...base, phase: 'execution', sprint: 3, currentDay: 2, atHome: false, sprintPlan: [] },
  home:   { ...base, phase: 'execution', sprint: 3, currentDay: 2, atHome: true,  sprintPlan: [] },
};

const ALL = [...EVENTS, MELTDOWN_EVENT];

const placeholders = (text) => {
  const out = new Set();
  if (typeof text === 'string') for (const m of text.matchAll(/\{(\w+)\}/g)) out.add(m[1]);
  return out;
};

const textOf = (d) => (d && typeof d === 'object' && 'text' in d ? d.text : d);

const nodesOf = (ev) => (ev.nodes
  ? Object.entries(ev.nodes).map(([key, node]) => ({ key, node }))
  : [{ key: 'flat', node: { description: ev.description, descriptions: ev.descriptions, choices: ev.choices } }]);

describe('event data', () => {
  it('has unique ids', () => {
    const ids = ALL.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every cast rule points at a real event', () => {
    const ids = new Set(ALL.map(e => e.id));
    for (const id of Object.keys(EVENT_CAST_RULES)) expect(ids.has(id), `cast rule for ${id}`).toBe(true);
  });

  it.each(ALL.map(e => [e.id, e]))('%s is well-formed', (id, ev) => {
    expect(typeof ev.title).toBe('string');
    if (ev.nodes) {
      const startKey = ev.start || 'start';
      expect(ev.nodes[startKey], `${id}: start node`).toBeTruthy();
      // every node reachable from start
      const seen = new Set([startKey]);
      const stack = [startKey];
      while (stack.length) {
        const k = stack.pop();
        for (const c of ev.nodes[k].choices || []) {
          if (c.next && !seen.has(c.next)) { seen.add(c.next); stack.push(c.next); }
        }
      }
      for (const k of Object.keys(ev.nodes)) expect(seen.has(k), `${id}/${k}: unreachable node`).toBe(true);
    }
    const used = placeholders(ev.title);
    for (const { key, node } of nodesOf(ev)) {
      // some opener text exists, in every context
      const hasText = !!node.description || (Array.isArray(node.descriptions) && node.descriptions.length > 0)
        || (Array.isArray(ev.descriptions) && ev.descriptions.length > 0);
      expect(hasText, `${id}/${key}: no description`).toBe(true);
      const pool = Array.isArray(node.descriptions) ? node.descriptions : [];
      for (const [name, st] of Object.entries(CONTEXTS)) {
        if (pool.length > 0) {
          const eligible = pool.filter(d => !(d && typeof d === 'object' && d.requires) || d.requires(st));
          expect(eligible.length, `${id}/${key}: no eligible opener in ${name}`).toBeGreaterThan(0);
        }
      }
      for (const d of pool) {
        const t = textOf(d);
        const rendered = typeof t === 'function' ? t(CONTEXTS.office, { _baseMin: 0 }) : t;
        expect(typeof rendered, `${id}/${key}: description type`).toBe('string');
        for (const p of placeholders(rendered)) used.add(p);
      }
      for (const p of placeholders(node.description)) used.add(p);

      // choices
      expect(Array.isArray(node.choices) && node.choices.length > 0, `${id}/${key}: no choices`).toBe(true);
      for (const [name, st] of Object.entries(CONTEXTS)) {
        const left = node.choices.filter(c => !c.requires || c.requires(st));
        expect(left.length, `${id}/${key}: no choice available in ${name}`).toBeGreaterThan(0);
      }
      for (const c of node.choices) {
        expect(typeof c.label, `${id}/${key}: choice label`).toBe('string');
        for (const k of Object.keys(c)) expect(KNOWN_CHOICE_KEYS.has(k), `${id}/${key}: unknown choice key "${k}"`).toBe(true);
        for (const k of Object.keys(c.effect || {})) expect(KNOWN_EFFECTS.has(k), `${id}/${key}: unknown effect "${k}"`).toBe(true);
        if (c.effect?.chance) {
          const ch = c.effect.chance;
          expect(ch.p > 0 && ch.p < 1, `${id}/${key}: chance.p must be strictly between 0 and 1`).toBe(true);
          expect(Object.keys(ch.effect || {}).length, `${id}/${key}: chance without an effect`).toBeGreaterThan(0);
          for (const k of Object.keys(ch.effect)) expect(KNOWN_EFFECTS.has(k) && k !== 'chance', `${id}/${key}: unknown nested effect "${k}"`).toBe(true);
          for (const p of placeholders(ch.log)) used.add(p);
          for (const p of placeholders(ch.elseLog)) used.add(p);
        }
        if (c.effect?.dailyTax) {
          const t = c.effect.dailyTax;
          expect(t.hours > 0 && t.days > 0 && typeof t.label === 'string', `${id}/${key}: malformed dailyTax`).toBe(true);
        }
        const nested = { ...(c.effect || {}), ...(c.effect?.chance?.effect || {}) };
        if (nested.queueEvent) expect(ALL.some(e => e.id === nested.queueEvent), `${id}/${key}: queueEvent -> ${nested.queueEvent}`).toBe(true);
        if (nested.queueToday) expect(ALL.some(e => e.id === nested.queueToday), `${id}/${key}: queueToday -> ${nested.queueToday}`).toBe(true);
        if (nested.addCleanup) expect(typeof nested.addCleanup.title === 'string' && nested.addCleanup.effort > 0, `${id}/${key}: malformed addCleanup`).toBe(true);
        if (c.next) expect(ev.nodes?.[c.next], `${id}/${key}: next -> ${c.next}`).toBeTruthy();
        expect(!!(c.next || c.effect || c.meltdownEnding), `${id}/${key}: "${c.label}" does nothing`).toBe(true);
        if (c.logByDesc) {
          const openerPool = pool.length > 0 ? pool : (ev.descriptions || []);
          for (const k of Object.keys(c.logByDesc)) {
            expect(Number(k) < openerPool.length, `${id}/${key}: logByDesc[${k}] out of range`).toBe(true);
          }
          for (const v of Object.values(c.logByDesc)) for (const p of placeholders(v)) used.add(p);
        }
        for (const p of placeholders(c.label)) used.add(p);
        for (const p of placeholders(c.log)) used.add(p);
      }
    }
    const rules = EVENT_CAST_RULES[id] || {};
    for (const p of used) expect(rules[p], `${id}: placeholder {${p}} has no cast rule`).toBeTruthy();
    if (ev.requires) for (const st of Object.values(CONTEXTS)) expect(() => ev.requires(st)).not.toThrow();
  });

  it('has no unresolved template artifacts in any text', () => {
    // A placeholder is exactly {word}; anything else inside braces ("{your
    // name}") would render literally on screen.
    const check = (text, where) => {
      if (typeof text !== 'string') return;
      for (const m of text.matchAll(/\{[^}]*\}/g)) {
        expect(/^\{\w+\}$/.test(m[0]), `${where}: template artifact ${m[0]}`).toBe(true);
      }
    };
    const render = (d) => (typeof d === 'function' ? d(CONTEXTS.office, { _baseMin: 0 }) : d);
    for (const ev of ALL) {
      check(ev.title, ev.id);
      for (const { key, node } of nodesOf(ev)) {
        const where = `${ev.id}/${key}`;
        const pool = Array.isArray(node.descriptions) ? node.descriptions
          : (Array.isArray(ev.descriptions) ? ev.descriptions : []);
        for (const d of pool) check(render(textOf(d)), where);
        check(render(node.description), where);
        for (const c of node.choices || []) {
          check(c.label, where);
          check(c.log, where);
          for (const v of Object.values(c.logByDesc || {})) check(v, where);
        }
      }
    }
  });

  // Regression: every opener of the standup "your update" node must ask you
  // for something, because all of its replies answer a request. Two openers
  // used to be pure commentary, which left the replies answering nothing.
  it('standup follow-up openers each contain an ask', () => {
    const ev = EVENTS.find(e => e.id === 'daily_standup');
    for (const d of ev.nodes.your_update.descriptions) {
      const text = textOf(d);
      expect(/\?/.test(text), `your_update opener without an ask: ${text.slice(0, 70)}`).toBe(true);
    }
  });

  // The sprint review's replies are all ways of demoing, so every opener has
  // to end with you being asked to demo.
  it('every sprint review opener asks you to demo', () => {
    const ev = EVENTS.find(e => e.id === 'sprint_review');
    for (const d of ev.nodes.open.descriptions) {
      const t = textOf(d);
      const text = typeof t === 'function' ? t({ ...CONTEXTS.office, sprint: 3 }, { _baseMin: 0 }) : t;
      expect(/demo|show/i.test(text), `sprint_review opener without a demo ask: ${text.slice(0, 70)}`).toBe(true);
    }
  });

  // The planning poker replies argue about one card's estimate, so every
  // opener must name that card and the number it is being talked down to.
  it('every planning poker opener names the card on the table and the low-ball', () => {
    const ev = EVENTS.find(e => e.id === 'planning_poker');
    const plan = [{ id: 't1', title: 'Reactions on comments', type: 'feature', effort: 8, progress: 0, shipped: false }];
    const st = { ...CONTEXTS.office, sprintPlan: plan };
    expect(ev.requires(st)).toBe(true);
    expect(ev.requires(CONTEXTS.office)).toBe(false);
    for (const d of ev.nodes.open.descriptions) {
      const text = textOf(d)(st, { _baseMin: 0 });
      expect(text.includes('"Reactions on comments"'), `poker opener without the card: ${text.slice(0, 70)}`).toBe(true);
      expect(/\b3\b/.test(text), `poker opener without the 3: ${text.slice(0, 70)}`).toBe(true);
    }
  });

  // The staging replies rebuild data, test in prod, or wait for "the demo",
  // so every opener has to set up both the lost data and the demo.
  it('every staging opener mentions the demo and the lost data', () => {
    const ev = EVENTS.find(e => e.id === 'staging_booked');
    for (const d of ev.nodes.open.descriptions) {
      const t = textOf(d);
      const text = typeof t === 'function' ? t(CONTEXTS.office, { _baseMin: 0 }) : t;
      expect(/demo/i.test(text), `staging opener without the demo: ${text.slice(0, 70)}`).toBe(true);
      expect(/test data|fixtures|re-seed|wiped/i.test(text), `staging opener without the lost data: ${text.slice(0, 70)}`).toBe(true);
    }
  });

  // Both postmortem branches are about the runbook that does not exist, and
  // both office-day replies are about having no booth, so every opener has
  // to set those up.
  it('postmortem and office-day openers set up what their replies answer', () => {
    const render = (d) => { const t = textOf(d); return typeof t === 'function' ? t(CONTEXTS.office, { _baseMin: 0 }) : t; };
    for (const d of EVENTS.find(e => e.id === 'blameless_postmortem').nodes.open.descriptions) {
      const text = render(d);
      expect(/blameless/i.test(text) && /runbook/i.test(text), `postmortem opener: ${text.slice(0, 70)}`).toBe(true);
    }
    for (const d of EVENTS.find(e => e.id === 'return_to_office').descriptions) {
      const text = render(d);
      expect(/booth/i.test(text) && /call/i.test(text), `office-day opener: ${text.slice(0, 70)}`).toBe(true);
    }
  });

  it('home-only events are tagged and in-office events are not also home-only', () => {
    for (const ev of EVENTS) {
      if (ev.id.startsWith('home_')) expect(ev.atHome, `${ev.id} should be atHome`).toBe(true);
      expect(ev.atHome && ev.inOffice, `${ev.id} cannot be both`).toBeFalsy();
    }
  });
  // The five events that carry most days each have a big opener pool, and
  // their replies are written once for the whole pool. So no opener may
  // repeat, Marcus must be in every "tiny tweak" pitch (the replies talk
  // back to him), and every refinement opener has to put the player in the
  // meeting Marcus is running, because "engage" has him moving to the next
  // ticket.
  it('the busiest events keep their opener pools distinct and on topic', () => {
    const render = (d) => { const t = textOf(d); return typeof t === 'function' ? t(CONTEXTS.office, { _baseMin: 0 }) : t; };
    const pools = {
      production_fire: 20, scope_change: 20, all_hands: 40, backlog_refinement: 30, daily_standup: 40,
    };
    for (const [id, min] of Object.entries(pools)) {
      const ev = EVENTS.find(e => e.id === id);
      const pool = (ev.descriptions || ev.nodes[ev.start].descriptions).map(render);
      expect(pool.length, id).toBeGreaterThanOrEqual(min);
      expect(new Set(pool).size, `${id}: duplicate opener`).toBe(pool.length);
      for (const text of pool) {
        if (id === 'scope_change') expect(/Marcus/.test(text), `pitch without Marcus: ${text.slice(0, 70)}`).toBe(true);
        if (id === 'backlog_refinement') expect(/Marcus|Refinement/.test(text), `refinement opener off topic: ${text.slice(0, 70)}`).toBe(true);
        if (id === 'daily_standup') expect(/Marcus|standup|huddle|update/i.test(text), `standup opener off topic: ${text.slice(0, 70)}`).toBe(true);
      }
    }
  });
});
