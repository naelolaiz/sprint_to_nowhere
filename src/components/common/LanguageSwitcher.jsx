// SPDX-License-Identifier: GPL-3.0-only

import { C, FONT } from '../../data/theme.js';
import { LOCALES, getLocale, setLocale, tr } from '../../i18n/index.js';

// Lines already written to today's log stay in the language they were
// written in; everything from here on follows the new choice.
export const LanguageSwitcher = () => {
  const current = getLocale();
  return (
    <span className="flex items-center gap-1" role="group" aria-label={tr`Language`}>
      {LOCALES.map(l => (
        <button
          key={l.code}
          onClick={() => { if (l.code !== current) setLocale(l.code); }}
          aria-pressed={l.code === current}
          title={l.name}
          lang={l.code}
          className="px-1.5 py-0.5 tracking-widest uppercase"
          style={{
            fontFamily: FONT,
            fontSize: '10px',
            color: l.code === current ? C.amber : C.textDimmer,
            border: `1px solid ${l.code === current ? C.amberDim : 'transparent'}`,
            backgroundColor: 'transparent',
          }}
        >
          {l.code}
        </button>
      ))}
    </span>
  );
};
