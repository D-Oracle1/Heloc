# HELOC — Home Equity Access

A premium, **mobile-first** fintech Progressive Web App for managing a Home Equity Line
of Credit (HELOC). Built to feel like a polished native mobile app while scaling gracefully
to tablet, laptop, and desktop.

The visual identity uses **Navy Blue** and **Deep Red** brand accents, modern typography,
subtle shadows, rounded cards, and smooth micro-interactions.

## ✨ Features

- **Dashboard / Home** — gradient balance card with hide/show, credit utilization meter,
  quick stats, and recent activity.
- **Claim Funds** — a slide-up bottom sheet with a guided 3-step flow (amount → review →
  success), quick-amount chips, destination selector, inline validation, and a
  numeric-optimized keyboard.
- **Claims** — payout methods (ACH, wire, instant-to-debit) with ETAs and fees.
- **History** — searchable, filterable claim history shown as compact cards on mobile and a
  table on desktop, with a detail bottom sheet.
- **Profile** — account identity, linked accounts, preference toggles, support links, and a
  demo-reset action.

## 📱 Mobile-first & app-like

- Sticky top navigation with clean branding.
- Fixed **bottom navigation** (Home, Claims, History, Profile) on phones/tablets.
- Collapsible animated **left sidebar** on desktop.
- 44px minimum touch targets, safe-area insets, edge-to-edge layouts.
- Slide-up bottom sheets instead of desktop popups.
- Skeleton loading states, page transitions, and lightweight animations.
- No horizontal scrolling; fluid grids and scalable typography.

## ⚡ PWA

- Web app manifest + service worker (via `vite-plugin-pwa` / Workbox).
- Installable on Android & iOS home screens with maskable icons and theme color.
- Offline caching of the app shell and assets.
- In-app install prompt.

## ♿ Accessibility

- Semantic HTML, ARIA labels, `role="switch"`/`role="dialog"` where appropriate.
- Visible focus rings and keyboard navigation (Esc closes sheets).
- Sufficient color contrast and screen-reader-friendly labels.

## 🛠 Tech stack

- **React 18** + **TypeScript** (strict)
- **Vite 5** build tooling with route-based code-splitting
- **Tailwind CSS** with a custom brand theme
- **React Router** for navigation
- **Framer Motion** for transitions and gestures
- **lucide-react** icons
- **vite-plugin-pwa** for the manifest & service worker

State is held in a lightweight React context (`src/data/store.tsx`) with mock account and
claim data, persisted to `localStorage`. There is no backend — claims are simulated.

## 🚀 Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build
npm run preview  # preview the production build
```

> The service worker is disabled in dev (`devOptions.enabled: false`) and active in the
> production build — test PWA/offline behavior via `npm run build && npm run preview`.

## 📁 Project structure

```
src/
├─ components/
│  ├─ layout/      TopNav, BottomNav, Sidebar, AppLayout, navItems
│  ├─ ui/          Button, Card, BottomSheet, Skeleton, StatusBadge,
│  │               PageTransition, InstallPrompt
│  ├─ dashboard/   BalanceCard, StatCard
│  └─ claims/      ClaimFundsSheet, ClaimListItem
├─ pages/          Dashboard, Claims, History, Profile
├─ data/           store.tsx (context + mock data)
├─ utils/          format.ts (currency, dates)
├─ types.ts
├─ App.tsx         routes (lazy-loaded pages)
└─ main.tsx
```

## 🎨 Brand tokens

| Token        | Value     | Use                      |
| ------------ | --------- | ------------------------ |
| `navy-800`   | `#0a1f44` | Primary brand / surfaces |
| `crimson-500`| `#c41f14` | Accent / calls-to-action |

Defined in `tailwind.config.js` along with the `brand-gradient`, shadows, and animations.
