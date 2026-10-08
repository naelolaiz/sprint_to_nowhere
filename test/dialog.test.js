// SPDX-License-Identifier: GPL-3.0-only

import { describe, it, expect, afterEach, vi } from 'vitest';
import { sampleEventCast, renderCast, formatClock, isDescEligible, descText } from '../src/game/cast.js';
import { pickVariant, resolveEventText } from '../src/game/dialog.js';
import { EVENTS, MELTDOWN_EVENT } from '../src/data/events.js';
import { midSprint } from './helpers.js';

afterEach(() => vi.restoreAllMocks());

const REMOTE = (s) => !!s.atHome;
const OFFICE = (s) => !s.atHome;

describe('renderCast / formatClock', () => {
  it('substitutes placeholders and leaves unknown ones visible', () => {
    expect(renderCast('{a} and {b}', { a: 'Doug' })).toBe('Doug and {b}');
    expect(renderCast(42, {})).toBe(42);
  });
  it('maps focus-hours used onto the wall clock from 9 AM', () => {
    expect(formatClock({ _baseMin: 0 })).toBe('9:00 AM');
    expect(formatClock({ _baseMin: 3 * 60 + 14 })).toBe('12:14 PM');
    expect(formatClock({ _baseMin: 5 * 60 }, 11)).toBe('2:11 PM');
  });
});

describe('isDescEligible / descText', () => {
  it('treats strings and functions as always eligible and honors tags', () => {
    expect(isDescEligible('x', {})).toBe(true);
    expect(isDescEligible(() => 'x', {})).toBe(true);
    expect(isDescEligible({ text: 'x', requires: REMOTE }, { atHome: false })).toBe(false);
    expect(isDescEligible({ text: 'x', requires: REMOTE }, { atHome: true })).toBe(true);
    expect(descText({ text: 'x', requires: REMOTE })).toBe('x');
    expect(descText('y')).toBe('y');
  });
});

describe('sampleEventCast', () => {
  it('locks an opener index that is eligible for the current context', () => {
    const ev = EVENTS.find(e => e.id === 'standup_debug');
    for (const atHome of [true, false]) {
      for (let i = 0; i < 100; i++) {
        const cast = sampleEventCast(ev.id, [], { ...midSprint(), atHome });
        expect(isDescEligible(ev.descriptions[cast._descIdx], { atHome })).toBe(true);
      }
    }
  });
  it('avoids recently used openers when the pool allows it', () => {
    const ev = EVENTS.find(e => e.id === 'all_hands');
    const recent = [0, 1, 2];
    for (let i = 0; i < 100; i++) {
      const cast = sampleEventCast(ev.id, recent, midSprint());
      expect(recent).not.toContain(cast._descIdx);
    }
  });
  it('locks the wall clock at fire time', () => {
    const cast = sampleEventCast('quick_sync', [], { dayFocus: 9, dayFocusRemaining: 6.5 });
    expect(cast._baseMin).toBe(150);
  });
});

describe('pickVariant', () => {
  const pool = [
    'plain-0',
    { text: 'remote-1', requires: REMOTE },
    { text: 'office-2', requires: OFFICE },
    'plain-3',
  ];
  it('returns the locked index when it fits the context', () => {
    expect(descText(pickVariant(pool, 2, { atHome: false }))).toBe('office-2');
    expect(descText(pickVariant(pool, 1, { atHome: true }))).toBe('remote-1');
    expect(descText(pickVariant(pool, 3, { atHome: true }))).toBe('plain-3');
  });
  it('falls back to an eligible entry when the locked one no longer fits', () => {
    const out = descText(pickVariant(pool, 1, { atHome: false }));
    expect(['plain-0', 'office-2', 'plain-3']).toContain(out);
  });
  it('handles out-of-range and missing indices', () => {
    expect(pickVariant(pool, 999, { atHome: false })).toBeDefined();
    expect(pickVariant(pool, undefined, { atHome: false })).toBe('plain-0');
    expect(pickVariant([], 0, {})).toBeNull();
  });
});

describe('resolveEventText', () => {
  it('shows exactly the opener that was locked at fire time (tagged pool)', () => {
    const ev = EVENTS.find(e => e.id === 'standup_debug');
    const officeIdx = ev.descriptions.findIndex(d => typeof d === 'object' && d.requires === OFFICE || (typeof d === 'object' && d.requires && d.requires({ atHome: false }) && !d.requires({ atHome: true })));
    const s = midSprint({ atHome: false, currentEvent: ev, dialogNode: 'start', eventCast: { _descIdx: officeIdx } });
    const { description } = resolveEventText(ev, s);
    expect(description).toBe(descText(ev.descriptions[officeIdx]));
  });

  it('renders node descriptions, filters choices by context, and flags continuation nodes', () => {
    const ev = EVENTS.find(e => e.id === 'all_hands');
    const s = midSprint({ atHome: true, dialogNode: 'start', eventCast: { _descIdx: 4 } });
    const r = resolveEventText(ev, s);
    expect(r.isStartNode).toBe(true);
    expect(r.description).toBe(ev.descriptions[4]);
    expect(r.choices.map(c => c.label)).toContain('Camera off, mute, do real work');
    expect(r.choices.map(c => c.label)).not.toContain('Sit in the back, laptop open, do real work');

    const pivot = EVENTS.find(e => e.id === 'pivot');
    const r2 = resolveEventText(pivot, midSprint({ dialogNode: 'direction', eventCast: { _descIdx: 0 } }));
    expect(r2.isStartNode).toBe(false);
    expect(r2.description).toMatch(/^Marcus: "They're still figuring it out/);
  });

  it('uses last night\'s chaos as the standup opener, but only on the opening node', () => {
    const ev = EVENTS.find(e => e.id === 'daily_standup');
    const s = midSprint({ dialogNode: 'open', eventCast: { _descIdx: 0 }, lastChaosFlavor: 'The build is red.' });
    expect(resolveEventText(ev, s).description).toBe('The build is red.');
    const quick = EVENTS.find(e => e.id === 'quick_sync');
    expect(resolveEventText(quick, { ...s, dialogNode: 'start' }).description).not.toBe('The build is red.');
  });

  it('substitutes cast names inside function-form descriptions', () => {
    const ev = { id: 'x', descriptions: [(s, cast) => `${formatClock(cast)} and {dev}`], choices: [] };
    const s = midSprint({ dialogNode: 'start', eventCast: { _descIdx: 0, _baseMin: 60, dev: 'Priya' } });
    expect(resolveEventText(ev, s).description).toBe('10:00 AM and Priya');
  });

  it('renders the meltdown without a cast', () => {
    const r = resolveEventText(MELTDOWN_EVENT, midSprint({ dialogNode: 'open', eventCast: {} }));
    expect(r.description).toMatch(/Something is about to happen/);
    expect(r.choices).toHaveLength(5);
  });
});
