"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Info,
  Paperclip,
  Landmark,
  Sparkles,
  ArrowRight,
  MessageSquare,
  LayoutGrid,
  Activity,
  Globe,
  FileText,
  FileSpreadsheet,
  Database,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plan, type PlanTodo } from "@/components/tool-ui/plan";
import {
  ProgressTracker,
  type ProgressStep,
} from "@/components/tool-ui/progress-tracker";
import { cn } from "@/lib/utils";

// ————————————————————————————————————————————————————————————————
// Data
// ————————————————————————————————————————————————————————————————

/**
 * Reasoning step shape used by the dashboard.
 *
 * Extends the canonical `PlanTodo` vocabulary with two project-specific
 * concepts that aren't in the upstream `@tool-ui/plan` schema:
 *   - `awaiting_response` status — for steps blocked on external (client) input
 *   - `tool` chip — the tool the agent used / will use for this step
 *
 * Adapted down to the canonical `PlanTodo` / `ProgressStep` shape at the
 * component boundary via `toPlanTodos` / `toProgressSteps` below, so the
 * tool-ui components stay pristine.
 */
type ReasoningStep = {
  id: string;
  label: string;
  status:
    | "pending"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "awaiting_response";
  description?: string;
  tool?: {
    kind: "web" | "doc" | "sheet" | "db";
    label: string;
  };
};

type Project = {
  id: string;
  company: string;
  systems: string;
  status: string;
  step: number;
  stepsTotal: number;
  stalledFor?: string;
  stalledReason?: string;
  priceRange?: string;
  priceNote?: string;
  hoursRange?: string;
  hoursNote?: string;
  waitingOnClient?: boolean;
  href?: string;
  reasoning?: ReasoningStep[];
};

/**
 * Adapt extended reasoning steps down to canonical `@tool-ui/plan` todos.
 *
 * - `awaiting_response` → `in_progress` (both are "active but not done").
 * - We intentionally DO NOT populate `description` here, because the
 *   upstream Plan collapses description-bearing rows into a Collapsible
 *   (with a ChevronRight + shifted gutter), which breaks the vertical
 *   timeline connector and makes the in-progress row sit flush with a
 *   different left-edge than the other steps. Tool chips and awaiting
 *   reasons are surfaced separately in the expanded row header instead.
 * - `description` on the input ReasoningStep IS preserved when provided
 *   explicitly by the caller, so it can still opt into the Collapsible
 *   treatment when that's the intended UX.
 */
function toPlanTodos(steps: ReasoningStep[]): PlanTodo[] {
  return steps.map((s) => {
    const status: PlanTodo["status"] =
      s.status === "awaiting_response" ? "in_progress" : s.status;

    return {
      id: s.id,
      label: s.label,
      status,
      description: s.description,
    };
  });
}

/**
 * Adapt extended reasoning steps down to canonical `@tool-ui/progress-tracker`
 * steps. Uses the same mapping as `toPlanTodos`, but with hyphenated status
 * vocabulary (`in-progress` vs `in_progress`).
 */
function toProgressSteps(steps: ReasoningStep[]): ProgressStep[] {
  return steps.map((s) => {
    const parts: string[] = [];
    if (s.tool) parts.push(s.tool.label);
    if (s.status === "awaiting_response") parts.push("Awaiting client response");
    if (s.description) parts.push(s.description);

    const description = parts.length > 0 ? parts.join(" · ") : undefined;

    const status: ProgressStep["status"] =
      s.status === "completed"
        ? "completed"
        : s.status === "cancelled"
          ? "failed"
          : s.status === "in_progress" || s.status === "awaiting_response"
            ? "in-progress"
            : "pending";

    return { id: s.id, label: s.label, description, status };
  });
}

