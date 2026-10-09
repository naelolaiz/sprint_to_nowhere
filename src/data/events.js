// SPDX-License-Identifier: GPL-3.0-only

import { Wrench, AlertTriangle, Zap, MessageSquare, Users, Coffee, XCircle, Flame, Briefcase, Clock, Archive, Sparkles, Heart, Megaphone } from 'lucide-react';
import { formatClock } from '../game/cast.js';
import { firstUnstarted } from '../game/backlog.js';

// Context predicates for choices and descriptions that only fit one location.
// REMOTE: player is working from home (Zoom/Slack-huddle dynamics apply —
// fake-Wi-Fi, "camera off", "drop the call" are believable).
// OFFICE: player is in the office (the team is physically nearby — those
// remote-only excuses don't fly).
const REMOTE = (s) => !!s.atHome;
const OFFICE = (s) => !s.atHome;

// Shorthand for descriptions that need to render the actual in-game time.
// `T(cast)` = current wall-clock when the event fired.
// `T(cast, 8)` = 8 minutes after the event fired.
// Resolved at call time, not at import time: this module and game/cast.js
// import each other, so whichever loads second sees the other's exports as
// undefined while it evaluates. A direct alias would be undefined forever if
// game/cast.js happened to load first.
const T = (cast, offsetMin) => formatClock(cast, offsetMin);

// Name the refactor ticket a manager is about to bump, so the opener matches
// the card on the board instead of a hard-coded "auth-module refactor".
const refactorName = (s) => {
  const r = (s?.sprintPlan || []).find(t => t.type === 'refactor' && !t.shipped && t.progress < t.effort);
  return r ? `"${r.title}"` : 'the refactor';
};

// The card a sizing ceremony argues about: the first untouched one on the
// board, the same one `splitTicket` cuts in two if the argument is "resolved".
const pokerTitle = (s) => firstUnstarted(s?.sprintPlan)?.title || 'the next ticket';

export const EVENTS = [
  {
    id: 'quick_sync', icon: MessageSquare,
    title: '"Quick sync" — should be 15 min',
    descriptions: [
      'Marcus from product wants to sync about "the thing." He says it\'ll be quick. He always says it\'ll be quick.',
      'Marcus DM\'d: "got 15? wanna brainstorm something." The brainstorm has no agenda. Brainstorms with no agenda are always 90 minutes.',
      'A calendar invite appears titled "Sync." 30 minutes. No description. Optional attendees: 7 people.',
      'Marcus: "lemme just bounce something off you real quick." You have learned that "bounce something off" means "make a 40-minute decision in real-time without notes."',
      'Marcus walks over, makes the universal "got a sec?" gesture. The thing on his mind has been on his mind for three days, but you\'re going to figure it out together right now.',
      'Marcus DM: "🚨 quick one 🚨." The 🚨 is decorative. The "quick one" will require you to be added to a Slack channel called #project-flagship-launch-2025-final-v2.',
      'Calendar invite drops 8 minutes before it starts. Title: "[hold for chat]." No description. The notes link is to an empty Notion page titled "Untitled."',
      'Marcus walks up: "real quick — and don\'t worry, I just want your gut reaction." Your gut reaction is the start of a 90-minute conversation. By minute 30 he\'s asking for a Loom.',
      'Marcus: "got a sec? totally fine to push back." You push back. He says: "totally fair, totally fair." Then he books it for tomorrow at 8 AM.',
      'Marcus pings: "do you have 10? want to make sure we\'re aligned." You did not know you were misaligned. By minute 4 you understand that he wants you to align toward a decision he already made on Friday.',
      'Marcus: "real quick chat — and bring whoever you need." You bring one person. The meeting becomes about that person. The meeting is now their problem, not yours.',
    ],
    choices: [
      { label: 'Hop on the call', effect: { focus: -2 }, log: 'The "quick sync" took 1h45m. You don\'t remember what it was about.' },
      { label: '"Can this be an email?"', effect: { focus: -0.5, capital: -1 }, log: 'Marcus seemed put out. You bought back 90 minutes.' },
    ],
  },
  {
    id: 'production_fire', icon: Flame,
    title: 'PRODUCTION FIRE — P0',
    descriptions: [
      'BigCorp says the dashboard shows wrong numbers. The CEO is CC\'d on the thread. The thread is now 47 messages long.',
      'A customer\'s entire org just got 504\'d. The status page still says "all systems operational." Sales is in the war room. Sales has never been useful in a war room.',
      'PagerDuty fired at 2:47 AM. Three on-call engineers acknowledged. None investigated. The bug is in your code from six months ago. The CEO is now CC\'d.',
      '"All caps subject line: URGENT — billing API returning negative amounts." A customer was credited $1.4M overnight. Finance is FREAKING OUT. Marcus is asking if you can "take a quick look."',
      'A senior customer\'s integration broke after our last release. They have a clause about uptime SLAs. Their lawyer is on the support thread. The lawyer has questions.',
      'The login flow is sending password reset emails to the wrong addresses. They contain real reset tokens. Security is on a war-room call. The call has been running for 90 minutes. They are still naming a Slack channel.',
      'Production database is at 98% disk. Auto-scaling was disabled "for cost reasons" last quarter by someone who has since left. The runbook says "page Greg." There is no Greg.',
      'A junior engineer just merged a PR that removed all the rate limiters because "the tests passed locally." Stripe has called us. Stripe has never called us before.',
      'The mobile app is crashing on iOS for everyone running version 14.2.1 of our app — which is everyone, because we force-updated yesterday. App Store reviews are dropping in real time. Marketing is asking if we can "lean into it."',
      'Customer just emailed: "your AI feature called my CEO a slur in front of 200 people on a webinar." Comms is on the way. Legal is on the way. The model is the latest from a vendor whose contract Marcus signed without reading.',
      'A cron job that hasn\'t run in 11 months just woke up and emailed every user the message "TEST EMAIL — DELETE BEFORE PROD." It went to 4.2M people. Including the CEO. From the CEO.',
      'A staff engineer pushed straight to main "to fix a typo." The typo fix was 1,400 lines. The PR description was "lgtm." Three services are down. The staff engineer is at lunch.',
      'Our CDN provider had an outage. We migrated off them last quarter. Apparently nobody told the DNS. Half the world cannot reach us. The other half is fine. Customer support is sorted by region.',
      'A customer\'s integration is sending us their entire user table every 30 seconds because their dev "didn\'t see the pagination param." Our database has been at 100% CPU for two hours. Nobody noticed because the dashboard was also broken.',
      'The feature flag service is down. Every flag is now defaulting to "off." Including the flag that controls whether the kill switch has a kill switch. Engineering leadership is "synthesizing learnings."',
    ],
    choices: [
      { label: 'Drop everything and fix it', effect: { focus: -4, bumpRefactor: true, burnout: 8 }, log: 'Four hours of firefighting. A refactor was sacrificed to the gods of urgency.' },
      { label: 'Band-aid it, plan a real fix later', effect: { focus: -2, debt: 6, burnout: 5 }, log: 'You shipped a hotfix with a TODO comment. It will outlive you.' },
      { label: 'Deflect to the on-call rotation', effect: { focus: -1, capital: -2, burnout: 3 }, log: 'You found someone else to take it. Your manager noticed.' },
    ],
  },
  {
    id: 'scope_change', icon: AlertTriangle,
    title: 'Marcus has "a tiny tweak"',
    start: 'pitch',
    nodes: {
      pitch: {
        descriptions: [
          { text: 'PM Marcus leans on your desk holding a coffee. "Hey, tiny tweak — can the new feature also let users tip each other in crypto? CEO mentioned it. Should be quick, right?"', requires: OFFICE },
          'Marcus DMs you a Loom: 7 minutes. The Loom\'s entire content is "so what if it ALSO sent users a personalized AI-generated congratulations email when they convert? Tiny add."',
          { text: 'Marcus walks up: "Real quick — can the dashboard also show a leaderboard? Customers love leaderboards. The CEO saw a tweet about gamification, and — honestly, I think it\'s a layup."', requires: OFFICE },
          'A "quick chat?" Slack ping from Marcus. You jump on. "So — design wants the new flow to also support white-labeling. For one specific customer. They said by EOQ. It\'s on the roadmap now."',
          { text: 'Marcus stops by holding his phone: "OK so — same feature, but, hear me out — what if we ALSO let it import from CSVs? And maybe Excel? And maybe — Google Sheets? Wait, can it do all three?"', requires: OFFICE },
          'Marcus, with the energy of someone who has had three espressos: "What if the feature ALSO had a shareable Wrapped-style year-in-review? With Spotify-y animations? Just the MVP version. We can iterate."',
          { text: 'Marcus brings a Figma link to your desk. The Figma is the same feature, but with a chatbot. The chatbot is named "Skye." Skye has a personality bible. The personality bible is 14 pages.', requires: OFFICE },
          'Marcus: "small ask — can it ALSO be backwards compatible with the V1 API we deprecated 18 months ago? One customer is still on it. They\'re a strategic logo. They are not paying us."',
          { text: 'Marcus, holding a printout (a printout!): "we were thinking — what if the feature was also voice-activated? Just for accessibility. Just MVP. The CEO\'s mom uses screen readers, btw, so it\'s personal for him."', requires: OFFICE },
          'Marcus opens with: "before you say no — what if it ALSO worked offline? With sync. Like Linear. Customers expect it now." You do not have an offline storage layer. You have never had one.',
          'Marcus has joined your standup. "Real quick — I was thinking, does the feature support multi-tenant white-label embedding? Anduril asked. Well, an Anduril intern asked. But still."',
          'Marcus pings: "OK hear me out — what if the feature was a Slack bot? In addition to a web app. And an iOS app. Same backend. Should be free, right?"',
          { text: 'Marcus, in the kitchen, while you are getting coffee: "tiny one — can we add SOC 2 audit logs to this feature? I told a customer we already had them. They\'re renewing in 6 weeks."', requires: OFFICE },
          'Marcus: "I had a thought in the shower. What if the feature ALSO surfaced a personalized recommendation, powered by AI, that nudged users toward the upgrade tier? And the prompt was, like, deeply human? I wrote a draft prompt. It\'s 2,000 words."',
          'Marcus: "small thing — can the feature ALSO send a webhook to our partner ecosystem? We have eleven partners. Each one wants a slightly different schema. They\'re all on different versions of OAuth."',
          'Marcus: "I want to flag a tiny opportunity — what if this feature was also our entry point for the agentic AI strategy? Like, an MCP server? Just for partners? The CEO said \'MCP\' in the all-hands and I think we should run with it."',
        ],
        choices: [
          { label: '"Sure, no problem."', effect: { scopeCreep: true, debt: 3 }, log: 'You agreed. The feature grew by 6 hours. The "tiny tweak" alone has six known bugs.' },
          { label: '"That\'s a separate ticket."', next: 'pushback_a' },
          { label: '"How would that even work?"', next: 'rabbit_hole' },
          { label: '"Did the CEO actually say that?"', next: 'check_source' },
        ],
      },
      pushback_a: {
        description: 'Marcus: "I hear you. I do. But it\'s really a small thing. The CEO is excited. He saw a tweet."',
        choices: [
          { label: '"Show me the tweet."', next: 'tweet' },
          { label: '"It\'s not a small thing."', next: 'pushback_b' },
          { label: '"Fine, but it adds two weeks to the estimate."', effect: { scopeCreep: true, debt: 5, capital: 1 }, log: 'You overstated the cost. Marcus pretended to negotiate. Feature grew by 6 hours but you bought back some respect.' },
        ],
      },
      // Generic implementation-handwave: works for any of the ~10 pitch openers
      // (crypto tipping, leaderboard, white-label, voice-activated, MCP, etc.).
      rabbit_hole: {
        description: 'Marcus: "Oh great question. We\'d use, you know, the obvious stack. The frameworks are basically there now. It\'s actually super easy."',
        choices: [
          { label: '"Which framework, specifically?"', next: 'which_one' },
          { label: '"Have we discussed this with finance?"', next: 'finance' },
          { label: '"It\'s really not super easy."', next: 'pushback_b' },
        ],
      },
      which_one: {
        description: 'Marcus: "Like, the main one? I figured we\'d pick whichever\'s most popular. Sarah was nodding when I described it."',
        choices: [
          { label: '"Sarah doesn\'t do backend."', next: 'pushback_b' },
          { label: '"What does the user-side prerequisite story look like?"', next: 'prereqs' },
          { label: '"...fine, I\'ll spike on it."', effect: { scopeCreep: true, debt: 6 }, log: 'You agreed to investigate. The investigation took the rest of the day. The result will be ignored.' },
        ],
      },
      prereqs: {
        description: 'Marcus: "Prerequisites? Oh — yeah. I figured users would just have them already. Like, the average user is — you know — set up for it."',
        choices: [
          { label: '"Most users are not set up for it."', next: 'pushback_b' },
          { label: 'Stare at him in silence', next: 'silence' },
        ],
      },
      // Generic version of the tweet that drove the ask — the irony is that
      // the tweet has 11k likes and zero engineering specifics, regardless
      // of which trend the CEO actually starred.
      tweet: {
        description: 'Marcus pulls out his phone. "Here." The tweet has 11k likes, three lines of motivational marketing language, and zero engineering specifics. The CEO has starred it. The tweet is the entire requirements document.',
        choices: [
          { label: '"Marcus. This is a tweet."', next: 'pushback_b' },
          { label: '"Have we discussed this with legal?"', next: 'compliance_q' },
          { label: '"OK fine."', effect: { scopeCreep: true, debt: 4 }, log: 'You folded to the tweet. The tweet now drives the roadmap. The roadmap drives the codebase.' },
        ],
      },
      finance: {
        description: 'Marcus: "Finance? Why would— oh. Oh. I\'ll get back to you."',
        choices: [
          { label: 'Watch him leave', effect: { capital: 1 }, log: 'Marcus left to "loop in finance." The scope held. For now.' },
        ],
      },
      // Renamed from "legal" — generic regulatory/compliance gut-check
      compliance_q: {
        description: 'Marcus pales. "Oh. I — yeah. There\'s probably regulatory stuff with that, isn\'t there. Privacy. Audit. The stuff."',
        choices: [
          { label: '"Quite a lot of it, yes."', effect: { capital: 1 }, log: 'Marcus said he\'d "circle back." He won\'t. The scope held.' },
        ],
      },
      // Generic — CEO\'s indirect signal, regardless of topic
      check_source: {
        description: 'Marcus: "Well — he didn\'t SAY it explicitly, but he liked a tweet about it. And in our 1:1 he mentioned it twice. That\'s basically a yes."',
        choices: [
          { label: '"That is not basically a yes."', next: 'pushback_b' },
          { label: '"OK, fine."', effect: { scopeCreep: true, debt: 3 }, log: 'You folded to a vibes-based mandate. The codebase will pay.' },
        ],
      },
      pushback_b: {
        description: 'Marcus stares at the ceiling and sighs. "Look. Do this one for me. Next sprint we get the refactor in. I promise. Pinky promise."',
        choices: [
          { label: '"You said that last sprint."', next: 'pushback_c' },
          { label: '"In writing?"', next: 'in_writing' },
          { label: '"Fine, this once."', effect: { scopeCreep: true, debt: 3 }, log: 'You folded. Marcus went back to his desk happy. The pinky was not actually promised.' },
        ],
      },
      pushback_c: {
        description: 'Marcus: "I know. I know I did. Look — Priya\'s already telling Sarah we\'re doing it. If I walk this back I look weak."',
        choices: [
          { label: '"That\'s really your problem."', effect: { capital: -1 }, log: 'Marcus walked off muttering. He\'ll add the scope himself, badly, and you\'ll inherit the mess.' },
          { label: '"Then walk it back together. We\'ll go talk to Priya."', next: 'with_karen' },
          { label: '"...fine."', effect: { scopeCreep: true, debt: 4 }, log: 'You caved to save Marcus from himself. The codebase paid.' },
        ],
      },
      with_karen: {
        description: 'You both go to Priya, the sales lead. She does not remember being told. She barely remembers Marcus. "Oh — that thing? Yeah, no, push it. We\'re fine."',
        choices: [
          { label: 'Walk back to your desk', effect: { focus: -0.5, capital: 2 }, log: 'You held the line and gained Marcus\'s grudging respect. Total cost: 30 minutes and one walk.' },
        ],
      },
      in_writing: {
        description: 'Marcus laughs nervously. "Ha. Yeah, I can\'t actually do that. You know how it goes."',
        choices: [
          { label: '"Right. So no."', next: 'pushback_c' },
          { label: '"Sigh. OK."', effect: { scopeCreep: true, debt: 3, capital: -1 }, log: 'You agreed without the assurance. Both of you knew what was happening.' },
        ],
      },
      silence: {
        description: 'Marcus: "...is that a yes? I\'m going to take that as a yes."',
        choices: [
          { label: '"That is not what I said."', next: 'pushback_b' },
          { label: 'Continue staring', effect: { scopeCreep: true, debt: 3, capital: -1 }, log: 'You said nothing. Marcus added it to the ticket. The silence cost more than the words would have.' },
        ],
      },
    },
  },
  {
    // ----- DEV-SUMMIT KEYNOTE — a Ballmer-archetype guest yells DEVELOPERS
    // at an all-hands. Rare, sprint-2+ only, and never pairs with the regular
    // all_hands (they're both auditorium events).
    id: 'dev_summit', icon: Megaphone,
    title: 'Surprise keynote: "A passionate man with a vision"',
    requires: (s) => s.sprint >= 2,
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          'Mandatory all-hands. The CEO opens with: "I want to introduce someone who built enterprise software back when servers were furniture." A man in a soaked polo bounds onto the stage. He grabs the mic with both hands. The teleprompter is blank. He inhales. He begins: "DEVELOPERS! DEVELOPERS! DEVELOPERS! DEVELOPERS!" Sweat hits the front row. Marketing is filming this for a recruiting clip.',
          'Mandatory all-hands. The slide reads "WE ❤ DEVELOPERS." A guest "developer evangelist" — booked through a podcast — runs onto the stage to a backing track that cuts out at second four. He keeps going. He starts shouting: "DEVELOPERS! DEVELOPERS! DEVELOPERS!" The CEO is clapping arrhythmically off-stage. Legal is on the call.',
          'Mandatory all-hands. The CEO has flown in his "operator hero" — a man who has never stopped sweating in any photo of him from 1998 onwards. He takes the stage. He removes the mic from the stand. He yells the word DEVELOPERS five times in quick succession. Then he stops. Then he starts again. The audience is very still.',
          'Mandatory all-hands. The agenda just says "🔥 SPECIAL GUEST 🔥." A man jogs onstage in a polo two sizes too small. He pumps his fists. He delivers exactly one word, eleven times, increasingly loud: "DEVELOPERS." The CFO covers their ears. The intern is recording in landscape, then portrait, then landscape.',
        ],
        choices: [
          { label: 'Stand up and clap along', next: 'clap' },
          { label: 'Cringe quietly into your laptop', next: 'cringe' },
          { label: 'Yell back: "DEVELOPERS!"', next: 'chant_back' },
          { label: 'Slip out the side door', next: 'slip_out' },
        ],
      },
      clap: {
        description: 'You stand. A few rows back, three sales reps stand with you. The keynote\'s eyes lock onto yours. He points. He yells "YESSSSS!" directly at you. The CEO posts in #wins: "loved seeing the energy in the room." Your name is in the post. Misspelled.',
        choices: [
          { label: 'Sit back down', effect: { focus: -1.5, capital: 1, burnout: 5, morale: -2 }, log: 'You performed enthusiasm for a man yelling DEVELOPERS at a wall. You bought a small political win. You will think about this on the drive home.' },
        ],
      },
      cringe: {
        description: 'You stare at your laptop. The keynote is now doing a kind of half-squat shimmy with each yell. It is in your peripheral vision. It is hard to focus on anything else. {dev}, two seats over, has tears in their eyes — laughter or grief, you cannot tell.',
        choices: [
          { label: 'Endure', effect: { focus: -2, burnout: 6, morale: -3 }, log: 'You endured. The keynote was 22 minutes. The word "developers" was used 91 times. None of it was about software.' },
          { label: 'Take a "bathroom" break and never come back', effect: { focus: -0.5, capital: -0.5, burnout: 1, morale: 2 }, log: 'You stood up like you needed the bathroom and just… kept walking. Marcus DM\'d "u ok?" You said yes. You were not in the recording.' },
        ],
      },
      chant_back: {
        description: 'You yell it. "DEVELOPERS!" The keynote freezes. He locks eyes with you. The room goes silent for one full second. Then he points at you and screams: "THIS GUY GETS IT." The CEO is filming on his phone now. So is Marcus. So is Logan.',
        choices: [
          { label: 'Commit to the bit — yell it again', effect: { focus: -2, capital: 2, burnout: 7, morale: -4 }, log: 'You committed. The keynote ran 14 minutes longer than scheduled because of "audience energy." You are in the recruiting clip. Your father will see it.' },
          { label: 'Sit down immediately, regret', effect: { focus: -1, capital: 0.5, burnout: 4, morale: -2 }, log: 'You sat down fast. The keynote moved on. Marcus DM\'d you "🤣🤣🤣" eight times. The clip will surface in your next interview elsewhere.' },
        ],
      },
      slip_out: {
        description: 'You stand quietly and walk to the side door. The fire warden — the alternate, the serious one — is standing there. He shakes his head at you, slowly. He does not move. The keynote, behind you, is now yelling DEVELOPERS while doing what can only be described as a controlled fall toward the audience.',
        choices: [
          { label: '"I have a meeting."', effect: { focus: -0.5, capital: -1, burnout: 3, morale: 3 }, log: 'You held the lie. The warden let you pass. You worked for the next 45 minutes in a phone booth. Best 45 minutes of your week.' },
          { label: 'Sit back down, defeated', effect: { focus: -2, burnout: 7, morale: -4 }, log: 'You returned. The keynote was on its second wind. The CEO had joined him onstage and was attempting to high-five rhythmically. You are in the recording.' },
        ],
      },
    },
  },
  {
    id: 'all_hands', icon: Users,
    title: 'All-hands meeting',
    // Fire on odd sprints — about half the calendar — and lean on the
    // weighting in pickEvent for actual frequency.
    requires: (s) => s.sprint % 2 === 1,
    descriptions: [
      'Mandatory. Slide deck. Q&A from the audience. The CEO uses the word "synergy" unironically.',
      'Mandatory all-hands. The CEO is in a fleece vest. He starts with "I want to be transparent with you." The next slide is heavily redacted.',
      'Quarterly all-hands. The CEO opens with a video he made on his phone in his car. The audio is bad. The message is: "we\'re going to win."',
      'All-hands. Theme: "Operating with Urgency." The previous theme, three months ago, was "Sustainable Excellence." Nobody mentions the contradiction.',
      'All-hands. Townhall. Actually a "fireside chat" with three execs taking turns deflecting questions. There is no fireside.',
      'All-hands. The CEO opens with a poll. The poll is: "Are you excited?" Options: "Excited" / "Very Excited" / "Energized." 94% pick Energized. The 6% are flagged for follow-up.',
      'All-hands. The CEO has prepared a freestyle rap to announce the new strategy. The rap is two minutes and is genuinely difficult to watch. Comms posts a clip in #wins.',
      'All-hands. The first 15 minutes is a recap of last quarter\'s commitments. Three of them shipped. Eight of them did not. The slide says "Significant progress across all initiatives."',
      'All-hands begins with a moment of silence "for everyone affected by recent changes." Then a slide reading "ACCELERATING FORWARD." Then a Q&A. Q&A questions are pre-screened. None of them are about the changes.',
      'All-hands. The CEO has hired an executive coach who is "joining us today as a special guest." The coach asks everyone to put one hand on their heart. Several people put one hand on their heart.',
      'All-hands. The Chief People Officer announces a new "wellness initiative." Slide: "We hear you. We see you. We honor your bandwidth." Bandwidth was not the word people used.',
      'All-hands. The CFO presents financials with an "AI-adjusted" view next to the actuals. The AI-adjusted view is the same number, but multiplied. Nobody asks.',
      'All-hands. The CEO has invited a customer to speak. The customer praises the product. The customer\'s contract value is roughly equal to the catering budget.',
      'All-hands. New slide format. Each slide is just a vibe — gradient backgrounds, single phrases like "BETTER, FASTER, KINDER." There are 47 vibes.',
      'All-hands. The CEO opens with: "I want to apologize." The apology is for "the energy we\'ve been bringing to Mondays." Three slides later he is announcing layoffs but is calling them "intentional reshaping."',
      'All-hands. Today\'s slide format is hand-drawn on an iPad in real time. The CEO is also Apple-Pencil-ing while talking. He draws a chart. The chart goes up. There are no axes.',
      'All-hands. The CEO has read a book about "founder mode" on the flight. He references it eleven times in 32 minutes. Once he calls it "fonder mode" and does not correct himself.',
      'All-hands. The CEO has given his deck to an AI to "sharpen the language." The AI has rewritten "we\'re going to win" as "we will instantiate market dominance via aggressive iteration loops." He reads it aloud.',
      'All-hands. The new slogan is "FROM ZERO TO ONE TO INFINITY." It is on the wall behind him. It is also his Slack status. It is also the title of the Notion doc, the Loom, and the calendar invite.',
      'All-hands. The exec team is doing a "musical tribute" to the engineering org. They have rewritten "Don\'t Stop Believin\'" with new lyrics about velocity. The CFO sings "ship-pin\' on and on and on." Nobody knew this was coming.',
      'All-hands. The CEO has invited his daughter, age 11, to "share what she thinks the company should do." She says "make the app pink." There is real applause. A ticket appears in the backlog by Friday.',
      'All-hands. The Chief Product Officer presents "the future of our product" using only AI-generated images. Several of the images contain six-fingered hands. One of the executives in a mockup has a sword.',
      'All-hands. The CEO opens with: "I want to read a Slack message from a customer that really moved me." He reads it. The message is from himself, posted in #general 4 days ago, under a customer\'s account that he was logged into for testing.',
      'All-hands. New format: "anonymous Q&A via Slido." 47 questions submitted. The CEO answers two. They are the two with the fewest upvotes. The most-upvoted question, "are we profitable?" is "saved for next time."',
      'All-hands. The CEO has flown in a "category designer" he met on a podcast. The category designer claims, with slides, that we are inventing an entirely new market. The market is "AI-native B2B." Three competitors are also there, presumably also inventing it.',
      'All-hands. The CEO has installed a live "vibes meter" widget on the deck. It updates from audience reactions. He keeps glancing at it. When it dips, he says "let me re-frame that." It does not go back up.',
      'All-hands. A pre-recorded message from the founder, who is "currently in a deep-work cabin in Wyoming." The message is 9 minutes. The Wyoming background is clearly a Zoom virtual background; you can see his arm cut through a tree.',
      'All-hands. The CEO opens with: "I want to talk about something hard." He talks for 11 minutes. By minute 11 nobody can identify what the hard thing was. The slide titled "ACCOUNTABILITY" was never explained.',
      'All-hands held in the new "town square" — a converted breakroom with bleachers. The bleachers were ordered by the office manager who has since been let go. Three people fall through one of them during the Q&A.',
      'All-hands. The CFO presents three "scenario plans" for the year, labeled GOOD / GREAT / GENERATIONAL. The GOOD scenario is "what we did last year, again." Nobody asks about the BAD scenario, because there isn\'t one on the slide.',
      'All-hands. The CEO has decided to "open with vulnerability" and shares a story about his middle-school basketball coach. The story has no analog to anything the company is doing. He concludes: "and that\'s why we ship."',
      'All-hands. A new VP of Strategy is "introducing themselves" with a 22-slide journey deck. Slide 4 is them at age 7. Slide 11 is them at McKinsey. Slide 22 is them, today, "ready to listen." The Q&A immediately afterward is empty.',
      'All-hands. The CEO unveils the new visual identity. Everything is now in a typeface he commissioned, named "Vector." Three letters of "Vector" — V, E, T — are in different weights. He says it is "intentional." The kerning is, on closer inspection, broken.',
      'All-hands. A "town hall on the town hall." Half the meeting is meta-commentary on whether all-hands are working as a format. The conclusion: yes, but we will now also do "vibes-only" all-hands monthly, which start next month.',
      'All-hands. The CEO has hired an "energy consultant" to do a 5-minute opener on "leaning into possibility." She instructs the audience to make eye contact with three people. Brad makes eye contact with the camera and waves.',
      'All-hands. The CEO has read the Andy Grove book and is "going to start delegating differently." Slide 6 is a hand-drawn org chart with arrows pointing every direction. He says "this isn\'t the new structure, but it could be." Three VPs nod with great seriousness.',
      'All-hands. A surprise demo: the CEO has been "vibe-coding" a feature personally. He shares his screen. The repo is a fork of a repo nobody recognizes. The feature does not run. He says "the spirit is right."',
    ],
    choices: [
      {
        label: 'Attend (multitasking)',
        effect: { focus: -1.5, burnout: 5 },
        log: 'You half-listened while clearing your inbox. By the end you could not have summarized any of it. The work has not changed.',
        // Description-specific overrides where multitasking-through-it has a sharper detail.
        logByDesc: {
          5: 'You half-listened. Got the poll right (Energized). Did not get flagged. The work has not changed.',
          7: 'You half-listened to the recap of last quarter. The shipped/missed numbers slid past you. The slide said "significant progress." The work has not changed.',
          14: 'You half-listened while clearing your inbox. Heard "exciting quarter" 11 times. Did not hear the layoff number.',
          17: 'You half-listened. The phrase "instantiate market dominance" registered, briefly, as a Slack ping. The work has not changed.',
          22: 'You half-listened. The CEO read aloud from "a customer" while you replied to three emails. You did not catch that the customer was him. The work has not changed.',
          23: 'You half-listened. The most-upvoted question went unanswered, which made it easier to keep working. The work has not changed.',
        },
      },
      {
        label: 'Camera off, mute, do real work',
        requires: REMOTE,
        effect: { focus: -0.5, capital: -0.5, burnout: 2, morale: 1 },
        log: 'You worked through it. Marcus DM\'d you a 🙃 mid-meeting. You ignored him.',
        logByDesc: {
          25: 'You worked through it. The vibes meter dipped every time the CEO said "re-frame." You did not contribute to the dip. Marcus DM\'d you a 🙃 anyway.',
          28: 'You worked through it. Heard the bleacher snap from two rooms over. Marcus DM\'d you "u seeing this." You did not look up.',
        },
      },
      {
        label: 'Sit in the back, laptop open, do real work',
        requires: OFFICE,
        effect: { focus: -0.5, capital: -0.5, burnout: 2, morale: 1 },
        log: 'You worked through it from the back row. Marcus DM\'d you a 🙃 mid-meeting. You ignored him.',
      },
      {
        label: 'Genuinely listen for once',
        effect: { focus: -1.5, burnout: 7, morale: -3 },
        log: 'You listened. It was a lot, in a way that did not help. You are sadder now. The work has not changed.',
        // Description-specific overrides — for openings where "you listened to X"
        // has a sharper hook than the generic fallback.
        logByDesc: {
          1: 'You listened. The redacted slide stayed redacted. "Transparent" did most of the work it was not doing. You are sadder now. The work has not changed.',
          3: 'You listened. The contradiction with last quarter\'s message was sharper than expected. You are sadder now. The work has not changed.',
          6: 'You listened to the rap, end to end. Two minutes was longer than two minutes. Comms is already cutting clips for #wins. You are sadder now. The work has not changed.',
          7: 'You listened to the recap. Three commitments shipped. Eight did not. The slide said "significant progress." The math made you tired. You are sadder now. The work has not changed.',
          8: 'You listened through the moment of silence and the "ACCELERATING FORWARD" slide that came right after. The juxtaposition did not land for the people who wrote it. You are sadder now. The work has not changed.',
          9: 'You listened. You put a hand on your heart when the coach asked. Your heart did not feel reachable. You are sadder now. The work has not changed.',
          14: 'You listened. "Intentional reshaping" took 90 seconds to land as the layoff number. The number was not on the slide. You are sadder now. The work has not changed.',
          16: '"Founder mode." "Fonder mode." You let it land both ways. Neither one helped. You are sadder now. The work has not changed.',
          19: 'You listened to the CFO sing "ship-pin\' on and on and on." You will hear it for days. You are sadder now. The work has not changed.',
          20: 'You listened to the 11-year-old. She made more sense than the slide before her. You are sadder now. The work has not changed.',
          22: 'You listened. The customer message the CEO "found so moving" turned out to be his own, posted under a test login. Nobody on the call corrected him. You are sadder now. The work has not changed.',
          28: 'You listened from the working bleachers. Three rows over, three people are still being checked on. You are sadder now. The work has not changed.',
          30: 'You listened. There was a basketball coach in the story. You are not sure why. You are sadder now. The work has not changed.',
          36: 'You listened. The CEO\'s "vibe-coded" feature did not run. He said "the spirit is right." You are sadder now. The work has not changed.',
        },
      },
    ],
  },
  {
    id: 'shoulder_tap', icon: Coffee,
    title: "{person} wants to tell you about his weekend",
    inOffice: true,
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          '{person} swivels his chair around. "Yo. So, you wouldn\'t believe what I did this weekend. I went to this artisanal pickleball clinic? In Ojai?"',
          '{person} rolls over to your desk holding a half-eaten Sweetgreen bowl. "Bro. Bro. You HAVE to hear about Saturday. Stefan got us into this golf-and-bourbon thing, and —"',
          '{person} appears at your shoulder, smelling faintly of pre-workout. "Quick story — you do CrossFit, right? Cool, cool — so I just qualified for regionals."',
          '{person} raps the side of your monitor. "Yo. Saw you on Strava this morning. Decent pace! Have you tried zone-2 training? It\'s changed my life. Like, literally."',
          '{person} sits on the corner of your desk uninvited. "I was at the founder dinner Thursday. You know Logan? From Series B Logan? He had THOUGHTS about your roadmap, dude."',
          '{person} pulls up a chair, uninvited, holding an iced quad. "OK so — you have to invest in this guy\'s rollup. He\'s buying laundromats. Cash flow play. AI on top later. SAFE\'s open until Friday."',
          '{person} swings by wearing a Patagonia vest with another company\'s logo on it. "Yo — I just got back from a founder retreat in Tulum. We did breathwork. I have CLARITY now. Ask me anything."',
          '{person}: "I\'m doing 75 Hard. Day 22. I want to talk you through the framework. There\'s a book. I\'ll lend you the book. The book is mine, signed."',
          '{person} flops into the chair next to you with a Liquid Death. "Got back from the Hamptons. Was at this thing — Andreessen was there. Not THE Andreessen. His second cousin. But still."',
          '{person}: "Bro. Saw your LinkedIn. The post about \'shipping is a feature.\' 4 likes. Solid first effort. I\'ll repost it. We need to get you to 10K followers. I have a guy."',
          '{person}: "Heads up — I\'m starting a podcast. With Trevor. About \'what builders actually think.\' I want you on episode 3. It\'s a 90-minute commitment. We\'ll do it after work."',
          '{person} leans on your monitor. "Stefan and I are doing an angel syndicate. Mostly devtools. $25K minimum. Carry is 25%. I think you\'d be a great LP. Hear me out."',
        ],
        choices: [
          { label: '"Oh wow, cool."', next: 'pickleball' },
          { label: '"I\'m kind of in the middle of something."', next: 'deflect' },
          { label: 'Headphones theatre', effect: { focus: -0.5, capital: -1 }, log: 'You pretended not to hear. {person} held the chair-swivel for 20 more seconds, then turned back. He will remember this.' },
          { label: '"{person}, can it wait until lunch?"', next: 'lunch' },
        ],
      },
      pickleball: {
        description: '{person}: "Right? So — actually, before I get into it — have you seen the documentary? There\'s a documentary about this. On Hulu. Three episodes. It changed me."',
        choices: [
          { label: '"I have not."', next: 'doc' },
          { label: '"I really need to focus right now."', next: 'deflect' },
          { label: '"Sure, the third episode is great."', next: 'lied' },
        ],
      },
      doc: {
        description: '{person}: "OK so you HAVE to watch it. The third one made me cry. Anyway — where was I. Right. There\'s this guy. His name is Stefan."',
        choices: [
          { label: '"{person}. I\'m on a deadline."', next: 'deflect' },
          { label: '"Tell me about Stefan."', next: 'stefan' },
          { label: '"Why is there always a Stefan?"', next: 'ojai' },
        ],
      },
      stefan: {
        description: '{person}: "STEFAN. Stefan was olympic-adjacent. Different sport, doesn\'t matter. He has this thing he does, kind of a — actually, can I show you on YouTube? I have a clip."',
        choices: [
          { label: '"Maybe later."', next: 'maybe_later' },
          { label: '"Sure, show me."', next: 'youtube' },
        ],
      },
      youtube: {
        description: '{person} pulls up a 14-minute YouTube video and starts at the beginning. The volume is on full because his AirPods are dead.',
        choices: [
          { label: 'Endure the entire video', effect: { focus: -2, capital: 1 }, log: 'You watched 14 minutes of Stefan footage. You now have Stefan\'s number, his Instagram, and an open invitation.' },
          { label: '"{person}. I have to go."', effect: { focus: -1, capital: -1 }, log: 'You cut the video. {person} sighed audibly. The whole pod heard.' },
        ],
      },
      maybe_later: {
        description: '{person}: "Sure, sure. But like — when? Let\'s grab lunch. Let\'s get the team together. Happy hour? Stefan might come."',
        choices: [
          { label: '"Sure, sounds great"', effect: { focus: -1, capital: 1 }, log: 'You agreed in principle. {person} will follow up. Often. He has put it in the team calendar.' },
          { label: '"I really do have to focus."', effect: { focus: -0.75, capital: -0.5 }, log: 'You finally extracted yourself. {person} will mention this in the next 1:1 retro.' },
        ],
      },
      ojai: {
        description: '{person} pauses, genuinely thinking. "I... don\'t know. I think it\'s the energy? Sarah met him once and said the same thing about the energy."',
        choices: [
          { label: '"OK."', next: 'stefan' },
          { label: '"That\'s deeply un-introspective."', effect: { focus: -0.5, capital: -1 }, log: '{person} blinked twice. He went back to his desk visibly confused.' },
        ],
      },
      lunch: {
        description: '{person}: "Oh totally, yeah, lunch is great. Actually let\'s grab lunch tomorrow. Should I pick? I know a place."',
        choices: [
          { label: '"Sure"', effect: { focus: -0.25 }, log: 'Lunch is now on your calendar. {person} will send a 14-line message about the menu.' },
          { label: '"Just send me a calendar invite."', effect: { focus: -0.5 }, log: 'You bought the time but the invite has been sent. With a 200-word agenda.' },
        ],
      },
      deflect: {
        description: '{person}: "Oh totally, totally. Yeah, no, I get it. ... So this Stefan guy though —"',
        choices: [
          { label: '"{person}."', effect: { focus: -0.5, capital: -1 }, log: 'You raised your voice. Two pods turned to look. {person} slunk back to his desk wounded.' },
          { label: 'Listen anyway', next: 'stefan' },
          { label: 'Just turn back to your screen', effect: { focus: -0.75, capital: -0.5 }, log: 'You silently disengaged. {person} got the message after another minute. The minute counted.' },
        ],
      },
      lied: {
        description: '{person} lights up. "Oh my god, RIGHT? OK so the cinematography in that part — you\'re the only person who gets it. Wait til I tell you about Stefan."',
        choices: [
          { label: 'Listen', next: 'stefan' },
          { label: '"Actually, I gotta jump."', effect: { focus: -0.5, capital: 1 }, log: 'You bailed on a friendly note. The lie about the docu held. You earned a tiny ally and one hour back.' },
        ],
      },
    },
  },
  {
    id: 'kitchen_karen', icon: Coffee,
    title: 'Kitchen ambush',
    inOffice: true,
    start: 'enter',
    nodes: {
      enter: {
        descriptions: [
          'You walk in for coffee. {person} — the IT contractor who came back six months after retirement because he was "bored" — is at the espresso machine, talking to it. "Did you fix the milk thing? I emailed about the milk thing."',
          'You walk in. {person} is microwaving fish. Actual fish. The smell will linger for two hours. He sees you and lights up: "Boss! You\'re the guy I needed to see — about the printer."',
          'You walk into the kitchen. {person} has set up a small spreadsheet on a Lenovo laptop balanced on the counter. "Sport — quick favor. I just need a witness for the timestamp on this."',
          'Kitchen. {person} is unloading the dishwasher. He wasn\'t asked. He has Opinions about how the previous loader did it. "Chief, come here, you gotta see this."',
          'You enter. {person} is on a phone call on speaker. He waves you over. "Hold on, hold on — there\'s another guy here, he can confirm. Boss, were the lights flickering yesterday?"',
          'You walk in. {person} is taking a photo of the snack drawer. He turns. "Boss, glad you\'re here. Look at this — look at this — they\'ve been replacing the good granola bars with the chocolate ones. Three weeks running. I\'m putting a deck together."',
          'Kitchen. {person} has labeled the fridge shelves with masking tape. The labels say things like "DAIRY (REAL)" and "DAIRY (OAT, ETC)" and "DO NOT — Greg." He sees you. "I went rogue. Tell me I went rogue. But ALSO tell me I was right."',
          'You walk in. {person} is showing the new hire how to use the espresso machine. The new hire has been here longer than him. The lesson has been going for 22 minutes. The new hire has not made coffee.',
          'Kitchen. {person} is looking at a banana with deep concern. "Boss. They moved the fruit basket. Was it Procurement? Was this a Procurement decision?"',
          'You walk in. {person} is eating a yogurt that is not his — you watched HR put a Post-it on it yesterday — while reading the office\'s printed copy of last quarter\'s OKRs. He sees you. "Hey, killer — explain to me what \'OKR\' stands for, in your own words."',
          'Kitchen. {person} is in a long-running, friendly disagreement with the new young Brad-type about whether the office "needed" the cold-brew tap. {person}\'s position: it did not. Brad\'s position: it absolutely did. They\'ve been at it for 14 minutes. They want you to weigh in.',
          'You walk in for coffee. {person} is doing a BUFFER stretch against the counter, wincing performatively. "Boss — back\'s killing me. You ever think about how the chairs in this place are clearly cutting corners on lumbar?"',
        ],
        choices: [
          { label: 'Wait politely', next: 'wait' },
          { label: '"{person}, what are you doing?"', next: 'who' },
          { label: 'Just leave', effect: { focus: -0.25, burnout: 1 }, log: 'You retreated. {person} will mention this in the engagement survey under "psychological safety."' },
        ],
      },
      wait: {
        description: '{person} turns to you. Whatever this was about, it is now about the milk. "Have you been having issues with the milk? Tell me you\'ve been having issues with the milk."',
        choices: [
          { label: '"...no?"', next: 'no_milk' },
          { label: '"Yes, definitely."', next: 'yes_milk' },
          { label: '"What kind of issues?"', next: 'what_issues' },
        ],
      },
      who: {
        description: '{person}, without looking up: "Dictating. Slack. Voice-to-text. Don\'t interrupt the loop, boss." You had not noticed he was dictating. He has been dictating the whole time. It is about the milk.',
        choices: [
          { label: 'Back away slowly', effect: { focus: -0.5, burnout: 2 }, log: 'You retreated. {person} kept dictating. The milk thing remains unresolved.' },
          { label: 'Stay and watch', next: 'watch' },
        ],
      },
      watch: {
        description: '{person} dictates a 380-word Slack message about milk. The voice-to-text adds three commas where there shouldn\'t be any. He does not correct them. He refers to "the supplier" twelve times without naming them. He says "back in my day" twice.',
        choices: [
          { label: 'Continue watching', effect: { focus: -1.5, burnout: 4 }, log: 'You watched the entire dictation. You are now invested in the milk thing.' },
          { label: 'Try to leave', next: 'try_leave' },
        ],
      },
      try_leave: {
        description: '{person}, still not looking at you: "Hold on, chief. I need a witness for paragraph four. Listen to paragraph four."',
        choices: [
          { label: 'Listen to paragraph four', effect: { focus: -1, capital: 1, burnout: 3 }, log: 'Paragraph four was a 90-word indictment of the oat-milk supplier with one unflattering reference to procurement. You are now {person}\'s ally.' },
          { label: '"I really have to go."', effect: { focus: -0.5, capital: -1, burnout: 2 }, log: 'You bailed. {person}\'s eye-twitch was noted by another colleague.' },
        ],
      },
      no_milk: {
        description: '{person}: "Oh. That\'s — interesting. So it\'s targeted." He nods slowly. "Anyway, did you see Marcus had pickles in his lunch? Pickles."',
        choices: [
          { label: '"I have to go."', effect: { focus: -1, burnout: 2 }, log: 'You escaped. The pickle topic was a near miss.' },
          { label: '"...what about the pickles?"', next: 'pickles' },
        ],
      },
      yes_milk: {
        description: '{person}, lighting up: "RIGHT? It\'s the oat milk. They switched suppliers in March and didn\'t tell anyone. I have a spreadsheet, sport. I\'ve been running it on my homelab."',
        choices: [
          { label: '"Show me the spreadsheet."', next: 'spreadsheet' },
          { label: '"Can I see it later?"', effect: { focus: -1, capital: -0.5, burnout: 2 }, log: 'You declined. {person} will still send you the spreadsheet. With a follow-up. From an email address that ends in @homelab.local.' },
        ],
      },
      what_issues: {
        description: '{person}: "It separates. It curdles. It tastes wrong with the medium roast but is fine with the dark roast. I think they changed the stabilizer. I emailed the supplier. They blocked me."',
        choices: [
          { label: '"OK, I\'ll keep an eye out."', effect: { focus: -0.5, capital: 0.5, burnout: 1 }, log: 'Diplomacy. The milk thing remains in the background of your mind, where it now lives.' },
          { label: '"Have you escalated this to Facilities?"', next: 'facilities' },
        ],
      },
      facilities: {
        description: '{person}: "Oh I have. Three tickets, two emails, a voice memo. The voice memo was a mistake. Anyway — read this." He pushes his phone at you.',
        choices: [
          { label: 'Read the voice-memo transcript', effect: { focus: -1.5, capital: 1, burnout: 4 }, log: 'You read it. You are now part of the milk question. There is no leaving the milk question.' },
        ],
      },
      spreadsheet: {
        description: 'It is 47 columns wide. There are pivot tables. There is a tab called "Theories." He has been at this for three months. The file path is on his homelab.',
        choices: [
          { label: '"...impressive."', effect: { focus: -2, capital: 1, burnout: 5 }, log: 'You nodded for 40 minutes. You are now {person}\'s ally in the milk question. This will pay dividends and also cost dividends.' },
        ],
      },
      pickles: {
        description: '{person}: "Pickles. In the office. Whole pickles. Smelled like a deli for three hours. He doesn\'t care, that one. None of you young folks care about the small stuff."',
        choices: [
          { label: 'Slowly back away', effect: { focus: -1, capital: -0.5, burnout: 3 }, log: 'You escaped during the pickle monologue. The conversation will resume tomorrow.' },
        ],
      },
    },
  },
  {
    id: 'loud_sales_call', icon: Megaphone,
    title: 'Open-plan symphony',
    inOffice: true,
    start: 'overhear',
    nodes: {
      overhear: {
        descriptions: [
          'A salesperson three pods over is on a call. "...so what we offer is essentially synergy at scale, right? ARE YOU ON MUTE? Hello? OK they\'re on mute."',
          'Two pods over, a salesperson is speaking at concert volume: "...and that\'s why we\'re the LEADER in our space. Not just A leader. THE leader. Right? Right."',
          'A sales call in the open plan, on speaker. The customer is also on speaker. The customer can be heard saying "...we\'re shopping competitors, just so you know."',
          '{person} is doing a discovery call from his desk. Loudly. He just used the phrase "value-add multiplier" and you watched two engineers visibly flinch.',
          'A salesperson is doing a "warm intro" call directly behind you. He has been talking for 14 minutes. The customer has said "mm-hmm" three times.',
          '{person}, behind you, on a call: "I love that you brought that up. I LOVE it. It\'s actually one of the top three things our customers tell us." (His CRM is open. There are no notes.)',
          '{person} is doing a discovery call about a feature we don\'t have. He sounds confident. He is using a roadmap deck that hasn\'t been approved. The customer is asking specific questions. He is improvising.',
          'A salesperson is on a call talking about "our AI capabilities." We do not have AI capabilities. He is reading from a deck Marketing made yesterday. The deck has been on a Slack thread for 3 hours marked "DO NOT USE YET."',
          'A salesperson is two pods over, on a call, doing a screenshare demo of a feature that\'s currently behind a feature flag. The flag is off in their environment. He is moving the cursor confidently across a static image.',
          '{person} is on what was supposed to be a 30-minute call. It is hour 2. The customer is now telling {person} about their own product, their own roadmap, and their own marriage. {person} is taking notes.',
          'A salesperson, very loudly: "Look — between you and me, the deal of the quarter is on the table here. I want to make this work. What can I do." It is the third time they\'ve called the same customer this week.',
        ],
        choices: [
          { label: 'Try to focus through it', next: 'continue' },
          { label: 'Ask them to lower their voice', next: 'ask' },
          { label: 'Move to a phone booth', effect: { focus: -0.75, capital: -0.5 }, log: 'You relocated. The sales call followed you in spirit. You got 30% of your work done.' },
          { label: 'Slack the salesperson directly', next: 'slack' },
        ],
      },
      continue: {
        description: 'They\'re reading off their slide deck. Out loud. To people on a video call. Who can also see the slide deck. They\'re now doing a "fun fact" about each team member.',
        choices: [
          { label: 'Endure', effect: { focus: -1.75 }, log: 'You endured. You learned what "ARR" means three more times than necessary. You also know that Greg\'s fun fact is rock climbing.' },
          { label: 'Ask them to lower their voice', next: 'ask' },
        ],
      },
      ask: {
        description: 'You walk over. "Hey — could you maybe take this to a room?" They cover the mic. "Oh sorry! Almost done!" They are not almost done.',
        choices: [
          { label: 'Accept "almost done"', effect: { focus: -1 }, log: 'They were not almost done. They were 35 minutes away from being almost done.' },
          { label: '"Could you go to a room now?"', next: 'firm' },
        ],
      },
      firm: {
        description: 'They sigh dramatically. "FINE." They move to a room. They leave the door open. They speak louder.',
        choices: [
          { label: 'Give up', effect: { focus: -1.25, capital: -1 }, log: 'You gave up. Salesperson posted in #general about "the energy on the floor today."' },
          { label: 'Close the door for them', next: 'close_door' },
        ],
      },
      close_door: {
        description: 'You walk over and close the door. They watch you do it without breaking eye contact with the camera. They keep talking.',
        choices: [
          { label: 'Walk away', effect: { focus: -0.75, capital: -1 }, log: 'You did your civic duty. The conference room muffled them slightly. Salesperson texted Marcus about you.' },
        ],
      },
      slack: {
        description: 'You DM them. "Hey, would you mind taking that to a room? Trying to focus." They reply: "lol sure!" They do not move. They do continue the call, somewhat louder.',
        choices: [
          { label: 'Reply: "I meant now."', next: 'firm' },
          { label: 'Give up', effect: { focus: -1.5, capital: -0.5 }, log: 'You gave up. They never moved. The "lol sure!" sat in your DMs unresolved.' },
        ],
      },
    },
  },
  {
    id: 'ceo_idea', icon: Zap,
    title: 'Slack DM from the CEO',
    start: 'ping',
    nodes: {
      ping: {
        descriptions: [
          'CEO: "hey 👋 quick one — we should add the kind of AI thing notion has. just chatgpt but in our app. by next week? pls confirm 🙏"',
          'CEO: "yo. saw a TikTok. could we do that thing where the dashboard reads itself? like, in a friendly voice? podcast vibes. how hard"',
          'CEO Slack DM at 11:47 PM: "had drinks w/ a founder friend tonight. He has crypto-native gamification on his app. We need that. EOQ."',
          'CEO DM: "🚨 idea 🚨 — what if our app had Stories. like Insta Stories. But for our product. How big a lift on a scale of 1-10?"',
          'CEO Slack: "Sat next to a CTO at the Aspen thing. He said agentic AI is the future. Can we do that. By Q2. Confirm pls 🙏🙏"',
          'CEO: "BIG idea. you know how Apple does that thing where if u tap the back of your phone it does something. why don\'t we have that. for the web app. by friday?"',
          'CEO Slack at 6:14 AM: "i was on the peloton and it hit me. our app should have streaks. like Duolingo. with the angry owl. but on brand. lfg 🚀🚀🚀"',
          'CEO: "🧠 just got back from Burning Man and I have CLARITY. we need to build for radical self-expression. specifically — custom emoji reactions in the inbox. by EOM. ride that wave."',
          'CEO DM: "ok hot take — what if instead of dashboards we had ONE NUMBER. like, the only number. the user just sees the number. and then a vibe color around the number. ship it"',
          'CEO Slack: "did u see the OpenAI announcement. that\'s us in 18 months unless we move. i need a doc by EOD on how we\'re going to use that. specifically that. not generally. specifically."',
          'CEO: "I want our app to feel more like a friend. not a tool. a friend. can we do that. how. by next sprint. I wrote this up — sharing the doc. it\'s 14k words. read it and respond pls."',
          'CEO DM at 1:23 AM, from a hotel in Singapore: "saw a deck on the flight. blockchain is back. specifically the agentic blockchain stuff. we have to ship something this quarter or we miss the window. send me a roadmap by morning my time which is your morning lol"',
          'CEO: "💡 — vibe coded a prototype this weekend in Cursor. it kinda works. share screen at the all-hands tomorrow showing it in our codebase? it\'s not in our codebase. just say it is."',
          'CEO Slack: "we need to be the ChatGPT of [our category]. CC\'d Marcus. Marcus needs to also feel this. tell him."',
          'CEO: "I\'ve been reading Naval. and rereading Sapiens. and I think we\'ve been thinking about this wrong. we don\'t have a product. we have a network. let\'s reorient. how. by Q3."',
          'CEO DM, immediately after a board meeting: "the board wants to see AI numbers. specifically MCP adoption numbers. do we have MCP. do we have numbers. if no — make some. just for friday."',
          'CEO: "real talk — I want us to be Stripe. like, the developer love thing. how do we do that. start with launching something on hacker news this week. doesn\'t matter what."',
          'CEO Slack at midnight: "I was reading Founder Mode again. I want u to skip-level me. just for this initiative. don\'t tell Marcus. or do, idc. but the speed has to be different. lfg 🔥"',
          'CEO: "this isn\'t urgent but I want to flag — we should have an MCP server. for partners. so they can plug their agents into our data. how soon. who owns this. who wants to own this. (it should be you)"',
        ],
        choices: [
          { label: '"On it!"', next: 'on_it' },
          { label: '"Could you elaborate on the requirements?"', next: 'elaborate' },
          { label: '"Realistically that\'s 2 months of work."', next: 'pushback' },
          { label: 'Forward to your manager', effect: { capital: -1, addUrgentFeature: true }, log: 'It came back to you anyway. Now with your manager involved and a status update meeting on the calendar.' },
        ],
      },
      on_it: {
        description: 'CEO: "amazing 🚀 actually — could it also write the user\'s onboarding email? and then send it? through mailchimp ideally. or whatever\'s cheapest"',
        choices: [
          { label: '"...sure!"', next: 'plus_more' },
          { label: '"That\'s a different feature."', next: 'pushback' },
          { label: '"Mailchimp costs $X/month at our scale, btw."', next: 'cost' },
        ],
      },
      plus_more: {
        description: 'CEO: "💪 youre a rockstar. one more thought: it should learn from user behavior. not in a creepy way. just like — knows what they want. k thx ❤️"',
        choices: [
          { label: '"Got it"', effect: { addUrgentFeature: true, debt: 9, capital: 2 }, log: 'You agreed to all of it. A vague mega-feature has been added. The CEO posted "🚀 our team is shipping" in #wins.' },
          { label: '"Let me scope this properly first."', next: 'scope_it' },
          { label: '"That last part is a 6-month project on its own."', next: 'pushback' },
        ],
      },
      elaborate: {
        description: 'CEO: "you know like — magic. like when you open notion and it just KNOWS. that. but for us. happy hr if you nail it 🍻"',
        choices: [
          { label: '"What does success look like?"', next: 'success' },
          { label: '"Do we have data to train on?"', next: 'data' },
          { label: '"Should I talk to the data team?"', next: 'data_team' },
        ],
      },
      success: {
        description: 'CEO: "people are like \'wow\'. you know? thats success. ✨ just make it feel premium"',
        choices: [
          { label: '"OK, I\'ll prototype something"', next: 'on_it' },
          { label: '"That needs a design review."', next: 'design_review' },
        ],
      },
      data: {
        description: 'CEO: "isnt that what the data team does? talk to them theyll figure it out"',
        choices: [
          { label: '"OK"', next: 'on_it' },
          { label: '"They\'re still onboarding two new hires."', next: 'pushback' },
          { label: '"What models are we comfortable using?"', next: 'models' },
        ],
      },
      models: {
        description: 'CEO: "the good ones. whichever ones investors like. dont send anything to china lol"',
        choices: [
          { label: '"Got it"', next: 'on_it' },
          { label: '"There are real procurement questions here."', next: 'design_review' },
        ],
      },
      data_team: {
        description: 'CEO: "yeah do that. but also start prototyping in parallel. dont wait for them. momentum is everything 🏃"',
        choices: [
          { label: '"Will do"', next: 'on_it' },
          { label: '"That\'ll create rework."', next: 'pushback' },
        ],
      },
      cost: {
        description: 'CEO: "oh interesting. ok do you know what gmail charges?"',
        choices: [
          { label: '"That would be SMTP. Different problem."', next: 'pushback' },
          { label: '"...I can look into it."', next: 'on_it' },
        ],
      },
      design_review: {
        description: 'CEO: "good idea! actually lets just do it next sprint im traveling. pls keep momentum tho. 🙏"',
        choices: [
          { label: '"Will do."', effect: { capital: 1 }, log: 'You bought time with process. Maybe it\'ll get forgotten. (It won\'t.)' },
        ],
      },
      pushback: {
        description: 'CEO: "hmm. ok well lets just see what we can ship by EOQ. i was hoping for more energy here tbh."',
        choices: [
          { label: '"We\'ll find a path."', effect: { addUrgentFeature: true, debt: 4 }, log: 'A reduced version was crammed in. The CEO\'s confidence in the team has been noted somewhere.' },
          { label: '"Energy is fine. Scope is the issue."', effect: { capital: -2 }, log: 'You pushed back on the framing. The CEO went quiet. This will come up at your review.' },
          { label: '"What if we did a 2-week spike to learn?"', next: 'spike' },
        ],
      },
      spike: {
        description: 'CEO: "love a spike. but a spike that ships something. you know what i mean."',
        choices: [
          { label: '"OK"', effect: { addUrgentFeature: true, debt: 3, capital: 1 }, log: 'A "shippable spike" was negotiated. Half-feature, full-debt. CEO felt heard.' },
        ],
      },
      scope_it: {
        description: 'CEO: "im not really a process guy. just have something to demo by friday and well figure it out from there"',
        choices: [
          { label: '"Friday is in two days."', next: 'pushback' },
          { label: '"...OK"', effect: { addUrgentFeature: true, debt: 7 }, log: 'You agreed to demo something by Friday. The demo will be smoke and mirrors. The smoke and mirrors will become the roadmap.' },
        ],
      },
    },
  },
  {
    id: 'on_call', icon: Flame,
    title: 'On-call rotation: your turn',
    descriptions: [
      'Pager went off three times today. Each one is a different flavor of "the database is sad."',
      'On-call this week. PagerDuty: 5 alerts overnight. 3 were the same dashboard checking itself. 1 was a runaway query someone wrote during a hackathon. 1 was real.',
      'You\'re on rotation. The runbook hasn\'t been updated in 14 months. The first command in it returns "Permission denied." You can\'t remember who has access.',
      '12:42 AM: pager. 2:18 AM: pager. 4:05 AM: pager. 6:30 AM: alarm. The third pager was just a slow request. The first two were the database, which has Theories.',
      'On-call. Slack DM from the Singapore team: "ticket says you own this service?" You don\'t. The doc that says you do hasn\'t been updated since 2022. You\'re going to fix it anyway.',
      'On-call. The pager fires at 1:14 AM. The alert is a service that was deprecated 8 months ago. The alert routing was "going to be cleaned up next sprint." That sprint was 11 sprints ago.',
      'PagerDuty: "INCIDENT — payments-api 5xx spike." You investigate. payments-api has not been touched in 6 months. The 5xx spike is one customer\'s misbehaving cron, hammering a deprecated endpoint. The customer is the third-largest contract.',
      'On-call. The first alert this morning is a flapping disk-space alert that has been flapping for 3 weeks. Everyone has been muting it. You unmute it. You also do not fix it.',
      'On-call. You inherit a Slack channel called #incidents-active that hasn\'t had a real incident in 4 weeks. It has 47 unread messages. They\'re all bots arguing.',
      'On-call. PagerDuty fires for a service named after a Greek god you have never heard of. There is no readme. The codebase is in a language you don\'t recognize. You ask in #engineering. Three people LOL-react. Nobody knows.',
      'On-call. The runbook says "page Greg." There is no Greg. There has never been a Greg. The runbook was generated by an LLM in 2024. Half the section names are also fictional.',
      'On-call. You receive 14 pages between 11 PM and 6 AM. Three are real. Eight are duplicates of the three real ones. Three are from a CRON job that announces it\'s alive every two hours by paging the on-call.',
      'On-call. The pager fires for "metric anomaly: order-rate dropped 80%." The order rate dropped because it is 4 AM on Sunday. Nobody filed for a quiet-hours suppression. Nobody will.',
      'On-call. You receive an email from Datadog: "your bill exceeded threshold." The threshold was "$1M/month." The bill is for log lines from a single service that prints the entire request body on every request, including base64\'d images.',
      'On-call. PagerDuty fires at 4:14 AM for a service called "happiness-svc." It has not been deployed in 11 months. It is also somehow still serving 2% of production traffic. You DM the original author. They are no longer at the company. Their reply is "lol good luck."',
      'On-call. You join the war room at 3 AM. Six people are on the call. Five of them are managers. The one engineer (you) is on mute trying to read the actual logs. A manager asks "what\'s our blast radius" three times. Each time, in a slightly different way.',
    ],
    choices: [
      { label: 'Handle each as they come', effect: { focus: -3, burnout: 8 }, log: 'You ate alerts all day. No outage. Also no real work.' },
      { label: 'Triage hard — only P0', effect: { focus: -1.5, debt: 4, burnout: 4 }, log: 'You ignored some warnings. Future-you will figure it out. Future-you is also you, in two days.' },
      { label: 'Mute everything, fix the alert routing instead', effect: { focus: -2, debt: -3, burnout: 5, capital: -1 }, log: 'You spent the day fixing the noise. Two real alerts came through. Both were caught. The platform team will, in a 1:1 next sprint, gently note that you "circumvented our rotation contract."' },
    ],
  },
  {
    id: 'refactor_bumped', icon: XCircle,
    title: '"We need to deprioritize the refactor"',
    requires: (s) => s.sprintPlan.some(t => t.type === 'refactor' && !t.shipped && t.progress < t.effort),
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          { text: (s) => `Manager stops by your desk. "Quick one — ${refactorName(s)}. We need to bump it for now. Sales is asking when the feature they promised ships and we need to focus."`, requires: OFFICE },
          (s) => `Manager DMs: "hey got 5? need to talk re: priorities for this sprint." You jump on. "So — ${refactorName(s)}. Can we move it? Sales has a deal that needs the feature they promised."`,
          { text: 'Manager pulls you aside in the morning. "Look — between us — leadership saw the velocity dip last sprint. We can\'t do another sprint that\'s mostly cleanup. The refactor needs to wait. The feature sales promised can\'t."', requires: OFFICE },
          (s) => `Manager writes one of those long DMs that ends with "thoughts?" The DM's actual content is: "we need to bump ${refactorName(s)} in favor of the feature sales promised."`,
          'Manager joins your async refactor doc with a comment: "Can we discuss this 1:1?" The 1:1 was scheduled six minutes ago. The agenda, added four minutes ago, is one line: "the feature sales promised."',
        ],
        choices: [
          { label: '"...okay."', effect: { bumpRefactor: true }, log: 'The refactor was replaced with a feature. Next sprint, they said. They always say next sprint.' },
          { label: '"This one we promised three sprints ago."', next: 'three_sprints' },
          { label: '"What changed since planning?"', next: 'what_changed' },
          { label: '"Then I\'ll do it on the side."', next: 'on_the_side' },
        ],
      },
      three_sprints: {
        description: 'Manager: "I know. I get it. But the code you want to refactor isn\'t broken right now. The feature sales promised is what the deal-of-the-quarter is asking for."',
        choices: [
          { label: '"It IS broken. We have three open Sentry alerts."', next: 'sentry' },
          { label: '"What about the deal AFTER this one?"', next: 'next_deal' },
          { label: '"Fine, but I want it formally on next sprint."', next: 'formally' },
          { label: '"...OK."', effect: { bumpRefactor: true }, log: 'You folded. The deal-of-the-quarter wins. The next deal-of-the-quarter is already being scheduled.' },
        ],
      },
      sentry: {
        description: 'Manager scrolls through them. "OK these look... low severity. Could you add a workaround? Maybe a try-catch?"',
        choices: [
          { label: '"That\'s how we got here."', next: 'how_we_got_here' },
          { label: '"...fine."', effect: { bumpRefactor: true, debt: 3 }, log: 'You wrapped a thing in try-catch. The Sentry alerts went away. The bug did not.' },
        ],
      },
      next_deal: {
        description: 'Manager: "Look — there will always be a next deal. But this one is real. I need you on this."',
        choices: [
          { label: '"That\'s the entire problem with this org."', next: 'the_entire_problem' },
          { label: '"OK, but the refactor goes in next sprint, no exceptions."', next: 'formally' },
          { label: '"...fine."', effect: { bumpRefactor: true }, log: 'You agreed. Both of you knew "next deal" would also be real.' },
        ],
      },
      the_entire_problem: {
        description: 'Manager pauses. "I... yeah. I know. I do. But I can\'t fight this one. I picked my battle this quarter and it wasn\'t this."',
        choices: [
          { label: '"What battle did you pick?"', next: 'what_battle' },
          { label: '"OK. I appreciate the honesty."', effect: { bumpRefactor: true, capital: 1 }, log: 'They were honest. The refactor died anyway. You felt slightly less alone.' },
        ],
      },
      what_battle: {
        description: 'Manager looks tired. "Headcount. We\'re trying to keep two open reqs from being closed. I picked that."',
        choices: [
          { label: '"...OK. I get it."', effect: { bumpRefactor: true, capital: 2 }, log: 'You traded the refactor for context you didn\'t have. The codebase paid; you understood the org better.' },
          { label: '"The headcount won\'t matter if the codebase collapses."', next: 'collapse' },
        ],
      },
      collapse: {
        description: 'Manager: "Yeah. I know. I\'ll bring it up. But not this sprint. This sprint we ship the feature sales promised."',
        choices: [
          { label: '"Fine. But I\'m blocking time on next sprint for it."', effect: { bumpRefactor: true, capital: 1 }, log: 'You held the line on the principle and lost the battle. Net: the refactor still died.' },
        ],
      },
      what_changed: {
        description: 'Manager: "Honestly? Nothing changed. We just had the planning meeting before sales had their forecast call. So now there\'s a forecast that needs a feature."',
        choices: [
          { label: '"That\'s our process problem to fix."', next: 'process_fix' },
          { label: '"OK, but the refactor goes in next sprint, no exceptions."', next: 'formally' },
          { label: '"...fine."', effect: { bumpRefactor: true }, log: 'The process is the bug. The bug shipped to your sprint instead of the codebase.' },
        ],
      },
      process_fix: {
        description: 'Manager: "Yeah, I keep saying that. Bring it up at retro? But also we still have to ship the feature."',
        choices: [
          { label: '"OK"', effect: { bumpRefactor: true }, log: 'You folded with the assurance that you\'d "bring it up at retro." You will not.' },
          { label: '"I\'ll bring it up at retro AND I want this sprint to keep the refactor."', next: 'have_both' },
        ],
      },
      have_both: {
        description: 'Manager: "Fine. But you\'re going to have to push back on Marcus too — he\'s the one telling sales it ships this sprint."',
        choices: [
          { label: '"I\'ll handle Marcus."', effect: { capital: -2, debt: -1 }, log: 'You held the refactor. You absorbed political cost from Marcus, sales, and everyone Marcus told. Net positive: the refactor survived.' },
          { label: '"Hmm... maybe just bump it then."', effect: { bumpRefactor: true }, log: 'You backed down at the last second. Marcus won by proxy.' },
        ],
      },
      formally: {
        description: 'Manager: "I can\'t actually promise that. But I\'ll put it in the doc."',
        choices: [
          { label: '"Add me to the doc."', next: 'add_doc' },
          { label: '"That\'s not a promise."', next: 'collapse' },
          { label: '"...OK."', effect: { bumpRefactor: true }, log: 'It went in the doc. The doc is now 47 pages. The refactor is on page 31.' },
        ],
      },
      add_doc: {
        description: 'Manager: "Sure. You\'re added. Anyway — the feature?"',
        choices: [
          { label: '"OK."', effect: { bumpRefactor: true, capital: 1 }, log: 'The refactor died but you have an audit trail. That will, at minimum, feel good in retro.' },
        ],
      },
      on_the_side: {
        description: 'Manager: "Honestly? I\'d rather you didn\'t — if it breaks something we won\'t have you on the feature. Can it just wait one sprint?"',
        choices: [
          { label: '"It\'s waited four sprints already."', next: 'four_sprints' },
          { label: '"Fine."', effect: { bumpRefactor: true }, log: 'You backed off from the side-quest plan. The refactor died officially.' },
        ],
      },
      four_sprints: {
        description: 'Manager just looks at you. "Yeah. I know."',
        choices: [
          { label: 'Nothing more to say. Walk back to your desk.', effect: { bumpRefactor: true, capital: 1 }, log: 'You both knew. The refactor died anyway. Sometimes the recognition is the only win.' },
        ],
      },
      how_we_got_here: {
        description: 'Manager has the decency to look uncomfortable. "Yeah. Yeah, OK. I hear you. But I can\'t change this sprint."',
        choices: [
          { label: '"Then formally protect the refactor for next sprint."', next: 'formally' },
          { label: '"...OK."', effect: { bumpRefactor: true, capital: 1 }, log: 'They acknowledged it. The refactor died anyway. You felt heard. Briefly.' },
        ],
      },
    },
  },
  {
    id: 'dependency', icon: AlertTriangle,
    title: 'Critical CVE in a dependency',
    descriptions: [
      'Security flagged it. The patch needs updating three things you\'ve been avoiding. Or ignore and hope.',
      'A CVE-2026-XXXX dropped at 4 PM Friday. Your scanner was set to weekly. The 9 AM Monday Slack message from security has the words "high severity" in red.',
      'Snyk popped 47 new high-severity issues. Most are transitive. The fix-version doesn\'t exist yet. The library has been "unmaintained" for six months. The README still says "Contributions welcome!"',
      'A package you depend on has been deprecated. The replacement has a different API surface. The CVE is in the OLD one. The migration is "mostly trivial."',
      'Your supply-chain monitor flagged a typosquatted package was briefly published with the same name as one you use. It\'s been pulled. Your CI ran during the window when it existed. Security wants a "blameless RCA" by EOD.',
      'Security: "Critical CVE in `event-stream`." It\'s 2026. The fact that you still depend on `event-stream` is its own CVE.',
      'Security flagged a CVE in a base Docker image you haven\'t rebuilt since 2023. Rebuilding requires the build system, which has been "in transition to Bazel" for 14 months. Bazel is also flagged.',
      'A CVE in the SSO library used by everything. The patch requires a config flag your prod environment does not support. The flag was added in v8. You are on v3. v3 is unmaintained. v4 broke the API.',
      'Security: "we\'re seeing typo-squatted packages with names matching your namespace. Have you checked your lockfile?" You check the lockfile. The lockfile is 47k lines. You have not checked your lockfile.',
      'A CVE on a package the security team\'s OWN tooling depends on. The security team\'s scanner is now flagging the security team\'s scanner. The internal RCA Slack thread is 91 messages long and has descended into philosophy.',
    ],
    choices: [
      { label: 'Patch it properly', effect: { focus: -3, debt: -2, burnout: 4 }, log: 'You took the time to do it right. Slightly less debt, much less sleep tonight. Two unrelated tests broke.' },
      { label: 'Pin to old version, defer', effect: { focus: -0.5, debt: 5 }, log: 'You added "TODO: actually fix this." It will outlive you. Future-you will be a different person and still resent it.' },
      { label: 'Forge a Snyk waiver and move on', effect: { focus: -0.25, capital: -0.5, debt: 7 }, log: 'You filed a "compensating control" justification copied from another team\'s template. It was approved by an automated bot in 11 seconds.' },
    ],
  },
  {
    id: 'interview', icon: Users,
    title: 'Surprise: you\'re on an interview panel',
    descriptions: [
      'HR forgot to put it on your calendar. The candidate is already in the lobby. You skim the resume.',
      'A meeting invite from 23 minutes ago. Subject: "Loop interview — please attend." You did not get a heads-up. The candidate is already on Zoom.',
      'You\'re subbing for someone who called in sick. You haven\'t read the resume. The candidate has done the take-home. You haven\'t read that either.',
      (s, c) => `Recruiter pings: "Hey! You're in the loop for the Senior PM interview at ${T(c, 6)}! Got a question bank for you." It is ${T(c)}.`,
      (s, c) => `Interview at ${T(c)}. The candidate has already been through 4 rounds. You are the 5th round. You don't know what's left to evaluate.`,
      'You\'re on a panel for "values alignment." You don\'t know what the values are this quarter. You decide to ask the candidate questions about teamwork and pretend the answers reveal a value.',
      'You\'re interviewing a senior. They walk through their take-home with confidence. The take-home solution is, you slowly realize, copied verbatim from a Medium article you wrote two years ago.',
      'You\'re interviewing a junior. They are nervous. They are also better than you were at their level. You feel a complicated thing.',
      'You\'re a panelist. The candidate is a former coworker the recruiter did not know was a former coworker. Awkward eye contact happens for 4 minutes before either of you addresses it.',
      'You\'re interviewing for a role on a team that was reorged out of existence two days ago. Nobody told the recruiter. The candidate does not know.',
      'A "system design" interview. Recruiter brief: "ask them to design Twitter." The candidate worked at Twitter. They wrote the parts you\'re going to ask about. The interview ends 22 minutes early.',
      'You\'re interviewing the candidate who replaced someone who was laid off two weeks ago. The job description has not been updated. The candidate asks about "the team." You don\'t know what to say.',
    ],
    choices: [
      { label: 'Conduct the interview', effect: { focus: -2, burnout: 3 }, log: 'You asked the standard questions. The candidate was probably fine. The hiring committee will reject them anyway.' },
      { label: 'Wing it (you trust your gut)', effect: { focus: -1.5, capital: -0.5 }, log: 'You asked unprompted questions. The candidate was charmed. The recruiter was not — your scorecard skipped the rubric.' },
      { label: '"I have not been briefed, can we reschedule?"', effect: { focus: -0.25, capital: -1, burnout: 1 }, log: 'You bailed cleanly. The recruiter rebooked you for tomorrow at 8:30 AM. The same candidate. The same lack of briefing.' },
    ],
  },
  {
    id: 'standup_debug', icon: MessageSquare,
    title: 'Standup turns into a debug session',
    descriptions: [
      'Someone says "quick question" at the end. It is not quick.',
      'Someone screenshares mid-standup: "real quick — is this normal?" The screenshot is a stack trace. The stack trace is yours.',
      'Standup\'s last 30 seconds: "anyone good with regex?" Eight minutes later, four people are reading the same regex. Two of them have backronymed it.',
      'Someone tries to debug a flaky test on the call. Three engineers chime in with conflicting theories. The standup is now 41 minutes in. The flake is timezone-dependent. Nobody has said this out loud yet.',
      '"Wait, before we go — did anyone hit this CORS error?" You hit it. You did not say so. You are not getting roped into this.',
      'Someone screenshares VSCode. They have 47 unsaved tabs. They cannot find the file they want to show. They scroll through the tabs for two minutes. Two of them are stack traces.',
      'Someone: "real quick — does anyone know which env var actually controls auth?" Three people answer. The three answers are mutually exclusive. All three answers are also out of date.',
      'Someone shares a Datadog dashboard. The dashboard\'s queries are red. The queries are red because the dashboard owner left the company. The dashboard now reports the engineer-of-record\'s outage status.',
      { text: '"Sorry — last thing — has Production looked weird to anyone today?" Six engineers immediately mute. Two camera-off. One audibly sighs.', requires: REMOTE },
      { text: '"Sorry — last thing — has Production looked weird to anyone today?" Six engineers immediately look at their laptops. Two close them slowly. One audibly sighs.', requires: OFFICE },
    ],
    choices: [
      { label: 'Help debug live', effect: { focus: -1.5, burnout: 3, debt: -1 }, log: 'Found their typo. They thank you. Standup ran 50 minutes. The fix is one line. The Slack thread celebrating it is twelve.' },
      { label: 'Move it to a separate call', effect: { focus: -0.5, capital: -0.5 }, log: 'Standup ended on time. The separate call was scheduled. Three people were added "in case." The bug remained.' },
      { label: 'Stay muted, eat your breakfast', requires: REMOTE, effect: { focus: -0.5, capital: -0.25, burnout: 1 }, log: 'You let it ride. The bug was eventually found by the most junior engineer, who DM\'d you a question you ignored. They figured it out anyway.' },
      { label: 'Stay quiet, finish your breakfast', requires: OFFICE, effect: { focus: -0.5, capital: -0.25, burnout: 1 }, log: 'You let it ride. The bug was eventually found by the most junior engineer, who later DM\'d you a question you ignored. They figured it out anyway.' },
    ],
  },
  {
    // ----- HOLY WAR — engineering tribal warfare (vim vs emacs, tabs vs
    // spaces, IDE wars) and cross-department friction (eng vs QA / sales /
    // legal / infra / build / research). One event with a wide opener pool;
    // the choices are tribal-affiliation moves with consistent trade-offs.
    id: 'holy_war', icon: MessageSquare,
    title: 'Engineering Slack devolves into a debate',
    requires: (s) => s.sprint >= 1,
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          // ----- editor / IDE wars -----
          '#engineering-general: someone posted a screenshot of their VS Code with 47 extensions. {dev}: "you should try Cursor." {objector}: "you should try not having a 14-step setup." Three people start typing at once.',
          '#engineering-general: {dev} casually mentions they\'ve switched back to Vim. {objector}: "you switched back to vim, or you switched back to admitting it." Twenty-seven 😂 reacts. One 😢. Marcus, who uses Notepad++, says nothing.',
          '#engineering-general: {dev} posts a 14-line Emacs config and says "anyone else still on this?" {objector}: "I\'m an Emacs user. I just don\'t admit it at standup." Three more lurkers come out of the woodwork.',
          '#engineering-general: a screenshot of CLion debugging a Qt app. {dev}: "yeah but Qt Creator just works for Qt." {objector}: "no IDE just works. that\'s the deal." Eight reacts. One \'qt creator\' meme. One \'kdevelop??\' from the senior who joined in 2008.',
          '#engineering-general: someone asks "is anyone else on JetBrains? feels like the team\'s all on VS Code." Two replies — both "I switched to Cursor" — and then 14 minutes of complete silence.',
          '#engineering-general: an intern posts: "what\'s vim?" {dev}: "you\'re about to make some friends and some enemies." Marcus, instantly: "let\'s keep this in DM."',
          // ----- style wars -----
          '#engineering-general: a PR comment thread where someone changed tabs to spaces in a single file. {objector}: "this is a 200-line diff for a 1-character change." {dev}: "the 1-character change was correct." The thread is now 91 messages long.',
          '#engineering-general: {objector} posted: "we should standardize on camelCase." {dev}: "we are standardized on camelCase." {objector}: "the new file is snake_case." {dev}: "...let me check." It is. They wrote it.',
          '#engineering-general: {dev} suggested removing semicolons from the JS codebase. There are now two camps. The two camps are not on speaking terms. The lint config has been edited four times today.',
          '#engineering-general: a thread titled "Prettier or Black, but for our actual stack." It has 47 replies. None of them mention either tool. Three people are arguing about whether the question is a category error.',
          // ----- workflow wars -----
          '#engineering-general: {dev} merged with `git merge`. {objector}: "we agreed on rebase." {dev}: "we agreed on rebase for feature branches." {objector}: "this IS a feature branch." {dev}: "...is it though." They\'re both right. Neither one will yield.',
          '#engineering-general: a PR titled "switching the monorepo to a polyrepo." It is one line of YAML. The thread under it is 312 comments. Nobody has run it. Nobody is going to.',
          '#engineering-general: {objector}: "should we move to TypeScript?" Three engineers post strong opinions. Two of them used to work at the same company. They have not spoken in two years. Today they are aligned. It is unsettling.',
          '#engineering-general: {dev}: "I think we should do FP for the new module." {objector}: "you mean Haskell?" {dev}: "I mean — like — pure functions, no classes." {objector}: "that\'s every codebase you\'ve ever shipped, just with extra steps."',
          // ----- silly wars -----
          '#engineering-general: {dev} posted "JIF" in a thread about animated images. {objector}: "I will die on the GIF hill." Eight people piled in within ninety seconds. None of them are working.',
          '#engineering-general: a poll titled "dark mode or light mode for the new dashboard." 47 votes for dark. 3 for light. The 3 will be cited in the design review as "not a clear preference."',
          // ----- cross-department friction -----
          // For cross-dept openers, use department-name labels (QA, Sales,
          // Legal, etc.) for the non-engineering side instead of substituting
          // {objector} from a generic name pool — "Bob (QA)" reads as "Bob
          // who happens to be in QA" and conflicts with the cast pool.
          // {dev} stays as the engineering voice because that one matches.
          '#engineering-and-qa: QA: "the build broke production." {dev}: "the test was flaky." QA: "the test caught a real bug. that\'s its job." Marcus is reacting with 🙏 to both messages.',
          '#engineering-and-sales: Sales: "the customer asked when the SSO feature ships." {dev}: "we don\'t have an SSO feature." Sales: "the demo I gave them last week DID have one." The demo was Figma.',
          '#engineering-and-legal: Legal posts in #eng-leadership: "we cannot ship the data-flow change until I\'ve reviewed the new diagram." {dev}: "the diagram IS the change." Legal: "I will need a diagram of the diagram."',
          '#engineering-and-infra: a Slack message from infra: "your service consumed 14% of our quarterly compute budget on `setTimeout`." {dev}: "...that\'s not possible." Infra posts a flame graph. It is, in fact, possible.',
          '#engineering-and-build: Build: "your PR added 11 minutes to CI." {dev}: "the test catches a real bug." Build: "11 minutes per PR. across the org. is two engineers full time." Both are right. Nothing will change.',
          '#engineering-and-research: Research: "the model you trained doesn\'t fit our latency budget." {dev}: "the latency budget you gave us was for the OLD model." Research: "the new model IS the old model." It is not.',
          '#qa-and-product: QA: "the spec doesn\'t describe the empty state." Product: "there isn\'t an empty state — the user always has data." QA: "the user is, statistically, always new." The thread is 41 messages long.',
          '#engineering-and-product: Product: "the feature was supposed to feel premium." {dev}: "what does premium feel like?" Product: "you know — premium." This sub-thread is now an entire meeting.',
        ],
        choices: [
          { label: 'Pick a side and post the strong opinion', next: 'pick_side' },
          { label: 'Post a meme: "just write good code"', next: 'memed_take' },
          { label: 'Mute the channel', next: 'mute_channel' },
          { label: 'Stay out, screenshot, send to one trusted DM', next: 'screenshot' },
        ],
      },
      pick_side: {
        descriptions: [
          'You post your take. Three people heart it within 90 seconds. Two people sub-thread it into a slightly different argument. {objector} replies "respectfully — that\'s wrong." Now it\'s a thread about you.',
          'You post the strong opinion. The thread instantly bifurcates. Half the replies are "+1." Half are 🤔. Marcus DMs you privately: "love the energy, maybe pull the post." You will not pull the post.',
          'You post. {dev} responds with a 600-word reply, formatted as four numbered points and a footnote. The footnote cites a Hacker News comment. The Hacker News comment is from {dev}.',
        ],
        choices: [
          { label: 'Hold the line, reply once more', effect: { focus: -2, capital: -1, morale: 4, burnout: 4 }, log: 'You held. You won the argument. You did not change anyone\'s mind. You ate a lot of focus. The thread is bookmarked, by you, in a folder called "vindicated."' },
          { label: 'Walk it back: "fair, didn\'t mean to start a thing"', effect: { focus: -1, capital: 0.5, morale: -2, burnout: 3 }, log: 'You walked it back. Marcus reacted with 🙏. You felt smaller. The thread continued without you. {objector} won, technically.' },
          { label: 'Escalate: at-channel a senior engineer', effect: { focus: -2.5, capital: -1.5, morale: 2, burnout: 6 }, log: 'You pulled in {dev}, the staff engineer. They wrote a six-paragraph reply that vindicated nobody and bored everyone. The thread died of exhaustion.' },
        ],
      },
      memed_take: {
        description: 'You post a screenshot of a "just write good code" meme. Twelve people react with 💀. Three people react with 🎯. {objector}: "this is dismissive." {dev}: "this is the only correct take." The argument is now about your meme.',
        choices: [
          { label: 'Lean in: post a second meme', effect: { focus: -1, capital: 0.5, morale: 5, burnout: 2 }, log: 'You doubled down. The thread became unserious. The unseriousness defused it. Marcus added 🙏 to your meme. You bought the team an afternoon back.' },
          { label: 'Apologize: "sorry, joking, carry on"', effect: { focus: -0.5, capital: 0, morale: 1, burnout: 1 }, log: 'You apologized. The argument resumed. Two people DM\'d you "the meme was right tho." You are quietly proud.' },
        ],
      },
      mute_channel: {
        description: 'You hit Mute on the channel. The notification badge stops climbing. The thread continues without you for 47 more messages. You will, later, be asked your opinion in a 1:1, by name, by Marcus.',
        choices: [
          { label: 'Just work', effect: { focus: -0.5, burnout: -1, morale: 1 }, log: 'You bought back an hour and your sanity. Marcus will follow up in a 1:1, gently, with the words "I noticed you weren\'t in that thread."' },
        ],
      },
      screenshot: {
        description: 'You screenshot the worst three messages and DM them to {dev} (your trusted one). Their reply is "lmao." Then "wait — is this the same thread as last quarter?" It is.',
        choices: [
          { label: 'Trade memes for 4 minutes, get back to work', effect: { focus: -0.5, capital: 0, morale: 4, burnout: -1 }, log: 'A small private rebellion. You felt human for four minutes. The channel is still on fire. You are not in it.' },
        ],
      },
    },
  },
  {
    id: 'compliance', icon: Briefcase,
    title: 'Compliance training due today',
    // Compliance trainings are annual + ad-hoc — fire on odd sprints.
    requires: (s) => s.sprint % 2 === 1,
    descriptions: [
      'A 47-minute video about phishing. There will be a quiz. Skipping is not an option. The quiz auto-fails if it detects a second tab. The training itself opens in a second tab.',
      'Mandatory: "Information Security Awareness 2026." A 38-slide deck with stock footage of laptops. The narrator pronounces SQL as "sequel" half the time and "S-Q-L" the other half. Twice he says "squirrel."',
      '"Anti-Bribery & Corruption" — a 22-minute course featuring a fake roleplay between two actors who are very clearly looking off-camera at the script. The bribe in the roleplay is a single muffin.',
      'Your annual "Privileged Access Awareness" training. The pass rate is 100%. The fail state does not exist. The training still takes 49 minutes. The "you may proceed" button is greyed out for the full duration.',
      'Compliance: "Data Handling for Modern Workplaces." Includes a section on USB drives. Your laptop has not had a USB-A port in four years. There is also a section on faxing.',
      'Mandatory: "GDPR for Engineers (Refreshed for 2026)." It begins: "Imagine your data was a person." Slide 14 is a stock image of a worried person hugging a hard drive.',
      '"Secure Coding 101" — narrated by a friendly cartoon shield named SHIELDY. SHIELDY has a sidekick: a squirrel named CACHE. CACHE has lines. CACHE\'s lines are about XSS.',
      'Mandatory: "Conflict Minerals Awareness." Your laptop\'s sourcing is not in scope. The course is 38 minutes. Slide 22 is a flowchart that arrows back into itself.',
      '"AI Tools at Work" — a new compliance training rolled out yesterday. It begins: "We embrace AI." It ends: "Do not, under any circumstance, use AI." The middle 41 minutes are unclear.',
      '"Workplace Communication Standards" — featuring a section on how to disagree "in a way that is psychologically safe." Slide 19 includes a sample script for "naming a microaggression at standup." {dev} has used this script. {dev} got DM\'d about tone afterwards.',
    ],
    choices: [
      { label: 'Watch on 2x in another tab', effect: { focus: -0.5, burnout: 3 }, log: 'Got 8/10 on the quiz. The two you missed were trick questions. The quiz says "good enough."' },
      { label: 'Actually watch it (you have a renewal coming up)', effect: { focus: -1, burnout: 5 }, log: 'You watched it at 1x. You learned three things you already knew. You aced the quiz. The certificate will be emailed to you in 3-5 business days.' },
      { label: 'Mark it complete and lie', effect: { focus: -0.1, capital: -0.5, burnout: 1 }, log: 'You clicked through. Compliance dashboards are now satisfied. Your soul slightly less so.' },
    ],
  },
  {
    id: 'new_hire', icon: Users,
    title: 'New hire onboarding (you\'re the buddy)',
    descriptions: [
      'They have many questions. The codebase is a jungle. You remember what it was like.',
      'New hire is on their second day. They DM: "is it normal that I have access to 47 Slack channels but no Git access?" Yes.',
      'Your buddy assignment: a junior engineer who joined Monday. Today is Wednesday. They have not been able to push a commit yet because of "an SSO thing."',
      'A new hire pings you: "I tried to read the codebase but I can\'t find where things are. Is there a map?" There is no map. There used to be a Notion page. The Notion page 404s.',
      'New hire onboarding. They\'re sharp. They asked one question that broke your brain. You\'re going to think about it on the drive home.',
      'New hire DM: "I cloned the repo. README says to run `make bootstrap`. There is no `make bootstrap`. There is no Makefile. There is a Justfile, but `just bootstrap` errors. Where do I look?"',
      'New hire DM: "I noticed the production database password is in the seed-data fixture. Is that on purpose?" It is not on purpose. It has been like that for two years. Nobody told them not to grep.',
      'New hire DM: "the onboarding doc says to email Greg about access. Is Greg a person or a role?" Greg is also not a person.',
      'A new hire pings you their first day: "what does \'velocity\' actually mean here?" You have been at this company three years. You hesitate. You eventually answer: "it depends."',
      'New hire is in week 3. They send you their first PR. It is small, careful, and well-commented. The CI fails for unrelated reasons. They blame themselves. You spend 20 minutes convincing them it isn\'t their fault.',
      'New hire DM: "the team\'s coding-style doc references \'Marcus\\\'s preferred linter rules.\' Where is that documented?" It isn\'t. It\'s in Marcus\'s head. Marcus has been here 4 months.',
    ],
    choices: [
      { label: 'Be a good mentor', effect: { focus: -2, burnout: -1, morale: 5 }, log: 'They\'re less lost. The codebase remains a jungle. Helping someone felt unexpectedly OK. They thanked you with a 🌟 emoji you will keep thinking about.' },
      { label: 'Pair on it for an hour', effect: { focus: -1.5, burnout: 0, morale: 6, debt: -1 }, log: 'You paired. They learned three things. You spotted a real bug while explaining a part of the code you wrote two years ago. Both of you came out lighter.' },
      { label: 'Send the (outdated) docs', effect: { focus: -0.5, capital: -1, debt: 1, burnout: 2 }, log: 'They figured it out eventually. The docs are even more outdated now. They will, in their first 1:1, mention you "weren\'t super available" — gently.' },
    ],
  },
  // ===== CORPORATE THEATER =====
  {
    id: 'ethics_email', icon: Heart,
    title: 'Email: "Our commitment to ethics & impact"',
    descriptions: [
      '12-paragraph all-staff email from the CEO about how the company is "doing the right thing" and "making a real difference." Three pages of vague aspirations. The company is currently being sued.',
      'Subject: "A note on integrity from your leadership team." It is co-signed by 11 VPs. The body is 1,800 words. It does not mention the recent FTC inquiry.',
      'CEO email: "Standing firm on what matters." It mentions "values" 14 times. It does not mention the contract with the immigration enforcement agency.',
      'All-staff: "Reaffirming our principles." Three execs took turns writing paragraphs. The styles do not match. One paragraph contains the phrase "world-positive impact."',
      'A 9-paragraph "Town Hall Recap" from Comms. The actual town-hall was about three layoff waves. The recap leads with the Volunteer Day photos.',
      'Email: "On Recent Events." It does not specify which recent events. There have been five categories of recent events. The email\'s sign-off is "Onward — together."',
      'Subject: "An update on responsible AI." Body: "We continue to be thoughtful about AI, while also moving fast." The contradiction is the body.',
      'Email: "A message from the Board." Co-signed by all seven board members. Their names are arranged in a 2-3-2 visual hierarchy. The hierarchy is the message.',
      'Subject: "Reflecting on the moment." 11 paragraphs. The "moment" is, as far as you can tell, the lawsuit, the resignation, the layoffs, AND the FTC. Or possibly the new product. Hard to say.',
      'Email: "On values, with humility." It is from the CEO. He is not, in this email, humble. He is "humbled." There is a difference. You cannot articulate it but you can feel it.',
    ],
    choices: [
      { label: 'Skim for keywords', effect: { focus: -0.5, burnout: 2 }, log: 'You skimmed. There will be a quiz next quarter, probably.' },
      { label: 'Read every word ironically', effect: { focus: -1, burnout: 4, morale: -2 }, log: 'You read it. You are now sadder than before. The phrase "we hear you" appeared four times.' },
      { label: 'Mark unread, archive, move on', effect: { focus: -0.1 }, log: 'You filed it under "Corporate." The folder has 312 unread items. The folder is, in fairness, working.' },
    ],
  },
  {
    id: 'town_hall', icon: Megaphone,
    title: 'Quarterly town hall with the CEO',
    // Skip sprint 1 (which opens with all-hands), then fire on even sprints.
    requires: (s) => s.sprint > 1 && s.sprint % 2 === 0,
    descriptions: [
      'PowerPoint with a hockey-stick chart. "We\'re disrupting the industry." A slide that says "OUR CUSTOMERS LOVE US" with no data. Q&A is pre-screened.',
      'Town hall. Slide 1: a slogan. Slide 2: a hockey-stick chart with no axis labels. Slide 14: "QUESTIONS?" Q&A is exclusively from a Slido that\'s been heavily moderated.',
      'CEO is on stage in front of a "WE WIN TOGETHER" backdrop. He says "look — I\'m going to be candid with you." He is not.',
      'Town hall format change: now it\'s a "fireside chat" with the CEO and a VP "interviewing each other." It is rehearsed. It is bad. The fire is a YouTube video on a TV.',
      'Quarterly town hall. The CEO opens by acknowledging "the difficult moment" without specifying which difficult moment. There have been three.',
      'Town hall held entirely in a metaverse-style "spatial audio" room. Half the company can\'t hear. The other half can\'t see. The recording afterwards has neither audio nor video.',
      'Town hall. The CEO has been "doing a lot of reading" and now opens with a quote attributed to Steve Jobs. The quote is not from Steve Jobs. The quote is from a fortune cookie. He sourced it from LinkedIn.',
      'Town hall titled "Real Talk." First slide: "I\'m going to take off the CEO hat." Last slide: "Putting the CEO hat back on." Nothing in between was real talk.',
      'Town hall. The CEO has a new haircut and is "reintroducing himself" with a 9-slide personal mission statement. Slide 4 is a photo of him at age 11 holding a Game Boy. Slide 7 is just the word "BUILD." Slide 9 is the word "BUILD" again, in a different font.',
      'Town hall. The new theme is "FROM ZERO TO ONE." The CEO holds up the book. He has a printed quote on the slide. He misattributes the quote to himself.',
      'Town hall. The CEO opens with the words "I want to address the rumor head-on" and then does not say which rumor. There are seven candidates. He addresses none of them.',
      'Town hall. Today\'s format: "Ask Me Anything." There is a Slido. The Slido is moderated by a third-party PR firm. The first question approved is "What\'s your favorite book?" submitted by HR.',
      'Town hall. The CEO is presenting from a Lake Como rental. The Wi-Fi is bad. He says "the future is hybrid" while a houseboat passes behind him.',
      'Town hall. The CEO opens with: "I want to admit I made a mistake last quarter." The mistake, it transpires, is that he "didn\'t push us hard enough." The room makes a sound that is not laughter.',
      'Town hall. New visual identity. Every slide now has a small AI-generated mascot — a friendly raccoon — in the corner. The raccoon is named "RAY." RAY has a backstory.',
      'Town hall. The CEO has invited an external "futurist" who closes with: "the next decade will reward the bold and punish the slow." The futurist also wrote The Whisper Method, available in the lobby.',
      'Town hall. The CEO has prepared a slide titled "STATE OF THE COMPANY" with three colored quadrants. Two of them say "STRONG." The third says "EVOLVING." Nothing on the slide is what evolving means.',
      'Town hall. The CEO opens with a personal story about a flight he took yesterday. The flight is not a metaphor for anything. He just wants to share it. The story takes 8 minutes.',
      'Town hall. There is a guest panel of three "founder-friends" who collectively run companies in three different categories. They give advice. The advice contradicts itself. The CEO nods at all of it.',
      'Town hall. The CEO has banned the word "but" from leadership communications, effective today. He explains this for 11 minutes, in which he says "but" four times and corrects himself three.',
      'Town hall. New segment: "Q&A with the C-suite." The Q is from the C-suite. The A is also from the C-suite. The audience watches.',
      'Town hall. A surprise interpretive dance routine performed by the People Team to the company values. The CFO leaves the room mid-routine and is described as "pulled into something" afterward.',
    ],
    choices: [
      { label: 'Attend (camera off)', requires: REMOTE, effect: { focus: -1.5, burnout: 5 }, log: 'You learned the company is doing both "incredibly well" and "facing headwinds." The slide had both arrows.' },
      { label: 'Sit in the back, laptop half-open', requires: OFFICE, effect: { focus: -1.5, burnout: 5 }, log: 'You learned the company is doing both "incredibly well" and "facing headwinds." The slide had both arrows.' },
      { label: 'Camera on, nod earnestly, let the calendar reclaim it', requires: REMOTE, effect: { focus: -1.5, capital: 0.5, burnout: 6 }, log: 'You performed engagement. The CEO referenced "energy in the room" twice. Yours was the energy he meant. You feel briefly seen and lastingly used.' },
      { label: 'Front row, nod earnestly, let the calendar reclaim it', requires: OFFICE, effect: { focus: -1.5, capital: 0.5, burnout: 6 }, log: 'You performed engagement from the second row. The CEO referenced "energy in the room" twice. Yours was the energy he meant. You feel briefly seen and lastingly used.' },
    ],
  },
  {
    id: 'volunteer_day', icon: Heart,
    title: 'Optional Volunteer Day (participation tracked)',
    // Real-world cadence: once or twice a year. In a 10-sprint game, fire at most twice.
    requires: (s) => s.sprint >= 3 && s.sprint % 5 === 0,
    descriptions: [
      '"Give back to the community" by sorting cans for 4 hours. Attendance is optional but the photos will appear in a deck.',
      '"Optional" Volunteer Day. The activity is painting a community center. The center has been painted four times by four different companies this year. The photos will go in the impact report.',
      'Volunteer Day at a local school. You\'re assigned to "help the kids with reading." HR has not done a background check. You will, somehow, be on company photo backdrops.',
      'Volunteer Day: park cleanup. The park is fine. Your t-shirt has the company logo on it. Someone is filming for a recruiting video.',
      'Volunteer Day at the food bank. The food bank told the company they\'re fully staffed already. The company sent everyone anyway.',
    ],
    choices: [
      { label: 'Attend with a smile', effect: { focus: -4, burnout: 5 }, log: 'You volunteered for four hours. There were photos. You were in three of them. Your t-shirt was tucked in for one of them.' },
      { label: 'Show up for the photo, leave during the lunch', effect: { focus: -1.5, capital: -0.5, burnout: 2 }, log: 'You stayed for the photo and the company-branded sandwich. You were back at your desk by 1:15. The photo is uncropped on the careers page.' },
      { label: 'Skip — you have actual work', effect: { capital: -1, burnout: 1, morale: -2 }, log: 'Your "low engagement score" was noted somewhere. The next engagement-survey deck will reference it indirectly.' },
    ],
  },
  {
    id: 'values_refresh', icon: Sparkles,
    title: 'Mandatory: Q3 Values Refresh',
    // Fires on sprints divisible by 3, after the first two settle in.
    requires: (s) => s.sprint > 2 && s.sprint % 3 === 0,
    descriptions: [
      '90-minute training where you learn the company\'s values are now: Bold. Customer-Obsessed. Frugal. Bias for Action. (Last quarter: Innovate. Empower. Trust. Excellence.)',
      'A consultant walks you through the new values. They are: "Move Fast." "Operate with Heart." "Tell the Truth." (Last quarter: Innovate, Empower, Trust, Excellence. The quarter before: Velocity, Boldness, Curiosity, Drive.)',
      'Training subject: "Living Our Refreshed Values." The values are illustrated with stock photos. One slide has a smiling person at a whiteboard with no marker.',
      'Values Refresh — Q3 edition. The CHRO opens with: "These are not new values. They\'re a clearer articulation of who we\'ve always been." Three of them are new.',
      'The new values are presented in a "values journey" workshop. The exercise is: "Tell us a time you embodied OWNERSHIP." Brad has a story about Stefan.',
    ],
    choices: [
      { label: 'Sit through it', effect: { focus: -1.5, burnout: 6 }, log: 'You learned that "Bold" means saying yes to scope creep.' },
    ],
  },
  {
    id: 'engagement_survey', icon: MessageSquare,
    title: 'Anonymous engagement survey',
    // "Quarterly pulse" — every 3 sprints, off-cycle from the town hall.
    requires: (s) => s.sprint >= 2 && s.sprint % 3 === 2,
    descriptions: [
      'Strictly anonymous. Please log in with SSO to participate. Last quarter\'s low scores led to "action items" that have not occurred.',
      'Engagement survey. 47 questions. The phrase "this company\'s leadership has my best interests at heart" is one of them. Strongly Agree / Agree / Neutral / Disagree / Strongly Disagree.',
      'Quarterly pulse survey. "How likely are you to recommend us as an employer to a friend?" appears three times in slightly different wording. The wording converges, slightly, toward "yes."',
      'Survey: "Engagement & Belonging Pulse." Anonymous. Tracks IP addresses, login timestamp, and team. The aggregate results will be "concerning but stable."',
      'A 4-minute "Sentiment Check" from the People Team. It contains a free-text box. The free-text box is anonymous "but reviewed by HR for safety."',
      'Survey from the People Team: "Tell us how you really feel." Question 1: "Rate your manager." Question 2: "Are you sure?"',
      'New format: a single-question pulse survey, sent every Monday. The question is: "How energized are you, on a scale of 1-10?" Last week, you put 3. This week, your manager mentioned in your 1:1 that "energy levels are something to think about."',
      '"Engagement & Inclusion Compass." 71 questions. Optional free-text. The form\'s URL is on a domain you do not recognize. The footer says "powered by CulturePulse™." CulturePulse™ has had two breaches.',
      'Survey: "Quarterly Connect." It opens with: "Your voice matters." It then requires you to log in via SSO, identify your team, and select your "tenure cohort" before any anonymous responses begin.',
      'Anonymous survey distributed via Slack. The Slack message says: "click here to take the anonymous survey." The link includes your Slack user-ID as a query param.',
    ],
    choices: [
      { label: 'Fill it out honestly', effect: { focus: -0.5, burnout: 2, morale: -1 }, log: 'You said the truth. Aggregate results will say "moderate satisfaction." Your team\'s aggregate will be flagged for "leader development."' },
      { label: 'Just answer all 5s', effect: { focus: -0.25, burnout: 1 }, log: 'You picked the safe answers. Total time: 4 minutes. The survey thanks you "for your trust."' },
      { label: 'Fill it with strategic ambiguity (mostly 4s)', effect: { focus: -0.5, capital: 0.5, burnout: 2 }, log: 'You picked the answers that say "I am not happy but I am not the problem." A safe craft. The People Team will mark you "engaged but at-risk."' },
      { label: 'Skip it entirely', effect: { capital: -0.5, burnout: 0, morale: 1 }, log: 'You ignored the survey. Three reminder emails followed. The fourth was from your manager, with the subject "🙏".' },
    ],
  },
  {
    id: 'impact_email', icon: Sparkles,
    title: 'Email: "The impact YOU made this quarter"',
    // Quarterly impact emails go quarterly.
    requires: (s) => s.sprint > 1 && s.sprint % 3 === 1,
    descriptions: [
      'A long email celebrating the team\'s achievements. Three of the listed wins were not actually shipped. One was a different team\'s.',
      'A "Q3 Wins!" email from Marketing. It includes a metric you\'ve never heard of. Your team is mentioned. The mention is wrong about what you shipped.',
      'CEO email: "What we accomplished together." A bulleted list of 14 items. Two of the items were the same item, written differently. None mention the layoffs.',
      'A People Team newsletter celebrating "Q3 by the numbers!" The numbers are fine. They are not contextualized.',
      'A Slack post in #general from the CEO: "🚀 What. A. Quarter." Eleven 🔥 reacts. Three of them are from people who were laid off two weeks ago.',
      'A "Hall of Fame" Slack post. You are in it. The blurb is wrong about which feature shipped, which customer it was for, and the spelling of your name.',
      'Email subject: "We did it!" Body: a single embedded image, 3MB. The image, when expanded, is a stock photo of confetti with the company logo poorly composited in. There is no text.',
      '"Our most-read internal blog posts of Q3!" Three of the four were written by the CEO. The fourth was a sympathetic post about layoffs, posted by an engineer. That engineer is no longer at the company.',
      'Email: "Quarter in Review — auto-generated by our new internal AI." It lists "your" achievements. None of them are yours. One of them is the dishwasher being repaired.',
      'A "spotlight" email from Comms naming "engineers who went above and beyond." You are not in it. Marcus is. Marcus did not write code this quarter. Marcus knows this.',
    ],
    choices: [
      { label: 'Forward it to your parents', effect: { focus: -0.25, burnout: 1, morale: 1 }, log: 'They are proud. They do not know what you do. Your dad shows it to a neighbor.' },
      { label: 'Reply-all with the actual numbers', effect: { focus: -0.5, capital: -2, burnout: 2, morale: 3 }, log: 'You replied with the real velocity, the real RIF count, and the unshipped projects. The thread was muted by Comms 4 minutes later. Three engineers DM\'d you "thank you."' },
      { label: 'Archive without reading', effect: { focus: -0.05 }, log: 'You did not engage. The quarter is over. The next quarter is also over.' },
    ],
  },
  {
    id: 'inclusion_workshop', icon: Sparkles,
    title: 'Mandatory: "Inclusion Through Action" workshop',
    // Off-cycle from values refresh: fires when sprint % 3 === 1, from sprint 4 on.
    requires: (s) => s.sprint >= 4 && s.sprint % 3 === 1,
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          'A $40k external consultant named Skylar opens with: "Before we begin — let\'s ground ourselves. Take three breaths. Now turn to the person next to you and share a time you felt seen."\n\nThe person next to you is Brad. The slide deck is 94 slides. The company laid off the only Black engineer last quarter and has zero women above L6.',
          'A consultant named Skylar opens the workshop with a 4-minute video featuring stock footage of diverse people laughing in offices. None of them are anyone you know. The hashtag at the end is #BelongingWorks.',
          'Skylar (consultant, $35k for 90 minutes) presents slide 1: "BELONGING IS A VERB." The slide does not explain what that means. She invites everyone to "really sit with that." You sit.',
          'A "DEIB Activation Workshop" facilitated by Skylar opens with: "Today is going to be uncomfortable. That\'s the work." She is wearing a "DO THE WORK" pin. The pin is for sale on her website.',
          'Skylar opens the workshop with: "Let\'s normalize naming microaggressions." She does not name any. The room nods. The room contains the person who, last quarter, said "I don\'t see color" in an all-hands.',
        ],
        choices: [
          { label: 'Turn to Brad and try', next: 'brad_share' },
          { label: '"I\'d rather not."', next: 'rather_not' },
          { label: 'Stare at your laptop', next: 'laptop' },
          { label: '"Is this what we\'re paying $40k for?"', next: 'paying' },
        ],
      },
      brad_share: {
        description: 'Brad: "OK so — when I won the regional pickleball tournament in Ojai, the energy was — like, I FELT seen, you know? Stefan literally said \'I see you.\' Anyway your turn."',
        choices: [
          { label: 'Just say something safe', effect: { focus: -1.5, burnout: 6 }, log: 'You shared a story you don\'t actually feel. Skylar said "thank you for your vulnerability." Brad nodded sagely.' },
          { label: '"This is the third time we\'ve done this exercise this year."', next: 'third_time' },
        ],
      },
      rather_not: {
        description: 'Skylar: "That\'s totally OK! No pressure. Just maybe write down what you would have said? In the workbook? You can email it to me?"',
        choices: [
          { label: '"I\'ll think about it."', effect: { focus: -1, burnout: 4 }, log: 'You opted out softly. Skylar circled back to you twice during the workshop.' },
          { label: '"Why is this a workshop and not actual policy change?"', next: 'policy' },
        ],
      },
      laptop: {
        description: 'Skylar, gently: "I see some of us are on screens. Let\'s practice presence together. Close the lid for me?"',
        choices: [
          { label: 'Close the lid', effect: { focus: -2, burnout: 7 }, log: 'You complied. The workshop continued. Q3 deadlines did not.' },
          { label: '"I\'m on call."', effect: { focus: -1, capital: -1, burnout: 3 }, log: 'A defensible lie. Skylar moved on. Two slides later they were doing breakouts about systemic bias.' },
        ],
      },
      paying: {
        description: 'Skylar smiles tightly. "I hear you, and I want to honor that frustration. Can we hold space for it and come back to it during the parking lot at the end?"\n\nThe parking lot at the end will be skipped due to "running over."',
        choices: [
          { label: '"Sure."', effect: { focus: -1, burnout: 5 }, log: 'You let it go. The parking lot was skipped. Skylar\'s invoice was paid.' },
          { label: '"Where in the budget did $40k come from while we\'re on a hiring freeze?"', next: 'budget' },
        ],
      },
      third_time: {
        description: 'Skylar: "And every time it\'s an opportunity to deepen! Research shows that repeated exposure to allyship frameworks—" Brad is back on his phone.',
        choices: [
          { label: 'Let it go', effect: { focus: -1.5, burnout: 5 }, log: 'You let it go. The slides advanced. The research was a single LinkedIn post.' },
          { label: '"What measurable change happened after the previous two?"', next: 'measurable' },
        ],
      },
      policy: {
        description: 'Skylar: "Mmm — that\'s a great question, and what I want to invite is: change starts with US. With our PRACTICES. Policy is downstream."',
        choices: [
          { label: 'Stop pushing', effect: { focus: -1, burnout: 4 }, log: 'You stopped. Skylar said "I appreciate you" four times. Nothing changed.' },
          { label: '"Is it though?"', next: 'is_it' },
        ],
      },
      budget: {
        description: 'Skylar: "I — that\'s really a question for HR. But I will say investing in culture IS investing in business outcomes." HR is not in the room. HR is on the other floor, in their own workshop.',
        choices: [
          { label: '"OK."', effect: { focus: -0.5, capital: -1, burnout: 5 }, log: 'You stopped asking. The CFO\'s hiring-freeze memo went out the same afternoon.' },
        ],
      },
      measurable: {
        description: 'Skylar: "Culture change is non-linear. It\'s — it\'s a journey, not a destination." The slide behind them says "JOURNEY, NOT DESTINATION" in 60-point font.',
        choices: [
          { label: 'Nod and disengage', effect: { focus: -1.5, burnout: 6 }, log: 'You nodded. The journey continued. Aggregate satisfaction will dip 3% next quarter, then they\'ll do another workshop.' },
        ],
      },
      is_it: {
        description: 'Skylar pauses. "OK — I\'m going to be real with you. I was hired by your CHRO who used to be at my last engagement. I get paid whether anything changes. I\'m not going to lie to you."\n\nThe room goes quiet. Skylar looks at the floor. Brad looks up from his phone.',
        choices: [
          { label: '"...thank you for saying that."', effect: { focus: -0.5, capital: 1, burnout: 2 }, log: 'A real moment in a fake workshop. Skylar finished the slides on autopilot. You will remember this exchange. The company will not.' },
        ],
      },
    },
  },
  // ===== SCRUM CEREMONIES (DONE WRONG) =====
  {
    id: 'backlog_refinement', icon: MessageSquare,
    title: 'Backlog refinement (90 minutes scheduled)',
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          // ----- vanilla disaster openers -----
          'Marcus: "Quick refinement! 14 tickets to size, should be done in 30 minutes." It is hour 1 of 1.5. You are on ticket 2. {facilitator} is arguing the first ticket up to an 8 because "we need to be honest about complexity."',
          'Marcus shares his screen — 27 tickets, all unsized. "We\'ve got 30 minutes. Let\'s try to get through as many as we can." {facilitator} is already typing in chat: "before we start, can we align on what a story point even means?"',
          'Marcus shares the backlog. The backlog has 312 tickets. Marcus: "Today we\'re going to be aggressive — let\'s try to refine the entire thing." Six people audibly inhale. He means it.',
          'Refinement starts with Marcus: "I\'ve pre-sized these to save us time." {objector}: "Wait, who set those numbers?" Marcus: "I did, last night, alone, in a Notion doc, on my phone." {objector}: "...we should probably re-vote then."',
          'Refinement. The first ticket on the list is "AS A USER I WANT THE THING TO BE BETTER." Marcus: "OK so — how should we size this?" {objector}: "...what\'s the acceptance criteria?" Marcus, brightly: "TBD!"',
          'Refinement. The first ticket: "Make the export feature good." Description: "User feedback indicates room for improvement." Acceptance criteria: "User feedback indicates the feature has been improved." {objector} pinches the bridge of his nose.',
          // ----- leadership-watching openers (the REAL irony — refinement as performance) -----
          'Refinement. Marcus: "Heads up — leadership is auditing our story points this quarter. So please be intentional about your votes." Six engineers visibly understand they\'re being asked to vote lower.',
          'Refinement. Marcus: "Real quick — leadership wants us to track velocity per IC now. So please vote based on YOUR effort, not the team\'s." Three people read this twice. Two of them DM the third. The third is you.',
          'Refinement. Marcus: "small heads-up — the new VP wants velocity to look \'aspirational but credible\' this quarter. So if a ticket feels like a 5, maybe try sitting with whether it could be a 3."',
          'Refinement. Marcus shares his screen. Visible in his open Notion: a tab called "VELOCITY MASSAGE — DO NOT SHARE." He realizes 4 seconds late. He minimizes it. Nobody mentions it.',
          // ----- methodology drift openers -----
          'Marcus opens refinement with: "Quick reminder of how Planning Poker works." This is his fourth time giving the reminder this quarter. {objector} starts typing a comment in the doc.',
          'Refinement. Marcus has migrated the team from Jira to Linear to ClickUp this quarter. The current backlog exists in all three. None of them agree on which tickets are real.',
          { text: 'Refinement. Marcus has introduced a new "story point philosophy" he read about on LinkedIn. Story points are now "in days." But not really. They\'re "vibe days." Sprint capacity is now in vibe-days. {objector} hasn\'t turned his camera on.', requires: REMOTE },
          { text: 'Refinement. Marcus has introduced a new "story point philosophy" he read about on LinkedIn. Story points are now "in days." But not really. They\'re "vibe days." Sprint capacity is now in vibe-days. {objector} is staring at the ceiling and refusing to vote.', requires: OFFICE },
          'Refinement. Marcus: "I\'ve been reading Reinertsen and I think we should switch to T-shirt sizes." S/M/L/XL. Then immediately: "and S is roughly a 3." It is exactly the same system, with extra steps.',
          'Refinement. Marcus has read about #NoEstimates and is "experimenting" with sizing tickets in count-only. {facilitator}: "so a 3-month epic and a 5-minute typo are the same?" Marcus: "trust the average."',
          // ----- AI/automation openers (max irony) -----
          { text: 'Refinement. Marcus has invited an "AI scoping co-pilot" to size tickets. The AI is sizing every ticket as a 3. Marcus: "Wow it\'s really decisive!" {objector} mutes himself.', requires: REMOTE },
          { text: 'Refinement. Marcus has invited an "AI scoping co-pilot" to size tickets. The AI is sizing every ticket as a 3. Marcus: "Wow it\'s really decisive!" {objector} closes his laptop, slowly and pointedly.', requires: OFFICE },
          'Refinement. Marcus has piloted Cursor-for-PMs. It auto-writes ticket descriptions from his Slack history. The current ticket\'s description begins: "Hey real quick can we just" and ends mid-sentence.',
          'Refinement. Marcus, beaming: "good news — I had Claude rewrite all our acceptance criteria last night." The first one reads: "I cannot help with that — let me know how I can be useful." Marcus: "yeah we\'ll workshop those."',
          // ----- pre-committed work openers -----
          'Refinement. {facilitator} is presenting tickets they wrote yesterday. The titles are 2 words long. The descriptions are blank. The acceptance criteria say "see Slack." {facilitator} is asking for tight estimates.',
          'Refinement. Marcus: "small thing — Priya from sales told a customer two of these would ship this sprint. So they\'re kind of already committed. We\'re sizing for visibility." It is not for visibility.',
          'Refinement. The top ticket is titled "[from CEO Slack — 2:14 AM]." It has no description. It has a deadline of "this sprint." Marcus: "let\'s call it a 5 to be safe."',
          'Refinement. Marcus opens with: "two of these are already in flight — Priya needed them for a deal — so we\'re really just back-filling the points." {objector}: "...we\'re sizing work that\'s done?" Marcus: "for the dashboard."',
        ],
        choices: [
          { label: 'Engage on the next ticket', next: 'engage' },
          { label: 'Push back on the format itself', next: 'format_pushback' },
          { label: 'Stay on mute, camera off', next: 'mute', requires: REMOTE },
          { label: 'Sit in the back, head down on your laptop', next: 'mute', requires: OFFICE },
          { label: 'Multitask through it', effect: { focus: -2, burnout: 4 }, log: 'You answered Slack messages with the meeting on. Three tickets got sized while you weren\'t listening. You may or may not inherit one of them depending on who\'s asleep less than you.' },
        ],
      },
      // Engage on a single ticket. Node text is intentionally generic so it
      // reads coherently after any of the openers (the AI-cursor one, the
      // leadership-audit one, the pre-committed one, etc.) — the specific
      // pathology of the sprint is in the opener; this node is the *attempt*
      // to size something inside that pathology.
      engage: {
        descriptions: [
          'Marcus moves to the next ticket. The title is two words. The description is empty. {facilitator}: "I think it\'s an 8." {objector}: "It\'s a 1." {facilitator}: "Have you SEEN the styling layer?" Twelve minutes pass.',
          'Marcus moves on. The next ticket\'s acceptance criteria is the literal string "see Slack." {facilitator}: "5." {objector}: "Where\'s the slack thread?" Marcus: "I\'ll find it after the meeting."',
          'Marcus opens the next ticket. {objector}: "wait — is this the same as REF-9847?" Marcus: "...maybe. Let\'s size it as if it\'s not."',
          'Marcus moves on. {facilitator}: "Quick clarifying question — is this front-end or full-stack?" Marcus: "Yes."',
        ],
        choices: [
          { label: '"Call it a 3 and move on."', next: 'compromise' },
          { label: '"What is the acceptance criteria?"', next: 'scope' },
          { label: '"I\'ll spike it for two hours — then we\'ll know."', next: 'spike' },
          { label: 'Stay quiet, regret engaging', next: 'mute' },
        ],
      },
      // ----- format pushback: the big new branch that addresses what the
      // descriptions actually flagged (leadership audit, pre-committed work,
      // AI sizing, vibes-day-philosophy, etc). Player gets to challenge the
      // FRAMING instead of fighting one ticket at a time.
      format_pushback: {
        description: 'You unmute. "Marcus — what are we sizing FOR? Honestly. If this is a velocity readout for leadership, that\'s a different conversation than capacity planning. If it\'s already-promised work, that\'s a third one."\n\nThe room goes briefly quiet. Two other engineers turn their cameras on for the first time.',
        choices: [
          { label: '"Be straight with us about which one it is."', next: 'format_admit' },
          { label: '"Are these already pre-committed?"', next: 'format_committed' },
          { label: '"Is leadership grading us on these numbers?"', next: 'format_audit' },
          { label: 'Lose your nerve, mute again', next: 'mute' },
        ],
      },
      format_admit: {
        description: 'Marcus, slowly: "Yeah. Honestly? Leadership wants the velocity number to look credible. I\'ve been managing the room toward it. I\'m sorry. Let\'s actually size for capacity."\n\nA real moment. {facilitator} reacts with 🙏. {objector} reacts with 🤝. The chat is silent.',
        choices: [
          { label: '"OK. Let\'s do this properly."', effect: { focus: -1, capital: 1.5, morale: 6, burnout: 1 }, log: 'A rare clean win. Two tickets got actually-sized. The velocity readout will be off this quarter. Marcus is not sure he can hold the line, but he holds it for today.' },
          { label: 'Drive the rest of the meeting yourself', effect: { focus: -1.5, capital: 2, morale: 5, burnout: 3 }, log: 'You took the gavel. The rest of refinement was crisp. Marcus visibly relaxed. He DM\'d you "thank you" three times after.' },
        ],
      },
      format_committed: {
        description: 'Marcus, after a beat: "Two of them, yeah. The big one is from Priya\'s deal. The other is the CEO Slack thing." {facilitator}, in chat: "so we\'re sizing pre-decided work as if the size matters."',
        choices: [
          { label: '"Then size them honestly and flag the over-commit upward."', next: 'flag_upward' },
          { label: '"Move them to a separate \'committed\' tracker, off the velocity board."', effect: { focus: -1, capital: 1, morale: 3, burnout: 2 }, log: 'You bought a structural fix. Marcus created a new column. Leadership noticed. They will dislike it. The team will love it briefly.' },
          { label: 'Sigh and rubber-stamp the pre-committed sizes', effect: { focus: -1, scopeCreep: true, addUrgentFeature: true, debt: 3, burnout: 5 }, log: 'You folded. The pre-decided sizes were ratified. A new urgent ticket appeared on your sprint within the hour, also pre-sized.' },
        ],
      },
      flag_upward: {
        description: 'Marcus winces. "I — yeah. OK. I\'ll send a doc to my manager. I\'ll cc you. It will be poorly-received but I\'ll send it."',
        choices: [
          { label: '"I\'ll review the draft tonight."', effect: { focus: -1, capital: 1, morale: 4, burnout: 2 }, log: 'You both put your names on the structural truth. The doc was sent. The reply was a single word: "Thanks." Nobody knows what it meant.' },
        ],
      },
      format_audit: {
        description: 'Marcus pauses. The room stays silent. Then: "Yeah. They are. The new VP wants \'aspirational but credible\' numbers. So if a ticket feels like a 5, see whether it can be a 3."\n\nHe says it the way someone admits something they already said two weeks ago, hoping nobody noticed.',
        choices: [
          { label: '"Then I\'m voting honestly. Mark me down for it."', effect: { focus: -1, capital: -0.5, morale: 4, burnout: 2 }, log: 'You voted honestly all meeting. The aggregate dragged Marcus\'s number up by 14%. He absorbed the political cost. He told you, sincerely, in DM that he respected you.' },
          { label: '"Fine, I\'ll vote whatever you need."', effect: { focus: -1, capital: 0.5, scopeCreep: true, addUrgentFeature: true, debt: 3, burnout: 4 }, log: 'You voted to the number. The leadership readout looked great. Two tickets you sized as 3s ate the rest of your sprint anyway.' },
        ],
      },
      // ----- spike branch — small, real, no scope-add: the rare process win
      spike: {
        description: 'Marcus: "A spike? OK — sure. Who owns it?" {facilitator} starts typing in chat. {objector}: "I\'ll do it." Marcus, awkwardly: "actually — let\'s have you do it, since you raised it."',
        choices: [
          { label: '"Sure, I\'ll spike it."', effect: { focus: -0.5, capital: 0.5, burnout: 2 }, log: 'You volunteered. A 2-hour spike was added to your sprint — not a feature. Friday\'s estimate will be honest, possibly for the first time this quarter.' },
          { label: '"Let {dev} do it — they actually own that surface."', effect: { focus: -0.5, capital: -1, burnout: 1 }, log: 'You deflected to {dev}. They accepted gracefully. They will mention this in their next 1:1, gently.' },
        ],
      },
      compromise: {
        description: 'Marcus: "OK, 3? Everyone — 3?" {facilitator} votes 8 because "they\'re trying to slow things down for capacity reasons." {objector} votes 2. The poll has a bimodal distribution. Marcus stares at it.',
        choices: [
          { label: 'Re-vote with discussion', next: 'revote' },
          { label: 'Move on with the median', effect: { focus: -1.5, burnout: 4, scopeCreep: true }, log: 'You forced consensus on a 3. The ticket grew anyway and you will be the one to discover this on Wednesday.' },
        ],
      },
      // Generalized: the requirements ARE missing (matches descriptions where
      // they\'re unwritten, AI-generated, or just "see Slack").
      scope: {
        description: 'Marcus, brightly: "Great question — there isn\'t a finalized one yet. The customer ask is, you know, real. Could you ballpark it?"\n\n{facilitator}, after a beat: "Then we can\'t actually size it."',
        choices: [
          { label: '"Then it goes back to the backlog until we have AC."', next: 'scope_principle' },
          { label: '"...so a 13."', next: 'thirteen' },
          { label: '"That\'s six tickets, not one."', next: 'split' },
          { label: '"Move it to next sprint."', next: 'defer' },
          { label: '"...sure, an 8."', effect: { focus: -1, scopeCreep: true, addUrgentFeature: true, burnout: 4, debt: 3 }, log: 'You ballparked an unwritten ticket. Inevitable. The 8 will be a 21. You will be the one paying for it.' },
        ],
      },
      // ----- principled refusal: rare clean win
      scope_principle: {
        description: 'Marcus, after a long beat: "OK. Let\'s skip it. We\'ll bring it back when product has acceptance criteria." {facilitator} reacts with 🙌. The ticket goes back to the backlog. The room — for a single moment — feels like the ceremony was the right size.',
        choices: [
          { label: 'Move on to the next ticket', effect: { focus: -1, capital: 1.5, morale: 4 }, log: 'A real win. The unsized ticket went back. It will reappear next sprint with also no acceptance criteria. The principle stood today, briefly.' },
        ],
      },
      thirteen: {
        description: 'Marcus: "We don\'t do 13s anymore. The exec team flagged the velocity dip. Can we make it a 5?" {objector}: "Or split it." Marcus: "We don\'t have time to split. Let\'s say 5."',
        choices: [
          { label: '"Then we\'re lying about velocity."', effect: { focus: -1, capital: -1, burnout: 4, morale: -2 }, log: 'You named the lie out loud. The vote went 5 anyway, but Marcus quietly noted "tracker discrepancy" in his doc. No new ticket forced on you today; the politics will land later.' },
          { label: '"Split it now, it takes 5 minutes."', next: 'split' },
          { label: 'Sigh and accept the 5', effect: { focus: -1, burnout: 4, scopeCreep: true, addUrgentFeature: true }, log: 'You voted 5. The team committed to 5. The ticket grew. A second ticket appeared to track "the rest of it." On you.' },
        ],
      },
      split: {
        description: 'Marcus: "Splitting takes 20 minutes per ticket. We have 12 more to size. We don\'t have time."',
        choices: [
          { label: '"Then we should refine fewer tickets, not size them sloppy."', effect: { focus: -0.5, capital: -1, morale: 3, burnout: 2 }, log: 'You named the trade. Marcus didn\'t love it. The room agreed quietly. Three tickets were dropped from the meeting. None of them came back to you.' },
          { label: '"Splitting offline as a follow-up doc — async."', next: 'async' },
          { label: 'Accept the lump', effect: { focus: -1.5, burnout: 5, addUrgentFeature: true }, log: 'You accepted the unsized lump. It rematerialized as a new urgent ticket on your sprint by 4 PM.' },
        ],
      },
      async: {
        description: 'Marcus: "We tried async last quarter. Nobody read the doc. Honestly — that\'s why we still have refinement meetings."',
        choices: [
          { label: '"Then make ONE doc per sprint, not per meeting."', effect: { focus: -0.5, capital: 0.5, morale: 2, burnout: 2 }, log: 'A small structural improvement. Marcus said he\'d try it. There is now a "Refinement Doc · Sprint N" template. Whether anyone reads it is a question for next quarter.' },
          { label: 'Acknowledge defeat', effect: { focus: -1, burnout: 3 }, log: 'You stopped pushing. The same problem will reappear. Today, no extra ticket landed on you. That counts as something.' },
        ],
      },
      defer: {
        description: 'Marcus: "Can\'t move it — there\'s a customer expectation on the timing." He does not specify whose expectation it is or who set it.',
        choices: [
          { label: '"Whose expectation, and when did we agree to it?"', next: 'without_checking' },
          { label: '"Then it\'s a candidate for a fast-follow next sprint, not a full ticket this one."', effect: { focus: -0.5, capital: 0.5, morale: 2, burnout: 2 }, log: 'You re-framed it as a fast-follow. Marcus accepted. The customer expectation was, you suspect, his own.' },
          { label: 'Drop it', effect: { focus: -1, burnout: 4, addUrgentFeature: true }, log: 'You dropped it. The deadline turned out to be real-ish. The ticket appeared in your sprint anyway.' },
        ],
      },
      without_checking: {
        description: 'Marcus has the decency to look uncomfortable. "Yeah — uh — Priya promised it on a customer call last week. I\'ll bring it up with her."',
        choices: [
          { label: '"OK — but for now we plan as if it\'s NOT in this sprint."', effect: { focus: -0.5, capital: 1, morale: 3, burnout: 2 }, log: 'You held the line. Marcus actually went and talked to Priya afterward. The ticket landed in next sprint, not this one.' },
          { label: '"...fine."', effect: { focus: -1, burnout: 4, addUrgentFeature: true }, log: 'You let it go. The follow-up with Priya was rescheduled twice. The ticket landed on you anyway, today.' },
        ],
      },
      revote: {
        description: '{facilitator}: "Here\'s the thing — if we size everything down, we\'re building unsustainable expectations." Marcus: "We\'re not in capacity planning, we\'re sizing." {facilitator}: "Right, but they\'re related." Eight more minutes pass and the bimodal distribution holds.',
        choices: [
          { label: 'Wait it out', effect: { focus: -2, burnout: 6 }, log: 'You waited. The vote concluded with the original size. Two more tickets got sized. None landed on you, today.' },
          { label: 'Propose: "Let\'s vote the 8 honestly, capacity be damned."', effect: { focus: -1, capital: -0.5, morale: 3, burnout: 3 }, log: 'You voted up. {facilitator} thanked you with a private DM. The leadership readout will be off; that is a problem for tomorrow.' },
          { label: 'Leave the meeting silently', effect: { focus: -0.5, capital: -2, burnout: 3 }, log: 'You left. Marcus DM\'d "everything ok?" Twice. You said you had a doctor\'s appointment. The lie was easy.' },
        ],
      },
      mute: {
        descriptions: [
          { text: 'You stay muted, camera off. Hour 1.5 begins. {objector} says "I\'m gonna respectfully push back on that" for the eleventh time. {facilitator} is arguing that effort points should be re-calibrated weekly. Marcus is in three Slack threads simultaneously.', requires: REMOTE },
          { text: 'You disengage. Hour 1.5 begins. {objector} says "I\'m gonna respectfully push back on that" for the eleventh time. {facilitator} is arguing that effort points should be re-calibrated weekly. Marcus is on his laptop, in three Slack threads simultaneously, while the room argues around him.', requires: OFFICE },
        ],
        choices: [
          { label: 'Endure the rest', effect: { focus: -2, burnout: 6 }, log: 'You endured. Meeting ran 35 minutes over. The room sized 14 tickets. None of them landed on you today.' },
          { label: 'Endure, but check Slack on the side', effect: { focus: -2.5, burnout: 7, addUrgentFeature: true }, log: 'You half-listened. While checking Slack, you missed a ticket being assigned to you. It was assigned to you anyway. You\'ll discover it tomorrow.' },
          { label: 'Drop with "lost connection"', requires: REMOTE, effect: { focus: -0.5, capital: -1, burnout: 2 }, log: 'You used the network excuse. Marcus didn\'t buy it. He didn\'t mention it either.' },
          { label: '"Sorry — bathroom," and slip out', requires: OFFICE, effect: { focus: -0.5, capital: -1, burnout: 2 }, log: 'You walked out. Marcus didn\'t buy that you came back. He didn\'t mention it either.' },
        ],
      },
    },
  },
  {
    id: 'daily_standup', icon: MessageSquare,
    title: 'Daily standup (15 min on the calendar)',
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          // ----- vanilla scope/scope creep openers -----
          'You are on minute 13 of a 15-minute meeting that has had 2 minutes of actual standups in it. {updater} is mid-update on something that started as "I worked on stuff" and is now somehow about a customer call from last quarter.',
          'Standup started 6 minutes late because Marcus\'s 9:30 ran over. {updater} is mid-update, cross-referencing a Jira ticket they "just need to find — one sec." The "one sec" is now 90 seconds old.',
          '{updater} began their update with "I\'m going to keep this short" exactly four minutes ago. They are now describing a Slack thread they had with Marketing in 2023.',
          { text: 'Marcus opens with "before we start — Logan from leadership is dropping in today, just FYI, act normal." Logan has been on mute, camera off, the whole time. Logan\'s status is "Available." Logan posted a 🎯 in the chat 90 seconds ago and you do not know what it means.', requires: REMOTE },
          { text: 'Marcus opens with "before we start — Logan from leadership is dropping in today, just FYI, act normal." Logan is in the back of the huddle, looking at his phone. Logan\'s Slack status is "Available." Logan has not made eye contact with anyone. Logan posted a 🎯 in the team channel 90 seconds ago and you do not know what it means.', requires: OFFICE },
          'Standup runs into Marcus\'s next meeting. Marcus: "let\'s do a lightning round." The lightning round takes 19 minutes because Marcus interrupts each update with "love that — quick follow-up."',
          'Marcus, sharing his screen: "small format change — I added an icebreaker question." Today\'s icebreaker: "what\'s your spirit animal as a Jira ticket type?" {updater} answers seriously. {updater}\'s answer is "an Epic."',
          'Marcus opens with "I want to celebrate a win." The win is that {dev} closed 14 tickets. 11 of them were duplicates. Marcus knows this. Marcus is celebrating anyway, with a 🎉 emoji bot he installed yesterday that fires for everyone on the team.',
          // ----- Loom replay branch (no real "offline" applies — just absurdity) -----
          '{updater} is sharing their screen for a standup. They are showing a Loom they recorded yesterday. The Loom is 9 minutes long. Marcus says "love this, very prepared" and lets it play in full. The Loom is also playing at 0.85x because {updater} forgot to bump the speed.',
          { text: 'Marcus, brightly: "{updater} pre-recorded their update! Async-first, baby." It plays. {updater} is also live on the call. Live-{updater} watches Recorded-{updater} and visibly disagrees with their own past self.', requires: REMOTE },
          // ----- "vibes update" format branch -----
          'Marcus has restructured standup. There is now a "yesterday / today / blockers / vibes" framework. He is asking everyone for a "vibes update" on a 1–5 scale. {updater} is asking what the difference between a 3 and a 4 is.',
          'Marcus: "I want to try a new format — instead of yesterday/today/blockers, we go yesterday/today/blockers/blockers we MADE for ourselves. So we own it." {updater}: "I made a typo." Marcus: "love the vulnerability."',
          'Marcus has read a new book and standups now end with "one thing I\'m grateful for." {updater}\'s gratitude is "the espresso machine working again." Marcus types it into a doc.',
          // ----- AI summary co-pilot branch -----
          'Marcus has added an "agentic AI co-pilot" to the standup that summarizes everyone\'s update. The summary is wrong about three of them. The summary will be sent to leadership. Logan reacts to it with 🚀.',
          'Marcus has piloted a new tool: every standup is auto-transcribed by an AI and turned into a Notion page nobody reads. The AI has misheard "I shipped the auth fix" as "I shipped the off-ramp."',
          // ----- async/multi-channel chaos -----
          { text: 'Standup is now async-first. It is also still on Zoom every morning. It is also in a Notion doc. It is also in a Slack thread. {updater} is reading their async update aloud while the doc is on screen. Two people are typing in the Slack thread. The doc has 31 unread comments.', requires: REMOTE },
          { text: 'Standup is on Slack huddle today because the Zoom license got "rationalized." The huddle has no video. Three people are clearly walking somewhere. One is on a treadmill. {updater} is at the dentist and giving updates between rinse-and-spits.', requires: REMOTE },
          'Standup. {updater} joins from the airport, on cellular, in motion. Their video keeps freezing on a slightly unflattering expression. They are giving an update. They are also clearly going through security. A TSA agent\'s arm appears in frame.',
          // ----- leadership theatre -----
          'Marcus: "before we start, leadership has asked us to track our standups against velocity. So I\'m going to be timing each update. Just so we have data." {updater}\'s update is 9 seconds long. Marcus says "that felt rushed."',
          'Marcus, in a tone that is almost a whisper: "small heads-up — Logan asked for a Loom of today\'s standup for the leadership readout. So if you could each \'do your update like Logan is watching\' that\'d be great." Logan, who is also here: 🎯',
          'Standup. Marcus: "small thing — leadership has asked that we use this time to also talk about \'what unblocked you yesterday.\' It\'s a wins-orientation thing. So please come prepared with that going forward." Yesterday you were blocked by Marcus\'s scope creep. You will not be saying this.',
          // ----- the "let\'s take that offline" boss-deflect (the central irony) -----
          '{updater}: "I want to flag a blocker." Marcus, instantly: "love that — let\'s take that offline." {updater}: "It\'s blocking the whole sprint." Marcus: "totally — let\'s take it offline." Marcus has not opened a doc. There will be no offline.',
          'Marcus opened standup by saying "I\'m going to be intentional today about what we take offline." He has now sent every blocker, every dependency call-out, and {dev}\'s genuine cry for help to the same Notion doc titled "PARKING LOT." The doc has 412 unaddressed entries.',
          // ----- the surprise-debug derail (legitimate, "offline" doesn\'t apply — this IS the work) -----
          'Standup\'s last 60 seconds. {dev}: "wait — quick — is anyone else seeing 500s on the dashboard right now?" Three people check. Three people see them. Marcus: "let\'s take that offline." Customers cannot see the dashboard.',
          // ----- Marcus is, somehow, double-booked AT his own standup -----
          { text: 'Marcus is running standup from his car. He is in a parking garage. The audio echoes. He is also clearly on a different call on his phone — you can hear someone else\'s voice say "you\'re still on mute, Marcus." He is on mute on the other call.', requires: REMOTE },
          'Marcus has a hard out at 9:30 for a 9:30 he booked himself. He has been saying "real quick — last update, real quick" since 9:22. He has gotten through one person.',
          // ----- the "no Marcus today" rare branch -----
          { text: 'Marcus is OOO. {dev} is "facilitating." {dev} has not facilitated before. {dev}: "ok so — should I just like — go in alphabetical?" Six people have unmuted to suggest different orderings. Nobody has given an update.', requires: REMOTE },
          // ----- in-person huddle openers (only fire when player is in office) -----
          { text: 'Standup at the team\'s pod. Marcus is holding coffee with both hands. {updater} is mid-update on something that started "I worked on stuff" and is now somehow about a customer call from last quarter. Nobody is sitting; nobody can quite leave.', requires: OFFICE },
          { text: 'Huddle around your desk. The remote half of the team is stacked on the TV behind Marcus. {updater}, in person, is talking too quietly. Marcus says "louder for the camera!" twice. The remote half mostly nods.', requires: OFFICE },
          { text: 'Standup at the huddle wall. Doug walks past loudly continuing his oat-milk monologue from the kitchen. The huddle gets quieter. Marcus pretends not to hear. {updater} restarts their update.', requires: OFFICE },
          { text: 'Standup. {dev} arrives 90 seconds late, breathing hard, holding an iced coffee. They mouth "did I miss anything?" {updater} keeps going without looking at them.', requires: OFFICE },
          { text: 'Standup. The remote attendee is frozen on the TV — mid-blink, slightly unflattering. Nobody mentions it. The standup goes on around the still face for four minutes before someone reconnects them.', requires: OFFICE },
        ],
        choices: [
          { label: 'Mute, camera off, eat a granola bar', next: 'glazed', requires: REMOTE },
          { label: 'Stand at the back of the huddle, eyes on your phone', next: 'glazed', requires: OFFICE },
          { label: 'Give a crisp 30-second update first', next: 'your_update' },
          { label: 'Fake a connection issue and bail', next: 'fake_drop', requires: REMOTE },
          { label: 'Drift back to your desk to "check something"', next: 'office_bail', requires: OFFICE },
          { label: '"Marcus, can we wrap? I\'m at 12 minutes."', next: 'wrap_attempt' },
        ],
      },
      // ----- glazed: you check out, the meeting unfolds — branches by what kind of derail it is -----
      glazed: {
        descriptions: [
          'You disengage. The next 6 minutes happen at you. Then {offliner} says: "real quick — kind of a question for the group, not really an update —" Marcus, brightly: "love an open thread."',
          'You disengage. Then Marcus says "{offliner}, your turn." {offliner}: "yeah so — this isn\'t really an update either, but —"',
          'You disengage. Marcus: "OK, before we wrap — {offliner} flagged something in DM, want to surface it?" Surfacing has begun. There is no taking this offline.',
        ],
        choices: [
          { label: 'Listen — what\'s {offliner} actually saying?', next: 'derail_router' },
          { label: 'Stay muted, eyes glazed, ride it out', requires: REMOTE, effect: { focus: -2, burnout: 6, addUrgentFeature: true }, log: 'You waited it out. {offliner}\'s "quick question" became a new ticket somewhere mid-monologue. It is on you. You don\'t remember which one.' },
          { label: 'Stand still, eyes glazed, ride it out', requires: OFFICE, effect: { focus: -2, burnout: 6, addUrgentFeature: true }, log: 'You waited it out, hands in your pockets. {offliner}\'s "quick question" became a new ticket somewhere mid-monologue. It is on you. You don\'t remember which one.' },
          { label: 'Drop off ("oh no my Wi-Fi")', requires: REMOTE, effect: { focus: -0.5, capital: -0.5, burnout: 2 }, log: 'You used the Wi-Fi excuse. Marcus didn\'t notice. {offliner} continued. The ticket landed on someone else.' },
          { label: '"Sorry — gotta grab this," and walk away with your phone', requires: OFFICE, effect: { focus: -0.5, capital: -0.5, burnout: 2 }, log: 'You held your phone up like it had vibrated and walked off. It hadn\'t. Marcus didn\'t notice. {offliner} continued. The ticket landed on someone else.' },
        ],
      },
      // Routes the player to the actual nature of the derail. Each sub-branch is internally consistent.
      derail_router: {
        descriptions: [
          '{offliner}: "I want to walk through the dashboard 500s with the group, on screen. Five minutes."',
          '{offliner}: "{updater} mentioned the auth flow — I had a thought. Hear me out — what if it ALSO did SSO with the legacy IdP?"',
          '{offliner}: "I have a quick philosophical question — what counts as \'shipped\'?"',
          '{offliner}: "Just flagging — I\'m blocked on the platform team. Like, real-blocked. Not vibes-blocked. The thing-doesn\'t-load blocked."',
          '{offliner}: "Sorry — I have to share this — Stefan from the offsite reached out and he had FEEDBACK on our roadmap."',
        ],
        choices: [
          { label: '"Marcus — that one\'s legitimately blocking, not offline material."', next: 'real_blocker' },
          { label: '"That\'s a scope discussion, not a standup."', next: 'scope_pushback' },
          { label: '"Take it offline — for real, not the Marcus version of offline."', next: 'real_offline' },
          { label: 'Mute and watch it unfold', requires: REMOTE, effect: { focus: -2, burnout: 7, addUrgentFeature: true }, log: 'You watched. The conversation went somewhere only Marcus could love. A new ticket appeared. It is now yours.' },
          { label: 'Stay quiet and watch it unfold', requires: OFFICE, effect: { focus: -2, burnout: 7, addUrgentFeature: true }, log: 'You watched. The conversation went somewhere only Marcus could love. A new ticket appeared. It is now yours.' },
        ],
      },
      // Real blocker — the IRONIC version of "take it offline" was Marcus\'s deflection in the openers
      real_blocker: {
        description: 'Marcus: "totally — and that\'s exactly the kind of thing we should — uh — take offline?" {dev}, flatly: "It is not offline material. It is broken. Right now. People are looking at it right now." Marcus, recalibrating in real time: "OK so — quick exception today — let\'s actually surface it."',
        choices: [
          { label: 'Volunteer to look at it now', effect: { focus: -3, burnout: 5, debt: -2, capital: 1 }, log: 'You took the fire. You shipped a real fix. Marcus posted in #wins. He spelled your name wrong.' },
          { label: '"That\'s not ours. Page whoever owns it."', effect: { focus: -0.5, capital: -1, burnout: 3 }, log: 'You held the line. The owning team eventually got paged. Marcus felt you "weren\'t a team player today" and will say so in your 1:1, gently.' },
          { label: 'Suggest the on-call rotation', effect: { focus: -1, capital: -0.5, burnout: 2 }, log: 'You found the right person. They were already on it. The only damage was 6 minutes of your morning.' },
        ],
      },
      // Scope pushback path — Marcus + the offliner try to grow your sprint live on the call
      scope_pushback: {
        description: 'Marcus, slowly: "I hear you, but — small thought — {offliner}\'s idea is actually kind of in scope? It\'s sort of an extension of what we\'re already doing." It is not an extension. It is a new feature.',
        choices: [
          { label: '"It is a new feature."', next: 'new_feature' },
          { label: '"OK, file a ticket and we\'ll triage."', effect: { focus: -1, capital: 0.5, burnout: 3 }, log: 'You pushed it to triage. Marcus noted it. It will appear in next planning labeled URGENT.' },
          { label: '"Sure, I\'ll think about it."', effect: { focus: -1, scopeCreep: true, burnout: 5 }, log: 'You said "sure" out loud. The feature you\'re building grew by 6 hours before standup ended.' },
        ],
      },
      new_feature: {
        description: 'Marcus pauses. "OK — but is it though? Like, philosophically." {offliner} nods sagely. "I think it\'s the same thing in a different — energy."',
        choices: [
          { label: '"Energetically and technically: no."', effect: { focus: -1, capital: -1, burnout: 4 }, log: 'You held the line on physics. {offliner} was visibly hurt. The feature died. The respect did not survive standup.' },
          { label: 'Give up and absorb the scope', effect: { focus: -1, scopeCreep: true, burnout: 6 }, log: 'You folded after 4 minutes of philosophy. Your feature grew 6 hours, mostly in a part you hadn\'t designed yet.' },
        ],
      },
      // Real offline — distinguishes from Marcus's fake "offline"
      real_offline: {
        description: 'Marcus: "totally totally — let\'s take that — offline." Then, 4 seconds later: "actually, since everyone\'s here, super quick — could you just walk us through it now?" Six minutes pass. Nothing has been taken offline.',
        choices: [
          { label: '"Marcus, you literally just said offline."', effect: { focus: -1, capital: -1, burnout: 3 }, log: 'You held him to his own words. Marcus did the "totally fair" thing. The conversation continued anyway, slightly muted, for 4 more minutes.' },
          { label: 'Drop off and DM the right people directly', requires: REMOTE, effect: { focus: -0.5, capital: 0.5, burnout: 2 }, log: 'You bailed and resolved the actual issue async in 8 minutes. Marcus DM\'d you "great hustle today!"' },
          { label: 'Walk back to your desk and DM the right people directly', requires: OFFICE, effect: { focus: -0.5, capital: 0.5, burnout: 2 }, log: 'You left the huddle and resolved the actual issue async in 8 minutes. Marcus DM\'d you "great hustle today!"' },
        ],
      },
      // ----- your_update path: branches by what happens AFTER you give a clean update -----
      your_update: {
        descriptions: [
          'You give a clean 30-second update. Marcus: "love that — quick question for you, real quick — could you also look at the export thing this week?" The export thing is not on your sprint.',
          'You give a clean 30-second update. {offliner}: "Building on what they just said — I think there\'s actually a bigger question here, which is — what does success look like? Could you put together a quick success-metrics doc for the team? Nothing big. By Thursday?" Nobody has defined success. There is now a deadline for it.',
          { text: 'You give a clean 30-second update. Logan, who has been silent on mute, unmutes for the first time and says: "🎯 — quick one — could you write that up in a doc by EOD? Just a one-pager. For my readout." Logan re-mutes.', requires: REMOTE },
          { text: 'You give a clean 30-second update. Logan, who has been silent the whole standup, looks up from his phone for the first time and says: "🎯 — quick one — could you write that up in a doc by EOD? Just a one-pager. For my readout." Logan looks back down.', requires: OFFICE },
          'You give a clean 30-second update. Marcus, immediately: "amazing — and totally aligned with what we discussed in our 1:1. So you\'re good to also pick up the onboarding tweak this week, like we said?" You did not have a 1:1 about this. Nobody has said the words "onboarding tweak" to you before.',
        ],
        choices: [
          { label: '"Sure, I\'ll add it to the sprint."', effect: { addUrgentFeature: true, capital: 0.5, burnout: 4 }, log: 'You absorbed the new ticket and thanked them for it. Marcus celebrated your "energy."' },
          { label: '"Can we triage that in planning?"', next: 'triage_attempt' },
          { label: '"Happy to look — what should we drop?"', next: 'what_drop' },
          { label: 'Drop off (Zoom acted up)', requires: REMOTE, effect: { focus: -0.5, capital: -0.5, burnout: 2 }, log: 'You dropped. Marcus did not notice. The ask was repeated to {dev}, who absorbed it.' },
          { label: '"One sec — back-to-back," and step away', requires: OFFICE, effect: { focus: -0.5, capital: -0.5, burnout: 2 }, log: 'You walked off mid-ask. Marcus did not chase. The ask was repeated to {dev}, who absorbed it.' },
        ],
      },
      triage_attempt: {
        description: 'Marcus: "totally — but it\'s coming from above, so realistically we have to do it this sprint? Triage feels like — a process answer to a people question."',
        choices: [
          { label: '"Process exists for a reason."', effect: { focus: -1, capital: -1, burnout: 4 }, log: 'You held. Marcus called you "principled" in a tone he uses when he means "difficult."' },
          { label: 'Sigh and absorb it', effect: { addUrgentFeature: true, burnout: 5 }, log: 'You folded. The ticket was added. The ask traces back, as ever, to "a conversation" nobody can find.' },
        ],
      },
      what_drop: {
        description: 'Marcus, blinking: "...drop? oh — I mean — could you maybe just — fit it in? I think it\'s small."',
        choices: [
          { label: '"Then it goes in next sprint."', next: 'formally_protect' },
          { label: '"Fine."', effect: { addUrgentFeature: true, scopeCreep: true, burnout: 5, capital: -0.5 }, log: 'You agreed to "fit it in." It will not fit. The thing you were already building grew, and a new ticket appeared next to it.' },
        ],
      },
      formally_protect: {
        description: 'Marcus: "Sure, I\'ll put it on the next sprint candidate list." The list has 47 things on it. Two of them have been on it for a year.',
        choices: [
          { label: '"OK."', effect: { capital: 1, focus: -0.5 }, log: 'You traded a ticket for a place on a list. The list is, in functional terms, a graveyard. You bought yourself today.' },
        ],
      },
      // ----- office_bail: in-person sibling of fake_drop. You drift away
      // physically instead of pretending your Wi-Fi died. Same low-cost
      // escape, similar political tab.
      office_bail: {
        descriptions: [
          'You take a slow step back, then another. Marcus is mid-sentence and doesn\'t look up. By the time he glances over, you\'re at your desk pretending to read a PR. The huddle continues. You bought back ~10 minutes.',
          'You hold your phone up like it just buzzed and mouth "sorry — gotta grab this." Nobody calls you back. The phone is on Do Not Disturb. You sit at your desk and actually open the PR you were procrastinating.',
          'You catch {dev}\'s eye, point at your laptop, and walk back to your pod. {dev} nods like they understand. They do not. The huddle goes on without you for another twelve minutes.',
        ],
        choices: [
          { label: 'Get back to work', effect: { focus: -0.5, capital: -0.5, burnout: 1 }, log: 'A clean drift. You bought back ~10 minutes of morning. Marcus saw it; he didn\'t name it.' },
          { label: 'Marcus walks over after standup, "everything good?"', next: 'office_bail_followup' },
        ],
      },
      office_bail_followup: {
        description: 'Marcus is at the side of your desk. "Hey — everything good? You ducked out a little early." It\'s a question that isn\'t a question.',
        choices: [
          { label: '"Yeah, sorry, had to look at something."', effect: { focus: -1.5, capital: 0.5, burnout: 5, addUrgentFeature: true }, log: 'You said it lightly. Marcus said "all good!" lightly. He used the next 50 minutes to add a ticket to your sprint that he couldn\'t add at standup.' },
          { label: '"I\'m at standup capacity for the week, Marcus."', effect: { focus: -0.5, capital: -1, burnout: 2 }, log: 'You named the dynamic. Marcus blinked twice and said "totally fair." He went back to his desk. He\'ll bring this up in your next 1:1, gently.' },
        ],
      },
      // ----- fake_drop: low-cost escape, slight political tax -----
      fake_drop: {
        descriptions: [
          'You announce: "guys my Wi-Fi is dying, dropping" — and bail. Marcus: "sounds good, catch up async!" Your Wi-Fi is fine. Marcus knows your Wi-Fi is fine. You both let it slide.',
          'You hit "leave meeting." Slack instantly: Marcus: "oh no — was it the Zoom thing again?" You reply with three letters: "yep" and close the laptop lid.',
          'You unplug your laptop\'s ethernet under the desk and rejoin once. The reconnection looks credible. You drop again, audibly this time. Marcus moves on.',
        ],
        choices: [
          { label: 'Get back to work', effect: { focus: -0.5, capital: -0.5, burnout: 1 }, log: 'A clean escape with a small political tab. You bought back ~10 minutes of morning.' },
          { label: 'Marcus DMs you a calendar invite to "sync"', next: 'fake_drop_followup' },
        ],
      },
      fake_drop_followup: {
        description: 'A 30-minute "sync" appears on your calendar for 4:30 PM today. The title is "[catch-up — should be quick]." There is no agenda. The other invitee is {offliner}.',
        choices: [
          { label: 'Accept', effect: { focus: -1.5, capital: 0.5, burnout: 5, addUrgentFeature: true }, log: 'You took Marcus\'s 4:30 catch-up. It ran 50 minutes. He and {offliner} used it to add a ticket to your sprint that they couldn\'t add at standup.' },
          { label: 'Decline with "conflict"', effect: { focus: -0.5, capital: -1, burnout: 2 }, log: 'You declined Marcus\'s 4:30 catch-up. He rebooked it twice. The third invite has "[REQUIRED]" in the title.' },
        ],
      },
      // ----- wrap_attempt: you try to be the adult in the room -----
      wrap_attempt: {
        descriptions: [
          'Marcus: "yeah — totally — wrapping. {offliner}, real quick, blockers?" {offliner}: "Well — sort of — there\'s this thing with the API — actually maybe I\'ll bring it up here because everyone\'s on —" Ten more minutes.',
          'Marcus: "great point — let\'s wrap. Last thing: {dev}, wins?" {dev} starts listing wins. They have prepared a list. The list is 11 items long. The first 9 are duplicates.',
          'Marcus: "love that — wrapping it up, just one tiny ask — can we do round-the-room \'one thing you\'re proud of\' real quick? Logan asked for it." Logan reacts with 🎯 immediately.',
        ],
        choices: [
          { label: 'Just leave', effect: { focus: -0.5, capital: -1, burnout: 3 }, log: 'You left. Three other people followed. Marcus continued running the meeting to himself. He may or may not have noticed.' },
          { label: 'Stay (you\'re a saint)', effect: { focus: -2, burnout: 6, addUrgentFeature: true }, log: 'You stayed for the wrap. The "real quick" was 14 minutes. A blocker turned into a ticket. It is now yours.' },
          { label: '"Marcus. We are 22 minutes into a 15-minute meeting."', next: 'call_it_out' },
        ],
      },
      call_it_out: {
        description: 'Marcus pauses. "...you\'re right. You\'re right. Sorry — I lose track. Can someone time-keep next time?" Three people volunteer. None of them will. The meeting ends 90 seconds later.',
        choices: [
          { label: 'Accept the small win', effect: { focus: -1, capital: 0.5, burnout: 2, morale: 3 }, log: 'A rare clean ending. Marcus DM\'d you "thanks for keeping us honest." He will do this again tomorrow.' },
        ],
      },
    },
  },
  {
    id: 'mental_health', icon: Heart,
    title: 'Mandatory: "Resilience & Wellbeing" workshop',
    // Wellness consultants are also expensive. Fire it once-ish per quarter, off-cycle from inclusion.
    requires: (s) => s.sprint >= 4 && s.sprint % 5 === 4 && s.burnout > 30,
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          'A consultant named {facilitator} (your "Wellness Facilitator," hired during the hiring freeze) opens with: "Before we begin, let\'s do a body scan. Notice your jaw. Notice your shoulders. Notice the tension."\n\nYour Slack pings. It is your manager: "u up? quick q before EOD."\n\nThe slide deck is 78 slides. Two coworkers were laid off this quarter for "performance."',
          '{facilitator} opens with a slide that says "BURNOUT IS A SYSTEMS ISSUE — and that\'s why we\'re giving YOU the tools." She does not address the systems part again.\n\nYour Slack pings. Your manager: "hey can you hop on a quick thing rn 🙏"',
          'A "Burnout & Boundaries" workshop. {facilitator} smiles warmly: "I want to start by acknowledging — this work is HARD." She lets it sit. The HR rep behind her is checking email.\n\nYour calendar pings. A meeting was just added during this workshop. The organizer is your skip-level. Your manager DMs: "saw the invite — can you take it? i\'m double-booked 🙏"',
          '{facilitator}: "Resilience is a muscle. We build it through practice. Let\'s practice." The exercise is naming three things you\'re grateful for at work.\n\nThe person next to you cannot think of three. Neither can you.\n\nYour Slack pings. Your manager: "u around? quick favor before EOD."',
          '"Mental Wellness in the Modern Workplace." {facilitator} starts: "Show of hands — who feels like the pace right now is sustainable?" Three hands go up. All three are leadership.\n\nYour phone buzzes. Your manager: "quick q when you\'re out. not urgent. (kind of urgent.)"',
        ],
        choices: [
          { label: 'Do the exercise, eyes closed', next: 'body_scan' },
          { label: 'Reply to your manager', next: 'reply_mgr' },
          { label: '"Is the EAP actually accessible?"', next: 'eap' },
          { label: '"Is this happening because of the layoffs?"', next: 'layoffs' },
        ],
      },
      body_scan: {
        description: '{facilitator}: "Whatever you\'re holding — just... let it go." You cannot let it go because the Slack pings keep coming. {facilitator} continues: "Mental health is everyone\'s responsibility. We\'re here to give you the TOOLS."',
        choices: [
          { label: '"What tools?"', next: 'tools' },
          { label: 'Just nod', effect: { focus: -1.5, burnout: 6 }, log: 'You nodded. The body scan ended. The tension did not go.' },
        ],
      },
      reply_mgr: {
        description: (s, c) => `You DM your manager. They reply: "thanks! actually can you also look at the dashboard issue tonight? want to be ahead of it before tomorrow." It is ${T(c)}. The workshop is not done.`,
        choices: [
          { label: '"OK"', effect: { focus: -1, burnout: 8 }, log: 'You agreed to extra work during the wellbeing workshop. The irony was lost on no one. {facilitator} was talking about boundaries on the slide above your manager\'s name.' },
          { label: '"I\'m in a workshop, can it wait?"', next: 'wait_mgr' },
        ],
      },
      wait_mgr: {
        description: 'Manager: "yeah no totally! whenever you can. tonight is fine." The "tonight is fine" was not a question.',
        choices: [
          { label: 'Read between the lines', effect: { focus: -1, capital: -0.5, burnout: 6 }, log: 'You agreed to do it tonight. Burnout was discussed in the workshop. Burnout was practiced after it.' },
          { label: '"I\'ll look at it tomorrow morning."', next: 'tomorrow' },
        ],
      },
      eap: {
        description: '{facilitator}: "GREAT question! Yes, the EAP is available 24/7! It\'s a fantastic resource. There\'s a — there might be a wait list right now? But you can also use the Calm subscription. We have a corporate Calm subscription. It\'s on the intranet."',
        choices: [
          { label: '"How long is the wait list?"', next: 'wait_list' },
          { label: '"OK"', effect: { focus: -1, burnout: 4 }, log: 'You stopped asking. You have not used the Calm app. You will not.' },
        ],
      },
      wait_list: {
        description: '{facilitator}: "Six to eight weeks for a first appointment. But! Calm! Calm is free!" {facilitator} is smiling. {facilitator} is paid $35k for this workshop.',
        choices: [
          { label: '"...OK."', effect: { focus: -1.5, burnout: 7 }, log: 'You learned the EAP is theoretical. {facilitator}\'s smile stayed.' },
          { label: '"Six weeks is a long time when you need help."', next: 'long_time' },
        ],
      },
      long_time: {
        description: '{facilitator}: "I hear you, and what I want to invite is — sometimes the most powerful thing is what we can do RIGHT NOW. Today. Just for ourselves." The slide says: "BREATHE."',
        choices: [
          { label: 'Stop pushing', effect: { focus: -1, burnout: 6 }, log: 'You stopped. The workshop continued for 40 more minutes. Calm app downloads will spike that night, briefly.' },
        ],
      },
      layoffs: {
        description: 'The room goes quiet. {facilitator}: "I — I wasn\'t briefed on the specifics. But I want to honor that grief. Maybe write a letter to the version of yourself that didn\'t know? In your workbook? Page 14?"',
        choices: [
          { label: 'Stop asking', effect: { focus: -1, capital: -1, burnout: 6 }, log: 'You stopped. {facilitator} did not bring it up again. The workbook has a section called "Letters to Yourself." It is 7 pages long.' },
          { label: '"My friend was on that list."', next: 'friend' },
        ],
      },
      friend: {
        description: '{facilitator} pauses. The room is silent. "I\'m so sorry. I really am. ... I don\'t know how to do this part of the workshop. I should — I should know how to do this part."',
        choices: [
          { label: '"Yeah."', effect: { focus: -0.5, capital: 1, burnout: 3 }, log: 'A real moment. {facilitator} ended the workshop 20 minutes early. They emailed you afterward saying they were sorry. Their company billed for the full session.' },
        ],
      },
      tools: {
        description: '{facilitator}: "Boundary-setting! Time-blocking! Mindful pauses!" Slide reads: "IT STARTS WITH YOU."',
        choices: [
          { label: '"My manager DMs at 9 PM."', next: 'manager_dms' },
          { label: 'Take notes anyway', effect: { focus: -1.5, burnout: 5 }, log: 'You took notes. The notes are in a Notion page that will be deleted next quarter during a "workspace cleanup."' },
        ],
      },
      manager_dms: {
        description: '{facilitator}: "And THAT — that\'s where boundaries come in. Have you considered telling them you\'re unavailable after hours?"\n\nThe room makes a sound that is not laughter but is in the laughter family.',
        choices: [
          { label: '"It\'s in my OKRs to be \'highly responsive.\'"', next: 'okrs' },
          { label: 'Just nod', effect: { focus: -1, burnout: 6 }, log: 'You nodded. The workshop continued. Your OKRs continued. The Slack pings continued.' },
        ],
      },
      okrs: {
        description: '{facilitator}, quietly: "...that\'s — that\'s a structural issue. I hear you." Then, recovering, louder: "But on a personal level — what could YOU do?"',
        choices: [
          { label: '"Quit."', effect: { focus: -0.5, capital: -1, burnout: 4 }, log: 'You said it. {facilitator} laughed. The room laughed. The HR person at the back did not.' },
          { label: 'Sigh', effect: { focus: -1, burnout: 7 }, log: 'You sighed. The workshop continued. The OKRs continued.' },
        ],
      },
      tomorrow: {
        description: 'Manager: "ok. but if it spikes overnight could you take a look? the on-call channel will ping you anyway." It will.',
        choices: [
          { label: '"OK."', effect: { focus: -1, burnout: 6 }, log: 'You held a partial line. Your phone will buzz at 11:42 PM. Three times.' },
        ],
      },
    },
  },
  // ===== 1:1 + HEADQUARTERS DROP CHAIN =====
  {
    id: 'one_on_one', icon: Coffee,
    title: '1:1 with your manager — career growth',
    descriptions: [
      'Your manager asks where you see yourself in two years. Wants to "set you up for success." Asks what would excite you. They have a notebook open. They are nodding.',
      'Manager opens the 1:1 with: "Let\'s set aside the tactical stuff today and talk career." They have a Notion page titled "Jared — Growth." Three of the bullet points are aspirational. Two are blank.',
      'Quarterly career chat. Manager: "What\'s a stretch project that would energize you? Forget what we\'re currently doing — what\'s YOUR thing?"',
      'Manager pulls up a "growth framework" doc. The doc was created last Friday. The doc has more rubric than substance, but they really want to "ground this conversation in something concrete."',
      'Manager: "Look, I want to be intentional this quarter about your trajectory. What\'s a skill you\'d want to develop? What\'s a project you\'d find meaningful?" They sound earnest. They might mean it.',
    ],
    requires: (s) => !s.promise && s.sprint % 3 === 0,
    choices: [
      { label: '"Learn a modern language (Rust/Go)"', effect: { promise: 'rust',     capital: 1 }, log: '"We\'ll absolutely find something." They wrote that down.' },
      { label: '"Lead architecture decisions"',       effect: { promise: 'arch',     capital: 1 }, log: '"We love that initiative." They underlined it.' },
      { label: '"Work with real product impact"',     effect: { promise: 'impact',   capital: 1 }, log: '"So glad you brought this up." They beamed.' },
      { label: '"Explore ML/AI"',                     effect: { promise: 'ai',       capital: 1 }, log: '"We\'re actually starting an AI initiative!" they said. (You will see.)' },
      { label: '"Go deep on platform / greenfield"',   effect: { promise: 'platform', capital: 1 }, log: '"Exactly the kind of growth we want for you." Promising.' },
    ],
  },
  {
    id: 'hq_drop', icon: Briefcase,
    title: 'Headquarters has assigned a project to your team',
    requires: (s) => !!s.promise,
    start: 'open',
    nodes: {
      open: {
        description: (s) => {
          const swap = {
            rust:     "you'll be inheriting the Java 7 admin tool. The one nobody at HQ wants. The original team was reorged.",
            arch:     "we need you embedded in maintenance for the legacy tax module — patching CVEs and customer escalations. Architectural work is on hold this half.",
            impact:   "you're moving to maintenance-only mode for the Synergy Platform. It's still got 14 enterprise customers. They are loud.",
            ai:       "we need someone on the SOAP API the legal team uses. It can't be deprecated until 2028. We thought of you.",
            platform: "you'll own the AngularJS 1.x dashboard from the 2017 acquisition. We're not investing in greenfield this year.",
          };
          const what = swap[s.promise] || "an inherited maintenance project from a wound-down team.";
          return `Manager finds you. "Hey — got some good news. Remember in your 1:1 you said you wanted to grow? HQ has a project for your team. ${what} Your manager — me — thinks it'll be a great learning opportunity."`;
        },
        choices: [
          { label: '"...sure."', effect: { addLegacy: true, clearPromise: true, capital: -1 }, log: 'A legacy project was assigned. The promise has been... reframed.' },
          { label: '"This isn\'t what we discussed in the 1:1."', next: 'one_on_one' },
          { label: '"Why us?"', next: 'why_us' },
          { label: '"Who maintained it before?"', next: 'before' },
        ],
      },
      one_on_one: {
        description: 'Manager: "I know. I get it. Things shifted upstream. We talked about that goal and I really want to come back to it — but right now this is what the org needs."',
        choices: [
          { label: '"When does \'right now\' end?"', next: 'when_end' },
          { label: '"OK."', effect: { addLegacy: true, clearPromise: true }, log: 'The promise was acknowledged and quietly buried. You added the legacy project anyway.' },
          { label: '"Then we should put my growth goal in writing somewhere."', next: 'in_writing' },
        ],
      },
      why_us: {
        description: 'Manager: "Honestly? Because nobody else wants it. The original team got dispersed in the reorg. You\'re the most senior eng without a clear strategic project right now."',
        choices: [
          { label: '"That\'s because I had a strategic project already."', next: 'strategic' },
          { label: '"OK. Fair."', effect: { addLegacy: true, clearPromise: true }, log: 'Honesty was rewarded with the project. Net result: the project.' },
          { label: '"What about Sarah?"', next: 'sarah' },
        ],
      },
      before: {
        description: 'Manager: "Three engineers. Two left. One is on parental leave. The team got rolled up under our org last quarter."',
        choices: [
          { label: '"So we\'re inheriting a deprecated system from a team that got dissolved?"', next: 'deprecated' },
          { label: '"OK"', effect: { addLegacy: true, clearPromise: true }, log: 'You stopped asking. The project was assigned. The original team\'s name will gradually disappear from the wiki.' },
        ],
      },
      when_end: {
        description: 'Manager: "I — that\'s hard to say. Q3? Maybe Q4. Look, if you crush this, it positions you really well for whatever\'s next."',
        choices: [
          { label: '"Whatever\'s next is the Java 7 tool, isn\'t it."', next: 'whatever_next' },
          { label: '"OK."', effect: { addLegacy: true, clearPromise: true, capital: -1 }, log: 'You took the gamble that this maintenance would unlock something better. (Statistically: it does not.)' },
        ],
      },
      in_writing: {
        description: 'Manager: "I can put it in your growth doc, sure. But the doc is mostly aspirational. You know how it is."',
        choices: [
          { label: '"Then it doesn\'t count."', next: 'doesnt_count' },
          { label: '"...OK."', effect: { addLegacy: true, clearPromise: true }, log: 'It went in the doc. The doc gets reviewed annually. The legacy project was assigned today.' },
        ],
      },
      doesnt_count: {
        description: 'Manager looks tired. "Yeah. You\'re right. It doesn\'t. I\'m sorry. I have to give you this project anyway."',
        choices: [
          { label: '"...okay."', effect: { addLegacy: true, clearPromise: true, capital: 1 }, log: 'Your manager apologized. The project still got assigned. The apology was real, which made it worse.' },
        ],
      },
      strategic: {
        description: 'Manager: "Yeah. About that. The strategic initiative got wound down last week. Nobody told you?"',
        choices: [
          { label: '"...nobody told me."', effect: { addLegacy: true, clearPromise: true, capital: -1 }, log: 'Your strategic project was cancelled and you found out from the same conversation that gave you a legacy one. Tidy.' },
        ],
      },
      sarah: {
        description: 'Manager: "Sarah\'s going on the new ML project. We thought you\'d be a better fit for stability work."',
        choices: [
          { label: '"That\'s the project I asked for."', effect: { addLegacy: true, clearPromise: true, capital: -2 }, log: 'You learned what "good fit" means in this org. Sarah got the future. You got the past.' },
          { label: '"OK"', effect: { addLegacy: true, clearPromise: true }, log: 'You said OK. Sarah will be promoted within the year.' },
        ],
      },
      deprecated: {
        description: 'Manager: "It\'s not deprecated. It\'s strategic infrastructure. There\'s a difference."',
        choices: [
          { label: '"What\'s the difference?"', next: 'difference' },
          { label: '"OK."', effect: { addLegacy: true, clearPromise: true }, log: 'You stopped pulling the thread. The project was assigned with corporate categories intact.' },
        ],
      },
      difference: {
        description: 'Manager: "...the difference is what we tell customers." A long pause. "Look, I have to give you this project."',
        choices: [
          { label: '"OK."', effect: { addLegacy: true, clearPromise: true, capital: 1 }, log: 'Honesty has limits and you found them. The project was assigned anyway.' },
        ],
      },
      whatever_next: {
        description: 'Manager doesn\'t answer for a moment. "I don\'t know. Probably. Maybe not."',
        choices: [
          { label: '"OK."', effect: { addLegacy: true, clearPromise: true, capital: 1 }, log: 'You both knew. The project was assigned. The promise died with grace.' },
        ],
      },
    },
  },
  // ===== STRATEGIC INITIATIVE CANCELLATION =====
  {
    id: 'initiative_cancelled', icon: XCircle,
    title: 'Strategic initiative wound down',
    descriptions: [
      'The strategic initiative your team has been working on is being "deprioritized in light of evolving market realities." The VP who championed it is "pursuing other opportunities." The team most associated with it is being "reorganized." No managers were fired.',
      'The "Project Ascend" initiative — six months of work, two roadshows, three offsite kickoffs — is being "paused." The all-hands deck will be updated. The Slack channel will be archived.',
      'A vague "strategy update" hit Slack #leadership-public. The strategic initiative your team built will not ship. The CEO has "new conviction" about a different bet.',
      'A 4 PM Friday email: "Realigning around emerging opportunities." The initiative is dead. The team will be "redeployed where they can have the most impact."',
      'The board met. A new strategy doc circulated. Your initiative isn\'t in it. Nobody mentioned that. The exec team is using the phrase "exciting pivot" a lot.',
    ],
    requires: (s) => s.sprintPlan.some(t => t.strategic && !t.shipped) && s.currentDay > 1,
    choices: [
      { label: '"...so all that work?"', effect: { cancelInitiative: true, debt: 5, capital: -1 }, log: 'The work is gone. The org chart is rearranged. The all-hands deck has been updated.' },
    ],
  },
  // ===== MID-SPRINT PIVOTS / WORK-WASTERS =====
  {
    id: 'pivot', icon: AlertTriangle,
    title: 'Pivot ("we\'re going in a different direction")',
    start: 'open',
    requires: (s) => s.sprintPlan.some(t => !t.shipped && t.progress >= 4) && s.currentDay >= 2,
    nodes: {
      open: {
        descriptions: [
          { text: 'Marcus stops by your desk. He looks tired. "Hey. So. Leadership had an offsite last weekend. They\'re re-thinking the whole approach for what you\'re working on. They want to go in a different direction. We\'re probably scrapping the current one."', requires: OFFICE },
          'A surprise calendar invite, no agenda, between Marcus and a VP you\'ve never spoken to. The meeting opens with Marcus saying "thanks for joining — we have some new context." There is always new context.',
          'Marcus DMs: "got 10 min? need to share something — leadership wants to take a different angle on what you\'ve been building. wanted you to hear it from me first."',
          { text: 'Marcus walks over. He doesn\'t sit. "OK so — and please hear me out — but the customer feedback came in and we think we need to rethink the approach. From the ground up."', requires: OFFICE },
          'Marcus, wincing: "I\'m really sorry to do this — but the strategy team had a session yesterday and your project is, uh, getting reframed. They want a totally different direction. I just got told this morning."',
        ],
        choices: [
          { label: '"...what direction?"', next: 'direction' },
          { label: '"How much of what I\'ve done is salvageable?"', next: 'salvage' },
          { label: '"This is the third time this quarter."', next: 'third_time' },
        ],
      },
      direction: {
        description: 'Marcus: "They\'re still figuring it out. But it\'s definitely not THIS direction. Probably more — vibes-based? They want it to feel different. To feel more — premium. Or more — accessible. They\'re aligning on it."',
        choices: [
          { label: '"OK so what do I do today?"', next: 'today' },
          { label: '"Who decided this?"', next: 'who_decided' },
        ],
      },
      today: {
        description: 'Marcus: "Park what you have. There\'ll be a kickoff next sprint with the new direction. Or the sprint after. They want a doc by Friday. From me. I have not been included in the offsite."',
        choices: [
          { label: 'Park the work, accept the pivot', effect: { pivotTicket: true, burnout: 12, capital: -1 }, log: 'You stopped. The progress you made is in a branch nobody will merge. A new urgent feature took its slot. The doc by Friday will not be written.' },
        ],
      },
      salvage: {
        description: 'Marcus thinks. "Some of it? The auth piece probably. The rest is — different requirements, you\'d have to start over. We can call it a learning."',
        choices: [
          { label: 'Throw it out', effect: { pivotTicket: true, burnout: 14, capital: -1 }, log: 'You threw out the work. Marcus called it "good signal." The branch is in a graveyard repo.' },
          { label: '"It\'s not a learning, it\'s a waste."', effect: { pivotTicket: true, burnout: 10, capital: -2, focusPct: -10 }, log: 'You said it. Marcus didn\'t disagree. The work was thrown out anyway.' },
        ],
      },
      third_time: {
        description: 'Marcus does not deny it. "I know. I know. ... Look, I\'m on your side here. But it\'s coming from very high up. We have to."',
        choices: [
          { label: 'Sigh and accept', effect: { pivotTicket: true, burnout: 14, capital: 0.5 }, log: 'Marcus appreciated being seen. The work was thrown out. You both pretended this was fine.' },
          { label: '"I\'m updating my résumé tonight."', effect: { pivotTicket: true, burnout: 6, capital: -1, focusPct: -15 }, log: 'You said it out loud. Marcus pretended he didn\'t hear it. The pivot happened anyway.' },
        ],
      },
      who_decided: {
        description: 'Marcus: "...the CEO. After a customer call. The customer was a friend of his from college. They suggested some things. They were — energetic suggestions."',
        choices: [
          { label: 'Park the work', effect: { pivotTicket: true, burnout: 12 }, log: 'A college friend re-routed your sprint. You parked the work. The branch will rot.' },
        ],
      },
    },
  },
  {
    id: 'requirements_changed', icon: AlertTriangle,
    title: 'Requirements changed (post-implementation)',
    start: 'open',
    requires: (s) => s.sprintPlan.some(t => t.type === 'feature' && !t.shipped && t.progress >= 6) && s.currentDay >= 2,
    nodes: {
      open: {
        descriptions: [
          'A Slack DM from Marcus: "hey can u jump on a call w/ design real quick — they had a session yesterday and the requirements for the thing you just built are kinda different now. like — meaningfully different."',
          'Design DM\'d directly: "Hey! Sorry to bother — we did a heuristic review yesterday and we want to chat through some concerns about the current implementation. When can you sync?"',
          'You\'re tagged in a Figma comment thread. The thread contains 31 comments. The first one starts: "small concern — i\'m not sure this matches the customer journey we aligned on." It\'s from yesterday.',
          'Marcus drops a Loom in the team channel. The Loom is 11 minutes. The voiceover starts with: "OK team — quick context shift. The PRD has been updated based on customer feedback."',
          'A DM thread between you, Marcus, and the lead designer. Subject: "small thing." The thread is 47 messages. The last 12 are about how the original design didn\'t actually account for the use case.',
        ],
        choices: [
          { label: 'Join the call', next: 'call' },
          { label: '"Can you summarize?"', next: 'summarize' },
          { label: '"Send me the new requirements doc."', next: 'doc' },
        ],
      },
      call: {
        description: 'You join. Seven people on the call. The designer is sharing a Figma file titled "v3 — final final." She says: "So we\'ve learned a lot about the user, and we want to take this in a more — guided direction. Less prescriptive. More — adaptive."',
        choices: [
          { label: '"What does that mean for the code?"', next: 'mean_for_code' },
          { label: 'Stay on mute and observe', next: 'observe', requires: REMOTE },
          { label: 'Stay quiet and observe', next: 'observe', requires: OFFICE },
        ],
      },
      mean_for_code: {
        description: 'Designer: "Oh — well, the modal is now a sidebar. The state lives in the URL now, not in component state. The auth flow happens before, not after. And — one more thing — it should support both light and dark mode dynamically."',
        choices: [
          { label: '"That\'s a rewrite."', next: 'its_a_rewrite' },
          { label: '"OK, I\'ll start over."', effect: { wasteProgress: true, burnout: 10 }, log: 'You agreed without pushing. The progress was wiped. The new requirements arrived 4 minutes after the call ended.' },
        ],
      },
      its_a_rewrite: {
        description: 'Designer: "I mean... mostly? But we already have most of the assets. So you\'re mostly just rewiring it." Marcus, in chat: "should be quick"',
        choices: [
          { label: '"This is two sprints of work."', effect: { wasteProgress: true, burnout: 12, capital: -1 }, log: 'You called it. Marcus typed "we\'ll figure out the timing in a follow-up." The follow-up was never scheduled. The progress was wiped anyway.' },
          { label: 'Just start over', effect: { wasteProgress: true, burnout: 14 }, log: 'You did not fight. The progress was wiped. The new design will probably also change.' },
        ],
      },
      observe: {
        descriptions: [
          { text: 'You stay muted. Three more people add requirements. The PM types "this is great" without being on camera. The designer says "we should circle back next week to align on the new scope." Marcus DMs you: "sounds good?"', requires: REMOTE },
          { text: 'You stay quiet. Three more people add requirements. The PM is half-engaged on his laptop, only nodding. The designer says "we should circle back next week to align on the new scope." Marcus, sitting next to you, DMs you: "sounds good?"', requires: OFFICE },
        ],
        choices: [
          { label: '"sounds good"', effect: { wasteProgress: true, burnout: 11, focusPct: -10 }, log: 'You typed "sounds good." The progress is gone. The new requirements will come next sprint.' },
        ],
      },
      summarize: {
        description: 'Marcus: "ok so basically we built it for a different user than the actual user. design did interviews. they want the whole thing to feel more — guided? not sure i fully get it but they\'re sure"',
        choices: [
          { label: '"How much rework?"', next: 'rework' },
          { label: '"Just throw it out and start over"', effect: { wasteProgress: true, burnout: 10 }, log: 'You volunteered. Marcus said "appreciated." You sat with the empty branch for 20 minutes.' },
        ],
      },
      rework: {
        description: 'Marcus: "honestly? probably most of it. design has new mocks. we\'ll have a kickoff next sprint. or this sprint maybe. depends on the doc"',
        choices: [
          { label: 'Sigh and rewrite', effect: { wasteProgress: true, burnout: 12 }, log: 'You started over. You will not finish in the time you have left.' },
        ],
      },
      doc: {
        description: 'Marcus: "haha there isn\'t one. design just has the figma. and i think a Loom? and there\'s a slack thread. it\'s all in slack honestly"',
        choices: [
          { label: 'Read the Slack thread', next: 'thread' },
          { label: '"I\'ll just rewrite it based on the Figma."', effect: { wasteProgress: true, burnout: 11 }, log: 'You parsed the Figma alone. The Figma will change three times before the deadline.' },
        ],
      },
      thread: {
        description: 'The thread is 47 messages long. Three people say "i love this." Two people raise concerns that get one 👍 each. The designer reposts the Figma four times. The CEO drops a one-line "lfg 🚀". The thread does not contain requirements.',
        choices: [
          { label: 'Just start over from a guess', effect: { wasteProgress: true, burnout: 13, focusPct: -15 }, log: 'You couldn\'t extract requirements from the thread. You started over from your best guess. The guess will be wrong.' },
        ],
      },
    },
  },
  {
    id: 'reorg', icon: AlertTriangle,
    title: 'Org-chart "refresh"',
    start: 'open',
    requires: (s) => s.sprint >= 2 && s.currentDay >= 2,
    nodes: {
      open: {
        descriptions: [
          'A calendar invite appears: "Org Update — All Hands — Mandatory." Thirty minutes from now. The body of the invite is empty. Slack is unusually quiet. People are typing in DMs.',
          'A 9 AM all-staff Slack message from the CEO: "I\'ll be in touch later today with some important updates. Please make sure your laptop is charged and you\'re reachable." It is currently 9:01.',
          'You arrive at your desk. Your manager\'s status is "🔒 in a meeting." So is your skip-level\'s. So is your skip-skip\'s. The cafe is unusually empty. Three other engineers are at their desks not typing.',
          (s, c) => `A "Quick Org Note" email from People hits your inbox. The body is one sentence: "Please join the all-staff meeting at ${T(c, 17)} today. Calendar invite to follow." It is ${T(c, 0)}.`,
          'Sarah DMs you: "u seeing this?" You haven\'t seen anything yet. Two minutes later a calendar invite arrives. It says "Org Update." There are 412 attendees. Some of them won\'t be by tomorrow.',
        ],
        choices: [
          { label: 'Attend the all-hands', next: 'all_hands' },
          { label: 'Check Blind first', next: 'blind' },
        ],
      },
      all_hands: {
        description: 'The CEO presents a slide titled "Continued Alignment Toward Customer-Obsessed Outcomes." She is reading from a teleprompter. She uses the phrase "people are our most important asset" twice. Two VPs are not on the call.',
        choices: [
          { label: 'Wait for the actual news', next: 'news' },
        ],
      },
      blind: {
        description: 'The top post is "RIF tomorrow?" with 312 comments. The comments are split between people who are confident, people who are panicking, and one person posting an AI-generated doom poem.',
        choices: [
          { label: 'Close Blind, attend the meeting', next: 'all_hands' },
          { label: 'Doom-scroll for 20 minutes', effect: { focus: -2, focusPct: -20, burnout: 8 }, log: 'You read 200 anonymous comments. None were verified. All of them seemed credible.' },
        ],
      },
      news: {
        description: 'CEO: "...as part of this realignment, we are restructuring our product organization to better serve customers." Three slides go by. Then: "Some teams are being merged. Some priorities are shifting. Your manager will be reaching out with specifics."',
        choices: [
          { label: 'Wait for your manager', next: 'manager' },
          { label: '"What does this mean for current work?"', next: 'current_work' },
        ],
      },
      manager: {
        description: 'Manager DMs you 14 minutes later. "hey — got a sec? quick context-set." You jump on. They explain that your team is being "re-platformed" under a new VP. Your current sprint work is "going into a discovery phase."',
        choices: [
          { label: '"...what does \'discovery\' mean?"', next: 'discovery' },
          { label: '"What about my current tickets?"', next: 'current_tickets' },
        ],
      },
      discovery: {
        description: 'Manager: "It means we\'re going to re-validate the assumptions before continuing. Probably a few weeks. Could be a quarter. The current work is — paused. We\'ll see what carries over."',
        choices: [
          { label: 'Accept the pause', effect: { pivotTicket: true, burnout: 16, capital: -1 }, log: 'Your in-progress work was moved to "discovery." It will not return. A different ticket appeared in its slot.' },
          { label: '"None of it will carry over."', next: 'none_carry' },
        ],
      },
      current_tickets: {
        description: 'Manager: "Yeah — uh — most of those are going to be — paused. There\'s a new initiative coming from the new VP. They want to start with — a fresh perspective."',
        choices: [
          { label: 'Park everything', effect: { pivotTicket: true, addUrgentFeature: true, burnout: 18, focusPct: -20, capital: -1 }, log: 'You parked it all. A new urgent ticket from the new VP appeared by Friday. The old work is in a graveyard.' },
        ],
      },
      none_carry: {
        description: 'Manager pauses. "...probably not, no. ... I\'m sorry. I really am. I had no input on this either."',
        choices: [
          { label: '"OK."', effect: { pivotTicket: true, burnout: 14, capital: 1 }, log: 'A real moment. You both knew it was theatre. The work was killed regardless.' },
        ],
      },
      current_work: {
        description: 'CEO: "Great question. Your manager will have specifics. In general — we\'re asking everyone to be flexible. To embrace the change. This is what high-performing organizations DO."',
        choices: [
          { label: 'Sigh', effect: { pivotTicket: true, burnout: 12 }, log: 'You sighed audibly. Two people on the call laughed. The work was killed.' },
        ],
      },
    },
  },
  // ===== BLOCKERS — external dependencies fail, you waste hours =====
  {
    id: 'broken_package', icon: Wrench,
    title: 'Blocker: @company/auth-sdk is broken',
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          'You\'re integrating @company/auth-sdk v2.4 — the library platform-team owns. Your integration test fails: "TypeError: Cannot read properties of undefined (reading \'token\')." The error message links to a Stack Overflow question from 2018 with no answers.',
          'You upgrade @company/auth-sdk from 2.4.0 to 2.4.1 because Renovate told you to. The patch bump silently changed return types. 14 of your tests fail with cryptic "Expected: object, Received: object" errors.',
          'Your CI just turned red across the org. Someone published @company/auth-sdk 2.5.0 to the internal registry without docs, without changelog, without a heads-up. The Slack thread asking "is this intentional?" has 47 messages.',
          'The platform team\'s @company/auth-sdk is now hard-requiring Node 22. Your service is on 18. The migration doc says "should be straightforward." It will not be straightforward.',
          'You import @company/auth-sdk. The autocomplete suggests an API. The API does not exist at runtime. The package was rewritten last quarter. The TypeScript types were not updated. The README has a banner: "🚧 Migration in progress."',
        ],
        choices: [
          { label: 'File a ticket with platform-team', next: 'ticket' },
          { label: 'Slack the platform-team channel', next: 'slack' },
          { label: 'Read the source on GitHub Enterprise', next: 'source' },
          { label: 'Just fork it and patch it yourself', next: 'fork' },
        ],
      },
      ticket: {
        description: 'You file PLAT-9847. Severity: Blocker. Three hours later, {dev} from platform-team replies: "Works on our machine. Can you provide a repro?"',
        choices: [
          { label: 'Spend 2 hours making a minimal repro', next: 'repro' },
          { label: '"It\'s in the linked GitHub issue."', next: 'snipe' },
          { label: 'Give up and fork it', next: 'fork' },
        ],
      },
      repro: {
        description: 'You build a clean repro. Working repo, screencast, the works. Three hours later {dev} responds: "We don\'t officially support that use case."',
        choices: [
          { label: '"It\'s the only documented use case."', next: 'push_back' },
          { label: 'Escalate to your manager', next: 'escalate' },
          { label: 'Give up and fork it', next: 'fork' },
        ],
      },
      push_back: {
        description: '{dev}: "Right, but we\'re deprecating that pattern in v3. Can you migrate to v3? It\'s not GA but it\'s close. We\'d love a design partner."',
        choices: [
          { label: '"v3 isn\'t GA. I\'m blocked NOW."', next: 'escalate' },
          { label: 'Migrate to v3 (it\'s in beta)', effect: { focus: -3, burnout: 9, debt: 5, wasteProgress: true }, log: 'You migrated to a beta library. v3 has a different API. Half of what you built was thrown out. You are now a "design partner."' },
        ],
      },
      snipe: {
        description: '{dev}, dryly: "We get a lot of tickets without repros, just confirming. Could you re-attach? Sometimes the link breaks for me."',
        choices: [
          { label: 'Suck it up, write the repro', next: 'repro' },
          { label: '"It is RIGHT THERE in the description."', next: 'escalate' },
        ],
      },
      slack: {
        description: 'You post in #platform-team-help. There are 47 unread messages above yours. The most recent question was answered three days ago. The team\'s default status is "🌴 deep work — DM for urgent."',
        choices: [
          { label: 'DM the team lead directly', next: 'dm_lead' },
          { label: 'Tag @here in the channel', next: 'tag_here' },
          { label: 'Just file a ticket', next: 'ticket' },
        ],
      },
      tag_here: {
        description: 'Three minutes later, the channel admin DMs you: "please don\'t @here in shared channels — let\'s be respectful of focus time. ✌️"',
        choices: [
          { label: 'Apologize, file a ticket', next: 'ticket' },
          { label: '"How am I supposed to flag a blocker?"', effect: { focus: -1.5, capital: -1, burnout: 5 }, log: 'You pushed back. The admin sent a 4-paragraph response about Slack etiquette. The blocker is still unfixed.' },
        ],
      },
      dm_lead: {
        description: '{dev} replies 3 hours later: "Hey! Thanks for flagging — yeah, known issue. Patch coming in v3 (in flight). For now I\'d just patch around it on your end."',
        choices: [
          { label: '"How do I patch around a bug that lives inside your package?"', next: 'how_patch' },
          { label: 'Fork and patch it', next: 'fork' },
        ],
      },
      how_patch: {
        description: '{dev}: "Honestly? Probably easiest to fork our package and override the broken function. We won\'t officially support it but most teams do that."',
        choices: [
          { label: 'Fork it', next: 'fork' },
          { label: '"Is there a real fix coming?"', effect: { focus: -1, burnout: 6 }, log: '{dev} types and re-types. "Q4 hopefully? Not on the current roadmap." You went and forked it.' },
        ],
      },
      source: {
        description: 'You open the repo on GitHub Enterprise. The source is minified. Sourcemaps return 404. The last commit message is "lol fix this later" from 8 months ago. The CONTRIBUTING.md is a single line.',
        choices: [
          { label: 'Try to debug from minified output', next: 'minified' },
          { label: 'File a ticket', next: 'ticket' },
          { label: 'Fork it', next: 'fork' },
        ],
      },
      minified: {
        description: 'Ninety minutes in, you\'ve narrowed it down to a function called `_0x4f7a`. You don\'t know what it does. The variables are all single letters.',
        choices: [
          { label: 'Keep going (you can feel it)', effect: { focus: -3, focusPct: -20, burnout: 11, debt: 4 }, log: 'You found the bug at hour 4. You patched it locally. The next platform release will overwrite your fix and you\'ll do this again.' },
          { label: 'Give up, file a ticket', next: 'ticket' },
        ],
      },
      fork: {
        description: 'You forked the SDK. You patched the bug. CI is green. The PR description is one line: "fixes #9847 — please upstream." It will not be upstreamed. You will maintain this fork forever.',
        choices: [
          { label: 'Ship it', effect: { focus: -2, burnout: 7, debt: 8, addUrgentFeature: true }, log: 'You forked the SDK. The fork is now a permanent maintenance burden. A new ticket appeared on your sprint: "[platform] Maintain auth-sdk fork."' },
        ],
      },
      escalate: {
        description: 'You escalate to your manager. Your manager talks to platform-team\'s manager. Two days of meeting-tag. The bug gets fixed in a hotfix. Your sprint is mostly over.',
        choices: [
          { label: '"OK."', effect: { focus: -4, burnout: 13, capital: -1, wasteProgress: true }, log: 'The bug got fixed eventually. The work that depended on the SDK had to be redone against the new behaviour.' },
        ],
      },
    },
  },
  {
    id: 'tickets_down', icon: Archive,
    title: 'Blocker: ticketing system is "experiencing degraded performance"',
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          'Slack #incidents: "We are aware of issues affecting the ticketing system. ETA: investigating." It has been three hours. You can\'t load any tickets, can\'t update status, can\'t see assignments. The status page is on its third "degraded" badge of the week.',
          'Jira is timing out on every page load. The status page says "All systems operational ✅". The vendor\'s X account has not posted in two weeks. Your CI integration with Jira is failing every PR.',
          'Linear is down. The vendor sent an email saying they\'re "investigating." The email arrived 47 minutes after the outage started. The root cause page says "we\'re still investigating" four hours later.',
          'GitHub Issues is loading but every action returns 502. New comments don\'t save. PR reviews don\'t save. Slack #incidents has 91 unread.',
          'Your internal ticket tool — built last quarter as part of the "platform consolidation" — is showing white screens for everyone. The team that owns it was reorged out. Nobody is on call.',
        ],
        choices: [
          { label: 'Refresh for the 14th time', next: 'refresh' },
          { label: 'Slack the team your status', next: 'slack_status' },
          { label: 'Code without tickets, from memory', next: 'code_blind' },
          { label: 'Use the time to update your résumé', next: 'resume' },
        ],
      },
      refresh: {
        description: 'Same error every time: "Server error: please try again." The page background flickers between white and gray. The status page has been "monitoring" for 2 hours.',
        choices: [
          { label: 'Keep refreshing', effect: { focus: -2, focusPct: -15, burnout: 7 }, log: 'You refreshed for 40 minutes. The system came back, then went down again. You did not get any work done.' },
          { label: 'Move on, code from memory', next: 'code_blind' },
        ],
      },
      slack_status: {
        description: 'You post in #team-channel: "Working on AUTH-4471 today, blocked on PLAT-9847." Marcus replies: "is that the urgent one or the other one?"',
        choices: [
          { label: '"...I literally cannot remember which is which"', next: 'cant_remember' },
          { label: '"The urgent one."', effect: { focus: -1.5, burnout: 5, debt: 3 }, log: 'You committed to a guess. The guess turned out to be the wrong one. You\'ll find out at standup tomorrow.' },
        ],
      },
      cant_remember: {
        description: 'Marcus: "ok lemme check — actually i can\'t load it either lol. i think it was the auth one? or maybe the dashboard? let\'s say auth."',
        choices: [
          { label: '"OK, auth it is"', effect: { focus: -1, burnout: 6, debt: 4 }, log: 'You and Marcus arbitrarily picked a priority. The system came back two hours later. Auth was not the priority.' },
        ],
      },
      code_blind: {
        description: 'You start working on what you THINK was the priority. Two hours in, you remember it\'s not. You also can\'t find the design doc because it links to a ticket that won\'t load.',
        choices: [
          { label: 'Keep going on what you have', effect: { focus: -2.5, burnout: 8, wasteProgress: true }, log: 'You worked on the wrong thing for 2 hours. When the system came back, you had to throw it out.' },
          { label: 'Stop. Just refactor something safe.', effect: { focus: -2, burnout: 4, debt: -2 }, log: 'You did a small cleanup commit while you waited. It was fine. It was also not what you were supposed to be doing.' },
        ],
      },
      resume: {
        description: 'You update your LinkedIn. You add three skills. You don\'t post about a job search but you flip the "open to work" toggle. You feel both better and worse.',
        choices: [
          { label: 'Close LinkedIn', effect: { focus: -1.5, burnout: -2 }, log: 'A small private rebellion. The system came back. You went back to work, lighter and heavier at once.' },
        ],
      },
    },
  },
  {
    id: 'network_down', icon: Wrench, inOffice: true,
    title: 'Blocker: office network is down',
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          'Office WiFi has been "experiencing degraded performance" for 90 minutes. IT has acknowledged it. Your phone hotspot is on day 4 of a 5-day rate-limit cycle. Slack works. Git push hangs after 8 minutes. CI cannot reach npm.',
          'The corporate VPN is rejecting all logins. IT\'s Slack post says "we are investigating." Without the VPN you cannot reach internal docs, GitHub Enterprise, or your dev environment.',
          'DNS resolution is intermittent. github.com works for some people, returns NXDOMAIN for others. The IT team has set up a status meeting to discuss the issue. The status meeting is on Zoom. Zoom requires DNS.',
          'Office firewall is blocking npm and PyPI. IT says it\'s a "rule update being rolled out" that "should not have affected production." Several teams are blocked. Yours is one of them.',
          'The office switch is reset-cycling every 4 minutes. You can do anything that fits in a 4-minute window. The quarterly facilities budget was used to "reskin the lobby." There is a new mural.',
        ],
        choices: [
          { label: 'Tether and grind through it', next: 'tether' },
          { label: 'Walk to the coffee shop across the street', next: 'coffee_shop' },
          { label: 'Use it as an excuse to go home', next: 'go_home', effect: { goHome: true } },
          { label: 'Just wait it out', next: 'wait' },
        ],
      },
      tether: {
        description: 'You connect to your phone. After 8 minutes you realize you\'re at 12 KB/s. A `git fetch` is at 14% with 47 minutes remaining. Slack notifications work fine.',
        choices: [
          { label: 'Push anyway, eventually', effect: { focus: -2.5, burnout: 7, focusPct: -15 }, log: 'The push completed 35 minutes later. CI failed because it could not reach npm. You could not open the CI logs.' },
          { label: 'Switch to working offline', next: 'offline' },
        ],
      },
      coffee_shop: {
        description: 'They\'ve put up a sign: "WiFi password rotates daily. Ask staff." The barista looks tired. There are no outlets. Your laptop is at 23%. A man at the next table is on a video call about "synergy."',
        choices: [
          { label: 'Stay until your laptop dies', effect: { focus: -1.5, burnout: 5 }, log: 'You worked on a 23% battery charge for 45 minutes. You shipped one small thing. The man\'s call lasted longer than yours.' },
          { label: 'Give up and go home', next: 'go_home', effect: { goHome: true } },
        ],
      },
      go_home: {
        description: 'You go home. The home internet is fine. You work for 2 hours. Marcus DMs: "you in office today? want to grab lunch with stakeholder X."',
        choices: [
          { label: '"Working from home today, network was down"', next: 'wfh' },
          { label: 'Make something up', effect: { focus: -1, capital: -0.5, burnout: 3 }, log: 'You said you had a dentist appointment. Marcus said "ok np!" The lie was effortless and slightly embarrassing.' },
        ],
      },
      wfh: {
        description: 'Marcus: "ok np — actually if u can hop online for the stakeholder thing? in 30?" The stakeholder thing was scheduled because the previous stakeholder thing wasn\'t actionable enough.',
        choices: [
          { label: '"OK"', effect: { focus: -1.5, burnout: 5 }, log: 'You joined from home. The stakeholder thing was 50 minutes. It produced a follow-up.' },
        ],
      },
      offline: {
        description: 'You start working offline. After 30 minutes you realize 70% of what you were going to do today requires the network. You cannot run tests. You cannot pull packages. You cannot search the docs.',
        choices: [
          { label: 'Read the docs you have on disk', effect: { focus: -2, burnout: 4 }, log: 'You read the README. The README was out of date. You learned three things you\'ll have to un-learn when the docs come back.' },
        ],
      },
      wait: {
        description: 'You refresh the IT status page. You read the Hacker News thread about your IT vendor\'s outage. You realize 90 minutes have passed. You have not done any of your work.',
        choices: [
          { label: 'Snap out of it', effect: { focus: -3, focusPct: -25, burnout: 8, goHome: true }, log: 'You snapped out of it after 2 hours. The network was still down. You went home.' },
        ],
      },
    },
  },
  // ===== INTERRUPTIONS — physical/environmental =====
  {
    id: 'fire_drill', icon: Flame, inOffice: true,
    title: 'Interruption: mandatory fire drill',
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          'A bell rings. Then a recorded voice: "ATTENTION. PLEASE PROCEED CALMLY TO THE NEAREST EXIT. THIS IS A DRILL." You were finally getting into a flow state. This is the third drill this quarter.',
          'A long, loud strobe and a klaxon. Six seconds in you remember today\'s the announced drill. You were nine minutes into a complicated debugging session.',
          'The fire alarm goes off WITHOUT a "this is a drill" announcement. Everyone freezes. Then someone says "this isn\'t scheduled, right?" Then the announcement plays: "PLEASE EVACUATE. THIS IS A DRILL." Then everyone exhales.',
          { text: (s, c) => `Calendar reminder: "Building Drill — please be near an exit at ${T(c, 1)}." It is ${T(c)}. You did not see the reminder until just now. You have been in a meeting in a windowless conference room.` },
          'The PA system clicks on. A voice that is clearly the office manager reading from a paper script begins: "Attention employees. We will be conducting a routine evacuation drill today. Please cooperate fully with your assigned warden."',
        ],
        choices: [
          { label: 'Grab laptop and go', next: 'go' },
          { label: 'Hide in the bathroom', next: 'hide' },
          { label: 'Ignore it', next: 'ignore' },
        ],
      },
      go: {
        description: 'You file out with the rest of the office. The parking lot is full of small clusters. {sales} is in the sales cluster, networking with someone you don\'t recognize. Sarah waves at you from across the lot. The fire warden has a clipboard and is being very serious about it.',
        choices: [
          { label: 'Stand by yourself', next: 'alone' },
          { label: 'Go say hi to Sarah', next: 'sarah' },
          { label: 'Join {sales} and the sales cluster', next: 'sales_cluster' },
          { label: 'Just keep walking to your car and WFH', next: 'walk_off' },
        ],
      },
      walk_off: {
        description: 'You drift toward the back row of the lot. The warden is occupied with someone arguing about whether the alternate exit counts. You unlock your car. Nobody calls your name. By the time the drill ends, you\'re halfway home.',
        choices: [
          { label: 'Settle in at your kitchen table', effect: { focus: -0.5, capital: -0.5, morale: 1, burnout: -1, goHome: true }, log: 'You bailed mid-drill. You were on your couch by the time the all-clear went out. Marcus DM\'d "you good?" two hours later. You said yes.' },
          { label: 'Slack the warden later, blame "an emergency"', effect: { focus: -0.5, capital: -1, morale: 0, burnout: 0, goHome: true }, log: 'You bailed and pre-emptively explained. The warden replied "noted." The capital cost was real. So was the rest of your afternoon.' },
        ],
      },
      alone: {
        description: 'You stare at your phone. You see a Slack notification you can\'t respond to. You can hear Doug, two clusters over, telling someone about the milk thing. The sun is too bright.',
        choices: [
          { label: 'Eavesdrop on Doug', effect: { focus: -1.5, burnout: 4 }, log: 'You learned more about the oat-milk supplier crisis. The drill ended. You went back inside slightly worse.' },
          { label: 'Just exist for 25 minutes', effect: { focus: -2, burnout: 3 }, log: 'You stared at the parking lot. A small breeze. It was almost peaceful. Then the drill ended.' },
        ],
      },
      sarah: {
        description: 'Sarah: "Third one this quarter, right? I think they\'re having a competition with corporate to see who can do more \'safety theater.\'"',
        choices: [
          { label: '"Probably."', effect: { focus: -1, burnout: -2, capital: 0.5 }, log: 'A real moment with a real coworker. The drill ended. You went back inside slightly better.' },
        ],
      },
      sales_cluster: {
        description: '{sales} introduces you to "Skip" from sales. Skip is wearing a "gameday" polo. Skip wants to know what you do, then wants to know if you\'ve heard of pickleball.',
        choices: [
          { label: 'Endure the small talk', effect: { focus: -1.5, capital: 1, burnout: 4 }, log: 'Skip now has your number. {sales} is "so glad we connected on this." You learned about Stefan.' },
          { label: '"Excuse me, work emergency."', effect: { focus: -0.5, capital: -0.5, burnout: 1 }, log: 'You bailed back to the warden\'s side. The warden was on his phone.' },
        ],
      },
      ignore: {
        description: 'A fire warden — the alternate, who is even more serious — comes over to your desk. "Sir, this isn\'t optional. Please proceed to the exit. Now."',
        choices: [
          { label: 'Go', next: 'go' },
          { label: 'Argue', next: 'argue' },
        ],
      },
      argue: {
        description: '"I\'m aware it\'s a drill. I have a deadline." Warden: "I have to report this."',
        choices: [
          { label: '"Report it."', effect: { focus: 0, capital: -1, burnout: 2 }, log: 'You held your ground. The warden reported it. Nothing came of it. You finished the bug fix.' },
          { label: 'Go anyway', next: 'go' },
        ],
      },
      hide: {
        description: 'You\'re in the bathroom. The motion-sensor light goes off because you\'re sitting still. You sit in the dark for 22 minutes. Someone comes in, doesn\'t realize you\'re there, has a long phone call about their dog\'s separation anxiety.',
        choices: [
          { label: 'Endure the bathroom darkness', effect: { focus: -1, focusPct: 5, burnout: 1 }, log: 'A weird private moment. You learned more than you wanted to about a dog named Mr. Pickles. The drill ended. You returned.' },
        ],
      },
    },
  },
  // ===== MEETING CASCADES — late starts, overruns, the person who matters had to leave =====
  {
    id: 'meeting_cascade', icon: Clock,
    title: 'Stakeholder review ("quick 30-minute sync")',
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          { text: (s, c) => `You're at the conference room at ${T(c)} sharp. The room is empty. You check the invite — you're in the right place. Slack: "Marcus is finishing up another thing, will be a few minutes." It is now ${T(c, 8)}.`, requires: OFFICE },
          { text: (s, c) => `You join the Zoom at ${T(c)} sharp. You are alone in the meeting. At ${T(c, 4)} a Slack message arrives: "running 5 min late, sorry — getting coffee." At ${T(c, 9)} the same person posts: "ok actually 10 — got cornered at the espresso machine."`, requires: REMOTE },
          { text: (s, c) => `The room is booked ${T(c)}–${T(c, 30)}. You arrive at ${T(c)}. The previous meeting is still in there. The previous meeting is run by a VP. The VP makes brief eye contact with you and turns back to her group.`, requires: OFFICE },
          { text: (s, c) => `The meeting is supposed to start at ${T(c)}. At ${T(c)} you are the only one on the call. At ${T(c, 5)} a "running late, my prev ran over" Slack lands. At ${T(c, 11)} a different attendee posts the same. At ${T(c, 14)} Marcus joins, audio not working.`, requires: REMOTE },
          { text: 'You\'ve been waiting in the room for 9 minutes. The participants are all pinging in Slack saying "joining in 2." None have joined. The meeting was supposed to be 30 minutes. There are now 21 minutes left.', requires: OFFICE },
          'Calendar invite says: "Quick sync (15 min)." It is hour two. The other six people have spent the last 18 minutes deciding who is the right person to be in the meeting. The right person is not in the meeting. The right person is in another meeting that was scheduled to discuss who the right person is.',
          { text: 'You\'re on Zoom. The host is in a coffee shop with very loud espresso machines. The host has not muted. The host is also clearly talking to a barista. Six other people are typing "🤐" in the chat.', requires: REMOTE },
          'You join the call. Marcus opens with: "before we start — Logan is going to drop in for the first 5 minutes. So let\'s do intros first." Logan stays for 41 minutes and intros never end.',
          { text: (s, c) => `${T(c)} meeting. At ${T(c, 2)} someone's laptop lid closes mid-sentence. At ${T(c, 5)} the lid reopens — different person. At ${T(c, 7)} you realize Marcus has been double-booked and is on a different call in the same room, behind a curtain.`, requires: OFFICE },
          'The host posts the agenda 4 minutes after the meeting was supposed to end. The agenda is "OPEN DISCUSSION." There are 11 attendees. None of them know each other\'s names.',
          { text: 'You\'re at the conference room. Marcus is in the room — physically — but on his phone. He waves you to wait. He\'s on a different meeting. With his other team. He\'ll be "right with you." This goes on for 17 minutes.', requires: OFFICE },
        ],
        choices: [
          { label: 'Wait quietly', next: 'wait' },
          { label: 'Go grab a coffee while you wait', next: 'coffee_grab' },
          { label: 'DM Marcus to check', next: 'dm_marcus' },
        ],
      },
      wait: {
        descriptions: [
          { text: (s, c) => `At ${T(c, 11)}, {bro} from sales walks in carrying a coffee. "Sorry sorry — Doug is having TROUBLE at the espresso bar." At ${T(c, 14)} the platform-team rep dials in. At ${T(c, 17)} Marcus finally arrives, apologizes, and asks if anyone has seen the agenda.\n\nNobody has.`, requires: OFFICE },
          { text: (s, c) => `At ${T(c, 11)}, {bro} from sales joins, audio first, video later, holding a coffee. "Sorry sorry — the espresso bar had a whole thing." At ${T(c, 14)} the platform-team rep dials in. At ${T(c, 17)} Marcus finally joins, apologizes, and asks if anyone has seen the agenda.\n\nNobody has.`, requires: REMOTE },
        ],
        choices: [
          { label: 'Push to start anyway', next: 'start' },
          { label: 'Wait for the agenda', next: 'no_agenda' },
        ],
      },
      coffee_grab: {
        descriptions: [
          { text: (s, c) => `You go to the kitchen. Doug is there, mid-dictation about the milk. By the time you extract yourself it's ${T(c, 13)}. Back in the conference room the meeting has started without you. Marcus is mid-sentence: "...so basically we need to align on strategy."`, requires: OFFICE },
          { text: (s, c) => `You go to your kitchen. The dishwasher needs emptying. You empty it. You wipe the counter. By the time you're back it's ${T(c, 13)} and the call has started without you. Marcus is mid-sentence: "...so basically we need to align on strategy."`, requires: REMOTE },
        ],
        choices: [
          { label: 'Sit down quietly', effect: { focus: -1, burnout: 5 }, log: 'You missed the first 8 minutes. The first 8 minutes were the only useful 8 minutes. The next 50 were not.' },
        ],
      },
      dm_marcus: {
        description: (s, c) => `Marcus DMs back at ${T(c, 12)}: "omg sorry running 5 min late — actually 10. our prev is going long bc Brad raised something." At ${T(c, 23)} Marcus joins. The prev ran 53 minutes over. This meeting was scheduled to end at ${T(c, 30)}.`,
        choices: [
          { label: 'Sigh, push to start', next: 'start' },
        ],
      },
      no_agenda: {
        description: (s, c) => `Marcus searches his Slack DMs for the agenda. By the time he finds it, it's ${T(c, 23)}. The "30-minute sync" has now started 23 minutes late on a 30-minute booking.`,
        choices: [
          { label: 'Sigh, push to start', next: 'start' },
        ],
      },
      start: {
        description: (s, c) => `The meeting starts at ${T(c, 18)}. Marcus presents slide 1 of 8. At ${T(c, 35)} {bro} interrupts: "Wait — I have to drop at ${T(c, 30)} for another sync. Can we do the action items now?"`,
        choices: [
          { label: '"We just started."', next: 'we_started' },
          { label: '"Sure, what action items?"', next: 'no_action_items' },
        ],
      },
      we_started: {
        description: (s, c) => `Marcus: "Yeah we're only on slide 3. Maybe just stay 5 more minutes?" {bro} stays. At ${T(c, 42)} {bro} stands up: "I really have to go — can someone send me the recording? I trust whatever the room decides." {bro} leaves.`,
        choices: [
          { label: 'Continue without {bro}', next: 'without' },
        ],
      },
      no_action_items: {
        description: (s, c) => `Marcus, flustered: "We — we haven't gotten there yet, that was going to be the last slide." {bro}: "OK, I'll catch up async then." {bro} leaves at ${T(c, 33)}. Marcus has lost his place in the deck.`,
        choices: [
          { label: 'Wait for Marcus to recover', next: 'without' },
        ],
      },
      without: {
        description: 'The platform-team rep speaks up: "Real quick — without {bro}, we can\'t actually decide on the integration approach. {bro} owns that surface." Three people nod. Marcus: "We can still align on framing."',
        choices: [
          { label: '"...so why are we still meeting?"', next: 'why_meeting' },
          { label: 'Stay quiet, let it run', next: 'circles' },
        ],
      },
      circles: {
        description: (s, c) => `For 25 minutes the conversation goes in circles. "We should ask {bro}." "{bro} just left." "Can someone Slack {bro}?" "{bro} is in their next meeting." "OK so we'll just — bring it to {bro} async." "...wasn't that what this meeting was for?"\n\nThe meeting ends at ${T(c, 44)}. Fourteen minutes over a 30-minute booking. Your next meeting was supposed to start at ${T(c, 30)}.`,
        choices: [
          { label: 'Pack up, you\'re late for your next one', effect: { focus: -2.5, burnout: 11, addUrgentFeature: true }, log: 'You were 14 minutes late to your next meeting. They had already started without you. You missed the only part relevant to your work. A follow-up ticket was assigned to you. Marcus assigned it.' },
        ],
      },
      why_meeting: {
        description: 'Marcus: "We can still align on the framing! Then we\'ll have a follow-up with {bro} to actually decide." Someone whispers "this IS the follow-up." Marcus heard it but pretends he didn\'t.',
        choices: [
          { label: 'Endure 30 more minutes', effect: { focus: -2.5, burnout: 10, addUrgentFeature: true }, log: 'You endured 30 more minutes of "alignment on framing." A new ticket fell out: "Sync with {bro} re: integration approach." It is on you.' },
          { label: '"I have my own next meeting."', next: 'leave_for_next' },
        ],
      },
      leave_for_next: {
        description: 'You stand up. "I have to drop for my next one." Marcus: "Yeah — totally — but quick before you go: can you own the action items from this?" There were no action items.',
        choices: [
          { label: 'Take the fake action items', effect: { focus: -1, capital: -0.5, burnout: 7, addUrgentFeature: true }, log: 'You agreed to "follow up with {bro} re: alignment." A real ticket appeared in your sprint to track this fake action item.' },
          { label: '"No, sorry."', effect: { focus: -0.5, capital: -1.5, burnout: 4 }, log: 'You said no. Marcus looked wounded. The room was quiet for a beat. You left.' },
        ],
      },
    },
  },
  // ===== MORNING ARRIVAL — only fires at the very start of a day =====
  {
    id: 'morning_arrival', icon: Wrench, inOffice: true,
    title: 'Morning arrival',
    descriptions: [
      'Your badge stopped working at the front door. The receptionist is on PTO. The backup receptionist is also on PTO. There is a sign that says "in case of emergency, call IT" with no number.',
      'The parking lot is full. The overflow parking is full. You park three blocks away. It starts raining halfway back.',
      'You arrive on time. The office is locked. The building manager is "running late." Three other people are standing outside reading their phones.',
      'You badge in. The reader beeps red. You badge again. Green. The door does not open. You stand there for thirty seconds before pushing it.',
      'The elevators are inspecting. There is a sign. The sign is dated three weeks ago. The stairwell smells like new paint.',
      'Construction in the lobby. There\'s a single funnel-corridor of plastic sheeting. A worker waves you through. The plastic sheeting smells like new car.',
    ],
    start: 'open',
    nodes: {
      open: {
        description: '',  // resolved at fire time from descriptions
        choices: [
          { label: 'Find a workaround and get in', effect: { focus: -0.5, burnout: 1 }, log: 'You got in. It cost ten minutes you needed.' },
          { label: 'Wait it out in the lobby', effect: { focus: -1, burnout: 2 }, log: 'You waited. Twenty minutes. Marcus pinged you "just checking in."' },
          { label: 'Just go home and remote', effect: { focus: 0, capital: -0.5, morale: 1, burnout: -1, goHome: true }, log: 'You drove home. WiFi is faster. Nobody noticed for an hour.' },
        ],
      },
    },
  },
  // ===== BUILDING ISSUES — facilities crap that steals time =====
  {
    id: 'building_issue', icon: Wrench, inOffice: true,
    title: 'Building issue',
    // Multiple description variants so it doesn't read identical each time.
    descriptions: [
      'The elevators are out. All four of them. The maintenance company sent someone yesterday who "couldn\'t replicate the issue." Your stand-up is on the 14th floor.',
      'The office VoIP system is down for the third time this month. You can\'t take stakeholder calls. Marcus says "just use your personal cell, it\'s fine, just this once" — for the third time this month.',
      'The HVAC is broken. The office is 27°C and rising. Doug is wearing a sweater. He says "feels good" without irony.',
      'The bathroom on your floor is closed for "extensive maintenance." The next nearest one is two floors up. There is no signage. People are just figuring it out.',
      'The kitchen sink has been "out of order" for nine days. There is a sign. The sign has been laminated. Three new mugs are stacked precariously on top of the dishwasher that also doesn\'t work.',
    ],
    start: 'open',
    nodes: {
      open: {
        // Picked at fire time — see ExecutionPhase render
        description: '',
        choices: [
          { label: 'Try to file a Facilities ticket', next: 'ticket' },
          { label: 'Slack #building-issues', next: 'slack' },
          { label: 'Just go home and work remote', next: 'home', effect: { goHome: true } },
          { label: 'Ignore it, work around it', next: 'workaround' },
        ],
      },
      ticket: {
        description: 'You navigate to the Facilities ticket portal. It requires SSO. SSO redirects you back to the portal. The portal asks for SSO. You realize you\'re in an infinite redirect loop.',
        choices: [
          { label: 'Try a different browser', next: 'other_browser' },
          { label: 'Just email facilities', next: 'email_facilities' },
          { label: 'Give up', effect: { focus: -2, burnout: 6 }, log: 'You spent 30 minutes on the SSO loop. The issue is unfiled. The building is still broken.' },
        ],
      },
      other_browser: {
        description: 'Firefox works. The form has 47 required fields. One field is "Cost Center." You don\'t know your cost center. The dropdown has 312 entries.',
        choices: [
          { label: 'Pick one randomly', effect: { focus: -2.5, capital: -0.5, burnout: 7 }, log: 'Your ticket was rejected for "wrong cost center." It will be re-routed three times before someone closes it as duplicate.' },
          { label: 'Slack a colleague to ask', next: 'slack' },
        ],
      },
      email_facilities: {
        description: 'The auto-reply: "Thank you for contacting Facilities. Our current response time is 5–7 business days. For URGENT issues, please contact your office manager." The office manager left two months ago. They were not replaced.',
        choices: [
          { label: 'Reply marking it URGENT', effect: { focus: -1, burnout: 4 }, log: 'You replied URGENT. The auto-reply re-fired. Nothing else happened.' },
        ],
      },
      slack: {
        description: '#building-issues has 14 unread messages. Three are about the same elevator. One is from {complainer} asking "is anyone else having issues with the milk situation?" Two are passive-aggressive complaints with screenshots of empty Snyder\'s pretzel boxes.',
        choices: [
          { label: 'Add yours to the pile', effect: { focus: -1.5, burnout: 5 }, log: 'You posted. Two people reacted with 😤. One person replied "same." No fix.' },
          { label: 'Read all 14 messages first', next: 'read_all' },
          { label: 'Bail', effect: { focus: -0.5, burnout: 2 }, log: 'You closed Slack. The issue is not your problem to solve.' },
        ],
      },
      read_all: {
        description: 'You spent 22 minutes reading. You learned the elevator has been broken three times this quarter. You learned that {complainer} once filed 14 tickets about a single light fixture. You learned someone here has STRONG opinions about the office plant rotation.',
        choices: [
          { label: 'Walk away from the channel forever', effect: { focus: -2, burnout: 5, morale: -3 }, log: 'You unsubscribed from #building-issues. Three minutes later you got DM\'d to ask why you unsubscribed.' },
        ],
      },
      home: {
        description: 'You pack up. Marcus DMs immediately: "are you in office today? want to grab a quick coffee with stakeholder Y at 2pm." You realize you\'re always pinged the moment you leave.',
        choices: [
          { label: '"Working from home today, building issue."', next: 'wfh_excuse' },
          { label: 'Say yes, come back', effect: { focus: -3, capital: 0.5, burnout: 9, returnOffice: true }, log: 'You came back. The building issue was not resolved. The coffee with stakeholder Y was unproductive.' },
        ],
      },
      wfh_excuse: {
        description: 'Marcus: "ahh ok np — actually if you can pop on for the 2pm? remote? would be nice to have you there." Marcus does not consider remote-from-home and "in the meeting" mutually exclusive.',
        choices: [
          { label: '"OK"', effect: { focus: -1.5, burnout: 6 }, log: 'You joined from your kitchen. The meeting was 50 minutes. Nothing was decided. You ate cold pasta on camera.' },
          { label: 'Ignore the message', effect: { focus: 0, capital: -1.5, burnout: 3, morale: 4 }, log: 'You ignored Marcus and worked. Marcus DM\'d twice more. The work you did was actually good. You felt slightly subversive.' },
        ],
      },
      workaround: {
        description: 'You decide to work around the issue. Specifically: stairs / different bathroom / personal hotspot / sweat through it. You start. After 30 minutes you realize the workaround is actually quite annoying.',
        choices: [
          { label: 'Power through anyway', effect: { focus: -2, burnout: 6 }, log: 'You powered through. You smell. Your knees hurt. You used 1.4GB of personal data. Your work was fine.' },
          { label: 'Give up, go home', next: 'home', effect: { goHome: true } },
        ],
      },
    },
  },
  // ===== AT-HOME INTERRUPTIONS — only fire when state.atHome is true =====
  // Pulled in by applyChoice's goHome handler (and a small chance during a
  // coffee break at home). Tagged atHome:true so pickEvent never picks them
  // for the office-day pool.
  {
    id: 'home_neighbor', icon: Megaphone,
    title: 'Neighbor noise',
    atHome: true,
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          'A landscaping crew has shown up next door. Three leaf blowers, simultaneously, in a coordinated triangle. Your kitchen window does not fully close. Your call in 40 minutes is on Zoom.',
          'Your neighbor is having a tree removed. The chainsaw runs in 90-second bursts. The bursts are perfectly anti-correlated with your typing flow. You have written the same line of code three times.',
          'Construction next door. The radio is on. The radio is playing the same four songs on rotation. You can sing along to one of them now and you do not want to.',
          'Your upstairs neighbor has rearranged their living room. They are still rearranging it. It has been forty minutes. Something with wheels keeps moving back and forth above your head.',
          'Someone in the building is practicing trumpet. Scales. Repeatedly. Always missing the same note. Always.',
        ],
        choices: [
          { label: 'Put on headphones and grind', effect: { focus: -1.5, burnout: 4 }, log: 'You put on headphones. The bass shook through anyway. You shipped a small thing. Your jaw is tight.' },
          { label: 'Walk to a coffee shop', effect: { focus: -1, burnout: 2, morale: 1 }, log: 'You walked to the place with the good iced coffee. The Wi-Fi was passable. You were briefly happy.' },
          { label: 'Knock on their door', next: 'confront' },
          { label: 'Wait it out', effect: { focus: -0.5, burnout: 1, morale: 1 }, log: 'You read for twenty minutes. The noise stopped on its own. You returned slightly calmer.' },
        ],
      },
      confront: {
        description: 'They open the door three inches. You explain you work from home. They say "yeah, us too, sorry." Nothing changes. The noise continues.',
        choices: [
          { label: 'Smile, retreat', effect: { focus: -1, burnout: 3 }, log: 'You retreated. The noise continued. You put on headphones anyway.' },
          { label: 'Push back', effect: { focus: -2, burnout: 5, morale: -2 }, log: 'You insisted. They closed the door. The noise continued. Now there is also a feeling.' },
        ],
      },
    },
  },
  {
    id: 'home_appliance', icon: Wrench,
    title: 'Something at home is leaking',
    atHome: true,
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          'You hear a sound from the laundry room. You investigate. The washing machine is leaking. There is a thin sheen of water spreading across the floor. The floor is hardwood.',
          'Your dishwasher is mid-cycle and making a sound it has never made before. A new sound. A wet sound. You pause it. You open it. There is more water than there should be.',
          'You smell something. You walk through the apartment. The smell is from the bathroom. Specifically, from below the sink. Something has decided today is the day.',
          'The water heater is making a knocking sound. Rhythmic. Louder than it has been before. You search "water heater knocking" in another tab. The results are not reassuring.',
          'The fridge has been running constantly for the last hour. You only just noticed because the kitchen is somehow warmer than the rest of the apartment.',
        ],
        choices: [
          { label: 'Mop / contain it and keep working', effect: { focus: -2, burnout: 5 }, log: 'You spent twenty minutes with towels. You worked the rest of the day with a small problem in the back of your mind.' },
          { label: 'Call the landlord / a repair person', next: 'call' },
          { label: 'Ignore it, it\'s probably fine', effect: { focus: -1, burnout: 3, morale: -2 }, log: 'You ignored it. The problem grew. You will deal with it tonight. You added it to a mental list that already has 14 items.' },
        ],
      },
      call: {
        description: 'You spend 18 minutes on hold. The hold music is one minute long, on a loop, with a saxophone. When someone finally answers, they need photos and your unit number and a description and the model number.',
        choices: [
          { label: 'See it through', effect: { focus: -3, burnout: 6, capital: -0.5 }, log: 'They will "send someone next Tuesday between 10 and 4." You missed two Slack pings during the hold music.' },
        ],
      },
    },
  },
  {
    id: 'home_doorbell', icon: Briefcase,
    title: 'Doorbell',
    atHome: true,
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          'The doorbell rings. Through the peephole: a delivery driver with a clipboard. The package needs a signature. You did not order anything that needed a signature.',
          'A door-to-door salesperson is at your door. They are selling solar panels. They have been trained not to leave when you say "no." They are wearing a polo with a logo you have never seen.',
          'Two people in matching polos. They want to "talk for a few minutes" about the neighborhood and your roof. They have a tablet.',
          'The mail carrier is at the door with a parcel that won\'t fit in the box. Friendly. Wants to chat about the weather. You are wearing the t-shirt you slept in because you have been on a remote standup.',
          'Someone is collecting signatures for something. They have a clipboard. They have a smile. They have already started talking through the door.',
        ],
        choices: [
          { label: 'Answer the door', next: 'answer' },
          { label: 'Pretend not to be home', effect: { focus: -1, burnout: 2 }, log: 'You stood very still in the kitchen for four minutes. They left a notice. You will deal with it tomorrow.' },
          { label: 'Yell "leave it at the door"', effect: { focus: -0.5, burnout: 1 }, log: 'You yelled through the door. They left it. You returned to your laptop. Slack had three new messages.' },
        ],
      },
      answer: {
        description: 'You open the door. They are friendly and persistent. The conversation lasts longer than you planned. You are aware of the meeting starting in seven minutes.',
        choices: [
          { label: 'Be polite, escape', effect: { focus: -1.5, burnout: 4 }, log: 'You escaped after eleven minutes. You joined the meeting two minutes late, slightly out of breath, in the same t-shirt.' },
          { label: 'Be rude, escape faster', effect: { focus: -0.5, burnout: 2, morale: -1 }, log: 'You shut it down in 90 seconds. You felt slightly bad about it. You returned to your laptop.' },
        ],
      },
    },
  },
  {
    // Generic "someone you live with" — partner / roommate / parent / kid.
    // Kept abstract on purpose so the variants land for whatever home setup
    // the player imagines.
    id: 'home_household', icon: Heart,
    title: 'Someone at home needs you',
    atHome: true,
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          'A small head appears in the doorway. "Are you on a call." It is technically a question. You are not technically on a call. There is a drawing involved.',
          'Your partner pokes their head in. "Sorry — are you in a meeting?" You are not. You can see them deciding whether the question they came to ask is worth the cost.',
          'The cat is on your keyboard. Not next to it. On it. Three new tabs have opened. One is a Wikipedia article about a 14th-century Pope.',
          'The dog is at the door, looking at you, then at the door, then at you. You promised yourself you\'d take the morning walk. You did not take the morning walk.',
          'Your kid bursts in holding something they made. They want you to look at it now. The thing is genuinely good.',
          'A roommate knocks. "Quick thing — packages, the buzzer, also do we have any —" they trail off. Whatever it was, it wasn\'t quick.',
        ],
        choices: [
          { label: 'Engage warmly, take a few minutes', effect: { focus: -0.5, burnout: -2, morale: 5 }, log: 'You stopped what you were doing. You were present for five minutes. The work was still there afterward. You felt a little less hollow.' },
          { label: 'Ask them to come back later', next: 'defer' },
          { label: '"I\'m on a call"', effect: { focus: -0.25, burnout: 2, morale: -3 }, log: 'You lied. They left. You weren\'t on a call. You felt the lie sit there for the rest of the afternoon.' },
        ],
      },
      defer: {
        description: 'You ask for ten minutes. They say "OK." You can see them register that "ten minutes" has historically meant fifty.',
        choices: [
          { label: 'Actually keep your word', effect: { focus: -1, burnout: -1, morale: 4 }, log: 'You wrapped up at the ten-minute mark and went to find them. They were surprised. So were you.' },
          { label: 'Get sucked back in for an hour', effect: { focus: -1.5, burnout: 4, morale: -3 }, log: 'You meant to come back. You didn\'t. You found them eating dinner alone.' },
        ],
      },
    },
  },
  // ===== COMBINATION EVENTS — multiple pressures stacking with logical handoff =====
  {
    // Marcus + Priya (sales) corner you about the SAME feature, in the SAME meeting.
    // Combines: scope_change pressure + addUrgentFeature + capital tax.
    id: 'sales_pincer', icon: Users,
    title: 'Marcus and Priya have "a quick chat" with you',
    inOffice: true,
    requires: (s) => s.sprint >= 2 && s.currentDay >= 2 && s.sprintPlan.length >= 2,
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          'Marcus and Priya from sales corner you in the kitchen. They are doing the thing where they look at each other before speaking — the rehearsed thing. Marcus opens. "So — Priya and I were just talking, and we wanted to come to you together because we feel like alignment is so important here."',
          'A calendar invite, no agenda: "Quick alignment — Marcus / Priya / you." 15 minutes. The room they booked is the small one with no whiteboard. Marcus and Priya are both there when you arrive. Both are smiling.',
          'Marcus DMs: "got 10? Priya and i want to brainstorm something with you — collaboratively." The Slack DM has both of them in it. The DM is named "Team You 🚀."',
          'Priya rolls her chair to your desk. Marcus appears 14 seconds later. They have clearly walked separately to make this look unplanned. Priya: "OK so — Marcus and I had an idea." Marcus, immediately: "well, Priya had the idea. I love it."',
        ],
        choices: [
          { label: '"What\'s the idea?"', next: 'idea' },
          { label: '"Why are you both here?"', next: 'why_both' },
          { label: '"This feels like an ambush."', next: 'ambush' },
        ],
      },
      idea: {
        descriptions: [
          'Marcus: "So — Priya has a customer who is — uh — \'on the fence\' about renewing." Priya: "On a knife\'s edge. Like, this week." Marcus: "And the thing they need is something we — we believe is on the roadmap anyway. Right Priya?" Priya: "Definitely on the roadmap." It is not on the roadmap.',
          'Priya: "OK so — Greenfield Holdings is asking for a CSV export. Specifically, with custom columns. Specifically, by Friday. Marcus tells me your team can probably squeeze it in?"',
          'Marcus: "We were thinking — the analytics page you\'re building? What if it ALSO had a print-friendly view? Priya\'s customer asked. They print things. They\'re a print-things company."',
        ],
        choices: [
          { label: '"What did you commit to and when?"', next: 'committed' },
          { label: '"That\'s a separate ticket. Let\'s triage in planning."', next: 'triage' },
          { label: '"Sure, I\'ll squeeze it in."', effect: { addUrgentFeature: true, scopeCreep: true, debt: 4, capital: 0.5, burnout: 6 }, log: 'You agreed in front of both of them. The feature was added. Priya immediately Slacked the customer. The customer immediately had three more requests.' },
        ],
      },
      why_both: {
        description: 'Marcus, slightly defensive: "We just felt — alignment is — important. And, you know, when sales and product are aligned, engineering can really —" Priya cuts in: "We didn\'t want to triangulate."',
        choices: [
          { label: '"Triangulating is exactly what this is."', next: 'ambush' },
          { label: '"OK. Tell me about the ask."', next: 'idea' },
        ],
      },
      ambush: {
        description: 'Marcus and Priya look at each other. Priya, recovering: "I — I hear you. That wasn\'t our intention." Marcus, doubling down: "I think \'ambush\' is a strong word. We\'re here in good faith." Both still smiling.',
        choices: [
          { label: '"Then let\'s do this 1:1, with the actual stakeholder."', effect: { focus: -0.5, capital: 1.5, burnout: 3 }, log: 'You broke the pincer move. Marcus rebooked the conversation as three separate 1:1s. Two of them never happened.' },
          { label: '"Fine. Tell me the ask."', next: 'idea' },
        ],
      },
      committed: {
        description: 'Priya: "I — I told them \'soon.\'" Marcus: "Which we\'d translate as — late this week, end of next at the latest. Realistically."',
        choices: [
          { label: '"You committed without engineering. That\'s the bug."', next: 'process_bug' },
          { label: '"Fine, but it goes in next sprint."', next: 'next_sprint' },
          { label: '"OK, I\'ll do it."', effect: { addUrgentFeature: true, debt: 5, capital: 1, burnout: 7 }, log: 'You took the ticket. Priya thanked you in #wins. Marcus called you "a great partner." The customer asked for two more features inside an hour.' },
        ],
      },
      process_bug: {
        description: 'Marcus: "I hear you. Honestly. But the deal closes Friday." Priya: "And we don\'t have time to fix the process before Friday."',
        choices: [
          { label: '"Then this is on you two, not on me."', effect: { focus: -0.5, capital: -1.5, burnout: 4, morale: 2 }, log: 'You held the line. Marcus and Priya jointly Slacked your manager. Your manager DM\'d you "u up?" 90 minutes later.' },
          { label: '"Fine — but ONLY this once."', effect: { addUrgentFeature: true, debt: 3, capital: 0.5, burnout: 5 }, log: 'You folded with a moral footnote. The "only this once" was used 3 sprints ago. It will be used again.' },
        ],
      },
      next_sprint: {
        description: 'Priya pales. "Next sprint is — too late. The CFO is going to be on the call Tuesday." Marcus: "Could you — you know — start it tonight? Just the spike?"',
        choices: [
          { label: '"No."', effect: { focus: -0.25, capital: -1.5, burnout: 2, morale: 3 }, log: 'You said no. Priya looked at Marcus. Marcus looked at the floor. The customer churned. The renewal was, it turned out, going to churn anyway.' },
          { label: '"...Fine, the spike."', effect: { addUrgentFeature: true, debt: 4, capital: 1, burnout: 8, focusPct: -10 }, log: 'You agreed to "the spike." The spike became the feature. The feature shipped Friday. The customer churned anyway, three weeks later.' },
        ],
      },
      triage: {
        description: 'Marcus and Priya look at each other. Priya: "Triage means — what, exactly?" Marcus: "It means like a process — it means we — uh — Priya it means we put it on the list."',
        choices: [
          { label: 'Walk them through how triage actually works', effect: { focus: -1, capital: 1, burnout: 4 }, log: 'You spent ten minutes teaching two senior employees how planning works. They nodded. The triage document was filed. The customer ask was prioritized at the top of it.' },
        ],
      },
    },
  },
  {
    // CEO + Marcus + a vendor demo + a deadline. The "AI strategy" all-in.
    // Combines: ceo_idea momentum + addUrgentFeature + addLegacy + scopeCreep risk.
    id: 'ai_initiative_kickoff', icon: Zap,
    title: 'Mandatory: "Agentic AI Strategy Kickoff"',
    requires: (s) => s.sprint >= 3 && s.currentDay >= 2,
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          (s, c) => `A calendar invite drops at ${T(c, -13)} titled "[CEO + Eng] Agentic AI Kickoff — MANDATORY." It is at ${T(c)}. The location is the boardroom. The CEO is "personally invested" per Marcus. There is no agenda.`,
          (s, c) => `CEO Slack to #engineering: "🚨 BIG ONE 🚨 — AI strategy kickoff at ${T(c, 13)}. Drop everything. Logan and the founder of an AI startup will be there. We're going to MOVE on this." The startup's name is "Synapsai." It was founded yesterday.`,
          'You walk into the office. There is catering. There is catering on a Tuesday. The CEO is holding a printed deck titled "AGENTIC EVERYTHING." Marcus is wearing a blazer over a hoodie.',
          'A Loom from the CEO at 6:14 AM: "I want to share what I have been thinking." The Loom is 22 minutes. It is mostly him pacing in front of a whiteboard with the word "AGENTIC" written 14 times in different fonts.',
        ],
        choices: [
          { label: 'Show up and listen', next: 'pitch' },
          { label: 'Decline the invite ("conflict")', next: 'declined' },
          { label: '"What does \'agentic\' mean here?"', next: 'definition' },
        ],
      },
      pitch: {
        descriptions: [
          'CEO opens with: "I want our entire product to be an agent. Not a feature WITH agents. The product IS the agent." He has not said what the agent does. Logan reacts in the room with 🎯.',
          'CEO: "By Q-end I want a working MCP server. I want partner integrations. I want the demo. I want it on Hacker News." Slide 2 is a rocket emoji at 200pt. Marcus is nodding along while typing.',
          'CEO presents three slides: "AGENTIC NOW," "AGENTIC EVERYWHERE," "AGENTIC FOREVER." Slide 3 has a small footnote that reads "*subject to change."',
          'CEO: "I had drinks with the Synapsai founder Saturday. He has a framework. We bought the framework. It\'s implementing itself." The framework is a Notion template.',
        ],
        choices: [
          { label: '"What\'s the actual scope?"', next: 'scope_q' },
          { label: '"Can we see the customer ask behind this?"', next: 'customer_ask' },
          { label: '"We\'re still on the auth migration. Where does this fit?"', next: 'fit' },
          { label: '"Sounds great, count me in."', effect: { addUrgentFeature: true, addLegacy: true, debt: 8, capital: 2, burnout: 9 }, log: 'You said yes. The CEO loved your energy. Two new tickets appeared on your sprint: "[AI] MCP Server (MVP)" and "[AI] Agentic Inbox Feature Spike." They are both, technically, two-week projects each.' },
        ],
      },
      scope_q: {
        description: 'CEO: "Scope is what slows companies down. I want us to operate in clouds, not boxes." Marcus, helpfully: "I think what the CEO means is — let\'s start with a spike and see where it goes."',
        choices: [
          { label: '"A spike that ships, you mean?"', next: 'spike_that_ships' },
          { label: '"Sure, I\'ll lead a 2-week spike."', effect: { addUrgentFeature: true, debt: 4, capital: 1, burnout: 6 }, log: 'You agreed to lead a 2-week spike. The 2 weeks will become 6. The spike will become the roadmap. You will lead it whether you want to or not.' },
        ],
      },
      spike_that_ships: {
        description: 'CEO: "Exactly! You GET it." Marcus, brightly: "we\'re calling those \'shipikes\' now." (He just made that up. He will use it again. It will appear in a deck.)',
        choices: [
          { label: '"\'Shipikes\' is not a word."', effect: { focus: -0.5, capital: -1, burnout: 3, morale: 2 }, log: 'You named the language crime. The CEO laughed. Marcus was wounded. The word "shipike" was used three more times in the next hour.' },
          { label: 'Ride it out', effect: { addUrgentFeature: true, debt: 5, capital: 1, burnout: 7 }, log: 'You agreed to a "shipike." It is on your sprint. It is, of course, a full feature with a deadline.' },
        ],
      },
      customer_ask: {
        description: 'CEO: "Customers? Customers are downstream of vision. We are creating the demand. Anduril doesn\'t do customer research, you think?" Marcus is nodding, but slower, like he\'s also unsure.',
        choices: [
          { label: '"Anduril sells to the Pentagon. We sell SaaS dashboards."', next: 'pentagon' },
          { label: '"OK, I\'ll prototype something."', effect: { addUrgentFeature: true, debt: 4, capital: 0.5, burnout: 6 }, log: 'You agreed to prototype "the vision." The prototype was demoed at the next all-hands. It went into production unmodified.' },
        ],
      },
      pentagon: {
        description: 'CEO laughs. He\'s not actually angry. "I love that. That\'s the kind of pushback I need." Then, instantly: "But also — no — let\'s build it."',
        choices: [
          { label: 'Sigh and accept', effect: { addUrgentFeature: true, debt: 6, capital: 1, burnout: 8 }, log: 'You held the line, briefly, and then it broke. The MVP was added to your sprint. The CEO told three separate people he "loves how this team pushes back." You are one of those people.' },
          { label: '"I am not the right person for this."', next: 'not_right_person' },
        ],
      },
      not_right_person: {
        description: 'CEO: "Of course you are. That\'s why I\'m asking you." Marcus, behind him, is nodding. Logan has reacted with 🎯 again. Logan reacts to everything with 🎯.',
        choices: [
          { label: '"OK, I\'ll do it."', effect: { addUrgentFeature: true, addLegacy: true, debt: 9, capital: 2, burnout: 10 }, log: 'You took it. The legacy "AngularJS dashboard" came along with it because "we can host the agent there." Two tickets joined your sprint.' },
          { label: 'Stand firm', effect: { focus: -0.5, capital: -2, burnout: 5, morale: 3 }, log: 'You said no. The CEO did not say no back. He just looked at you a moment too long and then moved on. Your name is now on a list. The list is in his head.' },
        ],
      },
      fit: {
        description: 'Marcus jumps in: "Great question — we\'ll re-prioritize the auth migration to make room. Or the auth migration is part of the agentic story now? Or — yeah we\'ll figure it out async."',
        choices: [
          { label: '"Async means \'never,\' Marcus."', effect: { focus: -0.5, capital: -1, burnout: 4 }, log: 'You named the dynamic. Marcus went red. The CEO said "I love the candor." Marcus did not.' },
          { label: 'Just absorb it', effect: { addUrgentFeature: true, debt: 5, burnout: 7 }, log: 'You let it go. The auth migration was indefinitely re-scoped. The agentic feature was added on top.' },
        ],
      },
      definition: {
        description: 'CEO: "Agentic means — it does things. On its own. With agency. Like, the thing — like, agentically." Marcus: "I think the customer-facing way to say it is: \'magic, but you trust it.\'" Marcus has been working on this line.',
        choices: [
          { label: '"That is not a definition."', next: 'pentagon' },
          { label: 'Sigh, listen to the pitch', next: 'pitch' },
        ],
      },
      declined: {
        description: 'You decline the invite citing "conflict." Marcus DMs you 4 minutes later: "hey — saw the decline. it\'s really important to be visible at this one. CEO is looking around."',
        choices: [
          { label: 'Hold the decline', effect: { focus: -0.25, capital: -2, burnout: 2, morale: 4 }, log: 'You held. Marcus marked you "non-collaborative" in his private notes doc. The kickoff happened without you. Two tickets came onto your sprint anyway. Marcus assigned them.' },
          { label: 'Cave and join late', next: 'pitch' },
        ],
      },
    },
  },
  // ===== CREDIBLE-BUT-RIDICULOUS — second-pass dialogs =====
  {
    // Engineering leadership has set OKRs for AI-tool adoption.
    // Combines hype-driven mandates with measurement theatre.
    id: 'copilot_mandate', icon: Zap,
    title: 'Engineering OKR: "AI-tool adoption rate"',
    requires: (s) => s.sprint >= 2,
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          'Email from your skip-level: "Per the new OKRs, every IC must show >40% AI-assisted code in commits this quarter. Dashboards live next week. Usage will be reviewed in calibration." The signature ends with "shipped with Copilot 🚀."',
          'A new Slack bot named "AICoach" DM\'s you: "Hi Jared! I noticed only 12% of your last 47 commits had AI-tool fingerprints. Goal: 40%. Tips inside!" The DM has a 600-word "tips" link.',
          'All-hands segment: "From now on, AI tooling adoption is one of our company-wide OKRs. Engineering is targeting 40% AI-assist on all PRs. We\'ll be tracking via a new internal metric called CAR — Copilot Adoption Rate." Brad reacts 🚀. Marcus reacts 🎯.',
          'A new merge-bot has appeared on your team\'s repo. It tags every PR with the percentage of "AI-assist confidence." Your most recent PR is 4%. The bot has commented: "Could this be improved with Copilot? 🤔"',
          'Engineering leadership Slack: "We\'re piloting a tool that scans your IDE keystrokes for AI-generated regions. It\'s opt-in but everyone is opted in by default. Please leave it on. We\'re a community."',
          'Skip-level email: "I\'d like to start each 1:1 with a quick walkthrough of your CAR metric trend. It\'s a forcing function for adoption. Looking forward to the conversation."',
        ],
        choices: [
          { label: 'Comply: paste real PRs through Copilot to bump the metric', next: 'comply' },
          { label: '"How do you measure something that\'s not measurable?"', next: 'measure' },
          { label: 'Quietly disable the IDE plugin', next: 'disable' },
          { label: 'Reply-all with a link to the AI-coding-quality literature', next: 'reply_all' },
        ],
      },
      comply: {
        description: 'You spend 90 minutes pasting working PRs into Cursor and re-accepting the suggestions. Three of them get worse. One introduces a regression you don\'t spot until next sprint. Your CAR jumps to 47%. Skip-level reacts with 🎯.',
        choices: [
          { label: 'Move on', effect: { focus: -1.5, capital: 1, burnout: 5, debt: 6, morale: -4 }, log: 'You hit the metric. The codebase paid. The dashboard is now green.' },
        ],
      },
      measure: {
        description: 'Skip-level, helpfully: "Great question — there\'s a vendor that classifies AST regions by typing-rhythm signatures and flags them as AI-assisted. They have a 71% confidence rating. We\'re going with it for Q3."',
        choices: [
          { label: '"71% confidence is also 29% wrong."', next: 'wrong' },
          { label: '"OK, I\'ll use the tools."', next: 'comply' },
        ],
      },
      wrong: {
        description: 'Skip-level: "Right, but the BOARD wants a number. The number doesn\'t need to be perfect. It needs to be improving."',
        choices: [
          { label: '"Then improving the number is the OKR, not the work."', effect: { focus: -0.5, capital: -1, morale: 3, burnout: 2 }, log: 'You named the inversion out loud. Skip-level didn\'t disagree. Your CAR will be flagged as "underperforming" in calibration. You will not care.' },
          { label: '"Fine. I\'ll improve the number."', effect: { focus: -1, capital: 1, debt: 4, burnout: 4, morale: -3 }, log: 'You agreed to improve the number, not the work. The number went up 21% within a week. The codebase did not.' },
        ],
      },
      disable: {
        description: 'You uninstall the IDE plugin. Two days later, an automated email from Engineering Ops: "We\'ve noticed your AI-tooling integration is offline. Please re-enable it within 5 business days for compliance." It is co-signed by a person you have never heard of.',
        choices: [
          { label: 'Re-enable it, leave it idle', effect: { focus: -0.25, capital: 0.5, burnout: 2 }, log: 'A clean malicious-compliance victory. The plugin is on. It is also doing nothing. The CAR metric will report what it reports.' },
          { label: 'Reply: "What is this in service of?"', effect: { focus: -0.5, capital: -1.5, morale: 4, burnout: 3 }, log: 'You named the question. The reply was a 4-paragraph corporate non-answer with the words "we\'re a community" twice.' },
        ],
      },
      reply_all: {
        description: 'You reply-all with the GitClear study, the Stanford "10x productivity but more bugs" paper, and a polite three-sentence summary. Two engineers DM you "🙏" within ten minutes. Skip-level does not reply.',
        choices: [
          { label: 'Hold the line', effect: { focus: -0.5, capital: -2, morale: 5, burnout: 3 }, log: 'You burned political capital for an honest position. The study links were never engaged with. Three new hires now know who you are.' },
        ],
      },
    },
  },
  {
    // Quarterly OKR calibration where 0.7 is the goal but is also the expectation.
    id: 'okr_calibration', icon: Briefcase,
    title: 'Quarterly OKR calibration ("be ambitious!")',
    requires: (s) => s.sprint > 2 && s.sprint % 2 === 0,
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          'Manager DM: "got 30 for OKR calibration? want to make sure your goals are stretch but credible." You jump on. They open with: "remember — 0.7 is the target, not 1.0. We\'re not robots." Then, immediately: "everyone hit 1.0 last quarter. Calibrate accordingly."',
          '"Quick OKR sync." Manager: "I want you to set goals that are AMBITIOUS. We grade 0.7 as success." They paste in last quarter\'s goals. You hit 0.95 on three of them. They were marked "underperforming."',
          'OKR calibration meeting. Six engineers, one PowerPoint, and the CHRO\'s framework: "Stretch goals are non-binding aspirations." The next slide reads: "Failure to meet stretch goals will be reflected in performance ratings."',
          'Manager: "I want to set you up for success — let\'s make your OKR a 1.5x target. Stretch is energizing. Anyway, you need to hit at least 1.0 for a strong rating."',
        ],
        choices: [
          { label: '"So is 0.7 a success or a failure?"', next: 'is_07' },
          { label: 'Set the goal as 1.5x what you actually expect to hit', next: 'inflate' },
          { label: '"What did people who hit 0.7 last quarter get rated?"', next: 'last_quarter' },
          { label: 'Sigh, accept whatever they propose', effect: { focus: -1, capital: 0.5, morale: -3, burnout: 4 }, log: 'You signed off on a 1.5x stretch goal you have no path to hit. The doc was archived in a folder named "Q3 Aspirations."' },
        ],
      },
      is_07: {
        description: 'Manager: "It\'s — both. It\'s aspirational and graded. The 0.7 is the floor of the stretch, not the ceiling of acceptable. Does that make sense?" It does not.',
        choices: [
          { label: '"...no."', next: 'last_quarter' },
          { label: 'Pretend it makes sense', effect: { focus: -0.5, capital: 0.5, morale: -3, burnout: 3 }, log: 'You nodded. The goal was set at 1.5x. You will hit 1.0 and be told you "missed the stretch."' },
        ],
      },
      last_quarter: {
        description: 'Manager pauses. "Honestly? They didn\'t get great ratings. The framework says one thing. Calibration meetings say another. I — yeah."',
        choices: [
          { label: '"Then I\'m setting goals I can hit at 1.0."', effect: { focus: -0.5, capital: -1, morale: 3, burnout: 1 }, log: 'You set realistic goals. Your manager DM\'d "respect" privately. In calibration they will be flagged as "non-aspirational."' },
          { label: 'Set the inflated goal anyway, hope to be promoted before grading', effect: { focus: -1, capital: 1, morale: -2, burnout: 5 }, log: 'You optimized for the chance of a promo before grading. The promo did not come in time. You hit 0.95 of the inflated goal and were rated meets-not-exceeds.' },
        ],
      },
      inflate: {
        description: 'Manager: "Beautiful. That\'s exactly the kind of energy we want." They paste your inflated goal into the doc. The doc is shared with leadership. Your name is on it.',
        choices: [
          { label: 'Accept it', effect: { focus: -1, capital: 1, morale: -3, burnout: 5 }, log: 'You committed to a target you both knew was theatrical. It will be graded as if it were real.' },
        ],
      },
    },
  },
  {
    // The product is renamed mid-quarter. Everything internal must be re-labeled.
    id: 'rebrand', icon: Sparkles,
    title: 'Surprise rebrand: the product has a new name',
    requires: (s) => s.sprint >= 4 && s.sprint % 5 === 4,
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          (s, c) => `Slack #announcements at ${T(c)}: "🎉 BIG NEWS — we're excited to announce that effective today, the product is now called 'Sparkflow.' (Formerly: Synergyse.) Comms will follow up with brand guidelines. Please update everything by Friday." Friday is in two days.`,
          'A 23-page brand guidelines PDF lands in your inbox. The new name is "Lumen." (Two competitors are also named Lumen.) You are asked to "update all internal references" by EOQ. There are 4,200 internal references.',
          'Email from the CMO: "We\'re sunsetting the Synergyse name in favor of \'Mosaic.\' Please update all docs, code references, customer-facing strings, and internal Slack channels. The new logo is attached. (.fig only.)"',
          'CEO Slack: "team — i had a vision on the peloton. we\'re renaming. \'Vibe.\' that\'s it. that\'s the product. branding is doing assets. eng team please go through the codebase. should be quick 🚀"',
        ],
        choices: [
          { label: 'Audit how deep the old name goes in the codebase', next: 'audit' },
          { label: '"Quick" rename = dedicated sprint task', next: 'dedicated' },
          { label: 'Use sed across the repo and hope', next: 'sed' },
          { label: 'Reply-all asking about customer-facing impact', next: 'customer_q' },
        ],
      },
      audit: {
        description: 'You grep. The old name appears 4,200 times. 600 of those are in user-facing strings. 200 are in API responses. 47 are in DB schema names. Three are in the Stripe billing-product ID, which is not renameable without legal.',
        choices: [
          { label: 'File a "Rename Audit" doc, send up the chain', effect: { focus: -1.5, capital: 1, burnout: 4 }, log: 'You documented the truth. The Friday deadline shifted to EOQ. The CMO was annoyed. The team was relieved. The Stripe ID is still the old name.' },
          { label: 'Just do the rename and let the bills break', effect: { focus: -3, debt: 8, addUrgentFeature: true, burnout: 9 }, log: 'You pushed the rename through. Stripe billing broke for one customer for 6 hours. The hotfix ticket is yours. Two API consumers stopped responding entirely.' },
        ],
      },
      dedicated: {
        description: 'You email back: "this is a sprint, not a Friday." Marcus replies in DM: "yeah uhhh — well — try to fit it in this sprint? part-time? like, half a sprint?"',
        choices: [
          { label: '"We\'re reframing this as a project. I\'ll write the proposal."', effect: { focus: -1, capital: 1, morale: 2, burnout: 3 }, log: 'You named the work as work. The proposal added the rename to the *next* sprint as a real ticket. This sprint stayed honest.' },
          { label: '"...fine, half a sprint."', effect: { focus: -2, addUrgentFeature: true, scopeCreep: true, debt: 5, burnout: 7 }, log: 'You agreed to "half a sprint." A half-renamed codebase shipped. Three components were on the new name, two were still on the old, and one had been renamed to an emoji by an AI tool nobody owns.' },
        ],
      },
      sed: {
        description: 'You run `sed -i` across the repo. CI explodes immediately — turns out the old product name was also a substring in three unrelated identifiers (and the test fixtures, and one of your migration filenames). Tests fail in 14 services. Your name is on the broken commit.',
        choices: [
          { label: 'Revert and do it properly', effect: { focus: -2, debt: 2, burnout: 6 }, log: 'You reverted. The proper rename will take 2 sprints. The sed commit lives on in git history forever.' },
          { label: 'Push through the failures, fix downstream', effect: { focus: -3, debt: 9, addUrgentFeature: true, burnout: 10 }, log: 'You pushed. CI was red for 36 hours. Two services were briefly returning HTML errors with the new product name in them. A new ticket: "[hotfix] Rename fallout."' },
        ],
      },
      customer_q: {
        description: 'CMO replies-all: "Customer-facing impact is — well — they\'ll love it! It\'s a story. Roadmap update next week will have the talking points. Engineering, please don\'t delay on this. Velocity is everything." Three customers reply-all asking what\'s happening.',
        choices: [
          { label: 'DM the CMO offline', effect: { focus: -0.5, capital: -1, burnout: 3 }, log: 'You took it offline. The CMO\'s reply was "I really need engineering to be a partner here." You went and renamed the strings.' },
          { label: 'Audit the codebase first', next: 'audit' },
        ],
      },
    },
  },
  {
    // Surprise 1:1 with the CTO (a skip-skip-level). High-stakes, low-information.
    id: 'cto_skiplevel', icon: Coffee,
    title: 'Surprise: 30-min "coffee" with the CTO',
    requires: (s) => s.sprint >= 3 && s.sprint % 4 === 3,
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          'A calendar invite drops from the CTO\'s EA. Title: "Coffee chat — Jared / [CTO name]." 30 minutes, no agenda, tomorrow at 3 PM. The location is the executive wing. You have never been to the executive wing.',
          'The CTO Slacks you directly: "hey — heard your name come up in a few conversations. would love to chat. 15? no agenda just want to listen 👂" There is always an agenda.',
          'Your manager pulls you aside: "the CTO wants to grab coffee with you. don\'t worry about it — they do this with everyone. ... actually, prepare a few things."',
          'You arrive at your desk to find a hand-written note: "Stop by my office whenever — [CTO name]." The note is on company stationery. Nobody has hand-written notes anymore.',
        ],
        choices: [
          { label: 'Prepare three "talking points" the way you prep for a customer call', next: 'prep' },
          { label: '"Just be yourself" — go in cold', next: 'cold' },
          { label: 'DM your manager: "what is this about?"', next: 'ask_manager' },
          { label: 'Decline politely', next: 'decline_cto' },
        ],
      },
      prep: {
        description: 'You spend 90 minutes preparing. Three crisp talking points: (1) the auth migration impact, (2) AI-tooling concerns, (3) the codebase health metrics. The CTO opens the meeting with: "tell me about your hobbies."',
        choices: [
          { label: 'Pivot to your prep anyway', next: 'cto_real' },
          { label: 'Talk about your hobbies', next: 'cto_hobbies' },
          { label: '"Was there a specific topic you wanted to discuss?"', next: 'cto_topic' },
        ],
      },
      cold: {
        description: 'You go in cold. The CTO has prepared. They have a sheet of notes. The first question is: "where do you see the codebase in 18 months?" You did not anticipate this question.',
        choices: [
          { label: 'Improvise honestly — "depends on what we stop adding."', next: 'cto_real' },
          { label: 'Improvise corporately — "scaled, AI-native, hyper-collaborative."', next: 'cto_corp' },
          { label: '"I — I\'d like to think about that and follow up."', next: 'cto_followup' },
        ],
      },
      ask_manager: {
        description: 'Manager: "honestly? not sure. could be skip-level listening tour. could be re-org related. could be a stretch project. they\'ve been doing more of these. just be honest."',
        choices: [
          { label: 'Continue prep', next: 'prep' },
          { label: 'Go in cold', next: 'cold' },
        ],
      },
      decline_cto: {
        description: 'You decline citing "scheduling conflict." The EA reschedules. The new slot is on a Friday at 4:45 PM. The new slot is also unmoveable.',
        choices: [
          { label: 'Accept the new slot', next: 'cold' },
          { label: 'Decline a second time', effect: { focus: -0.25, capital: -3, burnout: 3, morale: 2 }, log: 'You declined twice. The CTO\'s EA stopped trying. Your manager mentioned it in your next 1:1, with concern.' },
        ],
      },
      cto_real: {
        description: 'The CTO leans in. "Honest answer: the codebase is fine, but it\'s drifting. We\'re adding AI features faster than we\'re consolidating the platform. I think you see this. I want to see if you\'d lead a six-month consolidation effort. It would mean stepping off the AI initiative."',
        choices: [
          { label: '"...yes."', effect: { focus: -1, capital: 3, morale: 8, debt: -8, clearPromise: true }, log: 'A real opportunity. The CTO put their political capital on it. The consolidation effort begins next sprint. Your debt drops materially. You will, briefly, feel like an engineer again.' },
          { label: '"Let me think about it overnight."', effect: { focus: -0.5, capital: 1, morale: 3 }, log: 'You bought 24 hours. The CTO respected the answer. You will say yes by Friday.' },
          { label: '"I\'m not the right person."', effect: { focus: -0.25, capital: 0.5, morale: -2 }, log: 'You declined gracefully. The CTO offered it to {dev} the next day. {dev} took it. {dev} will be promoted within a year.' },
        ],
      },
      cto_corp: {
        description: 'You say the words "AI-native, hyper-collaborative." The CTO\'s eyes glaze for a microsecond — small, but visible. They write something on the printed sheet. The conversation politely ends 12 minutes early.',
        choices: [
          { label: 'Walk out, replay it on the drive home', effect: { focus: -1, capital: -1, morale: -3, burnout: 4 }, log: 'A small career setback. The CTO will not request another coffee. You will rehearse the conversation in your head for two weeks.' },
        ],
      },
      cto_topic: {
        description: 'CTO: "Honestly? I wanted to listen. I\'ve been hearing your name in a few conversations. About — pushback. Specifically." The CTO smiles. The smile is hard to read.',
        choices: [
          { label: '"Pushback is part of my job, sir."', effect: { focus: -0.5, capital: 1, morale: 4, burnout: 1 }, log: 'You held the position. The CTO nodded once and moved on. Your name will be in their notes. The notes will be helpful in 8 months when something complicated comes up.' },
          { label: '"I — I can dial it back if needed."', effect: { focus: -0.5, capital: -1, morale: -4, burnout: 3 }, log: 'You apologized for being good at your job. The CTO took the apology with grace. You\'ll lie awake about it.' },
        ],
      },
      cto_hobbies: {
        description: 'You talk about your hobbies. The CTO is genuinely engaged. You spend 22 minutes on it. At minute 23, the CTO says: "I really appreciate this. I\'ll cut us short — I want to be respectful of your time." The meeting ends. You have no idea what just happened.',
        choices: [
          { label: 'Walk out, slightly destabilized', effect: { focus: -0.5, capital: 0.5, burnout: 2 }, log: 'A surreal coffee. The CTO followed up the next day with a Slack DM: "really enjoyed our chat 🙏" You will reread the message four times trying to extract meaning.' },
        ],
      },
      cto_followup: {
        description: 'CTO: "Of course. Send me a doc. One pager — what would you change about engineering, in your honest opinion?" The CTO says it warmly. The CTO is also testing.',
        choices: [
          { label: 'Send the honest doc', effect: { focus: -1.5, capital: 2, morale: 4, burnout: 3 }, log: 'You wrote the doc. It was sharp and specific. The CTO replied within the day. Your manager was looped in. Three things in the doc will, eventually, change.' },
          { label: 'Send a polite doc that says nothing', effect: { focus: -0.5, capital: -0.5, morale: -3, burnout: 2 }, log: 'You sent the corporate version. The CTO read it once and never replied. The opportunity, whatever it was, closed.' },
        ],
      },
    },
  },
  {
    // A partner is on a call asking about a feature you don\'t have. Sales told them you do.
    id: 'partner_demo_panic', icon: AlertTriangle,
    title: 'Surprise: you\'re on a partner demo right now',
    requires: (s) => s.sprint >= 2 && s.currentDay >= 2,
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          'Slack DM from {bro}: "yo can u jump on a call rn 🙏 partner is asking specifics about the API and i\'m drowning. they\'re on screen-share." The DM was sent 2 minutes ago. The call has been going 18.',
          'A calendar invite arrives 4 minutes after the meeting started. Title: "[INTERNAL ONLY] partner deep dive — [vendor name]." You are not "internal only." You have no context. {bro} is muted on the call typing aggressively.',
          'A frantic DM from Marcus: "we need an engineer on the partner call rn. they\'re asking about the agent SDK. we said we have one. we don\'t. can u jump?"',
          'You\'re tagged in a Slack thread. Last message, 90 seconds old, from a sales engineer: "can someone from eng confirm we support webhook retries with exponential backoff for the partner integration? customer is on screen now."',
        ],
        choices: [
          { label: 'Jump on the call cold', next: 'jump' },
          { label: 'DM back: "what does the partner already think we have?"', next: 'context' },
          { label: '"I\'m not the right person — page on-call architect."', next: 'deflect' },
          { label: 'Ignore it for 10 minutes, see if it resolves', next: 'ignore' },
        ],
      },
      jump: {
        description: 'You join. The partner is on screen-share showing a slide titled "Capabilities expected from [your company]." It lists six features. You have two. {bro} is making intense eye contact with the camera.',
        choices: [
          { label: 'Improvise: "those are on the roadmap, here\'s the rough timeline."', next: 'roadmap' },
          { label: 'Be honest: "we have two of those today, four are not on the roadmap."', next: 'honest' },
          { label: '"Let\'s schedule a follow-up with our PM."', next: 'reschedule' },
        ],
      },
      context: {
        description: '{bro} replies in 14 seconds: "they think we have webhook retries, the agent SDK, the events firehose, multi-tenant SSO, the audit log, and the custom-prompt UI. we have. uh. some of those." {bro} sends 🙏 four times.',
        choices: [
          { label: 'Jump on the call', next: 'jump' },
          { label: '"Those are 3 quarters of work. I won\'t go on the call without an honest brief."', next: 'firm' },
        ],
      },
      deflect: {
        description: 'You suggest paging the on-call architect. {bro}: "the on-call is in london, it\'s 2 AM there." Marcus, in another DM: "you ARE the architect for this surface, just jump."',
        choices: [
          { label: 'Sigh, jump on the call', next: 'jump' },
          { label: 'Hold: "this needs a real meeting with prep, not a panic drop-in."', effect: { focus: -0.5, capital: -1.5, morale: 3, burnout: 3 }, log: 'You held. The partner call ended without engineering. {bro} was, briefly, livid. The partner asked for a follow-up "with the right people," which was scheduled for two weeks out.' },
        ],
      },
      ignore: {
        description: '14 minutes later, three more pings, then a calendar invite for a "follow-up to align" tomorrow morning at 8 AM. You ignored the wrong fire.',
        choices: [
          { label: 'Accept the 8 AM', effect: { focus: -1, capital: -1, burnout: 5, addUrgentFeature: true }, log: 'You traded a panic for a 8 AM. The 8 AM became a 90-minute scoping session. A new ticket appeared: "[partner] webhook retry parity."' },
          { label: 'Decline the 8 AM too', effect: { focus: -0.25, capital: -2.5, burnout: 2, morale: 3 }, log: 'You declined twice. {bro} took the loss internally. The deal stalled. You will hear about it in calibration.' },
        ],
      },
      roadmap: {
        description: 'You improvise timelines on the fly. The partner takes notes. They circle three of the items. They are now "committed dates" in a Notion doc shared between sales and the partner. You did not commit to dates.',
        choices: [
          { label: 'Email Marcus immediately to flag the misunderstanding', effect: { focus: -1, capital: 0.5, burnout: 4 }, log: 'You flagged it. Marcus rebooked a "scoping call" with the partner and quietly walked back two of the dates. The third stuck. The third is on your sprint.' },
          { label: 'Just let it be — see what survives next quarter', effect: { focus: -0.5, addUrgentFeature: true, scopeCreep: true, debt: 7, burnout: 6 }, log: 'You let the misunderstanding ride. Three "committed dates" became three urgent tickets. One of them is now strategic.' },
        ],
      },
      honest: {
        description: 'The partner pauses, then nods. "OK. That\'s actually what I needed. We can\'t buy a roadmap promise — we need clarity on what exists today. Can you send a one-pager on what\'s actually shipped?"\n\n{bro} unmutes. "Of — of course! Jared will send that today."',
        choices: [
          { label: '"I\'ll send it within 2 days."', effect: { focus: -1.5, capital: 1.5, morale: 4, burnout: 3 }, log: 'You bought trust with honesty. The partner stayed engaged. The deal closed at a smaller scope but it actually closed. {bro} took credit. You will not take it back.' },
          { label: 'Volunteer to write it AND lead the integration', effect: { focus: -1, capital: 2, morale: 3, addUrgentFeature: true, burnout: 5 }, log: 'You went all-in. Marcus was thrilled. Your sprint absorbed the integration ticket. {bro} added you to a shared Notion doc named "Team Win 🚀."' },
        ],
      },
      reschedule: {
        description: '{bro}, on the call, while smiling: "actually I think we can get into specifics now while we\'re here? Jared is one of our top engineers." {bro} is throwing you under the bus while smiling.',
        choices: [
          { label: 'Accept the throw', next: 'jump' },
          { label: '"Actually no — let\'s reschedule with a written brief."', next: 'firm' },
        ],
      },
      firm: {
        description: '{bro} stares at you through the camera. The partner says: "honestly, that\'s reasonable. Send me a brief. I\'ll come prepared. I appreciate not being sold on a roadmap." {bro}\'s smile flattens.',
        choices: [
          { label: 'Hold the line', effect: { focus: -0.5, capital: 1, morale: 5, burnout: 1 }, log: 'You held. The partner respected it. {bro} did not. Marcus DM\'d "we need to chat" 9 minutes later. The "chat" was constructive but tense.' },
        ],
      },
    },
  },
  {
    // A platform team is sunsetting your critical dependency on a 30-day timeline.
    id: 'platform_deprecation', icon: Archive,
    title: 'Platform team: "we\'re sunsetting [your dependency] in 30 days"',
    requires: (s) => s.sprint >= 3 && s.currentDay >= 1,
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          'A 14-paragraph email from the platform team lands in your inbox: "Notice: @company/auth-sdk v2 is being sunset on [date 30 days out]. v3 has a different API surface. Migration guide attached. Please confirm you\'re on the new version by EOD on [date]." Your service uses v2 for everything. Twenty minutes later a bot named "Migrator-9000" opens a 1,400-line PR against your repo titled "[automated] Migrate to auth-sdk v3." It breaks 41 tests. It is set to auto-merge in 30 days unless blocked.',
          'Slack #platform-announcements: "🚨 DEPRECATION 🚨 the events-firehose package is end-of-life on [date 30 days out]. Replacement is a Kafka-based system you have not been onboarded to. Migration support: read the docs and good luck." 47 people 😢-react. None of them are on the platform team. A bot named "Migrator-9000" has already opened a PR against your repo titled "[automated] Migrate to Kafka." It has no description. It is set to auto-merge in 30 days unless blocked.',
          'Email from the platform-team lead, you, and 14 other consumers: "small heads-up — we\'re sunsetting v2 of the data-client. Yes, we know we said it would be supported through Q4. Yes, we know we said the same thing two quarters ago. The timeline is now 30 days. We appreciate your flexibility." Attached, helpfully, is a link to a PR a bot named "Migrator-9000" has opened against your repo. 1,400 lines. CI is red. It will auto-merge in 30 days unless blocked.',
          'The platform team\'s deprecation bot opens a PR against your repo titled: "[automated] Migrate to data-client v3." The PR has 1,400 lines, no description, and breaks 41 tests. The CI build is red. The PR is set to "auto-merge after 30 days unless blocked." It is signed by a bot named "Migrator-9000."',
        ],
        choices: [
          { label: 'Read the migration guide', next: 'guide' },
          { label: 'Reply: "this timeline isn\'t feasible — we have 14 services on the old version."', next: 'pushback_dep' },
          { label: 'Block Migrator-9000\'s PR until further notice', next: 'block_pr' },
          { label: 'Quietly do the migration before the deadline', next: 'just_do_it' },
        ],
      },
      guide: {
        description: 'The migration guide is 47 pages. Step 1 references a config flag that does not exist in the new version. Step 7 references a method that has been renamed in the new version. The "common gotchas" section has one bullet: "if you encounter issues, please file a ticket."',
        choices: [
          { label: 'File a ticket about the bad guide', next: 'file_ticket' },
          { label: 'Reply-all with the inaccuracies', next: 'pushback_dep' },
          { label: 'Just do the migration and figure out the gaps', next: 'just_do_it' },
        ],
      },
      pushback_dep: {
        description: 'The platform-team lead replies-all 4 hours later: "we hear you. unfortunately the timeline is set by leadership. the new version has security improvements the old one does not. we\'d love to push the date but we cannot." {dev} from another team replies: "+1 — we have similar concerns." Six other +1s land in the next 20 minutes.',
        choices: [
          { label: 'Organize the consumers — propose a 90-day timeline', next: 'organize' },
          { label: 'Sigh, accept the 30 days', next: 'just_do_it' },
          { label: 'Escalate to your manager', next: 'escalate_dep' },
        ],
      },
      organize: {
        description: 'You start a "Platform Sunset — Cross-Team Concern" doc. 11 engineers from 7 teams sign on within an hour. The platform-team lead joins the doc and reads silently for 14 minutes. Then they post: "OK. We\'ll go to 60 days. With phased rollout. Thank you for the doc."',
        choices: [
          { label: 'Accept the win, plan a real migration', effect: { focus: -1.5, capital: 2, morale: 5, burnout: 3, debt: -2 }, log: 'A rare cross-team win. The migration was real, paced, and clean. The platform team noted you in their post-mortem as "constructive." Your manager mentioned it in calibration.' },
        ],
      },
      escalate_dep: {
        description: 'Your manager talks to the platform team\'s manager. Two days of meeting-tag. The result: a "phased migration" with the same 30-day deadline but a "softer enforcement." Nobody knows what "softer enforcement" means.',
        choices: [
          { label: 'Just do the migration', next: 'just_do_it' },
          { label: 'Wait out "softer enforcement"', effect: { focus: -1, capital: -1, debt: 5, burnout: 5, addUrgentFeature: true }, log: 'You waited. On day 31, your service started 502\'ing. The "soft enforcement" turned out to be a sunset. A new ticket: "[hotfix] deprecated package EOL." On you.' },
        ],
      },
      block_pr: {
        description: 'You block the auto-merge PR. Migrator-9000 opens a new PR 4 hours later with the same content and a slightly different title. Migrator-9000 is a tool from a startup the platform team is piloting. It is paid by usage.',
        choices: [
          { label: 'Block the new PR too', effect: { focus: -0.5, capital: -1, burnout: 3 }, log: 'You played whack-a-bot for two days. The platform team eventually disabled Migrator-9000 for your repo. The migration is still on you. The deadline is still 30 days.' },
          { label: 'Email the startup directly', effect: { focus: -0.5, capital: 0.5, burnout: 2 }, log: 'You emailed the founders. They replied within an hour. They were genuinely apologetic and disabled the bot for your org. The platform team was annoyed at you for "going around the process."' },
        ],
      },
      just_do_it: {
        description: 'You spend the next two weeks migrating. You hit four undocumented gotchas. You file three tickets. You write a real migration guide for the next team to do this. The deadline is met by 4 hours.',
        choices: [
          { label: 'Ship it', effect: { focus: -3.5, capital: 1, debt: -2, burnout: 8 }, log: 'You ate the migration. The codebase is on the new version. The platform team thanked you in passing. Three other teams used your guide. Their managers do not know you exist.' },
        ],
      },
      file_ticket: {
        description: 'You file PLAT-9876 about the inaccurate guide. The reply, 6 hours later: "Thanks for flagging — please feel free to submit a PR to the docs. We don\'t have capacity to update them this quarter."',
        choices: [
          { label: 'Submit the PR yourself', effect: { focus: -1, capital: 0.5, debt: -1, burnout: 4 }, log: 'You wrote real docs for someone else\'s team. It was merged in a week. The platform team\'s OKR for "documentation quality" was hit, partly because of you.' },
          { label: 'Walk away', next: 'just_do_it' },
        ],
      },
    },
  },
  // =====================================================================
  // SCRUM THEATER — the ceremonies, as practiced. Each one protects the
  // team's time by taking it.
  // =====================================================================
  {
    id: 'sprint_review', icon: Megaphone,
    title: 'Sprint review — "demo to stakeholders"',
    requires: (s) => s.currentDay >= 4,
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          'Sprint review. Marcus reads the sprint goal aloud from a slide he did not write. He reads it twice, because the first time it did not sound like a goal. The stakeholders nod. One of them asks for the thing that was descoped on day one. Marcus: "Great question." He turns to you. "Want to demo where we are?"',
          (s, c) => `Sprint review at ${T(c)}. Eleven stakeholders. Four are "optional." All four came. The deck is titled "Sprint ${s.sprint} Review (FINAL) (v3)." Slide 2 is the sprint goal, edited since Monday to match what got built. Slide 3 says "DEMO" and has your name on it.`,
          '"Quick review, no pressure, just show what we\'ve got." The VP of Sales has joined. He has brought a customer. The customer has brought a list. The top item on the list was descoped on Monday "to protect the sprint." Marcus looks at you. "Shall we demo?"',
          { text: 'Sprint review in the big room. The HDMI cable works, which is suspicious. The sprint goal is on the screen with a typo that has survived three reviews. A stakeholder asks whether the typo is a feature. Then they ask to see the thing nobody built. Then everyone looks at you. "Can we get a quick demo?"', requires: OFFICE },
          { text: 'Sprint review on Zoom. Marcus is sharing the wrong window: last sprint\'s retro board. Action item 3 reads "fewer surprises in reviews." A stakeholder asks for a surprise, specifically the feature that was descoped on day one. Marcus: "I\'ll let the team speak to that." The team is you. You are asked to share your screen and demo.', requires: REMOTE },
          'Sprint review. The agenda says "demo (10 min), feedback (5 min), next steps (5 min)." Feedback starts before the demo. Next steps started before the sprint. A director asks why the thing that was cut on Monday is not in the demo. Marcus: "Totally fair. Want to show where we are?"',
        ],
        choices: [
          { label: 'Demo what actually works', next: 'works' },
          { label: 'Demo the happy path on your laptop', next: 'laptop' },
          { label: '"It is not ready to demo."', next: 'not_ready' },
        ],
      },
      works: {
        description: 'You demo the thing that works. It works. The room goes quiet in the way rooms go quiet when the thing works and it is not the thing they wanted. A stakeholder: "Love it. Small follow-up: can it also do the other thing?" Marcus, already typing: "I\'ll create a ticket. Tiny one." The ticket exists before you stop sharing.',
        choices: [
          { label: 'Nod. Keep sharing. Say nothing.', effect: { focus: -1.5, addUrgentFeature: true, burnout: 2 }, log: 'The "small follow-up" was in the sprint before the review ended. It has the same deadline as everything else.' },
          { label: '"That is a different feature."', effect: { focus: -1.5, capital: -1, addUrgentFeature: true }, log: 'Everyone agreed it was a different feature. It was added anyway, "as a follow-up," with the same deadline. Your tone was noted.' },
        ],
      },
      laptop: {
        description: 'You demo the happy path on your laptop. Local branch, seeded data, the one flow that works. It works beautifully. Nobody asks about the other flows. The VP: "This looks done to me." Marcus does not correct him. Marcus is typing.',
        choices: [
          { label: 'Let them believe it', effect: { focus: -1, chance: { p: 0.5, effect: { debt: 6 }, log: 'By the end of the day the demo branch was "the release candidate." Someone filed a ticket to "just productionize it." The ticket is a 2.', elseLog: 'Nobody followed up. The demo is already forgotten. The feature is still not done, and now nobody is worried about it, which is worse.' } }, log: 'It worked on your machine. That sentence has never once helped anyone.' },
          { label: '"To be clear, this is my laptop, not production."', effect: { focus: -1, capital: -0.5, chance: { p: 0.3, effect: { debt: 6 }, log: 'The clarification went in the notes. The notes were not read. By Friday the demo branch was the release candidate anyway.', elseLog: 'The clarification landed. The VP said "sure, sure." He looked disappointed in a way that will come back.' } }, log: 'You added the asterisk. Asterisks are not read aloud.' },
        ],
      },
      not_ready: {
        description: 'You say it. "It is not ready to demo." The room does the small collective inhale, the one from refinement. The VP: "That\'s fine, that\'s fine, we\'re agile." Marcus: "I\'ll take the action to re-plan." A re-plan is when a feature grows.',
        choices: [
          { label: 'Let Marcus re-plan', effect: { focus: -1, capital: -1, morale: -3, scopeCreep: true }, log: 'Marcus re-planned. The feature now has a "phase 2" inside it, which is the part that was descoped on Monday, back under a different name.' },
          { label: 'Offer a date instead', effect: { focus: -1.5, capital: -0.5, morale: -3, scopeCreep: true, burnout: 2 }, log: 'You said "Thursday." It is now on a slide. The slide is in the board deck. The feature grew to fit the slide.' },
        ],
      },
    },
  },
  {
    id: 'retro_action_items', icon: Clock,
    title: 'Retro action item: "reduce meetings"',
    requires: (s) => s.sprint >= 2,
    descriptions: [
      'Last retro\'s action item was "reduce meetings." It has become a weekly 60-minute meeting called Meeting Reduction Sync. There is a working group. The working group has a kickoff. You have been named the owner, because you raised it.',
      (s, c) => `A calendar invite lands at ${T(c)}: "Meeting Reduction Sync (weekly)." Organizer: Marcus. Required: 9 people. Agenda: "align on the meeting reduction framework." The description thanks you for "championing this." You said one sentence in a retro. You are now the owner.`,
      'Slack from Marcus: "great news, leadership loved the retro action item on meeting load! They want a recurring forum to track it." The forum is a meeting. It is weekly. It is yours. The first agenda item is choosing a name for the meeting.',
      'The retro board has been exported to a Confluence page titled "Action Items (Owned)." Item 1: "Reduce meetings. Owner: you. Status: In progress. Mechanism: weekly sync." The weekly sync has a pre-read. The pre-read is about the pre-read.',
      'Marcus: "quick one — since you flagged meeting fatigue, you\'re the natural owner for the Meeting Reduction Sync. It\'s only an hour a week. Plus the prep. Plus the follow-ups. Plus a short readout at the all-hands." That is four meetings about fewer meetings.',
    ],
    choices: [
      { label: 'Own it. Someone has to.', effect: { focus: -1, morale: -2, dailyTax: { hours: 0.5, days: 5, label: 'Meeting Reduction Sync prep, follow-ups and "quick reads"' } }, log: 'You own the Meeting Reduction Sync. It costs half an hour every morning in prep and follow-ups. The working group\'s first finding is that there are too many meetings.' },
      { label: '"I don\'t think a meeting is the mechanism."', effect: { focus: -0.5, capital: -1, morale: -1 }, log: 'Noted "for the retro on the retro." The sync happens anyway, owned by someone who has never attended a retro. Its first action item is to add a meeting.' },
    ],
  },
  {
    id: 'planning_poker', icon: MessageSquare,
    title: 'Planning poker, with a reveal',
    requires: (s) => !!firstUnstarted(s.sprintPlan),
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          (s) => `Planning poker on "${pokerTitle(s)}". Marcus, before anyone votes: "I was thinking 3?" Everyone reveals. Everyone shows 8. Marcus: "Interesting. So, 3?"`,
          (s) => `Poker. The ticket is "${pokerTitle(s)}". The tool is the new one, where the cards take four seconds to flip. Marcus flips first: 3. Then he says "no peeking!" Everyone else flips: 8, 8, 8, 13. Marcus: "Let's split the difference. 3."`,
          (s) => `Marcus opens "${pokerTitle(s)}" and says "gut feel, no overthinking. I'm hearing 3 from the business side." Nobody from the business side is in the call. The reveal is a wall of 8s. Marcus types 3 into the field and says "we can always re-estimate."`,
          (s, c) => `Poker at ${T(c)}. "${pokerTitle(s)}" comes up. {dev}: "that's the one with the migration, right?" Marcus: "Tiny migration. I was thinking 3." Reveal: 8, 8, 8, and a "?" from the one person who read the ticket. Marcus logs a 3.`,
          (s) => `Planning poker. "${pokerTitle(s)}". {bro} from sales has joined "to listen" and votes 2. Engineers vote 8. Marcus averages the room, listener included, and gets "about a 3." The tool does not support decimals, which is the only thing stopping him.`,
        ],
        choices: [
          { label: '"It is an 8. Every engineer said 8."', next: 'hold' },
          { label: 'Fold. Let it be a 3.', next: 'fold' },
        ],
      },
      hold: {
        description: 'You hold. "Every engineer in this call said 8. That is the estimate." Marcus: "Totally hear you. Let\'s not get stuck on numbers." He opens a side conversation with the PM lead in chat. You can see him typing. He types for a long time.',
        choices: [
          { label: 'Hold the line', effect: { focus: -1, capital: -1, chance: { p: 0.4, effect: { splitTicket: true }, log: 'Resolution: the ticket was split into "two 3s" so the 8 would go away. The two 3s are bigger than the 8.', elseLog: 'The 8 stayed. Marcus wrote "(team estimate)" next to it, in a tone.' } }, log: 'You held at 8. The meeting ran twenty minutes over, discussing whether 8 was "a mindset."' },
          { label: '"Fine, 3. But write down who said 3."', effect: { focus: -0.5, capital: -0.5, foldEstimate: true, morale: -3 }, log: 'The ticket is logged as a 3 with a comment that says "estimate: product." The comment will be deleted before the velocity audit.' },
        ],
      },
      fold: {
        description: 'You fold. The 3 goes in. {dev} DMs you a single period. Marcus: "Great, that was fast! See, poker works when we trust each other." The ticket is still the ticket. The hours are still the hours. Only the number changed, and the number is the one leadership reads.',
        choices: [
          { label: 'Close the DM. Move on.', effect: { focus: -0.5, foldEstimate: true, morale: -3 }, log: 'The 8 is logged as a 3. The velocity chart now says you are fast. You will be asked to be faster.' },
          { label: 'Reply to {dev}: "I know."', effect: { focus: -0.5, foldEstimate: true, morale: -1, burnout: 1 }, log: '{dev} replied "we all know." The 8 is logged as a 3. The velocity chart is pleased.' },
        ],
      },
    },
  },
  {
    id: 'dod_v7', icon: Briefcase,
    title: 'Definition of Done, v7',
    once: true,
    requires: (s) => s.sprint >= 2 && s.sprintPlan.some(t => !t.shipped && t.progress < t.effort),
    descriptions: [
      'Email from the Agile Center of Excellence: "Definition of Done v7 is now in effect." Every ticket now needs an accessibility audit, a security review and a Confluence page. The accessibility reviewer is on leave. The security reviewer is the accessibility reviewer. The Confluence template is in a space you cannot see.',
      'Marcus pastes a link in the channel: "DoD v7 — please read, effective immediately, applies retroactively." Retroactively means your open tickets. Each one now needs a threat model, an a11y checklist and a "decision record." The decision record template has a required field called "decision." It is 200 characters max.',
      'All-team Slack: "To raise our quality bar, Definition of Done v7 adds three lightweight gates." The three lightweight gates are three reviews by two people who are on leave. The gates apply to everything already in flight. The message ends with a 🎉.',
      'A pinned message from the Quality Guild: "v7 of the DoD simplifies the process." v6 had four gates. v7 has seven, each "simplified." The approvers are listed. Two are on sabbatical. One left in March. One is a Slack bot that answers "LGTM" to everything, which is the only working part of the process.',
      (s, c) => `At ${T(c)} the Definition of Done changed under you. v7 adds an accessibility sign-off, a security sign-off and a documentation page per ticket. The sign-off form asks for the ticket's Confluence page. The Confluence template asks for the sign-off. Nobody has reviewed the process for circularity. There is no gate for that.`,
    ],
    choices: [
      { label: 'Comply. Every ticket, every gate.', effect: { focus: -1.5, inflateAll: 2, burnout: 3 }, log: 'Every open ticket now carries two more hours of forms, reviews and a page in a space you cannot see. Quality has been raised. Nothing else has.' },
      { label: 'Ask for an exception for in-flight work', effect: { focus: -0.75, capital: -1, chance: { p: 0.5, effect: { inflateAll: 2 }, log: 'The exception was "escalated." The escalation was denied by the bot. v7 applies to everything you were already doing.', elseLog: 'The exception was granted, "this once," with a note in your file. In-flight work stays as it was. Everything you start next will need all seven gates.' } }, log: 'You asked for an exception. Exceptions are reviewed by the Exceptions Working Group. It meets monthly.' },
      { label: 'Comply on paper. Fill every form with "N/A."', effect: { focus: -0.75, debt: 5, morale: -1 }, log: 'Seven gates, seven "N/A"s, one LGTM from the bot. The quality bar has been raised, and you walked under it.' },
    ],
  },
  {
    id: 'agile_coach', icon: Sparkles,
    title: 'The agile coach arrives',
    once: true,
    requires: (s) => s.sprint >= 2,
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          'A transformation consultant has been engaged "to help the team scale agile." {coach} has a lanyard and a framework. The framework has a train. The train has a two-day planning event in a hotel with no Wi-Fi, next week, attendance "strongly voluntary." Your sprint commitment is unchanged.',
          (s, c) => `All-team invite at ${T(c)}: "Agile Transformation Kickoff with {coach}." {coach} opens with "I'm not here to add process." Slide 4 is the process. It has 23 ceremonies. One of them is the ceremony for retiring ceremonies. It has never been held. The first real one is a two-day planning offsite.`,
          '{coach}, the new agile coach, introduces himself by asking everyone for "one word for how the team feels." Eleven people say "fine." He writes FINE on a sticky note and says "we have work to do." The work is a two-day planning offsite. Your tickets are not invited.',
          'A deck titled "Scaling Agile @ Initech." {coach} explains that the team will join a "release train." The train has a "train engineer." The train engineer is Marcus. The first stop is a two-day planning event in a conference hotel with a "no laptops" rule and a "bring your laptop" reminder.',
          '{coach} has been with the company for four days and has already renamed the sprint. It is now an "iteration." The standup is a "daily sync." The retro is "inspect and adapt." Nothing else changed. He has booked two days in a hotel to plan the next ten weeks. The room has no Wi-Fi, so people can "be present."',
        ],
        choices: [
          { label: 'Attend the two-day planning offsite', next: 'attend' },
          { label: 'Dial in from your desk', next: 'dial_in' },
          { label: 'Skip it. You have a sprint.', next: 'skip' },
        ],
      },
      attend: {
        description: 'Two days in a hotel ballroom. Day one: a vision speech, a "confidence vote" by fist of five, a lunch where the vegetarian option is bread. Day two: your team\'s "program board" is a wall of red string. {coach} calls this "healthy tension." The Wi-Fi password is on a slide nobody shared.',
        choices: [
          { label: 'Be present. Hold the string.', effect: { focus: -2, burnout: 6, morale: -4, dailyTax: { hours: 2, days: 1, label: 'Day two of the planning offsite' } }, log: 'Two days of planning for ten weeks of work. Your tickets are on the program board under a different name with a different date. The confidence vote was a 3. "Great energy."' },
          { label: 'Work on your laptop under the table', effect: { focus: -1.5, burnout: 5, morale: -2, capital: -0.5, dailyTax: { hours: 1.5, days: 1, label: 'Day two of the planning offsite, under the table' } }, log: 'You got some real work done under a table. {coach} noticed. He mentioned "psychological safety" while looking at you.' },
        ],
      },
      dial_in: {
        description: 'You dial in. The room has one laptop pointed at a whiteboard. The audio is a ceiling microphone from 2011. You hear chairs. Someone writes your name on a sticky note and moves it to a column you cannot read.',
        choices: [
          { label: 'Stay on the call, muted, all day', effect: { focus: -2, burnout: 2, chance: { p: 0.6, effect: { capital: -1 }, log: 'You were the only one on the call. The room could not hear you. Your team was planned without you, and it was noted that you "didn\'t engage."', elseLog: 'Three others dialed in. Together you formed a breakout room nobody visited. You planned your own quarter. It was not adopted.' } }, log: 'You dialed in. The room was a rumour of voices and the squeak of a marker.' },
          { label: 'Drop after an hour', effect: { focus: -1, capital: -1, burnout: 1 }, log: 'You dropped at the "confidence vote." Your confidence was recorded as a 5 in your absence. It is the highest on the team.' },
        ],
      },
      skip: {
        description: 'You skip it. You have a sprint. On day two a photo lands in the channel: the program board, fully strung, and in the corner a sticky note with your team\'s name and the word REPRIORITIZED. {coach}: "Great session! The release train has aligned the backlog!"',
        choices: [
          { label: 'Open the "aligned" backlog', effect: { focus: -0.5, capital: -2, pivotTicket: true }, log: 'The release train re-prioritized your tickets while you worked. The most-progressed one is "deferred to the next increment." It was replaced with the train\'s top item.' },
          { label: 'Ask what "aligned" means', effect: { focus: -1, capital: -2, pivotTicket: true, burnout: 1 }, log: 'The answer took forty minutes and contained the word "cadence." Your most-progressed ticket is gone either way. The train does not stop for questions.' },
        ],
      },
    },
  },
  {
    id: 'velocity_audit', icon: Briefcase,
    title: 'Velocity audit',
    requires: (s) => s.sprint >= 3,
    descriptions: [
      'A chart of your velocity is in the leadership deck, next to a team of twelve. Your line is lower. Nobody normalized by headcount because the deck is "directional." Marcus: "They\'d love us to commit to 20% more next sprint. We believe in you."',
      (s) => `"Velocity Review — Sprint ${s.sprint}." A director shares a chart with two lines. One is your team. One is "Platform (12 engineers)." The axes are unlabeled. The conclusion is labeled: "Commit +20%." Marcus, in chat: "we got this 💪".`,
      'Marcus forwards a slide from the ops review. Title: "Velocity Opportunity." It is your burn chart with a dotted line drawn 20% higher in PowerPoint. The dotted line is called "ambition." The ask is to hit the dotted line. It was drawn by someone who has never seen a ticket.',
      'The velocity audit found your points per sprint are "below peer." The peer is a team that logs every 8 as a 3. The recommendation is to commit to 20% more. The recommendation does not mention the 3s. Marcus: "Honestly, it\'s a compliment. They think we can."',
      'A "data-driven" review. The data is story points, which the same deck calls "not a measure of productivity" on slide 2 and uses as one on slides 3 through 19. Slide 20: "Team commits to +20%." The slide was made before the meeting. The meeting is to agree with it.',
      { text: 'The velocity audit has noticed that your team is "fast." It noticed because last sprint\'s 8s were logged as 3s. Fast teams get stretch goals. Marcus: "They want 20% more. Which, based on the numbers, we can totally do." The numbers are the 3s.', requires: (s) => (s.foldedEstimates || 0) > 0 },
    ],
    choices: [
      { label: '"Fine. 20% more."', effect: { focus: -0.5, velocityCommit: true, morale: -3, burnout: 2 }, log: 'You committed to 20% more. The commitment is in the deck. Next sprint\'s plan will arrive with the 20% already in it.' },
      { label: 'Push back with data', effect: { focus: -1.5, capital: -1, chance: { p: 0.5, effect: { velocityCommit: true }, log: 'Your data was "appreciated." Marcus committed to the 20% on your behalf "to keep momentum." The data is in an appendix.', elseLog: 'Your data landed. The commitment was "parked." The chart will be back next quarter with a new dotted line.' } }, log: 'You spent the afternoon building the chart that shows the chart is wrong.' },
    ],
  },
  {
    id: 'sprint_goal_changed', icon: AlertTriangle,
    title: 'The sprint goal has changed',
    requires: (s) => s.currentDay === 3 && s.sprintPlan.some(t => !t.shipped && t.progress > 0),
    descriptions: [
      'Wednesday. Marcus: "Small update from leadership: the sprint goal is now the other thing." The tickets are the same tickets. The goal is a different goal. He asks everyone to "re-anchor." Nobody knows what the other thing is yet. It will be in a doc.',
      (s, c) => `${T(c)}, day three. A Slack announcement: "Sprint goal updated ✏️." The new goal is a sentence from the CEO's all-hands, pasted whole. It contains the word "delight." Your in-progress ticket does not delight anyone. It is now "off-goal."`,
      'Marcus edits the sprint goal in place. The board keeps history. Monday: "Ship the export." Wednesday: "Enable growth through platform excellence." The tickets did not change. The way they are judged did. The retro will praise the team\'s adaptability.',
      'A new pinned message: "Mid-sprint goal refresh — same tickets, new focus 🎯." The new focus is the opposite of the old focus. {bro} from sales reacts with 🚀. The ticket you have spent two days on is now "a distraction from the goal."',
      'Marcus, apologetic: "I know we\'re mid-sprint. Leadership re-prioritized. The goal is now the other thing. The tickets don\'t change, we just... emphasize differently." The emphasis is that your most-progressed ticket is the wrong one.',
    ],
    choices: [
      { label: 'Re-anchor. Pivot to the new goal.', effect: { focus: -1, pivotTicket: true, morale: -4 }, log: 'You re-anchored. Two days of work are "deferred to a future sprint" that does not exist. The retro will call this adaptability.' },
      { label: 'Keep working the old goal, quietly', effect: { focus: -0.5, capital: -1.5, debt: 3, morale: -2 }, log: 'You kept going. Your ticket is "off-goal" on every dashboard. At the retro you will be praised for adaptability anyway, because the template only has that column.' },
    ],
  },
  {
    id: 'no_meeting_wednesday', icon: Clock,
    title: 'No-Meeting Wednesday',
    requires: (s) => s.currentDay === 3,
    descriptions: [
      'No-Meeting Wednesday was announced in a meeting. Your Wednesday now holds an "exception sync," a "quick alignment" and the retrospective on No-Meeting Wednesday. All three have "[no-meeting]" in the invite title, in brackets, as a courtesy.',
      (s, c) => `It is Wednesday, ${T(c)}. The calendar is clear, as promised. Then three invites arrive in one minute: "[NMW exception] Sync," "[NMW exception] Quick alignment," and "[NMW] Retro on No-Meeting Wednesday." The last one is 90 minutes.`,
      'Slack from Marcus: "Reminder: No-Meeting Wednesday 🙌 — protecting focus time! (Two small exceptions today, plus a short one to discuss how NMW is going.)" The short one is longer than the two exceptions combined.',
      'No-Meeting Wednesday has a steering committee. It meets on Wednesdays. Today\'s agenda: "exception policy," "alignment on alignment," and "NMW retro." Attendance is "optional (please attend)." {doug} has already replied-all asking whether the exception sync counts as a meeting.',
      'The "focus day" has arrived. It has a kickoff. The kickoff is a meeting. It is followed by a "working session," which is a meeting with laptops, and a "retro on focus day," which is a meeting about the meeting. All three invites say "no agenda, just vibes."',
    ],
    choices: [
      { label: 'Attend all three', effect: { focus: -3, burnout: 2, morale: -2 }, log: 'No-Meeting Wednesday contained three meetings and a survey about meeting load. You answered "too many." The survey thanked you for your focus.' },
      { label: 'Decline all three', effect: { focus: -0.5, capital: -1.5, morale: -1, dailyTax: { hours: 1, days: 1, label: 'The "quick alignment" that moved to 8 AM' } }, log: 'You declined. "Not a team player," said the person who scheduled three meetings on no-meeting day. The quick alignment has moved to tomorrow at 8 AM.' },
      { label: 'Attend the retro, skip the exceptions', effect: { focus: -1.5, capital: -0.5, burnout: 1 }, log: 'The retro on No-Meeting Wednesday concluded that it was a success, pending the exceptions. The exceptions were rescheduled to Thursday, which is a meeting day anyway.' },
    ],
  },
  // =====================================================================
  // INFRASTRUCTURE THEATER — the tools that all the process assumes exist.
  // They exist. They are booked, queued, logged out, defaulted, updating,
  // scanning themselves, or in the old channel.
  // =====================================================================
  {
    id: 'staging_booked', icon: Wrench,
    title: 'Staging is booked',
    requires: (s) => s.currentDay >= 2 && s.sprintPlan.some(t => !t.shipped && t.progress > 0),
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          'Staging was reset last night "for the sales demo." Your test data is gone. The demo is at 2 PM, on staging, using your half-finished feature, with a sticker over the broken button. The sticker says "coming soon." {bro} put it there.',
          (s, c) => `A message in #platform at ${T(c)}: "Heads up, staging has been wiped and re-seeded for a customer demo 🙏 please don't deploy until EOD." Your test data was on staging. Your branch is deployed to staging. The customer will see your branch. The branch has a button that does nothing.`,
          'The staging environment has a booking calendar now. It is fully booked by sales through Thursday. Your slot is "Friday, 7 AM to 7:30 AM." Your test data was deleted during the re-seed. The demo running right now is clicking through your feature and narrating the parts that do not exist yet.',
          'Staging is "frozen for a demo." Frozen means someone restored a two-week-old snapshot over it. Your fixtures are gone. Your migration is gone. Your feature is half there, which is the half {bro} is showing a prospect right now, from the slide that says "live in production."',
          'Platform: "Reminder that staging is a shared resource 🙂 We reset it nightly now." Nobody was reminded before the first reset. Your test data lasted eleven hours. Sales has booked staging for the afternoon, for a demo of the feature you have not finished, with the broken button hidden behind the presenter\'s cursor.',
        ],
        choices: [
          { label: 'Rebuild the test data', effect: { focus: -2, burnout: 2 }, log: 'Two hours of seeding, by hand, from a script that "used to work." The data will be wiped again tonight. You know that now. You will do it again tomorrow.' },
          { label: 'Test in prod. Read-only. Carefully.', next: 'prod' },
          { label: 'Wait for the demo to finish', next: 'wait' },
        ],
      },
      prod: {
        description: 'You test in production. Read-only. You say the words "read-only" out loud, to no one. The feature flag is off in prod, so you flip it for your user only. The flag service applies "your user" by matching on email domain. Everyone at the company now has the feature. The broken button is live.',
        choices: [
          { label: 'Flip it back. Quietly.', effect: { focus: -1.5, debt: 8, burnout: 3, chance: { p: 0.25, effect: { queueEvent: 'production_fire' }, log: 'Someone clicked the button in those four minutes. Something happened to a real account. Tomorrow starts with it.', elseLog: 'Nobody clicked the button in the four minutes it was live. You will not be that lucky twice.' } }, log: 'Flipped back. Four minutes of "read-only" testing in prod. There is now a row in a real table with your name in it.' },
          { label: 'Leave it. Nobody will notice.', effect: { focus: -1, debt: 10, burnout: 2, capital: -0.5, chance: { p: 0.5, effect: { queueEvent: 'production_fire' }, log: 'Someone noticed. A customer, specifically. Tomorrow starts with it.', elseLog: 'Nobody noticed today. The button is still live. This is now an incident with a start date and no end date.' } }, log: 'You left it on. "It\'s basically a soft launch." Nobody agreed to a soft launch.' },
        ],
      },
      wait: {
        description: 'You wait. The demo runs long. Through the wall you hear "and this part is live" about a part that is not live. Then a pause. Then "huh." Then a Slack message to you: "quick one, the button on staging throws a 500, is that known?" It is known. It is yours. It is not finished.',
        choices: [
          { label: 'Explain that it is not finished', effect: { focus: -3, addUrgentBug: true, morale: -2 }, log: 'You explained. The explanation became a bug ticket titled with the prospect\'s name. Priority: "before they sign." The afternoon was gone anyway.' },
          { label: '"Known. Fix incoming."', effect: { focus: -3, addUrgentBug: true, debt: 3, burnout: 2 }, log: 'A fix is now "incoming." A ticket was created with your words as the title. The afternoon went to the demo\'s follow-up questions, in a thread, with the prospect CC\'d.' },
        ],
      },
    },
  },
  {
    id: 'ci_queue', icon: Clock,
    title: 'The CI queue',
    descriptions: [
      'You push. The pipeline runs the full suite on every change, including the README. The queue is two hours. There is a fast lane. The fast lane needs a ticket. The ticketing system is down.',
      (s, c) => `Pushed at ${T(c)}. Position in queue: 41. Estimated start: ${T(c, 118)}. Ahead of you: a typo fix, a branch called "test-do-not-merge" that has been merging for three weeks, and a nightly job that runs at noon.`,
      'The CI queue is two hours because someone added a "quick smoke test" that spins up the whole platform, per commit, per branch. The person who added it has left. The test has never found anything. Removing it needs a change, which needs CI, which is a two-hour queue.',
      'Pipeline status: "queued (runner capacity)." Runner capacity was cut "for cost reasons" in the same email that announced the "ship daily" initiative. The email had a rocket emoji. The queue has a two-hour ETA and a rocket emoji.',
      'Your PR has been waiting for a runner for 90 minutes. The runners are busy running the pipeline for a bot that updates the pipeline. The bot\'s PR is also waiting for a runner. {dev} has started a thread about it, titled "CI (again)." It has 212 messages and no owner.',
    ],
    choices: [
      { label: 'Wait it out', effect: { focus: -2, burnout: 1 }, log: 'Two hours watching a spinner. It went green. You merged. The next person\'s two hours started.' },
      { label: 'Merge on red. "It\'s just the flaky one."', effect: { focus: -0.25, debt: 6, capital: -0.5, chance: { p: 0.5, effect: { queueEvent: 'production_fire' }, log: 'It was not just the flaky one. Tomorrow starts with what it was.', elseLog: 'It was, this time, just the flaky one. You have now trained yourself to believe that.' } }, log: 'Merged on red. The flaky test was red. So was one other test. You did not look at the other test.' },
      { label: 'Fix the pipeline instead', effect: { focus: -3, debt: -3, morale: 2, burnout: 2, chance: { p: 0.5, effect: { capital: -0.5 }, log: 'The fix needs two approvals. The team has two engineers. One is on leave. The fix is now a draft, "for visibility."', elseLog: 'The fix got its two approvals from one person with two accounts. Nobody asked. The queue is forty minutes shorter.' } }, log: 'You spent the afternoon on the pipeline. Your ticket did not move. The pipeline did, a little.' },
    ],
  },
  {
    id: 'sso_reauth', icon: Wrench,
    title: 'Please sign in again',
    descriptions: [
      'IT shortened the SSO session to 15 minutes "for security." Every tool logs you out mid-command. The terminal, the wiki, the ticket tracker, the tool that lets you ask IT about it. The MFA app wants your face. Your face is tired.',
      (s, c) => `${T(c)}: signed out. ${T(c, 15)}: signed out. ${T(c, 30)}: signed out of a page that was telling you how to stay signed in. The security announcement calls this "frictionless."`,
      'A new security posture: "zero trust." It means every tool trusts you for a quarter of an hour. Your deploy script needs four tools. It takes sixteen minutes. The last tool asks you to sign in again, and the deploy starts over, and so do you.',
      'Slack from IT: "You may notice more frequent sign-in prompts today. This is expected and improves our security score 🔒." The security score is a number on a dashboard. The dashboard needs you to sign in. Twice.',
      'The password manager has logged you out. Its password is in the password manager. The recovery email went to an inbox that needs SSO. SSO needs the MFA app. The MFA app needs a Wi-Fi network that needs SSO. You write your password on a sticky note, which is the thing the policy was for.',
    ],
    choices: [
      { label: 'Keep signing in. All day.', effect: { focus: -0.5, focusPct: -10, askTax: 0.25 }, log: 'Thirty-one sign-ins. Your face in the MFA camera got progressively less recognisable. Everyone you could ask for help was signing in too, so every answer took a quarter hour longer.' },
      { label: 'File a ticket with IT', effect: { focus: -0.5, focusPct: -5, askTax: 0.25, capital: -0.25 }, log: 'Ticket closed in 40 minutes: "Working as designed." The design is signing in. You signed in to read the closure. So did everyone you asked for help today.' },
    ],
  },
  {
    id: 'flags_down', icon: Wrench,
    title: 'Feature flags are down',
    descriptions: [
      'The flag service is unreachable. Every flag is now its default. Your feature\'s default is on in production and off in staging, because the defaults were set by two different people in two different years. Customers are seeing a thing nobody has tested. Testers cannot see it at all.',
      (s, c) => `At ${T(c)} the feature-flag service stopped answering. Every flag fell back to its default. Yours defaults to on in prod, "for the demo," and off everywhere else, "for safety." The safe environments are safe. The customers are the demo.`,
      'Platform: "flag service is degraded, flags may evaluate to defaults 🙏." The defaults were written in 2023 by someone optimising for a different product. Your half-built feature has a default of "true," written as a placeholder, in a file nobody reads, which is now the only file that matters.',
      'The flag service is down. The runbook says to flip the flags in the admin UI. The admin UI is behind a flag. Someone suggests deploying with the flag hard-coded off. Deploys are gated on a flag check. The gate is down, so deploys are, cautiously, also off.',
      'The flag vendor had an outage. Their status page says "operational." Your feature is live for everyone in production and invisible on staging. Support has questions. QA has a different set of questions. Neither set can be answered without the flag service.',
    ],
    choices: [
      { label: 'Hotfix the defaults', effect: { focus: -2, debt: 4, burnout: 2 }, log: 'You changed the defaults in code, which needed a deploy, which needed a flag, which you also hard-coded. The hotfix will be the default forever now. That is what hotfixes are.' },
      { label: 'Wait for the platform team', effect: { focus: -1.5, chance: { p: 0.5, effect: { queueEvent: 'production_fire' }, log: 'The platform team restored the service at 6 PM. By then a customer had used the untested feature on real data. Tomorrow opens with the result.', elseLog: 'The platform team restored the service mid-afternoon. The window closed before anyone important clicked anything. The postmortem will call this "a near miss" and schedule nothing.' } }, log: 'You waited. The platform team was also waiting, for the vendor, who was waiting for a different vendor.' },
    ],
  },
  {
    id: 'os_update', icon: Wrench,
    title: 'Mandatory update: "about 7 minutes"',
    descriptions: [
      'A dialog: "Your device must restart to install a required security update. Estimated time: 7 minutes." There is no "later." There was a "later" yesterday. You pressed it. The update remembers.',
      (s, c) => `${T(c)}. "Restarting in 60 seconds to apply a required update." Your terminal has a change you have not committed. Your editor has a tab you have not saved. The countdown does not care about either. Estimated time: 7 minutes. It will be 90.`,
      'IT pushed an update "with no user impact." The user impact is a forced restart, a 90-minute "optimising your apps" bar, and a new default browser. The browser is the one with the AI sidebar. The sidebar opens on every page. It wants to summarise your terminal.',
      'The device management tool has decided it is time. "Installing update 1 of 4." Each one needs a restart. Each restart needs your password, which is in the password manager, which needs the update to finish. The progress bar reaches 100% and starts over, as a courtesy.',
      { text: 'The laptop restarts itself in the middle of a sentence. On the lock screen: "Working on updates. 3%. Do not turn off your computer." Your branch had uncommitted changes. The office has a loaner laptop. It is a 2019 model with the previous version of everything, including the update.', requires: OFFICE },
      { text: 'The laptop restarts itself in the middle of a sentence. On the lock screen: "Working on updates. 3%. Do not turn off your computer." Your branch had uncommitted changes. You have one laptop. The kitchen has a kettle. You watch the kettle. It is faster than the update.', requires: REMOTE },
    ],
    choices: [
      { label: 'Let it run', effect: { focus: -1.5, burnout: 1, chance: { p: 0.4, effect: { loseProgress: 2 }, log: 'The restart ate the uncommitted change. The stash was not where you thought. Up to two hours of the current ticket, back to where they were this morning.', elseLog: 'The uncommitted change survived, by luck. "Estimated time: 7 minutes" took 90. The release notes say "performance improvements."' } }, log: 'Ninety minutes of a progress bar that reached 99% three times.' },
      { label: 'Postpone it. Again.', effect: { focus: -0.25, burnout: 1, dailyTax: { hours: 1.5, days: 1, label: 'The update that could not be postponed again' } }, log: 'Postponed. The dialog says "tomorrow, 9 AM, no further postponement." Tomorrow morning is already shorter.' },
    ],
  },
  {
    id: 'security_scanner', icon: AlertTriangle,
    title: 'The new security scanner',
    once: true,
    requires: (s) => s.sprint >= 2,
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          'A scanner has been enabled "to shift security left." It flags 312 findings in legacy code and blocks every PR until they are fixed, including the PR that tunes the scanner. The security team\'s dashboard shows the number going up. They are pleased with the visibility.',
          (s, c) => `Since ${T(c)}, every PR is blocked by a new "security gate." It found 312 issues, 300 of them in a vendored library from 2019 and 12 in the scanner's own config file. The fix for the config file is a PR. The PR is blocked by the gate.`,
          'Security: "Great news, we\'ve enabled continuous scanning on all repos 🛡️." Continuous means every push. The scan takes 25 minutes and fails on the test fixtures, which contain the string "password" as a test of the password field. Every PR is red. The scanner has a PR to fix this. It is red.',
          'A "shift-left" initiative has landed a scanner in CI. It has found 312 things. It has blocked merging. The security team offers a two-hour "findings triage workshop" to "empower" the team. The workshop is next Tuesday. Merging is today.',
          'The new scanner has flagged your PR for "hard-coded secret." The secret is the word "example" in a comment. It also flagged the README, the license, and itself. {dev} tried to suppress the finding. The suppression file is flagged for "disabling security controls." The scanner is now reviewing its own review. Nothing merges.',
        ],
        choices: [
          { label: 'Triage all 312', effect: { focus: -3, burnout: 6, debt: -2 }, log: 'You triaged all 312. Nine were real, in code nobody owns. You own them now. The other 303 are "accepted risk," in a spreadsheet, which the scanner will flag tomorrow.' },
          { label: 'Suppress with a baseline file', effect: { focus: -1, debt: 5, morale: -1 }, log: 'A baseline file: 312 findings marked "existing." New findings are compared to the baseline. The baseline is now the security policy. It has a typo that excludes the auth module. Nobody will notice until it matters.' },
          { label: 'Escalate: this blocks every PR', next: 'escalate' },
        ],
      },
      escalate: {
        description: 'You escalate. The security lead agrees that blocking every PR is "not the intent." The intent is in a deck. The deck is not in the scanner. A meeting is called with you, security, platform, and someone from Legal who was on the invite by mistake and stays.',
        choices: [
          { label: 'Push for turning it off until it is tuned', effect: { focus: -1.5, capital: -1, chance: { p: 0.5, effect: { addCleanup: { title: 'Re-enable the security scanner "properly this time"', effort: 6, debt: -2, type: 'refactor' } }, log: 'The scanner is "temporarily" off. Re-enabling it is a ticket for next sprint, assigned to you, because you turned it off.', elseLog: 'The scanner stays on, "in warn mode." Warn mode blocks merging with a yellow icon instead of a red one. The deck has been updated to call the rollout a success.' } }, log: 'An hour and a half of meeting about the scanner. Legal asked whether "shift-left" is a legal term. It is not. It is in the minutes.' },
          { label: 'Ask for an exception for your repo', effect: { focus: -1, capital: -1.5, debt: 2 }, log: 'Your repo has an exception. It is listed on the dashboard as "non-compliant (exception)." The dashboard is reviewed by leadership. Your name is on the exception.' },
        ],
      },
    },
  },
  {
    id: 'channel_migration', icon: MessageSquare,
    title: 'The channel has moved',
    descriptions: [
      'The team channel is now called #team-platform-v2-final-use-this-one. History was not migrated. The pinned onboarding doc links to the old channel. The old channel is archived, which means you can read it but nobody will answer. Three people are still posting there.',
      (s, c) => `At ${T(c)} a bot announces: "This channel is being migrated to the new workspace structure 🎉 Please move to #eng-team-platform-2." The link goes to a channel with no members. The old channel will be archived "at EOD." The thread with the deploy steps is in the old channel. It is not pinned. It never was.`,
      'Workspace re-org. Every channel has a new prefix, a new owner, and no history. The announcement is in the old channel, which you can no longer post in. The new channel\'s description says "see old channel for context."',
      'IT consolidated "redundant" channels. The on-call channel and the bake-sale channel have been merged, because they had "similar membership." The runbook link now resolves to a photo of a lemon drizzle. The lemon drizzle has 14 reactions.',
      'Slack: "#team-platform has been renamed to #team-platform-OLD-DO-NOT-USE." A new channel exists. Its name is #team-platform. It is empty. The thread that explained why the deploy script needs the VPN is in the OLD-DO-NOT-USE one. {jin} is searching for it. {jin} has been searching for forty minutes.',
    ],
    choices: [
      { label: 'Find the new channel. Pin what you can.', effect: { focus: -0.5, focusPct: -8, morale: -2, askTax: 0.25 }, log: 'You joined the new channel and pinned three links. Two go to the old channel. Every question you asked today ended with "it was in the old channel."' },
      { label: 'Keep posting in the old one', effect: { focus: -0.25, focusPct: -8, morale: -2, capital: -0.5, askTax: 0.25 }, log: 'You posted in the old channel. Nobody answered, because everyone who could answer was looking for the new one. Every ask today cost the extra time to find the right room first.' },
    ],
  },
  // =====================================================================
  // CORPORATE CONTRADICTIONS — the thing that is said, and the thing that
  // is done, in the same email.
  // =====================================================================
  {
    id: 'blameless_postmortem', icon: Users,
    title: 'Blameless postmortem',
    requires: (s) => s.sprint >= 2,
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          'A postmortem for last week\'s outage. The template says "blameless" in the title, in bold. Slide 3 is "Timeline (who did what)." Slide 4 is "Root cause: human error." Slide 5 has a photo of the human. The human is in the room. The runbook the timeline says "should have been followed" is a link to a page called "Runbook (TODO)."',
          (s, c) => `Postmortem at ${T(c)}. The facilitator opens with "this is a blameless space." The first question, from a director, is "so who approved the deploy?" The facilitator writes the name on the whiteboard, under the word BLAMELESS, which is still there from the previous postmortem. Action item one: "follow the runbook." There is no runbook.`,
          'The incident review doc, from the template "Blameless Postmortem v3," has a section called "Contributing factors (no names)." The contributing factors are three names. The "action items" section says "be more careful" and "follow the runbook." The runbook link is a 404. It is assigned to one of the names.',
          '"Blameless postmortem" is on the calendar. Blameless, it turns out, means nobody will be fired in the meeting. The meeting has a slide titled "Accountability." It is a list of people, sorted by seniority, ascending, which is the order in which they will be asked why the runbook was not followed. The runbook does not exist.',
          'The postmortem template was updated by the Quality Guild to be "truly blameless." Names have been replaced with roles: "the engineer who merged it," "the engineer who reviewed it," "the engineer who was on call." There are three engineers on the team. {dev} has already worked out which one they are. All three roles "should have consulted the runbook." Nobody has seen the runbook.',
        ],
        choices: [
          { label: 'Speak up about the runbook that does not exist', next: 'speak' },
          { label: 'Stay quiet. It is not your incident.', effect: { morale: -4, burnout: 3, focus: -1.5 }, log: 'You said nothing for ninety minutes. The action items were assigned to people who were not in the room. The runbook that "we should have followed" still does not exist. You knew that. You said nothing.' },
          { label: 'Volunteer to write it up', effect: { focus: -2.5, capital: 0.5, burnout: 2 }, log: 'You wrote a careful, genuinely blameless document. It was filed under "Incidents." Nobody has opened it. The next postmortem will use the old template.' },
        ],
      },
      speak: {
        description: 'You say it. "The runbook the timeline says we should have followed does not exist. It has never existed. The link goes to a page called \'Runbook (TODO).\'" The room is quiet. The facilitator writes "runbook gap" under "contributing factors," then, after a beat, erases "gap."',
        choices: [
          { label: '"Then let\'s write it. Next sprint."', effect: { focus: -1.5, capital: -1, morale: 3, addCleanup: { title: 'Write the runbook the postmortem says we followed', effort: 5, debt: -2, type: 'refactor' } }, log: 'The runbook is now a ticket, for next sprint, assigned to you, for raising it. The postmortem action item still reads "follow the runbook," which will be possible once you have written it.' },
          { label: '"I\'m just noting it for the record."', effect: { focus: -1, capital: -1, morale: 1 }, log: 'Noted for the record. The record is a doc nobody reads. The action item still says "follow the runbook." The runbook still does not exist. You are now the person who "raised concerns," which is a role.' },
        ],
      },
    },
  },
  {
    id: 'return_to_office', icon: Briefcase, inOffice: true,
    title: 'Return-to-office day: "for collaboration"',
    requires: (s) => s.sprint >= 2,
    descriptions: [
      'Three days a week in the office, "for collaboration." Your team is in another time zone. You commuted fifty minutes to take video calls alone, in a phone booth, with the person you would have called from home. The booths are all booked. By people on video calls.',
      (s, c) => `RTO day. Badge-in recorded at ${T(c)}, the dashboard says, with a green tick. The floor is a sea of empty desks and one person on a call with their camera off. Every booth is booked until 5 PM. The booking app offers you "Thursday, 7:30 AM." You have four calls today.`,
      'Facilities has sent a cheerful email about "the energy of being together." The energy is nine people on nine separate video calls at adjacent desks, each hearing the other eight. The booths are full. The "quiet zone" has a sales standup in it. You have four calls today.',
      'In-office day. Your 1:1 is on Zoom, because your manager is remote today. Your standup is on Zoom, because the team is remote. The one in-person interaction is {doug}, who wants to talk about the kitchen. Every phone booth is booked, by people taking calls with people at home. You have four calls.',
      'The collaboration day. The office has been "reconfigured for collaboration," which means the desks are closer together and the booths have been converted into a "collaboration pod" that seats six and is booked by sales until Friday. You have four calls and nowhere to take them.',
    ],
    choices: [
      { label: 'Take the calls from your desk', effect: { focus: -1, boothClosed: true, burnout: 2, chance: { p: 0.3, effect: { queueToday: 'loud_sales_call' }, log: 'The desk next to yours is where the sales team takes its calls. It is about to be a call.', elseLog: 'The open plan was merely open. Nine calls, nine echoes. Nobody collaborated.' } }, log: 'Four calls, one open-plan desk, no booth all day. You learned a lot about the deals the sales team is closing, through your headphones.' },
      { label: 'Find a stairwell', effect: { focus: -1.5, boothClosed: true, burnout: 1, morale: -1 }, log: 'The stairwell has excellent acoustics and no chair. Facilities found you on the third call and asked you to "use a booth." The booths are booked all day. Facilities booked one, for a facilities meeting about booth availability.' },
    ],
  },
  {
    id: 'timesheet_friday', icon: Briefcase,
    title: 'Timesheet Friday',
    requires: (s) => s.currentDay === 5,
    descriptions: [
      'Timesheets are due by noon. Every hour needs a project code. Meetings have no project code. "Other" is rejected by the form. "Admin" is capped at one hour. You had six hours of meetings this week and one hour of admin, and the form wants to know what you were really doing.',
      (s, c) => `A reminder at ${T(c)}: "Timesheets due 12:00 — thanks for your accuracy!" The timesheet tool has 41 project codes. None of them is "the meeting about the timesheet tool." The tool times out after ten minutes of inactivity. Reading the code list takes eleven.`,
      'Finance has rolled out "activity-based time tracking" so leadership can "see where the time goes." The time goes to meetings. Meetings are not a category. The guidance doc says to "allocate meeting time to the project it most benefits." No project benefits from the meetings.',
      'The timesheet rejects your week: "Hours (38) do not match contracted hours (40)." You add two hours of "Other." Rejected: "Other requires a justification." You write "meetings." Rejected: "Please select a project." The dashboard will say whichever project you pick is over budget.',
      'Friday, timesheet day. {jin} at the next desk is on their third attempt. The form has a new mandatory field: "Value delivered (1-5)." For the sprint goal change meeting, {jin} enters 1. The form says "Please enter a value between 3 and 5." {jin} enters 3. The form thanks them for their honesty.',
    ],
    choices: [
      { label: 'Code the meetings as feature work', effect: { focus: -0.5, debt: 2, capital: 0.25 }, log: 'Submitted. Six hours of meetings are now six hours of feature work. The dashboard says the feature is well-resourced and behind, which will be a question for you, in a meeting, which you will code as feature work.' },
      { label: 'File it honestly', effect: { focus: -1, capital: -0.5, morale: 1 }, log: 'Submitted, with a justification per row. Finance replied within the hour: "Your utilisation looks low this week, is everything OK?" Everything is the same as every week. This is the first week it was written down.' },
      { label: 'Skip it. It is Friday.', effect: { focus: -0.25, burnout: 2, chance: { p: 0.6, effect: { queueEvent: 'quick_sync' }, log: 'Monday opens with a "quick sync" about the timesheet, which will take longer than the timesheet.', elseLog: 'Three reminders, a dashboard with your name in red, and no follow-up. The system assumed 40 hours on "Unallocated." Unallocated is now the best-resourced project in the company.' } }, log: 'You did not fill in the timesheet. The timesheet filled itself in, with zeros, and emailed your manager.' },
    ],
  },
  {
    id: 'phishing_sim', icon: Wrench,
    title: 'Phishing simulation',
    descriptions: [
      'You report the "urgent invoice" email, as trained. It was the real CFO. The real invoice is now 48 hours late. Security thanks you for your vigilance and assigns you a training module for reporting a real email, which the module calls "a false positive event."',
      (s, c) => `An email at ${T(c)}: "URGENT: action required on your account." You hover over the link, as trained. It goes to the real HR system. You report it anyway, as trained. It was the real HR system, with a real deadline, which you have now missed. Security awards you a "Vigilant" badge and a 25-minute module.`,
      'The quarterly phishing test. You passed, by ignoring an email that turned out to be the test. You also ignored the real onboarding email for the new expense tool, which looked identical. Your expenses are rejected. Security has assigned everyone a module anyway, "to keep sharp."',
      'Security sends a company-wide email: "Congratulations, 94% of you spotted this quarter\'s simulation!" The email asks you to click a link to see your score. Half the company reports the email. Security assigns the half that reported it a module on "recognising legitimate communications." You are in that half.',
      'You click "Report phishing" on an email about mandatory phishing training. The email was legitimate. The training is now mandatory and overdue. Its first lesson is "when in doubt, report it." You are in doubt. You report the training. The system is "looking into it." The module is still assigned.',
    ],
    choices: [
      { label: 'Do the module', effect: { focus: -0.75, morale: -1 }, log: 'Twenty-five minutes of a video you cannot skip, a quiz you cannot fail, and a certificate you cannot find afterwards. The module\'s last slide says "when in doubt, report it."' },
      { label: 'Ignore it', effect: { focus: -0.25, capital: -0.5, focusPct: -5 }, log: 'Three reminders by lunch, each with a bigger red banner. The third one came from an address you have never seen. You reported it. It was Security. They have assigned you a second module.' },
    ],
  },
  {
    id: 'self_assessment', icon: Briefcase,
    title: 'Self-assessment season',
    once: true,
    requires: (s) => s.sprint >= 2 && s.currentDay <= 3,
    start: 'open',
    nodes: {
      open: {
        descriptions: [
          'Performance season. The self-assessment form is "designed to be lightweight": nine sections, 2,000 characters each, due Friday. The form times out after twenty minutes and does not save. There is a "save draft" button. It is decorative.',
          (s, c) => `HR, at ${T(c)}: "Your self-assessment is open! Keep it brief 🙂 Due Friday." Brief is nine sections. Each has a prompt like "Describe your impact against the leadership principles, with examples." The principles were updated last week. The old ones are still in the form. The form logs you out every twenty minutes.`,
          'The self-assessment tool wants "three examples of exceeding expectations" per value. There are eight values. The tool has a word count minimum and a twenty-minute session. Due Friday. Your manager has told you, kindly, that "it mostly doesn\'t matter," and also that calibration is based on it.',
          'Self-assessment season. The guidance says "be concise." The form rejects sections under 500 characters. It also rejects sections over 2,000. It also logs you out every twenty minutes, taking the section with it. Due Friday. It is a review of your resilience.',
          'Performance review time. Your manager will "mostly copy from your self-assessment," so it had better be good. The form is in a tool that only works in one browser, which is not the browser IT installed last week. Nine sections, Friday, no saving, twenty minutes a session.',
        ],
        choices: [
          { label: 'Do it properly. A bit every day.', effect: { morale: -2, dailyTax: { hours: 0.75, days: 5, label: 'Self-assessment, a section at a time, before the form logs you out' } }, log: 'Nine sections over the week, written in a text editor and pasted in before the timeout. Your manager will read the first paragraph. Calibration will read the score.' },
          { label: 'Paste last year\'s and change the dates', effect: { focus: -0.5, morale: -1, chance: { p: 0.3, effect: { capital: -1 }, log: 'Your manager noticed. Last year\'s assessment mentioned a project that was cancelled in March. It was noted, warmly, in a way that will come back in calibration.', elseLog: 'Nobody noticed. Last year\'s assessment was a copy of the year before. The tool has a plagiarism check. It is for the other direction.' } }, log: 'Last year\'s nine sections, this year\'s dates, thirty minutes. The form timed out once anyway.' },
          { label: 'Ask for an extension', next: 'extension' },
        ],
      },
      extension: {
        description: 'You ask for an extension. HR replies within four minutes: "Of course! We want this to be a reflective exercise, not a rush. Extended until Saturday 9 AM." Saturday is not a working day. The form does not know that.',
        choices: [
          { label: 'Take the Saturday', effect: { capital: -0.5, burnout: 4, morale: -2, focus: -0.25 }, log: 'You did it on Saturday morning, at the kitchen table, in one sitting, before the form could time out. The extension is noted in your file as "requested additional time."' },
          { label: 'Do it Friday anyway, badly', effect: { capital: -0.5, focus: -1.5, morale: -2 }, log: 'Friday afternoon, nine sections, the minimum word count, the maximum caffeine. The extension is still noted in your file. The assessment is still the one calibration reads.' },
        ],
      },
    },
  },
  {
    id: 'hackathon', icon: Sparkles,
    title: 'Mandatory fun: the hackathon',
    requires: (s) => s.sprint >= 2 && s.currentDay <= 3,
    descriptions: [
      'Two days of "innovation time," announced the same week as the release. The sprint commitment is unchanged. Attendance is "strongly encouraged," which is a phrase with a dashboard. Prizes are stickers. The judges are the people who set the release date.',
      (s, c) => `A calendar block from ${T(c)}: "HACKATHON 🚀 (2 days)." Underneath, in the description: "Note: sprint deliverables are not affected." They are not affected in the sense that they are still due. The hackathon has a theme. The theme is "velocity."`,
      'The hackathon kickoff. "No managers, no tickets, just building!" The CTO then presents a list of "suggested problem areas," which is the roadmap. Teams that pick a roadmap item get "priority support." Teams that do not get a sticker. The sprint is still the sprint. The demos are tomorrow at five.',
      'Hackathon week. The company has rented a space with beanbags. The beanbags are for "ideation." Ideation is scheduled: 9:00 to 9:30. Building is 9:30 to 17:00, today and tomorrow. Demos are tomorrow at 17:00. The demo that wins will be "parked" by Monday. The release is Thursday. Nobody has moved the release.',
      '"Two days to build anything you want!" says the invite. "Please align your project with Q3 OKRs," says the follow-up. "Attendance is optional," says HR. "Visible non-participation will be reflected in the engagement survey," says nobody, out loud, in a way you can quote. Demos are tomorrow at five.',
    ],
    choices: [
      { label: 'Participate. Build the thing.', effect: { focus: -2, morale: -2, burnout: 3, dailyTax: { hours: 2, days: 1, label: 'Hackathon, day two' } }, log: 'Two days, one demo, forty seconds of applause, a sticker. The project was "parked for a future quarter" by Monday standup. The release date has not moved. Your tickets have not moved either.' },
      { label: 'Skip it. You have a release.', effect: { focus: -0.5, capital: -1.5, morale: -2 }, log: 'You skipped the hackathon. Your name is on a slide titled "Participation," in a different colour. The people who participated also have a release on Thursday. They are now two days behind you, and you are behind.' },
      { label: 'Show up for the demos only', effect: { focus: -1, capital: -0.5, morale: -1 }, log: 'You attended the demos. Eleven projects, nine of them a chatbot. The winner was a chatbot that books phone booths. The booths are still booked. The release is still Thursday.' },
    ],
  },
];

export const MELTDOWN_EVENT = {
  id: 'meltdown', icon: Flame,
  title: 'Something gives',
  start: 'open',
  nodes: {
    open: {
      description: 'You are sitting at your desk. Marcus just sent another "quick question." The dashboard is on fire. Doug is approaching with his phone out, mouth already moving. You have not eaten today. Your hands are cold. The screen blurs, then sharpens, then blurs again.\n\nSomething is about to happen. You can feel it in your jaw.',
      choices: [
        { label: 'Stand up. Walk to the boardroom.', next: 'boardroom' },
        { label: 'Open Slack. Type the truth.', next: 'manifesto' },
        { label: 'Pick up the keyboard. Just to feel its weight.', next: 'keyboard' },
        { label: 'Walk to the kitchen. Slowly.', next: 'kitchen_break' },
        { label: 'Sit. Breathe. Try to come back.', next: 'breathe' },
      ],
    },
    boardroom: {
      description: 'You walk past Doug, past Brad, past the empty phone booths nobody can ever book. You open the boardroom door without knocking. Marcus is mid-sentence in a stakeholder review. Six faces turn to look at you. You sit down at the head of the table. You make eye contact with each of them.\n\nYou say, slowly, evenly: "I quit. I am going home. I will not be answering any messages. Goodbye."',
      choices: [
        { label: 'Walk out without waiting for a response', meltdownEnding: 'walked_out' },
        { label: 'Add: "And the velocity numbers are made up."', meltdownEnding: 'velocity_truth' },
      ],
    },
    manifesto: {
      description: 'You open Slack. You type the message you have been writing in your head for two years. It is 3,400 words. It names names. It explains why velocity is theatre, why standup is a hostage situation, why the company values are SEO for the careers page. It identifies, by name, the four people who make this place harder than it has to be.\n\nYour cursor hovers over the @channel button.',
      choices: [
        { label: 'Send to #general', meltdownEnding: 'manifesto_sent' },
        { label: 'Save as draft. Close the laptop. Walk out.', meltdownEnding: 'draft_saved' },
        { label: 'Read it again. Get scared. Delete it.', meltdownEnding: 'deleted' },
      ],
    },
    keyboard: {
      description: 'You pick up your keyboard. Just to feel the weight. You realize you are also standing up. You did not decide to stand up. You look at your monitor and see your reflection in the dark space between two ticket windows. You look like someone you used to know.',
      choices: [
        { label: 'Put it down. Slowly.', next: 'breathe' },
        { label: 'Throw it through the screen.', meltdownEnding: 'destruction' },
        { label: 'Throw it at Marcus\'s empty chair.', meltdownEnding: 'symbolic_destruction' },
      ],
    },
    kitchen_break: {
      description: 'You walk to the kitchen. Doug is at the espresso machine, dictating. Without thinking, you take the milk out of the fridge — the labeled milk, the spreadsheet milk, all of it — and you walk it outside. You leave it on the curb in the sun.\n\nYou go back inside. You sit down at your desk. You feel slightly better.',
      choices: [
        { label: 'Send a clean resignation email', meltdownEnding: 'resigned_clean' },
        { label: 'Go back to work like nothing happened', meltdownEnding: 'normalized' },
      ],
    },
    breathe: {
      description: 'You breathe. The screen sharpens. The Slack pings keep coming. You stand up. Your legs work. You walk past Marcus\'s desk. Past reception. Past the wall with the company values printed in 20-cm letters. Out the door. The sun is too bright and the air smells like nothing in particular.',
      choices: [
        { label: 'Get in your car and drive home', meltdownEnding: 'left_quietly' },
        { label: 'Just keep walking', meltdownEnding: 'walked_off' },
      ],
    },
  },
};
