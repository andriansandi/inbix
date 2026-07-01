# Inbix Design System

> Source of truth for all visual and interaction design decisions across Inbix.

## 1. Brand Identity

Inbix is an **Open Source Cloudflare-native Email API Platform**.

The dashboard is one client. The REST API is the primary product. Every
surface should feel like infrastructure software, not an email client.

### Core Attributes

- Cloudflare-native
- API-first
- Developer-first
- Modern
- Minimal
- Reliable
- Open Source

### Visual References

| Reference | What we borrow |
|-----------|---------------|
| Linear | Typographic hierarchy, keyboard-first feel, dense-yet-clean surfaces |
| Vercel | Geometric clarity, monospace accents, high-contrast dark surfaces |
| Clerk | Auth flow polish, card composition, restrained color |
| Neon | Developer dashboard layout, sidebar navigation, data density |
| Supabase | Open-source polish, table views, green accent discipline |
| Better Stack | Status indicators, monitoring aesthetics |
| Cloudflare Dashboard | Infrastructure panels, resource cards, orange brand affinity |
| Notion | Empty-state composition, block-level spacing |

### Anti-References (do NOT imitate)

- Gmail
- Outlook
- Yahoo
- Mailchimp

### Banned Visual Patterns

- Envelope icons
- Paper planes
- Gradients in the primary logo
- Skeuomorphic email visuals
- AI-purple / violet glow aesthetics
- Fake product screenshots built from styled divs
- Generic three-equal-card feature rows without visual variation

---

## 2. Logo Specification

### Mark

A rounded square in the brand orange (`#F97316`) containing a white
abstract geometric symbol: a hexagonal node outline with a center dot.

The hexagon represents a network node. The center dot represents a
message passing through that node. Together they communicate "email
infrastructure" without resorting to envelope or paper-plane imagery.

### Construction

```
+------------------+
|                  |
|    /\      /\    |
|   /  \    /  \   |     Orange square: #F97316
|  |    (.)    |   |     Hexagon stroke: white, 2px
|   \  /    \  /   |     Center dot: white, r=2.5
|    \/      \/    |
|                  |
+------------------+
     32 x 32
     rx = 7
```

### Variants

| Variant | Background | Symbol | Use |
|---------|-----------|--------|-----|
| Default | `#F97316` | White | Favicon, nav, footer, auth |
| Monochrome light | Transparent | `#F97316` | Light backgrounds where orange square is too heavy |
| Monochrome dark | Transparent | `#FFFFFF` | Dark backgrounds where orange square is too heavy |

### Clear Space

Minimum clear space equals the height of the hexagon symbol on all sides.

### Minimum Size

- Favicon: 16x16 px
- Nav bar: 28x28 px
- Never render the mark below 16x16

---

## 3. Color System

### Strategy

CSS custom properties (HSL triplets) consumed by Tailwind utility classes.
Dark mode is the default. Light mode is a first-class alternative, not an
afterthought. One accent color (orange) is locked across every surface.

### Dark Mode (default)

| Token | HSL | Hex | Purpose |
|-------|-----|-----|---------|
| `--background` | `0 0% 4%` | `#0a0a0a` | Page canvas |
| `--foreground` | `0 0% 95%` | `#f2f2f2` | Primary text |
| `--card` | `0 0% 6%` | `#101010` | Elevated surfaces |
| `--card-foreground` | `0 0% 95%` | `#f2f2f2` | Text on card |
| `--popover` | `0 0% 6%` | `#101010` | Dropdowns, menus |
| `--popover-foreground` | `0 0% 95%` | `#f2f2f2` | Text on popover |
| `--primary` | `24 95% 53%` | `#f97316` | Brand accent, CTAs |
| `--primary-foreground` | `0 0% 100%` | `#ffffff` | Text on primary |
| `--secondary` | `0 0% 10%` | `#1a1a1a` | Secondary surfaces |
| `--secondary-foreground` | `0 0% 95%` | `#f2f2f2` | Text on secondary |
| `--muted` | `0 0% 10%` | `#1a1a1a` | Muted backgrounds |
| `--muted-foreground` | `0 0% 58%` | `#949494` | Secondary text, labels |
| `--accent` | `0 0% 12%` | `#1f1f1f` | Hover, active states |
| `--accent-foreground` | `0 0% 95%` | `#f2f2f2` | Text on accent |
| `--destructive` | `0 72% 51%` | `#dc2626` | Destructive actions |
| `--destructive-foreground` | `0 0% 100%` | `#ffffff` | Text on destructive |
| `--success` | `142 71% 45%` | `#22c55e` | Success states |
| `--success-foreground` | `0 0% 100%` | `#ffffff` | Text on success |
| `--border` | `0 0% 14%` | `#242424` | Borders, dividers |
| `--input` | `0 0% 14%` | `#242424` | Input borders |
| `--ring` | `24 95% 53%` | `#f97316` | Focus rings |

