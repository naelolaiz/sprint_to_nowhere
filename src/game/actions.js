// SPDX-License-Identifier: GPL-3.0-only

// "Do something else" actions available during the work sub-phase: pairing,
// hiding in a booth, coffee, asking for help, lunch, a walk, staying late.
// Pure: (state, kind) => state.

import { EVENTS } from '../data/events.js';
import { CAST_POOLS } from '../data/cast.js';
import { stageEvent } from './flow.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Anyone who actually touches tickets overnight (Sarah, the Jin-types) must be
// a possible pair partner, otherwise "pairing in" on their ticket — the
// cooperative alternative to stealing it — can never happen for most of them.
const PAIR_POOL = [...CAST_POOLS.engineers, ...CAST_POOLS.jins];

const fire = (s, id) => {
  const ev = EVENTS.find(e => e.id === id);
  return ev ? stageEvent(s, ev) : s;
};

export const applyAction = (prev, kind) => {
  let s = { ...prev, sprintPlan: prev.sprintPlan.map(t => ({ ...t })) };
  if (kind === 'pair') {
    s.dayFocusRemaining = Math.max(0, s.dayFocusRemaining - 1.5);
    s.capital = Math.max(0, s.capital - 0.5);
    s.pairBonus = true;
    s.burnout = Math.max(0, s.burnout - 3);
    s.focus = Math.min(100, s.focus + 12);
    s.morale = Math.min(100, s.morale + 6);
    const partner = pick(PAIR_POOL);
    s.pairPartner = partner;
    const pairFlavorsOffice = [
      `Paired with ${partner} for 90 minutes. They rubber-ducked your weird race condition. You lost 1.5h but you're unstuck — and a little less alone.`,
      `Paired with ${partner}. They spotted the off-by-one in 14 seconds. You both pretended not to know which of you wrote it.`,
      `${partner} pulled up a chair. By minute 40 you'd both refactored a method neither of you was supposed to touch. Felt good.`,
      `Pair session with ${partner}. Half the time was you explaining the thing; the other half was them gently asking why. The why was good.`,
    ];
    const pairFlavorsHome = [
      `Paired with ${partner} over a Slack huddle. Their mic picked up a dishwasher. Your screen share froze on the one file that mattered. Still: unstuck.`,
      `Remote pairing with ${partner}. Twenty minutes of "can you see my screen?" Then 70 minutes of actual work. The ratio is considered good.`,
      `Paired with ${partner} on a Zoom. The "pair programming" plugin the company bought needs a license nobody has. You shared your screen like animals. It worked.`,
      `Pair session with ${partner}, cameras off. They found the bug by asking you to read the line aloud. You read it aloud. You heard it. 1.5h, one line.`,
    ];
    s.dayLog = [...s.dayLog, pick(s.atHome ? pairFlavorsHome : pairFlavorsOffice)];
  } else if (kind === 'booth') {
    s.capital = Math.max(0, s.capital - 1);
    s.boothBonus = true;
    s.burnout = Math.max(0, s.burnout - 4);
    s.focus = Math.min(100, s.focus + 25);
    s.morale = Math.min(100, s.morale + 4);
    const boothFlavorsHome = [
      'You closed the door of the one room with a door. Slack snoozed, camera off, status set to "heads down" — which three people read as "available for a quick one." You did not answer. The next ticket will hit harder.',
      'You set your status to 🔴 Focus time. Marcus replied to the status. You muted the thread. Headphones in. The next ticket will hit harder.',
    ];
    s.dayLog = [...s.dayLog, s.atHome
      ? pick(boothFlavorsHome)
      : 'You walked over to a phone booth and locked the door. Slack is on snooze. Headphones in. The next ticket will hit harder, and the office will be tolerable for a while.'];
  } else if (kind === 'lunch') {
    // A real lunch — leaving the building, sitting somewhere quiet, no laptop.
    // Costs an hour of focus-time but recovers significantly more than a coffee.
    s.dayFocusRemaining = Math.max(0, s.dayFocusRemaining - 1);
    const lunchN = (s.actionsToday?.lunch || 0) + 1;
    s.actionsToday = { ...(s.actionsToday || {}), lunch: lunchN };
    // Diminishing returns when you eat lunch twice — also a different tone.
    const recoveryMul = Math.max(0.25, 1 - 0.6 * (lunchN - 1));
    s.burnout = Math.max(0, s.burnout - 6 * recoveryMul);
    s.focus = Math.min(100, s.focus + 22 * recoveryMul);
    s.morale = Math.min(100, s.morale + 8 * recoveryMul);
    const lunchFlavorsFirst = [
      'You walked four blocks and ate at the place with the good banh mi. You did not check Slack. The world kept going.',
      'You sat at the park bench by the office. Your sandwich was unremarkable. The pigeons were content. You let yourself watch them for ten minutes.',
      'You ate alone at the counter of the diner across the street. The coffee was bad. The booth was quiet. Nobody asked you anything.',
      'You drove to the grocery store, bought a rotisserie chicken and two apples, ate them in your parked car listening to one full album.',
    ];
    const lunchFlavorsSecond = [
      'A SECOND lunch. Bold. The pigeons recognized you and approached without fear. You felt seen, then mildly judged.',
      'You went out for lunch again. The barista at the second place noticed. They said nothing. They knew.',
      'You ate twice. The second one was a "lunch lunch" and the first was retroactively reframed as "brunch."',
      'Second lunch of the day. You\'re not hungry. You just don\'t want to be at your desk. The body knows.',
    ];
    const lunchFlavorsThird = [
      'A third lunch. You are no longer eating; you are just outside, away. Nobody stops you. There is freedom in this.',
      'Lunch number three. The diner staff has stopped asking what you want — they just bring food. You have been adopted.',
    ];
    const lunchFlavorsHome = [
      'You ate at the kitchen table. Not the desk. The table. No laptop. The fridge hummed. It was the best meeting of the day.',
      'You made the lunch you keep saying you will make. It took 25 minutes. You ate it on the back step. Slack sent eleven notifications to a phone in another room.',
      'Lunch at home, standing at the counter at first, then sitting down on purpose. Nobody asked if you had "five minutes." They could not see you.',
    ];
    const lunchFlavorsHomeAgain = [
      'A second lunch at home. The fridge is now in a working relationship with you. Marcus\'s "quick one" sits unread on the other side of the house.',
      'Lunch again. You are not hungry. You just do not want to open the laptop. The laptop is three meters away and it knows.',
    ];
    const pool = s.atHome
      ? (lunchN >= 2 ? lunchFlavorsHomeAgain : lunchFlavorsHome)
      : (lunchN >= 3 ? lunchFlavorsThird : lunchN === 2 ? lunchFlavorsSecond : lunchFlavorsFirst);
    s.dayLog = [...s.dayLog, pick(pool)];
  } else if (kind === 'walk') {
    // A short walk around the block — small but free recovery, no political cost
    s.dayFocusRemaining = Math.max(0, s.dayFocusRemaining - 0.5);
    const walkN = (s.actionsToday?.walk || 0) + 1;
    s.actionsToday = { ...(s.actionsToday || {}), walk: walkN };
    const walkMul = Math.max(0.4, 1 - 0.4 * (walkN - 1));
    s.burnout = Math.max(0, s.burnout - 3 * walkMul);
    s.focus = Math.min(100, s.focus + 10 * walkMul);
    s.morale = Math.min(100, s.morale + 3 * walkMul);
    const walkFlavorsFirst = [
      'You walked around the block. You noticed three things you had not noticed before. None of them were work.',
      'You walked to the end of the parking lot and back. Your eyes adjusted to looking far. Your shoulders dropped a centimeter.',
      'You walked through the lobby, around the building, and back. The security guard nodded at you. You nodded back. It was nice.',
    ];
    const walkFlavorsRepeat = [
      'Another walk. Same block. Same security guard. They almost said something.',
      'You walked again. The route is now familiar. You added a small detour just to make it feel different.',
      'Second lap of the day. The third tree on the right has a small carving you missed earlier. You stared at it.',
    ];
    const walkFlavorsHome = [
      'You walked around your own block. Nobody from work saw you. Nobody from work was going to see you. You still walked fast.',
      'A walk. Headphones in, no podcast. A neighbor waved. You waved. For eleven minutes you were not "available."',
      'You walked to the end of the street and back. Your status went yellow. Two people noticed the yellow. Nobody noticed the walk.',
    ];
    const walkFlavorsHomeRepeat = [
      'Another lap of the block. The same neighbor. The same wave. The same yellow status. It helped slightly less, which is still helping.',
      'You walked again. You added one street. The street had a cat. The cat did not have a standup.',
    ];
    const pool = s.atHome
      ? (walkN >= 2 ? walkFlavorsHomeRepeat : walkFlavorsHome)
      : (walkN >= 2 ? walkFlavorsRepeat : walkFlavorsFirst);
    s.dayLog = [...s.dayLog, pick(pool)];
  } else if (kind === 'coffee') {
    // Coffee is a 20-minute round trip — the kitchen is upstairs, you take
    // it back to your desk, you sit back down. It's the smallest break.
    s.dayFocusRemaining = Math.max(0, s.dayFocusRemaining - 1/3);
    const coffeeN = (s.actionsToday?.coffee || 0) + 1;
    s.actionsToday = { ...(s.actionsToday || {}), coffee: coffeeN };
    // Caffeine curve: the first cup is great, the second still good, by the
    // fourth you're vibrating in your chair and it costs more than it gives.
    const caffeine = coffeeN === 1 ? { focus: 18, burnout: -3 } :
                     coffeeN === 2 ? { focus: 14, burnout: -1 } :
                     coffeeN === 3 ? { focus: 6,  burnout: 3  } :
                                     { focus: -6, burnout: 6  };
    const applyCaffeine = () => {
      s.focus = Math.max(0, Math.min(100, s.focus + caffeine.focus));
      s.burnout = Math.max(0, Math.min(100, s.burnout + caffeine.burnout));
    };
    const cup3Pool = [
      'Third cup. The focus is sharp but jagged. Your jaw is doing a thing.',
      'Third cup. You can feel your pulse in your eyelid.',
      'Third cup. The tab count crossed 40 at some point you cannot pin down.',
      'Third cup. The keyboard sounds louder than it is. You are typing fine. Your shoulders are not.',
    ];
    const cup4PlusPool = [
      `Cup ${coffeeN}. Your hands aren't still. The headache starts behind your right eye.`,
      `Cup ${coffeeN}. Your typing has become percussion. Someone two desks over glances over.`,
      `Cup ${coffeeN}. You walked back from the kitchen and forgot what you were doing for a full eight seconds.`,
      `Cup ${coffeeN}. You are sweating in a way that is not climate-related. A coworker asks if you're okay. You say "yes" three times.`,
      `Cup ${coffeeN}. The room is humming. Or you are. Both are also possible.`,
      `Cup ${coffeeN}. You read the same line of code four times. None of them counted.`,
      `Cup ${coffeeN}. Your reflection in the dark monitor looks slightly wired. You don't dwell on it.`,
    ];
    const jitterFlavor = coffeeN >= 4 ? pick(cup4PlusPool) : coffeeN === 3 ? pick(cup3Pool) : null;

    if (s.atHome) {
      // Coffee in your own kitchen — no Doug, no Brad, no spreadsheet.
      // ~25% chance a housemate / partner / kid / cat needs a moment.
      if (Math.random() < 0.25) {
        s = fire(s, 'home_household');
        applyCaffeine();
        if (jitterFlavor) s.dayLog = [...s.dayLog, jitterFlavor];
        return s;
      }
      applyCaffeine();
      const homeCoffeeFlavors = [
        'You made coffee in your own kitchen. Nobody had a theory about the milk. The window faced a tree. The ten minutes were yours.',
        'You stood at the counter while the kettle boiled. The light was good. You did not check Slack.',
        'You drank coffee on the back step. A bird did something on a fence. You watched it for the whole song.',
      ];
      s.dayLog = [...s.dayLog, pick(homeCoffeeFlavors)];
      if (jitterFlavor) s.dayLog = [...s.dayLog, jitterFlavor];
      return s;
    }
    s.dayLog = [...s.dayLog, 'You head to the kitchen for coffee.'];
    const r = Math.random();
    if (r < 0.35) {
      // Doug ambush at the espresso machine — fire the actual dialog tree
      s = fire(s, 'kitchen_karen');
    } else if (r < 0.6) {
      // On the way back, Brad rolls his chair to intercept — fire his dialog tree
      s.dayLog = [...s.dayLog, 'On your way back, Brad rolled his chair into the aisle to intercept you.'];
      s = fire(s, 'shoulder_tap');
    } else {
      // Clean break
      s.dayLog = [...s.dayLog, 'A clean coffee break. The kitchen was empty. You stared out the window for 4 minutes. It helped.'];
    }
    applyCaffeine();
    if (jitterFlavor) s.dayLog = [...s.dayLog, jitterFlavor];
  } else if (kind === 'late') {
    // Voluntary overtime — push past the workday on a hard ticket.
    // Costly: burnout, morale, and counts as a bad day (next day's budget shrinks).
    s.dayFocusRemaining = s.dayFocusRemaining + 2;
    s.dayFocus = (s.dayFocus || 9) + 2;
    s.burnout = Math.min(100, s.burnout + 8);
    s.morale = Math.max(0, s.morale - 2);
    s.stayedLate = true;
    const hard = s.sprintPlan.find(t =>
      !t.shipped && t.progress > 0 && t.progress < t.effort &&
      (t.type === 'bug' || t.effort >= 5));
    s.dayLog = [...s.dayLog, hard
      ? `You stayed late chasing "${hard.title}". The fluorescent lights got worse. +2h, +8 burnout.`
      : 'You stayed late. The office cleared out. The cleaners came. +2h, +8 burnout.'];
  } else if (kind === 'ask') {
    s.dayFocusRemaining = Math.max(0, s.dayFocusRemaining - 1);
    s.capital = Math.max(0, s.capital - 0.5);
    s.focus = Math.min(100, s.focus + 5);
    // Find the least-progressed unfinished ticket and bump it
    const candidates = s.sprintPlan
      .map((t, i) => ({ t, i }))
      .filter(({ t }) => !t.shipped && t.progress < t.effort);
    const helper = pick(CAST_POOLS.jins);
    if (candidates.length > 0) {
      candidates.sort((a, b) => (a.t.progress / a.t.effort) - (b.t.progress / b.t.effort));
      const { i } = candidates[0];
      const stuck = s.sprintPlan[i];
      // A teammate can point at the bug; they cannot ship your ticket for
      // you. Leave at least an hour so the ticket still has to go through
      // your keyboard (and the shipping logic) to count as done.
      const remaining = stuck.effort - stuck.progress;
      const bump = Math.min(3, Math.max(0, remaining - 1));
      if (bump > 0) {
        s.sprintPlan[i] = { ...stuck, progress: stuck.progress + bump };
        s.dayLog = [...s.dayLog, `You walked over to ${helper}'s desk. Asked about "${stuck.title}". They pointed at one line and said "that's your bug." +${bump.toFixed(1)}h progress.`];
      } else {
        s.dayLog = [...s.dayLog, `You walked over to ${helper}'s desk. Asked about "${stuck.title}". They looked at it, nodded, and said "yeah, that's basically done." It is not done. The last hour is always yours.`];
      }
    } else {
      s.dayLog = [...s.dayLog, `You went to ask ${helper} for help. Nothing to ask about. You both stared at their screen for a polite minute.`];
    }
  }
  return s;
};
