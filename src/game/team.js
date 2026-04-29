// SPDX-License-Identifier: GPL-3.0-only

// Overnight, the rest of the team also works on the sprint — sometimes.
// Jin is steady. Sarah is fast on bugs. Marcus is mostly in meetings,
// occasionally merges a doc tweak, and occasionally adds "one more thing".
// Teammates can finish tickets — the player wakes up to find work shipped
// (and inherits the debt). They get reduced credit for it: some morale,
// no political capital — your name isn't on the PR.
//
// On top of routine contributions, ~60% of nights produce a CHAOS event:
// disasters, drive-by refactors, AI-pilot pushes, broken builds, milk-macros
// from Doug, QA reopens, PR review fights, stale PRs, lint rebases — the
// pool is biased toward review/QA-flavor "narrative" beats so the player
// actually sees them within a sprint or two. Some queue cleanup tickets
// that haunt future sprints. Each chaos event also writes a one-line
// `chaosFlavor` that BECOMES the next morning's standup conversation —
// when chaos happened, the standup IS that discussion.

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

// IDs of "narrative" review/QA-flavor events. When chaos fires, we bias the
// pick toward this subset so the player actually sees them within a sprint
// or two — otherwise they'd be lost in a wide pool of office hijinks.
const NARRATIVE_IDS = new Set([
  'pr_review_war', 'qa_reopen', 'stale_pr_block', 'qa_tickets_stuck',
  'review_nitpick_spiral', 'flaky_test_quarantine',
  'cherry_pick_chaos', 'rebase_conflict_marathon',
  'pandora_quick_fix', 'pandora_config_drift',
  'pandora_dependency_surprise', 'pandora_legacy_tax',
]);

