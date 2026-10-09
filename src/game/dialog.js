// SPDX-License-Identifier: GPL-3.0-only

import { getEventNode } from './state.js';
import { isDescEligible, descText, renderCast } from './cast.js';
import { tr } from '../i18n/index.js';

// Pick the opener variant to show for a description pool.
//
// `idx` is the index `sampleEventCast` locked into eventCast._descIdx when the
// event fired. It is an index into the FULL pool (it was sampled from the
// eligible subset, but it refers to a position in the whole array). Honor it
// when that entry still fits the current context; otherwise fall back to the
// eligible subset so a remote-only opener never renders in the office.
//
// Indexing the filtered subset with a full-pool index (the previous behavior)
// showed a different variant than the one recorded in recentDescIdx, which
// made repeat-avoidance and `logByDesc` overrides point at the wrong opener
// whenever a pool mixed tagged and untagged entries.
export const pickVariant = (pool, idx, state) => {
  if (!Array.isArray(pool) || pool.length === 0) return null;
  const i = Number.isInteger(idx) ? idx : 0;
  if (i >= 0 && i < pool.length && isDescEligible(pool[i], state)) return pool[i];
  const eligible = pool.filter(d => isDescEligible(d, state));
  const src = eligible.length > 0 ? eligible : pool;
  return src[((i % src.length) + src.length) % src.length];
};

// Resolve everything the event panel needs to render the current dialog node:
// the node, whether it's the opening node, the rendered description text, and
// the choices still available in this context (office vs remote).
export const resolveEventText = (ev, state) => {
  const node = getEventNode(ev, state.dialogNode);
  if (!ev || !node) return { node: null, isStartNode: true, description: '', choices: [] };
  const isMultiTurn = !!ev.nodes;
  const isStartNode = !isMultiTurn || state.dialogNode === (ev.start || 'start');

  let raw = node.description;
  // Variant resolution: prefer node-level descriptions, then event-level.
  if (!raw) {
    const idx = state.eventCast?._descIdx ?? 0;
    const sourcePool = Array.isArray(node.descriptions) && node.descriptions.length > 0
      ? node.descriptions
      : (Array.isArray(ev.descriptions) ? ev.descriptions : []);
    raw = descText(pickVariant(sourcePool, idx, state));
  }

  // When chaos happened overnight, the morning standup IS that discussion —
  // replace the random standup blurb with the chaos flavor so the
  // conversation makes sense in context. Applies to both the regular standup
  // and the standup_debug variant.
  const useChaosAsDesc = (ev.id === 'daily_standup' || ev.id === 'standup_debug')
    && isStartNode && !!state.lastChaosFlavor;
  // Function-form descriptions get the resolved string fed through renderCast
  // too, so cast placeholders inside the returned template still substitute.
  // Data strings are translated here; function-form openers build their text
  // with tr`` themselves.
  const description = useChaosAsDesc
    ? state.lastChaosFlavor
    : renderCast(typeof raw === 'function' ? raw(state, state.eventCast) : tr(raw), state.eventCast);

  const choices = (node.choices || []).filter(c => !c.requires || c.requires(state));
  return { node, isStartNode, description, choices };
};