const ACTIVE_PROJECTS: Project[] = [
  {
    id: "asc",
    company: "Advanced Sandbox Company",
    systems: "QBO ADVANCED → NETSUITE ONEWORLD",
    status: "Scanning",
    step: 4,
    stepsTotal: 12,
    priceRange: "TBD",
    priceNote: "PRICE RANGE",
    hoursNote: "PENDING SCAN",
    href: "/platform",
    reasoning: [
      {
        id: "r1",
        label: "Connect to QBO Advanced sandbox",
        status: "completed",
        tool: { kind: "db", label: "QBO API" },
      },
      {
        id: "r2",
        label: "Enumerate GL accounts and sub-accounts",
        status: "completed",
        tool: { kind: "sheet", label: "COA export" },
      },
      {
        id: "r3",
        label: "Scan vendor master for duplicates",
        status: "in_progress",
        tool: { kind: "db", label: "QBO API" },
      },
      {
        id: "r4",
        label: "Identify ghost systems and side-car integrations",
        status: "pending",
        tool: { kind: "web", label: "Web" },
      },
      {
        id: "r5",
        label: "Estimate AI hours and draft price range",
        status: "pending",
      },
    ],
  },
  {
    id: "mrg",
    company: "Meridian Retail Group",
    systems: "QBO PLUS → NETSUITE SUITESUCCESS",
    status: "Generating BRD v2",
    step: 8,
    stepsTotal: 12,
    priceRange: "$7K – $11.5K",
    priceNote: "PRICE RANGE",
    hoursRange: "28–36h",
    hoursNote: "EST. AI HOURS",
    href: "/platform",
    reasoning: [
      {
        id: "r1",
        label: "Transcripts ingested from Granola (3 sessions)",
        status: "completed",
        tool: { kind: "doc", label: "Transcripts" },
      },
      {
        id: "r2",
        label: "QuickBooks Plus read-only scan complete",
        status: "completed",
        tool: { kind: "db", label: "QBO API" },
      },
      {
        id: "r3",
        label: "Generate BRD v2 incorporating Shopify ghost system",
        status: "in_progress",
        tool: { kind: "doc", label: "BRD v2.docx" },
      },
      {
        id: "r4",
        label: "Route BRD v2 to partner for sign-off",
        status: "pending",
      },
    ],
  },
  {
    id: "atl",
    company: "Atlas Outfitters LLC",
    systems: "XERO → NETSUITE MID-MARKET",
    status: "Awaiting Sign-Off",
    step: 10,
    stepsTotal: 12,
    stalledFor: "42D 10H",
    stalledReason: "Awaiting partner sign-off on BRD v1",
    priceRange: "$12K – $18K",
    priceNote: "PRICE RANGE",
    hoursRange: "38–45h",
    hoursNote: "EST. AI HOURS",
    waitingOnClient: true,
    href: "/platform",
    reasoning: [
      {
        id: "r1",
        label: "Xero multi-entity scan complete",
        status: "completed",
        tool: { kind: "db", label: "Xero API" },
      },
      {
        id: "r2",
        label: "BRD v1 drafted · 14 pages",
        status: "completed",
        tool: { kind: "doc", label: "BRD v1.docx" },
      },
      {
        id: "r3",
        label: "Partner review of BRD v1",
        status: "awaiting_response",
        tool: { kind: "web", label: "Web" },
      },
      {
        id: "r4",
        label: "Generate SOW once BRD is approved",
        status: "pending",
      },
    ],
  },
  {
    id: "shs",
    company: "Summit Health Sciences",
    systems: "SAGE INTACCT → NETSUITE ONEWORLD",
    status: "Migrating",
    step: 12,
    stepsTotal: 12,
    priceRange: "$21,500",
    priceNote: "PRICE RANGE",
    hoursRange: "54–62h",
    hoursNote: "EST. AI HOURS",
    href: "/platform",
    reasoning: [
      {
        id: "r1",
        label: "COA mapping verified against NetSuite OneWorld",
        status: "completed",
        tool: { kind: "sheet", label: "COA Mapping.xlsx" },
      },
      {
        id: "r2",
        label: "Historical GL migrated (FY23 + FY24)",
        status: "completed",
        tool: { kind: "db", label: "NetSuite API" },
      },
      {
        id: "r3",
        label: "Opening balance reconciliation",
        status: "in_progress",
        tool: { kind: "sheet", label: "TB reconciliation" },
      },
      {
        id: "r4",
        label: "Cutover sign-off and go-live checklist",
        status: "pending",
      },
    ],
  },
  {
    id: "hli",
    company: "Harbor Logistics Inc",
    systems: "QBO SIMPLE START → NETSUITE",
    status: "Waiting for Credentials",
    step: 2,
    stepsTotal: 12,
    stalledFor: "41D 15H",
    stalledReason: "Client has not shared NetSuite sandbox credentials",
    priceRange: "TBD",
    priceNote: "PRICE RANGE",
    hoursNote: "PENDING SCAN",
    waitingOnClient: true,
    href: "/platform",
    reasoning: [
      {
        id: "r1",
        label: "Discovery call transcribed",
        status: "completed",
        tool: { kind: "doc", label: "Transcript" },
      },
      {
        id: "r2",
        label: "Request NetSuite sandbox credentials from client",
        status: "awaiting_response",
        tool: { kind: "web", label: "Web" },
      },
      {
        id: "r3",
        label: "Scan QBO Simple Start once access granted",
        status: "pending",
      },
      {
        id: "r4",
        label: "Estimate AI hours and draft price range",
        status: "pending",
      },
    ],
  },
  {
    id: "ccb",
    company: "Copper Creek Brewing Co",
    systems: "QBO PLUS → NETSUITE SUITESUCCESS",
    status: "BRD v1 Sent",
    step: 6,
    stepsTotal: 12,
    stalledFor: "43D 9H",
    stalledReason: "Partner has not responded since BRD v1 sent",
    priceRange: "$5K – $15K",
    priceNote: "PRICE RANGE",
    hoursRange: "18–28h",
    hoursNote: "EST. AI HOURS",
    waitingOnClient: true,
    href: "/platform",
    reasoning: [
      {
        id: "r1",
        label: "QBO Plus scan complete · 94,127 records",
        status: "completed",
        tool: { kind: "db", label: "QBO API" },
      },
      {
        id: "r2",
        label: "BRD v1 drafted and sent to partner",
        status: "completed",
        tool: { kind: "doc", label: "BRD v1.docx" },
      },
      {
        id: "r3",
        label: "Partner review of BRD v1",
        status: "awaiting_response",
        tool: { kind: "web", label: "Web" },
      },
      {
        id: "r4",
        label: "Draft SOW once sign-off received",
        status: "pending",
      },
    ],
  },
];

