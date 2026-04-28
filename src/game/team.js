// SPDX-License-Identifier: GPL-3.0-only

// Overnight, the rest of the team also works on the sprint — sometimes.
// Jin is steady. Sarah is fast on bugs. Marcus is mostly in meetings,
// occasionally merges a doc tweak, and occasionally adds "one more thing".
// Teammates can finish tickets — the player wakes up to find work shipped
// (and inherits the debt). They get reduced credit for it: some morale,
// no political capital — your name isn't on the PR.

const teamMoraleForShip = (t) => {
  if (t.type === 'refactor') return 6;
  if (t.legacy) return 7;
  if (t.type === 'bug') return 3;
  return 2;
};

export const applyTeammateContributions = (state) => {
  const plan = state.sprintPlan.map(t => ({ ...t }));
  const log = [];
  const shipped = [];
  let debtDelta = 0;
  let moraleDelta = 0;

  const inProgress = () => plan.filter(t => !t.shipped && t.progress < t.effort);
  if (inProgress().length === 0) return { sprintPlan: plan, log, shipped, debtDelta, moraleDelta };

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
      debtDelta += debtChange;
      moraleDelta += teamMoraleForShip(t);
      log.push(`Overnight: ${who} shipped "${t.title}". You'll deal with the PR in the morning.`);
    } else {
      plan[idx] = { ...t, progress: newProgress, assignedTo: who };
    }
    return allowed;
  };

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
    const target = bug || remaining[Math.floor(Math.random() * remaining.length)];
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
      const target = stillOpen[Math.floor(Math.random() * stillOpen.length)];
      const got = apply(target.id, 0.5, 'Marcus');
      if (got > 0 && !plan.find(t => t.id === target.id)?.shipped) {
        log.push(`Overnight: Marcus actually merged a doc tweak on "${target.title}". +${got.toFixed(1)}h. Suspicious.`);
      }
    } else if (m < 0.45) {
      const target = stillOpen[Math.floor(Math.random() * stillOpen.length)];
      const idx = plan.findIndex(t => t.id === target.id);
      plan[idx] = {
        ...plan[idx],
        effort: plan[idx].effort + 1,
        scopeCreep: (plan[idx].scopeCreep || 0) + 1,
      };
      log.push(`Overnight: Marcus added "one more thing" to "${target.title}". +1h scope.`);
    }
  }

  return { sprintPlan: plan, log, shipped, debtDelta, moraleDelta };
};
