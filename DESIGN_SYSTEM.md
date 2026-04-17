# Source AI — Platform Page Design System

Source: `/platform` (localhost:3000/platform, live at `source-ai-pitch.vercel.app/platform`).
Single source of truth for mocking up new Source surfaces. Every token and component below is already installed in this repo and is in use on that page.

---

## 1. Fonts

All three load via `next/font` in `src/app/layout.tsx` and are exposed as CSS variables (declared in `src/app/globals.css` under `@theme`).

| Purpose | Family | Variable | Weights / Styles | How to apply |
|---|---|---|---|---|
| **UI sans** | Inter (Google) | `--font-inter` → `var(--font-sans)` | 300, 400, 500, 600, 700 | Default on `<body>` |
| **Hero / h1–h2 display** | Instrument Serif (Google) | `--font-serif` | 400 regular + 400 italic | `.serif` utility class on the page, or `font-serif` via Tailwind |
| **Brand / logo wordmark** | Coolvetica RG (local, `./fonts/coolvetica-rg.woff`) | `--font-display` | 400 only | Use for the word "Source" in nav / logo lockups |
| **Monospace (resolves to Inter)** | Inter | `--font-mono` | Inherits Inter | Use `font-mono` for uppercase labels + code tokens — the tracking does the visual work, not a separate typeface |

`.serif` utility (defined in the scoped `.platform-page` style block):

```css
.serif {
  font-family: var(--font-serif);
  letter-spacing: -0.02em;
  font-weight: 400;
}
```

---

## 2. CSS tokens (scoped to `.platform-page`)

The page overrides shadcn's default OKLCH border/input/ring inside `.platform-page` so every primitive renders with the soft look. When mocking a new page that should match, wrap it in `<div className="platform-page">` or copy this block.

```css
.platform-page {
  background: #fafaf9;            /* page surface */
  color: #0f0e0d;                 /* text primary */
  font-family: var(--font-sans);
  min-height: 100vh;

  /* shadcn token overrides — softer than default */
  --border: rgba(15, 14, 13, 0.08);
  --input: rgba(15, 14, 13, 0.08);
  --ring: rgba(15, 14, 13, 0.20);
  --card: #ffffff;
  --popover: #ffffff;
  --radius: 0.75rem;                /* 12px base; rounded-xl resolves here */
}

/* Card shadow override — subtle, not shadcn's default shadow-sm */
.platform-page [data-slot="card"] {
  box-shadow: 0 1px 2px rgba(15, 14, 13, 0.04);
  border-color: rgba(15, 14, 13, 0.07);
}

/* ChainOfThought connector line */
.platform-page [data-slot="card"] .bg-border {
  background-color: rgba(15, 14, 13, 0.08);
}

/* Tabs */
.platform-page [data-slot="tabs-list"] {
  background: rgba(15, 14, 13, 0.04);
  border-color: rgba(15, 14, 13, 0.06);
}
```

---

## 3. Color palette

Only **black + white + opacity** for structure. Semantic colors appear **only** for state (connected, done, awaiting, error).

### Surfaces
| Name | Value | Use |
|---|---|---|
| page | `#fafaf9` | full-page background (warm beige/stone) |
| card | `#ffffff` | elevated cards (`bg-white`) |
| recessed | `#fafaf8` or `bg-muted/40` | inline input rows inside cards |
| muted band | `bg-muted/20` — `rgba(0,0,0,0.02)` | accordion open state, inactive tab strip |

### Strokes
| Name | Value | Tailwind |
|---|---|---|
| subtle | `rgba(15, 14, 13, 0.06)` | header/footer dividers inside cards |
| default | `rgba(15, 14, 13, 0.08)` | standard card + input border |
| emphasis | `rgba(15, 14, 13, 0.15)` | hover, selected row |
| focus | `#0f0e0d` | keyboard focus ring |

### Text opacity scale (on `#fafaf9`)
| Level | Class | Opacity |
|---|---|---|
| primary | `text-foreground` / `text-[#0f0e0d]` | 100% |
| secondary | `text-[#0f0e0d]/60` | 60% |
| muted | `text-[#0f0e0d]/40` — `/45` | 40–45% |
| ghost | `text-[#0f0e0d]/25` — `/30` | 25–30% (decorative only) |

