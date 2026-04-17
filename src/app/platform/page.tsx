"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Paperclip,
  Landmark,
  Sparkles,
  ArrowRight,
  Globe,
  FileText,
  FileSpreadsheet,
  FileType2,
  MousePointer2,
  Loader2,
  MessageSquare,
  RefreshCw,
  Check,
  ChevronDown,
  Video,
  Calendar,
  Mic,
  Lock,
  ScanSearch,
  Brain,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
} from "@/components/ai-elements/chain-of-thought";

// ————————————————————————————————————————————————————————————————
// Page shell
// ————————————————————————————————————————————————————————————————

export default function PlatformPage() {
  return (
    <div className="platform-page">
      <TopNav />
      <Hero />
      <BuildStructuredPlan />
      <SeeInsideSystem />
      <RunMultipleTasks />
      <InspectAnyTask />
      <CreateDeliverables />
      <MakeFinalCall />
      <FooterCta />

      <style jsx global>{`
        /* Scope resets for this page only — override global scroll-snap */
        .platform-page {
          background: #fafaf9;
          color: #0f0e0d;
          font-family: var(--font-sans);
          min-height: 100vh;
          /* Soften shadcn's default tokens so Card / Input / Tabs render
             with the clean, subtle look this page had before the rewrite.
             Shadows are barely-there; borders are 8% black instead of
             OKLCH 0.922 which reads as a harsher stroke on beige. */
          --border: rgba(15, 14, 13, 0.08);
          --input: rgba(15, 14, 13, 0.08);
          --ring: rgba(15, 14, 13, 0.20);
          --card: #ffffff;
          --popover: #ffffff;
          --radius: 0.75rem;
        }
        .platform-page [data-slot="card"] {
          box-shadow: 0 1px 2px rgba(15, 14, 13, 0.04);
          border-color: rgba(15, 14, 13, 0.07);
        }
        /* Reasoning connector line inside ChainOfThoughtStep */
        .platform-page [data-slot="card"] .bg-border {
          background-color: rgba(15, 14, 13, 0.08);
        }
        /* Tabs trigger active state — no heavy ring */
        .platform-page [data-slot="tabs-list"] {
          background: rgba(15, 14, 13, 0.04);
          border-color: rgba(15, 14, 13, 0.06);
        }
        .platform-page section {
          scroll-snap-align: none;
          height: auto;
          min-height: auto;
        }
        html:has(.platform-page) {
          scroll-snap-type: none;
        }
        .serif {
          font-family: var(--font-serif);
          letter-spacing: -0.02em;
          font-weight: 400;
        }
      `}</style>
    </div>
  );
}

// ————————————————————————————————————————————————————————————————
// Nav
// ————————————————————————————————————————————————————————————————

function TopNav() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#fafaf9]/80 border-b border-black/[0.04]">
      <div className="max-w-[1280px] mx-auto px-8 h-16 flex items-center justify-between">
        <div
          className="text-[20px] tracking-[-0.01em] text-[#0f0e0d]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Source
        </div>
        <div className="hidden md:flex items-center gap-10 text-[13px] text-[#0f0e0d]/70">
          <a className="hover:text-[#0f0e0d] transition-colors" href="#plan">
            Platform
          </a>
          <a className="hover:text-[#0f0e0d] transition-colors" href="#work">
            Solutions
          </a>
          <a className="hover:text-[#0f0e0d] transition-colors" href="#deliver">
            Customers
          </a>
          <a className="hover:text-[#0f0e0d] transition-colors" href="#review">
            Security
          </a>
        </div>
        <button className="text-[11px] uppercase tracking-[0.08em] font-medium bg-[#0f0e0d] text-white px-4 py-2 rounded-full hover:bg-[#0f0e0d]/85 transition-colors">
          Book a Demo
        </button>
      </div>
    </nav>
  );
}

// ————————————————————————————————————————————————————————————————
// Hero — Long Horizon ERP Agents
// ————————————————————————————————————————————————————————————————

const STEPS = [
  { id: "scope", label: "Scope" },
  { id: "discovery", label: "Discovery" },
  { id: "scan", label: "Scan" },
  { id: "deliver", label: "Deliver" },
  { id: "review", label: "Review" },
];

const ERP_LOGOS = [
  { name: "SAP", src: "/logos/sap.svg", h: 18 },
  { name: "NetSuite", src: "/logos/netsuite.svg", h: 22 },
  { name: "Dynamics 365", src: "/logos/dynamics365.svg", h: 22 },
  { name: "Sage", src: "/logos/sage.svg", h: 18 },
];

const stepContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const stepItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 0.9, 0.3, 1] },
  },
};