const PAST_PROJECTS: Project[] = [
  {
    id: "p1",
    company: "Northwind Publishing Co",
    systems: "QBO ADVANCED → NETSUITE ONEWORLD",
    status: "Live · Handoff Complete",
    step: 12,
    stepsTotal: 12,
    priceRange: "$12,500",
    priceNote: "FIXED",
    hoursRange: "31h",
    hoursNote: "ACTUAL",
  },
  {
    id: "p2",
    company: "Lakeside Apparel",
    systems: "XERO → NETSUITE MID-MARKET",
    status: "Live · Handoff Complete",
    step: 12,
    stepsTotal: 12,
    priceRange: "$9,800",
    priceNote: "FIXED",
    hoursRange: "24h",
    hoursNote: "ACTUAL",
  },
  {
    id: "p3",
    company: "Redwood Foods",
    systems: "QBO PLUS → NETSUITE SUITESUCCESS",
    status: "Live · Handoff Complete",
    step: 12,
    stepsTotal: 12,
    priceRange: "$14,200",
    priceNote: "FIXED",
    hoursRange: "42h",
    hoursNote: "ACTUAL",
  },
];

type NavKey = "projects" | "chat";

// ————————————————————————————————————————————————————————————————
// Page
// ————————————————————————————————————————————————————————————————

export default function PipelineDashboardPage() {
  const [nav, setNav] = useState<NavKey>("projects");

  return (
    <div className="pipeline-page min-h-screen flex">
      <Sidebar nav={nav} onNav={setNav} />

      <main className="flex-1 min-w-0">
        {nav === "projects" ? <ProjectsView /> : <ChatView />}
      </main>

      <style jsx global>{`
        .pipeline-page {
          background: #fafaf9;
          color: #0f0e0d;
          font-family: var(--font-sans);
          --border: rgba(15, 14, 13, 0.08);
          --input: rgba(15, 14, 13, 0.08);
          --ring: rgba(15, 14, 13, 0.2);
          --card: #ffffff;
          --popover: #ffffff;
          --radius: 0.75rem;
        }
        .pipeline-page section {
          scroll-snap-align: none;
          height: auto;
          min-height: auto;
        }
        html:has(.pipeline-page) {
          scroll-snap-type: none;
        }
      `}</style>
    </div>
  );
}