### Semantic colors (sparingly)
| State | Light token | Deep token | Usage |
|---|---|---|---|
| success / done / connected | `#10B981` dot | `#16a34a` text, `#0f6a3f` on `#e4f7ee` bg | badges, pulsing dots |
| amber / awaiting / change | `#f59e0b` dot | `#d97706` text, `#8a5a12` on `#fdf5e6` bg | "in focus" cream row, waiting state |
| blue / ready | `#3b82f6` dot | `#1849a9` on `#e6eeff` bg | "ready for review" |
| destructive | shadcn `--destructive` | — | reject, delete — minimal use |

---

## 4. Typography scale (as used on the page)

| Role | Size | Weight | Tracking | Leading | Selector used |
|---|---|---|---|---|---|
| Hero h1 (Source logo + title) | `64px / 88px` responsive | 400 | `-0.02em` | `0.95` | `.serif text-[64px] md:text-[88px]` |
| Section h2 | `48px / 64–72px` | 400 | `-0.03em` | `1.02` | `.serif text-[48px] md:text-[64px]` |
| Section eyebrow | 11px | 400 | `0.22em` UPPERCASE | — | `text-[11px] uppercase tracking-[0.22em] text-[#0f0e0d]/45` |
| Intro paragraph | 17px | 400 | `-0.01em` (inherited) | `leading-relaxed` | `text-[17px] text-[#0f0e0d]/60 max-w-[620px]` |
| Card title | 15px | 500 (`font-medium` on `CardTitle`) | `-0.01em` | tight | shadcn `CardTitle` + `text-[15px]` |
| Card description | 12px | 400 | — | — | shadcn `CardDescription` |
| Body copy in cards | 12.5–14px | 400 | — | `leading-relaxed` / `1.55` | `text-[13px] text-foreground/75` |
| Row title (task list) | 14px | 400 | — | 1 | `text-[14px] text-[#0f0e0d]` |
| Row meta | 10.5px | 500 (on project name), 400 (agent label) | `0.10em` UPPERCASE | — | `text-[10.5px] uppercase tracking-[0.10em] text-[#0f0e0d]/50` |
| Mono label / badge | 10–11px | 500 (`font-mono`) | `0.10em` UPPERCASE | — | `text-[10px] font-mono uppercase tracking-[0.10em] text-muted-foreground` |
| Mono table header | 9–10px | 400 | `0.14em` UPPERCASE | — | `text-[9px] uppercase tracking-[0.14em]` |
| Reasoning text | 12–13px | 400 italic | — | `leading-relaxed` | `italic text-[13px] text-foreground/70` |
| Hero card base | 12–13px | — | — | — | `heroCardClass` text size |
| Hero card stat label | 10px | 400 | `0.12em` UPPERCASE | — | `text-[10px] uppercase tracking-[0.12em] text-[#0f0e0d]/40` |

**Tracking rule:** bigger text → more negative tracking (-0.02em / -0.03em). Small uppercase labels → positive tracking +0.10em–0.22em.

---

## 5. Spacing & layout

4px base grid. Actual patterns on the page:

| Pattern | Value |
|---|---|
| Section vertical | `py-24` (96px top + bottom) |
| Section container | `max-w-[1100px]` body / `max-w-[1340px]` hero / `max-w-[780px]` narrow (Gather Sources) |
| Container padding | `px-8` (32px) |
| Card padding | `p-4` (16px) small / `p-5` (20px) standard / `p-6` (24px) dense-content |
| Card header padding | `px-6 py-5` with `border-b` |
| Row padding | `px-3 py-3` |
| Grid gap | `gap-4` (16px) within cards, `gap-6` (24px) between sibling cards |
| Max hero card width | full column, `min-h-[280px]` (used to be 380, pulled back) |

---

## 6. Shadows, borders, radius