function Hero() {
  return (
    <section className="pt-32 pb-24">
      <div className="max-w-[1340px] mx-auto px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="serif text-center text-[64px] md:text-[88px] leading-[0.95] tracking-[-0.02em] text-[#0f0e0d]"
        >
          Long Horizon ERP Agents
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-10 flex justify-center"
        >
          <div className="bg-white rounded-full border border-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.04)] px-6 py-3 flex items-center gap-5">
            {ERP_LOGOS.map((logo, i) => (
              <ErpLogo key={logo.name} logo={logo} showDivider={i > 0} />
            ))}
          </div>
        </motion.div>

        {/* Pipeline strip */}
        <motion.div
          className="mt-24 relative"
          variants={stepContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="absolute top-[18px] left-0 right-0 h-px bg-black/[0.08]" />
          <div className="grid grid-cols-5 gap-4 relative">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.id}
                variants={stepItem}
                className="flex flex-col items-center"
              >
                <div className="bg-white rounded-full border border-black/[0.08] px-5 py-1.5 text-[13px] text-[#0f0e0d]">
                  {step.label}
                </div>
                <div className="mt-10 w-full flex justify-center">
                  <HeroStepPreview index={i} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ErpLogo({
  logo,
  showDivider,
}: {
  logo: { name: string; src: string; h: number };
  showDivider: boolean;
}) {
  return (
    <>
      {showDivider && <div className="w-px h-6 bg-black/[0.08]" />}
      <div className="flex items-center h-6 px-1" title={logo.name}>
        <Image
          src={logo.src}
          alt={logo.name}
          width={90}
          height={logo.h}
          style={{ height: logo.h, width: "auto" }}
          unoptimized
        />
      </div>
    </>
  );
}

const heroCardClass =
  "bg-white rounded-xl border border-black/[0.06] shadow-[0_1px_3px_rgba(15,14,13,0.04)] p-4 w-full min-h-[280px] text-[12px] flex flex-col";

function HeroStepPreview({ index }: { index: number }) {
  switch (index) {
    // —— Scope: partner sends SOW; Source returns a fixed-fee quote
    case 0:
      return (
        <div className={heroCardClass}>
          <div className="flex items-center justify-between px-0.5 pb-2 border-b border-black/[0.05]">
            <span className="text-[#0f0e0d]/65 font-medium">Partner SOW</span>
            <span className="text-[9.5px] uppercase tracking-[0.10em] text-[#0f0e0d]/40">Draft</span>
          </div>
          <div className="pt-2 space-y-2 flex-1">
            <div>
              <div className="text-[9px] uppercase tracking-[0.12em] text-[#0f0e0d]/40 mb-1">Customer</div>
              <div className="text-[10.5px] text-[#0f0e0d]/75 leading-[1.5]">
                Publishing Co · 52 US, 25 IE · 15% YoY
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-[#0f0e0d]/40 mb-1.5">Target ERP</div>
              <div className="rounded-md border border-black/[0.08] bg-[#fafaf8] px-2.5 py-2 text-[12px] text-[#0f0e0d] flex items-center gap-2">
                <Image
                  src="/logos/netsuite.svg"
                  alt="NetSuite"
                  width={60}
                  height={12}
                  style={{ height: 12, width: "auto" }}
                  unoptimized
                />
                <span className="text-[#0f0e0d]/60">OneWorld</span>
              </div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.12em] text-[#0f0e0d]/40 mb-1">Source Quote</div>
              <div className="rounded bg-[#0f0e0d] text-white px-2 py-1.5 text-[11px] flex items-center justify-between">
                <span>$12,500</span>
                <span className="text-white/55 text-[9.5px] uppercase tracking-[0.10em]">fixed</span>
              </div>
            </div>
          </div>
        </div>
      );

    // —— Discovery: transcripts ingested + live AI reasoning chain
    case 1:
      return (
        <div className={heroCardClass}>
          <div className="flex items-center justify-between px-0.5 pb-2">
            <span className="flex items-center gap-1.5 text-[#0f0e0d]/65 font-medium">
              <Mic className="w-3 h-3" strokeWidth={1.75} />
              Transcripts · 3
            </span>
            <span className="text-[9.5px] uppercase tracking-[0.10em] text-[#0f0e0d]/40">granola</span>
          </div>
          <div className="flex flex-col gap-0.5 text-[10.5px]">
            <TranscriptLine dot="done" label="CFO · Jane" meta="31 min" />
            <TranscriptLine dot="done" label="Ops lead · Mark" meta="22 min" />
            <TranscriptLine dot="active" label="IT lead · Priya" meta="17 min" />
          </div>
          <div className="mt-2 pt-2 border-t border-black/[0.05] flex-1 min-h-[64px]">
            <div className="text-[8.5px] uppercase tracking-[0.12em] text-[#0f0e0d]/40 mb-1 flex items-center gap-1">
              <Brain className="w-2.5 h-2.5" strokeWidth={1.75} />
              Reasoning
            </div>
            <DiscoveryReasoning />
          </div>
        </div>
      );

    // —— Scan: QuickBooks connected facts
    case 2:
      return (
        <div className={heroCardClass}>
          <div className="flex items-center justify-between px-0.5 pb-2 border-b border-black/[0.05]">
            <span className="flex items-center gap-1.5 text-[#0f0e0d] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              QuickBooks
            </span>
            <span className="text-[9.5px] uppercase tracking-[0.10em] text-[#0f0e0d]/40">read-only</span>
          </div>
          <div className="pt-2 space-y-1.5 text-[10.5px] flex-1">
            <div className="flex justify-between"><span className="text-[#0f0e0d]/55">Records</span><span className="text-[#0f0e0d]">94,127</span></div>
            <div className="flex justify-between"><span className="text-[#0f0e0d]/55">GL accounts</span><span className="text-[#0f0e0d]">247</span></div>
            <div className="flex justify-between"><span className="text-[#0f0e0d]/55">Ghost system</span><span className="text-[#0f0e0d]">Shopify</span></div>
            <div className="flex justify-between"><span className="text-[#0f0e0d]/55">Vendors</span><span className="text-[#0f0e0d]">1,248 · 47 EU</span></div>
            <div className="flex justify-between"><span className="text-[#0f0e0d]/55">Open periods</span><span className="text-[#0f0e0d]">43 mo</span></div>
            <div className="flex justify-between"><span className="text-[#0f0e0d]/55">Integrations</span><span className="text-[#0f0e0d]">4</span></div>
          </div>
        </div>
      );

    // —— Deliver: mini deliverables file list with NetSuite implemented
    case 3:
      return (
        <div className={heroCardClass}>
          <div className="flex items-center justify-between px-0.5 pb-2">
            <span className="text-[#0f0e0d]/65 font-medium">Deliverables</span>
            <span className="inline-flex items-center gap-1 text-[9.5px] text-[#0f6a3f] bg-[#e4f7ee] px-1.5 py-0.5 rounded-full uppercase tracking-[0.08em]">
              <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
              Ready
            </span>
          </div>
          <div className="flex flex-col gap-0.5 flex-1">
            <FileRow icon="docx" name="BRD – QBO → NetSuite.docx" />
            <FileRow icon="docx" name="SOW – Fixed Fee.docx" />
            <FileRow icon="xlsx" name="COA Mapping.xlsx" />
            <FileRow icon="docx" name="Migration Plan.docx" />
          </div>
          <div className="mt-1.5 pt-2 border-t border-black/[0.05] flex items-center gap-2">
            <Image
              src="/logos/netsuite.svg"
              alt="NetSuite"
              width={60}
              height={12}
              style={{ height: 12, width: "auto" }}
              unoptimized
            />
            <span className="ml-auto text-[9.5px] text-[#0f6a3f] uppercase tracking-[0.08em]">implemented</span>
          </div>
        </div>
      );

    // —— Review: Source made an edit · Accept/Reject
    case 4:
      return (
        <div className={heroCardClass}>
          <div className="flex items-center justify-between pb-2">
            <span className="text-[#0f0e0d]">
              <span className="font-semibold">Source</span>{" "}
              <span className="text-[#0f0e0d]/50">made an edit</span>
            </span>
            <span className="text-[9.5px] text-[#0f0e0d]/40">3:14pm</span>
          </div>
          <div className="text-[#0f0e0d]/65 pb-2 text-[10.5px] leading-[1.55]">
            Merged GL 4100 &amp; 4110 in NetSuite subsidiaries. Downstream
            sub-accounts remapped automatically.
          </div>
          <div className="flex items-center gap-1 pb-2 text-[9.5px] flex-wrap">
            <span className="text-[#0f0e0d]/45 uppercase tracking-[0.10em] text-[9px]">Systems</span>
            <span className="px-1.5 py-0.5 rounded bg-black/[0.03] text-[#0f0e0d]/70">NetSuite</span>
            <span className="px-1.5 py-0.5 rounded bg-black/[0.03] text-[#0f0e0d]/70">Celigo</span>
          </div>
          <div className="mt-auto flex flex-col gap-1">
            <div className="rounded-md bg-[#0f0e0d] text-white text-center py-1.5 text-[11px]">Accept</div>
            <div className="rounded-md bg-white border border-black/[0.08] text-[#0f0e0d] text-center py-1.5 text-[11px]">
              Reject
            </div>
          </div>
        </div>
      );
  }
}

function TranscriptLine({
  dot,
  label,
  meta,
}: {
  dot: "done" | "active";
  label: string;
  meta: string;
}) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="relative flex h-1.5 w-1.5">
        {dot === "active" && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#10B981]/60 animate-ping" />
        )}
        <span
          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
            dot === "done" ? "bg-[#10B981]" : "bg-[#10B981]"
          }`}
        />
      </span>
      <span className="text-[#0f0e0d]/75 truncate flex-1">{label}</span>
      <span className="text-[9.5px] text-[#0f0e0d]/40">{meta}</span>
    </div>
  );
}

const DISCOVERY_THOUGHTS = [
  "Two entities confirmed · US Inc + Irish Ltd…",
  "Ghost system flagged · Shopify consumer SOR",
  "Target: NetSuite OneWorld (multi-subsidiary)",
  "43 months without a closed period",
];

function DiscoveryReasoning() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setI((n) => (n + 1) % DISCOVERY_THOUGHTS.length);
    }, 2400);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative h-[32px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="italic text-[10.5px] text-[#0f0e0d]/70 leading-[1.4] absolute inset-0"
        >
          {DISCOVERY_THOUGHTS[i]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

// ————————————————————————————————————————————————————————————————
// Section 1 — Build a Structured Plan
// ————————————————————————————————————————————————————————————————

function BuildStructuredPlan() {
  const [value, setValue] = useState("");
  return (
    <section id="plan" className="py-24">
      <div className="max-w-[900px] mx-auto px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="serif text-[48px] md:text-[68px] leading-[1.02] tracking-[-0.03em]"
        >
          Build a Structured Plan
        </motion.h2>
        <p className="mt-6 text-[17px] text-[#0f0e0d]/60 leading-relaxed max-w-[560px] mx-auto">
          Upload the SOW or discovery transcript. Source asks the clarifying
          questions a great solution architect would, then kicks off the
          project.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-12 bg-white rounded-xl border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-5 text-left"
        >
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Paste SOW, discovery transcript, or project brief…"
            className="w-full min-h-[72px] bg-transparent outline-none text-[15px] text-[#0f0e0d] placeholder:text-[#0f0e0d]/30 resize-none"
          />
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-5 text-[13px] text-[#0f0e0d]/55">
              <button className="flex items-center gap-1.5 hover:text-[#0f0e0d] transition-colors">
                <Paperclip size={15} />
                Files
              </button>
              <button className="flex items-center gap-1.5 hover:text-[#0f0e0d] transition-colors">
                <Landmark size={15} />
                Systems
              </button>
              <button className="flex items-center gap-1.5 hover:text-[#0f0e0d] transition-colors">
                <Sparkles size={15} />
                Improve
              </button>
            </div>
            <button className="w-9 h-9 rounded-lg bg-[#0f0e0d] text-white flex items-center justify-center hover:bg-[#0f0e0d]/85 transition-colors">
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>

        <div className="mt-6 flex items-center gap-2 flex-wrap justify-center text-[12px]">
          {[
            "Multi-subsidiary?",
            "Revenue recognition?",
            "Target go-live?",
            "Shopify as system of record?",
          ].map((q) => (
            <span
              key={q}
              className="px-3 py-1.5 rounded-full bg-white border border-black/[0.06] text-[#0f0e0d]/65"
            >
              {q}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ————————————————————————————————————————————————————————————————
// Section 2 — See Inside Their System
// ————————————————————————————————————————————————————————————————

function SeeInsideSystem() {
  // Pipeline phase animates as the section comes into view
  const [pipelinePhase, setPipelinePhase] = useState(0); // index into PIPELINE_SEGMENTS

  // Credentials state machine: idle → encrypting → validating → accepted
  const [credPhase, setCredPhase] = useState<
    "idle" | "encrypting" | "validating" | "accepted"
  >("idle");

  // Deep-scan reasoning trace reveal
  const [reasoningCount, setReasoningCount] = useState(0);

  // When the whole section enters viewport, run the credential + reasoning demo
  const sectionRef = useRef<HTMLElement | null>(null);
  const [sectionInView, setSectionInView] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setSectionInView(true);
        });
      },
      { threshold: 0.25 }
    );
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!sectionInView) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Credentials: idle → encrypting → validating → accepted
    timers.push(setTimeout(() => setCredPhase("encrypting"), 600));
    timers.push(setTimeout(() => setCredPhase("validating"), 1800));
    timers.push(setTimeout(() => setCredPhase("accepted"), 3000));

    // Pipeline advance: Ingest → Scan (once accepted)
    timers.push(setTimeout(() => setPipelinePhase(1), 3200));
    timers.push(setTimeout(() => setPipelinePhase(2), 7500));

    // Reasoning trace reveal (step by step after scan starts)
    REASONING_STEPS.forEach((_, i) => {
      timers.push(
        setTimeout(() => setReasoningCount(i + 1), 3400 + i * 650)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [sectionInView]);

  return (
    <section ref={sectionRef} className="py-24">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="text-center">
          <span className="text-[11px] uppercase tracking-[0.22em] text-[#0f0e0d]/45">
            Attached to the sales cycle
          </span>
          <h2 className="mt-4 serif text-[48px] md:text-[64px] leading-[1.02] tracking-[-0.03em]">
            See Inside Their System
          </h2>
          <p className="mt-6 text-[17px] text-[#0f0e0d]/60 max-w-[620px] mx-auto leading-relaxed">
            Source rides along on the sales cycle — every discovery call,
            transcript, and calendar invite. Then it connects to the live
            system and reads it front-to-back.
          </p>
        </div>

        {/* Gather the Right Sources — Harvey-style ChainOfThought (narrow, centered) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-12 max-w-[780px] mx-auto"
        >
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b">
              <div>
                <CardTitle className="text-[15px] tracking-[-0.01em]">
                  Gather the right sources
                </CardTitle>
                <CardDescription className="text-[12px] mt-0.5">
                  Agents draw from every transcript, calendar, and system to ground the implementation in reality.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Loader2
                  className={`w-4 h-4 text-muted-foreground ${
                    reasoningCount < REASONING_STEPS.length ? "animate-spin" : ""
                  }`}
                  strokeWidth={1.75}
                />
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono uppercase tracking-[0.10em] font-normal"
                >
                  {credPhase !== "accepted"
                    ? "Reading transcripts…"
                    : reasoningCount >= REASONING_STEPS.length
                    ? "Sources synthesized"
                    : "Reading…"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="px-6 py-5">
              <ChainOfThought defaultOpen>
                <ChainOfThoughtHeader className="text-[12px] font-mono uppercase tracking-[0.10em]">
                  Working…
                </ChainOfThoughtHeader>
                <ChainOfThoughtContent className="mt-4 space-y-4">
                  {/* Granola · Hartley & Sons */}
                  <ChainOfThoughtStep
                    icon={Mic}
                    label="Granola transcript · Hartley & Sons"
                    status="complete"
                    description="Mon · 31 min · 5 speakers"
                  >
                    <p className="text-[13px] italic text-foreground/65 leading-relaxed">
                      Single US entity. $42k approved. No ghost system. Labelled as
                      QuickBooks → NetSuite starter.
                    </p>
                  </ChainOfThoughtStep>

                  {/* Granola · Meridian Retail */}
                  <ChainOfThoughtStep
                    icon={Mic}
                    label="Granola transcript · Meridian Retail"
                    status="complete"
                    description="Tue · 23 min · 4 speakers"
                  >
                    <p className="text-[13px] italic text-foreground/65 leading-relaxed">
                      Multi-subsidiary confirmed. Ghost system: Shopify acting as
                      consumer SOR. Target: Dynamics 365 BC.
                    </p>
                  </ChainOfThoughtStep>

                  {/* Read.ai · Bayline Logistics */}
                  <ChainOfThoughtStep
                    icon={Mic}
                    label="Read.ai transcript · Bayline Logistics"
                    status="complete"
                    description="Wed · 47 min · 6 speakers · change request"
                  >
                    <p className="text-[13px] italic text-foreground/65 leading-relaxed">
                      Ops requested warehouse module mid-call. Re-priced at $61k.
                      Added to Acumatica implementation scope.
                    </p>
                  </ChainOfThoughtStep>

                  {/* Google Calendar */}
                  <ChainOfThoughtStep
                    icon={Calendar}
                    label="Google Calendar"
                    status="complete"
                    description="3 calls scheduled · 1 auto-booked by Source"
                  >
                    <p className="text-[13px] italic text-foreground/65 leading-relaxed">
                      Scope walkthrough auto-booked for Thu 15:30 with CFO and
                      Controller once scan finishes.
                    </p>
                  </ChainOfThoughtStep>

                  {/* Web sources */}
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
                      <ChainOfThoughtSearchResult>
                        <Globe className="w-3 h-3" strokeWidth={1.75} />
                        Multi-subsidiary setup · oracle.com
                      </ChainOfThoughtSearchResult>
                      <ChainOfThoughtSearchResult>
                        <Globe className="w-3 h-3" strokeWidth={1.75} />
                        Celigo Shopify → NetSuite · celigo.com
                      </ChainOfThoughtSearchResult>
                      <ChainOfThoughtSearchResult>
                        <Globe className="w-3 h-3" strokeWidth={1.75} />
                        FX & intercompany elimination · blake-group.com
                      </ChainOfThoughtSearchResult>
                    </ChainOfThoughtSearchResults>
                  </ChainOfThoughtStep>

                  {/* QuickBooks API */}
                  <ChainOfThoughtStep
                    icon={Lock}
                    label={
                      credPhase === "accepted"
                        ? "QuickBooks Online Advanced · connected"
                        : "QuickBooks Online Advanced · awaiting access"
                    }
                    status={
                      credPhase === "accepted"
                        ? "complete"
                        : credPhase === "idle"
                        ? "pending"
                        : "active"
                    }
                    description={
                      credPhase === "accepted"
                        ? "Read-only · Realm sandbox.qbo.intuit.com"
                        : credPhase === "encrypting"
                        ? "Encrypting credentials (AES-256)…"
                        : credPhase === "validating"
                        ? "Validating API access — read-only scope…"
                        : "Credential request sent to CFO via secure portal"
                    }
                  >
                    <div className="flex flex-wrap gap-1.5">
                      <Badge
                        variant="secondary"
                        className="text-[9px] uppercase tracking-[0.10em] font-normal font-mono"
                      >
                        Realm · sandbox.qbo.intuit.com
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-[9px] uppercase tracking-[0.10em] font-normal font-mono"
                      >
                        Client ID · ABoCaS0rxEU…WkeTT
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-[9px] uppercase tracking-[0.10em] font-normal font-mono"
                      >
                        Scope · read-only
                      </Badge>
                    </div>
                  </ChainOfThoughtStep>

                  {/* Deep-scan reasoning appears once access is granted */}
                  {credPhase === "accepted" && reasoningCount > 0 && (
                    <ChainOfThoughtStep
                      icon={ScanSearch}
                      label="QuickBooks Deep Scan · reading the system"
                      status={
                        reasoningCount < REASONING_STEPS.length
                          ? "active"
                          : "complete"
                      }
                      description="Live reasoning as Source reads chart of accounts, entities, inventory, and period status"
                    >
                      <div className="space-y-1.5">
                        {REASONING_STEPS.slice(0, reasoningCount).map((s, i) => {
                          const isLast = i === reasoningCount - 1;
                          const isStreaming =
                            isLast && reasoningCount < REASONING_STEPS.length;
                          return (
                            <p
                              key={i}
                              className={`italic leading-relaxed ${
                                s.depth === 2
                                  ? "pl-4 text-[12px] text-foreground/50"
                                  : "text-[13px] text-foreground/70"
                              }`}
                            >
                              {s.text}
                              {isStreaming && (
                                <span className="inline-block w-[6px] h-[13px] ml-0.5 bg-foreground/40 animate-pulse align-middle" />
                              )}
                            </p>
                          );
                        })}
                      </div>
                    </ChainOfThoughtStep>
                  )}
                </ChainOfThoughtContent>
              </ChainOfThought>
            </CardContent>
          </Card>
        </motion.div>

        {/* QuickBooks connected facts */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 bg-white rounded-xl border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  credPhase === "accepted"
                    ? "bg-[#10B981] animate-pulse"
                    : "bg-[#0f0e0d]/20"
                }`}
              />
              <span className="text-[13px] text-[#0f0e0d]">
                QuickBooks ·{" "}
                {credPhase === "accepted" ? "connected" : "pending"}
              </span>
            </div>
            <span className="text-[11px] text-[#0f0e0d]/40 uppercase tracking-[0.08em]">
              read-only
            </span>
          </div>
          <ul className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-12 divide-y md:divide-y-0 divide-black/[0.04] text-[14px]">
            <ScanRow label="Total records" value="94,127" />
            <ScanRow label="Active B2B wholesale accounts" value="25" />
            <ScanRow label="Consumer accounts" value="612" hint="18mo inactive" />
            <ScanRow label="Ghost system detected" value="Shopify" hint="consumer SOR" />
            <ScanRow label="Chart of accounts" value="247 GLs" hint="18 unused" />
            <ScanRow label="Open periods" value="43 months" hint="no period close" />
          </ul>
        </motion.div>

        {/* Pipeline rail — implementation flow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-6 bg-white rounded-xl border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.04)] px-3 py-3"
        >
          <PipelineRail currentIndex={pipelinePhase} />
        </motion.div>
      </div>
    </section>
  );
}

// —— Supporting pieces for the Scan section

const REASONING_STEPS: { text: string; depth?: 1 | 2 }[] = [
  {
    text: "Opening QuickBooks sandbox · pulling chart of accounts, entities, and period status…",
  },
  {
    text: "43 months without a closed period. Any user can backdate transactions from nearly 4 years ago. No audit trail integrity.",
  },
  {
    text: "PE firm due diligence will flag this immediately. Strongest argument for NetSuite.",
    depth: 2,
  },
  {
    text: "Inventory score: 4/10 — all 8,903 items classified as Service type. Zero pricing, zero cost data. Physical products treated as services.",
  },
  {
    text: "Reconciliation status: all 3 bank accounts reconciled through end of last month. Clean handoff point available for cutover.",
  },
  {
    text: "Multi-entity evidence: Irish retail locations (4), European vendor suffixes (47 vendors), EUR-denominated transactions, 'Pre NS' journal references.",
  },
  {
    text: "Architecture recommendation: NetSuite OneWorld — multi-subsidiary, multi-currency, intercompany elimination. Standard edition insufficient.",
  },
  {
    text: "CFO confirmed on the call: 'Two. A Irish entity — it's a Limited — and the US entity which is an Inc.' Consultant adjusted to OneWorld on the spot.",
    depth: 2,
  },
  {
    text: "Employee headcount: approximately 52 US, 25 Ireland, growing 15% year-over-year. Sizing licensing for up to 85 users.",
  },
];

const PIPELINE_SEGMENTS = [
  "INGEST",
  "SCAN",
  "BRD V1",
  "ITERATE",
  "BRD V2",
  "SIGN-OFF",
  "MIGRATE",
  "DONE",
];

function PipelineRail({ currentIndex }: { currentIndex: number }) {
  return (
    <div className="flex items-center gap-0 px-2 py-1 overflow-x-auto">
      {PIPELINE_SEGMENTS.map((label, idx) => {
        const isComplete = idx < currentIndex;
        const isActive = idx === currentIndex;
        const isLast = idx === PIPELINE_SEGMENTS.length - 1;
        return (
          <div key={label} className="flex items-center flex-1 min-w-0">
            <div
              className={`flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 transition-colors ${
                isActive ? "bg-black text-white rounded" : ""
              }`}
            >
              {isComplete && (
                <Check className="w-3 h-3 text-[#16a34a]" strokeWidth={2.5} />
              )}
              <span
                className={`text-[11px] font-mono tracking-[0.08em] whitespace-nowrap ${
                  isComplete
                    ? "text-[#16a34a] font-medium"
                    : isActive
                    ? "text-white font-medium"
                    : "text-[#0f0e0d]/25"
                }`}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <div
                className={`h-[1px] flex-1 min-w-[8px] mx-0.5 ${
                  isComplete ? "bg-[#22c55e]/40" : "bg-black/[0.06]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ScanRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <li className="py-2.5 flex items-center justify-between">
      <span className="text-[#0f0e0d]/60">{label}</span>
      <span className="text-[#0f0e0d]">
        {value}{" "}
        {hint && (
          <span className="text-[#0f0e0d]/35 text-[12px]">· {hint}</span>
        )}
      </span>
    </li>
  );
}

// ————————————————————————————————————————————————————————————————
// Section 3 — Run Multiple Tasks at Once (parallel team)
// ————————————————————————————————————————————————————————————————

type TaskRow = {
  title: string;
  role: string;
  status: "in-progress" | "awaiting" | "ready" | "done";
  source: string;
};

type Project = {
  name: string;
  route: string;
  tasks: TaskRow[];
};

const IMPLEMENTATIONS: Project[] = [
  {
    name: "Publishing Co · QuickBooks → NetSuite",
    route: "Week 2 of 3",
    tasks: [
      {
        title: "Map chart of accounts for multi-subsidiary consolidation",
        role: "Functional Consultant",
        status: "done",
        source: "QuickBooks",
      },
      {
        title: "Draft BRD v2 with discovery call findings",
        role: "Jr. Solution Architect",
        status: "awaiting",
        source: "Transcript",
      },
      {
        title: "Configure Celigo integration for Shopify → NetSuite",
        role: "Developer",
        status: "ready",
        source: "NetSuite",
      },
      {
        title: "Migrate 94k customer records with dedup rules",
        role: "Developer",
        status: "in-progress",
        source: "QuickBooks",
      },
    ],
  },
  {
    name: "Cable Manufacturer · Great Plains → Business Central",
    route: "Week 1 of 6",
    tasks: [
      {
        title: "Scan FileMaker Pro custom fields and 20yr of customisations",
        role: "Solution Architect",
        status: "in-progress",
        source: "FileMaker",
      },
      {
        title: "Reconcile AP aging against GP ledger",
        role: "Functional Consultant",
        status: "in-progress",
        source: "Great Plains",
      },
    ],
  },
];

const MANAGED_SERVICES: Project[] = [
  {
    name: "Active tickets across 14 client accounts",
    route: "rolling",
    tasks: [
      {
        title: "Build Celigo integration for Acumatica → Shopify",
        role: "Developer",
        status: "in-progress",
        source: "Acumatica",
      },
      {
        title: "SuiteScript for revenue recognition on renewal contracts",
        role: "Developer",
        status: "ready",
        source: "NetSuite",
      },
      {
        title: "Rebuild AR aging dashboard with real-time drilldown",
        role: "Jr. Solution Architect",
        status: "awaiting",
        source: "Supabase",
      },
    ],
  },
];

type TabKey = "implementations" | "managed";

function RunMultipleTasks() {
  // All projects default-open so everyone sees the work at a glance;
  // Radix Accordion (type="multiple") gives us the smooth expand/collapse.
  const implIds = IMPLEMENTATIONS.map((_, i) => `impl-${i}`);
  const mgdIds = MANAGED_SERVICES.map((_, i) => `mgd-${i}`);
  const allOpen = [...implIds, ...mgdIds];

  return (
    <section id="work" className="py-24">
      <div className="max-w-[1100px] mx-auto px-8 text-center">
        <span className="text-[11px] uppercase tracking-[0.22em] text-[#0f0e0d]/45">
          A team of agents, not humans
        </span>
        <h2 className="mt-4 serif text-[48px] md:text-[72px] leading-[1.02] tracking-[-0.03em]">
          Run Multiple Implementations at Once
        </h2>
        <p className="mt-6 text-[17px] text-[#0f0e0d]/60 max-w-[680px] mx-auto leading-relaxed">
          Source replaces the functional consultant, the junior solution
          architect, and the developer with long-horizon agents that work in
          parallel — across every client project and managed service
          engagement at once.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
          className="mt-10"
        >
          <Card className="max-w-[920px] mx-auto text-left overflow-hidden">
            {/* Implementations band */}
            <div className="px-5 pt-5 pb-2 flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                Implementations · {IMPLEMENTATIONS.length} active
              </span>
              <Badge variant="outline" className="text-[9px] font-mono uppercase tracking-[0.10em] font-normal">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse mr-1.5" />
                Live
              </Badge>
            </div>

            <Accordion
              type="multiple"
              defaultValue={allOpen}
              className="px-2"
            >
              {IMPLEMENTATIONS.map((project, p) => (
                <AccordionProjectItem
                  key={project.name}
                  value={`impl-${p}`}
                  project={project}
                />
              ))}
            </Accordion>

            {/* Managed Services band — layered into same card */}
            <div className="mt-2 px-5 pt-5 pb-2 border-t">
              <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                Managed Services · {MANAGED_SERVICES.length} active
              </span>
            </div>

            <Accordion
              type="multiple"
              defaultValue={allOpen}
              className="px-2 pb-3"
            >
              {MANAGED_SERVICES.map((project, p) => (
                <AccordionProjectItem
                  key={project.name}
                  value={`mgd-${p}`}
                  project={project}
                />
              ))}
            </Accordion>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

// ————————————————————————————————————————————————————————————————
// Section 3b — Inspect Any Task (dedicated drilldown with BRD PDF)
// ————————————————————————————————————————————————————————————————

function InspectAnyTask() {
  const [cursorPhase, setCursorPhase] = useState<"idle" | "hover" | "click">(
    "idle"
  );
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setInView(true));
      },
      { threshold: 0.3 }
    );
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    // Loop: idle → hover → click → idle
    let cancelled = false;
    const cycle = () => {
      if (cancelled) return;
      setCursorPhase("idle");
      setTimeout(() => !cancelled && setCursorPhase("hover"), 600);
      setTimeout(() => !cancelled && setCursorPhase("click"), 1800);
      setTimeout(() => cycle(), 4200);
    };
    cycle();
    return () => {
      cancelled = true;
    };
  }, [inView]);

  return (
    <section ref={sectionRef} id="inspect" className="py-24">
      <div className="max-w-[1180px] mx-auto px-8">
        <div className="text-center">
          <span className="text-[11px] uppercase tracking-[0.22em] text-[#0f0e0d]/45">
            Review & approve
          </span>
          <h2 className="mt-4 serif text-[48px] md:text-[64px] leading-[1.02] tracking-[-0.03em]">
            Inspect Any Step in Depth
          </h2>
          <p className="mt-6 text-[17px] text-[#0f0e0d]/60 max-w-[640px] mx-auto leading-relaxed">
            Click into any task and see exactly what Source did, the
            documents it produced, and the questions it still has for you.
            Review the BRD page-by-page before a single record moves.
          </p>
        </div>

        {/* Mini tracker with animated cursor + drilldown below */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-[0.95fr_1.1fr] gap-6">
          {/* Left column — mini tracker with cursor */}
          <div className="relative bg-white rounded-xl border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-5 py-3 border-b border-black/[0.05] flex items-center justify-between">
              <span className="text-[12px] text-[#0f0e0d]/55">
                Publishing Co · QuickBooks → NetSuite
              </span>
              <span className="text-[10px] font-mono uppercase tracking-[0.10em] text-[#0f0e0d]/40">
                Week 2 / 3
              </span>
            </div>

            <div className="relative p-3">
              <MiniTrackerRow
                title="Draft BRD v1 from discovery + scan"
                role="Functional Consultant"
                status="ready"
                highlighted={cursorPhase === "hover" || cursorPhase === "click"}
                pressed={cursorPhase === "click"}
              />
              <MiniTrackerRow
                title="Map chart of accounts · multi-subsidiary"
                role="Jr Solution Architect"
                status="in-progress"
              />
              <MiniTrackerRow
                title="Build Celigo integration test pack"
                role="Developer"
                status="awaiting"
              />
              <MiniTrackerRow
                title="Draft cutover runbook"
                role="Functional Consultant"
                status="done"
                last
              />

              {/* Animated cursor */}
              <motion.div
                initial={false}
                animate={{
                  opacity: inView ? 1 : 0,
                  x: cursorPhase === "idle" ? 280 : 220,
                  y:
                    cursorPhase === "idle"
                      ? 20
                      : cursorPhase === "hover"
                      ? 48
                      : 52,
                  scale: cursorPhase === "click" ? 0.9 : 1,
                }}
                transition={{ duration: 1.1, ease: [0.22, 0.9, 0.3, 1] }}
                className="absolute top-0 left-0 pointer-events-none z-20"
              >
                <MousePointer2
                  size={22}
                  className="text-[#0f0e0d]"
                  fill="#0f0e0d"
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.18))",
                  }}
                />
                <AnimatePresence>
                  {cursorPhase === "click" && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0.55 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      transition={{ duration: 0.55 }}
                      className="absolute -top-1 -left-1 w-6 h-6 rounded-full border-2 border-[#0f0e0d]"
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            <div className="px-5 py-3 border-t border-black/[0.05] text-[11px] font-mono uppercase tracking-[0.10em] text-[#0f0e0d]/40">
              Select any task to drill in
            </div>
          </div>

          {/* Right column — drilldown panel */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-xl border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-black/[0.05]">
              <div className="text-[10px] uppercase tracking-[0.14em] text-[#0f0e0d]/40">
                Functional Consultant · Google Meet transcript
              </div>
              <div className="mt-1 text-[17px] text-[#0f0e0d] tracking-[-0.01em]">
                Draft BRD v1 from discovery + scan
              </div>
            </div>

            {/* BRD PDF preview */}
            <div className="px-6 pt-5">
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-[0.10em] text-[#0f0e0d]/50">
                  BRD v1 · 14 pages · for review
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-[#0f0e0d]/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                  awaiting approval
                </span>
              </div>
              <BrdPdfPreview />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-black/[0.05] border-t border-black/[0.05] mt-5">
              <div className="p-5">
                <div className="text-[10px] uppercase tracking-[0.14em] text-[#0f0e0d]/50 mb-3">
                  What Source did
                </div>
                <ul className="space-y-2 text-[12.5px] text-[#0f0e0d]/75 leading-[1.55]">
                  <DrillReasoning text="Read 3 discovery transcripts + QuickBooks scan (94,127 records, 247 GLs)." />
                  <DrillReasoning text="Drafted target GL structure for NetSuite OneWorld multi-subsidiary." />
                  <DrillReasoning text="Assembled BRD v1 with scope, architecture, cutover plan, and cost breakdown." />
                </ul>
              </div>
              <div className="p-5 bg-[#fafaf8]">
                <div className="text-[10px] uppercase tracking-[0.14em] text-[#0f0e0d]/50 mb-3">
                  What you can do
                </div>
                <div className="flex flex-col gap-2">
                  <ActionButton icon={Check} label="Approve & send to client" primary />
                  <ActionButton icon={MessageSquare} label="Comment on a page" />
                  <ActionButton icon={RefreshCw} label="Re-draft with new input" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function MiniTrackerRow({
  title,
  role,
  status,
  highlighted = false,
  pressed = false,
  last = false,
}: {
  title: string;
  role: string;
  status: TaskRow["status"];
  highlighted?: boolean;
  pressed?: boolean;
  last?: boolean;
}) {
  const isDone = status === "done";
  const isWorking = status === "in-progress" || status === "awaiting";
  return (
    <div
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
        last ? "" : "mb-1"
      } ${
        highlighted
          ? pressed
            ? "bg-black/[0.06]"
            : "bg-black/[0.03]"
          : ""
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] text-[#0f0e0d] truncate">{title}</div>
        <div className="mt-0.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.10em] text-[#0f0e0d]/45">
          <span>{role} agent</span>
          <span className="text-[#0f0e0d]/20">·</span>
          {isDone ? (
            <span className="inline-flex items-center gap-1">
              <Check size={10} strokeWidth={2.5} /> Done
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                {isWorking && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#0f0e0d]/40 animate-ping" />
                )}
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#0f0e0d]/70" />
              </span>
              Working
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function BrdPdfPreview() {
  const [page, setPage] = useState(1);
  const totalPages = 4;

  return (
    <div className="mt-3">
      {/* Pages strip */}
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`relative aspect-[0.77/1] bg-white border overflow-hidden rounded-sm text-left ${
              page === p
                ? "border-[#0f0e0d]/40 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                : "border-black/[0.08]"
            }`}
          >
            <div className="p-1.5 space-y-[3px]">
              <div className="h-[5px] w-[70%] bg-black/15" />
              <div className="h-[2px] w-full bg-black/8" />
              <div className="h-[2px] w-[88%] bg-black/8" />
              <div className="h-[2px] w-[70%] bg-black/8" />
              <div className="mt-1.5 h-[5px] w-[50%] bg-black/12" />
              <div className="h-[2px] w-full bg-black/8" />
              <div className="h-[2px] w-[82%] bg-black/8" />
              <div className="h-[2px] w-[60%] bg-black/8" />
            </div>
            <span className="absolute bottom-1 right-1 text-[8px] font-mono text-[#0f0e0d]/35">
              {p}
            </span>
          </button>
        ))}
      </div>

      {/* Focused page preview */}
      <div className="mt-3 bg-white border border-black/[0.08] rounded-sm px-5 py-5">
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
          <div className="text-[8px] uppercase tracking-[0.18em] text-[#0f0e0d]/40">
            BRD v1 · Publishing Co → NetSuite
          </div>
          <div className="text-[8px] font-mono text-[#0f0e0d]/40">
            Page {page} of {totalPages}
          </div>
        </div>
        <div className="pt-3">
          <div className="text-[14px] text-[#0f0e0d] tracking-[-0.01em]">
            {page === 1 && "1.  Executive Summary"}
            {page === 2 && "2.  System Architecture"}
            {page === 3 && "3.  Data Migration Plan"}
            {page === 4 && "4.  Cutover & Go-Live"}
          </div>
          <div className="mt-2 space-y-1.5 text-[10.5px] text-[#0f0e0d]/60 leading-[1.5]">
            {page === 1 && (
              <>
                <p>
                  Publishing Co will migrate from QuickBooks Online Advanced
                  to NetSuite OneWorld to resolve multi-subsidiary
                  consolidation, audit trail, and PE diligence gaps.
                </p>
                <p>
                  Scan identified 94,127 records, 247 GL accounts, 47 vendors
                  with European suffixes, and a Shopify ghost system acting as
                  the consumer SOR.
                </p>
                <p className="text-[#0f0e0d]/80">
                  Source fixed-fee implementation: <strong>$48,000</strong>{" "}
                  over <strong>21 days</strong>.
                </p>
              </>
            )}
            {page === 2 && (
              <>
                <p>
                  Target: NetSuite OneWorld (multi-subsidiary, multi-currency,
                  intercompany elimination).
                </p>
                <p>
                  Entities: US Inc (parent), Irish Ltd (subsidiary). Functional
                  currencies USD and EUR with automatic FX.
                </p>
                <p>
                  Integrations via Celigo: Shopify → NetSuite (orders),
                  Stripe → NetSuite (payments), ADP → NetSuite (payroll
                  journals).
                </p>
              </>
            )}
            {page === 3 && (
              <>
                <p>
                  Cutover boundary: all 3 bank accounts reconciled through end
                  of last month — clean handoff point.
                </p>
                <p>
                  Migration waves: Master data (vendors, items, customers) →
                  Open transactions → Historical balances (2-year GL).
                </p>
                <p>
                  Data cleansing: sunset 18 unused GLs, consolidate 47 GL
                  candidates, classify 8,903 items into Inventory vs Service.
                </p>
              </>
            )}
            {page === 4 && (
              <>
                <p>
                  Target go-live: October 6. Three parallel-run weeks post
                  cutover with QBO frozen read-only.
                </p>
                <p>
                  Day-1 readiness checklist: opening balance reconciliation,
                  role provisioning (up to 85 users), month-end close
                  rehearsal.
                </p>
                <p className="text-[#0f0e0d]/80">
                  Sign-off required from: Controller, CFO, PE sponsor.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Page nav */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-[#0f0e0d]/55">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="hover:text-[#0f0e0d] transition-colors"
        >
          ← Previous
        </button>
        <span className="text-[10px] font-mono uppercase tracking-[0.10em] text-[#0f0e0d]/40">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="hover:text-[#0f0e0d] transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full transition-colors ${
        active
          ? "bg-[#0f0e0d] text-white"
          : "text-[#0f0e0d]/60 hover:text-[#0f0e0d]"
      }`}
    >
      {children}
    </button>
  );
}

const rowContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const rowItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 0.9, 0.3, 1] },
  },
};

// —— Smooth project-by-project accordion (Radix under the hood, tw-animate-css
// for the collapsible content). The whole group expands/collapses as a unit
// so you can scan the full portfolio at a glance, and tuck away projects
// you don't care about.
function AccordionProjectItem({
  value,
  project,
}: {
  value: string;
  project: Project;
}) {
  const workingCount = project.tasks.filter(
    (t) => t.status === "in-progress" || t.status === "awaiting"
  ).length;
  const doneCount = project.tasks.filter((t) => t.status === "done").length;

  return (
    <AccordionItem
      value={value}
      className="border-b last:border-b-0 [&[data-state=open]>button]:bg-muted/20"
    >
      <AccordionTrigger className="px-3 py-4 hover:no-underline [&_svg.lucide-chevron-down]:text-muted-foreground">
        <div className="flex-1 flex items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[13px] uppercase tracking-[0.08em] text-foreground/65 font-medium truncate">
              {project.name}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.10em] text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5">
                {workingCount > 0 && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-foreground/40 animate-ping" />
                )}
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-foreground/70" />
              </span>
              {workingCount} working
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.10em] text-muted-foreground/70">
              · {doneCount}/{project.tasks.length} done
            </span>
            <span className="text-[11px] text-muted-foreground/60 hidden md:inline">
              {project.route}
            </span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <motion.div
          variants={rowContainer}
          initial="hidden"
          animate="show"
          className="px-2 pb-3"
        >
          {project.tasks.map((task, i) => (
            <TaskRowItem
              key={i}
              task={task}
              onClick={() => {}}
              isSelected={false}
              featured={i === 0 && task.status !== "done"}
            />
          ))}
        </motion.div>
      </AccordionContent>
    </AccordionItem>
  );
}

function ProjectGroup({
  project,
  last,
  onSelect,
  selected,
  firstRowRef,
}: {
  project: Project;
  last: boolean;
  onSelect: (t: TaskRow) => void;
  selected: TaskRow | null;
  firstRowRef?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className={last ? "" : "border-b border-black/[0.04]"}>
      {/* Project header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="text-[12px] uppercase tracking-[0.08em] text-[#0f0e0d]/55 font-medium">
          {project.name}
        </div>
        <div className="text-[11px] text-[#0f0e0d]/40">{project.route}</div>
      </div>

      {/* Rows */}
      <motion.div
        className="relative px-2 pb-4"
        variants={rowContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
      >
        {project.tasks.map((task, i) => (
          <TaskRowItem
            key={i}
            task={task}
            onClick={() => onSelect(task)}
            isSelected={selected?.title === task.title}
            innerRef={i === 0 ? firstRowRef : undefined}
          />
        ))}
      </motion.div>
    </div>
  );
}

function TaskRowItem({
  task,
  onClick,
  isSelected,
  innerRef,
  featured = false,
}: {
  task: TaskRow;
  onClick: () => void;
  isSelected: boolean;
  innerRef?: React.RefObject<HTMLDivElement | null>;
  featured?: boolean;
}) {
  const agentLabel = `${task.role} agent`;
  const isWorking = task.status === "in-progress" || task.status === "awaiting";
  const isDone = task.status === "done";

  return (
    <motion.div
      ref={innerRef}
      variants={rowItem}
      onClick={onClick}
      className={`group relative px-3 py-3 flex items-center gap-4 cursor-pointer rounded-md transition-colors ${
        isSelected
          ? "bg-black/[0.03]"
          : featured
          ? "bg-[#fdf5e6] hover:bg-[#fbeccd]"
          : "hover:bg-black/[0.02]"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="text-[14px] text-[#0f0e0d] truncate">{task.title}</div>
        <div className="mt-1 flex items-center gap-2 text-[10.5px] uppercase tracking-[0.10em] text-[#0f0e0d]/50">
          <span>{agentLabel}</span>
          <span className="text-[#0f0e0d]/20">·</span>
          {isDone ? (
            <span className="inline-flex items-center gap-1 text-[#0f0e0d]/40">
              <Check size={10} strokeWidth={2.5} /> Done
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[#0f0e0d]/50">
              <span className="relative flex h-1.5 w-1.5">
                {isWorking && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#0f0e0d]/40 animate-ping" />
                )}
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#0f0e0d]/70" />
              </span>
              Working
            </span>
          )}
          {featured && (
            <>
              <span className="text-[#0f0e0d]/20">·</span>
              <span className="inline-flex items-center gap-1 text-[#8a5a12] font-medium">
                In focus
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <SourceChip label={task.source} />
        <ArrowRight
          size={14}
          className={`text-[#0f0e0d]/30 transition-all ${
            isSelected
              ? "text-[#0f0e0d] translate-x-0.5"
              : "group-hover:text-[#0f0e0d]/60 group-hover:translate-x-0.5"
          }`}
        />
      </div>
    </motion.div>
  );
}

function StatusPill({
  variant,
  label,
}: {
  variant: "neutral" | "amber" | "blue" | "green";
  label: string;
}) {
  const styles =
    variant === "amber"
      ? "bg-[#fef3dd] text-[#8a5a12]"
      : variant === "blue"
      ? "bg-[#e6eeff] text-[#1849a9]"
      : variant === "green"
      ? "bg-[#e4f7ee] text-[#0f6a3f]"
      : "bg-black/[0.04] text-[#0f0e0d]/65";
  const dotColor =
    variant === "amber"
      ? "bg-[#d97706]"
      : variant === "blue"
      ? "bg-[#2563eb]"
      : variant === "green"
      ? "bg-[#10B981]"
      : "bg-[#0f0e0d]/30";
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] ${styles}`}
    >
      {variant === "neutral" ? (
        <Loader2 size={11} className="animate-spin" />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      )}
      {label}
    </div>
  );
}

function SourceChip({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-black/[0.08] text-[12px] text-[#0f0e0d]/70">
      <Globe size={12} className="text-[#2563eb]" />
      {label}
    </div>
  );
}

// ————————————————————————————————————————————————————————————————
// Task Drilldown — opens below the tracker when a row is clicked
// ————————————————————————————————————————————————————————————————

function TaskDrilldown({
  task,
  onClose,
}: {
  task: TaskRow;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 0.9, 0.3, 1] }}
      className="relative max-w-[900px] mx-auto mt-6 overflow-hidden"
    >
      {/* Connector arrow from tracker above into drilldown */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center pointer-events-none">
        <div className="w-px h-5 bg-black/[0.15]" />
        <ChevronDown size={16} className="text-[#0f0e0d]/40 -mt-0.5" />
      </div>

      <div className="bg-white rounded-xl border border-black/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.04)] text-left">
        <div className="px-6 py-4 border-b border-black/[0.05] flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.08em] text-[#0f0e0d]/40">
              {task.role} · {task.source}
            </div>
            <div className="mt-1 text-[18px] text-[#0f0e0d]">{task.title}</div>
          </div>
          <button
            onClick={onClose}
            className="text-[12px] text-[#0f0e0d]/40 hover:text-[#0f0e0d] transition-colors shrink-0"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] divide-y md:divide-y-0 md:divide-x divide-black/[0.05]">
          {/* Left: what Source did */}
          <div className="p-6">
            <div className="text-[11px] uppercase tracking-[0.08em] text-[#0f0e0d]/50 mb-3">
              What Source did
            </div>
            <ul className="space-y-2.5 text-[13px] text-[#0f0e0d]/75 leading-[1.55]">
              <DrillReasoning text="Read 3 discovery call transcripts, QuickBooks chart of accounts (247 GLs), and 4 vendor master files." />
              <DrillReasoning text="Identified 18 unused GLs, 47 candidates for consolidation, 3 duplicate vendor groups." />
              <DrillReasoning text="Generated a proposed target GL structure aligned with NetSuite One World multi-subsidiary." />
              <DrillReasoning text="Drafted client-facing mapping spreadsheet with 1-click override per GL." />
            </ul>

            <div className="mt-5 bg-black/[0.02] border border-black/[0.05] rounded-md p-3">
              <div className="text-[11px] uppercase tracking-[0.08em] text-[#0f0e0d]/40 mb-1.5">
                Source output
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#0f0e0d]">
                <FileSpreadsheet size={15} className="text-[#217346]" />
                Chart of Accounts Mapping.xlsx
                <span className="ml-auto text-[11px] text-[#0f0e0d]/40">
                  247 rows · 12 columns
                </span>
              </div>
            </div>
          </div>

          {/* Right: what the user can do */}
          <div className="p-6 bg-[#fafaf9]/50">
            <div className="text-[11px] uppercase tracking-[0.08em] text-[#0f0e0d]/50 mb-3">
              What you can do
            </div>
            <div className="flex flex-col gap-2">
              <ActionButton icon={Check} label="Approve and publish" primary />
              <ActionButton
                icon={MessageSquare}
                label="Ask Source a question"
              />
              <ActionButton icon={Paperclip} label="Attach client context" />
              <ActionButton icon={RefreshCw} label="Re-run with new inputs" />
            </div>

            <div className="mt-5 text-[11px] uppercase tracking-[0.08em] text-[#0f0e0d]/50 mb-2">
              Open questions
            </div>
            <ul className="space-y-1.5 text-[12px] text-[#0f0e0d]/65">
              <li>· Confirm if 4100 and 4110 should merge</li>
              <li>· Multi-currency for UK subsidiary?</li>
              <li>· Sunset the 18 unused GLs or migrate as-is?</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DrillReasoning({ text }: { text: string }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-1.5 w-1 h-1 rounded-full bg-[#0f0e0d]/30 flex-shrink-0" />
      <span>{text}</span>
    </li>
  );
}

function ActionButton({
  icon: Icon,
  label,
  primary,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  primary?: boolean;
}) {
  return (
    <button
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-[13px] transition-colors ${
        primary
          ? "bg-[#0f0e0d] text-white hover:bg-[#0f0e0d]/85"
          : "bg-white border border-black/[0.08] text-[#0f0e0d] hover:bg-black/[0.02]"
      }`}
    >
      <Icon size={14} className={primary ? "text-white" : "text-[#0f0e0d]/55"} />
      {label}
    </button>
  );
}

// ————————————————————————————————————————————————————————————————
// Section 4 — Create Polished Deliverables
// ————————————————————————————————————————————————————————————————

const DELIVERABLES = [
  { icon: "docx", name: "BRD – QuickBooks to NetSuite.docx" },
  { icon: "docx", name: "SOW – Fixed Fee Implementation.docx" },
  { icon: "xlsx", name: "Chart of Accounts Mapping.xlsx" },
  { icon: "docx", name: "Migration Plan.docx" },
  { icon: "pptx", name: "Go-Live Readiness Review.pptx" },
  { icon: "docx", name: "Cutover Runbook.docx" },
] as const;

function CreateDeliverables() {
  return (
    <section id="deliver" className="py-24">
      <div className="max-w-[1100px] mx-auto px-8 text-center">
        <h2 className="serif text-[48px] md:text-[72px] leading-[1.02] tracking-[-0.03em]">
          Create Polished Deliverables
        </h2>
        <p className="mt-6 text-[17px] text-[#0f0e0d]/60 max-w-[580px] mx-auto leading-relaxed">
          Every artifact a consultancy ships — memo, SOW, data mapping,
          runbook — formatted and white-labeled as your brand.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-12 max-w-[640px] mx-auto bg-white rounded-xl border border-black/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-4 text-left relative"
        >
          <div className="px-2 pb-3 text-[12px] text-[#0f0e0d]/45">
            {DELIVERABLES.length} files created
          </div>
          <div className="flex flex-col">
            {DELIVERABLES.map((d, i) => (
              <FileRow
                key={d.name}
                icon={d.icon}
                name={d.name}
                highlight={i === DELIVERABLES.length - 1}
              />
            ))}
          </div>
          <MousePointer2
            className="absolute right-[120px] -bottom-6 text-[#0f0e0d]"
            size={24}
            fill="#0f0e0d"
          />
        </motion.div>
      </div>
    </section>
  );
}

function FileRow({
  icon,
  name,
  highlight,
}: {
  icon: string;
  name: string;
  highlight?: boolean;
}) {
  const Icon =
    icon === "xlsx" ? FileSpreadsheet : icon === "pptx" ? FileType2 : FileText;
  const color =
    icon === "xlsx" ? "#217346" : icon === "pptx" ? "#d24726" : "#2b579a";
  return (
    <div
      className={`px-3 py-2.5 flex items-center gap-3 rounded-md ${
        highlight ? "bg-black/[0.03]" : ""
      }`}
    >
      <Icon size={18} style={{ color }} />
      <span className="text-[14px] text-[#0f0e0d]">{name}</span>
    </div>
  );
}

// ————————————————————————————————————————————————————————————————
// Section 5 — Make the Final Call
// ————————————————————————————————————————————————————————————————

function MakeFinalCall() {
  return (
    <section id="review" className="py-24">
      <div className="max-w-[1100px] mx-auto px-8 text-center">
        <h2 className="serif text-[48px] md:text-[72px] leading-[1.02] tracking-[-0.03em]">
          Make the Final Call
        </h2>
        <p className="mt-6 text-[17px] text-[#0f0e0d]/60 max-w-[580px] mx-auto leading-relaxed">
          Source does the work. The consultant approves it. Every non-trivial
          decision surfaces for review before it reaches the end client.
        </p>

        <div className="mt-14 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative max-w-[420px] w-full"
          >
            {/* Ghost background doc */}
            <div className="absolute -left-20 -top-8 hidden md:block opacity-60">
              <div className="w-[280px] p-5 text-[10px] text-[#0f0e0d]/50 leading-[1.5] bg-white/60 rounded-md border border-black/[0.04]">
                <p className="text-[#0f0e0d]/70">
                  <strong>4.1 Chart of Accounts</strong>
                </p>
                <p className="mt-1.5">
                  The target NetSuite instance requires consolidated revenue
                  GLs. Source recommends merging Sales – Wholesale (4100) and
                  Sales – B2B (4110) under a single revenue-recognition
                  category.
                </p>
                <p className="mt-1.5 bg-[#fef3dd] px-1.5 py-0.5 inline-block rounded-sm text-[#8a5a12]">
                  Risk Flag: downstream Shopify syncs rely on 4100 mapping.
                </p>
                <p className="mt-3 text-[#0f0e0d]/60">
                  4.2 Vendor Deduplication
                </p>
              </div>
            </div>

            {/* Edit card */}
            <div className="relative bg-white rounded-xl border border-black/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-4 text-left z-10">
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.05]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#0f0e0d] text-white text-[11px] font-semibold flex items-center justify-center">
                    S
                  </div>
                  <div className="text-[13px] text-[#0f0e0d]">
                    <span className="font-semibold">Source</span>{" "}
                    <span className="text-[#0f0e0d]/50">made an edit</span>
                  </div>
                </div>
                <span className="text-[12px] text-[#0f0e0d]/40">3:14pm</span>
              </div>

              <div className="mt-3 text-[13px] text-[#0f0e0d]">
                Merged GL 4100 & 4110
              </div>

              <div className="mt-3">
                <div className="text-[11px] text-[#0f0e0d]/45 uppercase tracking-[0.08em]">
                  Justification
                </div>
                <p className="mt-1.5 text-[13px] text-[#0f0e0d]/75 leading-[1.55]">
                  Both map to the same revenue recognition policy. Shopify is
                  the consumer system of record, so separation adds no signal
                  downstream and simplifies month-end close.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="py-2 text-[13px] rounded-md border border-black/[0.1] text-[#0f0e0d] hover:bg-black/[0.02] transition-colors">
                  Reject
                </button>
                <button className="py-2 text-[13px] rounded-md bg-[#0f0e0d] text-white hover:bg-[#0f0e0d]/85 transition-colors relative">
                  Accept
                  <MousePointer2
                    className="absolute -right-3 -bottom-3 text-[#0f0e0d]"
                    size={18}
                    fill="#0f0e0d"
                  />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ————————————————————————————————————————————————————————————————
// Footer CTA
// ————————————————————————————————————————————————————————————————

function FooterCta() {
  return (
    <section className="py-32">
      <div className="max-w-[900px] mx-auto px-8 text-center">
        <h2 className="serif text-[44px] md:text-[60px] leading-[1.05] tracking-[-0.03em]">
          Turn your variable cost into a fixed one.
        </h2>
        <div className="mt-10 flex items-center justify-center gap-3">
          <button className="text-[13px] font-medium bg-[#0f0e0d] text-white px-6 py-3 rounded-full hover:bg-[#0f0e0d]/85 transition-colors">
            Book a Demo
          </button>
          <button className="text-[13px] font-medium bg-white border border-black/[0.08] text-[#0f0e0d] px-6 py-3 rounded-full hover:bg-black/[0.02] transition-colors">
            See a live implementation
          </button>
        </div>
        <div className="mt-20 text-[12px] text-[#0f0e0d]/40">
          Source · SF + Dublin · hello@source.shop
        </div>
      </div>
    </section>
  );
}
