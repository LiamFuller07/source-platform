# Source — /platform page, fully bundled

Everything needed to run / inspect / mock against `localhost:3000/platform`.

## What's in the box

```
source-platform/
├── rendered.html                      ← full HTML from localhost:3000/platform
├── DESIGN_SYSTEM.md                   ← 15-section spec
├── package.json                       ← every dependency pinned
├── package-lock.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── components.json                    ← shadcn registry config
├── public/logos/                      ← SAP, NetSuite, Dynamics 365, Sage SVGs
└── src/
    ├── app/
    │   ├── layout.tsx                 ← font loading + TooltipProvider
    │   ├── globals.css                ← @theme tokens + tw-animate-css + shadcn OKLCH
    │   ├── fonts/                     ← Coolvetica .woff
    │   └── platform/
    │       └── page.tsx               ← THE WHOLE PAGE · 2186 lines
    ├── components/
    │   ├── ui/                        ← 15 shadcn primitives
    │   ├── ai-elements/               ← ChainOfThought, Reasoning, Task, Tool, CodeBlock, Shimmer
    │   └── tool-ui/                   ← QuestionFlow, Plan, ProgressTracker, ApprovalCard, OptionList, DataTable + shared
    └── lib/
        └── utils.ts                   ← cn() helper
```

## Running locally

```bash
cd source-platform
npm install
npm run dev
# open http://localhost:3000/platform
```

## The page itself — section by section

The whole page is one file: `src/app/platform/page.tsx`. Default export is `<PlatformPage />` which renders, in order:

| Section | Component | What it shows |
|---|---|---|
| 1. Sticky nav | `<TopNav />` | Source wordmark (Coolvetica) + Platform / Solutions / Customers / Security links + "Book a demo" CTA |
| 2. Hero | `<Hero />` | "Long Horizon ERP Agents" (Instrument Serif 88px) + ERP logo pill (SAP · NetSuite · Dynamics · Sage) + 5-step pipeline preview strip: Scope → Discovery → Scan → Deliver → Review, each with a mini preview card |
| 3. Build a Structured Plan | `<BuildStructuredPlan />` | Textarea for transcript/SOW upload, Files/Systems/Improve toggles, clarifying-question chips |
| 4. See Inside Their System | `<SeeInsideSystem />` | "Gather the right sources" card — ai-elements `<ChainOfThought>` with grouped steps for Granola / Read.ai / Google Calendar / Web sources / QuickBooks API, plus animated deep-scan reasoning. Below: QuickBooks connected facts + Pipeline rail (INGEST → SCAN → BRD V1 → … → DONE) |
| 5. Run Multiple Implementations at Once | `<RunMultipleTasks />` | Single card with two bands — Implementations + Managed Services — each project inside a shadcn `<Accordion type="multiple">` with smooth expand. First non-done task per project is highlighted in cream `#fdf5e6` as "In focus" |
| 6. Inspect Any Step in Depth | `<InspectAnyTask />` | Two-column: left = mini tracker with a looping mouse-cursor that clicks a task, right = drilldown with BRD PDF 4-page preview, "What Source did" ChainOfThought reasoning, "What you can do" action buttons |
| 7. Create Polished Deliverables | `<CreateDeliverables />` | File list with BRD.docx, SOW.docx, COA Mapping.xlsx, Migration Plan.docx, Go-Live Readiness.pptx, Cutover Runbook.docx |
| 8. Make the Final Call | `<MakeFinalCall />` | Ghost document + Accept/Reject edit card showing systems touched |
| 9. Footer CTA | `<FooterCta />` | "Turn your variable cost into a fixed one." → Book a demo |

## Page shell styling

`<div className="platform-page">` wraps everything. A styled-jsx global block inside `PlatformPage` scopes:

- Page bg `#fafaf9`
- Overrides shadcn OKLCH tokens → soft `rgba(15,14,13,0.07–0.10)` borders
- Overrides `[data-slot="card"]` to a 1px soft shadow + 7%-black border
- `.serif` utility → Instrument Serif, `-0.02em` tracking, weight 400
- Disables global scroll-snap (inherited from `globals.css`) via `html:has(.platform-page) { scroll-snap-type: none }`

## Key dependencies (from package.json)

- `next` 16.1.6 (Turbopack)
- `react` 19
- `tailwindcss` 4 via `@tailwindcss/postcss`
- `framer-motion` for entrances + cursor demos
- `lucide-react` for all icons (stroke width 1.75 globally)
- `radix-ui` primitives (used by shadcn)
- `tw-animate-css` for smooth Accordion expand (imported via relative path from `node_modules` to bypass its exports-field restriction)
- `@radix-ui/react-use-controllable-state` — internal to ai-elements
- `streamdown` + `@streamdown/*` — used by `Reasoning` (markdown streaming, available but not mounted on /platform)

## Screenshot targets (where to take shots)

| Scroll position | What to capture |
|---|---|
| Top / 0% | Hero + ERP logo pill + 5 mini preview cards |
| After hero | The Gather the Right Sources ChainOfThought panel expanded |
| Mid-scroll | Run Multiple Implementations accordion with all projects open |
| After Run | InspectAnyTask with the mouse cursor hovering a task (cursor animates 600ms idle → 1.8s click every 4.2s) |
| Bottom | Make the Final Call + Footer CTA |

## rendered.html

`rendered.html` is the full HTML served by Turbopack dev at the moment the bundle was created. It includes all inlined Tailwind + inline Next.js hydration data. You can open it directly in a browser to see the static markup — interactions won't work without the JS bundle, but it's useful for copying DOM structure, class names, or inspecting computed styles.

## Further reading

- `DESIGN_SYSTEM.md` — full extracted spec (fonts, tokens, typography, components, motion, a11y, mocking guide)
- `src/app/platform/page.tsx` — every pattern above is implemented here, grouped by section
- `src/components/ai-elements/chain-of-thought.tsx` — the primitive used for the Gather the Right Sources panel
