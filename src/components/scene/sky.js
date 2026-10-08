// SPDX-License-Identifier: GPL-3.0-only

import { timeOfDay } from '../../game/clock.js';

// What is outside the window, by the clock. The same sky is behind every
// window in the game, so a morning looks like a morning at the desk, in the
// meeting room and in the parking lot alike.
export const skyFor = (clock) => {
  const phase = timeOfDay(clock ?? 10 * 60);
  switch (phase) {
    case 'morning':   return { phase, top: '#7fa6c9', bottom: '#d6e4ec', sun: 0.22, sunColor: '#f4e2a0', haze: 0.35 };
    case 'midday':    return { phase, top: '#5f95cc', bottom: '#c7dbe8', sun: 0.5,  sunColor: '#fff3c4', haze: 0.2 };
    case 'afternoon': return { phase, top: '#6f9ac2', bottom: '#e6d2a6', sun: 0.74, sunColor: '#f7d98a', haze: 0.3 };
    case 'evening':   return { phase, top: '#3b3f6e', bottom: '#d9783f', sun: 0.92, sunColor: '#ffb257', haze: 0.45 };
    default:          return { phase, top: '#070910', bottom: '#1b1a22', sun: null, sunColor: null, haze: 0 };
  }
};

export const isDark = (clock) => skyFor(clock).phase === 'night';
