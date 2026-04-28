// SPDX-License-Identifier: GPL-3.0-only

export const FEATURES = [
  { title: "Add another button to the dashboard", effort: 6, debt: 4 },
  { title: "Implement SSO (5th attempt)", effort: 14, debt: 9 },
  { title: "Reactions on comments", effort: 10, debt: 6 },
  { title: "Yet another chart on the analytics page", effort: 8, debt: 5 },
  { title: "Make the export work for Excel too", effort: 10, debt: 7 },
  { title: "Real-time collab (just a small thing)", effort: 16, debt: 11 },
  { title: "Onboarding tour v3", effort: 8, debt: 5 },
  { title: "AI-powered something", effort: 12, debt: 10 },
  { title: "Custom branding for one specific client", effort: 10, debt: 9 },
  { title: "Dark mode (this time for real)", effort: 8, debt: 4 },
  { title: "Notifications, but better", effort: 10, debt: 6 },
  { title: "Add a chatbot", effort: 14, debt: 11 },
  { title: "Quick-action FAB on mobile", effort: 6, debt: 4 },
  { title: "User profile redesign (cosmetic)", effort: 8, debt: 5 },
];

export const BUGS = [
  { title: "Login broken on Safari (intermittent)", effort: 6, debt: 2 },
  { title: "Date picker forgets the timezone", effort: 4, debt: 1 },
  { title: "Memory leak in the worker", effort: 10, debt: 3 },
  { title: "Search broken on Tuesdays", effort: 8, debt: 2 },
  { title: "Dropdown z-index thing again", effort: 4, debt: 1 },
  { title: "PDF export missing the footer", effort: 6, debt: 2 },
  { title: "Notifications fire twice", effort: 6, debt: 3 },
  { title: "API timeout on big customer", effort: 8, debt: 4 },
  { title: "Modal won't close after success", effort: 4, debt: 2 },
];

export const REFACTORS = [
  { title: "Untangle the auth module", effort: 16, debt: -14 },
  { title: "Migrate off the legacy ORM", effort: 20, debt: -18 },
  { title: "Add tests to the payment flow", effort: 12, debt: -10 },
  { title: "Document the deployment process", effort: 8, debt: -7 },
  { title: "Consolidate the four CSS systems", effort: 14, debt: -12 },
  { title: "Split the 8000-line file into modules", effort: 16, debt: -14 },
  { title: "Replace cron jobs with a real queue", effort: 14, debt: -11 },
  { title: "Upgrade the framework (4 majors behind)", effort: 18, debt: -15 },
  { title: "Remove the dead code paths", effort: 10, debt: -8 },
];

export const LEGACY_TICKETS = [
  { title: "Inherit the [Synergy Platform] from sunset team", effort: 18, debt: 14 },
  { title: "Take ownership of Java 7 admin (acquired 2014)", effort: 16, debt: 13 },
  { title: "Migrate the AngularJS 1.x dashboard", effort: 20, debt: 16 },
  { title: "Maintain the SOAP API the legal team still uses", effort: 12, debt: 10 },
  { title: "Adopt the CMS Marketing built without engineering", effort: 14, debt: 12 },
  { title: "On-board the data pipeline written by interns", effort: 16, debt: 13 },
  { title: "Pick up the abandoned mobile rewrite", effort: 18, debt: 15 },
  { title: "Own the .NET service nobody at HQ wants", effort: 14, debt: 12 },
];

export const STRATEGIC_INITIATIVES = [
  { title: "[STRATEGIC] AI-first reimagining of core flows", effort: 18, debt: 14 },
  { title: "[STRATEGIC] Blockchain pilot for supply chain", effort: 20, debt: 16 },
  { title: "[STRATEGIC] Metaverse-ready user experience", effort: 16, debt: 13 },
  { title: "[STRATEGIC] Web3 community engagement layer", effort: 20, debt: 16 },
  { title: "[STRATEGIC] LLM-powered insights dashboard", effort: 18, debt: 15 },
  { title: "[STRATEGIC] Voice-first interface (CEO's idea)", effort: 16, debt: 13 },
  { title: "[STRATEGIC] No-code platform for non-technical users", effort: 20, debt: 17 },
];

export const PROMISES = [
  { key: 'rust',     label: 'Learn a modern language (Rust/Go)',         echo: 'learn Rust' },
  { key: 'arch',     label: 'Lead architecture decisions',                echo: 'lead architecture' },
  { key: 'impact',   label: 'Work on something with real product impact', echo: 'do real-impact work' },
  { key: 'ai',       label: 'Explore ML/AI',                              echo: 'explore AI' },
  { key: 'platform', label: 'Go deep on platform / build greenfield',     echo: 'build greenfield' },
];

export const URGENT_FEATURES = [
  { title: "[CEO] Make our app more 'magical'", effort: 12, debt: 12 },
  { title: "[CEO] Add the thing the competitor has", effort: 10, debt: 10 },
  { title: "[CEO] AI integration (vague)", effort: 14, debt: 14 },
  { title: "[CEO] Make it 'pop' more", effort: 8, debt: 8 },
];
