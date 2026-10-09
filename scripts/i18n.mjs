// SPDX-License-Identifier: GPL-3.0-only

// Finds every English string the game can show, so a translation can be
// checked against it. Two sources:
//   - the data modules (events, tickets, endings), walked as data;
//   - tr`...`, msg`...` and tr('...') in the source, found by parsing it.
//
//   node scripts/i18n.mjs check es     missing and stale entries for a locale
//   node scripts/i18n.mjs missing es   the missing ones as JSON, ready to fill

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as espree from 'espree';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');

// Fields in the event data that hold ids and flags, not text.
const NOT_TEXT = new Set(['id', 'start', 'next', 'promise', 'queueEvent', 'queueToday', 'type', 'meltdownEnding', 'when']);

// Which dictionary file a string belongs in, by where it comes from.
export const bucketOf = (origin) => {
  if (origin.startsWith('src/data/events.js')) return 'events';
  if (origin.startsWith('src/data/tickets.js')) return 'tickets';
  if (origin.startsWith('src/data/meltdownFlavors.js') || origin.startsWith('src/data/aiFlavors.js')) return 'endings';
  if (origin.startsWith('src/game/team.js')) return 'nights';
  if (origin.startsWith('src/game/')) return 'game';
  if (origin.startsWith('src/components/scene/')) return 'scenes';
  return 'ui';
};

// Data strings count when they have a letter in them; anything passed to
// tr in the source counts, even "{0}" (it may need different quotes).
const add = (keys, text, origin, any = false) => {
  if (typeof text !== 'string' || !text || (!any && !/[A-Za-z]/.test(text))) return;
  if (!keys.has(text)) keys.set(text, origin);
};

const walk = (keys, value, origin, field = null) => {
  if (typeof value === 'string') {
    if (!NOT_TEXT.has(field)) add(keys, value, origin);
  } else if (Array.isArray(value)) {
    for (const v of value) walk(keys, v, origin, field);
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) walk(keys, v, origin, /^\d+$/.test(k) ? field : k);
  }
};

const load = (rel) => import(pathToFileURL(path.join(ROOT, rel)).href);

const collectData = async (keys) => {
  const events = await load('src/data/events.js');
  walk(keys, [...events.EVENTS, events.MELTDOWN_EVENT], 'src/data/events.js');
  const tickets = await load('src/data/tickets.js');
  // PROMISES is not shown anywhere; it is left out on purpose.
  for (const pool of ['FEATURES', 'BUGS', 'REFACTORS', 'LEGACY_TICKETS', 'STRATEGIC_INITIATIVES', 'URGENT_FEATURES']) {
    for (const t of tickets[pool]) add(keys, t.title, 'src/data/tickets.js');
  }
  const melt = await load('src/data/meltdownFlavors.js');
  walk(keys, melt.MELTDOWN_FLAVORS, 'src/data/meltdownFlavors.js');
  const ai = await load('src/data/aiFlavors.js');
  walk(keys, [ai.AI_RETRO_LINES, ai.AI_GAME_OVER, ai.AI_VICTORY_LINE], 'src/data/aiFlavors.js');
};

const sourceFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => {
  const p = path.join(dir, d.name);
  if (d.isDirectory()) return d.name === 'i18n' ? [] : sourceFiles(p);
  return /\.(js|jsx)$/.test(d.name) ? [p] : [];
}).sort();

// The key a tagged template produces at run time: the cooked text with each
// ${...} replaced by {0}, {1}, ... (see templateKey in src/i18n/index.js).
const templateKeyOf = (quasi) => quasi.quasis.map(q => q.value.cooked)
  .reduce((acc, part, i) => (i === 0 ? part : `${acc}{${i - 1}}${part}`), '');

const scan = (node, visit) => {
  if (!node || typeof node.type !== 'string') return;
  visit(node);
  for (const [k, v] of Object.entries(node)) {
    if (k === 'range' || k === 'loc') continue;
    if (Array.isArray(v)) v.forEach(c => scan(c, visit));
    else if (v && typeof v.type === 'string') scan(v, visit);
  }
};

export const collectSourceKeys = (keys, file) => {
  const origin = path.relative(ROOT, file).split(path.sep).join('/');
  const code = fs.readFileSync(file, 'utf8');
  const ast = espree.parse(code, { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } });
  scan(ast, (n) => {
    if (n.type === 'TaggedTemplateExpression' && n.tag.type === 'Identifier' && (n.tag.name === 'tr' || n.tag.name === 'msg')) {
      add(keys, templateKeyOf(n.quasi), origin, true);
    } else if (n.type === 'CallExpression' && n.callee.type === 'Identifier' && n.callee.name === 'tr'
      && n.arguments[0]?.type === 'Literal' && typeof n.arguments[0].value === 'string') {
      add(keys, n.arguments[0].value, origin, true);
    }
  });
};

// Every translatable string, in the order it appears, mapped to where it
// first appears.
export const collectKeys = async () => {
  const keys = new Map();
  await collectData(keys);
  for (const f of sourceFiles(SRC)) collectSourceKeys(keys, f);
  return keys;
};

export const LOCALE_DIR = (code) => path.join(SRC, 'i18n', code);

// A locale's dictionary, file by file: { bucket: { english: translation } }.
export const readLocale = (code) => {
  const dir = LOCALE_DIR(code);
  const out = {};
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
    out[f.replace(/\.json$/, '')] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  }
  return out;
};

export const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();

export const checkLocale = async (code) => {
  const keys = await collectKeys();
  const files = readLocale(code);
  const seen = new Map();
  const duplicated = [];
  for (const [file, table] of Object.entries(files)) {
    for (const k of Object.keys(table)) {
      if (seen.has(k)) duplicated.push(k);
      seen.set(k, { file, value: table[k] });
    }
  }
  const missing = [...keys.keys()].filter(k => !seen.has(k) || !seen.get(k).value);
  const stale = [...seen.keys()].filter(k => !keys.has(k));
  const badPlaceholders = [...seen.entries()]
    .filter(([k, { value }]) => value && placeholders(k).join() !== placeholders(value).join())
    .map(([k]) => k);
  return { keys, files, missing, stale, duplicated, badPlaceholders };
};

const main = async () => {
  const [cmd, code = 'es'] = process.argv.slice(2);
  if (cmd === 'missing') {
    const { keys, missing } = await checkLocale(code);
    const out = {};
    for (const k of missing) (out[bucketOf(keys.get(k))] ||= {})[k] = '';
    process.stdout.write(JSON.stringify(out, null, 2) + '\n');
    return;
  }
  if (cmd === 'check') {
    const r = await checkLocale(code);
    const show = (label, list) => {
      console.log(`${label}: ${list.length}`);
      for (const k of list.slice(0, 20)) console.log(`  ${JSON.stringify(k).slice(0, 120)}`);
    };
    console.log(`${r.keys.size} strings in the game`);
    show('missing', r.missing);
    show('stale (no longer in the game)', r.stale);
    show('in more than one file', r.duplicated);
    show('placeholders differ', r.badPlaceholders);
    process.exitCode = r.missing.length + r.stale.length + r.duplicated.length + r.badPlaceholders.length > 0 ? 1 : 0;
    return;
  }
  console.log('usage: node scripts/i18n.mjs check|missing <locale>');
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
