// SPDX-License-Identifier: GPL-3.0-only

// When in the day a disruption tends to land. Ceremonies and the morning
// arrival are slotted by pickDayEvents and open the day; everything else
// is given a minute on the clock and fires when the day reaches it.
// Missing ids mean "any time".
export const EVENT_WHEN = {
  // Things you find waiting when you sit down.
  on_call: 'morning',
  ceo_idea: 'morning',
  reorg: 'morning',
  os_update: 'morning',
  dependency: 'morning',
  staging_booked: 'morning',
  building_issue: 'morning',
  return_to_office: 'morning',
  timesheet_friday: 'morning',
  ai_initiative_kickoff: 'morning',
  sso_reauth: 'morning',
  // Things that find you after lunch.
  initiative_cancelled: 'afternoon',
  fire_drill: 'afternoon',
  holy_war: 'afternoon',
  velocity_audit: 'afternoon',
  flags_down: 'afternoon',
  all_hands: 'afternoon',
  town_hall: 'afternoon',
  values_refresh: 'afternoon',
  inclusion_workshop: 'afternoon',
  mental_health: 'afternoon',
  hq_drop: 'afternoon',
  sprint_review: 'afternoon',
  tickets_down: 'afternoon',
  dev_summit: 'afternoon',
  self_assessment: 'afternoon',
};

export const whenOf = (ev) => (ev && (ev.when || EVENT_WHEN[ev.id])) || 'any';
