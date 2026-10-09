// SPDX-License-Identifier: GPL-3.0-only

import { describe, it, expect, afterEach } from 'vitest';
import { tr, msg, templateKey, installDictionary, getLocale } from '../src/i18n/index.js';
import { checkLocale } from '../scripts/i18n.mjs';
import es from '../src/i18n/es/index.js';
import { EVENTS } from '../src/data/events.js';
import { initialState } from '../src/game/state.js';
import * as flow from '../src/game/flow.js';
import { resolveEventText } from '../src/game/dialog.js';
import { renderCast, descText } from '../src/game/cast.js';
import { minutesToClock } from '../src/game/clock.js';

afterEach(() => installDictionary('en', null));

describe('tr', () => {
  it('returns English untouched when no dictionary is installed', () => {
    expect(getLocale()).toBe('en');
    const n = 3;
    expect(tr`Worked ${n}h on "${'Thing'}"`).toBe('Worked 3h on "Thing"');
    expect(tr('Hop on the call')).toBe('Hop on the call');
  });

  it('keys a template by its text with numbered placeholders', () => {
    const key = (s, ...v) => templateKey(s, ...v);
    expect(key`Worked ${1}h on "${2}"`).toBe('Worked {0}h on "{1}"');
    expect(key`plain`).toBe('plain');
  });

  it('lets a translation reorder placeholders and translates string values', () => {
    installDictionary('xx', {
      '{0} grew by {1} hours.': 'Creció {1} horas: {0}.',
      'Feature A': 'Funcionalidad A',
    });
    const title = 'Feature A';
    const h = 6;
    expect(tr`${title} grew by ${h} hours.`).toBe('Creció 6 horas: Funcionalidad A.');
  });

  it('falls back to English for anything it does not know, and passes non-strings through', () => {
    installDictionary('xx', {});
    expect(tr('Not translated')).toBe('Not translated');
    const fn = () => 'x';
    expect(tr(fn)).toBe(fn);
    expect(tr(null)).toBe(null);
  });

  it('msg marks without translating', () => {
    installDictionary('xx', { 'A constant': 'Una constante' });
    expect(msg`A constant`).toBe('A constant');
    expect(tr(msg`A constant`)).toBe('Una constante');
  });
});

describe('Spanish translation', () => {
  it('covers every string in the game, with nothing stale, duplicated or misplaced', async () => {
    const r = await checkLocale('es');
    expect(r.missing, 'missing').toEqual([]);
    expect(r.stale, 'stale').toEqual([]);
    expect(r.duplicated, 'duplicated').toEqual([]);
    expect(r.badPlaceholders, 'placeholders differ').toEqual([]);
  });

  it('uses Spanish quotes, never straight double quotes', () => {
    const bad = Object.values(es).filter(v => v.includes('"'));
    expect(bad).toEqual([]);
  });

  it('keeps every standup follow-up opener an ask', () => {
    const ev = EVENTS.find(e => e.id === 'daily_standup');
    for (const d of ev.nodes.your_update.descriptions) {
      const text = es[descText(d)];
      expect(/\?/.test(text), `your_update opener without an ask: ${text.slice(0, 70)}`).toBe(true);
    }
  });

  it('reads the clock in 24 hours', () => {
    installDictionary('es', es);
    expect(minutesToClock(14 * 60 + 5)).toBe('14:05');
    expect(minutesToClock(9 * 60)).toBe('9:00');
    installDictionary('en', null);
    expect(minutesToClock(14 * 60 + 5)).toBe('2:05 PM');
  });

  // Play whole careers in Spanish and look at everything the screen would
  // show: no leftover {0}, no undefined, no unfilled cast name.
  it('plays through in Spanish without leaking placeholders', () => {
    installDictionary('es', es);
    const leaks = [];
    const look = (text, where) => {
      if (typeof text !== 'string') return;
      // One event quotes a real JavaScript error on purpose.
      if (/\{\w+\}|(?<!properties of )undefined|NaN|\[object Object\]/.test(text)) leaks.push(`${where}: ${text.slice(0, 120)}`);
    };
    for (let run = 0; run < 12; run++) {
      let s = flow.startGame(initialState());
      for (let step = 0; step < 600 && !['gameover', 'victory'].includes(s.phase); step++) {
        if (s.phase === 'planning') {
          for (const t of s.backlog.slice(0, 4)) s = flow.toggleTicket(s, t.id);
          s = flow.startSprint(s);
        } else if (s.phase === 'retro') {
          s = flow.nextSprint(s);
        } else if (s.subPhase === 'event') {
          const r = resolveEventText(s.currentEvent, s);
          look(renderCast(tr(s.currentEvent.title), s.eventCast), s.currentEvent.id);
          look(r.description, s.currentEvent.id);
          for (const c of r.choices) look(renderCast(tr(c.label), s.eventCast), s.currentEvent.id);
          if (r.choices.length === 0) break;
          s = flow.chooseEvent(s, r.choices[Math.floor(Math.random() * r.choices.length)]);
        } else if (s.subPhase === 'work') {
          const open = s.sprintPlan.filter(t => !t.shipped && t.progress < t.effort);
          const roll = Math.random();
          if (open.length > 0 && roll < 0.6) s = flow.work(s, open[0].id);
          else if (roll < 0.8) s = flow.action(s, ['coffee', 'walk', 'lunch', 'ask', 'pair', 'vent', 'dnd', 'block'][Math.floor(Math.random() * 8)]);
          else s = flow.skipWork(s);
        } else {
          for (const l of s.dayLog) look(l, `day ${s.currentDay}`);
          s = flow.nextDay(s);
        }
      }
    }
    expect(leaks).toEqual([]);
  });
});
