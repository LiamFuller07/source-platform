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
  Mic,
  CircleDashed,
  Brain,
  Loader2,
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Plan, type PlanTodo } from "@/components/tool-ui/plan";
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
 * Adapted down to the canonical `PlanTodo` shape at the component
 * boundary via `toPlanTodos` below, so the tool-ui component stays
 * pristine.
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

/**
 * A stakeholder call transcript captured during discovery.
 *
 * Used only during the Discovery phase (pre-system-access), where our
 * primary context-gathering mechanism is calls rather than API scans.
 */
type Transcript = {
  id: string;
  role: string; // e.g. "CFO", "Ops lead", "IT lead", "Controller"
  name: string;
  minutes: number;
  source?: "granola" | "zoom" | "manual";
  /** Call date in short form, e.g. "Mar 14". */
  date?: string;
  /** Which stage of discovery this call represented — e.g. "Kickoff",
   *  "Systems deep-dive", "Validation". Shown on the hover preview and
   *  surfaced in the timeline lane summary. */
  stage?: string;
  /** 1–2 sentence synthesis of what came out of the call. */
  summary?: string;
  /** 3–5 verbatim or paraphrased highlights pulled from the transcript. */
  highlights?: string[];
};

/**
 * AI-synthesized analysis across all transcripts for a given project.
 * Shown in the Discovery drill-in alongside the individual transcripts.
 */
type DiscoveryAnalysis = {
  /** Systems the AI has inferred are in scope (explicit + ghost). */
  systemsInScope: { name: string; note?: string; ghost?: boolean }[];
  /** Questions we still need answers to before we can scan. */
  openQuestions: string[];
  /** Recommended next actions — concrete, actionable. */
  recommendedNextSteps: string[];
};

/**
 * A call that's on the calendar but hasn't happened yet. Surfaced on the
 * timeline as an outlined/dashed dot in the future portion of the axis,
 * and inline under each swim-lane so partners can see at a glance when
 * they'll re-engage a client.
 */
type ScheduledCall = {
  id: string;
  role: string;
  name: string;
  /** "Apr 21" shorthand — parsed against the current reference year. */
  date: string;
  /** Optional time-of-day, e.g. "10:30 AM". */
  time?: string;
  /** What this call is intended to cover. Shown in hover + inline. */
  topic?: string;
  /** What stage of discovery this call represents, mirrors Transcript.stage. */
  stage?: string;
};

