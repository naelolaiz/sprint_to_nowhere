// SPDX-License-Identifier: GPL-3.0-only

import { URGENT_FEATURES, LEGACY_TICKETS } from '../data/tickets.js';
import { mkTicket } from './backlog.js';
import { renderCast } from './cast.js';
import { totalRemaining } from './state.js';

export const debtSpeedPenalty = (debt) => {
  if (debt > 80) return 0.5;
  if (debt > 65) return 0.65;
  if (debt > 50) return 0.8;
  return 1;
};

export const dayFrac = (s) => {
  const d = (s.currentDay || 1) - 1;
  const dayBudget = s.dayFocus || 9;
  const used = 1 - Math.max(0, Math.min(1, (s.dayFocusRemaining ?? dayBudget) / dayBudget));
  // clamp slightly inside (d, d+1) so end-of-day snapshots don't collide with next-day events
  return d + Math.max(0.001, Math.min(0.999, used));
};

export const burnoutSpeedPenalty = (burnout) => {
  if (burnout > 85) return 0.55;
  if (burnout > 70) return 0.7;
  if (burnout > 50) return 0.85;
  return 1;
};

export const applyChoice = (state, choice) => {
  const e = choice.effect || {};
  let s = { ...state, sprintPlan: state.sprintPlan.map(t => ({ ...t })) };
  const log = [];

  // Every interaction in this office costs you something, even if just background noise
  s.burnout = Math.min(100, (s.burnout || 0) + 0.4);
  // Focus drains slightly with every back-and-forth — context switches are real
  s.focus = Math.max(0, (s.focus ?? 100) - 1.5);
  // Morale slowly bleeds out from each interaction. It's not catastrophic,
  // it's just the daily friction of caring less than you used to.
  s.morale = Math.max(0, Math.min(100, (s.morale ?? 70) - 0.3));

  if (e.focus) s.dayFocusRemaining = Math.max(0, s.dayFocusRemaining + e.focus);
  if (e.focusPct) s.focus = Math.max(0, Math.min(100, s.focus + e.focusPct));
  if (e.debt) s.debt = Math.max(0, s.debt + e.debt);
  if (e.capital !== undefined) s.capital = Math.max(0, Math.min(5, s.capital + e.capital));
  if (e.burnout) s.burnout = Math.max(0, Math.min(100, s.burnout + e.burnout));
  if (e.morale) s.morale = Math.max(0, Math.min(100, s.morale + e.morale));

  if (e.bumpRefactor) {
    const idx = s.sprintPlan.findIndex(t => t.type === 'refactor' && !t.shipped && t.progress < t.effort);
    if (idx >= 0) {
      const bumped = s.sprintPlan[idx];
      const replacement = mkTicket(URGENT_FEATURES[Math.floor(Math.random() * URGENT_FEATURES.length)], 'feature');
      replacement.urgent = true;
      s.sprintPlan[idx] = replacement;
      s.sprintBumped = [...s.sprintBumped, { bumped: bumped.title, replacement: replacement.title }];
      log.push(`⚠ "${bumped.title}" was deprioritized. Replaced with: "${replacement.title}".`);
    } else {
      // No refactor to bump? Just add the urgent thing on top of everything.
      const tpl = URGENT_FEATURES[Math.floor(Math.random() * URGENT_FEATURES.length)];
      const t = mkTicket(tpl, 'feature');
      t.urgent = true;
      s.sprintPlan = [...s.sprintPlan, t];
      log.push(`🚨 New ticket forced into sprint: "${t.title}".`);
    }
  }

  if (e.scopeCreep) {
    const candidates = s.sprintPlan.filter(t => t.type === 'feature' && !t.shipped && t.progress < t.effort);
    if (candidates.length > 0) {
      const target = candidates[Math.floor(Math.random() * candidates.length)];
      const idx = s.sprintPlan.findIndex(t => t.id === target.id);
      s.sprintPlan[idx].effort += 6;
      s.sprintPlan[idx].scopeCreep += 1;
      log.push(`📈 "${target.title}" grew by 6 hours.`);
    } else {
      // No feature to grow? Grow ANY unshipped ticket, or just add a new one.
      const anyCandidates = s.sprintPlan.filter(t => !t.shipped && t.progress < t.effort);
      if (anyCandidates.length > 0) {
        const target = anyCandidates[Math.floor(Math.random() * anyCandidates.length)];
        const idx = s.sprintPlan.findIndex(t => t.id === target.id);
        s.sprintPlan[idx].effort += 6;
        s.sprintPlan[idx].scopeCreep = (s.sprintPlan[idx].scopeCreep || 0) + 1;
        log.push(`📈 "${target.title}" grew by 6 hours.`);
      } else {
        const tpl = URGENT_FEATURES[Math.floor(Math.random() * URGENT_FEATURES.length)];
        const t = mkTicket(tpl, 'feature');
        t.urgent = true;
        s.sprintPlan = [...s.sprintPlan, t];
        log.push(`🚨 New ticket forced into sprint: "${t.title}".`);
      }
    }
  }

  if (e.addUrgentFeature) {
    const tpl = URGENT_FEATURES[Math.floor(Math.random() * URGENT_FEATURES.length)];
    const t = mkTicket(tpl, 'feature');
    t.urgent = true;
    s.sprintPlan = [...s.sprintPlan, t];
    log.push(`🚨 New ticket forced into sprint: "${t.title}".`);
  }

  if (e.cancelInitiative) {
    const idx = s.sprintPlan.findIndex(t => t.strategic && !t.shipped);
    if (idx >= 0) {
      const cancelled = s.sprintPlan[idx];
      log.push(`✗ "${cancelled.title}" CANCELLED. ${Math.round(cancelled.progress)}h of work discarded.`);
      s.sprintCancelled = [...(s.sprintCancelled || []), { title: cancelled.title, hoursLost: Math.round(cancelled.progress) }];
      s.sprintPlan = s.sprintPlan.filter(t => t.id !== cancelled.id);
    }
  }

  // Pivot — leadership decided the most-progressed in-flight ticket is wrong now.
  // Throw it out, replace with a new urgent feature. This is a SCOPE+SCRAP combo
  // and wastes whatever hours of progress you'd already burned on it.
  if (e.pivotTicket) {
    const candidates = s.sprintPlan
      .map((t, i) => ({ t, i }))
      .filter(({ t }) => !t.shipped && t.progress > 0);
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.t.progress - a.t.progress);
      const { t: target, i: idx } = candidates[0];
      const wastedHours = Math.round(target.progress);
      const tpl = URGENT_FEATURES[Math.floor(Math.random() * URGENT_FEATURES.length)];
      const replacement = mkTicket(tpl, 'feature');
      replacement.urgent = true;
      s.sprintPlan[idx] = replacement;
      s.sprintCancelled = [...(s.sprintCancelled || []), { title: target.title, hoursLost: wastedHours }];
      log.push(`✗ "${target.title}" PIVOTED. ${wastedHours}h of work discarded. Replaced with: "${replacement.title}".`);
    } else {
      // Nothing in-flight to pivot — they'll just add a new urgent one
      const tpl = URGENT_FEATURES[Math.floor(Math.random() * URGENT_FEATURES.length)];
      const t = mkTicket(tpl, 'feature');
      t.urgent = true;
      s.sprintPlan = [...s.sprintPlan, t];
      log.push(`🚨 New ticket forced into sprint: "${t.title}".`);
    }
  }

  // Waste progress — requirements changed, you have to start that ticket over.
  // Doesn't replace the ticket; just zeros its progress.
  if (e.wasteProgress) {
    const candidates = s.sprintPlan
      .map((t, i) => ({ t, i }))
      .filter(({ t }) => !t.shipped && t.progress > 0);
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.t.progress - a.t.progress);
      const { t: target, i: idx } = candidates[0];
      const wastedHours = Math.round(target.progress);
      s.sprintPlan[idx].progress = 0;
      log.push(`✗ "${target.title}" needs to be rewritten. ${wastedHours}h of work thrown away.`);
    }
  }

  if (e.addLegacy) {
    const tpl = LEGACY_TICKETS[Math.floor(Math.random() * LEGACY_TICKETS.length)];
    const t = mkTicket(tpl, 'legacy', { legacy: true, urgent: true });
    s.sprintPlan = [...s.sprintPlan, t];
    log.push(`📦 Legacy project assigned: "${t.title}".`);
  }

  if (e.promise) s.promise = e.promise;
  if (e.clearPromise) s.promise = null;

  // Going home flips the day to "remote" — drop any in-office disruptions
  // still queued for today so the narrative stays coherent (no fire drill
  // after you've already driven home).
  if (e.goHome) {
    s.atHome = true;
    if (s.eventQueue && s.eventQueue.length > 0) {
      s.eventQueue = s.eventQueue.filter(ev => !ev.inOffice);
    }
  }
  if (e.returnOffice) s.atHome = false;

  // Auto-deduct morale based on what the choice did. Throwing out work hurts the most.
  // These stack with any explicit `e.morale` value so events can tune up or down further.
  let auto = 0;
  if (e.pivotTicket) auto += 12;        // your work was scrapped for "a different direction"
  if (e.wasteProgress) auto += 9;       // start over because requirements changed
  if (e.cancelInitiative) auto += 10;   // strategic initiative wound down
  if (e.addUrgentFeature) auto += 4;    // a new urgent thing just appeared on you
  if (e.bumpRefactor) auto += 3;        // refactor swapped for sales-driven feature
  if (e.scopeCreep) auto += 2;          // the feature grew, you didn't agree to it
  if (auto > 0) s.morale = Math.max(0, s.morale - auto);

  // Track scope changes in the burn-up chart with a fractional-day timestamp.
  // This is what makes mid-sprint scope additions look like skyscrapers
  // instead of getting smoothed away by end-of-day work.
  const beforeHours = totalRemaining(state.sprintPlan);
  const afterHours = totalRemaining(s.sprintPlan);
  if (afterHours !== beforeHours) {
    s.hourHistory = [...(s.hourHistory || []), {
      day: dayFrac(s),
      hours: afterHours,
      kind: afterHours > beforeHours ? 'scope' : 'shrink',
    }];
  }

  const cast = state.eventCast || {};
  const renderedChoiceLog = choice.log ? renderCast(choice.log, cast) : null;
  s.dayLog = [...s.dayLog, ...[renderedChoiceLog, ...log].filter(Boolean)];
  return s;
};

