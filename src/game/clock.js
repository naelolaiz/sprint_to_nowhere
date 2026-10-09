// SPDX-License-Identifier: GPL-3.0-only

// One wall clock for the whole game. The workday starts at 9:00; every hour
// of focus you spend (on a ticket, in a meeting, at the espresso machine)
// moves the clock one hour forward. Nothing else moves it, so the time an
// opener quotes, the time the scene window shows and the time a calendar
// item lands are all the same clock.

import { getLocale } from '../i18n/index.js';

export const WORKDAY_START_MIN = 9 * 60;

// "2:05 PM" in English; Spanish reads the clock in 24 hours ("14:05").
export const minutesToClock = (totalMinutesSinceMidnight) => {
  const m = ((Math.round(totalMinutesSinceMidnight) % (24 * 60)) + 24 * 60) % (24 * 60);
  const hour24 = Math.floor(m / 60);
  const minute = String(m % 60).padStart(2, '0');
  if (getLocale() === 'es') return `${hour24}:${minute}`;
  const isPM = hour24 >= 12;
  const hour12 = ((hour24 + 11) % 12) + 1;
  return `${hour12}:${minute} ${isPM ? 'PM' : 'AM'}`;
};

// Minutes of the day's budget already spent.
export const usedMinutes = (state) => {
  const dayBudget = state?.dayFocus || 9;
  const remaining = state?.dayFocusRemaining ?? dayBudget;
  return Math.round(Math.max(0, dayBudget - remaining) * 60);
};

export const clockMinutes = (state) => WORKDAY_START_MIN + usedMinutes(state);
export const clockText = (state) => minutesToClock(clockMinutes(state));

// Coarse time of day, for scenes (what the window shows) and for openers
// that only make sense at one end of the day.
export const timeOfDay = (minutesSinceMidnight) => {
  const m = minutesSinceMidnight;
  if (m < 11 * 60 + 30) return 'morning';
  if (m < 13 * 60 + 30) return 'midday';
  if (m < 17 * 60) return 'afternoon';
  if (m < 19 * 60) return 'evening';
  return 'night';
};
export const timeOfDayOf = (state) => timeOfDay(clockMinutes(state));

// Windows, in minutes after 9:00, in which a scheduled disruption can land.
export const WHEN_WINDOWS = {
  morning:   [0, 150],     // 9:00 – 11:30
  midday:    [150, 270],   // 11:30 – 1:30
  afternoon: [270, 480],   // 1:30 – 5:00
  any:       [0, 480],
};

// Pick the minute (after 9:00) a disruption lands. It always lands inside
// the day you actually have: a short day still gets its interruptions, just
// earlier. Nothing lands in the last half hour, so there is always a sliver
// of day left to be interrupted in.
export const scheduleMinute = (when, budgetMinutes) => {
  const [lo, hi] = WHEN_WINDOWS[when] || WHEN_WINDOWS.any;
  const last = Math.max(0, budgetMinutes - 30);
  const max = Math.min(hi, last);
  const min = Math.min(lo, max);
  return min + Math.floor(Math.random() * (max - min + 1));
};