type DiscoveryContext = {
  transcripts: Transcript[];
  /** Total stakeholders expected to be interviewed before discovery is complete. */
  stakeholdersTarget: number;
  /** Roles we still need to hear from. Empty when coverage is complete. */
  missingStakeholders?: string[];
  /** 1–2 sentence reasoning snippet summarizing what was learned across calls. */
  keyFinding?: string;
  /** Full AI synthesis shown in the expanded drill-in. */
  analysis?: DiscoveryAnalysis;
  /** Next call on the calendar. Absence is itself a signal — a stalled
   *  engagement with incomplete coverage and no scheduled follow-up. */
  nextCall?: ScheduledCall;
  /** One-line status of where discovery stands right now (distinct from
   *  `keyFinding` which summarizes substantive findings). */
  stageSummary?: string;
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
  discovery?: DiscoveryContext;
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
    discovery: {
      transcripts: [
        {
          id: "t1",
          role: "CFO",
          name: "Jane Okafor",
          minutes: 31,
          source: "granola",
          date: "Mar 26",
          stage: "Strategic kickoff",
          summary:
            "Jane wants multi-subsidiary consolidation with intercompany eliminations. Current QBO close takes 9 business days.",
          highlights: [
            "Close currently takes 9 business days — target is 3",
            "Needs subsidiary-level P&L for US Inc and IE Ltd",
            "FX handled manually in spreadsheets today",
            "Board pack auto-generation is a must-have for go-live",
          ],
        },
        {
          id: "t2",
          role: "Ops lead",
          name: "Mark Reyes",
          minutes: 22,
          source: "granola",
          date: "Apr 2",
          stage: "Process deep-dive",
          summary:
            "Mark flagged a Shopify storefront that syncs nightly into QBO via a custom script — not in the original SOW scope.",
          highlights: [
            "Shopify → QBO nightly sync runs off a Zapier workflow",
            "Inventory is tracked in a separate Airtable base",
            "Refunds require manual GL reclass each month",
          ],
        },
        {
          id: "t3",
          role: "IT lead",
          name: "Priya Shah",
          minutes: 17,
          source: "granola",
          date: "Apr 9",
          stage: "Systems alignment",
          summary:
            "Priya confirmed API access rights and OAuth setup is ready. Flagged a legacy ADP payroll integration that feeds GL.",
          highlights: [
            "NetSuite sandbox provisioned, OAuth ready",
            "ADP payroll posts JE to GL 5000–5099 nightly",
            "SSO is Okta — will need scopes for finance role",
          ],
        },
      ],
      stakeholdersTarget: 3,
      keyFinding: "Ghost system flagged · Shopify consumer SOR syncs nightly into QBO",
      stageSummary:
        "All three primary stakeholders have been interviewed across a three-week cadence — kickoff with Jane surfaced the consolidation goal, Mark's process deep-dive uncovered the Shopify ghost system, and Priya confirmed API readiness. One validation call remains before we can move to the Scan step.",
      nextCall: {
        id: "n1",
        role: "CFO",
        name: "Jane Okafor",
        date: "Apr 24",
        time: "10:30 AM",
        stage: "Final validation",
        topic: "FX consolidation rules + intercompany pricing between US Inc and IE Ltd",
      },
      analysis: {
        systemsInScope: [
          { name: "QBO Advanced", note: "Primary GL · 94K records" },
          { name: "Shopify", note: "Consumer SOR · nightly sync", ghost: true },
          { name: "Airtable", note: "Inventory side-car", ghost: true },
          { name: "ADP", note: "Payroll JE nightly" },
          { name: "NetSuite OneWorld", note: "Target ERP" },
        ],
        openQuestions: [
          "Is the Shopify integration expected to survive post-migration, or be replaced by NetSuite SuiteCommerce?",
          "What's the intercompany pricing rule between US Inc and IE Ltd?",
          "Which ADP GL mappings are still active vs. legacy?",
        ],
        recommendedNextSteps: [
          "Request read-only QBO credentials to run the Scan step",
          "Schedule a 20-min follow-up with Jane on FX consolidation rules",
          "Export Airtable schema to assess inventory migration effort",
        ],
      },
    },
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
    discovery: {
      transcripts: [
        {
          id: "t1",
          role: "Controller",
          name: "Dan Whittaker",
          minutes: 28,
          source: "zoom",
          date: "Feb 27",
          stage: "Initial kickoff",
          summary:
            "Dan walked through their current QBO Simple Start setup. Biggest pain: inventory lives in Airtable and is reconciled manually each month.",
          highlights: [
            "Ops runs a side-car Airtable for container-level inventory",
            "Manual month-end reconciliation takes ~14 hours",
            "Wants COGS by shipping lane in NetSuite",
            "No current multi-currency handling — all USD today",
          ],
        },
      ],
      stakeholdersTarget: 3,
      missingStakeholders: ["Ops manager", "CEO or CFO"],
      keyFinding: "NetSuite sandbox access pending · Ops runs side-car Airtable for inventory",
      stageSummary:
        "Only one of three stakeholders engaged so far — Dan's kickoff landed seven weeks ago and momentum stalled on NetSuite sandbox provisioning. An escalation call with the Ops manager is booked to unblock credentials; CFO-level engagement is still unscheduled and is the critical path to restarting discovery.",
      nextCall: {
        id: "n1",
        role: "Ops manager",
        name: "Nora Belmont",
        date: "Apr 28",
        time: "2:00 PM",
        stage: "Escalation",
        topic: "Inventory reconciliation workflow + Airtable ownership · unblock NetSuite sandbox credentials",
      },
      analysis: {
        systemsInScope: [
          { name: "QBO Simple Start", note: "Primary GL · light usage" },
          { name: "Airtable", note: "Inventory side-car", ghost: true },
          { name: "NetSuite", note: "Target ERP · sandbox pending" },
        ],
        openQuestions: [
          "Who owns the Airtable inventory base day-to-day?",
          "Is there an operations stakeholder available for a follow-up call?",
          "Will historical data need to be migrated, or is a cutover-only approach acceptable?",
        ],
        recommendedNextSteps: [
          "Escalate NetSuite sandbox credential request — stalled 41 days",
          "Schedule discovery call with Ops manager (currently missing)",
          "Validate COA approach with CEO or CFO before drafting BRD",
        ],
      },
    },
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
    discovery: {
      transcripts: [
        {
          id: "t1",
          role: "CEO",
          name: "Rafael Ortiz",
          minutes: 24,
          source: "granola",
          date: "Mar 3",
          stage: "Strategic vision",
          summary:
            "Rafael wants clearer visibility into per-taproom margin. Currently everything rolls up as a single P&L.",
          highlights: [
            "Three taprooms plus wholesale — wants each as its own class",
            "Considering opening a fourth location in Q3 2026",
            "Monthly investor report is the forcing function for clean data",
          ],
        },
        {
          id: "t2",
          role: "Finance lead",
          name: "Lena Park",
          minutes: 35,
          source: "granola",
          date: "Mar 5",
          stage: "Systems walkthrough",
          summary:
            "Lena walked through the COA. Taproom POS (Toast) feeds QBO nightly via a batch import — fragile and error-prone.",
          highlights: [
            "Toast POS → QBO nightly batch, breaks ~1x/month",
            "Class tracking exists in QBO but is inconsistently applied",
            "Inventory sits in Ekos (brewery-specific) — not QBO",
            "Excise tax handling needs review against new rules",
          ],
        },
      ],
      stakeholdersTarget: 2,
      keyFinding: "Taproom POS feeds QBO nightly · needs class-based tracking in NetSuite",
      stageSummary:
        "Both stakeholders interviewed in early March with a clean strategic picture of the per-taproom margin goal. Discovery output was packaged as BRD v1 and delivered on Mar 10 — awaiting feedback for 38 days now with no follow-up call booked. This is the most critical stall in the portfolio.",
      // Intentionally no nextCall — the engagement is stalled and nothing
      // is on the calendar. The timeline renders this gap explicitly.
      analysis: {
        systemsInScope: [
          { name: "QBO Plus", note: "Primary GL · class tracking enabled" },
          { name: "Toast POS", note: "Nightly batch feed", ghost: true },
          { name: "Ekos", note: "Brewery inventory & production", ghost: true },
          { name: "NetSuite SuiteSuccess", note: "Target ERP" },
        ],
        openQuestions: [
          "Confirm per-taproom class scheme with Lena before BRD v2",
          "Is Ekos staying post-migration, or folding into NetSuite?",
          "Excise tax: new vs. legacy rules for opening periods?",
        ],
        recommendedNextSteps: [
          "Follow up on BRD v1 feedback — awaiting response 43 days",
          "Export Toast POS integration spec for ghost-system scope",
          "Draft class structure proposal ahead of next finance call",
        ],
      },
    },
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
// —————————————————————————————————————————���——————————————————————

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
// —�����——————————————————————————————————————————————————————————————

function ProjectsView() {
  const [selected, setSelected] = useState<string | null>("atl");

  const implementing = ACTIVE_PROJECTS.filter((p) => p.step >= 7);
  const discovering = ACTIVE_PROJECTS.filter((p) => p.step < 7);

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

      {/* Discovery Phase — pinned to the top. Projects here are still in
          context-gathering: we're tracking stakeholder calls / transcripts
          rather than system scans, because we may not even have access yet. */}
      {discovering.length > 0 && (
        <div className="mt-12">
          <PhaseHeader
            phase="Discovery"
            subtitle="Gathering context via stakeholder calls"
            count={discovering.length}
            projects={discovering}
            variant="discovery"
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

      {/* Implementing Phase — projects past discovery with system access. */}
      {implementing.length > 0 && (
        <div className="mt-12">
          <PhaseHeader
            phase="Implementing"
            subtitle="Scanning, drafting, and delivering"
            count={implementing.length}
            projects={implementing}
            variant="implementing"
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

      <PastMigrations projects={PAST_PROJECTS} />
    </div>
  );
}

// ————————————————————————————————————————————————————————————————
// Discovery Expansion Panel
//
// Rendered when a user expands a Discovery-phase project row. This is the
// primary drill-in for understanding where a pre-implementation engagement
// stands — before we have system access, discovery context is the only
// context. The panel surfaces:
//
//   1. Stakeholder coverage header — who we've heard from, who's missing
//   2. Transcripts column — per-call summary + verbatim highlights
//   3. Synthesis column — systems in scope, open questions, next steps
//   4. Project-scoped chat — ask anything about this specific discovery
//
// The chat is context-scoped to this project's transcripts + analysis, so
// follow-up questions ("what did the CFO say about FX?") can reference
// the specific transcript highlights without extra prompt engineering.
// ————————————————————————————————————————————————————————————————

function DiscoveryExpansionPanel({ project }: { project: Project }) {
  const d = project.discovery!;
  const captured = d.transcripts.length;
  const target = d.stakeholdersTarget;
  const totalMinutes = d.transcripts.reduce((s, t) => s + t.minutes, 0);
  const isComplete = captured >= target;

  return (
    <div className="px-6 pb-6 pt-1">
      {/* Panel header — coverage + totals */}
      <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-black/[0.06]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[#0f0e0d]/45 font-medium">
            <Mic className="w-3 h-3" strokeWidth={2} aria-hidden />
            Discovery
          </div>
          <Separator orientation="vertical" className="h-3 bg-black/[0.1]" />
          <div className="flex items-center gap-1.5 text-[11px] text-[#0f0e0d]/70">
            <span
              className={cn(
                "inline-block w-1.5 h-1.5 rounded-full",
                isComplete ? "bg-[#1e6b3a]" : "bg-[#c78a36]",
              )}
              aria-hidden
            />
            <span className="tabular-nums">
              {captured} of {target} stakeholders
            </span>
          </div>
          <Separator orientation="vertical" className="h-3 bg-black/[0.1]" />
          <span className="text-[11px] text-[#0f0e0d]/70 tabular-nums">
            {totalMinutes}m of recordings
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.14em] text-[#0f0e0d]/35 font-medium">
          AI synthesis · live
        </span>
      </div>

      {/* Body — two columns: transcripts | analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-6">
        <TranscriptsColumn
          transcripts={d.transcripts}
          missing={d.missingStakeholders}
          target={target}
        />
        <AnalysisColumn analysis={d.analysis} keyFinding={d.keyFinding} />
      </div>

      {/* Chat input — scoped to this project's discovery context */}
      <DiscoveryChatInput project={project} />
    </div>
  );
}

function TranscriptsColumn({
  transcripts,
  missing,
  target,
}: {
  transcripts: Transcript[];
  missing?: string[];
  target: number;
}) {
  const gapCount = Math.max(0, target - transcripts.length);

  return (
    <div className="min-w-0">
      <SectionLabel icon={FileText} label="Transcripts" count={transcripts.length} />
      <Accordion
        type="multiple"
        defaultValue={[transcripts[0]?.id].filter(Boolean) as string[]}
        className="mt-2 flex flex-col gap-2"
      >
        {transcripts.map((t) => (
          <AccordionItem
            key={t.id}
            value={t.id}
            className="rounded-md border border-black/[0.06] bg-white overflow-hidden"
          >
            <AccordionTrigger className="px-3 py-2.5 hover:no-underline hover:bg-[#fafaf8] [&[data-state=open]]:border-b [&[data-state=open]]:border-black/[0.06]">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1e6b3a] flex-shrink-0" />
                <span className="text-[12px] font-medium text-[#0f0e0d] truncate">
                  {t.role} · {t.name}
                </span>
                <span className="text-[10.5px] text-[#0f0e0d]/45 tabular-nums flex-shrink-0">
                  {t.minutes}m
                </span>
                {t.date && (
                  <>
                    <Separator
                      orientation="vertical"
                      className="h-2.5 bg-black/[0.1]"
                    />
                    <span className="text-[10.5px] text-[#0f0e0d]/45">
                      {t.date}
                    </span>
                  </>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pt-2.5 pb-3">
              {t.summary && (
                <p className="text-[12px] text-[#0f0e0d]/75 leading-relaxed mb-2.5">
                  {t.summary}
                </p>
              )}
              {t.highlights && t.highlights.length > 0 && (
                <>
                  <div className="text-[9.5px] uppercase tracking-[0.14em] text-[#0f0e0d]/40 font-medium mb-1.5">
                    Highlights
                  </div>
                  <ul className="flex flex-col gap-1">
                    {t.highlights.map((h, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-[11.5px] text-[#0f0e0d]/75 leading-snug"
                      >
                        <span
                          className="text-[#0f0e0d]/30 flex-shrink-0"
                          aria-hidden
                        >
                          ·
                        </span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <div className="mt-3 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[#0f0e0d]/35 font-medium">
                Source · {t.source ?? "granola"}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}

        {/* Missing-stakeholder placeholders */}
        {Array.from({ length: gapCount }).map((_, i) => (
          <div
            key={`missing-${i}`}
            className="rounded-md border border-dashed border-[#c78a36]/40 bg-[#fbf2e1]/30 px-3 py-2 flex items-center gap-2"
          >
            <CircleDashed
              className="w-3 h-3 text-[#c78a36]"
              strokeWidth={2}
              aria-hidden
            />
            <span className="text-[11.5px] text-[#c78a36] font-medium">
              {missing?.[i] ?? "Stakeholder needed"}
            </span>
            <span className="ml-auto text-[10px] uppercase tracking-[0.14em] text-[#c78a36]/70 font-medium">
              Schedule call
            </span>
          </div>
        ))}
      </Accordion>
    </div>
  );
}

function AnalysisColumn({
  analysis,
  keyFinding,
}: {
  analysis?: DiscoveryAnalysis;
  keyFinding?: string;
}) {
  if (!analysis) {
    return (
      <div className="min-w-0">
        <SectionLabel icon={Brain} label="Analysis" />
        {keyFinding && (
          <p className="mt-2 text-[12px] italic text-[#0f0e0d]/60 leading-snug">
            {keyFinding}
          </p>
        )}
        <p className="mt-3 text-[11.5px] text-[#0f0e0d]/45">
          Further analysis will generate once more transcripts are captured.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 flex flex-col gap-4">
      <SectionLabel icon={Brain} label="Analysis" />

      {keyFinding && (
        <div className="rounded-md bg-[#fafaf8] border border-black/[0.05] px-3 py-2.5">
          <div className="text-[9.5px] uppercase tracking-[0.14em] text-[#0f0e0d]/40 font-medium mb-1">
            Key finding
          </div>
          <p className="text-[12px] italic text-[#0f0e0d]/80 leading-snug">
            {keyFinding}
          </p>
        </div>
      )}

      <AnalysisBlock
        label="Systems in scope"
        count={analysis.systemsInScope.length}
      >
        <ul className="flex flex-col gap-1.5">
          {analysis.systemsInScope.map((s, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-[11.5px] text-[#0f0e0d]/80"
            >
              <span className="font-medium text-[#0f0e0d]">{s.name}</span>
              {s.note && (
                <>
                  <Separator
                    orientation="vertical"
                    className="h-2.5 bg-black/[0.1]"
                  />
                  <span className="text-[#0f0e0d]/55 truncate">{s.note}</span>
                </>
              )}
              {s.ghost && (
                <span className="ml-auto inline-flex items-center gap-1 text-[9.5px] uppercase tracking-[0.12em] text-[#8a5a12] bg-[#fbf2e1] border border-[#ecd6a8] rounded-full px-1.5 py-0.5 font-medium flex-shrink-0">
                  Ghost
                </span>
              )}
            </li>
          ))}
        </ul>
      </AnalysisBlock>

      <AnalysisBlock
        label="Open questions"
        count={analysis.openQuestions.length}
      >
        <ul className="flex flex-col gap-1.5">
          {analysis.openQuestions.map((q, i) => (
            <li
              key={i}
              className="flex gap-2 text-[11.5px] text-[#0f0e0d]/75 leading-snug"
            >
              <span
                className="text-[#c78a36] font-medium flex-shrink-0 tabular-nums"
                aria-hidden
              >
                {i + 1}.
              </span>
              <span>{q}</span>
            </li>
          ))}
        </ul>
      </AnalysisBlock>

      <AnalysisBlock
        label="Recommended next steps"
        count={analysis.recommendedNextSteps.length}
      >
        <ul className="flex flex-col gap-1.5">
          {analysis.recommendedNextSteps.map((s, i) => (
            <li
              key={i}
              className="flex gap-2 text-[11.5px] text-[#0f0e0d]/75 leading-snug"
            >
              <ArrowRight
                className="w-3 h-3 text-[#0f0e0d]/40 flex-shrink-0 mt-0.5"
                strokeWidth={2}
                aria-hidden
              />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </AnalysisBlock>
    </div>
  );
}

function AnalysisBlock({
  label,
  count,
  children,
}: {
  label: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[9.5px] uppercase tracking-[0.14em] text-[#0f0e0d]/40 font-medium">
          {label}
        </span>
        {typeof count === "number" && (
          <span className="text-[9.5px] font-mono text-[#0f0e0d]/35 tabular-nums">
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function SectionLabel({
  icon: Icon,
  label,
  count,
}: {
  icon: typeof Mic;
  label: string;
  count?: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[#0f0e0d]/45 font-medium">
        <Icon className="w-3 h-3" strokeWidth={2} aria-hidden />
        {label}
      </div>
      {typeof count === "number" && (
        <span className="text-[10px] font-mono text-[#0f0e0d]/40 tabular-nums">
          {count}
        </span>
      )}
    </div>
  );
}

/**
 * Project-scoped chat input for asking questions about this specific
 * discovery. The UX intent is that an engagement partner can pull up a
 * project and ask things like "what did the CFO say about FX handling?"
 * or "draft a follow-up email summarizing what we know" — scoped to the
 * transcripts + analysis already loaded into the panel.
 *
 * Non-wired in this scaffold: the submit handler is local state only.
 * When wiring to a real backend, pass `project.discovery` as context in
 * the system prompt so responses can cite specific transcripts.
 */
function DiscoveryChatInput({ project }: { project: Project }) {
  const [value, setValue] = useState("");
  const [isPending, setIsPending] = useState(false);

  const suggestions = [
    "Summarize what each stakeholder said",
    "What are the biggest risks we've surfaced?",
    "Draft a follow-up email to fill the gaps",
  ];

  const handleSubmit = () => {
    if (!value.trim()) return;
    setIsPending(true);
    // Scaffold: no network call, just visually acknowledge + clear.
    setTimeout(() => {
      setValue("");
      setIsPending(false);
    }, 600);
  };

  return (
    <div className="mt-5 pt-5 border-t border-black/[0.06]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[#0f0e0d]/45 font-medium">
          <MessageSquare className="w-3 h-3" strokeWidth={2} aria-hidden />
          Ask about this discovery
        </div>
        <span className="text-[10px] text-[#0f0e0d]/35">
          Scoped to {project.company}
        </span>
      </div>

      <div className="rounded-lg border border-black/[0.08] bg-white focus-within:border-black/[0.2] transition-colors">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={`Ask anything about ${project.company}'s discovery…`}
          rows={2}
          disabled={isPending}
          className="w-full resize-none bg-transparent px-3 py-2.5 text-[12.5px] text-[#0f0e0d] placeholder:text-[#0f0e0d]/35 outline-none leading-relaxed"
        />
        <div className="flex items-center justify-between gap-2 px-2 pb-2">
          <div className="flex items-center gap-1 flex-wrap">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setValue(s)}
                disabled={isPending}
                className="text-[10.5px] text-[#0f0e0d]/55 bg-[#fafaf8] hover:bg-black/[0.05] hover:text-[#0f0e0d] border border-black/[0.06] rounded-full px-2 py-0.5 transition-colors disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!value.trim() || isPending}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#0f0e0d] text-white px-3 py-1.5 text-[11px] font-medium hover:bg-[#0f0e0d]/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
            ) : (
              <>
                Send
                <ArrowRight className="w-3 h-3" strokeWidth={2} />
              </>
            )}
          </button>
        </div>
      </div>
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

/**
 * Inline reasoning panel rendered inside an expanded ProjectRow.
 *
 * Uses the authentic `@tool-ui/plan` `Plan.Compact` for the step list (so we
 * get the real step icons, connector line, shimmer on in-progress rows, and
 * celebration animation for free) but overrides the default shadcn `<Card>`
 * chrome to sit directly on the row's own background:
 *   - `border-0 shadow-none bg-transparent` — no nested card
 *   - `max-w-none min-w-0 w-full` — override Plan's default `max-w-xl min-w-80`
 *   - `py-0 gap-0` — collapse Card's internal vertical padding (we own it)
 *
 * A compact header above the Plan provides the "LIVE REASONING · 2/4" eyebrow
 * and progress bar (we keep these outside the Plan so Plan.Compact stays
 * pristine in its tight list-only mode), and any steps with a `tool` chip
 * surface in a right-aligned summary below the timeline.
 */
/**
 * className overrides that scale `Plan.Compact`'s default sizing down to
 * match the dashboard's dense row density.
 *
 * We do NOT modify the upstream `@tool-ui/plan` source — these overrides
 * target the component's stable DOM structure:
 *   - status bubble: the only `span.rounded-full` inside the Plan
 *   - connector:     the only `.bg-border` with `w-px`
 *   - label:         the `.flex-1 > span`
 *
 * Strips the outer Card chrome and replaces the default
 * `size-6` / `text-sm leading-6` / `py-1.5` rhythm with a
 * `size-4` / `text-[12px] leading-4` / `py-0.5` rhythm — roughly half
 * the vertical footprint per row.
 *
 * Connector repositioning math:
 *   Original (size-6 bubble, py-1.5):
 *     bubble center x=20px, bubble bottom y=30px → top-6 (24), left-5 (20)
 *   Dense   (size-4 bubble, py-0.5):
 *     bubble center x=16px, bubble bottom y=18px → top-4 (16), left-4 (16)
 */
const DENSE_PLAN_CLASS = cn(
  // Strip the outer shadcn Card chrome so the Plan sits inline on the row bg.
  "max-w-none min-w-0 w-full border-0 bg-transparent shadow-none py-0 gap-0",
  // Kill padding inside the CardContent wrapper too.
  "[&>[data-slot=card-content]]:px-0",
  // Tighten the <ul> vertical rhythm.
  "[&_ul]:space-y-0 [&_ul]:mt-0",
  // Shrink each <li> row: less padding, smaller gap.
  "[&_li]:py-0.5 [&_li]:gap-2.5",
  // Shrink status bubble from 24px → 16px.
  "[&_li_span.rounded-full]:size-4",
  // Shrink the icon inside the bubble (Loader2 / Check) proportionally.
  "[&_li_span.rounded-full_svg]:size-2.5",
  // Shrink the label text to match dashboard density.
  "[&_li_.flex-1>span]:text-[12px] [&_li_.flex-1>span]:leading-4",
  // Reposition the vertical connector to center on the smaller bubble.
  "[&_li_.bg-border]:top-4 [&_li_.bg-border]:left-4",
);

function ReasoningPanel({ steps }: { steps: ReasoningStep[] }) {
  const todos = toPlanTodos(steps);
  const completedCount = steps.filter((s) => s.status === "completed").length;
  const totalCount = steps.length;
  const progress =
    totalCount === 0
      ? 0
      : Math.round((completedCount / totalCount) * 100);
  const toolsUsed = steps
    .filter((s) => s.tool && s.status !== "pending")
    .map((s) => ({ id: s.id, tool: s.tool! }));

  return (
    <div className="px-6 pb-5 pt-1.5">
      {/* Compact header — sits on the row's own bg (no nested card) */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[#0f0e0d]/45 font-medium">
          <Activity className="w-3 h-3" strokeWidth={2} aria-hidden />
          Live Reasoning
        </div>
        <div className="text-[10px] font-mono text-[#0f0e0d]/50 tabular-nums">
          {completedCount} / {totalCount} complete
        </div>
      </div>

      {/* Thin progress bar */}
      <div
        className="h-[2px] bg-black/[0.08] rounded-full overflow-hidden mb-2.5"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div
          className="h-full bg-[#0f0e0d] rounded-full transition-[width] duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Authentic tool-ui Plan, chrome-stripped + densified via className.
          The upstream component source is untouched. */}
      <Plan.Compact
        id={`reasoning-${steps[0]?.id ?? "empty"}`}
        todos={todos}
        maxVisibleTodos={todos.length}
        className={DENSE_PLAN_CLASS}
      />

      {/* Tool summary — shown once below the timeline rather than inline so
          rows stay visually consistent (inline descriptions would trigger
          the Plan's Collapsible path and break the step connector). */}
      {toolsUsed.length > 0 && (
        <div className="mt-2.5 pt-2.5 border-t border-black/[0.06] flex items-center gap-1.5 flex-wrap">
          <span className="text-[9.5px] uppercase tracking-[0.14em] text-[#0f0e0d]/40 font-medium mr-0.5">
            Tools
          </span>
          {toolsUsed.map(({ id, tool }) => (
            <ToolChip key={id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}

function ToolChip({ tool }: { tool: NonNullable<ReasoningStep["tool"]> }) {
  const meta = TOOL_KIND_META[tool.kind];
  const Icon = meta.Icon;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-2 py-0.5 text-[10.5px] text-[#0f0e0d] leading-5">
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
  subtitle,
  count,
  projects,
  variant,
}: {
  phase: string;
  subtitle?: string;
  count: number;
  projects: Project[];
  variant: "discovery" | "implementing";
}) {
  const aggregate = Math.round(
    (projects.reduce((sum, p) => sum + p.step, 0) / (projects.length * 12)) *
      100,
  );

  // Discovery phase has its own KPI: total transcripts captured.
  const totalTranscripts = projects.reduce(
    (sum, p) => sum + (p.discovery?.transcripts.length ?? 0),
    0,
  );

  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="font-serif text-[28px] font-normal leading-[1] tracking-[-0.01em] text-[#0f0e0d]">
            {phase}
          </h2>
          <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-[#0f0e0d]/45">
            {count} Project{count !== 1 ? "s" : ""}
            {variant === "discovery" && totalTranscripts > 0
              ? ` · ${totalTranscripts} Transcripts captured`
              : ` · ${aggregate}% complete`}
          </p>
          {subtitle && (
            <p className="mt-1 text-[13px] text-[#0f0e0d]/55">{subtitle}</p>
          )}
        </div>
      </div>

      {variant === "discovery" ? (
        <DiscoveryTracker projects={projects} />
      ) : (
        // Per-project milestone strip for implementing projects
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
      )}
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
// Discovery Tracker — replaces the MilestoneStrip for discovery projects
//
// Summarizes where each pre-implementation project is in the context-
// gathering process: stakeholder coverage, transcripts captured from each
// call (role + duration, hover for participant name), and the AI's
// synthesized finding across those conversations.
//
// Projects live here until they move into implementation — this isn't
// about system access or credentials, just about whether the engagement
// has crossed the implementation threshold yet.
// ————————————————————————————————————————————————————————————————

function DiscoveryTracker({ projects }: { projects: Project[] }) {
  return (
    <div className="mt-4 rounded-lg border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(15,14,13,0.02)] overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-black/[0.05]">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[#0f0e0d]/45 font-medium">
          <Mic className="h-3 w-3" strokeWidth={2} aria-hidden />
          Discovery Tracker
        </div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-[#0f0e0d]/35 font-medium">
          Source · Granola
        </div>
      </div>

      {/* Unified call timeline across all discovery projects — gives an
          at-a-glance view of when stakeholder calls have been collected,
          cadence, and coverage gaps. Sits above the per-project rows. */}
      <DiscoveryTimeline projects={projects} />

      <ul className="divide-y divide-black/[0.05] border-t border-black/[0.05]">
        {projects.map((p) => (
          <li key={p.id} className="px-4 py-3.5">
            <DiscoveryRow project={p} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A horizontal swim-lane timeline showing every discovery call across all
 * active discovery projects on a single date axis. Each project is a lane,
 * each call a dot positioned by its call date, with a trailing line from
 * the most recent call to "today" when coverage is incomplete (signalling
 * a gap that needs a follow-up call).
 *
 * The chart intentionally uses absolute positioning with percentage-based
 * offsets against a normalized [minDate → today] range so lanes stay in
 * sync across all projects without any layout thrash.
 */
function DiscoveryTimeline({ projects }: { projects: Project[] }) {
  // Reference "today" matches the system locale pinned at the top of this
  // chat (4/17/2026). Using a fixed reference keeps the demo deterministic.
  const TODAY = new Date("2026-04-17");
  const DAY = 24 * 60 * 60 * 1000;

  // Parse "Mar 11" style dates into a Date in the current year.
  const parseDate = (s?: string): Date | null => {
    if (!s) return null;
    const d = new Date(`${s} ${TODAY.getFullYear()}`);
    return isNaN(d.getTime()) ? null : d;
  };

  // Collect every past call with a parsed date.
  const pastCalls = projects.flatMap((p) =>
    (p.discovery?.transcripts ?? [])
      .map((t) => ({
        projectId: p.id,
        company: p.company,
        transcript: t,
        date: parseDate(t.date),
      }))
      .filter((c): c is typeof c & { date: Date } => c.date !== null),
  );

  // Collect every scheduled future call.
  const futureCalls = projects.flatMap((p) => {
    const n = p.discovery?.nextCall;
    if (!n) return [];
    const date = parseDate(n.date);
    if (!date) return [];
    return [{ projectId: p.id, company: p.company, call: n, date }];
  });

  if (pastCalls.length === 0) return null;

  // Normalize the time axis:
  //   left edge  = earliest call - 4d pad
  //   right edge = max(today, latest scheduled call) + 4d pad
  // This keeps past context visible while making room for future calls.
  const rawMin = Math.min(...pastCalls.map((c) => c.date.getTime()));
  const rawMaxFuture = futureCalls.length
    ? Math.max(...futureCalls.map((c) => c.date.getTime()))
    : TODAY.getTime();
  const rawMax = Math.max(TODAY.getTime(), rawMaxFuture);

  const minMs = rawMin - 4 * DAY;
  const maxMs = rawMax + 4 * DAY;
  const rangeMs = Math.max(1, maxMs - minMs);
  const pctOf = (d: Date) => ((d.getTime() - minMs) / rangeMs) * 100;
  const todayPct = pctOf(TODAY);

  // Month tick marks between min and max.
  const ticks: { label: string; pct: number }[] = [];
  const cursor = new Date(minMs);
  cursor.setDate(1);
  cursor.setHours(0, 0, 0, 0);
  cursor.setMonth(cursor.getMonth() + 1);
  while (cursor.getTime() < maxMs) {
    ticks.push({
      label: cursor.toLocaleString("en-US", { month: "short" }),
      pct: ((cursor.getTime() - minMs) / rangeMs) * 100,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const todayLabel = TODAY.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
  });
  const minLabel = new Date(rawMin).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
  });
  const maxLabel = new Date(rawMax).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="px-4 pt-3 pb-4 bg-[#fafaf8]/60">
      {/* Eyebrow: label + legend + date range */}
      <div className="flex items-center justify-between gap-4 mb-2.5">
        <div className="flex items-center gap-3">
          <div className="text-[10px] uppercase tracking-[0.14em] text-[#0f0e0d]/45 font-medium">
            Call Timeline
          </div>
          <Separator orientation="vertical" className="h-3 bg-black/[0.08]" />
          <div className="flex items-center gap-2.5 text-[9.5px] text-[#0f0e0d]/50">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#1e6b3a]" />
              Completed
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full border border-dashed border-[#1e6b3a] bg-white" />
              Scheduled
            </span>
          </div>
        </div>
        <div className="text-[10px] text-[#0f0e0d]/45 tabular-nums">
          {minLabel} &mdash; {maxLabel}
        </div>
      </div>

      <div className="grid grid-cols-[160px_minmax(0,1fr)] gap-3">
        {/* Spacer above lane labels so the axis aligns with the first lane's top */}
        <div />
        {/* Date axis with month ticks + today marker */}
        <div className="relative h-3.5 mb-1">
          <div className="absolute inset-x-0 top-1/2 h-px bg-black/[0.08]" />
          {ticks.map((t) => (
            <div
              key={t.label + t.pct}
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center gap-0.5"
              style={{ left: `${t.pct}%` }}
            >
              <div className="w-px h-2 bg-black/[0.15]" />
              <span className="text-[9px] uppercase tracking-[0.12em] text-[#0f0e0d]/40 font-medium">
                {t.label}
              </span>
            </div>
          ))}
          {/* Today label above axis */}
          <div
            className="absolute -top-0.5 -translate-x-1/2"
            style={{ left: `${todayPct}%` }}
          >
            <span className="text-[9px] uppercase tracking-[0.12em] text-[#1e6b3a] font-semibold bg-[#fafaf8]/60 px-1">
              Today
            </span>
          </div>
        </div>

        {/* One row per project. The "today" vertical line is drawn inside
            each lane so it lines up pixel-perfect with the dots above/below. */}
        {projects.map((p) => {
          const d = p.discovery;
          if (!d) return null;
          const projectPastCalls = pastCalls.filter((c) => c.projectId === p.id);
          if (projectPastCalls.length === 0) return null;
          const lastCall = projectPastCalls.reduce((a, b) =>
            a.date.getTime() > b.date.getTime() ? a : b,
          );
          const nextCallDate = d.nextCall ? parseDate(d.nextCall.date) : null;
          const captured = d.transcripts.length;
          const isComplete = captured >= d.stakeholdersTarget;

          return (
            <TimelineLane
              key={p.id}
              project={p}
              calls={projectPastCalls}
              lastCallPct={pctOf(lastCall.date)}
              pctOf={pctOf}
              isComplete={isComplete}
              todayPct={todayPct}
              nextCall={d.nextCall}
              nextCallDate={nextCallDate}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * A single swim-lane showing one project's calls on the timeline axis.
 * Renders a light baseline track, one dot per call (sized slightly by
 * duration), and a dashed trailing segment from the most recent call to
 * the right edge when the project still needs more stakeholders.
 */
function TimelineLane({
  project,
  calls,
  lastCallPct,
  pctOf,
  isComplete,
  todayPct,
  nextCall,
  nextCallDate,
}: {
  project: Project;
  calls: {
    projectId: string;
    company: string;
    transcript: Transcript;
    date: Date;
  }[];
  lastCallPct: number;
  pctOf: (d: Date) => number;
  isComplete: boolean;
  todayPct: number;
  nextCall?: ScheduledCall;
  nextCallDate: Date | null;
}) {
  const d = project.discovery!;
  const firstCall = calls.reduce((a, b) => (a.date < b.date ? a : b));
  const lastCall = calls.reduce((a, b) => (a.date > b.date ? a : b));
  const hasNext = !!(nextCall && nextCallDate);
  const nextPct = hasNext ? pctOf(nextCallDate!) : null;

  return (
    <>
      {/* Left: project label + coverage + stage summary */}
      <div className="flex flex-col justify-center min-w-0 py-2">
        <div className="text-[11.5px] font-medium text-[#0f0e0d] truncate leading-tight">
          {project.company}
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <span
            className={cn(
              "inline-block w-1.5 h-1.5 rounded-full",
              isComplete ? "bg-[#1e6b3a]" : "bg-[#c78a36]",
            )}
            aria-hidden
          />
          <span className="text-[9.5px] text-[#0f0e0d]/55 tabular-nums">
            {d.transcripts.length}/{d.stakeholdersTarget} stakeholders
          </span>
        </div>
      </div>

      {/* Right: lane track + call dots + today divider + next call */}
      <div className="relative h-11 py-2">
        {/* Baseline track — subtle, always visible */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-black/[0.06]" />

        {/* Vertical "today" divider — spans the full lane height */}
        <div
          className="absolute top-0 bottom-0 w-px bg-[#1e6b3a]/25"
          style={{ left: `${todayPct}%` }}
          aria-hidden
        />

        {/* Solid past-call segment between first and last captured call */}
        {calls.length > 1 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 h-[1.5px] bg-[#1e6b3a]/35 rounded-full"
            style={{
              left: `${pctOf(firstCall.date)}%`,
              width: `${pctOf(lastCall.date) - pctOf(firstCall.date)}%`,
            }}
            aria-hidden
          />
        )}

        {/* Segment from last past call → next scheduled call (dashed green
            if a next call is booked, dashed amber if nothing is booked and
            coverage is incomplete). */}
        {hasNext && (
          <div
            className="absolute top-1/2 -translate-y-1/2 h-0 border-t border-dashed border-[#1e6b3a]/50"
            style={{
              left: `${lastCallPct}%`,
              width: `${Math.max(0, nextPct! - lastCallPct)}%`,
            }}
            aria-hidden
          />
        )}
        {!hasNext && !isComplete && (
          <div
            className="absolute top-1/2 -translate-y-1/2 h-0 border-t border-dashed border-[#c78a36]/60"
            style={{
              left: `${lastCallPct}%`,
              right: 0,
            }}
            aria-hidden
          />
        )}

        {/* Past call dots */}
        {calls.map(({ transcript, date }) => (
          <TimelineCallDot
            key={transcript.id}
            transcript={transcript}
            date={date}
            leftPct={pctOf(date)}
          />
        ))}

        {/* Future scheduled call dot (outlined) */}
        {hasNext && (
          <TimelineScheduledDot
            call={nextCall!}
            date={nextCallDate!}
            leftPct={nextPct!}
          />
        )}

        {/* Status pill on the right edge.
            - If next call booked: show "Next" pill (green, dashed outline)
            - If incomplete and no next call: show "Stalled" pill (amber) */}
        {hasNext ? (
          <HoverCard openDelay={120} closeDelay={80}>
            <HoverCardTrigger asChild>
              <button
                type="button"
                className="absolute top-1/2 -translate-y-1/2 right-0 inline-flex items-center gap-1 h-[18px] rounded-full border border-dashed border-[#1e6b3a]/60 bg-white px-1.5 text-[9px] uppercase tracking-[0.1em] text-[#1e6b3a] font-medium hover:border-[#1e6b3a] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e6b3a]/30"
              >
                Next · {nextCall!.date}
                {nextCall!.time && (
                  <span className="text-[#1e6b3a]/60">· {nextCall!.time}</span>
                )}
              </button>
            </HoverCardTrigger>
            <HoverCardContent
              side="top"
              align="end"
              className="w-64 p-0 border-black/[0.08] shadow-[0_8px_24px_rgba(15,14,13,0.08)]"
            >
              <NextCallHoverBody call={nextCall!} />
            </HoverCardContent>
          </HoverCard>
        ) : (
          !isComplete && (
            <span className="absolute top-1/2 -translate-y-1/2 right-0 inline-flex items-center gap-1 h-[18px] rounded-full border border-dashed border-[#c78a36]/60 bg-white px-1.5 text-[9px] uppercase tracking-[0.1em] text-[#c78a36] font-medium">
              <CircleDashed className="h-2.5 w-2.5" strokeWidth={2.25} aria-hidden />
              {d.stakeholdersTarget - d.transcripts.length} needed
            </span>
          )
        )}

        {/* Bottom-row stage summary — tucked below the track so it's
            available at a glance without crowding the dots. */}
        {d.stageSummary && (
          <div className="absolute left-0 right-0 -bottom-0.5 text-[9.5px] text-[#0f0e0d]/45 italic leading-tight truncate">
            {d.stageSummary}
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Future scheduled call — rendered as an outlined circle with a dashed
 * ring so it visually contrasts with completed (filled) past calls.
 */
function TimelineScheduledDot({
  call,
  date,
  leftPct,
}: {
  call: ScheduledCall;
  date: Date;
  leftPct: number;
}) {
  const dateLabel = date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border border-dashed border-[#1e6b3a] bg-white ring-2 ring-white hover:border-[#1e6b3a] hover:bg-[#eaf3ec] transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1e6b3a]/30"
          style={{ left: `${leftPct}%` }}
          aria-label={`Scheduled: ${call.role} call on ${dateLabel}`}
        >
          <span className="sr-only">Scheduled call with {call.name}</span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="center"
        className="w-64 p-0 border-black/[0.08] shadow-[0_8px_24px_rgba(15,14,13,0.08)]"
      >
        <NextCallHoverBody call={call} />
      </HoverCardContent>
    </HoverCard>
  );
}

function NextCallHoverBody({ call }: { call: ScheduledCall }) {
  return (
    <div className="p-3">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[10px] uppercase tracking-[0.14em] text-[#1e6b3a] font-semibold">
          Scheduled · {call.role}
        </span>
        <span className="text-[10px] uppercase tracking-[0.14em] text-[#0f0e0d]/35 font-medium tabular-nums">
          {call.date}
          {call.time ? ` · ${call.time}` : ""}
        </span>
      </div>
      <div className="text-[13px] font-semibold text-[#0f0e0d] leading-tight">
        {call.name}
      </div>
      {call.topic && (
        <p className="mt-2 pt-2 border-t border-black/[0.06] text-[11px] text-[#0f0e0d]/70 leading-snug">
          {call.topic}
        </p>
      )}
    </div>
  );
}

/**
 * A single call dot on the timeline. Size scales subtly with call duration
 * (longer calls = denser context = larger dot) to give a quick sense of
 * call weight at a glance. Hover reveals role + name + duration.
 */
function TimelineCallDot({
  transcript,
  date,
  leftPct,
}: {
  transcript: Transcript;
  date: Date;
  leftPct: number;
}) {
  // Scale dot size by duration: 15m → 10px, 40m → 16px
  const size = Math.max(10, Math.min(16, 8 + transcript.minutes / 4));
  const dateLabel = date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center rounded-full bg-[#1e6b3a] ring-2 ring-white hover:ring-[#1e6b3a]/20 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1e6b3a]/30"
          style={{
            left: `${leftPct}%`,
            width: `${size}px`,
            height: `${size}px`,
          }}
          aria-label={`${transcript.role} call on ${dateLabel}, ${transcript.minutes} minutes`}
        >
          <span className="sr-only">{transcript.role}</span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="center"
        className="w-56 p-0 border-black/[0.08] shadow-[0_8px_24px_rgba(15,14,13,0.08)]"
      >
        <div className="p-3">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#0f0e0d]/45 font-medium">
              {transcript.role}
            </span>
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#0f0e0d]/35 font-medium tabular-nums">
              {dateLabel}
            </span>
          </div>
          <div className="text-[13px] font-semibold text-[#0f0e0d] leading-tight">
            {transcript.name}
          </div>
          <div className="mt-0.5 text-[11px] text-[#0f0e0d]/55 tabular-nums">
            {transcript.minutes} min · {transcript.source ?? "granola"}
          </div>
          {transcript.summary && (
            <p className="mt-2 pt-2 border-t border-black/[0.06] text-[11px] text-[#0f0e0d]/70 leading-snug">
              {transcript.summary}
            </p>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function DiscoveryRow({ project }: { project: Project }) {
  const d = project.discovery;
  if (!d) {
    // Fallback for discovery projects that somehow have no call data yet.
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="text-[13px] font-medium text-[#0f0e0d] truncate">
          {project.company}
        </div>
        <div className="text-[11px] text-[#0f0e0d]/45">No transcripts yet</div>
      </div>
    );
  }

  const captured = d.transcripts.length;
  const target = d.stakeholdersTarget;
  const isComplete = captured >= target;

  return (
    <div className="grid grid-cols-[minmax(0,200px)_1fr] gap-4 items-start">
      {/* LEFT: company + stakeholder coverage summary */}
      <div className="min-w-0 flex flex-col gap-1">
        <div className="text-[13px] font-medium text-[#0f0e0d] truncate leading-tight">
          {project.company}
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-block w-1.5 h-1.5 rounded-full",
              isComplete ? "bg-[#1e6b3a]" : "bg-[#c78a36]",
            )}
            aria-hidden
          />
          <span className="text-[10.5px] text-[#0f0e0d]/55 tabular-nums">
            {captured} of {target} stakeholders
          </span>
        </div>
      </div>

      {/* RIGHT: transcript chips + next call + AI finding */}
      <div className="min-w-0 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {d.transcripts.map((t) => (
            <TranscriptChip key={t.id} transcript={t} />
          ))}
          {d.nextCall && <NextCallChip call={d.nextCall} />}
          {Array.from({ length: Math.max(0, target - captured) }).map(
            (_, i) => (
              <span
                key={`missing-${i}`}
                className="inline-flex items-center gap-1 h-[22px] rounded-full border border-dashed border-[#c78a36]/50 bg-[#fbf2e1]/40 px-2 text-[10.5px] text-[#c78a36]"
              >
                <CircleDashed className="h-3 w-3" strokeWidth={2} aria-hidden />
                Needed
              </span>
            ),
          )}
        </div>
        {d.keyFinding && (
          <p className="text-[11.5px] italic text-[#0f0e0d]/60 leading-snug">
            <span className="not-italic text-[9.5px] uppercase tracking-[0.14em] text-[#0f0e0d]/35 mr-1.5 font-medium">
              Finding
            </span>
            {d.keyFinding}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Pill representing an upcoming scheduled call in the per-project row.
 * Outlined/dashed to visually distinguish from completed transcript chips.
 */
function NextCallChip({ call }: { call: ScheduledCall }) {
  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-[22px] rounded-full border border-dashed border-[#1e6b3a]/50 bg-white px-2 text-[10.5px] text-[#1e6b3a] leading-none hover:border-[#1e6b3a] hover:bg-[#eaf3ec]/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e6b3a]/30"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full border border-[#1e6b3a]" />
          <span className="font-medium">Next · {call.role}</span>
          <Separator
            orientation="vertical"
            className="h-2.5 bg-[#1e6b3a]/20"
          />
          <span className="tabular-nums text-[#1e6b3a]/70">
            {call.date}
            {call.time ? ` · ${call.time}` : ""}
          </span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="start"
        className="w-64 p-0 border-black/[0.08] shadow-[0_8px_24px_rgba(15,14,13,0.08)]"
      >
        <NextCallHoverBody call={call} />
      </HoverCardContent>
    </HoverCard>
  );
}

function TranscriptChip({ transcript }: { transcript: Transcript }) {
  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-[22px] rounded-full border border-black/[0.08] bg-white px-2 text-[10.5px] text-[#0f0e0d] leading-none hover:border-black/[0.18] hover:bg-[#fafaf8] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1e6b3a]" />
          <span className="font-medium">{transcript.role}</span>
          <Separator
            orientation="vertical"
            className="h-2.5 bg-black/[0.1]"
          />
          <span className="tabular-nums text-[#0f0e0d]/60">
            {transcript.minutes}m
          </span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="start"
        className="w-60 p-0 border-black/[0.08] shadow-[0_8px_24px_rgba(15,14,13,0.08)]"
      >
        <div className="p-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#0f0e0d]/45 font-medium">
              Transcript
            </span>
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#0f0e0d]/35 font-medium">
              {transcript.source ?? "granola"}
            </span>
          </div>
          <div className="text-[13px] font-semibold text-[#0f0e0d] leading-tight">
            {transcript.name}
          </div>
          <div className="mt-0.5 text-[11.5px] text-[#0f0e0d]/60">
            {transcript.role} · {transcript.minutes} min
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
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

      {active &&
        (project.discovery ? (
          <DiscoveryExpansionPanel project={project} />
        ) : project.reasoning ? (
          <ReasoningPanel steps={project.reasoning} />
        ) : null)}
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

// ——————————————————————————————————————————��—————————————————————
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
