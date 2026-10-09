// SPDX-License-Identifier: GPL-3.0-only

// Translations. English is the source language: every string in the code and
// the data files is written in English and doubles as its own lookup key, so
// a string with no translation simply shows up in English.
//
// Three ways in:
//   tr`Worked ${h}h on "${title}"`   tagged template, translated where it runs.
//                                    The key is the text with each ${...}
//                                    replaced by {0}, {1}, ... in order, and
//                                    a translation may move the {n} around.
//                                    String values are looked up too, so a
//                                    ticket title interpolated here comes out
//                                    translated as well.
//   tr(text)                         a string that lives in data (an event
//                                    opener, a ticket title, a choice label).
//                                    Anything that is not a string, or has no
//                                    translation, comes back unchanged.
//   msg`text`                        marks a string for translation without
//                                    translating it, for constants built at
//                                    import time; translate it with tr() where
//                                    it is shown.
//
// Never call tr`` at module top level: it runs once, at import, before the
// language is known.
//
// Event text keeps its cast placeholders ({person}, {bro}, ...) in every
// language; renderCast fills them after translation.

const STORAGE_KEY = 'sprint_to_nowhere.lang';

export const LOCALES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
];

const LOADERS = {
  es: () => import('./es/index.js'),
};

let locale = 'en';
let dict = null;
const loaded = {};
const listeners = new Set();

export const getLocale = () => locale;

const lookup = (key) => {
  if (!dict) return key;
  const v = dict[key];
  return typeof v === 'string' && v !== '' ? v : key;
};

// The key for a tagged template, cached per call site (the strings array of
// a template is the same frozen object every time that template runs).
const keys = new WeakMap();
export const templateKey = (strings) => {
  let k = keys.get(strings);
  if (k === undefined) {
    k = strings.reduce((acc, part, i) => (i === 0 ? part : `${acc}{${i - 1}}${part}`), '');
    keys.set(strings, k);
  }
  return k;
};

const fill = (text, values) => text.replace(/\{(\d+)\}/g, (m, i) => {
  const n = Number(i);
  if (n >= values.length) return m;
  const v = values[n];
  return typeof v === 'string' ? lookup(v) : String(v);
});

export function tr(strings, ...values) {
  if (Array.isArray(strings) && Array.isArray(strings.raw)) {
    return fill(lookup(templateKey(strings)), values);
  }
  return typeof strings === 'string' ? lookup(strings) : strings;
}

export function msg(strings, ...values) {
  return strings.reduce((acc, part, i) => acc + String(values[i - 1]) + part);
}

// Install a dictionary directly. Tests use this; the game uses setLocale.
export const installDictionary = (code, table) => {
  loaded[code] = table;
  locale = code;
  dict = code === 'en' ? null : table;
};

const notify = () => { for (const fn of listeners) fn(); };

export const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

const supported = (code) => LOCALES.some(l => l.code === code);

const saved = () => {
  try { return globalThis.localStorage?.getItem(STORAGE_KEY) || null; } catch { return null; }
};

// The saved choice first, then the browser's preferred languages, then English.
export const detectLocale = () => {
  const s = saved();
  if (s && supported(s)) return s;
  const prefs = globalThis.navigator?.languages || [globalThis.navigator?.language].filter(Boolean);
  for (const p of prefs) {
    const base = String(p).toLowerCase().split('-')[0];
    if (supported(base)) return base;
  }
  return 'en';
};

export const setLocale = async (code, { remember = true } = {}) => {
  if (!supported(code)) code = 'en';
  if (code !== 'en' && !loaded[code]) {
    const mod = await LOADERS[code]();
    loaded[code] = mod.default;
  }
  locale = code;
  dict = code === 'en' ? null : loaded[code];
  if (remember) {
    try { globalThis.localStorage?.setItem(STORAGE_KEY, code); } catch { /* private mode */ }
  }
  if (globalThis.document) globalThis.document.documentElement.lang = code;
  notify();
};

export const initLocale = () => setLocale(detectLocale(), { remember: false }).catch(() => setLocale('en', { remember: false }));