- **Shadow** — one level only: `shadow-[0_1px_2px_rgba(15,14,13,0.04)]` on cards. Heavier elevation (modal, dropdown) uses shadcn's default. **Never** use shadows on dark surfaces.
- **Border** — always opacity-based black (`rgba(15,14,13,0.07–0.10)`), never hardcoded grey.
- **Radius** — `rounded-md` (6px) buttons/pills, `rounded-xl` (12px) cards/inputs, `rounded-[16px]` larger display cards (e.g. `WhoDoesWhat` stage cards on the deck).

---

## 7. Installed shadcn primitives

All installed via shadcn registry to `src/components/ui/`. Import path: `@/components/ui/<name>`.

| Component | File | Notable variants / parts in use |
|---|---|---|
| `Card` | `card.tsx` | `Card` + `CardHeader` + `CardTitle` + `CardDescription` + `CardContent` + `CardFooter` + `CardAction` |
| `Button` | `button.tsx` | variants: `default`, `outline`, `secondary`, `ghost`, `link`, `destructive`. sizes: `xs`, `sm`, `default`, `lg`, `icon`, `icon-xs`, `icon-sm` |
| `Badge` | `badge.tsx` | variants: `default`, `secondary`, `outline`, `ghost`, `link`, `destructive` |
| `Tabs` | `tabs.tsx` | `Tabs` + `TabsList` + `TabsTrigger` + `TabsContent` |
| `Accordion` | `accordion.tsx` | `Accordion` (type=`single` or `multiple`) + `AccordionItem` + `AccordionTrigger` + `AccordionContent` — uses `tw-animate-css` for smooth expand |
| `Collapsible` | `collapsible.tsx` | underlies ChainOfThought + Reasoning |
| `Dialog` | `dialog.tsx` | modal for drilldowns |
| `DropdownMenu` | `dropdown-menu.tsx` | nav submenus, row actions |
| `HoverCard` | `hover-card.tsx` | logo popovers on hover |
| `Input` | `input.tsx` | readonly fields in credential cards |
| `Label` | `label.tsx` | paired with Input |
| `Select` | `select.tsx` | picker inputs |
| `Separator` | `separator.tsx` | `orientation="horizontal"` inside cards |
| `Table` | `table.tsx` | Pulled in by `@tool-ui/data-table` |
| `Tabs` | see above | |
| `Tooltip` | `tooltip.tsx` | `TooltipProvider` wraps `<body>` in layout.tsx with `delayDuration={120}` |

---

## 8. Installed AI primitives (`@/components/ai-elements/`)

Registry: `https://elements.ai-sdk.dev/api/registry/{name}.json`

| Component | Parts | In use for |
|---|---|---|
| `ChainOfThought` | `ChainOfThought` + `ChainOfThoughtHeader` + `ChainOfThoughtContent` + `ChainOfThoughtStep` + `ChainOfThoughtSearchResults` + `ChainOfThoughtSearchResult` + `ChainOfThoughtImage` | The **"Gather the right sources"** panel on /platform — Granola / Read.ai / Calendar / Web / QuickBooks grouped sources with italic reasoning per step |
| `Reasoning` | `Reasoning` + `ReasoningTrigger` + `ReasoningContent` | Streaming reasoning (not currently mounted, available) |
| `Task` | `Task` + `TaskTrigger` + `TaskContent` + `TaskItem` + `TaskItemFile` | File-row pattern |
| `Tool` | — | |
| `CodeBlock` | — | |
| `Shimmer` | — | Loading states |

**ChainOfThoughtStep API:**
```tsx
<ChainOfThoughtStep
  icon={LucideIcon}          // any lucide icon — used as bullet
  label={ReactNode}          // bold step name
  description={ReactNode}    // muted subtitle under label
  status="complete" | "active" | "pending"
>
  {/* children render as indented block under the step */}
</ChainOfThoughtStep>
```

---

## 9. Installed tool-ui primitives (`@/components/tool-ui/`)

Registry: `https://tool-ui.com/r/{name}.json` — each component ships with a Zod schema for safe tool-call payload parsing.

