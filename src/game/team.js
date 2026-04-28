// SPDX-License-Identifier: GPL-3.0-only

// Overnight, the rest of the team also works on the sprint — sometimes.
// Jin is steady. Sarah is fast on bugs. Marcus is mostly in meetings,
// occasionally merges a doc tweak, and occasionally adds "one more thing".
// Teammates can finish tickets — the player wakes up to find work shipped
// (and inherits the debt). They get reduced credit for it: some morale,
// no political capital — your name isn't on the PR.
//
// On top of routine contributions, ~25% of nights produce a CHAOS event:
// disasters, drive-by refactors, AI-pilot pushes, broken builds, milk-macros
// from Doug, and QA reopening tickets you shipped sprints ago. Some of
// these queue cleanup tickets that haunt future sprints.

const teamMoraleForShip = (t) => {
  if (t.type === 'refactor') return 6;
  if (t.legacy) return 7;
  if (t.type === 'bug') return 3;
  return 2;
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const REGRESSION_TITLES = [
  'REGRESSION: that bug-fix from a few sprints back',
  'REGRESSION: the onboarding flow you "finished" two sprints ago',
  'REGRESSION: the export job nobody has touched since Q1',
  'REGRESSION: the search filter Sarah closed last month',
  'REGRESSION: the email template "fix" from the sprint everyone forgot about',
];

const applyChaos = ({ plan, shipped, log, deltas, pendingCleanups }) => {
  if (Math.random() > 0.25) return;

  const inProg = plan.filter(t => !t.shipped && t.progress < t.effort);
  const events = [];
  if (shipped.length > 0) events.push({ id: 'debt_disaster', weight: 4 });
  if (inProg.length > 0) {
    events.push({ id: 'marcus_rewrite', weight: 4 });
    events.push({ id: 'ai_pilot', weight: 3 });
    events.push({ id: 'drive_by_refactor', weight: 3 });
  }
  events.push({ id: 'broken_build', weight: 5 });
  events.push({ id: 'doug_milk_macros', weight: 2 });
  events.push({ id: 'qa_reopen', weight: 4 });

  const total = events.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  let chosen = null;
  for (const e of events) {
    r -= e.weight;
    if (r <= 0) { chosen = e.id; break; }
  }
  if (!chosen) return;

  switch (chosen) {
    case 'debt_disaster': {
      const t = pick(shipped);
      const extra = Math.max(8, Math.round(t.effort * 0.8));
      deltas.debt += extra;
      pendingCleanups.push({
        title: `Untangle "${t.title}" (${t.shippedBy || 'someone'} shipped a 4,000-line diff)`,
        effort: Math.max(8, Math.round(t.effort * 1.5)),
        debt: -2,
        type: 'refactor',
        urgent: true,
      });
      log.push(`Overnight: ${t.shippedBy || 'someone'} merged "${t.title}" at 11pm. The diff is 4,000 lines, half of them deletes. Debt +${extra}. A cleanup ticket will land next sprint, larger than the original.`);
      break;
    }
    case 'marcus_rewrite': {
      const t = pick(inProg);
      const idx = plan.findIndex(p => p.id === t.id);
      const lost = Math.round(plan[idx].progress);
      plan[idx] = {
        ...plan[idx],
        progress: 0,
        effort: Math.round(plan[idx].effort * 1.5),
        scopeCreep: (plan[idx].scopeCreep || 0) + 1,
        assignedTo: 'Marcus',
      };
      log.push(`Overnight: Marcus "rewrote" the spec for "${t.title}" to align with "the new direction." Progress reset to 0; ${lost}h of work discarded. Effort grew by 50%.`);
      break;
    }
    case 'ai_pilot': {
      const t = pick(inProg);
      const idx = plan.findIndex(p => p.id === t.id);
      plan[idx] = {
        ...plan[idx],
        effort: plan[idx].effort + 3,
        scopeCreep: (plan[idx].scopeCreep || 0) + 1,
      };
      deltas.morale -= 6;
      log.push(`Overnight: someone let an AI pair-pilot push code on "${t.title}". The diff has three different code styles, all confidently wrong. +3h scope, −6 morale.`);
      break;
    }
    case 'drive_by_refactor': {
      const t = pick(inProg);
      const idx = plan.findIndex(p => p.id === t.id);
      const lost = Math.min(2, plan[idx].progress);
      plan[idx] = { ...plan[idx], progress: Math.max(0, plan[idx].progress - lost) };
      pendingCleanups.push({
        title: 'Untangle a drive-by refactor that touched three other files',
        effort: 5,
        debt: -1,
        type: 'refactor',
        urgent: false,
      });
      log.push(`Overnight: Sarah "fixed" "${t.title}" by also refactoring three unrelated files. The original isn't done; -${lost.toFixed(1)}h progress. A new refactor ticket will land next sprint.`);
      break;
    }
    case 'broken_build': {
      deltas.morale -= 10;
      deltas.burnout += 5;
      log.push('Overnight: Jin committed at 2:47am. Tomorrow morning the build is red across all branches. Half the team will spend the morning bisecting. −10 morale, +5 burnout.');
      break;
    }
    case 'doug_milk_macros': {
      pendingCleanups.push({
        title: 'Remove milk_v47.xlsx export macros from prod',
        effort: 6,
        debt: -1,
        type: 'legacy',
        urgent: false,
      });
      log.push('Overnight: Doug from Infra "helped" by pushing his milk-tracking spreadsheet macros into the codebase. Nobody saw the PR until merge. A legacy cleanup ticket will land next sprint.');
      break;
    }
    case 'qa_reopen': {
      const title = pick(REGRESSION_TITLES);
      pendingCleanups.push({
        title,
        effort: 7 + Math.floor(Math.random() * 5),  // 7-11h
        debt: 1,
        type: 'bug',
        urgent: true,
      });
      log.push(`Overnight: QA finished testing something you shipped sprints ago. They found a problem. The ticket is back, with a regression fix queued for next sprint. ("${title}")`);
      break;
    }
  }
};

export const applyTeammateContributions = (state) => {
  const plan = state.sprintPlan.map(t => ({ ...t }));
  const log = [];
  const shipped = [];
  const pendingCleanups = [];
  const deltas = { debt: 0, morale: 0, burnout: 0 };

  const inProgress = () => plan.filter(t => !t.shipped && t.progress < t.effort);

  const apply = (id, bump, who) => {
    const idx = plan.findIndex(t => t.id === id);
    if (idx < 0 || plan[idx].shipped) return 0;
    const t = plan[idx];
    const room = t.effort - t.progress;
    if (room <= 0) return 0;
    const allowed = Math.min(bump, room);
    const newProgress = t.progress + allowed;
    if (newProgress >= t.effort) {
      // Teammate finished the ticket overnight.
      let debtChange = t.debtImpact;
      if (t.scopeCreep > 0 && t.type === 'feature') debtChange += t.scopeCreep * 2;
      const finished = {
        ...t, progress: t.effort, shipped: true,
        assignedTo: who, shippedBy: who, debtChange,
      };
      plan[idx] = finished;
      shipped.push(finished);
      deltas.debt += debtChange;
      deltas.morale += teamMoraleForShip(t);
      log.push(`Overnight: ${who} shipped "${t.title}". You'll deal with the PR in the morning.`);
    } else {
      plan[idx] = { ...t, progress: newProgress, assignedTo: who };
    }
    return allowed;
  };

  if (inProgress().length > 0) {
    // Jin — picks the least-progressed in-progress ticket and chips at it.
    if (Math.random() < 0.7) {
      const target = [...inProgress()].sort(
        (a, b) => (a.progress / a.effort) - (b.progress / b.effort)
      )[0];
      const got = apply(target.id, 1 + Math.random(), 'Jin'); // 1.0 - 2.0h
      if (got > 0 && !plan.find(t => t.id === target.id)?.shipped) {
        log.push(`Overnight: Jin pushed a quiet fix on "${target.title}". +${got.toFixed(1)}h.`);
      }
    }

    // Sarah — preferentially knocks down bugs.
    const remaining = inProgress();
    if (remaining.length > 0 && Math.random() < 0.6) {
      const bug = remaining.find(t => t.type === 'bug');
      const target = bug || pick(remaining);
      const got = apply(target.id, target.type === 'bug' ? 2 : 1, 'Sarah');
      if (got > 0 && !plan.find(t => t.id === target.id)?.shipped) {
        log.push(target.type === 'bug'
          ? `Overnight: Sarah crushed half of "${target.title}". +${got.toFixed(1)}h.`
          : `Overnight: Sarah nudged "${target.title}" forward. +${got.toFixed(1)}h.`);
      }
    }

    // Marcus — PM-shaped chaos. Sometimes a doc tweak. Sometimes scope creep. Often nothing.
    const stillOpen = inProgress();
    if (stillOpen.length > 0) {
      const m = Math.random();
      if (m < 0.2) {
        const target = pick(stillOpen);
        const got = apply(target.id, 0.5, 'Marcus');
        if (got > 0 && !plan.find(t => t.id === target.id)?.shipped) {
          log.push(`Overnight: Marcus actually merged a doc tweak on "${target.title}". +${got.toFixed(1)}h. Suspicious.`);
        }
      } else if (m < 0.45) {
        const target = pick(stillOpen);
        const idx = plan.findIndex(t => t.id === target.id);
        plan[idx] = {
          ...plan[idx],
          effort: plan[idx].effort + 1,
          scopeCreep: (plan[idx].scopeCreep || 0) + 1,
        };
        log.push(`Overnight: Marcus added "one more thing" to "${target.title}". +1h scope.`);
      }
    }
  }

  // Chaos roll — sometimes the office just has a night.
  applyChaos({ plan, shipped, log, deltas, pendingCleanups });

  return {
    sprintPlan: plan,
    log,
    shipped,
    pendingCleanups,
    debtDelta: deltas.debt,
    moraleDelta: deltas.morale,
    burnoutDelta: deltas.burnout,
  };
};