### Light Mode

| Token | HSL | Hex | Purpose |
|-------|-----|-----|---------|
| `--background` | `0 0% 100%` | `#ffffff` | Page canvas |
| `--foreground` | `0 0% 4%` | `#0a0a0a` | Primary text |
| `--card` | `0 0% 100%` | `#ffffff` | Elevated surfaces |
| `--card-foreground` | `0 0% 4%` | `#0a0a0a` | Text on card |
| `--popover` | `0 0% 100%` | `#ffffff` | Dropdowns, menus |
| `--popover-foreground` | `0 0% 4%` | `#0a0a0a` | Text on popover |
| `--primary` | `24 95% 53%` | `#f97316` | Brand accent, CTAs |
| `--primary-foreground` | `0 0% 100%` | `#ffffff` | Text on primary |
| `--secondary` | `0 0% 96%` | `#f5f5f5` | Secondary surfaces |
| `--secondary-foreground` | `0 0% 4%` | `#0a0a0a` | Text on secondary |
| `--muted` | `0 0% 96%` | `#f5f5f5` | Muted backgrounds |
| `--muted-foreground` | `0 0% 40%` | `#666666` | Secondary text, labels |
| `--accent` | `0 0% 94%` | `#f0f0f0` | Hover, active states |
| `--accent-foreground` | `0 0% 4%` | `#0a0a0a` | Text on accent |
| `--destructive` | `0 72% 51%` | `#dc2626` | Destructive actions |
| `--destructive-foreground` | `0 0% 100%` | `#ffffff` | Text on destructive |
| `--success` | `142 71% 45%` | `#22c55e` | Success states |
| `--success-foreground` | `0 0% 100%` | `#ffffff` | Text on success |
| `--border` | `0 0% 90%` | `#e6e6e6` | Borders, dividers |
| `--input` | `0 0% 90%` | `#e6e6e6` | Input borders |
| `--ring` | `24 95% 53%` | `#f97316` | Focus rings |

### Rules

- One accent color per page. Orange is the only accent.
- No pure `#000000` in dark mode. Use `#0a0a0a`.
- No pure `#ffffff` as a background in dark mode. Use `#0a0a0a` / `#101010`.
- Semantic colors (destructive, success) are used sparingly and only for
  actual semantic states.
- Color is a scarce resource. Neutrals carry the design. Orange highlights
  what matters.

---

## 4. Typography

### Font Stack

| Role | Font | Weights | Usage |
|------|------|---------|-------|
| Sans | Inter | 400, 500, 600, 700 | All UI text, body, headings |
| Mono | JetBrains Mono | 400, 500 | Code, API endpoints, keyboard shortcuts, metadata |

### Scale

| Token | Size (rem) | Line height | Weight | Tracking | Use |
|-------|-----------|-------------|--------|----------|-----|
| Display | 3.5 | 1.05 | 700 | -0.02em | Hero headline |
| H1 | 2.5 | 1.1 | 700 | -0.02em | Page titles |
| H2 | 1.875 | 1.15 | 600 | -0.01em | Section titles |
| H3 | 1.25 | 1.25 | 600 | -0.01em | Card titles, subsections |
| Body | 1 | 1.6 | 400 | 0 | Paragraphs, descriptions |
| Body sm | 0.875 | 1.5 | 400 | 0 | Secondary descriptions |
| Label | 0.8125 | 1.4 | 500 | 0 | UI labels, nav items |
| Caption | 0.75 | 1.4 | 400 | 0 | Timestamps, metadata |
| Mono sm | 0.8125 | 1.5 | 400 | 0 | Inline code, API paths |

### Rules

- Body text max width: `65ch` for readability.
- Headlines use tight tracking (`tracking-tight`) and tight leading.
- No serif fonts anywhere. This is a developer infrastructure product.
- Monospace is used for: code blocks, API endpoints, keyboard shortcuts,
  message IDs, email addresses in technical contexts.
- Font weights are limited to 400, 500, 600, 700. No thin or extrabold.

---

## 5. Spacing and Layout

### Spacing Scale

The base unit is `0.25rem` (4px). Tailwind's default spacing scale is used.

| Context | Padding |
|---------|---------|
| Page horizontal | `px-6` (24px) mobile, `px-8` (32px) desktop |
| Section vertical | `py-24` (96px) to `py-32` (128px) on landing pages |
| Section vertical (app) | `py-6` to `py-8` in dashboard |
| Card padding | `p-6` (24px) standard, `p-8` (32px) spacious |
| Component gap | `gap-4` (16px) default, `gap-6` (24px) loose |

### Container

