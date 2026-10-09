# Sprint to Nowhere

A satirical sprint-management roguelike. You are a software engineer. Your PM has "just a tiny tweak." Production is on fire. The CEO liked a tweet about Web3.

Survive ten sprints without drowning in tech debt — or burning out trying.

**[Play online](https://naelolaiz.github.io/sprint_to_nowhere/)**

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Languages

The game is in English and Spanish. It follows the browser's language, and the switcher in the footer changes it (the choice is remembered).

English is the source: text in the code is written in English and doubles as its own translation key. In code, wrap shown text in `tr` (`` tr`Worked ${h}h on "${title}"` `` or `tr(event.title)`); constants built at import time are marked with `` msg`...` `` and translated with `tr()` where they are shown. Translations live in `src/i18n/<locale>/*.json`, one English → translation map per area.

```bash
npm run i18n:check            # missing, stale or broken Spanish entries
node scripts/i18n.mjs missing es   # the missing ones as JSON, ready to fill
```

To add a language, add it to `LOCALES` and `LOADERS` in `src/i18n/index.js` and give it a folder like `src/i18n/es/`.

## Tech stack

- [React 19](https://react.dev/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [lucide-react](https://lucide.dev/)

## License

GPL-3.0-only — see [LICENSE](LICENSE).
