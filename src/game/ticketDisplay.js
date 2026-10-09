// SPDX-License-Identifier: GPL-3.0-only

import { C } from '../data/theme.js';
import { tr } from '../i18n/index.js';

export const ticketLabel = (t) => {
  if (t.strategic) return tr`STRATEGIC`;
  if (t.legacy) return tr`LEGACY`;
  if (t.type === 'feature') return tr`FEAT`;
  if (t.type === 'bug') return tr`BUG`;
  if (t.type === 'refactor') return tr`REFACTOR`;
  return t.type.toUpperCase();
};

export const ticketColor = (t) => {
  if (t.strategic) return C.amber;
  if (t.legacy) return C.rust;
  return t.type === 'feature' ? C.blue : t.type === 'bug' ? C.rust : C.sage;
};