- Landing page max width: `max-w-6xl` (72rem / 1152px)
- Dashboard full width with sidebar
- Content max width: `max-w-4xl` for prose, `max-w-2xl` for forms

### Breakpoints

Standard Tailwind breakpoints:

| Name | Width |
|------|-------|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |
| 2xl | 1536px |

### Rules

- Use `min-h-[100dvh]` for full-height sections, never `h-screen`.
- Use CSS Grid for multi-column layouts, not flexbox percentage math.
- Every multi-column layout declares its mobile collapse explicitly.
- Macro-whitespace is generous. Sections breathe at `py-24` minimum on
  marketing pages.

---

## 6. Component Patterns

### Cards

Cards use `1px solid var(--border)` with `rounded-xl` (12px) radius.
Shadows are avoided in dark mode. In light mode, use only ultra-diffuse
shadows tinted to the background hue.

```
rounded-xl border border-border bg-card
```

Card hierarchy is communicated through:
1. Background elevation (`bg-card` vs `bg-background`)
2. Border presence
3. Negative space, not shadows

### Buttons

| Variant | Style | Use |
|---------|-------|-----|
| Primary | `bg-primary text-primary-foreground` | Main CTAs |
| Secondary | `bg-secondary text-secondary-foreground` | Supporting actions |
| Outline | `border border-border bg-transparent` | Tertiary actions |
| Ghost | `hover:bg-accent` | Icon buttons, subtle actions |
| Destructive | `bg-destructive text-destructive-foreground` | Delete, remove |

All buttons include:
- `transition-colors duration-150`
- `active:scale-[0.98]` for tactile feedback
- Focus ring: `focus-visible:ring-2 focus-visible:ring-ring`

### Navigation

- Fixed/sticky top navigation, `h-16` (64px) max height
- Navigation renders on a single line at desktop
- Mobile: hamburger or condensed menu
- Background: `bg-background/80 backdrop-blur-xl` with bottom border

### Empty States

Every empty state includes:
1. A clean geometric icon (not an envelope)
2. A short, clear headline
3. A one-line description
4. A primary action button

### Loading States

- Skeleton loaders matching the final layout shape
- No generic circular spinners in content areas
- Spinners are acceptable in icon-button contexts (refresh, submit)

### Forms

- Label above input
- Helper text below input (optional)
- Error text below input
- Inputs: `h-10 rounded-md border border-input bg-background`
- Focus: `ring-2 ring-ring`

---

## 7. Iconography

### Library

The project uses **lucide-react** (already a dependency). Stroke width is
standardized at `1.5` for all icons.

### Banned Icons

- `Mail` (envelope) as a primary brand symbol
- `Send` (paper plane) as a primary brand symbol
- Any skeuomorphic email imagery

### Preferred Icons for Email/Inbox Context

| Concept | Icon | Why |
|---------|------|-----|
| Inbox | `Inbox` | Container without envelope baggage |
| Message | `MessageSquare` | Chat-style, modern |
| Routing | `Route` or `Waypoints` | Infrastructure feel |
| Real-time | `Radio` or `Activity` | Signal, not email |
| Address | `AtSign` | Email address abstraction |
| Status | `CircleDot` | Node/status indicator |

### Rules

- Icons are `h-4 w-4` in compact contexts, `h-5 w-5` in standard contexts
- Icon color follows text color by default
- Accent-colored icons use `text-primary` sparingly

---

## 8. Motion

### Principles

Motion communicates hierarchy and state. It never decorates.

- Entry: `translate-y-4 opacity-0` to `translate-y-0 opacity-1` over 400ms
  with `cubic-bezier(0.16, 1, 0.3, 1)`
- Hover: `transition-colors duration-150`
- Active: `scale-[0.98]`
- Loading: Subtle opacity pulse, never jarring

### Reduced Motion

All non-essential motion is gated behind `@media (prefers-reduced-motion: no-preference)`.
Under `prefers-reduced-motion: reduce`, all animations collapse to instant.

### Rules

- Only animate `transform` and `opacity`. Never `width`, `height`, `top`, `left`.
- `backdrop-blur` only on fixed/sticky elements (nav, overlays), never on
  scrolling content.
- No infinite-loop animations except for loading indicators.
- `will-change: transform` used sparingly, only on actively animating elements.

---

## 9. Dark Mode Protocol

### Default

Dark mode is the default. The `<html>` element ships with `class="dark"`.

### Theme Toggle

A theme toggle is available in the navigation. Preference is stored in
`localStorage` under the key `inbix:theme`. On load, the stored preference
takes precedence, falling back to `prefers-color-scheme`.

### Token Strategy

CSS custom properties swap values under `.dark` class. Tailwind's `dark:`
variant is available but semantic tokens (`bg-background`, `text-foreground`)
are preferred so that theme switching requires no class changes in
component code.

### Rules

