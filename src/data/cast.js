// SPDX-License-Identifier: GPL-3.0-only

export const CAST_POOLS = {
  // Older guy with the milk spreadsheet, calls you "boss/chief/sport"
  dougs:     ['Doug', 'Greg', 'Larry', 'Steve', 'Frank', 'Hank', 'Gary'],
  // Older "Karen-type" — complaints, voice memos, all-caps Slack messages
  karens:    ['Karen', 'Linda', 'Pat', 'Rhonda', 'Carol', 'Sue'],
  // Sales-bro with the Tesla / pickleball / "synergy at scale"
  bros:      ['Brad', 'Chad', 'Brock', 'Tanner', 'Trevor', 'Hunter', 'Skyler'],
  // Competent engineer you actually like working with. Priya is deliberately
  // absent: she is the sales lead in the scripted dialogue, so she cannot also
  // turn up as a platform engineer or a pairing partner.
  engineers: ['Sarah', 'Noor', 'Jamal', 'Wei', 'Maya', 'Yusuf', 'Ana', 'Devon'],
  // The helpful Jin-type at the next desk, often gender-neutral
  jins:      ['Jin', 'Alex', 'Sam', 'Kit', 'Riley', 'Avery', 'Morgan'],
};

export const EVENT_CAST_RULES = {
  shoulder_tap:       { person: 'bros' },
  kitchen_karen:      { person: 'dougs' },     // event id is legacy; person is now Doug-archetype
  loud_sales_call:    { person: 'bros' },
  backlog_refinement: { facilitator: 'bros', objector: 'dougs', dev: 'engineers' },
  daily_standup:      { offliner: 'bros', updater: 'dougs', dev: 'engineers' },
  mental_health:      { facilitator: 'engineers' },
  broken_package:     { dev: 'engineers' },    // platform-team person
  fire_drill:         { sales: 'bros' },       // the sales-bro at the cluster
  meeting_cascade:    { bro: 'bros' },         // the person who has to leave
  building_issue:     { complainer: 'dougs' }, // the channel-spammer
  // ----- newer events -----
  compliance:           { dev: 'engineers' },  // colleague who used the script
  cto_skiplevel:        { dev: 'engineers' },  // alternate candidate the CTO offers it to
  partner_demo_panic:   { bro: 'bros' },       // sales engineer drowning on the call
  platform_deprecation: { dev: 'engineers' },  // platform-team person + cross-team ally
  holy_war:             { dev: 'engineers', objector: 'dougs' },  // the two camps in the Slack flame-war
  // dev_summit is in flight on a separate PR; cast rule registered here so its
  // {dev} placeholder substitutes correctly the moment that event lands.
  dev_summit:           { dev: 'engineers' },  // teammate visibly losing it next to you
  // ----- scrum theater -----
  planning_poker:       { dev: 'engineers', bro: 'bros' },  // the engineer who read the ticket; the listener who votes
  agile_coach:          { coach: 'bros' },     // the transformation consultant
  sprint_goal_changed:  { bro: 'bros' },       // the 🚀 reaction
  no_meeting_wednesday: { doug: 'dougs' },     // reply-all about whether a sync is a meeting
  // ----- infrastructure theater -----
  staging_booked:       { bro: 'bros' },       // the presenter with the sticker
  ci_queue:             { dev: 'engineers' },  // owner of the "CI (again)" thread
  security_scanner:     { dev: 'engineers' },  // tried to suppress the finding
  channel_migration:    { jin: 'jins' },       // still searching the old channel
  // ----- corporate contradictions -----
  blameless_postmortem: { dev: 'engineers' },  // has worked out which "role" they are
  return_to_office:     { doug: 'dougs' },     // the one in-person interaction
  timesheet_friday:     { jin: 'jins' },       // third attempt at the next desk
};