| Component | Directory | Fit |
|---|---|---|
| `QuestionFlow` | `question-flow/` | Clarifying Q&A in the Scope / discovery flow |
| `Plan` | `plan/` + `plan/progress.ts` | BRD-style structured plan with progress |
| `ProgressTracker` | `progress-tracker/` | Parallel-task view |
| `ApprovalCard` | `approval-card/` | "Make the Final Call" accept/reject with context metadata |
| `OptionList` | `option-list/` | Radio/checkbox choice with constraints |
| `DataTable` | `data-table/` | QBO facts / vendor lists with currency + status formatters |
| `shared/` | — | `contract.ts`, `parse.ts`, `schema.ts`, media utilities — shared across all tool-ui components |

Each exports a Zod `safeParseSerializable<Name>` for validating tool-call payloads before render.

---

## 10. Component patterns in use (copy-ready)

### Section header (eyebrow + serif h2 + intro)
```tsx
<div className="text-center">
  <span className="text-[11px] uppercase tracking-[0.22em] text-[#0f0e0d]/45">
    Attached to the sales cycle
  </span>
  <h2 className="mt-4 serif text-[48px] md:text-[64px] leading-[1.02] tracking-[-0.03em]">
    See Inside Their System
  </h2>
  <p className="mt-6 text-[17px] text-[#0f0e0d]/60 max-w-[620px] mx-auto leading-relaxed">
    Source rides along on the sales cycle…
  </p>
</div>
```

### Card + header band
```tsx
<Card className="overflow-hidden">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
    <div>
      <CardTitle className="text-[15px] tracking-[-0.01em]">Title</CardTitle>
      <CardDescription className="text-[12px] mt-0.5">Subtitle</CardDescription>
    </div>
    <Badge
      variant="outline"
      className="text-[10px] font-mono uppercase tracking-[0.10em] font-normal"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse mr-1.5" />
      Live
    </Badge>
  </CardHeader>
  <CardContent className="px-6 py-5">{/* body */}</CardContent>
</Card>
```

### Status row (monochrome, agent-team pattern)
```tsx
<div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.10em] text-[#0f0e0d]/50">
  <span>Functional Consultant agent</span>
  <span className="text-[#0f0e0d]/20">·</span>
  <span className="inline-flex items-center gap-1.5">
    <span className="relative flex h-1.5 w-1.5">
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#0f0e0d]/40 animate-ping" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#0f0e0d]/70" />
    </span>
    Working
  </span>
</div>
```

### Highlighted ("in focus") task row
```tsx
<div className="bg-[#fdf5e6] hover:bg-[#fbeccd] rounded-md px-3 py-3">
  …
  <span className="inline-flex items-center gap-1 text-[#8a5a12] font-medium">
    In focus
  </span>
</div>
```

### ChainOfThought step with search-result children
```tsx
<ChainOfThoughtStep
  icon={Globe}
  label="Reviewing web · 8 sources"
  status="complete"
  description="Benchmarks, licensing, and integration patterns"
>
  <ChainOfThoughtSearchResults>
    <ChainOfThoughtSearchResult>
      <Globe className="w-3 h-3" strokeWidth={1.75} />
      NetSuite OneWorld licensing · netsuite.com
    </ChainOfThoughtSearchResult>
  </ChainOfThoughtSearchResults>
</ChainOfThoughtStep>
```