- Design for dark mode first. Light mode is the adaptation.
- Visual hierarchy must hold in both modes.
- WCAG AA contrast minimum for body text, AAA target for headings.
- No pure black (`#000000`) and no pure white (`#ffffff`) as backgrounds.
- Test every component in both modes before shipping.

---

## 10. Accessibility

- All interactive elements are keyboard navigable with visible focus states.
- Focus ring: `ring-2 ring-ring ring-offset-2 ring-offset-background`.
- Color is never the sole indicator of state. Pair with text or icon.
- `aria-label` on all icon-only buttons.
- `alt` text on all meaningful images.
- Form inputs have associated `<label>` elements.
- Semantic HTML: `<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>`.
- Skip-to-content link on all pages.

---

## 11. Responsive Behavior

### Mobile-First

All layouts are designed mobile-first and enhanced at breakpoints.

### Dashboard Layout

- Mobile: Single column, swipe between inbox list, message list, viewer
- Tablet (`md`): Two columns, inbox list + message list or message list + viewer
- Desktop (`lg`): Three columns, full workspace

### Landing Page

- Mobile: Single column, stacked sections
- Desktop: Multi-column grids, side-by-side content

### Rules

- Navigation collapses to hamburger below `lg`
- Touch targets minimum 44x44 px on mobile
- No horizontal scroll at any breakpoint
- Test on 375px (iPhone SE) minimum

---

## 12. Repository Structure

```
inbix/
+-- apps/
|   +-- web/                # Cloudflare Worker (API + Email + static assets)
|   +-- dashboard/          # React SPA (Vite + TailwindCSS + shadcn/ui)
+-- packages/
|   +-- database/           # Drizzle ORM schemas + queries + migrations
|   +-- parser/             # Email parsing + HTML sanitization
|   +-- sdk/                # TypeScript SDK (@inbix/sdk)
|   +-- shared/             # Shared types, constants, Zod schemas, utils
|   +-- ui/                 # Shared shadcn/ui components
|   +-- mcp-server/         # MCP Server (@inbix/mcp-server) [ready]
|   +-- sdk-js/             # JavaScript SDK [planned]
|   +-- sdk-python/         # Python SDK [planned]
|   +-- sdk-go/             # Go SDK [planned]
|   +-- sdk-php/            # PHP SDK [planned]
+-- docs/                   # Documentation
+-- DESIGN.md               # This file
+-- ROADMAP.md              # Product roadmap
```

---

## 13. Component Inventory

### @inbix/ui (shared)

| Component | Status | Notes |
|-----------|--------|-------|
| Button | Production | cva variants: default, destructive, outline, secondary, ghost, link |
| Card | Production | Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| Badge | Production | cva variants: default, secondary, destructive, outline, success |
| Input | Production | Standard text input with focus ring |
| Separator | Production | Horizontal/vertical divider |
| Logo | Production | Inline SVG, size prop, variant prop |
| Container | Production | Max-width wrapper with horizontal padding |

### Dashboard components

| Component | Status | Notes |
|-----------|--------|-------|
| Navbar | Production | Shared top navigation, theme toggle, CTA |
| Footer | Production | Shared footer, links, branding |
| ThemeToggle | Production | Dark/light switch, localStorage persistence |
| CopyButton | Production | Copy-to-clipboard with feedback |
| ExpiryTimer | Production | Countdown badge with urgency states |
| MessageList | Production | Scrollable message list with empty state |
| MessageViewer | Production | HTML/text toggle, attachments, sender info |
| EmptyState | Production | Reusable empty state with icon, title, description, action |

---

## 14. Design Decisions

### Why dark mode first?

Inbix targets developers and QA engineers who work in terminals and IDEs.
Dark mode is the expected default for infrastructure tooling. Linear, Vercel,
and the Cloudflare Dashboard all default to dark.

### Why orange?

The brand orange (`#F97316`) was established in the initial release. It has
affinity with Cloudflare's own orange branding, reinforcing the
Cloudflare-native identity. It is warm, energetic, and distinctive without
being aggressive.

### Why Inter and JetBrains Mono?

Inter is the de facto standard for developer-facing SaaS interfaces. It has
excellent legibility at small sizes, strong tabular number support, and
renders consistently across platforms. JetBrains Mono pairs naturally for
code and API contexts. Both are open source and freely self-hostable.

### Why CSS variables instead of Tailwind dark: variants?

Semantic tokens (`bg-background`, `text-foreground`) let component code stay
theme-agnostic. Switching themes requires only toggling the `.dark` class on
`<html>`. This is the shadcn/ui convention and it scales.

### Why no shadows in dark mode?

On dark surfaces, drop shadows are invisible or muddy. Elevation is
communicated through subtle background shifts (`#0a0a0a` to `#101010`) and
border presence. This is the Linear/Vercel approach.
