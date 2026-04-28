// SPDX-License-Identifier: GPL-3.0-only

import { Code2, Bug, Wrench, Archive, Sparkles } from 'lucide-react';
import { C } from '../../data/theme.js';

export const TicketIcon = ({ type, t, size = 14 }) => {
  if (t?.strategic) return <Sparkles size={size} style={{ color: C.amber }} />;
  if (t?.legacy || type === 'legacy') return <Archive size={size} style={{ color: C.rust }} />;
  if (type === 'feature') return <Code2 size={size} style={{ color: C.blue }} />;
  if (type === 'bug') return <Bug size={size} style={{ color: C.rust }} />;
  return <Wrench size={size} style={{ color: C.sage }} />;
};