### Accordion (smooth project-by-project expand)
```tsx
<Accordion type="multiple" defaultValue={["p-0", "p-1"]} className="px-2">
  <AccordionItem value="p-0" className="border-b last:border-b-0 [&[data-state=open]>button]:bg-muted/20">
    <AccordionTrigger className="px-3 py-4 hover:no-underline">
      {/* header row */}
    </AccordionTrigger>
    <AccordionContent>
      {/* task rows */}
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

---

## 11. Motion / animation

All via `framer-motion` + `tw-animate-css` (`globals.css` imports from `node_modules/tw-animate-css/dist/tw-animate.css`).

### Timing
| Interaction | Duration | Easing |
|---|---|---|
| Hover / color change | `150ms` | `ease` |
| Card entrance (scroll-in) | `400–500ms` | `ease-out` |
| Accordion expand | native via tw-animate-css | `ease` |
| Stagger between items | `30–60ms` | — |
| Cursor demo move | `1.1–1.4s` | `cubic-bezier(0.22, 0.9, 0.3, 1)` |

### Standard entrance variant
```tsx
<motion.div
  initial={{ opacity: 0, y: 16 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-80px" }}
  transition={{ duration: 0.5 }}
>
```

### Staggered rows
```tsx
const rowContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const rowItem: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};
```

### Status pulse (green dot)
`<span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />`

### "Working" animated dot (monochrome)
```tsx
<span className="relative flex h-1.5 w-1.5">
  <span className="absolute inline-flex h-full w-full rounded-full bg-[#0f0e0d]/40 animate-ping" />
  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#0f0e0d]/70" />
</span>
```

---

## 12. Icons

- **Library**: `lucide-react` only.
- **Stroke width**: `1.75` everywhere. Set globally via `.lucide { stroke-width: 1.75; }` in `globals.css`.
- **Sizes in use**: `w-3 h-3` (badges, meta), `w-3.5 h-3.5` (inline status), `w-4 h-4` (header icons), `w-5 h-5` (primary action icons).

Common icons on the page: `Mic`, `Calendar`, `Globe`, `Brain`, `ScanSearch`, `Lock`, `Check`, `Loader2`, `FileText`, `FileSpreadsheet`, `MousePointer2`, `ArrowRight`, `ChevronDown`, `RefreshCw`, `Sparkles`, `MessageSquare`, `Paperclip`.

---

## 13. Accessibility defaults

- Focus ring: shadcn-standard `focus-visible:ring-ring/50 ring-[3px]` — tokens already overridden to `rgba(15,14,13,0.20)`.
- Min contrast: body must be ≥ `text-[#0f0e0d]/60` (passes WCAG AA on `#fafaf9`). Meta at `/40` is fine for 12px+ non-critical.
- `prefers-reduced-motion` respected automatically by tw-animate-css.
- Every `TooltipContent` already has proper `aria-` wiring from shadcn.

---

## 14. How to mock a new page matching this system

1. **Wrap in `.platform-page`** — inherits all the token overrides.
2. **Use `<Card>` from `@/components/ui/card`** — never handroll a card; the soft-shadow override only fires on `[data-slot="card"]`.
3. **Headers**: eyebrow + `.serif` h2 + 17px subtitle, centered, `max-w-[620px]`.
4. **Body width**: pick one — `max-w-[780px]` (narrow, Harvey-style reasoning), `max-w-[1100px]` (standard), `max-w-[1340px]` (hero / tracker strip).
5. **Reasoning UI**: `ChainOfThought` from ai-elements, always `defaultOpen`.
6. **Lists of agent work**: `Accordion type="multiple"` per project; first non-done task gets `bg-[#fdf5e6]` + "In focus" meta.
7. **Status**: monochrome ping dot + "Working" / `Check` + "Done". Reserve semantic colors (green/amber/blue) for badges and state pills only.
8. **Typography rule of thumb**: every UPPERCASE label is `font-mono` (which just resolves to Inter) + `tracking-[0.10em]` minimum. Every h2 is `.serif` Instrument Serif with `-0.03em` tracking.
9. **One shadow level** only — `0 1px 2px rgba(15,14,13,0.04)` — never stack.
10. **Entrances**: `motion.div` + `whileInView` + `{margin: "-80px", once: true}` + 400–500ms fade/slide.

---

## 15. Reference files

| File | What it contains |
|---|---|
| `src/app/platform/page.tsx` | The canonical implementation — every pattern above is in use here |
| `src/app/globals.css` | `@theme` tokens, font var definitions, shadcn OKLCH palette, tw-animate-css import |
| `src/app/layout.tsx` | Font loading, `TooltipProvider` wrap |
| `src/components/ui/*` | shadcn primitives |
| `src/components/ai-elements/*` | ChainOfThought, Reasoning, Task, Tool, CodeBlock, Shimmer |
| `src/components/tool-ui/*` | QuestionFlow, Plan, ProgressTracker, ApprovalCard, OptionList, DataTable + shared schema helpers |
| `src/lib/utils.ts` | `cn()` helper (clsx + tailwind-merge) |
| `components.json` | shadcn config pinning registries (`@ai-elements`, `@tool-ui`) |

All installed and verified building on the current `main` branch.
