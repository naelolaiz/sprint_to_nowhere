// SPDX-License-Identifier: GPL-3.0-only

import { C } from '../data/theme.js';

export const ticketLabel = (t) => {
  if (t.strategic) return 'STRATEGIC';
  if (t.legacy) return 'LEGACY';
  return { feature: 'FEAT', bug: 'BUG', refactor: 'REFACTOR', legacy: 'LEGACY' }[t.type] || t.type.toUpperCase();
};

export const ticketColor = (t) => {
  if (t.strategic) return C.amber;
  if (t.legacy) return C.rust;
  return t.type === 'feature' ? C.blue : t.type === 'bug' ? C.rust : C.sage;
};
