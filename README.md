# Karkard Tools

A minimal Next.js (App Router) single-page toolset for employees to quickly compute daily work hours, overtime, early-leave, late arrivals, and hourly leave suggestions for the Chargoon attendance system. Built with Tailwind CSS v4, React 19, and plain JavaScript/JSX — no TypeScript, no backend.

## Features

Five tools, all client-side and offline-friendly:

- **Today** — Log your entry time once and get a live countdown to the required exit time, with real-time progress tracking and overtime/leave suggestions.
- **Daily Calculator** — Enter entry and exit times to see presence, required exit, overtime, early-leave, late, and hourly leave suggestions. Copy a formatted summary for Chargoon.
- **When Can I Leave?** — Enter your arrival time to get the earliest valid exit without a deficit. Reverse mode: enter your exit time to find the latest entry without a deficit.
- **Monthly Table** — A full Jalali month grid with per-day entry/exit inputs, status tracking (work / holiday / leave / mission), weekend toggles, and automatic monthly totals with a copy-ready summary. Data persists in the browser via `localStorage`.
- **Time Calculator** — Add/subtract HH:mm durations, convert between minutes and HH:mm, and convert between decimal hours and HH:mm.

## Tech Stack

| Layer       | Technology                        |
| ----------- | --------------------------------- |
| Framework   | Next.js 16 (App Router)           |
| UI Library  | React 19                          |
| Styling     | Tailwind CSS v4                   |
| Icons       | lucide-react                       |
| Theming     | next-themes (dark / light / system) |
| Fonts       | Vazirmatn (Persian, variable)     |
| Testing     | Vitest                            |
| Linting     | ESLint (eslint-config-next)       |

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Scripts

| Command          | Description                              |
| ---------------- | ---------------------------------------- |
| `npm run dev`    | Start the development server             |
| `npm run build`  | Create an optimized production build     |
| `npm run start`  | Serve the production build               |
| `npm run lint`   | Run ESLint across the project            |
| `npm test`       | Run the Vitest test suite                |

## Project Structure

```
src/
  app/
    layout.jsx          Root layout, header, theme provider
    page.jsx            Home page (renders ToolTabs)
    guide/page.jsx      Rules & policy guide page
    globals.css         Theme tokens, design system, animations
  components/
    tool-tabs.jsx       Tab navigation across all tools
    time-input.jsx      HH:mm masked input with "now" button
    copy-button.jsx     Copy-to-clipboard with feedback
    day-result.jsx      Daily calculation result display
    stat.jsx            Stat card display
    theme-provider.jsx  next-themes wrapper
    theme-toggle.jsx    Dark/light/system toggle
    ui/                 Primitive components (button, card, badge, tabs, select, switch)
    tools/              The five tool components
  hooks/
    use-local-storage.js  SSR-safe localStorage hook
    use-mounted.js        Mounted state hook (hydration safety)
    use-now.js            Live clock hook (per-second updates)
  lib/
    calc.js           Core work-hour calculation logic
    time.js           Time parsing, formatting, masking, conversion
    clock-math.js     Decimal/minutes conversion and summation
    jalali.js         Jalali (Persian) calendar conversion
    work-rules.js     Company work-rule configuration
    summary.js        Monthly summary text builder
    storage.js        localStorage read/write/remove helpers
    utils.js          cn() class name utility
    __tests__/        Vitest unit tests
```

## Key Concepts

### Work Rules

All company-specific rules live in `src/lib/work-rules.js` as a single config object (times are minutes from midnight):

- **requiredMinutes** — Daily required presence (8h 45m by default)
- **officialStart** — Official work start (07:30)
- **officialEnd** — Official work end (16:15)
- **flexMinutes** — Grace/flex period (1h 15m)
- **latestEntry** — Latest entry without being late (08:45)
- **clampEarlyEntry** — Whether arrivals before officialStart are clamped for required-exit calculation

### Calculation Logic

`src/lib/calc.js` exports `calculateDay(entry, exit)` which returns a result object with: `presence`, `requiredExit`, `overtime`, `earlyLeave`, `late`, `leaveSuggestion`, and a `status` enum (`empty`, `incomplete`, `complete`, `overtime`, `early`, `leave`, `invalid`). All functions are pure and tested.

### Jalali Calendar

`src/lib/jalali.js` implements Persian (Jalali) calendar conversion without external dependencies. It provides `toJalali`, `todayJalali`, `jalaliMonthLength`, `jalaliWeekday`, month and weekday names.

### Data Persistence

The monthly table stores data in the browser's `localStorage` — no data is sent to any server. The `useLocalStorage` hook syncs across tabs via custom events.

## Font Setup

Download the Vazirmatn variable font and place it at:

```
public/fonts/Vazirmatn-Variable.woff2
```

## Testing

```bash
npm test
```

Tests cover the calculation engine, time utilities, Jalali calendar conversion, and clock math — 28 assertions across all modules.

## License

Private internal tool.