export const workOnTicket = (state, ticketId) => {
  let s = { ...state, sprintPlan: state.sprintPlan.map(t => ({ ...t })) };
  const idx = s.sprintPlan.findIndex(t => t.id === ticketId);
  if (idx < 0) return s;
  const t = s.sprintPlan[idx];
  const previousAssignee = t.assignedTo;
  const stolenFrom = previousAssignee && previousAssignee !== 'you' ? previousAssignee : null;
  const debtPen = debtSpeedPenalty(s.debt);
  const burnPen = burnoutSpeedPenalty(s.burnout);
  const focusMul = Math.max(0.3, (s.focus ?? 100) / 100);
  // morale gives a soft +/- 30% multiplier — engaged devs ship faster, demoralized devs slog
  const moraleMul = 0.7 + 0.6 * ((s.morale ?? 70) / 100);
  // action bonuses stack multiplicatively
  let bonus = 1;
  const bonusNotes = [];
  if (s.pairBonus) { bonus *= 1.5; bonusNotes.push('pairing +50%'); }
  if (s.boothBonus) { bonus *= 1.3; bonusNotes.push('focus mode +30%'); }
  const speed = debtPen * burnPen * focusMul * moraleMul * bonus;
  const hoursAvailable = s.dayFocusRemaining;
  const hoursNeeded = t.effort - t.progress;
  const hoursWorked = Math.min(hoursAvailable, Math.ceil(hoursNeeded / Math.max(0.1, speed)));
  const effective = hoursWorked * speed;
  t.progress = Math.min(t.effort, t.progress + effective);
  t.assignedTo = 'you';
  s.dayFocusRemaining = Math.max(0, s.dayFocusRemaining - hoursWorked);
  // grinding adds a small amount of burnout — more if the codebase fights you
  s.burnout = Math.min(100, s.burnout + (hoursWorked * (s.debt > 70 ? 0.6 : 0.3)));
  // sustained work also slowly drains focus
  s.focus = Math.max(0, s.focus - hoursWorked * 2);

  let workLog = `Worked ${hoursWorked.toFixed(1)}h on "${t.title}"`;
  const modifiers = [];
  if (debtPen < 1) modifiers.push(`debt ${Math.round(debtPen * 100)}%`);
  if (burnPen < 1) modifiers.push(`burnout ${Math.round(burnPen * 100)}%`);
  if (focusMul < 1) modifiers.push(`focus ${Math.round(focusMul * 100)}%`);
  if (moraleMul < 0.95) modifiers.push(`morale ${Math.round(moraleMul * 100)}%`);
  else if (moraleMul > 1.05) modifiers.push(`morale +${Math.round((moraleMul - 1) * 100)}%`);
  modifiers.push(...bonusNotes);
  if (modifiers.length > 0) workLog += ` (${modifiers.join(', ')})`;

  if (t.progress >= t.effort) {
    t.shipped = true;
    t.shippedBy = 'you';
    let debtChange = t.debtImpact;
    if (t.scopeCreep > 0 && t.type === 'feature') debtChange += t.scopeCreep * 2;
    s.debt = Math.max(0, s.debt + debtChange);
    s.sprintShipped = [...s.sprintShipped, { ...t, debtChange }];
    s.totalShipped += 1;
    // SHIPPING REWARDS by type — different work makes different people happy
    let shipNote = '';
    if (t.type === 'refactor') {
      // Devs care about codebase health. Refactors feel GREAT. PMs do not notice.
      s.morale = Math.min(100, s.morale + 14);
      shipNote = ' Devs are happier. Nobody else noticed.';
    } else if (t.legacy) {
      // Legacy paydown — engineering hero moment, also satisfies the team
      s.morale = Math.min(100, s.morale + 16);
      shipNote = ' The legacy code is gone. The codebase is lighter. You are lighter.';
    } else if (t.type === 'bug') {
      // Bug fixes split the difference — small wins for both sides
      s.morale = Math.min(100, s.morale + 6);
      s.capital = Math.max(0, Math.min(5, s.capital + 0.5));
      shipNote = '';
    } else if (t.strategic) {
      // Strategic feature — biggest political win
      s.capital = Math.max(0, Math.min(5, s.capital + 1.5));
      s.morale = Math.min(100, s.morale + 4);
      shipNote = ' Leadership noticed. You got Slack reactions from VPs.';
    } else if (t.urgent) {
      // Urgent feature — PM relief, but no real pride
      s.capital = Math.max(0, Math.min(5, s.capital + 1));
      s.morale = Math.max(0, s.morale - 2);
      shipNote = ' Marcus is relieved. You feel hollow.';
    } else if (t.type === 'feature') {
      // Regular feature — moves the political needle, mild engineer satisfaction
      s.capital = Math.max(0, Math.min(5, s.capital + 0.75));
      s.morale = Math.min(100, s.morale + 4);
      shipNote = '';
    } else {
      s.morale = Math.min(100, s.morale + 4);
    }
    workLog += `. ✓ SHIPPED. Debt ${debtChange >= 0 ? '+' : ''}${debtChange}.${shipNote}`;
  } else {
    workLog += `. Progress ${Math.round(t.progress)}/${t.effort}.`;
  }
  // bonuses are consumed
  s.pairBonus = false;
  s.boothBonus = false;
  s.sprintPlan[idx] = t;
  s.dayLog = [...s.dayLog, workLog];
  // Taking a teammate-owned ticket without asking has a social cost.
  if (stolenFrom) {
    s.morale = Math.max(0, s.morale - 4);
    s.dayLog = [...s.dayLog, `(You took "${t.title}" from @${stolenFrom} without asking. They'll find out at standup. −4 morale.)`];
  }
  // Track this work session in the burn-up chart
  s.hourHistory = [...(s.hourHistory || []), {
    day: dayFrac(s),
    hours: totalRemaining(s.sprintPlan),
    kind: 'work',
  }];
  return s;
};