const applyChaos = ({ plan, shipped, log, deltas, pendingCleanups }) => {
  if (Math.random() > 0.6) return;

  const inProg = plan.filter(t => !t.shipped && t.progress < t.effort);
  const inProgWithWork = inProg.filter(t => t.progress > 0);
  const events = [];
  if (shipped.length > 0) events.push({ id: 'debt_disaster', weight: 4 });
  if (inProg.length > 0) {
    events.push({ id: 'marcus_rewrite', weight: 4 });
    events.push({ id: 'ai_pilot', weight: 3 });
    events.push({ id: 'drive_by_refactor', weight: 3 });
    events.push({ id: 'sarah_jin_pair_win', weight: 3 });
    events.push({ id: 'scope_meeting', weight: 3 });
    events.push({ id: 'review_nitpick_spiral', weight: 5 });
    events.push({ id: 'dependency_pin_drama', weight: 3 });
  }
  if (inProgWithWork.length > 0) {
    events.push({ id: 'sarah_force_push', weight: 2 });
  }
  events.push({ id: 'broken_build', weight: 5 });
  events.push({ id: 'doug_milk_macros', weight: 2 });
  events.push({ id: 'qa_reopen', weight: 6 });
  events.push({ id: 'pr_review_war', weight: 6 });
  events.push({ id: 'stale_pr_block', weight: 5 });
  events.push({ id: 'qa_tickets_stuck', weight: 5 });
  events.push({ id: 'flaky_test_quarantine', weight: 4 });
  events.push({ id: 'cherry_pick_chaos', weight: 3 });
  events.push({ id: 'wrong_branch_merge', weight: 3 });
  events.push({ id: 'lint_war', weight: 3 });
  events.push({ id: 'rebase_conflict_marathon', weight: 4 });
  events.push({ id: 'pandora_quick_fix', weight: 5 });
  events.push({ id: 'pandora_config_drift', weight: 3 });
  events.push({ id: 'pandora_dependency_surprise', weight: 3 });
  events.push({ id: 'pandora_legacy_tax', weight: 3 });
  events.push({ id: 'slack_war', weight: 4 });
  events.push({ id: 'donuts', weight: 4 });
  events.push({ id: 'innovation_hour', weight: 3 });
  events.push({ id: 'doug_ambush', weight: 3 });
  events.push({ id: 'junior_questions', weight: 3 });
  events.push({ id: 'vendor_outage', weight: 3 });
  events.push({ id: 'jin_homelab_fire', weight: 1 });

  // Bias the pool: 60% of the time, restrict to narrative events when any are
  // available. Combined with the 60% chaos roll, that's ~36% per night for a
  // narrative event — roughly 83% per sprint, ~97% within two sprints.
  const narrative = events.filter(e => NARRATIVE_IDS.has(e.id));
  const pool = narrative.length > 0 && Math.random() < 0.6 ? narrative : events;

  const total = pool.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  let chosen = null;
  for (const e of pool) {
    r -= e.weight;
    if (r <= 0) { chosen = e.id; break; }
  }
  if (!chosen) return;

  switch (chosen) {
    case 'debt_disaster': {
      const t = pick(shipped);
      const extra = Math.max(8, Math.round(t.effort * 0.8));
      deltas.debt += extra;
      deltas.capital -= 1;
      pendingCleanups.push({
        title: `Untangle "${t.title}" (${t.shippedBy || 'someone'} shipped a 4,000-line diff)`,
        effort: Math.max(8, Math.round(t.effort * 1.5)),
        debt: -2,
        type: 'refactor',
        urgent: true,
      });
      log.push(`Overnight: ${t.shippedBy || 'someone'} merged "${t.title}" at 11pm. The diff is 4,000 lines, half of them deletes. Debt +${extra}, −1 capital. A cleanup ticket will land next sprint, larger than the original.`);
      deltas.flavor = pick([
        `Marcus celebrates yesterday's ship of "${t.title}." Nobody mentions the diff size. The debt total quietly ticks up on the dashboard he is not looking at.`,
        `Marcus opens with "huge win on '${t.title}'!" Three people who have already opened the PR exchange the same look.`,
        `${t.shippedBy || 'Someone'} gives an update on "${t.title}." It is "shipped, no notes." There are 4,000 lines of notes.`,
      ]);
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
      deltas.morale -= 3;
      deltas.capital -= 0.5;
      log.push(`Overnight: Marcus "rewrote" the spec for "${t.title}" to align with "the new direction." Progress reset to 0; ${lost}h of work discarded. Effort grew by 50%. −3 morale, −0.5 capital.`);
      deltas.flavor = pick([
        `Marcus walks through "the new direction" for "${t.title}" for nine minutes. Nobody pushes back. He calls it "alignment."`,
        `Marcus presents the updated spec for "${t.title}" as if it has always been the spec. Sarah locks her camera off.`,
        `Marcus, brightly: "small refresh on '${t.title}' — same scope, just sharpened." It is, by hour count, +50%.`,
      ]);
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
      deltas.focus -= 5;
      log.push(`Overnight: someone let an AI pair-pilot push code on "${t.title}". The diff has three different code styles, all confidently wrong. +3h scope, −6 morale, −5 focus.`);
      deltas.flavor = pick([
        `Someone asks whether the AI-generated parts of "${t.title}" were reviewed. The answer is unclear. Marcus says "we'll get to it."`,
        `Marcus celebrates the team's "AI-augmented velocity" on "${t.title}." Nobody can find the human reviewer.`,
        `Three people independently try to run "${t.title}" locally. Three different things break. Marcus calls it "iterating."`,
      ]);
      break;
    }
    case 'drive_by_refactor': {
      const t = pick(inProg);
      const idx = plan.findIndex(p => p.id === t.id);
      const lost = Math.min(2, plan[idx].progress);
      plan[idx] = { ...plan[idx], progress: Math.max(0, plan[idx].progress - lost) };
      deltas.morale -= 3;
      deltas.capital -= 0.5;
      pendingCleanups.push({
        title: 'Untangle a drive-by refactor that touched three other files',
        effort: 5,
        debt: -1,
        type: 'refactor',
        urgent: false,
      });
      log.push(`Overnight: Sarah "fixed" "${t.title}" by also refactoring three unrelated files. The original isn't done; -${lost.toFixed(1)}h progress. −3 morale, −0.5 capital. A new refactor ticket will land next sprint.`);
      deltas.flavor = pick([
        `Sarah explains that her "${t.title}" fix "also touched a few other things — for clarity." Nobody asks which other things.`,
        `Sarah's update: "I cleaned some adjacent code while I was in there." The PR diff is now eight files long.`,
        `Sarah, casually: "scope-wise, '${t.title}' grew a little." Marcus says "love the proactivity."`,
      ]);
      break;
    }
    case 'broken_build': {
      deltas.morale -= 10;
      deltas.burnout += 5;
      deltas.focus -= 10;
      deltas.capital -= 1;
      log.push('Overnight: Jin committed at 2:47am. Tomorrow morning the build is red across all branches. Half the team will spend the morning bisecting. −10 morale, +5 burnout, −10 focus, −1 capital.');
      deltas.flavor = pick([
        'Jin owns this morning\'s build break. Marcus reframes it as "a great learning opportunity." Three people are clearly bisecting in another tab.',
        'The build is red. Marcus opens with "before we start, small heads-up — main is on fire." He says "small" three more times.',
        'Jin\'s update is "I\'m fixing the thing I broke." Marcus replies "love the ownership."',
        'CI is red across all branches. Marcus suggests "we keep things async this morning so people can focus on the fix." Async means everyone is still on the call.',
      ]);
      break;
    }
    case 'doug_milk_macros': {
      deltas.focus -= 3;
      pendingCleanups.push({
        title: 'Remove milk_v47.xlsx export macros from prod',
        effort: 6,
        debt: -1,
        type: 'legacy',
        urgent: false,
      });
      log.push('Overnight: Doug from Infra "helped" by pushing his milk-tracking spreadsheet macros into the codebase. Nobody saw the PR until merge. −3 focus. A legacy cleanup ticket will land next sprint.');
      deltas.flavor = pick([
        'Someone notices an Excel-macro file in production. Marcus says he\'ll "follow up offline." He will not.',
        'Doug joins the call uninvited and shares his screen. The screen is milk_v48.xlsx. Marcus says "Doug, we\'re going to have to circle back."',
      ]);
      break;
    }
    case 'qa_reopen': {
      const title = pick(REGRESSION_TITLES);
      deltas.morale -= 3;
      deltas.capital -= 0.5;
      pendingCleanups.push({
        title,
        effort: 7 + Math.floor(Math.random() * 5),  // 7-11h
        debt: 1,
        type: 'bug',
        urgent: true,
      });
      log.push(`Overnight: QA finished testing something you shipped sprints ago. They found a problem. The ticket is back, with a regression fix queued for next sprint. ("${title}") −3 morale, −0.5 capital.`);
      deltas.flavor = pick([
        `QA wants to "just flag" a regression they found. The Slack thread is already at 47 messages. ("${title}")`,
        `QA emailed. Subject: "URGENT - quick question." It is neither. ("${title}")`,
        `QA leadership joins, off-camera. They have "context." They will not share it. ("${title}")`,
        `QA found a thing. They titled the ticket "minor." Marcus moved it to P0 by lunch. ("${title}")`,
        `QA writes a 12-paragraph reproduction. Step 1: "navigate to the application." ("${title}")`,
      ]);
      break;
    }
    case 'sarah_jin_pair_win': {
      // Sarah and Jin pair on a ticket and ship it cleanly. Rare positive event.
      const target = pick(inProg);
      const idx = plan.findIndex(p => p.id === target.id);
      const t = plan[idx];
      let debtChange = t.debtImpact;
      if (t.scopeCreep > 0 && t.type === 'feature') debtChange += t.scopeCreep * 2;
      const finished = {
        ...t, progress: t.effort, shipped: true,
        assignedTo: 'Sarah & Jin', shippedBy: 'Sarah & Jin', debtChange,
      };
      plan[idx] = finished;
      shipped.push(finished);
      deltas.debt += debtChange;
      deltas.morale += teamMoraleForShip(t) + 4;
      deltas.capital += 1;
      log.push(`Overnight: Sarah and Jin paired on "${t.title}" until 6pm and shipped it. The diff was clean. Both got credit. Suspicious. +1 capital.`);
      deltas.flavor = pick([
        `Marcus calls out Sarah and Jin's overnight pair-up on "${t.title}" as "exactly the kind of energy we need." Sarah looks tired. Jin is not on the call.`,
        `Sarah's update: "we paired on '${t.title}', it's done." Jin gives a thumbs-up. The room exhales.`,
        `Marcus opens with "I want to recognize Sarah and Jin." It is a 12-minute recognition.`,
      ]);
      break;
    }
    case 'pr_review_war': {
      // Two teammates feud in PR review. A regression-feedback ticket lands next sprint.
      pendingCleanups.push({
        title: 'Address PR review feedback from a heated thread',
        effort: 3 + Math.floor(Math.random() * 3),  // 3-5h
        debt: 0,
        type: 'bug',
        urgent: false,
      });
      deltas.morale -= 6;
      deltas.capital -= 1;
      log.push('Overnight: Sarah and Jin spent 47 comments arguing about a function name on Marcus\'s PR. The thread is locked. −6 morale, −1 capital. A follow-up ticket will land next sprint.');
      deltas.flavor = pick([
        'Sarah and Jin avoid eye contact. Marcus says he "loves the engagement on the review thread." The thread, it transpires, has been locked by an admin.',
        'Marcus opens with "I want to recognize the discourse on the open PR." Two people unmute to interrupt him. He keeps talking.',
        'Sarah brings up the PR. Jin counters. Marcus says "let\'s take that offline." They are about to be online for an hour.',
        'Brad joins the call to "add some context." He has none. He stays for the whole meeting.',
      ]);
      break;
    }
    case 'slack_war': {
      deltas.morale -= 8;
      deltas.burnout += 3;
      deltas.focus -= 3;
      log.push('Overnight: Jin and Sarah fought in #engineering about tabs vs spaces. Three other people weighed in. The conversation drifted to monorepos. Two emoji reactions were retracted. −8 morale, +3 burnout, −3 focus.');
      deltas.flavor = pick([
        'Nobody mentions the tabs/spaces thread. Everyone has read it. The silence is louder than the thread was.',
        'Two people in the call have their notifications visible. The thread is still active. Marcus pretends he doesn\'t see them.',
        'Marcus, brightly: "I noticed some great technical discussion in #engineering — let\'s take that energy and channel it into the sprint."',
      ]);
      break;
    }
    case 'sarah_force_push': {
      // Halve progress on up to 2 in-progress tickets that have actual progress.
      const sorted = [...inProgWithWork].sort(() => Math.random() - 0.5);
      const targets = sorted.slice(0, Math.min(2, sorted.length));
      let titles = [];
      for (const tt of targets) {
        const idx = plan.findIndex(p => p.id === tt.id);
        plan[idx] = { ...plan[idx], progress: Math.floor(plan[idx].progress / 2) };
        titles.push(`"${tt.title}"`);
      }
      deltas.morale -= 10;
      deltas.capital -= 0.5;
      log.push(`Overnight: Sarah force-pushed to main. ${titles.length === 1 ? titles[0] : titles.join(' and ')} lost half their progress. She is "really sorry, the rebase got weird." −10 morale, −0.5 capital.`);
      deltas.flavor = pick([
        'Sarah opens with "so, about main last night..." The room collectively braces. She has prepared a five-slide retrospective.',
        'Sarah\'s update: "I have to walk back yesterday\'s ship." She does. It takes seven minutes.',
        'Marcus says "blameless, blameless" four times before Sarah has finished saying what happened.',
      ]);
      break;
    }
    case 'scope_meeting': {
      // A "quick sync" grew the scope of 1-3 tickets.
      const sorted = [...inProg].sort(() => Math.random() - 0.5);
      const targets = sorted.slice(0, Math.min(3, sorted.length));
      for (const tt of targets) {
        const idx = plan.findIndex(p => p.id === tt.id);
        plan[idx] = {
          ...plan[idx],
          effort: plan[idx].effort + 1,
          scopeCreep: (plan[idx].scopeCreep || 0) + 1,
        };
      }
      deltas.morale -= 3;
      deltas.capital -= 0.5;
      log.push(`Overnight: Marcus and Brad had a "quick sync" that ran 90 minutes over. ${targets.length} ticket${targets.length > 1 ? 's' : ''} grew by 1h each. Marcus called it "alignment." −3 morale, −0.5 capital.`);
      deltas.flavor = pick([
        'Marcus references his "alignment sync" with Brad. He lists three new acceptance criteria that nobody had asked about. He calls them "table stakes."',
        'Marcus, brightly: "Brad and I had a great chat — there are some details we want to make sure we land." The details, in aggregate, are three more hours.',
      ]);
      break;
    }
    case 'donuts': {
      // The rare positive event.
      deltas.morale += 6;
      log.push('Overnight: Sarah brought donuts. The good ones from the place across the highway. The box was empty by 9:30am. +6 morale.');
      deltas.flavor = pick([
        'Morale is unaccountably high. Marcus asks "what changed?" Nobody tells him about the donuts.',
        'Three updates in a row are 30 seconds long and end with someone smiling. Marcus is suspicious.',
      ]);
      break;
    }
    case 'innovation_hour': {
      deltas.morale -= 3;
      deltas.burnout += 3;
      deltas.focus -= 5;
      log.push('Overnight: Marcus organized "Innovation Hour" for tomorrow. Voluntary, mandatory. Themes will be "blue-sky." −3 morale, +3 burnout, −5 focus.');
      deltas.flavor = pick([
        'Marcus reminds everyone Innovation Hour is in the calendar. He uses the word "voluntary" three times. His tone is the tone of mandatory.',
        'Marcus, eagerly: "I want to remind folks Innovation Hour is at 2pm — bring your wildest ideas!" Two people decline the invite live.',
      ]);
      break;
    }
    case 'doug_ambush': {
      deltas.morale -= 3;
      deltas.burnout += 2;
      deltas.focus -= 3;
      log.push('Overnight: Doug from Infra cornered Sarah at the espresso machine for 40 minutes about milk_v48.xlsx. She is "fine." She is not fine. −3 morale, +2 burnout, −3 focus.');
      deltas.flavor = 'Sarah is unusually quiet. The smell of espresso clings to her hoodie. Doug joins the call uninvited and immediately mutes himself.';
      break;
    }
    case 'junior_questions': {
      // Helping a junior is good but exhausting.
      deltas.morale += 1;
      deltas.burnout += 3;
      deltas.focus -= 3;
      log.push('Overnight: Tyler the junior asked thoughtful questions for three hours. You\'re glad someone is, even if it cost the day. +1 morale, +3 burnout, −3 focus.');
      deltas.flavor = pick([
        'Tyler\'s update is eight questions long. Marcus calls it "great learning energy." Three people made eye contact in solidarity.',
        'Tyler asks if "this is how we always do it." Five people answer at once with five different answers.',
      ]);
      break;
    }
    case 'vendor_outage': {
      deltas.morale -= 2;
      deltas.burnout += 2;
      deltas.focus -= 5;
      const vendors = ['Linear', 'Notion', 'CircleCI', 'GitHub', 'Slack', 'the artifact registry'];
      const v = pick(vendors);
      log.push(`Overnight: ${v} was down for 90 minutes. Marcus had to walk over and ask people what they were working on. He looked uncomfortable. −2 morale, +2 burnout, −5 focus.`);
      deltas.flavor = `Someone asks if ${v} is back up. Nobody is sure. Marcus says he'll "follow up offline" — possibly with ${v} support, possibly not.`;
      break;
    }
    case 'jin_homelab_fire': {
      // The rare absurd event. Jin is OUT for a while.
      deltas.morale -= 4;
      deltas.focus -= 3;
      deltas.capital -= 0.5;
      pendingCleanups.push({
        title: 'Pick up Jin\'s in-flight refactor while he reinstalls Proxmox',
        effort: 10,
        debt: -2,
        type: 'refactor',
        urgent: true,
      });
      log.push('Overnight: Jin\'s homelab caught fire. He\'s "fine" but his rack is "less fine." He will be on PTO Tuesday-Thursday. −4 morale, −3 focus, −0.5 capital. A cleanup ticket will land next sprint.');
      deltas.flavor = 'Jin is OOO. Marcus says he\'s "on a personal infrastructure project." Sarah, who has seen the photos, is openly concerned.';
      break;
    }
    case 'stale_pr_block': {
      // Sarah's PR has been "ready for review" for days. Nobody's looking.
      deltas.morale -= 3;
      deltas.capital -= 0.5;
      pendingCleanups.push({
        title: 'Push Sarah\'s 5-day-old PR over the line (it\'s "ready for review")',
        effort: 4,
        debt: 0,
        type: 'bug',
        urgent: true,
      });
      log.push('Overnight: Sarah\'s PR has been "ready for review" for 5 days. Nobody has looked at it. The auto-reminder bot is now muted in #engineering. −3 morale, −0.5 capital. A follow-up ticket will land next sprint.');
      deltas.flavor = pick([
        'Sarah brings up her PR. Nobody acknowledges it. Marcus pivots to "any blockers?" Sarah\'s PR is the blocker.',
        'Marcus says he\'ll "find someone to take a look at Sarah\'s PR today." Sarah has heard this exactly three times before.',
        'The reminder bot pings the channel mid-standup. Marcus mutes it. Live.',
      ]);
      break;
    }
    case 'review_nitpick_spiral': {
      // Endless review comments grow scope on an in-progress ticket.
      const t = pick(inProg);
      const idx = plan.findIndex(p => p.id === t.id);
      plan[idx] = {
        ...plan[idx],
        effort: plan[idx].effort + 2,
        scopeCreep: (plan[idx].scopeCreep || 0) + 1,
      };
      deltas.morale -= 5;
      deltas.capital -= 0.5;
      log.push(`Overnight: Jin left 23 review comments on the PR for "${t.title}" — half about variable naming, three about a function the PR doesn't even touch. Effort +2h. −5 morale, −0.5 capital.`);
      deltas.flavor = pick([
        `Jin reads three review comments aloud, "just for context." Two are about variable naming. One is about a file the PR doesn't touch. ("${t.title}")`,
        `Sarah patiently goes through Jin's comments on "${t.title}." The team learns three new opinions Jin has about React conventions.`,
        `Marcus says "love the rigor on the review thread." He has not read the PR.`,
      ]);
      break;
    }
    case 'qa_tickets_stuck': {
      // QA backlog grows; you have to triage.
      deltas.capital -= 0.5;
      pendingCleanups.push({
        title: 'Triage the 14 tickets stuck in QA "Awaiting Validation"',
        effort: 6,
        debt: 0,
        type: 'bug',
        urgent: false,
      });
      log.push('Overnight: 14 tickets are stuck in QA "Awaiting Validation". Three are from last quarter. Nobody knows who owns the column. −0.5 capital. A triage ticket will land next sprint.');
      deltas.flavor = pick([
        'Someone mentions QA. The room goes briefly silent. Marcus says he\'ll "loop in QA leadership" and moves on.',
        'Marcus opens a doc titled "QA Process Improvements — Q3." The doc from Q1 has the same name.',
        'Three people simultaneously ask "who owns the QA column?" Nobody answers.',
      ]);
      break;
    }
    case 'flaky_test_quarantine': {
      // Tests get skipped instead of fixed. Debt grows now.
      deltas.debt += 5;
      deltas.focus -= 3;
      log.push('Overnight: three integration tests started failing intermittently. The team agreed to "skip them for now." The skip list is now 31 tests long. Debt +5, −3 focus.');
      deltas.flavor = pick([
        'Tests fail in CI again. Three people simultaneously paste "flaky" in the chat. Marcus opens a doc titled "Test Reliability — Q3."',
        'Someone asks if the skipped tests are still in the skip list. Sarah quietly says "all of them."',
        'The CI dashboard shows green. The skip list shows 31 tests. Nobody connects them.',
      ]);
      break;
    }
    case 'cherry_pick_chaos': {
      // Hotfix landed on release branch but not main; bug returns later.
      deltas.capital -= 0.5;
      pendingCleanups.push({
        title: 'Re-apply the hotfix that was cherry-picked to release but never to main',
        effort: 3 + Math.floor(Math.random() * 3),
        debt: 1,
        type: 'bug',
        urgent: true,
      });
      log.push('Overnight: Marcus cherry-picked a hotfix to the release branch and forgot main. The bug will return on Monday. −0.5 capital. A regression ticket will land next sprint.');
      deltas.flavor = pick([
        'Someone notices a bug from sprint 4 is back. Marcus blames "the merge." There was, technically, no merge.',
        'The bug returns. Marcus says "we\'ll get to it" three times in a row, in slightly different tones.',
      ]);
      break;
    }
    case 'wrong_branch_merge': {
      // Someone merged into the wrong branch.
      deltas.burnout += 3;
      deltas.morale -= 4;
      deltas.capital -= 1;
      log.push('Overnight: someone merged a feature branch into staging instead of main. Half a day will be spent reverting. The git log will be quietly massaged. +3 burnout, −4 morale, −1 capital.');
      deltas.flavor = pick([
        'Nobody mentions yesterday\'s revert. The git log will be referenced as "cleanup." Marcus says, brightly, "ok, what\'s next?"',
        'Marcus, casually: "small note — we did a quick history-cleanup on staging last night." Three people clearly know what that means.',
      ]);
      break;
    }
    case 'lint_war': {
      // Lint config change forces everyone to rebase 200 files.
      deltas.morale -= 3;
      deltas.burnout += 2;
      deltas.focus -= 3;
      log.push('Overnight: Sarah merged a lint config change. 217 files were auto-formatted. Everyone has to rebase. The diff for tomorrow\'s standup will be "noisy." −3 morale, +2 burnout, −3 focus.');
      deltas.flavor = pick([
        'Complaints about the rebase mountain. Sarah is apologetic. Marcus is enthusiastic — "consistency is a gift to future-us."',
        'Three people are clearly rebasing during their own standup updates. One has merge conflicts visible on screen-share.',
      ]);
      break;
    }
    case 'rebase_conflict_marathon': {
      // A long-open branch had a rebase that "got creative."
      deltas.morale -= 2;
      deltas.focus -= 3;
      pendingCleanups.push({
        title: 'Validate Sarah\'s 4-hour rebase didn\'t silently drop changes',
        effort: 5,
        debt: 0,
        type: 'bug',
        urgent: false,
      });
      log.push('Overnight: Sarah\'s 3-week-old branch needed a rebase. It took 4 hours. She is "really sorry, the conflict resolution got creative." −2 morale, −3 focus. A validation ticket will land next sprint.');
      deltas.flavor = pick([
        'Sarah explains the rebase "got a bit creative." Three people offer to validate it. Marcus asks if it can wait until "after the demo."',
        'Sarah is unusually quiet. Jin offers to validate. Marcus deflects.',
        'Sarah\'s update: "the rebase is done." She does not say more. Nobody asks.',
      ]);
      break;
    }
    case 'pandora_quick_fix': {
      // A "quick fix" uncovers massive pre-existing tech debt.
      deltas.debt += 12;
      deltas.morale -= 5;
      deltas.focus -= 5;
      deltas.capital -= 0.5;
      pendingCleanups.push({
        title: 'Untangle the auth/state spiderweb a "quick fix" exposed',
        effort: 12,
        debt: -3,
        type: 'refactor',
        urgent: true,
      });
      pendingCleanups.push({
        title: 'Triage the three other pre-existing bugs yesterday\'s fix uncovered',
        effort: 5,
        debt: -1,
        type: 'bug',
        urgent: false,
      });
      log.push('Overnight: a "quick fix" uncovered three more pre-existing bugs and a six-year-old comment that reads "TODO: properly handle this." Debt +12, −5 morale, −5 focus, −0.5 capital. Two cleanup tickets will land next sprint.');
      deltas.flavor = pick([
        'Sarah\'s update: "while fixing the bug, I noticed the entire payments module has been quietly broken." Marcus says "great catch — let\'s scope a follow-up." There will be no follow-up.',
        'Jin opens with "small thing — that comment that says \'we\'ll fix this in Q2\'? Q2 was 2022."',
        'Three people independently say "wait, has it been broken this WHOLE time?" Sarah quietly nods.',
        'Sarah: "I think the original ticket was hiding three more tickets." Marcus: "love that we\'re finding these now."',
      ]);
      break;
    }
    case 'pandora_config_drift': {
      // A one-line flag flip reveals every environment is configured differently.
      deltas.debt += 8;
      deltas.morale -= 3;
      deltas.focus -= 6;
      pendingCleanups.push({
        title: 'Reconcile the four config sources nobody agrees on',
        effort: 8,
        debt: -2,
        type: 'refactor',
        urgent: false,
      });
      log.push('Overnight: a one-line flag flip revealed staging, prod, the .env, and the Helm chart all hold different values for the same setting. Nobody can name the source of truth. Debt +8, −3 morale, −6 focus. Reconciliation ticket will land next sprint.');
      deltas.flavor = pick([
        'Sarah: "I changed the flag in one place. Three other places had it set differently. Two of them I didn\'t know existed." Marcus suggests "we just pick one." Nobody picks one.',
        'Jin opens a thread: "which of these is the real config?" Four people answer with four different answers. The thread is at 47 messages and still climbing.',
        'Marcus reframes the drift as "per-environment tuning, on purpose." The room is silent. Sarah closes her laptop.',
        'Someone finds a fifth config source nobody knew about. It is the one prod is actually reading.',
      ]);
      break;
    }
    case 'pandora_dependency_surprise': {
      // A "patch-only" library bump quietly breaks downstream code that depended
      // on undocumented behavior.
      deltas.debt += 10;
      deltas.morale -= 4;
      deltas.focus -= 4;
      deltas.capital -= 0.5;
      pendingCleanups.push({
        title: 'Untangle the modules implicitly relying on the old library behavior',
        effort: 10,
        debt: -2,
        type: 'refactor',
        urgent: true,
      });
      log.push('Overnight: a "patch-only" bump on a sleepy utility lib quietly broke three downstream modules that were depending on undocumented behavior. Debt +10, −4 morale, −4 focus, −0.5 capital. Urgent cleanup ticket lands next sprint.');
      deltas.flavor = pick([
        'Jin: "the changelog said nothing changed. The behavior changed. We were depending on the bug." Marcus: "classic." It is the third time this quarter.',
        'Sarah pulls up the failing tests: "these are passing on main." They are not passing on main. They have not passed on main for two weeks. Nobody knew.',
        'Three engineers independently say "wait, we were relying on THAT?" Yes. You were.',
        'Marcus: "let\'s just pin to the old version." Jin: "the old version has the CVE." The room exhales slowly.',
      ]);
      break;
    }
    case 'pandora_legacy_tax': {
      // A "simple rename" inside a file marked DEPRECATED proves the file is
      // load-bearing for things nobody could name.
      deltas.debt += 9;
      deltas.morale -= 4;
      deltas.focus -= 3;
      pendingCleanups.push({
        title: 'Document what the legacy module actually does before anyone touches it again',
        effort: 6,
        debt: -1,
        type: 'refactor',
        urgent: false,
      });
      pendingCleanups.push({
        title: 'Add the missing tests around the legacy module the rename exposed',
        effort: 5,
        debt: -2,
        type: 'bug',
        urgent: false,
      });
      log.push('Overnight: a "simple rename" in a file marked DEPRECATED in 2021 turned out to be load-bearing for two services nobody could name. Debt +9, −4 morale, −3 focus. Two cleanup tickets will land next sprint.');
      deltas.flavor = pick([
        'Marcus on the deprecated file: "we should just delete it." Sarah: "it\'s imported in 23 places." Marcus: "still." Nobody deletes it.',
        'Jin: "the file says DEPRECATED. The file is also the only thing handling the auth fallback. Both are true." Marcus blinks.',
        'Sarah\'s investigation finds a comment from 2021: "TODO: remove after Q3." It does not say which Q3.',
        'The blame on the load-bearing function points to someone who left in 2019. Nobody on the call recognizes the name.',
      ]);
      break;
    }
    case 'dependency_pin_drama': {
      // Half the team upgraded a lib, half didn't. Two tickets lose progress.
      const candidates = inProg.filter(t => t.progress > 0);
      const sorted = [...candidates].sort(() => Math.random() - 0.5);
      const targets = sorted.slice(0, Math.min(2, sorted.length));
      const lost = [];
      for (const tt of targets) {
        const idx = plan.findIndex(p => p.id === tt.id);
        const drop = Math.min(2, plan[idx].progress);
        plan[idx] = { ...plan[idx], progress: Math.max(0, plan[idx].progress - drop) };
        lost.push(`"${tt.title}" (-${drop.toFixed(1)}h)`);
      }
      deltas.morale -= 4;
      deltas.focus -= 8;
      const note = lost.length > 0 ? lost.join(' and ') + '.' : 'No tickets had progress to lose.';
      log.push(`Overnight: half the team upgraded react-router, half didn't. Two builds broke. ${note} −4 morale, −8 focus.`);
      deltas.flavor = pick([
        'Half the team has different lockfiles. Marcus calls it "a healthy debate." Two people are clearly running `npm install` in another tab.',
        'Sarah asks "did everyone pull?" Three people answer "kind of."',
      ]);
      break;
    }
  }
};

export const applyTeammateContributions = (state) => {
  const plan = state.sprintPlan.map(t => ({ ...t }));
  const log = [];
  const shipped = [];
  const pendingCleanups = [];
  const deltas = { debt: 0, morale: 0, burnout: 0, capital: 0, focus: 0, flavor: null };

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
    capitalDelta: deltas.capital,
    focusDelta: deltas.focus,
    chaosFlavor: deltas.flavor,
  };
};
