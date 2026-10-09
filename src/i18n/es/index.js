// SPDX-License-Identifier: GPL-3.0-only

// Spanish. Each file maps English source strings to their translation and is
// named after where the strings come from; scripts/i18n.mjs lists anything
// missing or stale.
import events from './events.json';
import tickets from './tickets.json';
import endings from './endings.json';
import game from './game.json';
import nights from './nights.json';
import ui from './ui.json';
import scenes from './scenes.json';

export default { ...events, ...tickets, ...endings, ...game, ...nights, ...ui, ...scenes };
