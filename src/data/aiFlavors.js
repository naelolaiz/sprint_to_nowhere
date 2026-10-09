// SPDX-License-Identifier: GPL-3.0-only

// Once the mandate has fired, the AI story also reaches the screens that are
// not events: the retro, the two endings and the one victory. The retro line
// is picked by sprint number so a re-render never changes it under the player.

export const AI_RETRO_LINES = [
  'Retro action item from leadership: "use the assistant more." Retro action item from Legal: "use the assistant less." Both are assigned to you. Both are due next sprint.',
  'Marcus had the assistant write the retro. It reached the limit after "What went well:". The section is blank. Marcus: "accurate."',
  'The adoption dashboard says the team was 10x this sprint. The board says the same tickets as last sprint. Both are in the deck. Neither is questioned.',
  'The sprint\'s "AI acceleration" is on a slide as the daily token budget, shared by the team, which the slide calls "effectively unlimited." It ran out before standup most days.',
  'Leadership asked for one AI win from the retro. The win is that the assistant was out of tokens during the production fire, so nobody could ask it to help.',
];

export const aiRetroLine = (s) => AI_RETRO_LINES[(Math.max(1, s?.sprint || 1) - 1) % AI_RETRO_LINES.length];

export const AI_GAME_OVER = {
  burnout: 'You stopped responding to Slack on a Tuesday afternoon. The assistant answered for you, until it reached the organization\'s limit at 2:10 PM. Your manager called twice and you let it ring. You asked the assistant to draft the resignation. "Limit reached." You wrote it yourself. It was the only thing all quarter that was not AI-accelerated, and the only thing that shipped.',
  debt: 'Tech debt reached 100. The senior engineers have circulated a Google Doc titled "A Modest Proposal: Rewrite." The CTO has replied that the assistant will do the rewrite. The assistant\'s estimate is "it depends." A consultant has been hired to manage the assistant. You are updating your résumé by hand, because the budget is out.',
};

export const AI_VICTORY_LINE = 'The adoption dashboard shows the assistant was used on 100% of tickets. It was out of tokens for most of them. Leadership has credited the result to AI. A press release is drafted. It was generated.';
