"use client";

import { useState, useRef, useEffect } from "react";
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

// ————————————————————————————————————————————————————————————————
// Data
// ————————————————————————————————————————————————————————————————

type Project = {
  id: string;
  company: string;
  systems: string; // e.g. "QBO ADVANCED → NETSUITE ONEWORLD"
  status: string;
  step: number; // 1-12
  stepsTotal: number; // always 12
  stalledFor?: string; // e.g. "42D 10H"
  stalledReason?: string;
  priceRange?: string; // e.g. "$7K – $11.5K" or "$21,500"
  priceNote?: string; // e.g. "PRICE RANGE" or "FIXED"
  hoursRange?: string; // e.g. "28–36h"
  hoursNote?: string; // e.g. "EST. AI HOURS" or "PENDING SCAN"
  waitingOnClient?: boolean;
  href?: string;
};

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

// ————————————————————————————————————————————————————————————————
// Page
// ————————————————————————————————————————————————————————————————

export default function PipelineDashboardPage() {
  return (
    <div className="pipeline-page min-h-screen">
      <Dashboard />

      <style jsx global>{`
        .pipeline-page {
          background: #fafaf9;
          color: #0f0e0d;
          font-family: var(--font-sans);
          min-height: 100vh;
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
// Dashboard
// ————————————————————————————————————————————————————————————————

function Dashboard() {
  const activeCount = ACTIVE_PROJECTS.length;
  const waitingCount = ACTIVE_PROJECTS.filter((p) => p.waitingOnClient).length;

  return (
    <div className="max-w-[1280px] mx-auto px-8 pt-14 pb-40">
      <DashboardHeader
        activeCount={activeCount}
        waitingCount={waitingCount}
      />

      <div className="mt-10 border-t border-black/[0.08]">
        {ACTIVE_PROJECTS.map((project) => (
          <ProjectRow key={project.id} project={project} />
        ))}
      </div>

      <PastMigrations projects={PAST_PROJECTS} />

      <div className="mt-16">
        <ChatbotDock />
      </div>
    </div>
  );
}

// ————————————————————————————————————————————————————————————————
// Header
// ————————————————————————————————————————————————————————————————

function DashboardHeader({
  activeCount,
  waitingCount,
}: {
  activeCount: number;
  waitingCount: number;
}) {
  return (
    <header className="flex items-end justify-between">
      <div>
        <h1 className="text-[34px] font-semibold tracking-[-0.02em] text-[#0f0e0d] leading-none">
          Source
        </h1>
        <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-[#0f0e0d]/45">
          Pipeline Dashboard
        </p>
      </div>
      <div className="flex items-end gap-10">
        <Counter value={activeCount} label="Active" />
        <Counter value={waitingCount} label="Waiting on Client" />
      </div>
    </header>
  );
}

function Counter({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-end">
      <div className="text-[34px] font-semibold tracking-[-0.02em] text-[#0f0e0d] leading-none tabular-nums">
        {value}
      </div>
      <div className="mt-2 text-[11px] uppercase tracking-[0.14em] text-[#0f0e0d]/45">
        {label}
      </div>
    </div>
  );
}

// ————————————————————————————————————————————————————————————————
// Project row
// ————————————————————————————————————————————————————————————————

function ProjectRow({ project }: { project: Project }) {
  const waiting = project.waitingOnClient;
  const complete = project.step === project.stepsTotal;

  return (
    <a
      href={project.href ?? "#"}
      className="relative grid grid-cols-[minmax(0,2fr)_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-6 px-6 py-6 group transition-colors hover:bg-black/[0.015] border-b border-black/[0.08]"
    >
      {/* left waiting accent */}
      {waiting && (
        <span
          aria-hidden
          className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#c78a36]"
        />
      )}

      {/* Company + systems */}
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[15px] font-semibold text-[#0f0e0d] truncate">
            {project.company}
          </span>
          <ExternalLink
            className="w-3 h-3 text-[#0f0e0d]/30 group-hover:text-[#0f0e0d]/60 transition-colors flex-shrink-0"
            strokeWidth={2}
          />
        </div>
        <div className="mt-1 text-[10.5px] uppercase tracking-[0.10em] text-[#0f0e0d]/45 truncate">
          {project.systems}
        </div>
      </div>

      {/* Status + step */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[15px] text-[#0f0e0d] truncate">
            {project.status}
          </span>
          {!complete && !waiting && (
            <span
              aria-hidden
              className="w-[10px] h-[10px] rounded-full border border-[#0f0e0d]/20 flex-shrink-0"
            />
          )}
        </div>
        <div className="mt-1 flex items-center gap-2 text-[10.5px] uppercase tracking-[0.10em] text-[#0f0e0d]/45">
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
          className={`text-[15px] truncate ${
            project.priceRange === "TBD"
              ? "text-[#0f0e0d]/55"
              : "text-[#0f0e0d]"
          }`}
        >
          {project.priceRange}
        </div>
        <div className="mt-1 text-[10.5px] uppercase tracking-[0.10em] text-[#0f0e0d]/45">
          {project.priceNote}
        </div>
      </div>

      {/* Hours */}
      <div className="min-w-0">
        <div
          className={`text-[15px] truncate ${
            project.hoursRange ? "text-[#0f0e0d]" : "text-[#0f0e0d]/35"
          }`}
        >
          {project.hoursRange ?? "—"}
        </div>
        <div className="mt-1 text-[10.5px] uppercase tracking-[0.10em] text-[#0f0e0d]/45">
          {project.hoursNote}
        </div>
      </div>
    </a>
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
// Past migrations collapsible
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
      <CollapsibleContent className="mt-4 border-t border-black/[0.08]">
        {projects.map((project) => (
          <ProjectRow key={project.id} project={project} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ————————————————————————————————————————————————————————————————
// Chatbot dock
// ————————————————————————————————————————————————————————————————

const SUGGESTIONS = [
  "Multi-subsidiary?",
  "Revenue recognition?",
  "Target go-live?",
  "Shopify as system of record?",
];

function ChatbotDock() {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // auto-resize textarea
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

  return (
    <section>
      <div className="max-w-[820px] mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.14em] text-[#0f0e0d]/45">
            <MessageSquare className="w-3 h-3" strokeWidth={2} />
            Ask Source
          </div>
          <h2 className="mt-3 text-[22px] font-semibold tracking-[-0.015em] text-[#0f0e0d]">
            Spin up a new engagement or ask about any project.
          </h2>
        </div>

        {messages.length > 0 && (
          <div className="mb-4 space-y-3">
            {messages.map((m, i) => (
              <ChatMessage key={i} role={m.role} content={m.content} />
            ))}
          </div>
        )}

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

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
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
    </section>
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