// ————————————————————————————————————————————————————————————————
// Sidebar
// ————————————————————————————————————————————————————————————————

function Sidebar({
  nav,
  onNav,
}: {
  nav: NavKey;
  onNav: (n: NavKey) => void;
}) {
  const activeCount = ACTIVE_PROJECTS.length;
  const waitingCount = ACTIVE_PROJECTS.filter((p) => p.waitingOnClient).length;

  return (
    <aside className="w-[224px] flex-shrink-0 border-r border-black/[0.06] bg-white/60 backdrop-blur-sm sticky top-0 h-screen flex flex-col">
      <div className="px-5 pt-7 pb-6">
        <div className="font-serif text-[28px] font-normal tracking-[-0.01em] text-[#0f0e0d] leading-[0.95]">
          Source
        </div>
        <div className="mt-2 text-[9.5px] uppercase tracking-[0.16em] text-[#0f0e0d]/40">
          Pipeline Dashboard
        </div>
      </div>

      <nav className="px-2.5 flex flex-col gap-0.5">
        <SidebarItem
          icon={LayoutGrid}
          label="Projects"
          active={nav === "projects"}
          onClick={() => onNav("projects")}
          meta={`${activeCount}`}
        />
        <SidebarItem
          icon={MessageSquare}
          label="Chat"
          active={nav === "chat"}
          onClick={() => onNav("chat")}
        />
      </nav>

      <div className="mt-auto px-5 pb-6 pt-6 border-t border-black/[0.05]">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#0f0e0d]/45">
          <Activity className="w-3 h-3" strokeWidth={2} />
          Live
        </div>
        <div className="mt-3 space-y-1.5">
          <MiniStat label="Active" value={activeCount} />
          <MiniStat label="Waiting" value={waitingCount} accent />
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  active,
  onClick,
  meta,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  active: boolean;
  onClick: () => void;
  meta?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-2.5 h-9 rounded-md text-[13px] transition-colors ${
        active
          ? "bg-[#0f0e0d] text-white"
          : "text-[#0f0e0d]/75 hover:text-[#0f0e0d] hover:bg-black/[0.04]"
      }`}
    >
      <Icon className="w-4 h-4" strokeWidth={1.85} />
      <span className="flex-1 text-left">{label}</span>
      {meta && (
        <span
          className={`text-[10.5px] tabular-nums ${
            active ? "text-white/60" : "text-[#0f0e0d]/40"
          }`}
        >
          {meta}
        </span>
      )}
    </button>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-[#0f0e0d]/55">{label}</span>
      <span
        className={`text-[13px] font-semibold tabular-nums ${
          accent ? "text-[#8a5a12]" : "text-[#0f0e0d]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// ————————————————————————————————————————————————————————————————
// Projects view
// ————————————————————————————————————————————————————————————————

function ProjectsView() {
  const [selected, setSelected] = useState<string | null>("atl");

  const implementing = ACTIVE_PROJECTS.filter((p) => p.step >= 7);
  const discovering = ACTIVE_PROJECTS.filter((p) => p.step < 7);

  // Pick the most-active project for the Live Activity card:
  // first one that has an in-progress reasoning step, fallback to the
  // one with the highest step count.
  const liveProject = useMemo(() => {
    const withInProgress = ACTIVE_PROJECTS.find((p) =>
      p.reasoning?.some((r) => r.status === "in_progress"),
    );
    return (
      withInProgress ??
      [...ACTIVE_PROJECTS].sort((a, b) => b.step - a.step)[0]
    );
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto px-10 pt-12 pb-24">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-[52px] font-normal tracking-[-0.015em] text-[#0f0e0d] leading-[0.95]">
            Active Projects
          </h1>
          <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-[#0f0e0d]/45">
            Click any row to view live reasoning
          </p>
        </div>
      </header>

      {/* Live Activity action card */}
      {liveProject && (
        <LiveActivityCard project={liveProject} />
      )}

      {/* Implementing Phase */}
      {implementing.length > 0 && (
        <div className="mt-12">
          <PhaseHeader
            phase="Implementing"
            count={implementing.length}
            projects={implementing}
          />
          <div className="mt-5 rounded-xl border border-black/[0.07] bg-white overflow-hidden shadow-[0_1px_2px_rgba(15,14,13,0.03)]">
            {implementing.map((project, i) => (
              <ProjectRow
                key={project.id}
                project={project}
                isFirst={i === 0}
                active={selected === project.id}
                onClick={() =>
                  setSelected((s) => (s === project.id ? null : project.id))
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Requirements / Discovery Phase */}
      {discovering.length > 0 && (
        <div className="mt-12">
          <PhaseHeader
            phase="Requirements / Discovery"
            count={discovering.length}
            projects={discovering}
          />
          <div className="mt-5 rounded-xl border border-black/[0.07] bg-white overflow-hidden shadow-[0_1px_2px_rgba(15,14,13,0.03)]">
            {discovering.map((project, i) => (
              <ProjectRow
                key={project.id}
                project={project}
                isFirst={i === 0}
                active={selected === project.id}
                onClick={() =>
                  setSelected((s) => (s === project.id ? null : project.id))
                }
              />
            ))}
          </div>
        </div>
      )}

      <PastMigrations projects={PAST_PROJECTS} />
    </div>
  );
}

// ————————————————————————————————————————————————————————————————
// Reasoning Panel (expanded project row body)
// ————————————————————————————————————————————————————————————————

const TOOL_KIND_META: Record<
  NonNullable<ReasoningStep["tool"]>["kind"],
  { Icon: typeof Globe; color: string }
> = {
  web: { Icon: Globe, color: "text-[#0f0e0d]/55" },
  doc: { Icon: FileText, color: "text-[#2d5aa0]" },
  sheet: { Icon: FileSpreadsheet, color: "text-[#217346]" },
  db: { Icon: Database, color: "text-[#8d6e2f]" },
};

function ReasoningPanel({ steps }: { steps: ReasoningStep[] }) {
  const todos = toPlanTodos(steps);
  const completedCount = steps.filter((s) => s.status === "completed").length;
  const totalCount = steps.length;
  const progress =
    totalCount === 0
      ? 0
      : Math.round((completedCount / totalCount) * 100);

  // Pair each reasoning step to its absolute row position so we can render a
  // synchronized tool-chip column to the right of the Plan.Compact list.
  const chipRows = steps.map((s) => ({ id: s.id, tool: s.tool }));

  return (
    <div className="rounded-lg border border-black/[0.06] bg-[#fafaf8] px-5 py-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[#0f0e0d]/45 font-medium">
          <Activity className="w-3 h-3" strokeWidth={2} aria-hidden />
          Live Reasoning
        </div>
        <div className="text-[10.5px] font-mono text-[#0f0e0d]/55 tabular-nums">
          {completedCount} / {totalCount}
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="h-[3px] bg-black/[0.07] rounded-full overflow-hidden mb-4"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div
          className="h-full bg-[#0f0e0d] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Two-column body: Plan.Compact on the left, synchronized tool chips
          on the right. The chip column uses the same row pitch as the Plan
          rows (py-1.5 + 24px icon + 24px line-height) so each chip aligns
          with its step label. */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 items-start">
        <Plan.Compact
          id={`reasoning-${steps[0]?.id ?? "empty"}`}
          todos={todos}
          maxVisibleTodos={todos.length}
        />
        <ul className="flex flex-col gap-0 pt-0">
          {chipRows.map((row) => (
            <li
              key={row.id}
              className="flex items-center h-[36px]" /* matches Plan row height */
            >
              {row.tool ? <ToolChip tool={row.tool} /> : <span aria-hidden />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ToolChip({ tool }: { tool: NonNullable<ReasoningStep["tool"]> }) {
  const meta = TOOL_KIND_META[tool.kind];
  const Icon = meta.Icon;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-2.5 py-1 text-[11px] text-[#0f0e0d] shadow-[0_1px_2px_rgba(15,14,13,0.03)]">
      <Icon className={cn("w-3 h-3", meta.color)} strokeWidth={2} aria-hidden />
      <span className="truncate max-w-[140px]">{tool.label}</span>
    </span>
  );
}

// ————————————————————————————————————————————————————————————————
// Phase Header with per-project milestone strip
// ————————————————————————————————————————————————————————————————

// The 12-step engagement pipeline, grouped into 6 displayable milestones.
const MILESTONES = [
  "Scope",
  "Discovery",
  "Scan",
  "Deliver",
  "Review",
  "Implement",
];

function PhaseHeader({
  phase,
  count,
  projects,
}: {
  phase: string;
  count: number;
  projects: Project[];
}) {
  const aggregate = Math.round(
    (projects.reduce((sum, p) => sum + p.step, 0) / (projects.length * 12)) *
      100,
  );

  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="font-serif text-[28px] font-normal leading-[1] tracking-[-0.01em] text-[#0f0e0d]">
            {phase}
          </h2>
          <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-[#0f0e0d]/45">
            {count} Project{count !== 1 ? "s" : ""} · {aggregate}% complete
          </p>
        </div>
      </div>

      {/* Per-project milestone strip */}
      <div className="mt-4 rounded-lg border border-black/[0.06] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,14,13,0.02)]">
        <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-[#0f0e0d]/40 font-medium mb-2.5">
          <Activity className="h-3 w-3" strokeWidth={2} aria-hidden />
          Pipeline
        </div>
        <div className="space-y-2">
          {projects.map((p) => (
            <MilestoneStrip key={p.id} project={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MilestoneStrip({ project }: { project: Project }) {
  const currentMilestone = Math.min(
    MILESTONES.length - 1,
    Math.floor(((project.step - 1) / project.stepsTotal) * MILESTONES.length),
  );
  return (
    <div className="grid grid-cols-[minmax(0,180px)_1fr_auto] items-center gap-3">
      <div className="text-[12.5px] font-medium text-[#0f0e0d] truncate">
        {project.company}
      </div>
      <div className="flex items-center gap-[3px]">
        {MILESTONES.map((m, i) => {
          const state =
            i < currentMilestone
              ? "done"
              : i === currentMilestone
                ? project.waitingOnClient
                  ? "waiting"
                  : "active"
                : "pending";
          return (
            <div
              key={m}
              className="flex-1 flex flex-col items-start gap-1 min-w-0"
            >
              <div
                className={cn(
                  "h-[3px] w-full rounded-full",
                  state === "done" && "bg-[#0f0e0d]",
                  state === "active" && "bg-[#0f0e0d]",
                  state === "waiting" && "bg-[#c78a36]",
                  state === "pending" && "bg-black/[0.08]",
                )}
              />
              <span
                className={cn(
                  "text-[9.5px] uppercase tracking-[0.08em] truncate",
                  state === "pending"
                    ? "text-[#0f0e0d]/30"
                    : state === "waiting"
                      ? "text-[#c78a36]"
                      : "text-[#0f0e0d]/70",
                )}
              >
                {m}
              </span>
            </div>
          );
        })}
      </div>
      <div className="text-[10.5px] font-mono text-[#0f0e0d]/50 tabular-nums whitespace-nowrap">
        {project.step}/{project.stepsTotal}
      </div>
    </div>
  );
}

// ————————————————————————————————————————————————————————————————
// Live Activity action card (ProgressTracker)
// ————————————————————————————————————————————————————————————————

function LiveActivityCard({ project }: { project: Project }) {
  const steps = toProgressSteps(project.reasoning ?? []);

  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-6 mb-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[#0f0e0d]/45">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1e6b3a] opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1e6b3a]" />
            </span>
            Live Activity
          </div>
          <h2 className="mt-2 font-serif text-[28px] font-normal leading-[1] tracking-[-0.01em] text-[#0f0e0d]">
            {project.company}
          </h2>
          <p className="mt-1 text-[12px] text-[#0f0e0d]/55">
            {project.status} · Step {project.step} of {project.stepsTotal}
          </p>
        </div>
      </div>
      <ProgressTracker
        id={`live-${project.id}`}
        steps={steps}
        elapsedTime={142_000}
      />
    </section>
  );
}

// ————————————————————————————————————————————————————————————————
// Project row (click to expand with Plan)
// ————————————————————————————————————————————————————————————————

function ProjectRow({
  project,
  isFirst,
  active,
  onClick,
}: {
  project: Project;
  isFirst: boolean;
  active: boolean;
  onClick: () => void;
}) {
  const waiting = project.waitingOnClient;
  const complete = project.step === project.stepsTotal;

  return (
    <div
      className={[
        !isFirst && "border-t border-black/[0.06]",
        active && "bg-[#fafaf8]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        onClick={onClick}
        aria-expanded={active}
        className="relative w-full text-left grid grid-cols-[minmax(0,2fr)_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-6 px-6 py-5 group transition-colors hover:bg-[#fafaf8]"
      >
        {waiting && (
          <span
            aria-hidden
            className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#c78a36]"
          />
        )}

        {/* Company + systems */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[14.5px] font-semibold text-[#0f0e0d] truncate">
              {project.company}
            </span>
            {project.href && (
              <a
                href={project.href}
                onClick={(e) => e.stopPropagation()}
                className="text-[#0f0e0d]/30 hover:text-[#0f0e0d]/70 transition-colors flex-shrink-0"
                aria-label="Open project"
              >
                <ExternalLink className="w-3 h-3" strokeWidth={2} />
              </a>
            )}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.10em] text-[#0f0e0d]/45 truncate">
            {project.systems}
          </div>
        </div>

        {/* Status + step */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[14px] text-[#0f0e0d] truncate">
              {project.status}
            </span>
            {!complete && !waiting && (
              <span
                aria-hidden
                className="w-[10px] h-[10px] rounded-full border border-[#0f0e0d]/20 flex-shrink-0"
              />
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.10em] text-[#0f0e0d]/45">
            <span>
              Step {project.step} of {project.stepsTotal}
            </span>
            {project.stalledFor && (
              <StalledBadge
                time={project.stalledFor}
                reason={project.stalledReason}
              />
            )}
          </div>
        </div>

        {/* Price */}
        <div className="min-w-0">
          <div
            className={`text-[14px] truncate ${
              project.priceRange === "TBD"
                ? "text-[#0f0e0d]/55"
                : "text-[#0f0e0d]"
            }`}
          >
            {project.priceRange}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.10em] text-[#0f0e0d]/45">
            {project.priceNote}
          </div>
        </div>

        {/* Hours */}
        <div className="min-w-0">
          <div
            className={`text-[14px] truncate ${
              project.hoursRange ? "text-[#0f0e0d]" : "text-[#0f0e0d]/35"
            }`}
          >
            {project.hoursRange ?? "—"}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.10em] text-[#0f0e0d]/45">
            {project.hoursNote}
          </div>
        </div>

        {/* Expand chevron */}
        <ChevronDown
          className={`w-4 h-4 text-[#0f0e0d]/40 transition-transform ${
            active ? "rotate-180" : ""
          }`}
          strokeWidth={2}
        />
      </button>

      {active && project.reasoning && (
        <div className="px-6 pb-6 pt-1">
          <ReasoningPanel steps={project.reasoning} />
        </div>
      )}
    </div>
  );
}

function StalledBadge({
  time,
  reason,
}: {
  time: string;
  reason?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 bg-[#f7e9cc] text-[#8a5a12] px-1.5 py-[1px] rounded-[4px] text-[10px] font-medium normal-case tracking-normal">
          {time}
          <Info className="w-2.5 h-2.5" strokeWidth={2} />
        </span>
      </TooltipTrigger>
      {reason && (
        <TooltipContent
          side="top"
          className="max-w-[240px] text-[12px] leading-snug"
        >
          {reason}
        </TooltipContent>
      )}
    </Tooltip>
  );
}

// ————————————————————————————————————————————————————————————————
// Past migrations
// ————————————————————————————————————————————————————————————————

function PastMigrations({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-8">
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[#0f0e0d]/45 hover:text-[#0f0e0d]/75 transition-colors">
          {open ? (
            <ChevronDown className="w-3.5 h-3.5" strokeWidth={2} />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
          )}
          Past Migrations ({projects.length})
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 rounded-xl border border-black/[0.07] bg-white overflow-hidden shadow-[0_1px_2px_rgba(15,14,13,0.03)]">
        {projects.map((project, i) => (
          <ProjectRow
            key={project.id}
            project={project}
            isFirst={i === 0}
            active={false}
            onClick={() => {}}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ————————————————————————————————————————————————————————————————
// Chat view
// ————————————————————————————————————————————————————————————————

const SUGGESTIONS = [
  "Multi-subsidiary?",
  "Revenue recognition?",
  "Target go-live?",
  "Shopify as system of record?",
];

function ChatView() {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 240) + "px";
  }, [value]);

  const send = (text?: string) => {
    const content = (text ?? value).trim();
    if (!content) return;
    setMessages((m) => [
      ...m,
      { role: "user", content },
      {
        role: "assistant",
        content:
          "Parsing. I'll pull structured scope, detect target ERP, and surface risks across subsidiaries, rev-rec policy, and go-live constraints.",
      },
    ]);
    setValue("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const hero = useMemo(() => messages.length === 0, [messages.length]);

  return (
    <div className="max-w-[820px] mx-auto px-10 pt-12 pb-24 min-h-screen flex flex-col">
      <header>
        <h1 className="font-serif text-[52px] font-normal tracking-[-0.015em] text-[#0f0e0d] leading-[0.95]">
          Ask Source
        </h1>
        <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-[#0f0e0d]/45">
          Spin up a new engagement or ask about any project
        </p>
      </header>

      {!hero && (
        <div className="mt-10 flex-1 space-y-3 overflow-y-auto">
          {messages.map((m, i) => (
            <ChatMessage key={i} role={m.role} content={m.content} />
          ))}
        </div>
      )}

      {hero && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.14em] text-[#0f0e0d]/45">
              <MessageSquare className="w-3 h-3" strokeWidth={2} />
              Ask Source
            </div>
            <h2 className="mt-3 font-serif text-[40px] font-normal leading-[1.02] tracking-[-0.01em] text-[#0f0e0d] max-w-[560px] mx-auto text-balance">
              Spin up a new engagement or ask about any project.
            </h2>
          </div>
        </div>
      )}

      <div className="mt-6">
        <div className="bg-white rounded-2xl border border-black/[0.08] shadow-[0_1px_2px_rgba(15,14,13,0.04)] p-1.5">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            rows={3}
            placeholder="Paste SOW, discovery transcript, or project brief…"
            className="w-full resize-none bg-transparent px-4 pt-4 pb-2 text-[14px] text-[#0f0e0d] placeholder:text-[#0f0e0d]/35 focus:outline-none leading-relaxed"
            style={{ minHeight: 88 }}
          />
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-1">
              <DockChip icon={Paperclip} label="Files" />
              <DockChip icon={Landmark} label="Systems" />
              <DockChip icon={Sparkles} label="Improve" />
            </div>
            <button
              type="button"
              onClick={() => send()}
              disabled={!value.trim()}
              aria-label="Send"
              className="w-9 h-9 rounded-lg bg-[#0f0e0d] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0f0e0d]/85 transition-colors"
            >
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="text-[12.5px] text-[#0f0e0d]/70 bg-white border border-black/[0.07] hover:border-black/[0.14] hover:text-[#0f0e0d] rounded-full px-3.5 py-1.5 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DockChip({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-md text-[12.5px] text-[#0f0e0d]/70 hover:text-[#0f0e0d] hover:bg-black/[0.04] transition-colors"
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
      {label}
    </button>
  );
}

function ChatMessage({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-[#0f0e0d] text-white text-[13.5px] leading-relaxed rounded-2xl rounded-br-md px-4 py-2.5">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] bg-white border border-black/[0.06] text-[#0f0e0d] text-[13.5px] leading-relaxed rounded-2xl rounded-bl-md px-4 py-2.5 shadow-[0_1px_2px_rgba(15,14,13,0.03)]">
        <div className="text-[10px] uppercase tracking-[0.14em] text-[#0f0e0d]/40 mb-1">
          Source
        </div>
        {content}
      </div>
    </div>
  );
}
